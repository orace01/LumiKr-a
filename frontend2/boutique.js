// Lien entre l'accueil et la boutique : prix, livraison et état de la vente lus
// sur le serveur (/api/shop, qui fait foi) ; panier partagé avec l'application
// (même clé que src/shop/CartProvider.tsx).
(() => {
  const PANIER = "lumikrea:panier:v1";
  const note = document.getElementById("formatsNote");
  let infoBoutique = null;
  let argent = new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" });

  async function charger() {
    let info;
    try {
      const reponse = await fetch("/api/shop", { cache: "no-store" });
      if (!reponse.ok) throw new Error(`HTTP ${reponse.status}`);
      info = await reponse.json();
    } catch {
      if (note) note.textContent = "Boutique momentanément indisponible : réessayez dans quelques instants.";
      return;
    }

    infoBoutique = info;
    argent = new Intl.NumberFormat(info.locale || "fr-FR", { style: "currency", currency: info.currency || "EUR" });
    remplirPanneau();
    // Légendes du collage « Votre format » : prix de chaque format.
    for (const etiquette of document.querySelectorAll("[data-prix-variante]")) {
      const variante = info.variants.find((v) => v.id === etiquette.dataset.prixVariante);
      etiquette.textContent = variante && variante.priceCents !== null ? argent.format(variante.priceCents / 100) : "Prix à venir";
    }

    const livraison = info.shippingMethods[0];
    if (note && livraison) {
      const frais = livraison.priceCents === 0 ? "livraison offerte" : livraison.priceCents === null ? "livraison calculée à la commande" : `livraison ${argent.format(livraison.priceCents / 100)}`;
      const pays = info.countries.length === 1 && info.countries[0].code === "FR" ? "France métropolitaine" : info.countries.map((c) => c.name).join(", ");
      note.textContent = `Prix TTC · ${frais} en ${pays}${livraison.delay ? `, en ${livraison.delay}` : ""}.`;
    }

    if (!info.saleOpen && note) note.textContent += " La vente en ligne ouvre bientôt.";
  }

  const MAX_QUANTITE = 10;   // src/config/shop.ts, maxQuantityPerLine
  const lireLignes = () => {
    try {
      const lignes = JSON.parse(localStorage.getItem(PANIER) || "[]");
      return Array.isArray(lignes) ? lignes.filter((ligne) => ligne && typeof ligne.variantId === "string" && Number(ligne.quantity) > 0) : [];
    } catch {
      return [];   // Stockage illisible : panier affiché vide.
    }
  };
  const ecrireLignes = (lignes) => {
    try {
      localStorage.setItem(PANIER, JSON.stringify(lignes));
    } catch {
      // Stockage refusé (navigation privée) : sans conséquence pour la visite en cours.
    }
    majPanier();
  };

  // En-tête, menu et barre panier : nombre d'articles, comme sur les autres pages (src/components/Header.tsx, CartBar.tsx).
  let totalAffiche = null;
  function majPanier() {
    const lignes = lireLignes();
    const total = lignes.reduce((n, ligne) => n + Number(ligne.quantity), 0);
    const libelle = total === 0 ? "Panier, vide" : `Panier, ${total} article${total > 1 ? "s" : ""}`;
    for (const id of ["panierNombre", "menuNombre"]) {
      const nombre = document.getElementById(id);
      nombre.hidden = total === 0;
      nombre.textContent = String(total);
    }
    document.getElementById("panier").setAttribute("aria-label", libelle);

    const barre = document.getElementById("barrePanier");
    const visible = total > 0;
    barre.classList.toggle("is-visible", visible);
    barre.setAttribute("aria-hidden", String(!visible));
    barre.inert = !visible;
    document.getElementById("barrePanierBouton").setAttribute("aria-label", libelle);
    const miniatures = document.getElementById("barreMiniatures");
    miniatures.replaceChildren(...lignes.slice(0, 3).map((ligne) => {
      const image = document.createElement("img");
      image.className = "cart-bar__thumb";
      image.src = `media/format-${ligne.variantId}.webp`;
      image.alt = "";
      return image;
    }));
    if (lignes.length > 3) {
      const plus = document.createElement("span");
      plus.className = "cart-bar__more";
      plus.textContent = `+${lignes.length - 3}`;
      miniatures.append(plus);
    }
    const nombre = document.getElementById("barreNombre");
    nombre.textContent = String(total);
    // La pastille rebondit quand le nombre change.
    if (totalAffiche !== null && totalAffiche !== total) {
      nombre.classList.remove("is-bumping");
      requestAnimationFrame(() => nombre.classList.add("is-bumping"));
    }
    totalAffiche = total;
    remplirPanneau();
  }

  // Panneau du panier (téléphone) : lignes, quantités, sous-total, livraison, « Commander ».
  const panneau = document.getElementById("panneauPanier");
  function remplirPanneau() {
    const lignes = lireLignes();
    const total = lignes.reduce((n, ligne) => n + Number(ligne.quantity), 0);
    document.getElementById("panierCompte").textContent = total > 0 ? `(${total})` : "";
    const liste = document.getElementById("panierLignes");
    if (lignes.length === 0) {
      const vide = document.createElement("li");
      vide.className = "panier__vide";
      vide.textContent = "Votre panier est vide.";
      liste.replaceChildren(vide);
    } else {
      liste.replaceChildren(...lignes.map((ligne) => {
        const variante = infoBoutique?.variants.find((v) => v.id === ligne.variantId);
        const prix = variante && variante.priceCents !== null ? argent.format((variante.priceCents * ligne.quantity) / 100) : "—";
        const element = document.createElement("li");
        element.className = "panier__ligne";
        element.innerHTML = `
          <img class="panier__miniature" alt="" src="media/format-${ligne.variantId}.webp">
          <div>
            <p class="panier__nom"></p>
            <div class="panier__actions">
              <div class="panier__quantite" role="group">
                <button type="button" data-action="moins" aria-label="Retirer un exemplaire">−</button>
                <output aria-live="polite"></output>
                <button type="button" data-action="plus" aria-label="Ajouter un exemplaire">+</button>
              </div>
              <button type="button" class="panier__retirer" data-action="retirer">Retirer</button>
            </div>
          </div>
          <p class="panier__prix"></p>`;
        element.dataset.variante = ligne.variantId;
        element.querySelector(".panier__nom").textContent = `Tableau lumineux ${variante?.label ?? ligne.variantId}`;
        element.querySelector("output").textContent = String(ligne.quantity);
        element.querySelector(".panier__prix").textContent = prix;
        element.querySelector('[data-action="moins"]').disabled = ligne.quantity <= 1;
        element.querySelector('[data-action="plus"]').disabled = ligne.quantity >= MAX_QUANTITE;
        return element;
      }));
    }
    const tousPrix = lignes.every((ligne) => infoBoutique?.variants.find((v) => v.id === ligne.variantId)?.priceCents != null);
    const sousTotal = lignes.reduce((n, ligne) => n + (infoBoutique?.variants.find((v) => v.id === ligne.variantId)?.priceCents ?? 0) * ligne.quantity, 0);
    document.getElementById("panierTotal").textContent = infoBoutique && tousPrix && lignes.length ? argent.format(sousTotal / 100) : "—";
    const livraison = infoBoutique?.shippingMethods.length === 1 ? infoBoutique.shippingMethods[0] : null;
    document.getElementById("panierNote").textContent = livraison && livraison.priceCents !== null
      ? `Livraison ${livraison.priceCents === 0 ? "offerte" : argent.format(livraison.priceCents / 100)}${livraison.delay ? ` · ${livraison.delay}` : ""}. Prix TTC.`
      : "Prix TTC.";
  }

  document.getElementById("panierLignes").addEventListener("click", (evenement) => {
    const action = evenement.target.closest("[data-action]")?.dataset.action;
    const id = evenement.target.closest(".panier__ligne")?.dataset.variante;
    if (!action || !id) return;
    const lignes = lireLignes()
      .map((ligne) => ligne.variantId !== id ? ligne
        : { ...ligne, quantity: Math.min(MAX_QUANTITE, Math.max(1, ligne.quantity + (action === "plus" ? 1 : action === "moins" ? -1 : 0))) })
      .filter((ligne) => !(action === "retirer" && ligne.variantId === id));
    ecrireLignes(lignes);
  });

  // Ouverture et fermeture animées ; on peut aussi tirer le panneau vers le bas pour le fermer.
  function ouvrirPanneau() {
    panneau.classList.remove("is-closing");
    remplirPanneau();
    panneau.showModal();
  }
  function fermerPanneau() {
    if (!panneau.open || panneau.classList.contains("is-closing")) return;
    const reduit = matchMedia("(prefers-reduced-motion: reduce)").matches;
    panneau.classList.add("is-closing");
    setTimeout(() => {
      panneau.close();
      panneau.classList.remove("is-closing");
      panneau.querySelector(".panier__panel").style.transform = "";
    }, reduit ? 0 : 280);
  }
  const barreBouton = document.getElementById("barrePanierBouton");
  barreBouton.addEventListener("click", () => { if (!panneau.open) ouvrirPanneau(); });
  // Tirer la barre vers le haut ouvre aussi le panneau (vidéo épicerie).
  let tire = null;
  barreBouton.addEventListener("pointerdown", (evenement) => { tire = evenement.clientY; });
  barreBouton.addEventListener("pointermove", (evenement) => {
    if (tire !== null && tire - evenement.clientY > 40) { tire = null; ouvrirPanneau(); }
  });
  barreBouton.addEventListener("pointerup", () => { tire = null; });
  barreBouton.addEventListener("pointercancel", () => { tire = null; });
  document.getElementById("panierFermer").addEventListener("click", fermerPanneau);
  panneau.addEventListener("cancel", (evenement) => { evenement.preventDefault(); fermerPanneau(); });
  panneau.addEventListener("click", (evenement) => { if (evenement.target === panneau) fermerPanneau(); });
  const poignee = panneau.querySelector(".panier__poignee");
  const plaquePanneau = panneau.querySelector(".panier__panel");
  let tirage = null;
  poignee.addEventListener("pointerdown", (evenement) => { tirage = { y: evenement.clientY, dy: 0 }; poignee.setPointerCapture(evenement.pointerId); });
  poignee.addEventListener("pointermove", (evenement) => {
    if (!tirage) return;
    tirage.dy = Math.max(0, evenement.clientY - tirage.y);
    plaquePanneau.style.transform = `translateY(${tirage.dy}px)`;
  });
  const lacher = () => {
    if (!tirage) return;
    const { dy } = tirage;
    tirage = null;
    if (dy > 90) fermerPanneau();
    else plaquePanneau.style.transform = "";
  };
  poignee.addEventListener("pointerup", lacher);
  poignee.addEventListener("pointercancel", lacher);
  // Lien « Panier » du menu du téléphone : il ouvre le panneau plutôt que la page de commande.
  document.querySelector('#menu-mobile a[href="/commande"]').addEventListener("click", (evenement) => {
    evenement.preventDefault();
    ouvrirPanneau();
  });

  majPanier();
  addEventListener("pageshow", majPanier);   // retour depuis la commande : le panier a pu changer
  addEventListener("storage", (evenement) => { if (evenement.key === PANIER) majPanier(); });

  // En-tête transparent dès que la page défile, sauf menu ouvert (même règle que src/components/Header.tsx).
  const entete = document.querySelector(".header");
  const menuBouton = document.getElementById("menuBouton");
  const menu = document.getElementById("menu-mobile");
  const majEntete = () => entete.classList.toggle("header--transparent", scrollY > 8 && menu.hidden);
  majEntete();
  addEventListener("scroll", majEntete, { passive: true });

  // Téléphone : le bouton menu ouvre et ferme le panneau ; un lien, Échap ou le passage en grand écran le ferment.
  function ouvrirMenu(ouvert) {
    menu.hidden = !ouvert;
    menuBouton.setAttribute("aria-expanded", String(ouvert));
    menuBouton.setAttribute("aria-label", ouvert ? "Fermer le menu" : "Ouvrir le menu");
    document.getElementById("menuIcone").setAttribute("d", ouvert ? "M6 6l12 12M18 6L6 18" : "M4 7h16M4 12h16M4 17h16");
    majEntete();
  }
  menuBouton.addEventListener("click", () => ouvrirMenu(menu.hidden));
  menu.addEventListener("click", (evenement) => { if (evenement.target.closest("a")) ouvrirMenu(false); });
  addEventListener("keydown", (evenement) => { if (evenement.key === "Escape" && !menu.hidden) ouvrirMenu(false); });
  matchMedia("(min-width: 900px)").addEventListener("change", () => ouvrirMenu(false));

  document.getElementById("annee").textContent = String(new Date().getFullYear());

  charger();
})();
