import type { ReactNode } from 'react'
import { motion, type HTMLMotionProps } from 'framer-motion'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'

type SectionRevealProps = Omit<HTMLMotionProps<'section'>, 'children'> & {
  children: ReactNode
}

const visible = { opacity: 1, y: 0 }
const hidden = { opacity: 0, y: 18 }

export function SectionReveal({ children, ...rest }: SectionRevealProps) {
  const reduceMotion = usePrefersReducedMotion()

  return (
    <motion.section
      {...rest}
      initial={reduceMotion ? visible : hidden}
      whileInView={visible}
      viewport={{ once: true, margin: '-12% 0px' }}
      transition={{
        duration: reduceMotion ? 0 : 0.55,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      {children}
    </motion.section>
  )
}
