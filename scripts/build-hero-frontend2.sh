#!/usr/bin/env bash
# Régénère les vidéos du hero de frontend2 à partir du kit (Lumikrea 9.16.mp4 et 16.9.mp4).
# Chaque image est une image clé (-g 1) : quand le scroll déplace la vidéo, le navigateur
# ne décode qu'une image, au lieu de remonter jusqu'à la dernière image clé (6 à 12 images
# avant). C'est ce qui rend le scrub fluide sur téléphone, au prix d'un fichier plus lourd.
# Dépendance : ffmpeg avec libx264 et libsvtav1.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
KIT="${KIT:-/c/Users/shado/Downloads/scenes/9.16/Lumikrea Kit}"
OUT="$ROOT/frontend2/media"
ff() { ffmpeg -hide_banner -loglevel error -y "$@"; }

# $1 source, $2 nom (9x16 | 16x9), $3 taille AV1, $4 taille H.264
hero() {
  # AV1 (appareils qui le décodent en matériel) : grande définition.
  ff -i "$1" -an -vf "fps=24,scale=$3:flags=lanczos" -c:v libsvtav1 -preset 6 -crf 45 -pix_fmt yuv420p \
    -g 1 -svtav1-params scd=0 -movflags +faststart "$OUT/hero-$2.av1.mp4"
  # H.264 (secours, anciens iPhone) : définition moyenne.
  ff -i "$1" -an -vf "fps=24,scale=$4:flags=lanczos" -c:v libx264 -preset slow -crf 29 -pix_fmt yuv420p \
    -g 1 -bf 0 -movflags +faststart "$OUT/hero-$2.h264.mp4"
}

hero "$KIT/Lumikrea 9.16.mp4" 9x16 1080:1920 720:1280
hero "$KIT/Lumikrea 16.9.mp4" 16x9 1920:1080 1280:720

ls -lh "$OUT"/hero-*.mp4
