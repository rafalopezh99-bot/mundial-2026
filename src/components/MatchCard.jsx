export default function MatchCard({ match, userBet, onBet }) {
  const isFinished = match.status === 'finished'
  const isLive = match.status === 'live'

  const dateStr = match.date
    ? new Date(match.date + 'T' + match.time + ':00').toLocaleDateString('es-ES', {
        weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
      })
    : ''

  return (
    <div className={`match-card ${isFinished ? 'finished' : ''}`}>
      <div className="match-header">
        <span className="match-phase">Grupo {match.group} · J{match.matchday}</span>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {isLive && <span className="tag-live">EN VIVO</span>}
          <span className="match-date">{dateStr}</span>
        </div>
      </div>

      <div className="match-teams">
        <div className="team">
          <span className="team-flag">{match.home.flag}</span>
          <span className="team-name">{match.home.name}</span>
        </div>

        <div style={{ textAlign: 'center', minWidth: 60 }}>
          {isFinished || isLive ? (
            <div className="match-score">
              {match.result?.home ?? '-'} – {match.result?.away ?? '-'}
            </div>
          ) : (
            <div className="match-vs">VS</div>
          )}
        </div>

        <div className="team">
          <span className="team-flag">{match.away.flag}</span>
          <span className="team-name">{match.away.name}</span>
        </div>
      </div>

      <div className="match-footer">
        {isFinished ? (
          <div style={{ flex: 1 }}>
            {userBet ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                {userBet.status === 'won' && (
                  <span className="bet-placed">✅ +{userBet.payout} 🪙</span>
                )}
                {userBet.status === 'lost' && (
                  <span style={{ fontSize: 12, color: 'var(--red)', background: 'rgba(248,81,73,0.1)', padding: '6px 12px', borderRadius: 8, fontWeight: 600 }}>
                    ❌ -{userBet.amount} 🪙
                  </span>
                )}
                {userBet.status === 'pending' && (
                  <span className="bet-placed">⏳ Por liquidar</span>
                )}
              </div>
            ) : (
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Sin apuesta</span>
            )}
            {match.firstScorer && (
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
                ⚽ 1er gol: {match.firstScorer}
              </div>
            )}
          </div>
        ) : userBet ? (
          <div style={{ flex: 1 }}>
            <span className="bet-placed">
              ✅ Apostado · {userBet.amount} 🪙
              {userBet.wildcard && ' · 🃏'}
            </span>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
              {getBetSummary(userBet)}
            </div>
          </div>
        ) : (
          <button className="btn-bet" onClick={() => onBet(match)}>
            Apostar
          </button>
        )}
      </div>
    </div>
  )
}

function getBetSummary(bet) {
  switch (bet.type) {
    case 'winner':
      return `Ganador: ${bet.prediction}`
    case 'exact':
      return `Exacto: ${bet.prediction.home}-${bet.prediction.away}`
    case 'goals':
      return `Goles: ${bet.prediction}`
    case 'firstScorer':
      return `1er gol: ${bet.prediction}`
    default:
      return ''
  }
}
