export default function SkeletonCard() {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 animate-pulse">
      <div className="flex items-center gap-2 mb-3">
        <div className="h-5 w-20 bg-zinc-800 rounded-full" />
      </div>
      <div className="h-4 bg-zinc-800 rounded w-full mb-2" />
      <div className="h-4 bg-zinc-800 rounded w-4/5 mb-3" />
      <div className="space-y-1.5 mb-3">
        <div className="h-3 bg-zinc-800 rounded w-full" />
        <div className="h-3 bg-zinc-800 rounded w-5/6" />
        <div className="h-3 bg-zinc-800 rounded w-3/4" />
      </div>
      <div className="flex gap-2">
        <div className="h-3 w-16 bg-zinc-800 rounded" />
        <div className="h-3 w-2 bg-zinc-800 rounded" />
        <div className="h-3 w-12 bg-zinc-800 rounded" />
      </div>
    </div>
  )
}
