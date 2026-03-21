import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

// 더미 아이디 중복 확인 (실제는 API)
const EXISTING_IDS = ['joy_admin', 'kim_leader', 'test123']

export default function SignupAccountPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { setUser } = useAuth()

  // 1단계에서 넘어온 성도 정보
  const verifiedMember = location.state

  const [userId, setUserId] = useState('')
  const [idChecked, setIdChecked] = useState(false)
  const [idAvailable, setIdAvailable] = useState(null)
  const [pw, setPw] = useState('')
  const [pwConfirm, setPwConfirm] = useState('')
  const [error, setError] = useState('')

  // 인증 없이 직접 접근하면 차단
  if (!verifiedMember) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-8">
        <p className="text-gray-500 text-sm">잘못된 접근입니다.</p>
        <button onClick={() => navigate('/signup/verify')}
          className="mt-3 text-xs text-primary bg-primary-light px-4 py-2 rounded-full border-none cursor-pointer">
          처음부터 시작하기
        </button>
      </div>
    )
  }

  const handleCheckId = () => {
    if (!userId.trim()) { setError('아이디를 입력해주세요.'); return }
    if (userId.length < 4) { setError('아이디는 4자 이상이어야 합니다.'); return }
    setError('')
    const available = !EXISTING_IDS.includes(userId.trim())
    setIdAvailable(available)
    setIdChecked(available)
  }

  const handleIdChange = (val) => {
    setUserId(val)
    setIdChecked(false)
    setIdAvailable(null)
  }

  const handleSubmit = () => {
    setError('')
    if (!userId.trim()) { setError('아이디를 입력해주세요.'); return }
    if (!idChecked) { setError('아이디 중복 확인을 해주세요.'); return }
    if (!pw) { setError('비밀번호를 입력해주세요.'); return }
    if (pw.length < 6) { setError('비밀번호는 6자 이상이어야 합니다.'); return }
    if (pw !== pwConfirm) { setError('비밀번호가 일치하지 않습니다.'); return }

    // TODO: API 연동 — 계정 생성
    setUser({
      name: verifiedMember.name,
      role: verifiedMember.role,
      fam: verifiedMember.fam,
      village: verifiedMember.village || '',  // 1단계에서 선택한 마을 반영
      teamRoles: verifiedMember.teamLeader || [],
      teams: verifiedMember.teams || [],
    })

    navigate('/home', { replace: true })
  }

  const pwMatch = pwConfirm !== '' && pw === pwConfirm
  const pwMismatch = pwConfirm !== '' && pw !== pwConfirm

  return (
    <div className="min-h-screen flex flex-col px-8 pt-10 pb-10">
      {/* 헤더 */}
      <div className="flex items-center gap-3 mb-8">
        <button onClick={() => navigate('/signup/verify')} className="text-lg bg-transparent border-none cursor-pointer text-gray-500">←</button>
        <div>
          <p className="text-lg font-medium">회원가입</p>
          <p className="text-xs text-gray-500 mt-0.5">2단계 · 계정 설정</p>
        </div>
      </div>

      {/* 스텝 인디케이터 */}
      <div className="flex items-center gap-2 mb-8">
        <div className="w-6 h-6 rounded-full bg-success text-white text-xs flex items-center justify-center font-medium">✓</div>
        <div className="flex-1 h-0.5 bg-primary" />
        <div className="w-6 h-6 rounded-full bg-primary text-white text-xs flex items-center justify-center font-medium">2</div>
      </div>

      {/* 인증된 성도 정보 요약 */}
      <div className="bg-success-light rounded-xl px-4 py-3 mb-6">
        <p className="text-xs text-success font-medium mb-1">✓ 본인 인증 완료</p>
        <p className="text-sm font-medium">{verifiedMember.name}</p>
        <p className="text-xs text-gray-500 mt-0.5">
          {verifiedMember.village && `${verifiedMember.village} · `}
          {verifiedMember.fam}
          {verifiedMember.teams?.length > 0 ? ` · ${verifiedMember.teams.join(', ')}` : ''}
        </p>
      </div>

      <div className="flex flex-col gap-4 flex-1">
        {/* 아이디 */}
        <div>
          <label className="text-xs text-gray-500 block mb-1.5">아이디 <span className="text-danger">*</span></label>
          <div className="flex gap-2">
            <input
              placeholder="영문·숫자 4자 이상"
              value={userId}
              onChange={(e) => handleIdChange(e.target.value)}
              className={`flex-1 px-3 py-2.5 border rounded-lg text-sm focus:outline-none transition-colors ${
                idAvailable === true ? 'border-success focus:border-success'
                  : idAvailable === false ? 'border-danger focus:border-danger'
                  : 'border-gray-300 focus:border-primary'
              }`}
            />
            <button onClick={handleCheckId}
              className="text-xs text-primary bg-primary-light px-3 py-2 rounded-lg border-none cursor-pointer whitespace-nowrap">
              중복확인
            </button>
          </div>
          {idAvailable === true && <p className="text-xs text-success mt-1 ml-1">사용 가능한 아이디입니다.</p>}
          {idAvailable === false && <p className="text-xs text-danger mt-1 ml-1">이미 사용 중인 아이디입니다.</p>}
        </div>

        {/* 비밀번호 */}
        <div>
          <label className="text-xs text-gray-500 block mb-1.5">비밀번호 <span className="text-danger">*</span></label>
          <input type="password" placeholder="6자 이상" value={pw} onChange={(e) => setPw(e.target.value)}
            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-primary" />
        </div>

        {/* 비밀번호 확인 */}
        <div>
          <label className="text-xs text-gray-500 block mb-1.5">비밀번호 확인 <span className="text-danger">*</span></label>
          <input type="password" placeholder="비밀번호를 다시 입력하세요" value={pwConfirm} onChange={(e) => setPwConfirm(e.target.value)}
            className={`w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none transition-colors ${
              pwMatch ? 'border-success focus:border-success'
                : pwMismatch ? 'border-danger focus:border-danger'
                : 'border-gray-300 focus:border-primary'
            }`}
          />
          {pwMatch && <p className="text-xs text-success mt-1 ml-1">비밀번호가 일치합니다.</p>}
          {pwMismatch && <p className="text-xs text-danger mt-1 ml-1">비밀번호가 일치하지 않습니다.</p>}
        </div>

        {/* 에러 */}
        {error && (
          <div className="bg-danger-light rounded-lg px-3 py-2.5">
            <p className="text-xs text-danger">{error}</p>
          </div>
        )}
      </div>

      <button onClick={handleSubmit}
        className="w-full mt-6 py-3 bg-primary text-white rounded-lg text-sm font-medium border-none cursor-pointer hover:bg-primary-hover transition-colors">
        가입 완료
      </button>
    </div>
  )
}
