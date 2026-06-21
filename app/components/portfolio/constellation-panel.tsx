'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { useTranslations } from 'next-intl'
import { useConstellations } from './constellation-context'
import { useDeviceProfile } from './device-profile'
import { resolveSkyLabFx, type SkyLabFxTier } from './sky-lab-fx'
import { StationChip, StationLed, StationPanel } from './station-console'
import { useVisualFxPreferences } from './visual-fx-preferences'
import type { MaxVisibleOption } from './constellation-store'
import type { ConstellationRecord, Constellation } from './constellation-logic'

const LIMIT_OPTIONS: MaxVisibleOption[] = [2, 4, 6, 8, 10]

function variantBadge(record: { variant?: string; starCount: number }) {
  if (record.variant && record.variant !== 'normal') {
    return record.variant.replace('meme-', '').toUpperCase()
  }
  return `${record.starCount}★`
}

function NavChartBody({
  listItems,
  listMode,
  skyList,
  archive,
  maxVisible,
  maxSkyConstellations,
  manualMode,
  crazyMode,
  toggleListMode,
  setMaxVisible,
  runAuto,
  toggleManualMode,
  toggleCrazyMode,
  revive,
  compact,
  mobileOnly,
  skyLabFxTier,
}: {
  listItems: Array<{
    key: string | number
    name: string
    meta: string
    record: ConstellationRecord | null
  }>
  listMode: 'sky' | 'archive'
  skyList: Constellation[]
  archive: ConstellationRecord[]
  maxVisible: MaxVisibleOption
  maxSkyConstellations: number
  manualMode: boolean
  crazyMode: boolean
  toggleListMode: () => void
  setMaxVisible: (value: MaxVisibleOption) => void
  runAuto: () => void
  toggleManualMode: () => void
  toggleCrazyMode: () => void
  revive: (record: ConstellationRecord) => void
  compact?: boolean
  mobileOnly?: boolean
  skyLabFxTier: SkyLabFxTier
}) {
  const t = useTranslations('SkyLab')
  const skyLabFxOff = skyLabFxTier === 'off'
  const skyLabFxReduced = skyLabFxTier === 'reduced'

  const fxHint =
    skyLabFxOff
      ? 'Site FX off — chart only. Turn on Site FX to draw in the sky.'
      : skyLabFxReduced
        ? 'Site FX reduced — lite constellations only; no planets or crazy mode.'
        : null

  if (mobileOnly) {
    return (
      <StationPanel variant="module" iso={false} className="mobile-sky-lab-panel p-3">
        <div className="relative z-[1] flex items-center justify-between gap-2">
          <p className="station-readout-label flex items-center gap-2">
            <StationLed active pulse />
            {t('navChart')}
          </p>
          <StationChip className="station-chip-active !text-xs">Manual</StationChip>
        </div>
        <p className="relative z-[1] mt-2 font-mono text-sm leading-relaxed tracking-wide text-muted-foreground">
          {skyLabFxOff ? t('manualFxOff') : t('manualDraw')}
        </p>
        <p className="relative z-[1] mb-2 mt-3 font-mono text-xs uppercase tracking-[0.16em] text-muted-foreground">
          {listMode === 'sky' ? `On sky (${skyList.length})` : `Archive (${archive.length})`}
        </p>
        <div className="station-screen relative z-[1] mb-4 max-h-28 nav-chart-scroll-frame">
          <ul className="nav-chart-scroll max-h-28 space-y-1.5 overflow-y-auto overscroll-contain p-2">
            {listItems.length === 0 ? (
              <li className="px-2 py-2 text-sm text-muted-foreground">No constellations yet.</li>
            ) : (
              listItems.map((item) => (
                <li
                  key={`${listMode}-${item.key}`}
                  className="rounded-md border border-[var(--station-bezel)]/30 bg-[var(--station-hull-dark)]/60 px-2.5 py-1.5"
                >
                  <p className="truncate text-sm font-medium text-foreground">{item.name}</p>
                </li>
              ))
            )}
          </ul>
        </div>
        {archive.length > 0 ? (
          <button
            type="button"
            onClick={toggleListMode}
            className="station-chip relative z-[1] mt-2 !px-2.5 !py-1 !text-[10px]"
          >
            {listMode === 'sky' ? 'Archive' : 'On sky'}
          </button>
        ) : null}
      </StationPanel>
    )
  }

  return (
    <StationPanel variant="module" iso={false} className="p-4">
      <div className="relative z-[1] mb-3 flex items-center justify-between gap-2">
        <p className="station-readout-label flex items-center gap-2">
          <StationLed active pulse />
          Nav chart
        </p>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={toggleListMode}
            className="station-chip !px-2.5 !py-1 !text-[10px]"
          >
            {listMode === 'sky' ? 'Archive' : 'On sky'}
          </button>
        </div>
      </div>

      {fxHint ? (
        <p className="relative z-[1] mb-3 rounded-md border border-white/10 bg-white/[0.03] px-2.5 py-2 font-mono text-[10px] leading-relaxed tracking-wide text-muted-foreground">
          {fxHint}
        </p>
      ) : null}

      <p className="relative z-[1] mb-2 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
        {listMode === 'sky' ? `Current (${skyList.length})` : `Last ${archive.length} / 30`}
      </p>

      <div className="station-screen relative z-[1] mb-4 nav-chart-scroll-frame">
        <ul
          className={`nav-chart-scroll space-y-1.5 p-2 ${
            listItems.length > 5 ? 'max-h-44 overflow-y-auto overscroll-contain' : ''
          }`}
        >
          {listItems.length === 0 ? (
            <li className="px-2 py-2 text-xs text-muted-foreground">
              {listMode === 'sky' ? 'No constellations yet.' : 'No archive entries yet.'}
            </li>
          ) : (
            listItems.map((item) => (
              <li
                key={`${listMode}-${item.key}`}
                className="flex items-center justify-between gap-2 rounded-md border border-[var(--station-bezel)]/30 bg-[var(--station-hull-dark)]/60 px-2.5 py-2"
              >
                <div className="min-w-0">
                  <p className="truncate text-xs font-medium text-foreground">{item.name}</p>
                  <p className="truncate font-mono text-[10px] text-muted-foreground">{item.meta}</p>
                </div>
                {item.record ? (
                  <button
                    type="button"
                    onClick={() => revive(item.record!)}
                    className="station-chip station-chip-active shrink-0 !border-violet/40 !text-violet !px-2 !py-0.5 !text-[10px]"
                  >
                    Revive
                  </button>
                ) : null}
              </li>
            ))
          )}
        </ul>
      </div>

      <div className="relative z-[1] mb-4">
        <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
          Sky limit
        </p>
        <div className="flex flex-wrap gap-1.5">
          {LIMIT_OPTIONS.map((option) => {
            const disabled = crazyMode || option > maxSkyConstellations
            return (
              <button
                key={option}
                type="button"
                disabled={disabled}
                onClick={() => setMaxVisible(option)}
                className={`station-chip transition-colors ${
                  maxVisible === option && !crazyMode ? 'station-chip-active' : ''
                } ${disabled ? 'cursor-not-allowed opacity-40' : ''}`}
              >
                {option}
              </button>
            )
          })}
        </div>
        {crazyMode ? (
          <p className="mt-1.5 font-mono text-[10px] text-amber-200/70">Crazy mode cap: 20</p>
        ) : null}
      </div>

      <div className="relative z-[1] space-y-2">
        <button
          type="button"
          onClick={runAuto}
          className="station-button station-button-secondary w-full !justify-start !px-3 !py-2 text-left"
        >
          <span className="block font-mono text-[10px] uppercase tracking-[0.22em] text-cyan">
            Auto
          </span>
          <span className="mt-0.5 block text-[11px] text-muted-foreground">
            {skyLabFxOff
              ? 'Enable Site FX to spawn sky visuals'
              : skyLabFxReduced
                ? 'Spawn constellations only'
                : compact
                  ? 'Spawn constellations + planets'
                  : `Spawn 2–${maxVisible} constellations + planets`}
          </span>
        </button>

        <button
          type="button"
          onClick={toggleManualMode}
          disabled={crazyMode || skyLabFxOff}
          className={`station-button w-full !justify-start !px-3 !py-2 text-left ${
            manualMode && !crazyMode
              ? 'station-button-manual-on border-cyan/40'
              : 'station-button-secondary'
          } ${crazyMode ? 'opacity-40' : ''}`}
        >
          <span className="station-button-title block font-mono text-[10px] uppercase tracking-[0.16em]">
            Manual {manualMode && !crazyMode ? 'ON' : 'OFF'}
          </span>
          <span className="station-button-subtitle mt-0.5 block text-xs leading-relaxed">
            {skyLabFxOff
              ? 'Drawing disabled while Site FX is off'
              : crazyMode
                ? 'Drawing locked — crazy spawns only'
                : compact
                  ? 'Tap sky to draw'
                  : 'Tap sky to draw · clears auto spawns'}
          </span>
        </button>

        <button
          type="button"
          onClick={toggleCrazyMode}
          disabled={skyLabFxOff || skyLabFxReduced}
          className={`station-button w-full !justify-start !px-3 !py-2 text-left ${
            crazyMode
              ? 'station-button-secondary border-rose-400/35 !bg-rose-500/15 !text-rose-100'
              : 'station-button-secondary'
          } ${skyLabFxOff || skyLabFxReduced ? 'cursor-not-allowed opacity-40' : ''}`}
        >
          <span className="block font-mono text-[10px] uppercase tracking-[0.22em]">
            Crazy mode {crazyMode ? 'ON' : 'OFF'}
          </span>
          <span className="mt-0.5 block text-[11px] text-muted-foreground">
            {skyLabFxOff
              ? 'Requires Site FX'
              : skyLabFxReduced
                ? 'Full Site FX only'
                : compact
                  ? 'Wild spawns · 2.5× traffic'
                  : 'Nonstop wild spawns · up to 20 · 2.5× traffic'}
          </span>
        </button>
      </div>
    </StationPanel>
  )
}

export function ConstellationPanel() {
  const [mounted, setMounted] = useState(false)
  const deviceProfile = useDeviceProfile()
  const { isNarrow, isTablet, fxLite } = deviceProfile
  const { showScreenFx, isReduced } = useVisualFxPreferences()
  const { skyLabFxTier } = resolveSkyLabFx(showScreenFx, isReduced, fxLite)
  const {
    constellationLabEnabled,
    mobileSkyLabMode,
    skyList,
    archive,
    maxVisible,
    manualMode,
    crazyMode,
    listMode,
    setMaxVisible,
    toggleListMode,
    toggleManualMode,
    toggleCrazyMode,
    runAuto,
    revive,
  } = useConstellations()
  const { maxSkyConstellations } = deviceProfile

  const hidePanelOnTouch = mobileSkyLabMode

  useEffect(() => {
    setMounted(true)
  }, [])

  const listItems =
    listMode === 'sky'
      ? [...skyList]
          .sort((a, b) => b.id - a.id)
          .map((item) => ({
          key: item.id,
          name: item.name ?? (item.complete ? `${item.stars.length}★` : 'Drawing…'),
          meta: item.complete
            ? `${item.starCount ?? item.stars.length} stars · ${item.source ?? 'manual'}`
            : 'In progress',
          record: null as ConstellationRecord | null,
        }))
      : [...archive]
          .reverse()
          .map((record) => ({
            key: `${record.id}-${record.completedAt}`,
            name: record.name,
            meta: `${record.starCount} stars · ${variantBadge(record)}`,
            record,
          }))

  const bodyProps = {
    listItems,
    listMode,
    skyList,
    archive,
    maxVisible,
    maxSkyConstellations,
    manualMode,
    crazyMode,
    toggleListMode,
    setMaxVisible,
    runAuto,
    toggleManualMode,
    toggleCrazyMode,
    revive,
    compact: isNarrow,
    mobileOnly: isNarrow,
    skyLabFxTier,
  }

  const panel =
    hidePanelOnTouch || isNarrow ? null : (
    <aside
      data-no-constellation
      data-sky-lab-panel
      data-crazy-sky-keep
      className={`sky-lab-nav-chart pointer-events-auto fixed z-[78] ${
        isTablet ? 'sky-lab-nav-chart-tablet' : ''
      }`}
    >
      <NavChartBody {...bodyProps} />
    </aside>
  )

  if (!mounted || !constellationLabEnabled || hidePanelOnTouch) return null

  const navLayoutKey = isNarrow ? 'narrow' : 'wide'

  return createPortal(
    <div key={navLayoutKey} data-crazy-sky-keep>
      {panel}
    </div>,
    document.body
  )
}
