import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/$/, '')

async function requestTokenRefresh() {
  const response = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
    method: 'POST',
    credentials: 'include',
  })
  const payload = await response.json().catch(() => null)
  if (!response.ok || !payload?.success || !payload?.data?.accessToken) {
    throw new Error(payload?.error?.message ?? '세션이 만료되었습니다. 다시 로그인해주세요.')
  }
  return payload.data.accessToken
}

async function requestChangePassword({ accessToken, currentPassword, newPassword }) {
  const response = await fetch(`${API_BASE_URL}/api/auth/change-password`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    credentials: 'include',
    body: JSON.stringify({ currentPassword, newPassword }),
  })
  const payload = await response.json().catch(() => null)
  return {
    ok: response.ok && payload?.success,
    status: response.status,
    message: payload?.error?.message ?? '',
  }
}

export default function MyEditPage() {
  const navigate = useNavigate()
  const { user, accessToken, setAccessToken, setUser, logout } = useAuth()

  // 최초 로그인 여부
  const isFirstLogin = !user?.passwordChanged

  const [currentPw, setCurrentPw] = useState('')
  const [newPw, setNewPw] = useState('')
  const [confirmPw, setConfirmPw] = useState('')
  const [pwError, setPwError] = useState('')
  const [pwSuccess, setPwSuccess] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleExpiredSession = () => {
    logout()
    navigate('/login', { replace: true })
  }

  const handleChangePw = async (e) => {
    e.preventDefault()
    if (isSubmitting) return

    setPwError('')
    setPwSuccess(false)

    if (!currentPw.trim()) {
      setPwError(isFirstLogin ? '생년월일 6자리를 입력해주세요.' : '현재 비밀번호를 입력해주세요.')
      return
    }

    if (!newPw.trim()) {
      setPwError('새 비밀번호를 입력해주세요.')
      return
    }

    if (newPw.length < 6) {
      setPwError('새 비밀번호는 6자 이상이어야 합니다.')
      return
    }

    if (newPw !== confirmPw) {
      setPwError('새 비밀번호 확인이 일치하지 않습니다.')
      return
    }

    setIsSubmitting(true)

    try {
      let nextAccessToken = accessToken
      if (!nextAccessToken) {
        nextAccessToken = await requestTokenRefresh()
        setAccessToken(nextAccessToken)
      }

      let result = await requestChangePassword({
        accessToken: nextAccessToken,
        currentPassword: currentPw.trim(),
        newPassword: newPw.trim(),
      })

      if (result.status === 401) {
        nextAccessToken = await requestTokenRefresh()
        setAccessToken(nextAccessToken)
        result = await requestChangePassword({
          accessToken: nextAccessToken,
          currentPassword: currentPw.trim(),
          newPassword: newPw.trim(),
        })
      }

      if (!result.ok) {
        throw new Error(result.message || '비밀번호 변경에 실패했습니다.')
      }

      // 로컬 상태 업데이트
      setUser((prevUser) => prevUser ? { ...prevUser, passwordChanged: true } : prevUser)
      setPwSuccess(true)

      // 비밀번호 변경 후 홈으로 이동
      setTimeout(() => {
        navigate('/home', { replace: true })
      }, 1200)
    } catch (err) {
      const message = err instanceof Error ? err.message : '비밀번호 변경 중 오류가 발생했습니다.'
      setPwError(message)
      if (message.includes('다시 로그인')) handleExpiredSession()
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="pb-24">
      <div className="flex items-center gap-3 px-5 pt-4 pb-3 border-b border-gray-300">
        {/* 최초 로그인 시 뒤로가기 막기 */}
        {!isFirstLogin && (
          <button
            onClick={() => navigate('/my')}
            className="text-lg bg-transparent border-none cursor-pointer"
          >
            ←
          </button>
        )}
        <p className="text-base font-medium">비밀번호 변경</p>
      </div>

      {/* 최초 로그인 안내 배너 */}
      {isFirstLogin && (
        <div className="mx-5 mt-4 bg-primary-light rounded-xl px-4 py-3">
          <p className="text-sm font-medium text-primary">처음 로그인하셨네요! 👋</p>
          <p className="text-xs text-primary-hover mt-1">
            보안을 위해 생년월일 대신 사용할 비밀번호를 설정해주세요.
          </p>
        </div>
      )}

      <form onSubmit={handleChangePw} className="px-5 pt-5 flex flex-col gap-3">
        <p className="text-[12px] text-gray-400 mb-1">
          {isFirstLogin
            ? '현재 비밀번호는 생년월일 6자리입니다. 새 비밀번호는 6자 이상으로 설정해주세요.'
            : '새 비밀번호는 6자 이상으로 입력해주세요.'}
        </p>

        <div>
          <label className="text-xs text-gray-500 block mb-1">
            {isFirstLogin ? '현재 비밀번호 (생년월일 6자리)' : '현재 비밀번호'}
          </label>
          <input
            type="password"
            value={currentPw}
            onChange={(e) => { setCurrentPw(e.target.value); setPwError('') }}
            disabled={isSubmitting}
            placeholder={isFirstLogin ? '생년월일 6자리 (예: 950315)' : '현재 비밀번호'}
            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-primary disabled:bg-gray-100"
          />
        </div>

        <div>
          <label className="text-xs text-gray-500 block mb-1">새 비밀번호</label>
          <input
            type="password"
            value={newPw}
            onChange={(e) => { setNewPw(e.target.value); setPwError('') }}
            disabled={isSubmitting}
            placeholder="새 비밀번호 (6자 이상)"
            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-primary disabled:bg-gray-100"
          />
        </div>

        <div>
          <label className="text-xs text-gray-500 block mb-1">새 비밀번호 확인</label>
          <input
            type="password"
            value={confirmPw}
            onChange={(e) => { setConfirmPw(e.target.value); setPwError('') }}
            disabled={isSubmitting}
            placeholder="새 비밀번호를 다시 입력하세요"
            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-primary disabled:bg-gray-100"
          />
        </div>

        {pwError && <p className="text-xs text-danger">{pwError}</p>}
        {pwSuccess && <p className="text-xs text-success">비밀번호가 변경되었습니다. 홈으로 이동합니다...</p>}

        <button
          type="submit"
          disabled={isSubmitting || pwSuccess}
          className="w-full mt-2 py-3 bg-primary text-white rounded-lg text-sm font-medium border-none cursor-pointer hover:bg-primary-hover transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isSubmitting ? '변경 중...' : '비밀번호 변경'}
        </button>
      </form>
    </div>
  )
}
