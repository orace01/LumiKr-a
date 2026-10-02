# Lumikréa — boutique mono-produit

Landing page du tableau lumineux à dessiner (plaque acrylique effaçable, base LED, USB).
Maquette fonctionnelle : la vente en ligne n'est pas raccordée.

## Démarrer

```bash
npm install
npm run dev       # serveur de développement
npm run lint      # oxlint
npm run build     # vérification TypeScript + build de production dans dist/
npm run preview   # sert le build de production
```

Stack : Vite, React 19, TypeScript, CSS natif (un fichier par composant, jetons dans
`src/styles/global.css`). Polices auto-hébergées via `@fontsource-variable` (Fredoka, Figtree).

## Où modifier quoi

| Besoin | Fichier |
| --- | --- |
| Nom de marque, slogan, navigation, liens légaux, contact | `src/config/site.ts` |
| Formats, prix, contenu de la boîte, caractéristiques, lien de commande | `src/config/product.ts` |
| Questions fréquentes | `src/config/faq.ts` |
| Couleurs, typographie, espacements | `src/styles/global.css` |

Le nom de marque et la description sont injectés dans `index.html` par `vite.config.ts` :
ils ne sont définis qu'une fois.

### Informations « À confirmer »

Dans `product.ts`, chaque information porte un champ `verified`. Tant qu'il vaut `false`,
la page affiche une pastille « À confirmer » au lieu de présenter l'information comme
acquise. Il suffit de renseigner `value` et de passer `verified` à `true`.

Le bouton de commande reste désactivé tant que `product.checkout.url` est `null` ou que
le prix du format choisi n'est pas renseigné. Aucun panier ni paiement n'est simulé.

## Médias

Les originaux fournisseur restent intacts à la racine (`d05cda3e….mp4`) et dans
`CJYD2333071/`. Les fichiers utilisés par le site sont générés dans `src/assets/media/` :

```bash
npm run media     # nécessite ffmpeg (libx264, libwebp)
```

Le script `scripts/build-media.sh` :

- recadre la vidéo au-dessus de la bande de sous-titres anglais incrustés, supprime l'audio,
  écarte le gros plan flou des feutres et fond la fin sur le début pour une boucle sans saut ;
- produit la vidéo du hero (1920 × 864, un seul fichier pour tous les écrans) et son poster ;
- extrait trois images fixes de la vidéo ;
- recadre les photos fournisseur sur le tableau seul : quatre photos pour le hero, une vignette
  par format, les feutres, le packshot et une scène d'ambiance. Les bandeaux et cotes en
  anglais, les personnes de banque d'images et les textes religieux restent hors cadre.

### Animations au défilement

Le rythme des sections reprend celui du site de référence numa.uprock.pro. Tout repose sur
`position: sticky` et sur une variable CSS `--p` (avancement de 0 à 1) écrite par le hook
`useScrollProgress` ; la chorégraphie elle-même est en CSS, dans le fichier de chaque composant.

| Section | Effet | Fichiers |
| --- | --- | --- |
| Hero | La vidéo plein écran reste épinglée, se referme en pastille, puis les photos des quatre formats surgissent autour | `Hero.tsx`, `Hero.css` |
| Début de page sur téléphone | Pas de vidéo (elle n'est pas téléchargée) : sous le titre, les photos des quatre formats défilent du doigt, puis les boutons | `FormatCarousel.tsx`, `Intro.css`, `useIsMobile.ts` |
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
- Rédiger les pages légales (mentions, CGV, confidentialité, livraison et retours) pour le
  marché visé, puis renseigner leurs liens dans `site.ts`.
- Raccorder la commande (`product.checkout.url`), les secrets restant côté serveur.
- Passer `og:image` en URL absolue et ajouter les données structurées produit une fois le
  domaine et les prix connus.
