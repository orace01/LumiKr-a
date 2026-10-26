// Lumikréa — prototype : hero vidéo piloté par le scroll, textes de chapitres.
// Toutes les animations dépendent du « temps du récit » t (0 à 30,5 s), calculé depuis la position du scroll.
(() => {
  "use strict";

  const FPS = 24;
  const VIDEO_END = 609 / FPS;          // durée du hero (25,375 s)
  const STORY_END = 36.5;               // après la vidéo : extinction, boule, titre écrit, point final, descente
  // Fin du récit (secondes) : le bleu se referme des quatre coins après « Un souvenir » (sorti à 28,0) ; la boule naît
  // au centre, écrit « Vos idées, en pleine lumière », se pose en point final, puis descend sous le sous-titre
  // (éclairé mot à mot) en laissant un fil, jusqu'au bas de l'écran où commence le fil des sections.
  const FIN = {
    dark: [28.0, 30.0], ball: [29.3, 29.9], toLine: [29.9, 30.2], write: [30.2, 32.4], toPoint: [32.4, 32.8],
    sub: [33.2, 33.6], words: [33.4, 35.6], down: [34.0, 36.3], handoff: [36.42, 36.5],
  };
  const AV1 = 'video/mp4; codecs="av01.0.08M.08"';

  const $ = (s) => document.querySelector(s);
  const body = document.body;
  const hero = $("#hero"), heroVideo = $("#heroVideo"), eteint = $("#eteint");
  const stage = $(".stage"), titre = $("#titre"), lignes = [...titre.querySelectorAll(".l")], boule = $("#boule");
  const trace = $("#trace"), tracePaths = [...trace.querySelectorAll("path")];
  const suite = $("#suite"), fil = $("#fil"), filPaths = [...fil.querySelectorAll("path")], tete = $("#tete");
  const plaque = $(".plaque");
  const ouverture = $("#ouverture");

  const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
  const ease = (x) => { x = clamp(x); return x * x * (3 - 2 * x); };
  const span = (t, a, b) => ease((t - a) / (b - a));
  const mix = (a, b, k) => a + (b - a) * k;

  const params = new URLSearchParams(location.search);
  // La page repart toujours du haut : le récit du hero commence au début.
  if ("scrollRestoration" in history) history.scrollRestoration = "manual";
  window.scrollTo(0, 0);
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const portraitQuery = matchMedia("(orientation: portrait)");
  const fmt = portraitQuery.matches ? "9x16" : "16x9";
  // Changement d'orientation : on recharge avec l'autre format de vidéo.
  portraitQuery.addEventListener("change", () => location.reload());

  // Même vitesse de scroll qu'avant l'ajout de la fin (1000svh / 900vh pour 30,5 s).
  document.documentElement.style.setProperty("--hero-h", `${Math.round(STORY_END * (fmt === "9x16" ? 1000 : 900) / 30.5)}${fmt === "9x16" ? "svh" : "vh"}`);
  heroVideo.poster = `media/hero-${fmt}.webp`;

  // ---------- Chapitres : préparation ----------
  // Un paragraphe découpé en mots (.w) qui s'éclairent un par un au scroll.
  const splitWords = (sub) => {
    const words = sub.textContent.trim().split(/\s+/);
    sub.textContent = "";
    return words.map((w, i) => {
      const s = document.createElement("span");
      s.className = "w"; s.textContent = w;
      sub.append(s, i < words.length - 1 ? " " : "");
      return s;
    });
  };
  const lightWords = (spans, t, show, [a, b]) => {
    const step = (b - a) / spans.length;
    spans.forEach((s, i) => {
      const lit = clamp((t - (a + i * step)) / 0.18);
      const w = Math.round(show * (0.26 + 0.74 * lit) * 100) / 100;
      if (s._w !== w) { s._w = w; s.style.setProperty("--w", w); }
    });
  };

  const chapters = [...document.querySelectorAll(".chapter")].map((el) => {
    const d = el.dataset;
    const spans = splitWords(el.querySelector(".sub"));
    return { el, spans, tIn: +d.in, tScript: +d.script, tSubShow: d.subshow ? +d.subshow : +d.in + 0.3, tSub: +d.sub, tSubEnd: +d.subend, tOut: +d.out, cache: {} };
  });
  const setVar = (el, cache, name, value) => {
    const v = Math.round(value * 1000) / 1000;
    if (cache[name] !== v) { cache[name] = v; el.style.setProperty(name, v); }
  };

  function render(t) {
    for (const c of chapters) {
      const a = span(t, c.tIn, c.tIn + 0.5) * (1 - span(t, c.tOut, c.tOut + 0.5));
      setVar(c.el, c.cache, "--a", a);
      if (a <= 0) continue;
      setVar(c.el, c.cache, "--y", 26 * (1 - span(t, c.tIn, c.tIn + 0.6)) - 20 * span(t, c.tOut, c.tOut + 0.5));
      setVar(c.el, c.cache, "--s", span(t, c.tScript, c.tScript + 0.8));
      const show = clamp((t - c.tSubShow) / 0.4);
      setVar(c.el, c.cache, "--sa", show);
      lightWords(c.spans, t, show, [c.tSub, c.tSubEnd]);
    }
    const ec = eteint._c || (eteint._c = {});
    setVar(eteint, ec, "--h", 1.25 * (1 - span(t, ...FIN.dark)));
    setVar(eteint, ec, "--plein", span(t, FIN.dark[1] - 0.5, FIN.dark[1]));   // aplat plein : derrière tout le titre
    renderFin(t);
    // Ouverture : s'efface en montant dès le premier scroll.
    const oc = ouverture._c || (ouverture._c = {}), o = 1 - span(t, 0.02, 0.42);
    setVar(ouverture, oc, "--o", o);
    const cachee = o < 0.01;                              // invisible : ne doit plus capter les clics
    if (ouverture._h !== cachee) { ouverture._h = cachee; ouverture.style.visibility = cachee ? "hidden" : ""; }
  }

  // ---------- Fin : la boule écrit le titre, devient le point final, puis descend ----------
  // Géométrie mesurée au redimensionnement (repère de la scène) : centre, bas, chaque ligne du titre
  // (début, largeur, minutage), position et taille du point final, tracé de la descente sous le sous-titre.
  let geo = null, lastBall = "", traceLen = 0, suivi = 0.62;
  function measureFin() {
    const s = stage.getBoundingClientRect();
    const fs = parseFloat(getComputedStyle(lignes[lignes.length - 1]).fontSize);   // police de la ligne au feutre
    const lines = lignes.map((l) => { const r = l.getBoundingClientRect(); return { x: r.left - s.left, y: r.top - s.top + r.height * 0.5, w: r.width }; });
    const gap = 0.14;                                   // temps pour revenir au début de la ligne suivante
    const total = lines.reduce((n, l) => n + l.w, 0), write = FIN.write[1] - FIN.write[0] - gap * (lines.length - 1);
    let at = FIN.write[0];
    for (const l of lines) { l.t0 = at; l.t1 = at + write * l.w / total; at = l.t1 + gap; }
    const end = lines[lines.length - 1];
    // Le point final : juste après « lumière », posé sur la ligne de base, de la taille d'un point de la police.
    const point = { x: end.x + end.w + fs * 0.1, y: end.y + fs * 0.27, s: (fs * 0.19) / 22 };
    const titreBas = titre.getBoundingClientRect().bottom - s.top;
    const W = s.width, H = s.height;
    // Hauteur de suivi : la boule finit sa descente sous le titre, puis reste à cette hauteur de l'écran pendant tout
    // le scroll des sections (même rapport dans drawFil) : elle suit le scroll sans saut.
    // Hauteurs prises sur la scène (100lvh, fixe) et non sur la zone visible, qui change quand les barres du
    // navigateur mobile se replient : la géométrie reste la même pendant tout le scroll.
    suivi = clamp(titreBas / H + 0.14, 0.62, 0.85);
    const endY = H * suivi;
    // Descente : du point, vers le bas, puis vers le centre, à la hauteur de suivi.
    const d = `M ${point.x} ${point.y} C ${point.x} ${endY}, ${W / 2} ${endY - (endY - point.y) * 0.25}, ${W / 2} ${endY}`;
    trace.setAttribute("viewBox", `0 0 ${W} ${H}`);
    tracePaths.forEach((p) => p.setAttribute("d", d));
    traceLen = tracePaths[0].getTotalLength();
    trace.style.setProperty("--len", traceLen.toFixed(1));
    geo = { cx: W / 2, cy: H / 2, lines, point };
    lastBall = "";
  }

  function renderFin(t) {
    if (!geo) return;
    const L = geo.lines, first = L[0], end = L[L.length - 1], P = geo.point;
    lignes.forEach((el, i) => {
      const r = Math.round(clamp((t - L[i].t0) / (L[i].t1 - L[i].t0)) * 1000) / 1000;
      if (el._r !== r) { el._r = r; el.style.setProperty("--r", r); }
    });

    let x = geo.cx, y = geo.cy, s = span(t, ...FIN.ball), drawn = 0;
    if (t >= FIN.toLine[0] && t < FIN.write[0]) {           // du centre au début de la première ligne
      const k = span(t, ...FIN.toLine);
      x = mix(geo.cx, first.x, k); y = mix(geo.cy, first.y, k);
    } else if (t >= FIN.write[0] && t < end.t1) {          // écriture : la boule est le bord du texte révélé
      for (let i = 0; i < L.length; i++) {
        const l = L[i];
        if (t < l.t0) { const p = L[i - 1], k = ease((t - p.t1) / (l.t0 - p.t1)); x = mix(p.x + p.w, l.x, k); y = mix(p.y, l.y, k); break; }
        if (t <= l.t1) { x = l.x + l.w * (t - l.t0) / (l.t1 - l.t0); y = l.y; break; }
      }
    } else if (t >= end.t1 && t < FIN.down[0]) {           // la boule se pose en point final
      const k = span(t, ...FIN.toPoint);
      x = mix(end.x + end.w, P.x, k); y = mix(end.y, P.y, k); s = mix(1, P.s, k);
    } else if (t >= FIN.down[0]) {                         // descente : elle laisse le fil derrière elle
      const k = span(t, ...FIN.down), pt = tracePaths[0].getPointAtLength(k * traceLen);
      x = pt.x; y = pt.y; s = mix(P.s, 0.64, k); drawn = k;   // 0,64 × 22 px = la tête du fil (14 px)
    }
    const o = s > 0 ? 1 - span(t, ...FIN.handoff) : 0;
    const v = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px) scale(${s.toFixed(3)})`;
    if (v !== lastBall) { lastBall = v; boule.style.transform = v; }
    if (boule._o !== o) { boule._o = o; boule.style.opacity = o; }
    const off = Math.round(traceLen * (1 - drawn) * 10) / 10;
    if (trace._off !== off) { trace._off = off; trace.style.setProperty("--off", off); }
  }

  // ---------- Trajet de la boule derrière les sections, jusqu'au centre de la tablette ----------
  // Il part là où la boule a fini sa descente : au centre, à la hauteur de suivi de l'écran, quand le hero se termine
  // (le bas de la scène touche alors le haut de .suite, d'où y0 négatif).
  // Stations ([data-station], dans l'ordre de la page) : la boule passe par chacune et l'allume (.is-allumee, retirée
  // si l'on remonte).
  //  - « tablette » (dessin, questions) : elle entre dans la plaque et y reste tant que la section est à l'écran ;
  //  - « epingle » (usages) : la scène reste collée à l'écran ; la boule entre dans le cadre à son arrivée, y reste
  //    cachée pendant que les usages défilent, et en ressort quand la scène se libère ;
  //  - « ecriture » (« créer. ») : elle écrit le mot de gauche à droite au fil du scroll ;
  //  - sans valeur (échelle, boîte, photo de fin) : elle passe par le centre.
  const stations = [...document.querySelectorAll("[data-station]")];
  let filLen = 0, filTable = [], suiteTop = 0, lastFil = -1, y0 = 0, sy = 0, stationLens = [], sceneH = 1;
  let pauses = [], caches = [], ecritures = [];

  // Longueur du trajet atteinte à la hauteur y, sans revenir en arrière de minL (après un mot écrit à l'horizontale).
  function chercher(y, minL) {
    let i = 1;
    while (i < filTable.length && (filTable[i][0] < minL || filTable[i][1] < y)) i++;
    if (i >= filTable.length) return filLen;
    const [l0, ya] = filTable[i - 1], [l1, yb] = filTable[i];
    return Math.max(minL, l0 + (l1 - l0) * clamp((y - ya) / ((yb - ya) || 1)));
  }
  // Longueur parcourue pour une hauteur de scroll yT (repère de .suite). Pendant une pause (tablette, écriture), le
  // scroll fait avancer la boule de l0 à l1 : immobile dans la plaque, ou le long du mot. Après, elle rattrape sa
  // hauteur habituelle sur R pixels de scroll.
  function longueurTrajet(yT) {
    let minL = 0, yE = yT;
    for (const p of pauses) {                            // une pause plus loin l'emporte sur le rattrapage d'avant
      if (yT < p.y) break;
      if (yT < p.y + p.D) return mix(p.l0, p.l1, (yT - p.y) / p.D);
      minL = p.l1;
      yE = yT < p.y + p.D + p.R ? mix(yT - p.D, yT, ease((yT - p.y - p.D) / p.R)) : yT;
    }
    return chercher(yE, minL);
  }
  const lit = stations.map(() => false);
  function buildFil() {
    const w = suite.clientWidth, h = suite.offsetHeight, portrait = fmt === "9x16";
    const r = suite.getBoundingClientRect();
    sceneH = stage.offsetHeight;
    const step = sceneH * (portrait ? 0.5 : 0.7);
    const xl = w * (portrait ? 0.12 : 0.18), xr = w * (portrait ? 0.88 : 0.82);
    y0 = sceneH * suivi - sceneH;
    let x = w / 2, y = y0, d = `M ${x} ${y0}`, right = true;
    const ends = [];                                      // longueur du tracé jusqu'à chaque station
    pauses = []; caches = []; ecritures = [];
    // Courbes alternées droite-gauche jusqu'au point (bx, by), la dernière finit dessus.
    const vers = (bx, by) => {
      const n = Math.max(1, Math.round((by - y) / step)), ys = y;
      for (let i = 1; i <= n; i++) {
        const ny = ys + (by - ys) * i / n, nx = i === n ? bx : (right ? xr : xl), c = (ny - y) * 0.55;
        d += ` C ${x} ${y + c}, ${nx} ${ny - c}, ${nx} ${ny}`;
        x = nx; y = ny;
        if (i < n) right = !right;
      }
    };
    const mesure = () => { filPaths[1].setAttribute("d", d); return filPaths[1].getTotalLength(); };   // tracé provisoire
    for (const st of stations) {
      const kind = st.dataset.station, p = st.getBoundingClientRect();
      const bx = p.left - r.left + p.width / 2, by = p.top - r.top + p.height / 2;
      if (kind === "epingle") {
        // Le cadre colle à l'écran : on calcule son centre au début et à la fin du collage (positions dans la page),
        // la boule y entre au premier, descend cachée en ligne droite, ressort au second.
        const sec = st.closest("section"), scene = st.offsetParent;
        const top = sec.getBoundingClientRect().top - r.top, fc = st.offsetTop + st.offsetHeight / 2;
        vers(bx, top + fc);
        const a = mesure();
        y = top + sec.offsetHeight - scene.offsetHeight + fc;
        d += ` L ${bx} ${y}`;
        caches.push([a, mesure()]); ends.push(a);
        continue;
      }
      if (kind === "ecriture") {
        // Le mot : la boule arrive à sa gauche, puis le parcourt en ligne droite pendant D pixels de scroll.
        vers(p.left - r.left, by);
        const l0 = mesure();
        x = p.right - r.left; d += ` L ${x} ${by}`;
        const l1 = mesure();
        pauses.push({ y: by, D: sceneH * 0.45, R: sceneH * 0.5, l0, l1 });
        ecritures.push({ el: st.closest("h2") || st, l0, l1 });
        ends.push(l1);
        continue;
      }
      vers(bx, by);
      const l = mesure();
      ends.push(l);
      if (kind === "tablette") {                         // la boule reste dans la plaque jusqu'au bas de la section
        const bas = st.closest("section").getBoundingClientRect().bottom - r.top;
        pauses.push({ y: by, D: Math.max(0, bas - by), R: sceneH * 0.5, l0: l, l1: l });
        caches.push([l, l]);
      }
    }
    stationLens = ends;
    fil.setAttribute("viewBox", `0 0 ${w} ${h}`);
    filPaths.forEach((path) => path.setAttribute("d", d));
    filLen = filPaths[0].getTotalLength();
    fil.style.setProperty("--len", filLen.toFixed(1));
    filTable = [];                                       // longueur → hauteur, pour retrouver la tête depuis le scroll
    for (let i = 0; i <= 600; i++) { const l = filLen * i / 600; filTable.push([l, filPaths[0].getPointAtLength(l).y]); }
    suiteTop = r.top + scrollY;
    lastFil = -1;
  }

  // La boule reste à la hauteur de suivi de l'écran et avance sur son trajet avec le scroll (lissé comme le hero).
  // Elle prend le relais de la boule du hero à la fin de celui-ci et allume les stations qu'elle atteint.
  function drawFil() {
    const yTarget = sy + sceneH * suivi - suiteTop;
    const cachee = yTarget < y0 - 1;
    if (tete._c !== cachee) { tete._c = cachee; tete.classList.toggle("is-cachee", cachee); }
    let len = yTarget > y0 ? longueurTrajet(yTarget) : 0;
    len = Math.round(len * 10) / 10;
    if (len === lastFil) return;
    lastFil = len;
    fil.style.setProperty("--off", (filLen - len).toFixed(1));
    const p = filPaths[0].getPointAtLength(len);
    // Tablettes et cadre des usages : la boule y entre en rétrécissant jusqu'à disparaître, y reste cachée, puis en
    // ressort en grandissant.
    let k = 1;
    for (const [a, b] of caches) k = Math.min(k, clamp((len < a ? a - len : len > b ? len - b : 0) / (sceneH * 0.12)));
    tete.style.transform = `translate(${p.x.toFixed(1)}px, ${p.y.toFixed(1)}px) scale(${ease(k).toFixed(3)})`;
    // « créer. » : le mot se révèle derrière la boule.
    for (const e of ecritures) {
      const s = Math.round(clamp((len - e.l0) / ((e.l1 - e.l0) || 1)) * 1000) / 1000;
      if (e.el._s !== s) { e.el._s = s; e.el.style.setProperty("--s", s); }
    }
    stations.forEach((st, i) => {
      const on = filLen > 0 && len >= stationLens[i] - 1;
      if (on !== lit[i]) { lit[i] = on; st.classList.toggle("is-allumee", on); }
    });
    // Au bout du trajet (le produit du dernier écran), la boule se fond dans la lumière qu'elle a allumée.
    const fin = filLen > 0 && len >= filLen - 0.5;
    if (tete._fin !== fin) { tete._fin = fin; tete.classList.toggle("is-arrivee", fin); }
  }

  // ---------- Mouvement réduit : pas de vidéo pilotée ----------
  if (reduced) {
    body.classList.add("reduced", "is-ouvert");
    heroVideo.poster = `media/hero-${fmt}-fin.webp`;
    stations.forEach((st) => st.classList.add("is-allumee"));   // tout est allumé, sans boule
    document.fonts.ready.then(buildFil);
    addEventListener("resize", buildFil);
    return;
  }

  // ---------- Hero : choix du fichier et téléchargement avec progression ----------
  // Version des vidéos : à changer à chaque ré-encodage, sinon le cache (1 h) garde les anciennes.
  const MEDIA_V = "2";
  // Grand écran en paysage (largeur réelle ≥ 1700 px) : version HD (AV1 2560×1440, H.264 1920×1080).
  const hd = fmt === "16x9" && Math.max(screen.width, innerWidth) * (devicePixelRatio || 1) >= 1700;
  const heroName = hd ? "16x9-hd" : fmt;
  const heroUrl = (codec) => `media/hero-${heroName}.${codec}.mp4?v=${MEDIA_V}`;
  async function pickHeroSource() {
    const h264 = heroUrl("h264");
    if (!heroVideo.canPlayType(AV1)) return h264;
    try {
      const [w, h] = fmt === "9x16" ? [1080, 1920] : hd ? [2560, 1440] : [1920, 1080];
      const info = await navigator.mediaCapabilities.decodingInfo({ type: "file", video: { contentType: AV1, width: w, height: h, bitrate: 1200000, framerate: FPS } });
      // AV1 seulement si le décodage est matériel : sinon le scrub saccade sur téléphone.
      if (info.supported && info.powerEfficient) return heroUrl("av1");
    } catch { /* navigateur sans mediaCapabilities */ }
    return h264;
  }

  // Télécharge le fichier en entier pour remplir le cache HTTP : le scrub n'attend ensuite plus le réseau.
  // La vidéo lit ensuite l'adresse directe : WebKit (iPhone) lit mal une vidéo passée en URL blob.
  async function download(url) {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Téléchargement impossible (${res.status})`);
    await res.blob();
  }

  // Charge la vidéo par son adresse directe ; vrai si une image est prête.
  function loadHero(src) {
    return new Promise((resolve) => {
      let done = false;
      const finish = (ok) => {
        if (done) return;
        done = true; clearTimeout(timer);
        heroVideo.removeEventListener("loadeddata", onData);
        heroVideo.removeEventListener("error", onError);
        resolve(ok);
      };
      const onData = () => { heroVideo.currentTime = 0; finish(true); };
      const onError = () => finish(false);
      const timer = setTimeout(() => finish(heroVideo.readyState >= 2), 10000);
      heroVideo.addEventListener("loadeddata", onData);
      heroVideo.addEventListener("error", onError);
      heroVideo.preload = "auto";
      heroVideo.src = src;
      heroVideo.load();
      // iOS ne charge les images qu'après une lecture : on lance, la boucle d'affichage remet aussitôt en pause.
      heroVideo.play().catch(() => { /* lecture refusée (économie d'énergie) : l'image d'attente reste */ });
    });
  }

  // L'image d'attente (poster) s'affiche tout de suite ; la vidéo prend le relais dès qu'elle est chargée.
  let heroSrc = "";
  (async () => {
    heroSrc = await pickHeroSource();
    try {
      await download(heroSrc);
    } catch { /* la vidéo se chargera directement */ }
    await document.fonts.ready;
    const ok = await loadHero(heroSrc);
    if (!ok && heroSrc.includes(".av1.")) {        // AV1 refusé par l'appareil : repli H.264
      heroSrc = heroUrl("h264");
      await loadHero(heroSrc);
    }
  })();

  // ?debug : état de la vidéo affiché à l'écran (pour diagnostiquer sur téléphone).
  if (params.has("debug")) {
    const box = document.createElement("pre");
    box.style.cssText = "position:fixed;z-index:99;left:8px;bottom:8px;max-width:92vw;margin:0;padding:8px;font:11px/1.35 ui-monospace,monospace;color:#fff;background:rgba(0,0,0,.75);white-space:pre-wrap;pointer-events:none";
    document.body.append(box);
    const states = ["VIDE", "META", "IMAGE", "SUITE", "ASSEZ"];
    // Fluidité : images affichées par la page et par la vidéo chaque seconde, durée des recherches vidéo.
    let pageFrames = 0, videoFrames = 0, seekAt = 0, seekMs = [];
    const countPage = () => { pageFrames++; requestAnimationFrame(countPage); };
    requestAnimationFrame(countPage);
    const countVideo = () => { videoFrames++; heroVideo.requestVideoFrameCallback(countVideo); };
    if ("requestVideoFrameCallback" in heroVideo) heroVideo.requestVideoFrameCallback(countVideo);
    heroVideo.addEventListener("seeking", () => { seekAt = performance.now(); });
    heroVideo.addEventListener("seeked", () => { seekMs.push(performance.now() - seekAt); if (seekMs.length > 60) seekMs.shift(); });
    setInterval(() => {
      const v = heroVideo, b = v.buffered.length ? v.buffered.end(v.buffered.length - 1).toFixed(1) : "0";
      const sorted = seekMs.slice().sort((x, y) => x - y), med = sorted.length ? sorted[sorted.length >> 1].toFixed(0) : "–";
      const fps = `page ${pageFrames * 2} i/s · vidéo ${videoFrames * 2} i/s · recherche ${med} ms`;
      pageFrames = 0; videoFrames = 0;
      box.textContent = [
        fps,
        `format ${fmt} · source ${heroSrc || "(choix en cours)"}`,
        `readyState ${v.readyState} ${states[v.readyState] || ""} · network ${v.networkState} · erreur ${v.error ? v.error.code + " " + (v.error.message || "") : "aucune"}`,
        `paused ${v.paused} · temps ${v.currentTime.toFixed(2)} · tampon ${b} s · taille ${v.videoWidth}×${v.videoHeight}`,
        `AV1 ${v.canPlayType(AV1) || "non"} · H.264 ${v.canPlayType('video/mp4; codecs="avc1.64001F"') || "non"}`,
        navigator.userAgent.slice(0, 120),
      ].join("\n");
    }, 500);
  }

  // ---------- Ouverture : se joue dès l'affichage ----------
  setTimeout(() => body.classList.add("is-ouvert"), 80);

  // ---------- Scroll → temps du récit → vidéo et textes ----------
  let target = 0, current = 0, pendingSeek = null, last = 0;
  // Position et hauteur du hero mesurées au redimensionnement seulement : le scroll ne lit que scrollY,
  // sans forcer le navigateur à recalculer la mise en page à chaque événement.
  let heroTop = 0, run = 1;
  const measure = () => {
    // Course du hero = tant que la scène (100lvh) reste collée en haut : le récit atteint sa fin exactement quand
    // elle se libère, téléphone compris (la zone visible y est plus petite que la scène quand les barres sont là).
    heroTop = hero.offsetTop; run = Math.max(1, hero.offsetHeight - stage.offsetHeight); readScroll();
    measureFin(); buildFil();
  };
  document.fonts.ready.then(measure);                    // le titre se mesure avec sa vraie police
  new ResizeObserver(() => buildFil()).observe(suite);   // hauteur des sections changée (polices, photos) : trajet recalculé
  const readScroll = () => { target = clamp((scrollY - heroTop) / run) * STORY_END; };
  addEventListener("scroll", readScroll, { passive: true });
  // Les barres du navigateur mobile déclenchent « resize » en se repliant : on ne recalcule toute la géométrie que si
  // la largeur ou la hauteur de la scène changent vraiment (rotation, fenêtre redimensionnée).
  let tailleW = innerWidth, tailleH = 0;
  addEventListener("resize", () => {
    if (innerWidth !== tailleW || stage.offsetHeight !== tailleH) { tailleW = innerWidth; tailleH = stage.offsetHeight; measure(); }
    else readScroll();
  });
  heroVideo.addEventListener("seeked", () => {
    if (pendingSeek !== null) { const t = pendingSeek; pendingSeek = null; heroVideo.currentTime = t; }
  });

  function frame(now) {
    // Lissage : 20 % de l'écart par image à 60 Hz, ramené à la durée réelle de l'image
    // (même rendu sur un écran à 120 Hz, et pas de retard qui s'accumule si une image saute).
    const dt = last ? Math.min(now - last, 100) : 16.7;
    last = now;
    const k = 1 - Math.pow(0.8, dt / 16.7);
    current += (target - current) * k;
    sy += (scrollY - sy) * k;                             // même lissage pour la boule des sections
    if (Math.abs(target - current) < 0.002) current = target;
    const vt = Math.min(current, VIDEO_END - 0.5 / FPS);
    if (!heroVideo.paused) heroVideo.pause();       // la vidéo ne joue jamais seule : seul le scroll la fait avancer
    if (heroVideo.readyState >= 1 && Math.abs(heroVideo.currentTime - vt) > 0.5 / FPS) {
      if (heroVideo.seeking) pendingSeek = vt; else heroVideo.currentTime = vt;
    }
    render(current);
    drawFil();
    requestAnimationFrame(frame);
  }
  measure();
  render(0);
  requestAnimationFrame(frame);

  // « Découvrir › » : descend en douceur jusqu'au premier chapitre du hero.
  $("#decouvrir").addEventListener("click", (e) => {
    e.preventDefault();
    scrollTo({ top: heroTop + (1.6 / STORY_END) * run, behavior: "smooth" });
  });

  // ?t=33.5 ouvre la page directement à ce moment du récit ; ?t=dessin, usages, formats, boite, questions ou fin :
  // la boule posée sur la première station de cette section (vérifications, captures).
  const goto = params.get("t");
  if (goto) document.fonts.ready.then(() => requestAnimationFrame(() => {
    measure();
    const [nom, ecrans = 0] = goto.split("+");          // « usages+1.5 » : 1,5 écran plus bas que la section
    const st = isNaN(+nom) && document.querySelector(`#${CSS.escape(nom)} [data-station]`);
    if (st) { const p = st.getBoundingClientRect(); scrollTo(0, scrollY + p.top + p.height / 2 - sceneH * suivi + 4 + (+ecrans) * sceneH); }
    else scrollTo(0, heroTop + clamp(+goto / STORY_END) * run);
    readScroll(); current = target; sy = scrollY;
    // ?debug : positions à l'écran des éléments de la fin, écrites dans la page (lisibles sans capture).
    if (params.has("debug")) setTimeout(() => {
      const box = (el) => { const r = el.getBoundingClientRect(); return [r.left, r.top, r.width, r.height].map(Math.round); };
      body.dataset.geo = JSON.stringify({ vue: [innerWidth, innerHeight], largeur: document.documentElement.scrollWidth, titre: lignes.map(box), boule: box(boule),
        bouleOp: boule.style.opacity, plaque: box(plaque), tete: box(tete), allumees: lit.filter(Boolean).length, h: eteint.style.getPropertyValue("--h") });
    }, 1500);
  }));
})();
