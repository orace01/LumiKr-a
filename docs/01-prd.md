---
document: "PRD — exigences produit"
statut: brouillon        # brouillon | finalisé — seul l'utilisateur valide le passage à « finalisé » (R-001)
version: 0.1
date: 2026-10-22
valide_par: ""
---

# 01 — PRD : refonte immersive de la page d'accueil Lumikréa

> Périmètre : la **page d'accueil** de www.lumikrea.store devient un site immersif au scroll (« Continuous Spatial Flow »). Le tunnel d'achat existant (panier, commande, paiement Mepaye, CJ, suivi) est conservé tel quel. Source : passation vibe-brain `documents/projet-lumikrea-site-anime/source-et-parcours.md`.

## Le produit en une phrase
- **Nom** : Lumikréa — tableau lumineux à dessiner (plaque d'acrylique effaçable sur base LED en bois clair, USB), formats 12×12, 15×15, 20×20, 30×20 cm.
- **Problème résolu** : la page actuelle explique le produit mais ne fait pas ressentir le moment du soir (le dessin qui s'allume, le mot laissé à quelqu'un) ; elle a l'air d'un site « fait par l'IA » et ne se distingue pas.

## Utilisateurs cibles
| Profil | Besoin principal | Contexte d'usage |
|---|---|---|
| Parent d'enfant de 3 à 10 ans | Un rituel du soir doux, une veilleuse que l'enfant crée lui-même | Mobile, souvent le soir, arrivée depuis TikTok ou Instagram |
| Personne qui offre un cadeau | Un objet personnel et original | Mobile ou ordinateur, période de fêtes |
| Commerçant, café | Un menu du jour lumineux qu'on change à volonté | Ordinateur |

## Problème et solution actuelle
- **Ce qui fait mal aujourd'hui** : la page d'accueil accumule les tics « look IA » (étiquettes-pastilles, mots surlignés, cartes 1-2-3, bandeau qui défile) et met en avant les photos du fournisseur ; l'émotion du produit allumé n'apparaît pas au premier écran.
- **Ce que les utilisateurs font à la place** : ils quittent la page ou achètent des veilleuses génériques.

## Objectif et mesure du succès
- **Résultat visé** : dès le premier écran, le visiteur vit le parcours de la lumière (dessin de l'enfant → fil doré → « Bonne nuit » chez les parents), puis arrive au choix du format sans rupture.
- **Indicateur mesurable** : taux de clic sur « Choisir mon format » et taux d'ajout au panier, comparés à la page actuelle ; page fluide sur téléphone (pas de saccade au scroll, hero affiché en moins de 2 s en 4G).

## Fonctionnalités principales
| ID | Fonctionnalité | Bénéfice pour l'utilisateur | Priorité |
|---|---|---|---|
| F1 | Intro logo animée (9:16 sur mobile, 16:9 sur ordinateur) | Entrée de marque, le temps que le hero se charge | P2 |
| F2 | Hero en plan-séquence piloté par le scroll (vidéo 9:16 / 16:9) | Vivre l'histoire du produit en avançant | P1 |
| F3 | Textes de chapitres posés sur la vidéo (capitales Onest + mot doré Sacramento, sous-titres qui s'éclairent mot à mot) | Comprendre l'histoire sans casser l'image | P1 |
| F4 | Fil doré de progression au bord gauche, numéros de chapitres | Savoir où l'on en est | P2 |
| F5 | Fin « la pièce s'éteint » puis bouton « Choisir mon format » sur le même bleu nuit | Passer de l'émotion à l'achat sans coupure | P1 |
| F6 | Sections boutique refaites sans tics « look IA » (format, détails, questions) branchées sur le panier existant | Acheter | P1 (étape suivante) |

## Hors périmètre de la version 1
- Backend, paiement, CJ, pages légales, suivi : inchangés.
- Version anglaise.
- Écriture « Bonne nuit » animée en SVG sur la plaque (déjà présente dans la vidéo).

## User stories
| ID | En tant que… | je veux… | pour… | Fonctionnalité |
|---|---|---|---|---|
| US1 | visiteur sur téléphone | voir l'histoire avancer quand je fais défiler | comprendre ce que fait le produit sans lire | F2, F3 |
| US2 | visiteur | pouvoir remonter et revoir un passage | prendre mon temps | F2 |
| US3 | visiteur pressé | aller directement au choix du format | acheter vite | F5 |
| US4 | visiteur qui a réduit les animations | voir les images clés et les textes sans mouvement | être à l'aise | F2, F3 |

## Critères d'acceptation
| User story | Étant donné… | Quand… | Alors (résultat visible)… |
|---|---|---|---|
| US1 | un téléphone en portrait | je fais défiler la page | la vidéo 9:16 avance image par image avec le scroll et les chapitres 01 à 04 apparaissent à leurs moments |
| US2 | le hero à mi-parcours | je remonte | la vidéo recule sans saut et les textes reviennent |
| US3 | n'importe quel point du hero | je touche « Choisir mon format » (header ou fin) | j'arrive à la section des formats |
| US4 | `prefers-reduced-motion: reduce` | j'ouvre la page | je vois des images fixes et les textes, sans vidéo pilotée |
| US1 | un ordinateur en paysage | je fais défiler | la vidéo 16:9 est utilisée et les textes passent sur les côtés |

## Questions ouvertes
> Doit être **vide** (ou chaque question tranchée) pour finaliser.
- Le texte des chapitres « n'est pas encore ça » (utilisateur, 2026-10-22) : nouvelles phrases à écrire ensemble dans le prototype.
- Valeur unique du bleu de fond : #17182D (moodboard) ou #0B0A1B (intro) ?
- L'intro logo est-elle jouée à chaque visite ou seulement à la première ?

## Historique
| Version | Date | Changement | Validé par |
|---|---|---|---|
| 0.1 | 2026-10-22 | Création à partir de la passation du 2026-10-21/22 | — |
