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

# Écrans en paysage : toute la largeur, à la définition d'origine.
ff -i "$VIDEO" -filter_complex "$(loop_filter 'crop=1920:864:0:0')" \
  -map "[o]" "${X264[@]}" -crf 27 "$OUT/hero-wide.mp4"

# Écrans en portrait : tranche 3:4 centrée sur le lettrage et le bonhomme de
# neige ; en plein écran, le plan large n'y montrerait qu'une bande mal centrée.
ff -i "$VIDEO" -filter_complex "$(loop_filter 'crop=648:864:656:0,scale=720:960')" \
  -map "[o]" "${X264[@]}" -crf 27 "$OUT/hero-portrait.mp4"

# Posters : première image de chaque encodage.
ff -i "$OUT/hero-wide.mp4" -frames:v 1 -c:v libwebp -quality 80 "$OUT/hero-poster-wide.webp"
ff -i "$OUT/hero-portrait.mp4" -frames:v 1 -c:v libwebp -quality 80 "$OUT/hero-poster-portrait.webp"

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

ls -lh "$OUT" "$PUBLIC/og-image.jpg"
