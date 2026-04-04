import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/$/, '')

const FAM_ROLE_LABELS = {
  admin: '관리자', pastor: '교역자', village_leader: '마을장', leader: '리더', member: '팸원',
}

const avatarColors = [
  { bg: 'bg-success-light', text: 'text-success' },
  { bg: 'bg-primary-light', text: 'text-primary' },
  { bg: 'bg-warning-light', text: 'text-warning' },
  { bg: 'bg-danger-light', text: 'text-danger' },
]

function getAvatarColor(id) {
  return avatarColors[Math.abs(Number(id) || 0) % avatarColors.length]
}

function buildApiUrl(path) { return `${API_BASE_URL}${path}` }

function formatLocalDateKey(date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function getThisSundayKey() {
  const today = new Date()
  const sunday = new Date(today)
  sunday.setDate(today.getDate() - today.getDay())
  return formatLocalDateKey(sunday)
}

function formatSundayKey(key) {
  const [, month, day] = key.split('-')
  return `${parseInt(month, 10)}/${parseInt(day, 10)}`
}

function getSundayLabel(key) {
  const [year, month, day] = key.split('-').map(Number)
  const date = new Date(year, month - 1, day)
  const firstSunday = new Date(year, month - 1, 1)
  while (firstSunday.getDay() !== 0) firstSunday.setDate(firstSunday.getDate() + 1)
  const week = Math.floor((date - firstSunday) / (7 * 24 * 60 * 60 * 1000)) + 1
  return `${month}월 ${week}주차`
}

function mapMembers(items) {
  return items.map((item) => ({
    id: item.id,
    name: item.name ?? '',
    role: item.role ?? 'member',
  }))
}

function buildAttendanceMap(records) {
  const next = {}
  records.forEach((record) => {
    const id = record.userId ?? record.famMemberId
    if (!id) return
    next[id] = {
      worship: record.worshipPresent === true,
      fam: record.famPresent === true,
    }
  })
  return next
}

async function requestApi(path, { method = 'GET', headers = {}, body } = {}) {
  const requestOptions = { method, headers: { ...headers }, credentials: 'include' }
  if (body !== undefined) {
    requestOptions.body = JSON.stringify(body)
    requestOptions.headers['Content-Type'] = 'application/json'
  }
  let response
  try { response = await fetch(buildApiUrl(path), requestOptions) }
  catch { throw new Error('백엔드 서버에 연결할 수 없습니다.') }
  const payload = await response.json().catch(() => null)
  return { response, payload }
}

function getApiErrorMessage(result, fallbackMessage) {
  if (result.response.status === 401) return '세션이 만료되었습니다. 다시 로그인해주세요.'
  if (result.response.status === 403) return '권한이 없습니다.'
  return result.payload?.error?.message ?? fallbackMessage
}

async function requestTokenRefresh() {
  const result = await requestApi('/api/auth/refresh', { method: 'POST' })
  if (!result.response.ok || !result.payload?.success || !result.payload?.data?.accessToken) {
    throw new Error(getApiErrorMessage(result, '세션이 만료되었습니다. 다시 로그인해주세요.'))
  }
  return result.payload.data.accessToken
}

export default function AttendancePage() {
  const navigate = useNavigate()
  const { user, accessToken, setAccessToken, logout } = useAuth()

  const sundayKey = useMemo(() => getThisSundayKey(), [])
  const [members, setMembers] = useState([])
  const [attendanceMap, setAttendanceMap] = useState({})
  const [saved, setSaved] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [pageError, setPageError] = useState('')
  const [saveError, setSaveError] = useState('')

  const famName = user?.fam ?? ''
  const currentYear = new Date().getFullYear()

  const handleExpiredSession = () => { logout(); navigate('/login', { replace: true }) }

  const callAuthedApi = async (path, options = {}) => {
    try {
      let token = accessToken
      if (!token) { token = await requestTokenRefresh(); setAccessToken(token) }
      let result = await requestApi(path, { ...options, headers: { ...(options.headers ?? {}), Authorization: `Bearer ${token}` } })
      if (result.response.status === 401) {
        token = await requestTokenRefresh(); setAccessToken(token)
        result = await requestApi(path, { ...options, headers: { ...(options.headers ?? {}), Authorization: `Bearer ${token}` } })
      }
      if (!result.response.ok || !result.payload?.success) {
        throw new Error(getApiErrorMessage(result, '요청을 처리하지 못했습니다.'))
      }
      return result.payload.data
    } catch (err) {
      if (err instanceof Error && err.message.includes('다시 로그인')) handleExpiredSession()
      throw err
    }
  }

  const loadData = async () => {
    if (!famName) {
      setPageError('소속 팸 정보가 없어 출석을 불러올 수 없습니다.')
      setMembers([]); setAttendanceMap({}); setIsLoading(false); return
    }
    setIsLoading(true); setPageError(''); setSaveError(''); setSaved(false)
    try {
      const params = new URLSearchParams({ famName, date: sundayKey })
      const [membersData, attendanceData] = await Promise.all([
        // 출석률 분모: 올해 첫째주~오늘 기준 (year 파라미터)
        callAuthedApi(`/api/fams/${encodeURIComponent(famName)}/members?year=${currentYear}`),
        callAuthedApi(`/api/attendance?${params.toString()}`),
      ])
      setMembers(Array.isArray(membersData) ? mapMembers(membersData) : [])
      setAttendanceMap(Array.isArray(attendanceData) ? buildAttendanceMap(attendanceData) : {})
    } catch (err) {
      setPageError(err instanceof Error ? err.message : '출석 정보를 불러오지 못했습니다.')
      setMembers([]); setAttendanceMap({})
    } finally { setIsLoading(false) }
  }

  useEffect(() => { void loadData() }, [famName, sundayKey])

  useEffect(() => {
    if (!saved) return undefined
    const id = window.setTimeout(() => setSaved(false), 2000)
    return () => window.clearTimeout(id)
  }, [saved])

  const getChecked = (memberId, type) => attendanceMap[memberId]?.[type] ?? null

  const toggleCheck = (memberId, type) => {
    setSaved(false); setSaveError('')
    setAttendanceMap((prev) => ({
      ...prev,
      [memberId]: { ...prev[memberId], [type]: prev[memberId]?.[type] === true ? null : true },
    }))
  }

  const worshipCount = members.filter((m) => getChecked(m.id, 'worship') === true).length
  const famCount = members.filter((m) => getChecked(m.id, 'fam') === true).length

  const handleSave = async () => {
    if (!famName) { setSaveError('소속 팸 정보가 없어 저장할 수 없습니다.'); return }
    if (members.length === 0) { setSaveError('저장할 팸원이 없습니다.'); return }
    setIsSaving(true); setSaveError(''); setSaved(false)
    try {
      await callAuthedApi('/api/attendance', {
        method: 'POST',
        body: {
          famName,
          date: sundayKey,
          records: members.map((member) => ({
            userId: member.id,
            worshipPresent: getChecked(member.id, 'worship') === true,
            famPresent: getChecked(member.id, 'fam') === true,
          })),
        },
      })
      setSaved(true)
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : '출석 저장에 실패했습니다.')
    } finally { setIsSaving(false) }
  }

  return (
    <div className="pb-24">
      <div className="flex items-center gap-3 px-5 pt-4 pb-2">
        <button onClick={() => navigate('/home')} className="text-lg bg-transparent border-none cursor-pointer">←</button>
        <div>
          <p className="text-base font-medium">출석 체크</p>
          <p className="text-xs text-gray-500 mt-0.5">
            {famName || '소속 팸 없음'} · {getSundayLabel(sundayKey)} ({formatSundayKey(sundayKey)})
          </p>
        </div>
      </div>

      {pageError && (
        <div className="px-5 pb-2">
          <div className="border border-danger-light bg-danger-light rounded-xl px-4 py-3">
            <p className="text-xs text-danger">{pageError}</p>
            <button onClick={() => void loadData()} className="mt-2 text-xs text-danger bg-white px-3 py-1.5 rounded-full border border-danger-light cursor-pointer">다시 시도</button>
          </div>
        </div>
      )}

      <div className="flex gap-2 px-5 py-2 border-b border-gray-300">
        <span className="text-xs bg-primary-light text-primary px-2.5 py-1 rounded-full">전체 {members.length}</span>
        <span className="text-xs text-gray-500 px-2.5 py-1 rounded-full bg-gray-100">예배 {worshipCount}</span>
        <span className="text-xs text-gray-500 px-2.5 py-1 rounded-full bg-gray-100">팸모임 {famCount}</span>
      </div>

      <div className="flex px-5 py-2 border-b border-gray-300">
        <div className="flex-1" />
        <div className="w-[52px] text-center"><span className="text-[11px] font-medium text-primary">예배</span></div>
        <div className="w-[52px] text-center"><span className="text-[11px] font-medium text-warning">팸모임</span></div>
      </div>

      <div className="px-5">
        {isLoading ? (
          <p className="text-sm text-gray-500 text-center py-10">출석 정보를 불러오는 중입니다.</p>
        ) : members.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-10">등록된 팸원이 없습니다.</p>
        ) : (
          members.map((member) => {
            const color = getAvatarColor(member.id)
            const worshipChecked = getChecked(member.id, 'worship') === true
            const famChecked = getChecked(member.id, 'fam') === true
            return (
              <div key={member.id} className="flex items-center py-3 border-b border-gray-300 last:border-b-0">
                <div className="flex-1 flex items-center gap-2.5">
                  <div className={`w-9 h-9 rounded-full ${color.bg} flex items-center justify-center text-[13px] font-medium ${color.text}`}>{member.name[0]}</div>
                  <div>
                    <p className="text-sm">{member.name}</p>
                    <p className="text-[11px] text-gray-500">{FAM_ROLE_LABELS[member.role] ?? member.role}</p>
                  </div>
                </div>
                <div className="w-[52px] flex justify-center">
                  <button onClick={() => toggleCheck(member.id, 'worship')}
                    className={`w-[26px] h-[26px] rounded-full flex items-center justify-center text-xs border-none cursor-pointer transition-all ${worshipChecked ? 'bg-primary-light text-primary' : 'bg-transparent text-transparent'}`}
                    style={!worshipChecked ? { border: '1.5px solid #CCCCCC' } : {}}>✓</button>
                </div>
                <div className="w-[52px] flex justify-center">
                  <button onClick={() => toggleCheck(member.id, 'fam')}
                    className={`w-[26px] h-[26px] rounded-full flex items-center justify-center text-xs border-none cursor-pointer transition-all ${famChecked ? 'bg-warning-light text-warning' : 'bg-transparent text-transparent'}`}
                    style={!famChecked ? { border: '1.5px solid #CCCCCC' } : {}}>✓</button>
                </div>
              </div>
            )
          })
        )}
      </div>

      <div className="flex gap-3 justify-center py-3 border-t border-gray-300">
        <div className="flex items-center gap-1"><div className="w-2.5 h-2.5 rounded-full bg-primary-light" /><span className="text-[11px] text-gray-500">예배 출석</span></div>
        <div className="flex items-center gap-1"><div className="w-2.5 h-2.5 rounded-full bg-warning-light" /><span className="text-[11px] text-gray-500">팸모임 출석</span></div>
        <div className="flex items-center gap-1"><div className="w-2.5 h-2.5 rounded-full border border-gray-300" /><span className="text-[11px] text-gray-500">결석</span></div>
      </div>

      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] px-5 py-3 bg-white border-t border-gray-300">
        {saveError && <p className="text-xs text-danger mb-2">{saveError}</p>}
        <button onClick={handleSave} disabled={isLoading || isSaving || members.length === 0}
          className={`w-full py-3 rounded-lg text-sm font-medium border-none transition-colors ${saved ? 'bg-success text-white' : 'bg-primary text-white hover:bg-primary-hover'} ${isLoading || isSaving || members.length === 0 ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}>
          {isSaving ? '저장 중...' : saved ? '✓ 저장되었습니다' : '출석 저장하기'}
        </button>
      </div>
    </div>
  )
}
