# Lumikréa — boutique mono-produit

Boutique en ligne du tableau lumineux à dessiner (plaque acrylique effaçable, base LED, USB) :
page d'accueil, panier, commande, paiement, confirmation et suivi. Tout fonctionne en mode
démo. CJdropshipping est intégré et n'attend que sa configuration ; il ne reste à écrire que
le raccordement de l'agrégateur de paiement (voir plus bas).

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

| Raccordement | Fichier | État |
| --- | --- | --- |
| Agrégateur de paiement | `server/payment/aggregator.ts` | à écrire : créer la transaction, vérifier la signature des notifications, (facultatif) interroger une transaction |
| CJdropshipping | `server/fulfillment/cj.ts`, `cj-client.ts` | écrit et testé ; reste à le configurer (ci-dessous) |

Les prix sont fixés (`src/config/product.ts`, livraison offerte). Les clés vont dans les
variables d'environnement (`.env.example`), jamais dans le code.

**La vente s'ouvre d'elle-même** quand tous les prix sont fixés et que les deux
raccordements répondent `isConfigured() === true`. Avant cela, le site affiche « La vente en
ligne ouvre bientôt » et le serveur refuse toute commande. Au démarrage, `npm start` écrit
dans le journal ce qui manque encore à CJ.

### Configurer CJ

`npm run cj` est un outil en lecture seule : il ne crée aucune commande et ne modifie
rien sur le compte CJ.

1. Dans le tableau de bord CJ, rubrique API, générer une clé. La copier dans un fichier
   `.env` (à créer à partir de `.env.example`, ignoré par Git) : `CJ_API_KEY=…`.
2. `npm run cj -- verifier` : teste la clé et liste ce qui reste à renseigner.
3. `npm run cj -- produit` : variantes du produit `CJYD2333071`, avec leur `vid` et le stock
   par entrepôt. Reporter le `vid` de chaque format dans `cjVariantId`
   (`src/config/product.ts`), et le pays de l'entrepôt choisi dans `CJ_FROM_COUNTRY`.
4. `npm run cj -- livraison <vid> FR` : modes d'envoi possibles, avec prix et délai CJ.
   Reporter le `logisticName` retenu dans `cjLogisticName` (`src/config/shop.ts`), ainsi
   que le prix et le délai annoncés au client (`price`, `delay`). Ce n'est qu'une
   estimation : le port réellement facturé peut être plus élevé (au premier test, 12,97 $
   facturés pour 9,47 $ estimés). Fixer les prix d'après une commande de test (étape 6).
5. Approvisionner le solde CJ : avec `CJ_PAY_TYPE=2` (par défaut), chaque commande est
   payée sur ce solde. Avec `CJ_PAY_TYPE=3`, elle est seulement créée et se paie à la main
   dans le tableau de bord CJ.
6. Tester de bout en bout avec `CJ_SANDBOX=1` et `npm run dev` : le paiement est simulé et
   les commandes partent chez CJ en commandes de test, ni débitées ni expédiées.
   `npm run cj -- commande LK-XXXXXX` montre ensuite leur état chez CJ.

Fonctionnement :

- La commande n'est envoyée à CJ qu'une fois le paiement confirmé, avec le numéro `LK-…`
  comme référence. CJ refuse les doublons : une relance reprend la commande existante et
  la paie si elle ne l'est pas encore.
- Toutes les 15 minutes (`npm start`), le serveur relit chez CJ l'état des commandes en
  cours : numéro de suivi, expédition (e-mail au client), livraison. Une commande annulée
  chez CJ passe en `fulfillment_error`.
- Les refus de CJ (solde insuffisant, variante ou mode d'envoi invalide, adresse…) sont
  traduits en consignes dans le champ `fulfillment.error` de la commande.
- Le jeton d'accès CJ est conservé dans `data/cj-token.json` (lisible par le seul
  propriétaire) et renouvelé automatiquement. Les appels sont espacés d'au moins
  1,1 s (limite d'un compte CJ gratuit, réglable par `CJ_MIN_INTERVAL_MS`).
- Les webhooks CJ ne sont pas utilisés : la relecture périodique les remplace.
- TVA à l'import dans l'UE (IOSS) : `CJ_IOSS_TYPE=3`, l'IOSS de CJ. CJ déclare la TVA et
  l'ajoute au montant de chaque commande CJ, à prévoir dans le prix de vente ; le client ne
  paie rien à la livraison. **Obligatoire** : sans ce réglage, CJ refuse les commandes vers
  la France (« Please enter a IOSS number »), et la vente reste fermée.

## Modes

| | `npm run dev` | `npm start` |
| --- | --- | --- |
| Mode par défaut | `demo` | `live` |
| Prix | fictifs pour les formats sans prix | ceux de la configuration uniquement |
| Paiement | simulé sur `/paiement-demo` | agrégateur |
| Fournisseur | simulé (expédié après 2 min, livré après 5 min) | CJ |

`SHOP_MODE=demo|live` force un mode. En démo, une pastille « Mode démo » reste affichée.

## Commandes et administration

Les commandes sont enregistrées dans Redis si ses identifiants sont définis (obligatoire
sur Vercel, voir ci-dessous), sinon dans `data/orders.json` (dossier ignoré par Git), ce qui
suffit sur un seul serveur classique (`npm start`).

Avec `ADMIN_TOKEN` défini :

```bash
curl -H "Authorization: Bearer $ADMIN_TOKEN" https://…/api/admin/orders                  # toutes les commandes
curl -X POST -H "Authorization: Bearer $ADMIN_TOKEN" https://…/api/admin/orders/LK-XXXXXX/fulfill  # relancer l'envoi à CJ
```

Une commande payée que CJ a refusée passe en `fulfillment_error` (le client, lui, voit
« confirmée ») : elle se relance avec la seconde commande.

## Mise en ligne sur Vercel

`vercel.json` fait construire le projet avec `npm run build:vercel` : le site en fichiers
statiques et toute l'API `/api/*` en une fonction (`server/vercel.ts`, assemblée par
`scripts/vercel-output.mjs`). Les adresses directes (`/suivi`, `/cgv`…) renvoient le site.

Une fois pour toutes, dans le projet Vercel :

1. **Storage → Upstash for Redis** (gratuit pour démarrer), relié au projet : Vercel ajoute
   lui-même `KV_REST_API_URL` et `KV_REST_API_TOKEN`. Sans base, la vente reste fermée :
   une commande serait perdue d'une requête à l'autre.
2. **Settings → Environment Variables** (environnement Production) :
   `CJ_API_KEY`, `CJ_IOSS_TYPE=3`, `CJ_PAY_TYPE=2`, `CJ_FROM_COUNTRY=CN`, puis deux
   longues chaînes aléatoires
   (`node -e "console.log(require('crypto').randomBytes(24).toString('hex'))"`) pour `CRON_SECRET` et `ADMIN_TOKEN`.
   `PUBLIC_URL` est facultatif (domaine de production par défaut) ; `SHOP_MODE` reste vide
   (mode réel). Les variables du paiement viendront avec l'agrégateur.
3. Redéployer, puis vérifier que `https://…/api/shop` répond en JSON. Les journaux de la
   fonction (Logs) listent au démarrage ce qui manque encore.

Le suivi des colis est relu chez CJ une fois par jour (tâche planifiée `/api/cron/sync`,
maximum de l'offre gratuite de Vercel) et à chaque consultation d'une commande par le client.

## Où modifier quoi

| Besoin | Fichier |
| --- | --- |
| Nom de marque, slogan, navigation, contact, identité légale du vendeur (`seller`) | `src/config/site.ts` |
| Texte des pages légales (mentions, CGV, confidentialité, livraison et retours) | `src/content/legal/*.md` |
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

### Pages légales

Les textes sont en Markdown simplifié dans `src/content/legal/` (titres `##`, listes `-`,
encadrés `>`, `**gras**`, `[liens](/cgv)`). Les jetons `{vendeur}`, `{adresse}`, `{email}`,
`{delai}`… sont remplacés par les valeurs de la configuration (`src/content/legal/fields.ts`) :
l'identité du vendeur ne se saisit qu'une fois. Une ligne dont un jeton facultatif est vide
est retirée ; un jeton indispensable vide (e-mail, délai) s'affiche « à compléter ».

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

- Confirmer le nom de marque. Prix fixés le 7 octobre 2026 : 24,90 € à 36,90 € selon le
  format, livraison offerte, annoncée en 10 jours ouvrés (à ajuster d'après les
  premières commandes).
- Contenu et caractéristiques repris de la fiche CJ le 8 octobre 2026 ; ce qu'elle ne dit
  pas (couleur de la lumière, interrupteur, âge, sécurité) n'est pas affiché. La fiche
  annonce un seul feutre alors que certaines photos en montrent sept : à vérifier sur un
  exemplaire. Âge conseillé et consignes de sécurité : à obtenir du fabricant (marquage CE,
  rapport EN 71) avant de les afficher.
- Vérifier que la photo du début de page montre bien la référence vendue : sa base est en
  bois, celle des photos fournisseur est blanche.
- Renseigner l'e-mail du service client (`contactEmail`, `src/config/site.ts`) : seule
  information indispensable des pages légales, réduites au minimum le 8 octobre 2026 (pas
  d'entreprise enregistrée). Les lignes d'entreprise (`seller` : nom, statut, adresse,
  SIREN, TVA, téléphone, hébergeur, médiateur) n'apparaissent qu'une fois renseignées : à
  remplir dès que l'activité est déclarée. Les textes sont dans `src/content/legal/` ; les
  faire relire par un professionnel du droit.
- Raccorder le paiement et configurer CJ (voir « Ce qui reste à raccorder »).
- Brancher l'envoi des e-mails au client (`server/notify.ts`) : pour l'instant ils sont
  seulement écrits dans le journal. Obligatoire avant d'ouvrir la vente : les CGV annoncent
  une confirmation de commande par e-mail (exigée par l'article L. 221-13 du Code de la
  consommation) et l'envoi du numéro de suivi.
- Sur Vercel : créer la base Upstash for Redis et renseigner les variables (voir « Mise en
  ligne sur Vercel »).
- Passer `og:image` en URL absolue et ajouter les données structurées produit une fois le
  domaine et les prix connus.
