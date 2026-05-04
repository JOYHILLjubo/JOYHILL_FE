import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import BottomNav from '../components/BottomNav'
import { useAuth } from '../context/AuthContext'

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/$/, '')

// 교역자 전용 기도 공간 식별자 (백엔드와 동일)
const PASTOR_FAM = '__pastor__'

const avatarColors = [
  { bg: 'bg-primary-light', text: 'text-primary' },
  { bg: 'bg-success-light', text: 'text-success' },
  { bg: 'bg-warning-light', text: 'text-warning' },
  { bg: 'bg-danger-light', text: 'text-danger' },
]

function buildApiUrl(path) {
  return `${API_BASE_URL}${path}`
}

function getWeekOfMonth(date) {
  const firstSunday = new Date(date.getFullYear(), date.getMonth(), 1)
  while (firstSunday.getDay() !== 0) {
    firstSunday.setDate(firstSunday.getDate() + 1)
  }
  const diff = Math.floor((date - firstSunday) / (7 * 24 * 60 * 60 * 1000))
  return diff + 1
}

function getCurrentWeekSelection() {
  const today = new Date()
  const day = today.getDay()
  const sunday = new Date(today)
  sunday.setDate(today.getDate() - day)
  return {
    year: sunday.getFullYear(),
    month: sunday.getMonth() + 1,
    week: getWeekOfMonth(sunday),
  }
}

function getWeeksForYear(year) {
  const weeks = []
  for (let month = 1; month <= 12; month += 1) {
    const lastDay = new Date(year, month, 0)
    const maxWeek = Math.max(1, getWeekOfMonth(lastDay))
    for (let week = 1; week <= maxWeek; week += 1) {
      weeks.push({ year, month, week, label: `${month}월 ${week}주차` })
    }
  }
  return weeks
}

function getColor(id) {
  return avatarColors[Math.abs(Number(id) || 0) % avatarColors.length]
}

function getInitial(name) {
  const trimmed = String(name ?? '').trim()
  return trimmed ? trimmed[0] : 'N'
}

function normalizePrayer(item, currentUser) {
  return {
    id: item?.id ?? null,
    userId: item?.userId ?? null,
    name:
      item?.name ||
      (item?.userId === currentUser?.id ? currentUser.name : '') ||
      `교역자 ${item?.userId ?? ''}`.trim(),
    content: item?.content ?? '',
    type: item?.type ?? '',
    year: item?.year ?? null,
    month: item?.month ?? null,
    week: item?.week ?? null,
    famName: item?.famName ?? '',
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
    throw new Error('백엔드 서버에 연결할 수 없습니다.')
  }
  const payload = await response.json().catch(() => null)
  return { response, payload }
}

function getApiErrorMessage(result, fallbackMessage) {
  if (result.response.status === 401) return '세션이 만료되었습니다. 다시 로그인해주세요.'
  if (result.response.status === 403) return result.payload?.error?.message ?? '기도제목을 조회할 권한이 없습니다.'
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

export default function PrayerPageConnected() {
  const navigate = useNavigate()
  const { user, accessToken, setAccessToken, logout, isLeaderOrAbove } = useAuth()

  const isPastor = user?.role === 'pastor'
  const isAdmin = user?.role === 'admin'

  // 관리자는 기도 페이지 접근 불가
  useEffect(() => {
    if (isAdmin) navigate('/home', { replace: true })
  }, [isAdmin, navigate])

  // 교역자는 __pastor__ 공간 사용, 그 외는 본인 팸
  const effectiveFamName = isPastor ? PASTOR_FAM : (user?.fam ?? '')

  const [selectedWeek, setSelectedWeek] = useState(getCurrentWeekSelection)
  const [showWeekPicker, setShowWeekPicker] = useState(false)
  const [monthlyPrayers, setMonthlyPrayers] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [pageError, setPageError] = useState('')
  const [reloadKey, setReloadKey] = useState(0)

  const accessTokenRef = useRef(accessToken)
  useEffect(() => { accessTokenRef.current = accessToken }, [accessToken])

  const weekOptions = useMemo(() => getWeeksForYear(selectedWeek.year), [selectedWeek.year])

  const personalPrayers = useMemo(() => {
    const byUser = new Map()
    monthlyPrayers
      .filter((p) => p.type === 'personal' && p.week === selectedWeek.week)
      .forEach((p) => {
        const key = p.userId ?? `guest-${p.id}`
        const existing = byUser.get(key)
        if (!existing || Number(p.id ?? 0) > Number(existing.id ?? 0)) byUser.set(key, p)
      })
    return [...byUser.values()].sort((a, b) => {
      if (a.userId === user?.id) return -1
      if (b.userId === user?.id) return 1
      return String(a.name).localeCompare(String(b.name), 'ko')
    })
  }, [monthlyPrayers, selectedWeek.week, user?.id])

  const commonPrayer = useMemo(() => {
    return monthlyPrayers.find(
      (p) => p.type === 'common' && p.month === selectedWeek.month && p.year === selectedWeek.year
    ) ?? null
  }, [monthlyPrayers, selectedWeek.month, selectedWeek.year])

  const myPrayer = useMemo(() => {
    return personalPrayers.find((p) => p.userId === user?.id) ?? null
  }, [personalPrayers, user?.id])

  const handleExpiredSession = () => { logout(); navigate('/login', { replace: true }) }

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

  useEffect(() => {
    if (isAdmin) return
    let cancelled = false
    const loadPrayers = async () => {
      // 교역자는 famName 없어도 __pastor__ 공간 조회
      if (!isPastor && !effectiveFamName) {
        setPageError('소속 팸 정보가 없어 기도제목을 불러올 수 없습니다.')
        setMonthlyPrayers([])
        setIsLoading(false)
        return
      }
      setIsLoading(true)
      setPageError('')
      try {
        // 교역자는 famName 파라미터 불필요 (백엔드에서 role 기반으로 처리)
        const params = new URLSearchParams({
          ...(isPastor ? {} : { famName: effectiveFamName }),
          year: String(selectedWeek.year),
          month: String(selectedWeek.month),
        })
        const data = await callAuthedApi(`/api/prayers?${params.toString()}`)
        if (cancelled) return
        setMonthlyPrayers(Array.isArray(data) ? data.map((item) => normalizePrayer(item, user)) : [])
      } catch (error) {
        const message = error instanceof Error ? error.message : '기도제목을 불러오지 못했습니다.'
        if (isSessionError(message)) { handleExpiredSession(); return }
        if (!cancelled) { setPageError(message); setMonthlyPrayers([]) }
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }
    loadPrayers()
    return () => { cancelled = true }
  }, [effectiveFamName, selectedWeek.year, selectedWeek.month, reloadKey, isPastor, isAdmin])

  if (isAdmin) return null

  const pageTitle = isPastor ? '교역자 기도제목' : '팸 기도제목'
  const pageSubtitle = isPastor ? '교역자 · 부장 공유' : (user?.fam || '소속 팸 없음')

  return (
    <div style={{ paddingBottom: 'calc(80px + env(safe-area-inset-bottom, 0px))' }}>
      <div className="px-5 pt-6 pb-3">
        <p className="text-lg font-semibold">{pageTitle}</p>
        <p className="text-xs text-gray-500 mt-0.5">{pageSubtitle}</p>
      </div>

      {/* 주차 선택 */}
      <div className="px-5 mb-3">
        <button
          onClick={() => setShowWeekPicker((prev) => !prev)}
          className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg text-sm border-none cursor-pointer w-full justify-between"
        >
          <span className="font-medium">{selectedWeek.month}월 {selectedWeek.week}주차</span>
          <span className="text-gray-500 text-xs">{showWeekPicker ? '닫기' : '선택'}</span>
        </button>
        {showWeekPicker && (
          <div className="mt-1 border border-gray-300 rounded-lg bg-white max-h-48 overflow-y-auto">
            {weekOptions.map((option) => {
              const isSelected = option.year === selectedWeek.year && option.month === selectedWeek.month && option.week === selectedWeek.week
              return (
                <button
                  key={`${option.year}-${option.month}-${option.week}`}
                  onClick={() => { setSelectedWeek({ year: option.year, month: option.month, week: option.week }); setShowWeekPicker(false) }}
                  className={`w-full text-left px-3 py-2.5 text-sm border-none cursor-pointer border-b border-gray-300 last:border-b-0 ${isSelected ? 'bg-primary-light text-primary font-medium' : 'bg-white hover:bg-gray-100'}`}
                >
                  {option.label}
                </button>
              )
            })}
          </div>
        )}
      </div>

      {pageError && (
        <div className="px-5 mb-4">
          <div className="bg-danger-light rounded-2xl p-4">
            <p className="text-sm text-danger">{pageError}</p>
            <button onClick={() => setReloadKey((prev) => prev + 1)} className="mt-3 text-xs text-danger bg-white px-4 py-2 rounded-full border-none cursor-pointer">다시 시도</button>
          </div>
        </div>
      )}

      {/* 공동 기도제목 — 팸원/리더/마을장만 표시 (교역자는 없음) */}
      {!isPastor && (
        <div className="px-5 mb-4">
          <div className="bg-primary-light rounded-xl p-4">
            <div className="flex justify-between items-start mb-1">
              <p className="text-[13px] font-semibold text-primary-hover">{selectedWeek.month}월 공동 기도제목</p>
              {isLeaderOrAbove && (
                <button
                  onClick={() => navigate(`/prayer/common/write?year=${selectedWeek.year}&month=${selectedWeek.month}${commonPrayer ? '&edit=true' : ''}`)}
                  className="text-[11px] text-primary-hover bg-white px-2 py-1 rounded-full border border-primary-hover cursor-pointer hover:bg-white/80 transition-colors shrink-0 ml-2"
                >
                  {commonPrayer ? '수정하기' : '작성하기'}
                </button>
              )}
            </div>
            {isLoading ? (
              <p className="text-[13px] text-primary-hover opacity-70 mt-1">공동 기도제목을 불러오는 중입니다.</p>
            ) : commonPrayer?.content ? (
              <p className="text-[13px] leading-relaxed">{commonPrayer.content}</p>
            ) : (
              <p className="text-[13px] text-primary-hover opacity-60 mt-1">아직 이번 달 공동 기도제목이 등록되지 않았습니다.</p>
            )}
          </div>
        </div>
      )}

      {/* 개인 기도제목 */}
      <div className="px-5">
        <p className="text-sm font-semibold mb-2">개인 기도제목</p>
        {isLoading ? (
          <div className="text-center py-10 text-gray-500 text-sm">기도제목을 불러오는 중입니다.</div>
        ) : personalPrayers.length === 0 ? (
          <div className="text-center py-10 text-gray-500 text-sm">이 주차에 등록된 개인 기도제목이 없습니다.</div>
        ) : (
          personalPrayers.map((prayer) => {
            const color = getColor(prayer.id)
            return (
              <div key={prayer.id} className="flex items-start gap-2 py-3 border-b border-gray-300 last:border-b-0">
                <div className={`w-7 h-7 rounded-full ${color.bg} flex items-center justify-center text-[11px] font-medium ${color.text} shrink-0 mt-0.5`}>
                  {getInitial(prayer.name)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[17px] font-medium">
                    {prayer.name || '이름 없음'}
                    {prayer.userId === user?.id && <span className="ml-1 text-[11px] text-primary">(나)</span>}
                  </p>
                  <p className="text-[13px] mt-0.5 leading-relaxed">{prayer.content}</p>
                </div>
              </div>
            )
          })
        )}

        <button
          onClick={() => {
            const path = `/prayer/write?year=${selectedWeek.year}&month=${selectedWeek.month}&week=${selectedWeek.week}`
            if (myPrayer) {
              navigate(path, { state: { mode: 'edit', prayer: myPrayer } })
              return
            }
            navigate(path)
          }}
          className="w-full mt-4 py-2.5 border border-gray-300 rounded-lg text-[13px] text-primary bg-white cursor-pointer hover:bg-primary-light transition-colors"
        >
          + 내 기도제목 작성하기
        </button>
      </div>

      <BottomNav />
    </div>
  )
}
