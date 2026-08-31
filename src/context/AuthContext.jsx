import { createContext, useContext, useEffect, useRef, useState } from 'react'
import { SessionError, clearSession, readSession, refreshSession, saveSession, subscribeTokens } from '../api/session'

const AuthContext = createContext(null)

const INITIAL_AUTH_STATE = { user: null, accessToken: '', refreshToken: '', verified: false }
const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/$/, '')

function formatPhone(phone) {
  const digits = String(phone ?? '').replace(/\D/g, '')
  if (digits.length === 11) return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`
  if (digits.length === 10) return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`
  return String(phone ?? '').trim()
}

function normalizeUser(user) {
  if (!user) return null
  return {
    id: user.id ?? null,
    name: user.name ?? '',
    role: user.role ?? 'member',
    fam: user.fam ?? '',
    village: user.village ?? '',
    teams: Array.isArray(user.teams) ? user.teams : [],
    teamRoles: Array.isArray(user.teamRoles) ? user.teamRoles : [],
    phone: formatPhone(user.phone),
    birth: user.birth ?? '',
    passwordChanged: Boolean(user.passwordChanged),
    avatarKey: user.avatarKey ?? null,
    avatarPhotoUrl: user.avatarPhotoUrl ?? null,
  }
}

function readStoredAuth() {
  const stored = readSession()
  return {
    user: normalizeUser(stored.user),
    accessToken: stored.accessToken,
    refreshToken: stored.refreshToken,
    verified: false, // 앱 로드 시 항상 미검증 상태로 시작
  }
}

export function AuthProvider({ children }) {
  const [authState, setAuthState] = useState(readStoredAuth)
  const verifyingRef = useRef(false)

  const user = authState.user
  const accessToken = authState.accessToken
  const refreshToken = authState.refreshToken
  const verified = authState.verified
  const role = user?.role ?? ''
  const teamRoles = user?.teamRoles ?? []

  // ── 다른 화면에서 토큰이 갱신되면 state도 같은 값으로 맞춘다 ──
  // 이게 없으면 state에 남아있던 옛 refresh token이 아래 동기화 effect를 통해
  // 방금 저장된 새 토큰을 덮어쓰고, 그 다음에 앱을 켤 때 로그아웃된다.
  // (서버는 갱신할 때마다 refresh token을 회전시키고 옛것을 무효화한다 — src/api/session.js 참고)
  useEffect(() => subscribeTokens(({ accessToken: nextAccess, refreshToken: nextRefresh }) => {
    setAuthState((prev) => (
      prev.accessToken === nextAccess && prev.refreshToken === nextRefresh
        ? prev // 값이 같으면 그대로 둔다 — 리렌더도 저장도 일어나지 않는다
        : { ...prev, accessToken: nextAccess, refreshToken: nextRefresh }
    ))
  }), [])

  // ── 앱 로드 시 세션 유효성 검증 ──
  useEffect(() => {
    if (verifyingRef.current) return
    verifyingRef.current = true

    const verifySession = async () => {
      const stored = readStoredAuth()

      // localStorage에 유저 정보 없으면 → 로그아웃 상태 확정
      if (!stored.user) {
        setAuthState({ ...INITIAL_AUTH_STATE, verified: true })
        return
      }

      // refresh token으로 세션 유효성 확인 (쿠키 + X-Refresh-Token 헤더 — src/api/session.js)
      let newToken
      try {
        newToken = await refreshSession()
      } catch (error) {
        // 진짜 만료(401/403)일 때만 세션을 버린다.
        // 배포 중 502·서버 재시작 중 500·네트워크 끊김에도 지워버리면, 토큰은 멀쩡한데
        // 하필 그 순간 앱을 연 사람만 로그아웃되는 일이 생긴다(push = 즉시 배포라 실제로 겪는다).
        // 이 경우 기존 상태를 유지하고, 정말 만료된 거라면 다음 API 호출의 401에서 정리된다.
        if (error instanceof SessionError && error.isExpired) {
          clearSession()
          setAuthState({ ...INITIAL_AUTH_STATE, verified: true })
        } else {
          setAuthState({ ...stored, verified: true })
        }
        return
      }

      // 세션 유효 → /me로 최신 유저 정보 가져오기
      // (refresh token은 session 모듈이 이미 저장했으므로 여기서 다시 읽는다)
      const newRefreshToken = readSession().refreshToken || stored.refreshToken
      try {
        const meRes = await fetch(`${API_BASE_URL}/api/users/me`, {
          headers: { Authorization: `Bearer ${newToken}` },
          credentials: 'include',
        })
        const mePayload = await meRes.json().catch(() => null)
        if (meRes.ok && mePayload?.success && mePayload?.data) {
          setAuthState({
            user: normalizeUser(mePayload.data),
            accessToken: newToken,
            refreshToken: newRefreshToken,
            verified: true,
          })
          return
        }
      } catch { /* /me 실패해도 기존 stored user 유지 */ }
      setAuthState({ user: stored.user, accessToken: newToken, refreshToken: newRefreshToken, verified: true })
    }

    verifySession()
  }, [])

  // localStorage 동기화 — 통째로 덮어쓰지 않고 병합한다.
  // refreshToken은 값이 있을 때만 넘긴다: state가 비어있는 순간에 저장돼 있던 토큰을
  // 지워버리면 다음 실행 때 재로그인해야 한다.
  useEffect(() => {
    if (typeof window === 'undefined') return
    if (!user) {
      clearSession()
      return
    }
    saveSession({ user, accessToken, ...(refreshToken ? { refreshToken } : {}) })
  }, [user, accessToken, refreshToken])

  const setUser = (nextUser) => {
    setAuthState((prev) => ({
      ...prev,
      user: normalizeUser(typeof nextUser === 'function' ? nextUser(prev.user) : nextUser),
    }))
  }

  const setAccessToken = (nextAccessToken) => {
    setAuthState((prev) => ({
      ...prev,
      accessToken: typeof nextAccessToken === 'function'
        ? nextAccessToken(prev.accessToken)
        : (nextAccessToken ?? ''),
    }))
  }

  const login = ({ user: nextUser, accessToken: nextAccessToken, refreshToken: nextRefreshToken }) => {
    setAuthState({
      user: normalizeUser(nextUser),
      accessToken: nextAccessToken ?? '',
      refreshToken: nextRefreshToken ?? '',
      verified: true,
    })
  }

  const logout = () => {
    // 저장된 토큰을 즉시 지운다 — 갱신 요청이 날아가는 중이었더라도 그 결과가
    // 세션을 되살리지 못하게 한다(session 모듈이 세대를 세서 막는다).
    clearSession()
    setAuthState({ ...INITIAL_AUTH_STATE, verified: true })
  }

  // verified가 false이면 세션 검증 중 → 아무것도 렌더링하지 않음
  const isAuthenticated = verified && Boolean(user)

  const isLeaderOrAbove = ['leader', 'village_leader', 'pastor', 'admin'].includes(role)
  const isVillageLeaderOrAbove = ['village_leader', 'pastor', 'admin'].includes(role)
  const isPastorOrAbove = ['pastor', 'admin'].includes(role)
  const isAdmin = role === 'admin'
  const isTeamLeader = teamRoles.length > 0
  const canWriteNotice = isLeaderOrAbove || isTeamLeader
  const canManageNewcomer = isLeaderOrAbove || teamRoles.includes('새가족팀')
  const canViewNewcomer = isLeaderOrAbove || teamRoles.includes('새가족팀')
  const isNewFamilyTeamLeader = teamRoles.includes('새가족팀')
  const canManageTeam = isTeamLeader

  // 세션 검증 중에는 빈 화면 표시 (로딩 스피너)
  if (!verified) {
    return (
      <AuthContext.Provider value={{
        user: null, accessToken: '', isAuthenticated: false,
        setUser, setAccessToken, login, logout,
        isLeaderOrAbove: false, isVillageLeaderOrAbove: false,
        isPastorOrAbove: false, isAdmin: false,
        isTeamLeader: false, isNewFamilyTeamLeader: false,
        canWriteNotice: false, canManageNewcomer: false, canViewNewcomer: false, canManageTeam: false,
      }}>
        <div style={{
          minHeight: '100dvh', display: 'flex',
          alignItems: 'center', justifyContent: 'center',
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{
              width: 40, height: 40, borderRadius: '50%',
              border: '3px solid #E8F0FE', borderTopColor: '#4285F4',
              animation: 'spin 0.8s linear infinite', margin: '0 auto 12px',
            }} />
            <p style={{ fontSize: 13, color: '#888' }}>로딩 중...</p>
          </div>
          <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
        </div>
      </AuthContext.Provider>
    )
  }

  return (
    <AuthContext.Provider value={{
      user, accessToken, isAuthenticated,
      setUser, setAccessToken, login, logout,
      isLeaderOrAbove, isVillageLeaderOrAbove, isPastorOrAbove, isAdmin,
      isTeamLeader, isNewFamilyTeamLeader, canWriteNotice, canManageNewcomer, canViewNewcomer, canManageTeam,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within an AuthProvider')
  return context
}
