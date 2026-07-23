// 홈 화면에서 자리잡은 "흰 카드 + 그림자(테두리 없음)" 스타일을 앱 전체에서 재사용하기 위한 공유 컴포넌트.
// 패딩/마진/최소높이 등 카드마다 다른 부분은 className으로 그대로 넘겨서 기존 다양성을 유지한다.
export default function Card({ children, className = '', as: Component = 'div', ...rest }) {
  return (
    <Component className={`bg-surface rounded-2xl shadow-sm ${className}`} {...rest}>
      {children}
    </Component>
  )
}
