---
statut: validé
valide_par: utilisateur (« Le plan est validé, construis la boutique. », 2026-10-26)
date: 2026-10-26
branche: lumikrea-v2
inspiration: enregistrement d'écran du 2026-10-26 (application d'épicerie « Pasta & Noodles » : grille, fiche, barre panier noire)
---

# Plan : boutique en grille, fiches produit et barre panier (téléphone)

## Objectif

Mener le visiteur au paiement le plus vite possible : « Choisir mon format » ouvre une boutique en grille, chaque format a sa fiche avec « Ajouter au panier », et une barre panier en bas de l'écran du téléphone mène à la commande.

## Choix validés (2026-10-26)

| Question | Choix |
|---|---|
| Contenu de la grille | Les 4 formats du tableau (12 × 12, 15 × 15, 20 × 20, 30 × 20), une carte chacun ; grille prête pour d'autres produits |
| Fiche produit | Page dédiée, une adresse par format (`/boutique/20x20`) |
| Couleurs | Univers sombre Lumikréa (nuit, cartes plus claires, boutons jaunes), mise en page de l'inspiration |
| Barre panier | Sur téléphone, partout sur le site (accueil compris) ; le tiroir actuel reste sur ordinateur |

## Pages et composants

1. **Boutique `/boutique`** (application React)
   - En-tête de page : retour (vers l'accueil) et titre « Boutique ».
   - Grille de cartes : 2 colonnes sur téléphone, 3 ou 4 sur ordinateur. Carte : photo du format (`src/assets/media/format-*.webp`), prix, nom (« Tableau lumineux 20 × 20 cm »), forme (« Carré » / « Paysage »).
   - Prix et disponibilité lus sur `/api/shop`, comme ailleurs (le serveur fait foi).
2. **Fiche `/boutique/:format`**
   - Retour vers la grille ; grande photo, puis galerie à faire glisser (photo du format + photos fournisseur de `CJYD2333071/Marketing Picture/`, converties en webp).
   - Nom, forme et taille ; sélecteur de quantité (`QuantityStepper` existant) ; prix.
   - « À propos du produit » : description courte, contenu de la boîte et caractéristiques (`src/config/product.ts`).
   - Bouton « Ajouter au panier » jaune, collé en bas de l'écran sur téléphone. Après l'ajout : la barre panier se met à jour (pastille animée), on reste sur la fiche.
   - Format inconnu dans l'adresse : page « Produit introuvable » avec lien vers la boutique.
   - **Téléphone** — inspiration : maquette « Glow Rituals » (image du 2026-10-26), dans les couleurs Lumikréa :
     - Photo du format en plein haut de l'écran (environ 55 % de la hauteur), sur fond teinté de la couleur de la carte ; deux boutons ronds posés dessus : retour (vers la grille) à gauche, menu à droite (le hamburger de l'en-tête, qui laisse ici la place à la photo).
     - Panneau arrondi qui recouvre le bas de la photo, avec une poignée : nom (« Tableau lumineux 20 × 20 cm »), phrase courte, prix en jaune.
     - Formats en pastilles larges, deux par ligne, chacune avec sa taille et son prix ; celle du format affiché est teintée. Toucher une autre pastille change de fiche sans recharger.
     - Bas : quantité, puis « Ajouter au panier » en pilule jaune avec l'icône du sac. (Le cœur de la maquette n'est pas repris : pas de favoris.)
     - Sous le bouton : « À propos du produit » (description, dans la boîte, caractéristiques, en accordéons), puis **« Les autres formats »** : les 3 autres formats en cartes qu'on fait glisser horizontalement (photo, taille, prix), un toucher ouvre leur fiche.
   - **Animations** (toutes coupées si l'appareil demande « réduire les animations ») :
     - Grille → fiche : la photo de la carte touchée s'agrandit jusqu'en haut de la fiche (transition de vue du navigateur, fondu simple sinon) ; le panneau monte ensuite depuis le bas.
     - Arrivée sur la fiche : nom, prix, pastilles et bouton apparaissent l'un après l'autre (léger décalage vers le haut).
     - Changement de format : la pastille choisie glisse vers sa nouvelle place, la photo et le prix se croisent en fondu, le prix compte jusqu'à sa nouvelle valeur.
     - Défilement : la photo du haut descend plus lentement que le panneau (parallaxe) et rétrécit doucement.
     - Ajout au panier : le bouton se presse, l'icône du sac saute, une miniature du tableau vole jusqu'à la barre panier, la pastille du nombre rebondit ; sur ordinateur, la notification glisse depuis le bas.
     - Grille : les cartes apparaissent en cascade au premier affichage ; au toucher, la carte s'enfonce légèrement.
     - Barre panier : elle monte depuis le bas au premier article ; le panneau récapitulatif monte avec un fond qui s'assombrit, et se referme en glissant.
     - « Les autres formats » : les cartes entrent en cascade quand la section arrive à l'écran.
   - **Animations relevées image par image dans les vidéos (exigées par l'utilisateur le 2026-10-26)** :
     - Téléphone (vidéo épicerie) : au toucher d'une carte, la grille s'efface pendant que la photo du produit grandit depuis la carte jusqu'en haut de la fiche, puis le texte apparaît en montant ; « Ajouter au panier » ramène à la grille, la photo vole jusqu'à la barre panier, une miniature s'y ajoute et le nombre change ; la page repose sur la barre noire avec des coins arrondis en bas, et en touchant la barre, la page remonte pendant que le panneau noir du panier grandit depuis le bas (liste, total, bouton), puis redescend.
     - Ordinateur (vidéo KVIST) : pastille de filtre active qui glisse d'un choix à l'autre et cartes qui se réorganisent en fondu ; bandeau défilant en continu (informations vérifiées : acrylique, LED, effaçable, livraison offerte) ; badge circulaire qui tourne ; sections qui apparaissent en montant au défilement ; passage grille → fiche en fondu avec un léger zoom arrière de la page ; à l'ajout, la photo vole jusqu'au bouton panier de l'en-tête, le nombre change, puis le tiroir glisse depuis la droite sur un fond assombri, avec la notification en bas.
3. **Barre panier (téléphone, < 900 px)**
   - Collée en bas, fond noir : « Panier », miniatures des formats choisis (3 au plus, puis « +n »), pastille jaune avec le nombre d'articles.
   - Visible sur toutes les pages dès que le panier contient un article ; toujours visible sur la boutique et les fiches. Masquée sur `/commande` et le paiement.
   - Un toucher ouvre un panneau qui monte : lignes (miniature, nom, quantité modifiable, prix), livraison, total, bouton « Suivant » vers `/commande`. Glisser vers le bas, Échap ou toucher le fond le ferment.
   - Le lien « Panier » du menu hamburger ouvre ce panneau.
   - Accueil (page statique `frontend2/`) : même barre et même panneau, en HTML/JS, sur le panier partagé (`localStorage`, clé `lumikrea:panier:v1`).
4. **Ordinateur (≥ 900 px)** — inspiration : vidéo « Furniture e-commerce website » (KVIST), dans les couleurs Lumikréa
   - **Boutique** : grand titre éditorial (« Nos tableaux. », capitales Onest + mot au feutre Sacramento comme sur l'accueil), pastilles de filtre à droite (Tous · Carré · Paysage), les 4 cartes sur une ligne. Chaque carte a un fond teinté d'une couleur de la marque (rose, vert, bleu, violet en version douce), photo centrée, étiquette en haut à gauche (forme), puis nom, taille et prix sous la photo. Survol : la photo grandit légèrement.
   - **Fiche** : fil d'Ariane (Boutique › Tableau 20 × 20 cm), deux colonnes. À gauche, grande photo sur fond teinté et miniatures de la galerie. À droite, une carte : étiquette « Tableau lumineux », nom, prix, description courte ; choix du format en pastilles (on passe d'une fiche à l'autre) ; quantité et « Ajouter au panier » sur une ligne ; trois garanties en pastilles (livraison offerte, délai, paiement sécurisé : textes repris de `/api/shop` et de la page livraison, rien d'inventé) ; onglets Description · Dans la boîte · Caractéristiques.
   - **Ajout au panier** : notification en bas (« Ajouté au panier · Voir le panier ») et ouverture du tiroir panier existant, restylé à la manière de « Your bag » (titre avec nombre d'articles, lignes avec quantité, sous-total, bouton vers la commande).
   - Le choix du format en pastilles et les onglets existent aussi sur téléphone, empilés.
   - Pas repris : avis et étoiles (aucun avis réel), compte client, tableau de bord vendeur ; la page de paiement « Almost yours. » pourra faire l'objet d'un plan séparé.
5. **Liens « Choisir mon format »** : en-tête, ouverture du héros et dernier écran de l'accueil, `site.primaryCta` → `/boutique`. Le bouton « Commander » de la section Formats de l'accueil reste (ajout direct puis commande).

## Hors champ (non repris de l'inspiration)

- Favori (cœur) et filtre : aucune fonction prévue derrière (P-010).
- Paiement : inchangé, `/commande` existant.

## Étapes (une couche à la fois, P-006)

1. Routes `/boutique` et `/boutique/:format`, grille avec les vraies données (téléphone et ordinateur).
2. Fiche produit, galerie, choix du format, onglets et ajout au panier (téléphone et ordinateur).
3. Barre panier et panneau récapitulatif dans l'application React ; lien du menu hamburger ; notification d'ajout et tiroir restylé sur ordinateur.
4. Barre panier et panneau sur l'accueil statique.
5. « Choisir mon format » vers `/boutique` partout.
6. Vérification téléphone (375 px) et ordinateur (1280 px), tests existants (`npm test`), commit sur `lumikrea-v2`.

## Critères d'acceptation (P-036)

- Étant donné un visiteur sur l'accueil, quand il touche « Choisir mon format », alors la grille des 4 formats s'affiche avec leurs prix du serveur.
- Étant donné la fiche 20 × 20, quand il règle la quantité à 2 et touche « Ajouter au panier », alors la barre affiche 2 et une miniature du 20 × 20.
- Étant donné un panier non vide sur téléphone, quand il touche la barre, alors le panneau affiche les lignes, la livraison et le total, et « Suivant » ouvre `/commande` avec le même contenu.
- Étant donné un panier vide, sur l'accueil, alors aucune barre n'est affichée ; sur la boutique, la barre affiche « Panier » sans pastille et le panneau indique que le panier est vide.
- Étant donné un écran de 900 px ou plus, alors la barre est masquée et le tiroir actuel reste utilisé.
- Étant donné la boutique sur ordinateur, quand il touche la pastille « Paysage », alors seule la carte 30 × 20 reste affichée.
- Étant donné la fiche 12 × 12 sur ordinateur, quand il touche la pastille « 20 × 20 », alors la fiche du 20 × 20 s'affiche (adresse `/boutique/20x20`) ; quand il ajoute au panier, alors la notification apparaît et le tiroir s'ouvre avec la ligne ajoutée.
- Étant donné la fiche 15 × 15 sur téléphone, quand il fait défiler jusqu'en bas, alors « Les autres formats » montre 12 × 12, 20 × 20 et 30 × 20 (pas le 15 × 15) ; quand il en touche un, sa fiche s'ouvre avec la transition.
- Étant donné un appareil réglé sur « réduire les animations », alors toutes les pages restent utilisables sans mouvement.
- Aucune barre de défilement horizontale à 375 px ; aucune erreur dans la console.

## Plus tard (plan séparé)

- Confirmation de commande à la manière de « Order Details » (deuxième écran de la maquette) : récapitulatif, statut, numéro, livraison estimée, bouton « Suivre ma commande ».
- Page de paiement « Almost yours. » (vidéo KVIST).
