import { FormEvent, useEffect, useState } from 'react'
import { Link, useNavigate, useOutletContext, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useShallow } from 'zustand/react/shallow'

import { getApiErrorMessage } from '@/lib/auth'
import { fetchCustomerShow, updateBusinessCustomer } from '@/lib/business'
import { useUserCacheKey } from '@/hooks/useUserCacheKey'
import type { BusinessShowData } from '@/lib/user'
import { useAuthStore } from '@/store/useAuthStore'
import { useListsCacheStore } from '@/store/useListsCacheStore'
import { useToastStore } from '@/store/useToastStore'
import { businessPath } from '@/store/useCompanyContextStore'

type CompanyOutletContext = { business: BusinessShowData }

export function CompanyCustomerSetupPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { companyId = '', customerId = '' } = useParams()
  const { business } = useOutletContext<CompanyOutletContext>()
  const token = useAuthStore(useShallow((state) => state.token))
  const userKey = useUserCacheKey()
  const refreshCustomers = useListsCacheStore((s) => s.refreshCustomers)
  const showSuccess = useToastStore((s) => s.showSuccess)

  const canManage =
    Boolean(business.permissions?.canManageCustomers) && business.is_active

  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [address, setAddress] = useState('')
  const [personality, setPersonality] = useState<'human' | 'company'>('human')

  useEffect(() => {
    if (!token || !companyId || !customerId) return
    let cancelled = false
    ;(async () => {
      setLoading(true)
      setError(null)
      try {
        const data = await fetchCustomerShow(token, companyId, customerId)
        if (cancelled) return
        const c = data.customer
        setName(c.name || '')
        setCompanyName(c.company_name || '')
        setPhone(c.phone || '')
        setEmail(c.email || '')
        setAddress(c.address || '')
        setPersonality(c.personality === 'company' ? 'company' : 'human')
      } catch (err) {
        if (!cancelled) setError(getApiErrorMessage(err))
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [token, companyId, customerId])

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    if (!token || !canManage) return
    setProcessing(true)
    setError(null)
    try {
      await updateBusinessCustomer(token, companyId, customerId, {
        name,
        company_name: companyName || undefined,
        phone: phone || undefined,
        email: email || undefined,
        address: address || undefined,
        personality,
      })
      void refreshCustomers(token, userKey, companyId)
      showSuccess(t('desktop.saved_success'))
    } catch (err) {
      setError(getApiErrorMessage(err))
    } finally {
      setProcessing(false)
    }
  }

  if (loading) {
    return (
      <div className="center-screen">
        <div className="spinner" />
      </div>
    )
  }

  if (!canManage) {
    return (
      <div className="dash-div party-page" dir="rtl">
        <div className="alert-error">{error || t('desktop.customer_setup')}</div>
        <Link to={businessPath(companyId, `customers/${customerId}`)} className="btn-secondary btn-sm">
          {t('desktop.back')}
        </Link>
      </div>
    )
  }

  return (
    <div className="dash-div party-page" dir="rtl">
      <div className="dash-header dash-header--section mb-2">
        <h5 className="mb-0">{t('desktop.customer_setup')}</h5>
      </div>

      <div className="mb-3">
        <button type="button" className="btn-secondary btn-sm" onClick={() => navigate(-1)}>
          <i className="fa-solid fa-reply" /> {t('desktop.back')}
        </button>
      </div>

      <form onSubmit={(e) => void submit(e)} className="party-setup-form">
        {error ? <div className="alert-error">{error}</div> : null}

        <label>
          {t('desktop.name')}
          <input value={name} onChange={(e) => setName(e.target.value)} required />
        </label>
        <label>
          {t('desktop.company_name')}
          <input value={companyName} onChange={(e) => setCompanyName(e.target.value)} />
        </label>
        <label>
          {t('desktop.phone')}
          <input value={phone} onChange={(e) => setPhone(e.target.value)} />
        </label>
        <label>
          {t('desktop.email')}
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </label>
        <label>
          {t('desktop.address')}
          <input value={address} onChange={(e) => setAddress(e.target.value)} />
        </label>
        <label>
          {t('desktop.personality')}
          <select
            value={personality}
            onChange={(e) => setPersonality(e.target.value as 'human' | 'company')}
          >
            <option value="human">{t('desktop.personality_human')}</option>
            <option value="company">{t('desktop.personality_company')}</option>
          </select>
        </label>

        <div className="form-actions">
          <Link
            to={businessPath(companyId, `customers/${customerId}`)}
            className="btn-secondary"
          >
            {t('desktop.view')}
          </Link>
          <button type="submit" className="btn-primary" disabled={processing || !name.trim()}>
            {processing ? t('desktop.processing') : t('desktop.save')}
          </button>
        </div>
      </form>
    </div>
  )
}
