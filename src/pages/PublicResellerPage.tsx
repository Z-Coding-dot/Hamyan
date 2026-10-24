import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

import { ProvinceFilterModal } from '@/components/ProvinceFilterModal'
import { SeoHead } from '@/components/SeoHead'
import {
  fetchProvinces,
  fetchPublicResellers,
  type ProvinceRow,
  type PublicResellerRow,
} from '@/lib/user'
import { formatWhatsappDisplay, whatsappChatUrl } from '@/lib/whatsapp'
import { useAuthStore } from '@/store/useAuthStore'
import { useLocaleStore, type SupportedLanguage } from '@/store/useLocaleStore'

function provinceLabel(
  province: Pick<ProvinceRow, 'name_fa' | 'name_ps' | 'name_en'> | null | undefined,
  language: SupportedLanguage,
): string {
  if (!province) return ''
  if (language === 'ps') return province.name_ps || province.name_fa
  if (language === 'en') return province.name_en || province.name_fa
  return province.name_fa
}

function formatAddress(row: PublicResellerRow, language: SupportedLanguage): string {
  const parts = [
    provinceLabel(row.province, language),
    row.city_district?.trim(),
    row.address?.trim(),
  ].filter(Boolean)
  return parts.join('، ')
}

/** Public directory of Hamyan resellers. */
export function PublicResellerPage() {
  const { t } = useTranslation()
  const language = useLocaleStore((state) => state.language)
  const token = useAuthStore((s) => s.token)
  const [resellers, setResellers] = useState<PublicResellerRow[]>([])
  const [provinces, setProvinces] = useState<ProvinceRow[]>([])
  const [provinceId, setProvinceId] = useState('')
  const [filterOpen, setFilterOpen] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    void fetchProvinces()
      .then((rows) => {
        if (active) setProvinces(rows)
      })
      .catch(() => {
        if (active) setProvinces([])
      })
    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    let active = true
    setLoading(true)
    const selected = provinceId ? Number(provinceId) : null
    void fetchPublicResellers(selected && Number.isFinite(selected) ? selected : null)
      .then((directory) => {
        if (active) setResellers(directory)
      })
      .catch(() => {
        if (active) setResellers([])
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [provinceId])

  const selectedProvince = useMemo(
    () => provinces.find((row) => String(row.id) === provinceId) || null,
    [provinces, provinceId],
  )

  const filterLabel = selectedProvince
    ? provinceLabel(selectedProvince, language)
    : t('desktop.reseller_directory_filter_all')

  return (
    <div className="pub-affiliate" dir="rtl">
      <SeoHead description={t('desktop.reseller_directory_seo')} />
      <div className="guest-page-back">
        <Link to={token ? '/dashboard' : '/'} className="guest-back-home">
          <i className="fa-solid fa-arrow-right" aria-hidden="true" />
          <span>{token ? t('desktop.back_to_dashboard') : t('desktop.back_to_home')}</span>
        </Link>
      </div>

      <header className="pub-affiliate__hero">
        <span className="pub-affiliate__badge">
          <i className="fa-solid fa-store" aria-hidden />
          {t('desktop.reseller_nav')}
        </span>
        <h1>{t('desktop.reseller_directory_title')}</h1>
        <div className="pub-affiliate__lead pub-reseller-directory__intro">
          <p>{t('desktop.reseller_directory_lead_1')}</p>
          <p>{t('desktop.reseller_directory_lead_2')}</p>
          <p>{t('desktop.reseller_directory_lead_3')}</p>
          <p className="pub-reseller-directory__support">
            <span>{t('desktop.reseller_directory_support_whatsapp')}: </span>
            <a
              href={whatsappChatUrl('93703098630') || 'https://wa.me/93703098630'}
              target="_blank"
              rel="noreferrer"
              dir="ltr"
            >
              93703098630
            </a>
          </p>
        </div>
        <div className="pub-affiliate__actions">
          <Link to="/become-reseller" className="btn-primary">
            {t('desktop.reseller_become_nav')}
            <i className="fa-solid fa-arrow-left" aria-hidden />
          </Link>
        </div>
      </header>

      <section className="pub-affiliate__steps pub-reseller-directory">
        <div className="pub-reseller-directory__filter">
          <span className="pub-reseller-directory__filter-label">
            {t('desktop.reseller_directory_filter')}
          </span>
          <button
            type="button"
            className="pub-reseller-directory__filter-btn"
            onClick={() => setFilterOpen(true)}
          >
            <i className="fa-solid fa-map-location-dot" aria-hidden />
            <span>{filterLabel}</span>
            <i className="fa-solid fa-chevron-down" aria-hidden />
          </button>
        </div>

        {loading ? (
          <p className="muted">{t('desktop.loading')}</p>
        ) : resellers.length === 0 ? (
          <p className="muted">
            {provinceId
              ? t('desktop.reseller_directory_empty_filtered')
              : t('desktop.reseller_directory_empty')}
          </p>
        ) : (
          <div className="pub-reseller-directory__list">
            {resellers.map((row) => {
              const waDisplay = formatWhatsappDisplay(row.whatsapp)
              const waHref = whatsappChatUrl(row.whatsapp)
              const address = formatAddress(row, language)
              return (
                <article key={row.id} className="pub-reseller-directory__card">
                  <h3>{row.name || '—'}</h3>
                  <p>
                    <span>{t('desktop.reseller_directory_whatsapp')}: </span>
                    {waHref && waDisplay ? (
                      <a href={waHref} target="_blank" rel="noreferrer" dir="ltr">
                        {waDisplay}
                      </a>
                    ) : (
                      <span dir="ltr">{row.whatsapp || '—'}</span>
                    )}
                  </p>
                  <p>
                    <span>{t('desktop.reseller_directory_address')}: </span>
                    <strong>{address || '—'}</strong>
                  </p>
                </article>
              )
            })}
          </div>
        )}
      </section>

      <ProvinceFilterModal
        open={filterOpen}
        provinces={provinces}
        language={language}
        selectedId={provinceId}
        onClose={() => setFilterOpen(false)}
        onSelect={setProvinceId}
      />
    </div>
  )
}
