# Procédure : lancer une boutique en ligne mono-produit

Méthode pour mettre en ligne une boutique qui vend **un seul produit** en dropshipping, quel
que soit ce produit. La chaîne d'outils est fixe :
- **CJdropshipping** pour le fournisseur ;
- **Mepaye** pour le paiement ;
- **Vercel** et **Upstash Redis** pour l'hébergement ;
- **LWS** pour le domaine et l'e-mail.

Elle s'adresse à **Claude Code** : la lire en entière, puis la suivre étape par étape.
Chaque étape dit ce qu'il faut mettre en place, ce qu'il faut demander à l'utilisateur et
comment savoir qu'elle est terminée.

Un modèle de code complet, construit avec cette procédure, existe sur GitHub
(`orace01/LumiKr-a`). Le copier pour récupérer toute la mécanique (panier, commande,
paiement, fournisseur, e-mails, déploiement), puis remplacer le contenu, les images et la
configuration.

**Message de démarrage à coller dans Claude Code :**

> Lis `PROCEDURE-NOUVEAU-PRODUIT.md` en entier. On lance une boutique pour ce produit CJ :
> [lien ou SKU]. Photos fournisseur : [dossier]. Voici ce qui est déjà prêt dans la
> préparation : [liste]. Commence par l'étape 0.

---

## 1. Préparation au préalable

À faire avant d'ouvrir Claude Code, ou au fil de l'eau. Chaque élément manquant bloque une
étape plus tard. Les clés et mots de passe vont dans le fichier `.env` du projet ou dans
Vercel, **jamais dans la conversation**.

**Produit**
- [ ] Le **SKU ou le lien CJ** du produit, et le dossier de photos fournisseur. CJ fournit
  un dossier « Marketing Picture ».
- [ ] Idéalement, **un exemplaire commandé chez soi**, pour vérifier le contenu réel du colis.
  Les fiches CJ se contredisent parfois avec leurs propres photos.
- [ ] Si le produit vise des enfants ou contient de l'électronique : demander à CJ la
  déclaration CE et les rapports de test. Sans eux, ni âge ni consignes de sécurité ne
  seront affichés.

**Décisions**
- [ ] Nom de marque, et domaine disponible **sans accent** (une adresse e-mail avec accent
  pose problème).
- [ ] Pays de livraison et devise de vente (par défaut : France métropolitaine, EUR).
- [ ] Public et **usages** du produit : en viser plusieurs, pas un seul.
- [ ] Style visuel, avec des sites de référence.
- [ ] Situation juridique : entreprise enregistrée ou non.
- [ ] Politique de retour : qui paie le retour.

**CJdropshipping**
- [ ] Compte CJ, puis **clé API** (rubrique API du tableau de bord, format `CJ…@api@…`).
- [ ] **Solde CJ approvisionné** : les commandes sont payées automatiquement dessus.

**Mepaye**
- [ ] Compte Mepaye avec **vérification d'identité (KYC)** terminée. Elle est obligatoire
  pour créer une clé.
- [ ] Boutique Mepaye **réglée dans la devise de vente** (EUR). Sinon, tous les paiements
  sont refusés.

**GitHub et Vercel**
- [ ] Un dépôt GitHub pour le projet, relié à un projet Vercel (offre gratuite Hobby
  suffisante).

**LWS (domaine et e-mail)**
- [ ] Le **domaine** acheté, formule avec boîtes e-mail.
- [ ] La boîte **`contact@<domaine>`** créée, et son mot de passe noté. Il sert aussi à
  envoyer les e-mails de commande.

**Contenus**
- [ ] Les images d'ambiance éventuelles. Si elles sont générées par IA, elles doivent
  montrer **exactement le produit vendu** : même forme, même base, mêmes accessoires.

---

## 2. Règles pour Claude Code (toutes les étapes)

1. **Ne rien inventer** : prix, délais, avis, âge, sécurité, caractéristiques. Sources
   acceptées : la fiche CJ (lue par l'API) et l'utilisateur. Une information non vérifiée
   est marquée « À confirmer » pendant la maquette, puis **retirée** avant la mise en ligne
   publique si elle reste inconnue. Signaler les contradictions de la fiche CJ, et afficher
   la version prudente.
2. **Aucune donnée de carte** sur le site : le client paie sur la page hébergée de Mepaye.
3. **Aucun secret** dans le code, le dépôt, le bundle client ou les journaux. Avant chaque
   commit, chercher dans `git diff --cached` les `mp_live_`, `whsec_`, `CJ…@api@`, mots de
   passe. Si l'utilisateur colle un secret dans la conversation : le ranger dans `.env`
   (droits 600), et conseiller une fois de le régénérer.
4. **Aucune action sensible sans accord explicite** : commande CJ (même de test),
   modification d'un compte, commit, push. Un push sur `main` déploie en production :
   le demander à chaque fois, en disant ce qu'il met en ligne.
5. **Peu de questions, au bon moment** : audit d'abord, puis questions à choix
   (AskUserQuestion). Pour le design, proposer des options avec aperçu.
6. **Guider pas à pas** dans CJ, Mepaye, Vercel et LWS : l'utilisateur envoie des captures.
   Répondre par une étape à la fois, avec les valeurs exactes dans un tableau et ce qu'il ne
   faut pas toucher.
7. **Vérifier soi-même** :
   - `npx tsc -b`, `npm run lint`, `npm test`, `npm run build:vercel` ;
   - le rendu dans Chrome sans interface, sur ordinateur (1440×900) et sur mobile
     (390×844), sans débordement horizontal.
8. **Générer les secrets** (`openssl` peut manquer) avec
   `node -e "console.log(require('crypto').randomBytes(24).toString('hex'))"`.
9. **Tenir à jour** le README, `.env.example` et la mémoire des décisions, avec leur date.

---

## 3. Stack et architecture

| Couche | Choix |
| --- | --- |
| Front | Vite, React, TypeScript, CSS natif, routeur History maison |
| Serveur | Hono : même code en dev (plugin Vite), sur serveur Node (`npm start`) et en fonction Vercel |
| Commandes | Upstash Redis en production, fichier JSON en local |
| Paiement | Mepaye ; paiement simulé en mode démo |
| Fournisseur | CJdropshipping API 2.0 ; fournisseur simulé en mode démo |
| E-mails clients | SMTP de la boîte LWS, avec `nodemailer` en version ≥ 10.1 |
| Tests | vitest, avec de faux services (CJ, Mepaye, Upstash, SMTP), plus oxlint |

**Principes à garder :**
- **Configuration séparée du code** :
  - `src/config/product.ts` : variantes, prix, `cjVariantId`, contenu, caractéristiques ;
  - `src/config/shop.ts` : devise, pays, livraison (`price`, `delay`, `cjLogisticName`) ;
  - `src/config/site.ts` : marque, `contactEmail`, identité légale ;
  - `src/config/faq.ts` ;
  - `src/content/legal/*.md`.
- **Quatre interfaces côté serveur** : paiement, fournisseur, stockage des commandes,
  notifications. Changer de prestataire ne touche que son fichier.
- **Mode démo** (`npm run dev`) : tout se teste sans compte.
- **Verrou de vente** : en production, la vente reste fermée tant qu'il manque un prix, les
  pages légales, la base, la clé de paiement réelle ou CJ. Le serveur écrit au démarrage ce
  qui manque.
- **Montants recalculés par le serveur**, jamais repris du navigateur.
- **Mise à jour atomique** des commandes (compare-and-set Lua dans Redis, avec nouvel essai).
  Les fonctions de mise à jour doivent pouvoir être rejouées.
- **Idempotence** : un paiement notifié deux fois ne crée qu'une commande CJ. CJ refuse aussi
  les doublons, et le code reprend alors la commande existante.

---

## 4. Les étapes

Chaque étape indique : **ce qu'on met en place** · **ce qu'on demande** · **c'est terminé
quand…**

### Étape 0 — Audit et cadrage
- **Mettre en place :**
  - une planche contact des photos CJ
    (`magick montage … -geometry 420x420+6+6 -tile 3x -label '%f'`) ;
  - le classement des photos par usage, en repérant les inutilisables : bandeaux et cotes en
    anglais, personnes de banque d'images, textes religieux ;
  - dès que la clé est là, la lecture de la fiche CJ : variantes, **liste de colisage**,
    description, stock.
- **Demander :** les décisions manquantes de la préparation (questions à choix).
- **Terminé quand :** marque, marché, public, usages, style et variantes sont décidés et
  notés.

### Étape 1 — Socle et page de vente (en mode démo)
- **Mettre en place**, sur une seule page qui mène à l'ajout au panier :
  - accroche (hero) ;
  - fonctionnement en quelques étapes ;
  - **usages** (cartes) ;
  - choix de la variante, avec prix et délai ;
  - contenu du colis et caractéristiques ;
  - FAQ ;
  - appel à l'action final.
- Version mobile pensée à part.
- **Règles de design apprises :**
  - espacement serré entre les sections ;
  - pas deux gros titres centrés à la suite ;
  - animations au défilement possibles, mais légères.
- **Demander :** des retours sur le style, par options avec aperçu.
- **Terminé quand :** l'utilisateur valide le rendu, sur ordinateur et sur mobile.

### Étape 2 — Médias
- **Mettre en place** un script unique (`scripts/build-media.sh`, avec ffmpeg et
  ImageMagick) qui produit toutes les images du site depuis les originaux, sans jamais les
  modifier :
  - recadrages en WebP ;
  - petits recadrages agrandis ×2 (`scale=iw*2:ih*2:flags=lanczos,unsharp=5:5:0.7`) ;
  - images fournies par l'utilisateur rangées dans `media-sources/`.
- **Règles :**
  - **le produit visible en entier** dans chaque cadre (`object-fit: contain`), entouré de
    la même photo minuscule et floutée d'avance ;
  - **une photo par cadre**, jamais de collage ;
  - un fond qui fait ressortir le produit ;
  - décors de fête seulement dans un usage « fêtes ».
- **Terminé quand :** chaque usage a une photo fidèle au produit réel. Sinon, demander une
  image à l'utilisateur.

### Étape 3 — Parcours d'achat
- **Mettre en place :**
  - panier gardé dans le localStorage ;
  - commande sur une page, sans compte, avec la case des CGV non pré-cochée et un brouillon
    gardé dans le sessionStorage ;
  - redirection vers le paiement ;
  - page de confirmation qui attend la notification (relecture toutes les 3 secondes) ;
  - page `/suivi` (numéro de commande et e-mail).
- **Retour de Mepaye :** il ramène le client sur une adresse fixe. Avant de rediriger, garder
  l'adresse de confirmation de la commande en cours dans le localStorage, pour que la page
  de confirmation la retrouve.
- **Terminé quand :** une commande complète passe en mode démo.

### Étape 4 — CJdropshipping
- **Mettre en place**, avec la clé dans `.env` (`CJ_API_KEY`) :
  - outil en lecture seule `npm run cj -- verifier | produit <SKU> | livraison <vid> FR |
    commande <n°>` ;
  - le `vid` de chaque variante reporté dans `cjVariantId` ;
  - le stock par entrepôt (`/product/stock/queryByVid`), pour régler `CJ_FROM_COUNTRY` ;
  - le transporteur choisi par l'utilisateur (`npm run cj -- livraison`), reporté dans
    `cjLogisticName` ;
  - **IOSS obligatoire pour l'UE**, sinon « Please enter a IOSS number » : `CJ_IOSS_TYPE=3`
    (IOSS de CJ, TVA facturée sur la commande CJ) ;
  - `CJ_PAY_TYPE=2` : commande payée automatiquement sur le solde CJ ;
  - suivi relu chez CJ (tâche planifiée, plus à chaque consultation du client) ;
  - jeton CJ gardé en Redis ; appels espacés d'au moins 1,1 seconde ;
  - erreurs traduites en consignes (solde insuffisant, variante inconnue, transporteur…).
- **Coûts réels :** l'estimation de port de CJ est souvent inférieure à ce qui est facturé.
  Avec l'accord de l'utilisateur, passer **une commande de test par variante**, plus une à
  deux articles. Pour cela : `isSandbox: 1` **et** `CJ_PAY_TYPE=3` (création seule, jamais
  payée). Lire ensuite `npm run cj -- commande` (produit, port, total).
- **Douane UE :** droit forfaitaire de 3 € par catégorie d'article depuis le 1er juillet
  2026, à vérifier auprès de CJ (inclus ou non).
- **Terminé quand :** une commande de test est acceptée par CJ et son suivi remonte sur le
  site.

### Étape 5 — Prix
- **Calculer** le coût réel livré :
  - total des commandes de test CJ (USD), converti au cours BCE du jour, plus 3 % de marge
    de change ;
  - plus la commission Mepaye (5 %) ;
  - deux scénarios : sans TVA, et avec TVA (1/6 du prix TTC).
- **Comparer** au même produit sur Amazon et Cdiscount (recherche web, sources citées).
- **Proposer 3 grilles** (proche du marché, équilibrée, premium), avec la marge par variante.
  Livraison offerte et intégrée au prix, de préférence ; elle s'affiche alors « offerte »
  partout.
- **Délai annoncé :** transport CJ plus préparation, en jours ouvrés, avec une marge.
- **Terminé quand :** les prix et le délai sont choisis par l'utilisateur et inscrits dans la
  configuration.

### Étape 6 — Pages légales
- **Mettre en place** mentions légales, CGV, confidentialité, livraison et retours, en
  Markdown (`src/content/legal/`). Des jetons (`{vendeur}`, `{email}`, `{delai}`,
  `{paiement}`…) sont remplis depuis la configuration.
- **Contenu indispensable** pour vendre à des particuliers dans l'UE :
  - identité et contact du vendeur ;
  - prix et livraison, avec le délai et le plafond légal de 30 jours ;
  - **rétractation de 14 jours**, avec formulaire type ;
  - **encadré de la garantie légale de conformité** (décret 2022-424, à vérifier sur
    Légifrance) ;
  - médiation ;
  - données personnelles, avec les **transferts hors UE** : la Chine pour CJ et ses
    transporteurs, les États-Unis pour Mepaye (OPUXE L.L.C.) ;
  - pas de cookies publicitaires : le panier en localStorage ne demande pas de
    consentement.
- **Sans entreprise enregistrée :** version minimale. Les lignes d'entreprise vides
  disparaissent ; seuls l'e-mail de contact et le délai sont indispensables. Conseiller une
  fois la micro-entreprise (formalites.entreprise.gouv.fr).
- **Terminé quand :** aucune page n'affiche d'information manquante. Recommander une
  relecture par un professionnel.

### Étape 7 — Mepaye
- Documentation : `https://mepaye.com/developpeur/docs`.
- **Mettre en place** (`server/payment/mepaye.ts`) :
  - `POST https://mepaye.com/api/v1/payments`, avec `Authorization: Bearer <clé>` et
    `Idempotency-Key: <n° de commande>` ;
  - corps : `amount` (centimes), `currency`, `externalReference`, `buyer` (nom, e-mail,
    téléphone au format `+33…`, pays) ;
  - réponse : `payment_url`, vers laquelle on redirige ;
  - webhook `payment.succeeded` / `payment.failed` sur `/api/payments/notify`, signé
    `X-Mepaye-Signature: sha256=<HMAC-SHA256 du corps brut>` avec le secret `whsec_…`
    (valeur complète), comparé à temps constant ;
  - contrôle du montant et de la devise reçus ;
  - clés `mp_test_…` et `mp_live_…` : une clé de test **n'ouvre jamais** la vente réelle, et
    un événement de test est ignoré avec une clé réelle (et inversement) ;
  - pas d'API de lecture d'état : seul le webhook fait foi.
- **Guider l'utilisateur :**
  - la page des clés est `https://mepaye.com/app/developpeur` (absente du menu) ;
  - **Webhooks** : URL `https://<projet>.vercel.app/api/payments/notify`, les deux
    événements, secret dans Vercel ;
  - **clé** (Live si l'utilisateur ne veut pas de test) : nom affiché = la marque, « Lien
    de ton site » = `https://www.<domaine>/commande/confirmation`. Ce lien doit avoir la
    même origine que le site, à cause du localStorage.
- **Attention :** un webhook Mepaye ne se modifie pas, et en recréer un change le secret.
  Garder l'adresse `vercel.app`, et **ne jamais rediriger** ce domaine dans Vercel.
- **Vérification sans risque**, une fois en ligne :
  - une notification non signée doit recevoir **400** ;
  - une notification signée avec le secret, pour un paiement inexistant, doit recevoir
    **200 `{"received":true}`**, sans toucher aucune commande.
- **Terminé quand :** les deux vérifications passent en production.

### Étape 8 — Vercel et Upstash
- **Mettre en place :**
  - `vercel.json` (`"buildCommand": "npm run build:vercel"`) ;
  - `scripts/vercel-output.mjs` (Build Output API), qui produit :
    - le site en statique ;
    - une fonction `api.func` (Node 22, `maxDuration` 60) qui sert `/api/*` ;
    - le renvoi de toutes les autres adresses vers `index.html` ;
    - une tâche planifiée quotidienne `/api/cron/sync` (maximum de l'offre Hobby).
  - dépendances incluses dans le bundle (`ssr.noExternal`). Tester la fonction hors du
    projet, sans `node_modules`.
- **Guider l'utilisateur :**
  1. **Storage → Upstash for Redis** :
     - région **Frankfurt** ;
     - **Eviction désactivée** ;
     - offre Free ;
     - reliée au projet. Vercel ajoute `KV_REST_API_URL` et `KV_REST_API_TOKEN`.
  2. Projet → **Settings → Functions → Function Region : Frankfurt (fra1)**. Dans les
     réglages du projet, pas ceux de l'équipe.
  3. **Environment Variables**, Production uniquement :
     - en type **Secret** : `CJ_API_KEY`, `MEPAYE_API_KEY`, `MEPAYE_WEBHOOK_SECRET`,
       `SMTP_PASSWORD`, `CRON_SECRET`, `ADMIN_TOKEN` ;
     - en type **Config** : `CJ_IOSS_TYPE=3`, `CJ_PAY_TYPE=2`, `CJ_FROM_COUNTRY`,
       `SMTP_HOST`, `SMTP_PORT=465`, `SMTP_USER`, `PUBLIC_URL`.

     Une variable `PUBLIC_…` doit obligatoirement être de type Config. `SHOP_MODE` reste
     vide, ce qui donne le mode réel.
  4. Après l'ajout de variables, **ne pas cliquer sur « Redeploy »** : c'est le push qui
     déploie.
  5. Conseiller de désactiver « Improve models with my data » dans les réglages de l'équipe.
- **Vérifier** :
  - le déploiement, par l'API GitHub (`/repos/<owner>/<repo>/deployments`, puis
    `statuses_url`) ;
  - `curl https://…/api/shop`, qui doit répondre en JSON avec `saleOpen` et
    `closedReason` ;
  - `/api/cron/sync` et `/api/admin/orders`, avec leurs secrets.
- **Terminé quand :** l'API répond en production, et la seule raison de fermeture de la
  vente est celle attendue.

### Étape 9 — Domaine et e-mail (LWS)
- **Vercel → Domains → Add** le domaine. Vercel prend `www` comme adresse principale et
  redirige le domaine nu en 308. Lire les valeurs exactes qu'il affiche.
- **LWS → Gestion du domaine → Zone DNS**, pas « Serveurs DNS » :
  - **A `@`** → l'IP donnée par Vercel. LWS supprime alors l'IPv6 de lui-même ;
  - **CNAME `www`** → la cible donnée par Vercel (`<hash>.vercel-dns-0xx.com.`) ;
  - **ne pas toucher** à MX, A `mail`, TXT (SPF, DKIM, DMARC), ni aux CNAME `imap`, `pop`,
    `smtp`.
- Revenir dans Vercel et cliquer sur **Refresh** : le domaine passe au vert. Vérifier avec
  `curl` et une résolution DNS (MX toujours en place).
- **SMTP :** le certificat de `mail.<domaine>` ne correspond pas. Trouver le vrai serveur en
  affichant le certificat avec un petit script `node:tls` (port 465), par exemple
  `mailNN.lwspanel.com` avec un certificat `*.lwspanel.com`. La règle SPF impose d'envoyer
  par ce serveur.
- `PUBLIC_URL=https://www.<domaine>` (type Config), et `contactEmail` dans la
  configuration du site.
- **Terminé quand :** le site répond en HTTPS sur le domaine, et la messagerie fonctionne
  toujours.

### Étape 10 — E-mails aux clients
- **Mettre en place** (`server/notify.ts`) :
  - **confirmation de commande** : récapitulatif, adresse, délai, rappel de la rétractation,
    liens vers `/suivi`, la page des retours et les CGV ;
  - **avis d'expédition** : transporteur et numéro de suivi ;
  - envoi par le SMTP LWS (port 465), avec délais d'attente courts pour ne pas bloquer le
    paiement ;
  - réponses adressées à `contact@` ;
  - échappement de tout ce que le client a saisi.
- **Terminé quand :** les tests passent et les variables `SMTP_*` sont dans Vercel.

### Étape 11 — Ouverture
- **Liste de contrôle :**
  - prix et délai ;
  - `contactEmail` ;
  - pages légales en ligne ;
  - Redis ;
  - clé Mepaye live et secret ;
  - boutique Mepaye en EUR ;
  - lien de retour de la clé ;
  - variables CJ ;
  - **solde CJ approvisionné** ;
  - SMTP ;
  - domaine.
- Demander l'accord pour pousser, en précisant que **la vente s'ouvre**. Vérifier
  `saleOpen: true`, puis contrôler le site comme un visiteur :
  - bouton d'ajout au panier actif ;
  - aucune pastille de démo ni mention « bientôt » ;
  - pages légales complètes ;
  - contact dans le pied de page.
- L'utilisateur passe **la première commande lui-même** et vérifie :
  - la page Mepaye en euros ;
  - le retour sur la confirmation, avec le numéro ;
  - l'e-mail reçu (regarder les spams) ;
  - la vente dans le wallet Mepaye ;
  - la commande partie chez CJ ;
  - la livraison.
- **Terminé quand :** cette première commande est livrée.

### Étape 12 — Après le lancement
- **Commande en erreur** (solde CJ insuffisant, refus de CJ) : elle reste « confirmée » pour
  le client. La relancer avec
  `curl -X POST -H "Authorization: Bearer $ADMIN_TOKEN" https://www.<domaine>/api/admin/orders/<n°>/fulfill`.
- **Toutes les commandes :** `GET /api/admin/orders`, avec le même en-tête.
- Garder le solde CJ approvisionné **avant** toute publicité.
- Ajuster le délai annoncé d'après les vraies livraisons.
- Compléter l'identité légale dès que l'activité est déclarée.

---

## 5. Pièges fréquents

| Piège | Parade |
| --- | --- |
| Vercel ne sert que le site statique : API en 404, boutique « indisponible » | Build Output API (étape 8) |
| Commandes perdues sur Vercel | Upstash Redis ; sans base, la vente reste fermée |
| Paiement notifié deux fois, ou par deux instances | compare-and-set Redis, fonctions rejouables |
| CJ refuse la France | `CJ_IOSS_TYPE` non réglé |
| Coût réel CJ supérieur à l'estimation | commandes de test sandbox avant de fixer les prix |
| Fiche CJ et photos qui se contredisent | afficher la version prudente, faire vérifier sur un exemplaire |
| Image IA qui ne montre pas le vrai produit | le signaler, laisser l'utilisateur décider |
| Produit coupé dans les cadres | `contain` et fond flou ; jamais de collage |
| Paiements refusés (`currency_mismatch`) | boutique Mepaye réglée sur la devise du site |
| Clé de test en production | la vente ne s'ouvre qu'avec une clé `mp_live_` |
| Notifications perdues après l'ajout du domaine | webhook laissé sur `vercel.app`, jamais redirigé |
| Client qui ne retrouve pas sa commande au retour | « Lien de ton site » sur la même origine que le site (`www`) |
| Messagerie cassée en branchant le domaine | ne modifier que A `@` et CNAME `www` dans la Zone DNS |
| Certificat SMTP invalide | vrai nom du serveur LWS, pas `mail.<domaine>` |
| Variable `PUBLIC_URL` refusée en Secret | type Config |
| `nodemailer` ancien et vulnérable | version ≥ 10.1, vérifier avec `npm audit` |
| Index Git modifié par erreur (`git rm`) | `git restore --staged` |
| Capture d'écran vide en headless | `clip` prend des coordonnées de page : capturer l'écran entier, puis recadrer |
| Session interrompue en plein travail | relire `git status`, ce qui est indexé et `git log` avant de reprendre |

## 6. Ce qu'on livre à la fin

- La boutique en production sur `https://www.<domaine>`, vente ouverte.
- Un README : parcours, configuration CJ, Mepaye, Vercel et domaine, administration des
  commandes, reste à faire.
- `.env.example` avec toutes les variables commentées, sans aucune valeur secrète.
- Des tests pour chaque intégration, avec de faux services.
- La liste des décisions de l'utilisateur, et de celles prises en son nom à faire valider.
