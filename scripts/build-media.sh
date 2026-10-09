#!/usr/bin/env bash
# Régénère les images du site à partir des photos fournisseur. Les originaux ne
# sont jamais modifiés. Dépendance : ffmpeg (libwebp).
#
# Depuis le 2026-10-07, le hero n'utilise plus la vidéo du fournisseur
# (d05cda3e….mp4, toujours à la racine) mais une photo : voir plus bas.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
PICS="$ROOT/CJYD2333071/Marketing Picture"
# Images fournies à part (hors fiche fournisseur).
SOURCES="$ROOT/media-sources"
OUT="$ROOT/src/assets/media"
PUBLIC="$ROOT/public"

mkdir -p "$OUT" "$PUBLIC"
ff() { ffmpeg -hide_banner -loglevel error -y "$@"; }

# --- Photos fournisseur ------------------------------------------------------
# Règles de recadrage : on ne garde que le produit. Restent hors cadre les
# bandeaux et cotes en anglais, les personnes de banque d'images et les textes
# religieux, sauf sur la carte « Écrire » des usages, où le produit doit se voir
# en entier (choix du 2026-10-09). Décors de fêtes : seulement dans les usages
# et la troisième étape de l'intro.
crop() { ff -i "$PICS/$1" -vf "crop=$2" -c:v libwebp -quality 84 "$OUT/$3"; }
# Les petits recadrages affichés en grand sont agrandis ×2 (Lanczos + netteté)
# plutôt que de laisser le navigateur les étirer.
shot() { ff -i "$PICS/$1" -vf "crop=$2,scale=iw*2:ih*2:flags=lanczos,unsharp=5:5:0.7" -c:v libwebp -quality 82 "$OUT/$3"; }

P_SCENE="1_de0dc9d0-bd2a-446e-9602-340f24e10b1f.jpg"    # scène, vues du support, feutres
P_BONJOUR="2_a9eab77a-9f15-48cf-9ac6-5fa87790a4e9.jpg"  # « Good Morning » sur un bureau
P_FLEURS="3_f2b9537c-6202-4e66-8739-9f28d71a8efc.jpg"   # tableau aux fleurs
P_FUSEE="4_31054048-83dc-4633-b512-ec8216b9e830.jpg"    # fusée, 12 × 12 cm
P_SIRENE="6_1969f35c-f10e-48d0-bdbf-399702326d93.jpg"   # sirène allumée dans le noir, 20 × 20 cm
P_PACKSHOT="8_5ab55467-06de-4d79-9119-f8ebc66883be.jpg" # sirène sur fond blanc
P_FORMATS="9_8d6c0245-b99f-4f8c-86be-f25f69710f08.jpg"  # planche des quatre tailles

# Photo du hero (choisie le 2026-10-07, à la place de la vidéo puis de deux
# photos fournisseur) : le tableau « Good Morning » sur un bureau, fournie à
# part en 1024 × 572 px. Affichée plein écran, elle est agrandie ×2 ici
# (Lanczos + netteté) plutôt que par le navigateur.
ff -i "$SOURCES/hero-good-morning.png" -vf "scale=iw*2:ih*2:flags=lanczos,unsharp=5:5:0.6" -c:v libwebp -quality 84 "$OUT/hero-photo.webp"
# Version très floutée, en fond sur les écrans en portrait (tablette), où la
# photo est montrée entière. Le flou est calculé ici une fois pour toutes : un
# filtre CSS serait recalculé à chaque image de l'animation de défilement.
ff -i "$SOURCES/hero-good-morning.png" -vf "scale=96:-2,gblur=sigma=5,scale=960:-2:flags=bicubic" -c:v libwebp -quality 70 "$OUT/hero-photo-fond.webp"

# Packshot sur fond blanc, sans surimpression.
ff -i "$PICS/$P_PACKSHOT" -c:v libwebp -quality 82 "$OUT/packshot.webp"

# Les quatre photos du début de page (autour de la vidéo refermée sur
# ordinateur, à faire défiler sur téléphone).
shot "$P_FUSEE" 398:392:566:556 shot-fusee.webp
shot "$P_FLEURS" 620:488:372:262 shot-fleurs.webp
# La sirène : plaque et base entières, sans les cotes ni le bandeau.
shot "$P_SIRENE" 374:380:78:566 shot-sirene.webp
crop "$P_BONJOUR" 800:436:100:564 shot-bonjour.webp

# Même scène, pour le partage social.
ff -i "$PICS/$P_BONJOUR" -vf "crop=829:435:85:564,scale=1200:630:flags=lanczos" -q:v 4 "$PUBLIC/og-image.jpg"

# Troisième étape de l'intro : « Happy New Year » sur le 30 × 20 (sans les cotes).
shot "$P_FORMATS" 440:348:0:124 fete-nouvel-an.webp

# Cartes des usages : chaque photo montre le produit entier (plaque et base),
# avec une version minuscule très floue qui remplit le cadre autour.
# - Fêter : Halloween, fournie à part en 1024 × 572 px (2026-10-09), entière.
ff -i "$SOURCES/halloween.png" -vf "scale=iw*2:ih*2:flags=lanczos,unsharp=5:5:0.6" -c:v libwebp -quality 84 "$OUT/fete-halloween.webp"
# - Décorer : la veilleuse sur une commode, sans le titre ni les vignettes de
#   la photo (son bord droit sort déjà du cadre sur l'original).
crop "$P_SCENE" 682:620:318:95 deco-veilleuse.webp
# - Écrire : le tableau « Good Morning » entier, citation comprise.
crop "$P_BONJOUR" 920:650:40:230 message-bonjour.webp
# - Créer : la fusée du 12 × 12 allumée dans une pièce sombre, sans les cotes.
shot "$P_FUSEE" 440:440:558:550 creer-fusee.webp
# (Les étapes de l'intro ont les mêmes fonds flous.)
for f in fete-halloween deco-veilleuse message-bonjour creer-fusee shot-sirene fete-nouvel-an; do
  ff -i "$OUT/$f.webp" -vf "scale=48:-2,gblur=sigma=3,scale=480:-2:flags=bicubic" -c:v libwebp -quality 60 "$OUT/$f-flou.webp"
done

# Le support sert aussi de porte-tablette et de porte-téléphone (vignettes de
# la même photo, sans leurs titres en anglais).
crop "$P_SCENE" 310:215:15:775 support-tablette.webp
crop "$P_SCENE" 310:215:345:775 support-telephone.webp

# Dans la boîte : le support vu de face, de dos et de profil.
crop "$P_SCENE" 274:146:30:150 support-face.webp
crop "$P_SCENE" 274:150:30:350 support-dos.webp
crop "$P_SCENE" 274:152:30:552 support-profil.webp

# Une vignette 4:3 par format. Le fournisseur ne montre le 15 × 15 cm qu'avec
# un dessin de Noël : sa vignette reprend le tableau aux fleurs, carré lui
# aussi mais dont la taille n'est pas indiquée sur la photo d'origine.
crop "$P_FORMATS" 300:225:590:668 format-12x12.webp
crop "$P_FLEURS" 620:465:372:285 format-15x15.webp
crop "$P_PACKSHOT" 950:712:25:150 format-20x20.webp
crop "$P_BONJOUR" 573:430:190:566 format-30x20.webp

ls -lh "$OUT" "$PUBLIC/og-image.jpg"
