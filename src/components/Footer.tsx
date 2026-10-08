import { site } from '../config/site'
import { Link } from './Link'
import './Footer.css'

const YEAR = new Date().getFullYear()

export function Footer() {
  return (
    <footer className="footer on-night">
      <div className="container footer__inner">
        <div className="footer__brand">
          <p className="footer__name">{site.brand}</p>
          <p className="footer__tagline">{site.tagline}</p>
        </div>

        <nav aria-label="Pied de page">
          <h2 className="footer__title">La page</h2>
          <ul className="footer__links">
            {site.nav.map((item) => (
              <li key={item.href}>
                <Link to={item.href}>{item.label}</Link>
              </li>
            ))}
            <li>
              <Link to="/suivi">Suivre ma commande</Link>
            </li>
          </ul>
        </nav>

        <div>
          <h2 className="footer__title">Informations</h2>
          <ul className="footer__links">
            {site.legalPages.map((page) => (
              <li key={page.path}>
                <Link to={page.path}>{page.title}</Link>
              </li>
            ))}
            {site.contactEmail && (
              <li>
                <a href={`mailto:${site.contactEmail}`}>{site.contactEmail}</a>
              </li>
            )}
          </ul>
        </div>
      </div>
      <div className="container footer__bottom">
        <p>
          © {YEAR} {site.brand}
        </p>
      </div>
    </footer>
  )
}
