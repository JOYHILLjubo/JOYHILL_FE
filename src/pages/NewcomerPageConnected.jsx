import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import BottomNav from '../components/BottomNav'
import { useAuth } from '../context/AuthContext'

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/$/, '')

function getTodayInputValue() {
  const now = new Date()
  const offsetDate = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
  return offsetDate.toISOString().slice(0, 10)
}

function createEmptyForm() {
  return {
    name: '',
    phone: '',
    birth: '',
    registeredAt: getTodayInputValue(),
    note: '',
  }
}

function buildApiUrl(path) {
  return `${API_BASE_URL}${path}`
}

function formatPhone(phone) {
  const digits = String(phone ?? '').replace(/\D/g, '')

  if (digits.length === 11) {
    return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`
  }

  if (digits.length === 10) {
    return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`
  }

  return String(phone ?? '').trim()
}

function getInitial(name) {
  const trimmed = String(name ?? '').trim()
  return trimmed ? trimmed[0] : 'N'
}

function nullIfBlank(value) {
  const trimmed = String(value ?? '').trim()
  return trimmed === '' ? null : trimmed
}

function mapNewcomer(item) {
  return {
    id: item?.id ?? null,
    name: item?.name ?? '',
    phone: formatPhone(item?.phone ?? ''),
    birth: item?.birth ?? '',
    registeredAt: item?.registeredAt ?? '',
    note: item?.note ?? '',
    fam: item?.famName ?? '',
  }
}

function mapFam(item) {
  return {
    name: item?.name ?? '',
    villageName: item?.villageName ?? '',
    leaderName: item?.leaderName ?? '',
  }
}

function sortNewcomers(items) {
  return [...items].sort((a, b) => {
    const dateCompare = String(b.registeredAt ?? '').localeCompare(String(a.registeredAt ?? ''))
    if (dateCompare !== 0) return dateCompare
    return Number(b.id ?? 0) - Number(a.id ?? 0)
  })
}

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
    throw new Error(
      '백엔드 서버에 연결할 수 없습니다. JOYHILL_BE가 실행 중인지 확인해주세요.',
    )
  }

  const payload = await response.json().catch(() => null)

  return { response, payload }
}

function getApiErrorMessage(result, fallbackMessage) {
  if (result.response.status === 401) {
    return '세션이 만료되었습니다. 다시 로그인해주세요.'
  }

  if (result.response.status === 403) {
    return result.payload?.error?.message ?? '새가족 관리 권한이 없습니다.'
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

function isSessionError(message) {
  return (
    typeof message === 'string' &&
    (message.includes('세션이 만료') || message.includes('다시 로그인'))
  )
}

export default function NewcomerPageConnected() {
  const navigate = useNavigate()
  const {
    user,
    accessToken,
    setAccessToken,
    logout,
    canManageNewcomer,
    isLeaderOrAbove,
    isNewFamilyTeamLeader,
  } = useAuth()

  const [newcomers, setNewcomers] = useState([])
  const [famOptions, setFamOptions] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [pageError, setPageError] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingNewcomer, setEditingNewcomer] = useState(null) // null이면 등록, 객체면 수정
  const [form, setForm] = useState(createEmptyForm())
  const [formError, setFormError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [famDropdown, setFamDropdown] = useState(null)
  const [assigningId, setAssigningId] = useState(null)
  const [deletingId, setDeletingId] = useState(null)
  const [reloadKey, setReloadKey] = useState(0)

  const accessTokenRef = useRef(accessToken)
  const canAssignFam = isLeaderOrAbove
  const canDeleteNewcomer = isLeaderOrAbove || isNewFamilyTeamLeader

  useEffect(() => {
    accessTokenRef.current = accessToken
  }, [accessToken])

  const assignableFams = useMemo(() => {
    const sortedFams = [...famOptions].sort((a, b) => {
      const villageCompare = a.villageName.localeCompare(b.villageName)
      if (villageCompare !== 0) return villageCompare
      return a.name.localeCompare(b.name)
    })

    switch (user?.role) {
      case 'leader':
        return sortedFams.filter((fam) => fam.name === user.fam)
      case 'village_leader':
        return sortedFams.filter((fam) => fam.villageName === user.village)
      default:
        return sortedFams
    }
  }, [famOptions, user?.fam, user?.role, user?.village])

  const handleExpiredSession = () => {
    logout()
    navigate('/login', { replace: true })
  }

  const callAuthedApi = async (path, options = {}) => {
    const makeRequest = (token) =>
      requestApi(path, {
        ...options,
        headers: {
          ...(options.headers ?? {}),
          Authorization: `Bearer ${token}`,
        },
      })

    let token = accessTokenRef.current

    if (!token) {
      token = await requestTokenRefresh()
      accessTokenRef.current = token
      setAccessToken(token)
    }

    let result = await makeRequest(token)

    if (result.response.status === 401) {
      token = await requestTokenRefresh()
      accessTokenRef.current = token
      setAccessToken(token)
      result = await makeRequest(token)
    }

    if (!result.response.ok || !result.payload?.success) {
      throw new Error(getApiErrorMessage(result, '요청을 처리하지 못했습니다.'))
    }

    return result.payload.data
  }

  useEffect(() => {
    let cancelled = false

    const loadData = async () => {
      setIsLoading(true)
      setPageError('')

      try {
        const newcomerData = await callAuthedApi('/api/newcomers')
        const nextNewcomers = Array.isArray(newcomerData)
          ? sortNewcomers(newcomerData.map(mapNewcomer))
          : []

        let nextFamOptions = []

        if (canAssignFam) {
          const famData = await callAuthedApi('/api/fams')
          nextFamOptions = Array.isArray(famData) ? famData.map(mapFam) : []
        }

        if (cancelled) return

        setNewcomers(nextNewcomers)
        setFamOptions(nextFamOptions)
      } catch (error) {
        const message =
          error instanceof Error ? error.message : '새가족 정보를 불러오지 못했습니다.'

        if (isSessionError(message)) {
          handleExpiredSession()
          return
        }

        if (!cancelled) {
          setPageError(message)
          setNewcomers([])
          setFamOptions([])
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false)
        }
      }
    }

    if (canManageNewcomer) {
      loadData()
    } else {
      setIsLoading(false)
    }

    return () => {
      cancelled = true
    }
  }, [reloadKey, canManageNewcomer, canAssignFam])

  const handleRetry = () => {
    setReloadKey((prev) => prev + 1)
  }

  const openCreateModal = () => {
    setEditingNewcomer(null)
    setFormError('')
    setForm(createEmptyForm())
    setShowModal(true)
  }

  const openEditModal = (newcomer) => {
    setEditingNewcomer(newcomer)
    setFormError('')
    setForm({
      name: newcomer.name,
      phone: newcomer.phone,
      birth: newcomer.birth ?? '',
      registeredAt: newcomer.registeredAt ?? getTodayInputValue(),
      note: newcomer.note ?? '',
    })
    setShowModal(true)
  }

  const handleAdd = async () => {
    if (isSubmitting) return

    const nextName = form.name.trim()
    const nextPhone = form.phone.trim()
    const nextBirth = form.birth || null
    const nextRegisteredAt = form.registeredAt || getTodayInputValue()
    const nextNote = form.note.trim()

    if (!nextName) {
      setFormError('이름을 입력해주세요.')
      return
    }

    if (!nextRegisteredAt) {
      setFormError('등록일을 선택해주세요.')
      return
    }

    setFormError('')
    setPageError('')
    setIsSubmitting(true)

    try {
      const created = await callAuthedApi('/api/newcomers', {
        method: 'POST',
        body: {
          name: nextName,
          phone: nullIfBlank(nextPhone),
          birth: nextBirth,
          registeredAt: nextRegisteredAt,
          note: nullIfBlank(nextNote),
        },
      })

      setNewcomers((prev) => sortNewcomers([mapNewcomer(created), ...prev]))
      setForm(createEmptyForm())
      setShowModal(false)
      setFamDropdown(null)
    } catch (error) {
      const message =
        error instanceof Error ? error.message : '새가족 등록에 실패했습니다.'

      if (isSessionError(message)) {
        handleExpiredSession()
        return
      }

      setFormError(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleUpdate = async () => {
    if (isSubmitting || !editingNewcomer) return

    const nextName = form.name.trim()
    const nextPhone = form.phone.trim()
    const nextBirth = form.birth || null
    const nextRegisteredAt = form.registeredAt || getTodayInputValue()
    const nextNote = form.note.trim()

    if (!nextName) {
      setFormError('이름을 입력해주세요.')
      return
    }

    setFormError('')
    setPageError('')
    setIsSubmitting(true)

    try {
      const updated = await callAuthedApi(`/api/newcomers/${editingNewcomer.id}`, {
        method: 'PATCH',
        body: {
          name: nextName,
          phone: nullIfBlank(nextPhone),
          birth: nextBirth,
          registeredAt: nextRegisteredAt,
          note: nullIfBlank(nextNote),
        },
      })

      setNewcomers((prev) =>
        sortNewcomers(prev.map((item) => (item.id === editingNewcomer.id ? mapNewcomer(updated) : item)))
      )
      setShowModal(false)
      setEditingNewcomer(null)
    } catch (error) {
      const message = error instanceof Error ? error.message : '수정에 실패했습니다.'
      if (isSessionError(message)) { handleExpiredSession(); return }
      setFormError(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const assignFam = async (newcomerId, famName) => {
    if (!canAssignFam || assigningId === newcomerId) return

    setAssigningId(newcomerId)
    setPageError('')

    try {
      const updated = await callAuthedApi(`/api/newcomers/${newcomerId}/fam`, {
        method: 'PATCH',
        body: { famName },
      })

      setNewcomers((prev) =>
        sortNewcomers(prev.map((item) => (item.id === newcomerId ? mapNewcomer(updated) : item))),
      )
      setFamDropdown(null)
    } catch (error) {
      const message =
        error instanceof Error ? error.message : '팸 배정에 실패했습니다.'

      if (isSessionError(message)) {
        handleExpiredSession()
        return
      }

      setPageError(message)
    } finally {
      setAssigningId(null)
    }
  }

  const deleteNewcomer = async (newcomerId) => {
    if (!canDeleteNewcomer || deletingId === newcomerId) return

    const shouldDelete = window.confirm('이 새가족 정보를 삭제할까요?')
    if (!shouldDelete) return

    setDeletingId(newcomerId)
    setPageError('')

    try {
      await callAuthedApi(`/api/newcomers/${newcomerId}`, {
        method: 'DELETE',
      })

      setNewcomers((prev) => prev.filter((item) => item.id !== newcomerId))
      setFamDropdown(null)
    } catch (error) {
      const message =
        error instanceof Error ? error.message : '새가족 삭제에 실패했습니다.'

      if (isSessionError(message)) {
        handleExpiredSession()
        return
      }

      setPageError(message)
    } finally {
      setDeletingId(null)
    }
  }

  if (!canManageNewcomer) {
    return (
      <div className="flex flex-col items-center justify-center h-screen pb-20">
        <p className="text-gray-500 text-sm">새가족 관리 권한이 없습니다.</p>
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
      <div className="flex items-center gap-3 px-5 pt-4 pb-3 border-b border-gray-300">
        <button
          onClick={() => navigate('/my')}
          className="text-lg bg-transparent border-none cursor-pointer"
        >
          ←
        </button>
        <p className="text-base font-medium flex-1">새가족 관리</p>
        <button
          onClick={openCreateModal}
          className="text-xs text-white bg-primary px-3 py-1.5 rounded-full border-none cursor-pointer"
        >
          + 등록
        </button>
      </div>

      {pageError && (
        <div className="px-5 pt-3">
          <div className="bg-danger-light rounded-2xl p-4">
            <p className="text-sm text-danger">{pageError}</p>
            <button
              onClick={handleRetry}
              className="mt-3 text-xs text-danger bg-white px-4 py-2 rounded-full border-none cursor-pointer"
            >
              다시 시도
            </button>
          </div>
        </div>
      )}

      <div className="px-5 pt-3 pb-1">
        <span className="text-xs text-gray-500">총 {newcomers.length}명</span>
      </div>

      <div className="px-5 pt-1">
        {isLoading ? (
          <p className="text-sm text-gray-500 text-center mt-10">새가족 정보를 불러오는 중입니다.</p>
        ) : newcomers.length === 0 ? (
          <p className="text-sm text-gray-500 text-center mt-10">등록된 새가족이 없습니다.</p>
        ) : (
          newcomers.map((newcomer) => {
            const dropdownOpen = famDropdown === newcomer.id

            return (
              <div key={newcomer.id} className="border border-gray-300 rounded-xl p-4 mb-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-primary-light flex items-center justify-center text-sm font-medium text-primary shrink-0">
                        {getInitial(newcomer.name)}
                      </div>
                      <p className="text-sm font-medium">{newcomer.name}</p>
                    </div>
                    <div className="mt-2 ml-10 flex flex-col gap-0.5">
                      {newcomer.phone && (
                        <p className="text-[12px] text-gray-500">{newcomer.phone}</p>
                      )}
                      <p className="text-[12px] text-gray-500">
                        {[newcomer.birth, newcomer.registeredAt && `등록 ${newcomer.registeredAt}`]
                          .filter(Boolean)
                          .join(' · ')}
                      </p>
                      {newcomer.note ? (
                        <p className="text-[12px] text-primary mt-0.5">{newcomer.note}</p>
                      ) : null}
                    </div>
                  </div>

                  <div className="relative shrink-0">
                    {canAssignFam ? (
                      <>
                        <button
                          onClick={() => setFamDropdown(dropdownOpen ? null : newcomer.id)}
                          disabled={assigningId === newcomer.id || assignableFams.length === 0}
                          className={`text-xs px-2.5 py-1.5 rounded-lg border-none whitespace-nowrap ${
                            newcomer.fam
                              ? 'bg-success-light text-success'
                              : 'bg-warning-light text-warning'
                          } ${
                            assigningId === newcomer.id || assignableFams.length === 0
                              ? 'opacity-60 cursor-not-allowed'
                              : 'cursor-pointer'
                          }`}
                        >
                          {assigningId === newcomer.id
                            ? '배정 중...'
                            : newcomer.fam || (assignableFams.length === 0 ? '배정 불가' : '팸 배정')}
                        </button>
                        <button
                          onClick={() => openEditModal(newcomer)}
                          className="block w-full mt-2 text-[11px] border-none bg-transparent text-gray-400 cursor-pointer"
                        >
                          수정
                        </button>
                        {canDeleteNewcomer && (
                          <button
                            onClick={() => deleteNewcomer(newcomer.id)}
                            disabled={deletingId === newcomer.id}
                            className={`block w-full mt-1 text-[11px] border-none bg-transparent ${
                              deletingId === newcomer.id
                                ? 'text-gray-400 cursor-not-allowed'
                                : 'text-danger cursor-pointer'
                            }`}
                          >
                            {deletingId === newcomer.id ? '삭제 중...' : '삭제'}
                          </button>
                        )}

                        {dropdownOpen && assignableFams.length > 0 && (
                          <div className="absolute right-0 top-9 bg-white border border-gray-300 rounded-xl shadow-lg z-20 w-40 max-h-56 overflow-y-auto">
                            {assignableFams.map((fam) => (
                              <button
                                key={fam.name}
                                onClick={() => assignFam(newcomer.id, fam.name)}
                                className={`w-full text-left px-3 py-2.5 text-sm border-none cursor-pointer hover:bg-gray-100 ${
                                  newcomer.fam === fam.name ? 'bg-primary-light text-primary font-medium' : ''
                                }`}
                              >
                                <p>{fam.name}</p>
                                <p className="text-[11px] text-gray-500 mt-0.5">{fam.villageName}</p>
                              </button>
                            ))}
                          </div>
                        )}
                      </>
                    ) : canDeleteNewcomer ? (
                      <div className="flex flex-col items-end gap-1">
                        <div
                          className={`text-xs px-2.5 py-1.5 rounded-lg ${
                            newcomer.fam
                              ? 'bg-success-light text-success'
                              : 'bg-gray-100 text-gray-500'
                          }`}
                        >
                          {newcomer.fam || '미배정'}
                        </div>
                        <button
                          onClick={() => openEditModal(newcomer)}
                          className="text-[11px] border-none bg-transparent text-gray-400 cursor-pointer"
                        >
                          수정
                        </button>
                        <button
                          onClick={() => deleteNewcomer(newcomer.id)}
                          disabled={deletingId === newcomer.id}
                          className={`text-[11px] border-none bg-transparent ${
                            deletingId === newcomer.id
                              ? 'text-gray-400 cursor-not-allowed'
                              : 'text-danger cursor-pointer'
                          }`}
                        >
                          {deletingId === newcomer.id ? '삭제 중...' : '삭제'}
                        </button>
                      </div>
                    ) : (
                      <div
                        className={`text-xs px-2.5 py-1.5 rounded-lg ${
                          newcomer.fam
                            ? 'bg-success-light text-success'
                            : 'bg-gray-100 text-gray-500'
                        }`}
                      >
                        {newcomer.fam || '미배정'}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>

      {famDropdown !== null && <div className="fixed inset-0 z-10" onClick={() => setFamDropdown(null)} />}

      {showModal && (
        <div
          className="fixed inset-0 bg-black/40 z-50 flex items-end justify-center"
          onClick={() => {
            if (isSubmitting) return
            setShowModal(false)
          }}
        >
          <div
            className="bg-white rounded-t-2xl w-full max-w-[430px] p-5 pb-10 mb-10"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <p className="text-base font-medium">{editingNewcomer ? '새가족 수정' : '새가족 등록'}</p>
              <button
                onClick={() => {
                  if (isSubmitting) return
                  setShowModal(false)
                }}
                className="text-gray-500 text-lg bg-transparent border-none cursor-pointer"
              >
                ×
              </button>
            </div>

            <div className="flex flex-col gap-3">
              <input
                placeholder="이름 *"
                value={form.name}
                onChange={(event) => {
                  setForm((prev) => ({ ...prev, name: event.target.value }))
                  setFormError('')
                }}
                disabled={isSubmitting}
                className="border border-gray-300 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-primary"
              />
              <input
                placeholder="연락처 (010-0000-0000)"
                value={form.phone}
                onChange={(event) => {
                  setForm((prev) => ({ ...prev, phone: event.target.value }))
                  setFormError('')
                }}
                disabled={isSubmitting}
                className="border border-gray-300 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-primary"
              />
              <div>
                <p className="text-[11px] text-gray-500 mb-1 ml-1">생년월일</p>
                <input
                  type="date"
                  value={form.birth}
                  onChange={(event) => {
                    setForm((prev) => ({ ...prev, birth: event.target.value }))
                    setFormError('')
                  }}
                  disabled={isSubmitting}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-primary"
                />
              </div>
              <div>
                <p className="text-[11px] text-gray-500 mb-1 ml-1">등록일</p>
                <input
                  type="date"
                  value={form.registeredAt}
                  onChange={(event) => {
                    setForm((prev) => ({ ...prev, registeredAt: event.target.value }))
                    setFormError('')
                  }}
                  disabled={isSubmitting}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-primary"
                />
              </div>
              <textarea
                placeholder="기타 특이사항"
                value={form.note}
                onChange={(event) => {
                  setForm((prev) => ({ ...prev, note: event.target.value }))
                  setFormError('')
                }}
                disabled={isSubmitting}
                rows={2}
                className="border border-gray-300 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-primary resize-none"
              />
            </div>

            {formError && <p className="mt-3 text-[12px] text-danger">{formError}</p>}

            <button
              onClick={editingNewcomer ? handleUpdate : handleAdd}
              disabled={isSubmitting}
              className={`w-full mt-4 py-3 rounded-lg text-sm font-medium border-none ${
                isSubmitting
                  ? 'bg-gray-300 text-white cursor-not-allowed'
                  : 'bg-primary text-white cursor-pointer'
              }`}
            >
              {isSubmitting ? (editingNewcomer ? '수정 중...' : '등록 중...') : (editingNewcomer ? '수정하기' : '등록하기')}
            </button>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  )
}
