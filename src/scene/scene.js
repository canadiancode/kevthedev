import * as THREE from 'three'

// Placeholder scene — the real design comes later. It exists to prove out the
// render loop, resizing, pointer input, and the scroll hooks (`state`) GSAP drives.
export function createScene(canvas) {
  const isMobile = matchMedia('(max-width: 768px)').matches

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: !isMobile, alpha: true })
  renderer.setPixelRatio(Math.min(devicePixelRatio, isMobile ? 1.5 : 2))

  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100)
  camera.position.set(0, 0, 6)

  scene.add(new THREE.AmbientLight(0xffffff, 0.4))
  const key = new THREE.DirectionalLight(0xffffff, 2)
  key.position.set(3, 4, 5)
  scene.add(key)

  const hero = new THREE.Mesh(
    new THREE.IcosahedronGeometry(1.4, 1),
    new THREE.MeshStandardMaterial({ color: 0x5b8cff, flatShading: true, roughness: 0.35, metalness: 0.2 }),
  )
  scene.add(hero)

  const count = isMobile ? 800 : 2000
  const positions = new Float32Array(count * 3)
  for (let i = 0; i < positions.length; i++) positions[i] = (Math.random() - 0.5) * 30
  const particles = new THREE.Points(
    new THREE.BufferGeometry().setAttribute('position', new THREE.BufferAttribute(positions, 3)),
    new THREE.PointsMaterial({ color: 0x9fb7ff, size: 0.04, transparent: true, opacity: 0.7 }),
  )
  scene.add(particles)

  // Values tweened by GSAP from scroll.js.
  const state = { progress: 0, cameraZ: 6, heroX: 0 }
  const pointer = { x: 0, y: 0 }

  addEventListener('pointermove', (e) => {
    pointer.x = (e.clientX / innerWidth) * 2 - 1
    pointer.y = (e.clientY / innerHeight) * 2 - 1
  })

  function resize() {
    const { innerWidth: w, innerHeight: h } = window
    renderer.setSize(w, h, false)
    camera.aspect = w / h
    camera.updateProjectionMatrix()
  }
  addEventListener('resize', resize)
  resize()

  const clock = new THREE.Clock()
  renderer.setAnimationLoop(() => {
    const t = clock.getElapsedTime()
    hero.rotation.x = t * 0.15 + state.progress * Math.PI * 2
    hero.rotation.y = t * 0.2
    hero.position.x = state.heroX
    particles.rotation.y = t * 0.02 + state.progress * 0.8

    camera.position.x += (pointer.x * 0.4 - camera.position.x) * 0.05
    camera.position.y += (-pointer.y * 0.3 - camera.position.y) * 0.05
    camera.position.z = state.cameraZ
    camera.lookAt(0, 0, 0)

    renderer.render(scene, camera)
  })

  return { state }
}
