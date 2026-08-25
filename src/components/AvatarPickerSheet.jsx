import { useState } from 'react'
import { Camera, X } from 'lucide-react'
import { BIBLE_AVATARS, BibleAvatarIcon } from './BibleAvatars'

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/$/, '')

const OT_AVATARS = BIBLE_AVATARS.filter((a) => a.category === '구약')
const NT_AVATARS = BIBLE_AVATARS.filter((a) => a.category === '신약')

// 프로필 사진은 화면에서 최대 96px로만 표시되므로 512px이면 충분하다.
// 서버(S3Service)에도 리사이징이 있지만 nginx의 본문 크기 제한은 요청이 백엔드에 닿기 전에
// 걸리기 때문에(413), 실제로 업로드를 통과시키려면 브라우저에서 미리 줄여 보내야 한다.
const PHOTO_MAX_SIZE = 512
const PHOTO_QUALITY = 0.85

async function loadBitmap(file) {
  // imageOrientation: EXIF로 회전 정보가 들어있는 폰 사진이 눕지 않도록
  if (typeof createImageBitmap === 'function') {
    try {
      return await createImageBitmap(file, { imageOrientation: 'from-image' })
    } catch {
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
  const scale = Math.min(1, PHOTO_MAX_SIZE / Math.max(source.width, source.height))
  const w = Math.max(1, Math.round(source.width * scale))
  const h = Math.max(1, Math.round(source.height * scale))

  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  canvas.getContext('2d').drawImage(source, 0, 0, w, h)
  source.close?.()

  const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', PHOTO_QUALITY))
  if (!blob) throw new Error('사진을 처리하지 못했습니다. 다른 사진으로 시도해주세요.')
  return blob
}

function AvatarCell({ avatar, selected, onSelect }) {
  return (
    <button
      onClick={onSelect}
      title={avatar.label}
      className="bg-transparent border-none cursor-pointer p-0 flex flex-col items-center gap-1"
    >
      <span
        className="rounded-full flex items-center justify-center"
        style={{ outline: selected ? '3px solid #4285F4' : '3px solid transparent', outlineOffset: 2 }}
      >
        <BibleAvatarIcon avatarKey={avatar.key} size={54} />
      </span>
      <span className={`text-[10px] ${selected ? 'text-primary font-semibold' : 'text-gray-500'}`}>
        {avatar.label}
      </span>
    </button>
  )
}

/*
 * 성경 인물 아바타 / 내 사진 선택 시트.
 *
 * 예전에는 MyPage 안에 인라인으로 있었고 배경이 '#ffffff' 하드코딩 + 존재하지 않는 CSS 변수
 * (--color-border-tertiary 등)를 참조하고 있어서 다크·세피아 테마에서 깨졌다. 개인정보 수정
 * 화면으로 옮기면서 프로젝트의 실제 토큰(bg-surface / gray-* / ink)으로 고쳤다.
 */
export default function AvatarPickerSheet({ open, user, accessToken, onApplied, onClose }) {
  const [pendingKey, setPendingKey] = useState(user.avatarKey ?? null)
  const [pendingPhotoUrl, setPendingPhotoUrl] = useState(user.avatarPhotoUrl ?? null)
  const [photoFile, setPhotoFile] = useState(null)
  const [photoPreview, setPhotoPreview] = useState(null)
  const [uploadError, setUploadError] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  if (!open) return null

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
          headers: { Authorization: `Bearer ${accessToken}` },
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
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
        credentials: 'include',
        body: JSON.stringify({ avatarKey: photoUrl ? null : pendingKey, avatarPhotoUrl: photoUrl }),
      })
      const payload = await res.json().catch(() => null)
      if (!res.ok || !payload?.success) {
        throw new Error(payload?.error?.message ?? '프로필 적용에 실패했습니다.')
      }
      onApplied({ avatarKey: photoUrl ? null : pendingKey, avatarPhotoUrl: photoUrl ?? null })
      onClose()
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : '프로필 적용에 실패했습니다.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[60] flex items-end justify-center"
      style={{ background: 'rgba(20, 22, 42, 0.45)' }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-[430px] bg-surface rounded-t-3xl flex flex-col"
        style={{ maxHeight: '82vh' }}
      >
        <div className="flex items-center px-5 pt-4 pb-3 shrink-0">
          <p className="text-base font-bold flex-1">프로필 이미지</p>
          <button onClick={onClose} className="bg-transparent border-none cursor-pointer p-0 flex items-center text-gray-500" aria-label="닫기">
            <X size={20} strokeWidth={2} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5">
          <p className="text-[11px] font-bold text-gray-500 mb-2.5">내 사진</p>
          <div className="flex items-center gap-3 mb-5">
            <label className="cursor-pointer block shrink-0">
              <input type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
              {hasPhoto ? (
                <div
                  className="rounded-full overflow-hidden w-[54px] h-[54px]"
                  style={{ outline: '3px solid #4285F4', outlineOffset: 2 }}
                >
                  <img src={photoPreview ?? pendingPhotoUrl} alt="" className="w-full h-full object-cover block" />
                </div>
              ) : (
                <div className="w-[54px] h-[54px] rounded-full border-[1.5px] border-dashed border-gray-300 flex items-center justify-center text-gray-400">
                  <Camera size={20} />
                </div>
              )}
            </label>
            <div className="flex-1 min-w-0">
              <p className="text-[13px]">{hasPhoto ? '내 사진이 선택되어 있어요' : '사진을 올려 프로필로 쓸 수 있어요'}</p>
              <p className="text-[11px] text-gray-400 mt-0.5">
                {hasPhoto ? '아래에서 아바타를 고르면 사진은 해제됩니다' : '동그라미를 눌러 사진을 선택하세요'}
              </p>
            </div>
          </div>
          {uploadError && <p className="text-[11px] text-danger -mt-3 mb-4">{uploadError}</p>}

          <p className="text-[11px] font-bold text-gray-500 mb-2.5">구약</p>
          <div className="grid grid-cols-5 gap-3 mb-5">
            {OT_AVATARS.map((avatar) => (
              <AvatarCell key={avatar.key} avatar={avatar} selected={pendingKey === avatar.key} onSelect={() => selectAvatarKey(avatar.key)} />
            ))}
          </div>
          <p className="text-[11px] font-bold text-gray-500 mb-2.5">신약</p>
          <div className="grid grid-cols-5 gap-3 mb-5">
            {NT_AVATARS.map((avatar) => (
              <AvatarCell key={avatar.key} avatar={avatar} selected={pendingKey === avatar.key} onSelect={() => selectAvatarKey(avatar.key)} />
            ))}
          </div>
        </div>

        <div className="px-5 pt-3 shrink-0" style={{ paddingBottom: 'calc(12px + env(safe-area-inset-bottom, 0px))' }}>
          <button
            onClick={handleApply}
            disabled={isSaving || !isChanged}
            className={`w-full py-3.5 rounded-2xl text-sm font-bold border-none transition-colors ${
              isSaving || !isChanged ? 'bg-gray-100 text-gray-400 cursor-default' : 'bg-primary text-white cursor-pointer'
            }`}
          >
            {isSaving ? '저장 중...' : '적용하기'}
          </button>
        </div>
      </div>
    </div>
  )
}
