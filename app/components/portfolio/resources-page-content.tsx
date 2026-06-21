'use client'

import { ArrowUpRight } from 'lucide-react'
import Link from 'next/link'
import { useLocale, useTranslations } from 'next-intl'
import { audiencePages } from './audience-pages-data'
import { buildArticleSchema, buildVideoSchema } from '../../../lib/structured-data'
import { JsonLd } from './json-ld'
import { KeyTakeaways } from './key-takeaways'
import { LeadCapturePanel } from './lead-capture-panel'
import { SitePageHero, SitePageLayout } from './site-page-layout'
import { githubShowcase } from './web-projects-data'
import { useCases } from './use-cases-data'
import { StationButton, StationChip, StationPanel } from './station-console'

export function ResourcesPageContent() {
  const t = useTranslations('ResourcesPage')
  const tSite = useTranslations('SitePages')
  const locale = useLocale()
  const posts = t.raw('posts') as Array<{
    title: string
    body: string
    href: string
    external?: boolean
    video?: boolean
    thumbnailUrl?: string
  }>
  const takeaways = t.raw('takeaways') as string[]

  const articleSchemas = posts
    .filter((post) => !post.external)
    .map((post) =>
      buildArticleSchema({
        locale,
        title: post.title,
        description: post.body,
        path: post.href,
      })
    )

  const videoSchemas = posts
    .filter((post) => post.video && !post.external)
    .map((post) =>
      buildVideoSchema({
        locale,
        title: post.title,
        description: post.body,
        path: post.href,
        thumbnailUrl: post.thumbnailUrl,
      })
    )

  const structuredData = [...articleSchemas, ...videoSchemas]

  return (
    <SitePageLayout
      breadcrumbs={[
        { name: tSite('bridgeCrumb'), path: '' },
        { name: t('title'), path: '/resources' },
      ]}
    >
      {structuredData.length > 0 ? <JsonLd data={structuredData} /> : null}
      <SitePageHero eyebrow={t('eyebrow')} title={t('title')} description={t('description')} />

      <StationPanel variant="module" backLabel="POSTS" className="mb-8">
        <h2 className="relative z-[1] font-heading text-2xl font-bold tracking-tight">{t('postsTitle')}</h2>
        <p className="relative z-[1] mt-3 text-pretty leading-relaxed text-muted-foreground">{t('postsIntro')}</p>
        <div className="relative z-[1] mt-6 grid gap-4">
          {posts.map((post) => (
            <Link
              key={post.title}
              href={post.external ? post.href : `/${locale}${post.href}`}
              target={post.external ? '_blank' : undefined}
              rel={post.external ? 'noreferrer' : undefined}
              className="station-card-link group rounded-lg border border-[var(--station-bezel)]/35 bg-[var(--station-hull-dark)]/40 p-4 transition-colors hover:border-cyan/35"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-heading text-lg font-bold tracking-tight group-hover:text-cyan">
                    {post.title}
                  </h3>
                  <p className="mt-2 text-pretty text-sm leading-relaxed text-muted-foreground">{post.body}</p>
                </div>
                <ArrowUpRight className="mt-1 h-4 w-4 shrink-0 text-muted-foreground transition-colors group-hover:text-cyan" />
              </div>
            </Link>
          ))}
        </div>
      </StationPanel>

      <LeadCapturePanel className="mb-8" />

      <div className="mb-8 grid gap-6 lg:grid-cols-2">
        <StationPanel variant="module" backLabel="BRIEFS" className="h-full">
          <h2 className="relative z-[1] font-heading text-xl font-bold tracking-tight">{t('briefsTitle')}</h2>
          <ul className="relative z-[1] mt-4 space-y-3">
            {useCases.map((useCase) => (
              <li key={useCase.slug}>
                <Link
                  href={`/${locale}/use-cases/${useCase.slug}`}
                  className="group inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-cyan"
                >
                  <StationChip className="!text-[9px]">{useCase.stack[0]}</StationChip>
                  <span className="font-medium text-foreground group-hover:text-cyan">{useCase.title}</span>
                  <ArrowUpRight className="h-3.5 w-3.5 opacity-0 transition-opacity group-hover:opacity-100" />
                </Link>
              </li>
            ))}
          </ul>
        </StationPanel>

        <StationPanel variant="module" backLabel="AUD" className="h-full">
          <h2 className="relative z-[1] font-heading text-xl font-bold tracking-tight">{t('audiencesTitle')}</h2>
          <ul className="relative z-[1] mt-4 space-y-3">
            {audiencePages.map((page) => (
              <li key={page.slug}>
                <Link
                  href={`/${locale}/for/${page.slug}`}
                  className="group block rounded-md border border-transparent px-1 py-1 transition-colors hover:border-cyan/20"
                >
                  <p className="font-medium text-foreground group-hover:text-cyan">{page.title}</p>
                  <p className="text-pretty text-xs leading-relaxed text-muted-foreground">{page.tagline}</p>
                </Link>
              </li>
            ))}
          </ul>
        </StationPanel>
      </div>

      <KeyTakeaways title={t('takeawaysTitle')} items={takeaways} />

      <StationPanel variant="module" backLabel="COMMS">
        <p className="relative z-[1] text-pretty leading-relaxed text-muted-foreground">{t('ctaBody')}</p>
        <div className="relative z-[1] mt-6 flex flex-wrap gap-3">
          <StationButton href={githubShowcase.href} variant="secondary">
            {t('githubCta')}
            <ArrowUpRight className="h-4 w-4" />
          </StationButton>
          <StationButton href={`/${locale}#contact`} variant="primary">
            {t('contactCta')}
            <ArrowUpRight className="h-4 w-4" />
          </StationButton>
        </div>
      </StationPanel>
    </SitePageLayout>
  )
}
