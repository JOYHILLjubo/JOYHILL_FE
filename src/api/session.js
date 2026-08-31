/*
 * 로그인 세션(토큰) 보관과 갱신을 한 곳에서 담당한다.
 *
 * 예전에는 페이지마다 `requestTokenRefresh`를 똑같이 복붙해두고 각자 localStorage를
 * 직접 건드렸는데, 그 구조 때문에 "자동로그인이 가끔 혼자 풀리는" 버그가 두 갈래로 있었다.
 *
 * ① 방금 갱신한 refresh token이 몇 ms 만에 옛것으로 덮어써졌다
 *    서버는 갱신할 때마다 refresh token을 새로 발급하고 옛것을 무효화한다(슬라이딩 만료,
 *    JOYHILL_BE의 AuthService.refresh 참고). 페이지는 새 토큰을 localStorage에 잘 저장했지만,
 *    바로 다음 줄의 `setAccessToken()`이 AuthContext의 localStorage 동기화 effect를 깨웠고,
 *    그 effect는 state에 남아있던 **옛** refresh token으로 방금 저장한 새 토큰을 덮어썼다
 *    (state에는 refreshToken을 갱신할 경로 자체가 없었다).
 *    그 순간 기기에 남은 토큰은 서버가 이미 버린 죽은 토큰이고, 다음에 앱을 새로 켤 때
 *    로그아웃됐다. 갱신이 한 번이라도 일어난 세션만 그렇게 되기 때문에 "가끔"이었다.
 *
 * ② 401이 동시에 여러 개 나면 그중 하나가 죽은 토큰을 들고 갱신을 시도했다
 *    화면 하나가 API를 여러 개 동시에 부르면 만료된 access token으로 401도 동시에 난다.
 *    각자 같은 옛 refresh token으로 갱신을 시도하는데, 먼저 도착한 요청이 회전을 끝내는
 *    순간 나머지 요청이 든 토큰은 무효가 되어 401 → 로그아웃.
 *
 * 그래서 이 모듈은
 *   - 저장을 **병합**으로만 하고(통째로 덮어쓰지 않는다),
 *   - 갱신 요청을 하나로 합치고(single flight),
 *   - 갱신 결과를 구독자(AuthContext)에게 알려 React state까지 같은 값이 되게 하고,
 *   - 실패 이유를 status로 구분해서 **진짜 만료(401/403)일 때만** 세션을 버리게 한다.
 *     서버 재시작·배포 중 502나 네트워크 끊김에 로그아웃시키면, 멀쩡한 세션이 날아간다.
 */

const STORAGE_KEY = 'joyhill.auth'
const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/$/, '')
const EMPTY_SESSION = { user: null, accessToken: '', refreshToken: '' }

export class SessionError extends Error {
  constructor(message, status) {
    super(message)
    this.name = 'SessionError'
    this.status = status
  }

  // 세션을 버려야 하는 실패인지. 401/403만 해당하고, 5xx나 네트워크 오류(status 0)는 아니다.
  get isExpired() {
    return this.status === 401 || this.status === 403
  }
}

// 로그아웃 이후에 뒤늦게 도착한 갱신 응답이 세션을 되살리지 않도록 세대를 센다.
let epoch = 0
let inFlightRefresh = null
const listeners = new Set()

export function readSession() {
  if (typeof window === 'undefined') return EMPTY_SESSION
  try {
    const parsed = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? 'null')
    if (!parsed) return EMPTY_SESSION
    return {
      user: parsed.user ?? null,
      accessToken: typeof parsed.accessToken === 'string' ? parsed.accessToken : '',
      refreshToken: typeof parsed.refreshToken === 'string' ? parsed.refreshToken : '',
    }
  } catch {
    return EMPTY_SESSION
  }
}

// 항상 병합해서 저장한다 — 넘기지 않은 항목은 저장돼 있던 값을 유지한다.
export function saveSession(patch) {
  if (typeof window === 'undefined') return EMPTY_SESSION
  const next = { ...readSession(), ...patch }
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  } catch {
    // 저장공간이 꽉 찼거나 사파리 시크릿 모드 — 이번 실행 동안은 메모리 상태로만 동작한다
  }
  return next
}

export function clearSession() {
  epoch += 1
  inFlightRefresh = null
  if (typeof window === 'undefined') return
  try {
    window.localStorage.removeItem(STORAGE_KEY)
  } catch { /* 위와 같음 */ }
}

// 토큰이 갱신될 때마다 호출된다. AuthContext가 구독해서 state를 같은 값으로 맞춘다.
export function subscribeTokens(listener) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

/**
 * access token을 갱신하고 새 access token을 돌려준다.
 * 같은 시점에 여러 번 불러도 요청은 한 번만 나가고 모두 같은 결과를 받는다.
 * 실패하면 SessionError를 던진다 — `error.isExpired`로 재로그인이 필요한지 구분할 것.
 */
export function refreshSession() {
  if (inFlightRefresh) return inFlightRefresh
  inFlightRefresh = requestRefresh().finally(() => { inFlightRefresh = null })
  return inFlightRefresh
}

async function requestRefresh() {
  const startedEpoch = epoch
  const { refreshToken } = readSession()

  let response
  try {
    // credentials:'include'(쿠키)와 X-Refresh-Token 헤더(localStorage) 둘 다 보낸다 —
    // iOS PWA 등에서 쿠키가 유지되지 않아도 헤더로 대체된다.
    response = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
      headers: refreshToken ? { 'X-Refresh-Token': refreshToken } : undefined,
    })
  } catch {
    // 메시지에 '세션이 만료'/'다시 로그인'을 넣지 않는다 — 페이지들이 그 문구로
    // 로그아웃 여부를 판단해서, 잠깐 끊긴 것뿐인데 로그인 화면으로 튕기게 된다.
    throw new SessionError('서버와 연결이 원활하지 않아요. 잠시 후 다시 시도해주세요.', 0)
  }

  const payload = await response.json().catch(() => null)

  if (!response.ok || !payload?.success || !payload?.data?.accessToken) {
    if (response.status === 401 || response.status === 403) {
      throw new SessionError(
        payload?.error?.message ?? '세션이 만료되었습니다. 다시 로그인해주세요.',
        response.status,
      )
    }
    throw new SessionError('서버와 연결이 원활하지 않아요. 잠시 후 다시 시도해주세요.', response.status)
  }

  const accessToken = payload.data.accessToken
  const nextRefreshToken = payload.data.refreshToken || refreshToken

  // 갱신하는 사이에 로그아웃했다면 저장하지 않는다(로그아웃한 세션이 되살아나면 안 된다).
  if (startedEpoch !== epoch) return accessToken

  saveSession({ accessToken, refreshToken: nextRefreshToken })
  listeners.forEach((listener) => listener({ accessToken, refreshToken: nextRefreshToken }))
  return accessToken
}
