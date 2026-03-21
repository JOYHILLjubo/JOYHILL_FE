import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import BottomNav from '../components/BottomNav'
import { useOrg } from '../context/OrgContext'

const ROLE_LABELS = {
  admin: '관리자',
  pastor: '교역자·부장',
  village_leader: '마을장',
  leader: '리더',
  member: '청년',
}
// 마을장 포함
const ROLE_OPTIONS = ['member', 'leader', 'village_leader', 'pastor', 'admin']
const ROLE_CHANGE_NOTES = {
  leader: (name) => `저장 시 '${name.slice(-2)}팸'이 자동 생성됩니다.`,
  village_leader: (name) => `저장 시 '${name.slice(-2)}이네/네' 마을이 자동 생성됩니다.`,
}
const ROLE_DEMOTE_NOTES = {
  leader: '팸원이 없을 경우에만 변경 가능합니다.',
  village_leader: '팸이 없을 경우에만 변경 가능합니다.',
}

const TEAM_OPTIONS = ['찬양팀', '예배팀', '함기팀', '함성팀', '새가족팀', '미디어사역팀', 'LAB팀']

const avatarColors = [
  { bg: 'bg-success-light', text: 'text-success' },
  { bg: 'bg-primary-light', text: 'text-primary' },
  { bg: 'bg-warning-light', text: 'text-warning' },
  { bg: 'bg-danger-light', text: 'text-danger' },
]
function getColor(id) { return avatarColors[id % avatarColors.length] }

const EMPTY_FORM = {
  name: '', userId: '', fam: '', village: '',
  role: 'member', teams: [], teamRoles: [], phone: '', birth: '',
}

// ─── 사용자 수정/추가 전체화면 ───
function UserEditView({ initial, isNew, onSave, onBack, onDelete, onRoleChange }) {
  const { villages } = useOrg()
  const [form, setForm] = useState({ ...initial })
  const [pendingRole, setPendingRole] = useState(null)

  const villageNames = Object.keys(villages)
  const allFams = Object.values(villages).flat()

  const toggleTeam = (t) => setForm((p) => {
    const next = p.teams.includes(t) ? p.teams.filter((x) => x !== t) : [...p.teams, t]
    return { ...p, teams: next, teamRoles: p.teamRoles.filter((x) => next.includes(x)) }
  })
  const toggleTeamRole = (t) => setForm((p) => ({
    ...p,
    teamRoles: p.teamRoles.includes(t)
      ? p.teamRoles.filter((x) => x !== t)
      : [...p.teamRoles, t],
  }))

  const handleRoleClick = (newRole) => {
    if (newRole === form.role) return
    setForm((p) => ({ ...p, role: newRole }))
    setPendingRole(newRole)
  }

  const handleSave = () => {
    if (!form.name.trim()) { alert('이름을 입력해주세요.'); return }
    if (!form.userId.trim()) { alert('아이디를 입력해주세요.'); return }
    if (!form.fam) { alert('소속 팸을 선택해주세요.'); return }

    // 역할 변경이 있으면 먼저 제약 체크
    if (!isNew && pendingRole !== null && pendingRole !== initial.role) {
      const result = onRoleChange(initial.id, pendingRole)
      if (!result.ok) {
        alert(result.reason)
        setForm((p) => ({ ...p, role: initial.role }))
        setPendingRole(null)
        return
      }
    }
    onSave(form)
  }

  const c = getColor(initial.id || 0)

  // 역할 변경 안내 문구
  const getRoleNote = () => {
    if (!pendingRole || pendingRole === initial.role) return null
    if (ROLE_CHANGE_NOTES[pendingRole]) return { type: 'upgrade', text: ROLE_CHANGE_NOTES[pendingRole](form.name) }
    if (ROLE_DEMOTE_NOTES[initial.role] && pendingRole !== initial.role) return { type: 'demote', text: ROLE_DEMOTE_NOTES[initial.role] }
    return null
  }
  const roleNote = getRoleNote()

  return (
    <div className="pb-28">
      <div className="flex items-center gap-3 px-5 pt-4 pb-3 border-b border-gray-300">
        <button onClick={onBack} className="text-lg bg-transparent border-none cursor-pointer">←</button>
        <p className="text-base font-medium flex-1">{isNew ? '사용자 추가' : '사용자 수정'}</p>
        {!isNew && (
          <button onClick={onDelete}
            className="text-xs text-danger bg-danger-light px-3 py-1.5 rounded-full border-none cursor-pointer">
            삭제
          </button>
        )}
      </div>

      {!isNew && (
        <div className="flex flex-col items-center pt-5 pb-3">
          <div className={`w-14 h-14 rounded-full ${c.bg} flex items-center justify-center text-xl font-medium ${c.text} mb-2`}>
            {form.name?.[0] || '?'}
          </div>
          <p className="text-sm font-medium">{form.name}</p>
          <p className="text-xs text-gray-500">{form.village} · {form.fam} · {ROLE_LABELS[form.role]}</p>
        </div>
      )}

      <div className="px-5 pt-4 flex flex-col gap-4">

        <div>
          <p className="text-xs text-gray-500 mb-1.5">이름 <span className="text-danger">*</span></p>
          <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="실명"
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-primary" />
        </div>

        <div>
          <p className="text-xs text-gray-500 mb-1.5">아이디 <span className="text-danger">*</span></p>
          <input value={form.userId} onChange={(e) => setForm({ ...form, userId: e.target.value })}
            placeholder="로그인 아이디"
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-primary" />
        </div>

        <div>
          <p className="text-xs text-gray-500 mb-1.5">전화번호</p>
          <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
            placeholder="010-0000-0000"
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-primary" />
        </div>

        <div>
          <p className="text-xs text-gray-500 mb-1.5">생년월일</p>
          <input type="date" value={form.birth} onChange={(e) => setForm({ ...form, birth: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-primary" />
        </div>

        <div>
          <p className="text-xs text-gray-500 mb-1.5">소속 마을</p>
          <select value={form.village} onChange={(e) => setForm({ ...form, village: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-primary bg-white">
            <option value="">선택</option>
            {villageNames.map((v) => <option key={v}>{v}</option>)}
          </select>
        </div>

        <div>
          <p className="text-xs text-gray-500 mb-1.5">소속 팸 <span className="text-danger">*</span></p>
          <select value={form.fam} onChange={(e) => setForm({ ...form, fam: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-primary bg-white">
            <option value="">선택</option>
            {allFams.map((f) => <option key={f}>{f}</option>)}
          </select>
        </div>

        {/* 역할 — village_leader 포함 */}
        <div>
          <p className="text-xs text-gray-500 mb-1.5">역할</p>
          <div className="flex gap-2 flex-wrap">
            {ROLE_OPTIONS.map((r) => (
              <button key={r} onClick={() => handleRoleClick(r)}
                className={`text-xs px-2.5 py-1.5 rounded-full border cursor-pointer transition-all ${
                  form.role === r
                    ? 'bg-primary-light text-primary border-primary'
                    : 'bg-white text-gray-500 border-gray-300'
                }`}>
                {ROLE_LABELS[r]}
              </button>
            ))}
          </div>
          {/* 역할 변경 안내 */}
          {!isNew && roleNote && (
            <div className={`mt-2 px-3 py-2 rounded-lg ${roleNote.type === 'upgrade' ? 'bg-warning-light' : 'bg-gray-100'}`}>
              <p className={`text-[11px] ${roleNote.type === 'upgrade' ? 'text-warning' : 'text-gray-500'}`}>
                {roleNote.text}
              </p>
            </div>
          )}
        </div>

        <div>
          <p className="text-xs text-gray-500 mb-1.5">사역팀 소속</p>
          <div className="flex gap-2 flex-wrap">
            {TEAM_OPTIONS.map((t) => (
              <button key={t} onClick={() => toggleTeam(t)}
                className={`text-xs px-2.5 py-1.5 rounded-full border cursor-pointer transition-all ${
                  form.teams.includes(t)
                    ? 'bg-primary-light text-primary border-primary'
                    : 'bg-white text-gray-500 border-gray-300'
                }`}>
                {t}
              </button>
            ))}
          </div>
        </div>

        {form.teams.length > 0 && (
          <div>
            <p className="text-xs text-gray-500 mb-1.5">팀장 여부</p>
            <div className="flex gap-2 flex-wrap">
              {form.teams.map((t) => (
                <button key={t} onClick={() => toggleTeamRole(t)}
                  className={`text-xs px-2.5 py-1.5 rounded-full border cursor-pointer transition-all ${
                    form.teamRoles.includes(t)
                      ? 'bg-warning-light text-warning border-warning'
                      : 'bg-white text-gray-500 border-gray-300'
                  }`}>
                  {t} 팀장
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] px-5 py-3 bg-white border-t border-gray-300">
        <button onClick={handleSave}
          className="w-full py-3 bg-primary text-white rounded-lg text-sm font-medium border-none cursor-pointer hover:bg-primary-hover transition-colors">
          {isNew ? '추가하기' : '저장하기'}
        </button>
      </div>
    </div>
  )
}

// ─── 메인 ───
export default function AccountManagePage() {
  const navigate = useNavigate()
  const { users, addUser, updateUser, deleteUser, changeUserRole } = useOrg()

  const [search, setSearch] = useState('')
  const [filterRole, setFilterRole] = useState('전체')
  const [editTarget, setEditTarget] = useState(null)

  if (editTarget !== null) {
    const isNew = editTarget === false
    return (
      <UserEditView
        initial={isNew ? { ...EMPTY_FORM } : { ...editTarget }}
        isNew={isNew}
        onBack={() => setEditTarget(null)}
        onRoleChange={changeUserRole}
        onSave={(form) => {
          if (isNew) {
            addUser(form)
          } else {
            updateUser(editTarget.id, {
              name: form.name, userId: form.userId, phone: form.phone,
              birth: form.birth, village: form.village, fam: form.fam,
              teams: form.teams, teamRoles: form.teamRoles,
            })
          }
          setEditTarget(null)
        }}
        onDelete={() => {
          if (!confirm('이 사용자를 삭제하시겠습니까?')) return
          deleteUser(editTarget.id)
          setEditTarget(null)
        }}
      />
    )
  }

  const filtered = users.filter((u) => {
    const matchRole = filterRole === '전체' || u.role === filterRole
    const q = search.trim()
    const matchSearch = !q
      || u.name.includes(q) || u.userId.includes(q)
      || (u.fam || '').includes(q) || (u.village || '').includes(q)
      || (u.phone || '').includes(q)
    return matchRole && matchSearch
  })

  return (
    <div className="pb-20">
      <div className="flex items-center gap-3 px-5 pt-4 pb-3 border-b border-gray-300">
        <button onClick={() => navigate('/my')} className="text-lg bg-transparent border-none cursor-pointer">←</button>
        <p className="text-base font-medium flex-1">계정 관리</p>
        <button onClick={() => setEditTarget(false)}
          className="text-xs text-white bg-primary px-3 py-1.5 rounded-full border-none cursor-pointer">
          + 추가
        </button>
      </div>

      <div className="px-5 pt-3 pb-2">
        <input value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="이름, 아이디, 팸, 마을, 전화번호 검색"
          className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-primary" />
      </div>

      <div className="flex gap-2 px-5 pb-3 overflow-x-auto">
        {['전체', ...ROLE_OPTIONS].map((r) => (
          <button key={r} onClick={() => setFilterRole(r)}
            className={`text-xs px-2.5 py-1 rounded-full border-none cursor-pointer whitespace-nowrap transition-colors ${
              filterRole === r ? 'bg-primary-light text-primary' : 'bg-gray-100 text-gray-500'
            }`}>
            {r === '전체' ? '전체' : ROLE_LABELS[r]}
          </button>
        ))}
      </div>

      <div className="px-5 pb-1">
        <span className="text-xs text-gray-500">총 {filtered.length}명</span>
      </div>

      <div className="px-5">
        {filtered.length === 0 && (
          <p className="text-sm text-gray-500 text-center mt-10">검색 결과가 없습니다.</p>
        )}
        {filtered.map((u) => {
          const color = getColor(u.id)
          return (
            <div key={u.id} onClick={() => setEditTarget(u)}
              className="flex items-center gap-3 py-3 border-b border-gray-300 last:border-b-0 cursor-pointer hover:bg-gray-100 -mx-5 px-5 transition-colors">
              <div className={`w-10 h-10 rounded-full ${color.bg} flex items-center justify-center text-sm font-medium ${color.text} shrink-0`}>
                {u.name[0]}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-sm font-medium">{u.name}</p>
                  <span className="text-[11px] text-primary bg-primary-light px-1.5 py-0.5 rounded-full">
                    {ROLE_LABELS[u.role]}
                  </span>
                  {u.teamRoles?.length > 0 && (
                    <span className="text-[11px] text-warning bg-warning-light px-1.5 py-0.5 rounded-full">
                      {u.teamRoles.join(', ')} 팀장
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-gray-500 mt-0.5 truncate">
                  @{u.userId} · {u.village || '—'} · {u.fam || '—'}
                </p>
                {u.phone && <p className="text-[11px] text-gray-500">{u.phone}</p>}
              </div>
              <span className="text-gray-500 text-xs shrink-0">→</span>
            </div>
          )
        })}
      </div>

      <BottomNav />
    </div>
  )
}
