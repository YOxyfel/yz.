'use client'

import { Center, Edges, Environment, OrbitControls, useGLTF } from '@react-three/drei'
import { Canvas } from '@react-three/fiber'
import { Suspense, useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import type { PropViewMode } from './arsenal-props'

type ModelProps = {
  glb: string
  viewMode: PropViewMode
  showQuadMesh: boolean
  autoRotate: boolean
}

function Model({ glb, viewMode, showQuadMesh, autoRotate }: ModelProps) {
  const group = useRef<THREE.Group>(null)
  const { scene } = useGLTF(glb)
  const clone = useMemo(() => scene.clone(true), [scene])

  useEffect(() => {
    clone.traverse((node) => {
      if (!(node instanceof THREE.Mesh)) return
      const mats = Array.isArray(node.material) ? node.material : [node.material]
      mats.forEach((mat) => {
        if (mat instanceof THREE.MeshStandardMaterial) {
          mat.wireframe = viewMode === 'wireframe'
          mat.transparent = viewMode === 'wireframe'
          mat.opacity = viewMode === 'wireframe' ? 0.95 : 1
        }
      })
    })
  }, [clone, viewMode])

  return (
    <>
      <ambientLight intensity={0.55} />
      <directionalLight position={[4, 6, 3]} intensity={1.2} />
      <directionalLight position={[-3, 2, -4]} intensity={0.35} color="#88ccff" />
      <group ref={group}>
        <Center>
          <primitive object={clone} />
          {showQuadMesh && viewMode !== 'wireframe' ? (
            <group>
              {clone.children.map((child, index) =>
                child instanceof THREE.Mesh ? (
                  <mesh key={index} geometry={child.geometry}>
                    <meshBasicMaterial color="#67e8f9" wireframe transparent opacity={0.35} />
                    <Edges threshold={15} color="#5eead4" />
                  </mesh>
                ) : null
              )}
            </group>
          ) : null}
        </Center>
      </group>
      <OrbitControls
        enablePan={false}
        autoRotate={autoRotate && viewMode === 'orbit'}
        autoRotateSpeed={0.85}
        minDistance={1.2}
        maxDistance={6}
      />
      <Environment preset="city" />
    </>
  )
}

type PropViewerCanvasProps = {
  glb: string
  viewMode: PropViewMode
  showQuadMesh: boolean
  swipeRatio: number
  autoRotate: boolean
  className?: string
}

export function PropViewerCanvas({
  glb,
  viewMode,
  showQuadMesh,
  autoRotate,
  className = '',
}: PropViewerCanvasProps) {
  return (
    <div className={`h-full w-full ${className}`}>
      <Canvas camera={{ position: [0, 0.4, 2.8], fov: 42 }} gl={{ antialias: true, alpha: true }}>
        <color attach="background" args={['#050508']} />
        <Suspense fallback={null}>
          <Model
            glb={glb}
            viewMode={viewMode}
            showQuadMesh={showQuadMesh}
            autoRotate={autoRotate}
          />
        </Suspense>
      </Canvas>
    </div>
  )
}
