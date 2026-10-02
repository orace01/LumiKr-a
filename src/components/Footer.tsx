import { site } from '../config/site'
import { ToConfirm } from './ToConfirm'
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
                <a href={item.href}>{item.label}</a>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <h2 className="footer__title">Informations</h2>
          <ul className="footer__links">
            {site.legalLinks.map((link) => (
              <li key={link.label}>
                {link.href ? (
                  <a href={link.href}>{link.label}</a>
                ) : (
                  <>
                    {link.label} <ToConfirm />
                  </>
                )}
              </li>
            ))}
            <li>
              {site.contactEmail ? (
                <a href={`mailto:${site.contactEmail}`}>{site.contactEmail}</a>
              ) : (
                <>
                  Contact <ToConfirm />
                </>
              )}
            </li>
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
