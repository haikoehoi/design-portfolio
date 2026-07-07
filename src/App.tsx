import { Hero } from './sections/Hero/Hero'

export default function App() {
  return (
    <>
      <Hero />

      {/* Секции ниже линии сгиба — заглушки, наполняются в следующих итерациях */}
      <main>
        <section id="work" className="section" aria-label="Selected work" />
        <section id="about" className="section" aria-label="About" />
        <section id="contact" className="section" aria-label="Contact" />
      </main>
    </>
  )
}
