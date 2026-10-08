import { Fragment, useMemo } from 'react'
import { site, type LegalPage as LegalPageConfig } from '../config/site'
import { legalFields } from '../content/legal/fields'
import { legalTexts } from '../content/legal'
import { parseLegal, type Block, type Inline } from '../content/legal/markup'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { Link } from '../components/Link'
import { ToConfirm } from '../components/ToConfirm'
import './OrderPages.css'

function Inlines({ nodes }: { nodes: Inline[] }) {
  return nodes.map((node, index) => {
    switch (node.type) {
      case 'text':
        return <Fragment key={index}>{node.text}</Fragment>
      case 'strong':
        return (
          <strong key={index}>
            <Inlines nodes={node.children} />
          </strong>
        )
      case 'missing':
        return (
          <mark key={index} className="legal__missing">
            à compléter : {node.label}
          </mark>
        )
      case 'link':
        if (node.href.startsWith('/')) {
          return (
            <Link key={index} to={node.href}>
              <Inlines nodes={node.children} />
            </Link>
          )
        }
        return (
          <a key={index} href={node.href} {...(node.href.startsWith('http') ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>
            <Inlines nodes={node.children} />
          </a>
        )
    }
  })
}

function Blocks({ blocks }: { blocks: Block[] }) {
  return blocks.map((block, index) => {
    switch (block.type) {
      case 'heading': {
        const Heading = block.level === 2 ? 'h2' : 'h3'
        return (
          <Heading key={index} className="legal__heading">
            <Inlines nodes={block.children} />
          </Heading>
        )
      }
      case 'paragraph':
        return (
          <p key={index}>
            {block.lines.map((line, lineIndex) => (
              <Fragment key={lineIndex}>
                {lineIndex > 0 && <br />}
                <Inlines nodes={line} />
              </Fragment>
            ))}
          </p>
        )
      case 'list':
        return (
          <ul key={index} className="legal__list">
            {block.items.map((item, itemIndex) => (
              <li key={itemIndex}>
                <Inlines nodes={item} />
              </li>
            ))}
          </ul>
        )
      case 'box':
        return (
          <div key={index} className="legal__box">
            <Blocks blocks={block.blocks} />
          </div>
        )
    }
  })
}

/**
 * Pages légales. Textes dans src/content/legal/ ; l'identité du vendeur et
 * les autres valeurs {…} viennent de la configuration (site.ts, shop.ts).
 */
export function LegalPage({ page }: { page: LegalPageConfig }) {
  useDocumentTitle(page.title)
  const source = legalTexts[page.path]
  const blocks = useMemo(() => (source ? parseLegal(source, legalFields(window.location.host)) : null), [source])
  return (
    <article className="container order-page legal">
      <h1 className="order-page__title">{page.title}</h1>
      {blocks ? (
        <div className="legal__body">
          <Blocks blocks={blocks} />
        </div>
      ) : (
        <p className="lede">
          Contenu à rédiger <ToConfirm />
        </p>
      )}
      {site.contactEmail && (
        <p>
          Une question ? Écrivez-nous à <a href={`mailto:${site.contactEmail}`}>{site.contactEmail}</a>.
        </p>
      )}
      <Link to="/" className="btn btn--light">
        Retour à l’accueil
      </Link>
    </article>
  )
}

export function NotFoundPage() {
  useDocumentTitle('Page introuvable')
  return (
    <section className="container order-page order-page--center">
      <h1 className="order-page__title">Page introuvable</h1>
      <p className="lede">Cette adresse ne mène nulle part. Le tableau lumineux, lui, vous attend sur l’accueil.</p>
      <Link to="/" className="btn btn--primary">
        Retour à l’accueil
      </Link>
    </section>
  )
}
