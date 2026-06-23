import createMiddleware from 'next-intl/middleware'
import { type NextRequest } from 'next/server'
import { routing } from './i18n/routing'
import { isMobileStaticRequestHeaders } from './lib/mobile-static'

const intlMiddleware = createMiddleware(routing)

export default function middleware(request: NextRequest) {
  const response = intlMiddleware(request)
  const ua = request.headers.get('user-agent')
  const mobileHint = request.headers.get('sec-ch-ua-mobile')
  const isMobile = isMobileStaticRequestHeaders(ua, mobileHint)

  response.headers.set('x-mobile-static', isMobile ? '1' : '0')

  const localeMatch = request.nextUrl.pathname.match(/^\/(en|bg)(\/|$)/)
  if (localeMatch) {
    response.headers.set('x-locale', localeMatch[1])
  }

  const isMobileHome = /^\/(en|bg)$/.test(request.nextUrl.pathname)
  response.headers.set('x-mobile-home', isMobile && isMobileHome ? '1' : '0')

  if (isMobile) {
    response.cookies.set('mobile-static', '1', { path: '/', maxAge: 86_400, sameSite: 'lax' })
  } else {
    response.cookies.delete('mobile-static')
  }

  return response
}

export const config = {
  matcher: ['/', '/(en|bg)/:path*'],
}
