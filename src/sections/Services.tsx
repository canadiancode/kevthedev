import { motion } from 'framer-motion'
import { SectionReveal } from '@/components/motion/SectionReveal'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'
import { site } from '@/content/site'

export function Services() {
  const reduceMotion = usePrefersReducedMotion()

  return (
    <SectionReveal id="services" className="section" aria-labelledby="services-title">
      <h2 id="services-title" className="section__title">
        {site.services.title}
      </h2>
      <div className="service-grid">
        {site.services.items.map((item) => (
          <motion.article
            key={item.title}
            className="service-card"
            whileHover={reduceMotion ? undefined : { y: -4 }}
            transition={{ type: 'spring', stiffness: 420, damping: 28 }}
          >
            <div className="service-card__icon" aria-hidden>
              {item.icon}
            </div>
            <h3 className="service-card__title">{item.title}</h3>
            <p className="service-card__body">{item.body}</p>
          </motion.article>
        ))}
      </div>
    </SectionReveal>
  )
}
