import { getTranslations } from 'next-intl/server'
import type { AppLocale } from '../../../i18n/routing'
import { projects } from './projects-data'
import { webProjects, githubShowcase } from './web-projects-data'
import { MobileStaticNav } from './mobile-static-nav.server'

const HUB_HREFS = ['/about', '/services', '/case-studies'] as const

type MobileStaticHomeProps = {
  locale: AppLocale
}

function Section({ id, children }: { id?: string; children: React.ReactNode }) {
  return (
    <section id={id} className="mobile-static-section">
      <div className="mobile-static-section-inner">{children}</div>
    </section>
  )
}

function Heading({
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

export async function MobileStaticHome({ locale }: MobileStaticHomeProps) {
  const tHero = await getTranslations({ locale, namespace: 'Hero' })
  const tHub = await getTranslations({ locale, namespace: 'HomeHub' })
  const tProjects = await getTranslations({ locale, namespace: 'Projects' })
  const tSocial = await getTranslations({ locale, namespace: 'SocialProof' })
  const tTestimonials = await getTranslations({ locale, namespace: 'Testimonials' })
  const tFaq = await getTranslations({ locale, namespace: 'Faq' })
  const tContact = await getTranslations({ locale, namespace: 'Contact' })
  const tFooter = await getTranslations({ locale, namespace: 'Footer' })
  const tNav = await getTranslations({ locale, namespace: 'Nav' })

  const hubCards = tHub.raw('cards') as Array<{ title: string; body: string; cta: string }>
  const faqItems = tFaq.raw('items') as Array<{ question: string; answer: string }>

  return (
    <div className="mobile-static-page">
      <MobileStaticNav locale={locale} />

      <main>
        <Section id="top">
          <p className="mobile-static-eyebrow">{tHero('badge')}</p>
          <h1 className="mobile-static-hero-title">{tHero('headline')}</h1>
          <p className="mobile-static-name-line">
            {tHero('name')} <span className="text-muted-foreground">· {tHero('role')}</span>
          </p>
          <p className="mobile-static-lead" style={{ marginTop: '1rem' }}>
            {tHero('positioning')}
          </p>
          <div className="mobile-static-hero-actions">
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
          <div className="mobile-static-hub-grid">
            {hubCards.map((card, index) => (
              <a
                key={card.title}
                href={`/${locale}${HUB_HREFS[index] ?? '/about'}`}
                className="mobile-static-card mobile-static-card-link"
              >
                <h3 style={{ fontSize: '1.125rem', fontWeight: 700 }}>{card.title}</h3>
                <p className="text-muted-foreground" style={{ marginTop: '0.5rem', fontSize: '0.875rem' }}>
                  {card.body}
                </p>
              </a>
            ))}
          </div>
        </Section>

        <Section id="engine">
          <Heading
            eyebrow={tProjects('eyebrow')}
            title={tProjects('title')}
            description={tProjects('description')}
          />
          <div className="mobile-static-project-list">
            {projects.map((project) => (
              <article key={project.id} className="mobile-static-card">
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>{project.title}</h3>
                <p className="text-muted-foreground" style={{ marginTop: '0.5rem', fontSize: '0.875rem' }}>
                  {project.summary}
                </p>
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
          <p className="mobile-static-muted-block">{tSocial('emptyPartnersBody')}</p>
        </Section>

        <Section>
          <Heading
            eyebrow={tTestimonials('eyebrow')}
            title={tTestimonials('title')}
            description={tTestimonials('description')}
          />
          <p className="mobile-static-muted-block">{tTestimonials('emptyBody')}</p>
        </Section>

        <Section id="stack">
          <Heading eyebrow="05 — Web Stack" title="The Full Stack Flex" />
          <div className="mobile-static-stack">
            {webProjects.map((project) => (
              <a
                key={project.id}
                href={project.href}
                className="text-cyan"
                target="_blank"
                rel="noreferrer"
              >
                {project.title} — {project.domain}
              </a>
            ))}
            <a href={githubShowcase.href} className="text-cyan" target="_blank" rel="noreferrer">
              {githubShowcase.title}
            </a>
          </div>
        </Section>

        <Section id="faq">
          <Heading eyebrow={tFaq('eyebrow')} title={tFaq('title')} description={tFaq('description')} />
          <div className="mobile-static-faq-list">
            {faqItems.map((item) => (
              <details key={item.question} className="mobile-static-card mobile-static-details">
                <summary>{item.question}</summary>
                <p className="text-muted-foreground" style={{ marginTop: '0.75rem', fontSize: '0.875rem' }}>
                  {item.answer}
                </p>
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
          <a
            href="mailto:yane.zhekov@proton.me"
            className="mobile-static-btn mobile-static-btn-primary"
            style={{ marginTop: '2rem' }}
          >
            Email me
          </a>
        </Section>

        <footer className="mobile-static-footer">
          <p className="text-muted-foreground" style={{ fontSize: '0.875rem' }}>
            {tFooter('tagline')}
          </p>
          <p
            className="font-mono text-muted-foreground"
            style={{ marginTop: '1rem', fontSize: '0.625rem', textTransform: 'uppercase', letterSpacing: '0.2em' }}
          >
            © {new Date().getFullYear()} Yane Zhekov
          </p>
          <nav className="mobile-static-footer-nav">
            <a href={`/${locale}/about`}>{tNav('about')}</a>
            <a href={`/${locale}/services`}>{tNav('services')}</a>
            <a href="#contact">{tNav('contact')}</a>
          </nav>
        </footer>
      </main>
    </div>
  )
}
