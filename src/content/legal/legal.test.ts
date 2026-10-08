import { describe, expect, it } from 'vitest'
import { site } from '../../config/site'
import { legalFields, type LegalField } from './fields'
import { legalTexts } from './index'
import { parseLegal, tokensIn } from './markup'

const fields: Record<string, LegalField> = {
  vendeur: { label: 'nom du vendeur', value: 'Camille Martin EI', required: true },
  adresse: { label: 'adresse', value: null, required: true },
  email: { label: 'e-mail', value: 'bonjour@exemple.fr', href: 'mailto:bonjour@exemple.fr', required: true },
}

describe('pages légales', () => {
  it('existe pour chaque page du pied de page', () => {
    for (const page of site.legalPages) expect(legalTexts[page.path], page.path).toBeTruthy()
  })

  it('n’emploie que des jetons connus', () => {
    const known = Object.keys(legalFields())
    for (const [path, text] of Object.entries(legalTexts)) {
      for (const token of tokensIn(text)) expect(known, `${path} : {${token}}`).toContain(token)
    }
  })

  it('met en forme titres, listes, encadrés, gras, liens et jetons', () => {
    const blocks = parseLegal(
      [
        '## Vendeur',
        '**{vendeur}**\n{adresse}',
        '- écrire à {email} ;\n- voir les [CGV](/cgv).',
        '> Encadré\n>\n> - 1° premier',
        'Jeton inconnu : {inconnu}.',
      ].join('\n\n'),
      fields,
    )
    expect(blocks).toEqual([
      { type: 'heading', level: 2, children: [{ type: 'text', text: 'Vendeur' }] },
      {
        type: 'paragraph',
        lines: [[{ type: 'strong', children: [{ type: 'text', text: 'Camille Martin EI' }] }], [{ type: 'missing', label: 'adresse' }]],
      },
      {
        type: 'list',
        items: [
          [
            { type: 'text', text: 'écrire à ' },
            { type: 'link', href: 'mailto:bonjour@exemple.fr', children: [{ type: 'text', text: 'bonjour@exemple.fr' }] },
            { type: 'text', text: ' ;' },
          ],
          [
            { type: 'text', text: 'voir les ' },
            { type: 'link', href: '/cgv', children: [{ type: 'text', text: 'CGV' }] },
            { type: 'text', text: '.' },
          ],
        ],
      },
      {
        type: 'box',
        blocks: [
          { type: 'paragraph', lines: [[{ type: 'text', text: 'Encadré' }]] },
          { type: 'list', items: [[{ type: 'text', text: '1° premier' }]] },
        ],
      },
      { type: 'paragraph', lines: [[{ type: 'text', text: 'Jeton inconnu : ' }, { type: 'text', text: '{inconnu}' }, { type: 'text', text: '.' }]] },
    ])
  })
})
