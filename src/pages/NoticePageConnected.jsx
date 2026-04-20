import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import BottomNav from '../components/BottomNav'
import { useAuth } from '../context/AuthContext'

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/$/, '')

const TAG_FILTERS = [
  { label: '전체', value: '' },
  { label: '행사', value: '행사' },
  { label: '안내', value: '안내' },
  { label: '소식', value: '소식' },
  { label: '모집', value: '모집' },
]

const TAG_COLORS = {
  행사: { bg: 'bg-primary-light', text: 'text-primary' },
  안내: { bg: 'bg-warning-light', text: 'text-warning' },
  소식: { bg: 'bg-success-light', text: 'text-success' },
  모집: { bg: 'bg-danger-light', text: 'text-danger' },
}

function buildApiUrl(path) {
  return `${API_BASE_URL}${path}`
}

function formatNoticeDate(value) {
  if (!value) return ''

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''

  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}.${month}.${day}`
}

function mapNotice(item) {
  return {
    id: item?.id ?? null,
    title: item?.title ?? '',
    content: item?.content ?? '',
    author: item?.author ?? '',
    userId: item?.userId ?? null,
    tag: item?.tag ?? '',
    teamTag: item?.teamTag ?? '',
    pinned: Boolean(item?.pinned),
    deadline: item?.deadline ?? '',
    fileUrl: item?.fileUrl ?? null,
    createdAt: item?.createdAt ?? '',
    date: formatNoticeDate(item?.createdAt),
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
    return '공지 목록을 조회할 권한이 없습니다.'
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

export default function NoticePageConnected() {
  const navigate = useNavigate()
  const { accessToken, setAccessToken, logout, canWriteNotice } = useAuth()

  const [filter, setFilter] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('')
  const [notices, setNotices] = useState([])
  const [totalCount, setTotalCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [reloadKey, setReloadKey] = useState(0)

  const accessTokenRef = useRef(accessToken)

  useEffect(() => {
    accessTokenRef.current = accessToken
  }, [accessToken])

  useEffect(() => {
    const timerId = window.setTimeout(() => {
      setDebouncedSearchQuery(searchQuery.trim())
    }, 250)

    return () => {
      window.clearTimeout(timerId)
    }
  }, [searchQuery])

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

    const loadNotices = async () => {
      setIsLoading(true)
      setLoadError('')

      try {
        const params = new URLSearchParams({
          page: '0',
          size: '100',
        })

        if (filter) {
          params.set('tag', filter)
        }

        if (debouncedSearchQuery) {
          params.set('search', debouncedSearchQuery)
        }

        const data = await callAuthedApi(`/api/notices?${params.toString()}`)

        if (cancelled) return

        const nextNotices = Array.isArray(data?.content) ? data.content.map(mapNotice) : []

        setNotices(nextNotices)
        setTotalCount(Number(data?.totalElements ?? nextNotices.length))
      } catch (error) {
        const message =
          error instanceof Error ? error.message : '공지 목록을 불러오지 못했습니다.'

        if (isSessionError(message)) {
          handleExpiredSession()
          return
        }

        if (!cancelled) {
          setLoadError(message)
          setNotices([])
          setTotalCount(0)
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false)
        }
      }
    }

    loadNotices()

    return () => {
      cancelled = true
    }
  }, [filter, debouncedSearchQuery, reloadKey])

  const openNotice = (notice) => {
    navigate(`/notice/${notice.id}`, {
      state: {
        notice: {
          ...notice,
          file: notice.fileUrl,
        },
      },
    })
  }

  return (
    <div className="pb-20">
      <div className="flex justify-between items-center px-5 pt-6" style={{ marginBottom: '40px' }}>
        <p style={{ fontSize: '1.25rem' }} className="font-semibold">전체 공지사항</p>
        {canWriteNotice && (
          <button
            onClick={() => navigate('/notice/write')}
            className="text-xs text-white bg-primary px-3 py-1.5 rounded-full border-none cursor-pointer"
          >
            + 작성
          </button>
        )}
      </div>

      <div className="px-5 mb-3">
        <input
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
          placeholder="검색어를 입력하세요"
          className="w-full border border-gray-300 rounded-lg px-3 outline-none focus:border-primary" style={{ fontSize: '12px', fontWeight: 400, height: '56px' }}
        />
      </div>

      <div className="flex gap-2 px-5 mb-3 overflow-x-auto">
        {TAG_FILTERS.map((tag) => (
          <button
            key={tag.label}
            onClick={() => setFilter(tag.value)}
            className={`text-xs px-2.5 py-1 rounded-full border-none cursor-pointer transition-colors whitespace-nowrap ${
              filter === tag.value ? 'bg-primary-light text-primary font-semibold' : 'bg-gray-100 text-gray-500'
            }`}
          >
            {tag.label}
          </button>
        ))}
      </div>

      <div className="px-5 pb-1">
        <span className="text-xs text-gray-500">총 {totalCount}개</span>
      </div>

      {loadError && (
        <div className="px-5 pt-2">
          <div className="bg-danger-light rounded-2xl p-4">
            <p className="text-sm text-danger">{loadError}</p>
            <button
              onClick={() => setReloadKey((prev) => prev + 1)}
              className="mt-3 text-xs text-danger bg-white px-4 py-2 rounded-full border-none cursor-pointer"
            >
              다시 시도
            </button>
          </div>
        </div>
      )}

      <div className="px-5 pt-2">
        {isLoading ? (
          <p className="text-sm text-gray-500 text-center mt-10">공지 목록을 불러오는 중입니다.</p>
        ) : notices.length === 0 ? (
          <p className="text-sm text-gray-400 text-center mt-10">검색 결과가 없습니다.</p>
        ) : (
          notices.map((notice) => {
            const color = TAG_COLORS[notice.tag] || TAG_COLORS['소식']

            return (
              <div
                key={notice.id}
                onClick={() => openNotice(notice)}
                className={`border border-gray-300 rounded-xl p-4 mb-2 cursor-pointer hover:bg-gray-100/60 transition-colors ${
                  notice.pinned ? 'bg-gray-100/50' : ''
                }`}
              >
                <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                  {notice.pinned && (
                    <span className="text-[11px] text-danger bg-danger-light px-1.5 py-0.5 rounded">
                      고정
                    </span>
                  )}
                  {notice.tag && (
                    <span className={`text-[11px] ${color.text} ${color.bg} px-1.5 py-0.5 rounded`}>
                      {notice.tag}
                    </span>
                  )}

                </div>
                <p className="text-sm font-medium">{notice.title}</p>
                <p className="text-[13px] text-gray-500 mt-1 leading-relaxed line-clamp-2">
                  {notice.content.split('\n')[0]}
                </p>
                <div className="flex gap-2 mt-2">
                  <span className="text-[11px] text-gray-500">{notice.author || 'JOYHILL'}</span>
                  <span className="text-[11px] text-gray-500">·</span>
                  <span className="text-[11px] text-gray-500">{notice.date}</span>
                </div>
              </div>
            )
          })
        )}
      </div>

      <BottomNav />
    </div>
  )
}
