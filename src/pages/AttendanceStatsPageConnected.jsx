import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import BottomNav from '../components/BottomNav'

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/$/, '')

const avatarColors = [
  { bg: 'bg-success-light', text: 'text-success' },
  { bg: 'bg-primary-light', text: 'text-primary' },
  { bg: 'bg-warning-light', text: 'text-warning' },
  { bg: 'bg-danger-light', text: 'text-danger' },
]

function getColor(id) { return avatarColors[Math.abs(Number(id) || 0) % avatarColors.length] }
function buildApiUrl(path) { return `${API_BASE_URL}${path}` }
function toRate(value) { return Number.isFinite(Number(value)) ? Math.round(Number(value)) : 0 }

function getCurrentYear() { return new Date().getFullYear() }

// 선택 가능한 연도 목록 (현재 연도 포함 최근 3년)
function getYearOptions() {
  const current = getCurrentYear()
  return [current, current - 1, current - 2]
}

function getThisSundayKey() {
  const today = new Date()
  const sunday = new Date(today)
  sunday.setDate(today.getDate() - today.getDay())
  return sunday.toISOString().slice(0, 10)
}

function getRecentSundays(n = 8) {
  const result = []
  const today = new Date()
  const thisSunday = new Date(today)
  thisSunday.setDate(today.getDate() - today.getDay())
  for (let i = 0; i < n; i++) {
    const d = new Date(thisSunday)
    d.setDate(thisSunday.getDate() - i * 7)
    const key = d.toISOString().slice(0, 10)
    const [, month, day] = key.split('-')
    result.push({
      key,
      label: i === 0 ? `이번 주 (${parseInt(month)}/${parseInt(day)})`
           : i === 1 ? `저번 주 (${parseInt(month)}/${parseInt(day)})`
           : `${parseInt(month)}/${parseInt(day)}`,
    })
  }
  return result
}

function mapMemberStats(items) {
  return items.map((item) => ({
    id: item.id,
    name: item.name ?? '',
    worshipRate: toRate(item.worshipRate),
    famRate: toRate(item.famRate),
  }))
}

function buildAttendanceMap(records) {
  const map = {}
  ;(records || []).forEach((r) => {
    const id = r.userId ?? r.famMemberId
    if (id) map[id] = { worship: Boolean(r.worshipPresent), fam: Boolean(r.famPresent) }
  })
  return map
}

async function requestApi(path, { method = 'GET', headers = {}, body } = {}) {
  const requestOptions = { method, headers: { ...headers }, credentials: 'include' }
  if (body !== undefined) { requestOptions.body = JSON.stringify(body); requestOptions.headers['Content-Type'] = 'application/json' }
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

// ── 공통 컴포넌트 ──

function AttendBadge({ present, label }) {
  return (
    <span style={{
      fontSize: 10, fontWeight: 600, padding: '2px 5px', borderRadius: 6,
      background: present ? (label === '예배' ? '#E8F0FE' : '#FEF7E0') : '#F5F5F5',
      color: present ? (label === '예배' ? '#4285F4' : '#F9AB00') : '#AAAAAA',
    }}>
      {label} {present ? '✓' : '✗'}
    </span>
  )
}

function RateBar({ rate, type }) {
  const barColor = type === 'worship' ? '#4285F4' : '#F9AB00'
  return (
    <div className="flex items-center gap-2">
      <div style={{ flex: 1, height: 6, borderRadius: 3, background: '#F0F0F0', overflow: 'hidden' }}>
        <div style={{ width: `${rate}%`, height: '100%', background: barColor, borderRadius: 3, transition: 'width 0.4s' }} />
      </div>
      <span style={{ fontSize: 12, fontWeight: 600, color: barColor, minWidth: 34, textAlign: 'right' }}>{rate}%</span>
    </div>
  )
}

function AvgCard({ label, worship, fam, year }) {
  return (
    <div className="border border-gray-300 rounded-xl p-4 mb-4">
      <p className="text-xs text-gray-500 font-medium mb-3">
        {label} 평균 <span className="text-gray-400">({year}년)</span>
      </p>
      <div className="flex gap-3">
        <div className="flex-1 bg-primary-light rounded-lg p-3 text-center">
          <p className="text-[11px] text-primary mb-1">예배 출석률</p>
          <p className="text-xl font-bold text-primary">{toRate(worship)}%</p>
        </div>
        <div className="flex-1 bg-warning-light rounded-lg p-3 text-center">
          <p className="text-[11px] text-warning mb-1">팸모임 출석률</p>
          <p className="text-xl font-bold text-warning">{toRate(fam)}%</p>
        </div>
      </div>
    </div>
  )
}

function MemberStatList({ members, isLoading, weekAttendMap = {}, emptyLabel = '표시할 팸원이 없습니다.' }) {
  if (isLoading) return <p className="text-sm text-gray-500 text-center mt-8">통계를 불러오는 중입니다.</p>
  if (members.length === 0) return <p className="text-sm text-gray-500 text-center mt-8">{emptyLabel}</p>

  return (
    <div className="flex flex-col gap-3">
      {members.map((member) => {
        const color = getColor(member.id)
        const weekRecord = weekAttendMap[member.id]
        return (
          <div key={member.id} className="border border-gray-300 rounded-xl px-5 py-3 flex items-center gap-3">
            <div className={`w-8 h-8 rounded-full ${color.bg} flex items-center justify-center text-[13px] font-medium ${color.text} shrink-0`}>{member.name[0]}</div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{member.name}</p>
              {weekRecord !== undefined && (
                <div className="flex gap-1 mt-0.5">
                  <AttendBadge present={weekRecord.worship} label="예배" />
                  <AttendBadge present={weekRecord.fam} label="팸" />
                </div>
              )}
            </div>
            <div className="flex flex-col gap-1 shrink-0 min-w-[130px]">
              <div className="flex items-center gap-1.5 justify-end">
                <span className="text-[10px] text-primary">예배</span>
                <RateBar rate={member.worshipRate} type="worship" />
              </div>
              <div className="flex items-center gap-1.5 justify-end">
                <span className="text-[10px] text-warning">팸</span>
                <RateBar rate={member.famRate} type="fam" />
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

// 연도 드롭다운
function YearSelect({ value, onChange }) {
  const years = useMemo(() => getYearOptions(), [])
  return (
    <select
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      className="text-sm border border-gray-300 rounded-lg px-2 py-1.5 bg-white outline-none"
    >
      {years.map((y) => (
        <option key={y} value={y}>{y}년</option>
      ))}
    </select>
  )
}

// 주차 드롭다운
function WeekSelect({ value, onChange }) {
  const sundays = useMemo(() => getRecentSundays(8), [])
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)} className="text-sm border border-gray-300 rounded-lg px-2 py-1.5 bg-white outline-none">
      {sundays.map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}
    </select>
  )
}

// ── 주차별 팸 상세 ──
function WeeklyFamView({ famName, weekDate, callAuthedApi, onBack }) {
  const [members, setMembers] = useState([])
  const [attendMap, setAttendMap] = useState({})
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      setIsLoading(true); setError('')
      try {
        const [membersData, attendData] = await Promise.all([
          callAuthedApi(`/api/fams/${encodeURIComponent(famName)}/members`),
          callAuthedApi(`/api/attendance?famName=${encodeURIComponent(famName)}&date=${weekDate}`),
        ])
        if (cancelled) return
        setMembers(Array.isArray(membersData) ? membersData : [])
        setAttendMap(buildAttendanceMap(attendData))
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : '불러오지 못했습니다.')
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [famName, weekDate])

  const worshipCount = members.filter((m) => attendMap[m.id]?.worship).length
  const famCount = members.filter((m) => attendMap[m.id]?.fam).length

  return (
    <div>
      <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-primary bg-transparent border-none cursor-pointer mb-3">← {famName}</button>
      {error && <p className="text-xs text-danger mb-3">{error}</p>}
      <div className="flex gap-2 mb-3">
        <span className="text-xs bg-primary-light text-primary px-2.5 py-1 rounded-full">재적 {members.length}명</span>
        <span className="text-xs bg-primary-light text-primary px-2.5 py-1 rounded-full">예배 {worshipCount}명</span>
        <span className="text-xs bg-warning-light text-warning px-2.5 py-1 rounded-full">팸 {famCount}명</span>
      </div>
      {isLoading ? (
        <p className="text-sm text-gray-500 text-center py-8">불러오는 중...</p>
      ) : members.length === 0 ? (
        <p className="text-sm text-gray-500 text-center py-8">팸원이 없습니다.</p>
      ) : (
        <div className="border border-gray-300 rounded-xl overflow-hidden">
          <div className="flex px-4 py-2 bg-gray-50 border-b border-gray-300">
            <div className="flex-1 text-xs text-gray-500">이름</div>
            <div className="w-16 text-center text-xs text-primary font-medium">예배</div>
            <div className="w-16 text-center text-xs text-warning font-medium">팸모임</div>
          </div>
          {members.map((member, idx) => {
            const record = attendMap[member.id]
            return (
              <div key={member.id} className={`flex items-center px-4 py-3 ${idx < members.length - 1 ? 'border-b border-gray-300' : ''}`}>
                <div className="flex-1">
                  <p className="text-sm">{member.name}</p>
                  <p className="text-[11px] text-gray-500">{member.role === 'leader' ? '리더' : '팸원'}</p>
                </div>
                <div className="w-16 flex justify-center"><span style={{ fontSize: 18 }}>{record?.worship ? '✅' : '⬜'}</span></div>
                <div className="w-16 flex justify-center"><span style={{ fontSize: 18 }}>{record?.fam ? '✅' : '⬜'}</span></div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ── 주차별 현황 탭 ──
function WeeklyView({ villages, famStatsMap, callAuthedApi, summaryStats, weekDate, setWeekDate, selectedYear }) {
  const [selectedFam, setSelectedFam] = useState(null)
  const [expandedVillage, setExpandedVillage] = useState(Object.keys(villages)[0] ?? null)

  return (
    <div className="px-5">
      <div className="flex items-center justify-between py-3">
        <p className="text-sm font-medium">주차 선택</p>
        <WeekSelect value={weekDate} onChange={setWeekDate} />
      </div>

      {summaryStats && (
        <div className="border border-gray-300 rounded-xl p-3 mb-4 flex gap-3">
          <div className="flex-1 text-center">
            <p className="text-[11px] text-gray-500">전체 예배 출석률 ({selectedYear}년)</p>
            <p className="text-lg font-bold text-primary">{toRate(summaryStats.worshipRate)}%</p>
          </div>
          <div className="w-px bg-gray-200" />
          <div className="flex-1 text-center">
            <p className="text-[11px] text-gray-500">전체 팸모임 출석률 ({selectedYear}년)</p>
            <p className="text-lg font-bold text-warning">{toRate(summaryStats.famRate)}%</p>
          </div>
        </div>
      )}

      {selectedFam ? (
        <WeeklyFamView famName={selectedFam} weekDate={weekDate} callAuthedApi={callAuthedApi} onBack={() => setSelectedFam(null)} />
      ) : Object.entries(villages).length === 0 ? (
        <p className="text-sm text-gray-500 text-center mt-8">표시할 팸이 없습니다.</p>
      ) : (
        Object.entries(villages).map(([village, fams]) => (
          <div key={village} className="mb-3">
            <button onClick={() => setExpandedVillage(expandedVillage === village ? null : village)}
              className="w-full flex items-center justify-between py-2.5 px-3 bg-success-light rounded-xl border-none cursor-pointer mb-2">
              <span className="text-sm font-medium text-success">{village}</span>
              <span className="text-xs text-success">{fams.length}개 팸 {expandedVillage === village ? '▲' : '▼'}</span>
            </button>
            {expandedVillage === village && (
              <div className="border border-gray-300 rounded-xl overflow-hidden">
                {fams.map((fam, index) => (
                  <div key={fam} onClick={() => setSelectedFam(fam)}
                    className={`flex items-center justify-between px-4 py-3.5 cursor-pointer hover:bg-gray-100 transition-colors ${index < fams.length - 1 ? 'border-b border-gray-300' : ''}`}>
                    <p className="text-sm font-medium">{fam}</p>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] font-semibold text-primary bg-primary-light px-2 py-0.5 rounded-full">예배 {toRate(famStatsMap[fam]?.worshipRate)}%</span>
                      <span className="text-[11px] font-semibold text-warning bg-warning-light px-2 py-0.5 rounded-full">팸 {toRate(famStatsMap[fam]?.famRate)}%</span>
                      <span className="text-gray-500 text-xs">→</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))
      )}
    </div>
  )
}

// ── 누적 통계 - 리더 뷰 ──
function LeaderStatsView({ famName, selectedYear, setSelectedYear, stats, members, isLoading, weekAttendMap }) {
  return (
    <div className="px-5">
      <div className="flex items-center justify-between py-3">
        <p className="text-sm font-medium">{famName || '소속 팸 없음'}</p>
        <YearSelect value={selectedYear} onChange={setSelectedYear} />
      </div>
      <AvgCard label="팸 전체" worship={stats?.worshipRate ?? 0} fam={stats?.famRate ?? 0} year={selectedYear} />
      <p className="text-xs text-gray-500 mb-2">팸원별 출석률 · 이번 주 출석</p>
      <MemberStatList members={members} isLoading={isLoading} weekAttendMap={weekAttendMap} />
    </div>
  )
}

// ── 누적 통계 - 마을장/교역자 뷰 ──
function VillageStatsView({
  isPastorOrAbove, summaryLabel, summaryStats, villages, famStatsMap,
  selectedYear, setSelectedYear, selectedFam, setSelectedFam,
  selectedFamMembers, detailLoading, expandedVillage, setExpandedVillage, weekAttendMap,
}) {
  const selectedFamStats = selectedFam ? famStatsMap[selectedFam] : null

  if (selectedFam) {
    return (
      <div className="px-5">
        <div className="flex items-center justify-between py-3">
          <button onClick={() => setSelectedFam(null)} className="flex items-center gap-1.5 text-sm text-primary bg-transparent border-none cursor-pointer">← {selectedFam}</button>
          <YearSelect value={selectedYear} onChange={setSelectedYear} />
        </div>
        <AvgCard label={selectedFam} worship={selectedFamStats?.worshipRate ?? 0} fam={selectedFamStats?.famRate ?? 0} year={selectedYear} />
        <p className="text-xs text-gray-500 mb-2">팸원별 출석률 · 이번 주 출석</p>
        <MemberStatList members={selectedFamMembers} isLoading={detailLoading} weekAttendMap={weekAttendMap} />
      </div>
    )
  }

  return (
    <div className="px-5">
      <div className="flex items-center justify-between py-3">
        <p className="text-sm font-medium">팸 선택</p>
        <YearSelect value={selectedYear} onChange={setSelectedYear} />
      </div>
      <AvgCard label={isPastorOrAbove ? '전체' : summaryLabel} worship={summaryStats?.worshipRate ?? 0} fam={summaryStats?.famRate ?? 0} year={selectedYear} />

      {Object.entries(villages).length === 0 ? (
        <p className="text-sm text-gray-500 text-center mt-8">표시할 팸이 없습니다.</p>
      ) : (
        Object.entries(villages).map(([village, fams]) => (
          <div key={village} className="mb-3">
            <button onClick={() => setExpandedVillage(expandedVillage === village ? null : village)}
              className="w-full flex items-center justify-between py-2.5 px-3 bg-success-light rounded-xl border-none cursor-pointer mb-2">
              <span className="text-sm font-medium text-success">{village}</span>
              <span className="text-xs text-success">{fams.length}개 팸 {expandedVillage === village ? '▲' : '▼'}</span>
            </button>
            {expandedVillage === village && (
              <div className="border border-gray-300 rounded-xl overflow-hidden">
                {fams.map((fam, index) => {
                  const stats = famStatsMap[fam]
                  return (
                    <div key={fam} onClick={() => setSelectedFam(fam)}
                      className={`flex items-center justify-between px-4 py-3.5 cursor-pointer hover:bg-gray-100 transition-colors ${index < fams.length - 1 ? 'border-b border-gray-300' : ''}`}>
                      <p className="text-sm font-medium">{fam}</p>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-semibold text-primary bg-primary-light px-2 py-0.5 rounded-full">예배 {toRate(stats?.worshipRate)}%</span>
                        <span className="text-[11px] font-semibold text-warning bg-warning-light px-2 py-0.5 rounded-full">팸 {toRate(stats?.famRate)}%</span>
                        <span className="text-gray-500 text-xs">→</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        ))
      )}
    </div>
  )
}

// ── 메인 페이지 ──
export default function AttendanceStatsPageConnected() {
  const navigate = useNavigate()
  const { user, accessToken, setAccessToken, logout, isVillageLeaderOrAbove, isPastorOrAbove } = useAuth()

  const [activeTab, setActiveTab] = useState('cumulative')
  const [selectedYear, setSelectedYear] = useState(getCurrentYear)
  const [weekDate, setWeekDate] = useState(getThisSundayKey)
  const [pageError, setPageError] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [detailLoading, setDetailLoading] = useState(false)
  const [leaderStats, setLeaderStats] = useState(null)
  const [leaderMembers, setLeaderMembers] = useState([])
  const [summaryStats, setSummaryStats] = useState(null)
  const [villages, setVillages] = useState({})
  const [famStatsMap, setFamStatsMap] = useState({})
  const [selectedFam, setSelectedFam] = useState(null)
  const [selectedFamMembers, setSelectedFamMembers] = useState([])
  const [expandedVillage, setExpandedVillage] = useState(null)
  const [weekAttendMap, setWeekAttendMap] = useState({})

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
      if (!result.response.ok || !result.payload?.success) throw new Error(getApiErrorMessage(result, '요청을 처리하지 못했습니다.'))
      return result.payload.data
    } catch (err) {
      if (err instanceof Error && err.message.includes('다시 로그인')) handleExpiredSession()
      throw err
    }
  }

  // 누적 통계 로드 (연도 변경 시 재조회)
  useEffect(() => {
    const load = async () => {
      setIsLoading(true); setPageError('')
      try {
        if (!isVillageLeaderOrAbove) {
          if (!user?.fam) { setPageError('소속 팸 정보가 없어 통계를 불러올 수 없습니다.'); return }
          const [statsData, membersData, attendData] = await Promise.all([
            callAuthedApi(`/api/attendance/stats?scope=fam&year=${selectedYear}`),
            callAuthedApi(`/api/fams/${encodeURIComponent(user.fam)}/members?year=${selectedYear}`),
            callAuthedApi(`/api/attendance?famName=${encodeURIComponent(user.fam)}&date=${getThisSundayKey()}`).catch(() => []),
          ])
          setLeaderStats(statsData)
          setLeaderMembers(Array.isArray(membersData) ? mapMemberStats(membersData) : [])
          setWeekAttendMap(buildAttendanceMap(attendData))
          return
        }

        const [villagesData, famsData, summaryData] = await Promise.all([
          callAuthedApi('/api/villages'),
          callAuthedApi('/api/fams'),
          callAuthedApi(`/api/attendance/stats?scope=${isPastorOrAbove ? 'all' : 'village'}&year=${selectedYear}`),
        ])

        const accessibleVillageNames = isPastorOrAbove
          ? (Array.isArray(villagesData) ? villagesData.map((v) => v.name).filter(Boolean) : [])
          : (user?.village ? [user.village] : [])

        const nextVillages = Object.fromEntries(
          [...accessibleVillageNames].sort((a, b) => a.localeCompare(b, 'ko')).map((vn) => [vn, []])
        )

        if (Array.isArray(famsData)) {
          famsData
            .filter((f) => accessibleVillageNames.includes(f.villageName))
            .sort((a, b) => String(a.name).localeCompare(String(b.name), 'ko'))
            .forEach((f) => { nextVillages[f.villageName] = [...(nextVillages[f.villageName] ?? []), f.name] })
        }

        const accessibleFams = Object.values(nextVillages).flat()
        const famStatsEntries = await Promise.all(
          accessibleFams.map(async (famName) => [
            famName,
            await callAuthedApi(`/api/attendance/stats?scope=fam&famName=${encodeURIComponent(famName)}&year=${selectedYear}`),
          ])
        )

        setSummaryStats(summaryData)
        setVillages(nextVillages)
        setFamStatsMap(Object.fromEntries(famStatsEntries))
        if (accessibleVillageNames.length > 0 && !expandedVillage) setExpandedVillage(accessibleVillageNames[0])
        if (selectedFam && !accessibleFams.includes(selectedFam)) setSelectedFam(null)
      } catch (err) {
        setPageError(err instanceof Error ? err.message : '출석 통계를 불러오지 못했습니다.')
        setLeaderStats(null); setLeaderMembers([]); setSummaryStats(null)
        setVillages({}); setFamStatsMap({}); setSelectedFam(null); setSelectedFamMembers([])
      } finally { setIsLoading(false) }
    }
    void load()
  }, [selectedYear, isVillageLeaderOrAbove, isPastorOrAbove, user?.fam, user?.village])

  // 팸 상세 진입 시 팸원 + 이번 주 출석
  useEffect(() => {
    if (!isVillageLeaderOrAbove || !selectedFam) { setSelectedFamMembers([]); setDetailLoading(false); return }
    let cancelled = false
    const load = async () => {
      setDetailLoading(true); setPageError('')
      try {
        const [membersData, attendData] = await Promise.all([
          callAuthedApi(`/api/fams/${encodeURIComponent(selectedFam)}/members?year=${selectedYear}`),
          callAuthedApi(`/api/attendance?famName=${encodeURIComponent(selectedFam)}&date=${getThisSundayKey()}`).catch(() => []),
        ])
        if (!cancelled) {
          setSelectedFamMembers(Array.isArray(membersData) ? mapMemberStats(membersData) : [])
          setWeekAttendMap(buildAttendanceMap(attendData))
        }
      } catch (err) {
        if (!cancelled) { setPageError(err instanceof Error ? err.message : '팸원 통계를 불러오지 못했습니다.'); setSelectedFamMembers([]) }
      } finally { if (!cancelled) setDetailLoading(false) }
    }
    void load()
    return () => { cancelled = true }
  }, [selectedFam, selectedYear, isVillageLeaderOrAbove])

  return (
    <div className="pb-20">
      <div className="flex items-center gap-3 px-5 pt-4 pb-3 border-b border-gray-300">
        <button onClick={() => navigate('/my')} className="text-lg bg-transparent border-none cursor-pointer">←</button>
        <p className="text-base font-medium flex-1">출석 통계</p>
      </div>

      {isVillageLeaderOrAbove && (
        <div className="flex border-b border-gray-300">
          {[['cumulative', '누적 통계'], ['weekly', '주차별 현황']].map(([key, label]) => (
            <button key={key} onClick={() => { setActiveTab(key); setSelectedFam(null) }}
              className={`flex-1 py-2.5 text-sm border-none cursor-pointer bg-transparent transition-colors ${activeTab === key ? 'text-primary font-medium border-b-2 border-primary' : 'text-gray-500'}`}>
              {label}
            </button>
          ))}
        </div>
      )}

      {pageError && (
        <div className="px-5 pt-3">
          <div className="border border-danger-light bg-danger-light rounded-xl px-4 py-3">
            <p className="text-xs text-danger">{pageError}</p>
          </div>
        </div>
      )}

      {/* 누적 통계 탭 */}
      {(!isVillageLeaderOrAbove || activeTab === 'cumulative') && (
        isVillageLeaderOrAbove ? (
          isLoading ? (
            <div className="px-5 py-10"><p className="text-sm text-gray-500 text-center">출석 통계를 불러오는 중입니다.</p></div>
          ) : (
            <VillageStatsView
              isPastorOrAbove={isPastorOrAbove} summaryLabel={user?.village || '마을'}
              summaryStats={summaryStats} villages={villages} famStatsMap={famStatsMap}
              selectedYear={selectedYear} setSelectedYear={setSelectedYear}
              selectedFam={selectedFam} setSelectedFam={setSelectedFam}
              selectedFamMembers={selectedFamMembers} detailLoading={detailLoading}
              expandedVillage={expandedVillage} setExpandedVillage={setExpandedVillage}
              weekAttendMap={weekAttendMap}
            />
          )
        ) : (
          <LeaderStatsView
            famName={user?.fam} selectedYear={selectedYear} setSelectedYear={setSelectedYear}
            stats={leaderStats} members={leaderMembers} isLoading={isLoading} weekAttendMap={weekAttendMap}
          />
        )
      )}

      {/* 주차별 현황 탭 */}
      {isVillageLeaderOrAbove && activeTab === 'weekly' && (
        isLoading ? (
          <div className="px-5 py-10"><p className="text-sm text-gray-500 text-center">데이터를 불러오는 중입니다.</p></div>
        ) : (
          <WeeklyView
            villages={villages} famStatsMap={famStatsMap} callAuthedApi={callAuthedApi}
            summaryStats={summaryStats} weekDate={weekDate} setWeekDate={setWeekDate}
            selectedYear={selectedYear}
          />
        )
      )}

      <BottomNav />
    </div>
  )
}
