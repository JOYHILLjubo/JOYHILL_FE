import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import BottomNav from '../components/BottomNav'

const FAM_LIST = [
  '사랑팸', '은혜팸', '믿음팸', '소망팸', '기쁨팸',
  '평화팸', '인내팸', '온유팸', '화평팸', '자비팸',
  '양선팸', '충성팸', '절제팸', '겸손팸', '섬김팸',
  '찬양팸', '감사팸', '순종팸', '헌신팸', '비전팸', '열방팸',
]

const EMPTY_FORM = {
  name: '',
  phone: '',
  birth: '',
  registeredAt: new Date().toISOString().slice(0, 10),
  note: '',
}

const initialNewcomers = [
  { id: 1, name: '이새벽', phone: '010-1234-5678', birth: '1998-05-12', registeredAt: '2025-03-02', note: '찬양팀 관심 있음', fam: null },
  { id: 2, name: '박새벽', phone: '010-9876-5432', birth: '2000-11-30', registeredAt: '2025-03-09', note: '', fam: '사랑팸' },
]

export default function NewcomerPage() {
  const navigate = useNavigate()
  const { canManageNewcomer } = useAuth()

  const [newcomers, setNewcomers] = useState(initialNewcomers)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [famDropdown, setFamDropdown] = useState(null)

  if (!canManageNewcomer) {
    return (
      <div className="flex flex-col items-center justify-center h-screen pb-20">
        <p className="text-gray-500 text-sm">접근 권한이 없습니다.</p>
        <button onClick={() => navigate('/my')} className="mt-3 text-xs text-primary bg-primary-light px-4 py-2 rounded-full border-none cursor-pointer">
          돌아가기
        </button>
        <BottomNav />
      </div>
    )
  }

  const handleAdd = () => {
    if (!form.name.trim()) { alert('이름을 입력해주세요.'); return }
    setNewcomers((prev) => [...prev, { id: Date.now(), ...form, fam: null }])
    setForm(EMPTY_FORM)
    setShowModal(false)
  }

  const assignFam = (newcomerId, fam) => {
    setNewcomers((prev) => prev.map((n) => n.id === newcomerId ? { ...n, fam } : n))
    setFamDropdown(null)
  }

  return (
    <div className="pb-24">
      {/* 헤더 */}
      <div className="flex items-center gap-3 px-5 pt-4 pb-3 border-b border-gray-300">
        <button onClick={() => navigate('/my')} className="text-lg bg-transparent border-none cursor-pointer">←</button>
        <p className="text-base font-medium flex-1">새가족 관리</p>
        <button onClick={() => setShowModal(true)} className="text-xs text-white bg-primary px-3 py-1.5 rounded-full border-none cursor-pointer">
          + 등록
        </button>
      </div>

      {/* 새가족 수 */}
      <div className="px-5 pt-3 pb-1">
        <span className="text-xs text-gray-500">총 {newcomers.length}명</span>
      </div>

      {/* 리스트 */}
      <div className="px-5 pt-1">
        {newcomers.length === 0 && (
          <p className="text-sm text-gray-500 text-center mt-10">등록된 새가족이 없습니다.</p>
        )}
        {newcomers.map((n) => (
          <div key={n.id} className="border border-gray-300 rounded-xl p-4 mb-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-primary-light flex items-center justify-center text-sm font-medium text-primary shrink-0">
                    {n.name[0]}
                  </div>
                  <p className="text-sm font-medium">{n.name}</p>
                </div>
                <div className="mt-2 ml-10 flex flex-col gap-0.5">
                  <p className="text-[12px] text-gray-500">{n.phone}</p>
                  <p className="text-[12px] text-gray-500">{n.birth} · 등록일 {n.registeredAt}</p>
                  {n.note ? <p className="text-[12px] text-primary mt-0.5">{n.note}</p> : null}
                </div>
              </div>

              {/* 팸 배정 버튼 */}
              <div className="relative shrink-0">
                <button
                  onClick={() => setFamDropdown(famDropdown === n.id ? null : n.id)}
                  className={`text-xs px-2.5 py-1.5 rounded-lg border-none cursor-pointer whitespace-nowrap ${
                    n.fam ? 'bg-success-light text-success' : 'bg-warning-light text-warning'
                  }`}
                >
                  {n.fam ? n.fam : '팸 배정 ▾'}
                </button>
                {famDropdown === n.id && (
                  <div className="absolute right-0 top-9 bg-white border border-gray-300 rounded-xl shadow-lg z-20 w-32 max-h-52 overflow-y-auto">
                    {FAM_LIST.map((fam) => (
                      <button key={fam} onClick={() => assignFam(n.id, fam)}
                        className={`w-full text-left text-sm px-3 py-2.5 border-none cursor-pointer hover:bg-gray-100 transition-colors ${
                          n.fam === fam ? 'text-primary font-medium bg-primary-light' : ''
                        }`}>
                        {fam}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 드롭다운 외부 클릭 닫기 */}
      {famDropdown !== null && (
        <div className="fixed inset-0 z-10" onClick={() => setFamDropdown(null)} />
      )}

      {/* 등록 모달 */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-end justify-center" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-t-2xl w-full max-w-[430px] p-5 pb-10 mb-10" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <p className="text-base font-medium">새가족 등록</p>
              <button onClick={() => setShowModal(false)} className="text-gray-500 text-lg bg-transparent border-none cursor-pointer">✕</button>
            </div>
            <div className="flex flex-col gap-3">
              <input placeholder="이름 *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="border border-gray-300 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-primary" />
              <input placeholder="연락처 (010-0000-0000)" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="border border-gray-300 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-primary" />
              <div>
                <p className="text-[11px] text-gray-500 mb-1 ml-1">생년월일</p>
                <input type="date" value={form.birth} onChange={(e) => setForm({ ...form, birth: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-primary" />
              </div>
              <div>
                <p className="text-[11px] text-gray-500 mb-1 ml-1">등록일</p>
                <input type="date" value={form.registeredAt} onChange={(e) => setForm({ ...form, registeredAt: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-primary" />
              </div>
              <textarea placeholder="기타 특이사항" value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })}
                rows={2} className="border border-gray-300 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-primary resize-none" />
            </div>
            <button onClick={handleAdd} className="w-full mt-4 py-3 bg-primary text-white rounded-lg text-sm font-medium border-none cursor-pointer">
              등록하기
            </button>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  )
}
