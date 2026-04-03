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

const FAM_ROLE_LABELS = {
  member: '팸원',
  leader: '리더',
  village_leader: '마을장',
}

const FAM_ROLES = ['member', 'leader', 'village_leader']

const avatarColors = [
  { bg: 'bg-success-light', text: 'text-success' },
  { bg: 'bg-primary-light', text: 'text-primary' },
  { bg: 'bg-warning-light', text: 'text-warning' },
  { bg: 'bg-danger-light', text: 'text-danger' },
]

function buildApiUrl(path) {
  return `${API_BASE_URL}${path}`
}

function getAvatarColor(seed) {
  const index = typeof seed === 'number' ? seed : (seed?.charCodeAt?.(0) ?? 0)
  return avatarColors[Math.abs(index) % avatarColors.length]
}

function normalizeDateInput(value) {
  if (!value) return ''

  if (Array.isArray(value) && value.length >= 3) {
    const [year, month, day] = value
    return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
  }

  return String(value).slice(0, 10)
}

function normalizePhoneDigits(value) {
  return String(value ?? '').replace(/\D/g, '')
}

function formatPhone(phone) {
  const digits = normalizePhoneDigits(phone)

  if (digits.length === 11) {
    return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`
  }

  if (digits.length === 10) {
    return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`
  }

  return String(phone ?? '').trim()
}

function nullIfBlank(value) {
  const trimmed = String(value ?? '').trim()
  return trimmed === '' ? null : trimmed
}

function sortMembers(items) {
  return [...items].sort((a, b) => {
    if (a.role === b.role) {
      return a.name.localeCompare(b.name, 'ko')
    }

    if (a.role === 'leader' || a.role === 'village_leader') return -1
    if (b.role === 'leader' || b.role === 'village_leader') return 1
    return a.name.localeCompare(b.name, 'ko')
  })
}

function sortNames(items) {
  return [...items].sort((a, b) => a.localeCompare(b, 'ko'))
}

function mapVillage(item) {
  return {
    name: item?.name ?? '',
    leaderName: item?.leaderName ?? '',
  }
}

function mapFam(item) {
  return {
    name: item?.name ?? '',
    villageName: item?.villageName ?? '',
    leaderName: item?.leaderName ?? '',
  }
}

function mapTeam(item) {
  return {
    teamName: item?.teamName ?? '',
    intro: item?.intro ?? '',
    memberCount: Number(item?.memberCount ?? 0),
  }
}

function mapMember(item, currentFam) {
  return {
    id: item?.id ?? null,
    name: item?.name ?? '',
    phone: formatPhone(item?.phone ?? ''),
    birth: normalizeDateInput(item?.birth),
    role: item?.role ?? 'member',
    fam: item?.famName ?? currentFam ?? '',
    note: item?.note ?? '',
    worshipRate: Number(item?.worshipRate ?? 0),
    famRate: Number(item?.famRate ?? 0),
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
    return result.payload?.error?.message ?? '권한이 없습니다.'
  }

  return result.payload?.error?.message ?? fallbackMessage
}

async function requestTokenRefresh() {
  const result = await requestApi('/api/auth/refresh', {
    method: 'POST',
  })

  if (!result.response.ok || !result.payload?.success || !result.payload?.data?.accessToken) {
    throw new Error(getApiErrorMessage(result, '세션이 만료되었습니다. 다시 로그인해주세요.'))
  }

  return result.payload.data.accessToken
}

function RateChip({ rate, type }) {
  return (
    <span
      style={{
        fontSize: 11,
        fontWeight: 600,
        padding: '2px 6px',
        borderRadius: 9,
        background: type === 'worship' ? '#E8F0FE' : '#FEF7E0',
        color: type === 'worship' ? '#4285F4' : '#F9AB00',
      }}
    >
      {Math.round(Number(rate) || 0)}%
    </span>
  )
}

function BottomSheet({ onClose, children }) {
  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-end justify-center" onClick={onClose}>
      <div
        className="bg-white rounded-t-2xl w-full max-w-[430px] flex flex-col"
        style={{ maxHeight: '80vh' }}
        onClick={(event) => event.stopPropagation()}
      >
        {children}
      </div>
    </div>
  )
}

function FamMoveSheet({ fam, currentVillage, villageNames, onClose, onSave, isSubmitting }) {
  const [targetVillage, setTargetVillage] = useState(currentVillage)

  return (
    <BottomSheet onClose={onClose}>
      <div className="flex items-center justify-between px-5 pt-5 pb-3 shrink-0">
        <div>
          <p className="text-base font-medium">{fam} 이동</p>
          <p className="text-xs text-gray-500">현재: {currentVillage}</p>
        </div>
        <button onClick={onClose} className="text-gray-500 text-lg bg-transparent border-none cursor-pointer">✕</button>
      </div>
      <div className="px-5 flex-1 overflow-y-auto pb-3">
        <p className="text-xs text-gray-500 mb-1.5">이동할 마을</p>
        <select
          value={targetVillage}
          onChange={(e) => setTargetVillage(e.target.value)}
          disabled={isSubmitting}
          className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-primary bg-white disabled:bg-gray-100"
        >
          {villageNames.map((village) => (
            <option key={village} value={village}>
              {village}
            </option>
          ))}
        </select>
      </div>
      <div className="px-5 py-4 border-t border-gray-300 shrink-0">
        <button
          onClick={() => {
            if (targetVillage === currentVillage) {
              onClose()
              return
            }
            onSave(targetVillage)
          }}
          disabled={isSubmitting}
          className="w-full py-3 bg-primary text-white rounded-lg text-sm font-medium border-none cursor-pointer hover:bg-primary-hover transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isSubmitting ? '수정 중...' : '수정하기'}
        </button>
      </div>
    </BottomSheet>
  )
}

function VillageMemberEditViewConnected({
  member,
  currentFam,
  isNew = false,
  canChangeRole,
  onBack,
  onSave,
  onDelete,
}) {
  const [form, setForm] = useState({
    name: '',
    phone: '',
    birth: '',
    role: 'member',
    fam: currentFam || '',
    note: '',
    ...member,
  })
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    setForm({
      name: '',
      phone: '',
      birth: '',
      role: 'member',
      fam: currentFam || '',
      note: '',
      ...member,
    })
    setError('')
    setIsSubmitting(false)
  }, [member, currentFam])

  const color = getAvatarColor(form.fam?.charCodeAt?.(0) ?? form.id ?? 0)

  const handleSave = async () => {
    if (!form.name.trim()) {
      setError('이름을 입력해주세요.')
      return
    }

    if (!form.fam) {
      setError('소속 팸을 선택해주세요.')
      return
    }

    setIsSubmitting(true)
    setError('')

    try {
      await onSave({
        ...form,
        name: form.name.trim(),
        phone: form.phone.trim(),
        note: form.note.trim(),
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : '저장에 실패했습니다.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    const confirmed = window.confirm(`'${form.name}'을 삭제하시겠습니까?`)
    if (!confirmed) return

    setIsSubmitting(true)
    setError('')

    try {
      await onDelete()
    } catch (err) {
      setError(err instanceof Error ? err.message : '삭제에 실패했습니다.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="pb-28">
      <div className="flex items-center gap-3 px-5 pt-4 pb-3 border-b border-gray-300">
        <button onClick={onBack} className="text-lg bg-transparent border-none cursor-pointer">←</button>
        <p className="text-base font-medium flex-1">{isNew ? '팸원 추가' : '팸원 정보'}</p>
        {!isNew && onDelete && (
          <button
            onClick={handleDelete}
            disabled={isSubmitting}
            className="text-xs text-danger bg-danger-light px-3 py-1.5 rounded-full border-none cursor-pointer disabled:opacity-60"
          >
            삭제
          </button>
        )}
      </div>

      {!isNew && (
        <div className="flex flex-col items-center pt-5 pb-3">
          <div className={`w-14 h-14 rounded-full ${color.bg} flex items-center justify-center text-xl font-medium ${color.text} mb-2`}>
            {form.name?.[0] || '?'}
          </div>
          <p className="text-sm font-medium">{form.name || '—'}</p>
          <p className="text-xs text-gray-500">
            {form.fam || '소속 없음'} · {FAM_ROLE_LABELS[form.role] ?? form.role}
          </p>
        </div>
      )}

      <div className="px-5 pt-4 flex flex-col gap-4">
        <div>
          <p className="text-xs text-gray-500 mb-1.5">이름 <span className="text-danger">*</span></p>
          <input
            value={form.name}
            onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
            disabled={isSubmitting}
            placeholder="실명"
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-primary disabled:bg-gray-100"
          />
        </div>

        <div>
          <p className="text-xs text-gray-500 mb-1.5">전화번호</p>
          <input
            value={form.phone}
            onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))}
            disabled={isSubmitting}
            placeholder="010-0000-0000"
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-primary disabled:bg-gray-100"
          />
        </div>

        <div>
          <p className="text-xs text-gray-500 mb-1.5">생년월일</p>
          <input
            type="date"
            value={form.birth}
            onChange={(e) => setForm((prev) => ({ ...prev, birth: e.target.value }))}
            disabled={isSubmitting}
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-primary disabled:bg-gray-100"
          />
        </div>

        <div>
          <p className="text-xs text-gray-500 mb-1.5">역할</p>
          <div className="flex gap-2 flex-wrap">
            {FAM_ROLES.map((role) => (
              <button
                key={role}
                type="button"
                onClick={() => canChangeRole && setForm((prev) => ({ ...prev, role }))}
                disabled={isSubmitting || (!canChangeRole && !isNew)}
                className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
                  form.role === role
                    ? 'bg-primary-light text-primary border-primary'
                    : 'bg-white text-gray-500 border-gray-300'
                } ${
                  isSubmitting || (!canChangeRole && !isNew)
                    ? 'cursor-not-allowed opacity-60'
                    : 'cursor-pointer'
                }`}
              >
                {FAM_ROLE_LABELS[role]}
              </button>
            ))}
          </div>
          {!canChangeRole && !isNew && (
            <p className="text-[11px] text-gray-500 mt-2">역할 변경은 마을장 이상만 가능합니다.</p>
          )}
        </div>

        <div>
          <p className="text-xs text-gray-500 mb-1.5">소속 팸</p>
          <div className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm bg-gray-100 text-gray-700">
            {form.fam || currentFam || '소속 팸 없음'}
          </div>
        </div>

        <div>
          <p className="text-xs text-gray-500 mb-1.5">메모</p>
          <textarea
            value={form.note}
            onChange={(e) => setForm((prev) => ({ ...prev, note: e.target.value }))}
            rows={3}
            disabled={isSubmitting}
            placeholder="특이사항 메모"
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-primary resize-none disabled:bg-gray-100"
          />
        </div>

        {error && <p className="text-xs text-danger">{error}</p>}
      </div>

      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] px-5 py-3 bg-white border-t border-gray-300">
        <button
          onClick={handleSave}
          disabled={isSubmitting}
          className="w-full py-3 bg-primary text-white rounded-lg text-sm font-medium border-none cursor-pointer hover:bg-primary-hover transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isSubmitting ? '저장 중...' : isNew ? '추가하기' : '저장하기'}
        </button>
      </div>
    </div>
  )
}

function FamDetailViewConnected({
  fam,
  village,
  leaderName,
  canChangeRole,
  callAuthedApi,
  onBack,
  onChanged,
}) {
  const [members, setMembers] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [pageError, setPageError] = useState('')
  const [editTarget, setEditTarget] = useState(null)

  const loadMembers = async () => {
    setIsLoading(true)
    setPageError('')

    try {
      const membersData = await callAuthedApi(
        `/api/fams/${encodeURIComponent(fam)}/members?period=1month`,
        '팸원 정보를 불러오지 못했습니다.',
      )

      setMembers(sortMembers((Array.isArray(membersData) ? membersData : []).map((item) => mapMember(item, fam))))
    } catch (err) {
      setPageError(err instanceof Error ? err.message : '팸원 정보를 불러오지 못했습니다.')
      setMembers([])
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    void loadMembers()
  }, [fam])

  const reloadAll = async () => {
    await Promise.all([loadMembers(), onChanged()])
  }

  if (editTarget !== null) {
    const isNew = editTarget === 'add'
    const currentMember = isNew ? null : editTarget

    return (
      <VillageMemberEditViewConnected
        member={currentMember}
        currentFam={fam}
        isNew={isNew}
        canChangeRole={canChangeRole}
        onBack={() => setEditTarget(null)}
        onSave={async (form) => {
          if (isNew) {
            await callAuthedApi(`/api/fams/${encodeURIComponent(fam)}/members`, '팸원 추가에 실패했습니다.', {
              method: 'POST',
              body: {
                name: form.name,
                phone: nullIfBlank(form.phone),
                birth: nullIfBlank(form.birth),
                role: form.role,
                note: nullIfBlank(form.note),
              },
            })
          } else {
            await callAuthedApi(`/api/fam-members/${currentMember.id}`, '팸원 수정에 실패했습니다.', {
              method: 'PUT',
              body: {
                name: form.name,
                phone: nullIfBlank(form.phone),
                birth: nullIfBlank(form.birth),
                note: nullIfBlank(form.note),
              },
            })

            if (canChangeRole && form.role !== currentMember.role) {
              await callAuthedApi(`/api/fam-members/${currentMember.id}/role`, '역할 변경에 실패했습니다.', {
                method: 'PATCH',
                body: { role: form.role },
              })
            }
          }

          await reloadAll()
          setEditTarget(null)
        }}
        onDelete={
          !isNew
            ? async () => {
                await callAuthedApi(`/api/fam-members/${currentMember.id}`, '팸원 삭제에 실패했습니다.', {
                  method: 'DELETE',
                })

                await reloadAll()
                setEditTarget(null)
              }
            : null
        }
      />
    )
  }

  const avgWorship = members.length
    ? Math.round(members.reduce((sum, member) => sum + Number(member.worshipRate || 0), 0) / members.length)
    : 0
  const avgFam = members.length
    ? Math.round(members.reduce((sum, member) => sum + Number(member.famRate || 0), 0) / members.length)
    : 0

  return (
    <div className="pb-20">
      <div className="flex items-center gap-3 px-5 pt-4 pb-3 border-b border-gray-300">
        <button onClick={onBack} className="text-lg bg-transparent border-none cursor-pointer">←</button>
        <div className="flex-1">
          <p className="text-base font-medium">{fam}</p>
          <p className="text-xs text-gray-500">{village} · 리더: {leaderName || '—'}</p>
        </div>
        <button
          onClick={() => setEditTarget('add')}
          className="text-xs text-white bg-primary px-3 py-1.5 rounded-full border-none cursor-pointer"
        >
          + 추가
        </button>
      </div>

      {pageError && (
        <div className="px-5 pt-3">
          <div className="bg-danger-light rounded-xl px-4 py-3">
            <p className="text-xs text-danger">{pageError}</p>
            <button
              onClick={() => void loadMembers()}
              className="mt-2 text-xs text-danger bg-white px-3 py-1.5 rounded-full border border-danger-light cursor-pointer"
            >
              다시 시도
            </button>
          </div>
        </div>
      )}

      {!isLoading && members.length > 0 && (
        <div className="px-5 py-3 bg-gray-100/50 border-b border-gray-300">
          <p className="text-xs text-gray-500 mb-2">팸 평균 출석률</p>
          <div className="flex gap-3">
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] text-primary">예배</span>
              <span className="text-sm font-bold text-primary">{avgWorship}%</span>
            </div>
            <span className="text-gray-300">|</span>
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] text-warning">팸모임</span>
              <span className="text-sm font-bold text-warning">{avgFam}%</span>
            </div>
          </div>
        </div>
      )}

      <div className="px-5">
        {isLoading ? (
          <p className="text-sm text-gray-500 text-center mt-10">팸원 정보를 불러오는 중입니다.</p>
        ) : members.length === 0 ? (
          <p className="text-sm text-gray-500 text-center mt-10">팸원이 없습니다.</p>
        ) : (
          members.map((member) => {
            const color = getAvatarColor(member.id)

            return (
              <div
                key={member.id}
                onClick={() => setEditTarget(member)}
                className="flex items-center gap-3 py-3 border-b border-gray-300 last:border-b-0 cursor-pointer hover:bg-gray-100 -mx-5 px-5 transition-colors"
              >
                <div className={`w-9 h-9 rounded-full ${color.bg} flex items-center justify-center text-[13px] font-medium ${color.text} shrink-0`}>
                  {member.name[0]}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{member.name}</p>
                  <p className="text-[11px] text-gray-500">
                    {FAM_ROLE_LABELS[member.role] ?? member.role} · {member.phone || '—'}
                  </p>
                </div>
                <div className="flex gap-1.5 items-center">
                  <RateChip rate={member.worshipRate} type="worship" />
                  <RateChip rate={member.famRate} type="fam" />
                </div>
                <span className="text-gray-500 text-xs ml-1">→</span>
              </div>
            )
          })
        )}
      </div>

      <BottomNav />
    </div>
  )
}

export default function VillageManagePageConnected() {
  const navigate = useNavigate()
  const {
    user,
    accessToken,
    setAccessToken,
    logout,
    isVillageLeaderOrAbove,
    isPastorOrAbove,
  } = useAuth()

  const [search, setSearch] = useState('')
  const [activeTab, setActiveTab] = useState('village')
  const [expandedVillage, setExpandedVillage] = useState(null)
  const [selectedFam, setSelectedFam] = useState(null)
  const [moveSheet, setMoveSheet] = useState(null)

  const [villages, setVillages] = useState({})
  const [villageLeaders, setVillageLeaders] = useState({})
  const [famInfoMap, setFamInfoMap] = useState({})
  const [famMembersMap, setFamMembersMap] = useState({})
  const [teams, setTeams] = useState([])

  const [isLoadingVillageData, setIsLoadingVillageData] = useState(true)
  const [isLoadingTeams, setIsLoadingTeams] = useState(false)
  const [pageError, setPageError] = useState('')
  const [teamError, setTeamError] = useState('')
  const [reloadKey, setReloadKey] = useState(0)
  const [isMovingFam, setIsMovingFam] = useState(false)

  const accessibleVillageNames = useMemo(() => Object.keys(villages), [villages])
  const title = isPastorOrAbove ? '청년부 전체 관리' : `${user?.village || '마을'} 관리`

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
    if (!isVillageLeaderOrAbove) {
      setIsLoadingVillageData(false)
      setPageError('')
      return
    }

    let cancelled = false

    async function loadVillageData() {
      setIsLoadingVillageData(true)
      setPageError('')

      try {
        const [villageData, famData] = await Promise.all([
          callAuthedApi('/api/villages', '마을 정보를 불러오지 못했습니다.'),
          callAuthedApi('/api/fams', '팸 정보를 불러오지 못했습니다.'),
        ])

        const allVillages = (Array.isArray(villageData) ? villageData : [])
          .map(mapVillage)
          .sort((a, b) => a.name.localeCompare(b.name, 'ko'))
        const allFams = (Array.isArray(famData) ? famData : [])
          .map(mapFam)
          .sort((a, b) => a.name.localeCompare(b.name, 'ko'))

        const visibleVillages = isPastorOrAbove
          ? allVillages
          : allVillages.filter((village) => village.name === user?.village)
        const visibleVillageSet = new Set(visibleVillages.map((village) => village.name))
        const visibleFams = allFams.filter((fam) => visibleVillageSet.has(fam.villageName))

        const nextVillages = {}
        const nextVillageLeaders = {}
        const nextFamInfoMap = {}

        visibleVillages.forEach((village) => {
          nextVillages[village.name] = []
          nextVillageLeaders[village.name] = village.leaderName
        })

        visibleFams.forEach((fam) => {
          if (!nextVillages[fam.villageName]) {
            nextVillages[fam.villageName] = []
          }

          nextVillages[fam.villageName].push(fam.name)
          nextFamInfoMap[fam.name] = fam
        })

        Object.keys(nextVillages).forEach((villageName) => {
          nextVillages[villageName] = sortNames(nextVillages[villageName])
        })

        const memberEntries = await Promise.all(
          visibleFams.map(async (fam) => {
            const membersData = await callAuthedApi(
              `/api/fams/${encodeURIComponent(fam.name)}/members?period=1month`,
              `${fam.name} 팸원 정보를 불러오지 못했습니다.`,
            )

            return [
              fam.name,
              sortMembers((Array.isArray(membersData) ? membersData : []).map((item) => mapMember(item, fam.name))),
            ]
          }),
        )

        if (cancelled) return

        setVillages(nextVillages)
        setVillageLeaders(nextVillageLeaders)
        setFamInfoMap(nextFamInfoMap)
        setFamMembersMap(Object.fromEntries(memberEntries))
        setExpandedVillage((prev) => {
          if (prev && nextVillages[prev]) {
            return prev
          }

          if (!isPastorOrAbove && user?.village && nextVillages[user.village]) {
            return user.village
          }

          return sortNames(Object.keys(nextVillages))[0] ?? null
        })
      } catch (err) {
        if (cancelled) return

        setPageError(err instanceof Error ? err.message : '마을 정보를 불러오지 못했습니다.')
        setVillages({})
        setVillageLeaders({})
        setFamInfoMap({})
        setFamMembersMap({})
      } finally {
        if (!cancelled) {
          setIsLoadingVillageData(false)
        }
      }
    }

    void loadVillageData()

    return () => {
      cancelled = true
    }
  }, [accessToken, isPastorOrAbove, isVillageLeaderOrAbove, reloadKey, setAccessToken, user?.village])

  useEffect(() => {
    if (!isPastorOrAbove || activeTab !== 'team') {
      return
    }

    let cancelled = false

    async function loadTeams() {
      setIsLoadingTeams(true)
      setTeamError('')

      try {
        const data = await callAuthedApi('/api/teams', '사역팀 정보를 불러오지 못했습니다.')

        if (cancelled) return

        setTeams(
          (Array.isArray(data) ? data : [])
            .map(mapTeam)
            .sort((a, b) => a.teamName.localeCompare(b.teamName, 'ko')),
        )
      } catch (err) {
        if (cancelled) return

        setTeams([])
        setTeamError(err instanceof Error ? err.message : '사역팀 정보를 불러오지 못했습니다.')
      } finally {
        if (!cancelled) {
          setIsLoadingTeams(false)
        }
      }
    }

    void loadTeams()

    return () => {
      cancelled = true
    }
  }, [accessToken, activeTab, isPastorOrAbove, reloadKey, setAccessToken])

  const searchResults = useMemo(() => {
    const query = search.trim()
    if (!query) return null

    const normalizedQuery = query.toLowerCase()
    const results = []

    Object.entries(villages).forEach(([villageName, famNames]) => {
      famNames.forEach((famName) => {
        const famInfo = famInfoMap[famName]
        const members = famMembersMap[famName] ?? []
        const famFields = [famName, famInfo?.leaderName ?? '', villageName].map((value) => value.toLowerCase())

        if (famFields.some((value) => value.includes(normalizedQuery))) {
          results.push({
            type: 'fam',
            villageName,
            famName,
            leaderName: famInfo?.leaderName ?? '',
            memberCount: members.length,
          })
        }

        members.forEach((member) => {
          const memberFields = [
            member.name,
            member.phone,
            ROLE_LABELS[member.role] ?? member.role,
          ].map((value) => String(value ?? '').toLowerCase())

          if (memberFields.some((value) => value.includes(normalizedQuery))) {
            results.push({
              type: 'member',
              villageName,
              famName,
              member,
            })
          }
        })
      })
    })

    return results
  }, [famInfoMap, famMembersMap, search, villages])

  const handleDeleteFam = async (famName) => {
    const confirmed = window.confirm(`'${famName}' 팸을 삭제하시겠습니까?`)
    if (!confirmed) return

    setPageError('')

    try {
      await callAuthedApi(`/api/fams/${encodeURIComponent(famName)}`, '팸 삭제에 실패했습니다.', {
        method: 'DELETE',
      })
      setReloadKey((prev) => prev + 1)
    } catch (err) {
      setPageError(err instanceof Error ? err.message : '팸 삭제에 실패했습니다.')
    }
  }

  const handleDeleteVillage = async (villageName) => {
    const confirmed = window.confirm(`'${villageName}' 마을을 삭제하시겠습니까?`)
    if (!confirmed) return

    setPageError('')

    try {
      await callAuthedApi(`/api/villages/${encodeURIComponent(villageName)}`, '마을 삭제에 실패했습니다.', {
        method: 'DELETE',
      })
      setReloadKey((prev) => prev + 1)
    } catch (err) {
      setPageError(err instanceof Error ? err.message : '마을 삭제에 실패했습니다.')
    }
  }

  const handleMoveFam = async (targetVillage) => {
    if (!moveSheet) return

    setIsMovingFam(true)
    setPageError('')

    try {
      await callAuthedApi(`/api/fams/${encodeURIComponent(moveSheet.fam)}/village`, '팸 이동에 실패했습니다.', {
        method: 'PATCH',
        body: {
          toVillage: targetVillage,
        },
      })

      setMoveSheet(null)
      setReloadKey((prev) => prev + 1)
    } catch (err) {
      setPageError(err instanceof Error ? err.message : '팸 이동에 실패했습니다.')
    } finally {
      setIsMovingFam(false)
    }
  }

  if (!isVillageLeaderOrAbove) {
    return (
      <div className="flex flex-col items-center justify-center h-screen pb-20">
        <p className="text-gray-500 text-sm">마을 관리 권한이 없습니다.</p>
        <button
          onClick={() => navigate('/my')}
          className="mt-3 text-xs text-primary bg-primary-light px-4 py-2 rounded-full border-none cursor-pointer"
        >
          돌아가기
        </button>
        <BottomNav />
      </div>
    )
  }

  if (selectedFam) {
    return (
      <FamDetailViewConnected
        fam={selectedFam.fam}
        village={selectedFam.village}
        leaderName={selectedFam.leaderName}
        canChangeRole={isVillageLeaderOrAbove}
        callAuthedApi={callAuthedApi}
        onBack={() => setSelectedFam(null)}
        onChanged={async () => {
          setReloadKey((prev) => prev + 1)
        }}
      />
    )
  }

  return (
    <div className="pb-20">
      <div className="flex items-center gap-3 px-5 pt-4 pb-3 border-b border-gray-300">
        <button onClick={() => navigate('/my')} className="text-lg bg-transparent border-none cursor-pointer">
          ←
        </button>
        <p className="text-base font-medium flex-1">{title}</p>
      </div>

      {isPastorOrAbove && (
        <div className="flex border-b border-gray-300">
          {[
            ['village', '마을·팸 관리'],
            ['team', '사역팀 관리'],
          ].map(([key, label]) => (
            <button
              key={key}
              onClick={() => {
                setActiveTab(key)
                setSearch('')
              }}
              className={`flex-1 py-2.5 text-sm border-none cursor-pointer bg-transparent transition-colors ${
                activeTab === key ? 'text-primary font-medium border-b-2 border-primary' : 'text-gray-500'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      )}

      {(!isPastorOrAbove || activeTab === 'village') && (
        <>
          <div className="px-5 pt-3 pb-2">
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="팸 이름, 리더 이름, 팸원 이름, 전화번호 검색"
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-primary"
            />
          </div>

          {pageError && (
            <div className="px-5 pb-2">
              <div className="bg-danger-light rounded-xl px-4 py-3">
                <p className="text-sm text-danger">{pageError}</p>
                <button
                  onClick={() => setReloadKey((prev) => prev + 1)}
                  className="mt-2 text-xs text-danger bg-white px-3 py-1.5 rounded-full border border-danger-light cursor-pointer"
                >
                  다시 시도
                </button>
              </div>
            </div>
          )}

          {isLoadingVillageData ? (
            <div className="px-5 py-10">
              <p className="text-sm text-gray-500 text-center">마을 정보를 불러오는 중입니다.</p>
            </div>
          ) : searchResults !== null ? (
            <div className="px-5 pb-3">
              <p className="text-xs text-gray-500 mb-2">검색 결과 {searchResults.length}건</p>
              {searchResults.length === 0 && (
                <p className="text-sm text-gray-500 text-center mt-8">검색 결과가 없습니다.</p>
              )}
              {searchResults.map((result, index) => {
                if (result.type === 'fam') {
                  return (
                    <div key={`fam_${result.famName}_${index}`} className="flex items-center gap-3 py-3 border-b border-gray-300 last:border-b-0">
                      <div className="w-9 h-9 rounded-full bg-success-light flex items-center justify-center text-[13px] font-medium text-success shrink-0">
                        {result.famName[0]}
                      </div>
                      <div
                        className="flex-1 cursor-pointer"
                        onClick={() => setSelectedFam({
                          fam: result.famName,
                          village: result.villageName,
                          leaderName: result.leaderName,
                        })}
                      >
                        <p className="text-sm font-medium">{result.famName}</p>
                        <p className="text-[11px] text-gray-500">
                          {result.villageName} · 리더: {result.leaderName || '미정'} · {result.memberCount}명
                        </p>
                      </div>
                      {isPastorOrAbove && (
                        <div className="flex gap-1.5 shrink-0">
                          <button
                            onClick={() => setMoveSheet({ fam: result.famName, village: result.villageName })}
                            className="text-xs text-primary bg-primary-light px-2 py-1 rounded-lg border-none cursor-pointer"
                          >
                            이동
                          </button>
                          <button
                            onClick={() => void handleDeleteFam(result.famName)}
                            className="text-xs text-danger bg-danger-light px-2 py-1 rounded-lg border-none cursor-pointer"
                          >
                            삭제
                          </button>
                        </div>
                      )}
                    </div>
                  )
                }

                const color = getAvatarColor(result.member.id)

                return (
                  <div key={`member_${result.member.id}_${index}`} className="flex items-center gap-3 py-3 border-b border-gray-300 last:border-b-0">
                    <div className={`w-9 h-9 rounded-full ${color.bg} flex items-center justify-center text-[13px] font-medium ${color.text} shrink-0`}>
                      {result.member.name[0]}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{result.member.name}</p>
                      <p className="text-[11px] text-gray-500">
                        {result.villageName} · {result.famName} · {ROLE_LABELS[result.member.role] ?? result.member.role}
                      </p>
                      {result.member.phone && <p className="text-[11px] text-gray-500">{result.member.phone}</p>}
                    </div>
                    <button
                      onClick={() => setSelectedFam({
                        fam: result.famName,
                        village: result.villageName,
                        leaderName: famInfoMap[result.famName]?.leaderName ?? '',
                      })}
                      className="text-xs text-primary bg-primary-light px-2.5 py-1.5 rounded-lg border-none cursor-pointer shrink-0"
                    >
                      상세 →
                    </button>
                  </div>
                )
              })}
            </div>
          ) : accessibleVillageNames.length === 0 ? (
            <div className="px-5 py-10">
              <p className="text-sm text-gray-500 text-center">표시할 마을이 없습니다.</p>
            </div>
          ) : (
            <div className="px-5 pt-2">
              {accessibleVillageNames.map((villageName) => {
                const famNames = villages[villageName] ?? []

                return (
                  <div key={villageName} className="mb-3">
                    <div className="flex items-center gap-2 mb-2">
                      <button
                        onClick={() => setExpandedVillage(expandedVillage === villageName ? null : villageName)}
                        className="flex-1 flex items-center justify-between py-2.5 px-3 bg-success-light rounded-xl border-none cursor-pointer"
                      >
                        <div>
                          <span className="text-sm font-medium text-success">{villageName}</span>
                          {villageLeaders[villageName] && (
                            <span className="text-[11px] text-success ml-2 opacity-70">마을장 {villageLeaders[villageName]}</span>
                          )}
                        </div>
                        <span className="text-xs text-success shrink-0">
                          {famNames.length}개 팸 {expandedVillage === villageName ? '▲' : '▼'}
                        </span>
                      </button>
                      {isPastorOrAbove && (
                        <button
                          onClick={() => void handleDeleteVillage(villageName)}
                          className="text-xs text-danger bg-danger-light px-2 py-1.5 rounded-lg border-none cursor-pointer shrink-0"
                        >
                          삭제
                        </button>
                      )}
                    </div>

                    {expandedVillage === villageName && (
                      <div className="border border-gray-300 rounded-xl overflow-hidden">
                        {famNames.length === 0 ? (
                          <p className="text-xs text-gray-500 text-center py-4">등록된 팸이 없습니다.</p>
                        ) : (
                          famNames.map((famName, index) => {
                            const famInfo = famInfoMap[famName]
                            const members = famMembersMap[famName] ?? []

                            return (
                              <div key={famName} className={`flex items-center px-4 py-3 ${index < famNames.length - 1 ? 'border-b border-gray-300' : ''}`}>
                                <div
                                  className="flex-1 cursor-pointer"
                                  onClick={() => setSelectedFam({
                                    fam: famName,
                                    village: villageName,
                                    leaderName: famInfo?.leaderName ?? '',
                                  })}
                                >
                                  <p className="text-sm font-medium">{famName}</p>
                                  <p className="text-[11px] text-gray-500 mt-0.5">
                                    리더: {famInfo?.leaderName || '미정'} · {members.length}명
                                  </p>
                                </div>
                                {isPastorOrAbove && (
                                  <div className="flex gap-1.5 items-center">
                                    <button
                                      onClick={() => setMoveSheet({ fam: famName, village: villageName })}
                                      className="text-xs text-primary bg-primary-light px-2 py-1 rounded-lg border-none cursor-pointer"
                                    >
                                      이동
                                    </button>
                                    <button
                                      onClick={() => void handleDeleteFam(famName)}
                                      className="text-xs text-danger bg-danger-light px-2 py-1 rounded-lg border-none cursor-pointer"
                                    >
                                      삭제
                                    </button>
                                  </div>
                                )}
                              </div>
                            )
                          })
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </>
      )}

      {isPastorOrAbove && activeTab === 'team' && (
        <div className="px-5 pt-3">
          {teamError && (
            <div className="bg-danger-light rounded-xl px-4 py-3 mb-3">
              <p className="text-sm text-danger">{teamError}</p>
              <button
                onClick={() => setReloadKey((prev) => prev + 1)}
                className="mt-2 text-xs text-danger bg-white px-3 py-1.5 rounded-full border border-danger-light cursor-pointer"
              >
                다시 시도
              </button>
            </div>
          )}

          {isLoadingTeams ? (
            <p className="text-sm text-gray-500 text-center py-10">사역팀 정보를 불러오는 중입니다.</p>
          ) : teams.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-10">등록된 사역팀이 없습니다.</p>
          ) : (
            <div className="border border-gray-300 rounded-xl overflow-hidden">
              {teams.map((team, index) => (
                <div
                  key={team.teamName}
                  className={`flex items-center justify-between px-4 py-3.5 ${index < teams.length - 1 ? 'border-b border-gray-300' : ''}`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-warning-light flex items-center justify-center text-xs font-medium text-warning shrink-0">
                      {team.teamName[0]}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{team.teamName}</p>
                      <p className="text-[11px] text-gray-500 truncate">
                        {team.intro?.trim() ? team.intro : '팀 소개가 아직 없습니다.'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 ml-3">
                    <span className="text-[11px] text-gray-500">{team.memberCount}명</span>
                    <button
                      onClick={() => navigate('/team/manage', { state: { team: team.teamName } })}
                      className="text-xs text-primary bg-primary-light px-3 py-1.5 rounded-full border-none cursor-pointer"
                    >
                      팀 관리
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <BottomNav />

      {moveSheet && (
        <FamMoveSheet
          fam={moveSheet.fam}
          currentVillage={moveSheet.village}
          villageNames={accessibleVillageNames}
          onClose={() => setMoveSheet(null)}
          onSave={handleMoveFam}
          isSubmitting={isMovingFam}
        />
      )}
    </div>
  )
}
