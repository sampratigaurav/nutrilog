'use client'
import { useEffect, useRef } from 'react'
import * as THREE from 'three'

interface Props {
  className?: string
}

export default function PlateScene({ className }: Props) {
  const mountRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const mount = mountRef.current
    if (!mount) return

    const w = mount.clientWidth
    const h = mount.clientHeight

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(38, w / h, 0.1, 100)
    camera.position.set(0, 2.6, 6.2)
    camera.lookAt(0, 0, 0)

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setSize(w, h)
    mount.appendChild(renderer.domElement)

    // lights
    const amb = new THREE.AmbientLight(0xffffff, 1.2)
    scene.add(amb)
    const key = new THREE.PointLight(0xffffff, 2.5, 50)
    key.position.set(2.5, 5, 3)
    scene.add(key)
    const fill = new THREE.PointLight(0xffffff, 1.2, 30)
    fill.position.set(-3, -2, 2)
    scene.add(fill)

    // plate group
    const plate = new THREE.Group()
    const ceramic = new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xffffff, emissiveIntensity: 0.55, roughness: 0.08, metalness: 0.0 })
    const rim = new THREE.Mesh(new THREE.TorusGeometry(1.55, 0.08, 24, 80), ceramic)
    rim.rotation.x = Math.PI / 2
    plate.add(rim)

    const base = new THREE.Mesh(new THREE.CylinderGeometry(1.5, 1.45, 0.12, 80), ceramic)
    base.position.y = -0.04
    plate.add(base)

    const innerWell = new THREE.Mesh(
      new THREE.CylinderGeometry(1.35, 1.35, 0.02, 80),
      new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xffffff, emissiveIntensity: 0.45, roughness: 0.12, metalness: 0.0 })
    )
    innerWell.position.y = 0.04
    plate.add(innerWell)
    scene.add(plate)

    // fake shadow
    const shadowCanvas = document.createElement('canvas')
    shadowCanvas.width = 256
    shadowCanvas.height = 256
    const sctx = shadowCanvas.getContext('2d')!
    const grad = sctx.createRadialGradient(128, 128, 20, 128, 128, 120)
    grad.addColorStop(0, 'rgba(15,23,42,0.45)')
    grad.addColorStop(0.6, 'rgba(15,23,42,0.12)')
    grad.addColorStop(1, 'rgba(15,23,42,0)')
    sctx.fillStyle = grad
    sctx.fillRect(0, 0, 256, 256)
    const shadowTex = new THREE.CanvasTexture(shadowCanvas)
    const shadow = new THREE.Mesh(
      new THREE.PlaneGeometry(5, 5),
      new THREE.MeshBasicMaterial({ map: shadowTex, transparent: true, depthWrite: false })
    )
    shadow.rotation.x = -Math.PI / 2
    shadow.position.y = -0.6
    scene.add(shadow)

    // macro rings
    function makeRing(radius: number, color: number) {
      const mesh = new THREE.Mesh(
        new THREE.TorusGeometry(radius, 0.04, 16, 120),
        new THREE.MeshStandardMaterial({
          color, emissive: color, emissiveIntensity: 0.7,
          roughness: 0.4, metalness: 0.2,
        })
      )
      mesh.rotation.x = Math.PI / 2.2
      mesh.scale.setScalar(0.001)
      return mesh
    }
    const ringProtein = makeRing(1.4, 0x3b82f6)
    const ringCarbs   = makeRing(1.9, 0xf59e0b)
    const ringFat     = makeRing(2.4, 0xf43f5e)
    scene.add(ringProtein, ringCarbs, ringFat)

    function onResize() {
      const W = mount!.clientWidth
      const H = mount!.clientHeight
      camera.aspect = W / H
      camera.updateProjectionMatrix()
      renderer.setSize(W, H)
    }
    window.addEventListener('resize', onResize)

    // scroll stations: [p, x, y, z, s, tilt, rings]
    const stations = [
      { p: 0.00, x: 1.6,  y:  0.0, z: 0.0, s: 1.00, tilt: 0.00, rings: 0 },
      { p: 0.15, x: 1.6,  y:  0.0, z: 0.0, s: 1.00, tilt: 0.00, rings: 1 },
      { p: 0.30, x: 1.6,  y: -0.4, z: 0.5, s: 0.65, tilt: 0.10, rings: 1 },
      { p: 0.50, x: -1.6, y: -0.5, z: 0.6, s: 0.55, tilt: 0.25, rings: 0.7 },
      { p: 0.75, x: 1.8,  y: -0.5, z: 0.6, s: 0.50, tilt: 0.35, rings: 0.5 },
      { p: 1.00, x: 0.0,  y: -0.3, z: 1.2, s: 0.45, tilt: 0.50, rings: 0.3 },
    ]

    function sampleStation(p: number) {
      for (let i = 0; i < stations.length - 1; i++) {
        const a = stations[i], b = stations[i + 1]
        if (p >= a.p && p <= b.p) {
          const t = (p - a.p) / (b.p - a.p)
          const e = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
          return {
            x: a.x + (b.x - a.x) * e,
            y: a.y + (b.y - a.y) * e,
            z: a.z + (b.z - a.z) * e,
            s: a.s + (b.s - a.s) * e,
            tilt: a.tilt + (b.tilt - a.tilt) * e,
            rings: a.rings + (b.rings - a.rings) * e,
          }
        }
      }
      return stations[stations.length - 1]
    }

    let cur = { x: stations[0].x, y: stations[0].y, z: stations[0].z, s: 1, tilt: 0, rings: 0 }
    const ringScale = [0, 0, 0]

    let raf: number
    function tick() {
      const scrollPct: number = (window as unknown as Record<string, number>).__scrollPct ?? 0
      const target = sampleStation(scrollPct)
      const k = 0.09

      cur.x     += (target.x     - cur.x)     * k
      cur.y     += (target.y     - cur.y)     * k
      cur.z     += (target.z     - cur.z)     * k
      cur.s     += (target.s     - cur.s)     * k
      cur.tilt  += (target.tilt  - cur.tilt)  * k
      cur.rings += (target.rings - cur.rings) * k

      const ringsBase = scrollPct > 0.15 ? 1 : 0

      // continuous spin
      plate.rotation.y    += 0.003
      ringProtein.rotation.z += 0.004
      ringCarbs.rotation.z   += -0.003
      ringFat.rotation.z     += 0.002

      // cursor tilt
      const mx = ((window as unknown as Record<string, number>).__mouseX ?? 0.5) - 0.5
      const my = ((window as unknown as Record<string, number>).__mouseY ?? 0.5) - 0.5
      const tiltExtraX = my * 0.25
      const tiltExtraZ = -mx * 0.25

      plate.position.set(cur.x, cur.y, cur.z)
      plate.rotation.x = cur.tilt + tiltExtraX
      plate.rotation.z = tiltExtraZ

      for (const ring of [ringProtein, ringCarbs, ringFat]) {
        ring.position.set(cur.x, cur.y, cur.z)
      }
      ringProtein.rotation.x = Math.PI / 2.2 + cur.tilt
      ringCarbs.rotation.x   = Math.PI / 2.2 + cur.tilt
      ringFat.rotation.x     = Math.PI / 2.2 + cur.tilt

      shadow.position.set(cur.x, -0.6 + cur.y * 0.6, cur.z)
      shadow.scale.setScalar(Math.max(0.5, cur.s * 1.1))

      for (let i = 0; i < 3; i++) {
        ringScale[i] += (ringsBase - ringScale[i]) * 0.08
      }
      const spring = (t: number) => (t < 1 ? t + Math.sin(t * Math.PI) * 0.06 : t)
      ringProtein.scale.setScalar(spring(ringScale[0]) * cur.rings)
      ringCarbs.scale.setScalar(spring(ringScale[1]) * cur.rings)
      ringFat.scale.setScalar(spring(ringScale[2]) * cur.rings)
      plate.scale.setScalar(cur.s)

      renderer.render(scene, camera)
      raf = requestAnimationFrame(tick)
    }
    tick()

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', onResize)
      renderer.dispose()
      if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement)
    }
  }, [])

  return <div ref={mountRef} className={className} style={{ position: 'absolute', inset: 0 }} />
}
