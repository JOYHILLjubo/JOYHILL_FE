import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import BottomNav from '../components/BottomNav'

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

// 저장된 내용과 지금 화면 상태가 다른지 비교하기 위한 서명값.
// (멤버 순서/체크 3종을 그대로 문자열로 직렬화 — 객체 비교보다 단순하고 오탐이 없다)
function buildAttendanceSignature(members, map) {
  return members
    .map((m) => {
      const rec = map[m.id] ?? {}
      return `${m.id}:${rec.worship === true ? 1 : 0}${rec.online === true ? 1 : 0}${rec.fam === true ? 1 : 0}`
    })
    .join('|')
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
      online: record.onlinePresent === true,
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
  let storedRefreshToken = ''
  try {
    const raw = window.localStorage.getItem('joyhill.auth')
    storedRefreshToken = raw ? (JSON.parse(raw)?.refreshToken ?? '') : ''
  } catch { /* ignore */ }

  const result = await requestApi('/api/auth/refresh', {
    method: 'POST',
    headers: storedRefreshToken ? { 'X-Refresh-Token': storedRefreshToken } : {},
  })
  if (!result.response.ok || !result.payload?.success || !result.payload?.data?.accessToken) {
    throw new Error(getApiErrorMessage(result, '세션이 만료되었습니다. 다시 로그인해주세요.'))
  }

  const newRefreshToken = result.payload.data.refreshToken
  if (newRefreshToken) {
    try {
      const raw = window.localStorage.getItem('joyhill.auth')
      const parsed = raw ? JSON.parse(raw) : {}
      window.localStorage.setItem('joyhill.auth', JSON.stringify({ ...parsed, refreshToken: newRefreshToken }))
    } catch { /* ignore */ }
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
  // 마지막으로 서버에 저장된(=불러온) 상태의 서명. 지금 상태와 다르면 "저장 안 된 변경"이 있는 것.
  const [savedSignature, setSavedSignature] = useState('')

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
      const loadedMembers = Array.isArray(membersData) ? mapMembers(membersData) : []
      const loadedMap = Array.isArray(attendanceData) ? buildAttendanceMap(attendanceData) : {}
      setMembers(loadedMembers)
      setAttendanceMap(loadedMap)
      setSavedSignature(buildAttendanceSignature(loadedMembers, loadedMap))
    } catch (err) {
      setPageError(err instanceof Error ? err.message : '출석 정보를 불러오지 못했습니다.')
      setMembers([]); setAttendanceMap({}); setSavedSignature('')
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

  // 저장 안 된 변경이 있는지 / 몇 명이 바뀌었는지
  const currentSignature = buildAttendanceSignature(members, attendanceMap)
  const isDirty = members.length > 0 && currentSignature !== savedSignature
  const changedCount = (() => {
    if (!isDirty) return 0
    const savedParts = savedSignature.split('|')
    return currentSignature.split('|').filter((part, i) => part !== savedParts[i]).length
  })()
  // 저장 알약은 "저장할 게 있을 때 / 저장 중 / 방금 저장됨 / 에러"일 때만 떠오른다
  const showSaveBar = isDirty || isSaving || saved || Boolean(saveError)

  const worshipCount = members.filter((m) => getChecked(m.id, 'worship') === true).length
  const onlineCount = members.filter((m) => getChecked(m.id, 'online') === true).length
  const famCount = members.filter((m) => getChecked(m.id, 'fam') === true).length

  const handleSave = async () => {
    if (!famName) { setSaveError('소속 팸 정보가 없어 저장할 수 없습니다.'); return }
    if (members.length === 0) { setSaveError('저장할 팸원이 없습니다.'); return }
    setIsSaving(true); setSaveError(''); setSaved(false)
    // 저장 요청을 만든 시점의 상태를 서명으로 박아둔다 — 저장 중에 체크를 더 건드리면
    // 그건 "아직 저장 안 된 변경"으로 남아야 하므로, 완료 후 현재 상태로 서명하면 안 된다.
    const sentSignature = buildAttendanceSignature(members, attendanceMap)
    try {
      await callAuthedApi('/api/attendance', {
        method: 'POST',
        body: {
          famName,
          date: sundayKey,
          records: members.map((member) => ({
            userId: member.id,
            worshipPresent: getChecked(member.id, 'worship') === true,
            onlinePresent: getChecked(member.id, 'online') === true,
            famPresent: getChecked(member.id, 'fam') === true,
          })),
        },
      })
      setSaved(true)
      setSavedSignature(sentSignature)
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : '출석 저장에 실패했습니다.')
    } finally { setIsSaving(false) }
  }

  return (
    <div
      style={{
        // 하단에 떠 있는 것들만큼 정확히 비워둬서, 팸원이 많아 스크롤이 생겨도 마지막 사람이
        // 저장 버튼/네비게이션바에 가려지지 않게 한다.
        //   네비게이션바: 아래 6 + 높이 71 = 77
        //   저장 알약   : 아래 85 + 높이 52 = 137  (에러 문구가 뜨면 +46)
        // 여기에 여유 20px을 더한 값이다.
        paddingBottom: `calc(${showSaveBar ? (saveError ? 203 : 157) : 97}px + env(safe-area-inset-bottom, 0px))`,
        transition: 'padding-bottom 0.2s ease',
      }}
    >
      <div className="flex items-center gap-3 px-5 pt-4 pb-2">
        <button onClick={() => navigate('/home')} className="text-lg bg-transparent border-none cursor-pointer">←</button>
        <div>
          <p className="text-base font-semibold">출석 체크</p>
          <p className="text-xs text-gray-500 mt-0.5">
            {famName || '소속 팸 없음'} · {getSundayLabel(sundayKey)} ({formatSundayKey(sundayKey)})
          </p>
        </div>
      </div>

      {pageError && (
        <div className="px-5 pb-2">
          <div className="border border-danger-light bg-danger-light rounded-xl px-4 py-3">
            <p className="text-xs text-danger">{pageError}</p>
            <button onClick={() => void loadData()} className="mt-2 text-xs text-danger bg-surface px-3 py-1.5 rounded-full border border-danger-light cursor-pointer">다시 시도</button>
          </div>
        </div>
      )}

      <div className="flex gap-2 px-5 py-2 border-b border-gray-300">
        <span className="text-xs bg-primary-light text-primary px-2.5 py-1 rounded-full">전체 {members.length}</span>
        <span className="text-xs text-gray-500 px-2.5 py-1 rounded-full bg-gray-100">예배 {worshipCount}</span>
        <span className="text-xs text-gray-500 px-2.5 py-1 rounded-full bg-gray-100">온라인 {onlineCount}</span>
        <span className="text-xs text-gray-500 px-2.5 py-1 rounded-full bg-gray-100">팸모임 {famCount}</span>
      </div>

      <div className="flex px-5 py-2 border-b border-gray-300">
        <div className="flex-1" />
        <div className="w-[52px] text-center"><span className="text-[11px] font-medium text-primary">예배</span></div>
        <div className="w-[52px] text-center"><span className="text-[11px] font-medium" style={{color:'#34A853'}}>온라인</span></div>
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
            const onlineChecked = getChecked(member.id, 'online') === true
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
                    style={!worshipChecked ? { border: '1.5px solid rgb(var(--jh-gray-700))' } : {}}>✓</button>
                </div>
                <div className="w-[52px] flex justify-center">
                  <button onClick={() => toggleCheck(member.id, 'online')}
                    className={`w-[26px] h-[26px] rounded-full flex items-center justify-center text-xs border-none cursor-pointer transition-all`}
                    style={onlineChecked ? { background: 'rgb(var(--jh-success-light))', color: '#34A853' } : { border: '1.5px solid rgb(var(--jh-gray-700))', background: 'transparent', color: 'transparent' }}>✓</button>
                </div>
                <div className="w-[52px] flex justify-center">
                  <button onClick={() => toggleCheck(member.id, 'fam')}
                    className={`w-[26px] h-[26px] rounded-full flex items-center justify-center text-xs border-none cursor-pointer transition-all ${famChecked ? 'bg-warning-light text-warning' : 'bg-transparent text-transparent'}`}
                    style={!famChecked ? { border: '1.5px solid rgb(var(--jh-gray-700))' } : {}}>✓</button>
                </div>
              </div>
            )
          })
        )}
      </div>

      <div className="flex gap-3 justify-center py-3 border-t border-gray-300">
        <div className="flex items-center gap-1"><div className="w-2.5 h-2.5 rounded-full bg-primary-light" /><span className="text-[11px] text-gray-500">예배 출석</span></div>
        <div className="flex items-center gap-1"><div className="w-2.5 h-2.5 rounded-full bg-success-light" /><span className="text-[11px] text-gray-500">온라인 출석</span></div>
        <div className="flex items-center gap-1"><div className="w-2.5 h-2.5 rounded-full bg-warning-light" /><span className="text-[11px] text-gray-500">팸모임 출석</span></div>
        <div className="flex items-center gap-1"><div className="w-2.5 h-2.5 rounded-full border border-gray-300" /><span className="text-[11px] text-gray-500">결석</span></div>
      </div>

      {/*
        예전에는 화면 바닥을 저장 바가 통째로 차지하느라 하단 네비게이션바를 못 띄웠다(리더가
        출석 화면에 들어오면 다른 탭으로 못 넘어감). 이제 저장 버튼은 "저장할 변경이 있을 때만"
        네비 위로 떠오르는 알약이라, 네비게이션바를 항상 켜둔 채로 출석 체크가 가능하다.
      */}
      <div
        className="fixed left-1/2 -translate-x-1/2 w-full max-w-[430px] px-4 z-40 pointer-events-none"
        style={{ bottom: 'calc(85px + env(safe-area-inset-bottom, 0px))' }}
      >
        <div
          className={`transition-all duration-200 ${
            showSaveBar ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'
          }`}
        >
          {saveError && (
            <p className="jh-floating-nav pointer-events-auto text-xs text-danger rounded-2xl px-4 py-2.5 mb-2">
              {saveError}
            </p>
          )}
          <button
            onClick={handleSave}
            disabled={isLoading || isSaving || members.length === 0 || !showSaveBar}
            className={`jh-save-pill pointer-events-auto w-full py-3.5 rounded-[22px] text-sm font-bold text-white border-none transition-colors ${
              saved ? 'bg-success' : 'bg-primary hover:bg-primary-hover'
            } ${isLoading || isSaving || members.length === 0 ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}
          >
            {isSaving
              ? '저장 중...'
              : saved
                ? '저장되었습니다'
                : `출석 저장하기${changedCount > 0 ? ` · ${changedCount}명 변경` : ''}`}
          </button>
        </div>
      </div>

      <BottomNav />
    </div>
  )
}
