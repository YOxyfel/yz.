'use client'

import dynamic from 'next/dynamic'
import Image from 'next/image'
import {
  Box,
  Expand,
  Grid3x3,
  Layers,
  Maximize2,
  RotateCcw,
  Scan,
} from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { CompareSwipe } from './compare-swipe'
import { useDeviceProfile } from './device-profile'
import type { PropAsset, PropViewMode } from './arsenal-props'
import { propViewModeLabels } from './arsenal-props'

const PropViewerCanvas = dynamic(
  () => import('./prop-viewer-canvas').then((mod) => mod.PropViewerCanvas),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full w-full items-center justify-center font-mono text-xs uppercase tracking-widest text-muted-foreground">
        Loading viewer…
      </div>
    ),
  }
)

const swipeModes: PropViewMode[] = ['swipe-live', 'swipe-images', 'swipe-hybrid']
const canvasModes: PropViewMode[] = ['orbit', 'wireframe', 'beauty', ...swipeModes]

function PipelinePlaceholder({ asset }: { asset: PropAsset }) {
  return (
    <div className="relative flex h-full w-full flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-black via-card/60 to-black p-8 text-center">
      {asset.poster ? (
        <Image
          src={asset.poster}
          alt=""
          fill
          className="object-cover opacity-25 blur-sm"
          sizes="(max-width: 768px) 100vw, 50vw"
        />
      ) : null}
      <div className="relative z-10 max-w-sm space-y-4">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-cyan/30 bg-cyan/10 text-cyan">
          <Box className="h-7 w-7" />
        </div>
        <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-cyan">Pipeline slot</p>
        <p className="font-heading text-xl font-bold tracking-tight">{asset.title}</p>
        <p className="text-sm leading-relaxed text-muted-foreground">{asset.description}</p>
        <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          Drop a .glb into public/arsenal/models/
        </p>
      </div>
      <div
        className="pointer-events-none absolute inset-0 opacity-30"
        style={{
          backgroundImage:
            'linear-gradient(oklch(0.84 0.16 200 / 0.08) 1px, transparent 1px), linear-gradient(90deg, oklch(0.84 0.16 200 / 0.08) 1px, transparent 1px)',
          backgroundSize: '28px 28px',
        }}
      />
    </div>
  )
}

type PropViewerProps = {
  asset: PropAsset
}

export function PropViewer({ asset }: PropViewerProps) {
  const hasModel = Boolean(asset.glb)
  const hasStills = Boolean(asset.beauty && asset.wireframe)
  const [viewMode, setViewMode] = useState<PropViewMode>('orbit')
  const [showQuadMesh, setShowQuadMesh] = useState(false)
  const [autoRotate, setAutoRotate] = useState(true)
  const [mobileExpanded, setMobileExpanded] = useState(false)
  const { isNarrow: isMobile } = useDeviceProfile()

  useEffect(() => {
    if (!hasModel && swipeModes.includes(viewMode)) {
      setViewMode(hasStills ? 'swipe-images' : 'orbit')
    }
    if (!hasStills && viewMode === 'swipe-images') {
      setViewMode(hasModel ? 'orbit' : 'orbit')
    }
    if (!hasModel && (viewMode === 'swipe-live' || viewMode === 'swipe-hybrid')) {
      setViewMode(hasStills ? 'swipe-images' : 'orbit')
    }
  }, [asset.id, hasModel, hasStills, viewMode])

  const availableModes = useMemo(() => {
    const modes: PropViewMode[] = []
    if (hasModel) modes.push('orbit', 'wireframe', 'beauty', 'swipe-live')
    if (hasStills) modes.push('swipe-images')
    if (hasModel && hasStills) modes.push('swipe-hybrid')
    if (modes.length === 0) modes.push('orbit')
    return modes
  }, [hasModel, hasStills])

  const showCanvas =
    hasModel &&
    (!isMobile || mobileExpanded) &&
    (canvasModes.includes(viewMode) || swipeModes.includes(viewMode))

  const posterSrc = asset.poster ?? asset.beauty

  const renderStill = useCallback(
    (src: string | undefined, alt: string, wire = false) =>
      src ? (
        <Image src={src} alt={alt} fill className="object-contain p-4" sizes="(max-width: 768px) 100vw, 50vw" />
      ) : (
        <div
          className={`flex h-full w-full items-center justify-center ${wire ? 'opacity-80' : ''}`}
          style={{
            backgroundImage:
              'linear-gradient(oklch(0.84 0.16 200 / 0.12) 1px, transparent 1px), linear-gradient(90deg, oklch(0.84 0.16 200 / 0.12) 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }}
        >
          <Scan className="h-10 w-10 text-cyan/50" />
        </div>
      ),
    []
  )

  const viewerBody =
    !hasModel && asset.status === 'pipeline' ? (
      <PipelinePlaceholder asset={asset} />
    ) : viewMode === 'swipe-images' && hasStills ? (
      <CompareSwipe
        className="h-full w-full"
        left={renderStill(asset.wireframe, `${asset.title} wireframe`, true)}
        right={renderStill(asset.beauty, `${asset.title} beauty`)}
        labelLeft="Wireframe"
        labelRight="Rendered"
      />
    ) : viewMode === 'swipe-hybrid' && hasModel && hasStills ? (
      <CompareSwipe
        className="h-full w-full"
        left={
          <PropViewerCanvas
            glb={asset.glb!}
            viewMode="wireframe"
            showQuadMesh={showQuadMesh}
            swipeRatio={1}
            autoRotate={false}
          />
        }
        right={renderStill(asset.beauty, `${asset.title} beauty`)}
        labelLeft="Wireframe"
        labelRight="Beauty still"
      />
    ) : viewMode === 'swipe-live' && hasModel && showCanvas ? (
      <CompareSwipe
        className="h-full w-full"
        left={
          <PropViewerCanvas
            glb={asset.glb!}
            viewMode="wireframe"
            showQuadMesh={false}
            swipeRatio={1}
            autoRotate={false}
          />
        }
        right={
          <PropViewerCanvas
            glb={asset.glb!}
            viewMode="beauty"
            showQuadMesh={false}
            swipeRatio={0}
            autoRotate={false}
          />
        }
        labelLeft="Wireframe"
        labelRight="Rendered"
      />
    ) : showCanvas ? (
      <PropViewerCanvas
        glb={asset.glb!}
        viewMode={viewMode}
        showQuadMesh={showQuadMesh}
        swipeRatio={0.5}
        autoRotate={autoRotate}
      />
    ) : isMobile && posterSrc && !mobileExpanded ? (
      <div className="relative h-full w-full">
        <Image
          src={posterSrc}
          alt={asset.title}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 50vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        <button
          type="button"
          onClick={() => setMobileExpanded(true)}
          className="mobile-solid-backdrop absolute inset-x-0 bottom-6 mx-auto flex w-fit items-center gap-2 rounded-full border border-cyan/40 bg-black/85 px-5 py-2.5 font-mono text-xs uppercase tracking-wider text-cyan transition-transform hover:scale-105"
        >
          <Maximize2 className="h-4 w-4" />
          View in 3D
        </button>
      </div>
    ) : (
      <PipelinePlaceholder asset={asset} />
    )

  return (
    <div className="space-y-4">
      <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-white/10 bg-black/50">
        {viewerBody}
        {isMobile && mobileExpanded ? (
          <button
            type="button"
            onClick={() => setMobileExpanded(false)}
            className="mobile-solid-backdrop absolute right-3 top-3 z-20 flex items-center gap-1.5 rounded-full border border-white/15 bg-black/85 px-3 py-1.5 font-mono text-[10px] uppercase tracking-wider text-foreground"
          >
            <Expand className="h-3.5 w-3.5" />
            Poster
          </button>
        ) : null}
      </div>

      <div className="flex flex-wrap gap-2">
        {availableModes.map((mode) => (
          <button
            key={mode}
            type="button"
            onClick={() => setViewMode(mode)}
            className={`rounded-full border px-3 py-1.5 font-mono text-[10px] uppercase tracking-wider transition-all ${
              viewMode === mode
                ? 'border-cyan/40 bg-cyan/15 text-cyan'
                : 'border-white/10 text-muted-foreground hover:border-white/25'
            }`}
          >
            {propViewModeLabels[mode]}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          disabled={!hasModel}
          onClick={() => setShowQuadMesh((value) => !value)}
          className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 font-mono text-[10px] uppercase tracking-wider transition-all disabled:opacity-40 ${
            showQuadMesh
              ? 'border-cyan/40 bg-cyan/10 text-cyan'
              : 'border-white/10 text-muted-foreground hover:border-white/25'
          }`}
        >
          <Grid3x3 className="h-3.5 w-3.5" />
          Quad mesh
        </button>
        <button
          type="button"
          disabled={!hasModel || viewMode !== 'orbit'}
          onClick={() => setAutoRotate((value) => !value)}
          className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 font-mono text-[10px] uppercase tracking-wider transition-all disabled:opacity-40 ${
            autoRotate
              ? 'border-cyan/40 bg-cyan/10 text-cyan'
              : 'border-white/10 text-muted-foreground hover:border-white/25'
          }`}
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Auto spin
        </button>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 px-3 py-1.5 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
          <Layers className="h-3.5 w-3.5" />
          {asset.status === 'pipeline' ? 'Awaiting GLB' : asset.polyCount ?? 'Ready'}
        </span>
      </div>
    </div>
  )
}
