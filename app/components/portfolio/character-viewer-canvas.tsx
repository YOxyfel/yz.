'use client'

import { Environment, OrbitControls, useAnimations, useGLTF } from '@react-three/drei'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Suspense, useEffect, useMemo, useRef, type MutableRefObject } from 'react'
import * as THREE from 'three'
import { clone as cloneSkeleton } from 'three/examples/jsm/utils/SkeletonUtils.js'

// Self-host the Draco decoder (public/draco/) instead of drei's default
// gstatic.com CDN — the CDN can be blocked/unreachable on some networks, which
// would leave the .draco.glb models unable to decode and the viewer blank.
const DRACO_DECODER_PATH = '/draco/'
useGLTF.setDecoderPath(DRACO_DECODER_PATH)

/** Drop a model from the loader cache so a failed load can be retried. */
export function clearCharacterGltf(url: string) {
  try {
    useGLTF.clear(url)
  } catch {
    /* no-op */
  }
}
import {
  managedMeshNames,
  normalizeMeshName,
  visibleMeshNames,
  type CharacterOutfit,
} from './character-config'
import type { PerformanceTier } from './performance-tier'

const MANAGED_MESHES = managedMeshNames()

// "Wireframe" view = a neutral solid clay fill with a wireframe overlay on top
// (not the textured render). Applied via scene.overrideMaterial so it works on
// skinned meshes without touching the real materials.
const CLAY_MATERIAL = new THREE.MeshStandardMaterial({
  color: new THREE.Color('#aeb6c4'),
  roughness: 0.9,
  metalness: 0.0,
})
const WIRE_MATERIAL = new THREE.MeshBasicMaterial({
  color: new THREE.Color('#5fe6ff'),
  wireframe: true,
  transparent: true,
  opacity: 0.5,
  polygonOffset: true,
  polygonOffsetFactor: -2,
  polygonOffsetUnits: -2,
})

function applyOutfit(root: THREE.Object3D, outfit: CharacterOutfit) {
  const visible = visibleMeshNames(outfit)
  // Toggle the wearable node itself; child meshes inherit visibility at render.
  // Nodes not controlled by any region (e.g. BodyMe) are left untouched.
  root.traverse((node) => {
    const key = normalizeMeshName(node.name)
    if (MANAGED_MESHES.has(key)) {
      node.visible = visible.has(key)
    }
  })
}

// Some exported materials ship as alpha-blended, which makes clothing/skin look
// see-through. Force them opaque (glasses-style transparency can be re-added later).
function normalizeMaterials(root: THREE.Object3D) {
  root.traverse((node) => {
    const mesh = node as THREE.Mesh
    if (!mesh.isMesh) return
    const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material]
    mats.forEach((mat) => {
      const standard = mat as THREE.MeshStandardMaterial
      standard.transparent = false
      standard.depthWrite = true
      standard.alphaTest = 0
      standard.side = THREE.FrontSide
      standard.needsUpdate = true
    })
  })
}

type ClipStep = { name: string; loop: boolean }

type CharacterModelProps = {
  url: string
  outfit: CharacterOutfit
  loop: boolean
  autoRotate: boolean
  wireframe: boolean
  /** Optional multi-clip sequence (auto-chained). Falls back to the first clip. */
  clips?: ClipStep[]
  /** When provided, the model renders as a two-pass scissor split (wireframe ⟷ rendered). */
  swipeRatioRef?: MutableRefObject<number> | null
}

function CharacterModel({
  url,
  outfit,
  loop,
  autoRotate,
  wireframe,
  clips,
  swipeRatioRef = null,
}: CharacterModelProps) {
  const groupRef = useRef<THREE.Group>(null)
  const { scene, animations } = useGLTF(url, DRACO_DECODER_PATH)
  const cloned = useMemo(() => cloneSkeleton(scene) as THREE.Object3D, [scene])
  const { actions, names, mixer } = useAnimations(animations, cloned)
  const { gl, scene: rootScene, camera, size } = useThree()

  // CC rigs export with a 0.01 armature scale and skinned meshes, so the
  // geometry's local bounds don't reflect what's actually rendered. Measure the
  // real extent from the skeleton's bone world positions, then center + scale.
  const fit = useMemo(() => {
    cloned.updateMatrixWorld(true)
    const box = new THREE.Box3()
    const v = new THREE.Vector3()
    let hasBones = false
    cloned.traverse((node) => {
      const bone = node as THREE.Bone
      if (bone.isBone) {
        box.expandByPoint(bone.getWorldPosition(v))
        hasBones = true
      }
    })
    if (!hasBones || box.isEmpty()) box.setFromObject(cloned)
    const size = box.getSize(new THREE.Vector3())
    const center = box.getCenter(new THREE.Vector3())
    const maxDim = Math.max(size.x, size.y, size.z) || 1
    const scale = 1.7 / maxDim
    return { scale, offset: center.multiplyScalar(-scale) }
  }, [cloned])

  useEffect(() => {
    // Resolve the playback sequence (named clips that actually exist), falling
    // back to the file's first clip.
    const requested = clips && clips.length ? clips : null
    const sequence: ClipStep[] = requested
      ? requested.filter((step) => actions[step.name])
      : names[0]
        ? [{ name: names[0], loop }]
        : []
    if (sequence.length === 0) return

    let index = 0
    let current: THREE.AnimationAction | null = null

    const playStep = (i: number) => {
      const step = sequence[i]
      const action = step ? actions[step.name] : null
      if (!action) return
      action.reset()
      action.setLoop(step.loop ? THREE.LoopRepeat : THREE.LoopOnce, Infinity)
      action.clampWhenFinished = !step.loop
      action.enabled = true
      action.fadeIn(0.2)
      action.play()
      if (current && current !== action) current.crossFadeTo(action, 0.2, false)
      current = action
    }

    const onFinished = () => {
      if (index < sequence.length - 1) {
        index += 1
        playStep(index)
      }
    }

    mixer.addEventListener('finished', onFinished)
    playStep(0)

    return () => {
      mixer.removeEventListener('finished', onFinished)
      Object.values(actions).forEach((action) => action?.stop())
    }
  }, [actions, names, mixer, clips, loop])

  useEffect(() => {
    normalizeMaterials(cloned)
  }, [cloned])

  useEffect(() => {
    applyOutfit(cloned, outfit)
  }, [cloned, outfit])

  useFrame((_, delta) => {
    if (autoRotate && groupRef.current) {
      groupRef.current.rotation.y += delta * 0.5
    }
  })

  // A priority frame (>0) disables R3F's automatic render, so we render manually
  // here in every mode. Wireframe view = clay fill + wireframe overlay passes.
  useFrame(() => {
    const dpr = gl.getPixelRatio()
    const width = size.width * dpr
    const height = size.height * dpr

    const renderTextured = () => {
      rootScene.overrideMaterial = null
      gl.render(rootScene, camera)
    }
    const renderWire = () => {
      rootScene.overrideMaterial = CLAY_MATERIAL
      gl.render(rootScene, camera)
      rootScene.overrideMaterial = WIRE_MATERIAL
      gl.render(rootScene, camera)
      rootScene.overrideMaterial = null
    }

    gl.autoClear = false
    gl.setScissorTest(false)
    gl.setViewport(0, 0, width, height)
    gl.clear()

    if (!swipeRatioRef) {
      if (wireframe) renderWire()
      else renderTextured()
      return
    }

    // Swipe reveal: scissor split — left = clay+wireframe, right = textured.
    const ratio = Math.min(0.98, Math.max(0.02, swipeRatioRef.current))
    const splitX = Math.round(width * ratio)
    gl.setScissorTest(true)

    gl.setScissor(splitX, 0, width - splitX, height)
    renderTextured()

    gl.setScissor(0, 0, splitX, height)
    renderWire()

    gl.setScissorTest(false)
  }, 1)

  return (
    <>
      <ambientLight intensity={0.55} />
      <directionalLight position={[4, 6, 3]} intensity={1.2} />
      <directionalLight position={[-3, 2, -4]} intensity={0.35} color="#88ccff" />
      <group ref={groupRef}>
        <group scale={fit.scale} position={[fit.offset.x, fit.offset.y, fit.offset.z]}>
          <primitive object={cloned} />
        </group>
      </group>
      <Environment preset="city" />
    </>
  )
}

type CharacterViewerCanvasProps = {
  url: string
  outfit: CharacterOutfit
  loop: boolean
  autoRotate: boolean
  wireframe: boolean
  clips?: ClipStep[]
  swipeRatioRef?: MutableRefObject<number> | null
  performanceTier?: PerformanceTier
  className?: string
}

export function CharacterViewerCanvas({
  url,
  outfit,
  loop,
  autoRotate,
  wireframe,
  clips,
  swipeRatioRef = null,
  performanceTier = 'mid',
  className = '',
}: CharacterViewerCanvasProps) {
  const dpr: [number, number] = performanceTier === 'high' ? [1, 2] : [1, 1.25]

  return (
    <div className={`h-full w-full ${className}`}>
      <Canvas
        camera={{ position: [0, 0.15, 3.6], fov: 40, near: 0.05, far: 100 }}
        dpr={dpr}
        gl={{
          antialias: performanceTier === 'high',
          alpha: true,
          powerPreference: 'high-performance',
        }}
      >
        <Suspense fallback={null}>
          <CharacterModel
            url={url}
            outfit={outfit}
            loop={loop}
            autoRotate={autoRotate}
            wireframe={wireframe}
            clips={clips}
            swipeRatioRef={swipeRatioRef}
          />
        </Suspense>
        <OrbitControls
          makeDefault
          enablePan
          screenSpacePanning
          enableRotate
          enableZoom
          autoRotate={false}
          minDistance={0.4}
          maxDistance={12}
        />
      </Canvas>
    </div>
  )
}
