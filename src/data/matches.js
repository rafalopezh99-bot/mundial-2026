// Partidos del Mundial 2026 — Fase de Grupos
// Los partidos de fase eliminatoria se añaden dinámicamente desde AdminPanel

const groups = {
  A: { teams: [
    { name: 'México', flag: '🇲🇽' },
    { name: 'Sudáfrica', flag: '🇿🇦' },
    { name: 'Corea del Sur', flag: '🇰🇷' },
    { name: 'Chequia', flag: '🇨🇿' },
  ]},
  B: { teams: [
    { name: 'Canadá', flag: '🇨🇦' },
    { name: 'Bosnia y Herzegovina', flag: '🇧🇦' },
    { name: 'Catar', flag: '🇶🇦' },
    { name: 'Suiza', flag: '🇨🇭' },
  ]},
  C: { teams: [
    { name: 'Brasil', flag: '🇧🇷' },
    { name: 'Marruecos', flag: '🇲🇦' },
    { name: 'Haití', flag: '🇭🇹' },
    { name: 'Escocia', flag: '🏴󠁧󠁢󠁳󠁣󠁴󠁿' },
  ]},
  D: { teams: [
    { name: 'USA', flag: '🇺🇸' },
    { name: 'Paraguay', flag: '🇵🇾' },
    { name: 'Australia', flag: '🇦🇺' },
    { name: 'Turquía', flag: '🇹🇷' },
  ]},
  E: { teams: [
    { name: 'Alemania', flag: '🇩🇪' },
    { name: 'Curaçao', flag: '🇨🇼' },
    { name: 'Costa de Marfil', flag: '🇨🇮' },
    { name: 'Ecuador', flag: '🇪🇨' },
  ]},
  F: { teams: [
    { name: 'Países Bajos', flag: '🇳🇱' },
    { name: 'Japón', flag: '🇯🇵' },
    { name: 'Suecia', flag: '🇸🇪' },
    { name: 'Túnez', flag: '🇹🇳' },
  ]},
  G: { teams: [
    { name: 'Bélgica', flag: '🇧🇪' },
    { name: 'Egipto', flag: '🇪🇬' },
    { name: 'Irán', flag: '🇮🇷' },
    { name: 'Nueva Zelanda', flag: '🇳🇿' },
  ]},
  H: { teams: [
    { name: 'España', flag: '🇪🇸' },
    { name: 'Cabo Verde', flag: '🇨🇻' },
    { name: 'Arabia Saudí', flag: '🇸🇦' },
    { name: 'Uruguay', flag: '🇺🇾' },
  ]},
  I: { teams: [
    { name: 'Francia', flag: '🇫🇷' },
    { name: 'Senegal', flag: '🇸🇳' },
    { name: 'Irak', flag: '🇮🇶' },
    { name: 'Noruega', flag: '🇳🇴' },
  ]},
  J: { teams: [
    { name: 'Argentina', flag: '🇦🇷' },
    { name: 'Argelia', flag: '🇩🇿' },
    { name: 'Austria', flag: '🇦🇹' },
    { name: 'Jordania', flag: '🇯🇴' },
  ]},
  K: { teams: [
    { name: 'Portugal', flag: '🇵🇹' },
    { name: 'DR Congo', flag: '🇨🇩' },
    { name: 'Uzbekistán', flag: '🇺🇿' },
    { name: 'Colombia', flag: '🇨🇴' },
  ]},
  L: { teams: [
    { name: 'Inglaterra', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿' },
    { name: 'Croacia', flag: '🇭🇷' },
    { name: 'Ghana', flag: '🇬🇭' },
    { name: 'Panamá', flag: '🇵🇦' },
  ]},
}

// Fechas aproximadas por jornada y grupo
const scheduleDates = {
  // Jornada 1: Jun 11-17
  A: { md1: ['2026-06-11', '2026-06-11'], md2: ['2026-06-18', '2026-06-18'], md3: ['2026-06-25', '2026-06-25'] },
  B: { md1: ['2026-06-12', '2026-06-12'], md2: ['2026-06-19', '2026-06-19'], md3: ['2026-06-25', '2026-06-25'] },
  C: { md1: ['2026-06-12', '2026-06-12'], md2: ['2026-06-19', '2026-06-19'], md3: ['2026-06-26', '2026-06-26'] },
  D: { md1: ['2026-06-13', '2026-06-13'], md2: ['2026-06-20', '2026-06-20'], md3: ['2026-06-26', '2026-06-26'] },
  E: { md1: ['2026-06-13', '2026-06-13'], md2: ['2026-06-20', '2026-06-20'], md3: ['2026-06-26', '2026-06-26'] },
  F: { md1: ['2026-06-14', '2026-06-14'], md2: ['2026-06-21', '2026-06-21'], md3: ['2026-06-27', '2026-06-27'] },
  G: { md1: ['2026-06-14', '2026-06-14'], md2: ['2026-06-21', '2026-06-21'], md3: ['2026-06-27', '2026-06-27'] },
  H: { md1: ['2026-06-15', '2026-06-15'], md2: ['2026-06-22', '2026-06-22'], md3: ['2026-06-27', '2026-06-27'] },
  I: { md1: ['2026-06-15', '2026-06-15'], md2: ['2026-06-22', '2026-06-22'], md3: ['2026-06-28', '2026-06-28'] },
  J: { md1: ['2026-06-16', '2026-06-16'], md2: ['2026-06-23', '2026-06-23'], md3: ['2026-06-28', '2026-06-28'] },
  K: { md1: ['2026-06-16', '2026-06-16'], md2: ['2026-06-23', '2026-06-23'], md3: ['2026-06-28', '2026-06-28'] },
  L: { md1: ['2026-06-17', '2026-06-17'], md2: ['2026-06-24', '2026-06-24'], md3: ['2026-06-29', '2026-06-29'] },
}

function generateGroupMatches() {
  const matches = []
  for (const [groupLetter, { teams }] of Object.entries(groups)) {
    const dates = scheduleDates[groupLetter]
    const [t0, t1, t2, t3] = teams

    // Matchday 1
    matches.push({
      id: `${groupLetter}-1`,
      group: groupLetter,
      phase: 'Grupos',
      matchday: 1,
      home: t0, away: t1,
      date: dates.md1[0], time: '18:00',
      status: 'upcoming', result: null, firstScorer: null,
    })
    matches.push({
      id: `${groupLetter}-2`,
      group: groupLetter,
      phase: 'Grupos',
      matchday: 1,
      home: t2, away: t3,
      date: dates.md1[1], time: '21:00',
      status: 'upcoming', result: null, firstScorer: null,
    })

    // Matchday 2
    matches.push({
      id: `${groupLetter}-3`,
      group: groupLetter,
      phase: 'Grupos',
      matchday: 2,
      home: t0, away: t2,
      date: dates.md2[0], time: '18:00',
      status: 'upcoming', result: null, firstScorer: null,
    })
    matches.push({
      id: `${groupLetter}-4`,
      group: groupLetter,
      phase: 'Grupos',
      matchday: 2,
      home: t1, away: t3,
      date: dates.md2[1], time: '21:00',
      status: 'upcoming', result: null, firstScorer: null,
    })

    // Matchday 3 (simultáneo)
    matches.push({
      id: `${groupLetter}-5`,
      group: groupLetter,
      phase: 'Grupos',
      matchday: 3,
      home: t0, away: t3,
      date: dates.md3[0], time: '20:00',
      status: 'upcoming', result: null, firstScorer: null,
    })
    matches.push({
      id: `${groupLetter}-6`,
      group: groupLetter,
      phase: 'Grupos',
      matchday: 3,
      home: t1, away: t2,
      date: dates.md3[1], time: '20:00',
      status: 'upcoming', result: null, firstScorer: null,
    })
  }
  return matches
}

export const initialMatches = generateGroupMatches()
export const allTeams = Object.values(groups).flatMap(g => g.teams)
export { groups }
