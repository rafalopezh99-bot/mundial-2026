import { useState } from 'react'
import { addDoc, collection, doc, runTransaction } from 'firebase/firestore'
import { db } from '../firebase'
import { MULTIPLIERS } from '../config'

const BET_TYPES = [
  { id: 'winner', label: '🏅 Ganador/Empate', mult: MULTIPLIERS.winner },
  { id: 'exact', label: '🎯 Resultado exacto', mult: MULTIPLIERS.exact },
  { id: 'goals', label: '⚽ Nº de goles', mult: MULTIPLIERS.goals },
  { id: 'firstScorer', label: '🔫 Primer goleador', mult: MULTIPLIERS.firstScorer },
]

const AMOUNTS = [50, 100, 200, 500]

export default function BetModal({ match, user, onClose, onBetPlaced }) {
  const [betType, setBetType] = useState('winner')
  const [winner, setWinner] = useState('')  // 'home' | 'draw' | 'away'
  const [exactHome, setExactHome] = useState('')
  const [exactAway, setExactAway] = useState('')
  const [goals, setGoals] = useState('')
  const [firstScorer, setFirstScorer] = useState('')
  const [amount, setAmount] = useState(100)
  const [useWildcard, setUseWildcard] = useState(false)
  const [allIn, setAllIn] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const effectiveAmount = allIn ? user.coins : amount
  const multiplier = BET_TYPES.find(t => t.id === betType)?.mult || 2
  const potentialWin = Math.round(effectiveAmount * multiplier * (useWildcard ? 2 : 1))

  const getPrediction = () => {
    switch (betType) {
      case 'winner': return winner
      case 'exact': return { home: parseInt(exactHome) || 0, away: parseInt(exactAway) || 0 }
      case 'goals': return parseInt(goals) || 0
      case 'firstScorer': return firstScorer.trim()
    }
  }

  const validate = () => {
    if (effectiveAmount <= 0 || effectiveAmount > user.coins) return 'No tienes suficientes monedas'
    if (betType === 'winner' && !winner) return 'Elige un ganador'
    if (betType === 'exact' && (exactHome === '' || exactAway === '')) return 'Completa el resultado exacto'
    if (betType === 'goals' && !goals) return 'Indica el número de goles'
    if (betType === 'firstScorer' && !firstScorer.trim()) return 'Escribe el nombre del goleador'
    return null
  }

  const handleSubmit = async () => {
    const err = validate()
    if (err) { setError(err); return }
    setLoading(true)
    setError('')

    try {
      const userRef = doc(db, 'users', user.id)
      const betRef = collection(db, 'bets')

      await runTransaction(db, async (t) => {
        const userSnap = await t.get(userRef)
        const currentCoins = userSnap.data().coins
        if (currentCoins < effectiveAmount) throw new Error('Monedas insuficientes')

        // Deducir monedas
        const updates = { coins: currentCoins - effectiveAmount }
        if (useWildcard) updates.wildcard = false

        t.update(userRef, updates)
      })

      await addDoc(betRef, {
        userId: user.id,
        userName: user.name,
        matchId: match.id,
        type: betType,
        prediction: getPrediction(),
        amount: effectiveAmount,
        wildcard: useWildcard,
        allin: allIn,
        status: 'pending',
        payout: null,
        createdAt: Date.now(),
      })

      onBetPlaced()
    } catch (e) {
      setError(e.message || 'Error al registrar la apuesta')
      setLoading(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-title">Apostar</div>

        <div className="modal-teams">
          <span>{match.home.flag} {match.home.name}</span>
          <span style={{ color: 'var(--text-muted)' }}>vs</span>
          <span>{match.away.name} {match.away.flag}</span>
        </div>

        {/* Tipo de apuesta */}
        <div className="modal-label">Tipo de apuesta</div>
        <div className="bet-type-grid">
          {BET_TYPES.map(t => (
            <button
              key={t.id}
              className={`bet-type-btn ${betType === t.id ? 'selected' : ''}`}
              onClick={() => setBetType(t.id)}
            >
              {t.label}
              <span className="bet-type-mult">×{t.mult} ganancia</span>
            </button>
          ))}
        </div>

        {/* Predicción */}
        {betType === 'winner' && (
          <>
            <div className="modal-label">¿Quién gana?</div>
            <div className="winner-options">
              {[
                { key: 'home', label: match.home.flag + ' ' + match.home.name },
                { key: 'draw', label: 'Empate' },
                { key: 'away', label: match.away.flag + ' ' + match.away.name },
              ].map(o => (
                <button
                  key={o.key}
                  className={`winner-btn ${winner === o.key ? 'selected' : ''}`}
                  onClick={() => setWinner(o.key)}
                >
                  {o.label}
                </button>
              ))}
            </div>
          </>
        )}

        {betType === 'exact' && (
          <>
            <div className="modal-label">Resultado exacto</div>
            <div className="exact-inputs">
              <input type="number" min="0" max="20" placeholder="0" value={exactHome}
                onChange={e => setExactHome(e.target.value)} style={{ width: 70 }} />
              <span style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-muted)' }}>–</span>
              <input type="number" min="0" max="20" placeholder="0" value={exactAway}
                onChange={e => setExactAway(e.target.value)} style={{ width: 70 }} />
            </div>
          </>
        )}

        {betType === 'goals' && (
          <>
            <div className="modal-label">Total de goles en el partido</div>
            <div className="winner-options">
              {[0, 1, 2, 3, 4, 5, '6+'].map(g => (
                <button key={g} className={`winner-btn ${goals === String(g) ? 'selected' : ''}`}
                  onClick={() => setGoals(String(g))}>
                  {g}
                </button>
              ))}
            </div>
          </>
        )}

        {betType === 'firstScorer' && (
          <>
            <div className="modal-label">Nombre del primer goleador</div>
            <input type="text" placeholder="Ej: Mbappe" value={firstScorer}
              onChange={e => setFirstScorer(e.target.value)} />
          </>
        )}

        {/* Cantidad */}
        <div className="modal-label">Cantidad a apostar</div>
        <div className="amount-row" style={{ flexWrap: 'wrap' }}>
          {AMOUNTS.map(a => (
            <button key={a} className={`amount-chip ${!allIn && amount === a ? 'selected' : ''}`}
              onClick={() => { setAllIn(false); setAmount(a) }}
              disabled={a > user.coins}>
              {a} 🪙
            </button>
          ))}
          <button className={`amount-chip ${allIn ? 'selected' : ''}`}
            style={{ borderColor: allIn ? 'var(--red)' : '', color: allIn ? 'var(--red)' : '' }}
            onClick={() => setAllIn(!allIn)}>
            💣 ALL-IN
          </button>
        </div>

        {/* Comodín */}
        {user.wildcard && (
          <div className="toggle-row">
            <div>
              <div className="toggle-label">🃏 Usar comodín</div>
              <div className="toggle-desc">Duplica las ganancias (solo puedes usarlo 1 vez)</div>
            </div>
            <button className={`toggle ${useWildcard ? 'on' : ''}`} onClick={() => setUseWildcard(!useWildcard)} />
          </div>
        )}

        {/* Resumen */}
        <div style={{ background: 'var(--surface2)', borderRadius: 8, padding: 12, marginTop: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
            <span style={{ color: 'var(--text-muted)' }}>Apuesta</span>
            <span style={{ fontWeight: 700 }}>{effectiveAmount.toLocaleString()} 🪙</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, marginTop: 6 }}>
            <span style={{ color: 'var(--text-muted)' }}>Si aciertas</span>
            <span style={{ fontWeight: 700, color: 'var(--green)' }}>+{potentialWin.toLocaleString()} 🪙</span>
          </div>
          {useWildcard && (
            <div style={{ fontSize: 11, color: 'var(--gold)', marginTop: 4 }}>🃏 Comodín activo — ganancias ×2</div>
          )}
        </div>

        {error && <p style={{ color: 'var(--red)', fontSize: 13, marginTop: 10 }}>{error}</p>}

        <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
          <button className="btn-secondary" onClick={onClose} style={{ flex: 1 }}>Cancelar</button>
          <button className="btn-primary" onClick={handleSubmit} disabled={loading} style={{ flex: 2 }}>
            {loading ? 'Registrando...' : `Apostar ${effectiveAmount} 🪙`}
          </button>
        </div>
      </div>
    </div>
  )
}
