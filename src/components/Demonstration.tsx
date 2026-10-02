import stillGeste from '../assets/media/still-geste.webp'
import stillFeutres from '../assets/media/still-feutres.webp'
import { Doodle } from './Doodle'
import { Playground } from './Playground'
import { Reveal } from './Reveal'
import './Demonstration.css'

const STEPS = [
  {
    color: 'var(--glow)',
    title: 'Dessinez',
    text: 'Un prénom, un animal, un mot doux : les feutres de couleur glissent sur la plaque transparente.',
  },
  {
    color: 'var(--pink)',
    title: 'La lumière révèle',
    text: 'La base LED éclaire la plaque par le bas et fait ressortir chaque trait, même dans une pièce sombre.',
  },
  {
    color: 'var(--green)',
    title: 'Effacez, recommencez',
    text: 'La surface est effaçable : le tableau change aussi souvent que les idées.',
  },
]

export function Demonstration() {
  return (
    <section id="demonstration" className="section demo" aria-labelledby="demo-title">
      <div className="container">
        <div className="demo__intro">
          <Reveal className="demo__text">
            <p className="eyebrow eyebrow--pink">Le principe</p>
            <h2 id="demo-title" className="section-title">
              Une plaque, des feutres, et la <span className="highlight">lumière</span> fait le reste.
            </h2>
            <p className="lede">
              Le trait posé sur l’acrylique s’allume grâce à la base LED, et le dessin du jour devient l’objet lumineux
              de la pièce.
            </p>
          </Reveal>

          <div className="demo__stills">
            <Doodle shape="zigzag" color="var(--orange)" className="demo__doodle" />
            <Reveal className="demo__still demo__still--large">
              <img
                src={stillGeste}
                width={864}
                height={864}
                loading="lazy"
                decoding="async"
                alt="Une main trace un motif jaune au feutre sur le tableau éclairé, à côté d’un bonhomme de neige et de sapins dessinés."
              />
            </Reveal>
            <Reveal className="demo__still demo__still--small" delay={120}>
              <img
                src={stillFeutres}
                width={864}
                height={864}
                loading="lazy"
                decoding="async"
                alt="Une main tient plusieurs feutres de couleur devant le tableau illuminé."
              />
            </Reveal>
            <p className="demo__credit">Images extraites de la vidéo du produit.</p>
          </div>
        </div>

        <ol className="demo__steps">
          {STEPS.map((step, index) => (
            <li key={step.title}>
              <Reveal className="demo__step" delay={index * 90}>
                <span className="demo__number" aria-hidden="true" style={{ background: step.color }}>
                  {index + 1}
                </span>
                <h3>{step.title}</h3>
                <p>{step.text}</p>
              </Reveal>
            </li>
          ))}
        </ol>

        <div className="demo__try">
          <Reveal className="demo__try-heading">
            <p className="eyebrow eyebrow--green">À vous d’essayer</p>
            <h3 className="demo__try-title">Dessinez, puis éteignez la pièce.</h3>
          </Reveal>
          <Reveal>
            <Playground />
          </Reveal>
        </div>
      </div>
    </section>
  )
}
