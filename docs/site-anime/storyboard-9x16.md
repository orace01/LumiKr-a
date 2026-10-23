---
titre: "Lumikréa — storyboard du site animé, v3 (9:16)"
statut: "brouillon — à valider par l'utilisateur avant la déclinaison 16:9 et les prompts de clips"
date: "2026-10-20"
remplace: "architecture v2 (passation.html, échange 5)"
methode: "~/vibe-brain/prompts/concevoir-un-site-anime.md"
---

# Lumikréa — storyboard du site animé, v3 (9:16)

« **La lumière qui fait le tour de la maison.** » Un seul trait doré, parti de la tablette de Léo, traverse toute la maison : il allume le rituel du couloir, rejoint la tablette de sa sœur, descend l'escalier jusqu'à celle du parent, puis sort par la baie vitrée et entre dans une autre maison, où un enfant s'endort. Une tablette par pièce, la même lumière partout.

**Fil conducteur (focus de toutes les transitions)** : le fil lumineux jaune qui voyage. Fin, jaune fluorescent qui brille en or, granuleux, halo doux ; il est présent et net dans chaque image clé et c'est lui que la caméra suit d'une image à l'autre (tableau détaillé en tête de `prompts.md`).

## Décisions du 2026-10-20

| Sujet | Décision de l'utilisateur | Effet sur le storyboard |
|---|---|---|
| Socle | **Bois clair** | Bible produit calée sur la paire 1 et la version 9:16 de la paire 8 |
| Couleur du fil | **Lumière dorée** partout, comme dans les paires | Plus de changement de couleur chez la sœur |
| Parent | **Un vrai passage** | +2 images clés : la rampe d'escalier (portail) et le salon (concret) |
| Longueur | **Fusion** de l'extérieur et de la vitre de la maison B | Une seule image « nuit entre deux maisons » ; la vitre B se franchit pendant le clip |
| Tablettes | **Une seule par pièce** | Léo, couloir, sœur, salon, maison B : 5 tablettes, toutes immobiles |

Rappels de direction artistique (storyboard v3 de l'utilisateur) : **aucun visage, aucune tête, aucune silhouette**. Seuls des mains et des avant-bras apparaissent. Aucun texte ni logo dans les images ; les mots s'écrivent en SVG au scroll (L-11).

## Bible produit (identique dans toutes les images)

- **Plaque** : acrylique transparent et poli, environ 8 mm d'épaisseur, format paysage (environ 30 × 21 cm), angles droits à arêtes vives, posée **verticalement** dans la rainure du socle. Le chant s'illumine en or sur tout son pourtour.
- **Socle** : barre de **hêtre clair massif**, section rectangulaire (environ 3,5 cm de haut, 4 cm de profondeur), un peu plus longue que la plaque, bois mat à fil visible, arêtes légèrement adoucies. **Aucun marquage.**
- **LED** : une rangée de points lumineux visibles dans la rainure, lumière **dorée** (environ 2200 à 2400 K), qui se reflète sur la table.
- **Câble** : fin câble blanc qui sort de l'arrière du socle (assumé, la tablette est branchée).
- **Feutre** : corps blanc, capuchon et pointe jaunes.
- **Trait** : jaune fluorescent qui brille en **or**, texture légèrement granuleuse, halo doux ; fines poussières dorées dans l'acrylique (paire 1).

## Ambiance commune (tirée des paires)

Nuit bleu profond, murs bleu nuit, bois chaud couleur miel, lampes champignon, plantes, pulls en maille beige, textiles étoilés, lapin en peluche, cadres lune et étoiles, profondeur de champ douce. La tablette est la source de lumière principale.

- **Matériau-pont** : le même parquet et le même bois chêne miel dans toute la maison A.
- **Lumière-pont** : or de la tablette (2200 à 2400 K) contre bleu nuit de l'extérieur (environ 7000 K).
- **Les personnages, par leurs manches** : Léo, maille beige épaisse ; sa sœur, maille crème à petites étoiles ; le parent, pull gris anthracite ; l'enfant de la maison B, pyjama bleu étoilé.

## C1. Carte spatiale

```text
MAISON A (étage)                                      MAISON A (rez-de-chaussée)
┌── CHAMBRE DE LÉO ──┐   COULOIR    ┌── CHAMBRE SŒUR ──┐
│ bureau  K1 K2 K3   │──K4──K5 K6──►│ bureau  K7        │
└────────────────────┘   commode    └────────┬──────────┘
                                             │ porte → rampe d'escalier K8
                                             ▼
                                   ┌──────── SALON ─────────┐
                                   │ table basse K9          │
                                   │ baie vitrée K10 ────────┼──► DEHORS K11 ──► MAISON B
                                   └─────────────────────────┘                  chevet K12
Trajectoire : descend toujours (étage → rez-de-chaussée → rue), avance toujours, ne revient jamais.
```

## C2. Chaîne des images clés

Alternance respectée : aucun clip ne relie deux images concrètes (C). Douze images clés, onze clips, trois paliers.

| K | Type | Lieu | Contenu | Élément qui contient K+1 | Clip vers K+1 : mouvement et pivot | Palier |
|---|---|---|---|---|---|---|
| **K1** | C macro | Chambre de Léo | Pointe du feutre qui trace le dernier rayon d'un soleil doré | Le chant lumineux, flou, vertical au bord droit | Travelling latéral vers la droite en suivant le trait jusqu'au chant | — |
| **K2** | P | idem | Le chant poli plein cadre, vertical, et la rangée de LED sur le hêtre (paire 1) | La rangée de LED, horizontale à y = 62 % | Recul, montée et plongée ; la rangée de LED devient le bas de la plaque de K3, à la même hauteur | — |
| **K3** | C large | idem | Plongée sur le bureau : soleil et voilier dorés, mains de Léo, pot de feutres, éléphant en bois, livre étoilé | Le câble blanc qui file vers le bas du cadre | Le trait quitte le bord de la plaque, glisse le long du câble jusqu'au sol ; la caméra plonge au ras du parquet | — |
| **K4** | P | Couloir | Au ras du parquet, le fil doré court entre les lames, droit vers le haut du cadre (la rivière d'EverSwap) | Le pied de la commode, flou, au point de fuite | Avancée le long du fil ; il remonte le pied de la commode ; la caméra se relève | — |
| **K5** | C palier | Couloir | Commode : tablette du rituel (croissant seul), pyjama étoilé plié, gobelet et brosse à dents, lapin, livre ; porte entrouverte de la sœur au fond | Le croissant, aligné devant la porte de la sœur | Palier fixe : « Dents ✓ Pyjama ✓ Histoire ✓ » en SVG, puis poussée vers le croissant | **1** — chapitre bleu |
| **K6** | P | idem | Macro de l'arc doré du croissant ; derrière, à travers l'acrylique, la porte de la sœur floue | L'entrebâillement de la porte | Bascule de mise au point du croissant vers la porte, passage du seuil | — |
| **K7** | C | Chambre de la sœur | Sa tablette sur son bureau ; elle termine une fleur ; le fil doré arrive par le haut et rejoint la pointe de son feutre ; au fond, la porte ouverte sur la rampe d'escalier éclairée | La rampe d'escalier, au fond à droite | Le fil repart de la fleur vers la porte ; la caméra le suit jusqu'à la main courante | — |
| **K8** | P | Escalier | Macro de la main courante en bois ; le fil doré glisse vers le bas ; en contrebas, le bokeh chaud du salon | Le bokeh du salon, en bas du cadre | Descente le long de la rampe ; pivot de −35° ; le salon se révèle | — |
| **K9** | C palier | Salon | Le parent termine la dernière volute d'un mandala sur sa tablette, posée sur la table basse ; lampe sur pied, bibliothèque, baie vitrée bleu nuit derrière (paire 4) | La baie vitrée, en haut du cadre | Palier fixe (phrase HTML pour le parent), puis le fil quitte le mandala vers la baie ; la caméra le suit jusqu'à la vitre | **2** — chapitre ambre |
| **K10** | P | Baie vitrée | Macro de la vitre froide traversée par le fil ; reflets chauds du salon, réverbères flous dehors | Les fenêtres chaudes floues au loin | Traversée de la vitre ; recul dans la nuit | — |
| **K11** | P | Dehors | « La nuit entre deux maisons » : vue à hauteur de toit, maisons en bokeh, seul l'arc doré est net, il plonge vers une fenêtre chaude à droite | La fenêtre chaude de la maison B | Le fil plonge vers la fenêtre ; la caméra le suit, **franchit la vitre embuée** (seuil) et glisse jusqu'au chevet | — |
| **K12** | C ancre | Chambre de la maison B | Chevet : tablette au trait vide, zone « Bonne nuit » libre, main endormie qui a lâché le feutre ; mur bleu nuit ; bas du cadre calme pour le CTA | — | Palier fixe : « Bonne nuit » en SVG, puis **rideau** HTML vers l'offre (L-07) | **3** — chapitre or doux |

## C3. Fiches des images clés (9:16, positions en % du cadre : x depuis la gauche, y depuis le haut)

| K | Optique | Grille | Jonction avec la voisine | Interdits propres |
|---|---|---|---|---|
| K1 | Macro 100 mm, 6 cm de la plaque, 25° hors de son plan, profondeur de champ d'environ 2 mm | Contact pointe-acrylique en (50 %, 42 %), feutre entrant par le bas à droite, soleil presque fini à gauche ; chant flou vertical à x = 88 % | Le chant à x = 88 % devient le chant centré de K2 | Pas de visage, pas de second dessin |
| K2 | Macro 100 mm au ras de la plaque, axe parallèle à elle | Chant vertical à x = 50 % sur toute la hauteur, rangée de LED horizontale à y = 62 %, hêtre clair sous les LED, reflet doré en bas | LED à y = 62 % = bas de la plaque dans K3 | Aucun élément de la pièce reconnaissable |
| K3 | 35 mm, caméra à 1,7 m, derrière Léo à gauche, plongée de 60° | Tablette centrée en (55 %, 48 %), bas de la plaque à y = 62 % ; câble vers le coin bas gauche | Le câble au coin bas gauche mène au sol de K4 | Aucune tête : on voit les mains et les manches seulement |
| K4 | 24 mm à 3 cm du parquet | Fil vertical du bas centre vers le point de fuite (50 %, 28 %), plinthes sombres de chaque côté, pied de commode flou au point de fuite | Le pied de commode à x = 50 % est celui de K5 | Pas de tablette dans le cadre |
| K5 | 35 mm, caméra à 1,0 m (hauteur d'enfant), face à la commode | Tablette en (45 %, 46 %), croissant en haut à droite de la plaque, **reste de la plaque vide** ; pyjama en (25 %, 76 %), lapin en (85 %, 58 %), livre en (78 %, 80 %) ; porte entrouverte en (45 %, 22 %), alignée derrière le croissant ; rampe à droite | Le croissant devant la porte = K6 | Aucune lettre, aucune coche dans l'image |
| K6 | Macro 100 mm sur le croissant | Arc doré centré en (50 %, 45 %), porte floue derrière, alignée | La porte floue devient la chambre de K7 | — |
| K7 | 50 mm, trois quarts face au bureau, à hauteur de la plaque | Tablette en (50 %, 52 %), fleur presque finie, pointe du feutre en (60 %, 58 %) ; le fil doré entre par le haut à gauche ; porte ouverte au fond en (78 %, 20 %), rampe éclairée visible | La rampe au fond = K8 | Pas de visage ; la sœur n'est que sa main et sa manche |
| K8 | Macro 85 mm, caméra au-dessus de la rampe, plongée de 35° | Main courante en diagonale du haut gauche au bas droit, fil doré dessus ; bokeh chaud du salon de y = 70 % à 100 % | Le bokeh devient le salon de K9 | Pas de marche nette ni de personnage |
| K9 | 35 mm, caméra à 0,9 m, trois quarts | Tablette du parent en (42 %, 58 %), mandala presque fini, pointe en (55 %, 62 %), main adulte et manche anthracite à droite ; lampe sur pied à gauche ; baie vitrée bleu nuit de y = 5 % à 40 % | La baie en haut du cadre = K10 | Pas de visage, pas de silhouette dans la vitre |
| K10 | Macro 100 mm sur la vitre | Fil en diagonale du bas gauche au haut droit ; reflets chauds à gauche, réverbères et fenêtres floues à droite, légère buée aux bords | Les fenêtres floues = K11 | Pas de reflet de personne |
| K11 | 24 mm, à hauteur de toit, profondeur de champ très courte | Maison A en bokeh à gauche (x de 0 à 35 %), maison B en bokeh à droite (x de 60 à 100 %), sommet de l'arc doré net à y = 15 %, il plonge vers une fenêtre chaude en (78 %, 62 %) | La fenêtre chaude = la chambre de K12 | Pas de détail de façade net : c'est un portail |
| K12 | 35 mm, caméra à 0,7 m, au ras du chevet | Tablette en (40 %, 50 %), plaque vide sauf un petit croissant en haut à droite ; main endormie et feutre posé en (62 %, 66 %) ; lit et lapin flous à droite ; **zone CTA de y = 75 % à 95 %**, bois sombre et calme ; mur bleu nuit en haut | Couleur du bas du cadre = fond de la section suivante du site | Aucun texte, aucun logo sur le socle |

## C4. Fiches des clips (à transformer en prompts après validation)

| Clip | Mouvement | Durée indicative | Ne doit pas |
|---|---|---|---|
| K1→K2 | Travelling latéral droit, lent puis rapide | 3 s | Plier la plaque, prolonger le trait dans le vide avant le bord |
| K2→K3 | Recul + grue montante + plongée de 0 à −60° | 4 s | Changer la forme du socle |
| K3→K4 | Descente en arc au ras du câble, puis du parquet | 4 s | Montrer le visage de Léo |
| K4→K5 | Avancée rasante, la caméra se relève devant la commode | 3 s | Faire apparaître des objets en plus |
| K5→K5 | Palier : caméra fixe, seules les LED respirent | 2 s | Écrire des lettres |
| K5→K6 | Poussée vers le croissant | 2 s | — |
| K6→K7 | Bascule de mise au point, passage du seuil | 3 s | Déformer la porte |
| K7→K8 | Suivi du fil jusqu'à la rampe | 3 s | Montrer la sœur entière |
| K8→K9 | Descente le long de la rampe, pivot de −35° | 4 s | Faire voir un escalier net |
| K9→K9 | Palier : caméra fixe | 2 s | — |
| K9→K10 | Suivi du fil vers la baie | 3 s | Silhouette dans la vitre |
| K10→K11 | Traversée de la vitre, recul dans la nuit | 3 s | Façades nettes |
| K11→K12 | Plongée vers la fenêtre B, traversée de la vitre embuée, glissement au chevet | 4 s | Faire apparaître l'enfant entier |
| K12→K12 | Palier « Bonne nuit », puis rideau HTML | 2 s | — |

## C5. Paliers et phrases (à écrire depuis le ton de la marque, L-06)

| Palier | Écriture sur la plaque (SVG) | Phrase géante HTML (proposition) | Couleur du chapitre |
|---|---|---|---|
| 1 · K5 | « Dents ✓ » « Pyjama ✓ » « Histoire ✓ » | « Le soir devient un rituel. » | Bleu nuit |
| 2 · K9 | aucune | « Et un moment pour vous aussi. » | Ambre |
| 3 · K12 | « Bonne nuit » | « Une lumière par enfant. » | Or doux, qui devient le fond du site |

## Ce qui reste ouvert

1. Valider ce storyboard v3 (ordre des pièces, passage du parent après la sœur).
2. Les phrases de palier : propositions à confirmer avec `docs/00b-marque.md` (pas encore écrit).
3. La référence Poire / Constellation n'a toujours pas été reçue.
