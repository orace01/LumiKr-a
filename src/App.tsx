import { Demonstration } from './components/Demonstration'
import { Details } from './components/Details'
import { Faq } from './components/Faq'
import { Footer } from './components/Footer'
import { Formats } from './components/Formats'
import { Header } from './components/Header'
import { Hero } from './components/Hero'
import { Usages } from './components/Usages'

export default function App() {
  return (
    <>
      <a className="skip-link" href="#contenu">
        Aller au contenu
      </a>
      <Header />
      <main id="contenu">
        <Hero />
        <Demonstration />
        <Usages />
        <Formats />
        <Details />
        <Faq />
      </main>
      <Footer />
    </>
  )
}
