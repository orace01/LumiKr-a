import { Playground } from './Playground'
import { Reveal } from './Reveal'
import './Demonstration.css'

export function Demonstration() {
  return (
    <section id="demonstration" className="demo" aria-labelledby="demo-title">
      <div className="container demo__inner">
        <Reveal className="demo__heading">
          <p className="eyebrow eyebrow--green">À vous d’essayer</p>
          <h2 id="demo-title" className="section-title">
            Dessinez, puis éteignez la pièce.
          </h2>
        </Reveal>
        <Reveal>
          <Playground />
        </Reveal>
      </div>
    </section>
  )
}
