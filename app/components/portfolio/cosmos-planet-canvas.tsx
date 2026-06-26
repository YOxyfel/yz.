'use client'

import { useGLTF } from '@react-three/drei'
import { Canvas, useFrame } from '@react-three/fiber'
import { Suspense, useMemo, useRef } from 'react'
import * as THREE from 'three'

// Same self-hosted Draco decoder the character/prop viewers use.
const DRACO_DECODER_PATH = '/draco/'
useGLTF.setDecoderPath(DRACO_DECODER_PATH)

const PLANET_URL = '/Background/planet.glb'

function PlanetModel() {
  const ref = useRef<THREE.Group>(null)
  const { scene } = useGLTF(PLANET_URL, DRACO_DECODER_PATH)
  const model = useMemo(() => scene.clone(true), [scene])

  // Auto-fit: Tripo exports arrive at arbitrary scale/offset.
  const fit = useMemo(() => {
    const box = new THREE.Box3().setFromObject(model)
    const size = box.getSize(new THREE.Vector3())
    const center = box.getCenter(new THREE.Vector3())
    const maxDim = Math.max(size.x, size.y, size.z) || 1
    const scale = 2 / maxDim
    return { scale, offset: center.multiplyScalar(-scale) }
  }, [model])

  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.y += delta * 0.04
  })

  return (
    <group ref={ref} rotation={[0.32, 0, 0.16]}>
      <group scale={fit.scale} position={[fit.offset.x, fit.offset.y, fit.offset.z]}>
        <primitive object={model} />
      </group>
    </group>
  )
}

/** Slowly-rotating gas giant that lives deep in the parallax cosmos backdrop. */
export function CosmosPlanetCanvas() {
  return (
    <div className="cosmos-planet" aria-hidden>
      <Canvas
        camera={{ position: [0, 0, 4], fov: 34, near: 0.1, far: 50 }}
        dpr={[1, 1.5]}
        gl={{ alpha: true, antialias: true, powerPreference: 'high-performance' }}
      >
        <ambientLight intensity={0.7} />
        <directionalLight position={[5, 3, 5]} intensity={2.5} color="#dff3ff" />
        <directionalLight position={[-5, -2, -3]} intensity={0.7} color="#a779ff" />
        {/* Cyan rim light from behind for a glowing edge */}
        <pointLight position={[-2.5, 1.5, -2]} intensity={2.2} color="#5fe6ff" distance={12} />
        <Suspense fallback={null}>
          <PlanetModel />
        </Suspense>
      </Canvas>
    </div>
  )
}

useGLTF.preload(PLANET_URL)
