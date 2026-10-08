import supportDos from '../assets/media/support-dos.webp'
import supportFace from '../assets/media/support-face.webp'
import supportProfil from '../assets/media/support-profil.webp'
import { product, type Fact } from '../config/product'
import { Reveal } from './Reveal'
import { ToConfirm } from './ToConfirm'
import './Details.css'

const SUPPORT_VIEWS = [
  { src: supportFace, height: 146, label: 'De face' },
  { src: supportDos, height: 150, label: 'De dos' },
  { src: supportProfil, height: 152, label: 'De profil' },
]

function FactList({ facts }: { facts: Fact[] }) {
  return (
    <dl className="details__list">
      {facts.map((fact) => (
        <div key={fact.label} className="details__row">
          <dt>{fact.label}</dt>
          <dd>
            {fact.value}
            {fact.value && !fact.verified && ' '}
            {!fact.verified && <ToConfirm />}
          </dd>
        </div>
      ))}
    </dl>
  )
}

export function Details() {
  return (
    <section id="details" className="section details" aria-labelledby="details-title">
      <div className="container">
        <Reveal className="details__heading">
          <p className="eyebrow eyebrow--orange">Détails</p>
          <h2 id="details-title" className="section-title">
            Ce que contient la boîte.
          </h2>
        </Reveal>

        <div className="details__columns">
          <Reveal className="details__card">
            <h3 className="details__subtitle">Dans la boîte</h3>
            <FactList facts={product.inTheBox} />
            <figure className="details__support">
              <ul className="details__support-views">
                {SUPPORT_VIEWS.map((view) => (
                  <li key={view.label}>
                    <img src={view.src} width={274} height={view.height} loading="lazy" decoding="async" alt="" />
                    <span>{view.label}</span>
                  </li>
                ))}
              </ul>
              <figcaption>Le support, vu de face, de dos et de profil (photos du fournisseur).</figcaption>
            </figure>
          </Reveal>
          <Reveal className="details__card" delay={120}>
            <h3 className="details__subtitle">Caractéristiques</h3>
            <FactList facts={product.specs} />
          </Reveal>
        </div>

        {[...product.inTheBox, ...product.specs].some((fact) => !fact.verified) && (
          <p className="details__note">
            Les informations marquées <ToConfirm /> sont en cours de vérification auprès du fabricant.
          </p>
        )}
      </div>
    </section>
  )
}
