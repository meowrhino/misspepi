// ════════════════════════════════════════════════════════════════
//  CONFIG DE LA ESPIRAL  ·  edita SOLO estos valores
// ════════════════════════════════════════════════════════════════
const SPIRAL = {
  color:       "#000000",   // color de la espiral
  background:  "#ffffff",   // color del fondo (los huecos entre bandas)

  turns:       7,           // vueltas por brazo  (más = más densa)
  arms:        2,           // nº de brazos · 2 = centro con dos lengüitas (como pepi)
  hole:        40,          // hueco central · 0 = punta cerrada · 40 = "ojo" tipo pepi
  thickness:   0.5,         // grosor de banda · 0.5 = banda y hueco iguales

  spinSeconds: 34,          // segundos por vuelta completa  (más = más lento)
  reverse:     false,       // true = gira en sentido contrario
  hoverBoost:  6,           // cuánto acelera al pasar el ratón por "entrar"
};
