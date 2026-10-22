// Lumikréa — la tablette à dessiner : on trace au doigt, à la souris ou au stylet, avec les feutres du produit.
// Le dessin de départ (soleil, cœur, vague, zigzag) reprend celui de l'ancien site ; la tablette s'allume
// quand la boule lumineuse arrive au centre de la plaque (classe .is-allumee posée par app.js).
(() => {
  "use strict";

  const toile = document.getElementById("toile"), ctx = toile.getContext("2d");
  const feutres = document.getElementById("feutres"), indice = document.getElementById("indice"), effacer = document.getElementById("effacer");
  const COULEURS = [["Jaune", "#ffe14a"], ["Vert", "#4ee35f"], ["Bleu", "#4f8dff"], ["Violet", "#b06bff"], ["Rose", "#ff6fb1"], ["Orange", "#ff8f33"], ["Blanc", "#fffaf0"]];
  const [JAUNE, VERT, , , ROSE, ORANGE] = COULEURS.map(([, hex]) => hex);

  // Dessin de départ, décrit dans un repère 300 × 200 puis ramené entre 0 et 1 (il suit la taille de la plaque).
  function depart() {
    const norm = (pts) => pts.map((v, i) => v / (i % 2 ? 200 : 300));
    const traits = [];
    const soleil = [];
    for (let k = 0; k <= 24; k++) { const a = k / 24 * Math.PI * 2; soleil.push(62 + Math.cos(a) * 17, 58 + Math.sin(a) * 17); }
    traits.push({ c: JAUNE, p: norm(soleil) });
    for (let k = 0; k < 8; k++) {
      const a = k / 8 * Math.PI * 2;
      traits.push({ c: JAUNE, p: norm([62 + Math.cos(a) * 25, 58 + Math.sin(a) * 25, 62 + Math.cos(a) * 34, 58 + Math.sin(a) * 34]) });
    }
    const coeur = [];
    for (let k = 0; k <= 32; k++) {
      const t = k / 32 * Math.PI * 2;
      coeur.push(226 + 1.35 * 16 * Math.sin(t) ** 3, 78 - 1.35 * (13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)));
    }
    traits.push({ c: ROSE, p: norm(coeur) });
    const vague = [];
    for (let x = 40; x <= 260; x += 5) vague.push(x, 150 + Math.sin((x - 40) / 16) * 9);
    traits.push({ c: VERT, p: norm(vague) });
    traits.push({ c: ORANGE, p: norm([128, 96, 138, 76, 148, 96, 158, 76, 168, 96, 178, 76]) });
    return traits;
  }

  let traits = depart(), courant = null, couleur = JAUNE;

  // Trace un trait (ou seulement sa fin, depuis le point « from ») avec la lueur du feutre fluo.
  function peindre(trait, from = 0) {
    const { width: w, height: h } = toile, lw = Math.max(3, w * 0.009), p = trait.p, s = Math.max(0, from) * 2;
    ctx.lineCap = "round"; ctx.lineJoin = "round"; ctx.lineWidth = lw;
    ctx.strokeStyle = trait.c; ctx.shadowColor = trait.c; ctx.shadowBlur = lw * 2.2;
    ctx.beginPath();
    ctx.moveTo(p[s] * w, p[s + 1] * h);
    if (p.length - s <= 2) ctx.lineTo(p[s] * w + 0.1, p[s + 1] * h);      // un point seul reste visible
    for (let i = s + 2; i < p.length; i += 2) ctx.lineTo(p[i] * w, p[i + 1] * h);
    ctx.stroke();
  }
  const redessiner = () => { ctx.clearRect(0, 0, toile.width, toile.height); traits.forEach((t) => peindre(t)); };

  // La résolution du canevas suit sa taille affichée et la densité de l'écran.
  new ResizeObserver(() => {
    const ratio = Math.min(devicePixelRatio || 1, 2);
    toile.width = Math.round(toile.clientWidth * ratio);
    toile.height = Math.round(toile.clientHeight * ratio);
    redessiner();
  }).observe(toile);

  const point = (e) => { const r = toile.getBoundingClientRect(); return [(e.clientX - r.left) / r.width, (e.clientY - r.top) / r.height]; };
  toile.addEventListener("pointerdown", (e) => {
    if (e.button !== 0) return;
    toile.setPointerCapture(e.pointerId);
    courant = { c: couleur, p: point(e) };
    traits.push(courant);
    indice.hidden = true;
    peindre(courant);
  });
  toile.addEventListener("pointermove", (e) => {
    if (!courant) return;
    courant.p.push(...point(e));
    peindre(courant, courant.p.length / 2 - 2);          // seul le dernier segment est tracé
  });
  const fin = () => { courant = null; };
  toile.addEventListener("pointerup", fin);
  toile.addEventListener("pointercancel", fin);

  // Feutres : un bouton radio par couleur.
  const boutons = COULEURS.map(([nom, hex]) => {
    const b = document.createElement("button");
    b.type = "button"; b.className = "feutre"; b.setAttribute("role", "radio");
    b.setAttribute("aria-label", nom); b.setAttribute("aria-checked", String(hex === couleur));
    b.style.setProperty("--c", hex);
    b.addEventListener("click", () => {
      couleur = hex;
      boutons.forEach((o) => o.setAttribute("aria-checked", String(o === b)));
    });
    feutres.append(b);
    return b;
  });

  effacer.addEventListener("click", () => { traits = []; courant = null; indice.hidden = true; redessiner(); });
})();
