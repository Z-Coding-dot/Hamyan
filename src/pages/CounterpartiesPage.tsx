import { FormEvent, useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useShallow } from 'zustand/react/shallow'

import { CounterpartyBalanceTotals } from '@/components/CounterpartyBalanceTotals'
import { SearchField } from '@/components/inputs/SearchField'
import { useRegisterPageRefresh } from '@/hooks/useRegisterPageRefresh'
import { Modal } from '@/components/ui/Modal'
import { showSuccessToast } from '@/components/ui/SuccessToast'
import { useUserCacheKey } from '@/hooks/useUserCacheKey'
import { getApiErrorMessage } from '@/lib/auth'
import { localizeCurrency } from '@/lib/currency'
import {
  createCounterparty,
  fetchAccountsData,
  fetchCounterparties,
  updateCounterparty,
  type CounterpartyBalanceLine,
  type CounterpartyFormPayload,
  type CounterpartyRow,
  type UserAccountRow,
} from '@/lib/user'
import { CounterpartyFlowModal } from '@/pages/accounts/CounterpartyFlowModal'
import { useAuthStore } from '@/store/useAuthStore'
import { hydrateListsCache, useListsCacheStore } from '@/store/useListsCacheStore'
import { useLocaleStore } from '@/store/useLocaleStore'

function lineBalanceType(line: CounterpartyBalanceLine): 'talab' | 'baqi' | 'settled' {
  const debit = Number(line.debit_sum || 0)
  const credit = Number(line.credit_sum || 0)
  if (line.debit_sum != null || line.credit_sum != null) {
    const net = debit - credit
    if (net > 0) return 'talab'
    if (net < 0) return 'baqi'
    return 'settled'
  }
  if (line.balance_type === 'talab' || line.balance_type === 'baqi') return line.balance_type
  return 'settled'
}

function BalanceLines({ lines, t }: { lines?: CounterpartyBalanceLine[]; t: (k: string) => string }) {
  if (!Array.isArray(lines) || lines.length === 0) {
    return <span className="cp-settled">{t('desktop.settled')}</span>
  }

  return (
    <>
      {lines.map((line, idx) => {
        const kind = lineBalanceType(line)
        const amount = Math.abs(
          line.debit_sum != null || line.credit_sum != null
            ? Number(line.debit_sum || 0) - Number(line.credit_sum || 0)
            : Number(line.net_balance || 0),
        )
        return (
          <div key={`${line.user_account_id}-${line.currency}-${idx}`} className="cp-balance-line">
            <div className="cp-balance-line__account">{line.account_name || '—'}</div>
            {kind === 'talab' ? (
              <span className="cp-talab">
                {t('desktop.talab')}: <bdi>{amount.toLocaleString('en-US')}</bdi>{' '}
                {localizeCurrency(line.currency || 'AFN', t)}
              </span>
            ) : null}
            {kind === 'baqi' ? (
              <span className="cp-baqi">
                {t('desktop.baqi')}: <bdi>{amount.toLocaleString('en-US')}</bdi>{' '}
                {localizeCurrency(line.currency || 'AFN', t)}
              </span>
            ) : null}
            {kind === 'settled' ? (
              <span className="cp-settled">
                {t('desktop.settled')} ({localizeCurrency(line.currency || 'AFN', t)})
              </span>
            ) : null}
          </div>
        )
      })}
    </>
  )
}

const emptyForm: CounterpartyFormPayload = {
  name: '',
  company_name: '',
  phone: '',
  email: '',
  address: '',
  personality: 'human',
}

export function CounterpartiesPage() {
  const { t } = useTranslation()
  const locale = useLocaleStore((s) => s.language)
  const { token } = useAuthStore(useShallow((state) => ({ token: state.token })))
  const userKey = useUserCacheKey()
  const ensureCounterparties = useListsCacheStore((s) => s.ensureCounterparties)
  const refreshCounterparties = useListsCacheStore((s) => s.refreshCounterparties)
  const cachedCounterparties = useListsCacheStore((s) => s.getCounterparties(userKey))

  const [items, setItems] = useState<CounterpartyRow[]>(() => cachedCounterparties?.counterparties ?? [])
  const [accounts, setAccounts] = useState<UserAccountRow[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(!cachedCounterparties)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [premiumActive, setPremiumActive] = useState(() => Boolean(cachedCounterparties?.premium_active))
  const [totalCount, setTotalCount] = useState(() => Number(cachedCounterparties?.total_count ?? 0))
  const [canAdd, setCanAdd] = useState(() =>
    cachedCounterparties ? Boolean(cachedCounterparties.can_add_counterparty) : true,
  )
  const [limitNotice, setLimitNotice] = useState(() => Boolean(cachedCounterparties?.limit_notice))

  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<CounterpartyRow | null>(null)
  const [form, setForm] = useState<CounterpartyFormPayload>(emptyForm)
  const [formError, setFormError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [cpFlow, setCpFlow] = useState<'credit' | 'debit' | null>(null)

  const applyData = (data: {
    counterparties: CounterpartyRow[]
    premium_active: boolean
    total_count: number
    can_add_counterparty: boolean
    limit_notice: boolean
  }) => {
    setItems(data.counterparties ?? [])
    setPremiumActive(Boolean(data.premium_active))
    setTotalCount(Number(data.total_count ?? 0))
    setCanAdd(Boolean(data.can_add_counterparty))
    setLimitNotice(Boolean(data.limit_notice))
  }

  const visibleAccounts = accounts

  const load = useCallback(
    async (query = search, force = false) => {
      if (!token) return
      const hasCache = Boolean(useListsCacheStore.getState().getCounterparties(userKey))
      if (query.trim()) {
        setLoading(true)
        setError(null)
        try {
          const data = await fetchCounterparties(token, query)
          applyData(data)
        } catch (err) {
          setError(getApiErrorMessage(err))
        } finally {
          setLoading(false)
        }
        return
      }

      if (force) setRefreshing(true)
      else if (!hasCache) setLoading(true)
      setError(null)
      try {
        const data = await ensureCounterparties(token, userKey, { force })
        if (data) applyData(data)
      } catch (err) {
        setError(getApiErrorMessage(err))
      } finally {
        setLoading(false)
        setRefreshing(false)
      }
    },
    [token, userKey, search, ensureCounterparties],
  )

  const refreshPage = useCallback(() => {
    void load(search, true)
  }, [load, search])
  useRegisterPageRefresh(refreshPage, refreshing)

  // Keep list + dues cards in sync after a forced refresh writes the lists cache.
  useEffect(() => {
    if (!cachedCounterparties || search.trim()) return
    applyData(cachedCounterparties)
  }, [cachedCounterparties, search])

  useEffect(() => {
    let active = true
    void hydrateListsCache(userKey).then(() => {
      if (!active) return
      const cached = useListsCacheStore.getState().getCounterparties(userKey)
      if (cached) {
        applyData(cached)
        setLoading(false)
      }
    })
    return () => {
      active = false
    }
  }, [userKey])

  useEffect(() => {
    void load('')
  }, [token, userKey])

  useEffect(() => {
    if (cachedCounterparties && !search.trim()) applyData(cachedCounterparties)
  }, [cachedCounterparties])

  useEffect(() => {
    if (!token) return
    void fetchAccountsData(token)
      .then((data) => setAccounts(data.accounts ?? []))
      .catch(() => setAccounts([]))
  }, [token])

  const openCreate = () => {
    setEditing(null)
    setForm(emptyForm)
    setFormError(null)
    setModalOpen(true)
  }

  const openEdit = (cp: CounterpartyRow) => {
    setEditing(cp)
    setForm({
      name: cp.name || '',
      company_name: cp.company_name || '',
      phone: cp.phone || '',
      email: cp.email || '',
      address: cp.address || '',
      personality: (cp.personality === 'company' ? 'company' : 'human') as 'human' | 'company',
    })
    setFormError(null)
    setModalOpen(true)
  }

  const onSearch = (event: FormEvent) => {
    event.preventDefault()
    void load(search)
  }

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault()
    if (!token) return
    setSaving(true)
    setFormError(null)
    try {
      if (editing) {
        await updateCounterparty(token, editing.customer_id, form)
      } else {
        await createCounterparty(token, form)
      }
      setModalOpen(false)
      showSuccessToast(t('desktop.saved_success'))
      if (search.trim()) {
        await load(search, true)
      } else {
        void refreshCounterparties(token, userKey).then((data) => {
          if (data) applyData(data)
        })
      }
    } catch (err) {
      setFormError(getApiErrorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="cp-page hy-ledger hy-counterparties">
      <header className="hy-ledger__head">
        <div>
          <span className="hy-ledger__eyebrow">{t('desktop.hy_cp_eyebrow')}</span>
          <h2>{t('desktop.nav_counterparties')}</h2>
          <p>{t('desktop.page_counterparties_desc')}</p>
        </div>
        <button type="button" className="btn-primary hy-ledger__add" onClick={openCreate} disabled={!canAdd}>
          <i className="fa-solid fa-plus" aria-hidden="true" />{t('desktop.add_counterparty')}
        </button>
      </header>

      <CounterpartyBalanceTotals />

      {error ? <div className="alert-error">{error}</div> : null}

      {!premiumActive && limitNotice ? (
        <div className="cp-alert cp-alert--amber">{t('desktop.counterparty_free_limit_note')}</div>
      ) : null}

      <div className="hy-ledger__workspace">
      <div className="hy-ledger__toolbar">
      <form className="cp-search" role="search" onSubmit={onSearch}>
        <SearchField
          value={search}
          onChange={setSearch}
          placeholder={t('desktop.hy_cp_search_hint')}
        />
        <button type="submit" className="btn-secondary">
          <i className="fa-solid fa-magnifying-glass" aria-hidden="true" /><span>{t('desktop.search')}</span>
        </button>
      </form>

      {!canAdd ? (
        <p className="cp-alert cp-alert--amber">{t('desktop.counterparty_add_locked_note')}</p>
      ) : null}
      {premiumActive ? (
        <p className="cp-alert cp-alert--emerald">{t('desktop.premium_counterparty_add_open')}</p>
      ) : null}

      <div className="cp-actions">
        <button
          type="button"
          className="hy-ledger__flow is-in"
          onClick={() => setCpFlow('credit')}
          disabled={visibleAccounts.length === 0}
        >
          <i className="fa-solid fa-arrow-down" aria-hidden="true" />
          {t('desktop.cp_incoming')}
        </button>
        <button
          type="button"
          className="hy-ledger__flow is-out"
          onClick={() => setCpFlow('debit')}
          disabled={visibleAccounts.length === 0}
        >
          <i className="fa-solid fa-arrow-up" aria-hidden="true" />
          {t('desktop.cp_outgoing')}
        </button>
      </div>
      </div>

      <div className="hy-ledger__list-head"><h3>{t('desktop.nav_counterparties')}</h3><span className="cp-count">{t('desktop.counterparty_count_label')}: <bdi>{items.length} / {totalCount}</bdi></span></div>

      <div className="cp-table-wrap">
        {loading ? (
          <div className="hy-ledger__empty" role="status"><i className="fa-solid fa-circle-notch fa-spin" aria-hidden="true" /><p>{t('desktop.loading')}</p></div>
        ) : items.length === 0 ? (
          <div className="hy-ledger__empty"><i className="fa-solid fa-user-group" aria-hidden="true" /><p>{t('desktop.no_counterparties')}</p></div>
        ) : (
          <>
          <table className="cp-table">
            <thead>
              <tr>
                <th>{t('desktop.name')}</th>
                <th>{t('desktop.company_name')}</th>
                <th>{t('desktop.balance_or_talab')}</th>
                <th>{t('desktop.phone')}</th>
                <th>{t('desktop.email')}</th>
                <th>{t('desktop.action')}</th>
              </tr>
            </thead>
            <tbody>
              {items.map((cp) => (
                <tr key={String(cp.customer_id)}>
                  <td>
                    <Link className="cp-name-link" to={`/counterparties/${cp.customer_id}`}>
                      <span className="hy-party-avatar" aria-hidden="true">{Array.from(cp.name || '—')[0]}</span><span>{cp.name || '—'}</span>
                    </Link>
                  </td>
                  <td>{cp.company_name || '—'}</td>
                  <td>
                    <BalanceLines lines={cp.balance_lines} t={t} />
                  </td>
                  <td dir="ltr">{cp.phone || '—'}</td>
                  <td dir="ltr">{cp.email || '—'}</td>
                  <td>
                    <div className="cp-row-actions">
                      <button type="button" className="btn-secondary btn-sm" onClick={() => openEdit(cp)}>
                        <i className="fa-regular fa-pen-to-square" /> {t('desktop.edit')}
                      </button>
                      <Link className="cp-icon-btn" to={`/counterparties/${cp.customer_id}`} title={t('desktop.view')} aria-label={`${t('desktop.view')}: ${cp.name}`}>
                        <i className="fa-solid fa-arrow-up-right-from-square" aria-hidden="true" />
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="cp-cards">
            {items.map((cp) => (
              <article
                key={String(cp.customer_id)}
                className="cp-card"
              >
                <div className="cp-card__top">
                  <Link className="cp-name-link" to={`/counterparties/${cp.customer_id}`}><span className="hy-party-avatar" aria-hidden="true">{Array.from(cp.name || '—')[0]}</span><span>{cp.name || '—'}</span></Link>
                  <button
                    type="button"
                    className="cp-icon-btn"
                    onClick={(event) => {
                      event.stopPropagation()
                      openEdit(cp)
                    }}
                    title={t('desktop.edit')}
                    aria-label={`${t('desktop.edit')}: ${cp.name}`}
                  >
                    <i className="fa-regular fa-pen-to-square" />
                  </button>
                </div>
                {cp.company_name ? <p className="cp-card__company">{cp.company_name}</p> : null}
                <div className="cp-card__balance">
                  <BalanceLines lines={cp.balance_lines} t={t} />
                </div>
                <div className="cp-card__meta">
                  {cp.phone ? <span dir="ltr">{cp.phone}</span> : null}
                  {cp.email ? <span dir="ltr">{cp.email}</span> : null}
                </div>
              </article>
            ))}
          </div>
          </>
        )}
      </div>
      </div>

      <Modal
        open={modalOpen}
        onClose={() => !saving && setModalOpen(false)}
        title={editing ? t('desktop.edit_counterparty') : t('desktop.add_counterparty')}
        wide
        className="hy-party-dialog"
      >
        <form className="companies-create-form hy-party-form" onSubmit={(e) => void onSubmit(e)}>
          <div className="hy-party-form__intro"><span aria-hidden="true"><i className="fa-solid fa-user-plus" /></span><p>{t('desktop.hy_cp_form_desc')}</p></div>
          {formError ? <div className="alert-error">{formError}</div> : null}

          <fieldset className="hy-party-form__kind"><legend>{t('desktop.personality')}</legend>
            {(['human', 'company'] as const).map((kind) => <label key={kind} className={form.personality === kind ? 'is-selected' : ''}>
              <input type="radio" name="counterparty-kind" value={kind} checked={form.personality === kind} onChange={() => setForm((prev) => ({ ...prev, personality: kind }))} />
              <i className={`fa-solid ${kind === 'human' ? 'fa-user' : 'fa-building'}`} aria-hidden="true" /><span>{t(`desktop.personality_${kind}`)}</span>
              <i className="fa-solid fa-circle-check" aria-hidden="true" />
            </label>)}
          </fieldset>
          <div className="hy-party-form__grid">
          <div className="form-field">
            <label htmlFor="cp-name">{t('desktop.name')} <span className="hy-required" aria-hidden="true">*</span></label>
            <input
              id="cp-name"
              autoComplete="name"
              value={form.name}
              onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
              required
            />
          </div>
          <div className="form-field">
            <label htmlFor="cp-company">{t('desktop.company_name')}</label>
            <input
              id="cp-company"
              autoComplete="organization"
              value={form.company_name || ''}
              onChange={(e) => setForm((prev) => ({ ...prev, company_name: e.target.value }))}
            />
          </div>
          <div className="form-field">
            <label htmlFor="cp-phone">{t('desktop.phone')}</label>
            <input
              id="cp-phone"
              type="tel"
              autoComplete="tel"
              value={form.phone || ''}
              onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))}
              dir="ltr"
            />
          </div>
          <div className="form-field">
            <label htmlFor="cp-email">{t('desktop.email')}</label>
            <input
              id="cp-email"
              autoComplete="email"
              type="email"
              value={form.email || ''}
              onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
              dir="ltr"
            />
          </div>
          <div className="form-field hy-party-form__full">
            <label htmlFor="cp-address">{t('desktop.address')}</label>
            <input
              id="cp-address"
              autoComplete="street-address"
              value={form.address || ''}
              onChange={(e) => setForm((prev) => ({ ...prev, address: e.target.value }))}
            />
          </div>
          </div>

          <div className="form-actions">
            <button type="button" className="btn-secondary" onClick={() => setModalOpen(false)} disabled={saving}>
              {t('desktop.cancel')}
            </button>
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? t('desktop.processing') : t('desktop.save')}
            </button>
          </div>
        </form>
      </Modal>

      {token ? (
        <CounterpartyFlowModal
          open={cpFlow !== null}
          direction={cpFlow || 'credit'}
          token={token}
          accounts={visibleAccounts}
          locale={locale}
          onClose={() => setCpFlow(null)}
          onDone={() => {
            if (search.trim()) {
              void load(search, true)
            } else {
              void refreshCounterparties(token!, userKey).then((data) => {
                if (data) applyData(data)
              })
            }
          }}
        />
      ) : null}
    </div>
  )
}
