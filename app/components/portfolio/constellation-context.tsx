'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import type { Constellation, ConstellationRecord } from './constellation-logic'
import {
  createIdGenerator,
  getMaxConstellations,
  handleConstellationClick,
  pushArchive,
  reviveFromArchive,
  runAutoBatch,
  runCrazySpawn,
  seedAmbientConstellations,
  type MaxVisibleOption,
} from './constellation-store'
import { createDefaultBoosts, type CompletedEntry, type MemeBoostState } from './constellation-logic'
import { trimConstellationsToLimit } from './constellation-generate'
import {
  canSpawnAmbientDecor,
  createCrazyOrbitDecors,
  createNebulaBurst,
  createOrbitDecor,
  rollManualPlanetSpawn,
  rollNebulaBurst,
  spawnAutoPlanets,
  type NebulaBurst,
  type OrbitDecor,
} from './orbit-decor-logic'
import { detectMobileSkyLabViewport, useDeviceProfile } from './device-profile'
import { useScrollIdle } from './use-scroll-idle'

type ConstellationContextValue = {
  constellationLabEnabled: boolean
  mobileSkyLabMode: boolean
  toggleConstellationLab: () => void
  constellations: Constellation[]
  archive: ConstellationRecord[]
  maxVisible: MaxVisibleOption
  manualMode: boolean
  crazyMode: boolean
  crazySkyFocus: boolean
  toggleCrazySkyFocus: () => void
  listMode: 'sky' | 'archive'
  skyList: Constellation[]
  orbitDecors: OrbitDecor[]
  selectedOrbitDecorId: string | null
  setSelectedOrbitDecorId: (id: string | null) => void
  updateOrbitDecor: (
    id: string,
    patch: Partial<Pick<OrbitDecor, 'x' | 'y' | 'width' | 'height' | 'stackLayer'>> & {
      orbiters?: OrbitDecor['orbiters']
      rings?: OrbitDecor['rings']
    }
  ) => void
  removeOrbitDecor: (id: string) => void
  nebulaBurst: NebulaBurst | null
  dismissNebulaBurst: (id: string) => void
  setMaxVisible: (value: MaxVisibleOption) => void
  toggleListMode: () => void
  toggleManualMode: () => void
  toggleCrazyMode: () => void
  runAuto: () => void
  revive: (record: ConstellationRecord) => void
}

const ConstellationContext = createContext<ConstellationContextValue | null>(null)

const MERGE_DURATION = 1.35

export function ConstellationProvider({ children }: { children: ReactNode }) {
  const deviceProfile = useDeviceProfile()
  const { fxLite } = deviceProfile
  const scrollIdle = useScrollIdle()
  const [constellationLabEnabled, setConstellationLabEnabled] = useState(false)
  const [mobileSkyLabMode, setMobileSkyLabMode] = useState(false)
  const [constellations, setConstellations] = useState<Constellation[]>([])
  const [archive, setArchive] = useState<ConstellationRecord[]>([])
  const [maxVisible, setMaxVisibleState] = useState<MaxVisibleOption>(4)
  const [manualMode, setManualMode] = useState(false)
  const [crazyMode, setCrazyMode] = useState(false)
  const [crazySkyFocus, setCrazySkyFocus] = useState(false)
  const [listMode, setListMode] = useState<'sky' | 'archive'>('sky')
  const [crazyDecors, setCrazyDecors] = useState<OrbitDecor[]>([])
  const [manualDecors, setManualDecors] = useState<OrbitDecor[]>([])
  const [nebulaBurst, setNebulaBurst] = useState<NebulaBurst | null>(null)
  const [selectedOrbitDecorId, setSelectedOrbitDecorId] = useState<string | null>(null)

  const idsRef = useRef(createIdGenerator())
  const historyRef = useRef<CompletedEntry[]>([])
  const boostsRef = useRef<MemeBoostState>(createDefaultBoosts())
  const planetLuckMeterRef = useRef(0)
  const mobileSkyLabModeRef = useRef(false)
  const constellationLabEnabledRef = useRef(false)
  const ambientSnapshotRef = useRef<{
    constellations: Constellation[]
    history: CompletedEntry[]
    boosts: MemeBoostState
  } | null>(null)

  const maxLimit = getMaxConstellations(crazyMode, maxVisible)
  const memeWindow = maxVisible

  const clearSky = useCallback(() => {
    setConstellations([])
    setCrazyDecors([])
    setManualDecors([])
    setNebulaBurst(null)
    setSelectedOrbitDecorId(null)
    historyRef.current = []
    boostsRef.current = createDefaultBoosts()
    planetLuckMeterRef.current = 0
  }, [])

  const appendArchive = useCallback((entries: ConstellationRecord[]) => {
    if (entries.length === 0) return
    setArchive((current) => {
      let next = current
      for (const entry of entries) {
        next = pushArchive(next, entry)
      }
      return next
    })
  }, [])

  const setMaxVisible = useCallback(
    (value: MaxVisibleOption) => {
      setMaxVisibleState(value)
      if (!crazyMode) {
        setConstellations((current) => trimConstellationsToLimit(current, value))
      }
    },
    [crazyMode]
  )

  const toggleListMode = useCallback(() => {
    setListMode((current) => (current === 'sky' ? 'archive' : 'sky'))
  }, [])

  const restoreAmbientSky = useCallback(() => {
    const snapshot = ambientSnapshotRef.current
    if (!snapshot) return

    setConstellations(structuredClone(snapshot.constellations))
    historyRef.current = [...snapshot.history]
    boostsRef.current = { ...snapshot.boosts }
    setCrazyDecors([])
    setManualDecors([])
    setNebulaBurst(null)
    setSelectedOrbitDecorId(null)
    planetLuckMeterRef.current = 0
  }, [])

  const toggleCrazySkyFocus = useCallback(() => {
    setCrazySkyFocus((current) => {
      const next = !current
      document.documentElement.dataset.crazySkyFocus = next ? 'on' : 'off'
      return next
    })
  }, [])

  const toggleConstellationLab = useCallback(() => {
    if (constellationLabEnabled) {
      restoreAmbientSky()
      setManualMode(false)
      setCrazyMode(false)
      setCrazySkyFocus(false)
      setMobileSkyLabMode(false)
      document.documentElement.dataset.crazySkyFocus = 'off'
      document.documentElement.dataset.mobileSkyLab = 'off'
      setConstellationLabEnabled(false)
      return
    }

    const useMobileCanvas = detectMobileSkyLabViewport()

    if (useMobileCanvas) {
      clearSky()
      setMaxVisibleState(6)
      setCrazyMode(false)
      setCrazySkyFocus(false)
      document.documentElement.dataset.crazySkyFocus = 'off'
      setManualMode(true)
      setMobileSkyLabMode(true)
      document.documentElement.dataset.mobileSkyLab = 'on'
      setConstellationLabEnabled(true)
      return
    }

    setMobileSkyLabMode(false)
    document.documentElement.dataset.mobileSkyLab = 'off'
    setManualMode(true)
    setConstellationLabEnabled(true)
  }, [clearSky, constellationLabEnabled, restoreAmbientSky])

  useEffect(() => {
    mobileSkyLabModeRef.current = mobileSkyLabMode
  }, [mobileSkyLabMode])

  useEffect(() => {
    constellationLabEnabledRef.current = constellationLabEnabled
  }, [constellationLabEnabled])

  useEffect(() => {
    const syncMobileSkyLabForViewport = () => {
      if (!constellationLabEnabledRef.current) return
      if (!mobileSkyLabModeRef.current) return

      if (!detectMobileSkyLabViewport()) {
        setMobileSkyLabMode(false)
        document.documentElement.dataset.mobileSkyLab = 'off'
      }
    }

    window.addEventListener('resize', syncMobileSkyLabForViewport)
    const coarseMedia = window.matchMedia('(pointer: coarse)')
    coarseMedia.addEventListener('change', syncMobileSkyLabForViewport)

    return () => {
      window.removeEventListener('resize', syncMobileSkyLabForViewport)
      coarseMedia.removeEventListener('change', syncMobileSkyLabForViewport)
    }
  }, [])

  useEffect(() => {
    const viewport = {
      width: window.innerWidth,
      height: window.innerHeight,
    }
    const result = seedAmbientConstellations(
      historyRef.current,
      boostsRef.current,
      idsRef.current,
      viewport
    )
    historyRef.current = result.history
    boostsRef.current = result.boosts
    ambientSnapshotRef.current = {
      constellations: structuredClone(result.constellations),
      history: [...result.history],
      boosts: { ...result.boosts },
    }
    setConstellations(result.constellations)
  }, [])

  const toggleManualMode = useCallback(() => {
    clearSky()
    setCrazyMode(false)
    setManualMode((current) => !current)
  }, [clearSky])

  const toggleCrazyMode = useCallback(() => {
    if (mobileSkyLabMode) return
    if (!crazyMode && fxLite) return

    clearSky()

    if (crazyMode) {
      setManualMode(true)
      setCrazySkyFocus(false)
      document.documentElement.dataset.crazySkyFocus = 'off'
      setCrazyMode(false)
      return
    }

    setManualMode(false)
    setCrazyDecors(
      createCrazyOrbitDecors({
        width: window.innerWidth,
        height: window.innerHeight,
      }).slice(0, fxLite ? 2 : 4)
    )
    setCrazyMode(true)
  }, [clearSky, crazyMode, fxLite, mobileSkyLabMode])

  const runAuto = useCallback(() => {
    setCrazyMode(false)
    setManualMode(false)

    const viewport = {
      width: window.innerWidth,
      height: window.innerHeight,
    }
    const limit = getMaxConstellations(false, maxVisible)

    historyRef.current = []
    boostsRef.current = createDefaultBoosts()
    planetLuckMeterRef.current = 0

    const result = runAutoBatch(
      [],
      historyRef.current,
      boostsRef.current,
      idsRef.current,
      limit,
      maxVisible,
      viewport
    )

    historyRef.current = result.history
    boostsRef.current = result.boosts
    appendArchive(result.archiveEntries)
    setConstellations(result.constellations)
    setManualDecors(spawnAutoPlanets(result.constellations, viewport))
  }, [appendArchive, maxVisible])

  const revive = useCallback(
    (record: ConstellationRecord) => {
      const viewport = {
        width: window.innerWidth,
        height: window.innerHeight,
      }
      setConstellations((current) =>
        reviveFromArchive(current, record, idsRef.current, maxLimit, viewport)
      )
    },
    [maxLimit]
  )

  const handlePointerDown = useCallback(
    (event: PointerEvent) => {
      if (!constellationLabEnabled) return
      if (crazyMode) return
      if (event.button !== 0) return
      if (!(event.target instanceof Element)) return

      const path = event.composedPath()
      const hitsOrbitDecor = path.some(
        (node) => node instanceof Element && node.closest('[data-orbit-decor]')
      )
      if (hitsOrbitDecor) return

      if (
        event.target.closest(
          'a, button, input, textarea, select, label, [role="button"], [contenteditable="true"], [data-no-constellation], [data-orbit-decor]'
        )
      ) {
        return
      }

      setConstellations((current) => {
        const result = handleConstellationClick(
          current,
          event.clientX,
          event.clientY,
          historyRef.current,
          boostsRef.current,
          idsRef.current,
          maxLimit,
          memeWindow,
          manualMode,
          crazyMode
        )

        if (!result) return current

        historyRef.current = result.history
        boostsRef.current = result.boosts
        if (result.archive) {
          appendArchive(result.archive)
        }

        if (manualMode && !crazyMode && !mobileSkyLabMode) {
          if (result.spawnedConstellation) {
            planetLuckMeterRef.current += 1
          }

          const allowAmbient = canSpawnAmbientDecor(
            result.constellations,
            result.spawnedConstellation
          )

          if (allowAmbient) {
            if (rollManualPlanetSpawn(planetLuckMeterRef.current)) {
              const viewport = {
                width: window.innerWidth,
                height: window.innerHeight,
              }
              const planet = createOrbitDecor(
                event.clientX,
                event.clientY,
                viewport,
                { idPrefix: 'manual-planet' }
              )
              setManualDecors((decors) => [...decors, planet])
              planetLuckMeterRef.current = 0
            }

            if (rollNebulaBurst()) {
              setNebulaBurst(createNebulaBurst())
            }
          }
        }

        return result.constellations
      })
    },
    [
      appendArchive,
      constellationLabEnabled,
      crazyMode,
      manualMode,
      mobileSkyLabMode,
      maxLimit,
      memeWindow,
    ]
  )

  useEffect(() => {
    window.addEventListener('pointerdown', handlePointerDown)
    return () => {
      window.removeEventListener('pointerdown', handlePointerDown)
    }
  }, [handlePointerDown])

  useEffect(() => {
    if (!constellationLabEnabled || !crazyMode || !scrollIdle) return

    const tick = () => {
      const viewport = {
        width: window.innerWidth,
        height: window.innerHeight,
      }

      setConstellations((current) => {
        const result = runCrazySpawn(current, idsRef.current, viewport)
        if (!result) return current
        appendArchive([result.archiveEntry])
        return result.constellations
      })
    }

    tick()
    const interval = window.setInterval(tick, fxLite ? 1500 : 850)
    return () => window.clearInterval(interval)
  }, [appendArchive, constellationLabEnabled, crazyMode, fxLite, scrollIdle])

  useEffect(() => {
    const merging = constellations.some(
      (constellation) => constellation.merging || constellation.mergeFlash
    )
    if (!merging) return

    const timer = window.setTimeout(() => {
      setConstellations((current) =>
        current
          .filter((constellation) => !constellation.hidden)
          .map((constellation) => ({
            ...constellation,
            merging: false,
            mergeFlash: false,
          }))
      )
    }, MERGE_DURATION * 1000 + 400)

    return () => window.clearTimeout(timer)
  }, [constellations])

  const updateOrbitDecor = useCallback(
    (
      id: string,
      patch: Partial<Pick<OrbitDecor, 'x' | 'y' | 'width' | 'height' | 'stackLayer'>> & {
        orbiters?: OrbitDecor['orbiters']
        rings?: OrbitDecor['rings']
      }
    ) => {
      const apply = (items: OrbitDecor[]) =>
        items.map((item) => (item.id === id ? { ...item, ...patch } : item))

      setCrazyDecors((current) => apply(current))
      setManualDecors((current) => apply(current))
    },
    []
  )

  const removeOrbitDecor = useCallback((id: string) => {
    const remove = (items: OrbitDecor[]) => items.filter((item) => item.id !== id)
    setCrazyDecors((current) => remove(current))
    setManualDecors((current) => remove(current))
    setSelectedOrbitDecorId((current) => (current === id ? null : current))
  }, [])

  const dismissNebulaBurst = useCallback((id: string) => {
    setNebulaBurst((current) => (current?.id === id ? null : current))
  }, [])

  const skyList = useMemo(
    () => constellations.filter((item) => !item.hidden),
    [constellations]
  )

  const orbitDecors = useMemo(
    () => [...crazyDecors, ...manualDecors],
    [crazyDecors, manualDecors]
  )

  const value = useMemo(
    () => ({
      constellationLabEnabled,
      mobileSkyLabMode,
      toggleConstellationLab,
      constellations,
      archive,
      maxVisible,
      manualMode,
      crazyMode,
      crazySkyFocus,
      listMode,
      skyList,
      orbitDecors,
      selectedOrbitDecorId,
      setSelectedOrbitDecorId,
      updateOrbitDecor,
      removeOrbitDecor,
      nebulaBurst,
      dismissNebulaBurst,
      setMaxVisible,
      toggleListMode,
      toggleManualMode,
      toggleCrazyMode,
      toggleCrazySkyFocus,
      runAuto,
      revive,
    }),
    [
      archive,
      constellationLabEnabled,
      constellations,
      crazyMode,
      crazySkyFocus,
      listMode,
      manualMode,
      mobileSkyLabMode,
      maxVisible,
      nebulaBurst,
      orbitDecors,
      selectedOrbitDecorId,
      setSelectedOrbitDecorId,
      updateOrbitDecor,
      removeOrbitDecor,
      dismissNebulaBurst,
      revive,
      runAuto,
      setMaxVisible,
      skyList,
      toggleConstellationLab,
      toggleCrazyMode,
      toggleCrazySkyFocus,
      toggleListMode,
      toggleManualMode,
    ]
  )

  return (
    <ConstellationContext.Provider value={value}>{children}</ConstellationContext.Provider>
  )
}

export function useConstellations() {
  const context = useContext(ConstellationContext)
  if (!context) {
    throw new Error('useConstellations must be used within ConstellationProvider')
  }
  return context
}

export { MERGE_DURATION }
