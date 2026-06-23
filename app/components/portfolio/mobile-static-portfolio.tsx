'use client'

import Link from 'next/link'
import { useLocale, useTranslations } from 'next-intl'
import type { ReactNode } from 'react'
import { MobileStaticNav } from './mobile-static-nav'
import { projects } from './projects-data'
import { webProjects, githubShowcase } from './web-projects-data'

const HUB_HREFS = ['/about', '/services', '/case-studies'] as const

function Section({ id, children }: { id?: string; children: ReactNode }) {
  return (
    <section id={id} className="mobile-static-section">
      <div className="mobile-static-section-inner">{children}</div>
    </section>
  )
}

function Heading({ eyebrow, title, description }: { eyebrow: string; title: string; description?: string }) {
  return (
    <header className="mobile-static-heading">
      <p className="mobile-static-eyebrow">{eyebrow}</p>
      <h2 className="mobile-static-title">{title}</h2>
      {description ? <p className="mobile-static-lead">{description}</p> : null}
    </header>
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
  const tFooter = useTranslations('Footer')
  const tNav = useTranslations('Nav')
  const locale = useLocale()
  const hubCards = tHub.raw('cards') as Array<{ title: string; body: string; cta: string }>
  const faqItems = tFaq.raw('items') as Array<{ question: string; answer: string }>

  return (
    <div className="mobile-static-page">
      <MobileStaticNav />

      <main>
        <Section id="top">
          <p className="mobile-static-eyebrow">{tHero('badge')}</p>
          <h1 className="mobile-static-hero-title">{tHero('headline')}</h1>
          <p className="mt-3 font-heading text-lg font-semibold">
            {tHero('name')} <span className="text-muted-foreground">· {tHero('role')}</span>
          </p>
          <p className="mobile-static-lead mt-4">{tHero('positioning')}</p>
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
          <Heading eyebrow={tHub('eyebrow')} title={tHub('title')} description={tHub('description')} />
          <div className="mt-8 grid gap-4">
            {hubCards.map((card, index) => (
              <Link
                key={card.title}
                href={`/${locale}${HUB_HREFS[index] ?? '/about'}`}
                className="mobile-static-card mobile-static-card-link"
              >
                <h3 className="font-heading text-lg font-bold">{card.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{card.body}</p>
              </Link>
            ))}
          </div>
        </Section>

        <Section id="engine">
          <Heading
            eyebrow={tProjects('eyebrow')}
            title={tProjects('title')}
            description={tProjects('description')}
          />
          <div className="mt-8 grid gap-6">
            {projects.map((project) => (
              <article key={project.id} className="mobile-static-card">
                <img
                  src={project.image}
                  alt={project.title}
                  width={800}
                  height={500}
                  loading="lazy"
                  decoding="async"
                  className="w-full rounded-lg"
                />
                <h3 className="mt-4 font-heading text-xl font-bold">{project.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{project.summary}</p>
              </article>
            ))}
          </div>
        </Section>

        <Section id="proof">
          <Heading
            eyebrow={tSocial('eyebrow')}
            title={tSocial('title')}
            description={tSocial('description')}
          />
          <p className="mt-6 text-sm text-muted-foreground">{tSocial('emptyPartnersBody')}</p>
        </Section>

        <Section>
          <Heading
            eyebrow={tTestimonials('eyebrow')}
            title={tTestimonials('title')}
            description={tTestimonials('description')}
          />
          <p className="mt-6 text-sm text-muted-foreground">{tTestimonials('emptyBody')}</p>
        </Section>

        <Section id="arsenal">
          <Heading
            eyebrow="04 — Arsenal"
            title="The Arsenal"
            description="Full interactive labs are desktop-only."
          />
        </Section>

        <Section id="stack">
          <Heading eyebrow="05 — Web Stack" title="The Full Stack Flex" />
          <ul className="mt-8 space-y-3">
            {webProjects.map((project) => (
              <li key={project.id}>
                <a href={project.href} className="mobile-static-card-link text-cyan" target="_blank" rel="noreferrer">
                  {project.title} — {project.domain}
                </a>
              </li>
            ))}
            <li>
              <a
                href={githubShowcase.href}
                className="mobile-static-card-link text-cyan"
                target="_blank"
                rel="noreferrer"
              >
                {githubShowcase.title}
              </a>
            </li>
          </ul>
        </Section>

        <Section id="faq">
          <Heading eyebrow={tFaq('eyebrow')} title={tFaq('title')} description={tFaq('description')} />
          <div className="mt-8 space-y-3">
            {faqItems.map((item) => (
              <details key={item.question} className="mobile-static-card mobile-static-details">
                <summary className="font-heading font-bold">{item.question}</summary>
                <p className="mt-3 text-sm text-muted-foreground">{item.answer}</p>
              </details>
            ))}
          </div>
        </Section>

        <Section id="contact">
          <Heading
            eyebrow={tContact('eyebrow')}
            title={`${tContact('title')} ${tContact('titleAccent')}.`}
            description={tContact('body')}
          />
          <a href="mailto:yane.zhekov@proton.me" className="mobile-static-btn mobile-static-btn-primary mt-8 inline-flex">
            Email me
          </a>
        </Section>

        <footer className="mobile-static-footer">
          <p className="text-sm text-muted-foreground">{tFooter('tagline')}</p>
          <p className="mt-4 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            © {new Date().getFullYear()} Yane Zhekov
          </p>
          <nav className="mt-4 flex flex-wrap gap-3 text-sm">
            <Link href={`/${locale}/about`}>{tNav('about')}</Link>
            <Link href={`/${locale}/services`}>{tNav('services')}</Link>
            <Link href="#contact">{tNav('contact')}</Link>
          </nav>
        </footer>
      </main>
    </div>
  )
}
