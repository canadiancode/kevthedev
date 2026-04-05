import { SectionReveal } from '@/components/motion/SectionReveal'
import { site } from '@/content/site'

export function About() {
  return (
    <SectionReveal id="about" className="section" aria-labelledby="about-title">
      <h2 id="about-title" className="section__title">
        About
      </h2>
      {site.about.paragraphs.map((p) => (
        <p key={p} className="section__lead" style={{ marginBottom: 'var(--space-4)' }}>
          {p}
        </p>
      ))}
    </SectionReveal>
  )
}
