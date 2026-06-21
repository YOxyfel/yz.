'use client'

import { AnimatePresence, motion } from 'framer-motion'
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
import { constellationCenterY, skyVisualFilter, useSkyScrollFade } from './sky-scroll-fade'

function renderSegmentLines(
  constellation: Constellation,
  segment: MergeSegment,
  segmentIndex: number,
  lite = false
) {
  return segment.stars.slice(1).map((star, index) => {
    const previous = segment.stars[index]
    return (
      <motion.line
        key={`${constellation.id}-seg-${segmentIndex}-${previous.id}-${star.id}`}
        x1={previous.x}
        y1={previous.y}
        x2={star.x}
        y2={star.y}
        className={variantLineClass(constellation.variant)}
        initial={{ opacity: 0 }}
        animate={{ opacity: constellation.merging ? 0 : 0.85 }}
        transition={{ duration: lite ? 0 : 0.45, delay: constellation.merging ? MERGE_DURATION * 0.55 : 0 }}
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

function ConstellationCanvas({
  lite = false,
  hideLabels = false,
}: {
  lite?: boolean
  hideLabels?: boolean
}) {
  const { constellations } = useConstellations()
  const { getSkyVisual } = useSkyScrollFade()
  const visible = constellations.filter((item) => !item.hidden)

  return (
    <div className="pointer-events-none absolute inset-0">
      <svg className="absolute inset-0 h-full w-full overflow-visible" aria-hidden>
        {visible.map((constellation) => {
          const centerY = constellationCenterY(
            constellation.segments
              ? allSegmentStars(constellation.segments)
              : constellation.stars,
            constellation.anchor
          )
          const skyVisual = getSkyVisual(centerY)
          const skyStyle = {
            opacity: skyVisual.opacity,
            filter: skyVisualFilter(skyVisual),
          }

          if (constellation.segments?.length) {
            return (
              <g key={`lines-${constellation.id}`} style={skyStyle}>
                {constellation.segments.flatMap((segment, segmentIndex) =>
                  renderSegmentLines(constellation, segment, segmentIndex, lite)
                )}
              </g>
            )
          }

          return (
            <g key={`lines-${constellation.id}`} style={skyStyle}>
              {constellation.stars.slice(1).map((star, index) => {
                const previous = constellation.stars[index]
                return (
                  <line
                    key={`${constellation.id}-${previous.id}-${star.id}`}
                    x1={previous.x}
                    y1={previous.y}
                    x2={star.x}
                    y2={star.y}
                    className={variantLineClass(
                      constellation.complete ? constellation.variant : undefined
                    )}
                  />
                )
              })}
            </g>
          )
        })}
      </svg>

      {visible.map((constellation) => {
        const labelStars = constellation.segments
          ? allSegmentStars(constellation.segments)
          : constellation.stars
        const showLabel = !hideLabels && constellation.complete && constellation.name
        const labelPosition = showLabel
          ? constellationLabelPosition(labelStars, constellation.anchor)
          : null
        const starClass = variantStarClass(
          constellation.complete ? constellation.variant : undefined
        )
        const labelClass = variantLabelClass(constellation.variant)
        const centerY = constellationCenterY(labelStars, constellation.anchor)
        const skyVisual = getSkyVisual(centerY)
        const skyStyle = {
          opacity: skyVisual.opacity,
          filter: skyVisualFilter(skyVisual),
        }

        return (
          <div key={constellation.id} style={skyStyle}>
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
                {constellation.stars.map((star) => (
                  <motion.span
                    key={star.id}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.35, ease: 'easeOut' }}
                    style={{ left: star.x, top: star.y }}
                    className={starClass}
                  />
                ))}

                {constellation.stars.length === 0 && constellation.anchor ? (
                  <motion.span
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    style={{
                      left: constellation.anchor.x,
                      top: constellation.anchor.y,
                    }}
                    className={starClass}
                  />
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
      })}
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
  return <ConstellationCanvas lite={lite} hideLabels={hideLabels} />
}
