// ════════════════════════════════════════════════════════════════
//  CONFIG  ·  edita SOLO este archivo
//  Los valores que cambian entre móvil y escritorio viven en los
//  bloques desktop/mobile; el resto es compartido. Usa activeSpiral()
//  y activeLegs() para leer la config ya resuelta para la pantalla actual.
// ════════════════════════════════════════════════════════════════

// mismo corte que usan los @media del CSS
export const BREAKPOINT = 768;
export const isMobile = () => window.innerWidth < BREAKPOINT;

// ─── ESPIRAL (fondo hipnótico) ───────────────────────────────────
export const SPIRAL = {
  color:       "#000000",   // color de la espiral
  background:  "#ffffff",   // color del fondo (los huecos entre bandas)

  turns:       7,           // nº de vueltas por brazo · muévelo para + / − aros
  arms:        4,           // nº de espirales (brazos) · 4 = cuatro lengüitas en el centro
  hole:        40,          // hueco central (el "ojo") · 0 = punta cerrada · 40 = ojo tipo pepi
  thickness:   0.6,         // grosor de banda · 0.5 = banda=hueco · >0.5 = menos separadas
  taper:       0.3,         // largo de la punta afilada, en vueltas

  spinSeconds: 34,          // segundos por vuelta completa  (más = más lento)
  reverse:     false,       // true = gira al revés

  // centro de la espiral: horizontal en dvw, vertical en dvh (50/50 = medio)
  desktop: { centerX: 10, centerY: 80 },   // a la izquierda, crece hacia el lado
  mobile:  { centerX: 50, centerY: 50 },   // centrada
};

// ─── PIERNAS (primer plano) ──────────────────────────────────────
export const LEGS = {
  // escritorio: de pie sobre el borde inferior, como siempre
  desktop: {
    size:    140,  // alto en dvh (grande: la parte de arriba se sale de pantalla)
    bottom:  10,   // la punta de los pies, a esta distancia del fondo, en dvh
    anchorX: 72,   // dónde queda el CENTRO DE LOS PIES, en dvw
  },
  // móvil: cuelgan del borde SUPERIOR, pequeñas, con vaivén derecha↔izquierda
  mobile: {
    size:         20,  // alto en dvh
    sweepSeconds: 8,   // segundos de un lado al otro
    sweepMin:     15,  // vaivén: extremo izquierdo, en dvw
    sweepMax:     85,  // vaivén: extremo derecho, en dvw
  },
};

// ─── MENÚ ────────────────────────────────────────────────────────
export const MENU = {
  autoOpenSeconds: 10,   // en el welcome: abrir el menú solo tras estos segundos

  // la transición va en dos tiempos: primero APARECEN LAS PALABRAS
  // (escalonadas), luego el fondo blanco se cierra detrás. Al elegir,
  // a la inversa: el fondo se retira y las palabras se van las últimas.
  wordMs:    500,        // fade de cada palabra
  bgMs:      600,        // fade del fondo blanco
  staggerMs: 70,         // retardo entre palabras

  // cada apertura sortea un tamaño distinto por palabra (en rem)
  sizeMin:   1.4,
  sizeMax:   2.8,
};

// ítems del menú, en orden de cortina (1º entra por la izquierda, 2º por la
// derecha, y así). El color de cada uno vive en css/base.css (--c-<id>).
export const MENU_ITEMS = [
  { id: "photo",   label: "photo",   route: "photo"   },
  { id: "graphic", label: "graphic", route: "graphic" },
  { id: "video",   label: "video",   route: "video"   },
  { id: "contact", label: "contact", route: "contact" },
  { id: "about",   label: "about",   route: "about"   },
  { id: "welcome", label: "welcome", route: ""        },
];

// ─── helpers de breakpoint ───────────────────────────────────────
// Devuelven la config plana para la pantalla actual (base + bloque activo).
export const activeSpiral = () =>
  ({ ...SPIRAL, ...(isMobile() ? SPIRAL.mobile : SPIRAL.desktop) });
export const activeLegs = () =>
  (isMobile() ? LEGS.mobile : LEGS.desktop);
