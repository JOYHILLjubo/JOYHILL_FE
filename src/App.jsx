import { Routes, Route, Navigate } from 'react-router-dom'
import LoginPage from './pages/LoginPage'
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

export default function App() {
  return (
    <div className="mobile-container">
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<LoginPage />} />
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
      </Routes>
    </div>
  )
}
