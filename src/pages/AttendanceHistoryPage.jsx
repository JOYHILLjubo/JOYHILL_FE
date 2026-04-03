import { Fragment, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/$/, '')

const FAM_ROLE_LABELS = {
  admin: '관리자',
  pastor: '교역자',
  village_leader: '마을장',
  leader: '리더',
  member: '팸원',
}

const CHECK_COL_W = 40
const MEMBER_NAME_COL_W = 72
const DATE_GROUP_W = CHECK_COL_W * 2
const BTN_SIZE = 22

function buildApiUrl(path) {
  return `${API_BASE_URL}${path}`
}

function getSundaysOfMonth(year, month) {
  const sundays = []
  const date = new Date(year, month - 1, 1)

  while (date.getDay() !== 0) {
    date.setDate(date.getDate() + 1)
  }

  while (date.getMonth() === month - 1) {
    sundays.push(new Date(date))
    date.setDate(date.getDate() + 7)
  }

  return sundays
}

function toKey(date) {
  return date.toISOString().slice(0, 10)
}

function formatDate(date) {
  return `${date.getMonth() + 1}/${date.getDate()}`
}

function normalizeDateKey(value) {
  if (Array.isArray(value) && value.length >= 3) {
    const [year, month, day] = value
    return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
  }

  return String(value ?? '').slice(0, 10)
}

function buildAttendanceMap(records) {
  const next = {}

  records.forEach((record) => {
    const memberId = record.famMemberId
    const dateKey = normalizeDateKey(record.date)

    if (!memberId || !dateKey) return

    next[memberId] = {
      ...next[memberId],
      [dateKey]: {
        worship: record.worshipPresent === true,
        fam: record.famPresent === true,
      },
    }
  })

  return next
}

function mapFamMembers(items) {
  return items.map((item) => ({
    id: item.id,
    name: item.name ?? '',
    role: item.role ?? 'member',
  }))
}

const btnStyle = (checked, type) => ({
  width: BTN_SIZE,
  height: BTN_SIZE,
  borderRadius: '50%',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: 10,
  cursor: 'pointer',
  border: checked ? 'none' : '1.5px solid #CCCCCC',
  background: checked ? (type === 'worship' ? '#E8F0FE' : '#FEF7E0') : 'transparent',
  color: checked ? (type === 'worship' ? '#4285F4' : '#F9AB00') : 'transparent',
  transition: 'all 0.15s',
})

async function requestApi(path, { method = 'GET', headers = {}, body } = {}) {
  const requestOptions = {
    method,
    headers: { ...headers },
    credentials: 'include',
  }

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
  if (result.response.status === 401) {
    return '세션이 만료되었습니다. 다시 로그인해주세요.'
  }

  if (result.response.status === 403) {
    return '권한이 없습니다.'
  }

  return result.payload?.error?.message ?? fallbackMessage
}

async function requestTokenRefresh() {
  const result = await requestApi('/api/auth/refresh', {
    method: 'POST',
  })

  if (!result.response.ok || !result.payload?.success || !result.payload?.data?.accessToken) {
    throw new Error(getApiErrorMessage(result, '세션이 만료되었습니다. 다시 로그인해주세요.'))
  }

  return result.payload.data.accessToken
}

export default function AttendanceHistoryPage() {
  const navigate = useNavigate()
  const { user, accessToken, setAccessToken, logout } = useAuth()

  const now = new Date()
  const [selectedYear, setSelectedYear] = useState(now.getFullYear())
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1)
  const [famMembers, setFamMembers] = useState([])
  const [attendance, setAttendance] = useState({})
  const [saved, setSaved] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [pageError, setPageError] = useState('')
  const [saveError, setSaveError] = useState('')

  const famName = user?.fam ?? ''
  const sundays = useMemo(
    () => getSundaysOfMonth(selectedYear, selectedMonth),
    [selectedYear, selectedMonth],
  )

  const monthOptions = useMemo(
    () => {
      const today = new Date()

      return Array.from({ length: 12 }, (_, index) => {
        const date = new Date(today.getFullYear(), today.getMonth() - index, 1)
        return { year: date.getFullYear(), month: date.getMonth() + 1 }
      })
    },
    [],
  )

  const handleExpiredSession = () => {
    logout()
    navigate('/login', { replace: true })
  }

  const callAuthedApi = async (path, options = {}) => {
    try {
      let token = accessToken

      if (!token) {
        token = await requestTokenRefresh()
        setAccessToken(token)
      }

      let result = await requestApi(path, {
        ...options,
        headers: {
          ...(options.headers ?? {}),
          Authorization: `Bearer ${token}`,
        },
      })

      if (result.response.status === 401) {
        token = await requestTokenRefresh()
        setAccessToken(token)

        result = await requestApi(path, {
          ...options,
          headers: {
            ...(options.headers ?? {}),
            Authorization: `Bearer ${token}`,
          },
        })
      }

      if (!result.response.ok || !result.payload?.success) {
        throw new Error(getApiErrorMessage(result, '요청을 처리하지 못했습니다.'))
      }

      return result.payload.data
    } catch (err) {
      if (err instanceof Error && err.message.includes('다시 로그인')) {
        handleExpiredSession()
      }

      throw err
    }
  }

  const loadData = async () => {
    if (!famName) {
      setPageError('소속 팸 정보가 없어 출석 이력을 불러올 수 없습니다.')
      setFamMembers([])
      setAttendance({})
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setPageError('')
    setSaveError('')
    setSaved(false)

    try {
      const historyParams = new URLSearchParams({
        famName,
        year: String(selectedYear),
        month: String(selectedMonth),
      })

      const [membersData, historyData] = await Promise.all([
        callAuthedApi(`/api/fams/${encodeURIComponent(famName)}/members?period=1month`),
        callAuthedApi(`/api/attendance/history?${historyParams.toString()}`),
      ])

      setFamMembers(Array.isArray(membersData) ? mapFamMembers(membersData) : [])
      setAttendance(Array.isArray(historyData) ? buildAttendanceMap(historyData) : {})
    } catch (err) {
      setPageError(err instanceof Error ? err.message : '출석 이력을 불러오지 못했습니다.')
      setFamMembers([])
      setAttendance({})
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    void loadData()
  }, [famName, selectedYear, selectedMonth])

  useEffect(() => {
    if (!saved) return undefined

    const timeoutId = window.setTimeout(() => {
      setSaved(false)
    }, 2000)

    return () => window.clearTimeout(timeoutId)
  }, [saved])

  const toggle = (memberId, dateKey, type) => {
    setSaved(false)
    setSaveError('')
    setAttendance((prev) => {
      const current = prev[memberId]?.[dateKey]?.[type] ?? null

      return {
        ...prev,
        [memberId]: {
          ...prev[memberId],
          [dateKey]: {
            ...prev[memberId]?.[dateKey],
            [type]: current === true ? null : true,
          },
        },
      }
    })
  }

  const getRecord = (memberId, dateKey) =>
    attendance[memberId]?.[dateKey] || { worship: null, fam: null }

  const handleSave = async () => {
    if (!famName) {
      setSaveError('소속 팸 정보가 없어 저장할 수 없습니다.')
      return
    }

    if (famMembers.length === 0) {
      setSaveError('저장할 팸원이 없습니다.')
      return
    }

    setIsSaving(true)
    setSaveError('')
    setSaved(false)

    try {
      await Promise.all(
        sundays.map((date) => {
          const dateKey = toKey(date)

          return callAuthedApi('/api/attendance', {
            method: 'POST',
            body: {
              famName,
              date: dateKey,
              records: famMembers.map((member) => {
                const record = getRecord(member.id, dateKey)

                return {
                  famMemberId: member.id,
                  worshipPresent: record.worship === true,
                  famPresent: record.fam === true,
                }
              }),
            },
          })
        }),
      )

      setSaved(true)
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : '출석 저장에 실패했습니다.')
    } finally {
      setIsSaving(false)
    }
  }

  const totalW = MEMBER_NAME_COL_W + sundays.length * DATE_GROUP_W

  return (
    <div className="pb-24 flex flex-col" style={{ minHeight: '100dvh' }}>
      <div className="flex items-center gap-3 px-5 pt-4 pb-3 border-b border-gray-300 shrink-0">
        <button
          onClick={() => navigate('/my')}
          className="text-lg bg-transparent border-none cursor-pointer"
        >
          ←
        </button>
        <p className="text-base font-medium flex-1">출석 이력표</p>
      </div>

      <div className="flex items-center justify-between px-5 py-3 border-b border-gray-300 shrink-0">
        <p className="text-sm font-medium">{famName || '소속 팸 없음'}</p>
        <select
          value={`${selectedYear}-${selectedMonth}`}
          onChange={(e) => {
            const [year, month] = e.target.value.split('-').map(Number)
            setSelectedYear(year)
            setSelectedMonth(month)
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

      {pageError && (
        <div className="px-5 pt-3">
          <div className="border border-danger-light bg-danger-light rounded-xl px-4 py-3">
            <p className="text-xs text-danger">{pageError}</p>
            <button
              onClick={() => void loadData()}
              className="mt-2 text-xs text-danger bg-white px-3 py-1.5 rounded-full border border-danger-light cursor-pointer"
            >
              다시 시도
            </button>
          </div>
        </div>
      )}

      <div style={{ overflowX: 'auto', overflowY: 'auto', flex: 1 }}>
        <table
          style={{
            minWidth: totalW,
            width: totalW,
            borderCollapse: 'collapse',
            tableLayout: 'fixed',
          }}
        >
          <colgroup>
            <col style={{ width: MEMBER_NAME_COL_W }} />
            {sundays.map((sunday) => (
              <Fragment key={toKey(sunday)}>
                <col style={{ width: CHECK_COL_W }} />
                <col style={{ width: CHECK_COL_W }} />
              </Fragment>
            ))}
          </colgroup>
          <thead>
            <tr style={{ borderBottom: '1px solid #E0E0E0', background: '#fff' }}>
              <th
                rowSpan={2}
                style={{
                  position: 'sticky',
                  left: 0,
                  background: '#fff',
                  zIndex: 2,
                  textAlign: 'left',
                  fontSize: 11,
                  color: '#888',
                  fontWeight: 500,
                  padding: '8px 0 8px 12px',
                  borderRight: '1px solid #E0E0E0',
                }}
              >
                이름
              </th>
              {sundays.map((sunday) => (
                <th
                  key={toKey(sunday)}
                  colSpan={2}
                  style={{
                    textAlign: 'center',
                    fontSize: 12,
                    fontWeight: 600,
                    color: '#333',
                    padding: '8px 0',
                    borderLeft: '1px solid #E0E0E0',
                  }}
                >
                  {formatDate(sunday)}
                </th>
              ))}
            </tr>
            <tr style={{ borderBottom: '1px solid #E0E0E0', background: '#FAFAFA' }}>
              {sundays.map((sunday) => (
                <Fragment key={toKey(sunday)}>
                  <th
                    style={{
                      textAlign: 'center',
                      fontSize: 10,
                      color: '#4285F4',
                      fontWeight: 500,
                      padding: '5px 0',
                      borderLeft: '1px solid #E0E0E0',
                    }}
                  >
                    예배
                  </th>
                  <th
                    style={{
                      textAlign: 'center',
                      fontSize: 10,
                      color: '#F9AB00',
                      fontWeight: 500,
                      padding: '5px 0',
                    }}
                  >
                    팸
                  </th>
                </Fragment>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td
                  colSpan={1 + sundays.length * 2}
                  style={{ textAlign: 'center', padding: '32px 12px', color: '#888', fontSize: 13 }}
                >
                  출석 이력을 불러오는 중입니다.
                </td>
              </tr>
            ) : famMembers.length === 0 ? (
              <tr>
                <td
                  colSpan={1 + sundays.length * 2}
                  style={{ textAlign: 'center', padding: '32px 12px', color: '#888', fontSize: 13 }}
                >
                  등록된 팸원이 없습니다.
                </td>
              </tr>
            ) : (
              famMembers.map((member, rowIndex) => {
                const rowBg = rowIndex % 2 === 0 ? '#fff' : '#FAFAFA'

                return (
                  <tr
                    key={member.id}
                    style={{ borderBottom: '1px solid #E0E0E0', background: rowBg }}
                  >
                    <td
                      style={{
                        position: 'sticky',
                        left: 0,
                        background: rowBg,
                        zIndex: 1,
                        borderRight: '1px solid #E0E0E0',
                        padding: '10px 0 10px 12px',
                        whiteSpace: 'nowrap',
                        verticalAlign: 'middle',
                      }}
                    >
                      <span style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#333' }}>
                        {member.name}
                      </span>
                      <span style={{ display: 'block', fontSize: 10, color: '#888', marginTop: 2 }}>
                        {FAM_ROLE_LABELS[member.role] ?? member.role}
                      </span>
                    </td>
                    {sundays.map((sunday) => {
                      const dateKey = toKey(sunday)
                      const record = getRecord(member.id, dateKey)

                      return (
                        <Fragment key={dateKey}>
                          <td
                            style={{
                              textAlign: 'center',
                              padding: '10px 0',
                              verticalAlign: 'middle',
                              borderLeft: '1px solid #E0E0E0',
                            }}
                          >
                            <button
                              onClick={() => toggle(member.id, dateKey, 'worship')}
                              style={btnStyle(record.worship === true, 'worship')}
                            >
                              ✓
                            </button>
                          </td>
                          <td style={{ textAlign: 'center', padding: '10px 0', verticalAlign: 'middle' }}>
                            <button
                              onClick={() => toggle(member.id, dateKey, 'fam')}
                              style={btnStyle(record.fam === true, 'fam')}
                            >
                              ✓
                            </button>
                          </td>
                        </Fragment>
                      )
                    })}
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      <div
        style={{
          display: 'flex',
          gap: 14,
          justifyContent: 'center',
          padding: '10px 0',
          borderTop: '1px solid #E0E0E0',
          flexShrink: 0,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <div
            style={{
              width: 10,
              height: 10,
              borderRadius: '50%',
              background: '#E8F0FE',
              border: '1.5px solid #4285F4',
            }}
          />
          <span style={{ fontSize: 11, color: '#888' }}>예배 출석</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <div
            style={{
              width: 10,
              height: 10,
              borderRadius: '50%',
              background: '#FEF7E0',
              border: '1.5px solid #F9AB00',
            }}
          />
          <span style={{ fontSize: 11, color: '#888' }}>팸모임 출석</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <div
            style={{
              width: 10,
              height: 10,
              borderRadius: '50%',
              border: '1.5px solid #CCCCCC',
            }}
          />
          <span style={{ fontSize: 11, color: '#888' }}>결석</span>
        </div>
        <span style={{ fontSize: 11, color: '#888' }}>· 탭하면 변경</span>
      </div>

      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] px-5 py-3 bg-white border-t border-gray-300">
        {saveError && <p className="text-xs text-danger mb-2">{saveError}</p>}
        <button
          onClick={handleSave}
          disabled={isLoading || isSaving || famMembers.length === 0}
          className={`w-full py-3 rounded-lg text-sm font-medium border-none transition-colors ${
            saved ? 'bg-success text-white' : 'bg-primary text-white hover:bg-primary-hover'
          } ${
            isLoading || isSaving || famMembers.length === 0
              ? 'cursor-not-allowed opacity-60'
              : 'cursor-pointer'
          }`}
        >
          {isSaving ? '저장 중...' : saved ? '✓ 저장되었습니다' : '출석 저장하기'}
        </button>
      </div>
    </div>
  )
}
