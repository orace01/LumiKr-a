// Lien entre l'accueil et la boutique : prix, livraison et état de la vente lus
// sur le serveur (/api/shop, qui fait foi), puis « Commander » met le format
// choisi dans le panier de l'application (même clé que src/shop/CartProvider.tsx)
// et ouvre la page de commande.
(() => {
  const PANIER = "lumikrea:panier:v1";
  const bouton = document.getElementById("commander");
  const note = document.getElementById("formatsNote");
  const entrees = [...document.querySelectorAll(".formats-liste input")];
  let ouverte = false;

  const formatChoisi = () => (entrees.find((entree) => entree.checked) ?? entrees[0])?.value;

  function bloquer(texte) {
    ouverte = false;
    bouton.setAttribute("aria-disabled", "true");
    bouton.querySelector("span").textContent = texte;
  }

  async function charger() {
    let info;
    try {
      const reponse = await fetch("/api/shop", { cache: "no-store" });
      if (!reponse.ok) throw new Error(`HTTP ${reponse.status}`);
      info = await reponse.json();
    } catch {
      bloquer("Boutique momentanément indisponible");
      return;
    }

    const argent = new Intl.NumberFormat(info.locale || "fr-FR", { style: "currency", currency: info.currency || "EUR" });
    for (const entree of entrees) {
      const variante = info.variants.find((v) => v.id === entree.value);
      const prix = variante && variante.priceCents !== null ? argent.format(variante.priceCents / 100) : "Prix à venir";
      entree.dataset.prix = prix;
      const etiquette = entree.parentElement.querySelector(".f-prix");
      if (etiquette) etiquette.textContent = prix;
    }

    const livraison = info.shippingMethods[0];
    if (note && livraison) {
      const frais = livraison.priceCents === 0 ? "livraison offerte" : livraison.priceCents === null ? "livraison calculée à la commande" : `livraison ${argent.format(livraison.priceCents / 100)}`;
      const pays = info.countries.length === 1 && info.countries[0].code === "FR" ? "France métropolitaine" : info.countries.map((c) => c.name).join(", ");
      note.textContent = `Prix TTC · ${frais} en ${pays}${livraison.delay ? `, en ${livraison.delay}` : ""}.`;
    }

    if (info.saleOpen) ouverte = true;
    else bloquer("La vente en ligne ouvre bientôt");
  }

  bouton.addEventListener("click", (evenement) => {
    evenement.preventDefault();
    if (!ouverte) return;
    const format = formatChoisi();
    let lignes = [];
    try {
      lignes = JSON.parse(localStorage.getItem(PANIER) || "[]");
      if (!Array.isArray(lignes)) lignes = [];
    } catch {
      lignes = [];
    }
    // Un format déjà au panier garde sa quantité : un second clic ne le double pas.
    if (format && !lignes.some((ligne) => ligne.variantId === format)) lignes.push({ variantId: format, quantity: 1 });
    try {
      localStorage.setItem(PANIER, JSON.stringify(lignes));
    } catch {
      // Stockage refusé (navigation privée) : la page de commande proposera de choisir un format.
    }
    location.href = "/commande";
  });

  // En-tête : nombre d'articles du panier, comme sur les autres pages (src/components/Header.tsx).
  function majPanier() {
    let total = 0;
    try {
      const lignes = JSON.parse(localStorage.getItem(PANIER) || "[]");
      if (Array.isArray(lignes)) total = lignes.reduce((n, ligne) => n + (Number(ligne.quantity) || 0), 0);
    } catch {
      // Stockage illisible : panier affiché vide.
    }
    const nombre = document.getElementById("panierNombre");
    nombre.hidden = total === 0;
    nombre.textContent = String(total);
    document.getElementById("panier").setAttribute("aria-label", total === 0 ? "Panier, vide" : `Panier, ${total} article${total > 1 ? "s" : ""}`);
  }
  majPanier();
  addEventListener("pageshow", majPanier);   // retour depuis la commande : le panier a pu changer
  addEventListener("storage", (evenement) => { if (evenement.key === PANIER) majPanier(); });

  document.getElementById("annee").textContent = String(new Date().getFullYear());

  charger();
})();
