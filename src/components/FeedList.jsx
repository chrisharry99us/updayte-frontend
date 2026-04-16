import ArticleCard from './ArticleCard'
import SkeletonCard from './SkeletonCard'

const GROUPS = [
  { label: 'Must Read',     min: 8, max: 10, color: 'text-red-400'   },
  { label: 'Worth Knowing', min: 5, max: 7,  color: 'text-amber-400' },
  { label: 'On the Radar',  min: 0, max: 4,  color: 'text-zinc-500'  },
]

export default function FeedList({ articles, loading, error, onFollowingClick, grouped = false }) {
  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => <SkeletonCard key={i} />)}
      </div>
    )
  }
  if (error) {
    return <div className="text-center py-16 text-zinc-500 text-sm">{error}</div>
  }
  if (!articles || articles.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-zinc-400 font-medium mb-1">No articles yet</p>
        <p className="text-zinc-600 text-sm">Check back after 6am UTC — the daily feed refreshes automatically.</p>
      </div>
    )
  }
  if (!grouped) {
    return (
      <div className="space-y-4">
        {articles.map(a => <ArticleCard key={a.id} article={a} onFollowingClick={onFollowingClick} />)}
      </div>
    )
  }
  return (
    <div className="space-y-8">
      {GROUPS.map(({ label, min, max, color }) => {
        const group = articles.filter(a => a.priority >= min && a.priority <= max)
        if (group.length === 0) return null
        return (
          <section key={label}>
            <h2 className={"text-xs font-semibold uppercase tracking-widest mb-3 " + color}>{label}</h2>
            <div className="space-y-4">
              {group.map(a => <ArticleCard key={a.id} article={a} onFollowingClick={onFollowingClick} />)}
            </div>
          </section>
        )
      })}
    </div>
  )
}
