import PrayerWritePageConnected from './PrayerWritePageConnected'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

function LegacyPrayerWritePage() {
  const navigate = useNavigate()
  const [content, setContent] = useState('')

  const handleSubmit = () => {
    // TODO: API 연동
    navigate('/prayer')
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* 헤더 */}
      <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-gray-300">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/prayer')}
            className="text-lg bg-transparent border-none cursor-pointer"
          >
            ←
          </button>
          <p className="text-base font-medium">기도제목 작성</p>
        </div>
        <button
          onClick={handleSubmit}
          disabled={!content.trim()}
          className={`text-sm font-medium px-4 py-1.5 rounded-full border-none cursor-pointer transition-colors ${
            content.trim()
              ? 'bg-primary text-white'
              : 'bg-gray-100 text-gray-500 cursor-not-allowed'
          }`}
        >
          등록
        </button>
      </div>

      {/* 프로필 */}
      <div className="flex items-center gap-2 px-5 pt-4 pb-2">
        <div className="w-9 h-9 rounded-full bg-primary-light flex items-center justify-center text-[13px] font-medium text-primary">
          김
        </div>
        <div>
          <p className="text-sm font-medium">김리더</p>
          <p className="text-[11px] text-gray-500">사랑셀 · 3월 3주차</p>
        </div>
      </div>

      {/* 기도제목 입력 */}
      <div className="flex-1 px-5 pt-2">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="기도제목을 작성해주세요.&#10;&#10;"
          className="w-full h-48 p-3 border border-gray-300 rounded-xl text-sm leading-relaxed resize-none focus:outline-none focus:border-primary placeholder:text-gray-500 placeholder:text-[13px]"
        />

        {/* 글자 수 */}
        <div className="flex justify-end mt-1">
          <span className={`text-xs ${content.length > 200 ? 'text-danger' : 'text-gray-500'}`}>
            {content.length} / 200
          </span>
        </div>
      </div>

      {/* 안내 */}
      <div className="px-5 pb-8">
        <div className="bg-gray-100 rounded-lg p-3">
          <p className="text-xs text-gray-500 leading-relaxed">
            💡 작성한 기도제목은 같은 셀 리더와 셀원들에게 공유됩니다.
            셀원들이 '기도 중' 반응을 보내 함께 기도할 수 있어요.
          </p>
        </div>
      </div>
    </div>
  )
}

export default PrayerWritePageConnected
