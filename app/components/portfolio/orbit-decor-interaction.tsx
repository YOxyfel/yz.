'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  type ReactNode,
} from 'react'
import { useConstellations } from './constellation-context'
import { scaleDecorDimensions } from './orbit-decor-bounds'
import type { OrbitDecor } from './orbit-decor-logic'

type DragState = {
  id: string
  pointerId: number
  startX: number
  startY: number
  originX: number
  originY: number
  mode: 'move' | 'resize'
  originWidth: number
  originHeight: number
  startDistance: number
  originDecor?: OrbitDecor
}

type OrbitDecorInteractionValue = {
  beginDrag: (state: DragState) => void
}

const OrbitDecorInteractionContext = createContext<OrbitDecorInteractionValue | null>(null)

export function OrbitDecorInteractionProvider({
  children,
  decors,
}: {
  children: ReactNode
  decors: OrbitDecor[]
}) {
  const dragRef = useRef<DragState | null>(null)
  const { selectedOrbitDecorId, setSelectedOrbitDecorId, updateOrbitDecor } = useConstellations()

  const beginDrag = useCallback((state: DragState) => {
    dragRef.current = state
  }, [])

  useEffect(() => {
    const onPointerMove = (event: PointerEvent) => {
      const drag = dragRef.current
      if (!drag || event.pointerId !== drag.pointerId) return

      const viewport = {
        width: window.innerWidth,
        height: window.innerHeight,
      }

      if (drag.mode === 'move') {
        updateOrbitDecor(drag.id, {
          x: drag.originX + (event.clientX - drag.startX),
          y: drag.originY + (event.clientY - drag.startY),
        })
        return
      }

      const dx = event.clientX - drag.startX
      const dy = event.clientY - drag.startY
      const delta = (dx + dy) * 0.5
      const factor = Math.max(0.2, (drag.startDistance + delta) / drag.startDistance)
      const source = drag.originDecor
      if (!source) return

      updateOrbitDecor(drag.id, scaleDecorDimensions(source, factor, viewport))
    }

    const onPointerUp = (event: PointerEvent) => {
      if (dragRef.current?.pointerId === event.pointerId) {
        dragRef.current = null
      }
    }

    window.addEventListener('pointermove', onPointerMove, { passive: true })
    window.addEventListener('pointerup', onPointerUp)
    window.addEventListener('pointercancel', onPointerUp)

    return () => {
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('pointerup', onPointerUp)
      window.removeEventListener('pointercancel', onPointerUp)
    }
  }, [updateOrbitDecor])

  useEffect(() => {
    const onWheel = (event: WheelEvent) => {
      if (!selectedOrbitDecorId || !event.ctrlKey) return
      const decor = decors.find((item) => item.id === selectedOrbitDecorId)
      if (!decor) return

      event.preventDefault()
      const factor = event.deltaY < 0 ? 1.06 : 0.94
      const viewport = {
        width: window.innerWidth,
        height: window.innerHeight,
      }
      updateOrbitDecor(selectedOrbitDecorId, scaleDecorDimensions(decor, factor, viewport))
    }

    window.addEventListener('wheel', onWheel, { passive: false })
    return () => window.removeEventListener('wheel', onWheel)
  }, [decors, selectedOrbitDecorId, updateOrbitDecor])

  useEffect(() => {
    const onPointerDown = (event: PointerEvent) => {
      if (!(event.target instanceof Element)) return
      if (event.target.closest('[data-orbit-decor], [data-orbit-control], [data-crazy-sky-keep]')) return
      setSelectedOrbitDecorId(null)
    }

    window.addEventListener('pointerdown', onPointerDown)
    return () => window.removeEventListener('pointerdown', onPointerDown)
  }, [setSelectedOrbitDecorId])

  return (
    <OrbitDecorInteractionContext.Provider value={{ beginDrag }}>
      {children}
    </OrbitDecorInteractionContext.Provider>
  )
}

export function useOrbitDecorInteraction() {
  const ctx = useContext(OrbitDecorInteractionContext)
  return ctx ?? { beginDrag: () => {} }
}

export function scaleSelectedDecor(
  decor: OrbitDecor,
  factor: number,
  updateOrbitDecor: (id: string, patch: Partial<OrbitDecor>) => void
) {
  const viewport = {
    width: window.innerWidth,
    height: window.innerHeight,
  }
  updateOrbitDecor(decor.id, scaleDecorDimensions(decor, factor, viewport))
}
