import { Fragment, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import BottomNav from '../components/BottomNav'

const famMembers = [
  { id: 1, name: '김민수' },
  { id: 2, name: '이은혜' },
  { id: 3, name: '박준호' },
  { id: 4, name: '정하늘' },
  { id: 5, name: '최수진' },
  { id: 6, name: '한소망' },
]

function getSundaysOfMonth(year, month) {
  const sundays = []
  const date = new Date(year, month - 1, 1)
  while (date.getDay() !== 0) date.setDate(date.getDate() + 1)
  while (date.getMonth() === month - 1) {
    sundays.push(new Date(date))
    date.setDate(date.getDate() + 7)
  }
  return sundays
}

function toKey(date) { return date.toISOString().slice(0, 10) }
function formatDate(date) { return `${date.getMonth() + 1}/${date.getDate()}` }

const DATE_COL_W = 56
const CHECK_COL_W = 40
const MEMBER_COL_W = CHECK_COL_W * 2
const BTN_SIZE = 22

const btnStyle = (checked, type) => ({
  width: BTN_SIZE, height: BTN_SIZE, borderRadius: '50%',
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
  fontSize: 10, cursor: 'pointer',
  border: checked ? 'none' : '1.5px solid #CCCCCC',
  background: checked ? (type === 'worship' ? '#E8F0FE' : '#FEF7E0') : 'transparent',
  color: checked ? (type === 'worship' ? '#4285F4' : '#F9AB00') : 'transparent',
  transition: 'all 0.15s',
})

export default function AttendanceHistoryPage() {
  const navigate = useNavigate()
  const { user } = useAuth()

  const now = new Date()
  const [selectedYear, setSelectedYear] = useState(now.getFullYear())
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1)
  const [attendance, setAttendance] = useState({})
  const [saved, setSaved] = useState(false)

  const sundays = getSundaysOfMonth(selectedYear, selectedMonth)

  const toggle = (memberId, dateKey, type) => {
    setSaved(false)
    setAttendance((prev) => {
      const current = prev[memberId]?.[dateKey]?.[type] ?? null
      return {
        ...prev,
        [memberId]: {
          ...prev[memberId],
          [dateKey]: { ...prev[memberId]?.[dateKey], [type]: current === true ? null : true },
        },
      }
    })
  }

  const getRecord = (memberId, dateKey) =>
    attendance[memberId]?.[dateKey] || { worship: null, fam: null }

  const monthOptions = Array.from({ length: 12 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    return { year: d.getFullYear(), month: d.getMonth() + 1 }
  })

  const handleSave = () => {
    // TODO: API 연동
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const totalW = DATE_COL_W + famMembers.length * MEMBER_COL_W

  return (
    <div className="pb-24 flex flex-col" style={{ minHeight: '100dvh' }}>
      {/* 헤더 */}
      <div className="flex items-center gap-3 px-5 pt-4 pb-3 border-b border-gray-300 shrink-0">
        <button onClick={() => navigate('/my')} className="text-lg bg-transparent border-none cursor-pointer">←</button>
        <p className="text-base font-medium flex-1">출석 이력표</p>
      </div>

      {/* 팸 + 월 선택 */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-gray-300 shrink-0">
        <p className="text-sm font-medium">{user.fam}</p>
        <select
          value={`${selectedYear}-${selectedMonth}`}
          onChange={(e) => {
            const [y, m] = e.target.value.split('-').map(Number)
            setSelectedYear(y); setSelectedMonth(m)
          }}
          className="text-sm border border-gray-300 rounded-lg px-2 py-1.5 bg-white outline-none"
        >
          {monthOptions.map(({ year, month }) => (
            <option key={`${year}-${month}`} value={`${year}-${month}`}>
              {year}년 {month}월
            </option>
          ))}
        </select>
      </div>

      {/* 테이블 */}
      <div style={{ overflowX: 'auto', overflowY: 'auto', flex: 1 }}>
        <table style={{ minWidth: totalW, width: totalW, borderCollapse: 'collapse', tableLayout: 'fixed' }}>
          <colgroup>
            <col style={{ width: DATE_COL_W }} />
            {famMembers.map((m) => (
              <Fragment key={m.id}>
                <col style={{ width: CHECK_COL_W }} />
                <col style={{ width: CHECK_COL_W }} />
              </Fragment>
            ))}
          </colgroup>
          <thead>
            <tr style={{ borderBottom: '1px solid #E0E0E0', background: '#fff' }}>
              <th style={{ position: 'sticky', left: 0, background: '#fff', zIndex: 2, textAlign: 'left', fontSize: 11, color: '#888', fontWeight: 500, padding: '8px 0 8px 12px', borderRight: '1px solid #E0E0E0' }}>날짜</th>
              {famMembers.map((m) => (
                <th key={m.id} colSpan={2} style={{ textAlign: 'center', fontSize: 12, fontWeight: 600, color: '#333', padding: '8px 0', borderLeft: '1px solid #E0E0E0' }}>{m.name}</th>
              ))}
            </tr>
            <tr style={{ borderBottom: '1px solid #E0E0E0', background: '#FAFAFA' }}>
              <th style={{ position: 'sticky', left: 0, background: '#FAFAFA', zIndex: 2, borderRight: '1px solid #E0E0E0' }} />
              {famMembers.map((m) => (
                <Fragment key={m.id}>
                  <th style={{ textAlign: 'center', fontSize: 10, color: '#4285F4', fontWeight: 500, padding: '5px 0', borderLeft: '1px solid #E0E0E0' }}>예배</th>
                  <th style={{ textAlign: 'center', fontSize: 10, color: '#F9AB00', fontWeight: 500, padding: '5px 0' }}>팸</th>
                </Fragment>
              ))}
            </tr>
          </thead>
          <tbody>
            {sundays.map((s, rowIdx) => {
              const dateKey = toKey(s)
              const rowBg = rowIdx % 2 === 0 ? '#fff' : '#FAFAFA'
              return (
                <tr key={dateKey} style={{ borderBottom: '1px solid #E0E0E0', background: rowBg }}>
                  <td style={{ position: 'sticky', left: 0, background: rowBg, zIndex: 1, borderRight: '1px solid #E0E0E0', padding: '10px 0 10px 12px', whiteSpace: 'nowrap', verticalAlign: 'middle' }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: '#333' }}>{formatDate(s)}</span>
                    <span style={{ display: 'block', fontSize: 10, color: '#888', marginTop: 1 }}>일요일</span>
                  </td>
                  {famMembers.map((m) => {
                    const record = getRecord(m.id, dateKey)
                    return (
                      <Fragment key={m.id}>
                        <td style={{ textAlign: 'center', padding: '10px 0', verticalAlign: 'middle', borderLeft: '1px solid #E0E0E0' }}>
                          <button onClick={() => toggle(m.id, dateKey, 'worship')} style={btnStyle(record.worship === true, 'worship')}>✓</button>
                        </td>
                        <td style={{ textAlign: 'center', padding: '10px 0', verticalAlign: 'middle' }}>
                          <button onClick={() => toggle(m.id, dateKey, 'fam')} style={btnStyle(record.fam === true, 'fam')}>✓</button>
                        </td>
                      </Fragment>
                    )
                  })}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* 범례 */}
      <div style={{ display: 'flex', gap: 14, justifyContent: 'center', padding: '10px 0', borderTop: '1px solid #E0E0E0', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#E8F0FE', border: '1.5px solid #4285F4' }} />
          <span style={{ fontSize: 11, color: '#888' }}>예배 출석</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#FEF7E0', border: '1.5px solid #F9AB00' }} />
          <span style={{ fontSize: 11, color: '#888' }}>팸모임 출석</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <div style={{ width: 10, height: 10, borderRadius: '50%', border: '1.5px solid #CCCCCC' }} />
          <span style={{ fontSize: 11, color: '#888' }}>결석</span>
        </div>
        <span style={{ fontSize: 11, color: '#888' }}>· 탭하면 변경</span>
      </div>

      {/* 저장 버튼 */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] px-5 py-3 bg-white border-t border-gray-300">
        <button
          onClick={handleSave}
          className={`w-full py-3 rounded-lg text-sm font-medium border-none cursor-pointer transition-colors ${
            saved ? 'bg-success text-white' : 'bg-primary text-white hover:bg-primary-hover'
          }`}
        >
          {saved ? '✓ 저장되었습니다' : '출석 저장하기'}
        </button>
      </div>
    </div>
  )
}
