import { useMemo, useRef, useState } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/$/, '')
const PASTOR_FAM = '__pastor__'

function buildApiUrl(path) {
  return `${API_BASE_URL}${path}`
}

function getCurrentWeekSelection() {
  const today = new Date()
  const day = today.getDay()
  const sunday = new Date(today)
  sunday.setDate(today.getDate() - day)
  const firstSunday = new Date(sunday.getFullYear(), sunday.getMonth(), 1)
  while (firstSunday.getDay() !== 0) {
    firstSunday.setDate(firstSunday.getDate() + 1)
  }
  const diff = Math.floor((sunday - firstSunday) / (7 * 24 * 60 * 60 * 1000))
  return {
    year: sunday.getFullYear(),
    month: sunday.getMonth() + 1,
    week: diff + 1,
  }
}

function getInitial(name) {
  const trimmed = String(name ?? '').trim()
  return trimmed ? trimmed[0] : 'N'
}

function normalizePrayerState(item) {
  if (!item) return null
  return {
    id: item.id ?? null,
    content: item.content ?? '',
    year: item.year ?? null,
    month: item.month ?? null,
    week: item.week ?? null,
    userId: item.userId ?? null,
    name: item.name ?? '',
  }
}

async function requestApi(path, { method = 'GET', headers = {}, body } = {}) {
  const requestOptions = { method, headers: { ...headers }, credentials: 'include' }
  if (body !== undefined) {
    requestOptions.body = JSON.stringify(body)
    requestOptions.headers['Content-Type'] = 'application/json'
  }
  let response
  try {
    response = await fetch(buildApiUrl(path), requestOptions)
  } catch {
    throw new Error('백엔드 서버에 연결할 수 없습니다. JOYHILL_BE가 실행 중인지 확인해주세요.')
  }
  const payload = await response.json().catch(() => null)
  return { response, payload }
}

function getApiErrorMessage(result, fallbackMessage) {
  if (result.response.status === 401) return '세션이 만료되었습니다. 다시 로그인해주세요.'
  if (result.response.status === 403) return result.payload?.error?.message ?? '기도제목을 저장할 권한이 없습니다.'
  if (result.response.status === 404) return result.payload?.error?.message ?? '수정할 기도제목을 찾을 수 없습니다.'
  return result.payload?.error?.message ?? fallbackMessage
}

async function requestTokenRefresh() {
  const result = await requestApi('/api/auth/refresh', { method: 'POST' })
  if (!result.response.ok || !result.payload?.success || !result.payload?.data?.accessToken) {
    throw new Error(getApiErrorMessage(result, '세션이 만료되었습니다. 다시 로그인해주세요.'))
  }
  return result.payload.data.accessToken
}

function isSessionError(message) {
  return typeof message === 'string' && (message.includes('세션이 만료') || message.includes('다시 로그인'))
}

export default function PrayerWritePageConnected() {
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const { user, accessToken, setAccessToken, logout } = useAuth()

  const isPastor = user?.role === 'pastor'
  // 교역자는 __pastor__ 공간, 그 외는 본인 팸
  const effectiveFamName = isPastor ? PASTOR_FAM : (user?.fam ?? '')

  const defaultSelection = useMemo(() => getCurrentWeekSelection(), [])
  const editingPrayer = useMemo(
    () => location.state?.mode === 'edit' ? normalizePrayerState(location.state?.prayer) : null,
    [location.state],
  )
  const isEdit = Boolean(editingPrayer?.id)

  const year = Number(searchParams.get('year') || editingPrayer?.year || defaultSelection.year)
  const month = Number(searchParams.get('month') || editingPrayer?.month || defaultSelection.month)
  const week = Number(searchParams.get('week') || editingPrayer?.week || defaultSelection.week)

  const [content, setContent] = useState(editingPrayer?.content ?? '')
  const [submitError, setSubmitError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const accessTokenRef = useRef(accessToken)
  accessTokenRef.current = accessToken

  const canEditTarget = !isEdit || editingPrayer?.userId == null || editingPrayer.userId === user?.id

  const handleExpiredSession = () => { logout(); navigate('/login', { replace: true }) }
  const handleBack = () => { navigate('/prayer') }

  const callAuthedApi = async (path, options = {}) => {
    const makeRequest = (token) =>
      requestApi(path, { ...options, headers: { ...(options.headers ?? {}), Authorization: `Bearer ${token}` } })

    let token = accessTokenRef.current
    if (!token) { token = await requestTokenRefresh(); accessTokenRef.current = token; setAccessToken(token) }

    let result = await makeRequest(token)
    if (result.response.status === 401) {
      token = await requestTokenRefresh(); accessTokenRef.current = token; setAccessToken(token)
      result = await makeRequest(token)
    }
    if (!result.response.ok || !result.payload?.success) {
      throw new Error(getApiErrorMessage(result, '요청을 처리하지 못했습니다.'))
    }
    return result.payload.data
  }

  const handleSubmit = async () => {
    if (isSubmitting) return

    const trimmed = content.trim()
    if (!trimmed) { setSubmitError('기도제목을 입력해주세요.'); return }
    if (trimmed.length > 200) { setSubmitError('기도제목은 200자 이하로 작성해주세요.'); return }

    // 교역자는 fam 없어도 됨 (__pastor__ 사용)
    if (!isPastor && !effectiveFamName) {
      setSubmitError('소속 팸 정보가 없어 저장할 수 없습니다.')
      return
    }

    setSubmitError('')
    setIsSubmitting(true)

    try {
      if (isEdit) {
        await callAuthedApi(`/api/prayers/${editingPrayer.id}`, {
          method: 'PUT',
          body: { famName: effectiveFamName, content: trimmed, year, month, week },
        })
      } else {
        await callAuthedApi('/api/prayers', {
          method: 'POST',
          body: { famName: effectiveFamName, content: trimmed, year, month, week },
        })
      }
      navigate('/prayer')
    } catch (error) {
      const message = error instanceof Error ? error.message : '기도제목 저장에 실패했습니다.'
      if (isSessionError(message)) { handleExpiredSession(); return }
      setSubmitError(message)
      setIsSubmitting(false)
    }
  }

  if (!canEditTarget) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <p className="text-gray-500 text-sm">이 기도제목을 수정할 권한이 없습니다.</p>
        <button onClick={handleBack} className="mt-3 text-xs text-primary bg-primary-light px-4 py-2 rounded-full border-none cursor-pointer">
          돌아가기
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-gray-300">
        <div className="flex items-center gap-3">
          <button onClick={handleBack} className="text-lg bg-transparent border-none cursor-pointer">←</button>
          <p className="text-base font-medium">{isEdit ? '기도제목 수정' : '기도제목 작성'}</p>
        </div>
        <button
          onClick={handleSubmit}
          disabled={!content.trim() || isSubmitting}
          className={`text-sm font-medium px-4 py-1.5 rounded-full border-none transition-colors ${
            content.trim() && !isSubmitting ? 'bg-primary text-white cursor-pointer' : 'bg-gray-100 text-gray-500 cursor-not-allowed'
          }`}
        >
          {isSubmitting ? '저장 중...' : isEdit ? '수정' : '등록'}
        </button>
      </div>

      <div className="flex items-center gap-2 px-5 pt-4 pb-2">
        <div className="w-9 h-9 rounded-full bg-primary-light flex items-center justify-center text-[13px] font-medium text-primary">
          {getInitial(user?.name)}
        </div>
        <div>
          <p className="text-sm font-medium">{user?.name || '이름 없음'}</p>
          <p className="text-[11px] text-gray-500">
            {isPastor ? '교역자 · 부장 공유' : (user?.fam || '소속 팸 없음')} · {month}월 {week}주차
          </p>
        </div>
      </div>

      <div className="flex-1 px-5 pt-2">
        <textarea
          value={content}
          onChange={(event) => { setContent(event.target.value); setSubmitError('') }}
          placeholder={'기도제목을 작성해주세요.'}
          className="w-full h-48 p-3 border border-gray-300 rounded-xl text-sm leading-relaxed resize-none focus:outline-none focus:border-primary placeholder:text-gray-500 placeholder:text-[13px]"
        />
        <div className="flex justify-end mt-1">
          <span className={`text-xs ${content.length > 200 ? 'text-danger' : 'text-gray-500'}`}>
            {content.length} / 200
          </span>
        </div>
        {submitError && <p className="mt-3 text-[12px] text-danger">{submitError}</p>}
      </div>

      <div className="px-5 pb-8">
        <div className="bg-gray-100 rounded-lg p-3">
          <p className="text-xs text-gray-500 leading-relaxed">
            {isPastor
              ? '작성한 기도제목은 교역자·부장끼리 공유됩니다.'
              : '작성한 기도제목은 같은 팸 식구들과 공유됩니다.'}
          </p>
        </div>
      </div>
    </div>
  )
}
