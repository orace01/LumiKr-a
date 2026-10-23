# Lumikréa — boutique mono-produit

Boutique en ligne du tableau lumineux à dessiner (plaque acrylique effaçable, base LED, USB) :
page d'accueil, panier, commande, paiement, confirmation et suivi. Tout fonctionne en mode
démo. CJdropshipping et le paiement Mepaye sont raccordés et n'attendent que leur
configuration (voir plus bas).

## Démarrer

```bash
npm install
npm run dev       # site + API sur http://localhost:5173, en mode démo
npm test          # tests du serveur et de la logique de commande (vitest)
npm run lint      # oxlint
npm run build     # vérification TypeScript, site (dist/) et serveur (dist-server/)
npm start         # serveur de production : site + API, en mode réel par défaut
```

Le site a deux parties, servies sous le même domaine :

- **l'accueil** (`/`) : page statique de `frontend2/` (HTML, CSS et JavaScript sans
  framework), avec l'intro du logo, la vidéo du hero pilotée par le défilement, les usages,
  les formats, le contenu de la boîte et la FAQ. `frontend2/boutique.js` y lit les prix,
  la livraison et l'état de la vente sur l'API, et « Commander » met le format choisi dans
  le panier puis ouvre `/commande` ;
- **la boutique** (toutes les autres adresses) : application React (`app.html`, `src/`) pour
  le panier, la commande, la confirmation, le suivi et les pages légales, dans le même
  style que l'accueil (bleu nuit, halo doré, polices Onest et Sacramento).

Stack : Vite, React 19, TypeScript, CSS natif (un fichier par composant, jetons dans
`src/styles/global.css`). Polices auto-hébergées (`@fontsource`, copiées dans
`frontend2/fonts/` pour l'accueil). Serveur : [Hono](https://hono.dev) sur Node.js 20 ou plus.
En développement, `vite.config.ts` sert l'accueil à `/` et l'application ailleurs ; au build,
`frontend2/` est copié à la racine de `dist/` (sauf `serve.mjs`, l'aperçu autonome du
prototype : `node frontend2/serve.mjs`).

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
| Paiement (Mepaye) | `server/payment/mepaye.ts` | écrit et testé ; reste à le configurer (ci-dessous) |
| CJdropshipping | `server/fulfillment/cj.ts`, `cj-client.ts` | écrit et testé ; reste à le configurer (ci-dessous) |

Les prix sont fixés (`src/config/product.ts`, livraison offerte). Les clés vont dans les
variables d'environnement (`.env.example`), jamais dans le code.

**La vente s'ouvre d'elle-même** quand tous les prix sont fixés et que les deux
raccordements répondent `isConfigured() === true`. Avant cela, le site affiche « La vente en
ligne ouvre bientôt » et le serveur refuse toute commande. Au démarrage, le serveur écrit
dans le journal ce qui manque encore (Mepaye, CJ, pages légales).

### Configurer Mepaye

Le client paie sur la page hébergée de Mepaye (cartes, PayPal, mobile money) ; le numéro de
carte ne passe jamais par le site. Mepaye prévient le serveur par un webhook signé.

1. Dans la boutique Mepaye, régler la **devise sur l'euro** : l'API refuse un paiement dans
   une autre devise que celle de la boutique (`currency_mismatch`).
2. **Développeur → Webhooks** : URL `https://…/api/payments/notify`, événements
   `payment.succeeded` et `payment.failed`. Le secret affiché va dans `MEPAYE_WEBHOOK_SECRET`.
3. **Développeur → API Paiement** : créer une clé (`MEPAYE_API_KEY`), avec pour « Lien de ton
   site » `https://…/commande/confirmation`. Mepaye y ramène le client après le paiement ; le
   navigateur retrouve la commande payée (`src/shop/pendingOrder.ts`).
4. Tester avec une clé `mp_test_…` en mode démo (`SHOP_MODE=demo`) : la page de paiement
   propose « Simuler un paiement réussi / un échec ». Une clé de test n'ouvre jamais la vente
   réelle, et le serveur ignore les notifications de test quand la clé est réelle (et
   inversement).
5. En production, une clé `mp_live_…`. Une notification dont le montant ou la devise
   diffère de la commande ne la valide pas.

Mepaye prélève une commission de 5 % ; l'API ne permet pas de relire l'état d'un paiement,
seul le webhook fait foi.

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
| Paiement | simulé sur `/paiement-demo`, ou Mepaye avec une clé de test | Mepaye |
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

Le site est servi sur `https://www.lumikrea.store` (domaine chez LWS : enregistrements A `@`
et CNAME `www` vers Vercel, messagerie restée chez LWS). L'adresse `lumi-krea.vercel.app`
doit rester active, sans redirection : le webhook Mepaye y est déclaré.

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
   (mode réel). Pour le paiement : `MEPAYE_API_KEY` (clé `mp_live_…`) et
   `MEPAYE_WEBHOOK_SECRET` (voir « Configurer Mepaye »). Pour les e-mails aux clients
   (confirmation de commande, numéro de suivi, `server/notify.ts`) : `SMTP_HOST`,
   `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD` de la boîte de contact, et `PUBLIC_URL`
   (`https://www.lumikrea.store`) pour leurs liens. Sans eux, ces messages sont seulement
   écrits dans le journal.
3. Redéployer, puis vérifier que `https://…/api/shop` répond en JSON. Les journaux de la
   fonction (Logs) listent au démarrage ce qui manque encore.

Le suivi des colis est relu chez CJ une fois par jour (tâche planifiée `/api/cron/sync`,
maximum de l'offre gratuite de Vercel) et à chaque consultation d'une commande par le client.

## Où modifier quoi

| Besoin | Fichier |
| --- | --- |
| Page d'accueil : textes, sections, animations, FAQ, médias | `frontend2/index.html`, `styles.css`, `app.js`, `sections.js`, `media/` |
| Lien entre l'accueil et la boutique (prix, vente ouverte, « Commander ») | `frontend2/boutique.js` |
| Nom de marque, slogan, navigation des pages boutique, contact, identité légale du vendeur (`seller`) | `src/config/site.ts` |
| Texte des pages légales (mentions, CGV, confidentialité, livraison et retours) | `src/content/legal/*.md` |
| Formats, prix, identifiants CJ, contenu de la boîte, caractéristiques | `src/config/product.ts` |
| Devise, pays livrés, modes de livraison, nom du prestataire de paiement | `src/config/shop.ts` |
| Couleurs, typographie, espacements des pages boutique | `src/styles/global.css` |

Le nom de marque et la description sont injectés dans `app.html` par `vite.config.ts`.
Les textes de l'accueil (FAQ, contenu de la boîte, caractéristiques) sont écrits dans
`frontend2/` : les garder d'accord avec `src/config/product.ts` et `shop.ts`, qui font foi
pour le serveur. Seuls les prix et le délai de livraison de l'accueil sont lus sur l'API.

### Informations « À confirmer »

Dans `product.ts`, chaque information porte un champ `verified` : seule une information
vérifiée peut être affichée, sur l'accueil comme dans la boutique. Les pages légales
signalent ce qui manque par une pastille « à compléter ».

Même règle pour les prix et frais de livraison : `null` tant qu'ils ne sont pas fixés.

### Pages légales

Les textes sont en Markdown simplifié dans `src/content/legal/` (titres `##`, listes `-`,
encadrés `>`, `**gras**`, `[liens](/cgv)`). Les jetons `{vendeur}`, `{adresse}`, `{email}`,
`{delai}`… sont remplacés par les valeurs de la configuration (`src/content/legal/fields.ts`) :
l'identité du vendeur ne se saisit qu'une fois. Une ligne dont un jeton facultatif est vide
est retirée ; un jeton indispensable vide (e-mail, délai) s'affiche « à compléter ».

## Médias

Les originaux fournisseur restent intacts dans `CJYD2333071/`. Médias de l'accueil (vidéos
du hero et de l'intro, photos des usages) : `frontend2/media/`, voir
`scripts/build-hero-frontend2.sh`. Images de la boutique (une vignette par format pour le
panier et le récapitulatif, image de partage) :

```bash
npm run media     # scripts/build-media.sh, nécessite ffmpeg (libwebp)
```

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
- Pages légales réduites au minimum le 8 octobre 2026 (pas d'entreprise enregistrée) :
  seule l'adresse de contact est indispensable (`contactEmail`, `src/config/site.ts`,
  `contact@lumikrea.store` depuis le 13 octobre 2026). Les lignes d'entreprise (`seller` : nom, statut, adresse,
  SIREN, TVA, téléphone, hébergeur, médiateur) n'apparaissent qu'une fois renseignées : à
  remplir dès que l'activité est déclarée. Les textes sont dans `src/content/legal/` ; les
  faire relire par un professionnel du droit.
- Garder le solde CJ approvisionné : sans lui, une commande payée reste en
  `fulfillment_error` jusqu'à sa relance (voir « Commandes et administration »).
- Sur Vercel : créer la base Upstash for Redis et renseigner les variables (voir « Mise en
  ligne sur Vercel »).
- Passer `og:image` en URL absolue et ajouter les données structurées produit une fois le
  domaine et les prix connus.
