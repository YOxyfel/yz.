'use client'

import { motion, useInView, useReducedMotion } from 'framer-motion'
import { useEffect, useRef, useState, type ComponentPropsWithoutRef, type ReactNode } from 'react'
import {
  FLIP_BACK_HOLD_MS,
  FLIP_IN_DURATION,
  FLIP_OUT_DURATION,
} from './motion'
import { useSiteVariant } from './site-variant-context'

function mergeClass(...parts: Array<string | false | undefined>) {
  return parts.filter(Boolean).join(' ')
}

const variantMap = {
  hull: 'station-panel',
  display: 'station-panel station-display-bezel',
  module: 'station-panel station-module',
}

const backVariantLabel = {
  hull: 'HULL-PLATE',
  display: 'DISPLAY-BAY',
  module: 'SYS-MODULE',
} as const

type StationVariant = keyof typeof variantMap

function PanelChrome({ children }: { children: ReactNode }) {
  return (
    <>
      <span className="station-rivet station-rivet-tl" aria-hidden />
      <span className="station-rivet station-rivet-tr" aria-hidden />
      <span className="station-rivet station-rivet-bl" aria-hidden />
      <span className="station-rivet station-rivet-br" aria-hidden />
      <div className="station-panel-content">{children}</div>
    </>
  )
}

function PanelBack({
  variant,
  label,
}: {
  variant: StationVariant
  label?: string
}) {
  return (
    <div className={mergeClass('station-panel-back', `station-panel-back-${variant}`)}>
      <div className="station-panel-back-grid" aria-hidden />
      <div className="station-panel-back-vents" aria-hidden>
        {Array.from({ length: 8 }, (_, index) => (
          <span key={index} />
        ))}
      </div>
      <div className="station-panel-back-stripes" aria-hidden />
      <div className="station-panel-back-meta">
        <p className="station-panel-back-tag">{label ?? backVariantLabel[variant]}</p>
        <p className="station-panel-back-serial">STN·REV-02·AFT</p>
      </div>
      <div className="station-panel-back-ports" aria-hidden>
        <span />
        <span />
        <span />
      </div>
    </div>
  )
}

type StationFlipPanelProps = {
  children: ReactNode
  className?: string
  variant?: StationVariant
  interactive?: boolean
  fill?: boolean
  flipDelay?: number
  flipOnView?: boolean
  backLabel?: string
} & ComponentPropsWithoutRef<'div'>

function StationFlipPanel({
  children,
  className,
  variant = 'hull',
  interactive = false,
  fill = false,
  flipDelay = 0,
  flipOnView = true,
  backLabel,
  ...props
}: StationFlipPanelProps) {
  const reduceMotion = useReducedMotion()
  const sceneRef = useRef<HTMLDivElement>(null)
  const isInView = useInView(sceneRef, {
    amount: 0.38,
    margin: '0px 0px -8% 0px',
  })
  const [showFront, setShowFront] = useState(false)

  useEffect(() => {
    if (reduceMotion) {
      setShowFront(true)
      return
    }

    if (!isInView) {
      setShowFront(false)
      return
    }

    const holdMs = FLIP_BACK_HOLD_MS + flipDelay * 1000
    const timer = window.setTimeout(() => setShowFront(true), holdMs)
    return () => window.clearTimeout(timer)
  }, [flipDelay, isInView, reduceMotion])

  const panelClass = mergeClass(
    variantMap[variant],
    interactive && 'station-panel-interactive',
    fill && 'station-panel-fill h-full'
  )

  const faces = (
    <>
      <div className="station-flip-back" aria-hidden>
        <PanelBack variant={variant} label={backLabel} />
      </div>
      <div className="station-flip-front">
        <div className={panelClass}>
          <PanelChrome>{children}</PanelChrome>
        </div>
      </div>
    </>
  )

  const sceneClass = mergeClass(
    'station-flip-scene',
    fill && 'station-flip-fill',
    interactive && 'station-flip-interactive',
    className
  )

  if (!flipOnView || reduceMotion) {
    return (
      <div ref={sceneRef} className={sceneClass} {...props}>
        <div className="station-flip-card station-flip-card-ready">{faces}</div>
      </div>
    )
  }

  const rotateY = showFront ? 0 : 180

  return (
    <div ref={sceneRef} className={sceneClass} {...props}>
      <motion.div
        className="station-flip-card"
        animate={{ rotateY }}
        transition={{
          duration: showFront ? FLIP_IN_DURATION : FLIP_OUT_DURATION,
          ease: [0.22, 1, 0.36, 1],
        }}
        style={{ transformStyle: 'preserve-3d' }}
      >
        {faces}
      </motion.div>
    </div>
  )
}

type StationPanelProps = {
  children: ReactNode
  className?: string
  variant?: StationVariant
  tilt?: 'none' | 'left' | 'right' | 'center'
  interactive?: boolean
  iso?: boolean
  flipDelay?: number
  flipOnView?: boolean
  backLabel?: string
  fill?: boolean
} & ComponentPropsWithoutRef<'div'>

export function StationPanel({
  children,
  className,
  variant = 'hull',
  interactive = false,
  iso = true,
  flipDelay = 0,
  flipOnView = true,
  backLabel,
  fill = false,
  ...props
}: StationPanelProps) {
  const { panelUsesFlip } = useSiteVariant()
  const useFlipPanels = iso && panelUsesFlip
  const useFlipOnView = flipOnView && panelUsesFlip

  if (!useFlipPanels) {
    const panelClass = mergeClass(
      variantMap[variant],
      interactive && 'station-panel-interactive',
      fill && 'station-panel-fill h-full',
      className
    )

    return (
      <div className={panelClass} {...props}>
        <PanelChrome>{children}</PanelChrome>
      </div>
    )
  }

  return (
    <StationFlipPanel
      variant={variant}
      interactive={interactive}
      fill={fill}
      flipDelay={flipDelay}
      flipOnView={useFlipOnView}
      backLabel={backLabel}
      className={className}
      {...props}
    >
      {children}
    </StationFlipPanel>
  )
}

export function StationScreen({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return <div className={mergeClass('station-screen', className)}>{children}</div>
}

export function StationLed({
  active = true,
  tone = 'cyan',
  pulse = false,
  className,
}: {
  active?: boolean
  tone?: 'cyan' | 'violet' | 'amber' | 'rose'
  pulse?: boolean
  className?: string
}) {
  return (
    <span
      aria-hidden
      className={mergeClass(
        'station-led',
        `station-led-${tone}`,
        active && 'station-led-on',
        pulse && 'station-led-pulse',
        className
      )}
    />
  )
}

export function StationReadout({
  label,
  children,
  className,
}: {
  label: string
  children?: ReactNode
  className?: string
}) {
  return (
    <div className={mergeClass('station-readout', className)}>
      <p className="station-readout-label">
        <span className="station-bracket">[</span>
        {label}
        <span className="station-bracket">]</span>
      </p>
      {children}
    </div>
  )
}

type StationButtonProps = {
  children: ReactNode
  className?: string
  variant?: 'primary' | 'secondary' | 'ghost'
  href?: string
} & ComponentPropsWithoutRef<'button'>

export function StationButton({
  children,
  className,
  variant = 'primary',
  href,
  ...props
}: StationButtonProps) {
  const classes = mergeClass(
    'station-button',
    variant === 'primary' && 'station-button-primary',
    variant === 'secondary' && 'station-button-secondary',
    variant === 'ghost' && 'station-button-ghost',
    className
  )

  if (href) {
    return (
      <a href={href} className={classes}>
        {children}
      </a>
    )
  }

  return (
    <button type="button" className={classes} {...props}>
      {children}
    </button>
  )
}

export function StationChip({
  children,
  active = false,
  className,
}: {
  children: ReactNode
  active?: boolean
  className?: string
}) {
  return (
    <span className={mergeClass('station-chip', active && 'station-chip-active', className)}>
      {children}
    </span>
  )
}

export type StationTone =
  | 'bridge'
  | 'nav'
  | 'engine'
  | 'signal'
  | 'partner'
  | 'arsenal'
  | 'stack'
  | 'faq'
  | 'comms'
  | 'page'

export function StationSection({
  children,
  className,
  id,
  tone,
}: {
  children: ReactNode
  className?: string
  id?: string
  tone?: StationTone
}) {
  return (
    <section
      id={id}
      data-station-tone={tone}
      className={mergeClass('station-section', tone ? `station-section--${tone}` : '', className)}
    >
      {tone ? (
        <>
          <div className="station-sector-backdrop" aria-hidden />
          <div className="station-section-inner">
            <div className="station-sector-rail" aria-hidden />
            {children}
          </div>
        </>
      ) : (
        <div className="station-section-inner">{children}</div>
      )}
    </section>
  )
}

export function StationConsoleFrame({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div className={mergeClass('station-console-frame', className)}>
      <div className="station-console-rail station-console-rail-left" aria-hidden />
      <div className="station-console-rail station-console-rail-right" aria-hidden />
      {children}
    </div>
  )
}
