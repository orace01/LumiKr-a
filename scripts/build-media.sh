#!/usr/bin/env bash
# Régénère les images de l'application React (panier, récapitulatif de commande)
# et l'image de partage, à partir des photos fournisseur. Les originaux ne sont
# jamais modifiés. Dépendance : ffmpeg (libwebp).
#
# Les médias de l'accueil (vidéos, photos des usages) sont dans frontend2/media/
# (voir scripts/build-hero-frontend2.sh).
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
PICS="$ROOT/CJYD2333071/Marketing Picture"
OUT="$ROOT/src/assets/media"
PUBLIC="$ROOT/public"

mkdir -p "$OUT" "$PUBLIC"
ff() { ffmpeg -hide_banner -loglevel error -y "$@"; }

# Recadrages : on ne garde que le produit, sans bandeaux ni cotes en anglais.
crop() { ff -i "$PICS/$1" -vf "crop=$2" -c:v libwebp -quality 84 "$OUT/$3"; }

P_BONJOUR="2_a9eab77a-9f15-48cf-9ac6-5fa87790a4e9.jpg"  # « Good Morning » sur un bureau
P_FLEURS="3_f2b9537c-6202-4e66-8739-9f28d71a8efc.jpg"   # tableau aux fleurs
P_PACKSHOT="8_5ab55467-06de-4d79-9119-f8ebc66883be.jpg" # sirène sur fond blanc
P_FORMATS="9_8d6c0245-b99f-4f8c-86be-f25f69710f08.jpg"  # planche des quatre tailles

# Image de partage (réseaux sociaux).
ff -i "$PICS/$P_BONJOUR" -vf "crop=829:435:85:564,scale=1200:630:flags=lanczos" -q:v 4 "$PUBLIC/og-image.jpg"

# Une vignette 4:3 par format, pour le panier et le récapitulatif de commande.
# Le fournisseur ne montre le 15 × 15 cm qu'avec un dessin de Noël : sa vignette
# reprend le tableau aux fleurs, carré lui aussi.
crop "$P_FORMATS" 300:225:590:668 format-12x12.webp
crop "$P_FLEURS" 620:465:372:285 format-15x15.webp
crop "$P_PACKSHOT" 950:712:25:150 format-20x20.webp
crop "$P_BONJOUR" 573:430:190:566 format-30x20.webp

ls -lh "$OUT" "$PUBLIC/og-image.jpg"
