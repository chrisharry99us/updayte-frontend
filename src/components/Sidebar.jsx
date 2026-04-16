const FOLLOWING = ['OpenAI','Anthropic','Google DeepMind','Meta AI','Hugging Face','LangChain','Mistral AI','Cursor','Railway']
const TABS = [
  { id: 'personalised', label: 'For You'   },
  { id: 'general',      label: 'General'   },
  { id: 'following',    label: 'Following' },
]

export default function Sidebar({ activeTab, activeTopic, onTabChange, onTopicClick }) {
  return (
    <aside className="w-52 shrink-0 hidden lg:block">
      <nav className="space-y-1 mb-8">
        {TABS.map(tab => (
          <button key={tab.id} onClick={() => onTabChange(tab.id)}
            className={"w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors " +
              (activeTab === tab.id ? 'bg-indigo-600 text-white' : 'text-zinc-400 hover:text-white hover:bg-zinc-800')}>
            {tab.label}
          </button>
        ))}
      </nav>
      <div>
        <p className="text-xs font-semibold text-zinc-600 uppercase tracking-widest px-3 mb-2">Following</p>
        <div className="space-y-0.5">
          {FOLLOWING.map(topic => (
            <button key={topic} onClick={() => onTopicClick(topic)}
              className={"w-full text-left px-3 py-1.5 rounded-lg text-sm transition-colors " +
                (activeTab === 'following' && activeTopic === topic
                  ? 'text-indigo-400 bg-indigo-500/10'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800')}>
              {topic}
            </button>
          ))}
        </div>
      </div>
    </aside>
  )
}
