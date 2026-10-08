import cgv from './cgv.md?raw'
import confidentialite from './confidentialite.md?raw'
import livraisonRetours from './livraison-retours.md?raw'
import mentionsLegales from './mentions-legales.md?raw'

/**
 * Texte de chaque page légale, par adresse (voir `legalPages` dans
 * src/config/site.ts). Mise en forme décrite dans markup.ts ; les jetons {…}
 * sont remplis depuis la configuration (fields.ts).
 */
export const legalTexts: Record<string, string> = {
  '/mentions-legales': mentionsLegales,
  '/cgv': cgv,
  '/confidentialite': confidentialite,
  '/livraison-retours': livraisonRetours,
}
