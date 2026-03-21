import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import BottomNav from '../components/BottomNav'

// ─── 더미 데이터 ───
const ALL_VILLAGES = {
  '1마을': ['사랑팸', '은혜팸', '믿음팸', '소망팸', '기쁨팸'],
  '2마을': ['평화팸', '인내팸', '온유팸', '화평팸', '자비팸'],
  '3마을': ['양선팸', '충성팸', '절제팸', '겸손팸', '섬김팸'],
  '4마을': ['찬양팸', '감사팸', '순종팸', '헌신팸', '비전팸', '열방팸'],
}

const MEMBER_NAMES = ['김민수', '이은혜', '박준호', '정하늘', '최수진', '한소망', '조은별', '송하린']

function generateFamStats(fam) {
  const count = Math.floor(Math.random() * 4) + 3
  return MEMBER_NAMES.slice(0, count).map((name, i) => ({
    id: i + 1,
    name,
    worshipRate: Math.floor(Math.random() * 41) + 55,
    famRate: Math.floor(Math.random() * 41) + 55,
  }))
}

const famStatsCache = {}
function getFamStats(fam) {
  if (!famStatsCache[fam]) famStatsCache[fam] = generateFamStats(fam)
  return famStatsCache[fam]
}

const avatarColors = [
  { bg: 'bg-success-light', text: 'text-success' },
  { bg: 'bg-primary-light', text: 'text-primary' },
  { bg: 'bg-warning-light', text: 'text-warning' },
  { bg: 'bg-danger-light', text: 'text-danger' },
]
function getColor(id) { return avatarColors[id % avatarColors.length] }

// ─── 공통 UI ───
function RateBar({ rate, type }) {
  const barColor = type === 'worship' ? '#4285F4' : '#F9AB00'
  return (
    <div className="flex items-center gap-2">
      <div style={{ flex: 1, height: 6, borderRadius: 3, background: '#F0F0F0', overflow: 'hidden' }}>
        <div style={{ width: `${rate}%`, height: '100%', background: barColor, borderRadius: 3, transition: 'width 0.4s' }} />
      </div>
      <span style={{ fontSize: 12, fontWeight: 600, color: barColor, minWidth: 34, textAlign: 'right' }}>
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
          <p className="text-xl font-bold text-primary">{worship}%</p>
        </div>
        <div className="flex-1 bg-warning-light rounded-lg p-3 text-center">
          <p className="text-[11px] text-warning mb-1">팸모임 출석률</p>
          <p className="text-xl font-bold text-warning">{fam}%</p>
        </div>
      </div>
    </div>
  )
}

function MemberStatList({ members }) {
  return (
    <div className="flex flex-col gap-3">
      {members.map((m) => {
        const color = getColor(m.id)
        return (
          <div key={m.id} className="border border-gray-300 rounded-xl p-4">
            <div className="flex items-center gap-2.5 mb-3">
              <div className={`w-8 h-8 rounded-full ${color.bg} flex items-center justify-center text-[13px] font-medium ${color.text} shrink-0`}>
                {m.name[0]}
              </div>
              <p className="text-sm font-medium">{m.name}</p>
            </div>
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-primary w-10 shrink-0">예배</span>
                <RateBar rate={m.worshipRate} type="worship" />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-warning w-10 shrink-0">팸모임</span>
                <RateBar rate={m.famRate} type="fam" />
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

function avg(members, key) {
  if (!members.length) return 0
  return Math.round(members.reduce((s, m) => s + m[key], 0) / members.length)
}

// ─── 뷰 1: 리더 — 본인 팸원 출석률 ───
function LeaderStatsView({ user, period, setPeriod, periodLabel }) {
  const members = useMemo(() => getFamStats(user.fam), [user.fam])
  return (
    <div className="px-5">
      <div className="flex items-center justify-between py-3">
        <p className="text-sm font-medium">{user.fam}</p>
        <PeriodSelect value={period} onChange={setPeriod} options={periodLabel} />
      </div>
      <AvgCard label="팸 전체" worship={avg(members, 'worshipRate')} fam={avg(members, 'famRate')} />
      <p className="text-xs text-gray-500 mb-2">팸원별 출석률</p>
      <MemberStatList members={members} />
    </div>
  )
}

// ─── 뷰 2: 마을장 / 교역자·부장 — 팸 선택 → 팸원 출석률 ───
function VillageStatsView({ villages, period, setPeriod, periodLabel }) {
  const [selectedFam, setSelectedFam] = useState(null)
  const [expandedVillage, setExpandedVillage] = useState(null) // 전부 닫힌 상태로 시작

  const members = useMemo(
    () => (selectedFam ? getFamStats(selectedFam) : []),
    [selectedFam]
  )

  // 팸 상세 뷰
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
          <PeriodSelect value={period} onChange={setPeriod} options={periodLabel} />
        </div>
        <AvgCard label={selectedFam} worship={avg(members, 'worshipRate')} fam={avg(members, 'famRate')} />
        <p className="text-xs text-gray-500 mb-2">팸원별 출석률</p>
        <MemberStatList members={members} />
      </div>
    )
  }

  // 마을 → 팸 선택 뷰
  return (
    <div className="px-5">
      <div className="flex items-center justify-between py-3">
        <p className="text-sm font-medium">팸 선택</p>
        <PeriodSelect value={period} onChange={setPeriod} options={periodLabel} />
      </div>
      {Object.entries(villages).map(([village, fams]) => (
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
              {fams.map((fam, idx) => {
                const famMembers = getFamStats(fam)
                const wAvg = avg(famMembers, 'worshipRate')
                const fAvg = avg(famMembers, 'famRate')
                return (
                  <div key={fam} onClick={() => setSelectedFam(fam)}
                    className={`flex items-center justify-between px-4 py-3.5 cursor-pointer hover:bg-gray-100 transition-colors ${
                      idx < fams.length - 1 ? 'border-b border-gray-300' : ''
                    }`}
                  >
                    <p className="text-sm font-medium">{fam}</p>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-semibold text-primary bg-primary-light px-2 py-0.5 rounded-full">
                        예배 {wAvg}%
                      </span>
                      <span className="text-[11px] font-semibold text-warning bg-warning-light px-2 py-0.5 rounded-full">
                        팸 {fAvg}%
                      </span>
                      <span className="text-gray-500 text-xs">→</span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

function PeriodSelect({ value, onChange, options }) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)}
      className="text-sm border border-gray-300 rounded-lg px-2 py-1.5 bg-white outline-none">
      {Object.entries(options).map(([k, v]) => (
        <option key={k} value={k}>{v}</option>
      ))}
    </select>
  )
}

// ─── 메인 ───
export default function AttendanceStatsPage() {
  const navigate = useNavigate()
  const { user, isVillageLeaderOrAbove, isPastorOrAbove } = useAuth()

  const [period, setPeriod] = useState('1month')
  const periodLabel = { '1month': '최근 1개월', '3month': '최근 3개월', '6month': '최근 6개월' }

  const villages = isPastorOrAbove
    ? ALL_VILLAGES
    : { [user.village]: ALL_VILLAGES[user.village] || [] }

  return (
    <div className="pb-20">
      <div className="flex items-center gap-3 px-5 pt-4 pb-3 border-b border-gray-300">
        <button onClick={() => navigate('/my')} className="text-lg bg-transparent border-none cursor-pointer">←</button>
        <p className="text-base font-medium flex-1">출석 통계</p>
      </div>
      {isVillageLeaderOrAbove ? (
        <VillageStatsView villages={villages} period={period} setPeriod={setPeriod} periodLabel={periodLabel} />
      ) : (
        <LeaderStatsView user={user} period={period} setPeriod={setPeriod} periodLabel={periodLabel} />
      )}
      <BottomNav />
    </div>
  )
}
