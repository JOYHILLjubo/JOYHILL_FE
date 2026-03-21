import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useOrg } from '../context/OrgContext'
import BottomNav from '../components/BottomNav'
import MemberEditView, { getAvatarColor } from '../components/MemberEditView'

const ALL_TEAMS = ['찬양팀', '예배팀', '함기팀', '함성팀', '새가족팀', '미디어사역팀', 'LAB팀']
const TEAM_INTROS = {
  찬양팀: '주일 예배 찬양을 섬기는 팀입니다.',
  예배팀: '예배 전반을 기획하고 섬기는 팀입니다.',
  함기팀: '함께 기도하며 중보하는 팀입니다.',
  함성팀: '청년부 행사 기획 및 운영을 담당합니다.',
  새가족팀: '새로 오신 분들을 환영하고 정착을 돕는 팀입니다.',
  미디어사역팀: '영상, 음향, 방송을 담당하는 팀입니다.',
  LAB팀: '리더십 개발 및 훈련 프로그램을 운영합니다.',
}

const MN = ['김민수', '이은혜', '박준호', '정하늘', '최수진', '한소망', '조은별']
function createTeamMembers(team) {
  return MN.slice(0, (team.charCodeAt(0) % 3) + 3).map((name, i) => ({
    id: `${team}_${i}`, name, fam: team,
    phone: `010-${String(1000 + team.charCodeAt(0) + i * 11)}-${String(5678 + i * 7)}`,
    birth: `199${(i + 2) % 9}-0${(i % 9) + 1}-${String(10 + i * 3)}`,
    role: i === 0 ? '팀장' : '팀원', note: '',
    worshipRate: 60, famRate: 60,
  }))
}

function RateChip({ rate, type }) {
  return (
    <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 6px', borderRadius: 9,
      background: type === 'worship' ? '#E8F0FE' : '#FEF7E0',
      color: type === 'worship' ? '#4285F4' : '#F9AB00' }}>
      {rate}%
    </span>
  )
}

// ─── 공통 바텀시트 ───
function BottomSheet({ onClose, children }) {
  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-end justify-center" onClick={onClose}>
      <div className="bg-white rounded-t-2xl w-full max-w-[430px] flex flex-col"
        style={{ maxHeight: '80vh' }} onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>
  )
}

// ─── 팸 이동 바텀시트 (소속 마을만 변경) ───
function FamMoveSheet({ fam, currentVillage, villageNames, onClose, onSave }) {
  const [targetVillage, setTargetVillage] = useState(currentVillage)
  return (
    <BottomSheet onClose={onClose}>
      <div className="flex items-center justify-between px-5 pt-5 pb-3 shrink-0">
        <div>
          <p className="text-base font-medium">{fam} 이동</p>
          <p className="text-xs text-gray-500">현재: {currentVillage}</p>
        </div>
        <button onClick={onClose} className="text-gray-500 text-lg bg-transparent border-none cursor-pointer">✕</button>
      </div>
      <div className="px-5 flex-1 overflow-y-auto pb-3">
        <p className="text-xs text-gray-500 mb-1.5">이동할 마을</p>
        <select value={targetVillage} onChange={(e) => setTargetVillage(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-primary bg-white">
          {villageNames.map((v) => <option key={v} value={v}>{v}</option>)}
        </select>
      </div>
      <div className="px-5 py-4 border-t border-gray-300 shrink-0">
        <button
          onClick={() => {
            if (targetVillage === currentVillage) { onClose(); return }
            onSave(targetVillage)
          }}
          className="w-full py-3 bg-primary text-white rounded-lg text-sm font-medium border-none cursor-pointer hover:bg-primary-hover transition-colors">
          수정하기
        </button>
      </div>
    </BottomSheet>
  )
}

// ─── 팸 상세 뷰 ───
function FamDetailView({ fam, village, onBack }) {
  const { famMembers, famLeaders, updateFamMembers, villages } = useOrg()
  const members = famMembers[fam] || []
  const [editTarget, setEditTarget] = useState(null)
  const availableFams = Object.values(villages).flat()

  const handleSave = (form) => {
    if (editTarget === 'add') {
      updateFamMembers(fam, [...members, { ...form, id: `${fam}_${Date.now()}` }])
    } else {
      if (form.fam !== fam) {
        updateFamMembers(fam, members.filter((m) => m.id !== editTarget.id))
        updateFamMembers(form.fam, null, { ...editTarget, ...form, id: `${form.fam}_${Date.now()}` })
      } else {
        updateFamMembers(fam, members.map((m) => m.id === editTarget.id ? { ...editTarget, ...form } : m))
      }
    }
    setEditTarget(null)
  }
  const handleDelete = (member) => {
    if (!confirm(`'${member.name}'을 삭제하시겠습니까?`)) return
    updateFamMembers(fam, members.filter((m) => m.id !== member.id))
    setEditTarget(null)
  }

  if (editTarget !== null) {
    return (
      <MemberEditView
        member={editTarget === 'add' ? null : editTarget}
        currentFam={fam} isNew={editTarget === 'add'} famOptions={availableFams}
        onBack={() => setEditTarget(null)} onSave={handleSave}
        onDelete={editTarget !== 'add' ? () => handleDelete(editTarget) : null}
      />
    )
  }

  const avgWorship = members.length ? Math.round(members.reduce((s, m) => s + m.worshipRate, 0) / members.length) : 0
  const avgFam = members.length ? Math.round(members.reduce((s, m) => s + m.famRate, 0) / members.length) : 0

  return (
    <div className="pb-20">
      <div className="flex items-center gap-3 px-5 pt-4 pb-3 border-b border-gray-300">
        <button onClick={onBack} className="text-lg bg-transparent border-none cursor-pointer">←</button>
        <div className="flex-1">
          <p className="text-base font-medium">{fam}</p>
          <p className="text-xs text-gray-500">{village} · 리더: {famLeaders[fam] || '—'}</p>
        </div>
        <button onClick={() => setEditTarget('add')} className="text-xs text-white bg-primary px-3 py-1.5 rounded-full border-none cursor-pointer">+ 추가</button>
      </div>
      {members.length > 0 && (
        <div className="px-5 py-3 bg-gray-100/50 border-b border-gray-300">
          <p className="text-xs text-gray-500 mb-2">팸 평균 출석률</p>
          <div className="flex gap-3">
            <div className="flex items-center gap-1.5"><span className="text-[11px] text-primary">예배</span><span className="text-sm font-bold text-primary">{avgWorship}%</span></div>
            <span className="text-gray-300">|</span>
            <div className="flex items-center gap-1.5"><span className="text-[11px] text-warning">팸모임</span><span className="text-sm font-bold text-warning">{avgFam}%</span></div>
          </div>
        </div>
      )}
      <div className="px-5">
        {members.length === 0 && <p className="text-sm text-gray-500 text-center mt-10">팸원이 없습니다.</p>}
        {members.map((m) => {
          const color = getAvatarColor(m.id?.charCodeAt?.(0) ?? 0)
          return (
            <div key={m.id} onClick={() => setEditTarget(m)}
              className="flex items-center gap-3 py-3 border-b border-gray-300 last:border-b-0 cursor-pointer hover:bg-gray-100 -mx-5 px-5 transition-colors">
              <div className={`w-9 h-9 rounded-full ${color.bg} flex items-center justify-center text-[13px] font-medium ${color.text} shrink-0`}>{m.name[0]}</div>
              <div className="flex-1"><p className="text-sm font-medium">{m.name}</p><p className="text-[11px] text-gray-500">{m.role} · {m.phone || '—'}</p></div>
              <div className="flex gap-1.5 items-center"><RateChip rate={m.worshipRate} type="worship" /><RateChip rate={m.famRate} type="fam" /></div>
              <span className="text-gray-500 text-xs ml-1">→</span>
            </div>
          )
        })}
      </div>
      <BottomNav />
    </div>
  )
}

// ─── 사역팀 상세 뷰 ───
function TeamDetailView({ team, onBack }) {
  const [members, setMembers] = useState(createTeamMembers(team))
  const [editTarget, setEditTarget] = useState(null)
  const [tab, setTab] = useState('members')
  const [intro, setIntro] = useState(TEAM_INTROS[team] || '')
  const [editingIntro, setEditingIntro] = useState(false)

  if (editTarget !== null) {
    return (
      <MemberEditView
        member={editTarget === 'add' ? null : editTarget}
        currentFam={team} isNew={editTarget === 'add'} famOptions={[]}
        onBack={() => setEditTarget(null)}
        onSave={(form) => {
          if (editTarget === 'add') setMembers((p) => [...p, { ...form, id: `team_${Date.now()}` }])
          else setMembers((p) => p.map((m) => m.id === editTarget.id ? { ...editTarget, ...form } : m))
          setEditTarget(null)
        }}
        onDelete={editTarget !== 'add' ? () => {
          if (!confirm(`'${editTarget.name}'을 삭제하시겠습니까?`)) return
          setMembers((p) => p.filter((m) => m.id !== editTarget.id)); setEditTarget(null)
        } : null}
      />
    )
  }
  return (
    <div className="pb-20">
      <div className="flex items-center gap-3 px-5 pt-4 pb-3 border-b border-gray-300">
        <button onClick={onBack} className="text-lg bg-transparent border-none cursor-pointer">←</button>
        <p className="text-base font-medium flex-1">{team}</p>
      </div>
      <div className="flex border-b border-gray-300">
        {[['members', '팀원 관리'], ['intro', '팀 소개']].map(([key, label]) => (
          <button key={key} onClick={() => setTab(key)}
            className={`flex-1 py-2.5 text-sm border-none cursor-pointer bg-transparent transition-colors ${tab === key ? 'text-primary font-medium border-b-2 border-primary' : 'text-gray-500'}`}>
            {label}
          </button>
        ))}
      </div>
      {tab === 'members' && (
        <div className="px-5 pt-3">
          <div className="flex justify-between items-center mb-3">
            <span className="text-xs text-gray-500">총 {members.length}명</span>
            <button onClick={() => setEditTarget('add')} className="text-xs text-primary bg-primary-light px-3 py-1.5 rounded-full border-none cursor-pointer">+ 팀원 추가</button>
          </div>
          {members.map((m) => {
            const color = getAvatarColor(m.id?.charCodeAt?.(0) ?? 0)
            return (
              <div key={m.id} onClick={() => setEditTarget(m)}
                className="flex items-center py-3 border-b border-gray-300 last:border-b-0 cursor-pointer hover:bg-gray-100 -mx-5 px-5 transition-colors">
                <div className={`w-9 h-9 rounded-full ${color.bg} flex items-center justify-center text-[13px] font-medium ${color.text} shrink-0`}>{m.name[0]}</div>
                <div className="flex-1 ml-3"><p className="text-sm">{m.name}</p><p className="text-[11px] text-gray-500">{m.phone || '—'}</p></div>
                <span className={`text-[11px] px-2 py-0.5 rounded-full mr-2 ${m.role === '팀장' ? 'bg-warning-light text-warning' : 'bg-gray-100 text-gray-500'}`}>{m.role}</span>
                <span className="text-gray-500 text-xs">→</span>
              </div>
            )
          })}
        </div>
      )}
      {tab === 'intro' && (
        <div className="px-5 pt-4">
          {editingIntro ? (
            <>
              <textarea value={intro} onChange={(e) => setIntro(e.target.value)} rows={6} className="w-full border border-primary rounded-lg px-3 py-2.5 text-sm outline-none resize-none" />
              <div className="flex gap-2 mt-3">
                <button onClick={() => setEditingIntro(false)} className="flex-1 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-500 bg-white cursor-pointer">취소</button>
                <button onClick={() => setEditingIntro(false)} className="flex-1 py-2.5 bg-primary text-white rounded-lg text-sm font-medium border-none cursor-pointer">저장</button>
              </div>
            </>
          ) : (
            <>
              <div className="border border-gray-300 rounded-xl p-4 min-h-[100px]"><p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{intro}</p></div>
              <button onClick={() => setEditingIntro(true)} className="w-full mt-3 py-2.5 border border-primary text-primary rounded-lg text-sm cursor-pointer bg-white">소개 수정</button>
            </>
          )}
        </div>
      )}
      <BottomNav />
    </div>
  )
}

// ─── 메인 ───
export default function VillageManagePage() {
  const navigate = useNavigate()
  const { user, isPastorOrAbove } = useAuth()
  const { villages, villageLeaders, famLeaders, famMembers, moveFam, deleteFam, deleteVillage } = useOrg()

  const [search, setSearch] = useState('')
  const [expandedVillage, setExpandedVillage] = useState(isPastorOrAbove ? null : user.village)
  const [selectedFam, setSelectedFam] = useState(null)
  const [activeTab, setActiveTab] = useState('village')
  const [expandedTeam, setExpandedTeam] = useState(null)
  const [selectedTeam, setSelectedTeam] = useState(null)
  const [moveSheet, setMoveSheet] = useState(null) // { fam, village }

  // 권한에 따른 마을 필터
  const myVillages = isPastorOrAbove
    ? villages
    : { [user.village]: villages[user.village] || [] }

  const villageNames = Object.keys(villages)

  const handleDeleteFam = (fam, village) => {
    const result = deleteFam(fam, village)
    if (!result.ok) alert(result.reason)
  }
  const handleDeleteVillage = (village) => {
    const result = deleteVillage(village)
    if (!result.ok) alert(result.reason)
    else if (expandedVillage === village) setExpandedVillage(null)
  }
  const handleMoveFam = (targetVillage) => {
    moveFam(moveSheet.fam, moveSheet.village, targetVillage)
    setMoveSheet(null)
  }

  // 검색
  const searchResults = useMemo(() => {
    const q = search.trim()
    if (!q) return null
    const results = []
    Object.entries(myVillages).forEach(([village, fams]) => {
      fams.forEach((fam) => {
        if (fam.includes(q) || (famLeaders[fam] || '').includes(q))
          results.push({ type: 'fam', village, fam })
        ;(famMembers[fam] || []).forEach((m) => {
          if (m.name.includes(q) || (m.phone || '').includes(q))
            results.push({ type: 'member', village, fam, member: m })
        })
      })
    })
    return results
  }, [search, myVillages, famLeaders, famMembers])

  const title = isPastorOrAbove ? '청년부 전체 관리' : `${user.village} 관리`

  if (selectedFam) {
    return <FamDetailView fam={selectedFam.fam} village={selectedFam.village} onBack={() => setSelectedFam(null)} />
  }
  if (selectedTeam) {
    return <TeamDetailView team={selectedTeam} onBack={() => setSelectedTeam(null)} />
  }

  return (
    <div className="pb-20">
      <div className="flex items-center gap-3 px-5 pt-4 pb-3 border-b border-gray-300">
        <button onClick={() => navigate('/my')} className="text-lg bg-transparent border-none cursor-pointer">←</button>
        <p className="text-base font-medium flex-1">{title}</p>
      </div>

      {isPastorOrAbove && (
        <div className="flex border-b border-gray-300">
          {[['village', '마을·팸 관리'], ['team', '사역팀 관리']].map(([key, label]) => (
            <button key={key} onClick={() => { setActiveTab(key); setSearch('') }}
              className={`flex-1 py-2.5 text-sm border-none cursor-pointer bg-transparent transition-colors ${activeTab === key ? 'text-primary font-medium border-b-2 border-primary' : 'text-gray-500'}`}>
              {label}
            </button>
          ))}
        </div>
      )}

      {(!isPastorOrAbove || activeTab === 'village') && (
        <>
          <div className="px-5 pt-3 pb-2">
            <input value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="팸 이름, 팸원 이름, 전화번호 검색"
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-primary" />
          </div>

          {searchResults !== null ? (
            <div className="px-5 pb-3">
              <p className="text-xs text-gray-500 mb-2">검색 결과 {searchResults.length}건</p>
              {searchResults.length === 0 && <p className="text-sm text-gray-500 text-center mt-8">검색 결과가 없습니다.</p>}
              {searchResults.map((r, idx) => {
                if (r.type === 'fam') {
                  return (
                    <div key={`fam_${r.fam}_${idx}`} className="flex items-center gap-3 py-3 border-b border-gray-300 last:border-b-0">
                      <div className="w-9 h-9 rounded-full bg-success-light flex items-center justify-center text-[13px] font-medium text-success shrink-0">{r.fam[0]}</div>
                      <div className="flex-1 cursor-pointer" onClick={() => setSelectedFam({ fam: r.fam, village: r.village })}>
                        <p className="text-sm font-medium">{r.fam}</p>
                        <p className="text-[11px] text-gray-500">{r.village} · 리더: {famLeaders[r.fam] || '—'} · {(famMembers[r.fam] || []).length}명</p>
                      </div>
                      <div className="flex gap-1.5 shrink-0">
                        <button onClick={() => setMoveSheet({ fam: r.fam, village: r.village })}
                          className="text-xs text-primary bg-primary-light px-2 py-1 rounded-lg border-none cursor-pointer">이동</button>
                        <button onClick={() => handleDeleteFam(r.fam, r.village)}
                          className="text-xs text-danger bg-danger-light px-2 py-1 rounded-lg border-none cursor-pointer">삭제</button>
                      </div>
                    </div>
                  )
                } else {
                  const color = getAvatarColor(r.member.id?.charCodeAt?.(0) ?? 0)
                  return (
                    <div key={`member_${r.member.id}_${idx}`} className="flex items-center gap-3 py-3 border-b border-gray-300 last:border-b-0">
                      <div className={`w-9 h-9 rounded-full ${color.bg} flex items-center justify-center text-[13px] font-medium ${color.text} shrink-0`}>{r.member.name[0]}</div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{r.member.name}</p>
                        <p className="text-[11px] text-gray-500">{r.village} · {r.fam} · {r.member.role}</p>
                        {r.member.phone && <p className="text-[11px] text-gray-500">{r.member.phone}</p>}
                      </div>
                      <button onClick={() => setSelectedFam({ fam: r.fam, village: r.village })}
                        className="text-xs text-primary bg-primary-light px-2.5 py-1.5 rounded-lg border-none cursor-pointer shrink-0">상세 →</button>
                    </div>
                  )
                }
              })}
            </div>
          ) : (
            <div className="px-5 pt-2">
              {Object.entries(myVillages).map(([village, fams]) => (
                <div key={village} className="mb-3">
                  {/* 마을 헤더 */}
                  <div className="flex items-center gap-2 mb-2">
                    <button onClick={() => setExpandedVillage(expandedVillage === village ? null : village)}
                      className="flex-1 flex items-center justify-between py-2.5 px-3 bg-success-light rounded-xl border-none cursor-pointer">
                      <div>
                        <span className="text-sm font-medium text-success">{village}</span>
                        {villageLeaders[village] && (
                          <span className="text-[11px] text-success ml-2 opacity-70">마을장: {villageLeaders[village]}</span>
                        )}
                      </div>
                      <span className="text-xs text-success shrink-0">{fams.length}개 팸 {expandedVillage === village ? '▲' : '▼'}</span>
                    </button>
                    {isPastorOrAbove && (
                      <button onClick={() => handleDeleteVillage(village)}
                        className="text-xs text-danger bg-danger-light px-2 py-1.5 rounded-lg border-none cursor-pointer shrink-0">삭제</button>
                    )}
                  </div>

                  {/* 팸 리스트 */}
                  {expandedVillage === village && (
                    <div className="border border-gray-300 rounded-xl overflow-hidden">
                      {fams.length === 0 && (
                        <p className="text-xs text-gray-500 text-center py-4">팸이 없습니다.</p>
                      )}
                      {fams.map((fam, idx) => (
                        <div key={fam} className={`flex items-center px-4 py-3 ${idx < fams.length - 1 ? 'border-b border-gray-300' : ''}`}>
                          <div className="flex-1 cursor-pointer" onClick={() => setSelectedFam({ fam, village })}>
                            <p className="text-sm font-medium">{fam}</p>
                            <p className="text-[11px] text-gray-500 mt-0.5">
                              리더: {famLeaders[fam] || '—'} · {(famMembers[fam] || []).length}명
                            </p>
                          </div>
                          <div className="flex gap-1.5 items-center">
                            <button onClick={() => setMoveSheet({ fam, village })}
                              className="text-xs text-primary bg-primary-light px-2 py-1 rounded-lg border-none cursor-pointer">이동</button>
                            <button onClick={() => handleDeleteFam(fam, village)}
                              className="text-xs text-danger bg-danger-light px-2 py-1 rounded-lg border-none cursor-pointer">삭제</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {isPastorOrAbove && activeTab === 'team' && (
        <div className="px-5 pt-3">
          <div className="border border-gray-300 rounded-xl overflow-hidden">
            {ALL_TEAMS.map((team, idx) => (
              <div key={team}>
                <div onClick={() => setExpandedTeam(expandedTeam === team ? null : team)}
                  className={`flex items-center justify-between px-4 py-3.5 cursor-pointer hover:bg-gray-100 transition-colors ${idx < ALL_TEAMS.length - 1 || expandedTeam === team ? 'border-b border-gray-300' : ''}`}>
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-warning-light flex items-center justify-center text-xs font-medium text-warning shrink-0">{team[0]}</div>
                    <div><p className="text-sm font-medium">{team}</p><p className="text-[11px] text-gray-500">{TEAM_INTROS[team]?.slice(0, 18)}…</p></div>
                  </div>
                  <span className="text-xs text-gray-500">{expandedTeam === team ? '▲' : '▼'}</span>
                </div>
                {expandedTeam === team && (
                  <div className={`bg-gray-100/50 px-4 py-3 ${idx < ALL_TEAMS.length - 1 ? 'border-b border-gray-300' : ''}`}>
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-gray-500">팀원 관리 가능</p>
                      <button onClick={() => setSelectedTeam(team)} className="text-xs text-primary bg-primary-light px-3 py-1.5 rounded-full border-none cursor-pointer">팀 관리 →</button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <BottomNav />

      {/* 팸 이동 바텀시트 */}
      {moveSheet && (
        <FamMoveSheet
          fam={moveSheet.fam}
          currentVillage={moveSheet.village}
          villageNames={villageNames}
          onClose={() => setMoveSheet(null)}
          onSave={handleMoveFam}
        />
      )}
    </div>
  )
}
