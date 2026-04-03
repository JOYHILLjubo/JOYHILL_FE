import { useMemo, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/$/, '')

const TAG_OPTIONS = ['행사', '안내', '소식', '요청']

const TAG_STYLE = {
  행사: { active: 'bg-primary-light text-primary border-primary' },
  안내: { active: 'bg-warning-light text-warning border-warning' },
  소식: { active: 'bg-success-light text-success border-success' },
  요청: { active: 'bg-danger-light text-danger border-danger' },
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

function normalizeNoticeState(item) {
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
    fileUrl: item.fileUrl ?? item.file ?? '',
    createdAt: item.createdAt ?? '',
    date: item.date ?? formatNoticeDate(item.createdAt ?? ''),
  }
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
    fileUrl: item?.fileUrl ?? '',
    createdAt: item?.createdAt ?? '',
    date: formatNoticeDate(item?.createdAt),
  }
}

function nullIfBlank(value) {
  const trimmed = String(value ?? '').trim()
  return trimmed === '' ? null : trimmed
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
    return result.payload?.error?.message ?? '공지 저장 권한이 없습니다.'
  }

  if (result.response.status === 404) {
    return result.payload?.error?.message ?? '수정할 공지사항을 찾을 수 없습니다.'
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

export default function NoticeWritePageConnected() {
  const navigate = useNavigate()
  const location = useLocation()
  const {
    user,
    accessToken,
    setAccessToken,
    logout,
    canWriteNotice,
    isAdmin,
  } = useAuth()

  const editingNotice = useMemo(
    () =>
      location.state?.mode === 'edit'
        ? normalizeNoticeState(location.state?.notice)
        : null,
    [location.state],
  )
  const isEdit = Boolean(editingNotice?.id)

  const [title, setTitle] = useState(editingNotice?.title ?? '')
  const [content, setContent] = useState(editingNotice?.content ?? '')
  const [tag, setTag] = useState(editingNotice?.tag ?? '')
  const [fileUrl, setFileUrl] = useState(editingNotice?.fileUrl ?? '')
  const [deadline, setDeadline] = useState(editingNotice?.deadline ?? '')
  const [pinned, setPinned] = useState(editingNotice?.pinned ?? false)
  const [submitError, setSubmitError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const accessTokenRef = useRef(accessToken)

  accessTokenRef.current = accessToken

  const canEditTarget = !isEdit || isAdmin || editingNotice?.userId == null || editingNotice.userId === user?.id

  const handleExpiredSession = () => {
    logout()
    navigate('/login', { replace: true })
  }

  const handleBack = () => {
    if (isEdit && editingNotice?.id) {
      navigate(`/notice/${editingNotice.id}`, { state: { notice: editingNotice } })
      return
    }

    navigate('/notice')
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

  const handleSubmit = async () => {
    if (isSubmitting) return

    if (!title.trim()) {
      setSubmitError('제목을 입력해주세요.')
      return
    }

    if (!content.trim()) {
      setSubmitError('내용을 입력해주세요.')
      return
    }

    if (!tag) {
      setSubmitError('태그를 하나 선택해주세요.')
      return
    }

    setSubmitError('')
    setIsSubmitting(true)

    const requestBody = {
      title: title.trim(),
      content: content.trim(),
      tag,
      teamTag: editingNotice?.teamTag ?? (user?.teamRoles?.[0] ?? null),
      pinned,
      deadline: nullIfBlank(deadline),
      fileUrl: nullIfBlank(fileUrl),
    }

    try {
      const savedNotice = isEdit
        ? await callAuthedApi(`/api/notices/${editingNotice.id}`, {
            method: 'PUT',
            body: requestBody,
          })
        : await callAuthedApi('/api/notices', {
            method: 'POST',
            body: requestBody,
          })

      navigate(`/notice/${savedNotice.id}`, {
        replace: true,
        state: {
          notice: {
            ...mapNotice(savedNotice),
            file: savedNotice.fileUrl ?? null,
          },
        },
      })
    } catch (error) {
      const message =
        error instanceof Error ? error.message : '공지사항 저장에 실패했습니다.'

      if (isSessionError(message)) {
        handleExpiredSession()
        return
      }

      setSubmitError(message)
      setIsSubmitting(false)
    }
  }

  if (!canWriteNotice) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <p className="text-gray-500 text-sm">공지 등록 권한이 없습니다.</p>
        <button
          onClick={handleBack}
          className="mt-3 text-xs text-primary bg-primary-light px-4 py-2 rounded-full border-none cursor-pointer"
        >
          돌아가기
        </button>
      </div>
    )
  }

  if (!canEditTarget) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <p className="text-gray-500 text-sm">이 공지를 수정할 권한이 없습니다.</p>
        <button
          onClick={handleBack}
          className="mt-3 text-xs text-primary bg-primary-light px-4 py-2 rounded-full border-none cursor-pointer"
        >
          돌아가기
        </button>
      </div>
    )
  }

  return (
    <div className="pb-28">
      <div className="flex items-center gap-3 px-5 pt-4 pb-3 border-b border-gray-300">
        <button
          onClick={handleBack}
          className="text-lg bg-transparent border-none cursor-pointer"
        >
          ←
        </button>
        <p className="text-base font-medium">{isEdit ? '공지사항 수정' : '공지사항 등록'}</p>
      </div>

      <div className="px-5 pt-4 flex flex-col gap-5">
        <div>
          <p className="text-xs text-gray-500 mb-1.5">
            제목 <span className="text-danger">*</span>
          </p>
          <input
            value={title}
            onChange={(event) => {
              setTitle(event.target.value)
              setSubmitError('')
            }}
            placeholder="공지 제목을 입력하세요"
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-primary"
          />
        </div>

        <div>
          <p className="text-xs text-gray-500 mb-1.5">
            내용 <span className="text-danger">*</span>
          </p>
          <textarea
            value={content}
            onChange={(event) => {
              setContent(event.target.value)
              setSubmitError('')
            }}
            placeholder="공지 내용을 입력하세요"
            rows={6}
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-primary resize-none"
          />
        </div>

        <div>
          <p className="text-xs text-gray-500 mb-1.5">
            태그 <span className="text-danger">*</span>
          </p>
          <div className="flex gap-2 flex-wrap">
            {TAG_OPTIONS.map((option) => {
              const selected = tag === option

              return (
                <button
                  key={option}
                  onClick={() => {
                    setTag((prev) => (prev === option ? '' : option))
                    setSubmitError('')
                  }}
                  className={`text-sm px-3.5 py-1.5 rounded-full border cursor-pointer transition-all ${
                    selected ? TAG_STYLE[option].active : 'bg-white text-gray-500 border-gray-300'
                  }`}
                >
                  {option}
                </button>
              )
            })}
          </div>
        </div>

        <div>
          <p className="text-xs text-gray-500 mb-1.5">첨부 링크</p>
          <input
            value={fileUrl}
            onChange={(event) => {
              setFileUrl(event.target.value)
              setSubmitError('')
            }}
            placeholder="https://..."
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-primary"
          />
          <p className="text-[11px] text-gray-500 mt-1 ml-1">
            현재 백엔드는 파일 업로드 대신 링크 주소만 저장합니다.
          </p>
        </div>

        <div>
          <p className="text-xs text-gray-500 mb-1.5">게시 기한</p>
          <input
            type="date"
            value={deadline}
            onChange={(event) => {
              setDeadline(event.target.value)
              setSubmitError('')
            }}
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-primary"
          />
          <p className="text-[11px] text-gray-500 mt-1 ml-1">
            {deadline ? `${deadline} 이후 자동 삭제는 아직 연결되지 않았습니다.` : '미설정 시 계속 게시됩니다.'}
          </p>
        </div>

        <div className="flex items-center justify-between py-1">
          <div>
            <p className="text-sm">상단 고정</p>
            <p className="text-[11px] text-gray-500 mt-0.5">
              공지사항 목록 최상단에 고정됩니다.
            </p>
          </div>
          <button
            onClick={() => setPinned((prev) => !prev)}
            className={`w-12 h-6 rounded-full transition-colors relative border-none cursor-pointer shrink-0 ${
              pinned ? 'bg-primary' : 'bg-gray-300'
            }`}
          >
            <span
              className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${
                pinned ? 'left-6' : 'left-0.5'
              }`}
            />
          </button>
        </div>

        {submitError && <p className="text-[12px] text-danger">{submitError}</p>}
      </div>

      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] px-5 py-3 bg-white border-t border-gray-300">
        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className={`w-full py-3 rounded-lg text-sm font-medium border-none transition-colors ${
            isSubmitting
              ? 'bg-gray-300 text-white cursor-not-allowed'
              : 'bg-primary text-white cursor-pointer hover:bg-primary-hover'
          }`}
        >
          {isSubmitting ? '저장 중...' : isEdit ? '공지 수정하기' : '공지 등록하기'}
        </button>
      </div>
    </div>
  )
}
