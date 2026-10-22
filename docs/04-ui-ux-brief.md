---
document: "Brief UI/UX"
statut: brouillon        # brouillon | finalisé — seul l'utilisateur valide le passage à « finalisé » (R-001)
version: 0.1
date: 2026-10-22
valide_par: ""
---

# 04 — Brief UI/UX

## Public et ton
- **Pour qui** : parents d'enfants de 3 à 10 ans, offreurs de cadeaux ; mobile d'abord (trafic TikTok, Instagram).
- **Trois adjectifs** : doux, lumineux, vivant.
- **Consignes permanentes** : le site ne doit pas « faire IA » ni être « boring » (méthode vibe-brain §J, P-081 à P-083) ; 9:16 d'abord, 16:9 identique ; aucun fondu ni coupe visible dans la vidéo.

## Produits de référence
| Lien ou capture | À reprendre | À éviter |
|---|---|---|
| morphowater.com (mobile) | numéro de chapitre et trait de progression au bord gauche ; sur-titre minuscule ; titre sur deux lignes ; sous-titre dont les mots s'éclairent au scroll ; textes posés sur la vidéo à des places qui changent | le mot en serif italique dans le titre (remplacé par le mot doré écrit au feutre) |
| Inspi « echelon / onest » | grandes capitales Onest serrées | ses couleurs (orange, noir) |
| Story « Font pairing guide » (@hamzakamboj) | duo capitales + script | polices sous licence personnelle |
| ABHI CAFE, EverSwap (banque A-079 à A-096) | plan-séquence, sortie vers la boutique sans coupure | — |
| Reel @tara_webdesign (A-097) | — | toute la liste noire §J1 |

## Couleurs (moodboard 01)
| Rôle | Valeur |
|---|---|
| Fond | Nuit profonde #17182D (à confirmer contre #0B0A1B de l'intro) |
| Profondeur | Indigo crépuscule #30385B |
| Texte | Ivoire de lin #F4EFE6 |
| Accent (un seul par visuel) | Halo jaune #FFD23F |
| Matière | Chêne clair #B9956F |
| Succès / avertissement / erreur | ceux du tunnel existant |

## Typographie
- **Capitales** : Onest 800, majuscules, interlettrage serré (−3 %).
- **Mot lumineux** : Sacramento, #FFD23F avec lueur, écrit de gauche à droite au scroll ; il n'est jamais glissé au milieu d'une phrase en capitales.
- **Sur-titres** : Onest 600, petites capitales espacées, « 01 — LE GESTE ».
- **Sous-titres** : Onest 400, mots de 26 % à 100 % d'opacité un par un.
- **Tailles (mobile 390 px)** : capitales ≈ 15,5 vw ; mot doré ≈ 19 vw ; sous-titres 17 px ; sur-titres 10 px.

## Composants
- Header minimal : logo Lumikréa (kit Fable) et « Choisir mon format ».
- Fil de progression : trait doré vertical au bord gauche + numéros 01 à 04.
- Bouton principal : texte en capitales souligné d'un trait de feutre doré dessiné à la main (pas de bouton pilule).

## Mise en page
- **Textes sans bande ni dégradé** : posés sur les zones sombres de chaque scène, avec une ombre douce.
- **Positions par chapitre (9:16)** : 01 haut gauche · 02 haut droite · 03 haut gauche (mur bleu) · 04 titre en haut, sous-titre en bas après l'extinction · fin en bas à gauche.
- **16:9** : mêmes chapitres, textes sur le côté libre de l'image.
- **Points de rupture** : portrait / paysage (`orientation`), puis ajustements à 768 px et 1280 px.

## Accessibilité
- Contraste du texte contrôlé sur chaque image clé ; textes en HTML, pas dans la vidéo ; `prefers-reduced-motion` respecté ; zones tactiles de 44 px minimum ; vidéo décorative (`aria-hidden`), l'histoire est lisible dans le texte.

## États d'interaction
- Bouton : survol et focus = le trait doré se redessine ; focus clavier visible.

## Éléments graphiques à prévoir
- Logo vectoriel (kit Fable `lumikrea-logo (1).zip`), vidéos hero 9:16 et 16:9 au format web, images d'attente WebP, intro logo.

## Questions ouvertes
> Doit être **vide** (ou chaque question tranchée) pour finaliser.
- Nouveaux textes des chapitres (« pas encore ça »).
- Bleu de fond unique.

## Historique
| Version | Date | Changement | Validé par |
|---|---|---|---|
| 0.1 | 2026-10-22 | Création | — |
