// ════════════════════════════════════════════════════════════════
//  GENERADOR DE LA ESPIRAL  ·  no hace falta tocar esto
//  (la espiral es un SVG vectorial dibujado por matemáticas)
// ════════════════════════════════════════════════════════════════
(function () {
  const CX = 500, CY = 500, MAXR = 470, STEP = 0.05, DISC_R = 500;

  // Geometría real del dibujo, para que welcome.js pueda calcular cuánto
  // agrandar la espiral sin duplicar estos números "a mano".
  window.SPIRAL_GEOMETRY = {
    discR: DISC_R,
    bandsMaxR: MAXR,
    // Al ser una espiral (no un círculo), la última vuelta de cada brazo
    // remata en un ángulo concreto: mirando justo "detrás" de ese remate
    // las bandas llegan menos lejos que en el resto. Este es el radio que
    // las bandas alcanzan SIEMPRE, mires al ángulo que mires — depende
    // solo de vueltas/brazos/hueco, así que se recalcula solo si los
    // cambias desde el panel. (Deducción: en cualquier ángulo, la banda
    // más exterior de un brazo cualquiera está a menos de una vuelta
    // completa de distancia angular del remate más cercano entre los N
    // brazos repartidos por igual; en el peor de los casos esa distancia
    // es 1/(arms·turns) de la vuelta total.)
    worstBandsRadius(cfg) {
      const { turns, arms, hole } = cfg;
      return hole + (MAXR - hole) * (1 - 1 / (arms * turns));
    },
  };

  // smoothstep: 0→1 con pendiente 0 en los extremos (transición sin codo, fluida)
  const smooth = t => t * t * (3 - 2 * t);

  // Banda rellena entre dos bordes: r_out(θ) y r_in = r_out - ancho.
  // El ancho crece de 0 (punta) a w a lo largo de `taperTheta` con smoothstep,
  // así la punta se afila de forma fluida. max(hueco, …) evita entrar en el ojo.
  function bandPaths(rOf, w, turns, arms, r0, taperTheta) {
    const thetaMax = 2 * Math.PI * turns, arcOff = 2 * Math.PI / arms, paths = [];
    for (let a = 0; a < arms; a++) {
      const off = a * arcOff;
      let out = "", inn = [];
      for (let th = 0; th <= thetaMax; th += STEP) {
        const grow = taperTheta > 0 ? smooth(Math.min(1, th / taperTheta)) : 1;
        const ro = rOf(th), ri = Math.max(r0, ro - w * grow);
        out += (th === 0 ? "M " : "L ")
             + (CX + ro * Math.cos(th + off)).toFixed(1) + " "
             + (CY + ro * Math.sin(th + off)).toFixed(1) + " ";
        inn.push((CX + ri * Math.cos(th + off)).toFixed(1) + " "
               + (CY + ri * Math.sin(th + off)).toFixed(1));
      }
      let back = "";
      for (let k = inn.length - 1; k >= 0; k--) back += "L " + inn[k] + " ";
      paths.push(out + back + "Z");
    }
    return paths;
  }

  // Dibuja la espiral (Arquímedes con hueco central: r = hueco + b·θ) según la CONFIG.
  window.renderSpiral = function (cfg) {
    const { turns, arms, hole: r0, thickness, taper, color, background } = cfg;
    const thetaMax = 2 * Math.PI * turns;
    const b = (MAXR - r0) / thetaMax;
    const w = 2 * Math.PI * b / arms * thickness;   // con N brazos, el ancho se divide entre N
    const taperTheta = (taper || 0) * 2 * Math.PI;  // largo de la punta, de vueltas a radianes
    const paths = bandPaths(th => r0 + b * th, w, turns, arms, r0, taperTheta);

    document.getElementById("spiralGroup").innerHTML =
      paths.map(d => `<path d="${d}" fill="${color}"/>`).join("");
    document.getElementById("spiralDisc").setAttribute("fill", background);
    document.body.style.background = background;
  };
})();
