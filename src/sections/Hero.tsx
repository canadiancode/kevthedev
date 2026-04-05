import {
  AnimatePresence,
  motion,
  useMotionValue,
  useMotionValueEvent,
} from 'framer-motion'
import { useState } from 'react'
import { HeroCloudBlobs } from '@/components/hero/HeroCloudBlobs'
import { ScrollCanvasSequence } from '@/components/scroll/ScrollCanvasSequence'
import { site } from '@/content/site'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'

const easeOut = [0.22, 1, 0.36, 1] as const

function heroFrameIndexForProgress(p: number): 0 | 1 | 2 {
  if (p < 1 / 3) return 0
  if (p < 2 / 3) return 1
  return 2
}

type HeroCopySceneProps = {
  sceneIndex: 0 | 1 | 2
  reduceMotion: boolean
}

function HeroCopyScene({ sceneIndex, reduceMotion }: HeroCopySceneProps) {
  const [headline, supporting] = site.hero.frames[sceneIndex].lines
  const showCta = sceneIndex !== 1

  const lineTransition = reduceMotion
    ? { duration: 0 }
    : { duration: 0.42, ease: easeOut }

  const lineVariants = {
    hidden: reduceMotion
      ? { opacity: 1, y: 0 }
      : { opacity: 0, y: 22 },
    visible: {
      opacity: 1,
      y: 0,
      transition: lineTransition,
    },
    exit: reduceMotion
      ? { opacity: 1, y: 0 }
      : { opacity: 0, y: -14, transition: { duration: 0.28, ease: easeOut } },
  }

  const sceneVariants = {
    hidden: {},
    visible: {
      transition: reduceMotion
        ? { duration: 0 }
        : {
            staggerChildren: 0.085,
            delayChildren: 0.05,
          },
    },
    exit: {
      transition: reduceMotion
        ? { duration: 0 }
        : {
            staggerChildren: 0.045,
            staggerDirection: -1 as const,
            when: 'afterChildren' as const,
          },
    },
  }

  return (
    <motion.div
      className="hero__sequence-scene"
      variants={sceneVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      <motion.h1
        id="hero-title"
        className="hero__title"
        variants={lineVariants}
      >
        {headline}
      </motion.h1>
      <motion.p className="hero__subtitle" variants={lineVariants}>
        {supporting}
      </motion.p>
      {showCta ? (
        <motion.a
          className="button"
          href="#contact"
          variants={lineVariants}
        >
          {site.hero.cta} →
        </motion.a>
      ) : null}
    </motion.div>
  )
}

export function Hero() {
  const progress = useMotionValue(0)
  const [frameIndex, setFrameIndex] = useState<0 | 1 | 2>(0)
  const reduceMotion = usePrefersReducedMotion()

  useMotionValueEvent(progress, 'change', (v) => {
    const next = heroFrameIndexForProgress(v)
    setFrameIndex((i) => (i === next ? i : next))
  })

  return (
    <section id="top" className="hero hero--sequence" aria-labelledby="hero-title">
      <ScrollCanvasSequence
        progressOut={progress}
        pinBackground={<HeroCloudBlobs />}
      >
        <div className="hero__sequence-inner layout">
          <div className="hero__sequence-copy" aria-live="polite">
            <AnimatePresence mode="wait" initial={false}>
              <HeroCopyScene
                key={frameIndex}
                sceneIndex={frameIndex}
                reduceMotion={reduceMotion}
              />
            </AnimatePresence>
          </div>
        </div>
      </ScrollCanvasSequence>
    </section>
  )
}
