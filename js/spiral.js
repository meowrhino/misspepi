// ════════════════════════════════════════════════════════════════
//  GENERADOR DE LA ESPIRAL  ·  no hace falta tocar esto
//  (la espiral es un SVG vectorial dibujado por matemáticas)
// ════════════════════════════════════════════════════════════════
(function () {
  const CX = 500, CY = 500, MAXR = 470, STEP = 0.05;

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
