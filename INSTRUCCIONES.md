# 🏆 Mundial Apuestas 2026 — Instrucciones

## Primer uso (solo la primera vez)

```bash
cd App_Mundial
npm install
npm run dev
```

Abre http://localhost:5173 — los 72 partidos de grupos se cargan automáticamente en Firebase la primera vez.

---

## Publicar en GitHub Pages

1. Crea un repo en GitHub (ej: `mundial-2026`)
2. En `vite.config.js` cambia `base: '/App_Mundial/'` por `base: '/mundial-2026/'` (el nombre de tu repo)
3. Ejecuta:

```bash
npm run build
npm run deploy
```

4. En GitHub → Settings → Pages → Source: `gh-pages` branch
5. Tu URL será: `https://TU_USUARIO.github.io/mundial-2026/`

---

## Configuración inicial

### Añadir admins
En `src/config.js`:
```js
export const ADMIN_NAMES = ['Rafa', 'OtroAdmin']
```
Los admins ven el panel para meter resultados.

### Ajustar monedas iniciales
```js
export const INITIAL_COINS = 1000
```

---

## Cómo funciona

### Para los jugadores
1. Entran en la URL y ponen su nombre
2. Reciben 1.000 🪙 WorldCoins
3. Pueden apostar en cada partido antes de que empiece
4. Tienen 1 comodín (dobla ganancias de UN partido)
5. Pueden apostar por el campeón (×15 si aciertan)
6. Rachas: 3 aciertos seguidos = +100, 5 = +250, 10 = +1000

### Para el admin (tú)
1. Entra con tu nombre (tiene que estar en `ADMIN_NAMES`)
2. Verás el botón "Panel de administrador"
3. Cuando termine un partido: introduce el resultado y pulsa "Publicar resultado y liquidar"
4. El sistema paga automáticamente a los ganadores y envía memes a los perdedores
5. Para fases eliminatorias: usa "+ Añadir partido eliminatoria"

### Tipos de apuesta y multiplicadores
| Tipo | Multiplicador |
|------|--------------|
| Ganador/Empate | ×2 |
| Resultado exacto | ×5 |
| Nº de goles | ×3 |
| Primer goleador | ×8 |
| Predicción de campeón | ×15 |

---

## Solución de problemas

**"Firebase permission denied"** → Asegúrate de que las reglas de Firestore permiten lectura/escritura:
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

**Dos jugadores con el mismo nombre** → Cada jugador usa el mismo dispositivo siempre. El userId se guarda en localStorage.
