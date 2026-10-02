import { product } from './product'

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

// Les réponses ne reprennent que ce qui est établi. Livraison, retours,
// garantie, âge et sécurité dépendent de politiques qui restent à fournir.
export const faq: FaqEntry[] = [
  {
    question: 'Qu’est-ce que c’est, exactement ?',
    answer:
      'Une plaque en acrylique transparent posée sur une base lumineuse LED. On dessine ou on écrit dessus aux feutres, et la lumière fait ressortir les traits.',
  },
  {
    question: 'Peut-on effacer et recommencer ?',
    answer: 'Oui, la surface est effaçable : on efface, puis on redessine.',
    pending: 'Méthode d’effaçage recommandée',
  },
  {
    question: 'Comment le tableau est-il alimenté ?',
    answer: 'En USB.',
    pending: 'Câble et adaptateur secteur fournis ou non',
  },
  {
    question: 'Quels formats sont proposés ?',
    answer: `${product.variants.length} formats : ${formatList}.`,
  },
  {
    question: 'À partir de quel âge peut-on l’utiliser ?',
    answer: null,
    pending: 'Âge conseillé et consignes de sécurité',
  },
  {
    question: 'Quels sont les délais de livraison et les conditions de retour ?',
    answer: null,
    pending: 'Livraison, retours et garantie',
  },
]
