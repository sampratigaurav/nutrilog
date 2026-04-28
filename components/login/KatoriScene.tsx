'use client'
import { useEffect, useRef } from 'react'
import * as THREE from 'three'

export default function KatoriScene() {
  const mountRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const mount = mountRef.current
    if (!mount) return

    const W = () => mount.clientWidth
    const H = () => mount.clientHeight

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(38, W() / H(), 0.1, 100)
    camera.position.set(0, 1.4, 6.0)
    camera.lookAt(0, 0, 0)

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setSize(W(), H())
    renderer.setClearColor(0x000000, 0)
    mount.appendChild(renderer.domElement)

    const geos: THREE.BufferGeometry[] = []
    const mats: THREE.Material[] = []
    function g<T extends THREE.BufferGeometry>(x: T): T { geos.push(x); return x }
    function m<T extends THREE.Material>(x: T): T { mats.push(x); return x }

    // warm key + cool fill lights
    const key = new THREE.PointLight(0xfff1d6, 1.6, 20)
    key.position.set(3, 5, 4)
    scene.add(key)
    const fill = new THREE.PointLight(0xb6d4ff, 0.65, 20)
    fill.position.set(-3, -1, 3)
    scene.add(fill)
    scene.add(new THREE.AmbientLight(0xffffff, 0.55))

    const group = new THREE.Group()
    scene.add(group)

    // ceramic plate
    const ceramicMat = m(new THREE.MeshStandardMaterial({ color: 0xf8f4ee, roughness: 0.18, metalness: 0.05 }))
    const plate = new THREE.Group()
    const rim = new THREE.Mesh(g(new THREE.TorusGeometry(1.55, 0.07, 24, 80)), ceramicMat)
    rim.rotation.x = Math.PI / 2
    plate.add(rim)
    const plateCyl = new THREE.Mesh(g(new THREE.CylinderGeometry(1.5, 1.45, 0.10, 80)), ceramicMat)
    plateCyl.position.y = -0.04
    plate.add(plateCyl)
    const well = new THREE.Mesh(
      g(new THREE.CylinderGeometry(1.4, 1.4, 0.02, 80)),
      m(new THREE.MeshStandardMaterial({ color: 0xf3eee5, roughness: 0.28 }))
    )
    well.position.y = 0.03
    plate.add(well)
    plate.position.y = -0.55
    group.add(plate)

    // copper katori bowl
    const bowl = new THREE.Group()
    const bowlOuter = new THREE.Mesh(
      g(new THREE.SphereGeometry(0.55, 48, 32, 0, Math.PI * 2, 0, Math.PI / 2)),
      m(new THREE.MeshStandardMaterial({ color: 0xc97a3a, roughness: 0.35, metalness: 0.55, side: THREE.DoubleSide }))
    )
    bowlOuter.rotation.x = Math.PI
    bowl.add(bowlOuter)

    const bowlInner = new THREE.Mesh(
      g(new THREE.SphereGeometry(0.5, 48, 32, 0, Math.PI * 2, 0, Math.PI / 2)),
      m(new THREE.MeshStandardMaterial({ color: 0xf2a64c, roughness: 0.55, metalness: 0.05, emissive: 0x5a2a08, emissiveIntensity: 0.15 }))
    )
    bowlInner.rotation.x = Math.PI
    bowlInner.position.y = 0.02
    bowl.add(bowlInner)

    const dalMat = m(new THREE.MeshStandardMaterial({ color: 0xf0b94a, roughness: 0.7, metalness: 0.0, emissive: 0x6b3a06, emissiveIntensity: 0.18 }))
    const dal = new THREE.Mesh(g(new THREE.CircleGeometry(0.48, 48)), dalMat)
    dal.rotation.x = -Math.PI / 2
    dal.position.y = -0.02
    bowl.add(dal)

    const rimRing = new THREE.Mesh(
      g(new THREE.TorusGeometry(0.55, 0.022, 16, 80)),
      m(new THREE.MeshStandardMaterial({ color: 0xb86a2e, roughness: 0.3, metalness: 0.7 }))
    )
    rimRing.rotation.x = Math.PI / 2
    rimRing.position.y = 0.005
    bowl.add(rimRing)
    bowl.position.y = -0.42
    group.add(bowl)

    // three macro rings
    function makeRing(radius: number, color: number) {
      const mesh = new THREE.Mesh(
        g(new THREE.TorusGeometry(radius, 0.025, 16, 120)),
        m(new THREE.MeshStandardMaterial({
          color, emissive: color, emissiveIntensity: 0.85,
          roughness: 0.4, metalness: 0.2, transparent: true, opacity: 0.92,
        }))
      )
      mesh.rotation.x = Math.PI / 2.1
      return mesh
    }
    const ringP = makeRing(1.05, 0x3b82f6)
    const ringC = makeRing(1.30, 0xf59e0b)
    const ringF = makeRing(1.55, 0xf43f5e)
    ringP.position.y = -0.30
    ringC.position.y = -0.32
    ringF.position.y = -0.34
    group.add(ringP, ringC, ringF)

    // radial shadow
    const sc = document.createElement('canvas')
    sc.width = 256; sc.height = 256
    const sctx = sc.getContext('2d')!
    const grad = sctx.createRadialGradient(128, 128, 20, 128, 128, 120)
    grad.addColorStop(0, 'rgba(15,23,42,0.45)')
    grad.addColorStop(0.6, 'rgba(15,23,42,0.10)')
    grad.addColorStop(1, 'rgba(15,23,42,0)')
    sctx.fillStyle = grad
    sctx.fillRect(0, 0, 256, 256)
    const shadowTex = new THREE.CanvasTexture(sc)
    const shadow = new THREE.Mesh(
      g(new THREE.PlaneGeometry(5, 5)),
      m(new THREE.MeshBasicMaterial({ map: shadowTex, transparent: true, depthWrite: false }))
    )
    shadow.rotation.x = -Math.PI / 2
    shadow.position.y = -0.62
    group.add(shadow)

    let mx = 0, my = 0
    function onMouseMove(e: MouseEvent) {
      mx = (e.clientX / window.innerWidth) * 2 - 1
      my = (e.clientY / window.innerHeight) * 2 - 1
    }
    window.addEventListener('mousemove', onMouseMove)

    function onResize() {
      camera.aspect = W() / H()
      camera.updateProjectionMatrix()
      renderer.setSize(W(), H())
    }
    window.addEventListener('resize', onResize)

    const t0 = performance.now()
    let raf: number
    function loop() {
      const t = (performance.now() - t0) / 1000
      group.rotation.y = t * 0.18
      group.rotation.x += (my * 0.18 - group.rotation.x) * 0.06
      group.rotation.z += (-mx * 0.12 - group.rotation.z) * 0.06
      bowl.position.y = -0.42 + Math.sin(t * 1.2) * 0.012
      ringP.rotation.z += 0.006
      ringC.rotation.z -= 0.004
      ringF.rotation.z += 0.003
      dalMat.emissiveIntensity = 0.18 + Math.sin(t * 2) * 0.04
      renderer.render(scene, camera)
      raf = requestAnimationFrame(loop)
    }
    loop()

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('resize', onResize)
      geos.forEach(x => x.dispose())
      mats.forEach(x => x.dispose())
      shadowTex.dispose()
      renderer.dispose()
      if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement)
    }
  }, [])

  return <div ref={mountRef} style={{ position: 'absolute', inset: 0 }} />
}
