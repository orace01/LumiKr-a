// Lumikréa — prototype : intro en écran de chargement, hero vidéo piloté par le scroll, textes de chapitres.
// Toutes les animations dépendent du « temps du récit » t (0 à 30,5 s), calculé depuis la position du scroll.
(() => {
  "use strict";

  const FPS = 24;
  const VIDEO_END = 609 / FPS;          // durée du hero (25,375 s)
  const STORY_END = 30.5;               // la fin (pièce éteinte, phrase, bouton) se joue sur la dernière image
  const INTRO = {                       // repères de l'intro, en secondes de la vidéo
    "9x16": { src: "media/intro-9x16.mp4", written: 3.0, loopStart: 3.5, loopEnd: 5.1667 },
    "16x9": { src: "media/intro-16x9.mp4", written: 3.0, loopStart: 3.5, loopEnd: 5.1667 },
  };
  const AV1 = 'video/mp4; codecs="av01.0.08M.08"';

  const $ = (s) => document.querySelector(s);
  const body = document.body;
  const intro = $("#intro"), introVideo = $("#introVideo"), loader = $("#loader"), loaderFill = $("#loaderFill"), loaderPct = $("#loaderPct");
  const hero = $("#hero"), heroVideo = $("#heroVideo"), eteint = $("#eteint"), rail = $("#rail"), railFill = $("#railFill"), railNums = $("#railNums"), finale = $("#finale");

  const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
  const ease = (x) => { x = clamp(x); return x * x * (3 - 2 * x); };
  const span = (t, a, b) => ease((t - a) / (b - a));

  const params = new URLSearchParams(location.search);
  // Chaque arrivée rejoue l'intro : on repart du haut de la page, et une page restaurée par « retour » est rechargée.
  if ("scrollRestoration" in history) history.scrollRestoration = "manual";
  window.scrollTo(0, 0);
  addEventListener("pageshow", (e) => { if (e.persisted) location.reload(); });
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const portraitQuery = matchMedia("(orientation: portrait)");
  const fmt = portraitQuery.matches ? "9x16" : "16x9";
  // Changement d'orientation : on recharge sans rejouer l'intro, avec l'autre format.
  portraitQuery.addEventListener("change", () => location.replace(`${location.pathname}?sans-intro`));

  document.documentElement.style.setProperty("--hero-h", fmt === "9x16" ? "1000svh" : "900vh");
  heroVideo.poster = `media/hero-${fmt}.webp`;

  // ---------- Chapitres : préparation ----------
  const chapters = [...document.querySelectorAll(".chapter")].map((el) => {
    const d = el.dataset;
    const sub = el.querySelector(".sub");
    const words = sub.textContent.trim().split(/\s+/);
    sub.textContent = "";
    const spans = words.map((w, i) => {
      const s = document.createElement("span");
      s.className = "w"; s.textContent = w;
      sub.append(s, i < words.length - 1 ? " " : "");
      return s;
    });
    return { el, spans, tIn: +d.in, tScript: +d.script, tSubShow: d.subshow ? +d.subshow : +d.in + 0.3, tSub: +d.sub, tSubEnd: +d.subend, tOut: +d.out, cache: {} };
  });
  chapters.forEach((c, i) => {
    const li = document.createElement("li");
    li.textContent = String(i + 1).padStart(2, "0");
    li.style.setProperty("--at", (c.tIn / VIDEO_END).toFixed(4));
    railNums.append(li);
    c.num = li;
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
      const step = (c.tSubEnd - c.tSub) / c.spans.length;
      c.spans.forEach((s, i) => {
        const lit = clamp((t - (c.tSub + i * step)) / 0.18);
        const w = Math.round(show * (0.26 + 0.74 * lit) * 100) / 100;
        if (s._w !== w) { s._w = w; s.style.setProperty("--w", w); }
      });
    }
    const fc = finale._c || (finale._c = {});
    setVar(finale, fc, "--a", span(t, 28.0, 28.6));
    setVar(finale, fc, "--s", span(t, 28.3, 29.0));
    setVar(finale, fc, "--fs", span(t, 28.6, 29.1));
    setVar(finale, fc, "--fc", span(t, 29.0, 29.4));
    setVar(finale, fc, "--t", span(t, 29.3, 29.9));

    const ec = eteint._c || (eteint._c = {});
    setVar(eteint, ec, "--d", span(t, VIDEO_END + 0.05, VIDEO_END + 1.7));

    const rc = rail._c || (rail._c = {});
    setVar(rail, rc, "--ra", span(t, 0.2, 0.8) * (1 - span(t, 25.6, 26.4)));
    setVar(railFill, rc, "--p", clamp(t / VIDEO_END));
    chapters.forEach((c, i) => {
      const on = t >= c.tIn && (i === chapters.length - 1 || t < chapters[i + 1].tIn);
      c.num.classList.toggle("is-on", on);
    });
  }

  // ---------- Mouvement réduit : pas de vidéo pilotée ----------
  if (reduced) {
    body.classList.remove("is-intro");
    body.classList.add("reduced");
    intro.remove();
    heroVideo.poster = `media/hero-${fmt}-fin.webp`;
    return;
  }

  // ---------- Hero : choix du fichier et téléchargement avec progression ----------
  async function pickHeroSource() {
    const h264 = `media/hero-${fmt}.h264.mp4`;
    if (!heroVideo.canPlayType(AV1)) return h264;
    try {
      const [w, h] = fmt === "9x16" ? [1080, 1920] : [1920, 1080];
      const info = await navigator.mediaCapabilities.decodingInfo({ type: "file", video: { contentType: AV1, width: w, height: h, bitrate: 1200000, framerate: FPS } });
      // AV1 seulement si le décodage est matériel : sinon le scrub saccade sur téléphone.
      if (info.supported && info.powerEfficient) return `media/hero-${fmt}.av1.mp4`;
    } catch { /* navigateur sans mediaCapabilities */ }
    return h264;
  }

  // Télécharge le fichier pour mesurer la progression et remplir le cache HTTP.
  // La vidéo lit ensuite l'adresse directe : WebKit (iPhone) lit mal une vidéo passée en URL blob.
  async function download(url, onProgress) {
    const res = await fetch(url);
    if (!res.ok || !res.body) throw new Error(`Téléchargement impossible (${res.status})`);
    const total = Number(res.headers.get("content-length")) || 0;
    const reader = res.body.getReader();
    let got = 0;
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      got += value.length;
      if (total) onProgress(got / total);
    }
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

  // La barre affiche le vrai téléchargement, mais met toujours au moins MIN_FILL secondes à se remplir :
  // même si la vidéo est déjà en cache, l'arrivée montre le logo, la barre et la boucle.
  const MIN_FILL = 1.6;
  let realProgress = 0, shownProgress = 0;
  const setProgress = (p) => { realProgress = Math.max(realProgress, p); };
  function drawProgress(now) {
    if (!loaderShownAt) return;
    const p = Math.min(realProgress, (now - loaderShownAt) / (MIN_FILL * 1000));
    if (p > shownProgress) {
      shownProgress = p;
      loaderFill.style.setProperty("--p", p.toFixed(3));
      loaderPct.textContent = `${Math.round(p * 100)} %`;
    }
  }

  let heroSrc = "";
  const heroReady = (async () => {
    heroSrc = await pickHeroSource();
    try {
      await download(heroSrc, (p) => setProgress(p * 0.95));
    } catch { /* la vidéo se chargera directement */ }
    await document.fonts.ready;
    let ok = await loadHero(heroSrc);
    if (!ok && heroSrc.includes(".av1.")) {        // AV1 refusé par l'appareil : repli H.264
      heroSrc = `media/hero-${fmt}.h264.mp4`;
      ok = await loadHero(heroSrc);
    }
    setProgress(1);
  })();

  // ?debug : état de la vidéo affiché à l'écran (pour diagnostiquer sur téléphone).
  if (params.has("debug")) {
    const box = document.createElement("pre");
    box.style.cssText = "position:fixed;z-index:99;left:8px;bottom:8px;max-width:92vw;margin:0;padding:8px;font:11px/1.35 ui-monospace,monospace;color:#fff;background:rgba(0,0,0,.75);white-space:pre-wrap;pointer-events:none";
    document.body.append(box);
    const states = ["VIDE", "META", "IMAGE", "SUITE", "ASSEZ"];
    setInterval(() => {
      const v = heroVideo, b = v.buffered.length ? v.buffered.end(v.buffered.length - 1).toFixed(1) : "0";
      box.textContent = [
        `format ${fmt} · source ${heroSrc || "(choix en cours)"}`,
        `readyState ${v.readyState} ${states[v.readyState] || ""} · network ${v.networkState} · erreur ${v.error ? v.error.code + " " + (v.error.message || "") : "aucune"}`,
        `paused ${v.paused} · temps ${v.currentTime.toFixed(2)} · tampon ${b} s · taille ${v.videoWidth}×${v.videoHeight}`,
        `AV1 ${v.canPlayType(AV1) || "non"} · H.264 ${v.canPlayType('video/mp4; codecs="avc1.64001F"') || "non"}`,
        navigator.userAgent.slice(0, 120),
      ].join("\n");
    }, 500);
  }

  // ---------- Intro : écriture, boucle d'attente, fermeture ----------
  const cfg = INTRO[fmt];
  let loaded = false, loaderShownAt = 0, closing = false;
  heroReady.then(() => { loaded = true; });

  function revealSite() {
    intro.classList.add("is-revealing");
    body.classList.remove("is-intro");
    body.classList.add("is-revealing-site");
    window.scrollTo(0, 0);
    setTimeout(() => { intro.remove(); body.classList.remove("is-revealing-site"); }, 1300);
  }

  if (params.has("sans-intro")) {
    intro.remove();
    body.classList.remove("is-intro");
  } else {
    introVideo.src = cfg.src;
    introVideo.addEventListener("ended", revealSite, { once: true });
    const tick = (now, meta) => {
      const time = meta ? meta.mediaTime : introVideo.currentTime;
      if (!loaderShownAt && time >= cfg.written) { loaderShownAt = performance.now(); loader.classList.add("is-on"); }
      drawProgress(performance.now());
      if (!closing && loaded && shownProgress >= 1) {
        closing = true;                              // à 100 % : on laisse la vidéo continuer vers la fermeture
        loader.classList.add("is-off");
      }
      if (!closing && time >= cfg.loopEnd - 0.5 / FPS) introVideo.currentTime = cfg.loopStart;   // boucle d'attente
      if (!introVideo.ended) schedule();
    };
    const schedule = () => ("requestVideoFrameCallback" in introVideo)
      ? introVideo.requestVideoFrameCallback(tick)
      : requestAnimationFrame((n) => tick(n));
    introVideo.play().then(schedule).catch(() => {
      // Lecture automatique refusée : logo fixe, puis site dès que le hero est prêt.
      loader.classList.add("is-on");
      heroReady.then(revealSite);
    });
  }

  // ---------- Scroll → temps du récit → vidéo et textes ----------
  let target = 0, current = 0, pendingSeek = null;
  const readScroll = () => {
    const r = hero.getBoundingClientRect();
    const run = hero.offsetHeight - innerHeight;
    target = clamp(-r.top / run) * STORY_END;
  };
  addEventListener("scroll", readScroll, { passive: true });
  addEventListener("resize", readScroll);
  heroVideo.addEventListener("seeked", () => {
    if (pendingSeek !== null) { const t = pendingSeek; pendingSeek = null; heroVideo.currentTime = t; }
  });

  function frame() {
    current += (target - current) * 0.2;
    if (Math.abs(target - current) < 0.002) current = target;
    const vt = Math.min(current, VIDEO_END - 0.5 / FPS);
    if (!heroVideo.paused) heroVideo.pause();       // la vidéo ne joue jamais seule : seul le scroll la fait avancer
    if (heroVideo.readyState >= 1 && Math.abs(heroVideo.currentTime - vt) > 0.5 / FPS) {
      if (heroVideo.seeking) pendingSeek = vt; else heroVideo.currentTime = vt;
    }
    render(current);
    requestAnimationFrame(frame);
  }
  readScroll();
  render(0);
  requestAnimationFrame(frame);
})();
