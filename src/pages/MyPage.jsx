import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import BottomNav from '../components/BottomNav'

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
    user, cycleRole,
    isVillageLeaderOrAbove, isPastorOrAbove, isAdmin,
    isTeamLeader, isNewFamilyTeamLeader,
  } = useAuth()

  const isLeader = user.role === 'leader'
  const isVillageLeader = user.role === 'village_leader'

  return (
    <div className="pb-20">
      <div className="px-5 pt-5 pb-4">
        <p className="text-lg font-medium">MY</p>
      </div>

      {/* 프로필 카드 */}
      <div className="px-5 mb-5">
        <div className="flex items-center gap-3 p-4 bg-gray-100 rounded-xl">
          <div className="w-12 h-12 rounded-full bg-primary-light flex items-center justify-center text-base font-medium text-primary">
            {user.name[0]}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[15px] font-medium">{user.name}</p>
            <p className="text-xs text-gray-500 mt-0.5 truncate">
              {user.fam} · {ROLE_LABELS[user.role]}
              {user.teamRoles.length > 0 && (
                <span className="text-primary"> · {user.teamRoles.join(', ')} 팀장</span>
              )}
            </p>
          </div>
          <button onClick={cycleRole}
            className="text-[10px] text-primary bg-primary-light px-2 py-1 rounded-full border-none cursor-pointer shrink-0">
            {ROLE_LABELS[user.role]}
          </button>
        </div>
        <p className="text-[10px] text-gray-500 mt-1 text-center">* 위 역할 뱃지를 탭하면 역할 전환 (개발용)</p>
      </div>

      {/* 기본 메뉴 */}
      <div className="px-5 mb-3">
        <div className="border border-gray-300 rounded-xl overflow-hidden">
          <MenuItem label="비밀번호 변경" onPress={() => navigate('/my/edit')} />
          <MenuItem label="알림 설정" />
          <div className="px-4 py-3.5">
            <span className="text-sm text-danger cursor-pointer" onClick={() => navigate('/login')}>로그아웃</span>
          </div>
        </div>
      </div>

      {/* 사역팀 관리 — 사역팀장 */}
      {isTeamLeader && (
        <div className="px-5 mb-3">
          <div className="border border-gray-300 rounded-xl overflow-hidden">
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

      {/* 팸 관리 — 리더 전용 */}
      {isLeader && (
        <div className="px-5 mb-3">
          <div className="border border-gray-300 rounded-xl overflow-hidden">
            <SectionHeader label="팸 관리" color="primary" />
            <MenuItem label="출석 관리" onPress={() => navigate('/attendance/history')} />
            <MenuItem label="출석 통계" onPress={() => navigate('/attendance/stats')} />
            <MenuItem label="내 팸 관리" onPress={() => navigate('/fam/manage')} last />
          </div>
        </div>
      )}

      {/* 마을 관리 — 마을장 전용 */}
      {isVillageLeader && (
        <div className="px-5 mb-3">
          <div className="border border-gray-300 rounded-xl overflow-hidden">
            <SectionHeader label={`${user.village} 관리`} color="success" />
            <MenuItem label="새가족 관리" onPress={() => navigate('/newcomer')} />
            <MenuItem label="내 마을 관리" onPress={() => navigate('/village/manage')} />
            <MenuItem label="출석 통계" onPress={() => navigate('/attendance/stats')} />
            {/* <MenuItem label="공지사항 관리" /> */}
            <MenuItem label="전체 통계 리포트" last />
          </div>
        </div>
      )}

      {/* 청년부 전체 관리 — 교역자·부장 */}
      {isPastorOrAbove && !isAdmin && (
        <div className="px-5 mb-3">
          <div className="border border-gray-300 rounded-xl overflow-hidden">
            <SectionHeader label="청년부 전체 관리" color="success" />
            <MenuItem label="새가족 관리" onPress={() => navigate('/newcomer')} />
            <MenuItem label="청년부 전체 관리" onPress={() => navigate('/village/manage')} />
            <MenuItem label="출석 통계" onPress={() => navigate('/attendance/stats')} />
            <MenuItem label="설교 업로드" onPress={() => navigate('/sermon/upload')} />
            {/* <MenuItem label="공지사항 관리" /> */}
            <MenuItem label="전체 통계 리포트" last />
          </div>
        </div>
      )}

      {/* 관리자 */}
      {isAdmin && (
        <>
          <div className="px-5 mb-3">
            <div className="border border-gray-300 rounded-xl overflow-hidden">
              <SectionHeader label="청년부 전체 관리" color="success" />
              <MenuItem label="새가족 관리" onPress={() => navigate('/newcomer')} />
              <MenuItem label="청년부 전체 관리" onPress={() => navigate('/village/manage')} />
              <MenuItem label="출석 통계" onPress={() => navigate('/attendance/stats')} />
              <MenuItem label="설교 업로드" onPress={() => navigate('/sermon/upload')} />
              {/* <MenuItem label="공지사항 관리" /> */}
              <MenuItem label="전체 통계 리포트" last />
            </div>
          </div>
          <div className="px-5 mb-3">
            <div className="border border-gray-300 rounded-xl overflow-hidden">
              <SectionHeader label="시스템 관리" color="danger" />
              <MenuItem label="계정 관리" onPress={() => navigate('/account/manage')} />
              <MenuItem label="시스템 설정" last />
            </div>
          </div>
        </>
      )}

      <BottomNav />
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
      <span className="text-gray-700 text-xs">→</span>
    </div>
  )
}
