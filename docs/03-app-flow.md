---
document: "App Flow — parcours de l'application"
statut: brouillon        # brouillon | finalisé — seul l'utilisateur valide le passage à « finalisé » (R-001)
version: 0.1
date: 2026-10-22
valide_par: ""
---

# 03 — App Flow : parcours de la page d'accueil immersive

## Parcours principal (mobile d'abord)
```mermaid
flowchart TD
  A[Arrivée sur la page] --> B[Intro logo 9:16 ou 16:9]
  B --> C[Hero : le scroll fait avancer la vidéo]
  C --> D[01 LE GESTE · l'enfant dessine]
  D --> E[02 LE FIL · la lumière traverse la maison]
  E --> F[03 LE LIEN · chambre des parents]
  F --> G[04 LE MOT · Bonne nuit sur la plaque]
  G --> H[La pièce s'éteint · La nuit s'allume de leurs idées]
  H --> I[Choisir mon format]
  I --> J[Tunnel d'achat existant : panier, commande, paiement]
```

## Écrans et états
| Écran | Déclencheur | Chargement | Réussite | Erreur | Écran suivant |
|---|---|---|---|---|---|
| Intro logo | ouverture de la page | fond Nuit + logo fixe tant que la vidéo n'est pas prête | animation jouée une fois | vidéo indisponible : logo fixe 1 s | hero |
| Hero (plan-séquence) | scroll | image d'attente WebP du format affiché | la vidéo suit le scroll dans les deux sens | vidéo indisponible : images clés fixes + textes | fin |
| Chapitres 01 à 04 | position du scroll | — | titre, mot doré écrit, sous-titre qui s'éclaire | — | chapitre suivant |
| Fin « la pièce s'éteint » | fin de la vidéo | — | pièce assombrie, phrase finale, bouton | — | formats |
| Formats (prototype : ancre) | bouton « Choisir mon format » | — | défilement vers la section | — | tunnel existant |

## Raccourcis
- Bouton « Choisir mon format » du header : saute le hero (US3).
- Mouvement réduit : pas de vidéo pilotée, les quatre chapitres s'affichent sur leurs images clés.

## Questions ouvertes
> Doit être **vide** (ou chaque question tranchée) pour finaliser.
- L'intro est-elle rejouée à chaque visite ?

## Historique
| Version | Date | Changement | Validé par |
|---|---|---|---|
| 0.1 | 2026-10-22 | Création | — |
