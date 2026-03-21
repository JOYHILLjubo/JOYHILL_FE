import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const baseTabs = [
  { path: '/home', label: '홈', icon: '🏠' },
  { path: '/notice', label: '공지', icon: '📢' },
  { path: '/prayer', label: '기도', icon: '🙏' },
  { path: '/my', label: 'MY', icon: '👤' },
]

const leaderTab = { path: '/attendance', label: '출석', icon: '✅' }

export default function BottomNav() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuth()

  // 출석 탭은 리더(팸 담당)만 표시
  // 마을장 이상은 출석 탭 없음 (통계만 MY에서 확인)
  const isLeader = user.role === 'leader'

  const tabs = isLeader
    ? [baseTabs[0], baseTabs[1], leaderTab, baseTabs[2], baseTabs[3]]
    : baseTabs

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-white border-t border-gray-300 flex justify-around py-2 pb-3 z-50">
      {tabs.map((tab) => {
        const isActive = location.pathname.startsWith(tab.path)
        return (
          <button
            key={tab.path}
            onClick={() => navigate(tab.path)}
            className="flex flex-col items-center gap-0.5 bg-transparent border-none cursor-pointer"
          >
            <span className="text-base">{tab.icon}</span>
            <span
              className={`text-[11px] ${
                isActive ? 'text-primary font-medium' : 'text-gray-500'
              }`}
            >
              {tab.label}
            </span>
          </button>
        )
      })}
    </nav>
  )
}
