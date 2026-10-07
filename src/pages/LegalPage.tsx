import { ToConfirm } from '../components/ToConfirm'
import { site, type LegalPage as LegalPageConfig } from '../config/site'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { Link } from '../components/Link'
import './OrderPages.css'

/**
 * Pages légales. Leur texte dépend du marché visé et de ta structure
 * juridique : il n'est pas rédigé ici. Renseigne `body` dans src/config/site.ts.
 */
export function LegalPage({ page }: { page: LegalPageConfig }) {
  useDocumentTitle(page.title)
  return (
    <article className="container order-page legal">
      <h1 className="order-page__title">{page.title}</h1>
      {page.body ? (
        page.body.split('\n\n').map((paragraph, index) => <p key={index}>{paragraph}</p>)
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
