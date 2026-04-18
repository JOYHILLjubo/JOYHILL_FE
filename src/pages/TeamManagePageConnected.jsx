import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import BottomNav from '../components/BottomNav'
import { useAuth } from '../context/AuthContext'

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/$/, '')

/** 서브팀이 있는 사역팀 이름 */
const MEDIA_TEAM = '미디어사역팀'

const ROLE_LABELS = {
  admin: '관리자',
  pastor: '교역자·부장',
  village_leader: '마을장',
  leader: '리더',
  member: '청년',
}

const avatarColors = [
  { bg: 'bg-success-light', text: 'text-success' },
  { bg: 'bg-primary-light', text: 'text-primary' },
  { bg: 'bg-warning-light', text: 'text-warning' },
  { bg: 'bg-danger-light', text: 'text-danger' },
]

function buildApiUrl(path) {
  return `${API_BASE_URL}${path}`
}

function getColor(seed) {
  return avatarColors[Math.abs(Number(seed) || 0) % avatarColors.length]
}

function getInitial(name) {
  const trimmed = String(name ?? '').trim()
  return trimmed ? trimmed[0] : 'T'
}

function normalizePhone(value) {
  return String(value ?? '').replace(/\D/g, '')
}

function formatPhone(phone) {
  const digits = normalizePhone(phone)

  if (digits.length === 11) {
    return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`
  }

  if (digits.length === 10) {
    return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`
  }

  return String(phone ?? '').trim()
}

function mapTeam(item) {
  return {
    teamName: item?.teamName ?? '',
    intro: item?.intro ?? '',
    memberCount: Number(item?.memberCount ?? 0),
  }
}

function formatBirth(birth) {
  if (!birth || birth.length !== 6) return ''
  const yy = parseInt(birth.slice(0, 2), 10)
  const mm = birth.slice(2, 4)
  const dd = birth.slice(4, 6)
  const yyyy = yy <= 30 ? 2000 + yy : 1900 + yy
  return `${yyyy}.${mm}.${dd}`
}

function mapMember(item) {
  return {
    userId: item?.userId ?? null,
    name: item?.name ?? '',
    famName: item?.famName ?? '',
    phone: formatPhone(item?.phone ?? ''),
    birth: formatBirth(item?.birth ?? ''),
    role: item?.role ?? 'member',
    isLeader: Boolean(item?.isLeader),
  }
}

function mapUser(item) {
  const summary = item?.summary ?? {}

  return {
    id: item?.id ?? null,
    name: item?.name ?? summary?.name ?? '',
    fam: item?.famName ?? summary?.fam ?? '',
    village: item?.villageName ?? summary?.village ?? '',
    phone: formatPhone(item?.phone ?? summary?.phone ?? ''),
    role: item?.role ?? summary?.role ?? 'member',
  }
}

async function requestApi(path, { method = 'GET', headers = {}, body } = {}) {
  const requestOptions = {
    method,
    headers: { ...headers },
    credentials: 'include',
  }

  if (body !== undefined) {
    requestOptions.body = JSON.stringify(body)
    requestOptions.headers['Content-Type'] = 'application/json'
  }

  let response

  try {
    response = await fetch(buildApiUrl(path), requestOptions)
  } catch {
    throw new Error('백엔드 서버에 연결할 수 없습니다. JOYHILL_BE가 실행 중인지 확인해주세요.')
  }

  const payload = await response.json().catch(() => null)
  return { response, payload }
}

function getApiErrorMessage(result, fallbackMessage) {
  if (result.response.status === 401) {
    return '세션이 만료되었습니다. 다시 로그인해주세요.'
  }

  if (result.response.status === 403) {
    return result.payload?.error?.message ?? '팀 관리 권한이 없습니다.'
  }

  return result.payload?.error?.message ?? fallbackMessage
}

async function requestTokenRefresh() {
  const result = await requestApi('/api/auth/refresh', { method: 'POST' })

  if (!result.response.ok || !result.payload?.success || !result.payload?.data?.accessToken) {
    throw new Error(getApiErrorMessage(result, '세션이 만료되었습니다. 다시 로그인해주세요.'))
  }

  return result.payload.data.accessToken
}

export default function TeamManagePageConnected() {
  const navigate = useNavigate()
  const location = useLocation()
  const {
    user,
    accessToken,
    setAccessToken,
    logout,
    canManageTeam,
    isPastorOrAbove,
    isAdmin,
  } = useAuth()

  const requestedTeam = location.state?.team ?? ''
  const [teams, setTeams] = useState([])
  const [members, setMembers] = useState([])
  const [allUsers, setAllUsers] = useState([])
  const [selectedTeam, setSelectedTeam] = useState(requestedTeam)
  const [tab, setTab] = useState('members')
  const [isLoadingTeams, setIsLoadingTeams] = useState(true)
  const [isLoadingMembers, setIsLoadingMembers] = useState(false)
  const [pageError, setPageError] = useState('')
  const [reloadKey, setReloadKey] = useState(0)
  const [editingIntro, setEditingIntro] = useState(false)
  const [introDraft, setIntroDraft] = useState('')
  const [isSavingIntro, setIsSavingIntro] = useState(false)
  const [showAddPanel, setShowAddPanel] = useState(false)
  const [candidateQuery, setCandidateQuery] = useState('')
  const [isLoadingCandidates, setIsLoadingCandidates] = useState(false)
  const [candidateError, setCandidateError] = useState('')
  const [addAsLeader, setAddAsLeader] = useState(false)
  const [addingUserId, setAddingUserId] = useState(null)
  const [removingUserId, setRemovingUserId] = useState(null)
  const [delegatingUserId, setDelegatingUserId] = useState(null)

  // 서브팀 state (미디어사역팀 전용)
  const [subTeams, setSubTeams] = useState([])
  const [selectedSubTeam, setSelectedSubTeam] = useState('조이힐그램')
  const [isLoadingSubTeams, setIsLoadingSubTeams] = useState(false)
  const [subAddPanel, setSubAddPanel] = useState(false)
  const [subCandidateQuery, setSubCandidateQuery] = useState('')
  const [subAddingUserId, setSubAddingUserId] = useState(null)
  const [subRemovingUserId, setSubRemovingUserId] = useState(null)
  const [subCandidateError, setSubCandidateError] = useState('')
  const [subNewTeamName, setSubNewTeamName] = useState('')
  const [showCreateSubTeam, setShowCreateSubTeam] = useState(false)
  const [isCreatingSubTeam, setIsCreatingSubTeam] = useState(false)

  const isMediaTeam = selectedTeam === MEDIA_TEAM
  const canManagePage = canManageTeam || isPastorOrAbove

  const handleExpiredSession = () => {
    logout()
    navigate('/login', { replace: true })
  }

  const callAuthedApi = async (path, fallbackMessage, options = {}) => {
    try {
      let token = accessToken

      if (!token) {
        token = await requestTokenRefresh()
        setAccessToken(token)
      }

      let result = await requestApi(path, {
        ...options,
        headers: {
          ...(options.headers ?? {}),
          Authorization: `Bearer ${token}`,
        },
      })

      if (result.response.status === 401) {
        token = await requestTokenRefresh()
        setAccessToken(token)

        result = await requestApi(path, {
          ...options,
          headers: {
            ...(options.headers ?? {}),
            Authorization: `Bearer ${token}`,
          },
        })
      }

      if (!result.response.ok || !result.payload?.success) {
        throw new Error(getApiErrorMessage(result, fallbackMessage))
      }

      return result.payload.data
    } catch (err) {
      if (err instanceof Error && err.message.includes('다시 로그인')) {
        handleExpiredSession()
      }
      throw err
    }
  }

  useEffect(() => {
    if (!canManagePage) {
      setIsLoadingTeams(false)
      return
    }

    let cancelled = false

    async function loadTeams() {
      setIsLoadingTeams(true)
      setPageError('')

      try {
        const data = await callAuthedApi('/api/teams', '팀 정보를 불러오지 못했습니다.')
        const loadedTeams = (Array.isArray(data) ? data : []).map(mapTeam).sort((a, b) => a.teamName.localeCompare(b.teamName, 'ko'))

        if (cancelled) return

        setTeams(loadedTeams)
        setSelectedTeam((prev) => {
          const allowed = isPastorOrAbove
            ? loadedTeams
            : loadedTeams.filter((team) => (user?.teamRoles ?? []).includes(team.teamName))
          const fromState = allowed.find((team) => team.teamName === requestedTeam)?.teamName
          return prev || fromState || allowed[0]?.teamName || ''
        })
      } catch (err) {
        if (cancelled) return
        setPageError(err instanceof Error ? err.message : '팀 정보를 불러오지 못했습니다.')
      } finally {
        if (!cancelled) setIsLoadingTeams(false)
      }
    }

    void loadTeams()

    return () => {
      cancelled = true
    }
  }, [accessToken, canManagePage, isPastorOrAbove, requestedTeam, setAccessToken, user?.teamRoles, reloadKey])

  const manageableTeams = useMemo(() => {
    if (isPastorOrAbove) return teams
    const allowedSet = new Set(user?.teamRoles ?? [])
    return teams.filter((team) => allowedSet.has(team.teamName))
  }, [isPastorOrAbove, teams, user?.teamRoles])

  const selectedTeamInfo = manageableTeams.find((team) => team.teamName === selectedTeam) ?? null

  useEffect(() => {
    if (!selectedTeam) {
      setMembers([])
      setIsLoadingMembers(false)
      return
    }
    if (isMediaTeam) {
      setMembers([])
      return
    }

    let cancelled = false

    async function loadMembers() {
      setIsLoadingMembers(true)
      setPageError('')

      try {
        const data = await callAuthedApi(`/api/teams/${encodeURIComponent(selectedTeam)}/members`, '팀원 정보를 불러오지 못했습니다.')
        if (cancelled) return
        setMembers((Array.isArray(data) ? data : []).map(mapMember))
      } catch (err) {
        if (cancelled) return
        setMembers([])
        setPageError(err instanceof Error ? err.message : '팀원 정보를 불러오지 못했습니다.')
      } finally {
        if (!cancelled) setIsLoadingMembers(false)
      }
    }

    void loadMembers()

    return () => {
      cancelled = true
    }
  }, [accessToken, selectedTeam, reloadKey, setAccessToken, isMediaTeam])

  // 서브팀 로드 (미디어팀일 때)
  useEffect(() => {
    if (!isMediaTeam || !selectedTeam) return
    let cancelled = false
    setIsLoadingSubTeams(true)
    setPageError('')
    callAuthedApi(`/api/teams/${encodeURIComponent(selectedTeam)}/sub-teams`, '서브팀 정보를 불러오지 못했습니다.')
      .then((data) => {
        if (cancelled) return
        const loaded = (Array.isArray(data) ? data : [])
        setSubTeams(loaded)
        setSelectedSubTeam((prev) => {
          const DEFAULT_SUB = '조이힐그램'
          if (loaded.find((s) => s.subTeamName === DEFAULT_SUB)) return DEFAULT_SUB
          if (prev && loaded.find((s) => s.subTeamName === prev)) return prev
          return loaded[0]?.subTeamName ?? null
        })
      })
      .catch((err) => { if (!cancelled) setPageError(err instanceof Error ? err.message : '서브팀 정보를 불러오지 못했습니다.') })
      .finally(() => { if (!cancelled) setIsLoadingSubTeams(false) })
    return () => { cancelled = true }
  }, [accessToken, selectedTeam, isMediaTeam, reloadKey])

  useEffect(() => {
    setEditingIntro(false)
    setIntroDraft(selectedTeamInfo?.intro ?? '')
    setShowAddPanel(false)
    setCandidateQuery('')
    setCandidateError('')
    setAddAsLeader(false)
  }, [selectedTeamInfo?.teamName, selectedTeamInfo?.intro])

  // 팀원 추가 패널 열릴 때 사용자 목록 로드 (팀장 이상 모두 가능)
  useEffect(() => {
    if (!showAddPanel && !subAddPanel) return

    let cancelled = false

    async function loadUsers() {
      setIsLoadingCandidates(true)
      setCandidateError('')

      try {
        const data = await callAuthedApi('/api/users', '추가 가능한 사용자 목록을 불러오지 못했습니다.')
        if (cancelled) return
        setAllUsers((Array.isArray(data) ? data : []).map(mapUser))
      } catch (err) {
        if (cancelled) return
        setCandidateError(err instanceof Error ? err.message : '추가 가능한 사용자 목록을 불러오지 못했습니다.')
      } finally {
        if (!cancelled) setIsLoadingCandidates(false)
      }
    }

    void loadUsers()

    return () => {
      cancelled = true
    }
  }, [accessToken, setAccessToken, showAddPanel, subAddPanel])

  const candidates = useMemo(() => {
    const query = candidateQuery.trim().toLowerCase()
    const currentIds = new Set(members.map((member) => member.userId))

    return allUsers
      .filter((candidate) => !currentIds.has(candidate.id))
      .filter((candidate) => !query || [
        candidate.name,
        candidate.phone,
        candidate.village,
        candidate.fam,
      ].some((value) => String(value ?? '').toLowerCase().includes(query)))
      .sort((a, b) => a.name.localeCompare(b.name, 'ko'))
  }, [allUsers, candidateQuery, members])

  const handleAddMember = async (candidate) => {
    if (!selectedTeam || !candidate?.id) return

    setAddingUserId(candidate.id)
    setCandidateError('')

    try {
      await callAuthedApi(`/api/teams/${encodeURIComponent(selectedTeam)}/members`, '팀원 추가에 실패했습니다.', {
        method: 'POST',
        body: {
          userId: candidate.id,
          leader: addAsLeader,
        },
      })

      setShowAddPanel(false)
      setCandidateQuery('')
      setAddAsLeader(false)
      setReloadKey((prev) => prev + 1)
    } catch (err) {
      setCandidateError(err instanceof Error ? err.message : '팀원 추가에 실패했습니다.')
    } finally {
      setAddingUserId(null)
    }
  }

  const handleRemoveMember = async (member) => {
    if (!selectedTeam || !member?.userId) return

    setRemovingUserId(member.userId)
    setPageError('')

    try {
      await callAuthedApi(`/api/teams/${encodeURIComponent(selectedTeam)}/members/${member.userId}`, '팀원 제거에 실패했습니다.', {
        method: 'DELETE',
      })
      setReloadKey((prev) => prev + 1)
    } catch (err) {
      setPageError(err instanceof Error ? err.message : '팀원 제거에 실패했습니다.')
    } finally {
      setRemovingUserId(null)
    }
  }

  const handleDelegateLeader = async (member) => {
    if (!selectedTeam || !member?.userId) return
    if (!window.confirm(`${member.name}님을 팀장으로 위임할까요?\n기존 팀장은 팀원으로 변경됩니다.`)) return

    setDelegatingUserId(member.userId)
    setPageError('')

    try {
      await callAuthedApi(
        `/api/teams/${encodeURIComponent(selectedTeam)}/delegate/${member.userId}`,
        '팀장 위임에 실패했습니다.',
        { method: 'PUT' },
      )
      setReloadKey((prev) => prev + 1)
    } catch (err) {
      setPageError(err instanceof Error ? err.message : '팀장 위임에 실패했습니다.')
    } finally {
      setDelegatingUserId(null)
    }
  }

  const handleSaveIntro = async () => {
    if (!selectedTeam) return

    setIsSavingIntro(true)
    setPageError('')

    try {
      await callAuthedApi(`/api/teams/${encodeURIComponent(selectedTeam)}/intro`, '팀 소개 저장에 실패했습니다.', {
        method: 'PATCH',
        body: { intro: introDraft },
      })
      setEditingIntro(false)
      setReloadKey((prev) => prev + 1)
    } catch (err) {
      setPageError(err instanceof Error ? err.message : '팀 소개 저장에 실패했습니다.')
    } finally {
      setIsSavingIntro(false)
    }
  }

  // 서브팀 핸들러들
  const handleCreateSubTeam = async () => {
    if (!subNewTeamName.trim()) return
    setIsCreatingSubTeam(true); setPageError('')
    try {
      await callAuthedApi(`/api/teams/${encodeURIComponent(selectedTeam)}/sub-teams`, '서브팀 생성에 실패했습니다.', {
        method: 'POST', body: { subTeamName: subNewTeamName.trim() },
      })
      setShowCreateSubTeam(false); setSubNewTeamName('')
      setReloadKey((p) => p + 1)
    } catch (err) {
      setPageError(err instanceof Error ? err.message : '서브팀 생성에 실패했습니다.')
    } finally { setIsCreatingSubTeam(false) }
  }

  const handleDeleteSubTeam = async (subTeamName) => {
    if (!window.confirm(`"${subTeamName}" 서브팀을 삭제할까요?\n멤버 데이터도 모두 삭제됩니다.`)) return
    setPageError('')
    try {
      await callAuthedApi(
        `/api/teams/${encodeURIComponent(selectedTeam)}/sub-teams/${encodeURIComponent(subTeamName)}`,
        '서브팀 삭제에 실패했습니다.', { method: 'DELETE' }
      )
      setReloadKey((p) => p + 1)
    } catch (err) {
      setPageError(err instanceof Error ? err.message : '서브팀 삭제에 실패했습니다.')
    }
  }

  const handleSubAddMember = async (candidate) => {
    if (!selectedTeam || !selectedSubTeam || !candidate?.id) return
    setSubAddingUserId(candidate.id); setSubCandidateError('')
    try {
      await callAuthedApi(
        `/api/teams/${encodeURIComponent(selectedTeam)}/sub-teams/${encodeURIComponent(selectedSubTeam)}/members`,
        '서브팀 멤버 추가에 실패했습니다.',
        { method: 'POST', body: { userId: candidate.id } },
      )
      setSubAddPanel(false); setSubCandidateQuery('')
      setReloadKey((p) => p + 1)
    } catch (err) {
      setSubCandidateError(err instanceof Error ? err.message : '서브팀 멤버 추가에 실패했습니다.')
    } finally { setSubAddingUserId(null) }
  }

  const handleSubRemoveMember = async (member) => {
    if (!selectedTeam || !selectedSubTeam || !member?.userId) return
    setSubRemovingUserId(member.userId); setPageError('')
    try {
      await callAuthedApi(
        `/api/teams/${encodeURIComponent(selectedTeam)}/sub-teams/${encodeURIComponent(selectedSubTeam)}/members/${member.userId}`,
        '서브팀 멤버 제거에 실패했습니다.', { method: 'DELETE' }
      )
      setReloadKey((p) => p + 1)
    } catch (err) {
      setPageError(err instanceof Error ? err.message : '서브팀 멤버 제거에 실패했습니다.')
    } finally { setSubRemovingUserId(null) }
  }

  const handleSetSubLeader = async (member) => {
    if (!selectedTeam || !selectedSubTeam || !member?.userId) return
    if (!window.confirm(`${member.name}님을 "${selectedSubTeam}" 리더로 지정할까요?`)) return
    setPageError('')
    try {
      await callAuthedApi(
        `/api/teams/${encodeURIComponent(selectedTeam)}/sub-teams/${encodeURIComponent(selectedSubTeam)}/leader`,
        '리더 지정에 실패했습니다.',
        { method: 'PUT', body: { userId: member.userId } },
      )
      setReloadKey((p) => p + 1)
    } catch (err) {
      setPageError(err instanceof Error ? err.message : '리더 지정에 실패했습니다.')
    }
  }

  const currentSubTeam = subTeams.find((s) => s.subTeamName === selectedSubTeam) ?? null

  const subCandidates = useMemo(() => {
    const query = subCandidateQuery.trim().toLowerCase()
    const currentIds = new Set((currentSubTeam?.members ?? []).map((m) => m.userId))
    return allUsers
      .filter((u) => !currentIds.has(u.id))
      .filter((u) => !query || [u.name, u.phone, u.village, u.fam].some((v) => String(v ?? '').toLowerCase().includes(query)))
      .sort((a, b) => a.name.localeCompare(b.name, 'ko'))
  }, [allUsers, subCandidateQuery, currentSubTeam])

  if (!canManagePage) {
    return (
      <div className="flex flex-col items-center justify-center h-screen pb-20">
        <p className="text-gray-500 text-sm">팀 관리 권한이 없습니다.</p>
        <button onClick={() => navigate('/my')} className="mt-3 text-xs text-primary bg-primary-light px-4 py-2 rounded-full border-none cursor-pointer">
          돌아가기
        </button>
        <BottomNav />
      </div>
    )
  }

  return (
    <div className="pb-24">
      <div className="flex items-center gap-3 px-5 pt-4 pb-3 border-b border-gray-300">
        <button onClick={() => navigate('/my')} className="text-lg bg-transparent border-none cursor-pointer">←</button>
        <p className="text-base font-medium flex-1">사역팀 관리</p>
      </div>

      {manageableTeams.length > 1 && (
        <div className="flex gap-2 px-5 py-3 overflow-x-auto border-b border-gray-300">
          {manageableTeams.map((team) => (
            <button
              key={team.teamName}
              onClick={() => setSelectedTeam(team.teamName)}
              className={`text-xs px-3 py-1.5 rounded-full border-none cursor-pointer whitespace-nowrap transition-colors ${
                selectedTeam === team.teamName
                  ? 'bg-warning-light text-warning font-medium'
                  : 'bg-gray-100 text-gray-500'
              }`}
            >
              {team.teamName}
            </button>
          ))}
        </div>
      )}

      {pageError && (
        <div className="px-5 pt-3">
          <div className="bg-danger-light rounded-xl px-4 py-3">
            <p className="text-sm text-danger">{pageError}</p>
          </div>
        </div>
      )}

      {isLoadingTeams ? (
        <div className="px-5 py-10">
          <p className="text-sm text-gray-500 text-center">팀 정보를 불러오는 중입니다.</p>
        </div>
      ) : !selectedTeamInfo ? (
        <div className="px-5 py-10">
          <p className="text-sm text-gray-500 text-center">관리할 팀이 없습니다.</p>
        </div>
      ) : (
        <>
          <div className="px-5 pt-4 pb-0">
            <p className="text-base font-medium mb-1">{selectedTeamInfo.teamName}</p>

            {isMediaTeam ? (
              // 미디어사역팀: 서브팀명을 탭으로 바로 노출
              <>
                <p className="text-xs text-gray-500 mb-3">서브팀으로 관리됩니다</p>
                <div className="flex border-b border-gray-300">
                  {subTeams.map((st) => (
                    <button key={st.subTeamName}
                      onClick={() => { setSelectedSubTeam(st.subTeamName); setSubAddPanel(false); setSubCandidateQuery('') }}
                      className={`flex-1 py-2.5 text-sm border-none cursor-pointer bg-transparent transition-colors ${
                        selectedSubTeam === st.subTeamName ? 'text-primary font-medium border-b-2 border-primary' : 'text-gray-500'
                      }`}>
                      {st.subTeamName}
                    </button>
                  ))}
                </div>
              </>
            ) : (
              // 일반 사역팀 탭
              <>
                <p className="text-xs text-gray-500 mb-3">총 {members.length}명 · 팀장 {members.filter((m) => m.isLeader).length}명</p>
                <div className="flex border-b border-gray-300">
                  {[['members', '팀원 관리'], ['intro', '팀 소개']].map(([key, label]) => (
                    <button key={key} onClick={() => setTab(key)}
                      className={`flex-1 py-2.5 text-sm border-none cursor-pointer bg-transparent transition-colors ${
                        tab === key ? 'text-primary font-medium border-b-2 border-primary' : 'text-gray-500'
                      }`}>
                      {label}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* 미디어팀: 선택된 서브팀 내용 */}
          {isMediaTeam && (
            <div className="px-5 pt-3">
              {isLoadingSubTeams ? (
                <p className="text-sm text-gray-500 text-center py-6">서브팀 정보를 불러오는 중입니다.</p>
              ) : (
                <>
                  {currentSubTeam && (
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <span className="text-sm font-medium">{currentSubTeam.subTeamName}</span>
                          <span className="text-xs text-gray-500 ml-2">총 {(currentSubTeam.members ?? []).length}명</span>
                          {currentSubTeam.leaderName && (
                            <span className="text-xs text-warning ml-2">리더: {currentSubTeam.leaderName}</span>
                          )}
                        </div>
                        <button onClick={() => { setSubAddPanel((p) => !p); setSubCandidateQuery('') }}
                          className="text-xs text-primary bg-primary-light px-3 py-1.5 rounded-full border-none cursor-pointer">
                          + 멤버 추가
                        </button>
                      </div>

                      {subAddPanel && (
                        <div className="mb-4 rounded-xl border border-primary/20 bg-white p-4 shadow-sm">
                          <div className="flex items-center justify-between mb-3">
                            <p className="text-sm font-medium">{currentSubTeam.subTeamName} 멤버 추가</p>
                            <button onClick={() => setSubAddPanel(false)} className="text-xs text-gray-500 bg-transparent border-none cursor-pointer">닫기</button>
                          </div>
                          <input value={subCandidateQuery} onChange={(e) => setSubCandidateQuery(e.target.value)}
                            placeholder="이름, 마을, 팸, 전화번호 검색"
                            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-primary" />
                          {subCandidateError && (
                            <div className="mt-3 bg-danger-light rounded-lg px-3 py-2.5">
                              <p className="text-xs text-danger">{subCandidateError}</p>
                            </div>
                          )}
                          <div className="mt-3 rounded-lg border border-gray-300 overflow-hidden max-h-64 overflow-y-auto">
                            {isLoadingCandidates ? (
                              <p className="px-4 py-6 text-sm text-gray-500 text-center">불러오는 중...</p>
                            ) : subCandidates.length === 0 ? (
                              <p className="px-4 py-6 text-sm text-gray-500 text-center">추가 가능한 사용자가 없습니다.</p>
                            ) : (
                              subCandidates.map((candidate) => (
                                <div key={candidate.id} className="flex items-center gap-3 px-4 py-3 border-b border-gray-300 last:border-b-0">
                                  <div className="w-9 h-9 rounded-full bg-primary-light flex items-center justify-center text-[13px] font-medium text-primary shrink-0">
                                    {getInitial(candidate.name)}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm truncate">{candidate.name}</p>
                                    <p className="text-[11px] text-gray-500 truncate">{[candidate.village, candidate.fam, candidate.phone].filter(Boolean).join(' · ')}</p>
                                  </div>
                                  <button onClick={() => handleSubAddMember(candidate)} disabled={subAddingUserId === candidate.id}
                                    className="text-[11px] text-primary bg-primary-light px-2 py-1 rounded-full border-none cursor-pointer disabled:opacity-60">
                                    {subAddingUserId === candidate.id ? '추가 중...' : '추가'}
                                  </button>
                                </div>
                              ))
                            )}
                          </div>
                        </div>
                      )}

                      {(currentSubTeam.members ?? []).length === 0 ? (
                        <p className="text-sm text-gray-500 text-center py-8">등록된 멤버가 없습니다.</p>
                      ) : (
                        (currentSubTeam.members ?? []).map((member) => {
                          const color = getColor(member.userId)
                          return (
                            <div key={member.userId} className="flex items-center py-3 border-b border-gray-300 last:border-b-0">
                              <div className={`w-9 h-9 rounded-full ${color.bg} flex items-center justify-center text-[13px] font-medium ${color.text} shrink-0`}>
                                {getInitial(member.name)}
                              </div>
                              <div className="flex-1 ml-3">
                                <p className="text-sm">{member.name}</p>
                                <p className="text-[11px] text-gray-500">{[member.famName, formatPhone(member.phone), formatBirth(member.birth)].filter(Boolean).join(' · ')}</p>
                              </div>
                              <span className={`text-[11px] px-2 py-0.5 rounded-full mr-2 ${member.isLeader ? 'bg-warning-light text-warning' : 'bg-gray-100 text-gray-500'}`}>
                                {member.isLeader ? '리더' : '멤버'}
                              </span>
                              {!member.isLeader && (
                                <button onClick={() => handleSetSubLeader(member)}
                                  className="text-[11px] text-warning bg-warning-light px-2 py-0.5 rounded-full border-none cursor-pointer mr-1">
                                  위임
                                </button>
                              )}
                              <button onClick={() => handleSubRemoveMember(member)} disabled={subRemovingUserId === member.userId}
                                className="text-[11px] text-danger bg-danger-light px-2 py-0.5 rounded-full border-none cursor-pointer disabled:opacity-60">
                                {subRemovingUserId === member.userId ? '제거 중...' : '제거'}
                              </button>
                            </div>
                          )
                        })
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* 일반팀: 팀원 관리 탭 */}
          {!isMediaTeam && tab === 'members' && (
            <div className="px-5 pt-3">
              <div className="flex justify-between items-center mb-3 gap-3">
                <span className="text-xs text-gray-500">총 {members.length}명</span>
                <button
                  onClick={() => setShowAddPanel((prev) => !prev)}
                  className="text-xs text-primary bg-primary-light px-3 py-1.5 rounded-full border-none cursor-pointer"
                >
                  + 팀원 추가
                </button>
              </div>

              {showAddPanel && (
                <div className="mb-4 rounded-xl border border-primary/20 bg-white p-4 shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm font-medium">{selectedTeam} 팀원 추가</p>
                    <button onClick={() => setShowAddPanel(false)} className="text-xs text-gray-500 bg-transparent border-none cursor-pointer">닫기</button>
                  </div>

                  <input
                    value={candidateQuery}
                    onChange={(event) => setCandidateQuery(event.target.value)}
                    placeholder="이름, 마을, 팸, 전화번호 검색"
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-primary"
                  />

                  <label className="mt-3 flex items-center gap-2 text-xs text-gray-600">
                    <input type="checkbox" checked={addAsLeader} onChange={(event) => setAddAsLeader(event.target.checked)} />
                    팀장으로 추가
                  </label>

                  {candidateError && (
                    <div className="mt-3 bg-danger-light rounded-lg px-3 py-2.5">
                      <p className="text-xs text-danger">{candidateError}</p>
                    </div>
                  )}

                  <div className="mt-3 rounded-lg border border-gray-300 overflow-hidden">
                    {isLoadingCandidates ? (
                      <p className="px-4 py-6 text-sm text-gray-500 text-center">추가 가능한 사용자를 불러오는 중입니다.</p>
                    ) : candidates.length === 0 ? (
                      <p className="px-4 py-6 text-sm text-gray-500 text-center">추가 가능한 사용자가 없습니다.</p>
                    ) : (
                      candidates.map((candidate) => (
                        <div key={candidate.id} className="flex items-center gap-3 px-4 py-3 border-b border-gray-300 last:border-b-0">
                          <div className="w-9 h-9 rounded-full bg-primary-light flex items-center justify-center text-[13px] font-medium text-primary shrink-0">
                            {getInitial(candidate.name)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm truncate">{candidate.name}</p>
                            <p className="text-[11px] text-gray-500 truncate">
                              {[candidate.village, candidate.fam, candidate.phone].filter(Boolean).join(' · ')}
                            </p>
                          </div>
                          <span className="text-[11px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 shrink-0">
                            {ROLE_LABELS[candidate.role] ?? '청년'}
                          </span>
                          <button
                            onClick={() => handleAddMember(candidate)}
                            disabled={addingUserId === candidate.id}
                            className="text-[11px] text-primary bg-primary-light px-2 py-1 rounded-full border-none cursor-pointer disabled:opacity-60"
                          >
                            {addingUserId === candidate.id ? '추가 중...' : addAsLeader ? '팀장 추가' : '추가'}
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {isLoadingMembers ? (
                <p className="text-sm text-gray-500 text-center py-10">팀원 정보를 불러오는 중입니다.</p>
              ) : members.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-10">등록된 팀원이 없습니다.</p>
              ) : (
                members.map((member) => {
                  const color = getColor(member.userId)

                  return (
                    <div key={member.userId} className="flex items-center py-3 border-b border-gray-300 last:border-b-0">
                      <div className={`w-9 h-9 rounded-full ${color.bg} flex items-center justify-center text-[13px] font-medium ${color.text} shrink-0`}>
                        {getInitial(member.name)}
                      </div>
                      <div className="flex-1 ml-3">
                        <p className="text-sm">{member.name}</p>
                        <p className="text-[11px] text-gray-500">{[member.famName, member.phone, member.birth].filter(Boolean).join(' · ')}</p>
                      </div>
                      <span className={`text-[11px] px-2 py-0.5 rounded-full mr-2 ${
                        member.isLeader ? 'bg-warning-light text-warning' : 'bg-gray-100 text-gray-500'
                      }`}>
                        {member.isLeader ? '팀장' : '팀원'}
                      </span>
                      {!member.isLeader && (
                        <button
                          onClick={() => handleDelegateLeader(member)}
                          disabled={delegatingUserId === member.userId}
                          className="text-[11px] text-warning bg-warning-light px-2 py-0.5 rounded-full border-none cursor-pointer disabled:opacity-60 mr-1"
                        >
                          {delegatingUserId === member.userId ? '위임 중...' : '위임'}
                        </button>
                      )}
                      <button
                        onClick={() => handleRemoveMember(member)}
                        disabled={removingUserId === member.userId}
                        className="text-[11px] text-danger bg-danger-light px-2 py-0.5 rounded-full border-none cursor-pointer disabled:opacity-60"
                      >
                        {removingUserId === member.userId ? '제거 중...' : '제거'}
                      </button>
                    </div>
                  )
                })
              )}
            </div>
          )}

          {tab === 'intro' && (
            <div className="px-5 pt-4">
              {editingIntro ? (
                <>
                  <textarea
                    value={introDraft}
                    onChange={(event) => setIntroDraft(event.target.value)}
                    rows={6}
                    className="w-full border border-primary rounded-lg px-3 py-2.5 text-sm outline-none resize-none"
                  />
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={() => {
                        setEditingIntro(false)
                        setIntroDraft(selectedTeamInfo.intro ?? '')
                      }}
                      className="flex-1 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-500 bg-white cursor-pointer"
                    >
                      취소
                    </button>
                    <button
                      onClick={handleSaveIntro}
                      disabled={isSavingIntro}
                      className="flex-1 py-2.5 bg-primary text-white rounded-lg text-sm font-medium border-none cursor-pointer disabled:opacity-60"
                    >
                      {isSavingIntro ? '저장 중...' : '저장'}
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="border border-gray-300 rounded-xl p-4 min-h-[120px]">
                    <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                      {selectedTeamInfo.intro?.trim() ? selectedTeamInfo.intro : '등록된 팀 소개가 없습니다.'}
                    </p>
                  </div>
                  <button
                    onClick={() => setEditingIntro(true)}
                    className="w-full mt-3 py-2.5 border border-primary text-primary rounded-lg text-sm cursor-pointer bg-white"
                  >
                    소개 수정
                  </button>
                </>
              )}
            </div>
          )}
        </>
      )}

      <BottomNav />
    </div>
  )
}
