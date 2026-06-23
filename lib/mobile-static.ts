/** UA / client-hint detection for zero-FX mobile static mode. */
export function isMobileStaticUserAgent(userAgent: string): boolean {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile|Silk/i.test(
    userAgent
  )
}

export function isMobileStaticRequestHeaders(
  userAgent: string | null,
  mobileClientHint: string | null
): boolean {
  if (mobileClientHint === '?1') return true
  if (!userAgent) return false
  return isMobileStaticUserAgent(userAgent)
}
