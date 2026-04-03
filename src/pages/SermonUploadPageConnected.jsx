import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useSermon } from '../context/SermonContext'

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/$/, '')

function getTodayInputValue() {
  const now = new Date()
  const offsetDate = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
  return offsetDate.toISOString().slice(0, 10)
}

const EMPTY_FORM = {
  title: '',
  verse: '',
  preacher: '',
  youtubeUrl: '',
  summary: '',
  sermonDate: getTodayInputValue(),
}

function buildApiUrl(path) {
  return `${API_BASE_URL}${path}`
}

function isValidYoutubeUrl(url) {
  return !url || url.includes('youtube.com/watch') || url.includes('youtu.be/')
}

function getYoutubeThumbnail(url) {
  if (!url) return null
  const matchWatch = url.match(/(?:youtube\.com\/watch\?v=)([^&]+)/)
  const matchShort = url.match(/(?:youtu\.be\/)([^?]+)/)
  const id = matchWatch?.[1] || matchShort?.[1]
  return id ? `https://img.youtube.com/vi/${id}/mqdefault.jpg` : null
}

function normalizeSermon(item) {
  return {
    title: item?.title ?? '',
    verse: item?.verse ?? '',
    preacher: item?.preacher ?? '',
    youtubeUrl: item?.youtubeUrl ?? '',
    summary: item?.summary ?? '',
    sermonDate: item?.sermonDate ?? getTodayInputValue(),
  }
}

async function requestApi(path, { method = 'GET', headers = {}, body } = {}) {
  const requestOptions = {
    method,
    headers: { ...headers },
    credentials: 'include',
  }

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
  if (result.response.status === 401) {
    return '세션이 만료되었습니다. 다시 로그인해주세요.'
  }

  if (result.response.status === 403) {
    return result.payload?.error?.message ?? '설교 업로드 권한이 없습니다.'
  }

  return result.payload?.error?.message ?? fallbackMessage
}

async function requestTokenRefresh() {
  const result = await requestApi('/api/auth/refresh', {
    method: 'POST',
  })

  if (!result.response.ok || !result.payload?.success || !result.payload?.data?.accessToken) {
    throw new Error(getApiErrorMessage(result, '세션이 만료되었습니다. 다시 로그인해주세요.'))
  }

  return result.payload.data.accessToken
}

function isSessionError(message) {
  return (
    typeof message === 'string' &&
    (message.includes('세션이 만료') || message.includes('다시 로그인'))
  )
}

export default function SermonUploadPageConnected() {
  const navigate = useNavigate()
  const { isPastorOrAbove, accessToken, setAccessToken, logout } = useAuth()
  const { setSermon } = useSermon()

  const [form, setForm] = useState(EMPTY_FORM)
  const [saved, setSaved] = useState(false)
  const [urlError, setUrlError] = useState('')
  const [pageError, setPageError] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const accessTokenRef = useRef(accessToken)

  useEffect(() => {
    accessTokenRef.current = accessToken
  }, [accessToken])

  useEffect(() => {
    if (!saved) return

    const timerId = window.setTimeout(() => {
      setSaved(false)
    }, 2000)

    return () => {
      window.clearTimeout(timerId)
    }
  }, [saved])

  const handleExpiredSession = () => {
    logout()
    navigate('/login', { replace: true })
  }

  const callAuthedApi = async (path, options = {}) => {
    const makeRequest = (token) =>
      requestApi(path, {
        ...options,
        headers: {
          ...(options.headers ?? {}),
          Authorization: `Bearer ${token}`,
        },
      })

    let token = accessTokenRef.current

    if (!token) {
      token = await requestTokenRefresh()
      accessTokenRef.current = token
      setAccessToken(token)
    }

    let result = await makeRequest(token)

    if (result.response.status === 401) {
      token = await requestTokenRefresh()
      accessTokenRef.current = token
      setAccessToken(token)
      result = await makeRequest(token)
    }

    if (!result.response.ok || !result.payload?.success) {
      throw new Error(getApiErrorMessage(result, '요청을 처리하지 못했습니다.'))
    }

    return result.payload.data
  }

  useEffect(() => {
    let cancelled = false

    const loadLatestSermon = async () => {
      if (!isPastorOrAbove) {
        setIsLoading(false)
        return
      }

      setIsLoading(true)
      setPageError('')

      try {
        const data = await callAuthedApi('/api/sermon/latest')
        if (cancelled) return

        const nextForm = data && Object.keys(data).length > 0
          ? normalizeSermon(data)
          : EMPTY_FORM

        setForm(nextForm)
        setSermon(nextForm)
      } catch (error) {
        const message =
          error instanceof Error ? error.message : '최신 설교 정보를 불러오지 못했습니다.'

        if (isSessionError(message)) {
          handleExpiredSession()
          return
        }

        if (!cancelled) {
          setPageError(message)
          setForm(EMPTY_FORM)
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false)
        }
      }
    }

    loadLatestSermon()

    return () => {
      cancelled = true
    }
  }, [isPastorOrAbove])

  if (!isPastorOrAbove) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <p className="text-gray-500 text-sm">설교 업로드 권한이 없습니다.</p>
        <button
          onClick={() => navigate('/my')}
          className="mt-3 text-xs text-primary bg-primary-light px-4 py-2 rounded-full border-none cursor-pointer"
        >
          돌아가기
        </button>
      </div>
    )
  }

  const handleUrlChange = (value) => {
    setForm((prev) => ({ ...prev, youtubeUrl: value }))

    if (value && !isValidYoutubeUrl(value)) {
      setUrlError('유효한 유튜브 URL을 입력해주세요. (youtube.com/watch?v=... 또는 youtu.be/...)')
    } else {
      setUrlError('')
    }
  }

  const handleSave = async () => {
    if (isSubmitting) return

    if (!form.title.trim()) {
      setPageError('설교 제목을 입력해주세요.')
      return
    }

    if (!form.preacher.trim()) {
      setPageError('설교자를 입력해주세요.')
      return
    }

    if (!form.sermonDate) {
      setPageError('설교 날짜를 선택해주세요.')
      return
    }

    if (form.youtubeUrl && !isValidYoutubeUrl(form.youtubeUrl)) {
      setPageError('유효한 유튜브 URL을 입력해주세요.')
      return
    }

    setPageError('')
    setIsSubmitting(true)

    try {
      const savedSermon = await callAuthedApi('/api/sermon', {
        method: 'POST',
        body: {
          title: form.title.trim(),
          verse: form.verse.trim() || null,
          preacher: form.preacher.trim(),
          youtubeUrl: form.youtubeUrl.trim() || null,
          summary: form.summary.trim() || null,
          sermonDate: form.sermonDate,
        },
      })

      const nextForm = normalizeSermon(savedSermon)
      setForm(nextForm)
      setSermon(nextForm)
      setSaved(true)
    } catch (error) {
      const message =
        error instanceof Error ? error.message : '설교 저장에 실패했습니다.'

      if (isSessionError(message)) {
        handleExpiredSession()
        return
      }

      setPageError(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const thumbnail = getYoutubeThumbnail(form.youtubeUrl)

  return (
    <div className="pb-28">
      <div className="flex items-center gap-3 px-5 pt-4 pb-3 border-b border-gray-300">
        <button
          onClick={() => navigate('/my')}
          className="text-lg bg-transparent border-none cursor-pointer"
        >
          ←
        </button>
        <p className="text-base font-medium">설교 업로드</p>
      </div>

      {pageError && (
        <div className="px-5 pt-4 pb-1">
          <div className="bg-danger-light rounded-2xl p-4">
            <p className="text-sm text-danger">{pageError}</p>
          </div>
        </div>
      )}

      <div className="px-5 pt-4 pb-2">
        <p className="text-xs text-gray-500 mb-2">미리보기</p>
        <div className="bg-gradient-to-br from-primary to-primary-hover rounded-2xl p-5 text-white">
          <div className="flex items-center justify-between">
            <p className="text-[11px] opacity-80">이번 주 설교</p>
            {form.youtubeUrl && isValidYoutubeUrl(form.youtubeUrl) && (
              <span className="text-[11px] opacity-70">YouTube</span>
            )}
          </div>
          <p className="text-base font-medium mt-1.5 mb-1 leading-snug">
            "{form.title || '설교 제목'}"
          </p>
          <p className="text-xs opacity-70">
            {form.verse || '본문 말씀'} · {form.preacher || '설교자'}
          </p>
          {form.summary && (
            <div className="mt-3 pt-3 border-t border-white/20">
              <p className="text-xs leading-relaxed opacity-90">"{form.summary}"</p>
            </div>
          )}
        </div>

        {thumbnail && (
          <div className="mt-2 rounded-xl overflow-hidden border border-gray-300">
            <img src={thumbnail} alt="유튜브 썸네일" className="w-full object-cover" />
          </div>
        )}
      </div>

      <div className="px-5 pt-2 flex flex-col gap-4">
        <div>
          <p className="text-xs text-gray-500 mb-1.5">
            설교 제목 <span className="text-danger">*</span>
          </p>
          <input
            value={form.title}
            onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
            placeholder="예: 흔들리지 않는 믿음"
            disabled={isLoading || isSubmitting}
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-primary"
          />
        </div>

        <div>
          <p className="text-xs text-gray-500 mb-1.5">설교 날짜 <span className="text-danger">*</span></p>
          <input
            type="date"
            value={form.sermonDate}
            onChange={(event) => setForm((prev) => ({ ...prev, sermonDate: event.target.value }))}
            disabled={isLoading || isSubmitting}
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-primary"
          />
        </div>

        <div>
          <p className="text-xs text-gray-500 mb-1.5">본문 말씀</p>
          <input
            value={form.verse}
            onChange={(event) => setForm((prev) => ({ ...prev, verse: event.target.value }))}
            placeholder="예: 히브리서 11:1-6"
            disabled={isLoading || isSubmitting}
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-primary"
          />
        </div>

        <div>
          <p className="text-xs text-gray-500 mb-1.5">
            설교자 <span className="text-danger">*</span>
          </p>
          <input
            value={form.preacher}
            onChange={(event) => setForm((prev) => ({ ...prev, preacher: event.target.value }))}
            placeholder="예: 김목사"
            disabled={isLoading || isSubmitting}
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-primary"
          />
        </div>

        <div>
          <p className="text-xs text-gray-500 mb-1.5">유튜브 URL</p>
          <input
            value={form.youtubeUrl}
            onChange={(event) => handleUrlChange(event.target.value)}
            placeholder="https://www.youtube.com/watch?v=..."
            disabled={isLoading || isSubmitting}
            className={`w-full border rounded-lg px-3 py-2.5 text-sm outline-none transition-colors ${
              urlError ? 'border-danger focus:border-danger' : 'border-gray-300 focus:border-primary'
            }`}
          />
          {urlError && <p className="text-[11px] text-danger mt-1 ml-1">{urlError}</p>}
          {!urlError && form.youtubeUrl && isValidYoutubeUrl(form.youtubeUrl) && (
            <p className="text-[11px] text-success mt-1 ml-1">유효한 유튜브 URL입니다.</p>
          )}
          <p className="text-[11px] text-gray-500 mt-1 ml-1">
            홈 화면의 설교 카드에서 이 링크를 사용합니다.
          </p>
        </div>

        <div>
          <p className="text-xs text-gray-500 mb-1.5">설교 요약</p>
          <textarea
            value={form.summary}
            onChange={(event) => setForm((prev) => ({ ...prev, summary: event.target.value }))}
            placeholder="설교 핵심 내용을 짧게 정리해주세요"
            rows={3}
            disabled={isLoading || isSubmitting}
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-primary resize-none"
          />
        </div>
      </div>

      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] px-5 py-3 bg-white border-t border-gray-300">
        <button
          onClick={handleSave}
          disabled={isLoading || isSubmitting}
          className={`w-full py-3 rounded-lg text-sm font-medium border-none transition-colors ${
            saved
              ? 'bg-success text-white'
              : isLoading || isSubmitting
                ? 'bg-gray-300 text-white cursor-not-allowed'
                : 'bg-primary text-white hover:bg-primary-hover cursor-pointer'
          }`}
        >
          {saved ? '저장되었습니다' : isSubmitting ? '저장 중...' : '설교 저장하기'}
        </button>
      </div>
    </div>
  )
}
