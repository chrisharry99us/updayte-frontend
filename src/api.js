const BASE = import.meta.env.VITE_API_BASE || 'https://updayte-production.up.railway.app'

function getToken() { return sessionStorage.getItem('updayte_token') }
export function setToken(t) { sessionStorage.setItem('updayte_token', t) }
export function clearToken() { sessionStorage.removeItem('updayte_token') }

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
  if (res.status === 401 && token) { clearToken(); window.location.reload(); return }
  return res.json()
}

export async function login(username, password) {
  const data = await request('/auth/login', { method: 'POST', body: JSON.stringify({ username, password }) })
  if (data?.access_token) { setToken(data.access_token); return true }
  return false
}

export async function loginWithGoogle(credential) {
  const data = await request('/auth/google', { method: 'POST', body: JSON.stringify({ credential }) })
  if (data?.access_token) { setToken(data.access_token); return true }
  return false
}

export const fetchGeneral      = ()      => request('/feeds/general')
export const fetchPersonalised = ()      => request('/feeds/personalised')
export const fetchFollowing    = (topic) => request('/feeds/following/' + encodeURIComponent(topic))
export const fetchStatus       = ()      => request('/ingest/status')
export const starArticle       = (id)    => request('/feedback/star',   { method: 'POST', body: JSON.stringify({ article_id: id }) })
export const unstarArticle     = (id)    => request('/feedback/unstar', { method: 'POST', body: JSON.stringify({ article_id: id }) })
export const followTopic       = (t, d)  => request('/feedback/follow', { method: 'POST', body: JSON.stringify({ topic: t, domain: d || 'AI/ML' }) })

export const fetchOnboardingStatus = () => request('/onboarding/status')
export const generateOnboarding    = (raw) => request('/onboarding/generate', {
  method: 'POST',
  body: JSON.stringify({ raw_input: raw }),
})
export const confirmOnboarding = (selectedTopics) => request('/onboarding/confirm', {
  method: 'POST',
  body: JSON.stringify({ selected_topics: selectedTopics }),
})
