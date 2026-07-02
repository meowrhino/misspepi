// ════════════════════════════════════════════════════════════════
//  CONFIG  ·  edita SOLO este archivo
// ════════════════════════════════════════════════════════════════

// ─── ESPIRAL (fondo hipnótico) ───────────────────────────────────
const SPIRAL = {
  color:       "#000000",   // color de la espiral
  background:  "#ffffff",   // color del fondo (los huecos entre bandas)

  turns:       7,           // nº de vueltas por brazo · muévelo para + / − aros
  arms:        4,           // nº de espirales (brazos) · 4 = cuatro lengüitas en el centro
  hole:        40,          // hueco central (el "ojo") · 0 = punta cerrada · 40 = ojo tipo pepi
  thickness:   0.6,         // grosor de banda · 0.5 = banda=hueco · >0.5 = menos separadas · <0.5 = más finas
  taper:       0.3,         // largo de la punta afilada, en vueltas · más = transición más larga y fluida

  centerX:     10,          // centro de la espiral · horizontal, en dvw desde la izquierda (50 = medio)
  centerY:     80,          // centro de la espiral · vertical,   en dvh desde arriba (50 = medio)
                             // = 20dvh desde ABAJO → si quieres medir desde abajo: centerY = 100 − distancia_al_bottom

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
