import { SectionReveal } from '@/components/motion/SectionReveal'
import { site } from '@/content/site'

export function Work() {
  return (
    <SectionReveal id="work" className="section" aria-labelledby="work-title">
      <h2 id="work-title" className="section__title">
        {site.work.title}
      </h2>
      <div className="work-placeholder" role="status">
        {site.work.placeholder}
      </div>
    </SectionReveal>
  )
}
