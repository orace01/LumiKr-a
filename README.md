# Lumikréa — boutique mono-produit

Boutique en ligne du tableau lumineux à dessiner (plaque acrylique effaçable, base LED, USB) :
page d'accueil, panier, commande, paiement, confirmation et suivi. Tout fonctionne en mode
démo ; il ne reste à raccorder que l'agrégateur de paiement et CJdropshipping (voir plus bas).

## Démarrer

```bash
npm install
npm run dev       # site + API sur http://localhost:5173, en mode démo
npm test          # tests du serveur et de la logique de commande (vitest)
npm run lint      # oxlint
npm run build     # vérification TypeScript, site (dist/) et serveur (dist-server/)
npm start         # serveur de production : site + API, en mode réel par défaut
```

Stack : Vite, React 19, TypeScript, CSS natif (un fichier par composant, jetons dans
`src/styles/global.css`). Polices auto-hébergées via `@fontsource-variable` (Fredoka, Figtree).
Serveur : [Hono](https://hono.dev) sur Node.js 20 ou plus.

## Parcours d'achat

1. **Accueil** (`/`) : toute la découverte du produit, jusqu'au choix du format, de la quantité
   et « Ajouter au panier » (section Formats).
2. **Panier** : panneau latéral, ouvert depuis le bouton du header ou après un ajout. Il est
   gardé dans le navigateur (`localStorage`).
3. **Commande** (`/commande`) : une seule page, sans compte client : coordonnées, adresse,
   mode de livraison, acceptation des CGV, puis « Payer ». En-tête réduit, sans menu.
4. **Paiement** : chez le prestataire (en démo : `/paiement-demo`). Aucun numéro de carte
   ne passe par le site.
5. **Confirmation** (`/commande/confirmation`) : numéro de commande et étapes à venir. La page
   attend la confirmation du prestataire si le client revient avant elle. Paiement refusé ou
   abandonné : retour à la commande, panier et saisie conservés.
6. **Suivi** (`/suivi`) : numéro de commande + e-mail → état et numéro de suivi du colis.

Côté serveur, une fois le paiement confirmé par le prestataire, la commande est transmise
automatiquement à CJ (une seule fois, même si le prestataire notifie plusieurs fois). Les
montants sont toujours recalculés par le serveur : un prix modifié dans le navigateur n'a
aucun effet.

## Ce qui reste à raccorder

Deux fichiers seulement, chacun documenté en tête :

| Raccordement | Fichier | Ce qu'il faut écrire |
| --- | --- | --- |
| Agrégateur de paiement | `server/payment/aggregator.ts` | créer la transaction, vérifier la signature des notifications, (facultatif) interroger une transaction |
| CJdropshipping | `server/fulfillment/cj.ts` | appeler la création de commande et la lecture du suivi ; la traduction commande → format CJ est déjà écrite (`toCjOrder`) |

Puis, dans la configuration : les prix (`src/config/product.ts`), les identifiants de
variante CJ (`cjVariantId`), le mode de livraison et son nom CJ (`src/config/shop.ts`).
Les clés vont dans les variables d'environnement (`.env.example`), jamais dans le code.

**La vente s'ouvre d'elle-même** quand tous les prix sont fixés et que les deux
raccordements répondent `isConfigured() === true`. Avant cela, le site affiche « La vente en
ligne ouvre bientôt » et le serveur refuse toute commande.

## Modes

| | `npm run dev` | `npm start` |
| --- | --- | --- |
| Mode par défaut | `demo` | `live` |
| Prix | fictifs pour les formats sans prix | ceux de la configuration uniquement |
| Paiement | simulé sur `/paiement-demo` | agrégateur |
| Fournisseur | simulé (expédié après 2 min, livré après 5 min) | CJ |

`SHOP_MODE=demo|live` force un mode. En démo, une pastille « Mode démo » reste affichée.

## Commandes et administration

Les commandes sont enregistrées dans `data/orders.json` (dossier ignoré par Git), ce qui
suffit sur un seul serveur. Pour plusieurs instances ou un hébergement « serverless », il
faudra une base de données qui respecte l'interface `OrderStore` (`server/orders/store.ts`).

Avec `ADMIN_TOKEN` défini :

```bash
curl -H "Authorization: Bearer $ADMIN_TOKEN" https://…/api/admin/orders                  # toutes les commandes
curl -X POST -H "Authorization: Bearer $ADMIN_TOKEN" https://…/api/admin/orders/LK-XXXXXX/fulfill  # relancer l'envoi à CJ
```

Une commande payée que CJ a refusée passe en `fulfillment_error` (le client, lui, voit
« confirmée ») : elle se relance avec la seconde commande.

## Où modifier quoi

| Besoin | Fichier |
| --- | --- |
| Nom de marque, slogan, navigation, pages légales, contact | `src/config/site.ts` |
| Formats, prix, identifiants CJ, contenu de la boîte, caractéristiques | `src/config/product.ts` |
| Devise, pays livrés, modes de livraison, nom du prestataire de paiement | `src/config/shop.ts` |
| Questions fréquentes | `src/config/faq.ts` |
| Couleurs, typographie, espacements | `src/styles/global.css` |

Le nom de marque et la description sont injectés dans `index.html` par `vite.config.ts` :
ils ne sont définis qu'une fois.

### Informations « À confirmer »

Dans `product.ts`, chaque information porte un champ `verified`. Tant qu'il vaut `false`,
la page affiche une pastille « À confirmer » au lieu de présenter l'information comme
acquise. Il suffit de renseigner `value` et de passer `verified` à `true`.

Même règle pour les prix et frais de livraison : `null` tant qu'ils ne sont pas fixés.

## Médias

Les originaux fournisseur restent intacts à la racine (`d05cda3e….mp4`, la vidéo, qui n'est
plus utilisée par le site) et dans `CJYD2333071/`. Les images du site sont générées dans
`src/assets/media/` :

```bash
npm run media     # nécessite ffmpeg (libwebp)
```

Le script `scripts/build-media.sh` :

- prépare la photo du hero (`media-sources/hero-good-morning.png`, fournie à part, agrandie ×2) ;
- recadre les autres photos fournisseur sur le produit seul : photos des formats pour le début
  de page, une vignette par format, les feutres, les trois vues du support, le packshot et
  l'image de partage. Restent hors cadre les bandeaux et cotes en anglais, les personnes de
  banque d'images, les textes religieux et les décors de fêtes (Noël, Nouvel An).

### Animations au défilement

Le rythme des sections reprend celui du site de référence numa.uprock.pro. Tout repose sur
`position: sticky` et sur une variable CSS `--p` (avancement de 0 à 1) écrite par le hook
`useScrollProgress` ; la chorégraphie elle-même est en CSS, dans le fichier de chaque composant.

| Section | Effet | Fichiers |
| --- | --- | --- |
| Hero | La photo plein écran reste épinglée, se resserre au centre, puis les photos des formats surgissent autour | `Hero.tsx`, `Hero.css` |
| Début de page sur téléphone | Pas de hero (sa photo n'est pas téléchargée) : sous le titre, les photos des quatre formats défilent du doigt, puis les boutons | `FormatCarousel.tsx`, `Intro.css`, `useIsMobile.ts` |
| Titre et étapes | Le titre principal et ses boutons restent épinglés, les trois étapes montent par-dessus à des vitesses différentes | `Intro.tsx`, `Intro.css` |
| Transition | Des mots géants traversent l'écran à l'horizontale pendant que le fond change de couleur | `GiantWords.tsx`, `GiantWords.css` |
| Usages | Le titre et le sommaire restent fixes à gauche, les cartes s'empilent à droite | `Usages.tsx`, `Usages.css` |
| Questions | Les questions sont des onglets ; la réponse s'écrit mot à mot en néon sur un tableau lumineux, dans la couleur de feutre de la question | `Faq.tsx`, `Faq.css` |
| Final | Un titre géant monte, le produit flotte dessous sur un halo de couleur | `Finale.tsx`, `Finale.css` |

Les autres blocs apparaissent en fondu avec un léger flou (`.reveal` dans `global.css`).
Avec « animations réduites », rien n'est épinglé ni animé : chaque section s'affiche dans son
état final, en mise en page ordinaire.

## Reste à faire avant mise en ligne

- Confirmer le nom de marque, les prix, le contenu exact de la boîte, l'âge conseillé et
  les consignes de sécurité.
- Vérifier que la vidéo montre bien la référence vendue : sa base lumineuse et ses pieds
  diffèrent de ceux des photos fournisseur.
- Fixer les prix, les frais et délais de livraison, la devise et les pays livrés.
- Rédiger les pages légales (mentions, CGV, confidentialité, livraison et retours) pour le
  marché visé : champ `body` de chaque page dans `site.ts`.
- Raccorder le paiement et CJ (voir « Ce qui reste à raccorder »).
- Brancher l'envoi des e-mails au client (`server/notify.ts`), si le prestataire de paiement
  n'envoie pas déjà de reçu : pour l'instant ils sont seulement écrits dans le journal.
- Héberger sur un serveur Node.js qui garde ses fichiers (`data/`), avec HTTPS et
  `PUBLIC_URL` renseigné.
- Passer `og:image` en URL absolue et ajouter les données structurées produit une fois le
  domaine et les prix connus.
