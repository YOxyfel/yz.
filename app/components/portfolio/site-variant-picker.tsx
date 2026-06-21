'use client'

import { useSiteVariant, SITE_VARIANTS, type SiteVariant } from './site-variant-context'

export const variantLabel: Record<SiteVariant, string> = {
  minimal: 'Minimal',
  station: 'Station',
  futuristic: 'Futuristic',
}

type SiteVariantPickerProps = {
  className?: string
  buttonClassName?: string
}

export function SiteVariantPicker({ className, buttonClassName }: SiteVariantPickerProps) {
  const { variant, setVariant } = useSiteVariant()

  return (
    <div className={className ?? 'flex flex-wrap gap-1'}>
      {SITE_VARIANTS.map((item) => (
        <button
          key={item}
          type="button"
          data-no-constellation
          className={
            buttonClassName ??
            `site-variant-picker-btn ${variant === item ? 'site-variant-picker-btn-active' : ''}`
          }
          aria-pressed={variant === item}
          onClick={() => {
            const currentIndex = SITE_VARIANTS.indexOf(variant)
            const nextIndex = SITE_VARIANTS.indexOf(item)
            if (nextIndex === currentIndex) return
            setVariant(item, nextIndex > currentIndex ? 1 : -1)
          }}
        >
          {variantLabel[item]}
        </button>
      ))}
    </div>
  )
}
