const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/$/, '')

function buildApiUrl(path) {
  return `${API_BASE_URL}${path}`
}

async function requestJson(path, { method = 'GET', body, fallbackMessage } = {}) {
  let response

  try {
    response = await fetch(buildApiUrl(path), {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: body === undefined ? undefined : JSON.stringify(body),
    })
  } catch {
    throw new Error('백엔드 서버에 연결할 수 없습니다. JOYHILL_BE가 실행 중인지 확인해주세요.')
  }

  const payload = await response.json().catch(() => null)

  if (!response.ok || !payload?.success) {
    throw new Error(payload?.error?.message ?? fallbackMessage ?? '요청에 실패했습니다.')
  }

  return payload?.data
}

function ensureLoginPayload(data, fallbackMessage) {
  if (!data?.user || !data?.accessToken) {
    throw new Error(fallbackMessage)
  }

  return data
}

export async function requestLogin({ phone, password }) {
  const data = await requestJson('/api/auth/login', {
    method: 'POST',
    body: {
      phone,
      password,
    },
    fallbackMessage: '로그인에 실패했습니다.',
  })

  return ensureLoginPayload(data, '로그인 응답 형식이 올바르지 않습니다.')
}
