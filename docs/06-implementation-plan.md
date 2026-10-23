---
document: "Plan d'implémentation"
statut: brouillon        # brouillon | finalisé — seul l'utilisateur valide le passage à « finalisé » (R-001)
version: 0.1
date: 2026-10-22
valide_par: ""
---

# 06 — Plan d'implémentation

> Une étape à la fois (P-006) ; à la fin de chaque étape : ouvrir la page, vérifier les critères d'acceptation, noter les problèmes (P-038).

| Étape | Contenu | Vérification |
|---|---|---|
| 1 | Export web des vidéos hero 9:16 et 16:9 (AV1 + H.264, images d'attente WebP) et de l'intro logo dans `frontend2/media/` | poids ≤ 3,5 Mo en AV1 ; lecture et recherche fluides |
| 2 | **Intro = écran de chargement** : le logo s'écrit ; dès que « Lumikréa » est écrit, une barre de chargement (fil doré) apparaît ; l'animation boucle sur le passage intermédiaire (mot écrit, lampe allumée) jusqu'avant la fermeture ; à 100 % (vidéo hero téléchargée), la fermeture et la transition se jouent, puis le site apparaît à travers le voile jaune (consigne de l'utilisateur, 2026-10-22) | boucle sans saut ; la barre suit le vrai téléchargement ; aucune coupure à l'entrée du site |
| 3 | `frontend2/` : vidéo hero fixe pilotée par le scroll, choix 9:16 / 16:9 selon l'orientation | US1, US2 sur téléphone et ordinateur |
| 4 | Textes des chapitres 01 à 04 en HTML, Onest + Sacramento, mot doré écrit au scroll, sous-titres qui s'éclairent | positions conformes au brief ; aucun tic §J1 |
| 5 | Fil doré de progression et numéros de chapitres | suit le scroll dans les deux sens |
| 6 | Fin « la pièce s'éteint » + « Choisir mon format » | US3 ; aucune coupure de couleur |
| 7 | Mouvement réduit et accessibilité | US4 ; contraste |
| 8 | Nouveaux textes avec l'utilisateur, puis 16:9 affiné | validation de l'utilisateur |
| 9 | Intégration dans le front React existant + sections boutique refaites sans tics | tunnel d'achat inchangé et testé (`npm test`) |
| 10 | Audit en session neuve (SEC-9), puis mise en ligne | rapport `docs/audit-<date>.md` |

## Questions ouvertes
> Doit être **vide** (ou chaque question tranchée) pour finaliser.
- Choix d'intégration (React ou page statique servie par Hono) avant l'étape 9.
- Intro rejouée à chaque visite ou seulement à la première ?

## Historique
| Version | Date | Changement | Validé par |
|---|---|---|---|
| 0.1 | 2026-10-22 | Création ; intro en écran de chargement ajoutée à la demande de l'utilisateur | — |
