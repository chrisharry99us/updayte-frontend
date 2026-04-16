// Local dev: set VITE_API_BASE in .env.local (see .env.example). Backend .env holds Railway DATABASE_URL.
const BASE = import.meta.env.VITE_API_BASE || 'https://updayte-production.up.railway.app'

function getToken() { return sessionStorage.getItem('updayte_token') }
export function setToken(t) { sessionStorage.setItem('updayte_token', t) }
export function clearToken() { sessionStorage.removeItem('updayte_token') }

function formatFastApiDetail(detail) {
  if (detail == null || detail === '') return ''
  if (typeof detail === 'string') return detail
  if (Array.isArray(detail)) {
    return detail
      .map((x) => (typeof x === 'string' ? x : x.msg || x.message || JSON.stringify(x)))
      .filter(Boolean)
      .join('\n')
  }
  if (typeof detail === 'object' && detail.msg) return detail.msg
  return String(detail)
}

async function request(path, options = {}) {
  const token = getToken()
  const res = await fetch(BASE + path, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: 'Bearer ' + token } : {}),
      ...options.headers,
    },
  })
  if (res.status === 401 && token) {
    clearToken()
    window.location.reload()
    return
  }
  return res.json()
}

/** Like request but throws Error with FastAPI `detail` text on non-OK (for onboarding and mutations that need messages). */
async function requestExpectOk(path, options = {}) {
  const token = getToken()
  const res = await fetch(BASE + path, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: 'Bearer ' + token } : {}),
      ...options.headers,
    },
  })
  const data = await res.json().catch(() => ({}))
  if (res.status === 401 && token) {
    clearToken()
    window.location.reload()
    return
  }
  if (!res.ok) {
    throw new Error(formatFastApiDetail(data.detail) || `Request failed (${res.status})`)
  }
  return data
}

export async function login(username, password) {
  const data = await request('/auth/login', { method: 'POST', body: JSON.stringify({ username, password }) })
  if (data && data.access_token) { setToken(data.access_token); return true }
  return false
}

export async function loginWithGoogle(credential) {
  const data = await request('/auth/google', { method: 'POST', body: JSON.stringify({ credential }) })
  if (data && data.access_token) { setToken(data.access_token); return true }
  return false
}

export const fetchGeneral      = ()      => request('/feeds/general')
export const fetchPersonalised = ()      => request('/feeds/personalised')
export const fetchFollowing    = (topic) => request('/feeds/following/' + encodeURIComponent(topic))
export const fetchStatus       = ()      => request('/ingest/status')
export const starArticle       = (id)    => request('/feedback/star',   { method: 'POST', body: JSON.stringify({ article_id: id }) })
export const unstarArticle     = (id)    => request('/feedback/unstar', { method: 'POST', body: JSON.stringify({ article_id: id }) })
export const followTopic       = (t, d)  => request('/feedback/follow', { method: 'POST', body: JSON.stringify({ topic: t, domain: d || 'AI/ML' }) })

// Onboarding
export const fetchOnboardingStatus = () => request('/onboarding/status')
export const generateOnboarding = (raw) =>
  requestExpectOk('/onboarding/generate', {
    method: 'POST',
    body: JSON.stringify({ raw_input: raw }),
  })
export const confirmOnboarding = (selectedTopics) =>
  requestExpectOk('/onboarding/confirm', {
    method: 'POST',
    body: JSON.stringify({ selected_topics: selectedTopics }),
  })
