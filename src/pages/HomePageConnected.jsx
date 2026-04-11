import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import BottomNav from '../components/BottomNav'
import { useAuth } from '../context/AuthContext'

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/$/, '')

const EMPTY_SERMON = {
  title: '',
  verse: '',
  preacher: '',
  youtubeUrl: '',
  summary: '',
  sermonDate: '',
}

const NOTICE_TAG_COLORS = {
  행사: { bg: 'bg-primary-light', text: 'text-primary' },
  안내: { bg: 'bg-warning-light', text: 'text-warning' },
  소식: { bg: 'bg-success-light', text: 'text-success' },
  모집: { bg: 'bg-danger-light', text: 'text-danger' },
}

const WORSHIP_INFOS = [
  { name: '1부 예배', time: '09:00', place: '본당' },
  { name: '2부 예배', time: '11:00', place: '본당' },
  { name: '수요 예배', time: '19:30', place: '소예배실' },
]

function buildApiUrl(path) {
  return `${API_BASE_URL}${path}`
}

function getYoutubeVideoId(url) {
  if (!url) return null

  const matchWatch = url.match(/youtube\.com\/watch\?v=([^&]+)/)
  const matchShort = url.match(/youtu\.be\/([^?]+)/)

  return matchWatch?.[1] || matchShort?.[1] || null
}

function toDate(value) {
  if (!value) return null

  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

function formatHeaderDate(date) {
  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  }).format(date)
}

function formatNoticeDate(value) {
  const date = toDate(value)
  if (!date) return ''

  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}.${month}.${day}`
}

function formatSermonDate(value) {
  const date = toDate(value)
  if (!date) return ''

  return new Intl.DateTimeFormat('ko-KR', {
    month: 'long',
    day: 'numeric',
  }).format(date)
}

function getScheduleDateParts(value) {
  const date = toDate(value)

  if (!date) {
    return {
      dateLabel: '-',
      weekdayLabel: '',
    }
  }

  const weekdayLabel = new Intl.DateTimeFormat('ko-KR', {
    weekday: 'short',
  }).format(date)

  return {
    dateLabel: `${date.getMonth() + 1}/${date.getDate()}`,
    weekdayLabel,
  }
}

function getInitial(name) {
  const trimmed = String(name ?? '').trim()
  return trimmed ? trimmed[0] : 'J'
}

function normalizeSermon(item) {
  return {
    title: item?.title ?? '',
    verse: item?.verse ?? '',
    preacher: item?.preacher ?? '',
    youtubeUrl: item?.youtubeUrl ?? '',
    summary: item?.summary ?? '',
    sermonDate: item?.sermonDate ?? '',
  }
}

function normalizeNotice(item) {
  return {
    id: item?.id ?? null,
    title: item?.title ?? '',
    content: item?.content ?? '',
    author: item?.author ?? '',
    tag: item?.tag ?? '',
    teamTag: item?.teamTag ?? '',
    pinned: Boolean(item?.pinned),
    deadline: item?.deadline ?? '',
    createdAt: item?.createdAt ?? '',
    fileUrl: item?.fileUrl ?? null,
  }
}

function normalizeSchedule(item) {
  return {
    id: item?.id ?? null,
    date: item?.date ?? '',
    content: item?.content ?? '',
    showDDay: Boolean(item?.showDDay),
    dDay: item?.dDay ?? '',
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
    throw new Error(
      '백엔드 서버에 연결할 수 없습니다. JOYHILL_BE가 실행 중인지 확인해주세요.',
    )
  }

  const payload = await response.json().catch(() => null)

  return { response, payload }
}

function getApiErrorMessage(result, fallbackMessage) {
  if (result.response.status === 401) {
    return '세션이 만료되었습니다. 다시 로그인해주세요.'
  }

  if (result.response.status === 403) {
    return '홈 화면을 조회할 권한이 없습니다.'
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

export default function HomePageConnected() {
  const navigate = useNavigate()
  const { user, accessToken, setAccessToken, logout } = useAuth()

  const [sermon, setSermon] = useState(EMPTY_SERMON)
  const [notices, setNotices] = useState([])
  const [schedules, setSchedules] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [reloadKey, setReloadKey] = useState(0)

  const accessTokenRef = useRef(accessToken)

  useEffect(() => {
    accessTokenRef.current = accessToken
  }, [accessToken])

  const todayLabel = useMemo(() => formatHeaderDate(new Date()), [])
  const videoId = getYoutubeVideoId(sermon.youtubeUrl)
  const sermonMeta = [sermon.verse, sermon.preacher].filter(Boolean).join(' · ')
  const sermonDateLabel = formatSermonDate(sermon.sermonDate)
  const headerDescription = user?.name
    ? `${user.name}님, 이번 주 소식을 확인해보세요.`
    : '이번 주 소식을 확인해보세요.'

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

    const loadHomeData = async () => {
      setIsLoading(true)
      setLoadError('')

      let nextSermon = EMPTY_SERMON
      let nextNotices = []
      let nextSchedules = []
      let failedCount = 0

      try {
        const sermonData = await callAuthedApi('/api/sermon/latest')
        nextSermon = normalizeSermon(sermonData)
      } catch (error) {
        const message =
          error instanceof Error ? error.message : '최신 설교를 불러오지 못했습니다.'

        if (isSessionError(message)) {
          handleExpiredSession()
          return
        }

        failedCount += 1
      }

      try {
        const noticeData = await callAuthedApi('/api/notices?page=0&size=3')
        nextNotices = Array.isArray(noticeData?.content)
          ? noticeData.content.map(normalizeNotice)
          : []
      } catch (error) {
        const message =
          error instanceof Error ? error.message : '공지를 불러오지 못했습니다.'

        if (isSessionError(message)) {
          handleExpiredSession()
          return
        }

        failedCount += 1
      }

      try {
        const scheduleData = await callAuthedApi('/api/schedules')
        nextSchedules = Array.isArray(scheduleData)
          ? scheduleData.map(normalizeSchedule).slice(0, 4)
          : []
      } catch (error) {
        const message =
          error instanceof Error ? error.message : '일정을 불러오지 못했습니다.'

        if (isSessionError(message)) {
          handleExpiredSession()
          return
        }

        failedCount += 1
      }

      if (cancelled) return

      setSermon(nextSermon)
      setNotices(nextNotices)
      setSchedules(nextSchedules)
      setLoadError(
        failedCount === 0
          ? ''
          : failedCount === 3
            ? '홈 화면 데이터를 불러오지 못했습니다.'
            : '일부 홈 데이터를 불러오지 못했습니다.',
      )
      setIsLoading(false)
    }

    loadHomeData()

    return () => {
      cancelled = true
    }
  }, [reloadKey])

  const handleRetry = () => {
    setReloadKey((prev) => prev + 1)
  }

  const handleSermonClick = () => {
    if (videoId) {
      window.open(sermon.youtubeUrl, '_blank', 'noopener,noreferrer')
    }
  }

  const navigateToNotice = (notice) => {
    if (!notice?.id) return

    navigate(`/notice/${notice.id}`, {
      state: {
        notice: {
          id: notice.id,
          title: notice.title,
          content: notice.content,
          author: notice.author,
          pinned: notice.pinned,
          tag: notice.tag,
          teamTag: notice.teamTag,
          deadline: notice.deadline,
          file: notice.fileUrl,
          date: formatNoticeDate(notice.createdAt),
        },
      },
    })
  }

  return (
    <div className="pb-20">
      <div className="flex justify-between items-center px-5 pt-4 pb-3">
        <div>
          <p className="text-[11px] text-gray-500">{todayLabel}</p>
          <p className="text-lg font-medium mt-0.5">JOY HILL</p>
          <p className="text-[12px] text-gray-500 mt-1">{headerDescription}</p>
        </div>
        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-sm font-medium">
          {getInitial(user?.name)}
        </div>
      </div>

      {loadError && (
        <div className="px-5 mb-3">
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

      <div className="px-5 mb-3">
        <div
          onClick={handleSermonClick}
          className={`bg-gradient-to-br from-primary to-primary-hover rounded-2xl p-5 text-white ${
            videoId ? 'cursor-pointer active:opacity-90' : ''
          }`}
        >
          <div className="flex items-center justify-between">
            <p className="text-[11px] opacity-80">이번 주 설교</p>
            {videoId && <span className="text-[11px] opacity-60">YouTube</span>}
          </div>

          {isLoading ? (
            <p className="text-sm mt-3 opacity-90">최신 설교를 불러오는 중입니다.</p>
          ) : sermon.title ? (
            <>
              <p className="text-base font-medium mt-1.5 mb-1 leading-snug">"{sermon.title}"</p>
              <p className="text-xs opacity-70">
                {[sermonMeta, sermonDateLabel].filter(Boolean).join(' · ')}
              </p>
              {sermon.summary && (
                <div className="mt-3 pt-3 border-t border-white/20">
                  <p className="text-xs leading-relaxed opacity-90">"{sermon.summary}"</p>
                </div>
              )}
            </>
          ) : (
            <div className="mt-3">
              <p className="text-sm font-medium">등록된 최신 설교가 아직 없습니다.</p>
              <p className="text-xs opacity-80 mt-1">설교 업로드 후 이 카드에 자동으로 표시됩니다.</p>
            </div>
          )}
        </div>
      </div>

      <div className="px-5 mb-3">
        <div className="border border-gray-300 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2.5">
            <p className="text-[13px] font-medium">공지</p>
            <button
              onClick={() => navigate('/notice')}
              className="text-[11px] text-primary bg-transparent border-none cursor-pointer"
            >
              전체보기
            </button>
          </div>

          {isLoading ? (
            <p className="text-[13px] text-gray-500 py-1.5">공지를 불러오는 중입니다.</p>
          ) : notices.length === 0 ? (
            <p className="text-[13px] text-gray-500 py-1.5">등록된 공지가 없습니다.</p>
          ) : (
            notices.map((notice, index) => {
              const color = NOTICE_TAG_COLORS[notice.tag] ?? NOTICE_TAG_COLORS.안내

              return (
                <button
                  key={notice.id ?? index}
                  onClick={() => navigateToNotice(notice)}
                  className={`w-full text-left py-2 border-none bg-transparent cursor-pointer ${
                    index < notices.length - 1 ? 'border-b border-gray-100' : ''
                  }`}
                >
                  <div className="flex items-center gap-1.5 flex-wrap mb-1">
                    {notice.pinned && (
                      <span className="text-[11px] text-danger bg-danger-light px-1.5 py-0.5 rounded">
                        고정
                      </span>
                    )}
                    {notice.tag && (
                      <span
                        className={`text-[11px] ${color.text} ${color.bg} px-1.5 py-0.5 rounded`}
                      >
                        {notice.tag}
                      </span>
                    )}
                    {notice.teamTag && (
                      <span className="text-[11px] text-warning bg-warning-light px-1.5 py-0.5 rounded">
                        {notice.teamTag}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <p className="text-[13px] font-medium flex-1 truncate">{notice.title}</p>
                    <span className="text-[11px] text-gray-500 shrink-0">{notice.author || 'JOYHILL'}</span>
                    <span className="text-[11px] text-gray-500 shrink-0">·</span>
                    <span className="text-[11px] text-gray-500 shrink-0">{formatNoticeDate(notice.createdAt)}</span>
                  </div>
                </button>
              )
            })
          )}
        </div>
      </div>

      <div className="px-5 mb-3">
        <div className="border border-gray-300 rounded-xl overflow-hidden">
          <a
            href="https://pf.kakao.com/_CxmDrxb"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 px-4 py-3.5 border-b border-gray-100 no-underline hover:bg-gray-100/60 transition-colors"
          >
            <span className="text-xl shrink-0">💬</span>
            <div className="flex-1">
              <p className="text-[13px] font-medium text-gray-800">청년부 카카오톡 채널</p>
              <p className="text-[11px] text-gray-500 mt-0.5">공지·소식을 카카오톡으로 받아보세요</p>
            </div>
            <span className="text-gray-400 text-xs">→</span>
          </a>
          <a
            href="https://joyhillvision.dothome.co.kr/ThisweekJubo"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 px-4 py-3.5 border-b border-gray-100 no-underline hover:bg-gray-100/60 transition-colors"
          >
            <span className="text-xl shrink-0">📖</span>
            <div className="flex-1">
              <p className="text-[13px] font-medium text-gray-800">청년부 온라인 주보</p>
              <p className="text-[11px] text-gray-500 mt-0.5">이번 주 주보를 온라인으로 보기</p>
            </div>
            <span className="text-gray-400 text-xs">→</span>
          </a>
          <a
            href="https://www.joyds.net/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 px-4 py-3.5 no-underline hover:bg-gray-100/60 transition-colors"
          >
            <span className="text-xl shrink-0">⛪</span>
            <div className="flex-1">
              <p className="text-[13px] font-medium text-gray-800">교회 홈페이지</p>
              <p className="text-[11px] text-gray-500 mt-0.5">JOY DS 교회 공식 홈페이지</p>
            </div>
            <span className="text-gray-400 text-xs">→</span>
          </a>
        </div>
      </div>

      <div className="px-5 mb-3">
        <div className="border border-gray-300 rounded-xl p-4">
          <p className="text-[13px] font-medium mb-2.5">예배 안내</p>
          {WORSHIP_INFOS.map((item, index) => (
            <div
              key={item.name}
              className={`flex justify-between py-1.5 ${
                index < WORSHIP_INFOS.length - 1 ? 'border-b border-gray-100' : ''
              }`}
            >
              <span className="text-[13px]">{item.name}</span>
              <span className="text-[13px] text-gray-500">
                {item.time} · {item.place}
              </span>
            </div>
          ))}
        </div>
      </div>

      <BottomNav />
    </div>
  )
}
