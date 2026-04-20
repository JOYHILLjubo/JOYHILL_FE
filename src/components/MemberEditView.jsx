import { useState } from 'react'
import { useOrg } from '../context/OrgContext'
import DateSelect from './DateSelect'

export const FAM_ROLE_LABELS = { member: '팸원', leader: '리더', village_leader: '마을장' }

const FAM_ROLES = ['member', 'leader', 'village_leader']

const avatarColors = [
  { bg: 'bg-success-light', text: 'text-success' },
  { bg: 'bg-primary-light', text: 'text-primary' },
  { bg: 'bg-warning-light', text: 'text-warning' },
  { bg: 'bg-danger-light', text: 'text-danger' },
]
export function getAvatarColor(seed) {
  const idx = typeof seed === 'number' ? seed : (seed?.charCodeAt?.(0) ?? 0)
  return avatarColors[idx % avatarColors.length]
}

// 역할 변경 안내 문구
function getRoleChangeNote(oldRole, newRole, name) {
  if (!oldRole || oldRole === newRole) return null
  const firstName = name?.length > 2 ? name.slice(-2) : name?.slice(-1) || ''

  // 승급
  if (newRole === 'leader' && oldRole !== 'leader') {
    return { type: 'upgrade', text: `저장 시 '${firstName}팸'이 자동 생성됩니다.` }
  }
  if (newRole === 'village_leader' && oldRole !== 'village_leader') {
    const suffix = firstName ? (/* hasBatchim */ ((firstName.charCodeAt(firstName.length - 1) - 0xAC00) % 28 !== 0) ? `${firstName}이네` : `${firstName}네`) : ''
    return { type: 'upgrade', text: `저장 시 '${suffix}' 마을이 자동 생성됩니다.` }
  }
  // 강등
  if (oldRole === 'leader' && newRole !== 'leader') {
    return { type: 'demote', text: `팸원이 없을 경우에만 강등됩니다. 팸은 그대로 남습니다.` }
  }
  if (oldRole === 'village_leader' && newRole !== 'village_leader') {
    return { type: 'demote', text: `팸이 없을 경우에만 강등됩니다. 마을은 그대로 남습니다.` }
  }
  return null
}

export default function MemberEditView({
  member,
  currentFam,
  isNew = false,
  famOptions,
  onBack,
  onSave,
  onDelete,
}) {
  const { villages, changeFamMemberRole } = useOrg()

  const allFams = famOptions !== undefined
    ? famOptions
    : Object.values(villages).flat()

  const EMPTY = {
    name: '', phone: '', birth: '',
    role: 'member',
    fam: currentFam || '', note: '',
    worshipRate: 0, famRate: 0,
  }

  const [form, setForm] = useState(
    member ? { fam: currentFam || '', ...member } : { ...EMPTY }
  )

  const getVillageForFam = (famName) => {
    for (const [village, fams] of Object.entries(villages)) {
      if (fams.includes(famName)) return village
    }
    return '—'
  }

  const autoVillage = getVillageForFam(form.fam)
  const c = getAvatarColor(form.fam?.charCodeAt?.(0) ?? 0)

  const originalRole = member?.role ?? null
  const roleChanged = !isNew && originalRole !== null && form.role !== originalRole
  const roleNote = roleChanged ? getRoleChangeNote(originalRole, form.role, form.name) : null

  const handleSave = () => {
    if (!form.name.trim()) { alert('이름을 입력해주세요.'); return }
    if (allFams.length > 0 && !form.fam) { alert('소속 팸을 선택해주세요.'); return }

    // 역할이 바뀌었으면 제약 체크 먼저
    if (roleChanged) {
      const result = changeFamMemberRole(member, form.role)
      if (!result.ok) {
        alert(result.reason)
        setForm((p) => ({ ...p, role: originalRole })) // 롤백
        return
      }
    }

    onSave({ ...form })
  }

  return (
    <div className="pb-28">
      {/* 헤더 */}
      <div className="flex items-center gap-3 px-5 pt-4 pb-3 border-b border-gray-300">
        <button onClick={onBack} className="text-lg bg-transparent border-none cursor-pointer">←</button>
        <p className="text-base font-medium flex-1">{isNew ? '팸원 추가' : '팸원 정보'}</p>
        {!isNew && onDelete && (
          <button onClick={onDelete}
            className="text-xs text-danger bg-danger-light px-3 py-1.5 rounded-full border-none cursor-pointer">
            삭제
          </button>
        )}
      </div>

      {/* 아바타 */}
      {!isNew && (
        <div className="flex flex-col items-center pt-5 pb-3">
          <div className={`w-14 h-14 rounded-full ${c.bg} flex items-center justify-center text-xl font-medium ${c.text} mb-2`}>
            {form.name?.[0] || '?'}
          </div>
          <p className="text-sm font-medium">{form.name || '—'}</p>
          <p className="text-xs text-gray-500">
            {autoVillage} · {form.fam} · {FAM_ROLE_LABELS[form.role] ?? form.role}
          </p>
        </div>
      )}

      <div className="px-5 pt-4 flex flex-col gap-4">

        {/* 이름 */}
        <div>
          <p className="text-xs text-gray-500 mb-1.5">이름 <span className="text-danger">*</span></p>
          <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="실명"
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-primary" />
        </div>

        {/* 전화번호 */}
        <div>
          <p className="text-xs text-gray-500 mb-1.5">전화번호</p>
          <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
            placeholder="010-0000-0000"
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-primary" />
        </div>

        {/* 생년월일 */}
        <div>
          <p className="text-xs text-gray-500 mb-1.5">생년월일</p>
          <DateSelect
            value={form.birth}
            onChange={(val) => setForm({ ...form, birth: val })}
          />
        </div>

        {/* 역할 — 팸원/리더/마을장 */}
        <div>
          <p className="text-xs text-gray-500 mb-1.5">역할</p>
          <div className="flex gap-2 flex-wrap">
            {FAM_ROLES.map((r) => (
              <button key={r} onClick={() => setForm({ ...form, role: r })}
                className={`text-xs px-3 py-1.5 rounded-full border cursor-pointer transition-all ${
                  form.role === r
                    ? 'bg-primary-light text-primary border-primary'
                    : 'bg-white text-gray-500 border-gray-300'
                }`}>
                {FAM_ROLE_LABELS[r]}
              </button>
            ))}
          </div>
          {/* 역할 변경 안내 */}
          {roleNote && (
            <div className={`mt-2 px-3 py-2 rounded-lg ${roleNote.type === 'upgrade' ? 'bg-warning-light' : 'bg-gray-100'}`}>
              <p className={`text-[11px] ${roleNote.type === 'upgrade' ? 'text-warning' : 'text-gray-500'}`}>
                {roleNote.text}
              </p>
            </div>
          )}
        </div>

        {/* 소속 팸 */}
        {allFams.length > 0 && (
          <div>
            <p className="text-xs text-gray-500 mb-1.5">소속 팸 <span className="text-danger">*</span></p>
            <select value={form.fam} onChange={(e) => setForm({ ...form, fam: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-primary bg-white">
              <option value="">선택</option>
              {allFams.map((f) => <option key={f} value={f}>{f}</option>)}
            </select>
          </div>
        )}

        {/* 소속 마을 (자동) */}
        {allFams.length > 0 && (
          <div>
            <p className="text-xs text-gray-500 mb-1.5">소속 마을</p>
            <div className="flex items-center gap-2 px-3 py-2.5 bg-gray-100 rounded-lg">
              <p className="text-sm text-gray-700 flex-1">{autoVillage}</p>
              <span className="text-[11px] text-gray-500">팸 선택 시 자동</span>
            </div>
          </div>
        )}

        {/* 메모 */}
        <div>
          <p className="text-xs text-gray-500 mb-1.5">메모</p>
          <textarea value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })}
            rows={3} placeholder="특이사항 메모"
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-primary resize-none" />
        </div>
      </div>

      {/* 저장 버튼 */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] px-5 py-3 bg-white border-t border-gray-300">
        <button onClick={handleSave}
          className="w-full py-3 bg-primary text-white rounded-lg text-sm font-medium border-none cursor-pointer hover:bg-primary-hover transition-colors">
          {isNew ? '추가하기' : '저장하기'}
        </button>
      </div>
    </div>
  )
}
