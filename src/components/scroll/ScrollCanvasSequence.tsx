import { useLayoutEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'

import '@/components/scroll/scroll-canvas-sequence.css'

const FRAME_COUNT = 48

/**
 * Scroll-scrubbed canvas placeholder: maps scroll progress to a synthetic “frame”.
 * Swap in decoded ImageBitmap frames / drawImage from your asset strip when ready.
 */
export function ScrollCanvasSequence() {
  const wrapRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const reduceMotion = usePrefersReducedMotion()

  useLayoutEffect(() => {
    if (reduceMotion) return

    const canvas = canvasRef.current
    const wrap = wrapRef.current
    if (!canvas || !wrap) return

    gsap.registerPlugin(ScrollTrigger)

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = Math.min(window.devicePixelRatio || 1, 2)

    const resize = () => {
      const { width, height } = wrap.getBoundingClientRect()
      canvas.width = Math.max(1, Math.floor(width * dpr))
      canvas.height = Math.max(1, Math.floor(height * dpr))
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(wrap)

    const drawFrame = (index: number) => {
      const { width, height } = wrap.getBoundingClientRect()
      const t = index / Math.max(1, FRAME_COUNT - 1)
      const hue = 210 + t * 55
      ctx.fillStyle = `oklch(22% 0.04 ${hue})`
      ctx.fillRect(0, 0, width, height)
      ctx.fillStyle = `oklch(92% 0.02 ${hue})`
      ctx.font = '600 14px system-ui, sans-serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(`Sequence frame ${index + 1} / ${FRAME_COUNT}`, width / 2, height / 2)
    }

    const st = ScrollTrigger.create({
      trigger: wrap,
      start: 'top top',
      end: `+=${FRAME_COUNT * 18}`,
      pin: true,
      scrub: true,
      onUpdate: (self) => {
        const idx = Math.min(
          FRAME_COUNT - 1,
          Math.max(0, Math.floor(self.progress * FRAME_COUNT)),
        )
        drawFrame(idx)
      },
    })

    drawFrame(0)

    return () => {
      st.kill()
      ro.disconnect()
    }
  }, [reduceMotion])

  if (reduceMotion) {
    return (
      <div className="scroll-canvas-sequence scroll-canvas-sequence--static" aria-hidden>
        <div className="scroll-canvas-sequence__static">
          <p>Scroll sequence disabled when reduced motion is preferred.</p>
        </div>
      </div>
    )
  }

  return (
    <div ref={wrapRef} className="scroll-canvas-sequence">
      <canvas ref={canvasRef} className="scroll-canvas-sequence__canvas" />
    </div>
  )
}
