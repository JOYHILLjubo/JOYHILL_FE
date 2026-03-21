import { createContext, useContext, useState } from 'react'

// ─── 네이밍 유틸 ───
function hasBatchim(str) {
  if (!str) return false
  const code = str[str.length - 1].charCodeAt(0)
  if (code < 0xAC00 || code > 0xD7A3) return false
  return (code - 0xAC00) % 28 !== 0
}
export function toVillageName(name) {
  if (!name) return ''
  return hasBatchim(name) ? `${name}이네` : `${name}네`
}
export function toFamName(name) {
  return name ? `${name}팸` : ''
}
export const FAM_ROLE_LABELS = { member: '팸원', leader: '리더', village_leader: '마을장' }

// ─── 더미 데이터 설계 ───
// 마을장 이름(이름 부분) → 마을 이름 자동 생성
// 팸 리더 이름(이름 부분) → 팸 이름 자동 생성
// 팸원 첫 번째 = 리더(이름 일치), 나머지 = 팸원

const VILLAGE_LEADERS = [
  { firstName: '성인', fullName: '홍성인' },
  { firstName: '지우', fullName: '김지우' },
  { firstName: '준서', fullName: '이준서' },
  { firstName: '하은', fullName: '박하은' },
]

// 마을별 팸 리더 (firstName → 팸 이름, fullName → 팸 리더 표시)
const FAM_LEADERS_BY_VILLAGE = {
  [toVillageName('성인')]: [
    { firstName: '민준', fullName: '김민준' },
    { firstName: '서연', fullName: '이서연' },
    { firstName: '도윤', fullName: '박도윤' },
    { firstName: '지아', fullName: '최지아' },
    { firstName: '예준', fullName: '정예준' },
  ],
  [toVillageName('지우')]: [
    { firstName: '수아', fullName: '한수아' },
    { firstName: '건우', fullName: '조건우' },
    { firstName: '나은', fullName: '송나은' },
    { firstName: '현준', fullName: '윤현준' },
    { firstName: '지유', fullName: '임지유' },
  ],
  [toVillageName('준서')]: [
    { firstName: '시우', fullName: '강시우' },
    { firstName: '하린', fullName: '오하린' },
    { firstName: '승현', fullName: '서승현' },
    { firstName: '유나', fullName: '신유나' },
    { firstName: '태양', fullName: '권태양' },
  ],
  [toVillageName('하은')]: [
    { firstName: '지호', fullName: '황지호' },
    { firstName: '서현', fullName: '안서현' },
    { firstName: '채원', fullName: '장채원' },
    { firstName: '민서', fullName: '조민서' },
    { firstName: '윤우', fullName: '류윤우' },
    { firstName: '다은', fullName: '전다은' },
  ],
}

// villages 구조 생성
const INIT_VILLAGES = Object.fromEntries(
  Object.entries(FAM_LEADERS_BY_VILLAGE).map(([village, leaders]) => [
    village,
    leaders.map((l) => toFamName(l.firstName)),
  ])
)

// famLeaders 구조 생성 (팸이름 → 리더 풀네임)
const INIT_FAM_LEADERS = Object.fromEntries(
  Object.values(FAM_LEADERS_BY_VILLAGE).flat().map((l) => [
    toFamName(l.firstName),
    l.fullName,
  ])
)

// villageLeaders (마을이름 → 마을장 풀네임)
const INIT_VILLAGE_LEADERS = Object.fromEntries(
  VILLAGE_LEADERS.map((v) => [toVillageName(v.firstName), v.fullName])
)

// 팸원 더미 생성 — 첫 번째는 팸 리더(이름 일치), 나머지는 팸원
const MEMBER_POOL = [
  { firstName: '민수', lastNames: ['김', '이', '박', '최', '정', '한'] },
  { firstName: '은혜', lastNames: ['이', '박', '김', '정', '최', '조'] },
  { firstName: '준호', lastNames: ['박', '최', '이', '한', '조', '윤'] },
  { firstName: '하늘', lastNames: ['최', '정', '박', '임', '강', '송'] },
  { firstName: '수진', lastNames: ['정', '한', '최', '김', '신', '황'] },
  { firstName: '소망', lastNames: ['한', '조', '김', '이', '권', '안'] },
]

function initMembers(fam) {
  const leaderFullName = INIT_FAM_LEADERS[fam]
  const seed = fam.charCodeAt(0)
  const count = (seed % 3) + 3 // 3~5명

  const members = []

  // 첫 번째: 리더 (팸 이름과 일치하는 실제 리더)
  if (leaderFullName) {
    members.push({
      id: `${fam}_0`,
      name: leaderFullName,
      fam,
      phone: `010-${String(1000 + seed).slice(0, 4)}-${String(5678 + seed % 100).slice(0, 4)}`,
      birth: `199${seed % 9}-0${(seed % 9) + 1}-15`,
      role: 'leader',
      note: '',
      worshipRate: 70 + (seed % 25),
      famRate: 65 + (seed % 30),
    })
  }

  // 나머지: 팸원
  const poolSize = Math.min(count - 1, MEMBER_POOL.length)
  for (let i = 0; i < poolSize; i++) {
    const pool = MEMBER_POOL[i]
    const lastName = pool.lastNames[(seed + i) % pool.lastNames.length]
    members.push({
      id: `${fam}_${i + 1}`,
      name: lastName + pool.firstName,
      fam,
      phone: `010-${String(1000 + seed + (i + 1) * 11).slice(0, 4)}-${String(5678 + (i + 1) * 7).slice(0, 4)}`,
      birth: `199${(i + 2) % 9}-0${((i + 1) % 9) + 1}-${String(10 + (i + 1) * 3).padStart(2, '0')}`,
      role: 'member',
      note: '',
      worshipRate: 60 + (seed + (i + 1) * 7) % 35,
      famRate: 55 + (seed + (i + 1) * 11) % 40,
    })
  }

  return members
}

function initAllFamMembers() {
  const d = {}
  Object.values(INIT_VILLAGES).flat().forEach((fam) => {
    d[fam] = initMembers(fam)
  })
  return d
}

// users 더미 — 마을장 4명 + 각 마을 리더 1명씩 + 청년 2명
const INIT_USERS = [
  // 마을장
  ...VILLAGE_LEADERS.map((v, i) => ({
    id: 100 + i,
    name: v.fullName,
    userId: `vl_${v.firstName}`,
    fam: toFamName(FAM_LEADERS_BY_VILLAGE[toVillageName(v.firstName)][0].firstName), // 첫 번째 팸 소속
    village: toVillageName(v.firstName),
    role: 'village_leader',
    teams: [], teamRoles: [],
    phone: `010-${String(1000 + (100 + i) * 7).slice(0, 4)}-${String(5000 + i * 111).slice(0, 4)}`,
    birth: `198${i + 2}-0${i + 2}-${String(10 + i * 5).padStart(2, '0')}`,
  })),
  // 각 마을 첫 번째 팸 리더
  ...Object.entries(FAM_LEADERS_BY_VILLAGE).map(([village, leaders], vi) => {
    const l = leaders[0]
    return {
      id: 200 + vi,
      name: l.fullName,
      userId: `ld_${l.firstName}`,
      fam: toFamName(l.firstName),
      village,
      role: 'leader',
      teams: vi === 0 ? ['찬양팀'] : [],
      teamRoles: vi === 0 ? ['찬양팀'] : [],
      phone: `010-${String(2000 + (200 + vi) * 3).slice(0, 4)}-${String(1234 + vi * 111).slice(0, 4)}`,
      birth: `199${vi + 2}-0${vi + 3}-20`,
    }
  }),
  // 청년 2명
  {
    id: 300, name: '박청년', userId: 'park_member',
    fam: toFamName('도윤'), village: toVillageName('성인'),
    role: 'member', teams: ['새가족팀'], teamRoles: [],
    phone: '010-3456-7890', birth: '2000-01-10',
  },
  {
    id: 301, name: '한청년', userId: 'han_member',
    fam: toFamName('나은'), village: toVillageName('지우'),
    role: 'member', teams: [], teamRoles: [],
    phone: '010-6789-0123', birth: '2002-11-15',
  },
  // 교역자
  {
    id: 400, name: '정교역자', userId: 'jung_pastor',
    fam: toFamName('수아'), village: toVillageName('지우'),
    role: 'pastor', teams: [], teamRoles: [],
    phone: '010-4567-8901', birth: '1985-05-20',
  },
  // 관리자
  {
    id: 500, name: '관리자', userId: 'admin',
    fam: toFamName('민준'), village: toVillageName('성인'),
    role: 'admin', teams: [], teamRoles: [],
    phone: '010-0000-0000', birth: '1980-01-01',
  },
]

const OrgContext = createContext()

export function OrgProvider({ children }) {
  const [users, setUsers] = useState(INIT_USERS)
  const [villages, setVillages] = useState({ ...INIT_VILLAGES })
  const [villageLeaders, setVillageLeaders] = useState({ ...INIT_VILLAGE_LEADERS })
  const [famLeaders, setFamLeaders] = useState({ ...INIT_FAM_LEADERS })
  const [famMembers, setFamMembers] = useState(initAllFamMembers())

  const findFamByLeader = (name) =>
    Object.entries(famLeaders).find(([, l]) => l === name)?.[0] ?? null
  const findVillageByLeader = (name) =>
    Object.entries(villageLeaders).find(([, l]) => l === name)?.[0] ?? null
  const findVillageByFam = (famName) => {
    for (const [village, fams] of Object.entries(villages)) {
      if (fams.includes(famName)) return village
    }
    return null
  }
  const getFirstName = (fullName) =>
    fullName.length > 2 ? fullName.slice(-2) : fullName.slice(-1)

  // ─── 계정 관리용 역할 변경 (AccountManagePage) ───
  const changeUserRole = (userId, newRole) => {
    const user = users.find((u) => u.id === userId)
    if (!user) return { ok: false, reason: '사용자를 찾을 수 없습니다.' }

    const oldRole = user.role
    const firstName = getFirstName(user.name)

    // ── 강등 체크 ──
    if (oldRole === 'leader' && newRole !== 'leader') {
      const myFam = findFamByLeader(user.name)
      if (myFam) {
        // 본인 제외한 팸원 수 체크
        const others = (famMembers[myFam] || []).filter((m) => m.name !== user.name)
        if (others.length > 0) {
          return { ok: false, reason: `${myFam}에 팸원이 ${others.length}명 있어서 강등할 수 없습니다.\n먼저 팸원을 이동하거나 삭제해주세요.` }
        }
        setFamLeaders((p) => { const n = { ...p }; delete n[myFam]; return n })
      }
    }
    if (oldRole === 'village_leader' && newRole !== 'village_leader') {
      const myVillage = findVillageByLeader(user.name)
      if (myVillage) {
        const fams = villages[myVillage] || []
        if (fams.length > 0) {
          return { ok: false, reason: `${myVillage}에 팸이 ${fams.length}개 있어서 강등할 수 없습니다.\n먼저 팸을 다른 마을로 이동하거나 삭제해주세요.` }
        }
        setVillageLeaders((p) => { const n = { ...p }; delete n[myVillage]; return n })
      }
    }

    // ── 승급: 리더 ──
    if (newRole === 'leader' && oldRole !== 'leader') {
      const famName = toFamName(firstName)
      if (!Object.values(villages).flat().includes(famName)) {
        const targetVillage = user.village || Object.keys(villages)[0]
        setVillages((p) => ({ ...p, [targetVillage]: [...(p[targetVillage] || []), famName] }))
        setFamMembers((p) => ({ ...p, [famName]: [] }))
      }
      setFamLeaders((p) => ({ ...p, [famName]: user.name }))
      // 승급: 해당 유저를 새 팸으로 이동
      setUsers((p) => p.map((u) => u.id === userId ? { ...u, role: newRole, fam: famName } : u))
      return { ok: true }
    }

    // ── 승급: 마을장 ──
    if (newRole === 'village_leader' && oldRole !== 'village_leader') {
      const villageName = toVillageName(firstName)
      if (!villages[villageName]) {
        setVillages((p) => ({ ...p, [villageName]: [] }))
      }
      setVillageLeaders((p) => ({ ...p, [villageName]: user.name }))
      setUsers((p) => p.map((u) => u.id === userId ? { ...u, role: newRole, village: villageName } : u))
      return { ok: true }
    }

    setUsers((p) => p.map((u) => u.id === userId ? { ...u, role: newRole } : u))
    return { ok: true }
  }

  // ─── 팸원 정보 수정 시 역할 변경 (MemberEditView) ───
  const changeFamMemberRole = (member, newRole) => {
    const oldRole = member.role
    if (oldRole === newRole) return { ok: true }

    const firstName = getFirstName(member.name)

    // ── 강등 체크 ──
    if (oldRole === 'leader' && newRole !== 'leader') {
      const myFam = findFamByLeader(member.name)
      if (myFam) {
        const others = (famMembers[myFam] || []).filter((m) => m.id !== member.id)
        if (others.length > 0) {
          return {
            ok: false,
            reason: `${myFam}에 팸원이 ${others.length}명 있어서 강등할 수 없습니다.\n먼저 팸원을 이동하거나 삭제해주세요.`,
          }
        }
        setFamLeaders((p) => { const n = { ...p }; delete n[myFam]; return n })
      }
    }
    if (oldRole === 'village_leader' && newRole !== 'village_leader') {
      const myVillage = findVillageByLeader(member.name)
      if (myVillage) {
        const fams = villages[myVillage] || []
        if (fams.length > 0) {
          return {
            ok: false,
            reason: `${myVillage}에 팸이 ${fams.length}개 있어서 강등할 수 없습니다.\n먼저 팸을 다른 마을로 이동하거나 삭제해주세요.`,
          }
        }
        setVillageLeaders((p) => { const n = { ...p }; delete n[myVillage]; return n })
      }
    }

    // ── 승급: 리더 ──
    if (newRole === 'leader' && oldRole !== 'leader') {
      const famName = toFamName(firstName)
      const targetVillage = findVillageByFam(member.fam) || Object.keys(villages)[0]

      if (!Object.values(villages).flat().includes(famName)) {
        setVillages((p) => ({ ...p, [targetVillage]: [...(p[targetVillage] || []), famName] }))
        setFamMembers((p) => ({ ...p, [famName]: [] }))
      }
      setFamLeaders((p) => ({ ...p, [famName]: member.name }))

      // 핵심: 기존 팸에서 제거 후 새 팸으로 이동
      const oldFam = member.fam
      setFamMembers((p) => {
        const updated = { ...p }
        // 기존 팸에서 제거
        if (oldFam && oldFam !== famName) {
          updated[oldFam] = (updated[oldFam] || []).filter((m) => m.id !== member.id)
        }
        // 새 팸에 리더로 추가 (아직 없으면)
        const alreadyIn = (updated[famName] || []).some((m) => m.id === member.id)
        if (!alreadyIn) {
          updated[famName] = [
            { ...member, role: 'leader', fam: famName },
            ...(updated[famName] || []),
          ]
        }
        return updated
      })
    }

    // ── 승급: 마을장 ──
    if (newRole === 'village_leader' && oldRole !== 'village_leader') {
      const villageName = toVillageName(firstName)
      if (!villages[villageName]) {
        setVillages((p) => ({ ...p, [villageName]: [] }))
      }
      setVillageLeaders((p) => ({ ...p, [villageName]: member.name }))
    }

    return { ok: true }
  }

  const addUser = (form) => setUsers((p) => [...p, { id: Date.now(), ...form }])

  // updateUser: role은 절대 변경 불가 (changeUserRole로만 변경)
  const updateUser = (userId, form) => {
    const { role, ...safeForm } = form // role 제거
    setUsers((p) => p.map((u) => u.id === userId ? { ...u, ...safeForm } : u))
  }

  const deleteUser = (userId) => setUsers((p) => p.filter((u) => u.id !== userId))

  const moveFam = (famName, fromVillage, toVillage) => {
    if (fromVillage === toVillage) return { ok: true }
    setVillages((p) => ({
      ...p,
      [fromVillage]: (p[fromVillage] || []).filter((f) => f !== famName),
      [toVillage]: [...(p[toVillage] || []), famName],
    }))
    return { ok: true }
  }

  const deleteFam = (famName, village) => {
    const members = famMembers[famName] || []
    if (members.length > 0) {
      return { ok: false, reason: `${famName}에 팸원이 ${members.length}명 있습니다.\n먼저 팸원을 이동하거나 삭제해주세요.` }
    }
    setVillages((p) => ({ ...p, [village]: (p[village] || []).filter((f) => f !== famName) }))
    setFamLeaders((p) => { const n = { ...p }; delete n[famName]; return n })
    setFamMembers((p) => { const n = { ...p }; delete n[famName]; return n })
    return { ok: true }
  }

  const deleteVillage = (villageName) => {
    const fams = villages[villageName] || []
    if (fams.length > 0) {
      return { ok: false, reason: `${villageName}에 팸이 ${fams.length}개 있습니다.\n먼저 팸을 다른 마을로 이동하거나 삭제해주세요.` }
    }
    setVillages((p) => { const n = { ...p }; delete n[villageName]; return n })
    setVillageLeaders((p) => { const n = { ...p }; delete n[villageName]; return n })
    return { ok: true }
  }

  const updateFamMembers = (fam, newMembers, addMember = null) => {
    setFamMembers((p) => {
      const updated = { ...p }
      if (newMembers !== null) updated[fam] = newMembers
      if (addMember) updated[addMember.fam] = [...(updated[addMember.fam] || []), addMember]
      return updated
    })
  }

  return (
    <OrgContext.Provider value={{
      users, villages, villageLeaders, famLeaders, famMembers,
      changeUserRole, changeFamMemberRole,
      addUser, updateUser, deleteUser,
      moveFam, deleteFam, deleteVillage, updateFamMembers,
      findFamByLeader, findVillageByLeader, findVillageByFam,
    }}>
      {children}
    </OrgContext.Provider>
  )
}

export function useOrg() {
  return useContext(OrgContext)
}
