import SermonUploadPageConnected from './SermonUploadPageConnected'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useSermon } from '../context/SermonContext'

// 유튜브 URL 유효성 검사
function isValidYoutubeUrl(url) {
  return url && (url.includes('youtube.com/watch') || url.includes('youtu.be/') || url.includes('youtube.com/live/'))
}

// 유튜브 URL → 썸네일
function getYoutubeThumbnail(url) {
  if (!url) return null
  const matchWatch = url.match(/(?:youtube\.com\/watch\?v=)([^&]+)/)
  const matchShort = url.match(/(?:youtu\.be\/)([^?]+)/)
  const matchLive = url.match(/(?:youtube\.com\/live\/)([^?]+)/)
  const id = matchWatch?.[1] || matchShort?.[1] || matchLive?.[1]
  return id ? `https://img.youtube.com/vi/${id}/mqdefault.jpg` : null
}

function LegacySermonUploadPage() {
  const navigate = useNavigate()
  const { isPastorOrAbove, isAdmin } = useAuth()
  const { sermon, setSermon } = useSermon()

  const [form, setForm] = useState({ ...sermon })
  const [saved, setSaved] = useState(false)
  const [urlError, setUrlError] = useState('')

  // 접근 권한 (교역자·부장·관리자)
  if (!isPastorOrAbove && !isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <p className="text-gray-500 text-sm">접근 권한이 없습니다.</p>
        <button onClick={() => navigate('/my')}
          className="mt-3 text-xs text-primary bg-primary-light px-4 py-2 rounded-full border-none cursor-pointer">
          돌아가기
        </button>
      </div>
    )
  }

  const handleUrlChange = (val) => {
    setForm({ ...form, youtubeUrl: val })
    if (val && !isValidYoutubeUrl(val)) {
      setUrlError('유효한 유튜브 URL을 입력해주세요. (youtube.com/watch?v=... 또는 youtu.be/...)')
    } else {
      setUrlError('')
    }
  }

  const handleSave = () => {
    if (!form.title.trim()) { alert('설교 제목을 입력해주세요.'); return }
    if (!form.preacher.trim()) { alert('설교자를 입력해주세요.'); return }
    if (form.youtubeUrl && !isValidYoutubeUrl(form.youtubeUrl)) {
      alert('유효한 유튜브 URL을 입력해주세요.'); return
    }
    setSermon({ ...form })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const thumbnail = getYoutubeThumbnail(form.youtubeUrl)

  return (
    <div className="pb-28">
      {/* 헤더 */}
      <div className="flex items-center gap-3 px-5 pt-4 pb-3 border-b border-gray-300">
        <button onClick={() => navigate('/my')} className="text-lg bg-transparent border-none cursor-pointer">←</button>
        <p className="text-base font-medium">설교 업로드</p>
      </div>

      {/* 미리보기 */}
      <div className="px-5 pt-4 pb-2">
        <p className="text-xs text-gray-500 mb-2">미리보기</p>
        <div className="bg-gradient-to-br from-primary to-primary-hover rounded-2xl p-5 text-white">
          <div className="flex items-center justify-between">
            <p className="text-[11px] opacity-80">이번 주 설교</p>
            {form.youtubeUrl && isValidYoutubeUrl(form.youtubeUrl) && (
              <span className="text-[11px] opacity-70">▶ YouTube</span>
            )}
          </div>
          <p className="text-base font-medium mt-1.5 mb-1 leading-snug">
            "{form.title || '설교 제목'}"
          </p>
          <p className="text-xs opacity-70">
            {form.verse || '본문 말씀'} · {form.preacher || '설교자'}
          </p>
          {form.summary && (
            <div className="mt-3 pt-3 border-t border-white/20">
              <p className="text-xs leading-relaxed opacity-90">"{form.summary}"</p>
            </div>
          )}
        </div>

        {/* 유튜브 썸네일 미리보기 */}
        {thumbnail && (
          <div className="mt-2 rounded-xl overflow-hidden border border-gray-300">
            <img src={thumbnail} alt="유튜브 썸네일" className="w-full object-cover" />
          </div>
        )}
      </div>

      {/* 입력 폼 */}
      <div className="px-5 pt-2 flex flex-col gap-4">

        <div>
          <p className="text-xs text-gray-500 mb-1.5">설교 제목 <span className="text-danger">*</span></p>
          <input
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="예) 흔들리지 않는 믿음"
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-primary"
          />
        </div>

        <div>
          <p className="text-xs text-gray-500 mb-1.5">본문 말씀</p>
          <input
            value={form.verse}
            onChange={(e) => setForm({ ...form, verse: e.target.value })}
            placeholder="예) 히브리서 11:1-6"
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-primary"
          />
        </div>

        <div>
          <p className="text-xs text-gray-500 mb-1.5">설교자 <span className="text-danger">*</span></p>
          <input
            value={form.preacher}
            onChange={(e) => setForm({ ...form, preacher: e.target.value })}
            placeholder="예) 김목사"
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-primary"
          />
        </div>

        <div>
          <p className="text-xs text-gray-500 mb-1.5">유튜브 URL</p>
          <input
            value={form.youtubeUrl}
            onChange={(e) => handleUrlChange(e.target.value)}
            placeholder="https://www.youtube.com/watch?v=..."
            className={`w-full border rounded-lg px-3 py-2.5 text-sm outline-none transition-colors ${
              urlError ? 'border-danger focus:border-danger' : 'border-gray-300 focus:border-primary'
            }`}
          />
          {urlError && <p className="text-[11px] text-danger mt-1 ml-1">{urlError}</p>}
          {!urlError && form.youtubeUrl && isValidYoutubeUrl(form.youtubeUrl) && (
            <p className="text-[11px] text-success mt-1 ml-1">✓ 유효한 유튜브 URL입니다.</p>
          )}
          <p className="text-[11px] text-gray-500 mt-1 ml-1">
            홈 화면 설교 카드를 누르면 해당 영상으로 연결됩니다.
          </p>
        </div>

        <div>
          <p className="text-xs text-gray-500 mb-1.5">설교 요약 (선택)</p>
          <textarea
            value={form.summary}
            onChange={(e) => setForm({ ...form, summary: e.target.value })}
            placeholder="설교 핵심 구절이나 짧은 요약을 입력하세요"
            rows={3}
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-primary resize-none"
          />
        </div>
      </div>

      {/* 저장 버튼 */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] px-5 py-3 bg-white border-t border-gray-300">
        <button
          onClick={handleSave}
          className={`w-full py-3 rounded-lg text-sm font-medium border-none cursor-pointer transition-colors ${
            saved ? 'bg-success text-white' : 'bg-primary text-white hover:bg-primary-hover'
          }`}
        >
          {saved ? '✓ 저장되었습니다' : '홈 화면에 업로드'}
        </button>
      </div>
    </div>
  )
}

export default SermonUploadPageConnected
