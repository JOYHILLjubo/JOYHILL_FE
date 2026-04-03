import { Routes, Route, Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import LoginPage from './pages/LoginPage'
import SignupVerifyPage from './pages/SignupVerifyPage'
import SignupAccountPage from './pages/SignupAccountPage'
import HomePage from './pages/HomePage'
import NoticePage from './pages/NoticePage'
import NoticeWritePage from './pages/NoticeWritePage'
import NoticeDetailPage from './pages/NoticeDetailPage'
import AttendancePage from './pages/AttendancePage'
import AttendanceHistoryPage from './pages/AttendanceHistoryPage'
import AttendanceStatsPage from './pages/AttendanceStatsPage'
import PrayerPage from './pages/PrayerPage'
import PrayerWritePage from './pages/PrayerWritePage'
import CommonPrayerWritePage from './pages/CommonPrayerWritePage'
import MyPage from './pages/MyPage'
import MyEditPage from './pages/MyEditPage'
import NewcomerPage from './pages/NewcomerPage'
import TeamManagePage from './pages/TeamManagePage'
import FamManagePage from './pages/FamManagePage'
import VillageManagePage from './pages/VillageManagePage'
import SermonUploadPage from './pages/SermonUploadPage'
import AccountManagePage from './pages/AccountManagePage'

function ProtectedRoute() {
  const { isAuthenticated } = useAuth()
  const location = useLocation()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  return <Outlet />
}

function PublicOnlyRoute() {
  const { isAuthenticated } = useAuth()

  if (isAuthenticated) {
    return <Navigate to="/home" replace />
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
          <Route path="/signup/verify" element={<SignupVerifyPage />} />
          <Route path="/signup/account" element={<SignupAccountPage />} />
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route path="/home" element={<HomePage />} />
          <Route path="/notice" element={<NoticePage />} />
          <Route path="/notice/write" element={<NoticeWritePage />} />
          <Route path="/notice/:id" element={<NoticeDetailPage />} />
          <Route path="/attendance" element={<AttendancePage />} />
          <Route path="/attendance/history" element={<AttendanceHistoryPage />} />
          <Route path="/attendance/stats" element={<AttendanceStatsPage />} />
          <Route path="/prayer" element={<PrayerPage />} />
          <Route path="/prayer/write" element={<PrayerWritePage />} />
          <Route path="/prayer/common/write" element={<CommonPrayerWritePage />} />
          <Route path="/my" element={<MyPage />} />
          <Route path="/my/edit" element={<MyEditPage />} />
          <Route path="/newcomer" element={<NewcomerPage />} />
          <Route path="/team/manage" element={<TeamManagePage />} />
          <Route path="/fam/manage" element={<FamManagePage />} />
          <Route path="/village/manage" element={<VillageManagePage />} />
          <Route path="/sermon/upload" element={<SermonUploadPage />} />
          <Route path="/account/manage" element={<AccountManagePage />} />
        </Route>

        <Route
          path="*"
          element={<Navigate to={isAuthenticated ? '/home' : '/login'} replace />}
        />
      </Routes>
    </div>
  )
}
