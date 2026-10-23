// Lumikréa — sections après la tablette : titres écrits au feutre et textes éclairés mot à mot au fil du scroll,
// choix du format sur l'échelle A4, questions dont la réponse s'écrit en néon sur une petite plaque.
// (L'allumage des photos et des sections par la boule est fait par app.js, classe .is-allumee.)
(() => {
  "use strict";

  const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;

  // ---------- Titres et paragraphes : progression selon la position à l'écran ----------
  // Un titre [data-ecrit] voit son mot au feutre s'écrire (--s) en entrant dans l'écran ; un paragraphe [data-mots]
  // s'éclaire mot à mot (--w de 26 % à 100 %), comme les sous-titres du hero.
  const ecrits = [...document.querySelectorAll("[data-ecrit]")];
  // Découpe un paragraphe en mots (.w) qui s'éclairent un par un.
  const decouper = (p) => {
    const mots = p.textContent.trim().split(/\s+/);
    p.textContent = "";
    return mots.map((m, i) => {
      const s = document.createElement("span");
      s.className = "w"; s.textContent = m;
      p.append(s, i < mots.length - 1 ? " " : "");
      return s;
    });
  };
  const paragraphes = [...document.querySelectorAll("[data-mots]")].map((p) => ({ p, spans: decouper(p) }));
  const setv = (el, nom, v) => { v = Math.round(v * 1000) / 1000; if (el["_" + nom] !== v) { el["_" + nom] = v; el.style.setProperty(nom, v); } };
  const lisse = (x) => { x = clamp(x); return x * x * (3 - 2 * x); };
  const plage = (u, a, b) => lisse((u - a) / (b - a));

  // ---------- Usages : une seule tablette, quatre usages ----------
  // La section est longue et sa scène reste collée à l'écran ; sa progression q (0 → 1) se découpe en quatre.
  // Dans chaque quart : la photo s'allume depuis le centre, le verbe s'écrit, le texte s'éclaire mot à mot, puis la
  // pièce s'éteint avant l'usage suivant (le dernier reste allumé). Le titre s'écrit quand la section arrive.
  const usages = document.getElementById("usages"), uScene = usages.querySelector(".u-scene");
  const uCadre = usages.querySelector(".u-cadre"), uTitre = usages.querySelector(".u-titre");
  const uPhotos = [...usages.querySelectorAll(".u-photo")];
  const uTextes = [...usages.querySelectorAll(".u-texte")].map((el) => ({ el, mots: decouper(el.querySelector(".sub")) }));
  let uTop = 0, uCourse = 1, uVue = -1;
  function rendreUsages() {
    setv(uTitre, "--s", clamp((scrollY - (uTop - vh * 0.75)) / (vh * 0.55)));
    const n = uPhotos.length, q = clamp((scrollY - uTop) / uCourse);
    const i = Math.min(n - 1, Math.floor(q * n)), u = q * n - i, dernier = i === n - 1;
    if (i !== uVue) { uVue = i; uPhotos.forEach((p, j) => p.classList.toggle("is-vue", j === i)); }
    const lum = u < 0.16 ? lisse(u / 0.16) : (!dernier && u > 0.84 ? 1 - lisse((u - 0.84) / 0.16) : 1);
    setv(uCadre, "--lum", lum);
    setv(uCadre, "--noir", (1 - lum) * 0.9);
    setv(uCadre, "--eclat", u < 0.5 ? 4 * lum * (1 - lum) : 0);   // l'éclat ne part du centre qu'en s'allumant
    uTextes.forEach(({ el, mots }, j) => {
      setv(el, "--a", j === i ? plage(u, 0.06, 0.18) * (dernier ? 1 : 1 - plage(u, 0.8, 0.9)) : 0);
      if (j !== i) return;
      setv(el, "--s", plage(u, 0.1, 0.32));
      const k = clamp((u - 0.2) / 0.45) * (mots.length + 3);
      mots.forEach((s, m) => setv(s, "--w", 0.26 + 0.74 * clamp(k - m)));
    });
  }
  // Lignes de « Dans la boîte » : soulignées l'une après l'autre.
  document.querySelectorAll(".lignes div").forEach((d, i) => d.style.setProperty("--i", i));

  // Positions dans la page mesurées une fois (et quand la mise en page change), jamais à chaque image : lire une
  // position juste après les écritures de styles du hero forcerait le navigateur à recalculer toute la page.
  let vh = innerHeight;
  const mesurer = () => {
    vh = innerHeight;
    for (const el of ecrits) el._top = el.getBoundingClientRect().top + scrollY;
    for (const q of paragraphes) q.p._top = q.p.getBoundingClientRect().top + scrollY;
    uTop = usages.getBoundingClientRect().top + scrollY;
    uCourse = Math.max(1, usages.offsetHeight - uScene.offsetHeight);
    sale = true;
  };
  // Progression d'un élément : 0 quand son haut est à 92 % de la hauteur de l'écran, 1 quand il est à 52 %.
  const progres = (el) => clamp((vh * 0.92 - (el._top - scrollY)) / (vh * 0.4));
  let sale = true;
  function rendre() {
    if (sale) {
      sale = false;
      for (const el of ecrits) {
        const s = Math.round(progres(el) * 1000) / 1000;
        if (el._s !== s) { el._s = s; el.style.setProperty("--s", s); }
      }
      for (const { p, spans } of paragraphes) {
        const pr = progres(p);
        if (p._pr === pr) continue;                        // hors de l'écran : rien ne change
        p._pr = pr;
        const k = pr * (spans.length + 3);                 // les mots s'allument un par un sur la course
        spans.forEach((s, i) => {
          const w = Math.round((0.26 + 0.74 * clamp(k - i)) * 100) / 100;
          if (s._w !== w) { s._w = w; s.style.setProperty("--w", w); }
        });
      }
      rendreUsages();
    }
    requestAnimationFrame(rendre);
  }
  if (reduced) {
    ecrits.forEach((el) => el.style.setProperty("--s", 1));
    paragraphes.forEach(({ spans }) => spans.forEach((s) => s.style.setProperty("--w", 1)));
  } else {
    addEventListener("scroll", () => { sale = true; }, { passive: true });
    let largeur = innerWidth;
    addEventListener("resize", () => { if (innerWidth !== largeur) { largeur = innerWidth; mesurer(); } else sale = true; });
    new ResizeObserver(mesurer).observe(document.getElementById("suite"));   // polices, photos chargées
    document.fonts.ready.then(mesurer);
    mesurer();
    requestAnimationFrame(rendre);
  }

  // ---------- Formats : le format choisi s'allume sur l'échelle ----------
  const choisi = document.getElementById("formatChoisi");
  const plaques = [...document.querySelectorAll(".plaque-f")];
  const choisir = (input) => {
    plaques.forEach((r) => r.classList.toggle("is-choisi", r.dataset.f === input.value));
    choisi.textContent = input.parentElement.querySelector(".f-taille").textContent;
  };
  document.querySelectorAll('.formats-liste input').forEach((input) => {
    input.addEventListener("change", () => choisir(input));
    if (input.checked) choisir(input);
  });

  // ---------- Questions ----------
  const QUESTIONS = [
    ["Qu'est-ce que c'est, exactement ?", "Une plaque en acrylique transparent posée sur une base lumineuse LED. On dessine ou on écrit dessus au feutre, et la lumière fait ressortir les traits."],
    ["À quoi peut-il servir ?", "À décorer pour les fêtes (Halloween, Noël, Nouvel An…), à laisser un mot doux ou une citation, à afficher le menu ou l'offre du jour dans un commerce, à faire veilleuse le soir, ou à dessiner avec les enfants. Son support sert aussi de porte-tablette ou de porte-téléphone."],
    ["Peut-on effacer et recommencer ?", "Oui : la surface s'efface à sec, puis on redessine. La plaque se réutilise autant qu'on veut."],
    ["Comment le tableau est-il alimenté ?", "En USB : la base se branche directement sur un port USB. L'adaptateur secteur n'est pas fourni."],
    ["Quels formats sont proposés ?", "4 formats : 12 × 12 cm, 15 × 15 cm, 20 × 20 cm et 30 × 20 cm."],
    ["Quels sont les délais de livraison et les conditions de retour ?", "Livraison offerte en France métropolitaine, en 10 jours ouvrés. Vous avez 14 jours après réception pour changer d'avis, et le tableau bénéficie des garanties légales."],
  ];
  // Une couleur de feutre du produit par question (le blanc est la couleur du texte, il est écarté).
  const FEUTRES = ["#ffe14a", "#4ee35f", "#4f8dff", "#b06bff", "#ff6fb1", "#ff8f33"];
  const liste = document.getElementById("qListe"), reponse = document.getElementById("qReponse");
  const tablette = reponse.closest(".q-tablette");
  const tidy = (q) => q.replace(/ \?$/, " ?");     // le point d'interrogation ne part jamais seul à la ligne

  const onglets = QUESTIONS.map(([q], i) => {
    const b = document.createElement("button");
    b.type = "button"; b.className = "q-onglet"; b.id = `q-onglet-${i}`;
    b.setAttribute("role", "tab"); b.setAttribute("aria-controls", "qReponse");
    b.style.setProperty("--pen", FEUTRES[i % FEUTRES.length]);
    b.textContent = tidy(q);
    b.addEventListener("click", () => montrer(i));
    liste.append(b);
    return b;
  });

  // La réponse s'écrit mot à mot (--k = rang du mot), dans la couleur de la question.
  function montrer(i) {
    onglets.forEach((b, j) => { b.setAttribute("aria-selected", String(i === j)); b.tabIndex = i === j ? 0 : -1; });
    reponse.setAttribute("aria-labelledby", onglets[i].id);
    tablette.style.setProperty("--pen", FEUTRES[i % FEUTRES.length]);
    reponse.textContent = "";
    QUESTIONS[i][1].split(" ").forEach((m, k) => {
      const s = document.createElement("span");
      s.className = "mot"; s.style.setProperty("--k", k); s.textContent = m;
      reponse.append(s, " ");
    });
  }

  // Clavier : flèches, Début, Fin (liste d'onglets verticale).
  liste.addEventListener("keydown", (e) => {
    const i = onglets.indexOf(document.activeElement);
    if (i < 0) return;
    const pas = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 }[e.key];
    let j = null;
    if (pas) j = (i + pas + onglets.length) % onglets.length;
    else if (e.key === "Home") j = 0;
    else if (e.key === "End") j = onglets.length - 1;
    if (j === null) return;
    e.preventDefault();
    montrer(j);
    onglets[j].focus();
  });

  montrer(0);
})();
