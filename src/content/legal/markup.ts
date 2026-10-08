import type { LegalField } from './fields'

// Mise en forme des pages légales : un petit sous-ensemble de Markdown.
//   ## Titre, ### Sous-titre
//   - élément de liste (bloc dont toutes les lignes commencent par « - »)
//   > encadré (bloc dont toutes les lignes commencent par « > »)
//   **gras**, [lien](/chemin), {jeton} remplacé par une valeur de la configuration
// Les blocs sont séparés par une ligne vide ; un saut de ligne simple est conservé.
// Une ligne (ou un élément de liste) qui emploie un jeton facultatif vide est
// retirée, puis un titre resté sans contenu.

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

/** `null` si le texte emploie un jeton facultatif sans valeur : il est alors retiré. */
export function parseInline(text: string, fields: Record<string, LegalField>): Inline[] | null {
  const nodes: Inline[] = []
  let last = 0
  for (const match of text.matchAll(INLINE)) {
    if (match.index > last) nodes.push({ type: 'text', text: text.slice(last, match.index) })
    last = match.index + match[0].length
    const [whole, strong, linkText, href, token] = match
    if (strong !== undefined) {
      const children = parseInline(strong, fields)
      if (!children) return null
      nodes.push({ type: 'strong', children })
    } else if (linkText !== undefined && href !== undefined) {
      const children = parseInline(linkText, fields)
      if (!children) return null
      nodes.push({ type: 'link', href, children })
    } else {
      const field = token !== undefined ? fields[token] : undefined
      if (!field) nodes.push({ type: 'text', text: whole })
      else if (field.value === null && !field.required) return null
      else if (field.value === null) nodes.push({ type: 'missing', label: field.label })
      else if (field.href) nodes.push({ type: 'link', href: field.href, children: [{ type: 'text', text: field.value }] })
      else nodes.push({ type: 'text', text: field.value })
    }
  }
  if (last < text.length) nodes.push({ type: 'text', text: text.slice(last) })
  return nodes
}

const present = <T,>(value: T | null): value is T => value !== null

export function parseLegal(source: string, fields: Record<string, LegalField>): Block[] {
  const blocks: Block[] = []
  for (const chunk of source.trim().split(/\n[ \t]*\n/)) {
    let lines = chunk.split('\n')
    const heading = /^(#{2,3}) (.+)$/.exec(lines[0])
    if (heading) {
      const children = parseInline(heading[2], fields)
      if (children) blocks.push({ type: 'heading', level: heading[1].length as 2 | 3, children })
      lines = lines.slice(1)
      if (lines.length === 0) continue
    }
    if (lines.every((line) => line.startsWith('>'))) {
      const inner = parseLegal(lines.map((line) => line.replace(/^> ?/, '')).join('\n'), fields)
      if (inner.length > 0) blocks.push({ type: 'box', blocks: inner })
    } else if (lines[0].startsWith('- ')) {
      // Une ligne qui ne commence pas par « - » prolonge l'élément précédent.
      const items: string[] = []
      for (const line of lines) {
        if (line.startsWith('- ')) items.push(line.slice(2))
        else items[items.length - 1] += ` ${line.trim()}`
      }
      const kept = items.map((item) => parseInline(item, fields)).filter(present)
      if (kept.length > 0) blocks.push({ type: 'list', items: kept })
    } else {
      const kept = lines.map((line) => parseInline(line, fields)).filter(present)
      if (kept.length > 0) blocks.push({ type: 'paragraph', lines: kept })
    }
  }
  // Un titre suivi d'un titre de même rang (ou plus haut), ou de rien, n'a plus de contenu.
  return blocks.filter((block, index) => {
    if (block.type !== 'heading') return true
    const next = blocks.slice(index + 1).find((candidate) => candidate.type !== 'heading' || candidate.level <= block.level)
    return next !== undefined && next.type !== 'heading'
  })
}

/** Jetons {…} employés dans un texte, pour vérifier qu'ils existent tous. */
export function tokensIn(source: string): string[] {
  return [...source.matchAll(/\{([a-z]+)\}/g)].map((match) => match[1])
}
