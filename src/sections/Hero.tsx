import { ScrollCanvasSequence } from '@/components/scroll/ScrollCanvasSequence'
import { site } from '@/content/site'

export function Hero() {
  return (
    <section id="top" className="hero" aria-labelledby="hero-title">
      <h1 id="hero-title" className="hero__title">
        {site.hero.title}
      </h1>
      <p className="hero__subtitle">{site.hero.subtitle}</p>
      <a className="button" href="#contact">
        {site.hero.cta} →
      </a>
      <div style={{ marginTop: 'var(--space-12)' }}>
        <ScrollCanvasSequence />
      </div>
    </section>
  )
}
