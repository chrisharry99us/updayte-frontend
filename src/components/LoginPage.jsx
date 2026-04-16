import { useEffect, useRef, useState } from 'react'
import { login, loginWithGoogle } from '../api'

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID

function loadGsiScript() {
  return new Promise((resolve, reject) => {
    if (window.google?.accounts?.id) {
      resolve()
      return
    }
    const src = 'https://accounts.google.com/gsi/client'
    const existing = document.querySelector(`script[src="${src}"]`)
    if (existing) {
      existing.addEventListener('load', () => resolve(), { once: true })
      existing.addEventListener('error', reject, { once: true })
      return
    }
    const script = document.createElement('script')
    script.src = src
    script.async = true
    script.defer = true
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('Google script failed to load'))
    document.body.appendChild(script)
  })
}

function LogoMark({ className = '' }) {
  return (
    <div
      className={
        'flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 p-0.5 shadow-lg shadow-indigo-500/25 ring-1 ring-white/10 ' +
        className
      }
    >
      <div className="flex h-full w-full items-center justify-center rounded-[0.875rem] bg-zinc-950/90">
        <svg className="h-7 w-7 text-indigo-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9.348 14.652a3.75 3.75 0 010-5.304m5.304 0a3.75 3.75 0 010 5.304m-7.425 2.121a6.75 6.75 0 010-9.546m9.546 0a6.75 6.75 0 010 9.546M5.106 18.894c-3.808-3.809-3.808-9.975 0-13.784m13.784 0c3.808 3.809 3.808 9.975 0 13.784"
          />
        </svg>
      </div>
    </div>
  )
}

export default function LoginPage({ onLogin }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const googleBtnRef = useRef(null)
  const onLoginRef = useRef(onLogin)
  onLoginRef.current = onLogin

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const ok = await login(username, password)
    setLoading(false)
    if (ok) {
      onLogin()
    } else {
      setError('Invalid username or password.')
    }
  }

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID || !googleBtnRef.current) return
    let cancelled = false
    loadGsiScript()
      .then(() => {
        if (cancelled || !googleBtnRef.current) return
        const g = window.google
        if (!g?.accounts?.id) return
        googleBtnRef.current.innerHTML = ''
        g.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: async (response) => {
            if (!response?.credential) return
            setLoading(true)
            setError('')
            const ok = await loginWithGoogle(response.credential)
            setLoading(false)
            if (ok) onLoginRef.current()
            else setError('Google sign-in failed. Is GOOGLE_CLIENT_ID set on the server?')
          },
        })
        g.accounts.id.renderButton(googleBtnRef.current, {
          theme: 'filled_black',
          size: 'large',
          width: 320,
          text: 'continue_with',
          shape: 'pill',
        })
      })
      .catch(() => {
        if (!cancelled) setError('Could not load Google Sign-In.')
      })
    return () => { cancelled = true }
  }, [GOOGLE_CLIENT_ID])

  return (
    <div className="relative min-h-screen overflow-hidden bg-zinc-950 font-sans text-zinc-100">
      {/* Ambient blobs */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-[20%] top-[-25%] h-[min(90vw,520px)] w-[min(90vw,520px)] rounded-full bg-indigo-600/25 blur-[100px]" />
        <div className="absolute -right-[15%] bottom-[-20%] h-[min(85vw,480px)] w-[min(85vw,480px)] rounded-full bg-violet-600/20 blur-[90px]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(99,102,241,0.12),transparent)]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(9,9,11,0.2),rgba(9,9,11,0.92)_55%,rgb(9,9,11))]" />
      </div>
      {/* Subtle grid */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
          backgroundSize: '64px 64px',
        }}
      />

      <div className="relative flex min-h-screen items-center justify-center px-4">
        <div className="w-full max-w-sm">
          {/* Logo + title */}
          <div className="mb-8 flex flex-col items-center gap-4 text-center">
            <LogoMark />
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white">Updayte</h1>
              <p className="mt-1 text-sm text-zinc-400">Your daily AI intelligence feed</p>
            </div>
          </div>

          {/* Card */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-8 shadow-2xl backdrop-blur-xl ring-1 ring-white/5">
            {/* Google button */}
            {GOOGLE_CLIENT_ID && (
              <div className="mb-6 flex flex-col items-center gap-3">
                <div ref={googleBtnRef} className="w-full" />
                <div className="flex w-full items-center gap-3">
                  <div className="h-px flex-1 bg-zinc-800" />
                  <span className="text-xs text-zinc-500">or</span>
                  <div className="h-px flex-1 bg-zinc-800" />
                </div>
              </div>
            )}

            {/* Username/password form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-zinc-400" htmlFor="username">
                  Username
                </label>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  required
                  autoComplete="username"
                  className="w-full rounded-lg border border-zinc-700 bg-zinc-800/60 px-3.5 py-2.5 text-sm text-white placeholder-zinc-500 outline-none ring-0 transition focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50"
                  placeholder="chris"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-zinc-400" htmlFor="password">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  className="w-full rounded-lg border border-zinc-700 bg-zinc-800/60 px-3.5 py-2.5 text-sm text-white placeholder-zinc-500 outline-none ring-0 transition focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50"
                  placeholder="••••••••"
                />
              </div>

              {error && (
                <p className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs text-red-400">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-600/20 transition hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-zinc-900 disabled:opacity-50"
              >
                {loading ? 'Signing in…' : 'Sign in'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
