import { useNavigate, useLocation, useParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { notices } from './NoticePage'
import BottomNav from '../components/BottomNav'

const tagColors = {
  행사: { bg: 'bg-primary-light', text: 'text-primary' },
  안내: { bg: 'bg-warning-light', text: 'text-warning' },
  소식: { bg: 'bg-success-light', text: 'text-success' },
  신청: { bg: 'bg-danger-light', text: 'text-danger' },
}

export default function NoticeDetailPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { id } = useParams()
  const { canWriteNotice } = useAuth()

  // state로 넘어온 경우 우선 사용, 없으면 notices 배열에서 찾기
  const notice = location.state?.notice || notices.find((n) => n.id === Number(id))

  if (!notice) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <p className="text-gray-500 text-sm">공지사항을 찾을 수 없습니다.</p>
        <button onClick={() => navigate('/notice')}
          className="mt-3 text-xs text-primary bg-primary-light px-4 py-2 rounded-full border-none cursor-pointer">
          목록으로
        </button>
      </div>
    )
  }

  const color = tagColors[notice.tag] || tagColors['소식']

  return (
    <div className="pb-20">
      {/* 헤더 */}
      <div className="flex items-center gap-3 px-5 pt-4 pb-3 border-b border-gray-300">
        <button onClick={() => navigate('/notice')} className="text-lg bg-transparent border-none cursor-pointer">←</button>
        <p className="text-base font-medium flex-1">공지사항</p>
        {canWriteNotice && (
          <button className="text-xs text-gray-500 bg-gray-100 px-3 py-1.5 rounded-full border-none cursor-pointer">
            수정
          </button>
        )}
      </div>

      <div className="px-5 pt-5 pb-6">
        {/* 태그 뱃지 */}
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          {notice.pinned && (
            <span className="text-[11px] text-danger bg-danger-light px-2 py-0.5 rounded-full">고정</span>
          )}
          <span className={`text-[11px] ${color.text} ${color.bg} px-2 py-0.5 rounded-full`}>
            {notice.tag}
          </span>
          {notice.teamTag && (
            <span className="text-[11px] text-warning bg-warning-light px-2 py-0.5 rounded-full">
              {notice.teamTag}
            </span>
          )}
        </div>

        {/* 제목 */}
        <h1 className="text-[17px] font-semibold leading-snug mb-3">{notice.title}</h1>

        {/* 메타 정보 */}
        <div className="flex items-center gap-2 pb-4 border-b border-gray-300">
          <div className="w-7 h-7 rounded-full bg-primary-light flex items-center justify-center text-xs font-medium text-primary shrink-0">
            {notice.author[0]}
          </div>
          <div>
            <p className="text-xs font-medium">{notice.author}</p>
            <p className="text-[11px] text-gray-500">{notice.date}</p>
          </div>
          {notice.deadline && (
            <span className="ml-auto text-[11px] text-warning bg-warning-light px-2 py-0.5 rounded-full">
              ~{notice.deadline}
            </span>
          )}
        </div>

        {/* 본문 */}
        <div className="pt-4">
          <p className="text-sm leading-relaxed text-gray-700 whitespace-pre-line">
            {notice.content}
          </p>
        </div>

        {/* 첨부파일 */}
        {notice.file && (
          <div className="mt-5 pt-4 border-t border-gray-300">
            <p className="text-xs text-gray-500 mb-2">첨부파일</p>
            <div className="flex items-center gap-2.5 border border-gray-300 rounded-lg px-3 py-2.5">
              <span className="text-base">📎</span>
              <span className="text-sm text-primary">{notice.file}</span>
            </div>
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  )
}
