// 홈 화면의 작은 회색 "eyebrow" 스타일 섹션 제목. 오른쪽에 "전체보기" 같은 보조 액션을 함께 둘 수 있다.
export default function SectionLabel({ children, action, className = '' }) {
  return (
    <div className={`flex items-center justify-between mb-2 px-1 ${className}`}>
      <p className="text-[13px] font-semibold text-gray-500">{children}</p>
      {action}
    </div>
  )
}
