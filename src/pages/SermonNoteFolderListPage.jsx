import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FolderPlus, Plus, Folder, Inbox, Library, Pencil, X } from 'lucide-react'
import BottomNav from '../components/BottomNav'
import { useAuth } from '../context/AuthContext'

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/$/, '')

function buildApiUrl(path) {
  return `${API_BASE_URL}${path}`
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
  if (result.response.status === 403) return '권한이 없습니다.'
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

export default function SermonNoteFolderListPage() {
  const navigate = useNavigate()
  const { accessToken, setAccessToken, logout } = useAuth()

  const [folders, setFolders] = useState([])
  const [unclassifiedCount, setUnclassifiedCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [reloadKey, setReloadKey] = useState(0)

  const [modalMode, setModalMode] = useState(null) // null | 'create' | { id, name } for edit
  const [folderNameInput, setFolderNameInput] = useState('')
  const [modalError, setModalError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

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
        const [folderData, unclassifiedData] = await Promise.all([
          callAuthedApi('/api/sermon-note-folders'),
          callAuthedApi('/api/sermon-note-folders/unclassified-count'),
        ])
        if (cancelled) return
        setFolders(Array.isArray(folderData) ? folderData : [])
        setUnclassifiedCount(Number(unclassifiedData) || 0)
      } catch (error) {
        const message = error instanceof Error ? error.message : '폴더를 불러오지 못했습니다.'
        if (isSessionError(message)) { handleExpiredSession(); return }
        if (!cancelled) setLoadError(message)
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reloadKey])

  const totalCount = folders.reduce((sum, f) => sum + (f.noteCount ?? 0), 0) + unclassifiedCount

  const openCreateModal = () => {
    setModalMode('create')
    setFolderNameInput('')
    setModalError('')
  }

  const openEditModal = (folder) => {
    setModalMode(folder)
    setFolderNameInput(folder.name)
    setModalError('')
  }

  const closeModal = () => {
    if (isSubmitting) return
    setModalMode(null)
  }

  const handleSubmitModal = async () => {
    const name = folderNameInput.trim()
    if (!name) { setModalError('폴더 이름을 입력해주세요.'); return }
    setIsSubmitting(true)
    setModalError('')
    try {
      if (modalMode === 'create') {
        await callAuthedApi('/api/sermon-note-folders', { method: 'POST', body: { name } })
      } else {
        await callAuthedApi(`/api/sermon-note-folders/${modalMode.id}`, { method: 'PUT', body: { name } })
      }
      setModalMode(null)
      setReloadKey((prev) => prev + 1)
    } catch (error) {
      const message = error instanceof Error ? error.message : '저장에 실패했습니다.'
      if (isSessionError(message)) { handleExpiredSession(); return }
      setModalError(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteFolder = async (folder) => {
    if (!window.confirm(`'${folder.name}' 폴더를 삭제할까요? 안의 노트는 삭제되지 않고 미분류로 이동해요.`)) return
    try {
      await callAuthedApi(`/api/sermon-note-folders/${folder.id}`, { method: 'DELETE' })
      setReloadKey((prev) => prev + 1)
    } catch (error) {
      const message = error instanceof Error ? error.message : '폴더 삭제에 실패했습니다.'
      if (isSessionError(message)) { handleExpiredSession(); return }
      window.alert(message)
    }
  }

  const goToNotes = (params) => navigate('/sermon-note/notes', { state: params })

  return (
    <div style={{ paddingBottom: 'calc(96px + env(safe-area-inset-bottom, 0px))' }}>
      <div className="flex items-center gap-3 px-5 pt-4 pb-3 border-b border-gray-300">
        <button onClick={() => navigate('/my')} className="text-lg bg-transparent border-none cursor-pointer">←</button>
        <p className="text-base font-semibold flex-1">설교노트</p>
        <button
          onClick={openCreateModal}
          title="폴더 추가"
          className="w-9 h-9 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center border-none cursor-pointer"
        >
          <FolderPlus size={18} strokeWidth={2} />
        </button>
        <button
          onClick={() => navigate('/sermon-note/write')}
          title="노트 추가"
          className="w-9 h-9 rounded-full bg-primary text-white flex items-center justify-center border-none cursor-pointer shadow-[0_4px_10px_rgba(66,133,244,0.35)]"
        >
          <Plus size={20} strokeWidth={2.5} />
        </button>
      </div>

      {loadError && (
        <div className="px-5 pt-3">
          <div className="bg-danger-light rounded-2xl p-4">
            <p className="text-sm text-danger">{loadError}</p>
            <button
              onClick={() => setReloadKey((prev) => prev + 1)}
              className="mt-3 text-xs text-danger bg-surface px-4 py-2 rounded-full border-none cursor-pointer"
            >
              다시 시도
            </button>
          </div>
        </div>
      )}

      <div className="px-5 pt-3">
        {isLoading ? (
          <p className="text-sm text-gray-500 text-center mt-10">폴더를 불러오는 중입니다.</p>
        ) : (
          <>
            <div
              onClick={() => goToNotes({})}
              className="bg-surface rounded-2xl p-4 mb-2.5 cursor-pointer shadow-[0_1px_1px_rgba(20,22,42,0.03),0_6px_16px_rgba(20,22,42,0.05)] flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-primary-light flex items-center justify-center shrink-0">
                  <Library size={17} strokeWidth={2} className="text-primary" />
                </div>
                <span className="text-sm font-bold">전체</span>
              </div>
              <span className="text-xs text-gray-400">{totalCount}개</span>
            </div>

            {folders.map((folder) => (
              <div
                key={folder.id}
                onClick={() => goToNotes({ folderId: folder.id, folderName: folder.name })}
                className="bg-surface rounded-2xl p-4 mb-2.5 cursor-pointer shadow-[0_1px_1px_rgba(20,22,42,0.03),0_6px_16px_rgba(20,22,42,0.05)] flex items-center justify-between"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-primary-light flex items-center justify-center shrink-0">
                    <Folder size={17} strokeWidth={2} className="text-primary" />
                  </div>
                  <span className="text-sm font-bold truncate">{folder.name}</span>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <span className="text-xs text-gray-400 mr-1">{folder.noteCount}개</span>
                  <button
                    onClick={(e) => { e.stopPropagation(); openEditModal(folder) }}
                    className="w-7 h-7 rounded-full bg-transparent border-none cursor-pointer text-gray-300 flex items-center justify-center hover:bg-gray-100"
                  >
                    <Pencil size={14} strokeWidth={2} />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDeleteFolder(folder) }}
                    className="w-7 h-7 rounded-full bg-transparent border-none cursor-pointer text-gray-300 flex items-center justify-center hover:bg-gray-100"
                  >
                    <X size={14} strokeWidth={2} />
                  </button>
                </div>
              </div>
            ))}

            <div
              onClick={() => goToNotes({ unclassified: true, folderName: '미분류' })}
              className="bg-surface rounded-2xl p-4 mb-2.5 cursor-pointer shadow-[0_1px_1px_rgba(20,22,42,0.03),0_6px_16px_rgba(20,22,42,0.05)] flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center shrink-0">
                  <Inbox size={17} strokeWidth={2} className="text-gray-400" />
                </div>
                <span className="text-sm font-bold text-gray-500">미분류</span>
              </div>
              <span className="text-xs text-gray-400">{unclassifiedCount}개</span>
            </div>

            {folders.length === 0 && (
              <p className="text-xs text-gray-400 text-center mt-4 flex items-center justify-center gap-1">
                <FolderPlus size={13} strokeWidth={2} className="inline" /> 버튼으로 노트를 정리해보세요.
              </p>
            )}
          </>
        )}
      </div>

      {modalMode && (
        <div
          className="fixed inset-0 bg-black/40 z-[60] flex items-end justify-center"
          onClick={closeModal}
        >
          <div
            className="bg-surface rounded-t-2xl w-full max-w-[430px] p-5"
            style={{ paddingBottom: 'calc(24px + env(safe-area-inset-bottom, 0px))' }}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <p className="text-base font-medium">{modalMode === 'create' ? '폴더 추가' : '폴더 이름 수정'}</p>
              <button onClick={closeModal} className="text-gray-500 text-lg bg-transparent border-none cursor-pointer">×</button>
            </div>

            <input
              autoFocus
              value={folderNameInput}
              onChange={(e) => { setFolderNameInput(e.target.value); setModalError('') }}
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.nativeEvent.isComposing) handleSubmitModal() }}
              placeholder="폴더 이름 (예: 주일예배, 새벽기도)"
              maxLength={50}
              disabled={isSubmitting}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-primary"
            />
            {modalError && <p className="text-xs text-danger mt-2">{modalError}</p>}

            <button
              onClick={handleSubmitModal}
              disabled={isSubmitting}
              className="w-full mt-4 py-3 rounded-2xl text-sm font-bold text-white bg-primary border-none cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? '저장 중...' : '저장'}
            </button>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  )
}
