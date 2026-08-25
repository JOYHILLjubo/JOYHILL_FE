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

  // 화면 바닥에 붙이지 않고 좌우/아래를 띄운 "플로팅 바" 형태다. 바깥 래퍼는 좌우 여백까지
  // 포함해서 폭을 잡되 pointer-events-none으로 두고, 실제 바(안쪽 div)만 탭을 받는다 —
  // 안 그러면 바 옆 빈 공간이 그 아래 컨텐츠의 터치를 가로챈다.
  return (
    <nav
      className="fixed left-1/2 -translate-x-1/2 w-full max-w-[430px] px-4 z-50 pointer-events-none"
      style={{ bottom: 'calc(6px + env(safe-area-inset-bottom, 0px))' }}
    >
      <div className="jh-floating-nav pointer-events-auto flex justify-around items-center rounded-[28px] border border-gray-200 px-1 py-2">
        {tabs.map((tab) => {
          const isActive = location.pathname.startsWith(tab.path)
          return (
            <button
              key={tab.path}
              onClick={() => navigate(tab.path)}
              className="jh-nav-tab flex flex-col items-center justify-center gap-1 bg-transparent border-none cursor-pointer min-w-[52px] px-1 py-0.5"
            >
              <span
                className={`flex items-center justify-center w-12 h-[34px] rounded-[16px] transition-colors duration-150 ${
                  isActive ? 'bg-primary-light' : 'bg-transparent'
                }`}
              >
                <tab.Icon
                  size={23}
                  strokeWidth={isActive ? 2.2 : 1.7}
                  className={isActive ? 'text-primary' : 'text-gray-500'}
                />
              </span>
              <span
                className={`text-[11px] leading-none ${
                  isActive ? 'text-primary font-semibold' : 'text-gray-500'
                }`}
              >
                {tab.label}
              </span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
