import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

import { SeoHead } from '@/components/SeoHead'
import { fetchPublicStats } from '@/lib/user'
import { useAuthStore } from '@/store/useAuthStore'

const AFFILIATE_LIMIT = 100
const INVITE_REWARD_AFN = 20

export function PublicAffiliatePage() {
  const { t } = useTranslation()
  const token = useAuthStore((s) => s.token)
  const [open, setOpen] = useState(true)
  const [limit, setLimit] = useState(AFFILIATE_LIMIT)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    let active = true
    void fetchPublicStats()
      .then((stats) => {
        if (!active) return
        if (typeof stats.affiliate_limit === 'number') setLimit(stats.affiliate_limit)
        setOpen(stats.affiliate_open !== false)
        setLoaded(true)
      })
      .catch(() => {
        if (active) setLoaded(true)
      })
    return () => {
      active = false
    }
  }, [])

  const applyHref = token ? '/affiliate/apply' : '/register'
  const applyLabel = token
    ? t('desktop.public_affiliate_cta_auth')
    : t('desktop.public_affiliate_cta_guest')

  return (
    <div className="pub-affiliate" dir="rtl">
      <SeoHead description={t('desktop.public_affiliate_seo')} />
      <div className="guest-page-back">
        <Link to={token ? '/dashboard' : '/'} className="guest-back-home">
          <i className="fa-solid fa-arrow-right" aria-hidden="true" />
          <span>{token ? t('desktop.back_to_dashboard') : t('desktop.back_to_home')}</span>
        </Link>
      </div>

      <header className="pub-affiliate__hero">
        <span className="pub-affiliate__badge">
          <i className={`fa-solid ${open ? 'fa-handshake-angle' : 'fa-lock'}`} aria-hidden />
          {open
            ? t('desktop.public_affiliate_badge', { count: limit })
            : t('desktop.public_affiliate_full_badge')}
        </span>
        <h1>{t('desktop.public_affiliate_title')}</h1>
        {open ? (
          <>
            <p className="pub-affiliate__slogan">{t('desktop.public_affiliate_slogan')}</p>
            <p className="pub-affiliate__slogan-hint">{t('desktop.public_affiliate_slogan_hint')}</p>
            <p className="pub-affiliate__lead">{t('desktop.public_affiliate_lead')}</p>
            <p className="pub-affiliate__limit">
              {t('desktop.public_affiliate_limit', { count: limit })}
            </p>
            <div className="pub-affiliate__actions">
              <Link to={applyHref} className="btn-primary">
                {applyLabel}
                <i className="fa-solid fa-arrow-left" aria-hidden />
              </Link>
              {!token ? (
                <Link to="/login" className="btn-secondary">
                  {t('desktop.public_affiliate_cta_login')}
                </Link>
              ) : null}
            </div>
          </>
        ) : (
          <>
            <p className="pub-affiliate__slogan">{t('desktop.public_affiliate_full_title')}</p>
            <p className="pub-affiliate__lead">
              {t('desktop.public_affiliate_full_desc', { count: limit })}
            </p>
          </>
        )}
      </header>

      {open && loaded ? (
        <>
          <section className="pub-affiliate__grid">
            <article>
              <i className="fa-solid fa-user-plus" aria-hidden />
              <h2>{t('desktop.public_affiliate_why_1_title')}</h2>
              <p>
                {t('desktop.public_affiliate_why_1_desc', {
                  amount: INVITE_REWARD_AFN.toLocaleString('en-US'),
                })}
              </p>
            </article>
            <article>
              <i className="fa-solid fa-percent" aria-hidden />
              <h2>{t('desktop.public_affiliate_why_2_title')}</h2>
              <p>{t('desktop.public_affiliate_why_2_desc')}</p>
            </article>
            <article>
              <i className="fa-solid fa-wallet" aria-hidden />
              <h2>{t('desktop.public_affiliate_why_3_title')}</h2>
              <p>{t('desktop.public_affiliate_why_3_desc')}</p>
            </article>
          </section>

          <section className="pub-affiliate__steps">
            <h2>{t('desktop.public_affiliate_how_title')}</h2>
            <ol>
              <li>{t('desktop.public_affiliate_step_1')}</li>
              <li>{t('desktop.public_affiliate_step_2')}</li>
              <li>{t('desktop.public_affiliate_step_3')}</li>
            </ol>
          </section>
        </>
      ) : null}
    </div>
  )
}
