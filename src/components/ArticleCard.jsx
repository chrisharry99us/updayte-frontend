import { useState } from 'react'
import { starArticle, unstarArticle } from '../api'

const PRIORITY_BAND = (p) => {
  if (p >= 8) return { label: 'Must Read',     color: 'bg-red-500/15 text-red-400 ring-red-500/30' }
  if (p >= 5) return { label: 'Worth Knowing', color: 'bg-amber-500/15 text-amber-400 ring-amber-500/30' }
  return              { label: 'On the Radar', color: 'bg-zinc-500/15 text-zinc-400 ring-zinc-500/30' }
}

function timeAgo(iso) {
  const diff = Date.now() - new Date(iso + 'Z').getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60)  return mins + 'm ago'
  const hrs = Math.floor(mins / 60)
  if (hrs < 24)   return hrs + 'h ago'
  return Math.floor(hrs / 24) + 'd ago'
}

export default function ArticleCard({ article, onFollowingClick }) {
  const [starred, setStarred]   = useState(false)
  const [starring, setStarring] = useState(false)
  const band = PRIORITY_BAND(article.priority)

  async function toggleStar(e) {
    e.preventDefault()
    setStarring(true)
    starred ? await unstarArticle(article.id) : await starArticle(article.id)
    setStarred(!starred)
    setStarring(false)
  }

  return (
    <article className="group bg-zinc-900 border border-zinc-800 rounded-xl p-5 hover:border-zinc-700 transition-colors">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={"text-xs font-medium px-2 py-0.5 rounded-full ring-1 " + band.color}>
            {band.label}
          </span>
          {article.following_topic && (
            <button onClick={() => onFollowingClick && onFollowingClick(article.following_topic)}
              className="text-xs font-medium px-2 py-0.5 rounded-full bg-indigo-500/15 text-indigo-400 ring-1 ring-indigo-500/30 hover:bg-indigo-500/25 transition-colors">
              {article.following_topic}
            </button>
          )}
        </div>
        <button onClick={toggleStar} disabled={starring} title={starred ? 'Unstar' : 'Star'}
          className="shrink-0 text-zinc-500 hover:text-amber-400 disabled:opacity-50 transition-colors mt-0.5">
          {starred ? (
            <svg className="w-5 h-5 fill-amber-400 text-amber-400" viewBox="0 0 24 24">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
          )}
        </button>
      </div>
      <a href={article.url} target="_blank" rel="noopener noreferrer"
        className="block text-white font-semibold text-sm leading-snug mb-2 hover:text-indigo-300 transition-colors line-clamp-2">
        {article.title}
      </a>
      <p className="text-zinc-400 text-sm leading-relaxed mb-3 line-clamp-3">{article.summary}</p>
      <div className="flex items-center gap-2 text-xs text-zinc-500">
        <span className="font-medium text-zinc-400">{article.source}</span>
        <span>·</span>
        <span>{timeAgo(article.published_at)}</span>
        <span>·</span>
        <span className="tabular-nums">Quality {article.domain_score}/10</span>
      </div>
    </article>
  )
}
