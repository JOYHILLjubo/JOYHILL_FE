import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

// ─── 더미 DB (백엔드 연동 전까지 사용) ───────────────────────────────
// 실제 연동 시 이 배열을 POST /api/auth/login 으로 교체
// phone: 하이픈 포함 형식으로 저장
// birth: 6자리 생년월일 (초기 비밀번호)
// password: 사용자가 변경한 경우 반영 (변경 전 = birth와 동일)
export const DUMMY_MEMBER_DB = [
  {
    phone: '010-1111-2222', birth: '950315', password: '950315',
    name: '김민준', role: 'leader',
    fam: '민준팸', village: '성인이네',
    teams: ['찬양팀'], teamRoles: ['찬양팀'],
  },
  {
    phone: '010-9999-0000', birth: '001225', password: '001225',
    name: '박청년', role: 'member',
    fam: '도윤팸', village: '성인이네',
    teams: ['새가족팀'], teamRoles: [],
  },
  {
    phone: '010-3333-4444', birth: '881020', password: '881020',
    name: '홍성인', role: 'village_leader',
    fam: '서연팸', village: '성인이네',
    teams: [], teamRoles: [],
  },
  {
    phone: '010-5555-6666', birth: '750601', password: '750601',
    name: '정교역자', role: 'pastor',
    fam: '수아팸', village: '지우네',
    teams: [], teamRoles: [],
  },
  {
    phone: '010-7777-8888', birth: '700101', password: '700101',
    name: '관리자', role: 'admin',
    fam: '민준팸', village: '성인이네',
    teams: [], teamRoles: [],
  },
]

// 하이픈 제거 후 비교 (010-1111-2222 와 01011112222 모두 허용)
function normalizePhone(phone) {
  return phone.replace(/-/g, '').trim()
}

export default function LoginPage() {
  const navigate = useNavigate()
  const { setUser } = useAuth()
  const [phone, setPhone] = useState('')
  const [pw, setPw] = useState('')
  const [error, setError] = useState('')

  const handleLogin = () => {
    setError('')
    if (!phone.trim()) { setError('전화번호를 입력해주세요.'); return }
    if (!pw.trim()) { setError('비밀번호를 입력해주세요.'); return }

    const found = DUMMY_MEMBER_DB.find(
      (m) =>
        normalizePhone(m.phone) === normalizePhone(phone) &&
        m.password === pw.trim()
    )

    if (!found) {
      setError('전화번호 또는 비밀번호가 올바르지 않습니다.')
      return
    }

    // TODO: 실제 연동 시 POST /api/auth/login 응답으로 교체
    setUser({
      name: found.name,
      role: found.role,
      fam: found.fam,
      village: found.village,
      teams: found.teams,
      teamRoles: found.teamRoles,
      phone: found.phone,
      birth: found.birth,
    })
    navigate('/home')
  }

  return (
    <div className="min-h-screen flex flex-col justify-center px-8">
      {/* 로고 */}
      <div className="text-center mb-10">
        <div className="w-16 h-16 rounded-full bg-primary-light mx-auto mb-3 flex items-center justify-center">
          <span className="text-2xl text-primary font-bold">✦</span>
        </div>
        <h1 className="text-xl font-medium">JOY 교회</h1>
        <p className="text-[13px] text-gray-500 mt-1">교회 주보 · 출석 관리 · 기도제목</p>
      </div>

      {/* 입력 필드 */}
      <div className="space-y-3 mb-4">
        <div>
          <label className="text-xs text-gray-500 block mb-1">전화번호</label>
          <input
            type="tel"
            placeholder="010-0000-0000"
            value={phone}
            onChange={(e) => { setPhone(e.target.value); setError('') }}
            onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-primary"
          />
        </div>
        <div>
          <label className="text-xs text-gray-500 block mb-1">비밀번호</label>
          <input
            type="password"
            placeholder="생년월일 6자리 (예: 950315)"
            value={pw}
            onChange={(e) => { setPw(e.target.value); setError('') }}
            onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-primary"
          />
        </div>
        {error && (
          <p className="text-xs text-danger">{error}</p>
        )}
      </div>

      {/* 로그인 버튼 */}
      <button
        onClick={handleLogin}
        className="w-full py-2.5 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-hover transition-colors border-none cursor-pointer"
      >
        로그인
      </button>

      {/* 안내 문구 */}
      <p className="text-center text-[12px] text-gray-400 mt-4">
        초기 비밀번호는 생년월일 6자리입니다.
      </p>
    </div>
  )
}
