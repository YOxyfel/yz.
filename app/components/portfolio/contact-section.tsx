import { ArrowUpRight, Mail } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Reveal } from './reveal'
import { LeadCapturePanel } from './lead-capture-panel'
import {
  StationButton,
  StationChip,
  StationLed,
  StationPanel,
  StationSection,
} from './station-console'

function GitHubIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M12 .5C5.37.5 0 5.78 0 12.29c0 5.21 3.44 9.63 8.2 11.19.6.11.82-.25.82-.56 0-.28-.01-1.02-.02-2-3.34.71-4.04-1.58-4.04-1.58-.55-1.36-1.33-1.73-1.33-1.73-1.09-.73.08-.72.08-.72 1.2.08 1.84 1.21 1.84 1.21 1.07 1.8 2.81 1.28 3.5.98.11-.76.42-1.28.76-1.58-2.67-.3-5.47-1.31-5.47-5.81 0-1.28.47-2.33 1.23-3.15-.12-.3-.53-1.51.12-3.15 0 0 1-.32 3.3 1.2.96-.26 1.98-.39 3-.4 1.02.01 2.04.14 3 .4 2.28-1.52 3.29-1.2 3.29-1.2.65 1.64.24 2.85.12 3.15.77.82 1.23 1.87 1.23 3.15 0 4.51-2.81 5.5-5.49 5.79.43.36.81 1.09.81 2.2 0 1.59-.01 2.87-.01 3.26 0 .31.21.68.83.56C20.56 21.92 24 17.5 24 12.29 24 5.78 18.63.5 12 .5z" />
    </svg>
  )
}

function LinkedInIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.13 1.45-2.13 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.45v6.29zM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13zM7.12 20.45H3.55V9h3.57v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0z" />
    </svg>
  )
}

function YouTubeIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M23.5 6.2a3.02 3.02 0 0 0-2.12-2.14C19.5 3.55 12 3.55 12 3.55s-7.5 0-9.38.51A3.02 3.02 0 0 0 .5 6.2C0 8.07 0 12 0 12s0 3.93.5 5.8a3.02 3.02 0 0 0 2.12 2.14c1.88.51 9.38.51 9.38.51s7.5 0 9.38-.51a3.02 3.02 0 0 0 2.12-2.14C24 15.93 24 12 24 12s0-3.93-.5-5.8zM9.55 15.57V8.43L15.82 12l-6.27 3.57z" />
    </svg>
  )
}

const links = [
  {
    label: 'Email',
    value: 'zhekov.yane123@gmail.com',
    href: 'mailto:zhekov.yane123@gmail.com',
    icon: Mail,
  },
  {
    label: 'GitHub',
    value: '@YOxyfel',
    href: 'https://github.com/YOxyfel/YOxyfel',
    icon: GitHubIcon,
  },
  {
    label: 'LinkedIn',
    value: 'in/yane-zhekov',
    href: 'https://www.linkedin.com/in/yane-zhekov-993703277/',
    icon: LinkedInIcon,
  },
  {
    label: 'Showreel',
    valueKey: 'showreelSoon' as const,
    icon: YouTubeIcon,
    comingSoon: true,
  },
] as const

export function ContactSection() {
  const t = useTranslations('Contact')

  return (
    <StationSection id="contact" tone="comms" className="!pb-24">
      <div
        aria-hidden
        className="bg-fx-soft-blob bg-fx-soft-blob-cyan pointer-events-none absolute left-1/2 top-0 -z-10 h-64 w-[36rem] -translate-x-1/2 max-md:hidden"
      />

      <div className="relative mx-auto max-w-4xl text-center">
        <StationPanel variant="module" backLabel="COMMS-CORE" className="mx-auto max-w-3xl">
          <p className="station-readout-label flex items-center justify-center gap-2">
            <StationLed active pulse tone="violet" />
            <span>
              <span className="station-bracket">[</span>
              {t('eyebrow')}
              <span className="station-bracket">]</span>
            </span>
          </p>
          <h2 className="font-heading mt-4 text-balance text-4xl font-bold tracking-tight sm:text-6xl">
            {t('title')}{' '}
            <span className="text-glow-violet text-violet">{t('titleAccent')}</span>.
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-pretty leading-relaxed text-muted-foreground">
            {t('body')}
          </p>
        </StationPanel>

        <Reveal delay={0.15}>
          <StationButton
            href="mailto:zhekov.yane123@gmail.com"
            variant="primary"
            className="mt-10"
          >
            Start a conversation
            <ArrowUpRight className="h-4 w-4" />
          </StationButton>
        </Reveal>

        <div className="contact-card-grid mt-16">
          {links.map((link, index) => {
            const Icon = link.icon
            const value = 'valueKey' in link ? t(link.valueKey) : link.value
            const isShowreelSoon = 'comingSoon' in link && link.comingSoon
            const card = (
              <StationPanel
                variant="module"
                interactive={!isShowreelSoon}
                fill
                flip={isShowreelSoon}
                flipOnView={isShowreelSoon}
                flipDelay={isShowreelSoon ? 0.2 : 0}
                backLabel={`LNK-${String(index + 1).padStart(2, '0')}`}
                className={`contact-card-panel h-full ${isShowreelSoon ? 'opacity-75' : ''}`}
              >
                <div className="contact-card-body">
                  <span className="contact-card-icon" aria-hidden>
                    <Icon className="h-5 w-5" />
                  </span>
                  <StationChip>{link.label}</StationChip>
                  <span className="contact-card-value">{value}</span>
                </div>
              </StationPanel>
            )

            if ('comingSoon' in link && link.comingSoon) {
              return (
                <div key={link.label} className="contact-card-link cursor-default">
                  {card}
                </div>
              )
            }

            if (!('href' in link)) return null

            return (
              <a
                key={link.label}
                href={link.href}
                target={link.href.startsWith('http') ? '_blank' : undefined}
                rel={link.href.startsWith('http') ? 'noreferrer' : undefined}
                className="contact-card-link group"
              >
                {card}
              </a>
            )
          })}
        </div>

        <LeadCapturePanel className="mt-16 text-left" />

      </div>
    </StationSection>
  )
}
