'use client'

import Image from 'next/image'
import Link from 'next/link'
import { FormEvent, useState, type ReactNode } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import { JsonLd } from './json-ld'
import { buildFaqSchema } from '../../../lib/structured-data'
import { MobileStaticNav } from './mobile-static-nav'
import { projects } from './projects-data'
import { SiteFooter } from './site-footer'
import { githubShowcase, webProjects } from './web-projects-data'

const CONTACT_EMAIL = 'yane.zhekov@proton.me'

const STACK_CHIPS = [
  'WordPress',
  'CSS',
  'HTML',
  'JavaScript',
  'Java',
  'C++',
  'C#',
  'Lua',
  'UE5',
  'GitHub',
  'Cursor',
] as const

const HUB_HREFS = ['/about', '/services', '/case-studies'] as const

function Section({
  id,
  children,
  className,
}: {
  id?: string
  children: ReactNode
  className?: string
}) {
  return (
    <section id={id} className={`mobile-static-section ${className ?? ''}`}>
      <div className="mobile-static-section-inner">{children}</div>
    </section>
  )
}

function SectionHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string
  title: string
  description?: string
}) {
  return (
    <header className="mobile-static-heading">
      <p className="mobile-static-eyebrow">{eyebrow}</p>
      <h2 className="mobile-static-title">{title}</h2>
      {description ? <p className="mobile-static-lead">{description}</p> : null}
    </header>
  )
}

function Card({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={`mobile-static-card ${className ?? ''}`}>{children}</div>
}

function MobileLeadCapture() {
  const t = useTranslations('LeadCapture')
  const [newsletterEmail, setNewsletterEmail] = useState('')
  const [demoEmail, setDemoEmail] = useState('')
  const [demoNote, setDemoNote] = useState('')

  const onNewsletterSubmit = (event: FormEvent) => {
    event.preventDefault()
    const body = encodeURIComponent(t('newsletterBody', { email: newsletterEmail }))
    window.location.href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(t('newsletterSubject'))}&body=${body}`
  }

  const onDemoSubmit = (event: FormEvent) => {
    event.preventDefault()
    const body = encodeURIComponent(
      t('demoBody', { email: demoEmail, note: demoNote || t('demoNotePlaceholder') })
    )
    window.location.href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(t('demoSubject'))}&body=${body}`
  }

  return (
    <div className="mt-10 grid gap-4">
      <Card>
        <h3 className="font-heading text-lg font-bold">{t('newsletterTitle')}</h3>
        <p className="mt-2 text-sm text-muted-foreground">{t('newsletterDescription')}</p>
        <form className="mt-4 space-y-3" onSubmit={onNewsletterSubmit}>
          <input
            type="email"
            required
            value={newsletterEmail}
            onChange={(event) => setNewsletterEmail(event.target.value)}
            placeholder={t('emailPlaceholder')}
            className="mobile-static-input"
          />
          <button type="submit" className="mobile-static-btn mobile-static-btn-primary w-full">
            {t('newsletterCta')}
          </button>
        </form>
      </Card>
      <Card>
        <h3 className="font-heading text-lg font-bold">{t('demoTitle')}</h3>
        <p className="mt-2 text-sm text-muted-foreground">{t('demoDescription')}</p>
        <form className="mt-4 space-y-3" onSubmit={onDemoSubmit}>
          <input
            type="email"
            required
            value={demoEmail}
            onChange={(event) => setDemoEmail(event.target.value)}
            placeholder={t('emailPlaceholder')}
            className="mobile-static-input"
          />
          <textarea
            value={demoNote}
            onChange={(event) => setDemoNote(event.target.value)}
            placeholder={t('demoNotePlaceholder')}
            rows={3}
            className="mobile-static-input"
          />
          <button type="submit" className="mobile-static-btn mobile-static-btn-secondary w-full">
            {t('demoCta')}
          </button>
        </form>
      </Card>
    </div>
  )
}

export function MobileStaticPortfolio() {
  const tHero = useTranslations('Hero')
  const tHub = useTranslations('HomeHub')
  const tProjects = useTranslations('Projects')
  const tSocial = useTranslations('SocialProof')
  const tTestimonials = useTranslations('Testimonials')
  const tFaq = useTranslations('Faq')
  const tContact = useTranslations('Contact')
  const locale = useLocale()
  const hubCards = tHub.raw('cards') as Array<{ title: string; body: string; cta: string }>
  const faqItems = tFaq.raw('items') as Array<{ question: string; answer: string }>

  return (
    <div className="mobile-static-page">
      <MobileStaticNav />

      <main>
        <Section id="top" className="mobile-static-hero-section">
          <p className="mobile-static-eyebrow">{tHero('badge')}</p>
          <h1 className="mobile-static-hero-title">{tHero('headline')}</h1>
          <p className="mt-3 font-heading text-lg font-semibold">
            {tHero('name')}
            <span className="text-muted-foreground"> · {tHero('role')}</span>
          </p>
          <p className="mobile-static-lead mt-4">{tHero('positioning')}</p>
          <div className="mt-6 flex flex-wrap gap-2">
            <span className="mobile-static-chip">UE5</span>
            <span className="mobile-static-chip">C++</span>
            <span className="mobile-static-chip">{tHero('stackAi')}</span>
          </div>
          <div className="mt-8 flex flex-col gap-3">
            <a href="#engine" className="mobile-static-btn mobile-static-btn-primary">
              {tHero('ctaWork')}
            </a>
            <a href="#contact" className="mobile-static-btn mobile-static-btn-secondary">
              {tHero('ctaContact')}
            </a>
          </div>
        </Section>

        <Section id="explore">
          <SectionHeading
            eyebrow={tHub('eyebrow')}
            title={tHub('title')}
            description={tHub('description')}
          />
          <div className="mt-8 grid gap-4">
            {hubCards.map((card, index) => (
              <Link
                key={card.title}
                href={`/${locale}${HUB_HREFS[index] ?? '/about'}`}
                className="mobile-static-card mobile-static-card-link"
              >
                <p className="mobile-static-eyebrow">{tHub(`cardLabels.${index}`)}</p>
                <h3 className="mt-2 font-heading text-lg font-bold">{card.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{card.body}</p>
                <span className="mt-4 inline-block text-sm font-semibold text-cyan">{card.cta}</span>
              </Link>
            ))}
          </div>
        </Section>

        <Section id="engine">
          <SectionHeading
            eyebrow={tProjects('eyebrow')}
            title={tProjects('title')}
            description={tProjects('description')}
          />
          <div className="mt-8 grid gap-6">
            {projects.map((project, index) => (
              <Card key={project.id}>
                <div className="relative aspect-[16/10] overflow-hidden rounded-lg bg-black/40">
                  <Image
                    src={project.image}
                    alt={project.title}
                    fill
                    loading={index === 0 ? 'eager' : 'lazy'}
                    sizes="100vw"
                    className="object-cover"
                  />
                </div>
                <p className="mt-4 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                  {project.subtitle}
                </p>
                <h3 className="mt-1 font-heading text-xl font-bold">{project.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{project.summary}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {project.tech.slice(0, 3).map((tag) => (
                    <span key={tag} className="mobile-static-chip">
                      {tag}
                    </span>
                  ))}
                </div>
              </Card>
            ))}
          </div>
        </Section>

        <Section id="proof">
          <SectionHeading
            eyebrow={tSocial('eyebrow')}
            title={tSocial('title')}
            description={tSocial('description')}
          />
          <Card className="mt-8 text-center">
            <h3 className="font-heading text-lg font-bold">{tSocial('emptyPartnersTitle')}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{tSocial('emptyPartnersBody')}</p>
            <a href="#contact" className="mobile-static-btn mobile-static-btn-primary mt-4 inline-flex">
              {tSocial('emptyPartnersCta')}
            </a>
          </Card>
          <p className="mt-6 text-xs text-muted-foreground">
            {tSocial('caseStudyNote')}{' '}
            <Link href={`/${locale}/case-studies`} className="text-cyan">
              {tSocial('caseStudyLink')}
            </Link>
            .
          </p>
        </Section>

        <Section>
          <SectionHeading
            eyebrow={tTestimonials('eyebrow')}
            title={tTestimonials('title')}
            description={tTestimonials('description')}
          />
          <Card className="mt-8 text-center">
            <p className="text-sm text-muted-foreground">{tTestimonials('emptyBody')}</p>
          </Card>
        </Section>

        <Section id="arsenal">
          <SectionHeading
            eyebrow="04 — Arsenal Bay"
            title="The Arsenal"
            description="Art, audio, props, and spotlight reels — full interactive labs on desktop."
          />
          <p className="mt-6 text-sm leading-relaxed text-muted-foreground">
            UE5 props, stylized art pipelines, audio-reactive systems, and character spotlight work live
            in the desktop experience to keep mobile scroll fast.
          </p>
        </Section>

        <Section id="stack">
          <SectionHeading
            eyebrow="05 — Web Stack Bay"
            title="The Full Stack Flex"
            description="Fast, polished web experiences — WordPress builds to custom frontends."
          />
          <div className="mt-8 grid gap-4">
            {webProjects.map((project) => (
              <a
                key={project.id}
                href={project.href}
                target="_blank"
                rel="noopener noreferrer"
                className="mobile-static-card mobile-static-card-link"
              >
                <h3 className="font-heading text-lg font-bold">{project.title}</h3>
                <p className="mt-1 font-mono text-xs text-muted-foreground">{project.domain}</p>
                <p className="mt-2 text-sm text-muted-foreground">{project.description}</p>
              </a>
            ))}
            <a
              href={githubShowcase.href}
              target="_blank"
              rel="noopener noreferrer"
              className="mobile-static-card mobile-static-card-link"
            >
              <h3 className="font-heading text-lg font-bold">{githubShowcase.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{githubShowcase.description}</p>
            </a>
          </div>
          <div className="mt-8 flex flex-wrap gap-2">
            {STACK_CHIPS.map((item) => (
              <span key={item} className="mobile-static-chip">
                {item}
              </span>
            ))}
          </div>
        </Section>

        <Section id="faq">
          <JsonLd data={buildFaqSchema(faqItems)} />
          <SectionHeading eyebrow={tFaq('eyebrow')} title={tFaq('title')} description={tFaq('description')} />
          <div className="mt-8 space-y-3">
            {faqItems.map((item) => (
              <Card key={item.question}>
                <details className="mobile-static-details">
                  <summary className="cursor-pointer font-heading font-bold">{item.question}</summary>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{item.answer}</p>
                </details>
              </Card>
            ))}
          </div>
        </Section>

        <Section id="contact" className="pb-16">
          <SectionHeading
            eyebrow={tContact('eyebrow')}
            title={`${tContact('title')} ${tContact('titleAccent')}.`}
            description={tContact('body')}
          />
          <a
            href="mailto:yane.zhekov@proton.me"
            className="mobile-static-btn mobile-static-btn-primary mt-8 inline-flex"
          >
            Start a conversation
          </a>
          <div className="mt-10 grid gap-3">
            <a href="mailto:yane.zhekov@proton.me" className="mobile-static-card mobile-static-card-link">
              <span className="mobile-static-eyebrow">Email</span>
              <span className="mt-1 block font-semibold">yane.zhekov@proton.me</span>
            </a>
            <a
              href="https://github.com/yanezhekov"
              target="_blank"
              rel="noopener noreferrer"
              className="mobile-static-card mobile-static-card-link"
            >
              <span className="mobile-static-eyebrow">GitHub</span>
              <span className="mt-1 block font-semibold">@yanezhekov</span>
            </a>
          </div>
          <MobileLeadCapture />
        </Section>

        <SiteFooter />
      </main>
    </div>
  )
}
