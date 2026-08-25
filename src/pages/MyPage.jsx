import { useNavigate } from 'react-router-dom'
import BottomNav from '../components/BottomNav'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { BibleAvatarIcon } from '../components/BibleAvatars'

const THEME_LABELS = { light: '라이트', dark: '다크', sepia: '세피아' }

const ROLE_LABELS = {
  admin: '관리자',
  pastor: '교역자·부장',
  village_leader: '마을장',
  leader: '리더',
  member: '청년',
}

export default function MyPage() {
  const navigate = useNavigate()
  const {
    user, logout,
    isVillageLeaderOrAbove, isPastorOrAbove, isAdmin,
    isTeamLeader, isNewFamilyTeamLeader,
  } = useAuth()
  const { theme, setTheme, themes } = useTheme()

  const isLeader = user.role === 'leader'
  const isVillageLeader = user.role === 'village_leader'
  const myTeams = user.teams ?? []
  const isTeamMemberOnly = myTeams.length > 0 && user.teamRoles.length === 0

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <div style={{ paddingBottom: 'calc(88px + env(safe-area-inset-bottom, 0px))' }}>
      <div className="px-5 pt-5 pb-4">
        <p className="text-lg font-semibold flex-1">MY</p>
      </div>

      {/* 프로필 카드 — 누르면 내 정보 화면으로(아바타·이름·전화번호·생년월일·비밀번호를 거기서 바꾼다) */}
      <div className="px-5 mb-5">
        <button
          onClick={() => navigate('/my/profile')}
          className="flex items-center gap-3 p-4 bg-surface rounded-2xl shadow-sm w-full border-none cursor-pointer text-left"
        >
          <div className="relative shrink-0" style={{ width: 48, height: 48 }}>
            {(user.avatarKey || user.avatarPhotoUrl) ? (
              <BibleAvatarIcon avatarKey={user.avatarKey} photoUrl={user.avatarPhotoUrl} size={48} />
            ) : (
              <div className="w-12 h-12 rounded-full bg-primary-light flex items-center justify-center text-base font-medium text-primary">
                {user.name[0]}
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-[15px] font-medium">{user.name}</p>
            <p className="text-xs text-gray-500 mt-0.5 truncate">
              {user.fam} · {ROLE_LABELS[user.role]}
              {user.teamRoles.length > 0 && (
                <span className="text-primary"> · {user.teamRoles.join(', ')} 팀장</span>
              )}
              {isTeamMemberOnly && (
                <span className="text-success"> · {myTeams.join(', ')}</span>
              )}
            </p>
          </div>
          <span className="text-gray-400 text-sm shrink-0">›</span>
        </button>
      </div>

      {/* 내 활동 */}
      <div className="px-5 mb-3">
        <div className="bg-surface rounded-2xl shadow-sm overflow-hidden">
          <MenuItem label="설교노트" onPress={() => navigate('/sermon-note')} last />
        </div>
      </div>

      {isTeamMemberOnly && (
        <div className="px-5 mb-3">
          <div className="bg-surface rounded-2xl shadow-sm overflow-hidden">
            <SectionHeader label="내 사역팀" color="success" />
            <MenuItem label="내 사역팀 보기" onPress={() => navigate('/my/team')} last />
          </div>
        </div>
      )}

      {isTeamLeader && (
        <div className="px-5 mb-3">
          <div className="bg-surface rounded-2xl shadow-sm overflow-hidden">
            <SectionHeader label="사역팀 관리" color="warning" />
            {isNewFamilyTeamLeader && (
              <MenuItem label="새가족 관리" onPress={() => navigate('/newcomer')} />
            )}
            {user.teamRoles.map((team, idx) => (
              <MenuItem key={team} label={`${team} 관리`}
                onPress={() => navigate('/team/manage', { state: { team } })}
                last={!isNewFamilyTeamLeader && idx === user.teamRoles.length - 1} />
            ))}
          </div>
        </div>
      )}

      {isLeader && (
        <div className="px-5 mb-3">
          <div className="bg-surface rounded-2xl shadow-sm overflow-hidden">
            <SectionHeader label="팸 관리" color="primary" />
            <MenuItem label="내 팸 관리" onPress={() => navigate('/fam/manage')} />
            <MenuItem label="출석 관리" onPress={() => navigate('/attendance/history')} />
            <MenuItem label="출석 통계" onPress={() => navigate('/attendance/stats')} />
            <MenuItem label="새가족 확인" onPress={() => navigate('/newcomer')} last />
          </div>
        </div>
      )}

      {isVillageLeader && (
        <div className="px-5 mb-3">
          <div className="bg-surface rounded-2xl shadow-sm overflow-hidden">
            <SectionHeader label={`${user.village} 관리`} color="success" />
            <MenuItem label="새가족 관리" onPress={() => navigate('/newcomer')} />
            <MenuItem label="내 마을 관리" onPress={() => navigate('/village/manage')} />
            <MenuItem label="출석 관리" onPress={() => navigate('/attendance/history')} />
            <MenuItem label="출석 통계" onPress={() => navigate('/attendance/stats')} />
            <MenuItem label="내 팸 관리" onPress={() => navigate('/fam/manage')} last />
          </div>
        </div>
      )}

      {isPastorOrAbove && !isAdmin && (
        <div className="px-5 mb-3">
          <div className="bg-surface rounded-2xl shadow-sm overflow-hidden">
            <SectionHeader label="청년부 전체 관리" color="success" />
            <MenuItem label="새가족 관리" onPress={() => navigate('/newcomer')} />
            <MenuItem label="청년부 전체 관리" onPress={() => navigate('/village/manage')} />
            <MenuItem label="출석 통계" onPress={() => navigate('/attendance/stats')} />
            <MenuItem label="설교 업로드" onPress={() => navigate('/sermon/upload')} last />
          </div>
        </div>
      )}

      {isAdmin && (
        <>
          <div className="px-5 mb-3">
            <div className="bg-surface rounded-2xl shadow-sm overflow-hidden">
              <SectionHeader label="청년부 전체 관리" color="success" />
              <MenuItem label="새가족 관리" onPress={() => navigate('/newcomer')} />
              <MenuItem label="청년부 전체 관리" onPress={() => navigate('/village/manage')} />
              <MenuItem label="출석 통계" onPress={() => navigate('/attendance/stats')} />
              <MenuItem label="설교 업로드" onPress={() => navigate('/sermon/upload')} last />
            </div>
          </div>
          <div className="px-5 mb-3">
            <div className="bg-surface rounded-2xl shadow-sm overflow-hidden">
              <SectionHeader label="시스템 관리" color="danger" />
              <MenuItem label="계정 관리" onPress={() => navigate('/account/manage')} />
              <MenuItem label="시스템 설정" last />
            </div>
          </div>
        </>
      )}

      {/* 계정 설정 */}
      <div className="px-5 mb-3">
        <div className="bg-surface rounded-2xl shadow-sm overflow-hidden">
          <div className="flex justify-between items-center px-4 py-3.5 border-b border-gray-300">
            <span className="text-sm">화면 모드</span>
            <ThemeSwitcher theme={theme} setTheme={setTheme} themes={themes} />
          </div>
          <MenuItem label="알림 설정" />
          <div className="px-4 py-3.5">
            <span className="text-sm text-danger cursor-pointer" onClick={handleLogout}>로그아웃</span>
          </div>
        </div>
      </div>

      <BottomNav />

    </div>
  )
}

function ThemeSwitcher({ theme, setTheme, themes }) {
  return (
    <div className="flex gap-1 bg-gray-100 rounded-full p-0.5">
      {themes.map((t) => (
        <button
          key={t}
          onClick={() => setTheme(t)}
          className={`text-xs font-medium rounded-full px-2.5 py-1 border-none cursor-pointer transition-colors ${
            theme === t ? 'bg-primary text-white' : 'bg-transparent text-gray-500'
          }`}
        >
          {THEME_LABELS[t]}
        </button>
      ))}
    </div>
  )
}

function SectionHeader({ label, color }) {
  const colorMap = {
    primary: 'bg-primary-light text-primary',
    success: 'bg-success-light text-success',
    danger: 'bg-danger-light text-danger',
    warning: 'bg-warning-light text-warning',
  }
  return <div className={`px-4 py-2.5 ${colorMap[color]}`}><p className="text-xs font-medium">{label}</p></div>
}

function MenuItem({ label, last = false, onPress }) {
  return (
    <div onClick={onPress}
      className={`flex justify-between items-center px-4 py-3.5 cursor-pointer hover:bg-gray-100 transition-colors ${!last ? 'border-b border-gray-300' : ''}`}>
      <span className="text-sm">{label}</span>
      <span className="text-gray-700 text-[1rem]">→</span>
    </div>
  )
}
