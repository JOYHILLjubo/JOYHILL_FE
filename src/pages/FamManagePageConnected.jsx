import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import BottomNav from '../components/BottomNav'
import DateSelect from '../components/DateSelect'

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/$/, '')

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

function getAvatarColor(seed) {
  const index = typeof seed === 'number' ? seed : (seed?.charCodeAt?.(0) ?? 0)
  return avatarColors[Math.abs(index) % avatarColors.length]
}

function buildApiUrl(path) {
  return `${API_BASE_URL}${path}`
}

function normalizeDateInput(value) {
  if (!value) return ''

  // 배열 형태 [year, month, day]
  if (Array.isArray(value) && value.length >= 3) {
    const [year, month, day] = value
    return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
  }

  const str = String(value).trim()

  // YYMMDD 6자리 형태 (DB 저장 형식) → YYYY-MM-DD
  if (/^\d{6}$/.test(str)) {
    const yy = parseInt(str.substring(0, 2), 10)
    const mm = str.substring(2, 4)
    const dd = str.substring(4, 6)
    // 00~30 → 2000s, 31~99 → 1900s
    const fullYear = yy <= 30 ? 2000 + yy : 1900 + yy
    return `${fullYear}-${mm}-${dd}`
  }

  // 이미 YYYY-MM-DD 형태
  return str.slice(0, 10)
}

function nullIfBlank(value) {
  const trimmed = String(value ?? '').trim()
  return trimmed === '' ? null : trimmed
}

function mapMember(item, currentFam) {
  return {
    id: item.id,
    name: item.name ?? '',
    phone: item.phone ?? '',
    birth: normalizeDateInput(item.birth),
    role: item.role ?? 'member',
    fam: item.famName ?? currentFam ?? '',
    note: item.note ?? '',
    worshipRate: Number(item.worshipRate ?? 0),
    famRate: Number(item.famRate ?? 0),
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
    return '권한이 없습니다.'
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

function MemberEditViewConnected({
  member,
  currentFam,
  isNew = false,
  famOptions,
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

    if (!isNew && form.fam !== currentFam) {
      setError('기존 팸원의 팸 이동은 아직 지원되지 않습니다.')
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
          <DateSelect
            value={form.birth}
            onChange={(val) => setForm((prev) => ({ ...prev, birth: val }))}
            disabled={isSubmitting}
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
          <p className="text-xs text-gray-500 mb-1.5">소속 팸 <span className="text-danger">*</span></p>
          <select
            value={form.fam}
            onChange={(e) => setForm((prev) => ({ ...prev, fam: e.target.value }))}
            disabled={isSubmitting || !isNew}
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-primary bg-white disabled:bg-gray-100"
          >
            <option value="">선택</option>
            {famOptions.map((fam) => (
              <option key={fam} value={fam}>
                {fam}
              </option>
            ))}
          </select>
          {!isNew && (
            <p className="text-[11px] text-gray-500 mt-2">기존 팸원의 팸 이동은 아직 지원되지 않습니다.</p>
          )}
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

export default function FamManagePageConnected() {
  const navigate = useNavigate()
  const {
    user,
    accessToken,
    setAccessToken,
    logout,
    isVillageLeaderOrAbove,
  } = useAuth()

  const [editTarget, setEditTarget] = useState(null)
  const [members, setMembers] = useState([])
  const [famOptions, setFamOptions] = useState([])
  const [famLeaderName, setFamLeaderName] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [pageError, setPageError] = useState('')

  const myFam = user?.fam ?? ''
  const myVillage = user?.village ?? ''

  const handleExpiredSession = () => {
    logout()
    navigate('/login', { replace: true })
  }

  const callAuthedApi = async (path, options = {}) => {
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
        throw new Error(getApiErrorMessage(result, '요청을 처리하지 못했습니다.'))
      }

      return result.payload.data
    } catch (err) {
      if (err instanceof Error && err.message.includes('다시 로그인')) {
        handleExpiredSession()
      }

      throw err
    }
  }

  const loadData = async () => {
    if (!myFam || !myVillage) {
      setPageError('소속 팸 정보가 없어 팸 관리 페이지를 불러올 수 없습니다.')
      setMembers([])
      setFamOptions([])
      setFamLeaderName('')
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setPageError('')

    try {
      const [membersData, famsData] = await Promise.all([
        callAuthedApi(`/api/fams/${encodeURIComponent(myFam)}/members?period=1month`),
        callAuthedApi('/api/fams'),
      ])

      setMembers(Array.isArray(membersData) ? membersData.map((item) => mapMember(item, myFam)) : [])

      const villageFams = Array.isArray(famsData)
        ? famsData.filter((fam) => fam?.villageName === myVillage)
        : []
      const availableFams = isVillageLeaderOrAbove
        ? villageFams.map((fam) => fam.name).filter(Boolean)
        : [myFam]

      setFamOptions(availableFams)
      setFamLeaderName(villageFams.find((fam) => fam.name === myFam)?.leaderName ?? '')
    } catch (err) {
      setPageError(err instanceof Error ? err.message : '팸원 정보를 불러오지 못했습니다.')
      setMembers([])
      setFamOptions([])
      setFamLeaderName('')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    void loadData()
  }, [myFam, myVillage, isVillageLeaderOrAbove])

  if (editTarget !== null) {
    const isNew = editTarget === 'add'
    const member = isNew ? null : editTarget

    return (
      <MemberEditViewConnected
        member={member}
        currentFam={myFam}
        isNew={isNew}
        famOptions={famOptions}
        canChangeRole={isVillageLeaderOrAbove}
        onBack={() => setEditTarget(null)}
        onSave={async (form) => {
          if (isNew) {
            await callAuthedApi(`/api/fams/${encodeURIComponent(form.fam)}/members`, {
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
            await callAuthedApi(`/api/fam-members/${member.id}`, {
              method: 'PUT',
              body: {
                name: form.name,
                phone: nullIfBlank(form.phone),
                birth: nullIfBlank(form.birth),
                note: nullIfBlank(form.note),
              },
            })

            if (isVillageLeaderOrAbove && form.role !== member.role) {
              await callAuthedApi(`/api/fam-members/${member.id}/role`, {
                method: 'PATCH',
                body: { role: form.role },
              })
            }
          }

          await loadData()
          setEditTarget(null)
        }}
        onDelete={
          !isNew
            ? async () => {
                await callAuthedApi(`/api/fam-members/${member.id}`, {
                  method: 'DELETE',
                })

                await loadData()
                setEditTarget(null)
              }
            : null
        }
      />
    )
  }

  return (
    <div className="pb-20">
      <div className="flex items-center gap-3 px-5 pt-4 pb-3 border-b border-gray-300">
        <button
          onClick={() => navigate('/my')}
          className="text-lg bg-transparent border-none cursor-pointer"
        >
          ←
        </button>
        <p className="text-base font-medium flex-1">내 팸 관리</p>
        <button
          onClick={() => setEditTarget('add')}
          disabled={isLoading || !myFam}
          className="text-xs text-white bg-primary px-3 py-1.5 rounded-full border-none cursor-pointer disabled:opacity-60"
        >
          + 추가
        </button>
      </div>

      <div className="px-5 pt-2 pb-1">
        <p className="text-xs text-gray-500">
          {myFam || '소속 팸 없음'} · {myVillage || '소속 마을 없음'} · 리더: {famLeaderName || '—'} · 총 {members.length}명
        </p>
      </div>

      {pageError && (
        <div className="px-5 pb-2">
          <div className="border border-danger-light bg-danger-light rounded-xl px-4 py-3">
            <p className="text-xs text-danger">{pageError}</p>
            <button
              onClick={() => void loadData()}
              className="mt-2 text-xs text-danger bg-white px-3 py-1.5 rounded-full border border-danger-light cursor-pointer"
            >
              다시 시도
            </button>
          </div>
        </div>
      )}

      <div className="px-5">
        {isLoading ? (
          <div className="text-center mt-10">
            <p className="text-sm text-gray-500">팸원 정보를 불러오는 중입니다.</p>
          </div>
        ) : members.length === 0 ? (
          <div className="text-center mt-10">
            <p className="text-sm text-gray-500">팸원이 없습니다.</p>
            <button
              onClick={() => setEditTarget('add')}
              className="mt-3 text-xs text-primary bg-primary-light px-4 py-2 rounded-full border-none cursor-pointer"
            >
              + 팸원 추가하기
            </button>
          </div>
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
                  <p className="text-[11px] text-gray-500">{member.phone || '—'}</p>
                </div>
                <span
                  className={`text-[11px] px-2 py-0.5 rounded-full shrink-0 ${
                    member.role === 'leader' || member.role === 'village_leader'
                      ? 'bg-primary-light text-primary'
                      : 'bg-gray-100 text-gray-500'
                  }`}
                >
                  {FAM_ROLE_LABELS[member.role] ?? member.role}
                </span>
                <span className="text-gray-500 text-xs">→</span>
              </div>
            )
          })
        )}
      </div>

      <BottomNav />
    </div>
  )
}
