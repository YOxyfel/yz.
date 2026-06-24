'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { memo, useMemo } from 'react'
import {
  allSegmentStars,
  constellationLabelPosition,
  variantLabelClass,
  variantLineClass,
  variantStarClass,
  type Constellation,
  type MergeSegment,
} from './constellation-logic'
import { MERGE_DURATION, useConstellations } from './constellation-context'
import { constellationCenterY, useSkyScrollFade } from './sky-scroll-fade'

function constellationRenderKey(constellation: Constellation) {
  return [
    constellation.id,
    constellation.complete ? 1 : 0,
    constellation.merging ? 1 : 0,
    constellation.mergeFlash ? 1 : 0,
    constellation.hidden ? 1 : 0,
    constellation.name ?? '',
    constellation.variant ?? '',
    constellation.stars.length,
    constellation.segments?.length ?? 0,
  ].join(':')
}

function ConstellationLine({
  x1,
  y1,
  x2,
  y2,
  className,
  merging,
  lite,
  animateDraw,
}: {
  x1: number
  y1: number
  x2: number
  y2: number
  className: string
  merging: boolean
  lite: boolean
  animateDraw: boolean
}) {
  if (!animateDraw || lite) {
    return (
      <line
        x1={x1}
        y1={y1}
        x2={x2}
        y2={y2}
        className={className}
        opacity={merging ? 0 : 0.85}
      />
    )
  }

  return (
    <motion.line
      x1={x1}
      y1={y1}
      x2={x2}
      y2={y2}
      className={className}
      initial={{ opacity: 0 }}
      animate={{ opacity: merging ? 0 : 0.85 }}
      transition={{
        duration: 0.45,
        delay: merging ? MERGE_DURATION * 0.55 : 0,
      }}
    />
  )
}

function renderConstellationLines(constellation: Constellation, lite = false) {
  const lineClass = variantLineClass(constellation.complete ? constellation.variant : undefined)
  const animateDraw = !constellation.complete || Boolean(constellation.merging)
  const pairs =
    constellation.lines ??
    constellation.stars.slice(1).map((_, index) => [index, index + 1] as [number, number])

  return pairs.map(([fromIndex, toIndex], lineIndex) => {
    const from = constellation.stars[fromIndex]
    const to = constellation.stars[toIndex]
    if (!from || !to) return null

    return (
      <ConstellationLine
        key={`${constellation.id}-line-${from.id}-${to.id}-${lineIndex}`}
        x1={from.x}
        y1={from.y}
        x2={to.x}
        y2={to.y}
        className={lineClass}
        merging={Boolean(constellation.merging)}
        lite={lite}
        animateDraw={animateDraw}
      />
    )
  })
}

function renderSegmentLines(
  constellation: Constellation,
  segment: MergeSegment,
  segmentIndex: number,
  lite = false
) {
  const animateDraw = Boolean(constellation.merging)

  return segment.stars.slice(1).map((star, index) => {
    const previous = segment.stars[index]
    return (
      <ConstellationLine
        key={`${constellation.id}-seg-${segmentIndex}-${previous.id}-${star.id}`}
        x1={previous.x}
        y1={previous.y}
        x2={star.x}
        y2={star.y}
        className={variantLineClass(constellation.variant)}
        merging={Boolean(constellation.merging)}
        lite={lite || !animateDraw}
        animateDraw={animateDraw}
      />
    )
  })
}

function SegmentStars({
  constellation,
  segment,
  segmentIndex,
}: {
  constellation: Constellation
  segment: MergeSegment
  segmentIndex: number
}) {
  const starClass = variantStarClass(constellation.variant)
  const merging = Boolean(constellation.merging)

  return (
    <>
      {segment.stars.map((star, starIndex) => {
        const initial = segment.initialStars[starIndex] ?? star
        return (
          <motion.span
            key={`${constellation.id}-seg-${segmentIndex}-${star.id}`}
            className={starClass}
            initial={{
              left: initial.x,
              top: initial.y,
              opacity: merging ? 0.75 : 0,
              scale: merging ? 0.85 : 0,
            }}
            animate={{
              left: star.x,
              top: star.y,
              opacity: 1,
              scale: 1,
            }}
            transition={{
              duration: merging ? MERGE_DURATION : 0.35,
              ease: [0.22, 1, 0.36, 1],
            }}
          />
        )
      })}

      {segment.stars.length === 0 && segment.anchor ? (
        <motion.span
          className={starClass}
          initial={{
            left: segment.initialAnchor?.x ?? segment.anchor.x,
            top: segment.initialAnchor?.y ?? segment.anchor.y,
            opacity: merging ? 0.75 : 0,
            scale: merging ? 0.85 : 0,
          }}
          animate={{
            left: segment.anchor.x,
            top: segment.anchor.y,
            opacity: 1,
            scale: 1,
          }}
          transition={{
            duration: merging ? MERGE_DURATION : 0.35,
            ease: [0.22, 1, 0.36, 1],
          }}
        />
      ) : null}
    </>
  )
}

const ConstellationLinesGroup = memo(function ConstellationLinesGroup({
  constellation,
  lite,
  layerOpacity,
}: {
  constellation: Constellation
  lite: boolean
  layerOpacity: number
}) {
  if (constellation.segments?.length) {
    return (
      <g style={{ opacity: layerOpacity }}>
        {constellation.segments.flatMap((segment, segmentIndex) =>
          renderSegmentLines(constellation, segment, segmentIndex, lite)
        )}
      </g>
    )
  }

  return <g style={{ opacity: layerOpacity }}>{renderConstellationLines(constellation, lite)}</g>
}, (prev, next) =>
  prev.lite === next.lite &&
  prev.layerOpacity === next.layerOpacity &&
  constellationRenderKey(prev.constellation) === constellationRenderKey(next.constellation)
)

const ConstellationStarsGroup = memo(function ConstellationStarsGroup({
  constellation,
  lite,
  hideLabels,
  layerOpacity,
}: {
  constellation: Constellation
  lite: boolean
  hideLabels: boolean
  layerOpacity: number
}) {
  const labelStars = constellation.segments
    ? allSegmentStars(constellation.segments)
    : constellation.stars
  const showLabel = !hideLabels && constellation.complete && constellation.name
  const labelPosition = showLabel
    ? constellationLabelPosition(labelStars, constellation.anchor)
    : null
  const starClass = variantStarClass(constellation.complete ? constellation.variant : undefined)
  const labelClass = variantLabelClass(constellation.variant)
  const useStaticStars = constellation.complete && !constellation.merging && !lite

  return (
    <div style={{ opacity: layerOpacity }}>
      {constellation.mergeFlash && labelPosition ? (
        <motion.span
          aria-hidden
          className={`constellation-merge-burst ${labelClass}`}
          initial={{ opacity: 0.9, scale: 0.15 }}
          animate={{ opacity: 0, scale: 2.8 }}
          transition={{ duration: MERGE_DURATION + 0.2, ease: 'easeOut' }}
          style={{
            left: labelPosition.centerX,
            top: labelPosition.labelY - 20,
          }}
        />
      ) : null}

      {constellation.segments?.length ? (
        constellation.segments.map((segment, segmentIndex) => (
          <SegmentStars
            key={`${constellation.id}-segment-${segmentIndex}`}
            constellation={constellation}
            segment={segment}
            segmentIndex={segmentIndex}
          />
        ))
      ) : (
        <>
          {constellation.stars.map((star) =>
            useStaticStars ? (
              <span
                key={star.id}
                style={{ left: star.x, top: star.y }}
                className={starClass}
              />
            ) : (
              <motion.span
                key={star.id}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
                style={{ left: star.x, top: star.y }}
                className={starClass}
              />
            )
          )}

          {constellation.stars.length === 0 && constellation.anchor ? (
            useStaticStars ? (
              <span
                style={{
                  left: constellation.anchor.x,
                  top: constellation.anchor.y,
                }}
                className={starClass}
              />
            ) : (
              <motion.span
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                style={{
                  left: constellation.anchor.x,
                  top: constellation.anchor.y,
                }}
                className={starClass}
              />
            )
          ) : null}
        </>
      )}

      <AnimatePresence>
        {showLabel && labelPosition ? (
          <motion.p
            key="label"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
            style={{
              left: labelPosition.centerX,
              top: labelPosition.labelY,
            }}
            className={labelClass}
          >
            {constellation.name}
          </motion.p>
        ) : null}
      </AnimatePresence>
    </div>
  )
}, (prev, next) =>
  prev.lite === next.lite &&
  prev.hideLabels === next.hideLabels &&
  prev.layerOpacity === next.layerOpacity &&
  constellationRenderKey(prev.constellation) === constellationRenderKey(next.constellation)
)

function ConstellationCanvas({
  lite = false,
  hideLabels = false,
}: {
  lite?: boolean
  hideLabels?: boolean
}) {
  const { constellations } = useConstellations()
  const { getSkyVisual } = useSkyScrollFade()
  const visible = useMemo(() => constellations.filter((item) => !item.hidden), [constellations])

  const layerOpacities = useMemo(
    () =>
      new Map(
        visible.map((constellation) => {
          const centerY = constellationCenterY(
            constellation.segments
              ? allSegmentStars(constellation.segments)
              : constellation.stars,
            constellation.anchor
          )
          return [constellation.id, getSkyVisual(centerY).opacity] as const
        })
      ),
    [getSkyVisual, visible]
  )

  return (
    <div className="pointer-events-none absolute inset-0">
      <svg className="absolute inset-0 h-full w-full overflow-visible" aria-hidden>
        {visible.map((constellation) => (
          <ConstellationLinesGroup
            key={`lines-${constellation.id}`}
            constellation={constellation}
            lite={lite}
            layerOpacity={layerOpacities.get(constellation.id) ?? 1}
          />
        ))}
      </svg>

      {visible.map((constellation) => (
        <ConstellationStarsGroup
          key={constellation.id}
          constellation={constellation}
          lite={lite}
          hideLabels={hideLabels}
          layerOpacity={layerOpacities.get(constellation.id) ?? 1}
        />
      ))}
    </div>
  )
}

export function ClickConstellations({
  lite = false,
  hideLabels = false,
}: {
  lite?: boolean
  hideLabels?: boolean
}) {
  return (
    <div className="click-constellations-root pointer-events-none absolute inset-0">
      <ConstellationCanvas lite={lite} hideLabels={hideLabels} />
    </div>
  )
}
