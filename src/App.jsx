import { useState, useEffect, useCallback } from 'react'
import { clearToken, fetchGeneral, fetchPersonalised, fetchFollowing, fetchStatus } from './api'
import LoginPage from './components/LoginPage'
import Sidebar from './components/Sidebar'
import MobileNav from './components/MobileNav'
import FeedList from './components/FeedList'

const FOLLOWING_TOPICS = ['OpenAI','Anthropic','Google DeepMind','Meta AI','Hugging Face','LangChain','Mistral AI','Cursor','Railway']

function getStoredToken() { return sessionStorage.getItem('updayte_token') }

function Header({ articleCount, onRefresh, refreshing, onLogout }) {
  return (
    <header className="border-b border-zinc-800 px-4 lg:px-6 py-3 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <h1 className="text-white font-bold text-lg tracking-tight">Updayte</h1>
        {articleCount != null && (
          <span className="text-xs text-zinc-500 hidden sm:block">{articleCount.toLocaleString()} articles in database</span>
        )}
      </div>
      <div className="flex items-center gap-2">
        <button onClick={onRefresh} disabled={refreshing} title="Refresh"
          className="p-1.5 text-zinc-500 hover:text-white disabled:opacity-40 transition-colors rounded-lg hover:bg-zinc-800">
          <svg className={"w-4 h-4 " + (refreshing ? 'animate-spin' : '')} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
          </svg>
        </button>
        <button onClick={onLogout} className="text-xs text-zinc-500 hover:text-white transition-colors px-2 py-1 rounded-lg hover:bg-zinc-800">
          Sign out
        </button>
      </div>
    </header>
  )
}

export default function App() {
  const [authed, setAuthed]           = useState(!!getStoredToken())
  const [activeTab, setActiveTab]     = useState('personalised')
  const [activeTopic, setActiveTopic] = useState(FOLLOWING_TOPICS[0])
  const [articles, setArticles]       = useState([])
  const [loading, setLoading]         = useState(false)
  const [error, setError]             = useState(null)
  const [articleCount, setArticleCount] = useState(null)
  const [refreshing, setRefreshing]   = useState(false)

  const loadFeed = useCallback(async (tab, topic) => {
    setLoading(true)
    setError(null)
    try {
      let data
      if (tab === 'general')          data = await fetchGeneral()
      else if (tab === 'personalised') data = await fetchPersonalised()
      else                             data = await fetchFollowing(topic)
      setArticles(Array.isArray(data) ? data : [])
    } catch {
      setError('Failed to load feed. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!authed) return
    fetchStatus().then(s => s && s.article_count != null && setArticleCount(s.article_count))
  }, [authed])

  useEffect(() => {
    if (!authed) return
    loadFeed(activeTab, activeTopic)
  }, [authed, activeTab, activeTopic, loadFeed])

  function handleTopicClick(topic) {
    setActiveTopic(topic)
    setActiveTab('following')
  }

  async function handleRefresh() {
    setRefreshing(true)
    await loadFeed(activeTab, activeTopic)
    setRefreshing(false)
  }

  if (!authed) return <LoginPage onLogin={() => setAuthed(true)} />

  const feedTitle = activeTab === 'following' ? activeTopic : activeTab === 'personalised' ? 'For You' : 'General'

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <Header articleCount={articleCount} onRefresh={handleRefresh} refreshing={refreshing} onLogout={() => { clearToken(); setAuthed(false) }} />
      <div className="max-w-5xl mx-auto px-4 lg:px-6 py-6 flex gap-8">
        <Sidebar activeTab={activeTab} activeTopic={activeTopic} onTabChange={setActiveTab} onTopicClick={handleTopicClick} />
        <main className="flex-1 min-w-0">
          <MobileNav activeTab={activeTab} onTabChange={setActiveTab} />
          {activeTab === 'following' && (
            <div className="lg:hidden flex gap-2 overflow-x-auto pb-3 mb-4">
              {FOLLOWING_TOPICS.map(topic => (
                <button key={topic} onClick={() => handleTopicClick(topic)}
                  className={"shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors " +
                    (activeTopic === topic ? 'bg-indigo-600 text-white' : 'bg-zinc-800 text-zinc-400 hover:text-white')}>
                  {topic}
                </button>
              ))}
            </div>
          )}
          <div className="flex items-baseline justify-between mb-5">
            <h2 className="text-xl font-bold text-white">{feedTitle}</h2>
            {!loading && articles.length > 0 && (
              <span className="text-xs text-zinc-500">{articles.length} articles</span>
            )}
          </div>
          <FeedList articles={articles} loading={loading} error={error} onFollowingClick={handleTopicClick} grouped={activeTab !== 'following'} />
        </main>
      </div>
    </div>
  )
}
