import { useState } from 'react'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { db } from '../firebase'
import { INITIAL_COINS } from '../config'

function generateId() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36)
}

export default function Login({ onLogin }) {
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async () => {
    const trimmed = name.trim()
    if (!trimmed || trimmed.length < 2) {
      setError('Pon al menos 2 caracteres')
      return
    }
    setLoading(true)
    setError('')

    // Buscar o crear userId en localStorage
    let userId = localStorage.getItem('mundialUserId')
    if (!userId) {
      userId = generateId()
      localStorage.setItem('mundialUserId', userId)
    }

    const userRef = doc(db, 'users', userId)
    const userSnap = await getDoc(userRef)

    if (!userSnap.exists()) {
      // Nuevo jugador
      await setDoc(userRef, {
        name: trimmed,
        coins: INITIAL_COINS,
        wildcard: true,
        championPick: null,
        streak: 0,
        totalBets: 0,
        correctBets: 0,
        createdAt: Date.now(),
      })
    } else {
      // Si cambió de nombre, actualizamos
      if (userSnap.data().name !== trimmed) {
        await setDoc(userRef, { name: trimmed }, { merge: true })
      }
    }

    localStorage.setItem('mundialUserName', trimmed)
    onLogin(userId, trimmed)
    setLoading(false)
  }

  return (
    <div className="login-page">
      <div className="login-logo">⚽</div>
      <div>
        <h1 className="login-title">Mundial Apuestas <span style={{ color: 'var(--primary)' }}>2026</span></h1>
        <p className="login-sub" style={{ marginTop: 8 }}>Compite con tus amigos. Sin dinero real, solo gloria.</p>
      </div>

      <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 12 }}>
        <input
          type="text"
          placeholder="Tu nombre (ej: Rafa)"
          value={name}
          onChange={e => setName(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleLogin()}
          maxLength={20}
          autoFocus
        />
        {error && <p style={{ color: 'var(--red)', fontSize: 13 }}>{error}</p>}
        <button className="btn-primary" onClick={handleLogin} disabled={loading}>
          {loading ? 'Entrando...' : 'Entrar al juego →'}
        </button>
      </div>

      <div style={{ textAlign: 'center' }}>
        <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Empiezas con <strong style={{ color: 'var(--gold)' }}>1.000 🪙 WorldCoins</strong></p>
        <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>Sin contraseña. Entra siempre con el mismo nombre.</p>
      </div>
    </div>
  )
}
