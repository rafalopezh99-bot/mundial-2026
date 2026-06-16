export const lossMemes = [
  "💸 Hasta el apuntador te ganó. Que vergüenza.",
  "😂 Eso no lo acierta ni tu madre.",
  "🤡 ¿Apostaste con los ojos cerrados o qué?",
  "📉 Tu carrera como apostador: terminada.",
  "🪦 Descansa en paz, WorldCoins.",
  "🎰 Deberías probar con el bingo de los abuelos.",
  "🧠 ¿Eso fue un análisis o tiraste los dados?",
  "🐔 Gallina. La próxima apuesta también la perderás.",
  "😭 No llores que se te ve mal.",
  "🤦 Hasta el VAR te habría dado la razón... y mira.",
  "🔥 Esa apuesta fue un desastre bíblico.",
  "📊 Tus estadísticas son un insulto al fútbol.",
  "🥴 ¿Qué viste en ese partido que no vio nadie más?",
  "💀 RIP WorldCoins. Los perderás todos antes de semifinales.",
  "🤖 Una IA aleatoria lo habría acertado antes que tú.",
]

export const winMemes = [
  "🔥 ¡Eso es! ¡El mejor apostador del grupo!",
  "🧠 Analizas partidos como un crack.",
  "💰 Los WorldCoins llegan solos cuando se sabe.",
  "👑 ¿Ves? Así se hace.",
  "🎯 Perfecto. Sin discusión.",
  "📈 Tu instinto futbolístico es de otro nivel.",
  "🏆 Premio al mejor apostador en 3... 2... 1...",
  "😎 Que envidia te tienen todos ahora mismo.",
]

export const streakMemes = {
  3: "🔥🔥🔥 ¡RACHA DE 3! ¡Imparable! +100 monedas de bonus.",
  5: "💥💥💥 ¡RACHA DE 5! ¿Eres adivino o qué? +250 monedas.",
  10: "🌟🌟🌟 ¡RACHA DE 10! DIOS DEL FÚTBOL. +1000 monedas.",
}

export const getRandomLossMeme = () =>
  lossMemes[Math.floor(Math.random() * lossMemes.length)]

export const getRandomWinMeme = () =>
  winMemes[Math.floor(Math.random() * winMemes.length)]
