---
document: "TRD — exigences techniques"
statut: brouillon        # brouillon | finalisé — seul l'utilisateur valide le passage à « finalisé » (R-001)
version: 0.1
date: 2026-10-22
valide_par: ""
---

# 02 — TRD : exigences techniques

## Existant (inchangé)
- Front actuel : Vite, React 19, TypeScript, CSS natif (`src/`), polices auto-hébergées.
- Serveur : Hono sur Node.js 20+, déployé sur Vercel ; commandes stockées dans Redis ; paiement Mepaye (page hébergée) ; envoi des commandes à CJdropshipping ; e-mails clients (nodemailer). Détails : `README.md`.
- Secrets : variables d'environnement uniquement (`.env.example`), jamais dans le code (SEC-1).

## Prototype `frontend2/` (cette version)
- **Nature** : page statique HTML + CSS + JavaScript sans dépendance de build, pour valider le hero immersif avant de l'intégrer au front React.
- **Hero** : un `<video>` muet et fixe à l'écran, dont `currentTime` suit la progression du scroll (interpolation lissée à chaque image d'affichage). Deux sources selon l'orientation de l'écran :
  - portrait : 9:16, 720×1280 ou 1080×1920 ;
  - paysage : 16:9, 1920×1080.
- **Encodage** (tests du 2026-10-21) : AV1 en priorité, H.264 en secours, 24 i/s, sans son, `faststart`, images clés rapprochées (GOP 12 en AV1, 6 en H.264) pour que le scroll soit fluide dans les deux sens. Poids visé : 2 à 3,5 Mo par format en AV1.
- **Textes** : HTML réel (lisible, traduisible, indexable), polices Onest et Sacramento (Google Fonts, licence OFL) ; animations pilotées par la progression du scroll, pas par des minuteries.
- **Image d'attente** : WebP de la première image de chaque format, affichée immédiatement.
- **Mouvement réduit** : avec `prefers-reduced-motion: reduce`, pas de vidéo pilotée ; images clés fixes et textes visibles.

## Contraintes de performance
- Aucune image ni vidéo de plus de 4 Mo ; le hero ne bloque pas l'affichage du texte.
- Fluide sur un téléphone milieu de gamme : pas de calcul lourd dans l'écouteur de scroll (lecture de la position, puis travail dans `requestAnimationFrame`).
- Chargement : vidéo en `preload="auto"` seulement pour le format affiché.

## Compatibilité
- Navigateurs : Chrome, Safari iOS 16+, Firefox, Edge récents.
- Safari sans décodage AV1 : la source H.264 est prise automatiquement (`<source type>`).

## Sécurité
- Page statique sans formulaire ni secret. L'intégration au tunnel d'achat se fera dans le front React existant, qui garde ses contrôles côté serveur (SEC-4, SEC-5).

## Questions ouvertes
> Doit être **vide** (ou chaque question tranchée) pour finaliser.
- Intégration finale : porter le hero dans le front React existant (`src/components/Hero.tsx`) ou garder une page d'accueil statique servie par Hono ?
- Mesure réelle sur un iPhone ancien (décodage H.264 au scroll) à faire.

## Historique
| Version | Date | Changement | Validé par |
|---|---|---|---|
| 0.1 | 2026-10-22 | Création | — |
