import type { LegalField } from './fields'

// Mise en forme des pages légales : un petit sous-ensemble de Markdown.
//   ## Titre, ### Sous-titre
//   - élément de liste (bloc dont toutes les lignes commencent par « - »)
//   > encadré (bloc dont toutes les lignes commencent par « > »)
//   **gras**, [lien](/chemin), {jeton} remplacé par une valeur de la configuration
// Les blocs sont séparés par une ligne vide ; un saut de ligne simple est conservé.

export type Inline =
  | { type: 'text'; text: string }
  | { type: 'strong'; children: Inline[] }
  | { type: 'link'; href: string; children: Inline[] }
  | { type: 'missing'; label: string }

export type Block =
  | { type: 'heading'; level: 2 | 3; children: Inline[] }
  | { type: 'paragraph'; lines: Inline[][] }
  | { type: 'list'; items: Inline[][] }
  | { type: 'box'; blocks: Block[] }

const INLINE = /\*\*(.+?)\*\*|\[([^\]]+)\]\(([^)\s]+)\)|\{([a-z]+)\}/g

export function parseInline(text: string, fields: Record<string, LegalField>): Inline[] {
  const nodes: Inline[] = []
  let last = 0
  for (const match of text.matchAll(INLINE)) {
    if (match.index > last) nodes.push({ type: 'text', text: text.slice(last, match.index) })
    last = match.index + match[0].length
    const [whole, strong, linkText, href, token] = match
    if (strong !== undefined) {
      nodes.push({ type: 'strong', children: parseInline(strong, fields) })
    } else if (linkText !== undefined && href !== undefined) {
      nodes.push({ type: 'link', href, children: parseInline(linkText, fields) })
    } else {
      const field = token !== undefined ? fields[token] : undefined
      if (!field) nodes.push({ type: 'text', text: whole })
      else if (field.value === null) nodes.push({ type: 'missing', label: field.label })
      else if (field.href) nodes.push({ type: 'link', href: field.href, children: [{ type: 'text', text: field.value }] })
      else nodes.push({ type: 'text', text: field.value })
    }
  }
  if (last < text.length) nodes.push({ type: 'text', text: text.slice(last) })
  return nodes
}

export function parseLegal(source: string, fields: Record<string, LegalField>): Block[] {
  const blocks: Block[] = []
  for (const chunk of source.trim().split(/\n[ \t]*\n/)) {
    let lines = chunk.split('\n')
    const heading = /^(#{2,3}) (.+)$/.exec(lines[0])
    if (heading) {
      blocks.push({ type: 'heading', level: heading[1].length as 2 | 3, children: parseInline(heading[2], fields) })
      lines = lines.slice(1)
      if (lines.length === 0) continue
    }
    if (lines.every((line) => line.startsWith('>'))) {
      const inner = lines.map((line) => line.replace(/^> ?/, '')).join('\n')
      blocks.push({ type: 'box', blocks: parseLegal(inner, fields) })
    } else if (lines[0].startsWith('- ')) {
      // Une ligne qui ne commence pas par « - » prolonge l'élément précédent.
      const items: string[] = []
      for (const line of lines) {
        if (line.startsWith('- ')) items.push(line.slice(2))
        else items[items.length - 1] += ` ${line.trim()}`
      }
      blocks.push({ type: 'list', items: items.map((item) => parseInline(item, fields)) })
    } else {
      blocks.push({ type: 'paragraph', lines: lines.map((line) => parseInline(line, fields)) })
    }
  }
  return blocks
}

/** Jetons {…} employés dans un texte, pour vérifier qu'ils existent tous. */
export function tokensIn(source: string): string[] {
  return [...source.matchAll(/\{([a-z]+)\}/g)].map((match) => match[1])
}
