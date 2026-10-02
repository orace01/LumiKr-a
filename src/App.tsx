import { Demonstration } from './components/Demonstration'
import { Details } from './components/Details'
import { Faq } from './components/Faq'
import { Finale } from './components/Finale'
import { Footer } from './components/Footer'
import { Formats } from './components/Formats'
import { GiantWords } from './components/GiantWords'
import { Header } from './components/Header'
import { Hero } from './components/Hero'
import { Intro } from './components/Intro'
import { Usages } from './components/Usages'

// Les trois usages, annoncés en mots géants juste avant leur section.
const USAGE_WORDS = [
  { text: 'Créer', color: 'var(--primary)' },
  { text: 'Décorer', color: 'var(--orange)' },
  { text: 'Annoncer', color: 'var(--blue)' },
]

export default function App() {
  return (
    <>
      <a className="skip-link" href="#contenu">
        Aller au contenu
      </a>
      <Header />
      <main id="contenu">
        <Hero />
        <Intro />
        <Demonstration />
        <GiantWords words={USAGE_WORDS} />
        <Usages />
        <Formats />
        <Details />
        <Faq />
        <Finale />
      </main>
      <Footer />
    </>
  )
}
