import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import BottomNav from '../components/BottomNav'
import { useAuth } from '../context/AuthContext'

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/$/, '')

const TAG_COLORS = {
  행사: { bg: 'bg-primary-light', text: 'text-primary' },
  안내: { bg: 'bg-warning-light', text: 'text-warning' },
  소식: { bg: 'bg-success-light', text: 'text-success' },
  요청: { bg: 'bg-danger-light', text: 'text-danger' },
}

function buildApiUrl(path) {
  return `${API_BASE_URL}${path}`
}

function formatNoticeDate(value) {
  if (!value) return ''

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return String(value)
  }

  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}.${month}.${day}`
}

function getInitial(name) {
  const trimmed = String(name ?? '').trim()
  return trimmed ? trimmed[0] : 'N'
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
    date: formatNoticeDate(item?.createdAt ?? ''),
  }
}

function mapStateNotice(item) {
  if (!item) return null

  return {
    id: item.id ?? null,
    title: item.title ?? '',
    content: item.content ?? '',
    author: item.author ?? '',
    userId: item.userId ?? null,
    tag: item.tag ?? '',
    teamTag: item.teamTag ?? '',
    pinned: Boolean(item.pinned),
    deadline: item.deadline ?? '',
    fileUrl: item.fileUrl ?? item.file ?? null,
    createdAt: item.createdAt ?? item.date ?? '',
    date: item.date ?? formatNoticeDate(item.createdAt ?? ''),
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
    return result.payload?.error?.message ?? '이 공지를 수정하거나 삭제할 권한이 없습니다.'
  }

  if (result.response.status === 404) {
    return result.payload?.error?.message ?? '공지사항을 찾을 수 없습니다.'
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

export default function NoticeDetailPageConnected() {
  const navigate = useNavigate()
  const location = useLocation()
  const { id } = useParams()
  const { user, accessToken, setAccessToken, logout, isAdmin } = useAuth()

  const initialNotice = mapStateNotice(location.state?.notice)
  const [notice, setNotice] = useState(initialNotice)
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)

  const accessTokenRef = useRef(accessToken)

  useEffect(() => {
    accessTokenRef.current = accessToken
  }, [accessToken])

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

    const loadNotice = async () => {
      if (!id) {
        setLoadError('공지사항을 찾을 수 없습니다.')
        setIsLoading(false)
        return
      }

      setIsLoading(true)
      setLoadError('')

      try {
        const data = await callAuthedApi(`/api/notices/${id}`)
        if (cancelled) return

        setNotice(mapNotice(data))
      } catch (error) {
        const message =
          error instanceof Error ? error.message : '공지사항을 불러오지 못했습니다.'

        if (isSessionError(message)) {
          handleExpiredSession()
          return
        }

        if (!cancelled) {
          setLoadError(message)
          setNotice(initialNotice)
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false)
        }
      }
    }

    loadNotice()

    return () => {
      cancelled = true
    }
  }, [id])

  const canModifyNotice = Boolean(
    notice && (isAdmin || (user?.id != null && notice.userId != null && notice.userId === user.id)),
  )

  const handleDelete = async () => {
    if (!notice?.id || isDeleting) return

    const confirmed = window.confirm('이 공지사항을 삭제할까요?')
    if (!confirmed) return

    setIsDeleting(true)
    setLoadError('')

    try {
      await callAuthedApi(`/api/notices/${notice.id}`, {
        method: 'DELETE',
      })

      navigate('/notice', { replace: true })
    } catch (error) {
      const message =
        error instanceof Error ? error.message : '공지사항 삭제에 실패했습니다.'

      if (isSessionError(message)) {
        handleExpiredSession()
        return
      }

      setLoadError(message)
      setIsDeleting(false)
    }
  }

  const handleRetry = () => {
    navigate(0)
  }

  const handleEdit = () => {
    if (!notice) return

    navigate('/notice/write', {
      state: {
        mode: 'edit',
        notice: {
          ...notice,
          file: notice.fileUrl,
        },
      },
    })
  }

  if (!notice && isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <p className="text-gray-500 text-sm">공지사항을 불러오는 중입니다.</p>
      </div>
    )
  }

  if (!notice && !isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <p className="text-gray-500 text-sm">{loadError || '공지사항을 찾을 수 없습니다.'}</p>
        <button
          onClick={() => navigate('/notice')}
          className="mt-3 text-xs text-primary bg-primary-light px-4 py-2 rounded-full border-none cursor-pointer"
        >
          목록으로
        </button>
      </div>
    )
  }

  const color = TAG_COLORS[notice.tag] || TAG_COLORS.소식

  return (
    <div className="pb-20">
      <div className="flex items-center gap-3 px-5 pt-4 pb-3 border-b border-gray-300">
        <button
          onClick={() => navigate('/notice')}
          className="text-lg bg-transparent border-none cursor-pointer"
        >
          ←
        </button>
        <p className="text-base font-medium flex-1">공지사항</p>
        {canModifyNotice && (
          <div className="flex gap-2">
            <button
              onClick={handleEdit}
              className="text-xs text-gray-500 bg-gray-100 px-3 py-1.5 rounded-full border-none cursor-pointer"
            >
              수정
            </button>
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className={`text-xs px-3 py-1.5 rounded-full border-none ${
                isDeleting
                  ? 'text-gray-400 bg-gray-100 cursor-not-allowed'
                  : 'text-danger bg-danger-light cursor-pointer'
              }`}
            >
              {isDeleting ? '삭제 중...' : '삭제'}
            </button>
          </div>
        )}
      </div>

      {loadError && (
        <div className="px-5 pt-4">
          <div className="bg-danger-light rounded-2xl p-4">
            <p className="text-sm text-danger">{loadError}</p>
            <button
              onClick={handleRetry}
              className="mt-3 text-xs text-danger bg-white px-4 py-2 rounded-full border-none cursor-pointer"
            >
              다시 시도
            </button>
          </div>
        </div>
      )}

      <div className="px-5 pt-5 pb-6">
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          {notice.pinned && (
            <span className="text-[11px] text-danger bg-danger-light px-2 py-0.5 rounded-full">
              고정
            </span>
          )}
          {notice.tag && (
            <span className={`text-[11px] ${color.text} ${color.bg} px-2 py-0.5 rounded-full`}>
              {notice.tag}
            </span>
          )}
          {notice.teamTag && (
            <span className="text-[11px] text-warning bg-warning-light px-2 py-0.5 rounded-full">
              {notice.teamTag}
            </span>
          )}
        </div>

        <h1 className="text-[17px] font-semibold leading-snug mb-3">{notice.title}</h1>

        <div className="flex items-center gap-2 pb-4 border-b border-gray-300">
          <div className="w-7 h-7 rounded-full bg-primary-light flex items-center justify-center text-xs font-medium text-primary shrink-0">
            {getInitial(notice.author)}
          </div>
          <div>
            <p className="text-xs font-medium">{notice.author || 'JOYHILL'}</p>
            <p className="text-[11px] text-gray-500">{notice.date}</p>
          </div>
          {notice.deadline && (
            <span className="ml-auto text-[11px] text-warning bg-warning-light px-2 py-0.5 rounded-full">
              ~{notice.deadline}
            </span>
          )}
        </div>

        <div className="pt-4">
          <p className="text-sm leading-relaxed text-gray-700 whitespace-pre-line">
            {notice.content}
          </p>
        </div>

        {notice.fileUrl && (
          <div className="mt-5 pt-4 border-t border-gray-300">
            <p className="text-xs text-gray-500 mb-2">첨부 이미지</p>
            <div className="rounded-lg overflow-hidden border border-gray-200">
              <img
                src={notice.fileUrl}
                alt="첨부 이미지"
                className="w-full object-contain bg-gray-50"
              />
            </div>
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  )
}
