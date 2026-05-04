import { useMemo, useRef, useState } from 'react'
import DateSelect from '../components/DateSelect'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/$/, '')

const TAG_OPTIONS = ['행사', '안내', '소식', '모집']

const TAG_STYLE = {
  행사: { active: 'bg-primary-light text-primary border-primary' },
  안내: { active: 'bg-warning-light text-warning border-warning' },
  소식: { active: 'bg-success-light text-success border-success' },
  모집: { active: 'bg-danger-light text-danger border-danger' },
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
  if (result.response.status === 403) return result.payload?.error?.message ?? '공지 저장 권한이 없습니다.'
  if (result.response.status === 404) return result.payload?.error?.message ?? '수정할 공지사항을 찾을 수 없습니다.'
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

export default function NoticeWritePageConnected() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, accessToken, setAccessToken, logout, canWriteNotice, isAdmin } = useAuth()

  const editingNotice = useMemo(
    () => location.state?.mode === 'edit' ? normalizeNoticeState(location.state?.notice) : null,
    [location.state],
  )
  const isEdit = Boolean(editingNotice?.id)

  const [title, setTitle] = useState(editingNotice?.title ?? '')
  const [content, setContent] = useState(editingNotice?.content ?? '')
  // 수정 시 기존 tag가 쉼표 구분이면 배열로 파싱
  const [tags, setTags] = useState(() => {
    if (!editingNotice?.tag) return []
    return editingNotice.tag.split(',').map(t => t.trim()).filter(Boolean)
  })
  const [fileUrl, setFileUrl] = useState(editingNotice?.fileUrl ?? '')
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(editingNotice?.fileUrl ?? '')
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const [linkUrl, setLinkUrl] = useState(editingNotice?.linkUrl ?? '')
  const [deadline, setDeadline] = useState(editingNotice?.deadline ?? '')
  const [pinned, setPinned] = useState(editingNotice?.pinned ?? false)
  const [submitError, setSubmitError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const accessTokenRef = useRef(accessToken)
  accessTokenRef.current = accessToken

  const canEditTarget = !isEdit || isAdmin || editingNotice?.userId == null || editingNotice.userId === user?.id

  const handleExpiredSession = () => { logout(); navigate('/login', { replace: true }) }

  const handleBack = () => {
    if (isEdit && editingNotice?.id) {
      navigate(`/notice/${editingNotice.id}`, { state: { notice: editingNotice } })
      return
    }
    navigate('/notice')
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (!file.type.startsWith('image/')) { setUploadError('이미지 파일만 선택할 수 있습니다.'); return }
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
    setUploadError('')
  }

  const uploadImageIfNeeded = async () => {
    if (!imageFile) return fileUrl
    setIsUploading(true)
    try {
      const formData = new FormData()
      formData.append('image', imageFile)
      const token = accessTokenRef.current
      const res = await fetch(buildApiUrl('/api/notices/image'), {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        credentials: 'include',
        body: formData,
      })
      const payload = await res.json().catch(() => null)
      if (!res.ok || !payload?.success) throw new Error(payload?.error?.message ?? '이미지 업로드에 실패했습니다.')
      return payload.data.imageUrl
    } finally { setIsUploading(false) }
  }

  const callAuthedApi = async (path, options = {}) => {
    const makeRequest = (token) => requestApi(path, { ...options, headers: { ...(options.headers ?? {}), Authorization: `Bearer ${token}` } })
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

  const handleSubmit = async () => {
    if (isSubmitting) return
    if (!title.trim()) { setSubmitError('제목을 입력해주세요.'); return }
    if (!content.trim()) { setSubmitError('내용을 입력해주세요.'); return }
    if (!tags.length) { setSubmitError('태그를 하나 이상 선택해주세요.'); return }

    setSubmitError('')
    setIsSubmitting(true)

    let uploadedImageUrl = fileUrl
    try {
      uploadedImageUrl = await uploadImageIfNeeded()
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : '이미지 업로드에 실패했습니다.')
      setIsSubmitting(false)
      return
    }

    const requestBody = {
      title: title.trim(),
      content: content.trim(),
      tag: tags.join(','),
      teamTag: null,
      pinned,
      deadline: nullIfBlank(deadline),
      fileUrl: nullIfBlank(uploadedImageUrl),
      linkUrl: nullIfBlank(linkUrl),
    }

    try {
      const savedNotice = isEdit
        ? await callAuthedApi(`/api/notices/${editingNotice.id}`, { method: 'PUT', body: requestBody })
        : await callAuthedApi('/api/notices', { method: 'POST', body: requestBody })

      navigate(`/notice/${savedNotice.id}`, {
        replace: true,
        state: { notice: { ...mapNotice(savedNotice), file: savedNotice.fileUrl ?? null } },
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : '공지사항 저장에 실패했습니다.'
      if (isSessionError(message)) { handleExpiredSession(); return }
      setSubmitError(message)
      setIsSubmitting(false)
    }
  }

  if (!canWriteNotice) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <p className="text-gray-500 text-sm">공지 등록 권한이 없습니다.</p>
        <button onClick={handleBack} className="mt-3 text-xs text-primary bg-primary-light px-4 py-2 rounded-full border-none cursor-pointer">돌아가기</button>
      </div>
    )
  }

  if (!canEditTarget) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <p className="text-gray-500 text-sm">이 공지를 수정할 권한이 없습니다.</p>
        <button onClick={handleBack} className="mt-3 text-xs text-primary bg-primary-light px-4 py-2 rounded-full border-none cursor-pointer">돌아가기</button>
      </div>
    )
  }

  return (
    <div style={{ paddingBottom: 'calc(80px + env(safe-area-inset-bottom, 0px))', overflowX: 'hidden' }}>
      <div className="flex items-center gap-3 px-5 pt-4 pb-3 border-b border-gray-300">
        <button onClick={handleBack} className="text-lg bg-transparent border-none cursor-pointer">←</button>
        <p className="text-base font-semibold flex-1">{isEdit ? '공지사항 수정' : '공지사항 등록'}</p>
      </div>

      <div className="px-5 pt-2 flex flex-col" style={{ minWidth: 0 }}>

        {/* 제목 */}
        <div className="py-5 border-b border-gray-100">
          <p className="text-xs text-gray-500 mb-1.5">제목 <span className="text-danger">*</span></p>
          <input
            value={title}
            onChange={(e) => { setTitle(e.target.value); setSubmitError('') }}
            placeholder="공지 제목을 입력하세요"
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-primary"
          />
        </div>

        {/* 내용 */}
        <div className="py-5 border-b border-gray-100">
          <p className="text-xs text-gray-500 mb-1.5">내용 <span className="text-danger">*</span></p>
          <textarea
            value={content}
            onChange={(e) => { setContent(e.target.value); setSubmitError('') }}
            placeholder="공지 내용을 입력하세요"
            rows={7}
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-primary resize-none"
          />
        </div>

        {/* 태그 */}
        <div className="py-5 border-b border-gray-100">
          <p className="text-xs text-gray-500 mb-2">
            태그 <span className="text-danger">*</span>
            <span className="text-gray-400 ml-1.5">(중복 선택 가능)</span>
          </p>
          <div className="flex gap-2 flex-wrap">
            {TAG_OPTIONS.map((option) => {
              const selected = tags.includes(option)
              return (
                <button
                  key={option}
                  onClick={() => { setTags((prev) => prev.includes(option) ? prev.filter(t => t !== option) : [...prev, option]); setSubmitError('') }}
                  className={`text-sm px-3.5 py-1.5 rounded-full border cursor-pointer transition-all ${selected ? TAG_STYLE[option].active : 'bg-white text-gray-500 border-gray-300'}`}
                >
                  {option}
                </button>
              )
            })}
          </div>
        </div>

        {/* 이미지 첨부 */}
        <div className="py-5 border-b border-gray-100">
          <p className="text-xs text-gray-500 mb-1.5">이미지 첨부</p>
          <label className="flex items-center gap-2.5 border border-dashed border-gray-300 rounded-lg px-3 py-3 cursor-pointer hover:bg-gray-50 transition-colors">
            <span className="text-xl">🖼️</span>
            <span className="text-sm text-gray-500 flex-1 truncate">
              {imageFile ? imageFile.name : imagePreview ? '이미지가 첨부되어 있습니다' : '이미지를 선택하세요'}
            </span>
            {(imageFile || imagePreview) && (
              <button onClick={(e) => { e.preventDefault(); setImageFile(null); setImagePreview(''); setFileUrl('') }} className="text-gray-400 text-xs bg-transparent border-none cursor-pointer">✕</button>
            )}
            <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
          </label>
          {uploadError && <p className="text-[11px] text-danger mt-1 ml-1">{uploadError}</p>}
          {imagePreview && (
            <div className="mt-2 rounded-lg overflow-hidden border border-gray-200">
              <img src={imagePreview} alt="미리보기" className="w-full max-h-48 object-contain bg-gray-50" />
            </div>
          )}
        </div>

        {/* 링크 */}
        <div className="py-5 border-b border-gray-100">
          <p className="text-xs text-gray-500 mb-1.5">링크</p>
          <input
            value={linkUrl}
            onChange={(e) => { setLinkUrl(e.target.value); setSubmitError('') }}
            placeholder="https://..."
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-primary"
          />
        </div>

        {/* 게시 기한 */}
        <div className="py-5 border-b border-gray-100">
          <p className="text-xs text-gray-500 mb-1.5">게시 기한</p>
          <input
            type="date"
            value={deadline}
            onChange={(e) => { setDeadline(e.target.value); setSubmitError('') }}
            min={new Date().toISOString().slice(0, 10)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-primary bg-white"
            style={{ colorScheme: 'light', minHeight: '44px' }}
          />
          <p className="text-[11px] text-gray-500 mt-1 ml-1">
            {deadline ? `${deadline} 이후 자동 삭제는 아직 연결되지 않았습니다.` : '미설정 시 계속 게시됩니다.'}
          </p>
        </div>

        {/* 상단 고정 */}
        <div className="py-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">상단 고정</p>
              <p className="text-[11px] text-gray-500 mt-0.5">공지사항 목록 최상단에 고정됩니다.</p>
            </div>
            <button
              onClick={() => setPinned((prev) => !prev)}
              className={`w-12 h-6 rounded-full transition-colors relative border-none cursor-pointer shrink-0 ${pinned ? 'bg-primary' : 'bg-gray-300'}`}
            >
              <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${pinned ? 'left-6' : 'left-0.5'}`} />
            </button>
          </div>
        </div>

        {submitError && <p className="text-[12px] text-danger pb-3">{submitError}</p>}
      </div>

      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] px-5 bg-white border-t border-gray-300" style={{ paddingTop: '12px', paddingBottom: 'calc(12px + env(safe-area-inset-bottom, 0px))' }}>
        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className={`w-full py-3 rounded-lg text-sm font-medium border-none transition-colors ${
            isSubmitting ? 'bg-gray-300 text-white cursor-not-allowed' : 'bg-primary text-white cursor-pointer hover:bg-primary-hover'
          }`}
        >
          {isUploading ? '이미지 업로드 중...' : isSubmitting ? '저장 중...' : isEdit ? '공지 수정하기' : '공지 등록하기'}
        </button>
      </div>
    </div>
  )
}
