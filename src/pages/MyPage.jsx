import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import BottomNav from '../components/BottomNav'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { Camera } from 'lucide-react'
import { BIBLE_AVATARS, BibleAvatarIcon } from '../components/BibleAvatars'

const THEME_LABELS = { light: '라이트', dark: '다크', sepia: '세피아' }

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

// 프로필 사진은 화면에서 최대 48px로만 표시되므로 512px이면 충분하다.
// 서버(S3Service)에도 리사이징이 있지만 nginx의 본문 크기 제한은 요청이 백엔드에 닿기 전에
// 걸리기 때문에(413), 실제로 업로드를 통과시키려면 브라우저에서 미리 줄여 보내야 한다.
// 요즘 폰 사진 3~8MB → 대략 50~150KB로 줄어든다.
const PHOTO_MAX_SIZE = 512
const PHOTO_QUALITY = 0.85

async function loadBitmap(file) {
  // imageOrientation: EXIF로 회전 정보가 들어있는 폰 사진이 눕지 않도록
  if (typeof createImageBitmap === 'function') {
    try {
      return await createImageBitmap(file, { imageOrientation: 'from-image' })
    } catch {
      // 옵션 미지원 브라우저 → 옵션 없이 재시도
      try { return await createImageBitmap(file) } catch { /* 아래 img 폴백으로 */ }
    }
  }
  return await new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => { URL.revokeObjectURL(url); resolve(img) }
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('사진을 읽지 못했습니다.')) }
    img.src = url
  })
}

async function downscalePhoto(file) {
  const source = await loadBitmap(file)
  const srcW = source.width, srcH = source.height
  const scale = Math.min(1, PHOTO_MAX_SIZE / Math.max(srcW, srcH))
  const w = Math.max(1, Math.round(srcW * scale))
  const h = Math.max(1, Math.round(srcH * scale))

  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  canvas.getContext('2d').drawImage(source, 0, 0, w, h)
  source.close?.()

  const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', PHOTO_QUALITY))
  if (!blob) throw new Error('사진을 처리하지 못했습니다. 다른 사진으로 시도해주세요.')
  return blob
}

export default function MyPage() {
  const navigate = useNavigate()
  const {
    user, logout, accessToken, setUser,
    isVillageLeaderOrAbove, isPastorOrAbove, isAdmin,
    isTeamLeader, isNewFamilyTeamLeader,
  } = useAuth()
  const { theme, setTheme, themes } = useTheme()

  const isLeader = user.role === 'leader'
  const isVillageLeader = user.role === 'village_leader'
  const myTeams = user.teams ?? []
  const isTeamMemberOnly = myTeams.length > 0 && user.teamRoles.length === 0

  const [showAvatarModal, setShowAvatarModal] = useState(false)
  const [pendingKey, setPendingKey] = useState(null)
  const [pendingPhotoUrl, setPendingPhotoUrl] = useState(null)
  const [photoFile, setPhotoFile] = useState(null)
  const [photoPreview, setPhotoPreview] = useState(null)
  const [uploadError, setUploadError] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const accessTokenRef = useRef(accessToken)
  accessTokenRef.current = accessToken

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  const openModal = () => {
    setPendingKey(user.avatarKey ?? null)
    setPendingPhotoUrl(user.avatarPhotoUrl ?? null)
    setPhotoFile(null)
    setPhotoPreview(null)
    setUploadError('')
    setShowAvatarModal(true)
  }

  // 성경 인물 아바타와 내 사진은 둘 중 하나만 적용됨 — 한쪽을 고르면 다른 쪽 선택은 해제한다.
  const selectAvatarKey = (key) => {
    setPendingKey(key)
    setPendingPhotoUrl(null)
    setPhotoFile(null)
    setPhotoPreview(null)
    setUploadError('')
  }

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    if (!file.type.startsWith('image/')) { setUploadError('이미지 파일만 선택할 수 있습니다.'); return }
    if (file.size > 30 * 1024 * 1024) { setUploadError('이미지 크기는 30MB 이하여야 합니다.'); return }
    setUploadError('')
    setPhotoFile(file)
    setPhotoPreview(URL.createObjectURL(file))
    setPendingKey(null)
    setPendingPhotoUrl(null)
  }

  const hasPhoto = Boolean(photoPreview || pendingPhotoUrl)
  const isChanged = photoFile !== null
    || pendingKey !== (user.avatarKey ?? null)
    || pendingPhotoUrl !== (user.avatarPhotoUrl ?? null)

  const handleApply = async () => {
    if (isSaving || !isChanged) return
    setIsSaving(true)
    setUploadError('')
    try {
      let photoUrl = pendingPhotoUrl
      // 새로 고른 사진이 있으면 S3에 먼저 올리고, 반환된 URL을 적용 요청에 실어 보낸다.
      if (photoFile) {
        const compressed = await downscalePhoto(photoFile)
        const formData = new FormData()
        formData.append('photo', compressed, 'avatar.jpg')
        const uploadRes = await fetch(`${API_BASE_URL}/api/users/me/avatar-photo`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${accessTokenRef.current}` },
          credentials: 'include',
          body: formData,
        })
        // 413은 nginx가 본문 크기 제한으로 막은 것 — 응답이 JSON이 아니라 HTML이라
        // 아래 payload 파싱이 실패하므로 상태코드로 따로 구분해준다.
        if (uploadRes.status === 413) {
          throw new Error('사진 용량이 너무 큽니다. 더 작은 사진으로 다시 시도해주세요.')
        }
        const uploadPayload = await uploadRes.json().catch(() => null)
        if (!uploadRes.ok || !uploadPayload?.success) {
          throw new Error(uploadPayload?.error?.message ?? '사진 업로드에 실패했습니다.')
        }
        photoUrl = uploadPayload.data.avatarPhotoUrl
      }

      const res = await fetch(`${API_BASE_URL}/api/users/me/avatar`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessTokenRef.current}`,
        },
        credentials: 'include',
        body: JSON.stringify({ avatarKey: photoUrl ? null : pendingKey, avatarPhotoUrl: photoUrl }),
      })
      const payload = await res.json().catch(() => null)
      if (!res.ok || !payload?.success) {
        throw new Error(payload?.error?.message ?? '프로필 적용에 실패했습니다.')
      }
      setUser((prev) => ({
        ...prev,
        avatarKey: photoUrl ? null : pendingKey,
        avatarPhotoUrl: photoUrl ?? null,
      }))
      setShowAvatarModal(false)
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : '프로필 적용에 실패했습니다.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div style={{ paddingBottom: 'calc(88px + env(safe-area-inset-bottom, 0px))' }}>
      <div className="px-5 pt-5 pb-4">
        <p className="text-lg font-semibold flex-1">MY</p>
      </div>

      {/* 프로필 카드 */}
      <div className="px-5 mb-5">
        <div className="flex items-center gap-3 p-4 bg-surface rounded-2xl shadow-sm">
          {/* 아바타 — 클릭하면 모달 */}
          <button
            onClick={openModal}
            className="relative shrink-0 border-none bg-transparent p-0 cursor-pointer"
            style={{ width: 48, height: 48 }}
          >
            {(user.avatarKey || user.avatarPhotoUrl) ? (
              <BibleAvatarIcon avatarKey={user.avatarKey} photoUrl={user.avatarPhotoUrl} size={48} />
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
          <MenuItem label="비밀번호 변경" onPress={() => navigate('/my/edit')} />
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
              background: '#ffffff',
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
              {/* 내 사진 */}
              <p style={{ fontSize: 11, fontWeight: 500, color: 'var(--color-text-tertiary)', marginBottom: 10 }}>내 사진</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                <label style={{ cursor: 'pointer', display: 'block' }}>
                  <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handlePhotoChange} />
                  {hasPhoto ? (
                    <div style={{
                      borderRadius: '50%', overflow: 'hidden', width: 54, height: 54,
                      outline: '3px solid #4285F4', outlineOffset: 2,
                    }}>
                      <img
                        src={photoPreview ?? pendingPhotoUrl}
                        alt=""
                        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                      />
                    </div>
                  ) : (
                    <div style={{
                      width: 54, height: 54, borderRadius: '50%',
                      border: '1.5px dashed var(--color-border-secondary)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: 'var(--color-text-tertiary)',
                    }}>
                      <Camera size={20} />
                    </div>
                  )}
                </label>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 13 }}>{hasPhoto ? '내 사진이 선택되어 있어요' : '사진을 올려 프로필로 쓸 수 있어요'}</p>
                  <p style={{ fontSize: 11, color: 'var(--color-text-tertiary)', marginTop: 2 }}>
                    {hasPhoto ? '아래에서 아바타를 고르면 사진은 해제됩니다' : '동그라미를 눌러 사진을 선택하세요'}
                  </p>
                </div>
              </div>
              {uploadError && (
                <p style={{ fontSize: 11, color: '#EA4335', marginTop: -12, marginBottom: 16 }}>{uploadError}</p>
              )}

              {/* 구약 */}
              <p style={{ fontSize: 11, fontWeight: 500, color: 'var(--color-text-tertiary)', marginBottom: 10 }}>구약</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12, marginBottom: 20 }}>
                {OT_AVATARS.map((avatar) => (
                  <AvatarCell
                    key={avatar.key}
                    avatar={avatar}
                    selected={pendingKey === avatar.key}
                    onSelect={() => selectAvatarKey(avatar.key)}
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
                    onSelect={() => selectAvatarKey(avatar.key)}
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
                disabled={isSaving || !isChanged}
                style={{
                  width: '100%', padding: '14px',
                  borderRadius: 12, border: 'none',
                  background: (isSaving || !isChanged) ? 'var(--color-background-secondary)' : '#4285F4',
                  color: (isSaving || !isChanged) ? 'var(--color-text-tertiary)' : 'white',
                  fontSize: 15, fontWeight: 500, cursor: (isSaving || !isChanged) ? 'default' : 'pointer',
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
