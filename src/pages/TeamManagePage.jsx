import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import BottomNav from '../components/BottomNav'

const avatarColors = [
  { bg: 'bg-success-light', text: 'text-success' },
  { bg: 'bg-primary-light', text: 'text-primary' },
  { bg: 'bg-warning-light', text: 'text-warning' },
  { bg: 'bg-danger-light', text: 'text-danger' },
]

// 더미 팀원 데이터
const DUMMY_TEAM_MEMBERS = {
  찬양팀: [
    { id: 1, name: '김리더', fam: '사랑팸', role: '팀장' },
    { id: 2, name: '이은혜', fam: '은혜팸', role: '팀원' },
    { id: 3, name: '박찬양', fam: '믿음팸', role: '팀원' },
    { id: 4, name: '정소망', fam: '소망팸', role: '팀원' },
  ],
  새가족팀: [
    { id: 5, name: '한환영', fam: '기쁨팸', role: '팀장' },
    { id: 6, name: '최새벽', fam: '평화팸', role: '팀원' },
  ],
  예배팀: [
    { id: 7, name: '조예배', fam: '인내팸', role: '팀장' },
    { id: 8, name: '송은총', fam: '온유팸', role: '팀원' },
  ],
}

export default function TeamManagePage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, canManageTeam } = useAuth()

  // MY에서 넘어온 팀 이름. 없으면 팀장인 첫 번째 팀
  const teamFromState = location.state?.team
  const defaultTeam = teamFromState || user.teamRoles[0] || ''

  const [selectedTeam, setSelectedTeam] = useState(defaultTeam)
  const [tab, setTab] = useState('members') // 'members' | 'intro'
  const [intro, setIntro] = useState('우리 팀을 소개합니다.')
  const [editingIntro, setEditingIntro] = useState(false)

  const members = DUMMY_TEAM_MEMBERS[selectedTeam] || []

  // 접근 권한 없으면 차단
  if (!canManageTeam) {
    return (
      <div className="flex flex-col items-center justify-center h-screen pb-20">
        <p className="text-gray-500 text-sm">접근 권한이 없습니다.</p>
        <button
          onClick={() => navigate('/my')}
          className="mt-3 text-xs text-primary bg-primary-light px-4 py-2 rounded-full border-none cursor-pointer"
        >
          돌아가기
        </button>
        <BottomNav />
      </div>
    )
  }

  return (
    <div className="pb-24">
      {/* 헤더 */}
      <div className="flex items-center gap-3 px-5 pt-4 pb-3 border-b border-gray-300">
        <button
          onClick={() => navigate('/my')}
          className="text-lg bg-transparent border-none cursor-pointer"
        >
          ←
        </button>
        <p className="text-base font-medium flex-1">사역팀 관리</p>
      </div>

      {/* 팀 선택 탭 — 팀장인 팀이 여러 개일 때 */}
      {user.teamRoles.length > 1 && (
        <div className="flex gap-2 px-5 py-3 overflow-x-auto border-b border-gray-300">
          {user.teamRoles.map((team) => (
            <button
              key={team}
              onClick={() => setSelectedTeam(team)}
              className={`text-xs px-3 py-1.5 rounded-full border-none cursor-pointer whitespace-nowrap transition-colors ${
                selectedTeam === team
                  ? 'bg-warning-light text-warning font-medium'
                  : 'bg-gray-100 text-gray-500'
              }`}
            >
              {team}
            </button>
          ))}
        </div>
      )}

      {/* 팀 이름 + 탭 */}
      <div className="px-5 pt-4 pb-0">
        <p className="text-base font-medium mb-3">{selectedTeam}</p>
        <div className="flex border-b border-gray-300">
          {[
            { key: 'members', label: '팀원 관리' },
            { key: 'intro', label: '팀 소개' },
          ].map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex-1 py-2.5 text-sm border-none cursor-pointer bg-transparent transition-colors ${
                tab === t.key
                  ? 'text-primary font-medium border-b-2 border-primary'
                  : 'text-gray-500'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* 팀원 관리 탭 */}
      {tab === 'members' && (
        <div className="px-5 pt-3">
          <div className="flex justify-between items-center mb-3">
            <span className="text-xs text-gray-500">총 {members.length}명</span>
            <button className="text-xs text-primary bg-primary-light px-3 py-1.5 rounded-full border-none cursor-pointer">
              + 팀원 추가
            </button>
          </div>
          {members.map((m) => {
            const color = avatarColors[m.id % avatarColors.length]
            return (
              <div
                key={m.id}
                className="flex items-center py-3 border-b border-gray-300 last:border-b-0"
              >
                <div
                  className={`w-9 h-9 rounded-full ${color.bg} flex items-center justify-center text-[13px] font-medium ${color.text} shrink-0`}
                >
                  {m.name[0]}
                </div>
                <div className="flex-1 ml-3">
                  <p className="text-sm">{m.name}</p>
                  <p className="text-[11px] text-gray-500">{m.fam}</p>
                </div>
                <span
                  className={`text-[11px] px-2 py-0.5 rounded-full mr-2 ${
                    m.role === '팀장'
                      ? 'bg-warning-light text-warning'
                      : 'bg-gray-100 text-gray-500'
                  }`}
                >
                  {m.role}
                </span>
                <button className="text-[11px] text-danger bg-danger-light px-2 py-0.5 rounded-full border-none cursor-pointer">
                  제거
                </button>
              </div>
            )
          })}
        </div>
      )}

      {/* 팀 소개 탭 */}
      {tab === 'intro' && (
        <div className="px-5 pt-4">
          {editingIntro ? (
            <>
              <textarea
                value={intro}
                onChange={(e) => setIntro(e.target.value)}
                rows={6}
                className="w-full border border-primary rounded-lg px-3 py-2.5 text-sm outline-none resize-none"
              />
              <div className="flex gap-2 mt-3">
                <button
                  onClick={() => setEditingIntro(false)}
                  className="flex-1 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-500 bg-white cursor-pointer"
                >
                  취소
                </button>
                <button
                  onClick={() => setEditingIntro(false)}
                  className="flex-1 py-2.5 bg-primary text-white rounded-lg text-sm font-medium border-none cursor-pointer"
                >
                  저장
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="border border-gray-300 rounded-xl p-4 min-h-[120px]">
                <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {intro}
                </p>
              </div>
              <button
                onClick={() => setEditingIntro(true)}
                className="w-full mt-3 py-2.5 border border-primary text-primary rounded-lg text-sm cursor-pointer bg-white"
              >
                소개 수정
              </button>
            </>
          )}
        </div>
      )}

      <BottomNav />
    </div>
  )
}
