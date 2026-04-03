import NoticeWritePageConnected from './NoticeWritePageConnected'
import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { notices } from './NoticePage'

const TAG_OPTIONS = ['행사', '안내', '소식', '신청']

const tagStyle = {
  행사: { active: 'bg-primary-light text-primary border-primary' },
  안내: { active: 'bg-warning-light text-warning border-warning' },
  소식: { active: 'bg-success-light text-success border-success' },
  신청: { active: 'bg-danger-light text-danger border-danger' },
}

function formatNoticeDate(date = new Date()) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}.${month}.${day}`
}

function LegacyNoticeWritePage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { canWriteNotice, user } = useAuth()
  const editingNotice = location.state?.mode === 'edit' ? location.state?.notice : null
  const isEdit = Boolean(editingNotice)

  const [title, setTitle] = useState(editingNotice?.title ?? '')
  const [content, setContent] = useState(editingNotice?.content ?? '')
  const [tags, setTags] = useState(editingNotice?.tag ? [editingNotice.tag] : [])
  const [file, setFile] = useState(editingNotice?.file ?? null)
  const [deadline, setDeadline] = useState(editingNotice?.deadline ?? '')
  const [pinned, setPinned] = useState(editingNotice?.pinned ?? false)
  const handleBack = () => {
    if (isEdit) {
      navigate(`/notice/${editingNotice.id}`, { state: { notice: editingNotice } })
      return
    }
    navigate('/notice')
  }

  if (!canWriteNotice) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <p className="text-gray-500 text-sm">공지 등록 권한이 없습니다.</p>
        <button onClick={handleBack} className="mt-3 text-xs text-primary bg-primary-light px-4 py-2 rounded-full border-none cursor-pointer">
          돌아가기
        </button>
      </div>
    )
  }

  const toggleTag = (tag) => {
    setTags((prev) => prev.includes(tag) ? [] : [tag])
  }

  const handleSubmit = () => {
    if (!title.trim()) { alert('제목을 입력해주세요.'); return }
    if (!content.trim()) { alert('내용을 입력해주세요.'); return }
    if (tags.length === 0) { alert('태그를 하나 이상 선택해주세요.'); return }
    const normalizedFile = typeof file === 'string' ? file : file?.name || null
    const nextNotice = {
      ...editingNotice,
      id: editingNotice?.id ?? Date.now(),
      title: title.trim(),
      content: content.trim(),
      author: editingNotice?.author ?? user.teamRoles?.[0] ?? user.fam ?? user.name,
      date: editingNotice?.date ?? formatNoticeDate(),
      pinned,
      tag: tags[0],
      teamTag: editingNotice?.teamTag ?? null,
      file: normalizedFile,
      deadline: deadline || null,
    }

    if (isEdit) {
      const targetIndex = notices.findIndex((notice) => notice.id === editingNotice.id)
      if (targetIndex !== -1) notices[targetIndex] = nextNotice
      navigate(`/notice/${nextNotice.id}`, { state: { notice: nextNotice } })
      return
    }

    notices.unshift(nextNotice)
    navigate('/notice')
  }

  const fileLabel = typeof file === 'string' ? file : file?.name

  return (
    <div className="pb-28">
      {/* 헤더 */}
      <div className="flex items-center gap-3 px-5 pt-4 pb-3 border-b border-gray-300">
        <button onClick={handleBack} className="text-lg bg-transparent border-none cursor-pointer">←</button>
        <p className="text-base font-medium">{isEdit ? '공지사항 수정' : '공지사항 등록'}</p>
      </div>

      <div className="px-5 pt-4 flex flex-col gap-5">

        {/* 제목 */}
        <div>
          <p className="text-xs text-gray-500 mb-1.5">제목 <span className="text-danger">*</span></p>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="공지 제목을 입력하세요"
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-primary"
          />
        </div>

        {/* 내용 */}
        <div>
          <p className="text-xs text-gray-500 mb-1.5">내용 <span className="text-danger">*</span></p>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="공지 내용을 입력하세요"
            rows={6}
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-primary resize-none"
          />
        </div>

        {/* 태그 */}
        <div>
          <p className="text-xs text-gray-500 mb-1.5">태그 <span className="text-danger">*</span></p>
          <div className="flex gap-2 flex-wrap">
            {TAG_OPTIONS.map((tag) => {
              const selected = tags.includes(tag)
              return (
                <button key={tag} onClick={() => toggleTag(tag)}
                  className={`text-sm px-3.5 py-1.5 rounded-full border cursor-pointer transition-all ${
                    selected ? tagStyle[tag].active : 'bg-white text-gray-500 border-gray-300'
                  }`}>
                  {tag}
                </button>
              )
            })}
          </div>
        </div>

        {/* 첨부파일 */}
        <div>
          <p className="text-xs text-gray-500 mb-1.5">첨부파일</p>
          <label className="flex items-center gap-2.5 border border-dashed border-gray-300 rounded-lg px-3 py-3 cursor-pointer hover:bg-gray-100 transition-colors">
            <span className="text-xl">📎</span>
            <span className="text-sm text-gray-500 flex-1 truncate">{fileLabel || '파일을 선택하세요'}</span>
            {file && (
              <button onClick={(e) => { e.preventDefault(); setFile(null) }} className="text-gray-500 text-xs bg-transparent border-none cursor-pointer">✕</button>
            )}
            <input type="file" className="hidden" onChange={(e) => setFile(e.target.files[0] || null)} />
          </label>
        </div>

        {/* 게시 기한 */}
        <div>
          <p className="text-xs text-gray-500 mb-1.5">게시 기한</p>
          <input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-primary" />
          <p className="text-[11px] text-gray-500 mt-1 ml-1">
            {deadline ? `${deadline} 이후 자동 삭제됩니다.` : '미설정 시 상시 게시됩니다.'}
          </p>
        </div>

        {/* 상단 고정 */}
        <div className="flex items-center justify-between py-1">
          <div>
            <p className="text-sm">상단 고정</p>
            <p className="text-[11px] text-gray-500 mt-0.5">공지사항 목록 최상단에 고정됩니다</p>
          </div>
          <button onClick={() => setPinned(!pinned)}
            className={`w-12 h-6 rounded-full transition-colors relative border-none cursor-pointer shrink-0 ${pinned ? 'bg-primary' : 'bg-gray-300'}`}>
            <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${pinned ? 'left-6' : 'left-0.5'}`} />
          </button>
        </div>
      </div>

      {/* 저장 버튼 */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] px-5 py-3 bg-white border-t border-gray-300">
        <button onClick={handleSubmit}
          className="w-full py-3 bg-primary text-white rounded-lg text-sm font-medium border-none cursor-pointer hover:bg-primary-hover transition-colors">
          {isEdit ? '공지 수정하기' : '공지 등록하기'}
        </button>
      </div>
    </div>
  )
}

export default NoticeWritePageConnected
