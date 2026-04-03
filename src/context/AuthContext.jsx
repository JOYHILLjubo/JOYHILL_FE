/*
import { createContext, useContext, useState } from 'react'

const AuthContext = createContext()

function hasBatchim(str) {
  if (!str) return false
  const code = str[str.length - 1].charCodeAt(0)
  if (code < 0xAC00 || code > 0xD7A3) return false
  return (code - 0xAC00) % 28 !== 0
}
function toVillageName(name) { return hasBatchim(name) ? `${name}이네` : `${name}네` }
function toFamName(name) { return `${name}팸` }

// OrgContext의 더미 데이터와 일치하는 프리셋
const USER_PRESETS = {
  member: {
    name: '박청년', role: 'member',
    fam: toFamName('도윤'), village: toVillageName('성인'),
    teams: ['새가족팀'], teamRoles: [],
    phone: '010-9999-0000', birth: '001225',
  },
  leader: {
    name: '김민준', role: 'leader',
    fam: toFamName('민준'), village: toVillageName('성인'),
    teams: ['찬양팀'], teamRoles: ['찬양팀'],
    phone: '010-1111-2222', birth: '950315',
  },
  village_leader: {
    name: '홍성인', role: 'village_leader',
    fam: toFamName('서연'), village: toVillageName('성인'),
    teams: [], teamRoles: [],
    phone: '010-3333-4444', birth: '881020',
  },
  pastor: {
    name: '정교역자', role: 'pastor',
    fam: toFamName('수아'), village: toVillageName('지우'),
    teams: [], teamRoles: [],
    phone: '010-5555-6666', birth: '750601',
  },
  admin: {
    name: '관리자', role: 'admin',
    fam: toFamName('민준'), village: toVillageName('성인'),
    teams: [], teamRoles: [],
    phone: '010-7777-8888', birth: '700101',
  },
}

const ROLE_CYCLE = ['member', 'leader', 'village_leader', 'pastor', 'admin']

export function AuthProvider({ children }) {
  const [user, setUser] = useState({ ...USER_PRESETS.leader })

  const isLeaderOrAbove = ['leader', 'village_leader', 'pastor', 'admin'].includes(user.role)
  const isVillageLeaderOrAbove = ['village_leader', 'pastor', 'admin'].includes(user.role)
  const isPastorOrAbove = ['pastor', 'admin'].includes(user.role)
  const isAdmin = user.role === 'admin'
  const isTeamLeader = user.teamRoles.length > 0
  const canWriteNotice = isLeaderOrAbove || isTeamLeader
  const canManageNewcomer = isLeaderOrAbove || user.teamRoles.includes('새가족팀')
  const isNewFamilyTeamLeader = user.teamRoles.includes('새가족팀')
  const canManageTeam = isTeamLeader

  const cycleRole = () => {
    const idx = ROLE_CYCLE.indexOf(user.role)
    const next = ROLE_CYCLE[(idx + 1) % ROLE_CYCLE.length]
    setUser({ ...USER_PRESETS[next] })
  }

  return (
    <AuthContext.Provider value={{
      user, setUser, cycleRole,
      isLeaderOrAbove, isVillageLeaderOrAbove, isPastorOrAbove, isAdmin,
      isTeamLeader, isNewFamilyTeamLeader, canWriteNotice, canManageNewcomer, canManageTeam,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
*/

import { createContext, useContext, useEffect, useState } from 'react'

const AuthContext = createContext(null)

const STORAGE_KEY = 'joyhill.auth'
const INITIAL_AUTH_STATE = { user: null, accessToken: '' }
const ROLE_CYCLE = ['member', 'leader', 'village_leader', 'pastor', 'admin']
const ROLE_TEAM_OVERRIDES = {
  member: { teamRoles: [] },
  village_leader: { teamRoles: [] },
  pastor: { teamRoles: [] },
  admin: { teamRoles: [] },
}

function formatPhone(phone) {
  const digits = String(phone ?? '').replace(/\D/g, '')

  if (digits.length === 11) {
    return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`
  }

  if (digits.length === 10) {
    return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`
  }

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
    }
  } catch {
    return INITIAL_AUTH_STATE
  }
}

export function AuthProvider({ children }) {
  const [authState, setAuthState] = useState(readStoredAuth)

  const user = authState.user
  const accessToken = authState.accessToken
  const role = user?.role ?? ''
  const teamRoles = user?.teamRoles ?? []

  useEffect(() => {
    if (typeof window === 'undefined') return

    if (!user) {
      window.localStorage.removeItem(STORAGE_KEY)
      return
    }

    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        user,
        accessToken,
      }),
    )
  }, [user, accessToken])

  const setUser = (nextUser) => {
    setAuthState((prev) => ({
      ...prev,
      user: normalizeUser(
        typeof nextUser === 'function' ? nextUser(prev.user) : nextUser,
      ),
    }))
  }

  const setAccessToken = (nextAccessToken) => {
    setAuthState((prev) => ({
      ...prev,
      accessToken:
        typeof nextAccessToken === 'function'
          ? nextAccessToken(prev.accessToken)
          : (nextAccessToken ?? ''),
    }))
  }

  const login = ({ user: nextUser, accessToken: nextAccessToken }) => {
    setAuthState({
      user: normalizeUser(nextUser),
      accessToken: nextAccessToken ?? '',
    })
  }

  const logout = () => {
    setAuthState(INITIAL_AUTH_STATE)
  }

  const cycleRole = () => {
    setUser((prevUser) => {
      if (!prevUser) return prevUser

      const currentIndex = ROLE_CYCLE.indexOf(prevUser.role)
      if (currentIndex === -1) return prevUser

      const nextRole = ROLE_CYCLE[(currentIndex + 1) % ROLE_CYCLE.length]

      return {
        ...prevUser,
        role: nextRole,
        ...ROLE_TEAM_OVERRIDES[nextRole],
      }
    })
  }

  const isAuthenticated = Boolean(user)
  const isLeaderOrAbove = ['leader', 'village_leader', 'pastor', 'admin'].includes(role)
  const isVillageLeaderOrAbove = ['village_leader', 'pastor', 'admin'].includes(role)
  const isPastorOrAbove = ['pastor', 'admin'].includes(role)
  const isAdmin = role === 'admin'
  const isTeamLeader = teamRoles.length > 0
  const canWriteNotice = isLeaderOrAbove || isTeamLeader
  const canManageNewcomer = isLeaderOrAbove || teamRoles.includes('새가족팀')
  const isNewFamilyTeamLeader = teamRoles.includes('새가족팀')
  const canManageTeam = isTeamLeader

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        isAuthenticated,
        setUser,
        setAccessToken,
        login,
        logout,
        cycleRole,
        isLeaderOrAbove,
        isVillageLeaderOrAbove,
        isPastorOrAbove,
        isAdmin,
        isTeamLeader,
        isNewFamilyTeamLeader,
        canWriteNotice,
        canManageNewcomer,
        canManageTeam,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }

  return context
}
