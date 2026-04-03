import FamManagePageConnected from './FamManagePageConnected'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useOrg } from '../context/OrgContext'
import BottomNav from '../components/BottomNav'
import MemberEditView, { getAvatarColor, FAM_ROLE_LABELS } from '../components/MemberEditView'

export default FamManagePageConnected

function LegacyFamManagePage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { villages, famMembers, famLeaders, updateFamMembers } = useOrg()

  const [editTarget, setEditTarget] = useState(null)

  // OrgContext에서 내 팸 팸원 가져오기
  const myMembers = famMembers[user.fam] || []

  // 내 마을의 팸 목록 (이동 선택지)
  const myVillageFams = villages[user.village] || []

  const handleSave = (form) => {
    if (editTarget === 'add') {
      const newMember = { ...form, id: `${user.fam}_${Date.now()}` }
      if (form.fam !== user.fam) {
        // 다른 팸으로 추가 (일반적이진 않지만 허용)
        updateFamMembers(form.fam, null, newMember)
      } else {
        updateFamMembers(user.fam, [...myMembers, newMember])
      }
    } else {
      if (form.fam !== user.fam) {
        // 팸 이동: 현재 팸에서 제거, 새 팸에 추가
        updateFamMembers(user.fam, myMembers.filter((m) => m.id !== editTarget.id))
        updateFamMembers(form.fam, null, { ...editTarget, ...form, id: `${form.fam}_${Date.now()}` })
      } else {
        updateFamMembers(user.fam, myMembers.map((m) => m.id === editTarget.id ? { ...editTarget, ...form } : m))
      }
    }
    setEditTarget(null)
  }

  const handleDelete = (member) => {
    if (!confirm(`'${member.name}'을 삭제하시겠습니까?`)) return
    updateFamMembers(user.fam, myMembers.filter((m) => m.id !== member.id))
    setEditTarget(null)
  }

  if (editTarget !== null) {
    return (
      <MemberEditView
        member={editTarget === 'add' ? null : editTarget}
        currentFam={user.fam}
        isNew={editTarget === 'add'}
        famOptions={myVillageFams}
        onBack={() => setEditTarget(null)}
        onSave={handleSave}
        onDelete={editTarget !== 'add' ? () => handleDelete(editTarget) : null}
      />
    )
  }

  return (
    <div className="pb-20">
      <div className="flex items-center gap-3 px-5 pt-4 pb-3 border-b border-gray-300">
        <button onClick={() => navigate('/my')} className="text-lg bg-transparent border-none cursor-pointer">←</button>
        <p className="text-base font-medium flex-1">내 팸 관리</p>
        <button onClick={() => setEditTarget('add')}
          className="text-xs text-white bg-primary px-3 py-1.5 rounded-full border-none cursor-pointer">
          + 추가
        </button>
      </div>

      <div className="px-5 pt-2 pb-1">
        <p className="text-xs text-gray-500">
          {user.fam} · {user.village} · 리더: {famLeaders[user.fam] || '—'} · 총 {myMembers.length}명
        </p>
      </div>

      <div className="px-5">
        {myMembers.length === 0 && (
          <div className="text-center mt-10">
            <p className="text-sm text-gray-500">팸원이 없습니다.</p>
            <button onClick={() => setEditTarget('add')}
              className="mt-3 text-xs text-primary bg-primary-light px-4 py-2 rounded-full border-none cursor-pointer">
              + 팸원 추가하기
            </button>
          </div>
        )}
        {myMembers.map((m) => {
          const color = getAvatarColor(m.id?.charCodeAt?.(0) ?? m.id)
          return (
            <div key={m.id} onClick={() => setEditTarget(m)}
              className="flex items-center gap-3 py-3 border-b border-gray-300 last:border-b-0 cursor-pointer hover:bg-gray-100 -mx-5 px-5 transition-colors">
              <div className={`w-9 h-9 rounded-full ${color.bg} flex items-center justify-center text-[13px] font-medium ${color.text} shrink-0`}>
                {m.name[0]}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">{m.name}</p>
                <p className="text-[11px] text-gray-500">{m.phone || '—'}</p>
              </div>
              <span className={`text-[11px] px-2 py-0.5 rounded-full shrink-0 ${
                m.role === 'leader' ? 'bg-primary-light text-primary' : 'bg-gray-100 text-gray-500'
              }`}>
                {FAM_ROLE_LABELS[m.role] ?? m.role}
              </span>
              <span className="text-gray-500 text-xs">→</span>
            </div>
          )
        })}
      </div>

      <BottomNav />
    </div>
  )
}
