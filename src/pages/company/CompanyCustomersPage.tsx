import { Select } from '@/components/inputs/SearchableSelect'
import { FormEvent, useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useOutletContext, useParams, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useShallow } from 'zustand/react/shallow'
import { localizeCurrency } from '@/lib/currency'

import { SearchField } from '@/components/inputs/SearchField'
import { Modal } from '@/components/ui/Modal'
import { useUserCacheKey } from '@/hooks/useUserCacheKey'
import { getApiErrorMessage } from '@/lib/auth'
import {
  createBusinessCustomer,
  fetchBusinessCustomers,
  type BusinessCustomerRow,
} from '@/lib/business'
import { formatMoney } from '@/lib/companyDashboard'
import type { BusinessShowData } from '@/lib/user'
import { useAuthStore } from '@/store/useAuthStore'
import { businessPath } from '@/store/useCompanyContextStore'
import { hydrateListsCache, useListsCacheStore } from '@/store/useListsCacheStore'

type CompanyOutletContext = { business: BusinessShowData }

type DebtChip = {
  id?: number | string
  company_account_id?: number | string | null
  currency?: string | null
  amount?: number | string | null
}


function hasAnyDebt(debts: DebtChip[] | undefined): boolean {
  return (debts || []).some((d) => Number(d?.amount ?? 0) > 0)
}

function DebtChips({ debts, t }: { debts: DebtChip[] | undefined; t: (key: string) => string }) {
  if (!debts?.length) return <span className="muted">—</span>
  return (
    <div className="party-debt-list">
      {debts.map((d) => {
        const amount = Number(d?.amount ?? 0)
        return (
          <div
            key={d.id || `${d.company_account_id}-${d.currency}`}
            className="party-debt-row"
          >
            <span className="muted">{localizeCurrency(d.currency, t)}</span>
            <strong className={amount > 0 ? 'text-danger' : 'muted'}>{formatMoney(d.amount)}</strong>
          </div>
        )
      })}
    </div>
  )
}

export function CompanyCustomersPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { companyId = '' } = useParams()
  const [searchParams, setSearchParams] = useSearchParams()
  const { business } = useOutletContext<CompanyOutletContext>()
  const token = useAuthStore(useShallow((state) => state.token))
  const userKey = useUserCacheKey()
  const ensureCustomers = useListsCacheStore((s) => s.ensureCustomers)
  const refreshCustomers = useListsCacheStore((s) => s.refreshCustomers)
  const cachedCustomers = useListsCacheStore((s) =>
    companyId ? s.getCustomers(userKey, companyId) : null,
  )

  const fil = searchParams.get('fil') || undefined
  const isReceivables = fil === 'receivables'
  const canManage =
    Boolean(business.permissions?.canManageCustomers) && business.is_active

  const applyFilter = (all: BusinessCustomerRow[]) => {
    if (fil === 'receivables') {
      return all.filter((row) => hasAnyDebt(row.customerDebts))
    }
    return all
  }

  const [rows, setRows] = useState<BusinessCustomerRow[]>(() =>
    cachedCustomers ? applyFilter(cachedCustomers) : [],
  )
  const [loading, setLoading] = useState(!cachedCustomers)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [createOpen, setCreateOpen] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState<BusinessCustomerRow | null>(null)
  const [expandedReceivableId, setExpandedReceivableId] = useState<string | null>(null)

  const load = async (force = false) => {
    if (!token || !companyId) return
    const hasCache = Boolean(useListsCacheStore.getState().getCustomers(userKey, companyId))
    if (!hasCache) setLoading(true)
    setError(null)
    try {
      const data = await ensureCustomers(token, userKey, companyId, { force })
      if (data) setRows(applyFilter(data))
    } catch (err) {
      setError(getApiErrorMessage(err))
      if (!hasCache) setRows([])
    } finally {
      setLoading(false)
    }
  }

  const reload = async () => {
    if (!token || !companyId) return
    setLoading(true)
    setError(null)
    try {
      const data = await fetchBusinessCustomers(token, companyId)
      setRows(applyFilter(data))
      await useListsCacheStore.getState().setCustomers(userKey, companyId, data)
    } catch (err) {
      setError(getApiErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let active = true
    void hydrateListsCache(userKey).then(() => {
      if (!active) return
      const cached = useListsCacheStore.getState().getCustomers(userKey, companyId)
      if (cached) {
        setRows(applyFilter(cached))
        setLoading(false)
      }
    })
    return () => {
      active = false
    }
  }, [userKey, companyId, fil])

  useEffect(() => {
    void load()
  }, [token, companyId, fil, userKey])

  useEffect(() => {
    if (cachedCustomers) setRows(applyFilter(cachedCustomers))
  }, [cachedCustomers, fil])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return rows
    return rows.filter((row) => String(row.name || '').toLowerCase().includes(q))
  }, [rows, search])

  const summary = useMemo(() => {
    const totals: Record<string, number> = {}
    for (const row of rows) {
      for (const debt of row.customerDebts || []) {
        const amount = Number(debt.amount || 0)
        const currency = String(debt.currency || '').toLowerCase()
        if (!currency || amount <= 0) continue
        totals[currency] = (totals[currency] || 0) + amount
      }
    }
    return Object.entries(totals)
  }, [rows])

  const customerPublicId = (row: BusinessCustomerRow) => String(row.customer_id ?? row.id)

  return (
    <div className="dash-div party-page" dir="rtl">
      <div className="party-toolbar">
        <Link to={businessPath(companyId)} className="btn-secondary btn-sm">
          <i className="fa-solid fa-reply" /> {t('desktop.back')}
        </Link>
        <div className="party-filters">
          <button
            type="button"
            className={`party-chip${!isReceivables ? ' is-active' : ''}`}
            onClick={() => setSearchParams({})}
          >
            <i className="fa-solid fa-users" /> {t('desktop.filter_all')}
          </button>
          <button
            type="button"
            className={`party-chip party-chip--warn${isReceivables ? ' is-active' : ''}`}
            onClick={() => setSearchParams({ fil: 'receivables' })}
          >
            <i className="fa-solid fa-circle-exclamation" /> {t('desktop.receivables')}
          </button>
          <button
            type="button"
            className="btn-secondary btn-sm"
            disabled={loading}
            onClick={() => void reload()}
          >
            <i className={`fa-solid fa-rotate-left${loading ? ' fa-spin' : ''}`} /> {t('desktop.refresh')}
          </button>
        </div>
      </div>

      {canManage ? (
        <div className="mb-2">
          <button type="button" className="btn-primary" onClick={() => setCreateOpen(true)}>
            <i className="fa-solid fa-circle-plus" /> {t('desktop.add_customer')}
          </button>
        </div>
      ) : null}

      <SearchField
        value={search}
        onChange={setSearch}
        placeholder={t('desktop.search_by_name')}
      />

      <div className="party-summary">
        <div className="party-summary__head">
          <strong>{t('desktop.receivables_summary')}</strong>
          <span className="muted">{t('desktop.by_currency')}</span>
        </div>
        {summary.length === 0 ? (
          <p className="muted">{t('desktop.no_receivables_summary')}</p>
        ) : (
          <div className="party-summary__chips">
            {summary.map(([currency, amount]) => (
              <div key={currency} className="party-amount-chip party-amount-chip--danger">
                <i className="fa-solid fa-wallet text-danger" />
                <span className="muted">{localizeCurrency(currency, t)}</span>
                <strong className="text-danger">{formatMoney(amount)}</strong>
              </div>
            ))}
          </div>
        )}
      </div>

      {error ? <div className="alert-error">{error}</div> : null}

      {loading ? (
        <p className="muted">{t('desktop.loading')}</p>
      ) : rows.length === 0 ? (
        <div className="party-empty">{t('desktop.no_customers')}</div>
      ) : filtered.length === 0 ? (
        <div className="party-empty">{t('desktop.no_matching_customers')}</div>
      ) : (
        <div className="table-wrap party-table-wrap party-table-wrap--sticky-head">
          <table className="data-table party-customers-table">
            <thead>
              <tr>
                <th>{t('desktop.name')}</th>
                <th className="party-col-desktop">{t('desktop.company_name')}</th>
                <th>{t('desktop.customer_purchases')}</th>
                <th>{t('desktop.receivables')}</th>
                <th className="party-col-desktop">{t('desktop.phone')}</th>
                <th className="party-col-desktop">{t('desktop.email')}</th>
                <th>{t('desktop.action')}</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((row) => {
                const id = customerPublicId(row)
                const debts = row.customerDebts || []
                const hasDebt = hasAnyDebt(debts)
                return (
                  <tr key={id}>
                    <td>
                      <Link
                        to={businessPath(companyId, `customers/${id}`)}
                        className="party-name-link"
                      >
                        {row.name || '—'}
                      </Link>
                      {hasDebt ? (
                        <>
                          <div className="party-receivable-hint party-col-desktop">
                            <i className="fa-solid fa-circle-exclamation" />
                            {t('desktop.has_receivable')}
                          </div>
                          <div className="party-col-mobile">
                            <button
                              type="button"
                              className="party-hint-toggle"
                              onClick={() =>
                                setExpandedReceivableId((cur) => (cur === id ? null : id))
                              }
                              aria-label={t('desktop.has_receivable')}
                            >
                              <i className="fa-solid fa-circle-exclamation" />
                            </button>
                            {expandedReceivableId === id ? (
                              <div className="party-receivable-hint">{t('desktop.has_receivable')}</div>
                            ) : null}
                          </div>
                        </>
                      ) : null}
                    </td>
                    <td className="party-col-desktop muted">{row.company_name || '—'}</td>
                    <td>
                      <Link
                        to={businessPath(companyId, `customers/${id}`)}
                        className="party-invoice-link"
                      >
                        {Number(row.invoices_count ?? 0)}
                      </Link>
                    </td>
                    <td>
                      <DebtChips debts={debts} t={t} />
                    </td>
                    <td className="party-col-desktop muted">{row.phone || '—'}</td>
                    <td className="party-col-desktop muted">{row.email || '—'}</td>
                    <td>
                      <div className="party-row-actions party-col-desktop">
                        {canManage ? (
                          <Link
                            to={businessPath(companyId, `customers/${id}/setup`)}
                            className="btn-success btn-sm"
                          >
                            <i className="fa-regular fa-pen-to-square" /> {t('desktop.edit')}
                          </Link>
                        ) : null}
                        <Link
                          to={businessPath(companyId, `customers/${id}`)}
                          className="btn-info btn-sm"
                        >
                          <i className="fa-solid fa-eye" /> {t('desktop.view')}
                        </Link>
                      </div>
                      <div className="party-col-mobile">
                        <button
                          type="button"
                          className="btn-secondary btn-sm"
                          onClick={() => setSelectedCustomer(row)}
                        >
                          <i className="fa-solid fa-ellipsis" /> {t('desktop.more')}
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          <div className="party-table-footer">
            <div>
              {t('desktop.total_count')}: <b>{filtered.length}</b>
            </div>
            <div>{t('desktop.tip_receivables')}</div>
          </div>
        </div>
      )}

      <Modal
        open={!!selectedCustomer}
        onClose={() => setSelectedCustomer(null)}
        title={selectedCustomer?.name || t('desktop.customers')}
      >
        {selectedCustomer ? (
          <div className="party-more-modal" dir="rtl">
            <div className="muted mb-2">{selectedCustomer.company_name || '—'}</div>
            {selectedCustomer.customerDebts?.length ? (
              <div className="party-more-debts mb-3">
                <div className="muted mb-1">{t('desktop.receivables')}</div>
                <DebtChips debts={selectedCustomer.customerDebts} t={t} />
              </div>
            ) : null}
            <div className="party-more-facts mb-3">
              <div className="party-more-fact">
                <span>
                  <i className="fa-solid fa-building" /> {t('desktop.company_name')}
                </span>
                <strong>{selectedCustomer.company_name || '—'}</strong>
              </div>
              <div className="party-more-fact">
                <span>
                  <i className="fa-solid fa-phone" /> {t('desktop.phone')}
                </span>
                <strong>{selectedCustomer.phone || '—'}</strong>
              </div>
              <div className="party-more-fact">
                <span>
                  <i className="fa-solid fa-envelope" /> {t('desktop.email')}
                </span>
                <strong>{selectedCustomer.email || '—'}</strong>
              </div>
            </div>
            <div className="party-more-actions">
              {canManage ? (
                <Link
                  to={businessPath(
                    companyId,
                    `customers/${customerPublicId(selectedCustomer)}/setup`,
                  )}
                  className="btn-success"
                  onClick={() => setSelectedCustomer(null)}
                >
                  <i className="fa-regular fa-pen-to-square" /> {t('desktop.edit')}
                </Link>
              ) : null}
              <Link
                to={businessPath(companyId, `customers/${customerPublicId(selectedCustomer)}`)}
                className="btn-info"
                onClick={() => setSelectedCustomer(null)}
              >
                <i className="fa-solid fa-eye" /> {t('desktop.view')}
              </Link>
            </div>
          </div>
        ) : null}
      </Modal>

      <CreateCustomerModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onSubmit={async (payload) => {
          if (!token) return
          const created = await createBusinessCustomer(token, companyId, payload)
          setCreateOpen(false)
          void refreshCustomers(token, userKey, companyId)
          navigate(
            businessPath(companyId, `customers/${created.customer_id ?? created.id}/setup`),
          )
        }}
      />
    </div>
  )
}

function CreateCustomerModal({
  open,
  onClose,
  onSubmit,
}: {
  open: boolean
  onClose: () => void
  onSubmit: (payload: {
    name: string
    company_name?: string
    phone?: string
    email?: string
    address?: string
    personality: 'human' | 'company'
  }) => Promise<void>
}) {
  const { t } = useTranslation()
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [address, setAddress] = useState('')
  const [personality, setPersonality] = useState<'human' | 'company'>('human')

  useEffect(() => {
    if (!open) {
      setError(null)
      setName('')
      setCompanyName('')
      setPhone('')
      setEmail('')
      setAddress('')
      setPersonality('human')
    }
  }, [open])

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    setProcessing(true)
    setError(null)
    try {
      await onSubmit({
        name,
        company_name: companyName || undefined,
        phone: phone || undefined,
        email: email || undefined,
        address: address || undefined,
        personality,
      })
    } catch (err) {
      setError(getApiErrorMessage(err))
    } finally {
      setProcessing(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={t('desktop.add_customer')} wide>
      <form onSubmit={(e) => void submit(e)} className="form-grid">
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
          <Select
            value={personality}
            onChange={(e) => setPersonality(e.target.value as 'human' | 'company')}
          >
            <option value="human">{t('desktop.personality_human')}</option>
            <option value="company">{t('desktop.personality_company')}</option>
          </Select>
        </label>
        <div className="form-actions">
          <button type="button" className="btn-secondary" onClick={onClose}>
            {t('desktop.close')}
          </button>
          <button type="submit" className="btn-primary" disabled={processing || !name.trim()}>
            {processing ? t('desktop.processing') : t('desktop.save')}
          </button>
        </div>
      </form>
    </Modal>
  )
}
