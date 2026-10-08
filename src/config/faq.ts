import { product } from './product'
import { shop } from './shop'

export interface FaqEntry {
  question: string
  /** Réponse fondée sur des informations vérifiées. `null` si rien n'est encore établi. */
  answer: string | null
  /** Point encore ouvert, affiché avec la pastille « À confirmer ». */
  pending?: string
}

const formatList = new Intl.ListFormat('fr', { type: 'conjunction' }).format(
  product.variants.map((variant) => variant.label),
)
const delay = shop.shippingMethods[0]?.delay ?? null

// Les réponses ne reprennent que ce qui est établi (fiche CJ du produit,
// réglages de la boutique, pages légales). Pas de question sur l'âge ni la
// sécurité tant que le fabricant ne les a pas documentés.
export const faq: FaqEntry[] = [
  {
    question: 'Qu’est-ce que c’est, exactement ?',
    answer:
      'Une plaque en acrylique transparent posée sur une base lumineuse LED. On dessine ou on écrit dessus au feutre, et la lumière fait ressortir les traits.',
  },
  {
    question: 'Peut-on effacer et recommencer ?',
    answer: 'Oui : la surface s’efface à sec, puis on redessine. La plaque se réutilise autant qu’on veut.',
  },
  {
    question: 'Comment le tableau est-il alimenté ?',
    answer: 'En USB : la base se branche directement sur un port USB. L’adaptateur secteur n’est pas fourni.',
  },
  {
    question: 'Quels formats sont proposés ?',
    answer: `${product.variants.length} formats : ${formatList}.`,
  },
  {
    question: 'Quels sont les délais de livraison et les conditions de retour ?',
    answer: `Livraison offerte en France métropolitaine${delay ? `, en ${delay}` : ''}. Vous avez 14 jours après réception pour changer d’avis, et le tableau bénéficie des garanties légales. Tous les détails sont sur la page « Livraison et retours ».`,
  },
]
