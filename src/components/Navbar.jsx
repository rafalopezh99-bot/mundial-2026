export default function Navbar({ user, page, setPage }) {
  return (
    <>
      <nav className="navbar">
        <span className="navbar-logo">⚽ <span>Mundial</span> 2026</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {user.wildcard && (
            <span className="wildcard-badge">🃏 Comodín</span>
          )}
          <span className="navbar-coins">🪙 {user.coins.toLocaleString()}</span>
        </div>
      </nav>

      <nav className="bottom-nav">
        {[
          { id: 'home', icon: '⚽', label: 'Partidos' },
          { id: 'leaderboard', icon: '🏆', label: 'Ranking' },
          { id: 'champion', icon: '👑', label: 'Campeón' },
          { id: 'profile', icon: '👤', label: 'Perfil' },
        ].map(tab => (
          <button
            key={tab.id}
            className={`nav-btn ${page === tab.id ? 'active' : ''}`}
            onClick={() => setPage(tab.id)}
          >
            <span className="icon">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </nav>
    </>
  )
}
