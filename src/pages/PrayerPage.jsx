import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import BottomNav from '../components/BottomNav'

// 이번 주 일요일 기준 주차 계산
function getThisWeek() {
  const today = new Date()
  const day = today.getDay()
  const sunday = new Date(today)
  sunday.setDate(today.getDate() - day)
  return { month: sunday.getMonth() + 1, week: getWeekOfMonth(sunday) }
}

function getWeekOfMonth(date) {
  const firstSunday = new Date(date.getFullYear(), date.getMonth(), 1)
  while (firstSunday.getDay() !== 0) firstSunday.setDate(firstSunday.getDate() + 1)
  const diff = Math.floor((date - firstSunday) / (7 * 24 * 60 * 60 * 1000))
  return diff + 1
}

function getWeeks() {
  const weeks = []
  const months = [1, 2, 3, 4]
  for (const m of months) {
    for (let w = 1; w <= 4; w++) {
      weeks.push({ month: m, week: w, label: `${m}월 ${w}주차` })
    }
  }
  return weeks
}

const commonPrayerByMonth = {
  1: '새해를 맞아 모든 팸원이 건강하고 은혜 가운데 한 해를 시작할 수 있도록',
  2: '서로를 향한 사랑이 더 깊어지고, 전도의 열매가 맺어지도록',
  3: '우리 팸이 하나님의 사랑 안에서 더 깊은 교제를 나눌 수 있도록',
}

const prayerData = {
  '3-3': [
    { id: 1, name: '김민수', content: '이번 주 시험이 있어서 집중해서 준비할 수 있도록 기도 부탁드려요.' },
    { id: 2, name: '이은혜', content: '부모님 건강이 안 좋으셔서 빠른 쾌유를 위해 기도 부탁드립니다.' },
    { id: 3, name: '정하늘', content: '취업 면접 잘 볼 수 있도록 기도해주세요.' },
    { id: 4, name: '박준호', content: null },
    { id: 5, name: '최수진', content: '직장에서 좋은 관계를 맺을 수 있도록' },
  ],
  '3-2': [
    { id: 1, name: '김민수', content: '중간고사 준비 잘 할 수 있도록' },
    { id: 2, name: '이은혜', content: '어머니 수술 잘 되게 해주세요' },
    { id: 3, name: '정하늘', content: '이력서 준비 잘 되도록' },
    { id: 4, name: '박준호', content: '신앙이 성장하도록' },
    { id: 5, name: '최수진', content: null },
  ],
}

const avatarColors = [
  { bg: 'bg-primary-light', text: 'text-primary' },
  { bg: 'bg-success-light', text: 'text-success' },
  { bg: 'bg-warning-light', text: 'text-warning' },
  { bg: 'bg-danger-light', text: 'text-danger' },
]

function getColor(id) {
  return avatarColors[id % avatarColors.length]
}

export default function PrayerPage() {
  const navigate = useNavigate()
  const weeks = getWeeks()
  const [selectedWeek, setSelectedWeek] = useState(getThisWeek())
  const [showWeekPicker, setShowWeekPicker] = useState(false)

  const weekKey = `${selectedWeek.month}-${selectedWeek.week}`
  const prayers = prayerData[weekKey] || []
  const commonPrayer = commonPrayerByMonth[selectedWeek.month] || null

  return (
    <div className="pb-20">
      {/* 헤더 */}
      <div className="px-5 pt-4 pb-3">
        <p className="text-lg font-medium">🙏 기도제목</p>
        <p className="text-xs text-gray-500 mt-0.5">사랑팸</p>
      </div>

      {/* 주차 선택 */}
      <div className="px-5 mb-3">
        <button
          onClick={() => setShowWeekPicker(!showWeekPicker)}
          className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg text-sm border-none cursor-pointer w-full justify-between"
        >
          <span className="font-medium">
            {selectedWeek.month}월 {selectedWeek.week}주차
          </span>
          <span className="text-gray-500 text-xs">{showWeekPicker ? '▲' : '▼'}</span>
        </button>

        {showWeekPicker && (
          <div className="mt-1 border border-gray-300 rounded-lg bg-white max-h-48 overflow-y-auto">
            {weeks.map((w) => {
              const isSelected =
                w.month === selectedWeek.month && w.week === selectedWeek.week
              return (
                <button
                  key={w.label}
                  onClick={() => {
                    setSelectedWeek({ month: w.month, week: w.week })
                    setShowWeekPicker(false)
                  }}
                  className={`w-full text-left px-3 py-2.5 text-sm border-none cursor-pointer border-b border-gray-300 last:border-b-0 ${
                    isSelected
                      ? 'bg-primary-light text-primary font-medium'
                      : 'bg-white hover:bg-gray-100'
                  }`}
                >
                  {w.label}
                </button>
              )
            })}
          </div>
        )}
      </div>

      {/* 팸 공동 기도제목 (월 단위) */}
      <div className="px-5 mb-4">
        <div className="bg-primary-light rounded-xl p-4">
          <div className="flex justify-between items-start mb-1">
            <p className="text-[13px] font-medium text-primary-hover">
              {selectedWeek.month}월 팸 공동 기도제목
            </p>
            <button
              onClick={() =>
                navigate(
                  `/prayer/common/write?month=${selectedWeek.month}${
                    commonPrayer ? '&edit=true' : ''
                  }`
                )
              }
              className="text-[11px] text-primary-hover bg-white px-2 py-1 rounded-full border border-primary-hover cursor-pointer hover:bg-white/80 transition-colors shrink-0 ml-2"
            >
              {commonPrayer ? '수정하기' : '작성하기'}
            </button>
          </div>
          {commonPrayer ? (
            <p className="text-[13px] leading-relaxed">{commonPrayer}</p>
          ) : (
            <p className="text-[13px] text-primary-hover opacity-60 mt-1">
              아직 이번 달 공동 기도제목이 등록되지 않았어요.
            </p>
          )}
        </div>
      </div>

      {/* 개인 기도제목 */}
      <div className="px-5">
        <p className="text-sm font-medium mb-2">개인 기도제목</p>

        {prayers.length === 0 ? (
          <div className="text-center py-10 text-gray-500 text-sm">
            이 주차에 등록된 기도제목이 없습니다.
          </div>
        ) : (
          prayers.map((prayer) => {
            const color = getColor(prayer.id)
            return (
              <div
                key={prayer.id}
                className="flex items-start gap-2 py-3 border-b border-gray-300 last:border-b-0"
              >
                <div
                  className={`w-7 h-7 rounded-full ${color.bg} flex items-center justify-center text-[11px] font-medium ${color.text} shrink-0 mt-0.5`}
                >
                  {prayer.name[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-medium">{prayer.name}</p>
                  {prayer.content ? (
                    <p className="text-[13px] mt-0.5 leading-relaxed">{prayer.content}</p>
                  ) : (
                    <p className="text-xs text-gray-500 mt-0.5">아직 미작성</p>
                  )}
                </div>
              </div>
            )
          })
        )}

        {/* 개인 기도제목 작성 버튼 */}
        <button
          onClick={() => navigate('/prayer/write')}
          className="w-full mt-4 py-2.5 border border-gray-300 rounded-lg text-[13px] text-primary bg-white cursor-pointer hover:bg-primary-light transition-colors"
        >
          + 내 기도제목 작성하기
        </button>
      </div>

      <BottomNav />
    </div>
  )
}
