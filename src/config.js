// Añade aquí los nombres de los administradores (exactamente como los escribirán al entrar)
export const ADMIN_NAMES = ['Rafa', 'Admin']

// Monedas iniciales por jugador
export const INITIAL_COINS = 1000

// Multiplicadores por tipo de apuesta
export const MULTIPLIERS = {
  winner: 2.0,      // Ganador/Empate (1X2)
  exact: 5.0,       // Resultado exacto
  goals: 3.0,       // Número de goles
  firstScorer: 8.0, // Primer goleador
}

// Bonus por racha
export const STREAK_BONUS = {
  3: 100,   // 3 aciertos seguidos → +100 monedas
  5: 250,   // 5 aciertos seguidos → +250 monedas
  10: 1000, // 10 aciertos seguidos → +1000 monedas
}

// Multiplicador del campeón (apuesta previa al torneo)
export const CHAMPION_MULTIPLIER = 15
