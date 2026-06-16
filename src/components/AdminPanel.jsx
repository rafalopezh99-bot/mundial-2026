import { useState, useEffect } from 'react'
import { collection, onSnapshot, query, where, getDocs, doc, updateDoc, runTransaction, addDoc } from 'firebase/firestore'
import { db } from '../firebase'
import { MULTIPLIERS, STREAK_BONUS } from '../config'
import { getRandomWinMeme, getRandomLossMeme, streakMemes } from '../data/memes'

function checkBet(bet, result, firstScorer) {
  const { home, away } = result
  switch (bet.type) {
    case 'winner':
      if (bet.prediction === 'home') return home > away
      if (bet.prediction === 'away') return away > home
      if (bet.prediction === 'draw') return home === away
      return false
    case 'exact':
      return bet.prediction.home === home && bet.prediction.away === away
    case 'goals': {
      const total = home + away
      if (bet.prediction === '6+') return total >= 6
      return total === parseInt(bet.prediction)
    }
    case 'firstScorer':
      return firstScorer && bet.prediction.toLowerCase() === firstScorer.toLowerCase()
    default:
      return false
  }
}

function getPayout(bet, multiplier) {
  return Math.round(bet.amount * multiplier * (bet.wildcard ? 2 : 1))
}

export default function AdminPanel({ onClose }) {
  const [matches, setMatches] = useState([])
  const [filter, setFilter] = useState('upcoming')
  const [settling, setSettling] = useState({})
  const [homeScores, setHomeScores] = useState({})
  const [awayScores, setAwayScores] = useState({})
  const [scorers, setScorers] = useState({})
  const [toast, setToast] = useState('')
  const [newMatch, setNewMatch] = useState({ phase: '', home: '', homeFlag: '🏳️', away: '', awayFlag: '🏳️', date: '', time: '20:00' })
  const [showAddMatch, setShowAddMatch] = useState(false)

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'matches'), snap => {
      const list = snap.docs.map(d => ({ id: d.id, ...d.data() }))
      list.sort((a, b) => (a.date || '').localeCompare(b.date || ''))
      setMatches(list)
    })
    return unsub
  }, [])

  const showToast = msg => {
    setToast(msg)
    setTimeout(() => setToast(''), 3000)
  }

  const handleSettle = async (match) => {
    const homeGoals = parseInt(homeScores[match.id] ?? '')
    const awayGoals = parseInt(awayScores[match.id] ?? '')
    const scorer = scorers[match.id] || ''

    if (isNaN(homeGoals) || isNaN(awayGoals)) {
      showToast('⚠️ Introduce el resultado primero')
      return
    }

    setSettling(s => ({ ...s, [match.id]: true }))

    const result = { home: homeGoals, away: awayGoals }

    // Actualizar partido
    await updateDoc(doc(db, 'matches', match.id), {
      status: 'finished',
      result,
      firstScorer: scorer || null,
    })

    // Liquidar apuestas
    const betsSnap = await getDocs(
      query(collection(db, 'bets'), where('matchId', '==', match.id), where('status', '==', 'pending'))
    )

    for (const betDoc of betsSnap.docs) {
      const bet = betDoc.data()
      const mult = MULTIPLIERS[bet.type] || 2
      const won = checkBet(bet, result, scorer)
      const payout = won ? getPayout(bet, mult) : 0

      await updateDoc(betDoc.ref, {
        status: won ? 'won' : 'lost',
        payout,
      })

      // Actualizar monedas y racha del jugador
      const userRef = doc(db, 'users', bet.userId)
      await runTransaction(db, async (t) => {
        const userSnap = await t.get(userRef)
        if (!userSnap.exists()) return
        const u = userSnap.data()
        const streak = won ? (u.streak || 0) + 1 : 0
        const streakBonus = won && STREAK_BONUS[streak] ? STREAK_BONUS[streak] : 0
        const coinsAdd = payout + streakBonus

        const updates = {
          coins: (u.coins || 0) + coinsAdd,
          streak,
          totalBets: (u.totalBets || 0) + 1,
          correctBets: (u.correctBets || 0) + (won ? 1 : 0),
        }

        t.update(userRef, updates)

        // Guardar notificación en Firestore
        const msg = won
          ? `${getRandomWinMeme()}${streakBonus ? ' ' + streakMemes[streak] : ''}`
          : getRandomLossMeme()

        t.set(doc(collection(db, 'notifications')), {
          userId: bet.userId,
          matchId: match.id,
          won,
          payout,
          streakBonus,
          msg,
          read: false,
          createdAt: Date.now(),
        })
      })
    }

    setSettling(s => ({ ...s, [match.id]: false }))
    showToast(`✅ Partido liquidado: ${betsSnap.size} apuesta(s) procesada(s)`)
  }

  const handleAddMatch = async () => {
    if (!newMatch.home || !newMatch.away || !newMatch.date) return
    await addDoc(collection(db, 'matches'), {
      group: null,
      phase: newMatch.phase || 'Eliminatoria',
      matchday: null,
      home: { name: newMatch.home, flag: newMatch.homeFlag },
      away: { name: newMatch.away, flag: newMatch.awayFlag },
      date: newMatch.date,
      time: newMatch.time,
      status: 'upcoming',
      result: null,
      firstScorer: null,
    })
    setNewMatch({ phase: '', home: '', homeFlag: '🏳️', away: '', awayFlag: '🏳️', date: '', time: '20:00' })
    setShowAddMatch(false)
    showToast('✅ Partido añadido')
  }

  const filtered = matches.filter(m =>
    filter === 'all' ? true : m.status === filter
  )

  return (
    <div className="page">
      {toast && <div className="toast">{toast}</div>}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h2 style={{ fontSize: 20, fontWeight: 800 }}>⚙️ Panel Admin</h2>
        <button className="btn-secondary" onClick={onClose} style={{ fontSize: 13, padding: '8px 14px' }}>
          Salir
        </button>
      </div>

      {/* Añadir partido eliminatoria */}
      <button
        className="btn-gold"
        style={{ marginBottom: 16 }}
        onClick={() => setShowAddMatch(!showAddMatch)}
      >
        {showAddMatch ? 'Cancelar' : '+ Añadir partido eliminatoria'}
      </button>

      {showAddMatch && (
        <div className="card">
          <div className="modal-label">Fase (ej: Octavos, Cuartos...)</div>
          <input value={newMatch.phase} onChange={e => setNewMatch(p => ({ ...p, phase: e.target.value }))} placeholder="Cuartos de Final" />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 10 }}>
            <div>
              <div className="modal-label">Bandera local</div>
              <input value={newMatch.homeFlag} onChange={e => setNewMatch(p => ({ ...p, homeFlag: e.target.value }))} placeholder="🏳️" />
            </div>
            <div>
              <div className="modal-label">Equipo local</div>
              <input value={newMatch.home} onChange={e => setNewMatch(p => ({ ...p, home: e.target.value }))} placeholder="España" />
            </div>
            <div>
              <div className="modal-label">Bandera visitante</div>
              <input value={newMatch.awayFlag} onChange={e => setNewMatch(p => ({ ...p, awayFlag: e.target.value }))} placeholder="🏳️" />
            </div>
            <div>
              <div className="modal-label">Equipo visitante</div>
              <input value={newMatch.away} onChange={e => setNewMatch(p => ({ ...p, away: e.target.value }))} placeholder="Francia" />
            </div>
            <div>
              <div className="modal-label">Fecha</div>
              <input type="date" value={newMatch.date} onChange={e => setNewMatch(p => ({ ...p, date: e.target.value }))} />
            </div>
            <div>
              <div className="modal-label">Hora</div>
              <input type="time" value={newMatch.time} onChange={e => setNewMatch(p => ({ ...p, time: e.target.value }))} />
            </div>
          </div>
          <button className="btn-primary" style={{ marginTop: 12 }} onClick={handleAddMatch}>
            Añadir partido
          </button>
        </div>
      )}

      {/* Filtro */}
      <div className="filter-tabs">
        {[['upcoming', '📅 Próximos'], ['finished', '✅ Terminados'], ['all', '🌍 Todos']].map(([v, l]) => (
          <button key={v} className={`filter-tab ${filter === v ? 'active' : ''}`} onClick={() => setFilter(v)}>{l}</button>
        ))}
      </div>

      {filtered.map(match => (
        <div key={match.id} className="admin-match">
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 6 }}>
            {match.phase} {match.group ? `· Grupo ${match.group}` : ''} · {match.date}
          </div>
          <div style={{ fontWeight: 700, fontSize: 15 }}>
            {match.home.flag} {match.home.name}
            {match.status === 'finished' && match.result
              ? ` ${match.result.home} – ${match.result.away} `
              : ' vs '}
            {match.away.name} {match.away.flag}
          </div>

          {match.status !== 'finished' && (
            <>
              <div className="admin-inputs">
                <input
                  type="number" min="0" max="20" placeholder="0"
                  style={{ width: 60 }}
                  value={homeScores[match.id] ?? ''}
                  onChange={e => setHomeScores(s => ({ ...s, [match.id]: e.target.value }))}
                />
                <span style={{ color: 'var(--text-muted)', fontWeight: 800 }}>–</span>
                <input
                  type="number" min="0" max="20" placeholder="0"
                  style={{ width: 60 }}
                  value={awayScores[match.id] ?? ''}
                  onChange={e => setAwayScores(s => ({ ...s, [match.id]: e.target.value }))}
                />
                <input
                  type="text" placeholder="1er goleador (opcional)"
                  style={{ flex: 1 }}
                  value={scorers[match.id] ?? ''}
                  onChange={e => setScorers(s => ({ ...s, [match.id]: e.target.value }))}
                />
              </div>
              <button
                className="btn-settle"
                style={{ marginTop: 10, width: '100%' }}
                onClick={() => handleSettle(match)}
                disabled={settling[match.id]}
              >
                {settling[match.id] ? 'Liquidando...' : '✅ Publicar resultado y liquidar'}
              </button>
            </>
          )}
          {match.status === 'finished' && match.firstScorer && (
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
              ⚽ Primer goleador: {match.firstScorer}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
