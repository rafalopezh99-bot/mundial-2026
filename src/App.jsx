import { useState, useEffect } from 'react'
import { doc, onSnapshot, collection, query, where, getDocs, setDoc } from 'firebase/firestore'
import { db } from './firebase'
import { ADMIN_NAMES } from './config'
import { initialMatches } from './data/matches'

import Login from './components/Login'
import Navbar from './components/Navbar'
import Leaderboard from './components/Leaderboard'
import MatchCard from './components/MatchCard'
import BetModal from './components/BetModal'
import AdminPanel from './components/AdminPanel'
import Profile from './components/Profile'
import ChampionPick from './components/ChampionPick'

// Inicializa los partidos en Firestore la primera vez
async function seedMatchesIfNeeded() {
  const snap = await getDocs(collection(db, 'matches'))
  if (snap.empty) {
    for (const match of initialMatches) {
      const { id, ...data } = match
      await setDoc(doc(db, 'matches', id), data)
    }
  }
}

export default function App() {
  const [userId, setUserId] = useState(() => localStorage.getItem('mundialUserId'))
  const [userName, setUserName] = useState(() => localStorage.getItem('mundialUserName'))
  const [user, setUser] = useState(null)
  const [page, setPage] = useState('home')
  const [matches, setMatches] = useState([])
  const [userBets, setUserBets] = useState({})
  const [betModal, setBetModal] = useState(null) // match to bet on
  const [filter, setFilter] = useState('upcoming')
  const [groupFilter, setGroupFilter] = useState('all')
  const [toast, setToast] = useState('')
  const [seeded, setSeeded] = useState(false)

  const isAdmin = ADMIN_NAMES.includes(userName)

  // Seed matches on mount
  useEffect(() => {
    if (!seeded) {
      seedMatchesIfNeeded().then(() => setSeeded(true))
    }
  }, [seeded])

  // Listen to user data
  useEffect(() => {
    if (!userId) return
    const unsub = onSnapshot(doc(db, 'users', userId), snap => {
      if (snap.exists()) setUser({ id: userId, ...snap.data() })
    })
    return unsub
  }, [userId])

  // Listen to matches
  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'matches'), snap => {
      const list = snap.docs.map(d => ({ id: d.id, ...d.data() }))
      list.sort((a, b) => (a.date || '') < (b.date || '') ? -1 : 1)
      setMatches(list)
    })
    return unsub
  }, [])

  // Listen to user's bets
  useEffect(() => {
    if (!userId) return
    const q = query(collection(db, 'bets'), where('userId', '==', userId))
    const unsub = onSnapshot(q, snap => {
      const map = {}
      snap.docs.forEach(d => {
        const bet = d.data()
        map[bet.matchId] = { id: d.id, ...bet }
      })
      setUserBets(map)
    })
    return unsub
  }, [userId])

  const showToast = (msg) => {
    setToast(msg)
    setTimeout(() => setToast(''), 3000)
  }

  const handleLogin = (id, name) => {
    setUserId(id)
    setUserName(name)
  }

  const handleBetPlaced = () => {
    setBetModal(null)
    showToast('✅ ¡Apuesta registrada!')
  }

  // Filtered matches
  const today = new Date().toISOString().split('T')[0]
  const filteredMatches = matches.filter(m => {
    const statusOk =
      filter === 'upcoming' ? m.status !== 'finished' :
      filter === 'finished' ? m.status === 'finished' : true
    const groupOk = groupFilter === 'all' || m.group === groupFilter || m.phase === groupFilter
    return statusOk && groupOk
  })

  const groups = ['all', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'Eliminatoria']

  if (!userId || !userName) {
    return <Login onLogin={handleLogin} />
  }

  if (!user) {
    return (
      <div style={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: 'var(--text-muted)' }}>Cargando...</div>
      </div>
    )
  }

  return (
    <div className="app">
      {toast && <div className="toast">{toast}</div>}

      <Navbar user={user} page={page} setPage={setPage} />

      {/* Admin panel */}
      {isAdmin && page !== 'admin' && (
        <div style={{ padding: '8px 16px', background: 'var(--primary-dim)', borderBottom: '1px solid var(--primary)' }}>
          <button
            style={{ background: 'none', color: 'var(--primary)', fontSize: 13, fontWeight: 700, border: 'none', cursor: 'pointer' }}
            onClick={() => setPage('admin')}
          >
            ⚙️ Panel de administrador →
          </button>
        </div>
      )}

      {/* Pages */}
      {page === 'admin' && isAdmin && (
        <AdminPanel onClose={() => setPage('home')} />
      )}

      {page === 'home' && (
        <div className="page">
          <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 12 }}>⚽ Partidos</h2>

          {/* Status filter */}
          <div className="filter-tabs">
            {[['upcoming', '📅 Próximos'], ['finished', '✅ Finalizados'], ['all', '🌍 Todos']].map(([v, l]) => (
              <button key={v} className={`filter-tab ${filter === v ? 'active' : ''}`} onClick={() => setFilter(v)}>
                {l}
              </button>
            ))}
          </div>

          {/* Group filter */}
          <div className="filter-tabs" style={{ marginBottom: 4 }}>
            {groups.map(g => (
              <button key={g} className={`filter-tab ${groupFilter === g ? 'active' : ''}`} onClick={() => setGroupFilter(g)}>
                {g === 'all' ? 'Todos' : g === 'Eliminatoria' ? '⚔️' : `G${g}`}
              </button>
            ))}
          </div>

          {filteredMatches.length === 0 && (
            <div className="card" style={{ textAlign: 'center', padding: 32, color: 'var(--text-muted)' }}>
              Sin partidos en esta categoría
            </div>
          )}

          {filteredMatches.map(match => (
            <MatchCard
              key={match.id}
              match={match}
              userBet={userBets[match.id] || null}
              onBet={m => {
                if (!userBets[m.id]) setBetModal(m)
              }}
            />
          ))}
        </div>
      )}

      {page === 'leaderboard' && <Leaderboard currentUserId={userId} />}

      {page === 'champion' && (
        <ChampionPick
          user={user}
          onUserUpdate={() => {}} // snapshot auto-updates user
        />
      )}

      {page === 'profile' && <Profile user={user} />}

      {/* Bet modal */}
      {betModal && (
        <BetModal
          match={betModal}
          user={user}
          onClose={() => setBetModal(null)}
          onBetPlaced={handleBetPlaced}
        />
      )}
    </div>
  )
}
