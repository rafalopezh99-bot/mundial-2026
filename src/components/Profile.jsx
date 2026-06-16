import { useEffect, useState } from 'react'
import { collection, onSnapshot, orderBy, query, where } from 'firebase/firestore'
import { db } from '../firebase'

export default function Profile({ user }) {
  const [bets, setBets] = useState([])
  const [notifications, setNotifications] = useState([])

  useEffect(() => {
    const betsQ = query(collection(db, 'bets'), where('userId', '==', user.id), orderBy('createdAt', 'desc'))
    const unsub1 = onSnapshot(betsQ, snap => {
      setBets(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    })

    const notifQ = query(collection(db, 'notifications'), where('userId', '==', user.id), orderBy('createdAt', 'desc'))
    const unsub2 = onSnapshot(notifQ, snap => {
      setNotifications(snap.docs.map(d => ({ id: d.id, ...d.data() })).slice(0, 10))
    })

    return () => { unsub1(); unsub2() }
  }, [user.id])

  const winRate = user.totalBets > 0
    ? Math.round((user.correctBets / user.totalBets) * 100)
    : 0
  const pending = bets.filter(b => b.status === 'pending').length
  const won = bets.filter(b => b.status === 'won').length
  const lost = bets.filter(b => b.status === 'lost').length

  return (
    <div className="page">
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 800 }}>
          {user.name[0].toUpperCase()}
        </div>
        <div>
          <div style={{ fontSize: 20, fontWeight: 800 }}>{user.name}</div>
          {user.wildcard && <div style={{ fontSize: 12, color: 'var(--gold)' }}>🃏 Comodín disponible</div>}
          {user.streak > 1 && <div style={{ fontSize: 12, color: 'var(--primary)' }}>🔥 Racha de {user.streak}</div>}
        </div>
      </div>

      <div className="stat-grid">
        <div className="stat-box">
          <div className="stat-value" style={{ color: 'var(--gold)' }}>
            🪙 {(user.coins || 0).toLocaleString()}
          </div>
          <div className="stat-label">WorldCoins</div>
        </div>
        <div className="stat-box">
          <div className="stat-value">{winRate}%</div>
          <div className="stat-label">Tasa de acierto</div>
        </div>
        <div className="stat-box">
          <div className="stat-value" style={{ color: 'var(--green)' }}>{won}</div>
          <div className="stat-label">Apuestas ganadas</div>
        </div>
        <div className="stat-box">
          <div className="stat-value" style={{ color: 'var(--red)' }}>{lost}</div>
          <div className="stat-label">Apuestas perdidas</div>
        </div>
      </div>

      {pending > 0 && (
        <div style={{ background: 'var(--gold-dim)', border: '1px solid var(--gold)', borderRadius: 8, padding: 12, marginBottom: 16, fontSize: 14 }}>
          ⏳ Tienes <strong>{pending}</strong> apuesta{pending > 1 ? 's' : ''} pendiente{pending > 1 ? 's' : ''}
        </div>
      )}

      {/* Notificaciones (resultados) */}
      {notifications.length > 0 && (
        <>
          <div className="section-header">Últimos resultados</div>
          {notifications.map(n => (
            <div key={n.id} className="card" style={{ borderColor: n.won ? 'var(--green)' : 'var(--red)' }}>
              <div style={{ fontSize: 13 }}>{n.msg}</div>
              {n.won && <div style={{ fontSize: 12, color: 'var(--green)', marginTop: 4 }}>+{n.payout} 🪙{n.streakBonus > 0 ? ` (+${n.streakBonus} bonus racha)` : ''}</div>}
            </div>
          ))}
        </>
      )}

      {/* Historial apuestas */}
      {bets.length > 0 && (
        <>
          <div className="section-header">Historial de apuestas</div>
          {bets.slice(0, 20).map(bet => (
            <div key={bet.id} className="card" style={{ padding: '10px 14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>
                    {bet.type === 'winner' ? '🏅 Ganador' :
                     bet.type === 'exact' ? '🎯 Exacto' :
                     bet.type === 'goals' ? '⚽ Goles' : '🔫 Goleador'}
                    {bet.wildcard && ' 🃏'}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                    {formatPrediction(bet)}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: bet.status === 'won' ? 'var(--green)' : bet.status === 'lost' ? 'var(--red)' : 'var(--text-muted)' }}>
                    {bet.status === 'won' ? `+${bet.payout} 🪙` :
                     bet.status === 'lost' ? `-${bet.amount} 🪙` :
                     `${bet.amount} 🪙`}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                    {bet.status === 'pending' ? '⏳ Pendiente' : bet.status === 'won' ? '✅' : '❌'}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </>
      )}

      {bets.length === 0 && (
        <div className="card" style={{ textAlign: 'center', padding: 32 }}>
          <div style={{ fontSize: 32 }}>🎯</div>
          <div style={{ color: 'var(--text-muted)', marginTop: 8 }}>Aún no has apostado nada</div>
        </div>
      )}
    </div>
  )
}

function formatPrediction(bet) {
  switch (bet.type) {
    case 'winner':
      return `Ganador: ${bet.prediction === 'home' ? 'Local' : bet.prediction === 'away' ? 'Visitante' : 'Empate'}`
    case 'exact':
      return `Marcador: ${bet.prediction?.home ?? '?'}-${bet.prediction?.away ?? '?'}`
    case 'goals':
      return `Goles totales: ${bet.prediction}`
    case 'firstScorer':
      return `1er gol: ${bet.prediction}`
    default:
      return ''
  }
}
