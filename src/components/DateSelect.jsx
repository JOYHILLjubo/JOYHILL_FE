// YYYY-MM-DD 문자열 ↔ { year, month, day } 변환 유틸
export function parseDateString(value) {
  if (!value) return { year: '', month: '', day: '' }
  const str = String(value).trim()
  const isoMatch = str.match(/^(\d{4})-(\d{2})-(\d{2})$/)
  if (isoMatch) return { year: isoMatch[1], month: String(parseInt(isoMatch[2], 10)), day: String(parseInt(isoMatch[3], 10)) }
  if (/^\d{6}$/.test(str)) {
    const yy = parseInt(str.slice(0, 2), 10)
    const fullYear = yy <= 30 ? 2000 + yy : 1900 + yy
    return { year: String(fullYear), month: String(parseInt(str.slice(2, 4), 10)), day: String(parseInt(str.slice(4, 6), 10)) }
  }
  return { year: '', month: '', day: '' }
}

export function buildDateString(year, month, day) {
  if (!year || !month || !day) return ''
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

const CURRENT_YEAR = new Date().getFullYear()
const YEARS = Array.from({ length: 80 }, (_, i) => String(CURRENT_YEAR - i))
const MONTHS = Array.from({ length: 12 }, (_, i) => String(i + 1))

function getDays(year, month) {
  if (!year || !month) return Array.from({ length: 31 }, (_, i) => String(i + 1))
  const count = new Date(Number(year), Number(month), 0).getDate()
  return Array.from({ length: count }, (_, i) => String(i + 1))
}

const selectClass = 'flex-1 border border-gray-300 rounded-lg px-2 py-2.5 text-sm outline-none focus:border-primary bg-white disabled:bg-gray-100'

export default function DateSelect({ value, onChange, disabled }) {
  const { year, month, day } = parseDateString(value)
  const days = getDays(year, month)

  const update = (field, val) => {
    const next = {
      year: field === 'year' ? val : year,
      month: field === 'month' ? val : month,
      day: field === 'day' ? val : day,
    }
    if (next.year && next.month && next.day) {
      const maxDay = new Date(Number(next.year), Number(next.month), 0).getDate()
      if (Number(next.day) > maxDay) next.day = String(maxDay)
    }
    onChange(buildDateString(next.year, next.month, next.day))
  }

  return (
    <div className="flex gap-2">
      <select value={year} onChange={(e) => update('year', e.target.value)} disabled={disabled} className={selectClass}>
        <option value="">년도</option>
        {YEARS.map((y) => <option key={y} value={y}>{y}년</option>)}
      </select>
      <select value={month} onChange={(e) => update('month', e.target.value)} disabled={disabled} className={selectClass}>
        <option value="">월</option>
        {MONTHS.map((m) => <option key={m} value={m}>{m}월</option>)}
      </select>
      <select value={day} onChange={(e) => update('day', e.target.value)} disabled={disabled} className={selectClass}>
        <option value="">일</option>
        {days.map((d) => <option key={d} value={d}>{d}일</option>)}
      </select>
    </div>
  )
}
