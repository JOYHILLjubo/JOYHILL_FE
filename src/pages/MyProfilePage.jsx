import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, CalendarDays, Lock, Pencil } from 'lucide-react'
import AvatarPickerSheet from '../components/AvatarPickerSheet'
import { BibleAvatarIcon } from '../components/BibleAvatars'
import { useAuth } from '../context/AuthContext'

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/$/, '')

const ROLE_LABELS = {
  admin: '관리자',
  pastor: '교역자·부장',
  village_leader: '마을장',
  leader: '리더',
  member: '청년',
}

// 010-1234-5678 형태로 보기 좋게 끊어준다(저장은 서버에서 정규화됨)
function formatPhone(value) {
  const digits = (value ?? '').replace(/\D/g, '').slice(0, 11)
  if (digits.length < 4) return digits
  if (digits.length < 8) return `${digits.slice(0, 3)}-${digits.slice(3)}`
  return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`
}

// 서버는 생년월일을 YYMMDD 6자리로 들고 있다 — 화면에서는 끊어서 보여준다
function formatBirth(value) {
  const digits = (value ?? '').replace(/\D/g, '').slice(0, 6)
  if (digits.length < 3) return digits
  if (digits.length < 5) return `${digits.slice(0, 2)}.${digits.slice(2)}`
  return `${digits.slice(0, 2)}.${digits.slice(2, 4)}.${digits.slice(4)}`
}

// 저장 형식(YYMMDD)과 <input type="date">가 쓰는 형식(YYYY-MM-DD) 사이 변환.
// 두 자리 연도의 세기는 "미래 날짜는 있을 수 없다"는 규칙으로 정한다 —
// 25년생을 2025년으로 읽으면 아직 안 태어난 사람이 되므로 1925년... 이 아니라,
// 올해보다 뒤면 1900년대로 본다(청년부 나이대에선 이 규칙으로 충분하다).
function birthDigitsToDateValue(digits) {
  const d = (digits ?? '').replace(/\D/g, '')
  if (d.length !== 6) return ''
  const yy = Number(d.slice(0, 2))
  const currentYear = new Date().getFullYear()
  const year = 2000 + yy > currentYear ? 1900 + yy : 2000 + yy
  return `${year}-${d.slice(2, 4)}-${d.slice(4, 6)}`
}

function dateValueToBirthDigits(value) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value ?? '')
  return m ? `${m[1].slice(2)}${m[2]}${m[3]}` : ''
}

function todayDateValue() {
  const now = new Date()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${now.getFullYear()}-${month}-${day}`
}

export default function MyProfilePage() {
  const navigate = useNavigate()
  const { user, accessToken, setUser } = useAuth()

  const [name, setName] = useState(user.name ?? '')
  const [phone, setPhone] = useState(formatPhone(user.phone))
  const [birth, setBirth] = useState(formatBirth(user.birth))
  const [showAvatarSheet, setShowAvatarSheet] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')
  const [savedAt, setSavedAt] = useState(null)

  const accessTokenRef = useRef(accessToken)
  accessTokenRef.current = accessToken

  useEffect(() => {
    if (!savedAt) return undefined
    const id = window.setTimeout(() => setSavedAt(null), 2000)
    return () => window.clearTimeout(id)
  }, [savedAt])

  const digitsOnly = (value) => (value ?? '').replace(/\D/g, '')
  const isChanged =
    name.trim() !== (user.name ?? '')
    || digitsOnly(phone) !== digitsOnly(user.phone)
    || digitsOnly(birth) !== digitsOnly(user.birth)

  const handleSave = async () => {
    if (isSaving || !isChanged) return
    if (!name.trim()) { setError('이름을 입력해주세요.'); return }
    const phoneDigits = digitsOnly(phone)
    if (phoneDigits.length !== 11) { setError('전화번호 11자리를 모두 입력해주세요.'); return }
    const birthDigits = digitsOnly(birth)
    if (birthDigits.length !== 6) { setError('생년월일 6자리를 입력해주세요. (예: 950315)'); return }

    setIsSaving(true)
    setError('')
    try {
      const res = await fetch(`${API_BASE_URL}/api/users/me`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessTokenRef.current}` },
        credentials: 'include',
        body: JSON.stringify({ name: name.trim(), phone: phoneDigits, birth: birthDigits }),
      })
      const payload = await res.json().catch(() => null)
      if (!res.ok || !payload?.success) {
        throw new Error(payload?.error?.message ?? '저장에 실패했습니다.')
      }
      setUser((prev) => ({ ...prev, name: name.trim(), phone: phoneDigits, birth: birthDigits }))
      setSavedAt(Date.now())
    } catch (err) {
      setError(err instanceof Error ? err.message : '저장에 실패했습니다.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="bg-surface" style={{ minHeight: '100vh', paddingBottom: 'calc(96px + env(safe-area-inset-bottom, 0px))' }}>
      <div className="flex items-center gap-3 px-5 pt-4 pb-2">
        <button onClick={() => navigate('/my')} className="bg-transparent border-none cursor-pointer p-0 flex items-center" aria-label="뒤로">
          <ArrowLeft size={22} strokeWidth={2} className="text-ink" />
        </button>
        <p className="text-base font-bold flex-1">내 정보</p>
      </div>

      {/* 프로필 이미지 — 동그라미를 누르면 아바타/사진 선택 */}
      <div className="flex flex-col items-center gap-3 pt-4 pb-7">
        <button
          onClick={() => setShowAvatarSheet(true)}
          className="relative bg-transparent border-none cursor-pointer p-0"
          style={{ width: 96, height: 96 }}
          aria-label="프로필 이미지 변경"
        >
          {(user.avatarKey || user.avatarPhotoUrl) ? (
            <BibleAvatarIcon avatarKey={user.avatarKey} photoUrl={user.avatarPhotoUrl} size={96} />
          ) : (
            <div className="w-24 h-24 rounded-full bg-primary-light flex items-center justify-center text-[32px] font-bold text-primary">
              {user.name?.[0]}
            </div>
          )}
          <span className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-primary flex items-center justify-center border-[3px] border-surface">
            <Pencil size={14} strokeWidth={2.4} className="text-white" />
          </span>
        </button>
        <p className="text-[13px] text-gray-500">
          {user.fam ? `${user.fam} · ` : ''}{ROLE_LABELS[user.role] ?? user.role}
        </p>
      </div>

      <div className="px-5 flex flex-col gap-5">
        <div className="flex flex-col gap-2.5">
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-extrabold text-gray-500 tracking-[0.02em]">기본 정보</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold text-gray-500">이름</span>
            <input
              value={name}
              onChange={(e) => { setName(e.target.value); setError('') }}
              placeholder="실명을 입력해주세요"
              className="text-[15px] font-semibold border border-gray-200 rounded-xl px-3.5 py-3 outline-none focus:border-primary"
            />
            {/*
              구글시트의 조직도·출석이 이름으로 사람을 찾기 때문에 별명이나 줄임말을 쓰면
              출석이 엉뚱한 사람에게 붙는다. 동명이인은 실제로 있어서(박찬혁/박상현 등)
              구분자를 붙이도록 여기서 유도한다.
            */}
            <span className="text-[11px] text-gray-400 leading-snug">
              별명 대신 실명으로 적어주세요. 청년부에 같은 이름이 있으면 이름 뒤에 A, B를 붙여 구분해주세요 (예: 김민준A).
            </span>
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold text-gray-500">전화번호</span>
            <input
              value={phone}
              onChange={(e) => { setPhone(formatPhone(e.target.value)); setError('') }}
              inputMode="numeric"
              placeholder="010-0000-0000"
              className="text-[15px] font-semibold border border-gray-200 rounded-xl px-3.5 py-3 outline-none focus:border-primary"
            />
            <span className="text-[11px] text-gray-400 leading-snug">
              로그인할 때 쓰는 번호예요. 바꾸면 다음 로그인부터 새 번호로 들어와야 해요.
            </span>
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold text-gray-500">생년월일</span>
            <div className="relative flex items-center">
              <input
                value={birth}
                onChange={(e) => { setBirth(formatBirth(e.target.value)); setError('') }}
                inputMode="numeric"
                placeholder="95.03.15"
                className="w-full text-[15px] font-semibold border border-gray-200 rounded-xl pl-3.5 pr-12 py-3 outline-none focus:border-primary"
              />
              {/*
                달력 아이콘 자리에 <input type="date">를 투명하게 겹쳐둔다.
                showPicker()는 아직 지원이 갈리는데(구형 사파리/웹뷰), 이렇게 두면
                사용자가 누르는 게 곧 진짜 date 입력이라 어느 브라우저든 기본 달력이 뜬다.
              */}
              <span className="absolute right-1.5 w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center pointer-events-none">
                <CalendarDays size={17} strokeWidth={2} className="text-gray-500" />
              </span>
              <input
                type="date"
                aria-label="달력에서 생년월일 고르기"
                value={birthDigitsToDateValue(birth)}
                max={todayDateValue()}
                onChange={(e) => {
                  const digits = dateValueToBirthDigits(e.target.value)
                  if (digits) { setBirth(formatBirth(digits)); setError('') }
                }}
                className="absolute right-1.5 w-9 h-9 opacity-0 cursor-pointer"
              />
            </div>
            <span className="text-[11px] text-gray-400 leading-snug">
              생일 축하 목록에 쓰여요. 직접 입력하거나 오른쪽 달력에서 고를 수 있어요.
            </span>
          </label>

          {error && <p className="text-[12px] text-danger">{error}</p>}

          <button
            onClick={handleSave}
            disabled={isSaving || !isChanged}
            className={`w-full py-3.5 rounded-2xl text-sm font-bold border-none transition-colors mt-1 ${
              isSaving || !isChanged ? 'bg-gray-100 text-gray-400 cursor-default' : 'bg-primary text-white cursor-pointer'
            }`}
          >
            {isSaving ? '저장 중...' : savedAt ? '저장되었습니다' : '저장하기'}
          </button>
        </div>

        <div className="flex flex-col gap-2.5">
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-extrabold text-gray-500 tracking-[0.02em]">보안</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>
          <button
            onClick={() => navigate('/my/edit')}
            className="flex items-center gap-3 w-full bg-gray-100 rounded-xl px-3.5 py-3.5 border-none cursor-pointer text-left"
          >
            <Lock size={16} strokeWidth={2} className="text-gray-500 shrink-0" />
            <span className="text-[15px] flex-1">비밀번호 변경</span>
            <span className="text-gray-400 text-sm">›</span>
          </button>
        </div>
      </div>

      <AvatarPickerSheet
        open={showAvatarSheet}
        user={user}
        accessToken={accessToken}
        onApplied={(next) => setUser((prev) => ({ ...prev, ...next }))}
        onClose={() => setShowAvatarSheet(false)}
      />
    </div>
  )
}
