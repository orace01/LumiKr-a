import ambiance from '../assets/media/ambiance.webp'
import packshot from '../assets/media/packshot.webp'
import stillNuit from '../assets/media/still-nuit.webp'
import { Reveal } from './Reveal'
import './Usages.css'

export function Usages() {
  return (
    <section id="usages" className="section usages" aria-labelledby="usages-title">
      <div className="container">
        <Reveal className="usages__heading">
          <p className="eyebrow">Usages</p>
          <h2 id="usages-title" className="section-title">
            Un tableau, <span className="highlight highlight--pink">trois façons</span> de s’en servir.
          </h2>
        </Reveal>

        <div className="usages__grid">
          <Reveal className="usage usage--create">
            <article>
              <div className="usage__media usage__media--packshot">
                <img
                  src={packshot}
                  width={1000}
                  height={1000}
                  loading="lazy"
                  decoding="async"
                  alt="Le tableau carré sur sa base lumineuse, avec une sirène, des poissons et des algues dessinés aux feutres de couleur."
                />
              </div>
              <div className="usage__body">
                <p className="eyebrow">Créer</p>
                <h3>Un dessin aujourd’hui, un autre demain.</h3>
                <p>
                  Sirène, fusée ou prénom en couleurs : la plaque se remplit, s’illumine, puis repart de zéro pour
                  l’idée suivante.
                </p>
              </div>
            </article>
          </Reveal>

          <Reveal className="usage usage--decorate" delay={100}>
            <article>
              <div className="usage__media">
                <img
                  src={ambiance}
                  width={680}
                  height={620}
                  loading="lazy"
                  decoding="async"
                  alt="Le tableau posé sur un meuble, incliné sur son support, avec un dessin de fête éclairé par la base."
                />
              </div>
              <div className="usage__body">
                <p className="eyebrow eyebrow--orange">Décorer</p>
                <h3>Une déco qui change avec vos envies.</h3>
                <p>Sur un bureau ou une étagère, le tableau affiche le motif du moment : une saison, une fête, une humeur.</p>
              </div>
            </article>
          </Reveal>

          <Reveal className="usage usage--announce" delay={200}>
            <article>
              <div className="usage__media">
                <img
                  src={stillNuit}
                  width={1600}
                  height={900}
                  loading="lazy"
                  decoding="async"
                  alt="Le tableau éclairé dans le noir : lettres multicolores, sapins verts et bonhomme de neige ressortent nettement."
                />
              </div>
              <div className="usage__body">
                <p className="eyebrow eyebrow--green">Annoncer</p>
                <h3>Votre message, visible même dans le noir.</h3>
                <p>
                  Menu du jour, mot d’accueil, suggestion du soir : au comptoir d’un bar ou d’une boutique, le message
                  s’éclaire et se réécrit quand vous voulez.
                </p>
              </div>
            </article>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
