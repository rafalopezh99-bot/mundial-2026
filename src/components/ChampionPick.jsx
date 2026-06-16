import { useState } from 'react'
import { doc, updateDoc, runTransaction } from 'firebase/firestore'
import { db } from '../firebase'
import { allTeams } from '../data/matches'
import { CHAMPION_MULTIPLIER, INITIAL_COINS } from '../config'

const CHAMPION_COST = 50 // Coste de la apuesta de campeón

export default function ChampionPick({ user, onUserUpdate }) {
  const [selected, setSelected] = useState(user.championPick || '')
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(!!user.championPick)

  const handleSave = async () => {
    if (!selected || saved) return
    setLoading(true)

    try {
      const userRef = doc(db, 'users', user.id)
      await runTransaction(db, async (t) => {
        const snap = await t.get(userRef)
        if (!snap.exists()) return
        const u = snap.data()
        if (u.coins < CHAMPION_COST) throw new Error('No tienes suficientes monedas')
        t.update(userRef, {
          championPick: selected,
          coins: u.coins - CHAMPION_COST,
        })
      })

      setSaved(true)
      onUserUpdate()
    } catch (e) {
      alert(e.message || 'Error')
    }
    setLoading(false)
  }

  return (
    <div className="page">
      <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 4 }}>👑 Predicción de Campeón</h2>
      <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 6 }}>
        Si aciertas el campeón del Mundial, ganas ×{CHAMPION_MULTIPLIER} lo apostado.
      </p>
      <div style={{ background: 'var(--gold-dim)', border: '1px solid var(--gold)', borderRadius: 8, padding: 12, marginBottom: 20, fontSize: 13 }}>
        🏆 Multiplicador: <strong style={{ color: 'var(--gold)' }}>×{CHAMPION_MULTIPLIER}</strong> &nbsp;·&nbsp;
        Coste: <strong style={{ color: 'var(--gold)' }}>{CHAMPION_COST} 🪙</strong>
        {saved && <div style={{ marginTop: 4, color: 'var(--green)' }}>✅ Has apostado por: <strong>{user.championPick}</strong></div>}
      </div>

      {saved ? (
        <div className="card" style={{ textAlign: 'center', padding: 32 }}>
          <div style={{ fontSize: 48 }}>
            {allTeams.find(t => t.name === user.championPick)?.flag || '🏆'}
          </div>
          <div style={{ fontSize: 20, fontWeight: 800, marginTop: 8 }}>{user.championPick}</div>
          <div style={{ color: 'var(--text-muted)', marginTop: 4, fontSize: 13 }}>
            Tu predicción está bloqueada. ¡Suerte!
          </div>
          <div style={{ color: 'var(--gold)', marginTop: 8, fontSize: 14, fontWeight: 700 }}>
            Premio potencial: {CHAMPION_COST * CHAMPION_MULTIPLIER} 🪙
          </div>
        </div>
      ) : (
        <>
          <div className="section-header">Elige el campeón del Mundial 2026</div>
          <div className="champion-grid">
            {allTeams.map(team => (
              <button
                key={team.name}
                className={`champion-btn ${selected === team.name ? 'selected' : ''}`}
                onClick={() => setSelected(team.name)}
              >
                <span className="champion-flag">{team.flag}</span>
                {team.name}
              </button>
            ))}
          </div>

          {selected && (
            <div style={{ position: 'sticky', bottom: 70, marginTop: 16 }}>
              <button
                className="btn-gold"
                onClick={handleSave}
                disabled={loading || user.coins < CHAMPION_COST}
              >
                {loading ? 'Guardando...' : `👑 Apostar por ${selected} — ${CHAMPION_COST} 🪙`}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
