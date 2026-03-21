import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { DUMMY_MEMBER_DB } from './LoginPage'

export default function MyEditPage() {
  const navigate = useNavigate()
  const { user } = useAuth()

  const [currentPw, setCurrentPw] = useState('')
  const [newPw, setNewPw] = useState('')
  const [confirmPw, setConfirmPw] = useState('')
  const [pwError, setPwError] = useState('')
  const [pwSuccess, setPwSuccess] = useState(false)

  const handleChangePw = () => {
    setPwError('')
    setPwSuccess(false)

    // TODO: 실제 연동 시 POST /api/auth/change-password 로 교체
    const found = DUMMY_MEMBER_DB.find((m) => m.phone === user.phone)
    if (!found) { setPwError('사용자 정보를 찾을 수 없습니다.'); return }
    if (found.password !== currentPw) { setPwError('현재 비밀번호가 올바르지 않습니다.'); return }
    if (newPw.length < 6) { setPwError('새 비밀번호는 6자 이상이어야 합니다.'); return }
    if (newPw !== confirmPw) { setPwError('새 비밀번호가 일치하지 않습니다.'); return }

    found.password = newPw
    setCurrentPw('')
    setNewPw('')
    setConfirmPw('')
    setPwSuccess(true)
  }

  return (
    <div className="pb-24">
      {/* 헤더 */}
      <div className="flex items-center gap-3 px-5 pt-4 pb-3 border-b border-gray-300">
        <button onClick={() => navigate('/my')} className="text-lg bg-transparent border-none cursor-pointer">←</button>
        <p className="text-base font-medium">비밀번호 변경</p>
      </div>

      <div className="px-5 pt-5 flex flex-col gap-3">
        <p className="text-[12px] text-gray-400 mb-1">초기 비밀번호는 생년월일 6자리입니다.</p>

        <div>
          <label className="text-xs text-gray-500 block mb-1">현재 비밀번호</label>
          <input
            type="password"
            value={currentPw}
            onChange={(e) => { setCurrentPw(e.target.value); setPwError('') }}
            placeholder="현재 비밀번호"
            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-primary"
          />
        </div>
        <div>
          <label className="text-xs text-gray-500 block mb-1">새 비밀번호</label>
          <input
            type="password"
            value={newPw}
            onChange={(e) => { setNewPw(e.target.value); setPwError('') }}
            placeholder="새 비밀번호 (6자 이상)"
            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-primary"
          />
        </div>
        <div>
          <label className="text-xs text-gray-500 block mb-1">새 비밀번호 확인</label>
          <input
            type="password"
            value={confirmPw}
            onChange={(e) => { setConfirmPw(e.target.value); setPwError('') }}
            placeholder="새 비밀번호 재입력"
            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-primary"
          />
        </div>

        {pwError && <p className="text-xs text-danger">{pwError}</p>}
        {pwSuccess && <p className="text-xs text-success">✓ 비밀번호가 변경되었습니다.</p>}

        <button
          onClick={handleChangePw}
          className="w-full mt-2 py-2.5 bg-primary text-white rounded-lg text-sm font-medium border-none cursor-pointer hover:bg-primary-hover transition-colors"
        >
          비밀번호 변경
        </button>
      </div>
    </div>
  )
}
