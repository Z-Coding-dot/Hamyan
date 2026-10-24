import { FormEvent, useEffect, useState } from 'react'
import { Link, useNavigate, useOutletContext, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useShallow } from 'zustand/react/shallow'

import { getApiErrorMessage } from '@/lib/auth'
import { fetchVendorShow, updateBusinessVendor } from '@/lib/business'
import { useUserCacheKey } from '@/hooks/useUserCacheKey'
import type { BusinessShowData } from '@/lib/user'
import { useAuthStore } from '@/store/useAuthStore'
import { useListsCacheStore } from '@/store/useListsCacheStore'
import { useToastStore } from '@/store/useToastStore'
import { businessPath } from '@/store/useCompanyContextStore'

type CompanyOutletContext = { business: BusinessShowData }

export function CompanyVendorSetupPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { companyId = '', vendorId = '' } = useParams()
  const { business } = useOutletContext<CompanyOutletContext>()
  const token = useAuthStore(useShallow((state) => state.token))
  const userKey = useUserCacheKey()
  const refreshVendors = useListsCacheStore((s) => s.refreshVendors)
  const showSuccess = useToastStore((s) => s.showSuccess)

  const canManage = Boolean(business.permissions?.canManageVendors) && business.is_active

  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [address, setAddress] = useState('')

  useEffect(() => {
    if (!token || !companyId || !vendorId) return
    let cancelled = false
    ;(async () => {
      setLoading(true)
      setError(null)
      try {
        const data = await fetchVendorShow(token, companyId, vendorId)
        if (cancelled) return
        const v = data.vendor
        setName(v.name || '')
        setPhone(v.phone || '')
        setEmail(v.email || '')
        setAddress(v.address || '')
      } catch (err) {
        if (!cancelled) setError(getApiErrorMessage(err))
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [token, companyId, vendorId])

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    if (!token || !canManage) return
    setProcessing(true)
    setError(null)
    try {
      await updateBusinessVendor(token, companyId, vendorId, {
        name,
        phone: phone || undefined,
        email: email || undefined,
        address: address || undefined,
      })
      void refreshVendors(token, userKey, companyId)
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
        <div className="alert-error">{error || t('desktop.vendor_setup')}</div>
        <Link to={businessPath(companyId, `vendors/${vendorId}`)} className="btn-secondary btn-sm">
          {t('desktop.back')}
        </Link>
      </div>
    )
  }

  return (
    <div className="dash-div party-page" dir="rtl">
      <div className="dash-header dash-header--section mb-2">
        <h5 className="mb-0">{t('desktop.vendor_setup')}</h5>
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

        <div className="form-actions">
          <Link to={businessPath(companyId, `vendors/${vendorId}`)} className="btn-secondary">
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
