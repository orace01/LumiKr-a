import feutres from '../assets/media/feutres.webp'
import { product, type Fact } from '../config/product'
import { Reveal } from './Reveal'
import { ToConfirm } from './ToConfirm'
import './Details.css'

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
            <img
              className="details__photo"
              src={feutres}
              width={262}
              height={212}
              loading="lazy"
              decoding="async"
              alt="Sept feutres alignés : blanc, violet, vert, bleu, orange, rose et jaune."
            />
            <FactList facts={product.inTheBox} />
          </Reveal>
          <Reveal className="details__card" delay={120}>
            <h3 className="details__subtitle">Caractéristiques</h3>
            <FactList facts={product.specs} />
          </Reveal>
        </div>

        <p className="details__note">
          Les informations marquées <ToConfirm /> sont en cours de vérification auprès du fabricant.
        </p>
      </div>
    </section>
  )
}
