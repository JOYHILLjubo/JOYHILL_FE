import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Home, Bell, HandHeart, User, ClipboardList } from 'lucide-react'

const baseTabs = [
  { path: '/home', label: '홈', Icon: Home },
  { path: '/notice', label: '공지', Icon: Bell },
  { path: '/prayer', label: '기도', Icon: HandHeart },
  { path: '/my', label: 'MY', Icon: User },
]

const leaderTab = { path: '/attendance', label: '출석', Icon: ClipboardList }

export default function BottomNav() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuth()

  const isLeader = user.role === 'leader'
  const isAdmin = user.role === 'admin'

  // 관리자: 기도 탭 제거
  const filteredBase = isAdmin
    ? baseTabs.filter((tab) => tab.path !== '/prayer')
    : baseTabs

  // 리더: 출석 탭 추가
  const tabs = isLeader
    ? [filteredBase[0], filteredBase[1], leaderTab, filteredBase[2], filteredBase[3]]
    : filteredBase

  return (
    <nav
      className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-white border-t border-gray-300 flex justify-around z-50"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)', paddingTop: '8px', height: 'calc(64px + env(safe-area-inset-bottom, 0px))' }}
    >
      {tabs.map((tab) => {
        const isActive = location.pathname.startsWith(tab.path)
        return (
          <button
            key={tab.path}
            onClick={() => navigate(tab.path)}
            className="flex flex-col items-center justify-center gap-1 bg-transparent border-none cursor-pointer min-w-[32px] px-2"
          >
            <tab.Icon
              size={24}
              strokeWidth={isActive ? 2 : 1.5}
              className={isActive ? 'text-primary' : 'text-gray-500'}
            />
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
