import { FormEvent, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useShallow } from 'zustand/react/shallow'

import { useWorkspaceSwitch } from '@/hooks/useWorkspaceSwitch'
import { UserCompanyList } from '@/components/UserCompanyList'
import { Modal } from '@/components/ui/Modal'
import { showSuccessToast } from '@/components/ui/SuccessToast'
import { getApiErrorMessage } from '@/lib/auth'
import { createBusiness, type CompanyRow } from '@/lib/user'
import { useAuthStore } from '@/store/useAuthStore'
import { loadUserCacheBundle, useAppCacheStore } from '@/store/useAppCacheStore'
import { useUserCacheKey } from '@/hooks/useUserCacheKey'

type InternetMode = 'service' | 'shop' | 'both'
type CreateStep = 'name' | 'mode' | 'phone' | 'address' | 'slogan'

const CREATE_STEPS: CreateStep[] = ['name', 'mode', 'phone', 'address', 'slogan']

export function CompaniesPage() {
  const { t } = useTranslation()
  const { switchToCompany } = useWorkspaceSwitch()
  const userKey = useUserCacheKey()
  const setCompaniesCache = useAppCacheStore((state) => state.setCompanies)
  const ensureCompanies = useAppCacheStore((state) => state.ensureCompanies)
  const cachedCompanies = useAppCacheStore((state) => state.getCompanies(userKey))
  const { token } = useAuthStore(useShallow((state) => ({ token: state.token })))

  const [companies, setCompanies] = useState<CompanyRow[]>(cachedCompanies ?? [])
  const [name, setName] = useState('')
  const [mode, setMode] = useState<InternetMode>('service')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [slogan, setSlogan] = useState('')
  const [step, setStep] = useState<CreateStep>('name')
  const [loading, setLoading] = useState(!cachedCompanies)
  const [refreshing, setRefreshing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formError, setFormError] = useState<string | null>(null)
  const [createOpen, setCreateOpen] = useState(false)

  useEffect(() => {
    if (cachedCompanies) {
      setCompanies(cachedCompanies)
      setLoading(false)
    }
  }, [cachedCompanies])

  useEffect(() => {
    let active = true
    void loadUserCacheBundle(userKey).then((bundle) => {
      if (!active || !bundle?.companies) return
      setCompanies(bundle.companies)
      setLoading(false)
      useAppCacheStore.setState((state) => ({
        bundles: {
          ...state.bundles,
          [userKey]: {
            ...(state.bundles[userKey] ?? {}),
            companies: bundle.companies,
            companiesFetchedAt: bundle.companiesFetchedAt,
          },
        },
      }))
    })
    return () => {
      active = false
    }
  }, [userKey])

  const loadCompanies = async (force = false) => {
    if (!token) return
    if (force) setRefreshing(true)
    else if (!companies.length) setLoading(true)
    setError(null)
    try {
      const companyRows = await ensureCompanies(token, userKey, { force })
      if (companyRows) setCompanies(companyRows)
    } catch (err) {
      setError(getApiErrorMessage(err))
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    void loadCompanies(false)
  }, [token, userKey])

  const openCreate = () => {
    setFormError(null)
    setName('')
    setMode('service')
    setPhone('')
    setAddress('')
    setSlogan('')
    setStep('name')
    setCreateOpen(true)
  }

  const closeCreate = () => {
    if (saving) return
    setCreateOpen(false)
    setFormError(null)
  }

  const stepIndex = CREATE_STEPS.indexOf(step)

  const goNext = () => {
    if (step === 'name' && !name.trim()) return
    const next = CREATE_STEPS[stepIndex + 1]
    if (next) setStep(next)
  }

  const goBack = () => {
    const prev = CREATE_STEPS[stepIndex - 1]
    if (prev) setStep(prev)
  }

  const onCreate = async (event: FormEvent) => {
    event.preventDefault()
    if (!token) return
    if (step !== 'slogan') {
      goNext()
      return
    }
    setSaving(true)
    setFormError(null)
    try {
      const created = await createBusiness(token, {
        name: name.trim(),
        service: mode !== 'shop',
        store: mode !== 'service',
        phone,
        address,
        slogan,
      })
      setCompanies(created)
      void setCompaniesCache(userKey, created)
      setCreateOpen(false)
      showSuccessToast(t('desktop.saved_success'))
    } catch (err) {
      setFormError(getApiErrorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="companies-page">
      <section className="page-header companies-page__header">
        <div>
          <p className="muted">{t('desktop.page_companies_desc')}</p>
        </div>
        <div className="companies-page__actions">
          <button
            type="button"
            className="btn-secondary"
            onClick={() => void loadCompanies(true)}
            disabled={refreshing || loading}
            title={t('desktop.refresh')}
          >
            <i className={`fa-solid fa-rotate${refreshing ? ' fa-spin' : ''}`} aria-hidden="true" />
            {t('desktop.refresh')}
          </button>
          <button type="button" className="btn-primary" onClick={openCreate}>
            <i className="fa-solid fa-plus" aria-hidden="true" />
            {t('desktop.create_business')}
          </button>
        </div>
      </section>

      {error ? <div className="alert-error">{error}</div> : null}

      <section className="page-card page-card--flush companies-page__list">
        <UserCompanyList
          companies={companies}
          loading={loading && companies.length === 0}
          onSelect={(id) => void switchToCompany(id)}
        />
      </section>

      <Modal open={createOpen} onClose={closeCreate} title={t('desktop.create_business')}>
        <form className="companies-create-form" onSubmit={(e) => void onCreate(e)}>
          {formError ? <div className="alert-error">{formError}</div> : null}

          <div className="pharmacy-create-steps" aria-hidden="true">
            {CREATE_STEPS.map((item, index) => (
              <span key={item} className={index <= stepIndex ? 'is-on' : undefined} />
            ))}
          </div>

          {step === 'name' ? (
            <div className="pharmacy-create-card">
              <label htmlFor="create-business-name">{t('desktop.business_name')}</label>
              <input
                id="create-business-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoFocus
                required
              />
            </div>
          ) : null}

          {step === 'mode' ? (
            <div className="pharmacy-create-card">
              <p className="pharmacy-create-card__title">{t('desktop.internet_mode_hint')}</p>
              <div className="pharmacy-mode-options">
                {(
                  [
                    ['service', t('desktop.internet_service')],
                    ['shop', t('desktop.internet_shop')],
                    ['both', t('desktop.internet_both')],
                  ] as const
                ).map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    className={`pharmacy-mode-option${mode === value ? ' is-selected' : ''}`}
                    onClick={() => setMode(value)}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          {step === 'phone' ? (
            <div className="pharmacy-create-card">
              <label htmlFor="create-business-phone">{t('desktop.phone')}</label>
              <input
                id="create-business-phone"
                value={phone}
                dir="ltr"
                onChange={(e) => setPhone(e.target.value)}
                autoFocus
              />
            </div>
          ) : null}

          {step === 'address' ? (
            <div className="pharmacy-create-card">
              <label htmlFor="create-business-address">{t('desktop.address')}</label>
              <input
                id="create-business-address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                autoFocus
              />
            </div>
          ) : null}

          {step === 'slogan' ? (
            <div className="pharmacy-create-card">
              <label htmlFor="create-business-slogan">{t('desktop.company_slogan')}</label>
              <input
                id="create-business-slogan"
                value={slogan}
                onChange={(e) => setSlogan(e.target.value)}
                autoFocus
              />
            </div>
          ) : null}

          <div className="form-actions">
            {step === 'name' ? (
              <button type="button" className="btn-secondary" onClick={closeCreate} disabled={saving}>
                {t('desktop.cancel')}
              </button>
            ) : (
              <button type="button" className="btn-secondary" onClick={goBack} disabled={saving}>
                {t('desktop.back')}
              </button>
            )}
            <button type="submit" className="btn-primary" disabled={saving || (step === 'name' && !name.trim())}>
              {saving ? t('desktop.loading') : step === 'slogan' ? t('desktop.create') : t('desktop.next')}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
