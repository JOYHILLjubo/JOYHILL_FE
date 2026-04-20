import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import BottomNav from '../components/BottomNav'
import { useAuth } from '../context/AuthContext'

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/$/, '')

const ROLE_LABELS = {
  admin: '관리자',
  pastor: '교역자·부장',
  village_leader: '마을장',
  leader: '리더',
  member: '청년',
}

const ROLE_OPTIONS = ['member', 'leader', 'village_leader', 'pastor', 'admin']

const avatarColors = [
  { bg: 'bg-success-light', text: 'text-success' },
  { bg: 'bg-primary-light', text: 'text-primary' },
  { bg: 'bg-warning-light', text: 'text-warning' },
  { bg: 'bg-danger-light', text: 'text-danger' },
]

const EMPTY_FORM = {
  name: '',
  phone: '',
  birth: '',
  village: '',
  fam: '',
  role: 'member',
  teams: [],
  teamRoles: [],
}

function buildApiUrl(path) {
  return `${API_BASE_URL}${path}`
}

function getColor(seed) {
  return avatarColors[Math.abs(Number(seed) || 0) % avatarColors.length]
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

function normalizeBirth(value) {
  return String(value ?? '').replace(/\D/g, '').slice(0, 6)
}

function nullIfBlank(value) {
  const trimmed = String(value ?? '').trim()
  return trimmed === '' ? null : trimmed
}

function mapUser(item) {
  const summary = item?.summary ?? {}

  return {
    id: item?.id ?? null,
    name: item?.name ?? summary?.name ?? '',
    phone: formatPhone(item?.phone ?? summary?.phone ?? ''),
    birth: String(item?.birth ?? '').slice(0, 6),
    role: item?.role ?? summary?.role ?? 'member',
    fam: item?.famName ?? summary?.fam ?? '',
    village: item?.villageName ?? summary?.village ?? '',
    teams: Array.isArray(summary?.teams) ? summary.teams : [],
    teamRoles: Array.isArray(summary?.teamRoles) ? summary.teamRoles : [],
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
    return result.payload?.error?.message ?? '계정 관리 권한이 없습니다.'
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

function UserEditViewConnected({
  initial,
  isNew,
  villageOptions,
  famOptions,
  teamOptions,
  onBack,
  onSave,
  onDelete,
  onResetPassword,
}) {
  const [form, setForm] = useState({ ...initial })
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    setForm({ ...initial })
    setError('')
    setIsSubmitting(false)
  }, [initial])

  const filteredFams = useMemo(() => {
    if (!form.village) return famOptions
    return famOptions.filter((fam) => fam.villageName === form.village)
  }, [famOptions, form.village])

  const color = getColor(form.id ?? 0)

  const toggleTeam = (teamName) => {
    setForm((prev) => {
      const nextTeams = prev.teams.includes(teamName)
        ? prev.teams.filter((team) => team !== teamName)
        : [...prev.teams, teamName]

      return {
        ...prev,
        teams: nextTeams,
        teamRoles: prev.teamRoles.filter((team) => nextTeams.includes(team)),
      }
    })
  }

  const toggleTeamLeader = (teamName) => {
    setForm((prev) => ({
      ...prev,
      teamRoles: prev.teamRoles.includes(teamName)
        ? prev.teamRoles.filter((team) => team !== teamName)
        : [...prev.teamRoles, teamName],
    }))
  }

  const handleSubmit = async () => {
    if (!form.name.trim()) {
      setError('이름을 입력해주세요.')
      return
    }

    if (normalizePhone(form.phone).length < 10) {
      setError('전화번호를 확인해주세요.')
      return
    }

    if (normalizeBirth(form.birth).length !== 6) {
      setError('생년월일 6자리를 입력해주세요.')
      return
    }

    setIsSubmitting(true)
    setError('')

    try {
      await onSave({
        ...form,
        name: form.name.trim(),
        phone: normalizePhone(form.phone),
        birth: normalizeBirth(form.birth),
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : '저장에 실패했습니다.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="pb-28">
      <div className="flex items-center gap-3 px-5 pt-4 pb-3 border-b border-gray-300">
        <button onClick={onBack} className="text-lg bg-transparent border-none cursor-pointer">←</button>
        <p className="text-base font-semibold flex-1">{isNew ? '계정 추가' : '계정 수정'}</p>
        {!isNew && (
          <>
            <button
              onClick={onResetPassword}
              disabled={isSubmitting}
              className="text-xs text-warning bg-warning-light px-3 py-1.5 rounded-full border-none cursor-pointer disabled:opacity-60"
            >
              PW 초기화
            </button>
            <button
              onClick={onDelete}
              disabled={isSubmitting}
              className="text-xs text-danger bg-danger-light px-3 py-1.5 rounded-full border-none cursor-pointer disabled:opacity-60"
            >
              삭제
            </button>
          </>
        )}
      </div>

      {!isNew && (
        <div className="flex flex-col items-center pt-5 pb-3">
          <div className={`w-14 h-14 rounded-full ${color.bg} flex items-center justify-center text-xl font-medium ${color.text} mb-2`}>
            {form.name?.[0] || '?'}
          </div>
          <p className="text-sm font-medium">{form.name || '이름 없음'}</p>
          <p className="text-xs text-gray-500">{form.village || '미정'} · {form.fam || '미정'} · {ROLE_LABELS[form.role]}</p>
        </div>
      )}

      <div className="px-5 pt-4 flex flex-col gap-4">
        <div>
          <p className="text-xs text-gray-500 mb-1.5">이름</p>
          <input
            value={form.name}
            onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
            disabled={isSubmitting}
            placeholder="실명"
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-primary disabled:bg-gray-100"
          />
        </div>

        <div>
          <p className="text-xs text-gray-500 mb-1.5">전화번호</p>
          <input
            value={form.phone}
            onChange={(event) => setForm((prev) => ({ ...prev, phone: event.target.value }))}
            disabled={isSubmitting}
            placeholder="010-0000-0000"
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-primary disabled:bg-gray-100"
          />
        </div>

        <div>
          <p className="text-xs text-gray-500 mb-1.5">생년월일</p>
          <input
            value={form.birth}
            onChange={(event) => setForm((prev) => ({ ...prev, birth: normalizeBirth(event.target.value) }))}
            disabled={isSubmitting}
            placeholder="950315"
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-primary disabled:bg-gray-100"
          />
        </div>

        <div>
          <p className="text-xs text-gray-500 mb-1.5">소속 마을</p>
          <select
            value={form.village}
            onChange={(event) => setForm((prev) => ({ ...prev, village: event.target.value, fam: '' }))}
            disabled={isSubmitting}
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-primary bg-white disabled:bg-gray-100"
          >
            <option value="">선택 안 함</option>
            {villageOptions.map((village) => (
              <option key={village} value={village}>{village}</option>
            ))}
          </select>
        </div>

        <div>
          <p className="text-xs text-gray-500 mb-1.5">소속 팸</p>
          <select
            value={form.fam}
            onChange={(event) => setForm((prev) => ({ ...prev, fam: event.target.value }))}
            disabled={isSubmitting}
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-primary bg-white disabled:bg-gray-100"
          >
            <option value="">선택 안 함</option>
            {filteredFams.map((fam) => (
              <option key={fam.name} value={fam.name}>{fam.name}</option>
            ))}
          </select>
        </div>

        <div>
          <p className="text-xs text-gray-500 mb-1.5">역할</p>
          <div className="flex gap-2 flex-wrap">
            {ROLE_OPTIONS.map((role) => (
              <button
                key={role}
                type="button"
                onClick={() => setForm((prev) => ({ ...prev, role }))}
                disabled={isSubmitting}
                className={`text-xs px-2.5 py-1.5 rounded-full border cursor-pointer transition-all ${
                  form.role === role
                    ? 'bg-primary-light text-primary border-primary'
                    : 'bg-white text-gray-500 border-gray-300'
                } ${isSubmitting ? 'opacity-60 cursor-not-allowed' : ''}`}
              >
                {ROLE_LABELS[role]}
              </button>
            ))}
          </div>
        </div>

        {isNew ? (
          <>
            <div>
              <p className="text-xs text-gray-500 mb-1.5">사역팀 소속</p>
              <div className="flex gap-2 flex-wrap">
                {teamOptions.map((team) => (
                  <button
                    key={team}
                    type="button"
                    onClick={() => toggleTeam(team)}
                    disabled={isSubmitting}
                    className={`text-xs px-2.5 py-1.5 rounded-full border cursor-pointer transition-all ${
                      form.teams.includes(team)
                        ? 'bg-primary-light text-primary border-primary'
                        : 'bg-white text-gray-500 border-gray-300'
                    } ${isSubmitting ? 'opacity-60 cursor-not-allowed' : ''}`}
                  >
                    {team}
                  </button>
                ))}
              </div>
            </div>

            {form.teams.length > 0 && (
              <div>
                <p className="text-xs text-gray-500 mb-1.5">팀 리더 지정</p>
                <div className="flex gap-2 flex-wrap">
                  {form.teams.map((team) => (
                    <button
                      key={team}
                      type="button"
                      onClick={() => toggleTeamLeader(team)}
                      disabled={isSubmitting}
                      className={`text-xs px-2.5 py-1.5 rounded-full border cursor-pointer transition-all ${
                        form.teamRoles.includes(team)
                          ? 'bg-warning-light text-warning border-warning'
                          : 'bg-white text-gray-500 border-gray-300'
                      } ${isSubmitting ? 'opacity-60 cursor-not-allowed' : ''}`}
                    >
                      {team} 리더
                    </button>
                  ))}
                </div>
              </div>
            )}
          </>
        ) : (
          <div>
            <p className="text-xs text-gray-500 mb-1.5">사역팀</p>
            <div className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm bg-gray-100 text-gray-700">
              {form.teams.length > 0 ? form.teams.join(', ') : '소속 없음'}
            </div>
            <p className="text-[11px] text-gray-500 mt-2">기존 계정의 사역팀 변경은 현재 연결 범위에서 지원하지 않습니다.</p>
          </div>
        )}

        {error && <p className="text-xs text-danger">{error}</p>}
      </div>

      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] px-5 py-3 bg-white border-t border-gray-300">
        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="w-full py-3 bg-primary text-white rounded-lg text-sm font-medium border-none cursor-pointer hover:bg-primary-hover transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isSubmitting ? '저장 중...' : isNew ? '추가하기' : '저장하기'}
        </button>
      </div>
    </div>
  )
}

export default function AccountManagePageConnected() {
  const navigate = useNavigate()
  const { accessToken, setAccessToken, logout, isAdmin } = useAuth()

  const [users, setUsers] = useState([])
  const [villages, setVillages] = useState([])
  const [fams, setFams] = useState([])
  const [teams, setTeams] = useState([])
  const [search, setSearch] = useState('')
  const [filterRole, setFilterRole] = useState('all')
  const [editTarget, setEditTarget] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [pageError, setPageError] = useState('')
  const [reloadKey, setReloadKey] = useState(0)

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
    if (!isAdmin) {
      setIsLoading(false)
      return
    }

    let cancelled = false

    async function loadPage() {
      setIsLoading(true)
      setPageError('')

      try {
        const [userData, villageData, famData, teamData] = await Promise.all([
          callAuthedApi('/api/users', '계정 목록을 불러오지 못했습니다.'),
          callAuthedApi('/api/villages', '마을 목록을 불러오지 못했습니다.'),
          callAuthedApi('/api/fams', '팸 목록을 불러오지 못했습니다.'),
          callAuthedApi('/api/teams', '사역팀 목록을 불러오지 못했습니다.'),
        ])

        if (cancelled) return

        setUsers((Array.isArray(userData) ? userData : []).map(mapUser))
        setVillages((Array.isArray(villageData) ? villageData : []).map((item) => item?.name ?? '').filter(Boolean).sort((a, b) => a.localeCompare(b, 'ko')))
        setFams((Array.isArray(famData) ? famData : []).map((item) => ({
          name: item?.name ?? '',
          villageName: item?.villageName ?? '',
        })).filter((item) => item.name))
        setTeams((Array.isArray(teamData) ? teamData : []).map((item) => item?.teamName ?? '').filter(Boolean).sort((a, b) => a.localeCompare(b, 'ko')))
      } catch (err) {
        if (cancelled) return
        setPageError(err instanceof Error ? err.message : '계정 관리 정보를 불러오지 못했습니다.')
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    void loadPage()

    return () => {
      cancelled = true
    }
  }, [accessToken, isAdmin, reloadKey, setAccessToken])

  const filteredUsers = useMemo(() => {
    const query = search.trim().toLowerCase()

    return users.filter((user) => {
      const matchesRole = filterRole === 'all' || user.role === filterRole
      const matchesQuery = !query || [
        user.name,
        user.phone,
        user.village,
        user.fam,
        ...(user.teamRoles ?? []),
      ].some((value) => String(value ?? '').toLowerCase().includes(query))

      return matchesRole && matchesQuery
    })
  }, [filterRole, search, users])

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center h-screen pb-20">
        <p className="text-gray-500 text-sm">계정 관리 권한이 없습니다.</p>
        <button onClick={() => navigate('/my')} className="mt-3 text-xs text-primary bg-primary-light px-4 py-2 rounded-full border-none cursor-pointer">
          돌아가기
        </button>
        <BottomNav />
      </div>
    )
  }

  if (editTarget !== null) {
    const isNew = editTarget === false
    const initial = isNew ? { ...EMPTY_FORM } : { ...editTarget }

    return (
      <UserEditViewConnected
        initial={initial}
        isNew={isNew}
        villageOptions={villages}
        famOptions={fams}
        teamOptions={teams}
        onBack={() => setEditTarget(null)}
        onResetPassword={async () => {
          if (!window.confirm(`'${editTarget.name}'의 비밀번호를 생년월일로 초기화하시겠습니까?`)) return
          try {
            await callAuthedApi(`/api/users/${editTarget.id}/reset-password`, '비밀번호 초기화에 실패했습니다.', { method: 'PATCH' })
            alert('비밀번호가 생년월일로 초기화되었습니다.')
          } catch (err) {
            alert(err instanceof Error ? err.message : '비밀번호 초기화에 실패했습니다.')
          }
        }}
        onSave={async (form) => {
          if (isNew) {
            await callAuthedApi('/api/users', '계정 추가에 실패했습니다.', {
              method: 'POST',
              body: {
                name: form.name,
                phone: form.phone,
                birth: form.birth,
                role: form.role,
                famName: nullIfBlank(form.fam),
                villageName: nullIfBlank(form.village),
                teams: form.teams,
                teamRoles: form.teamRoles.filter((team) => form.teams.includes(team)),
              },
            })
          } else {
            await callAuthedApi(`/api/users/${editTarget.id}`, '계정 수정에 실패했습니다.', {
              method: 'PUT',
              body: {
                name: form.name,
                phone: form.phone,
                birth: form.birth,
                famName: nullIfBlank(form.fam),
                villageName: nullIfBlank(form.village),
              },
            })

            if (form.role !== editTarget.role) {
              await callAuthedApi(`/api/users/${editTarget.id}/role`, '권한 변경에 실패했습니다.', {
                method: 'PATCH',
                body: { role: form.role },
              })
            }
          }

          setEditTarget(null)
          setReloadKey((prev) => prev + 1)
        }}
        onDelete={async () => {
          await callAuthedApi(`/api/users/${editTarget.id}`, '계정 삭제에 실패했습니다.', {
            method: 'DELETE',
          })
          setEditTarget(null)
          setReloadKey((prev) => prev + 1)
        }}
      />
    )
  }

  return (
    <div className="pb-20">
      <div className="flex items-center gap-3 px-5 pt-4 pb-3 border-b border-gray-300">
        <button onClick={() => navigate('/my')} className="text-lg bg-transparent border-none cursor-pointer">←</button>
        <p className="text-base font-semibold flex-1">계정 관리</p>
        <button
          onClick={() => setEditTarget(false)}
          className="text-xs text-white bg-primary px-3 py-1.5 rounded-full border-none cursor-pointer"
        >
          + 추가
        </button>
      </div>

      <div className="px-5 pt-3 pb-2">
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="이름, 마을, 팸, 전화번호 검색"
          className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-primary"
        />
      </div>

      <div className="flex gap-2 px-5 pb-3 overflow-x-auto">
        {['all', ...ROLE_OPTIONS].map((role) => (
          <button
            key={role}
            onClick={() => setFilterRole(role)}
            className={`text-xs px-2.5 py-1 rounded-full border-none cursor-pointer whitespace-nowrap transition-colors ${
              filterRole === role ? 'bg-primary-light text-primary' : 'bg-gray-100 text-gray-500'
            }`}
          >
            {role === 'all' ? '전체' : ROLE_LABELS[role]}
          </button>
        ))}
      </div>

      <div className="px-5 pb-1">
        <span className="text-xs text-gray-500">총 {filteredUsers.length}명</span>
      </div>

      {pageError && (
        <div className="px-5 pb-2">
          <div className="bg-danger-light rounded-xl px-4 py-3">
            <p className="text-sm text-danger">{pageError}</p>
          </div>
        </div>
      )}

      <div className="px-5">
        {isLoading ? (
          <p className="text-sm text-gray-500 text-center mt-10">계정 정보를 불러오는 중입니다.</p>
        ) : filteredUsers.length === 0 ? (
          <p className="text-sm text-gray-500 text-center mt-10">검색 결과가 없습니다.</p>
        ) : (
          filteredUsers.map((user) => {
            const color = getColor(user.id)

            return (
              <div
                key={user.id}
                onClick={() => setEditTarget(user)}
                className="flex items-center gap-3 py-3 border-b border-gray-300 last:border-b-0 cursor-pointer hover:bg-gray-100 -mx-5 px-5 transition-colors"
              >
                <div className={`w-10 h-10 rounded-full ${color.bg} flex items-center justify-center text-sm font-medium ${color.text} shrink-0`}>
                  {user.name[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-medium">{user.name}</p>
                    <span className="text-[11px] text-primary bg-primary-light px-1.5 py-0.5 rounded-full">{ROLE_LABELS[user.role]}</span>
                    {user.teamRoles.length > 0 && (
                      <span className="text-[11px] text-warning bg-warning-light px-1.5 py-0.5 rounded-full">
                        {user.teamRoles.join(', ')} 리더
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-gray-500 mt-0.5 truncate">
                    {[user.village || '미정', user.fam || '미정', user.birth].filter(Boolean).join(' · ')}
                  </p>
                  {user.phone && <p className="text-[11px] text-gray-500">{user.phone}</p>}
                </div>
                <span className="text-gray-500 text-[1rem] shrink-0">→</span>
              </div>
            )
          })
        )}
      </div>

      <BottomNav />
    </div>
  )
}
