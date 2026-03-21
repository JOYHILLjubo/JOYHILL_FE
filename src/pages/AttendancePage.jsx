import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import BottomNav from '../components/BottomNav'

const FAM_MEMBERS = [
  { id: 1, name: '김민수', role: '팸원' },
  { id: 2, name: '이은혜', role: '팸원' },
  { id: 3, name: '박준호', role: '팸원' },
  { id: 4, name: '정하늘', role: '팸원' },
  { id: 5, name: '최수진', role: '팸원' },
  { id: 6, name: '한소망', role: '팸원' },
  { id: 7, name: '조은별', role: '팸원' },
  { id: 8, name: '송하린', role: '팸원' },
]

const avatarColors = [
  { bg: 'bg-success-light', text: 'text-success' },
  { bg: 'bg-primary-light', text: 'text-primary' },
  { bg: 'bg-warning-light', text: 'text-warning' },
  { bg: 'bg-danger-light', text: 'text-danger' },
]

function getAvatarColor(id) {
  return avatarColors[id % avatarColors.length]
}

// 이번 주 일요일 날짜 키 (YYYY-MM-DD)
function getThisSundayKey() {
  const today = new Date()
  const day = today.getDay() // 0=일, 1=월 ...
  const sunday = new Date(today)
  sunday.setDate(today.getDate() - day)
  return sunday.toISOString().slice(0, 10)
}

// 표시용 날짜 (YYYY-MM-DD → MM/DD)
function formatSundayKey(key) {
  const [, m, d] = key.split('-')
  return `${parseInt(m)}/${parseInt(d)}`
}

// 주차 표시 (예: 3월 3주차)
function getSundayLabel(key) {
  const date = new Date(key)
  const month = date.getMonth() + 1
  const firstSunday = new Date(date.getFullYear(), date.getMonth(), 1)
  while (firstSunday.getDay() !== 0) firstSunday.setDate(firstSunday.getDate() + 1)
  const week = Math.floor((date - firstSunday) / (7 * 24 * 60 * 60 * 1000)) + 1
  return `${month}월 ${week}주차`
}

export default function AttendancePage() {
  const navigate = useNavigate()
  const { user } = useAuth()

  // 현재 주차 키 — 렌더 시마다 계산 (일요일 넘어가면 자동 최신화)
  const sundayKey = useMemo(() => getThisSundayKey(), [])

  // { memberId: { worship: true|null, fam: true|null } }
  // 키 구조에 sundayKey 포함해서, 다음 주 일요일이 되면 새 키로 초기화됨
  const [attendanceMap, setAttendanceMap] = useState({})

  const getChecked = (memberId, type) =>
    attendanceMap[`${sundayKey}_${memberId}`]?.[type] ?? null

  const toggleCheck = (memberId, type) => {
    const mapKey = `${sundayKey}_${memberId}`
    setAttendanceMap((prev) => {
      const current = prev[mapKey]?.[type] ?? null
      return {
        ...prev,
        [mapKey]: {
          ...prev[mapKey],
          [type]: current === true ? null : true,
        },
      }
    })
  }

  const worshipCount = FAM_MEMBERS.filter(
    (m) => getChecked(m.id, 'worship') === true
  ).length
  const famCount = FAM_MEMBERS.filter(
    (m) => getChecked(m.id, 'fam') === true
  ).length

  return (
    <div className="pb-24">
      {/* 헤더 */}
      <div className="flex items-center gap-3 px-5 pt-4 pb-2">
        <button
          onClick={() => navigate('/home')}
          className="text-lg bg-transparent border-none cursor-pointer"
        >
          ←
        </button>
        <div>
          <p className="text-base font-medium">출석 체크</p>
          <p className="text-xs text-gray-500 mt-0.5">
            {user.fam} · {getSundayLabel(sundayKey)} ({formatSundayKey(sundayKey)})
          </p>
        </div>
      </div>

      {/* 요약 칩 */}
      <div className="flex gap-2 px-5 py-2 border-b border-gray-300">
        <span className="text-xs bg-primary-light text-primary px-2.5 py-1 rounded-full">
          전체 {FAM_MEMBERS.length}
        </span>
        <span className="text-xs text-gray-500 px-2.5 py-1 rounded-full bg-gray-100">
          예배 {worshipCount}
        </span>
        <span className="text-xs text-gray-500 px-2.5 py-1 rounded-full bg-gray-100">
          팸모임 {famCount}
        </span>
      </div>

      {/* 체크 열 헤더 */}
      <div className="flex px-5 py-2 border-b border-gray-300">
        <div className="flex-1" />
        <div className="w-[52px] text-center">
          <span className="text-[11px] font-medium text-primary">예배</span>
        </div>
        <div className="w-[52px] text-center">
          <span className="text-[11px] font-medium text-warning">팸모임</span>
        </div>
      </div>

      {/* 멤버 리스트 */}
      <div className="px-5">
        {FAM_MEMBERS.map((member) => {
          const color = getAvatarColor(member.id)
          const worshipChecked = getChecked(member.id, 'worship') === true
          const famChecked = getChecked(member.id, 'fam') === true
          return (
            <div
              key={member.id}
              className="flex items-center py-3 border-b border-gray-300 last:border-b-0"
            >
              <div className="flex-1 flex items-center gap-2.5">
                <div
                  className={`w-9 h-9 rounded-full ${color.bg} flex items-center justify-center text-[13px] font-medium ${color.text}`}
                >
                  {member.name[0]}
                </div>
                <div>
                  <p className="text-sm">{member.name}</p>
                  <p className="text-[11px] text-gray-500">{member.role}</p>
                </div>
              </div>
              {/* 예배 체크 */}
              <div className="w-[52px] flex justify-center">
                <button
                  onClick={() => toggleCheck(member.id, 'worship')}
                  className={`w-[26px] h-[26px] rounded-full flex items-center justify-center text-xs border-none cursor-pointer transition-all ${
                    worshipChecked
                      ? 'bg-primary-light text-primary'
                      : 'bg-transparent text-transparent'
                  }`}
                  style={!worshipChecked ? { border: '1.5px solid #CCCCCC' } : {}}
                >
                  ✓
                </button>
              </div>
              {/* 팸모임 체크 */}
              <div className="w-[52px] flex justify-center">
                <button
                  onClick={() => toggleCheck(member.id, 'fam')}
                  className={`w-[26px] h-[26px] rounded-full flex items-center justify-center text-xs border-none cursor-pointer transition-all ${
                    famChecked
                      ? 'bg-warning-light text-warning'
                      : 'bg-transparent text-transparent'
                  }`}
                  style={!famChecked ? { border: '1.5px solid #CCCCCC' } : {}}
                >
                  ✓
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {/* 범례 */}
      <div className="flex gap-3 justify-center py-3 border-t border-gray-300">
        <div className="flex items-center gap-1">
          <div className="w-2.5 h-2.5 rounded-full bg-primary-light" />
          <span className="text-[11px] text-gray-500">예배 출석</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2.5 h-2.5 rounded-full bg-warning-light" />
          <span className="text-[11px] text-gray-500">팸모임 출석</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2.5 h-2.5 rounded-full border border-gray-300" />
          <span className="text-[11px] text-gray-500">결석</span>
        </div>
      </div>

      {/* 저장 버튼 */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] px-5 py-3 bg-white border-t border-gray-300">
        <button className="w-full py-3 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-hover transition-colors border-none cursor-pointer">
          출석 저장하기
        </button>
      </div>
    </div>
  )
}
