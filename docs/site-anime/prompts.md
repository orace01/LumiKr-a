---
titre: "Lumikréa — prompts d'images des 12 keyframes (v3, 9:16)"
statut: "brouillon — prompts d'IMAGES seulement ; les prompts de clips viendront après validation des images"
date: "2026-10-20"
storyboard: "docs/site-anime/storyboard-9x16.md"
---

# Lumikréa — prompts d'images des keyframes (v3, 9:16)

## Le fil conducteur : le fil lumineux jaune qui voyage

C'est le **focus de toutes les transitions**. Le trait jaune doré né sur la tablette de Léo devient un fil de lumière qui ne s'éteint jamais : il est présent et **net dans chacune des 12 images**, et c'est lui que la caméra suit d'une image à l'autre. Toujours le même : fin (quelques millimètres), jaune fluorescent qui brille en or, texture légèrement granuleuse, halo doux. Jamais de ruban néon, d'étincelles, d'explosion de particules ni de flash plein écran.

| K | Où est le fil | Où il va (raccord) |
|---|---|---|
| K1 | C'est le trait lui-même, sous la pointe du feutre | Vers le chant, à droite |
| K2 | Il descend le long du chant poli | Vers la rangée de LED |
| K3 | Il quitte le bord bas de la plaque et longe le câble blanc | Vers le coin bas gauche, le sol |
| K4 | Il court entre les lames du parquet | Vers le pied de la commode |
| K5 | Il remonte le pied de la commode et touche la pointe du croissant | Vers la porte de la sœur |
| K6 | Il fait le tour de l'arc du croissant | Vers la porte floue |
| K7 | Il entre par le haut gauche et rejoint la pointe du feutre de la sœur | Vers la rampe, au fond |
| K8 | Il glisse sur la main courante | Vers le salon, en bas |
| K9 | Il arrive sur la pointe du feutre du parent | Vers la baie vitrée, en haut |
| K10 | Il traverse la vitre en diagonale | Vers les fenêtres de la rue |
| K11 | Il dessine un arc dans le ciel | Vers la fenêtre chaude de la maison B |
| K12 | Il arrive sur la plaque et se pose au bout du croissant | Fin du voyage : « Bonne nuit » |

## Mode d'emploi

1. **Un prompt par image clé**, dans l'ordre K1 → K12, en format **9:16** (par exemple 1536 × 2752).
2. **Toujours joindre la référence produit** : `Paires/1/Panneau lumineux doré sur socle en bois.png` (macro du socle) et `Paires/8/version_9_16_2K_20261016132139.jpg` (produit entier sur socle en bois).
3. **Joindre aussi la K précédente déjà validée**, pour garder la lumière, l'étalonnage, l'aspect du fil et la jonction (l'élément qui doit tomber au même endroit du cadre).
4. **Vérifier chaque image contre la bible** avant de passer à la suivante : socle en hêtre clair, angles droits, LED dorées, fil présent et net, aucun visage, aucun texte. Une image qui dévie se régénère ; on ne la corrige pas au clip.
5. Les prompts sont en anglais, car les modèles d'image le suivent mieux. Chaque prompt est complet : il se copie tel quel.
6. Noter le modèle, sa version et les ratés dans `docs/site-anime/journal-generation.md`.

## Avoir exactement la même séquence en 16:9

**Ne pas finir la vidéo en 9:16 puis demander un 16:9 à un autre outil** : un modèle qui refait une vidéo la régénère, et gestes, fil et produit dérivent. On décline **image par image, avant les clips** :

1. Valider l'image clé en 9:16 (par exemple K1).
2. **Juste après**, l'élargir en 16:9 par **extension latérale** (Photoshop « Développement génératif », extension de Nano Banana ou équivalent), avec le prompt « Extension 16:9 » placé sous son prompt. L'image 9:16 reste intacte au centre ; seuls les côtés sont inventés.
3. Vérifier que le produit, le fil et les raccords n'ont pas bougé, et que les côtés n'ajoutent aucun objet qui attire l'œil.
4. Passer à l'image suivante. À la fin : **12 paires identiques** au centre.
5. **Ensuite seulement, les clips** : les mêmes prompts de clip, une fois entre les images 9:16, une fois entre les images 16:9.

**Géométrie.** À hauteur égale, l'image 9:16 occupe la bande centrale du 16:9, de **34 % à 66 % de la largeur**. Une position x en 9:16 devient **34,2 % + x × 0,316** en 16:9 ; la hauteur y ne change pas. Le produit et le fil sont déjà dans cette bande dans toutes les compositions.

**Positions des raccords en 16:9** : chant x = 62 % (K1) puis 50 % (K2) ; LED y = 62 % (K2, K3) ; point de fuite (50 %, 28 %) (K4) ; croissant et porte à x = 48 % (K5, K6) ; porte et rampe à x = 59 % (K7) ; baie de y = 5 % à 40 % (K9) ; fenêtre chaude en (59 %, 62 %) (K11) ; en K12, la zone calme du bas (y de 75 % à 95 %) reste, et le côté droit devient la **colonne du CTA**.

**Solution de secours** si une extension échoue : poser le clip 9:16 au centre d'une toile 16:9, avec des côtés en décor flou ou étendu. Les images sont identiques au centre, mais les côtés restent presque fixes.

## K1 — L'étincelle (concret, macro)

Références : produit + `Paires/7/le_format_9_16_2K_20261016130054.jpg` (geste et feutre) + `Paires/5/image_20261015213148.jpg` (motif du soleil).

```text
Vertical 9:16 photorealistic extreme macro product photograph. A child's hand in a thick beige knit sleeve holds a white marker with a yellow cap; its yellow tip touches a clear acrylic plate at the exact point (50% across, 42% down) and draws the last ray of a small hand-drawn sun on the left side of the plate. The fresh stroke is the hero of the image: a thin fluorescent yellow line glowing gold, slightly grainy, with a soft bloom, and it continues a few centimeters toward the right as if about to travel; fine golden dust floats inside the acrylic. The marker enters from the lower right. On the far right edge of the frame, at 88% across, the plate's polished edge is a soft out-of-focus vertical golden line. Macro 100 mm lens, 6 cm from the plate, 25 degrees off its plane, about 2 mm depth of field.
PRODUCT (match the attached reference exactly): clear polished acrylic plate about 8 mm thick, sharp square corners, edge-lit in gold by a row of LED dots in a solid light beech-wood base.
STYLE: cozy night interior, deep midnight-blue background bokeh, warm honey-wood tones, the plate is the main light source (golden 2200–2400 K) against cool blue night, high-end tactile product photography, gentle film grain.
NEGATIVE: no face, no head, no second drawing, no text, no letters, no logo, no white or metal base, no rounded corners, no sparks, no neon ribbon.
```

**Extension 16:9 de K1**

*Méthode, à chaque image : 1) partir de l'image 9:16 **validée** de cette K, tout de suite après sa validation ; 2) l'élargir par extension latérale (Photoshop « Développement génératif », extension de Nano Banana ou équivalent) avec le prompt ci-dessous ; 3) vérifier que le fil, le produit et les raccords sont au même endroit ; 4) passer à la K suivante ; 5) les clips seulement quand les 12 paires sont faites, avec les mêmes prompts de clip en 9:16 puis en 16:9. L'image 9:16 ne couvre qu'un tiers de la largeur : le modèle invente les deux autres tiers, qui doivent rester calmes (prolongement du décor, sans nouvel objet important), et le produit comme le fil restent dans le tiers central d'origine.*

```text
Expand this exact, already validated 9:16 image to a 16:9 landscape frame of the same height by extending only the left and right sides (outpainting). Keep the original image unchanged, pixel for pixel, in the center (34% to 66% of the new width): it is the central third of the new frame, and you only invent the two outer thirds. The product, the drawings and the luminous yellow thread must stay exclusively inside the original central third, exactly where they are; never move, duplicate or redraw them in the extended sides. The only exception: where the thread already touches the edge of the original image, it may continue into the side in the same direction, with the same thickness and glow, unbroken, up to the new frame edge. Keep both extended sides calm: only the natural continuation of the existing setting (wall, wood, floor, fabric, bokeh), with no new important object, no new light source and nothing that draws the eye away from the center. Continue the same macro scene, focus plane, lighting, golden and midnight-blue color grade, very shallow depth of field and film grain. Left side: more of the clear acrylic plate with golden dust, fading into deep blue bokeh. Right side: the glowing vertical golden edge of the plate continues as it is, then soft warm and blue bokeh; the beige knit sleeve may continue at the lower right. The luminous yellow stroke stays exactly where it is. Do not add people, faces, text, logos, a second drawing or any new eye-catching object.
```

## K2 — La tranche (portail)

Références : produit, surtout `Paires/1/Panneau lumineux doré sur socle en bois.png` (c'est presque cette image) + K1.

```text
Vertical 9:16 abstract macro product photograph, no recognizable room. The polished edge of a clear acrylic plate, about 8 mm thick, runs as a glowing golden vertical band through the exact center of the frame (50% across), from top to bottom. A thin, sharp fluorescent yellow thread of light, glowing gold with a soft bloom, glides down inside this edge from the top and is about to reach the base. At 62% down, a horizontal row of glowing golden LED dots sits in the groove of a solid light beech-wood base with matte visible grain and slightly softened edges. Below, the LEDs, the edge and the thread reflect in a dark glossy surface. Macro 100 mm lens at the level of the plate, axis parallel to it, very shallow depth of field.
STYLE: deep midnight-blue to black background, warm gold light 2200–2400 K, precise luxury product macro, gentle film grain.
NEGATIVE: no room details, no furniture, no hands, no face, no text, no logo or marking on the wood, no white or metal base, no sparks.
```

**Extension 16:9 de K2**

*Méthode, à chaque image : 1) partir de l'image 9:16 **validée** de cette K, tout de suite après sa validation ; 2) l'élargir par extension latérale (Photoshop « Développement génératif », extension de Nano Banana ou équivalent) avec le prompt ci-dessous ; 3) vérifier que le fil, le produit et les raccords sont au même endroit ; 4) passer à la K suivante ; 5) les clips seulement quand les 12 paires sont faites, avec les mêmes prompts de clip en 9:16 puis en 16:9. L'image 9:16 ne couvre qu'un tiers de la largeur : le modèle invente les deux autres tiers, qui doivent rester calmes (prolongement du décor, sans nouvel objet important), et le produit comme le fil restent dans le tiers central d'origine.*

```text
Expand this exact, already validated 9:16 image to a 16:9 landscape frame of the same height by extending only the left and right sides (outpainting). Keep the original image unchanged, pixel for pixel, in the center (34% to 66% of the new width): it is the central third of the new frame, and you only invent the two outer thirds. The product, the drawings and the luminous yellow thread must stay exclusively inside the original central third, exactly where they are; never move, duplicate or redraw them in the extended sides. The only exception: where the thread already touches the edge of the original image, it may continue into the side in the same direction, with the same thickness and glow, unbroken, up to the new frame edge. Keep both extended sides calm: only the natural continuation of the existing setting (wall, wood, floor, fabric, bokeh), with no new important object, no new light source and nothing that draws the eye away from the center. Continue the same abstract macro, lighting, golden and midnight-blue color grade, depth of field and film grain. On both sides: the horizontal row of golden LED dots and the light beech-wood base continue straight at exactly 62% down, slightly out of focus as they recede; above them, dark clear acrylic and deep blue-black space; below, their golden reflection on the dark glossy surface. The vertical edge and the luminous yellow thread stay exactly where they are. No room details, no people, no text, no logos, no marking on the wood.
```

## K3 — L'éveil (concret, large)

Références : produit + `Paires/5/image_20261015213148.jpg` (plongée, bureau) + `Paires/6/image_20261016125828.jpg` (voilier) + K2.

```text
Vertical 9:16 photorealistic overhead shot of a child's desk at night, camera 1.7 m high behind the child on the left, looking down 60 degrees, 35 mm lens. The drawing tablet stands centered at (55% across, 48% down); the bottom edge of its plate, with the row of golden LED dots, sits exactly at 62% down. On the plate glow a hand-drawn sun and a small sailboat in fluorescent yellow that shines gold, grainy texture, soft bloom. From the lower left corner of the plate, a thin luminous yellow thread of light, glowing gold and sharp, leaves the plate, slides onto the thin white cable and follows it across the desk toward the lower left corner of the frame. Only the child's two hands and forearms in thick beige knit sleeves are visible: one steadies the base, the other holds the white marker with a yellow cap. On the honey-wood desk: a ceramic pot of markers, a small wooden elephant toy, a star-patterned blue book, a plant in the corner.
PRODUCT (match the attached references exactly): clear polished acrylic plate about 8 mm thick, landscape format, sharp square corners, standing vertically in a solid light beech-wood bar base with a visible row of golden LED dots, polished edges glowing gold, no marking on the base.
STYLE: cozy child's bedroom at night, deep midnight-blue shadows, warm honey wood, a distant mushroom lamp, the plate is the main light source (golden 2200–2400 K), photorealistic high-end lifestyle product photography, shallow depth of field, gentle film grain.
NEGATIVE: no face, no head, no hair, no silhouette, only hands and forearms; no text, no letters, no logo; no white or metal base; no rounded corners; no extra tablets; no sparks or neon ribbon.
```

**Extension 16:9 de K3**

*Méthode, à chaque image : 1) partir de l'image 9:16 **validée** de cette K, tout de suite après sa validation ; 2) l'élargir par extension latérale (Photoshop « Développement génératif », extension de Nano Banana ou équivalent) avec le prompt ci-dessous ; 3) vérifier que le fil, le produit et les raccords sont au même endroit ; 4) passer à la K suivante ; 5) les clips seulement quand les 12 paires sont faites, avec les mêmes prompts de clip en 9:16 puis en 16:9. L'image 9:16 ne couvre qu'un tiers de la largeur : le modèle invente les deux autres tiers, qui doivent rester calmes (prolongement du décor, sans nouvel objet important), et le produit comme le fil restent dans le tiers central d'origine.*

```text
Expand this exact, already validated 9:16 image to a 16:9 landscape frame of the same height by extending only the left and right sides (outpainting). Keep the original image unchanged, pixel for pixel, in the center (34% to 66% of the new width): it is the central third of the new frame, and you only invent the two outer thirds. The product, the drawings and the luminous yellow thread must stay exclusively inside the original central third, exactly where they are; never move, duplicate or redraw them in the extended sides. The only exception: where the thread already touches the edge of the original image, it may continue into the side in the same direction, with the same thickness and glow, unbroken, up to the new frame edge. Keep both extended sides calm: only the natural continuation of the existing setting (wall, wood, floor, fabric, bokeh), with no new important object, no new light source and nothing that draws the eye away from the center. Continue the same overhead perspective (60 degrees down), lighting, golden and midnight-blue color grade, depth of field and film grain. Wide shot: keep both sides especially calm, only the continuation of the desk. Left side: more plain honey-wood desk surface, the existing pot of markers and plant only if they are already cut by the original edge, softly out of focus, and the thin white cable with the luminous yellow thread continuing toward the lower left corner. Right side: the child's beige knit sleeve continues naturally, then the edge of the desk and the dark blue bedroom floor with a soft star-patterned rug. The tablet, the drawings and the thread stay exactly as they are. Do not add a head, hair, a face, a second tablet, text or logos.
```

## K4 — La rivière du parquet (portail)

Références : K3 (parquet, lumière et aspect du fil) ; la tablette n'est pas dans le cadre.

```text
Vertical 9:16 abstract low-angle photograph of a dark honey-oak parquet hallway floor at night, camera 3 cm above the floor, 24 mm lens. A thin, sharp, luminous yellow thread of light glowing gold runs straight up the frame in the groove between two floorboards, from the bottom center to a vanishing point at (50% across, 28% down), like a glowing river seen from above; its light grazes the wood grain on both sides. Dark baseboards frame it left and right. At the vanishing point, out of focus, the wooden leg of a dresser, where the thread is heading. Extremely shallow depth of field, everything beyond 30 cm is soft bokeh in deep midnight blue and warm gold.
STYLE: cozy night home, golden-yellow thread 2200–2400 K against cool blue darkness, cinematic macro photography, gentle film grain.
NEGATIVE: no tablet, no people, no feet, no text, no logo, no sparks, no particle explosion.
```

**Extension 16:9 de K4**

*Méthode, à chaque image : 1) partir de l'image 9:16 **validée** de cette K, tout de suite après sa validation ; 2) l'élargir par extension latérale (Photoshop « Développement génératif », extension de Nano Banana ou équivalent) avec le prompt ci-dessous ; 3) vérifier que le fil, le produit et les raccords sont au même endroit ; 4) passer à la K suivante ; 5) les clips seulement quand les 12 paires sont faites, avec les mêmes prompts de clip en 9:16 puis en 16:9. L'image 9:16 ne couvre qu'un tiers de la largeur : le modèle invente les deux autres tiers, qui doivent rester calmes (prolongement du décor, sans nouvel objet important), et le produit comme le fil restent dans le tiers central d'origine.*

```text
Expand this exact, already validated 9:16 image to a 16:9 landscape frame of the same height by extending only the left and right sides (outpainting). Keep the original image unchanged, pixel for pixel, in the center (34% to 66% of the new width): it is the central third of the new frame, and you only invent the two outer thirds. The product, the drawings and the luminous yellow thread must stay exclusively inside the original central third, exactly where they are; never move, duplicate or redraw them in the extended sides. The only exception: where the thread already touches the edge of the original image, it may continue into the side in the same direction, with the same thickness and glow, unbroken, up to the new frame edge. Keep both extended sides calm: only the natural continuation of the existing setting (wall, wood, floor, fabric, bokeh), with no new important object, no new light source and nothing that draws the eye away from the center. Continue the same floor-level perspective toward the same vanishing point, lighting, color grade, extremely shallow depth of field and film grain. On both sides: more honey-oak floorboards converging toward the vanishing point, then the dark baseboards and the bottom of the hallway walls in deep blue, all softly out of focus. The luminous yellow thread stays a single straight line in the center. No tablet, no people, no feet, no text, no logos.
```

## K5 — Le rituel (concret, palier 1)

Références : produit + `Paires/9/lumikrea-cadre-33-rituel-du-soir-9x16.png` (composition de la commode et du couloir) + K4.

```text
Vertical 9:16 photorealistic shot of a hallway dresser at night, camera at a child's eye height (1.0 m), facing the dresser, 35 mm lens. The drawing tablet stands at (45% across, 46% down). On its plate, ONLY a small glowing golden-yellow crescent moon is drawn in the upper right corner; the rest of the plate is completely blank and clear. A thin, sharp, luminous yellow thread of light glowing gold climbs the front of the dresser from below, crosses the top, rises along the plate's left edge and touches the lower tip of the crescent, making it shine brighter. Around the tablet on the honey-wood dresser top: folded navy star-patterned pajamas at the lower left (25%, 76%), a ceramic cup with a toothbrush, a soft beige plush bunny at the right (85%, 58%), a closed book at the lower right (78%, 80%), a plant in a cream vase on the left. Behind the tablet, at (45%, 22%), a bedroom door stands ajar on a warmly lit child's room, aligned exactly behind the crescent. On the right, the wooden banister of a staircase. A framed star print on the left wall. A thin white cable leaves the back of the base.
PRODUCT (match the attached references exactly): clear polished acrylic plate about 8 mm thick, landscape format, sharp square corners, standing vertically in a solid light beech-wood bar base with a visible row of golden LED dots, polished edges glowing gold, no marking on the base.
STYLE: cozy family hallway at night, deep midnight-blue walls, warm honey wood, the plate is the main light source (golden 2200–2400 K), photorealistic lifestyle product photography, shallow depth of field, gentle film grain.
NEGATIVE: no words, no letters, no checkmarks, no numbers on the plate or anywhere; no people, no face; no white or metal base; no rounded corners; no sparks.
```

**Extension 16:9 de K5**

*Méthode, à chaque image : 1) partir de l'image 9:16 **validée** de cette K, tout de suite après sa validation ; 2) l'élargir par extension latérale (Photoshop « Développement génératif », extension de Nano Banana ou équivalent) avec le prompt ci-dessous ; 3) vérifier que le fil, le produit et les raccords sont au même endroit ; 4) passer à la K suivante ; 5) les clips seulement quand les 12 paires sont faites, avec les mêmes prompts de clip en 9:16 puis en 16:9. L'image 9:16 ne couvre qu'un tiers de la largeur : le modèle invente les deux autres tiers, qui doivent rester calmes (prolongement du décor, sans nouvel objet important), et le produit comme le fil restent dans le tiers central d'origine.*

```text
Expand this exact, already validated 9:16 image to a 16:9 landscape frame of the same height by extending only the left and right sides (outpainting). Keep the original image unchanged, pixel for pixel, in the center (34% to 66% of the new width): it is the central third of the new frame, and you only invent the two outer thirds. The product, the drawings and the luminous yellow thread must stay exclusively inside the original central third, exactly where they are; never move, duplicate or redraw them in the extended sides. The only exception: where the thread already touches the edge of the original image, it may continue into the side in the same direction, with the same thickness and glow, unbroken, up to the new frame edge. Keep both extended sides calm: only the natural continuation of the existing setting (wall, wood, floor, fabric, bokeh), with no new important object, no new light source and nothing that draws the eye away from the center. Continue the same hallway, eye-level perspective, lighting, golden and midnight-blue color grade, depth of field and film grain. Wide shot: keep both sides especially calm, only the continuation of the dresser and the walls. Left side: the plain honey-wood dresser top continues, the existing plant and star print only if already cut by the original edge, then the deep blue hallway wall in soft shadow. Right side: the staircase banister continues and descends, with a soft warm glow coming from downstairs, then the dark hallway. The tablet, its blank plate with only the crescent, the luminous yellow thread, the pajamas, the bunny and the ajar door stay exactly as they are. No words, letters or checkmarks, no people, no faces, no second tablet, no logos.
```

## K6 — Le croissant (portail)

Références : K5.

```text
Vertical 9:16 abstract macro photograph. The glowing crescent moon drawn on a clear acrylic plate fills the center of the frame at (50% across, 45% down), its fluorescent yellow stroke shining gold, grainy, softly blooming, fine golden dust in the acrylic. A thin, sharp, brighter yellow thread of light runs along the curve of the crescent from its lower tip to its upper tip and points beyond it, toward the background. Through the transparent plate, far behind and completely out of focus, the dark gap of a bedroom door standing ajar with warm light inside, aligned behind the crescent. Macro 100 mm lens, very shallow depth of field.
STYLE: deep midnight blue and warm gold 2200–2400 K, dreamlike luxury product macro, gentle film grain.
NEGATIVE: no text, no letters, no people, no face, no logo, no extra drawings, no sparks.
```

**Extension 16:9 de K6**

*Méthode, à chaque image : 1) partir de l'image 9:16 **validée** de cette K, tout de suite après sa validation ; 2) l'élargir par extension latérale (Photoshop « Développement génératif », extension de Nano Banana ou équivalent) avec le prompt ci-dessous ; 3) vérifier que le fil, le produit et les raccords sont au même endroit ; 4) passer à la K suivante ; 5) les clips seulement quand les 12 paires sont faites, avec les mêmes prompts de clip en 9:16 puis en 16:9. L'image 9:16 ne couvre qu'un tiers de la largeur : le modèle invente les deux autres tiers, qui doivent rester calmes (prolongement du décor, sans nouvel objet important), et le produit comme le fil restent dans le tiers central d'origine.*

```text
Expand this exact, already validated 9:16 image to a 16:9 landscape frame of the same height by extending only the left and right sides (outpainting). Keep the original image unchanged, pixel for pixel, in the center (34% to 66% of the new width): it is the central third of the new frame, and you only invent the two outer thirds. The product, the drawings and the luminous yellow thread must stay exclusively inside the original central third, exactly where they are; never move, duplicate or redraw them in the extended sides. The only exception: where the thread already touches the edge of the original image, it may continue into the side in the same direction, with the same thickness and glow, unbroken, up to the new frame edge. Keep both extended sides calm: only the natural continuation of the existing setting (wall, wood, floor, fabric, bokeh), with no new important object, no new light source and nothing that draws the eye away from the center. Continue the same abstract macro, lighting, color grade, very shallow depth of field and film grain. On both sides: more clear acrylic with fine golden dust, and behind it the blurred dark hallway in deep blue with a few warm bokeh dots. The crescent, the luminous yellow thread and the blurred door stay exactly as they are. No text, no people, no extra drawings, no logos.
```

## K7 — La chambre de la sœur (concret)

Références : produit + `Paires/7/le_format_9_16_2K_20261016130054.jpg` (fleur et geste) + K6.

```text
Vertical 9:16 photorealistic three-quarter shot of a girl's bedroom desk at night, camera at the height of the plate, 50 mm lens. The drawing tablet stands at (50% across, 52% down). A child's hand in a cream knit sleeve with tiny stars holds the white marker with a yellow cap; its tip, at (60%, 58%), finishes the last petal of a simple flower glowing fluorescent yellow and gold. A thin, sharp, luminous yellow thread of light glowing gold enters the frame from the upper left, crosses the air above the desk and arrives exactly at the marker tip, merging into the stroke. In the background, out of focus, the bedroom door stands open at (78%, 20%) onto a softly lit wooden staircase banister. Honey-wood desk, a mushroom lamp, a plant, star-patterned fabrics, a moon-and-stars frame on the deep blue wall.
PRODUCT (match the attached references exactly): clear polished acrylic plate about 8 mm thick, landscape format, sharp square corners, standing vertically in a solid light beech-wood bar base with a visible row of golden LED dots, polished edges glowing gold, thin white cable, no marking on the base.
STYLE: cozy child's bedroom at night, deep midnight-blue shadows, warm honey wood, the plate is the main light source (golden 2200–2400 K), photorealistic high-end lifestyle product photography, shallow depth of field, gentle film grain.
NEGATIVE: no face, no head, no hair, no silhouette, only one hand and forearm; no text, no letters, no logo; no strokes in any color other than golden yellow; no white or metal base; no rounded corners; no sparks.
```

**Extension 16:9 de K7**

*Méthode, à chaque image : 1) partir de l'image 9:16 **validée** de cette K, tout de suite après sa validation ; 2) l'élargir par extension latérale (Photoshop « Développement génératif », extension de Nano Banana ou équivalent) avec le prompt ci-dessous ; 3) vérifier que le fil, le produit et les raccords sont au même endroit ; 4) passer à la K suivante ; 5) les clips seulement quand les 12 paires sont faites, avec les mêmes prompts de clip en 9:16 puis en 16:9. L'image 9:16 ne couvre qu'un tiers de la largeur : le modèle invente les deux autres tiers, qui doivent rester calmes (prolongement du décor, sans nouvel objet important), et le produit comme le fil restent dans le tiers central d'origine.*

```text
Expand this exact, already validated 9:16 image to a 16:9 landscape frame of the same height by extending only the left and right sides (outpainting). Keep the original image unchanged, pixel for pixel, in the center (34% to 66% of the new width): it is the central third of the new frame, and you only invent the two outer thirds. The product, the drawings and the luminous yellow thread must stay exclusively inside the original central third, exactly where they are; never move, duplicate or redraw them in the extended sides. The only exception: where the thread already touches the edge of the original image, it may continue into the side in the same direction, with the same thickness and glow, unbroken, up to the new frame edge. Keep both extended sides calm: only the natural continuation of the existing setting (wall, wood, floor, fabric, bokeh), with no new important object, no new light source and nothing that draws the eye away from the center. Continue the same girl's bedroom, three-quarter perspective, lighting, golden and midnight-blue color grade, depth of field and film grain. Left side: the honey-wood desk continues with a mushroom lamp and a plant, a moon-and-stars frame on the deep blue wall; the luminous yellow thread enters from the upper left edge of the new frame and continues unbroken to where it already is. Right side: the cream knit sleeve with tiny stars continues naturally, then the softly lit open doorway and the staircase banister, out of focus. The tablet, the flower and the thread stay exactly as they are. No face, head or hair, no second tablet, no text, no logos.
```

## K8 — La rampe (portail)

Références : K7 (bois, lumière et aspect du fil).

```text
Vertical 9:16 abstract macro photograph looking down a polished honey-wood staircase handrail at night, camera above the rail, tilted down 35 degrees, 85 mm lens. The handrail runs diagonally from the upper left to the lower right. A thin, sharp, luminous yellow thread of light glowing gold glides down along the top of the rail, reflecting in the varnish, heading toward the bottom of the frame. Below, from 70% to 100% down, the warm out-of-focus bokeh of a living room with lamps glows gold. Everything except the rail and the thread is soft.
STYLE: deep midnight-blue darkness, warm gold 2200–2400 K, cinematic macro, gentle film grain.
NEGATIVE: no sharp stairs, no people, no hands, no face, no text, no logo, no sparks.
```

**Extension 16:9 de K8**

*Méthode, à chaque image : 1) partir de l'image 9:16 **validée** de cette K, tout de suite après sa validation ; 2) l'élargir par extension latérale (Photoshop « Développement génératif », extension de Nano Banana ou équivalent) avec le prompt ci-dessous ; 3) vérifier que le fil, le produit et les raccords sont au même endroit ; 4) passer à la K suivante ; 5) les clips seulement quand les 12 paires sont faites, avec les mêmes prompts de clip en 9:16 puis en 16:9. L'image 9:16 ne couvre qu'un tiers de la largeur : le modèle invente les deux autres tiers, qui doivent rester calmes (prolongement du décor, sans nouvel objet important), et le produit comme le fil restent dans le tiers central d'origine.*

```text
Expand this exact, already validated 9:16 image to a 16:9 landscape frame of the same height by extending only the left and right sides (outpainting). Keep the original image unchanged, pixel for pixel, in the center (34% to 66% of the new width): it is the central third of the new frame, and you only invent the two outer thirds. The product, the drawings and the luminous yellow thread must stay exclusively inside the original central third, exactly where they are; never move, duplicate or redraw them in the extended sides. The only exception: where the thread already touches the edge of the original image, it may continue into the side in the same direction, with the same thickness and glow, unbroken, up to the new frame edge. Keep both extended sides calm: only the natural continuation of the existing setting (wall, wood, floor, fabric, bokeh), with no new important object, no new light source and nothing that draws the eye away from the center. Continue the same downward perspective, lighting, color grade, shallow depth of field and film grain. Left side: the polished honey-wood handrail continues diagonally toward the upper left, with soft dark balusters. Right side: the handrail continues toward the lower right; below, the warm golden bokeh of the living room spreads wider. The luminous yellow thread stays on the rail exactly as it is and continues along the extended rail. No sharp stairs, no people, no hands, no text, no logos.
```

## K9 — Le salon du parent (concret, palier 2)

Références : produit + `Paires/4/Version_9_16_2K_20261016125602.jpg` (mandala, main adulte, salon) + K8.

```text
Vertical 9:16 photorealistic three-quarter shot of a living room coffee table at night, camera 0.9 m high, 35 mm lens. The drawing tablet stands on the honey-wood coffee table at (42% across, 58% down). On its plate glows an intricate mandala in fluorescent yellow shining gold, almost finished. An adult hand in a charcoal-grey knit sleeve, entering from the right, holds the white marker with a yellow cap; its tip at (55%, 62%) finishes the last outer swirl. A thin, sharp, luminous yellow thread of light glowing gold descends from the top of the frame and arrives exactly at the marker tip. On the left, a warm floor lamp; behind, a wooden bookshelf; at the top of the frame, from 5% to 40% down, a large window wall shows the deep blue night with distant warm house windows, out of focus. A soft throw blanket on the sofa edge.
PRODUCT (match the attached references exactly): clear polished acrylic plate about 8 mm thick, landscape format, sharp square corners, standing vertically in a solid light beech-wood bar base with a visible row of golden LED dots, polished edges glowing gold, thin white cable, no marking on the base.
STYLE: calm adult living room at night, deep midnight-blue window, warm honey wood, the plate and the floor lamp are the light sources (golden 2200–2400 K), photorealistic lifestyle product photography, shallow depth of field, gentle film grain.
NEGATIVE: no face, no head, no silhouette or reflection of a person in the window; only one hand and forearm; no text, no letters, no logo; no white or metal base; no rounded corners; no sparks.
```

**Extension 16:9 de K9**

*Méthode, à chaque image : 1) partir de l'image 9:16 **validée** de cette K, tout de suite après sa validation ; 2) l'élargir par extension latérale (Photoshop « Développement génératif », extension de Nano Banana ou équivalent) avec le prompt ci-dessous ; 3) vérifier que le fil, le produit et les raccords sont au même endroit ; 4) passer à la K suivante ; 5) les clips seulement quand les 12 paires sont faites, avec les mêmes prompts de clip en 9:16 puis en 16:9. L'image 9:16 ne couvre qu'un tiers de la largeur : le modèle invente les deux autres tiers, qui doivent rester calmes (prolongement du décor, sans nouvel objet important), et le produit comme le fil restent dans le tiers central d'origine.*

```text
Expand this exact, already validated 9:16 image to a 16:9 landscape frame of the same height by extending only the left and right sides (outpainting). Keep the original image unchanged, pixel for pixel, in the center (34% to 66% of the new width): it is the central third of the new frame, and you only invent the two outer thirds. The product, the drawings and the luminous yellow thread must stay exclusively inside the original central third, exactly where they are; never move, duplicate or redraw them in the extended sides. The only exception: where the thread already touches the edge of the original image, it may continue into the side in the same direction, with the same thickness and glow, unbroken, up to the new frame edge. Keep both extended sides calm: only the natural continuation of the existing setting (wall, wood, floor, fabric, bokeh), with no new important object, no new light source and nothing that draws the eye away from the center. Continue the same living room, three-quarter perspective, lighting, golden and midnight-blue color grade, depth of field and film grain. Wide shot: keep both sides especially calm, only the continuation of the table, the wall and the window. Left side: the existing floor lamp and bookshelf continue only where already cut by the original edge, then a plain dark wall. Right side: the charcoal-grey knit sleeve continues naturally, then the plain edge of the coffee table in shadow. Across the top, the large window wall continues on both sides with the deep blue night and distant warm house windows, out of focus. The tablet, the mandala and the luminous yellow thread stay exactly as they are. No face, head or silhouette, no reflection of a person in the window, no second tablet, no text, no logos.
```

## K10 — La baie vitrée (portail)

Références : K9.

```text
Vertical 9:16 abstract macro photograph of a cold window pane at night, filling the whole frame, 100 mm lens. A thin, sharp, luminous yellow thread of light glowing gold crosses the glass diagonally from the lower left to the upper right, with a faint golden reflection doubling it in the pane. On the left, soft warm reflections of a living room lamp; on the right, through the glass, out-of-focus streetlights and distant warm house windows in deep blue night. A faint mist of condensation at the edges of the pane.
STYLE: cool midnight blue outside, warm gold 2200–2400 K inside, dreamlike cinematic macro, gentle film grain.
NEGATIVE: no reflection of a person, no face, no hands, no text, no logo, no sharp buildings, no sparks.
```

**Extension 16:9 de K10**

*Méthode, à chaque image : 1) partir de l'image 9:16 **validée** de cette K, tout de suite après sa validation ; 2) l'élargir par extension latérale (Photoshop « Développement génératif », extension de Nano Banana ou équivalent) avec le prompt ci-dessous ; 3) vérifier que le fil, le produit et les raccords sont au même endroit ; 4) passer à la K suivante ; 5) les clips seulement quand les 12 paires sont faites, avec les mêmes prompts de clip en 9:16 puis en 16:9. L'image 9:16 ne couvre qu'un tiers de la largeur : le modèle invente les deux autres tiers, qui doivent rester calmes (prolongement du décor, sans nouvel objet important), et le produit comme le fil restent dans le tiers central d'origine.*

```text
Expand this exact, already validated 9:16 image to a 16:9 landscape frame of the same height by extending only the left and right sides (outpainting). Keep the original image unchanged, pixel for pixel, in the center (34% to 66% of the new width): it is the central third of the new frame, and you only invent the two outer thirds. The product, the drawings and the luminous yellow thread must stay exclusively inside the original central third, exactly where they are; never move, duplicate or redraw them in the extended sides. The only exception: where the thread already touches the edge of the original image, it may continue into the side in the same direction, with the same thickness and glow, unbroken, up to the new frame edge. Keep both extended sides calm: only the natural continuation of the existing setting (wall, wood, floor, fabric, bokeh), with no new important object, no new light source and nothing that draws the eye away from the center. Continue the same window pane macro, lighting, color grade, shallow depth of field and film grain. Left side: warm reflections of the living room lamp on the glass, a thin dark window frame, condensation at the edge. Right side: more out-of-focus streetlights and warm house windows in the deep blue night. The luminous yellow thread continues its straight diagonal across the extended glass without changing angle. No reflection of a person, no hands, no text, no logos, no sharp buildings.
```

## K11 — La nuit entre deux maisons (portail)

Références : K10.

```text
Vertical 9:16 dreamlike night photograph at rooftop height, blue hour, 24 mm lens, extremely shallow depth of field. On the left (0 to 35% across), a house is only soft bokeh shapes with warm windows; on the right (60 to 100%), a second house, also soft bokeh. The only sharp element is a thin luminous yellow thread of light glowing gold, drawing a graceful arc across the sky, its highest point at 15% down, then diving toward a warm glowing window of the right house at (78% across, 62% down). Deep blue sky, a few stars, a soft golden halo around the thread.
STYLE: deep blue hour, warm gold 2200–2400 K, magical but photographic, gentle film grain.
NEGATIVE: no sharp façades, no people, no cars, no text, no logo, no fireworks, no particle explosion, no neon ribbon.
```

**Extension 16:9 de K11**

*Méthode, à chaque image : 1) partir de l'image 9:16 **validée** de cette K, tout de suite après sa validation ; 2) l'élargir par extension latérale (Photoshop « Développement génératif », extension de Nano Banana ou équivalent) avec le prompt ci-dessous ; 3) vérifier que le fil, le produit et les raccords sont au même endroit ; 4) passer à la K suivante ; 5) les clips seulement quand les 12 paires sont faites, avec les mêmes prompts de clip en 9:16 puis en 16:9. L'image 9:16 ne couvre qu'un tiers de la largeur : le modèle invente les deux autres tiers, qui doivent rester calmes (prolongement du décor, sans nouvel objet important), et le produit comme le fil restent dans le tiers central d'origine.*

```text
Expand this exact, already validated 9:16 image to a 16:9 landscape frame of the same height by extending only the left and right sides (outpainting). Keep the original image unchanged, pixel for pixel, in the center (34% to 66% of the new width): it is the central third of the new frame, and you only invent the two outer thirds. The product, the drawings and the luminous yellow thread must stay exclusively inside the original central third, exactly where they are; never move, duplicate or redraw them in the extended sides. The only exception: where the thread already touches the edge of the original image, it may continue into the side in the same direction, with the same thickness and glow, unbroken, up to the new frame edge. Keep both extended sides calm: only the natural continuation of the existing setting (wall, wood, floor, fabric, bokeh), with no new important object, no new light source and nothing that draws the eye away from the center. Continue the same blue-hour night at rooftop height, color grade, extremely shallow depth of field and film grain. Left side: the first house continues as soft bokeh shapes with warm windows, then more deep blue sky with a few stars. Right side: the second house continues as soft bokeh, then rooftops in silhouette-free soft blur. The luminous yellow thread and its arc stay exactly as they are; the arc may start further left, from the edge of the new frame, with the same thickness. No sharp façades, no people, no cars, no text, no logos, no fireworks.
```

## K12 — Bonne nuit (concret, ancre du CTA)

Références : produit + `Paires/8/version_9_16_2K_20261016132139.jpg` (chevet, socle en bois) + `Paires/3/Hand_holding_marker_near_light_2K_20261015213005.jpg` (main endormie, mur bleu) + K11.

```text
Vertical 9:16 photorealistic shot of a child's bedside table at night, camera 0.7 m high at the level of the table top, three-quarter view, 35 mm lens. The drawing tablet stands at (40% across, 50% down); its plate is blank and clear except a tiny glowing golden-yellow crescent moon in the upper right corner, leaving a large empty area for writing. A thin, sharp, luminous yellow thread of light glowing gold arrives from the upper right of the frame and comes to rest on the tip of the crescent, the end of its journey. A sleeping child's relaxed hand in a navy star-patterned pajama sleeve rests at the table edge at (62%, 66%), the white marker with a yellow cap lying just released beside it. On the right, out of focus: the bed with star-patterned linen and a beige plush bunny. Deep midnight-blue wall above with a moon-and-stars frame; a soft golden halo spreads on the wall behind the plate. The lower part of the frame, from 75% to 95% down, is the calm, dark, uncluttered front of the wooden bedside table, kept empty for the website call to action.
PRODUCT (match the attached references exactly): clear polished acrylic plate about 8 mm thick, landscape format, sharp square corners, standing vertically in a solid light beech-wood bar base with a visible row of golden LED dots, polished edges glowing gold, thin white cable, no marking on the base.
STYLE: peaceful child's bedroom at night, deep midnight blue, warm honey wood, the plate is the only light source (golden 2200–2400 K), photorealistic high-end lifestyle product photography, shallow depth of field, gentle film grain.
NEGATIVE: no face, no head, no hair, only one hand and forearm; no words, no letters on the plate or the book; no logo on the base; no white or metal base; no rounded corners; nothing in the lower calm zone; no sparks.
```

**Extension 16:9 de K12**

*Méthode, à chaque image : 1) partir de l'image 9:16 **validée** de cette K, tout de suite après sa validation ; 2) l'élargir par extension latérale (Photoshop « Développement génératif », extension de Nano Banana ou équivalent) avec le prompt ci-dessous ; 3) vérifier que le fil, le produit et les raccords sont au même endroit ; 4) passer à la K suivante ; 5) les clips seulement quand les 12 paires sont faites, avec les mêmes prompts de clip en 9:16 puis en 16:9. L'image 9:16 ne couvre qu'un tiers de la largeur : le modèle invente les deux autres tiers, qui doivent rester calmes (prolongement du décor, sans nouvel objet important), et le produit comme le fil restent dans le tiers central d'origine.*

```text
Expand this exact, already validated 9:16 image to a 16:9 landscape frame of the same height by extending only the left and right sides (outpainting). Keep the original image unchanged, pixel for pixel, in the center (34% to 66% of the new width): it is the central third of the new frame, and you only invent the two outer thirds. The product, the drawings and the luminous yellow thread must stay exclusively inside the original central third, exactly where they are; never move, duplicate or redraw them in the extended sides. The only exception: where the thread already touches the edge of the original image, it may continue into the side in the same direction, with the same thickness and glow, unbroken, up to the new frame edge. Keep both extended sides calm: only the natural continuation of the existing setting (wall, wood, floor, fabric, bokeh), with no new important object, no new light source and nothing that draws the eye away from the center. Continue the same child's bedroom, low perspective, lighting, golden and midnight-blue color grade, depth of field and film grain. Wide shot: keep both sides especially calm, only the continuation of the bedside table, the wall and the bed. Left side: the plain wooden bedside table top continues, then the deep blue wall in soft shadow. Right side: the bed with star-patterned linen and the beige plush bunny continue softly out of focus, then a calm, dark, uncluttered area of deep blue wall and bedding, kept empty for a website call-to-action column. The tablet, its blank plate with only the crescent, the luminous yellow thread, the sleeping hand and the marker stay exactly as they are. No face, head or hair, no words or letters, no logo on the base, no second tablet, nothing in the calm areas.
```

## Vérification avant de générer les clips

- [ ] **Le fil lumineux jaune est présent et net dans les 12 images**, même épaisseur, même jaune doré, et il pointe vers le raccord indiqué dans le tableau du haut.
- [ ] Les 12 images ont le même socle en hêtre clair, la même plaque à angles droits et la même rangée de LED dorées.
- [ ] Aucune image ne montre un visage, une tête ou une silhouette.
- [ ] Aucune lettre, coche ou logo dans les images (K5 et K12 ont la plaque vide, sauf le croissant).
- [ ] Les jonctions tombent au même endroit : chant à x = 88 % (K1) puis 50 % (K2) ; LED à y = 62 % (K2, K3) ; pied de commode au point de fuite (K4, K5) ; croissant devant la porte (K5, K6) ; rampe au fond (K7, K8) ; baie en haut (K9, K10) ; fenêtre chaude en (78 %, 62 %) (K11, K12).
- [ ] Le même étalonnage d'un bout à l'autre : bleu nuit et or.
- [ ] **12 paires 9:16 / 16:9** : le centre de chaque 16:9 est identique à l'image 9:16 ; les côtés n'ajoutent ni personnage, ni texte, ni objet qui attire l'œil ; le fil continue sans cassure.
