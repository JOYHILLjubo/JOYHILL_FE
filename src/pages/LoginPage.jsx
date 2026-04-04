import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { requestLogin } from '../api/auth'
import { useAuth } from '../context/AuthContext'

export default function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { login } = useAuth()
  const [phone, setPhone] = useState('')
  const [pw, setPw] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const redirectTo = location.state?.from?.pathname ?? '/home'

  const handleLogin = async (e) => {
    e.preventDefault()
    if (isSubmitting) return

    setError('')

    if (!phone.trim()) {
      setError('전화번호를 입력해주세요.')
      return
    }

    if (!pw.trim()) {
      setError('비밀번호를 입력해주세요.')
      return
    }

    setIsSubmitting(true)

    try {
      const data = await requestLogin({
        phone: phone.trim(),
        password: pw.trim(),
      })

      login({
        user: data.user,
        accessToken: data.accessToken,
      })

      // 최초 로그인 (비밀번호 미변경) → 비밀번호 변경 페이지 강제 이동
      if (!data.user?.passwordChanged) {
        navigate('/my/edit', { replace: true })
      } else {
        navigate(redirectTo, { replace: true })
      }
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('로그인 중 오류가 발생했습니다.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col justify-center px-8">
      <div className="text-center mb-10">
        <div className="w-16 h-16 rounded-full bg-primary-light mx-auto mb-3 flex items-center justify-center">
          <span className="text-2xl text-primary font-bold">J</span>
        </div>
        <h1 className="text-xl font-medium">JOY 교회</h1>
        <p className="text-[13px] text-gray-500 mt-1">교회 주보 · 출석 관리 · 기도제목</p>
      </div>

      <form onSubmit={handleLogin} className="space-y-3">
        <div>
          <label className="text-xs text-gray-500 block mb-1">전화번호</label>
          <input
            type="tel"
            autoComplete="username"
            placeholder="010-0000-0000"
            value={phone}
            onChange={(e) => {
              setPhone(e.target.value)
              setError('')
            }}
            disabled={isSubmitting}
            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-primary disabled:bg-gray-100"
          />
        </div>

        <div>
          <label className="text-xs text-gray-500 block mb-1">비밀번호</label>
          <input
            type="password"
            autoComplete="current-password"
            placeholder="생년월일 6자리 (예: 950315)"
            value={pw}
            onChange={(e) => {
              setPw(e.target.value)
              setError('')
            }}
            disabled={isSubmitting}
            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-primary disabled:bg-gray-100"
          />
        </div>

        {error && <p className="text-xs text-danger">{error}</p>}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-2.5 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-hover transition-colors border-none cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isSubmitting ? '로그인 중...' : '로그인'}
        </button>
      </form>

      <p className="text-center text-[12px] text-gray-400 mt-4">
        초기 비밀번호는 생년월일 6자리입니다.
      </p>
    </div>
  )
}
