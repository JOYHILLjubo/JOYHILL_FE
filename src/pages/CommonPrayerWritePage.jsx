import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'

// 기존 공동 기도제목 (수정 시 불러오기용)
const existingCommonPrayers = {
  1: '새해를 맞아 모든 셀원이 건강하고 은혜 가운데 한 해를 시작할 수 있도록',
  2: '서로를 향한 사랑이 더 깊어지고, 전도의 열매가 맺어지도록',
  3: '우리 셀이 하나님의 사랑 안에서 더 깊은 교제를 나눌 수 있도록',
}

export default function CommonPrayerWritePage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const month = searchParams.get('month') || '3'
  const isEdit = searchParams.get('edit') === 'true'

  const existing = existingCommonPrayers[Number(month)] || ''
  const [content, setContent] = useState(isEdit ? existing : '')

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
          <p className="text-base font-medium">
            {isEdit ? '공동 기도제목 수정' : '공동 기도제목 작성'}
          </p>
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
          {isEdit ? '수정' : '등록'}
        </button>
      </div>

      {/* 안내 배지 */}
      <div className="px-5 pt-4 pb-2">
        <div className="inline-flex items-center gap-1.5 bg-primary-light px-3 py-1.5 rounded-full">
          <span className="text-xs font-medium text-primary-hover">🙏 {month}월 셀 공동 기도제목</span>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          {isEdit
            ? '공동 기도제목을 수정합니다. 셀원 모두에게 반영됩니다.'
            : '매월 작성할 수 있으며, 셀원 모두에게 공유됩니다.'}
        </p>
      </div>

      {/* 입력 */}
      <div className="flex-1 px-5 pt-3">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="이번 달 셀에서 함께 기도할 제목을 작성해주세요.&#10;&#10;예) 우리 셀이 하나님의 사랑 안에서 더 깊은 교제를 나눌 수 있도록"
          className="w-full h-40 p-3 border border-gray-300 rounded-xl text-sm leading-relaxed resize-none focus:outline-none focus:border-primary placeholder:text-gray-500 placeholder:text-[13px]"
        />
        <div className="flex justify-end mt-1">
          <span className={`text-xs ${content.length > 100 ? 'text-danger' : 'text-gray-500'}`}>
            {content.length} / 100
          </span>
        </div>
      </div>

      {/* 안내 */}
      <div className="px-5 pb-8">
        <div className="bg-primary-light rounded-lg p-3">
          <p className="text-xs text-primary-hover leading-relaxed">
            💡 공동 기도제목은 언제든 수정할 수 있어요.
            셀 전체가 함께 기도하는 주제로 작성해주세요.
          </p>
        </div>
      </div>
    </div>
  )
}
