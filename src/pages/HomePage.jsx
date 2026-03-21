import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useSermon } from '../context/SermonContext'
import BottomNav from '../components/BottomNav'

function getYoutubeVideoId(url) {
  if (!url) return null
  const matchWatch = url.match(/youtube\.com\/watch\?v=([^&]+)/)
  const matchShort = url.match(/youtu\.be\/([^?]+)/)
  return matchWatch?.[1] || matchShort?.[1] || null
}

export default function HomePage() {
  const navigate = useNavigate()
  const { sermon } = useSermon()

  const videoId = getYoutubeVideoId(sermon.youtubeUrl)

  const handleSermonClick = () => {
    if (videoId) window.open(sermon.youtubeUrl, '_blank', 'noopener,noreferrer')
  }

  const today = new Date()
  const dateStr = `${today.getFullYear()}년 ${today.getMonth() + 1}월 ${today.getDate()}일`

  return (
    <div className="pb-20">
      {/* 헤더 */}
      <div className="flex justify-between items-center px-5 pt-4 pb-3">
        <div>
          <p className="text-[11px] text-gray-500">{dateStr}</p>
          <p className="text-lg font-medium mt-0.5">JOY 교회 주보</p>
        </div>
        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-sm">
          🔔
        </div>
      </div>

      {/* 이번 주 설교 카드 — 원래 스타일 유지, 클릭 시 유튜브 연결 */}
      <div className="px-5 mb-3">
        <div
          onClick={handleSermonClick}
          className={`bg-gradient-to-br from-primary to-primary-hover rounded-2xl p-5 text-white ${videoId ? 'cursor-pointer active:opacity-90' : ''}`}
        >
          <div className="flex items-center justify-between">
            <p className="text-[11px] opacity-80">이번 주 설교</p>
            {videoId && <span className="text-[11px] opacity-60">▶ YouTube</span>}
          </div>
          <p className="text-base font-medium mt-1.5 mb-1 leading-snug">
            "{sermon.title}"
          </p>
          <p className="text-xs opacity-70">{sermon.verse} · {sermon.preacher}</p>
          {sermon.summary && (
            <div className="mt-3 pt-3 border-t border-white/20">
              <p className="text-xs leading-relaxed opacity-90">"{sermon.summary}"</p>
            </div>
          )}
        </div>
      </div>

      {/* 광고 */}
      <div className="px-5 mb-3">
        <div className="border border-gray-300 rounded-xl p-4">
          <p className="text-[13px] font-medium mb-2.5">광고</p>
          <div className="py-1.5 border-b border-gray-100">
            <p className="text-[13px]">📌 봄 수련회 참가 신청 (3/27 마감)</p>
          </div>
          <div className="py-1.5 border-b border-gray-100">
            <p className="text-[13px]">📌 새가족 환영회 안내 (4/6)</p>
          </div>
          <div className="py-1.5">
            <p className="text-[13px]">📌 주차장 공사 안내 (3월 중)</p>
          </div>
        </div>
      </div>

      {/* 이번 주 일정 */}
      <div className="px-5 mb-3">
        <div className="border border-gray-300 rounded-xl p-4">
          <p className="text-[13px] font-medium mb-2.5">이번 주 일정</p>
          <div className="flex gap-2.5 items-start py-1.5 border-b border-gray-100">
            <div className="w-9 text-center shrink-0">
              <p className="text-[11px] text-gray-500 leading-tight">3/19</p>
              <p className="text-[11px] text-gray-500 leading-tight">수</p>
            </div>
            <p className="text-[13px]">수요 기도회</p>
          </div>
          <div className="flex gap-2.5 items-start py-1.5 border-b border-gray-100">
            <div className="w-9 text-center shrink-0">
              <p className="text-[11px] text-gray-500 leading-tight">3/21</p>
              <p className="text-[11px] text-gray-500 leading-tight">금</p>
            </div>
            <p className="text-[13px]">청년부 팸모임</p>
          </div>
          <div className="flex gap-2.5 items-start py-1.5">
            <div className="w-9 text-center shrink-0">
              <p className="text-[11px] text-gray-500 leading-tight">3/22</p>
              <p className="text-[11px] text-gray-500 leading-tight">토</p>
            </div>
            <div>
              <p className="text-[13px]">봄 수련회</p>
              <p className="text-[11px] text-primary mt-0.5">신청 마감 D-5</p>
            </div>
          </div>
        </div>
      </div>

      {/* 예배 안내 — 맨 아래 */}
      <div className="px-5 mb-3">
        <div className="border border-gray-300 rounded-xl p-4">
          <p className="text-[13px] font-medium mb-2.5">예배 안내</p>
          <div className="flex justify-between py-1.5 border-b border-gray-100">
            <span className="text-[13px]">1부 예배</span>
            <span className="text-[13px] text-gray-500">09:00 · 본당</span>
          </div>
          <div className="flex justify-between py-1.5 border-b border-gray-100">
            <span className="text-[13px]">2부 예배</span>
            <span className="text-[13px] text-gray-500">11:00 · 본당</span>
          </div>
          <div className="flex justify-between py-1.5">
            <span className="text-[13px]">수요 예배</span>
            <span className="text-[13px] text-gray-500">19:30 · 소예배실</span>
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  )
}
