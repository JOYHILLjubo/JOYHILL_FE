import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import BottomNav from '../components/BottomNav'
import { useAuth } from '../context/AuthContext'

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/$/, '')

function buildApiUrl(path) {
  return `${API_BASE_URL}${path}`
}

function formatNoteDate(value) {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const weekday = new Intl.DateTimeFormat('ko-KR', { weekday: 'short' }).format(date)
  return `${year}.${month}.${day} (${weekday})`
}

function stripHtml(html) {
  if (!html) return ''
  // textContent는 <br>/블록 경계에 줄바꿈을 넣어주지 않아 줄들이 붙어버리므로 먼저 \n으로 치환
  const withBreaks = html.replace(/<br\s*\/?>/gi, '\n').replace(/<\/(div|p)>/gi, '\n')
  const div = document.createElement('div')
  div.innerHTML = withBreaks
  return div.textContent || div.innerText || ''
}

function parseChecklist(json) {
  if (!json) return []
  try {
    const parsed = JSON.parse(json)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function mapNote(item) {
  return {
    id: item?.id ?? null,
    noteDate: item?.noteDate ?? '',
    title: item?.title ?? '',
    content: item?.content ?? '',
    verseTags: item?.verseTags ?? '',
    checklistJson: item?.checklistJson ?? '',
    favorite: Boolean(item?.favorite),
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
  if (result.response.status === 403) return '설교노트를 조회할 권한이 없습니다.'
  return result.payload?.error?.message ?? fallbackMessage
}

async function requestTokenRefresh() {
  let storedRefreshToken = ''
  try {
    const raw = window.localStorage.getItem('joyhill.auth')
    storedRefreshToken = raw ? (JSON.parse(raw)?.refreshToken ?? '') : ''
  } catch { /* ignore */ }

  const result = await requestApi('/api/auth/refresh', {
    method: 'POST',
    headers: storedRefreshToken ? { 'X-Refresh-Token': storedRefreshToken } : {},
  })
  if (!result.response.ok || !result.payload?.success || !result.payload?.data?.accessToken) {
    throw new Error(getApiErrorMessage(result, '세션이 만료되었습니다. 다시 로그인해주세요.'))
  }

  const newRefreshToken = result.payload.data.refreshToken
  if (newRefreshToken) {
    try {
      const raw = window.localStorage.getItem('joyhill.auth')
      const parsed = raw ? JSON.parse(raw) : {}
      window.localStorage.setItem('joyhill.auth', JSON.stringify({ ...parsed, refreshToken: newRefreshToken }))
    } catch { /* ignore */ }
  }

  return result.payload.data.accessToken
}

function isSessionError(message) {
  return typeof message === 'string' && (message.includes('세션이 만료') || message.includes('다시 로그인'))
}

export default function SermonNoteListPage() {
  const navigate = useNavigate()
  const { accessToken, setAccessToken, logout } = useAuth()

  const [notes, setNotes] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [reloadKey, setReloadKey] = useState(0)
  const [searchQuery, setSearchQuery] = useState('')
  const [filter, setFilter] = useState('all') // 'all' | 'favorite' | 'month'

  const accessTokenRef = useRef(accessToken)
  useEffect(() => { accessTokenRef.current = accessToken }, [accessToken])

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
    if (!result.response.ok || !result.payload?.success) throw new Error(getApiErrorMessage(result, '요청을 처리하지 못했습니다.'))
    return result.payload.data
  }

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      setIsLoading(true)
      setLoadError('')
      try {
        const data = await callAuthedApi('/api/sermon-notes')
        if (cancelled) return
        setNotes(Array.isArray(data) ? data.map(mapNote) : [])
      } catch (error) {
        const message = error instanceof Error ? error.message : '설교노트를 불러오지 못했습니다.'
        if (isSessionError(message)) { handleExpiredSession(); return }
        if (!cancelled) { setLoadError(message); setNotes([]) }
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [reloadKey])

  const handleToggleFavorite = async (event, note) => {
    event.stopPropagation()
    try {
      const updated = await callAuthedApi(`/api/sermon-notes/${note.id}/favorite`, { method: 'PATCH' })
      setNotes((prev) => prev.map((n) => (n.id === note.id ? mapNote(updated) : n)))
    } catch {
      // 조용히 실패 — 다음 새로고침 시 실제 상태로 정정됨
    }
  }

  const favoriteCount = useMemo(() => notes.filter((n) => n.favorite).length, [notes])

  const filteredNotes = useMemo(() => {
    const keyword = searchQuery.trim().replace(/\s/g, '').toLowerCase()
    return notes.filter((note) => {
      if (filter === 'favorite' && !note.favorite) return false
      if (filter === 'month') {
        const now = new Date()
        const noteDate = new Date(note.noteDate)
        if (noteDate.getFullYear() !== now.getFullYear() || noteDate.getMonth() !== now.getMonth()) return false
      }
      if (!keyword) return true
      const haystack = `${note.title}${stripHtml(note.content)}${note.verseTags}`.replace(/\s/g, '').toLowerCase()
      return haystack.includes(keyword)
    })
  }, [notes, filter, searchQuery])

  return (
    <div style={{ paddingBottom: 'calc(80px + env(safe-area-inset-bottom, 0px))' }}>
      <div className="flex items-center gap-3 px-5 pt-4 pb-3 border-b border-gray-300">
        <button onClick={() => navigate('/my')} className="text-lg bg-transparent border-none cursor-pointer">←</button>
        <p className="text-base font-semibold flex-1">설교노트</p>
        <button
          onClick={() => navigate('/sermon-note/write')}
          className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-base font-semibold border-none cursor-pointer shadow-[0_4px_10px_rgba(66,133,244,0.35)]"
        >
          +
        </button>
      </div>

      <div className="px-5 pt-3">
        <input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="노트 검색 (내용, 말씀구절)"
          className="w-full bg-white rounded-full px-4 py-2.5 text-xs outline-none border border-gray-200 focus:border-primary"
        />
      </div>

      <div className="flex gap-2 px-5 pt-3 pb-2">
        <button
          onClick={() => setFilter('all')}
          className={`text-xs font-semibold px-3 py-1.5 rounded-full border-none cursor-pointer transition-colors ${filter === 'all' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-500'}`}
        >
          전체 {notes.length}
        </button>
        <button
          onClick={() => setFilter('favorite')}
          className={`text-xs font-semibold px-3 py-1.5 rounded-full border-none cursor-pointer transition-colors ${filter === 'favorite' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-500'}`}
        >
          ⭐ 즐겨찾기 {favoriteCount}
        </button>
        <button
          onClick={() => setFilter('month')}
          className={`text-xs font-semibold px-3 py-1.5 rounded-full border-none cursor-pointer transition-colors ${filter === 'month' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-500'}`}
        >
          이번 달
        </button>
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

      <div className="px-5 pt-1">
        {isLoading ? (
          <p className="text-sm text-gray-500 text-center mt-10">설교노트를 불러오는 중입니다.</p>
        ) : filteredNotes.length === 0 ? (
          <div className="text-center mt-14">
            <p className="text-sm text-gray-400">
              {notes.length === 0 ? '아직 작성한 노트가 없어요.' : '조건에 맞는 노트가 없어요.'}
            </p>
            {notes.length === 0 && (
              <button
                onClick={() => navigate('/sermon-note/write')}
                className="mt-3 text-xs text-primary bg-primary-light px-4 py-2 rounded-full border-none cursor-pointer"
              >
                첫 노트 쓰기
              </button>
            )}
          </div>
        ) : (
          filteredNotes.map((note) => {
            const checklist = parseChecklist(note.checklistJson)
            const doneCount = checklist.filter((c) => c.done).length
            const verseTags = note.verseTags ? note.verseTags.split(',').map((t) => t.trim()).filter(Boolean) : []
            const preview = stripHtml(note.content).replace(/\n{3,}/g, '\n\n').trim()

            return (
              <div
                key={note.id}
                onClick={() => navigate('/sermon-note/write', { state: { mode: 'edit', note } })}
                className="bg-white rounded-2xl p-4 mb-2.5 cursor-pointer shadow-[0_1px_1px_rgba(20,22,42,0.03),0_6px_16px_rgba(20,22,42,0.05)]"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] font-semibold text-primary">{formatNoteDate(note.noteDate)}</span>
                  <button
                    onClick={(e) => handleToggleFavorite(e, note)}
                    className="bg-transparent border-none cursor-pointer text-base leading-none"
                    style={{ color: note.favorite ? '#F5A524' : '#D8DAE6' }}
                  >
                    {note.favorite ? '★' : '☆'}
                  </button>
                </div>
                {note.title && <p className="text-[14.5px] font-bold mb-1">{note.title}</p>}
                {preview && (
                  <p className="text-[12.5px] text-gray-500 leading-relaxed line-clamp-2 whitespace-pre-line">{preview}</p>
                )}
                {(verseTags.length > 0 || checklist.length > 0) && (
                  <div className="flex gap-1.5 mt-2.5 flex-wrap">
                    {verseTags.map((tag) => (
                      <span key={tag} className="text-[10.5px] font-semibold px-2 py-1 rounded-full bg-primary-light text-primary">
                        📖 {tag}
                      </span>
                    ))}
                    {checklist.length > 0 && (
                      <span className="text-[10.5px] font-semibold px-2 py-1 rounded-full bg-success-light text-success">
                        적용 {doneCount}/{checklist.length} ✓
                      </span>
                    )}
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>

      <BottomNav />
    </div>
  )
}
