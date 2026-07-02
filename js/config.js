// ════════════════════════════════════════════════════════════════
//  CONFIG  ·  edita SOLO este archivo
// ════════════════════════════════════════════════════════════════

// ─── ESPIRAL (fondo hipnótico) ───────────────────────────────────
const SPIRAL = {
  color:       "#000000",   // color de la espiral
  background:  "#ffffff",   // color del fondo (los huecos entre bandas)

  turns:       7,           // nº de espirales (vueltas por brazo) · muévelo para + / − aros
  arms:        2,           // nº de brazos · 2 = centro con dos lengüitas (como pepi)
  hole:        40,          // hueco central · 0 = punta cerrada · 40 = "ojo" tipo pepi
  thickness:   0.5,         // grosor de banda · 0.5 = banda y hueco iguales

  centerX:     50,          // centro de la espiral · horizontal, en dvw  (50 = medio)
  centerY:     50,          // centro de la espiral · vertical,   en dvh  (50 = medio)

  spinSeconds: 34,          // segundos por vuelta completa  (más = más lento)
  reverse:     false,       // true = gira al revés
};

// ─── PIERNAS (primer plano) ──────────────────────────────────────
const LEGS = {
  size:    140,   // alto en dvh  (grande: la parte de arriba se sale de pantalla)
  bottom:  10,    // la punta de los pies, a esta distancia del fondo, en dvh
  anchorX: 72,    // dónde queda el CENTRO DE LOS PIES, en dvw (0=izq · 50=medio · 100=der)
                  // se mantiene igual en móvil y desktop
};
