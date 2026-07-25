import { useEffect, useMemo, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/$/, '')

const COLOR_SWATCHES = [
  { label: '기본', value: '#14162A' },
  { label: '블루', value: '#3D5AFE' },
  { label: '레드', value: '#E5484D' },
  { label: '그린', value: '#12A150' },
  { label: '옐로우', value: '#F5A524' },
]

const HIGHLIGHT_COLOR = '#FFE58A'

function buildApiUrl(path) {
  return `${API_BASE_URL}${path}`
}

function todayDateString() {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
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

let checklistIdSeq = 0
function nextChecklistId() {
  checklistIdSeq += 1
  return `c${Date.now()}${checklistIdSeq}`
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
  if (result.response.status === 403) return result.payload?.error?.message ?? '권한이 없습니다.'
  if (result.response.status === 404) return result.payload?.error?.message ?? '노트를 찾을 수 없습니다.'
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

export default function SermonNoteWritePage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { accessToken, setAccessToken, logout } = useAuth()

  const editingNote = useMemo(
    () => (location.state?.mode === 'edit' ? location.state?.note : null),
    [location.state],
  )
  const isEdit = Boolean(editingNote?.id)

  // 어느 폴더 화면에서 들어왔는지(있다면) — 저장/삭제 후 그 화면으로 돌아가기 위해 기억해둠
  const hasFolderContext = Boolean(location.state?.folderId) || Boolean(location.state?.unclassified)
  const returnState = {
    folderId: location.state?.folderId ?? null,
    unclassified: Boolean(location.state?.unclassified),
    folderName: location.state?.folderName ?? null,
  }
  const goBackToList = () => {
    if (hasFolderContext) navigate('/sermon-note/notes', { state: returnState })
    else navigate('/sermon-note')
  }

  const [folders, setFolders] = useState([])
  const [selectedFolderId, setSelectedFolderId] = useState(() => {
    const initial = isEdit ? editingNote?.folderId : location.state?.folderId
    return initial ?? ''
  })

  const [title, setTitle] = useState(editingNote?.title ?? '')
  const [noteDate, setNoteDate] = useState(editingNote?.noteDate ?? todayDateString())
  const [verseTags, setVerseTags] = useState(() =>
    editingNote?.verseTags ? editingNote.verseTags.split(',').map((t) => t.trim()).filter(Boolean) : [],
  )
  const [showVerseInput, setShowVerseInput] = useState(false)
  const [verseInput, setVerseInput] = useState('')
  const [checklist, setChecklist] = useState(() => parseChecklist(editingNote?.checklistJson))
  const [editingChecklistId, setEditingChecklistId] = useState(null)
  const [favorite, setFavorite] = useState(Boolean(editingNote?.favorite))
  const [charCount, setCharCount] = useState(0)
  const [submitError, setSubmitError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const editorRef = useRef(null)
  const accessTokenRef = useRef(accessToken)
  accessTokenRef.current = accessToken

  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.innerHTML = editingNote?.content ?? ''
      setCharCount((editorRef.current.textContent || '').length)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

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
    callAuthedApi('/api/sermon-note-folders')
      .then((data) => { if (Array.isArray(data)) setFolders(data) })
      .catch(() => { /* 폴더 선택 없이도 저장 가능하므로 조용히 무시 */ })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const focusEditor = () => editorRef.current?.focus()

  const applyBold = () => { focusEditor(); document.execCommand('bold') }

  // 브라우저 색상 표기(hex/rgb 등)가 달라도 같은 색인지 비교하기 위해 표준 rgb 문자열로 정규화
  const colorsEqual = (a, b) => {
    if (!a || !b) return false
    const boxA = document.createElement('div')
    const boxB = document.createElement('div')
    boxA.style.color = a
    boxB.style.color = b
    document.body.appendChild(boxA)
    document.body.appendChild(boxB)
    const equal = getComputedStyle(boxA).color === getComputedStyle(boxB).color
    boxA.remove()
    boxB.remove()
    return equal
  }

  // 현재 커서/선택 영역이 이미 하이라이트된 상태인지 DOM을 직접 훑어서 확인
  // (execCommand('hiliteColor')는 브라우저마다 상태 조회가 불안정해서 신뢰할 수 없음)
  const selectionHasHighlight = () => {
    const sel = window.getSelection()
    if (!sel || sel.rangeCount === 0 || !editorRef.current) return false
    let node = sel.anchorNode
    if (node && node.nodeType === Node.TEXT_NODE) node = node.parentElement
    while (node && node !== editorRef.current) {
      const bg = node.style?.backgroundColor
      if (bg && bg !== 'transparent' && colorsEqual(bg, HIGHLIGHT_COLOR)) return true
      node = node.parentElement
    }
    return false
  }

  // Bold(applyBold)와 동일하게, 드래그로 선택한 범위에만 적용/해제된다.
  // 커서만 놓인 상태(선택 영역 없음)에서는 Bold와 마찬가지로 기존 텍스트를 건드리지 않는다 —
  // 예전에는 이 경우 커서가 속한 하이라이트 span 전체를 강제로 지웠는데, 그러면 드래그로 선택한 일부가 아니라
  // 그 span에 걸쳐 있던 하이라이트 전체(문장 전체 등)가 한번에 사라져버리는 문제가 있었다.
  const applyHighlight = () => {
    focusEditor()
    const isHighlighted = selectionHasHighlight()
    document.execCommand('hiliteColor', false, isHighlighted ? 'inherit' : HIGHLIGHT_COLOR)
  }

  const applyColor = (color) => { focusEditor(); document.execCommand('foreColor', false, color) }

  const handleEditorInput = () => {
    setCharCount((editorRef.current?.textContent || '').length)
    autoFormatListIfTriggered()
  }

  // 워드처럼 "- " / "* "를 줄 맨 앞에 치면 자동으로 글머리 목록으로 전환.
  // 번호("1. " 등)는 자동 변환하지 않음 — 브라우저 네이티브 <ol>로 바꾸면 항목마다
  // 번호를 브라우저가 직접 매기기 때문에, 사용자가 실제로 타이핑한 숫자(예: "5.")를 무시하고
  // 새 목록마다 1부터 다시 매기거나(줄바꿈 두 번 이상 후 목록이 끊기는 경우), Enter로 새 항목을
  // 만드는 처리(insertParagraph)가 얽히면서 뒤 문단과 내용이 합쳐지는 문제가 있었음.
  // 번호는 그냥 사용자가 입력한 텍스트 그대로 둔다.
  const autoFormatListIfTriggered = () => {
    const sel = window.getSelection()
    if (!sel || sel.rangeCount === 0 || !sel.isCollapsed) return
    const range = sel.getRangeAt(0)
    const node = range.startContainer
    if (node.nodeType !== Node.TEXT_NODE) return

    const textBeforeCursor = node.textContent.slice(0, range.startOffset)
    const isBullet = /^[-*]\s$/.test(textBeforeCursor)
    if (!isBullet) return

    node.textContent = node.textContent.slice(range.startOffset)
    const newRange = document.createRange()
    newRange.setStart(node, 0)
    newRange.collapse(true)
    sel.removeAllRanges()
    sel.addRange(newRange)

    document.execCommand('insertUnorderedList')
  }

  const isCursorInList = () =>
    document.queryCommandState('insertUnorderedList') || document.queryCommandState('insertOrderedList')

  // 일부 브라우저에서 contentEditable의 기본 Enter 동작(줄바꿈)이 씹히는 경우가 있어 직접 처리.
  // 목록 안에서는 insertParagraph를 써야 다음 항목 생성/빈 항목에서 목록 탈출이 정상 동작함.
  const handleEditorKeyDown = (e) => {
    if (e.key === 'Enter' && !e.nativeEvent.isComposing) {
      e.preventDefault()
      document.execCommand(isCursorInList() ? 'insertParagraph' : 'insertLineBreak')
      handleEditorInput()
    }
  }

  const handleAddVerse = () => {
    const trimmed = verseInput.trim()
    if (trimmed && !verseTags.includes(trimmed)) {
      setVerseTags((prev) => [...prev, trimmed])
    }
    setVerseInput('')
    setShowVerseInput(false)
  }

  const handleRemoveVerse = (tag) => {
    setVerseTags((prev) => prev.filter((t) => t !== tag))
  }

  const handleAddChecklistItem = () => {
    const id = nextChecklistId()
    setChecklist((prev) => [...prev, { id, text: '', done: false }])
    setEditingChecklistId(id)
  }

  const handleChecklistTextChange = (id, text) => {
    setChecklist((prev) => prev.map((item) => (item.id === id ? { ...item, text } : item)))
  }

  const handleChecklistTextCommit = (id) => {
    setChecklist((prev) => prev.filter((item) => item.id !== id || item.text.trim() !== ''))
    setEditingChecklistId(null)
  }

  const handleToggleChecklistDone = (id) => {
    setChecklist((prev) => prev.map((item) => (item.id === id ? { ...item, done: !item.done } : item)))
  }

  const handleRemoveChecklistItem = (id) => {
    setChecklist((prev) => prev.filter((item) => item.id !== id))
  }

  const handleBack = () => goBackToList()

  const handleDelete = async () => {
    if (!isEdit || isSubmitting) return
    if (!window.confirm('이 노트를 삭제할까요? 삭제하면 되돌릴 수 없어요.')) return
    setIsSubmitting(true)
    try {
      await callAuthedApi(`/api/sermon-notes/${editingNote.id}`, { method: 'DELETE' })
      if (hasFolderContext) navigate('/sermon-note/notes', { state: returnState, replace: true })
      else navigate('/sermon-note', { replace: true })
    } catch (error) {
      const message = error instanceof Error ? error.message : '삭제에 실패했습니다.'
      if (isSessionError(message)) { handleExpiredSession(); return }
      setSubmitError(message)
      setIsSubmitting(false)
    }
  }

  const handleSave = async () => {
    if (isSubmitting) return
    const content = editorRef.current?.innerHTML ?? ''
    const plainText = (editorRef.current?.textContent || '').trim()
    if (!plainText) { setSubmitError('노트 내용을 입력해주세요.'); return }

    setSubmitError('')
    setIsSubmitting(true)

    const requestBody = {
      noteDate,
      title: title.trim() || null,
      content,
      verseTags: verseTags.length ? verseTags.join(',') : null,
      checklistJson: checklist.length ? JSON.stringify(checklist.map(({ text, done }) => ({ text, done }))) : null,
      folderId: selectedFolderId === '' ? null : Number(selectedFolderId),
    }

    try {
      const savedNote = isEdit
        ? await callAuthedApi(`/api/sermon-notes/${editingNote.id}`, { method: 'PUT', body: requestBody })
        : await callAuthedApi('/api/sermon-notes', { method: 'POST', body: requestBody })

      if (Boolean(savedNote.favorite) !== favorite) {
        await callAuthedApi(`/api/sermon-notes/${savedNote.id}/favorite`, { method: 'PATCH' })
      }

      // 저장된 노트가 실제로 속하게 된 폴더 화면으로 돌아간다(중간에 폴더를 바꿨을 수도 있으므로).
      if (requestBody.folderId == null) {
        navigate('/sermon-note/notes', { state: { unclassified: true, folderName: '미분류' }, replace: true })
      } else {
        const matchedFolder = folders.find((f) => f.id === requestBody.folderId)
        navigate('/sermon-note/notes', { state: { folderId: requestBody.folderId, folderName: matchedFolder?.name ?? null }, replace: true })
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : '노트 저장에 실패했습니다.'
      if (isSessionError(message)) { handleExpiredSession(); return }
      setSubmitError(message)
      setIsSubmitting(false)
    }
  }

  return (
    <div style={{ paddingBottom: 'calc(96px + env(safe-area-inset-bottom, 0px))' }}>
      <div className="flex items-center gap-3 px-5 pt-4 pb-3 border-b border-gray-300">
        <button onClick={handleBack} className="text-lg bg-transparent border-none cursor-pointer">←</button>
        <p className="text-base font-semibold flex-1">{isEdit ? '노트 수정' : '노트 작성'}</p>
        <button
          onClick={() => setFavorite((prev) => !prev)}
          className="bg-transparent border-none cursor-pointer text-xl leading-none"
          style={{ color: favorite ? '#F5A524' : '#D8DAE6' }}
        >
          {favorite ? '★' : '☆'}
        </button>
      </div>

      <div className="px-5 pt-4">
        <input
          value={title}
          onChange={(e) => { setTitle(e.target.value); setSubmitError('') }}
          placeholder="제목 (선택)"
          className="w-full text-[19px] font-extrabold outline-none border-b border-gray-100 pb-3 mb-4 placeholder:text-gray-300 placeholder:font-bold"
        />

        <div className="flex items-center justify-between mb-3">
          <input
            type="date"
            value={noteDate}
            onChange={(e) => setNoteDate(e.target.value)}
            className="text-xs font-semibold bg-gray-100 rounded-full px-3.5 py-2 outline-none border-none"
            style={{ colorScheme: 'light' }}
          />
          {!showVerseInput && (
            <button
              onClick={() => setShowVerseInput(true)}
              className="text-xs font-semibold text-gray-400 border border-dashed border-gray-300 rounded-full px-3 py-1.5 bg-transparent cursor-pointer"
            >
              + 말씀구절
            </button>
          )}
        </div>

        <div className="mb-3">
          <select
            value={selectedFolderId}
            onChange={(e) => setSelectedFolderId(e.target.value)}
            className="text-xs font-semibold bg-gray-100 rounded-full pl-3.5 pr-2.5 py-2 outline-none border-none"
          >
            <option value="">📁 미분류</option>
            {folders.map((folder) => (
              <option key={folder.id} value={folder.id}>📁 {folder.name}</option>
            ))}
          </select>
        </div>

        {showVerseInput && (
          <div className="flex gap-2 mb-3">
            <input
              autoFocus
              value={verseInput}
              onChange={(e) => setVerseInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.nativeEvent.isComposing) handleAddVerse() }}
              placeholder="예) 예레미야 29:11"
              className="flex-1 text-xs border border-gray-300 rounded-full px-3.5 py-2 outline-none focus:border-primary"
            />
            <button onClick={handleAddVerse} className="text-xs font-semibold text-white bg-primary rounded-full px-3.5 py-2 border-none cursor-pointer">추가</button>
          </div>
        )}

        {verseTags.length > 0 && (
          <div className="flex gap-1.5 flex-wrap mb-3">
            {verseTags.map((tag) => (
              <span key={tag} className="inline-flex items-center gap-1.5 text-xs font-semibold bg-primary-light text-primary rounded-full pl-3 pr-2 py-1.5">
                📖 {tag}
                <button onClick={() => handleRemoveVerse(tag)} className="bg-transparent border-none cursor-pointer text-primary text-[11px] leading-none">✕</button>
              </span>
            ))}
          </div>
        )}

        <div className="flex items-center gap-1.5 bg-surface rounded-2xl p-2 mb-2.5 shadow-[0_1px_1px_rgba(20,22,42,0.03),0_4px_12px_rgba(20,22,42,0.05)]">
          <button onClick={applyBold} className="w-8 h-8 rounded-lg bg-gray-100 border-none cursor-pointer font-extrabold text-[13px]">B</button>
          <button onClick={applyHighlight} className="w-8 h-8 rounded-lg bg-gray-100 border-none cursor-pointer font-bold text-[13px]">H</button>
          <div className="w-px h-4 bg-gray-200 mx-1" />
          {COLOR_SWATCHES.map((swatch) => (
            <button
              key={swatch.value}
              onClick={() => applyColor(swatch.value)}
              title={swatch.label}
              className="w-[18px] h-[18px] rounded-full border-none cursor-pointer"
              style={{ backgroundColor: swatch.value }}
            />
          ))}
        </div>

        <div
          ref={editorRef}
          className="note-rich-editor bg-surface rounded-2xl p-4 text-sm leading-relaxed outline-none shadow-[0_1px_1px_rgba(20,22,42,0.03),0_6px_16px_rgba(20,22,42,0.05)]"
          style={{ minHeight: 180 }}
          contentEditable
          suppressContentEditableWarning
          data-placeholder="오늘 예배에서 느낀 점, 은혜받은 구절, 삶에 적용하고 싶은 부분을 자유롭게 적어보세요."
          onInput={handleEditorInput}
          onKeyDown={handleEditorKeyDown}
        />
        <p className="text-[11px] text-gray-400 text-right mt-1.5">{charCount}자</p>

        <div className="bg-surface rounded-2xl p-4 mt-3.5 shadow-[0_1px_1px_rgba(20,22,42,0.03),0_6px_16px_rgba(20,22,42,0.05)]">
          <div className="flex items-center justify-between mb-2.5">
            <p className="text-[13px] font-bold">적용할 점</p>
            <button onClick={handleAddChecklistItem} className="text-xs font-bold text-primary bg-transparent border-none cursor-pointer">+ 추가</button>
          </div>
          {checklist.length === 0 ? (
            <p className="text-xs text-gray-400 py-1">이번 주 실천할 항목을 추가해보세요.</p>
          ) : (
            checklist.map((item) => (
              <div key={item.id} className="flex items-start gap-2.5 py-1.5">
                <button
                  onClick={() => handleToggleChecklistDone(item.id)}
                  className={`w-[18px] h-[18px] rounded-md flex items-center justify-center text-[11px] font-black border-none cursor-pointer shrink-0 mt-0.5 ${item.done ? 'bg-primary text-white' : 'bg-surface border-[1.8px] border-gray-300'}`}
                >
                  {item.done ? '✓' : ''}
                </button>
                {editingChecklistId === item.id ? (
                  <input
                    autoFocus
                    value={item.text}
                    onChange={(e) => handleChecklistTextChange(item.id, e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter' && !e.nativeEvent.isComposing) handleChecklistTextCommit(item.id) }}
                    onBlur={() => handleChecklistTextCommit(item.id)}
                    placeholder="실천할 내용을 입력하세요"
                    className="flex-1 text-[13px] outline-none border-b border-gray-200"
                  />
                ) : (
                  <span
                    onClick={() => setEditingChecklistId(item.id)}
                    className={`flex-1 text-[13px] cursor-text ${item.done ? 'line-through text-gray-300' : ''}`}
                  >
                    {item.text}
                  </span>
                )}
                <button onClick={() => handleRemoveChecklistItem(item.id)} className="bg-transparent border-none cursor-pointer text-gray-300 text-xs shrink-0">✕</button>
              </div>
            ))
          )}
        </div>

        {submitError && <p className="text-[12px] text-danger pt-3">{submitError}</p>}

        {isEdit && (
          <button
            onClick={handleDelete}
            disabled={isSubmitting}
            className="w-full text-center text-xs text-danger bg-transparent border-none cursor-pointer pt-4 pb-1"
          >
            노트 삭제
          </button>
        )}
      </div>

      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] px-5 bg-surface border-t border-gray-300" style={{ paddingTop: '12px', paddingBottom: 'calc(12px + env(safe-area-inset-bottom, 0px))' }}>
        <button
          onClick={handleSave}
          disabled={isSubmitting}
          className={`w-full py-3.5 rounded-2xl text-sm font-bold border-none transition-colors ${
            isSubmitting ? 'bg-gray-300 text-white cursor-not-allowed' : 'bg-primary text-white cursor-pointer hover:bg-primary-hover'
          }`}
          style={!isSubmitting ? { boxShadow: '0 10px 24px rgba(66,133,244,0.35)' } : undefined}
        >
          {isSubmitting ? '저장 중...' : '저장하기'}
        </button>
      </div>
    </div>
  )
}
