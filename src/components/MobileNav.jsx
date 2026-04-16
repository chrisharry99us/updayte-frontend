const TABS = [
  { id: 'personalised', label: 'For You'   },
  { id: 'general',      label: 'General'   },
  { id: 'following',    label: 'Following' },
]

export default function MobileNav({ activeTab, onTabChange }) {
  return (
    <div className="lg:hidden flex border-b border-zinc-800 mb-6">
      {TABS.map(tab => (
        <button key={tab.id} onClick={() => onTabChange(tab.id)}
          className={"flex-1 py-3 text-sm font-medium transition-colors border-b-2 -mb-px " +
            (activeTab === tab.id ? 'text-white border-indigo-500' : 'text-zinc-500 border-transparent hover:text-zinc-300')}>
          {tab.label}
        </button>
      ))}
    </div>
  )
}
