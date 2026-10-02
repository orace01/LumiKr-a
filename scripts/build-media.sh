#!/usr/bin/env bash
# Régénère les médias dérivés (vidéo hero, posters, images) à partir des
# originaux fournisseur. Les originaux ne sont jamais modifiés.
# Dépendance : ffmpeg (libx264, libwebp).
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
VIDEO="$ROOT/d05cda3ed3fd71f0935e6632b68f0102.mp4"
PICS="$ROOT/CJYD2333071/Marketing Picture"
OUT="$ROOT/src/assets/media"
PUBLIC="$ROOT/public"

mkdir -p "$OUT" "$PUBLIC"
ff() { ffmpeg -hide_banner -loglevel error -y "$@"; }

# --- Vidéo hero -------------------------------------------------------------
# La vidéo sert de fond plein écran (object-fit: cover), sans texte par-dessus.
# - Les sous-titres anglais incrustés occupent la bande y ≈ 876–945 px : on ne
#   garde que les 864 px du haut.
# - Le gros plan d'ouverture sur les feutres (images 0–97), flou une fois
#   agrandi, est écarté : seul le plan du tableau dans le noir est conservé.
# - Les 0,6 s de début sont fondues sur la fin pour que la boucle reprenne
#   sans saut (9,3 s de plan → boucle de 8,7 s).
CUT=98
FADE=0.6
MAIN=8.7
loop_filter() { # $1 = recadrage et mise à l'échelle
  echo "[0:v]trim=start_frame=$CUT,setpts=PTS-STARTPTS,$1,unsharp=5:5:0.5,split[x][y];\
[x]trim=start=$FADE,setpts=PTS-STARTPTS[main];[y]trim=end=$FADE,setpts=PTS-STARTPTS[head];\
[main][head]xfade=transition=fade:duration=$FADE:offset=$(echo "$MAIN - $FADE" | bc)[o]"
}
X264=(-c:v libx264 -preset slow -profile:v high -pix_fmt yuv420p -an -movflags +faststart)

# Un seul encodage pour tous les écrans, à la définition d'origine : c'est le
# cadre CSS (object-fit: cover) qui choisit la partie visible.
ff -i "$VIDEO" -filter_complex "$(loop_filter 'crop=1920:864:0:0')" \
  -map "[o]" "${X264[@]}" -crf 27 "$OUT/hero.mp4"

# Poster : première image de la vidéo.
ff -i "$OUT/hero.mp4" -frames:v 1 -c:v libwebp -quality 80 "$OUT/hero-poster.webp"

# --- Images extraites de la vidéo (au-dessus de la bande de sous-titres) -----
ff -ss 0.5 -i "$VIDEO" -frames:v 1 -vf "crop=864:864:400:0" -c:v libwebp -quality 80 "$OUT/still-feutres.webp"
ff -ss 6.8 -i "$VIDEO" -frames:v 1 -vf "crop=864:864:620:0" -c:v libwebp -quality 80 "$OUT/still-geste.webp"
# Fin de vidéo : seules images sans sous-titre, cadre complet avec la base LED.
ff -ss 12.2 -i "$VIDEO" -frames:v 1 -vf "scale=1600:900" -c:v libwebp -quality 80 "$OUT/still-nuit.webp"
ff -ss 12.2 -i "$VIDEO" -frames:v 1 -vf "scale=1200:675,crop=1200:630" -q:v 4 "$PUBLIC/og-image.jpg"

# --- Photos fournisseur ------------------------------------------------------
# Packshot sur fond blanc, sans surimpression.
ff -i "$PICS/8_5ab55467-06de-4d79-9119-f8ebc66883be.jpg" -c:v libwebp -quality 82 "$OUT/packshot.webp"
# Scène d'ambiance : recadrage hors bandeaux et vignettes en anglais.
ff -i "$PICS/1_de0dc9d0-bd2a-446e-9602-340f24e10b1f.jpg" -vf "crop=680:620:320:95" -c:v libwebp -quality 84 "$OUT/ambiance.webp"

# --- Photos produit recadrées -------------------------------------------------
# On ne garde que le tableau : les bandeaux et cotes en anglais, les personnes
# de banque d'images et les textes religieux restent hors cadre.
crop() { ff -i "$PICS/$1" -vf "crop=$2" -c:v libwebp -quality 84 "$OUT/$3"; }

# Mosaïque du hero, autour de la vidéo refermée : le produit entier, un visuel
# par format. Le tableau n'occupe que 370 à 540 px dans les originaux ; comme
# ces photos sont affichées en grand, on les agrandit ×2 (Lanczos + netteté)
# plutôt que de laisser le navigateur les étirer.
shot() { ff -i "$PICS/$1" -vf "crop=$2,scale=iw*2:ih*2:flags=lanczos,unsharp=5:5:0.7" -c:v libwebp -quality 82 "$OUT/$3"; }
shot 4_31054048-83dc-4633-b512-ec8216b9e830.jpg 398:392:566:556 shot-fusee.webp
shot 5_23dcdc1e-3ba1-40f5-9a39-a7ac8f8a7609.jpg 400:400:82:550 shot-noel.webp
shot 6_1969f35c-f10e-48d0-bdbf-399702326d93.jpg 372:372:80:572 shot-sirene.webp
shot 7_b19ab781-bccb-4742-8ace-d18605f75713.jpg 540:372:78:574 shot-nouvel-an.webp

# Les feutres, pour la carte « Dans la boîte ».
crop 1_de0dc9d0-bd2a-446e-9602-340f24e10b1f.jpg 262:212:700:776 feutres.webp

# Une vignette 4:3 par format. Trois viennent de la planche des quatre tailles ;
# celle du 20 × 20 y porte un texte religieux, on prend donc l'autre visuel.
FORMATS="9_8d6c0245-b99f-4f8c-86be-f25f69710f08.jpg"
crop "$FORMATS" 300:225:590:668 format-12x12.webp
crop "$FORMATS" 380:285:20:628 format-15x15.webp
crop 6_1969f35c-f10e-48d0-bdbf-399702326d93.jpg 496:372:72:570 format-20x20.webp
crop "$FORMATS" 420:315:30:122 format-30x20.webp

ls -lh "$OUT" "$PUBLIC/og-image.jpg"
