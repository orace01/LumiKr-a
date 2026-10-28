// Lumikréa — défilement fluide (Lenis, vendor/lenis.min.js). Lenis fait défiler la vraie fenêtre : app.js et
// sections.js continuent de lire scrollY, les scènes collées et la boule fonctionnent comme avant. Molette et pavé
// tactile seulement (le doigt garde le défilement natif du téléphone) ; rien quand le mouvement est réduit.
(() => {
  "use strict";
  if (!window.Lenis || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const entete = document.querySelector(".header");
  const lenis = new Lenis({
    autoRaf: true,
    allowNestedScroll: true,                              // panier et panneaux défilent eux-mêmes
    anchors: { offset: -((entete && entete.offsetHeight) || 0) },   // liens « #formats »… : sous l'en-tête fixe
  });
  window.lenis = lenis;
  // Un panneau ouvert (panier) bloque la page : Lenis s'arrête aussi, sinon la molette ferait défiler dessous.
  const suivre = () => (document.querySelector("dialog[open]") ? lenis.stop() : lenis.start());
  new MutationObserver(suivre).observe(document.body, { subtree: true, childList: true, attributes: true, attributeFilter: ["open"] });
})();
