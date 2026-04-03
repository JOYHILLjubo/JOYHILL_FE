import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/$/, '')

function buildApiUrl(path) {
  return `${API_BASE_URL}${path}`
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
    return '권한이 없습니다.'
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

export default function CommonPrayerWritePage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const {
    user,
    accessToken,
    setAccessToken,
    logout,
    isLeaderOrAbove,
  } = useAuth()

  const now = useMemo(() => new Date(), [])
  const month = Number(searchParams.get('month') || now.getMonth() + 1)
  const year = Number(searchParams.get('year') || now.getFullYear())
  const requestedEdit = searchParams.get('edit') === 'true'

  const [content, setContent] = useState('')
  const [existingPrayer, setExistingPrayer] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [pageError, setPageError] = useState('')

  const effectiveIsEdit = requestedEdit || Boolean(existingPrayer)

  const handleExpiredSession = () => {
    logout()
    navigate('/login', { replace: true })
  }

  const callAuthedApi = async (path, options = {}) => {
    try {
      let token = accessToken

      if (!token) {
        token = await requestTokenRefresh()
        setAccessToken(token)
      }

      let result = await requestApi(path, {
        ...options,
        headers: {
          ...(options.headers ?? {}),
          Authorization: `Bearer ${token}`,
        },
      })

      if (result.response.status === 401) {
        token = await requestTokenRefresh()
        setAccessToken(token)

        result = await requestApi(path, {
          ...options,
          headers: {
            ...(options.headers ?? {}),
            Authorization: `Bearer ${token}`,
          },
        })
      }

      if (!result.response.ok || !result.payload?.success) {
        throw new Error(getApiErrorMessage(result, '요청을 처리하지 못했습니다.'))
      }

      return result.payload.data
    } catch (err) {
      if (err instanceof Error && err.message.includes('다시 로그인')) {
        handleExpiredSession()
      }

      throw err
    }
  }

  useEffect(() => {
    const loadCommonPrayer = async () => {
      if (!user?.fam) {
        setPageError('소속 팸 정보가 없어 공동 기도제목을 불러올 수 없습니다.')
        setIsLoading(false)
        return
      }

      if (!isLeaderOrAbove) {
        setPageError('공동 기도제목은 리더 이상만 작성할 수 있습니다.')
        setIsLoading(false)
        return
      }

      setIsLoading(true)
      setPageError('')

      try {
        const params = new URLSearchParams({
          famName: user.fam,
          year: String(year),
          month: String(month),
        })

        const prayers = await callAuthedApi(`/api/prayers?${params.toString()}`)
        const commonPrayer = Array.isArray(prayers)
          ? prayers.find((prayer) => prayer?.type === 'common')
          : null

        setExistingPrayer(commonPrayer ?? null)

        if ((requestedEdit || commonPrayer) && commonPrayer?.content) {
          setContent(commonPrayer.content)
        }
      } catch (err) {
        setPageError(err instanceof Error ? err.message : '공동 기도제목을 불러오지 못했습니다.')
        setExistingPrayer(null)
      } finally {
        setIsLoading(false)
      }
    }

    void loadCommonPrayer()
  }, [user?.fam, year, month, requestedEdit, isLeaderOrAbove])

  const handleSubmit = async () => {
    const trimmed = content.trim()

    if (!trimmed) {
      setPageError('공동 기도제목을 입력해주세요.')
      return
    }

    if (trimmed.length > 100) {
      setPageError('공동 기도제목은 100자 이하로 작성해주세요.')
      return
    }

    if (!user?.fam) {
      setPageError('소속 팸 정보가 없어 저장할 수 없습니다.')
      return
    }

    setIsSubmitting(true)
    setPageError('')

    try {
      await callAuthedApi('/api/prayers/common', {
        method: 'POST',
        body: {
          famName: user.fam,
          content: trimmed,
          year,
          month,
        },
      })

      navigate('/prayer')
    } catch (err) {
      setPageError(err instanceof Error ? err.message : '공동 기도제목 저장에 실패했습니다.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* 헤더 */}
      <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-gray-300">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/prayer')}
            className="text-lg bg-transparent border-none cursor-pointer"
          >
            ←
          </button>
          <p className="text-base font-medium">
            {effectiveIsEdit ? '공동 기도제목 수정' : '공동 기도제목 작성'}
          </p>
        </div>
        <button
          onClick={handleSubmit}
          disabled={!content.trim() || isSubmitting || isLoading || !isLeaderOrAbove}
          className={`text-sm font-medium px-4 py-1.5 rounded-full border-none cursor-pointer transition-colors ${
            content.trim() && !isSubmitting && !isLoading && isLeaderOrAbove
              ? 'bg-primary text-white'
              : 'bg-gray-100 text-gray-500 cursor-not-allowed'
          }`}
        >
          {isSubmitting ? '저장 중...' : effectiveIsEdit ? '수정' : '등록'}
        </button>
      </div>

      {/* 안내 배지 */}
      <div className="px-5 pt-4 pb-2">
        <div className="inline-flex items-center gap-1.5 bg-primary-light px-3 py-1.5 rounded-full">
          <span className="text-xs font-medium text-primary-hover">🙏 {month}월 팸 공동 기도제목</span>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          {effectiveIsEdit
            ? '공동 기도제목을 수정합니다. 팸원 모두에게 반영됩니다.'
            : '매월 작성할 수 있으며, 팸원 모두에게 공유됩니다.'}
        </p>
      </div>

      {/* 입력 */}
      <div className="flex-1 px-5 pt-3">
        {pageError && (
          <div className="border border-danger-light bg-danger-light rounded-xl px-4 py-3 mb-3">
            <p className="text-xs text-danger">{pageError}</p>
          </div>
        )}

        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="이번 달 팸에서 함께 기도할 제목을 작성해주세요.&#10;&#10;예) 우리 팸이 하나님의 사랑 안에서 더 깊은 교제를 나눌 수 있도록"
          disabled={isLoading || !isLeaderOrAbove}
          className="w-full h-40 p-3 border border-gray-300 rounded-xl text-sm leading-relaxed resize-none focus:outline-none focus:border-primary placeholder:text-gray-500 placeholder:text-[13px] disabled:bg-gray-100"
        />
        <div className="flex justify-end mt-1">
          <span className={`text-xs ${content.length > 100 ? 'text-danger' : 'text-gray-500'}`}>
            {content.length} / 100
          </span>
        </div>
        {isLoading && <p className="text-xs text-gray-500 mt-2">기존 공동 기도제목을 불러오는 중입니다.</p>}
      </div>

      {/* 안내 */}
      <div className="px-5 pb-8">
        <div className="bg-primary-light rounded-lg p-3">
          <p className="text-xs text-primary-hover leading-relaxed">
            💡 공동 기도제목은 언제든 수정할 수 있어요.
            팸 전체가 함께 기도하는 주제로 작성해주세요.
          </p>
        </div>
      </div>
    </div>
  )
}
