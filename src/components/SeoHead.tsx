import { Helmet } from 'react-helmet-async'
import { useTranslation } from 'react-i18next'
import { useLocation } from 'react-router-dom'

import { getPageTitleKey } from '@/lib/routes'
import { useLocaleStore, type SupportedLanguage } from '@/store/useLocaleStore'

function resolveSiteUrl(): string {
  const configured = (import.meta.env.VITE_SITE_URL as string | undefined)?.trim().replace(/\/$/, '')
  if (configured) return configured
  if (typeof window !== 'undefined' && window.location?.origin) return window.location.origin
  return 'http://localhost:5177'
}

const PRODUCTION_SITE = 'http://localhost:5177'

const PUBLIC_DESCRIPTIONS: Record<string, string> = {
  login_heading: 'ورود به همیان با همان حساب اولنیش برای مصارف و معاملات شخصی.',
  register_heading: 'ثبت‌نام رایگان در همیان با همان حساب اولنیش.',
  forgot_password_heading: 'بازیابی رمز عبور حساب همیان.',
  reset_password_heading: 'تعیین رمز عبور جدید برای حساب همیان.',
  help_center: 'مرکز کمک همیان.',
  nav_dashboard: 'میز کار همیان برای مصارف و معاملات شخصی.',
  home_page_title: 'همیان — مصارف و معاملات شخصی در یک جا.',
  terms: 'شرایط استفاده از پلتفرم همیان.',
  policies: 'پالیسی‌ها و حریم خصوصی همیان.',
}

const PRIVATE_PREFIXES = [
  '/wallet',
  '/accounts',
  '/counterparties',
  '/notifications',
  '/settings',
  '/profile',
  '/companies',
  '/premium',
  '/expenses',
  '/incomes',
  '/guide',
  '/dashboard',
  '/forgot-password',
  '/reset-password',
]

const PRODUCT_PATHS = new Set(['/', '/login', '/register', '/help'])

function languageUrl(siteUrl: string, pathname: string, code: SupportedLanguage): string {
  const clean = pathname === '/' ? siteUrl : `${siteUrl}${pathname}`
  if (code === 'fa') return clean
  return `${clean}?lang=${code}`
}

function jsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, '\\u003c')
}

type SeoHeadProps = {
  title?: string
  description?: string
  noIndex?: boolean
}

export function SeoHead({ title, description, noIndex }: SeoHeadProps) {
  const { t, i18n } = useTranslation()
  const location = useLocation()
  const language = useLocaleStore((s) => s.language)
  const titleKey = getPageTitleKey(location.pathname)
  const pageTitle = title || t(`desktop.${titleKey}`)
  const fullTitle = `${pageTitle} | ${t('desktop.app_name')}`
  const desc =
    description ||
    PUBLIC_DESCRIPTIONS[titleKey] ||
    'همیان — مدیریت مصارف و معاملات شخصی، با همان حساب اولنیش.'
  const siteUrl = resolveSiteUrl()
  const shareOrigin = siteUrl.includes('localhost') || siteUrl.includes('127.0.0.1') ? PRODUCTION_SITE : siteUrl
  const lang: SupportedLanguage =
    language || (i18n.language?.startsWith('ps') ? 'ps' : i18n.language?.startsWith('en') ? 'en' : 'fa')
  const shouldNoIndex =
    noIndex ||
    location.pathname.startsWith('/business/') ||
    PRIVATE_PREFIXES.some((p) => location.pathname === p || location.pathname.startsWith(`${p}/`))
  const isProductPage = PRODUCT_PATHS.has(location.pathname) || location.pathname.startsWith('/help/')
  const canonical = languageUrl(siteUrl, location.pathname, lang)
  const image = `${shareOrigin}/og-image.png`
  const locale = lang === 'en' ? 'en_US' : lang === 'ps' ? 'ps_AF' : 'fa_AF'
  const graph = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': `${PRODUCTION_SITE}/#organization`,
        name: 'Hamyan',
        alternateName: ['همیان', 'Hamyab'],
        url: PRODUCTION_SITE,
        logo: {
          '@type': 'ImageObject',
          url: `${PRODUCTION_SITE}/icons/pwa-512.png`,
          width: 512,
          height: 512,
        },
        parentOrganization: {
          '@type': 'Organization',
          name: 'Ulanish',
          url: 'https://ulanish.dev',
        },
      },
      {
        '@type': 'WebSite',
        '@id': `${PRODUCTION_SITE}/#website`,
        name: 'Hamyan',
        alternateName: 'همیان',
        url: PRODUCTION_SITE,
        inLanguage: ['fa', 'ps', 'en'],
        publisher: { '@id': `${PRODUCTION_SITE}/#organization` },
      },
      {
        '@type': 'SoftwareApplication',
        '@id': `${PRODUCTION_SITE}/#app`,
        name: 'Hamyan',
        alternateName: 'همیان',
        applicationCategory: 'FinanceApplication',
        applicationSubCategory: 'Personal expenses and transactions',
        operatingSystem: 'Web',
        url: PRODUCTION_SITE,
        image,
        description: desc,
        inLanguage: ['fa', 'ps', 'en'],
        featureList: [
          'Personal expenses',
          'Personal accounts and deposits',
          'Counterparties and deals',
          'Expense analysis',
        ],
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'AFN',
          description: 'Registration is free on the shared Ulanish account.',
        },
        publisher: { '@id': `${PRODUCTION_SITE}/#organization` },
      },
      {
        '@type': 'WebPage',
        '@id': `${canonical}#webpage`,
        url: canonical,
        name: fullTitle,
        description: desc,
        inLanguage: lang,
        isPartOf: { '@id': `${PRODUCTION_SITE}/#website` },
        about: { '@id': `${PRODUCTION_SITE}/#app` },
      },
    ],
  }

  return (
    <Helmet htmlAttributes={{ lang, dir: lang === 'en' ? 'ltr' : 'rtl' }}>
      <title>{fullTitle}</title>
      <meta name="description" content={desc} />
      <link rel="canonical" href={canonical} />
      {shouldNoIndex ? (
        <meta name="robots" content="noindex,nofollow" />
      ) : (
        <meta name="robots" content="index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1" />
      )}

      <meta property="og:type" content="website" />
      <meta property="og:site_name" content="Hamyan" />
      <meta property="og:locale" content={locale} />
      <meta property="og:locale:alternate" content="fa_AF" />
      <meta property="og:locale:alternate" content="ps_AF" />
      <meta property="og:locale:alternate" content="en_US" />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={desc} />
      <meta property="og:url" content={canonical} />
      <meta property="og:image" content={image} />
      <meta property="og:image:secure_url" content={image} />
      <meta property="og:image:type" content="image/png" />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content="همیان — مصارف و معاملات شخصی" />

      {!shouldNoIndex ? (
        <>
          <link rel="alternate" hrefLang="fa" href={languageUrl(siteUrl, location.pathname, 'fa')} />
          <link rel="alternate" hrefLang="ps" href={languageUrl(siteUrl, location.pathname, 'ps')} />
          <link rel="alternate" hrefLang="en" href={languageUrl(siteUrl, location.pathname, 'en')} />
          <link rel="alternate" hrefLang="x-default" href={languageUrl(siteUrl, location.pathname, 'fa')} />
        </>
      ) : null}

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={desc} />
      <meta name="twitter:image" content={image} />
      <meta name="twitter:image:alt" content="همیان — مصارف و معاملات شخصی" />

      <meta name="theme-color" content="#0D2B7E" />
      <meta name="application-name" content="Hamyan" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      <meta name="apple-mobile-web-app-title" content="همیان" />
      <link rel="apple-touch-icon" href={`${siteUrl}/apple-touch-icon.png`} />
      <link rel="apple-touch-icon" sizes="180x180" href={`${siteUrl}/icons/apple-touch-icon-180.png`} />
      <link rel="apple-touch-icon" sizes="167x167" href={`${siteUrl}/icons/apple-touch-icon-167.png`} />
      <link rel="apple-touch-icon" sizes="152x152" href={`${siteUrl}/icons/apple-touch-icon-152.png`} />
      <link rel="apple-touch-icon" sizes="120x120" href={`${siteUrl}/icons/apple-touch-icon-120.png`} />

      {isProductPage && !shouldNoIndex ? <script type="application/ld+json">{jsonLd(graph)}</script> : null}
    </Helmet>
  )
}
