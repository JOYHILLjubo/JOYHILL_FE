import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const VILLAGE_LIST = ['1마을', '2마을', '3마을', '4마을']

const FAM_LIST = [
  '사랑팸', '은혜팸', '믿음팸', '소망팸', '기쁨팸',
  '평화팸', '인내팸', '온유팸', '화평팸', '자비팸',
  '양선팸', '충성팸', '절제팸', '겸손팸', '섬김팸',
  '찬양팸', '감사팸', '순종팸', '헌신팸', '비전팸', '열방팸',
]

// 교역자·부장 통합
const ROLE_OPTIONS = ['청년', '리더', '마을장', '교역자·부장']

const TEAM_OPTIONS = ['찬양팀', '예배팀', '함기팀', '함성팀', '새가족팀', '미디어사역팀', 'LAB팀']

const MEMBER_DB = [
  { id: 'm001', name: '김리더', village: '1마을', fam: '사랑팸', birth: '1995-03-15', role: '리더', teams: ['찬양팀'], teamLeader: ['찬양팀'] },
  { id: 'm002', name: '이마을', village: '1마을', fam: '은혜팸', birth: '1990-07-22', role: '마을장', teams: [], teamLeader: [] },
  { id: 'm003', name: '박청년', village: '1마을', fam: '믿음팸', birth: '2000-01-10', role: '청년', teams: ['새가족팀'], teamLeader: [] },
  { id: 'm004', name: '김환희', village: '1마을', fam: '믿음팸', birth: '2000-01-10', role: '리더', teams: ['새가족팀'], teamLeader: ['새가족팀'] },
  { id: 'm005', name: '정교역자', village: '2마을', fam: '소망팸', birth: '1985-05-20', role: '교역자·부장', teams: [], teamLeader: [] },
]

function LegacySignupVerifyPage() {
  const navigate = useNavigate()

  const [form, setForm] = useState({
    name: '', village: '', fam: '', birth: '', role: '',
    hasTeam: false, teams: [], isTeamLeader: false, leaderTeams: [],
  })
  const [error, setError] = useState('')

  const toggleTeam = (team) => {
    setForm((prev) => {
      const next = prev.teams.includes(team)
        ? prev.teams.filter((t) => t !== team)
        : [...prev.teams, team]
      return { ...prev, teams: next, leaderTeams: prev.leaderTeams.filter((t) => next.includes(t)) }
    })
  }

  const toggleLeaderTeam = (team) => {
    setForm((prev) => ({
      ...prev,
      leaderTeams: prev.leaderTeams.includes(team)
        ? prev.leaderTeams.filter((t) => t !== team)
        : [...prev.leaderTeams, team],
    }))
  }

  const handleVerify = () => {
    setError('')
    if (!form.name.trim()) { setError('이름을 입력해주세요.'); return }
    if (!form.village) { setError('소속 마을을 선택해주세요.'); return }
    if (!form.fam) { setError('소속 팸을 선택해주세요.'); return }
    if (!form.birth) { setError('생년월일을 입력해주세요.'); return }
    if (!form.role) { setError('역할을 선택해주세요.'); return }
    if (form.hasTeam && form.teams.length === 0) { setError('소속 사역팀을 선택해주세요.'); return }

    const roleMap = {
      청년: 'member',
      리더: 'leader',
      마을장: 'village_leader',
      '교역자·부장': 'pastor',
    }

    const matched = MEMBER_DB.find((m) => {
      const sameBase =
        m.name === form.name.trim() &&
        m.village === form.village &&
        m.fam === form.fam &&
        m.birth === form.birth &&
        m.role === form.role
      if (!sameBase) return false

      const inputTeamsSorted = [...form.teams].sort().join(',')
      const dbTeamsSorted = [...m.teams].sort().join(',')
      if (form.hasTeam) {
        if (inputTeamsSorted !== dbTeamsSorted) return false
      } else {
        if (m.teams.length > 0) return false
      }

      const inputLeaderSorted = [...form.leaderTeams].sort().join(',')
      const dbLeaderSorted = [...m.teamLeader].sort().join(',')
      if (form.isTeamLeader) {
        if (inputLeaderSorted !== dbLeaderSorted) return false
      } else {
        if (m.teamLeader.length > 0) return false
      }

      return true
    })

    if (!matched) {
      setError('입력하신 정보와 일치하는 성도를 찾을 수 없습니다.\n관리자에게 문의해주세요.')
      return
    }

    navigate('/signup/account', {
      state: {
        memberId: matched.id,
        name: matched.name,
        village: matched.village,
        fam: matched.fam,
        role: roleMap[matched.role] || 'member',
        teams: matched.teams,
        teamLeader: matched.teamLeader,
      },
    })
  }

  return (
    <div className="min-h-screen flex flex-col px-8 pt-10 pb-10">
      {/* 헤더 */}
      <div className="flex items-center gap-3 mb-8">
        <button onClick={() => navigate('/login')} className="text-lg bg-transparent border-none cursor-pointer text-gray-500">←</button>
        <div>
          <p className="text-lg font-medium">회원가입</p>
          <p className="text-xs text-gray-500 mt-0.5">1단계 · 본인 인증</p>
        </div>
      </div>

      {/* 스텝 인디케이터 */}
      <div className="flex items-center gap-2 mb-8">
        <div className="w-6 h-6 rounded-full bg-primary text-white text-xs flex items-center justify-center font-medium">1</div>
        <div className="flex-1 h-0.5 bg-gray-300" />
        <div className="w-6 h-6 rounded-full bg-gray-300 text-gray-500 text-xs flex items-center justify-center">2</div>
      </div>

      <div className="flex flex-col gap-4 flex-1">

        {/* 이름 */}
        <div>
          <label className="text-xs text-gray-500 block mb-1.5">이름 <span className="text-danger">*</span></label>
          <input placeholder="실명을 입력하세요" value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-primary" />
        </div>

        {/* 소속 마을 */}
        <div>
          <label className="text-xs text-gray-500 block mb-1.5">소속 마을 <span className="text-danger">*</span></label>
          <select value={form.village} onChange={(e) => setForm({ ...form, village: e.target.value, fam: '' })}
            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-primary bg-white">
            <option value="">마을을 선택하세요</option>
            {VILLAGE_LIST.map((v) => <option key={v} value={v}>{v}</option>)}
          </select>
        </div>

        {/* 소속 팸 */}
        <div>
          <label className="text-xs text-gray-500 block mb-1.5">소속 팸 <span className="text-danger">*</span></label>
          <select value={form.fam} onChange={(e) => setForm({ ...form, fam: e.target.value })}
            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-primary bg-white">
            <option value="">팸을 선택하세요</option>
            {FAM_LIST.map((f) => <option key={f} value={f}>{f}</option>)}
          </select>
          {form.role === '마을장' && (
            <p className="text-[11px] text-success mt-1 ml-1">✓ 마을장은 본인이 속한 팸을 선택해주세요.</p>
          )}
        </div>

        {/* 생년월일 */}
        <div>
          <label className="text-xs text-gray-500 block mb-1.5">생년월일 <span className="text-danger">*</span></label>
          <input type="date" value={form.birth} onChange={(e) => setForm({ ...form, birth: e.target.value })}
            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-primary" />
        </div>

        {/* 역할 */}
        <div>
          <label className="text-xs text-gray-500 block mb-1.5">역할 <span className="text-danger">*</span></label>
          <div className="flex gap-2 flex-wrap">
            {ROLE_OPTIONS.map((r) => (
              <button key={r} onClick={() => setForm({ ...form, role: r })}
                className={`text-sm px-3.5 py-1.5 rounded-full border cursor-pointer transition-all ${
                  form.role === r
                    ? 'bg-primary-light text-primary border-primary'
                    : 'bg-white text-gray-500 border-gray-300'
                }`}>
                {r}
              </button>
            ))}
          </div>
        </div>

        {/* 사역팀 소속 여부 */}
        <div className="border border-gray-300 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm">사역팀 소속</p>
              <p className="text-[11px] text-gray-500 mt-0.5">사역팀에 소속되어 있나요?</p>
            </div>
            <button
              onClick={() => setForm((prev) => ({ ...prev, hasTeam: !prev.hasTeam, teams: [], isTeamLeader: false, leaderTeams: [] }))}
              className={`w-12 h-6 rounded-full transition-colors relative border-none cursor-pointer shrink-0 ${form.hasTeam ? 'bg-primary' : 'bg-gray-300'}`}>
              <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${form.hasTeam ? 'left-6' : 'left-0.5'}`} />
            </button>
          </div>

          {form.hasTeam && (
            <div className="mt-3 pt-3 border-t border-gray-300">
              <p className="text-xs text-gray-500 mb-2">소속 팀 선택 (중복 가능)</p>
              <div className="flex gap-2 flex-wrap">
                {TEAM_OPTIONS.map((t) => (
                  <button key={t} onClick={() => toggleTeam(t)}
                    className={`text-xs px-2.5 py-1.5 rounded-full border cursor-pointer transition-all ${
                      form.teams.includes(t) ? 'bg-primary-light text-primary border-primary' : 'bg-white text-gray-500 border-gray-300'
                    }`}>
                    {t}
                  </button>
                ))}
              </div>

              {form.teams.length > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-300">
                  <div className="flex items-center justify-between">
                    <p className="text-sm">사역팀장</p>
                    <button
                      onClick={() => setForm((prev) => ({ ...prev, isTeamLeader: !prev.isTeamLeader, leaderTeams: [] }))}
                      className={`w-12 h-6 rounded-full transition-colors relative border-none cursor-pointer shrink-0 ${form.isTeamLeader ? 'bg-primary' : 'bg-gray-300'}`}>
                      <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${form.isTeamLeader ? 'left-6' : 'left-0.5'}`} />
                    </button>
                  </div>
                  {form.isTeamLeader && (
                    <div className="mt-2">
                      <p className="text-xs text-gray-500 mb-2">팀장인 팀 선택</p>
                      <div className="flex gap-2 flex-wrap">
                        {form.teams.map((t) => (
                          <button key={t} onClick={() => toggleLeaderTeam(t)}
                            className={`text-xs px-2.5 py-1.5 rounded-full border cursor-pointer transition-all ${
                              form.leaderTeams.includes(t) ? 'bg-warning-light text-warning border-warning' : 'bg-white text-gray-500 border-gray-300'
                            }`}>
                            {t}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* 에러 메시지 */}
        {error && (
          <div className="bg-danger-light rounded-lg px-3 py-2.5">
            <p className="text-xs text-danger whitespace-pre-line">{error}</p>
          </div>
        )}
      </div>

      <button onClick={handleVerify}
        className="w-full mt-6 py-3 bg-primary text-white rounded-lg text-sm font-medium border-none cursor-pointer hover:bg-primary-hover transition-colors">
        인증하기
      </button>
    </div>
  )
}

export default LegacySignupVerifyPage
