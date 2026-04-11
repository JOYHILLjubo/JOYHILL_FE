import NoticePageConnected from './NoticePageConnected'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import BottomNav from '../components/BottomNav'

export const notices = [
  {
    id: 1,
    title: '봄 수련회 참가 신청 안내',
    content: '양양 해변에서 진행되는 1박2일 수련회입니다. 참가를 원하시는 분은 팸 리더에게 신청해주세요.\n\n일정: 2025년 4월 18일(금) ~ 19일(토)\n장소: 강원도 양양 해변 수련원\n참가비: 50,000원\n\n신청은 각 팸 리더를 통해 3월 31일까지 해주세요. 많은 참여 부탁드립니다!',
    author: '청년부',
    date: '2025.03.15',
    pinned: true,
    tag: '행사',
    teamTag: null,
    file: null,
    deadline: '2025-03-31',
  },
  {
    id: 2,
    title: '새가족 환영회 안내',
    content: '최근 등록하신 새가족분들을 환영하는 시간입니다. 예배 후 친교실에서 진행됩니다.\n\n일시: 2025년 3월 23일(일) 오후 1시\n장소: 친교실\n\n새가족 여러분을 따뜻하게 맞이하겠습니다. 기존 성도 여러분들도 함께해 주세요!',
    author: '새가족팀',
    date: '2025.03.14',
    pinned: true,
    tag: '안내',
    teamTag: '새가족팀',
    file: null,
    deadline: null,
  },
  {
    id: 3,
    title: '3월 찬양팀 연습 일정',
    content: '이번 달 찬양팀 연습은 매주 토요일 오후 2시입니다. 팀원 모두 참석 부탁드립니다.\n\n장소: 본당 2층 연습실\n시간: 매주 토요일 14:00 ~ 16:00\n\n불참 시 전날까지 팀장에게 연락해 주세요.',
    author: '찬양팀',
    date: '2025.03.13',
    pinned: false,
    tag: '안내',
    teamTag: '찬양팀',
    file: null,
    deadline: null,
  },
  {
    id: 4,
    title: '주차장 보수 공사 안내',
    content: '3월 중 주차장 보수 공사로 일부 구역 사용이 제한됩니다. 대중교통 이용을 부탁드립니다.\n\n공사 기간: 2025년 3월 17일(월) ~ 3월 28일(금)\n영향 구역: 정문 주차장 A구역\n\n불편을 드려 죄송합니다. 지하 주차장 및 B구역은 정상 이용 가능합니다.',
    author: '관리부',
    date: '2025.03.12',
    pinned: false,
    tag: '안내',
    teamTag: null,
    file: null,
    deadline: '2025-03-28',
  },
  {
    id: 5,
    title: '3월 생일 축하 안내',
    content: '3월 생일자분들을 축하합니다. 이번 주일 예배 후 축하 시간이 있습니다.\n\n3월 생일자: 김민수, 이은혜, 박준호, 정하늘\n\n축하 시간은 예배 직후 로비에서 진행됩니다. 생일자분들은 자리를 지켜주세요 🎉',
    author: '친교부',
    date: '2025.03.10',
    pinned: false,
    tag: '소식',
    teamTag: null,
    file: null,
    deadline: null,
  },
]

const tagColors = {
  행사: { bg: 'bg-primary-light', text: 'text-primary' },
  안내: { bg: 'bg-warning-light', text: 'text-warning' },
  소식: { bg: 'bg-success-light', text: 'text-success' },
  모집: { bg: 'bg-danger-light', text: 'text-danger' },
}

function LegacyNoticePage() {
  const navigate = useNavigate()
  const { canWriteNotice } = useAuth()
  const [filter, setFilter] = useState('전체')
  const [searchQuery, setSearchQuery] = useState('')
  const filters = ['전체', '행사', '안내', '소식', '모집']

  const filtered = notices.filter((n) => {
    const matchFilter = filter === '전체' || n.tag === filter
    const matchSearch = searchQuery === '' || n.title.includes(searchQuery)
    return matchFilter && matchSearch
  })

  return (
    <div className="pb-20">
      {/* 헤더 */}
      <div className="flex justify-between items-center px-5 pt-4 pb-3">
        <p className="text-lg font-medium">📢 공지사항</p>
        {canWriteNotice && (
          <button onClick={() => navigate('/notice/write')}
            className="text-xs text-white bg-primary px-3 py-1.5 rounded-full border-none cursor-pointer">
            + 작성
          </button>
        )}
      </div>

      {/* 검색 */}
      <div className="px-5 mb-3">
        <input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="검색어를 입력하세요"
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-primary" />
      </div>

      {/* 필터 */}
      <div className="flex gap-2 px-5 mb-3 overflow-x-auto">
        {filters.map((f) => (
          <button key={f} onClick={() => setFilter(f)}
            className={`text-xs px-2.5 py-1 rounded-full border-none cursor-pointer transition-colors whitespace-nowrap ${
              filter === f ? 'bg-primary-light text-primary' : 'bg-gray-100 text-gray-500'
            }`}>
            {f}
          </button>
        ))}
      </div>

      {/* 공지 리스트 */}
      <div className="px-5">
        {filtered.length === 0 && (
          <p className="text-sm text-gray-500 text-center mt-10">검색 결과가 없습니다.</p>
        )}
        {filtered.map((notice) => {
          const color = tagColors[notice.tag] || tagColors['소식']
          return (
            <div key={notice.id}
              onClick={() => navigate(`/notice/${notice.id}`, { state: { notice } })}
              className={`border border-gray-300 rounded-xl p-4 mb-2 cursor-pointer hover:bg-gray-100/60 transition-colors ${
                notice.pinned ? 'bg-gray-100/50' : ''
              }`}
            >
              <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                {notice.pinned && (
                  <span className="text-[11px] text-danger bg-danger-light px-1.5 py-0.5 rounded">고정</span>
                )}
                <span className={`text-[11px] ${color.text} ${color.bg} px-1.5 py-0.5 rounded`}>
                  {notice.tag}
                </span>
                {notice.teamTag && (
                  <span className="text-[11px] text-warning bg-warning-light px-1.5 py-0.5 rounded">
                    {notice.teamTag}
                  </span>
                )}
              </div>
              <p className="text-sm font-medium">{notice.title}</p>
              <p className="text-[13px] text-gray-500 mt-1 leading-relaxed line-clamp-2">
                {notice.content.split('\n')[0]}
              </p>
              <div className="flex gap-2 mt-2">
                <span className="text-[11px] text-gray-500">{notice.author}</span>
                <span className="text-[11px] text-gray-500">·</span>
                <span className="text-[11px] text-gray-500">{notice.date}</span>
              </div>
            </div>
          )
        })}
      </div>

      <BottomNav />
    </div>
  )
}

export default NoticePageConnected
