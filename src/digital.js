import * as THREE from 'three'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

// The film ends in a wall of powder. Here the snow becomes data: white flakes
// settle into the points of a wireframe mountain range, the red route line
// draws through the valleys, and the peaks are labelled Shopify / AI / Custom.

const RED = 0xe5322d
const COPPER = 0xd29a6c

// Small value-noise for ridged mountains (no dependency needed).
function hash(x, y) {
  const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453
  return s - Math.floor(s)
}
function noise(x, y) {
  const xi = Math.floor(x)
  const yi = Math.floor(y)
  const xf = x - xi
  const yf = y - yi
  const u = xf * xf * (3 - 2 * xf)
  const v = yf * yf * (3 - 2 * yf)
  const a = hash(xi, yi)
  const b = hash(xi + 1, yi)
  const c = hash(xi, yi + 1)
  const d = hash(xi + 1, yi + 1)
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v
}
function ridged(x, z) {
  let h = 0
  let amp = 1
  let freq = 0.12
  for (let o = 0; o < 4; o++) {
    const n = 1 - Math.abs(noise(x * freq, z * freq) * 2 - 1)
    h += n * n * amp
    amp *= 0.5
    freq *= 2.1
  }
  return h
}

// Valley the route follows: a gentle S-curve down the middle of the range.
const valleyX = (z) => Math.sin(z * 0.11) * 3.2 + Math.sin(z * 0.043) * 2
function height(x, z) {
  const valley = Math.min(1, Math.abs(x - valleyX(z)) / 5)
  return ridged(x, z) * 3.4 * (0.25 + valley * 0.95) - 1.2
}

// Camera z along the flight for a given scroll progress.
const cameraZ = (p) => 8 - smooth(0.12, 1, p) * 30

const LABEL_AT = [0.5, 0.6, 0.7]

export function initDigital() {
  const section = document.getElementById('digital')
  const canvas = document.getElementById('digital-canvas')
  const flash = document.getElementById('digital-flash')
  const intro = document.getElementById('digital-intro')
  const labels = [...section.querySelectorAll('.peak-label')]
  const mobile = matchMedia('(max-width: 760px)').matches

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: !mobile, powerPreference: 'high-performance' })
  renderer.setPixelRatio(Math.min(devicePixelRatio, mobile ? 1.5 : 2))
  renderer.setClearColor(0x0b0a09)

  const scene = new THREE.Scene()
  scene.fog = new THREE.Fog(0x0b0a09, 10, 46)
  const camera = new THREE.PerspectiveCamera(mobile ? 70 : 55, 1, 0.1, 120)

  // Terrain grid ---------------------------------------------------------
  const W = mobile ? 70 : 120
  const D = mobile ? 90 : 140
  const SX = 0.36
  const SZ = 0.36
  const count = W * D
  const target = new Float32Array(count * 3)
  const start = new Float32Array(count * 3)
  const seed = new Float32Array(count)
  for (let j = 0; j < D; j++) {
    for (let i = 0; i < W; i++) {
      const k = j * W + i
      const x = (i - W / 2) * SX
      const z = 6 - j * SZ
      target[k * 3] = x
      target[k * 3 + 1] = height(x, z)
      target[k * 3 + 2] = z
      // Flakes start scattered in front of the camera, like the powder wall.
      start[k * 3] = (Math.random() - 0.5) * 16
      start[k * 3 + 1] = 1 + (Math.random() - 0.5) * 9
      start[k * 3 + 2] = 4 - Math.random() * 14
      seed[k] = Math.random()
    }
  }

  const pointsGeo = new THREE.BufferGeometry()
  pointsGeo.setAttribute('position', new THREE.BufferAttribute(target, 3))
  pointsGeo.setAttribute('aStart', new THREE.BufferAttribute(start, 3))
  pointsGeo.setAttribute('aSeed', new THREE.BufferAttribute(seed, 1))

  const pointsMat = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    uniforms: {
      uMorph: { value: 0 },
      uTime: { value: 0 },
      uSize: { value: mobile ? 34 : 42 },
      uPixelRatio: { value: renderer.getPixelRatio() },
      uWarm: { value: 0 },
    },
    vertexShader: /* glsl */ `
      attribute vec3 aStart;
      attribute float aSeed;
      uniform float uMorph, uTime, uSize, uPixelRatio;
      varying float vFade;
      void main() {
        float m = smoothstep(aSeed * 0.45, aSeed * 0.45 + 0.55, uMorph);
        vec3 drift = vec3(sin(uTime * 0.6 + aSeed * 40.0) * 0.3, -mod(uTime * 0.4 + aSeed * 9.0, 9.0) + 4.5, 0.0);
        vec3 p = mix(aStart + drift * (1.0 - m), position, m);
        vec4 mv = modelViewMatrix * vec4(p, 1.0);
        gl_Position = projectionMatrix * mv;
        gl_PointSize = uSize * uPixelRatio * (0.35 + aSeed * 0.65) / -mv.z;
        vFade = smoothstep(46.0, 8.0, -mv.z);
      }`,
    fragmentShader: /* glsl */ `
      uniform float uWarm;
      varying float vFade;
      void main() {
        float d = length(gl_PointCoord - 0.5);
        if (d > 0.5) discard;
        vec3 col = mix(vec3(1.0), vec3(0.95, 0.72, 0.55), uWarm);
        gl_FragColor = vec4(col, smoothstep(0.5, 0.1, d) * vFade);
      }`,
  })
  scene.add(new THREE.Points(pointsGeo, pointsMat))

  // Wireframe: connect grid neighbours.
  const idx = []
  for (let j = 0; j < D; j++) {
    for (let i = 0; i < W; i++) {
      const k = j * W + i
      if (i < W - 1) idx.push(k, k + 1)
      if (j < D - 1) idx.push(k, k + W)
    }
  }
  const wireGeo = new THREE.BufferGeometry()
  wireGeo.setAttribute('position', new THREE.BufferAttribute(target, 3))
  wireGeo.setIndex(idx)
  const wireMat = new THREE.LineBasicMaterial({ color: COPPER, transparent: true, opacity: 0, depthWrite: false })
  scene.add(new THREE.LineSegments(wireGeo, wireMat))

  // Red route down the valley -------------------------------------------
  const routePts = []
  for (let z = 6; z >= 6 - (D - 1) * SZ; z -= 1) {
    const x = valleyX(z)
    routePts.push(new THREE.Vector3(x, height(x, z) + 0.12, z))
  }
  const curve = new THREE.CatmullRomCurve3(routePts)
  const tubeGeo = new THREE.TubeGeometry(curve, 400, 0.045, 6, false)
  const tubeMat = new THREE.MeshBasicMaterial({ color: RED, transparent: true, opacity: 0.95 })
  const tube = new THREE.Mesh(tubeGeo, tubeMat)
  const tubeIndexCount = tubeGeo.index.count
  tubeGeo.setDrawRange(0, 0)
  scene.add(tube)

  const head = new THREE.Mesh(new THREE.SphereGeometry(0.12, 16, 16), new THREE.MeshBasicMaterial({ color: RED }))
  scene.add(head)
  const glow = new THREE.Sprite(
    new THREE.SpriteMaterial({ map: glowTexture(), color: RED, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }),
  )
  glow.scale.setScalar(1.6)
  head.add(glow)

  // Scroll-driven state --------------------------------------------------
  let progress = 0
  let active = false
  const clock = new THREE.Clock()
  const look = new THREE.Vector3()
  const tmp = new THREE.Vector3()

  ScrollTrigger.create({
    trigger: section,
    start: 'top bottom',
    end: 'bottom top',
    onToggle: (self) => {
      active = self.isActive
      if (active) renderer.setAnimationLoop(render)
      else renderer.setAnimationLoop(null)
    },
  })
  ScrollTrigger.create({
    trigger: section,
    start: 'top top',
    end: 'bottom bottom',
    scrub: 0.5,
    onUpdate: (self) => (progress = self.progress),
  })

  function resize() {
    const w = innerWidth
    const h = innerHeight
    renderer.setSize(w, h, false)
    camera.aspect = w / h
    camera.updateProjectionMatrix()
  }
  addEventListener('resize', resize)
  resize()

  function render() {
    const t = clock.getElapsedTime()
    const p = progress

    flash.style.opacity = 1 - smooth(0, 0.12, p)
    intro.style.opacity = smooth(0.06, 0.14, p) * (1 - smooth(0.26, 0.34, p))

    pointsMat.uniforms.uTime.value = t
    pointsMat.uniforms.uMorph.value = smooth(0.08, 0.42, p)
    pointsMat.uniforms.uWarm.value = smooth(0.35, 0.6, p) * 0.6
    wireMat.opacity = smooth(0.3, 0.55, p) * 0.28

    const route = smooth(0.4, 0.95, p)
    tubeGeo.setDrawRange(0, Math.floor((tubeIndexCount * route) / 3) * 3)
    curve.getPointAt(Math.max(0.001, route), head.position)
    head.visible = route > 0.001
    glow.material.opacity = 0.6 + Math.sin(t * 4) * 0.2

    // Camera: hover in the flakes, then rise and travel down the valley.
    const fly = smooth(0.12, 1, p)
    const cz = cameraZ(p)
    const cx = valleyX(cz) * 0.6
    camera.position.set(cx + Math.sin(t * 0.3) * 0.15, 2.2 + fly * 3.6, cz)
    tmp.set(valleyX(cz - 10) * 0.8, 0.2 + fly * 0.4, cz - 10)
    look.lerp(tmp, 0.08)
    camera.lookAt(look)

    labels.forEach((el, i) => {
      const show = smooth(LABEL_AT[i], LABEL_AT[i] + 0.06, p)
      el.style.opacity = show
      el.style.transform = `translate3d(0, ${(1 - show) * 24}px, 0)`
    })

    renderer.render(scene, camera)
  }
  look.set(0, 0.5, -4)
  render()
}

function smooth(a, b, v) {
  const t = Math.min(1, Math.max(0, (v - a) / (b - a)))
  return t * t * (3 - 2 * t)
}

function glowTexture() {
  const c = document.createElement('canvas')
  c.width = c.height = 64
  const g = c.getContext('2d')
  const grad = g.createRadialGradient(32, 32, 0, 32, 32, 32)
  grad.addColorStop(0, 'rgba(255,255,255,1)')
  grad.addColorStop(0.3, 'rgba(255,255,255,0.4)')
  grad.addColorStop(1, 'rgba(255,255,255,0)')
  g.fillStyle = grad
  g.fillRect(0, 0, 64, 64)
  return new THREE.CanvasTexture(c)
}
