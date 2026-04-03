import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import BottomNav from '../components/BottomNav'

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/$/, '')

const PERIOD_LABELS = {
  '1month': '최근 1개월',
  '3month': '최근 3개월',
  '6month': '최근 6개월',
}

const avatarColors = [
  { bg: 'bg-success-light', text: 'text-success' },
  { bg: 'bg-primary-light', text: 'text-primary' },
  { bg: 'bg-warning-light', text: 'text-warning' },
  { bg: 'bg-danger-light', text: 'text-danger' },
]

function getColor(id) {
  return avatarColors[Math.abs(Number(id) || 0) % avatarColors.length]
}

function buildApiUrl(path) {
  return `${API_BASE_URL}${path}`
}

function toRate(value) {
  return Number.isFinite(Number(value)) ? Math.round(Number(value)) : 0
}

function mapMemberStats(items) {
  return items.map((item) => ({
    id: item.id,
    name: item.name ?? '',
    worshipRate: toRate(item.worshipRate),
    famRate: toRate(item.famRate),
  }))
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

function RateBar({ rate, type }) {
  const barColor = type === 'worship' ? '#4285F4' : '#F9AB00'

  return (
    <div className="flex items-center gap-2">
      <div
        style={{
          flex: 1,
          height: 6,
          borderRadius: 3,
          background: '#F0F0F0',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            width: `${rate}%`,
            height: '100%',
            background: barColor,
            borderRadius: 3,
            transition: 'width 0.4s',
          }}
        />
      </div>
      <span
        style={{
          fontSize: 12,
          fontWeight: 600,
          color: barColor,
          minWidth: 34,
          textAlign: 'right',
        }}
      >
        {rate}%
      </span>
    </div>
  )
}

function AvgCard({ label, worship, fam }) {
  return (
    <div className="border border-gray-300 rounded-xl p-4 mb-4">
      <p className="text-xs text-gray-500 font-medium mb-3">{label} 평균</p>
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

function MemberStatList({ members, isLoading, emptyLabel = '표시할 팸원이 없습니다.' }) {
  if (isLoading) {
    return <p className="text-sm text-gray-500 text-center mt-8">통계를 불러오는 중입니다.</p>
  }

  if (members.length === 0) {
    return <p className="text-sm text-gray-500 text-center mt-8">{emptyLabel}</p>
  }

  return (
    <div className="flex flex-col gap-3">
      {members.map((member) => {
        const color = getColor(member.id)

        return (
          <div key={member.id} className="border border-gray-300 rounded-xl p-4">
            <div className="flex items-center gap-2.5 mb-3">
              <div
                className={`w-8 h-8 rounded-full ${color.bg} flex items-center justify-center text-[13px] font-medium ${color.text} shrink-0`}
              >
                {member.name[0]}
              </div>
              <p className="text-sm font-medium">{member.name}</p>
            </div>
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-primary w-10 shrink-0">예배</span>
                <RateBar rate={member.worshipRate} type="worship" />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-warning w-10 shrink-0">팸모임</span>
                <RateBar rate={member.famRate} type="fam" />
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

function PeriodSelect({ value, onChange }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="text-sm border border-gray-300 rounded-lg px-2 py-1.5 bg-white outline-none"
    >
      {Object.entries(PERIOD_LABELS).map(([key, label]) => (
        <option key={key} value={key}>
          {label}
        </option>
      ))}
    </select>
  )
}

function LeaderStatsView({ famName, period, setPeriod, stats, members, isLoading }) {
  return (
    <div className="px-5">
      <div className="flex items-center justify-between py-3">
        <p className="text-sm font-medium">{famName || '소속 팸 없음'}</p>
        <PeriodSelect value={period} onChange={setPeriod} />
      </div>
      <AvgCard
        label="팸 전체"
        worship={stats?.worshipRate ?? 0}
        fam={stats?.famRate ?? 0}
      />
      <p className="text-xs text-gray-500 mb-2">팸원별 출석률</p>
      <MemberStatList members={members} isLoading={isLoading} />
    </div>
  )
}

function VillageStatsView({
  isPastorOrAbove,
  summaryLabel,
  summaryStats,
  villages,
  famStatsMap,
  period,
  setPeriod,
  selectedFam,
  setSelectedFam,
  selectedFamMembers,
  detailLoading,
  expandedVillage,
  setExpandedVillage,
}) {
  const selectedFamStats = selectedFam ? famStatsMap[selectedFam] : null

  if (selectedFam) {
    return (
      <div className="px-5">
        <div className="flex items-center justify-between py-3">
          <button
            onClick={() => setSelectedFam(null)}
            className="flex items-center gap-1.5 text-sm text-primary bg-transparent border-none cursor-pointer"
          >
            ← {selectedFam}
          </button>
          <PeriodSelect value={period} onChange={setPeriod} />
        </div>
        <AvgCard
          label={selectedFam}
          worship={selectedFamStats?.worshipRate ?? 0}
          fam={selectedFamStats?.famRate ?? 0}
        />
        <p className="text-xs text-gray-500 mb-2">팸원별 출석률</p>
        <MemberStatList members={selectedFamMembers} isLoading={detailLoading} />
      </div>
    )
  }

  return (
    <div className="px-5">
      <div className="flex items-center justify-between py-3">
        <p className="text-sm font-medium">팸 선택</p>
        <PeriodSelect value={period} onChange={setPeriod} />
      </div>

      <AvgCard
        label={isPastorOrAbove ? '전체' : summaryLabel}
        worship={summaryStats?.worshipRate ?? 0}
        fam={summaryStats?.famRate ?? 0}
      />

      {Object.entries(villages).length === 0 ? (
        <p className="text-sm text-gray-500 text-center mt-8">표시할 팸이 없습니다.</p>
      ) : (
        Object.entries(villages).map(([village, fams]) => (
          <div key={village} className="mb-3">
            <button
              onClick={() => setExpandedVillage(expandedVillage === village ? null : village)}
              className="w-full flex items-center justify-between py-2.5 px-3 bg-success-light rounded-xl border-none cursor-pointer mb-2"
            >
              <span className="text-sm font-medium text-success">{village}</span>
              <span className="text-xs text-success">
                {fams.length}개 팸 {expandedVillage === village ? '▲' : '▼'}
              </span>
            </button>

            {expandedVillage === village && (
              <div className="border border-gray-300 rounded-xl overflow-hidden">
                {fams.map((fam, index) => {
                  const stats = famStatsMap[fam]

                  return (
                    <div
                      key={fam}
                      onClick={() => setSelectedFam(fam)}
                      className={`flex items-center justify-between px-4 py-3.5 cursor-pointer hover:bg-gray-100 transition-colors ${
                        index < fams.length - 1 ? 'border-b border-gray-300' : ''
                      }`}
                    >
                      <p className="text-sm font-medium">{fam}</p>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-semibold text-primary bg-primary-light px-2 py-0.5 rounded-full">
                          예배 {toRate(stats?.worshipRate)}%
                        </span>
                        <span className="text-[11px] font-semibold text-warning bg-warning-light px-2 py-0.5 rounded-full">
                          팸 {toRate(stats?.famRate)}%
                        </span>
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

export default function AttendanceStatsPageConnected() {
  const navigate = useNavigate()
  const {
    user,
    accessToken,
    setAccessToken,
    logout,
    isVillageLeaderOrAbove,
    isPastorOrAbove,
  } = useAuth()

  const [period, setPeriod] = useState('1month')
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

  useEffect(() => {
    const loadPageData = async () => {
      setIsLoading(true)
      setPageError('')

      try {
        if (!isVillageLeaderOrAbove) {
          if (!user?.fam) {
            setLeaderStats(null)
            setLeaderMembers([])
            setPageError('소속 팸 정보가 없어 통계를 불러올 수 없습니다.')
            return
          }

          const [statsData, membersData] = await Promise.all([
            callAuthedApi(`/api/attendance/stats?scope=fam&period=${period}`),
            callAuthedApi(`/api/fams/${encodeURIComponent(user.fam)}/members?period=${period}`),
          ])

          setLeaderStats(statsData)
          setLeaderMembers(Array.isArray(membersData) ? mapMemberStats(membersData) : [])
          return
        }

        const [villagesData, famsData, summaryData] = await Promise.all([
          callAuthedApi('/api/villages'),
          callAuthedApi('/api/fams'),
          callAuthedApi(
            `/api/attendance/stats?scope=${isPastorOrAbove ? 'all' : 'village'}&period=${period}`,
          ),
        ])

        const accessibleVillageNames = isPastorOrAbove
          ? (Array.isArray(villagesData)
              ? villagesData.map((village) => village.name).filter(Boolean)
              : [])
          : (user?.village ? [user.village] : [])

        const nextVillages = Object.fromEntries(
          [...accessibleVillageNames]
            .sort((a, b) => a.localeCompare(b, 'ko'))
            .map((villageName) => [villageName, []]),
        )

        if (Array.isArray(famsData)) {
          famsData
            .filter((fam) => accessibleVillageNames.includes(fam.villageName))
            .sort((a, b) => String(a.name).localeCompare(String(b.name), 'ko'))
            .forEach((fam) => {
              nextVillages[fam.villageName] = [
                ...(nextVillages[fam.villageName] ?? []),
                fam.name,
              ]
            })
        }

        const accessibleFams = Object.values(nextVillages).flat()
        const famStatsEntries = await Promise.all(
          accessibleFams.map(async (famName) => [
            famName,
            await callAuthedApi(
              `/api/attendance/stats?scope=fam&famName=${encodeURIComponent(famName)}&period=${period}`,
            ),
          ]),
        )

        setSummaryStats(summaryData)
        setVillages(nextVillages)
        setFamStatsMap(Object.fromEntries(famStatsEntries))

        if (accessibleVillageNames.length > 0 && !expandedVillage) {
          setExpandedVillage(accessibleVillageNames[0])
        }

        if (selectedFam && !accessibleFams.includes(selectedFam)) {
          setSelectedFam(null)
        }
      } catch (err) {
        setPageError(err instanceof Error ? err.message : '출석 통계를 불러오지 못했습니다.')
        setLeaderStats(null)
        setLeaderMembers([])
        setSummaryStats(null)
        setVillages({})
        setFamStatsMap({})
        setSelectedFam(null)
        setSelectedFamMembers([])
      } finally {
        setIsLoading(false)
      }
    }

    void loadPageData()
  }, [
    period,
    isVillageLeaderOrAbove,
    isPastorOrAbove,
    user?.fam,
    user?.village,
  ])

  useEffect(() => {
    if (!isVillageLeaderOrAbove || !selectedFam) {
      setSelectedFamMembers([])
      setDetailLoading(false)
      return
    }

    let cancelled = false

    const loadSelectedFamMembers = async () => {
      setDetailLoading(true)
      setPageError('')

      try {
        const membersData = await callAuthedApi(
          `/api/fams/${encodeURIComponent(selectedFam)}/members?period=${period}`,
        )

        if (!cancelled) {
          setSelectedFamMembers(Array.isArray(membersData) ? mapMemberStats(membersData) : [])
        }
      } catch (err) {
        if (!cancelled) {
          setPageError(err instanceof Error ? err.message : '팸원 통계를 불러오지 못했습니다.')
          setSelectedFamMembers([])
        }
      } finally {
        if (!cancelled) {
          setDetailLoading(false)
        }
      }
    }

    void loadSelectedFamMembers()

    return () => {
      cancelled = true
    }
  }, [selectedFam, period, isVillageLeaderOrAbove])

  return (
    <div className="pb-20">
      <div className="flex items-center gap-3 px-5 pt-4 pb-3 border-b border-gray-300">
        <button
          onClick={() => navigate('/my')}
          className="text-lg bg-transparent border-none cursor-pointer"
        >
          ←
        </button>
        <p className="text-base font-medium flex-1">출석 통계</p>
      </div>

      {pageError && (
        <div className="px-5 pt-3">
          <div className="border border-danger-light bg-danger-light rounded-xl px-4 py-3">
            <p className="text-xs text-danger">{pageError}</p>
          </div>
        </div>
      )}

      {isVillageLeaderOrAbove ? (
        isLoading ? (
          <div className="px-5 py-10">
            <p className="text-sm text-gray-500 text-center">출석 통계를 불러오는 중입니다.</p>
          </div>
        ) : (
          <VillageStatsView
            isPastorOrAbove={isPastorOrAbove}
            summaryLabel={user?.village || '마을'}
            summaryStats={summaryStats}
            villages={villages}
            famStatsMap={famStatsMap}
            period={period}
            setPeriod={setPeriod}
            selectedFam={selectedFam}
            setSelectedFam={setSelectedFam}
            selectedFamMembers={selectedFamMembers}
            detailLoading={detailLoading}
            expandedVillage={expandedVillage}
            setExpandedVillage={setExpandedVillage}
          />
        )
      ) : (
        <LeaderStatsView
          famName={user?.fam}
          period={period}
          setPeriod={setPeriod}
          stats={leaderStats}
          members={leaderMembers}
          isLoading={isLoading}
        />
      )}

      <BottomNav />
    </div>
  )
}
