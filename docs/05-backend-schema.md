---
document: "Schéma backend"
statut: brouillon        # brouillon | finalisé — seul l'utilisateur valide le passage à « finalisé » (R-001)
version: 0.1
date: 2026-10-22
valide_par: ""
---

# 05 — Schéma backend

## Portée
La refonte immersive ne change **pas** le backend. Ce document résume l'existant pour que l'intégration ne le casse pas.

## Existant
| Élément | Où | Rôle |
|---|---|---|
| Serveur Hono | `server/` | API du site, déployée sur Vercel (`scripts/vercel-output.mjs`) |
| Commandes | Redis | création, statut, idempotence de l'envoi à CJ |
| Paiement | `server/payment/mepaye.ts` | page hébergée Mepaye, confirmation par notification serveur |
| Expédition | `server/fulfillment/cj.ts`, `cj-client.ts` | transmission de la commande payée à CJdropshipping |
| E-mails | nodemailer | confirmation de commande au client |
| Prix | `src/config/product.ts` | recalculés côté serveur, jamais pris du navigateur |

## Impact du prototype `frontend2/`
- Aucun appel API, aucune donnée stockée, aucun secret.
- À l'intégration : le bouton « Choisir mon format » mène à la section des formats du front existant, qui garde l'ajout au panier et le tunnel actuels.

## Questions ouvertes
> Doit être **vide** (ou chaque question tranchée) pour finaliser.
- Aucune pour la refonte.

## Historique
| Version | Date | Changement | Validé par |
|---|---|---|---|
| 0.1 | 2026-10-22 | Création | — |
