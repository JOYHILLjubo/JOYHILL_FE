import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import BottomNav from '../components/BottomNav'
import { useAuth } from '../context/AuthContext'
import { BIBLE_AVATARS, BibleAvatarIcon } from '../components/BibleAvatars'

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/$/, '')

const ROLE_LABELS = {
  admin: '관리자',
  pastor: '교역자·부장',
  village_leader: '마을장',
  leader: '리더',
  member: '청년',
}

const OT_AVATARS = BIBLE_AVATARS.filter((a) => a.category === '구약')
const NT_AVATARS = BIBLE_AVATARS.filter((a) => a.category === '신약')

export default function MyPage() {
  const navigate = useNavigate()
  const {
    user, logout, accessToken, setUser,
    isVillageLeaderOrAbove, isPastorOrAbove, isAdmin,
    isTeamLeader, isNewFamilyTeamLeader,
  } = useAuth()

  const isLeader = user.role === 'leader'
  const isVillageLeader = user.role === 'village_leader'
  const myTeams = user.teams ?? []
  const isTeamMemberOnly = myTeams.length > 0 && user.teamRoles.length === 0

  const [showAvatarModal, setShowAvatarModal] = useState(false)
  const [pendingKey, setPendingKey] = useState(null)
  const [isSaving, setIsSaving] = useState(false)
  const accessTokenRef = useRef(accessToken)
  accessTokenRef.current = accessToken

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  const openModal = () => {
    setPendingKey(user.avatarKey ?? null)
    setShowAvatarModal(true)
  }

  const handleApply = async () => {
    if (isSaving) return
    setIsSaving(true)
    try {
      const res = await fetch(`${API_BASE_URL}/api/users/me/avatar`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessTokenRef.current}`,
        },
        credentials: 'include',
        body: JSON.stringify({ avatarKey: pendingKey }),
      })
      if (res.ok) {
        setUser((prev) => ({ ...prev, avatarKey: pendingKey }))
        setShowAvatarModal(false)
      }
    } catch {
      // 실패 시 무시
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div style={{ paddingBottom: 'calc(80px + env(safe-area-inset-bottom, 0px))' }}>
      <div className="px-5 pt-5 pb-4">
        <p className="text-lg font-semibold flex-1">MY</p>
      </div>

      {/* 프로필 카드 */}
      <div className="px-5 mb-5">
        <div className="flex items-center gap-3 p-4 bg-gray-100 rounded-xl">
          {/* 아바타 — 클릭하면 모달 */}
          <button
            onClick={openModal}
            className="relative shrink-0 border-none bg-transparent p-0 cursor-pointer"
            style={{ width: 48, height: 48 }}
          >
            {user.avatarKey ? (
              <BibleAvatarIcon avatarKey={user.avatarKey} size={48} />
            ) : (
              <div className="w-12 h-12 rounded-full bg-primary-light flex items-center justify-center text-base font-medium text-primary">
                {user.name[0]}
              </div>
            )}
            {/* 편집 뱃지 */}
            <div style={{
              position: 'absolute', bottom: 0, right: 0,
              width: 16, height: 16, borderRadius: '50%',
              background: '#4285F4', display: 'flex',
              alignItems: 'center', justifyContent: 'center',
              border: '1.5px solid white',
            }}>
              <svg width="8" height="8" viewBox="0 0 10 10" fill="none">
                <path d="M1 9 L2.5 5.5 L7.5 0.5 L9.5 2.5 L4.5 7.5 L1 9Z" fill="white"/>
              </svg>
            </div>
          </button>

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
          <span className="text-[11px] text-primary bg-primary-light px-2 py-1 rounded-full shrink-0">
            {ROLE_LABELS[user.role]}
          </span>
        </div>
      </div>

      {/* 기본 메뉴 */}
      <div className="px-5 mb-3">
        <div className="border border-gray-300 rounded-xl overflow-hidden">
          <MenuItem label="비밀번호 변경" onPress={() => navigate('/my/edit')} />
          <MenuItem label="알림 설정" />
          <div className="px-4 py-3.5">
            <span className="text-sm text-danger cursor-pointer" onClick={handleLogout}>로그아웃</span>
          </div>
        </div>
      </div>

      {isTeamMemberOnly && (
        <div className="px-5 mb-3">
          <div className="border border-gray-300 rounded-xl overflow-hidden">
            <SectionHeader label="내 사역팀" color="success" />
            <MenuItem label="내 사역팀 보기" onPress={() => navigate('/my/team')} last />
          </div>
        </div>
      )}

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

      {isLeader && (
        <div className="px-5 mb-3">
          <div className="border border-gray-300 rounded-xl overflow-hidden">
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
          <div className="border border-gray-300 rounded-xl overflow-hidden">
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
          <div className="border border-gray-300 rounded-xl overflow-hidden">
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
            <div className="border border-gray-300 rounded-xl overflow-hidden">
              <SectionHeader label="청년부 전체 관리" color="success" />
              <MenuItem label="새가족 관리" onPress={() => navigate('/newcomer')} />
              <MenuItem label="청년부 전체 관리" onPress={() => navigate('/village/manage')} />
              <MenuItem label="출석 통계" onPress={() => navigate('/attendance/stats')} />
              <MenuItem label="설교 업로드" onPress={() => navigate('/sermon/upload')} last />
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

      {/* 아바타 선택 모달 */}
      {showAvatarModal && (
        <div
          onClick={() => setShowAvatarModal(false)}
          style={{
            position: 'fixed', inset: 0, zIndex: 50,
            background: 'rgba(0,0,0,0.45)',
            display: 'flex', alignItems: 'flex-end',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%', maxHeight: '80vh',
              background: 'var(--color-background-primary)',
              borderRadius: '20px 20px 0 0',
              display: 'flex', flexDirection: 'column',
              overflow: 'hidden',
            }}
          >
            {/* 헤더 */}
            <div style={{
              padding: '16px 20px 12px',
              borderBottom: '1px solid var(--color-border-tertiary)',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              flexShrink: 0,
            }}>
              <p style={{ fontSize: 16, fontWeight: 500 }}>아바타 선택</p>
              <button
                onClick={() => setShowAvatarModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, color: 'var(--color-text-secondary)' }}
              >✕</button>
            </div>

            {/* 스크롤 영역 */}
            <div style={{ overflowY: 'auto', flex: 1, padding: '16px 16px 0' }}>
              {/* 구약 */}
              <p style={{ fontSize: 11, fontWeight: 500, color: 'var(--color-text-tertiary)', marginBottom: 10 }}>구약</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12, marginBottom: 20 }}>
                {OT_AVATARS.map((avatar) => (
                  <AvatarCell
                    key={avatar.key}
                    avatar={avatar}
                    selected={pendingKey === avatar.key}
                    onSelect={() => setPendingKey(avatar.key)}
                  />
                ))}
              </div>
              {/* 신약 */}
              <p style={{ fontSize: 11, fontWeight: 500, color: 'var(--color-text-tertiary)', marginBottom: 10 }}>신약</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12, marginBottom: 20 }}>
                {NT_AVATARS.map((avatar) => (
                  <AvatarCell
                    key={avatar.key}
                    avatar={avatar}
                    selected={pendingKey === avatar.key}
                    onSelect={() => setPendingKey(avatar.key)}
                  />
                ))}
              </div>
            </div>

            {/* 적용 버튼 */}
            <div style={{
              padding: '12px 16px',
              paddingBottom: 'calc(12px + env(safe-area-inset-bottom, 0px))',
              borderTop: '1px solid var(--color-border-tertiary)',
              flexShrink: 0,
            }}>
              <button
                onClick={handleApply}
                disabled={isSaving || pendingKey === user.avatarKey}
                style={{
                  width: '100%', padding: '14px',
                  borderRadius: 12, border: 'none',
                  background: (isSaving || pendingKey === user.avatarKey) ? 'var(--color-background-secondary)' : '#4285F4',
                  color: (isSaving || pendingKey === user.avatarKey) ? 'var(--color-text-tertiary)' : 'white',
                  fontSize: 15, fontWeight: 500, cursor: (isSaving || pendingKey === user.avatarKey) ? 'default' : 'pointer',
                  transition: 'background 0.15s',
                }}
              >
                {isSaving ? '저장 중...' : '적용하기'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function AvatarCell({ avatar, selected, onSelect }) {
  return (
    <button
      onClick={onSelect}
      style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        gap: 6, background: 'none', border: 'none', cursor: 'pointer', padding: 0,
      }}
    >
      <div style={{
        borderRadius: '50%', overflow: 'hidden',
        width: 54, height: 54,
        outline: selected ? '3px solid #4285F4' : '3px solid transparent',
        outlineOffset: 2,
        transition: 'outline 0.1s',
      }}>
        <BibleAvatarIcon avatarKey={avatar.key} size={54} />
      </div>
      <span style={{
        fontSize: 10,
        color: selected ? '#4285F4' : 'var(--color-text-tertiary)',
        fontWeight: selected ? 500 : 400,
      }}>
        {avatar.label}
      </span>
    </button>
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
