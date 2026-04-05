import type { MotionValue } from 'framer-motion'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import {
  type ReactNode,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'

import '@/components/scroll/scroll-canvas-sequence.css'

gsap.registerPlugin(ScrollTrigger)

/**
 * Each folder under `public/sequence/` uses: frame_00001.webp … frame_00090.webp
 * (prefix `frame_`, five zero-padded digits). Both sequences must share the same count.
 */
const SEQUENCE_DIRS = ['/sequence/scroll-1', '/sequence/scroll-2'] as const
const FRAME_COUNT = 90
/** Desktop: scrub distance in viewport heights (pin window is separate). */
const SCRUB_SCROLL_VH_DESKTOP = 6
/** Narrow viewports: shorter scrub so the sequence finishes without excessive scroll. */
const SCRUB_SCROLL_VH_MOBILE = 3.25
const SCRUB_MOBILE_MQ = '(max-width: 720px)'

function scrubScrollDistancePx(): number {
  if (typeof window === 'undefined') return Math.round(SCRUB_SCROLL_VH_DESKTOP * 800)
  const h = window.innerHeight
  const mobile = window.matchMedia(SCRUB_MOBILE_MQ).matches
  const vh = mobile ? SCRUB_SCROLL_VH_MOBILE : SCRUB_SCROLL_VH_DESKTOP
  return Math.max(1, Math.round(vh * h))
}

/** Sticky in-flow header (`SiteLayout`); hero starts below it — match scrub t=0 to first paint. */
function layoutHeaderBlockHeight(): number {
  if (typeof document === 'undefined') return 0
  const el = document.querySelector('.layout__header')
  if (!(el instanceof HTMLElement)) return 0
  return Math.round(el.getBoundingClientRect().height)
}

function frameUrl(dir: string, index: number): string {
  const n = String(index + 1).padStart(5, '0')
  return `${dir}/frame_${n}.webp`
}

/** Letterboxed fit: entire bitmap visible, never cropped (CSS object-fit: contain). */
function drawBitmapContain(
  ctx: CanvasRenderingContext2D,
  bitmap: ImageBitmap,
  cw: number,
  ch: number,
): void {
  ctx.fillStyle = '#000000'
  ctx.fillRect(0, 0, cw, ch)
  const bw = bitmap.width
  const bh = bitmap.height
  if (bw <= 0 || bh <= 0 || cw <= 0 || ch <= 0) return
  const scale = Math.min(cw / bw, ch / bh)
  const dw = bw * scale
  const dh = bh * scale
  const dx = (cw - dw) / 2
  const dy = (ch - dh) / 2
  ctx.drawImage(bitmap, dx, dy, dw, dh)
}

async function decodeSequence(
  dir: string,
  signal: AbortSignal,
): Promise<ImageBitmap[]> {
  const urls = Array.from({ length: FRAME_COUNT }, (_, i) => frameUrl(dir, i))
  const blobs = await Promise.all(
    urls.map(async (url) => {
      const res = await fetch(url, { signal })
      if (!res.ok) throw new Error(`Failed to load ${url}: ${res.status}`)
      return res.blob()
    }),
  )

  const bitmaps: ImageBitmap[] = new Array(FRAME_COUNT)
  for (let i = 0; i < blobs.length; i++) {
    if (signal.aborted) throw new DOMException('Aborted', 'AbortError')
    bitmaps[i] = await createImageBitmap(blobs[i])
    if (i % 8 === 7) {
      await new Promise<void>((r) => requestAnimationFrame(() => r()))
    }
  }
  return bitmaps
}

type SequencePair = readonly [ImageBitmap[], ImageBitmap[]]

async function decodeAllSequences(signal: AbortSignal): Promise<SequencePair> {
  const pairs = await Promise.all(
    SEQUENCE_DIRS.map((dir) => decodeSequence(dir, signal)),
  )
  return [pairs[0], pairs[1]]
}

type DrawState = { seq: 0 | 1; frame: number }

function drawStateKey(s: DrawState): string {
  return `${s.seq}-${s.frame}`
}

/** First half of scroll → sequence 0; second half → sequence 1 (hard cut at p = 0.5). */
function progressToDrawState(p: number): DrawState {
  const max = Math.max(0, FRAME_COUNT - 1)
  if (p < 0.5) {
    const t = Math.min(1, Math.max(0, p / 0.5))
    return { seq: 0, frame: Math.round(t * max) }
  }
  const t = Math.min(1, Math.max(0, (p - 0.5) / 0.5))
  return { seq: 1, frame: Math.round(t * max) }
}

type ScrollCanvasSequenceProps = {
  /** Optional: updated on ScrollTrigger scrub (0 → 1), e.g. for Framer Motion. */
  progressOut?: MotionValue<number>
  /** Rendered inside `.scroll-canvas-sequence__pin`, behind the split (e.g. decorative BG). */
  pinBackground?: ReactNode
  children?: ReactNode
}

/**
 * Full-viewport scroll-scrubbed canvas sequence. Frames are pre-decoded as
 * ImageBitmap; draws are scheduled with requestAnimationFrame only.
 */
export function ScrollCanvasSequence({
  progressOut,
  pinBackground,
  children,
}: ScrollCanvasSequenceProps) {
  const reduceMotion = usePrefersReducedMotion()
  const trackRef = useRef<HTMLDivElement>(null)
  const pinRef = useRef<HTMLDivElement>(null)
  const canvasHostRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const [sequences, setSequences] = useState<SequencePair | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)

  const drawStateRef = useRef<DrawState>({ seq: 0, frame: 0 })
  const rafRef = useRef(0)
  const lastDrawKeyRef = useRef('')
  const sequencesRef = useRef<SequencePair | null>(null)
  sequencesRef.current = sequences

  const scheduleDrawRef = useRef<(() => void) | null>(null)

  useEffect(() => {
    if (reduceMotion) return

    const ac = new AbortController()
    decodeAllSequences(ac.signal)
      .then((decoded) => {
        setSequences(decoded)
        setLoadError(null)
      })
      .catch((e: unknown) => {
        if (e instanceof DOMException && e.name === 'AbortError') return
        console.error(e)
        setLoadError(e instanceof Error ? e.message : 'Failed to load sequence')
      })

    return () => ac.abort()
  }, [reduceMotion])

  useLayoutEffect(() => {
    if (reduceMotion) {
      progressOut?.set(0)
      return
    }

    const canvas = canvasRef.current
    const track = trackRef.current
    const pin = pinRef.current
    const canvasHost = canvasHostRef.current
    if (!canvas || !track || !pin || !canvasHost) return

    const ctx = canvas.getContext('2d', { alpha: false })
    if (!ctx) return

    const dpr = Math.min(window.devicePixelRatio || 1, 2)

    const drawableCssSize = () => {
      const cw = canvas.width / dpr
      const ch = canvas.height / dpr
      return { cw, ch }
    }

    const flushDraw = () => {
      rafRef.current = 0
      const pair = sequencesRef.current
      const { cw, ch } = drawableCssSize()

      if (!pair?.[0]?.length || !pair[1]?.length) {
        if (cw < 1 || ch < 1) return
        ctx.fillStyle = '#000000'
        ctx.fillRect(0, 0, cw, ch)
        return
      }

      const state = drawStateRef.current
      const key = drawStateKey(state)
      if (key === lastDrawKeyRef.current) return

      const [seq0, seq1] = pair
      if (cw < 1 || ch < 1) return

      const bmp = state.seq === 0 ? seq0[state.frame] : seq1[state.frame]
      if (!bmp) return
      drawBitmapContain(ctx, bmp, cw, ch)

      lastDrawKeyRef.current = key
    }

    const scheduleDraw = () => {
      if (rafRef.current) return
      rafRef.current = requestAnimationFrame(flushDraw)
    }

    scheduleDrawRef.current = scheduleDraw

    const resize = () => {
      let cssW = canvasHost.clientWidth
      let cssH = canvasHost.clientHeight
      if (cssW < 1 || cssH < 1) {
        const r = canvasHost.getBoundingClientRect()
        cssW = Math.max(1, Math.round(r.width))
        cssH = Math.max(1, Math.round(r.height))
      }
      canvas.style.width = `${cssW}px`
      canvas.style.height = `${cssH}px`
      canvas.width = Math.max(1, Math.round(cssW * dpr))
      canvas.height = Math.max(1, Math.round(cssH * dpr))
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      lastDrawKeyRef.current = ''
      scheduleDraw()
    }

    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(canvasHost)
    window.addEventListener('resize', resize)

    drawStateRef.current = progressToDrawState(0)
    lastDrawKeyRef.current = ''
    scheduleDraw()

    const applyScrollProgress = (p: number) => {
      progressOut?.set(p)
      drawStateRef.current = progressToDrawState(p)
      scheduleDraw()
    }

    let headerRo: ResizeObserver | null = null
    const headerEl = document.querySelector('.layout__header')
    if (headerEl instanceof HTMLElement) {
      headerRo = new ResizeObserver(() => {
        ScrollTrigger.refresh()
      })
      headerRo.observe(headerEl)
    }

    const scrubMql = window.matchMedia(SCRUB_MOBILE_MQ)
    const onScrubLayoutChange = () => {
      ScrollTrigger.refresh()
    }
    scrubMql.addEventListener('change', onScrubLayoutChange)

    const gctx = gsap.context(() => {
      const st = ScrollTrigger.create({
        trigger: track,
        start: () => `top top+=${layoutHeaderBlockHeight()}`,
        end: () => `+=${scrubScrollDistancePx()}`,
        pin: pin,
        scrub: true,
        invalidateOnRefresh: true,
        onUpdate: (self) => applyScrollProgress(self.progress),
        onRefresh: (self) => applyScrollProgress(self.progress),
      })
      applyScrollProgress(st.progress)
    }, track)

    queueMicrotask(() => ScrollTrigger.refresh())

    return () => {
      scrubMql.removeEventListener('change', onScrubLayoutChange)
      headerRo?.disconnect()
      scheduleDrawRef.current = null
      ro.disconnect()
      window.removeEventListener('resize', resize)
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      rafRef.current = 0
      gctx.revert()
    }
  }, [progressOut, reduceMotion])

  useEffect(() => {
    if (reduceMotion || !sequences?.[0]?.length || !sequences[1]?.length) return
    lastDrawKeyRef.current = ''
    scheduleDrawRef.current?.()
  }, [sequences, reduceMotion])

  useEffect(() => {
    return () => {
      sequences?.[0]?.forEach((b) => b.close())
      sequences?.[1]?.forEach((b) => b.close())
    }
  }, [sequences])

  if (reduceMotion) {
    return (
      <div className="scroll-canvas-sequence scroll-canvas-sequence--reduced">
        <div className="scroll-canvas-sequence__pin scroll-canvas-sequence__pin--static">
          {pinBackground ? (
            <div className="scroll-canvas-sequence__pin-bg">{pinBackground}</div>
          ) : null}
          <div className="scroll-canvas-sequence__split">
            <div className="scroll-canvas-sequence__copy-col scroll-canvas-sequence__copy-col--reduced">
              {children}
            </div>
            <div className="scroll-canvas-sequence__canvas-col scroll-canvas-sequence__canvas-col--reduced">
              <p className="scroll-canvas-sequence__reduced-msg">
                Scroll sequence disabled when reduced motion is preferred.
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div ref={trackRef} className="scroll-canvas-sequence scroll-canvas-sequence__track">
      <div ref={pinRef} className="scroll-canvas-sequence__pin">
        {pinBackground ? (
          <div className="scroll-canvas-sequence__pin-bg">{pinBackground}</div>
        ) : null}
        <div className="scroll-canvas-sequence__split">
          <div className="scroll-canvas-sequence__copy-col">
            <div className="scroll-canvas-sequence__overlay">{children}</div>
          </div>
          <div ref={canvasHostRef} className="scroll-canvas-sequence__canvas-col">
            <canvas
              ref={canvasRef}
              className="scroll-canvas-sequence__canvas"
              aria-hidden
            />
            {loadError ? (
              <div className="scroll-canvas-sequence__error" role="alert">
                {loadError}
              </div>
            ) : null}
            {!sequences && !loadError ? (
              <div className="scroll-canvas-sequence__loading" aria-live="polite">
                Loading…
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  )
}
