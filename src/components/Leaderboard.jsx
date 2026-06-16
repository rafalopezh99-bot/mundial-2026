import { useEffect, useState } from 'react'
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore'
import { db } from '../firebase'

const MEDALS = ['🥇', '🥈', '🥉']

export default function Leaderboard({ currentUserId }) {
  const [players, setPlayers] = useState([])

  useEffect(() => {
    const q = query(collection(db, 'users'), orderBy('coins', 'desc'))
    const unsub = onSnapshot(q, snap => {
      setPlayers(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    })
    return unsub
  }, [])

  return (
    <div className="page">
      <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 4 }}>🏆 Ranking</h2>
      <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 16 }}>
        Actualizado en tiempo real
      </p>

      <div className="card">
        {players.length === 0 && (
          <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Nadie ha entrado aún...</p>
        )}
        {players.map((p, i) => (
          <div
            key={p.id}
            className="leaderboard-item"
            style={p.id === currentUserId ? { background: 'var(--primary-dim)', borderRadius: 8, padding: '10px 8px', margin: '2px 0' } : {}}
          >
            <span className="lb-rank">
              {i < 3 ? MEDALS[i] : `#${i + 1}`}
            </span>
            <div style={{ flex: 1 }}>
              <div className="lb-name">
                {p.name}
                {p.id === currentUserId && <span style={{ fontSize: 11, color: 'var(--text-muted)', marginLeft: 6 }}>(tú)</span>}
              </div>
              {p.streak > 1 && (
                <div className="lb-streak">🔥 Racha de {p.streak}</div>
              )}
            </div>
            <div style={{ textAlign: 'right' }}>
              <div className="lb-coins">🪙 {(p.coins || 0).toLocaleString()}</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                {p.totalBets > 0
                  ? `${p.correctBets}/${p.totalBets} aciertos`
                  : 'Sin apuestas aún'}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
