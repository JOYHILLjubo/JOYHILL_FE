import { useEffect, useMemo, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Folder, BookOpen } from 'lucide-react'
import VersePickerSheet from '../components/VersePickerSheet'
import { useAuth } from '../context/AuthContext'

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/$/, '')

// '기본'은 고정 색상이 아니라 테마 기본 텍스트색으로 리셋하는 항목이라 value가 없다
// (라이트 전용 hex를 박아두면 다크모드에서 어두운 배경 위에 어두운 글자가 겹쳐 안 보이게 됨).
const COLOR_SWATCHES = [
  { label: '기본', value: null },
  { label: '블루', value: '#3D5AFE' },
  { label: '레드', value: '#E5484D' },
  { label: '그린', value: '#12A150' },
  { label: '옐로우', value: '#F5A524' },
]

const HIGHLIGHT_COLOR = '#FFE58A'

// 줄/블록 판정에 쓰는 태그들 (이 에디터에서 실제로 생길 수 있는 블록만)
const BLOCK_TAGS = new Set(['DIV', 'LI', 'P', 'BLOCKQUOTE'])

// 브라우저마다 색 표기(#hex / rgb() / 색이름)가 달라서 실제 계산된 rgb 문자열로 맞춘 뒤 비교한다.
// 이 비교는 커서가 움직일 때마다(selectionchange) 호출되는데, 예전엔 호출할 때마다 div를 두 개씩
// 만들어 body에 붙였다 떼면서 스타일 재계산을 강제로 일으켰다 — 한 글자 칠 때마다 열 번 넘게
// 일어나 타이핑이 눈에 띄게 버벅였다. probe 하나를 재사용하고 결과를 캐시해서 비용을 없앤다.
const colorCache = new Map()
let colorProbe = null
function normalizeColor(value) {
  if (!value) return ''
  const cached = colorCache.get(value)
  if (cached !== undefined) return cached
  if (!colorProbe) {
    colorProbe = document.createElement('div')
    colorProbe.style.cssText = 'position:absolute;left:-9999px;top:0;width:0;height:0;pointer-events:none'
    document.body.appendChild(colorProbe)
  }
  colorProbe.style.color = ''
  colorProbe.style.color = value
  const normalized = window.getComputedStyle(colorProbe).color
  colorCache.set(value, normalized)
  return normalized
}

function colorsEqual(a, b) {
  if (!a || !b) return false
  return normalizeColor(a) === normalizeColor(b)
}

// 에디터가 스스로 만들어내는 서식만 남기고 나머지는 걷어낸다.
// 이게 필요한 이유가 두 가지 있다:
//  1) 브라우저 기본 편집 동작(특히 목록 경계에서의 백스페이스)이 font-family·letter-spacing을
//     하드코딩한 <span>을 본문에 끼워 넣는다 — 저장 데이터가 계속 오염된다.
//  2) 밖(카톡·웹)에서 복사해 붙여넣으면 남의 색·배경·폰트가 그대로 들어와서, 다크/세피아 테마에서
//     글자가 배경과 겹쳐 안 보이게 된다.
// 색은 툴바 스와치에 있는 값과 하이라이트 색만 통과시킨다. 그 외(붙여넣은 검정, "기본" 색을
// 적용할 때 박히는 그 순간의 테마 텍스트색 등)는 지워서 테마 색을 그대로 상속받게 한다.
const SANITIZE_ALLOWED_TAGS = new Set(['B', 'STRONG', 'I', 'EM', 'U', 'SPAN', 'FONT', 'BR', 'UL', 'OL', 'LI', 'DIV', 'P'])
const SANITIZE_KEEP_ATTRS = new Set(['start'])

function isAllowedTextColor(value) {
  return COLOR_SWATCHES.some((swatch) => swatch.value && colorsEqual(value, swatch.value))
}

// 이 노드가 속한 "블록" — 에디터 루트이거나, 목록을 빠져나올 때 생기는 <div>/<li> 같은 중간 블록.
// ── 자동 임시저장(로컬) ─────────────────────────────────────────────────────
// 서버에 바로 쓰지 않고 이 기기에만 저장한다. 서버 자동저장은 아직 저장 버튼을 누르지 않은
// 노트까지 목록에 만들어버려서(그리고 모바일 네트워크에서 계속 실패/재시도가 생겨서) 이 앱 규모엔
// 과하다. 여기서 막고 싶은 건 "쓰다가 뒤로 가기/앱이 꺼져서 통째로 날아가는" 상황이고, 그건 로컬
// 저장으로 충분히 해결된다.
const DRAFT_KEY_PREFIX = 'joyhill.sermonNoteDraft'
const DRAFT_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000

function readDraft(key) {
  try {
    const raw = window.localStorage.getItem(key)
    if (!raw) return null
    const draft = JSON.parse(raw)
    if (!draft || typeof draft !== 'object' || !draft.savedAt) return null
    // 너무 오래된 임시저장은 오히려 헷갈리게 만든다 — 조용히 버린다
    if (Date.now() - draft.savedAt > DRAFT_MAX_AGE_MS) {
      window.localStorage.removeItem(key)
      return null
    }
    return draft
  } catch {
    return null
  }
}

function draftHasContent(draft) {
  const probe = document.createElement('div')
  probe.innerHTML = draft?.content ?? ''
  return (probe.textContent || '').trim().length > 0 || Boolean(draft?.title?.trim())
}

function formatDraftTime(timestamp) {
  const date = new Date(timestamp)
  const hours = date.getHours()
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const hour12 = hours % 12 === 0 ? 12 : hours % 12
  return `${hours < 12 ? '오전' : '오후'} ${hour12}:${minutes}`
}

function escapeHtml(value) {
  const div = document.createElement('div')
  div.textContent = value ?? ''
  return div.innerHTML
}

function closestBlock(node, editor) {
  let el = node.nodeType === Node.TEXT_NODE ? node.parentElement : node
  while (el && el !== editor && !BLOCK_TAGS.has(el.nodeName)) el = el.parentElement
  return el ?? editor
}

function sanitizeEditorHtml(html) {
  if (!html) return ''
  const root = document.createElement('div')
  root.innerHTML = html

  const walk = (parent) => {
    Array.from(parent.childNodes).forEach((child) => {
      if (child.nodeType === Node.TEXT_NODE) return
      if (child.nodeType !== Node.ELEMENT_NODE) { child.remove(); return }

      // 허용 목록에 없는 태그(img/table/script/h1 등)는 껍데기만 벗기고 내용은 살린다
      if (!SANITIZE_ALLOWED_TAGS.has(child.nodeName)) {
        walk(child)
        while (child.firstChild) parent.insertBefore(child.firstChild, child)
        child.remove()
        return
      }

      const textColor = child.style?.getPropertyValue('color') || child.getAttribute?.('color') || ''
      const background = child.style?.getPropertyValue('background-color') || ''
      const keptStyles = []
      if (textColor && isAllowedTextColor(textColor)) keptStyles.push(`color: ${textColor}`)
      if (background && colorsEqual(background, HIGHLIGHT_COLOR)) keptStyles.push(`background-color: ${background}`)

      Array.from(child.attributes).forEach((attr) => {
        if (!SANITIZE_KEEP_ATTRS.has(attr.name)) child.removeAttribute(attr.name)
      })
      if (keptStyles.length) child.setAttribute('style', keptStyles.join('; '))

      walk(child)

      // 내용이 통째로 빠져나가 껍데기만 남은 인라인 태그(<b></b> 등)와,
      // 서식이 하나도 안 남은 span/font는 정리한다.
      const isInlineWrapper = child.nodeName !== 'BR' && !BLOCK_TAGS.has(child.nodeName)
      if (isInlineWrapper && child.childNodes.length === 0) {
        child.remove()
      } else if ((child.nodeName === 'SPAN' || child.nodeName === 'FONT') && !child.getAttribute('style')) {
        while (child.firstChild) parent.insertBefore(child.firstChild, child)
        child.remove()
      }
    })
  }

  walk(root)
  return root.innerHTML
}

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
  const [showVersePicker, setShowVersePicker] = useState(false)
  const [checklist, setChecklist] = useState(() => parseChecklist(editingNote?.checklistJson))
  const [editingChecklistId, setEditingChecklistId] = useState(null)
  const [favorite, setFavorite] = useState(Boolean(editingNote?.favorite))
  const [charCount, setCharCount] = useState(0)
  const [submitError, setSubmitError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [draftSavedAt, setDraftSavedAt] = useState(null)
  const [draftRestoredAt, setDraftRestoredAt] = useState(null)

  // 수정 중인 노트는 노트별로, 새 노트는 하나의 키로 임시저장한다
  const draftKey = isEdit ? `${DRAFT_KEY_PREFIX}.${editingNote.id}` : `${DRAFT_KEY_PREFIX}.new`

  const editorRef = useRef(null)
  const accessTokenRef = useRef(accessToken)
  accessTokenRef.current = accessToken

  const draftTimerRef = useRef(0)
  const draftMountedRef = useRef(false)

  const clearDraft = () => {
    try { window.localStorage.removeItem(draftKey) } catch { /* ignore */ }
    if (draftTimerRef.current) { window.clearTimeout(draftTimerRef.current); draftTimerRef.current = 0 }
  }

  const writeDraft = () => {
    const editor = editorRef.current
    if (!editor) return
    const isEmpty = (editor.textContent || '').trim().length === 0 && !title.trim()
    try {
      if (isEmpty) { window.localStorage.removeItem(draftKey); setDraftSavedAt(null); return }
      const savedAt = Date.now()
      window.localStorage.setItem(draftKey, JSON.stringify({
        savedAt,
        title,
        noteDate,
        favorite,
        folderId: selectedFolderId,
        verseTags,
        checklist,
        content: editor.innerHTML,
      }))
      setDraftSavedAt(savedAt)
    } catch {
      // 저장공간이 꽉 찼거나 사파리 시크릿 모드 — 자동 저장만 조용히 포기하고 본 저장은 그대로 동작
    }
  }

  // 타이핑이 잠깐 멈출 때마다 저장한다(글자마다 저장하면 그 자체로 입력이 밀린다)
  const scheduleDraftSave = () => {
    if (draftTimerRef.current) window.clearTimeout(draftTimerRef.current)
    draftTimerRef.current = window.setTimeout(() => {
      draftTimerRef.current = 0
      writeDraft()
    }, 800)
  }

  const applyNoteToForm = (source) => {
    setTitle(source.title ?? '')
    setNoteDate(source.noteDate || todayDateString())
    setVerseTags(source.verseTags ?? [])
    setChecklist(source.checklist ?? [])
    setFavorite(Boolean(source.favorite))
    setSelectedFolderId(source.folderId ?? '')
  }

  // 임시저장을 버리고 서버에 저장돼 있던(=이 화면에 들어올 때의) 내용으로 되돌린다.
  // 되돌리면 복구했던 내용은 영영 못 살리므로 반드시 한 번 물어본다.
  const handleDiscardDraft = () => {
    const message = isEdit
      ? '불러온 내용을 버리고 저장돼 있던 노트로 되돌릴까요? 되돌리면 다시 살릴 수 없어요.'
      : '불러온 내용을 버리고 처음부터 새로 쓸까요? 버리면 다시 살릴 수 없어요.'
    if (!window.confirm(message)) return
    clearDraft()
    setDraftRestoredAt(null)
    setDraftSavedAt(null)
    const editor = editorRef.current
    if (editor) {
      editor.innerHTML = sanitizeEditorHtml(editingNote?.content ?? '')
      setCharCount((editor.textContent || '').length)
    }
    applyNoteToForm({
      title: editingNote?.title ?? '',
      noteDate: editingNote?.noteDate ?? todayDateString(),
      verseTags: editingNote?.verseTags
        ? editingNote.verseTags.split(',').map((t) => t.trim()).filter(Boolean)
        : [],
      checklist: parseChecklist(editingNote?.checklistJson),
      favorite: Boolean(editingNote?.favorite),
      folderId: (isEdit ? editingNote?.folderId : location.state?.folderId) ?? '',
    })
  }

  useEffect(() => {
    const editor = editorRef.current
    if (!editor) return
    // 예전에 저장된 노트에는 브라우저가 끼워 넣은 폰트/자간 span이나 밖에서 붙여넣은 색이
    // 남아있을 수 있다 — 열 때 한 번 걸러서 다음 저장 때 깨끗해지게 한다.
    const serverContent = sanitizeEditorHtml(editingNote?.content ?? '')
    const draft = readDraft(draftKey)

    if (draft && draftHasContent(draft) && sanitizeEditorHtml(draft.content ?? '') !== serverContent) {
      editor.innerHTML = sanitizeEditorHtml(draft.content ?? '')
      applyNoteToForm(draft)
      setDraftRestoredAt(draft.savedAt)
      setDraftSavedAt(draft.savedAt)
    } else {
      editor.innerHTML = serverContent
    }
    setCharCount((editor.textContent || '').length)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // 본문 외 항목(제목/날짜/폴더/구절/체크리스트/즐겨찾기)이 바뀔 때도 임시저장한다.
  // 첫 실행은 화면이 막 그려진 것뿐이라 건너뛴다.
  useEffect(() => {
    if (!draftMountedRef.current) { draftMountedRef.current = true; return }
    scheduleDraftSave()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title, noteDate, favorite, selectedFolderId, verseTags, checklist])

  useEffect(() => () => {
    if (draftTimerRef.current) window.clearTimeout(draftTimerRef.current)
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

  const [activeFormats, setActiveFormats] = useState({ bold: false, highlighted: false, color: null })

  const focusEditor = () => editorRef.current?.focus()

  const applyBold = () => { focusEditor(); document.execCommand('bold'); updateActiveFormats() }

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
    updateActiveFormats()
  }

  // execCommand('foreColor', ..., 'inherit')는 표준 CSS 색상값이 아니라서 브라우저가 파싱에 실패해
  // 글자를 투명(rgba(0,0,0,0))으로 만들어버린다(하이라이트 끄기에 쓰는 'inherit'과 달리 foreColor에선 안 통함).
  // 그래서 '기본'은 지금 테마의 실제 계산된 텍스트색을 그대로 값으로 넘겨 적용한다.
  const applyColor = (color) => {
    focusEditor()
    const resolvedColor = color ?? getComputedStyle(editorRef.current).color
    document.execCommand('foreColor', false, resolvedColor)
    updateActiveFormats()
  }

  // 툴바 버튼(B/H/색상)에 "현재 커서 위치에 적용된 서식"을 표시하기 위해 선택 영역이 바뀔 때마다 상태를 다시 계산한다.
  const updateActiveFormats = () => {
    const editor = editorRef.current
    const sel = window.getSelection()
    if (!editor || !sel || sel.rangeCount === 0 || !editor.contains(sel.anchorNode)) {
      setActiveFormats({ bold: false, highlighted: false, color: null })
      return
    }
    const bold = document.queryCommandState('bold')
    const highlighted = selectionHasHighlight()
    const currentColor = document.queryCommandValue('foreColor')
    const inkColor = getComputedStyle(editor).color
    const matchedSwatch = COLOR_SWATCHES.find((swatch) =>
      swatch.value ? colorsEqual(currentColor, swatch.value) : colorsEqual(currentColor, inkColor),
    )
    const nextColor = matchedSwatch ? (matchedSwatch.value ?? 'default') : undefined
    // 값이 그대로면 같은 객체를 돌려줘서 리렌더 자체를 건너뛴다 —
    // selectionchange는 글자 하나 칠 때마다 뜨는데, 매번 새 객체를 넣으면 그때마다 이 큰 화면이
    // 통째로 다시 그려져서 입력이 밀린다.
    setActiveFormats((prev) =>
      prev.bold === bold && prev.highlighted === highlighted && prev.color === nextColor
        ? prev
        : { bold, highlighted, color: nextColor },
    )
  }

  // 커서를 드래그하거나 빠르게 타이핑하면 selectionchange가 연달아 쏟아진다.
  // 한 프레임에 한 번으로 묶어서 계산 비용을 줄인다(화면에 보이는 결과는 동일).
  const formatUpdateFrameRef = useRef(0)
  const scheduleActiveFormatsUpdate = () => {
    if (formatUpdateFrameRef.current) return
    formatUpdateFrameRef.current = window.requestAnimationFrame(() => {
      formatUpdateFrameRef.current = 0
      updateActiveFormats()
    })
  }

  useEffect(() => {
    document.addEventListener('selectionchange', scheduleActiveFormatsUpdate)
    return () => {
      document.removeEventListener('selectionchange', scheduleActiveFormatsUpdate)
      if (formatUpdateFrameRef.current) window.cancelAnimationFrame(formatUpdateFrameRef.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleEditorInput = (e) => {
    setCharCount((editorRef.current?.textContent || '').length)
    scheduleDraftSave()
    // 백스페이스/삭제로 텍스트가 줄어들다가 우연히 "- "나 "1. "과 똑같은 모양이 남는 순간에도
    // input 이벤트는 뜬다 — 이때 트리거되면 사용자가 지우고 있는데 목록이 갑자기 생겨버린다
    // (신고된 "백스페이스하면 이상한 게 생긴다" 버그). inputType이 삭제 계열이면 건너뛴다.
    if (e?.nativeEvent?.inputType?.startsWith('delete')) return
    autoFormatListIfTriggered()
  }

  // 워드처럼 "- "/"* "/"1. "을 줄 맨 앞에 치면 자동으로 글머리·번호 목록으로 전환.
  const autoFormatListIfTriggered = () => {
    const sel = window.getSelection()
    if (!sel || sel.rangeCount === 0 || !sel.isCollapsed) return
    const range = sel.getRangeAt(0)
    const node = range.startContainer
    if (node.nodeType !== Node.TEXT_NODE) return

    const textBeforeCursor = node.textContent.slice(0, range.startOffset)
    const isBullet = /^[-*]\s$/.test(textBeforeCursor)
    const numberedMatch = textBeforeCursor.match(/^(\d+)\.\s$/)
    const isNumbered = Boolean(numberedMatch)
    if (!isBullet && !isNumbered) return

    node.textContent = node.textContent.slice(range.startOffset)

    // 이미 그 종류의 목록 항목 안이면(예: 번호 목록에서 다음 줄에 "1. "을 또 타이핑) 트리거
    // 문자만 지우고 끝 — 이미 목록 항목이라 번호/글머리는 브라우저가 알아서 붙여준다.
    if (document.queryCommandState(isBullet ? 'insertUnorderedList' : 'insertOrderedList')) {
      const newRange = document.createRange()
      newRange.setStart(node, 0)
      newRange.collapse(true)
      sel.removeAllRanges()
      sel.addRange(newRange)
      return
    }

    // execCommand('insertOrderedList'/'insertUnorderedList')는 새 목록을 만들 때 (a) <br>로만
    // 구분된 민 텍스트 상태에서 "현재 줄"의 블록 경계를 못 찾아 윗줄까지 통째로 삼키거나
    // (b) 근처의 무관한 기존 목록에 자동으로 합쳐버리는(둘 다 실제 재현 확인함 — "줄이
    // 합쳐진다"로 보고된 버그들의 진짜 원인) 신뢰할 수 없는 동작을 보인다. execCommand를 아예
    // 쓰지 않고 <ul>/<ol><li>를 직접 만들어서 이 줄의 내용만 정확히 옮긴다. (목록 안에서 Enter로
    // 다음 항목을 만드는 건 별개로 handleEditorKeyDown의 insertParagraph가 처리하고, 거긴 이
    // 문제가 없어서 그대로 둔다.)
    const editor = editorRef.current
    const list = document.createElement(isBullet ? 'ul' : 'ol')
    const li = document.createElement('li')
    list.appendChild(li)
    if (isNumbered) list.start = Number(numberedMatch[1])

    // "이 줄"은 커서가 속한 블록 안에서 앞뒤로 가장 가까운 <br> 사이 구간이다.
    // 노드를 하나씩 옮기지 않고 Range로 통째로 들어내는(extractContents) 이유:
    // 굵게/글자색이 켜진 상태로 목록을 시작하면 트리거 텍스트가 <b>/<span> 안에 들어있는데,
    // 예전처럼 node.parentElement를 컨테이너로 삼으면 <ul>이 그 <b> 안에 만들어져서
    // (<b>제목<ul><li>…</li></ul></b>) 목록 전체가 굵어지고 윗줄과 한 덩어리가 됐다.
    // Range는 줄 경계에서 인라인 요소를 알아서 쪼개주므로 이 문제가 원천적으로 없어진다.
    const block = closestBlock(node, editor)
    let prevBr = null
    let nextBr = null
    block.querySelectorAll('br').forEach((br) => {
      // 중첩된 다른 블록 안의 <br>은 이 줄의 경계가 아니다
      if (closestBlock(br, editor) !== block) return
      const relation = node.compareDocumentPosition(br)
      if (relation & Node.DOCUMENT_POSITION_PRECEDING) prevBr = br
      else if (relation & Node.DOCUMENT_POSITION_FOLLOWING && !nextBr) nextBr = br
    })

    const lineRange = document.createRange()
    if (prevBr) lineRange.setStartAfter(prevBr)
    else lineRange.setStart(block, 0)
    if (nextBr) lineRange.setEndBefore(nextBr)
    else lineRange.setEnd(block, block.childNodes.length)

    li.appendChild(lineRange.extractContents())

    // 새 목록은 반드시 블록의 직계 자식으로 넣는다(인라인 요소 안에 블록을 넣으면 안 되므로).
    let anchor = lineRange.startContainer
    if (anchor === block) {
      block.insertBefore(list, block.childNodes[lineRange.startOffset] ?? null)
    } else {
      while (anchor.parentNode && anchor.parentNode !== block) anchor = anchor.parentNode
      block.insertBefore(list, anchor.nextSibling)
    }

    // list가 이제 블록 경계 역할을 하므로, 이 줄을 감싸던 앞뒤 <br>은 더 이상 필요 없다
    // (남겨두면 빈 줄이 하나 더 생긴다). 굵게/색상이 켜져 있으면 그 <br>이 <b>/<span> 안에
    // 들어있어서 list의 형제가 아닐 수 있으므로, 경계로 찾아둔 노드를 직접 지운다.
    if (prevBr?.parentNode) prevBr.remove()
    if (nextBr?.parentNode) nextBr.remove()
    // 줄을 들어낸 자리에 남은 빈 <b>/<span> 껍데기 정리
    Array.from(block.childNodes).forEach((child) => {
      if (
        child.nodeType === Node.ELEMENT_NODE &&
        child !== list &&
        !BLOCK_TAGS.has(child.nodeName) &&
        child.nodeName !== 'BR' &&
        child.childNodes.length === 0
      ) child.remove()
    })

    const newRange = document.createRange()
    newRange.setStart(node, 0)
    newRange.collapse(true)
    sel.removeAllRanges()
    sel.addRange(newRange)
  }

  const isCursorInList = () =>
    document.queryCommandState('insertUnorderedList') || document.queryCommandState('insertOrderedList')

  // execCommand가 없거나 실패했을 때 쓰는 수동 줄바꿈. Enter를 preventDefault로 가로챈 뒤
  // 명령이 실패하면 아무 일도 안 일어나서 "엔터가 아예 안 먹는" 상태가 되므로 반드시 대비가 필요하다
  // (insertLineBreak는 비표준이라 지원하지 않는 브라우저가 있다).
  const insertLineBreakManually = () => {
    const sel = window.getSelection()
    if (!sel || sel.rangeCount === 0) return
    const range = sel.getRangeAt(0)
    range.deleteContents()
    const br = document.createElement('br')
    range.insertNode(br)
    // 문서 맨 끝이면 보정용 <br>을 하나 더 둬야 새 줄에 커서를 놓을 수 있다(브라우저 공통 동작)
    if (!br.nextSibling) br.parentNode.insertBefore(document.createElement('br'), null)
    const after = document.createRange()
    after.setStartAfter(br)
    after.collapse(true)
    sel.removeAllRanges()
    sel.addRange(after)
  }

  // 목록 첫 항목의 맨 앞에서 백스페이스를 눌렀을 때 브라우저 기본 동작은 그 줄을 윗줄에 통째로
  // 붙여버리면서 font-family/letter-spacing이 하드코딩된 <span>까지 본문에 끼워 넣는다
  // (실제 재현 확인: "첫줄<br><ul><li>항목</li></ul>" → "첫줄<span style="font-family:…">항목</span>").
  // 대신 "목록에서 한 단계 빠져나오기"로 처리한다 — 워드/노션과 같은 동작이고 줄도 안 합쳐진다.
  const outdentIfAtListStart = () => {
    const editor = editorRef.current
    const sel = window.getSelection()
    if (!editor || !sel || sel.rangeCount === 0 || !sel.isCollapsed) return false
    const range = sel.getRangeAt(0)
    const startEl = range.startContainer.nodeType === Node.ELEMENT_NODE
      ? range.startContainer
      : range.startContainer.parentElement
    const li = startEl?.closest('li')
    if (!li || !editor.contains(li)) return false

    // 커서가 그 항목의 맨 앞인지 (앞에 글자가 하나도 없는지) 확인
    const probe = document.createRange()
    probe.selectNodeContents(li)
    probe.setEnd(range.startContainer, range.startOffset)
    if (probe.toString().length > 0) return false

    const list = li.parentElement
    if (!list || (list.nodeName !== 'UL' && list.nodeName !== 'OL')) return false
    // 첫 항목이 아니면 윗 항목과 합쳐지는 게 자연스러우므로 브라우저 기본 동작에 맡긴다
    if (list.firstElementChild !== li) return false

    const fragment = document.createDocumentFragment()
    while (li.firstChild) fragment.appendChild(li.firstChild)
    const firstMoved = fragment.firstChild
    const trailingBr = document.createElement('br')
    fragment.appendChild(trailingBr)
    list.parentNode.insertBefore(fragment, list)
    li.remove()
    if (!list.firstElementChild) list.remove()

    const newRange = document.createRange()
    if (firstMoved) newRange.setStart(firstMoved, 0)
    else newRange.setStartBefore(trailingBr)
    newRange.collapse(true)
    sel.removeAllRanges()
    sel.addRange(newRange)
    return true
  }

  // 일부 브라우저에서 contentEditable의 기본 Enter 동작(줄바꿈)이 씹히는 경우가 있어 직접 처리.
  // 목록 안에서는 insertParagraph를 써야 다음 항목 생성/빈 항목에서 목록 탈출이 정상 동작함.
  const handleEditorKeyDown = (e) => {
    // 한글 조합 중에는 절대 가로채지 않는다 — 조합이 끊기거나 마지막 글자가 중복된다.
    // 안드로이드 키보드 일부는 isComposing을 안 채우고 keyCode만 229로 보내므로 둘 다 본다.
    const isComposing = e.nativeEvent.isComposing || e.nativeEvent.keyCode === 229

    if (e.key === 'Enter' && !isComposing) {
      e.preventDefault()
      let handled = false
      try {
        handled = document.execCommand(isCursorInList() ? 'insertParagraph' : 'insertLineBreak')
      } catch { handled = false }
      if (!handled) insertLineBreakManually()
      handleEditorInput()
      return
    }

    if (e.key === 'Backspace' && !isComposing) {
      if (outdentIfAtListStart()) {
        e.preventDefault()
        handleEditorInput()
      }
    }
  }

  // 붙여넣기: 밖(카톡·웹·워드)에서 복사해오면 남의 색·배경·폰트·이미지가 그대로 들어와서
  // 다크/세피아 테마에서 글자가 안 보이거나 본문 폭이 깨진다. 에디터가 실제로 쓰는 서식만
  // 남기고 걸러서 넣는다(굵게/기울임/글자색/하이라이트/목록은 그대로 유지됨).
  const handleEditorPaste = (e) => {
    const clipboard = e.clipboardData
    if (!clipboard) return
    e.preventDefault()
    const html = clipboard.getData('text/html')
    const plain = clipboard.getData('text/plain')
    const cleaned = html
      ? sanitizeEditorHtml(html)
      : escapeHtml(plain).replace(/\r\n|\r|\n/g, '<br>')

    let inserted = false
    try { inserted = document.execCommand('insertHTML', false, cleaned) } catch { inserted = false }
    if (!inserted) {
      const sel = window.getSelection()
      if (sel && sel.rangeCount > 0) {
        const range = sel.getRangeAt(0)
        range.deleteContents()
        const holder = document.createElement('div')
        holder.innerHTML = cleaned
        const fragment = document.createDocumentFragment()
        while (holder.firstChild) fragment.appendChild(holder.firstChild)
        const lastNode = fragment.lastChild
        range.insertNode(fragment)
        if (lastNode) {
          const after = document.createRange()
          after.setStartAfter(lastNode)
          after.collapse(true)
          sel.removeAllRanges()
          sel.addRange(after)
        }
      }
    }
    handleEditorInput()
  }

  // 구절은 여러 개 담을 수 있다(이미 담긴 것과 같으면 무시)
  const handleAddVerse = (tag) => {
    const trimmed = (tag ?? '').trim()
    if (!trimmed) return
    setVerseTags((prev) => (prev.includes(trimmed) ? prev : [...prev, trimmed]))
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
      clearDraft()
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
    const content = sanitizeEditorHtml(editorRef.current?.innerHTML ?? '')
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

      // 서버에 제대로 들어갔으니 임시저장본은 지운다(안 지우면 다음에 들어올 때 또 복구된다)
      clearDraft()

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

      {draftRestoredAt && (
        <div className="mx-5 mt-3 flex items-center gap-2 bg-primary-light rounded-2xl px-3.5 py-2.5">
          <p className="text-[11px] text-primary flex-1 leading-snug">
            저장하지 않고 나갔던 내용을 불러왔어요 ({formatDraftTime(draftRestoredAt)})
          </p>
          <button
            onClick={handleDiscardDraft}
            className="text-[11px] font-bold text-primary bg-transparent border-none cursor-pointer underline shrink-0"
          >
            {isEdit ? '원래대로' : '새로 쓰기'}
          </button>
        </div>
      )}

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
            className="text-xs font-semibold bg-surface shadow-sm rounded-full px-3.5 py-2 outline-none border-none"
          />
          <button
            onClick={() => setShowVersePicker(true)}
            className="flex items-center gap-1.5 text-xs font-semibold text-gray-400 border border-dashed border-gray-300 rounded-full px-3 py-1.5 bg-transparent cursor-pointer"
          >
            <BookOpen size={13} strokeWidth={2} />
            말씀구절 추가
          </button>
        </div>

        <div className="mb-3 relative inline-flex items-center">
          <Folder size={13} strokeWidth={2} className="absolute left-3.5 text-gray-400 pointer-events-none" />
          <select
            value={selectedFolderId}
            onChange={(e) => setSelectedFolderId(e.target.value)}
            className="text-xs font-semibold bg-surface shadow-sm rounded-full pl-8 pr-2.5 py-2 outline-none border-none appearance-none"
          >
            <option value="">미분류</option>
            {folders.map((folder) => (
              <option key={folder.id} value={folder.id}>{folder.name}</option>
            ))}
          </select>
        </div>

        {verseTags.length > 0 && (
          <div className="flex gap-1.5 flex-wrap mb-3">
            {verseTags.map((tag) => (
              <span key={tag} className="inline-flex items-center gap-1.5 text-xs font-semibold bg-primary-light text-primary rounded-full pl-2.5 pr-2 py-1.5">
                <BookOpen size={12} strokeWidth={2.2} />
                {tag}
                <button onClick={() => handleRemoveVerse(tag)} className="bg-transparent border-none cursor-pointer text-primary text-[11px] leading-none">✕</button>
              </span>
            ))}
          </div>
        )}

        <div className="flex items-center gap-1.5 bg-surface rounded-2xl p-2 mb-2.5 shadow-[0_1px_1px_rgba(20,22,42,0.03),0_4px_12px_rgba(20,22,42,0.05)]">
          <button
            onClick={applyBold}
            className={`w-8 h-8 rounded-lg border-none cursor-pointer font-extrabold text-[13px] transition-colors ${
              activeFormats.bold ? 'bg-primary text-white' : 'bg-gray-100'
            }`}
          >B</button>
          <button
            onClick={applyHighlight}
            className="w-8 h-8 rounded-lg border-none cursor-pointer font-bold text-[13px] transition-colors bg-gray-100"
            style={activeFormats.highlighted ? { backgroundColor: HIGHLIGHT_COLOR } : undefined}
          >H</button>
          <div className="w-px h-4 bg-gray-200 mx-1" />
          {COLOR_SWATCHES.map((swatch) => (
            <button
              key={swatch.label}
              onClick={() => applyColor(swatch.value)}
              title={swatch.label}
              className="w-[18px] h-[18px] rounded-full border-none cursor-pointer transition-[outline]"
              style={{
                backgroundColor: swatch.value ?? 'rgb(var(--jh-ink))',
                outline: activeFormats.color === (swatch.value ?? 'default') ? '2px solid #4285F4' : '2px solid transparent',
                outlineOffset: 2,
              }}
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
          onPaste={handleEditorPaste}
        />
        <div className="flex items-center justify-between mt-1.5">
          <p className="text-[11px] text-gray-400">
            {draftSavedAt ? `자동 저장됨 · ${formatDraftTime(draftSavedAt)}` : ''}
          </p>
          <p className="text-[11px] text-gray-400">{charCount}자</p>
        </div>

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

      <VersePickerSheet
        open={showVersePicker}
        tags={verseTags}
        onAdd={handleAddVerse}
        onRemove={handleRemoveVerse}
        onClose={() => setShowVersePicker(false)}
      />

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
