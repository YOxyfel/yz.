'use client'

import { motion } from 'framer-motion'
import type { ReactNode } from 'react'
import { useDeviceProfile } from './device-profile'
import { fadeUp } from './motion'

type RevealProps = {
  children: ReactNode
  className?: string
  delay?: number
}

export function Reveal({ children, className, delay = 0 }: RevealProps) {
  const { mobilePerfCut } = useDeviceProfile()

  if (mobilePerfCut) {
    return <div className={className}>{children}</div>
  }

  return (
    <motion.div
      className={className}
      variants={fadeUp}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: '-80px' }}
      transition={{ delay }}
    >
      {children}
    </motion.div>
  )
}
