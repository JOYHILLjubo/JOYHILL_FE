import { useEffect, useMemo, useState } from 'react'
import { X, ChevronLeft, Plus } from 'lucide-react'
import { BIBLE_BOOKS, BIBLE_BOOK_MAP, formatVerseTag } from '../data/bible'

const OLD_TESTAMENT = BIBLE_BOOKS.filter((book) => book.testament === 'ot')
const NEW_TESTAMENT = BIBLE_BOOKS.filter((book) => book.testament === 'nt')

/*
 * 말씀구절 선택 바텀시트 — 책 → 장 → 절 순서로 좁혀가며 고른다.
 * 절은 "시작 절 탭 → 끝 절 탭"의 범위 선택이다(날짜 범위 고르는 것과 같은 방식).
 * 같은 절을 두 번 누르면 한 절만 선택된다.
 *
 * 구절은 여러 개 담을 수 있어야 해서, 추가해도 시트가 닫히지 않고 책 목록으로 돌아간다 —
 * 담긴 구절은 시트 위쪽에 칩으로 계속 보이고 거기서 바로 뺄 수도 있다.
 */
export default function VersePickerSheet({ open, tags, onAdd, onRemove, onClose }) {
  const [step, setStep] = useState('book')
  const [testament, setTestament] = useState('ot')
  const [bookName, setBookName] = useState(null)
  const [chapter, setChapter] = useState(null)
  const [startVerse, setStartVerse] = useState(null)
  const [endVerse, setEndVerse] = useState(null)
  const [manualMode, setManualMode] = useState(false)
  const [manualInput, setManualInput] = useState('')

  const book = bookName ? BIBLE_BOOK_MAP.get(bookName) : null
  const verseCount = book && chapter ? book.verses[chapter - 1] : 0

  const previewTag = useMemo(
    () => formatVerseTag(bookName, chapter, startVerse, endVerse),
    [bookName, chapter, startVerse, endVerse],
  )

  // 시트가 열릴 때마다 처음(책 고르기)부터 시작한다
  useEffect(() => {
    if (!open) return
    setStep('book')
    setBookName(null); setChapter(null); setStartVerse(null); setEndVerse(null)
    setManualMode(false); setManualInput('')
  }, [open])

  // 시트가 떠 있는 동안 뒤 화면이 같이 스크롤되지 않게 잠근다
  useEffect(() => {
    if (!open) return undefined
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = previous }
  }, [open])

  if (!open) return null

  const handleSelectVerse = (verse) => {
    // 아직 시작 절이 없거나 범위가 이미 완성됐으면 새로 시작한다
    if (startVerse === null || endVerse !== null) { setStartVerse(verse); setEndVerse(null) }
    else setEndVerse(verse)
  }

  const handleAdd = (tag) => {
    const trimmed = (tag ?? '').trim()
    if (!trimmed) return
    onAdd(trimmed)
    // 이어서 더 담을 수 있게 책 고르기로 돌아간다
    setStep('book')
    setBookName(null); setChapter(null); setStartVerse(null); setEndVerse(null)
    setManualInput('')
  }

  const goBack = () => {
    if (step === 'verse') { setStep('chapter'); setStartVerse(null); setEndVerse(null) }
    else if (step === 'chapter') { setStep('book'); setChapter(null) }
  }

  const gridButtonClass = (active) =>
    `py-2.5 rounded-xl text-[13px] border-none cursor-pointer transition-colors ${
      active ? 'bg-primary text-white font-bold' : 'bg-gray-100 text-ink'
    }`

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end justify-center"
      style={{ background: 'rgba(20, 22, 42, 0.45)' }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-[430px] bg-surface rounded-t-3xl flex flex-col"
        style={{ maxHeight: '85vh', paddingBottom: 'calc(12px + env(safe-area-inset-bottom, 0px))' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2 px-5 pt-4 pb-3">
          {step !== 'book' ? (
            <button onClick={goBack} className="bg-transparent border-none cursor-pointer p-0 flex items-center text-gray-500">
              <ChevronLeft size={20} strokeWidth={2} />
            </button>
          ) : null}
          <p className="text-base font-bold flex-1">
            {step === 'book' && '말씀구절'}
            {step === 'chapter' && bookName}
            {step === 'verse' && `${bookName} ${chapter}장`}
          </p>
          <button onClick={onClose} className="bg-transparent border-none cursor-pointer p-0 flex items-center text-gray-500">
            <X size={20} strokeWidth={2} />
          </button>
        </div>

        {tags.length > 0 && (
          <div className="px-5 pb-3 flex gap-1.5 flex-wrap">
            {tags.map((tag) => (
              <span key={tag} className="inline-flex items-center gap-1.5 text-xs font-semibold bg-primary-light text-primary rounded-full pl-3 pr-2 py-1.5">
                {tag}
                <button
                  onClick={() => onRemove(tag)}
                  className="bg-transparent border-none cursor-pointer text-primary text-[11px] leading-none"
                  aria-label={`${tag} 삭제`}
                >✕</button>
              </span>
            ))}
          </div>
        )}

        <div className="flex-1 overflow-y-auto px-5">
          {step === 'book' && (
            <>
              {manualMode ? (
                <div className="flex gap-2 pb-2">
                  <input
                    autoFocus
                    value={manualInput}
                    onChange={(e) => setManualInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter' && !e.nativeEvent.isComposing) handleAdd(manualInput) }}
                    placeholder="예) 예레미야 29:11"
                    className="flex-1 text-[13px] border border-gray-300 rounded-full px-4 py-2.5 outline-none focus:border-primary"
                  />
                  <button
                    onClick={() => handleAdd(manualInput)}
                    className="text-[13px] font-semibold text-white bg-primary rounded-full px-4 py-2.5 border-none cursor-pointer shrink-0"
                  >추가</button>
                </div>
              ) : (
                <>
                  <div className="flex gap-1.5 mb-3">
                    {[['ot', '구약'], ['nt', '신약']].map(([key, label]) => (
                      <button
                        key={key}
                        onClick={() => setTestament(key)}
                        className={`flex-1 py-2 rounded-xl text-[13px] border-none cursor-pointer transition-colors ${
                          testament === key ? 'bg-primary text-white font-bold' : 'bg-gray-100 text-gray-500'
                        }`}
                      >{label}</button>
                    ))}
                  </div>
                  <div className="grid grid-cols-3 gap-1.5 pb-2">
                    {(testament === 'ot' ? OLD_TESTAMENT : NEW_TESTAMENT).map((item) => (
                      <button
                        key={item.name}
                        onClick={() => { setBookName(item.name); setStep('chapter') }}
                        className={`${gridButtonClass(false)} px-1`}
                      >{item.name}</button>
                    ))}
                  </div>
                </>
              )}
            </>
          )}

          {step === 'chapter' && (
            <div className="grid grid-cols-6 gap-1.5 pb-2">
              {Array.from({ length: book?.verses.length ?? 0 }, (_, i) => i + 1).map((num) => (
                <button
                  key={num}
                  onClick={() => { setChapter(num); setStep('verse') }}
                  className={gridButtonClass(chapter === num)}
                >{num}</button>
              ))}
            </div>
          )}

          {step === 'verse' && (
            <>
              <p className="text-[11px] text-gray-500 mb-2">
                {startVerse === null
                  ? '시작 절'
                  : endVerse === null
                    ? '끝 절 (같은 절을 한 번 더 누르면 한 절)'
                    : previewTag}
              </p>
              <button
                onClick={() => { setStartVerse(1); setEndVerse(verseCount) }}
                className="w-full py-2.5 rounded-xl text-[13px] font-semibold bg-gray-100 text-ink border-none cursor-pointer mb-2"
              >전체 (1-{verseCount}절)</button>
              <div className="grid grid-cols-6 gap-1.5 pb-2">
                {Array.from({ length: verseCount }, (_, i) => i + 1).map((num) => {
                  const from = startVerse === null ? null : Math.min(startVerse, endVerse ?? startVerse)
                  const to = startVerse === null ? null : Math.max(startVerse, endVerse ?? startVerse)
                  const inRange = from !== null && num >= from && num <= to
                  return (
                    <button key={num} onClick={() => handleSelectVerse(num)} className={gridButtonClass(inRange)}>
                      {num}
                    </button>
                  )
                })}
              </div>
            </>
          )}
        </div>

        <div className="px-5 pt-3 flex items-center gap-2">
          {step === 'book' ? (
            <button
              onClick={() => { setManualMode((prev) => !prev); setManualInput('') }}
              className="text-[12px] font-semibold text-gray-500 bg-transparent border-none cursor-pointer underline shrink-0"
            >{manualMode ? '목록에서 고르기' : '직접 입력'}</button>
          ) : null}
          <div className="flex-1" />
          {step === 'verse' && startVerse !== null ? (
            <button
              onClick={() => handleAdd(previewTag)}
              className="flex items-center gap-1.5 text-sm font-bold text-white bg-primary rounded-2xl px-5 py-3 border-none cursor-pointer"
              style={{ boxShadow: '0 8px 20px rgba(66,133,244,0.35)' }}
            >
              <Plus size={16} strokeWidth={2.5} />
              {previewTag} 추가
            </button>
          ) : (
            <button
              onClick={onClose}
              className="text-sm font-bold text-gray-500 bg-gray-100 rounded-2xl px-5 py-3 border-none cursor-pointer"
            >완료</button>
          )}
        </div>
      </div>
    </div>
  )
}
