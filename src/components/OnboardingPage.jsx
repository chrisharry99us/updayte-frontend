import { useState } from 'react'
import { generateOnboarding, confirmOnboarding } from '../api'

const STEP = { INPUT: 'input', LOADING: 'loading', REVIEW: 'review', SAVING: 'saving', DONE: 'done' }

const DOMAIN_LABELS = {
  'AI/ML':           'AI / Machine Learning',
  'data_science':    'Data Science',
  'ml_engineering':  'ML Engineering',
  'software':        'Software Engineering',
  'web_dev':         'Web Development',
  'startups':        'Startups & Industry',
  'security':        'Security',
  'hardware':        'Hardware & Compute',
}

function Spinner() {
  return (
    <svg className="w-5 h-5 animate-spin text-indigo-400" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  )
}

export default function OnboardingPage({ onComplete }) {
  const [step, setStep] = useState(STEP.INPUT)
  const [rawInput, setRawInput] = useState('')
  const [error, setError] = useState(null)
  const [proposal, setProposal] = useState(null)       // { extracted, domains, proposed_topics }
  const [selected, setSelected] = useState({})         // { domain: Set(subtopics) }

  // ── Step 1: submit description ────────────────────────────────────────────
  async function handleGenerate() {
    if (rawInput.trim().length < 20) {
      setError('Please write at least a sentence about your role.')
      return
    }
    setError(null)
    setStep(STEP.LOADING)
    try {
      const data = await generateOnboarding(rawInput.trim())
      if (data.detail) throw new Error(data.detail)

      // Pre-select all topics
      const initialSelected = {}
      for (const [domain, subtopics] of Object.entries(data.proposed_topics)) {
        initialSelected[domain] = new Set(subtopics)
      }
      setProposal(data)
      setSelected(initialSelected)
      setStep(STEP.REVIEW)
    } catch (e) {
      setError(e.message || 'Generation failed. Please try again.')
      setStep(STEP.INPUT)
    }
  }

  function toggleSubtopic(domain, subtopic) {
    setSelected(prev => {
      const next = { ...prev }
      const domainSet = new Set(next[domain] || [])
      if (domainSet.has(subtopic)) {
        domainSet.delete(subtopic)
      } else {
        domainSet.add(subtopic)
      }
      next[domain] = domainSet
      return next
    })
  }

  // ── Step 2: confirm selection ─────────────────────────────────────────────
  async function handleConfirm() {
    // Build selected_topics dict with arrays (filter empty domains)
    const selectedTopics = {}
    for (const [domain, subtopicSet] of Object.entries(selected)) {
      const arr = Array.from(subtopicSet)
      if (arr.length > 0) selectedTopics[domain] = arr
    }
    if (Object.keys(selectedTopics).length === 0) {
      setError('Please select at least one topic.')
      return
    }
    setError(null)
    setStep(STEP.SAVING)
    try {
      const result = await confirmOnboarding(selectedTopics)
      if (result.detail) throw new Error(result.detail)
      setStep(STEP.DONE)
      setTimeout(() => onComplete(), 1200)
    } catch (e) {
      setError(e.message || 'Failed to save profile. Please try again.')
      setStep(STEP.REVIEW)
    }
  }

  const totalSelected = Object.values(selected).reduce((n, s) => n + s.size, 0)

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-2xl">

        {/* Header */}
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-bold text-white tracking-tight mb-2">Welcome to Updayte</h1>
          <p className="text-zinc-400 text-sm">
            Tell us about yourself and we'll build a personalised interest graph just for you.
          </p>
        </div>

        {/* ── INPUT step ── */}
        {(step === STEP.INPUT || step === STEP.LOADING) && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
            <label className="block text-sm font-medium text-zinc-300 mb-3">
              Describe your role, what you're working on, and what you want to stay on top of
            </label>
            <textarea
              className="w-full bg-zinc-800 border border-zinc-700 rounded-xl text-white text-sm px-4 py-3 resize-none focus:outline-none focus:border-indigo-500 transition-colors placeholder-zinc-600"
              rows={5}
              placeholder="e.g. I'm an entry-level AI engineer building RAG pipelines at a startup. I want to keep up with the latest LLMs, agent frameworks, and deployment patterns. I mostly use Python and follow the LangChain ecosystem closely."
              value={rawInput}
              onChange={e => setRawInput(e.target.value)}
              disabled={step === STEP.LOADING}
            />
            <div className="flex items-center justify-between mt-4">
              <span className="text-xs text-zinc-600">{rawInput.length} / 2000</span>
              {error && <span className="text-xs text-red-400">{error}</span>}
              <button
                onClick={handleGenerate}
                disabled={step === STEP.LOADING}
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm font-medium px-5 py-2.5 rounded-xl transition-colors"
              >
                {step === STEP.LOADING ? <><Spinner /> Building your profile...</> : 'Generate my profile →'}
              </button>
            </div>
          </div>
        )}

        {/* ── REVIEW step ── */}
        {step === STEP.REVIEW && proposal && (
          <div>
            {/* Extracted context pill */}
            <div className="flex flex-wrap gap-2 mb-6">
              {proposal.extracted.roles?.map(r => (
                <span key={r} className="px-3 py-1 bg-indigo-500/15 text-indigo-300 rounded-full text-xs font-medium">
                  {r.replace(/_/g, ' ')}
                </span>
              ))}
              {proposal.extracted.seniority && (
                <span className="px-3 py-1 bg-zinc-800 text-zinc-400 rounded-full text-xs">
                  {proposal.extracted.seniority}
                </span>
              )}
              {proposal.extracted.company && (
                <span className="px-3 py-1 bg-zinc-800 text-zinc-400 rounded-full text-xs">
                  {proposal.extracted.company}
                </span>
              )}
            </div>

            <p className="text-sm text-zinc-400 mb-6">
              Select the topics you want to track. All are pre-selected — uncheck anything that doesn't apply.
            </p>

            {/* Domain/subtopic checkboxes */}
            <div className="space-y-4">
              {proposal.domains.map(domain => {
                const subtopics = proposal.proposed_topics[domain] || []
                const domainSelected = selected[domain] || new Set()
                return (
                  <div key={domain} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
                    <h3 className="text-sm font-semibold text-white mb-3">
                      {DOMAIN_LABELS[domain] || domain}
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {subtopics.map(st => {
                        const checked = domainSelected.has(st)
                        return (
                          <button
                            key={st}
                            onClick={() => toggleSubtopic(domain, st)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border ${
                              checked
                                ? 'bg-indigo-600 border-indigo-500 text-white'
                                : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:text-white hover:border-zinc-600'
                            }`}
                          >
                            {checked ? '✓ ' : ''}{st}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </div>

            {error && <p className="text-red-400 text-xs mt-4">{error}</p>}

            <div className="flex items-center justify-between mt-6">
              <button
                onClick={() => setStep(STEP.INPUT)}
                className="text-sm text-zinc-500 hover:text-white transition-colors"
              >
                ← Start over
              </button>
              <button
                onClick={handleConfirm}
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium px-6 py-2.5 rounded-xl transition-colors"
              >
                Confirm {totalSelected} topics →
              </button>
            </div>
          </div>
        )}

        {/* ── SAVING step ── */}
        {step === STEP.SAVING && (
          <div className="text-center py-12">
            <div className="flex justify-center mb-4"><Spinner /></div>
            <p className="text-zinc-400 text-sm">Saving your profile...</p>
          </div>
        )}

        {/* ── DONE step ── */}
        {step === STEP.DONE && (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">✓</div>
            <h2 className="text-xl font-bold text-white mb-2">You're all set</h2>
            <p className="text-zinc-400 text-sm">Loading your feeds...</p>
          </div>
        )}

      </div>
    </div>
  )
}
