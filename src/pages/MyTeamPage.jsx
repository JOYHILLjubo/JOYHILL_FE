import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import BottomNav from '../components/BottomNav'

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/$/, '')

const avatarColors = [
  { bg: 'bg-success-light', text: 'text-success' },
  { bg: 'bg-primary-light', text: 'text-primary' },
  { bg: 'bg-warning-light', text: 'text-warning' },
  { bg: 'bg-danger-light', text: 'text-danger' },
]

function getColor(seed) {
  return avatarColors[Math.abs(Number(seed) || 0) % avatarColors.length]
}

function getInitial(name) {
  return String(name ?? '').trim()[0] ?? 'T'
}

function formatPhone(phone) {
  const digits = String(phone ?? '').replace(/\D/g, '')
  if (digits.length === 11) return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`
  if (digits.length === 10) return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`
  return String(phone ?? '').trim()
}

function formatBirth(birth) {
  if (!birth || birth.length !== 6) return ''
  const yy = parseInt(birth.slice(0, 2), 10)
  const mm = birth.slice(2, 4)
  const dd = birth.slice(4, 6)
  const yyyy = yy <= 30 ? 2000 + yy : 1900 + yy
  return `${yyyy}.${mm}.${dd}`
}

async function requestApi(path, { method = 'GET', headers = {}, body } = {}) {
  const requestOptions = { method, headers: { ...headers }, credentials: 'include' }
  if (body !== undefined) {
    requestOptions.body = JSON.stringify(body)
    requestOptions.headers['Content-Type'] = 'application/json'
  }
  let response
  try { response = await fetch(`${API_BASE_URL}${path}`, requestOptions) }
  catch { throw new Error('백엔드 서버에 연결할 수 없습니다.') }
  const payload = await response.json().catch(() => null)
  return { response, payload }
}

async function requestTokenRefresh() {
  const result = await requestApi('/api/auth/refresh', { method: 'POST' })
  if (!result.response.ok || !result.payload?.success || !result.payload?.data?.accessToken) {
    throw new Error('세션이 만료되었습니다. 다시 로그인해주세요.')
  }
  return result.payload.data.accessToken
}

export default function MyTeamPage() {
  const navigate = useNavigate()
  const { user, accessToken, setAccessToken, logout } = useAuth()

  const myTeams = user?.teams ?? []
  const [selectedTeam, setSelectedTeam] = useState(myTeams[0] ?? '')
  const [members, setMembers] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const callAuthedApi = async (path) => {
    let token = accessToken
    if (!token) { token = await requestTokenRefresh(); setAccessToken(token) }
    let result = await requestApi(path, { headers: { Authorization: `Bearer ${token}` } })
    if (result.response.status === 401) {
      token = await requestTokenRefresh(); setAccessToken(token)
      result = await requestApi(path, { headers: { Authorization: `Bearer ${token}` } })
    }
    if (!result.response.ok || !result.payload?.success) {
      const msg = result.payload?.error?.message ?? '불러오지 못했습니다.'
      if (result.response.status === 401) { logout(); navigate('/login', { replace: true }) }
      throw new Error(msg)
    }
    return result.payload.data
  }

  useEffect(() => {
    if (!selectedTeam) return
    let cancelled = false
    setIsLoading(true)
    setError('')
    callAuthedApi(`/api/teams/${encodeURIComponent(selectedTeam)}/members`)
      .then((data) => {
        if (cancelled) return
        setMembers(Array.isArray(data) ? data : [])
      })
      .catch((err) => { if (!cancelled) setError(err.message) })
      .finally(() => { if (!cancelled) setIsLoading(false) })
    return () => { cancelled = true }
  }, [selectedTeam, accessToken])

  if (myTeams.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-screen pb-20">
        <p className="text-gray-500 text-sm">소속된 사역팀이 없습니다.</p>
        <button onClick={() => navigate('/my')} className="mt-3 text-xs text-primary bg-primary-light px-4 py-2 rounded-full border-none cursor-pointer">돌아가기</button>
        <BottomNav />
      </div>
    )
  }

  return (
    <div className="pb-24">
      <div className="flex items-center gap-3 px-5 pt-4 pb-3 border-b border-gray-300">
        <button onClick={() => navigate('/my')} className="text-lg bg-transparent border-none cursor-pointer">←</button>
        <p className="text-base font-medium flex-1">내 사역팀</p>
      </div>

      {myTeams.length > 1 && (
        <div className="flex gap-2 px-5 py-3 overflow-x-auto border-b border-gray-300">
          {myTeams.map((team) => (
            <button
              key={team}
              onClick={() => setSelectedTeam(team)}
              className={`text-xs px-3 py-1.5 rounded-full border-none cursor-pointer whitespace-nowrap transition-colors ${
                selectedTeam === team ? 'bg-primary-light text-primary font-medium' : 'bg-gray-100 text-gray-500'
              }`}
            >
              {team}
            </button>
          ))}
        </div>
      )}

      <div className="px-5 pt-4">
        <p className="text-base font-medium mb-1">{selectedTeam}</p>
        <p className="text-xs text-gray-500 mb-4">총 {members.length}명</p>

        {error && (
          <div className="bg-danger-light rounded-xl px-4 py-3 mb-3">
            <p className="text-xs text-danger">{error}</p>
          </div>
        )}

        {isLoading ? (
          <p className="text-sm text-gray-500 text-center py-10">팀원 정보를 불러오는 중입니다.</p>
        ) : members.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-10">등록된 팀원이 없습니다.</p>
        ) : (
          members.map((item) => {
            const color = getColor(item.userId)
            const subInfo = [item.famName, formatPhone(item.phone), formatBirth(item.birth)].filter(Boolean).join(' · ')
            return (
              <div key={item.userId} className="flex items-center py-3 border-b border-gray-300 last:border-b-0">
                <div className={`w-9 h-9 rounded-full ${color.bg} flex items-center justify-center text-[13px] font-medium ${color.text} shrink-0`}>
                  {getInitial(item.name)}
                </div>
                <div className="flex-1 ml-3">
                  <p className="text-sm">{item.name}</p>
                  <p className="text-[11px] text-gray-500">{subInfo}</p>
                </div>
                <span className={`text-[11px] px-2 py-0.5 rounded-full ${
                  item.isLeader ? 'bg-warning-light text-warning' : 'bg-gray-100 text-gray-500'
                }`}>
                  {item.isLeader ? '팀장' : '팀원'}
                </span>
              </div>
            )
          })
        )}
      </div>

      <BottomNav />
    </div>
  )
}
