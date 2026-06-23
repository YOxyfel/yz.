import { NextIntlClientProvider } from 'next-intl'
import { getMessages, setRequestLocale } from 'next-intl/server'
import { headers } from 'next/headers'
import { notFound } from 'next/navigation'
import { routing, type AppLocale } from '../../i18n/routing'
import { SetHtmlLang } from '../components/portfolio/set-html-lang'
import { JsonLd } from '../components/portfolio/json-ld'
import { buildPersonSchema, buildWebSiteSchema } from '../../lib/structured-data'

type Props = {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params

  if (!routing.locales.includes(locale as AppLocale)) {
    notFound()
  }

  setRequestLocale(locale)

  const headerStore = await headers()
  const mobile = headerStore.get('x-mobile-static') === '1'

  if (mobile) {
    const isMobileHome = headerStore.get('x-mobile-home') === '1'

    if (isMobileHome) {
      return (
        <>
          <JsonLd data={[buildPersonSchema(locale), buildWebSiteSchema(locale)]} />
          {children}
        </>
      )
    }

    const messages = await getMessages()

    return (
      <NextIntlClientProvider locale={locale} messages={messages}>
        <JsonLd data={[buildPersonSchema(locale), buildWebSiteSchema(locale)]} />
        {children}
      </NextIntlClientProvider>
    )
  }

  const messages = await getMessages()

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <SetHtmlLang locale={locale} />
      <JsonLd data={[buildPersonSchema(locale), buildWebSiteSchema(locale)]} />
      {children}
    </NextIntlClientProvider>
  )
}
