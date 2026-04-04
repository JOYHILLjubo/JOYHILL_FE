import { Routes, Route, Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import LoginPage from './pages/LoginPage'
import HomePageConnected from './pages/HomePageConnected'
import NoticePageConnected from './pages/NoticePageConnected'
import NoticeWritePageConnected from './pages/NoticeWritePageConnected'
import NoticeDetailPageConnected from './pages/NoticeDetailPageConnected'
import AttendancePage from './pages/AttendancePage'
import AttendanceHistoryPage from './pages/AttendanceHistoryPage'
import AttendanceStatsPageConnected from './pages/AttendanceStatsPageConnected'
import PrayerPageConnected from './pages/PrayerPageConnected'
import PrayerWritePageConnected from './pages/PrayerWritePageConnected'
import CommonPrayerWritePage from './pages/CommonPrayerWritePage'
import MyPage from './pages/MyPage'
import MyEditPage from './pages/MyEditPage'
import NewcomerPageConnected from './pages/NewcomerPageConnected'
import TeamManagePageConnected from './pages/TeamManagePageConnected'
import FamManagePageConnected from './pages/FamManagePageConnected'
import VillageManagePageConnected from './pages/VillageManagePageConnected'
import SermonUploadPageConnected from './pages/SermonUploadPageConnected'
import AccountManagePageConnected from './pages/AccountManagePageConnected'

// 비로그인 상태에서만 접근 가능
function PublicOnlyRoute() {
  const { isAuthenticated } = useAuth()
  if (isAuthenticated) return <Navigate to="/home" replace />
  return <Outlet />
}

// 로그인 필요 + 비밀번호 최초 변경 강제
function ProtectedRoute() {
  const { isAuthenticated, user } = useAuth()
  const location = useLocation()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  // 최초 로그인: 비밀번호 변경 페이지 외 모든 접근 차단
  if (!user?.passwordChanged && location.pathname !== '/my/edit') {
    return <Navigate to="/my/edit" replace />
  }

  return <Outlet />
}

export default function App() {
  const { isAuthenticated } = useAuth()

  return (
    <div className="mobile-container">
      <Routes>
        <Route
          path="/"
          element={<Navigate to={isAuthenticated ? '/home' : '/login'} replace />}
        />

        <Route element={<PublicOnlyRoute />}>
          <Route path="/login" element={<LoginPage />} />
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route path="/home" element={<HomePageConnected />} />
          <Route path="/notice" element={<NoticePageConnected />} />
          <Route path="/notice/write" element={<NoticeWritePageConnected />} />
          <Route path="/notice/:id" element={<NoticeDetailPageConnected />} />
          <Route path="/attendance" element={<AttendancePage />} />
          <Route path="/attendance/history" element={<AttendanceHistoryPage />} />
          <Route path="/attendance/stats" element={<AttendanceStatsPageConnected />} />
          <Route path="/prayer" element={<PrayerPageConnected />} />
          <Route path="/prayer/write" element={<PrayerWritePageConnected />} />
          <Route path="/prayer/common/write" element={<CommonPrayerWritePage />} />
          <Route path="/my" element={<MyPage />} />
          <Route path="/my/edit" element={<MyEditPage />} />
          <Route path="/newcomer" element={<NewcomerPageConnected />} />
          <Route path="/team/manage" element={<TeamManagePageConnected />} />
          <Route path="/fam/manage" element={<FamManagePageConnected />} />
          <Route path="/village/manage" element={<VillageManagePageConnected />} />
          <Route path="/sermon/upload" element={<SermonUploadPageConnected />} />
          <Route path="/account/manage" element={<AccountManagePageConnected />} />
        </Route>

        <Route
          path="*"
          element={<Navigate to={isAuthenticated ? '/home' : '/login'} replace />}
        />
      </Routes>
    </div>
  )
}
