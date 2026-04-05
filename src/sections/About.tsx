import { motion } from 'framer-motion'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'
import { site } from '@/content/site'

import kevinSmiling from '../../raw/kevin/kevin-smiling.png'
import kevinExplaining from '../../raw/kevin/kevin-explaining.png'
import kevinCoding from '../../raw/kevin/kevin-coding.png'
import kevinEducating from '../../raw/kevin/kevin-educating.png'

const photos = [
  { src: kevinSmiling,    alt: 'Kevin networking at a Shopify event',        area: 'ph1' },
  { src: kevinExplaining, alt: 'Kevin working through a build at his laptop', area: 'ph2' },
  { src: kevinCoding,     alt: 'Kevin consulting side-by-side with a client', area: 'ph3' },
  { src: kevinEducating,  alt: 'Kevin walking a client through their store',  area: 'ph4' },
]

const ease = [0.22, 1, 0.36, 1] as const

/** Entry animation per tile — different origins for visual depth */
const variants = {
  ph1:  { hidden: { opacity: 0, y:  40       }, visible: { opacity: 1, y: 0, x: 0 } },
  ph2:  { hidden: { opacity: 0, y: -30       }, visible: { opacity: 1, y: 0, x: 0 } },
  ph3:  { hidden: { opacity: 0, x: -30       }, visible: { opacity: 1, y: 0, x: 0 } },
  ph4:  { hidden: { opacity: 0, x: -20, y: 20 }, visible: { opacity: 1, y: 0, x: 0 } },
  copy: { hidden: { opacity: 0, x:  50       }, visible: { opacity: 1, y: 0, x: 0 } },
} as const

const delays = { ph1: 0, ph2: 0.1, ph3: 0.18, ph4: 0.26, copy: 0.12 }

export function About() {
  const reduceMotion = usePrefersReducedMotion()

  return (
    <section id="about" className="section about" aria-labelledby="about-title">
      {/* Visually hidden — keeps nav anchor + a11y tree intact */}
      <h2 id="about-title" className="sr-only">About</h2>

      <div className="about-bento">
        {/* ── Photo tiles ── */}
        {photos.map(({ src, alt, area }) => {
          const v = variants[area as keyof typeof variants]
          const delay = delays[area as keyof typeof delays]
          return (
            <motion.div
              key={area}
              className={`about-bento__tile about-bento__tile--${area}`}
              initial={reduceMotion ? v.visible : v.hidden}
              whileInView={v.visible}
              viewport={{ once: true, margin: '-8% 0px' }}
              transition={{ duration: reduceMotion ? 0 : 0.65, delay: reduceMotion ? 0 : delay, ease }}
              whileHover={reduceMotion ? {} : { scale: 1.025, transition: { duration: 0.3, ease } }}
            >
              <div className="about-bento__img-wrap">
                <img
                  src={src}
                  alt={alt}
                  className="about-bento__img"
                  loading="lazy"
                  draggable={false}
                />
              </div>
            </motion.div>
          )
        })}

        {/* ── Copy tile ── */}
        <motion.div
          className="about-bento__tile about-bento__tile--copy"
          initial={reduceMotion ? variants.copy.visible : variants.copy.hidden}
          whileInView={variants.copy.visible}
          viewport={{ once: true, margin: '-8% 0px' }}
          transition={{ duration: reduceMotion ? 0 : 0.65, delay: reduceMotion ? 0 : delays.copy, ease }}
        >
          <span className="about-bento__eyebrow">About</span>

          {site.about.paragraphs.map((p, i) => (
            <motion.p
              key={i}
              className={[
                'about-bento__para',
                i === 0 ? 'about-bento__para--lead'   : '',
                i === 1 ? 'about-bento__para--accent' : '',
              ].join(' ').trim()}
              initial={reduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{
                duration: reduceMotion ? 0 : 0.5,
                delay:    reduceMotion ? 0 : delays.copy + 0.2 + i * 0.1,
                ease,
              }}
            >
              {p}
            </motion.p>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
