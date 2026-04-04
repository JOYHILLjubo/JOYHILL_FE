import { createContext, useContext, useEffect, useRef, useState } from 'react'

const AuthContext = createContext(null)

const STORAGE_KEY = 'joyhill.auth'
const INITIAL_AUTH_STATE = { user: null, accessToken: '', verified: false }
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
  }
}

function readStoredAuth() {
  if (typeof window === 'undefined') return INITIAL_AUTH_STATE
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return INITIAL_AUTH_STATE
    const parsed = JSON.parse(raw)
    return {
      user: normalizeUser(parsed?.user),
      accessToken: typeof parsed?.accessToken === 'string' ? parsed.accessToken : '',
      verified: false, // 앱 로드 시 항상 미검증 상태로 시작
    }
  } catch {
    return INITIAL_AUTH_STATE
  }
}

export function AuthProvider({ children }) {
  const [authState, setAuthState] = useState(readStoredAuth)
  const verifyingRef = useRef(false)

  const user = authState.user
  const accessToken = authState.accessToken
  const verified = authState.verified
  const role = user?.role ?? ''
  const teamRoles = user?.teamRoles ?? []

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

      // refresh token으로 세션 유효성 확인
      try {
        const res = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
          method: 'POST',
          credentials: 'include',
        })
        const payload = await res.json().catch(() => null)

        if (res.ok && payload?.success && payload?.data?.accessToken) {
          // 세션 유효 → accessToken 갱신 후 /me로 최신 유저 정보 가져오기
          const newToken = payload.data.accessToken
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
                verified: true,
              })
              return
            }
          } catch { /* /me 실패해도 기존 stored user 유지 */ }
          setAuthState({ user: stored.user, accessToken: newToken, verified: true })
        } else {
          // refresh 실패 → 세션 만료, 로그아웃 처리
          window.localStorage.removeItem(STORAGE_KEY)
          setAuthState({ ...INITIAL_AUTH_STATE, verified: true })
        }
      } catch {
        // 네트워크 오류 → 서버 접근 불가, 기존 상태 유지 (오프라인 대응)
        setAuthState({ ...stored, verified: true })
      }
    }

    verifySession()
  }, [])

  // localStorage 동기화
  useEffect(() => {
    if (typeof window === 'undefined') return
    if (!user) {
      window.localStorage.removeItem(STORAGE_KEY)
      return
    }
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ user, accessToken }))
  }, [user, accessToken])

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

  const login = ({ user: nextUser, accessToken: nextAccessToken }) => {
    setAuthState({
      user: normalizeUser(nextUser),
      accessToken: nextAccessToken ?? '',
      verified: true,
    })
  }

  const logout = () => {
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
        canWriteNotice: false, canManageNewcomer: false, canManageTeam: false,
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
      isTeamLeader, isNewFamilyTeamLeader, canWriteNotice, canManageNewcomer, canManageTeam,
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
