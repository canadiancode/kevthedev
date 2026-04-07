import { type RefObject, useCallback, useEffect, useState } from 'react'

export type AboutPhotoArea = 'ph1' | 'ph2' | 'ph3' | 'ph4'

/**
 * While the About section is in view, updates each photo’s signed offset from the
 * vertical viewport center (`getBoundingClientRect().top - innerHeight/2`), for scroll parallax.
 */
export function useAboutPhotoParallaxOffsets(
  sectionRef: RefObject<HTMLElement | null>,
  imageRefs: RefObject<Record<AboutPhotoArea, HTMLImageElement | null>>,
  areas: readonly AboutPhotoArea[],
): Record<AboutPhotoArea, number> | null {
  const [offsets, setOffsets] = useState<Record<AboutPhotoArea, number> | null>(null)
  const [sectionInView, setSectionInView] = useState(false)

  const refresh = useCallback(() => {
    const mid = window.innerHeight / 2
    const next = {} as Record<AboutPhotoArea, number>
    for (const area of areas) {
      const el = imageRefs.current[area]
      next[area] = el ? el.getBoundingClientRect().top - mid : NaN
    }
    setOffsets(next)
  }, [areas, imageRefs])

  useEffect(() => {
    const root = sectionRef.current
    if (!root) return

    const io = new IntersectionObserver(
      ([entry]) => {
        const inView = entry?.isIntersecting ?? false
        setSectionInView(inView)
        if (!inView) setOffsets(null)
      },
      { threshold: 0, rootMargin: '0px' },
    )
    io.observe(root)
    return () => io.disconnect()
  }, [sectionRef])

  useEffect(() => {
    if (!sectionInView) return

    refresh()
    window.addEventListener('scroll', refresh, { passive: true })
    window.addEventListener('resize', refresh)
    return () => {
      window.removeEventListener('scroll', refresh)
      window.removeEventListener('resize', refresh)
    }
  }, [sectionInView, refresh])

  return offsets
}
