import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'

import { JalaliDatePicker } from '@/components/inputs/JalaliDatePicker'
import { AddExpenseModal } from '@/pages/accounts/AddExpenseModal'
import { CurrencyExchangeModal } from '@/pages/accounts/CurrencyExchangeModal'
import { useRegisterPageRefresh } from '@/hooks/useRegisterPageRefresh'
import { CounterpartyFlowModal } from '@/pages/accounts/CounterpartyFlowModal'
import { getApiErrorMessage } from '@/lib/auth'
import { formatJalaliSlash, todayLocalYmd } from '@/lib/datetime'
import { INCOME_CATEGORIES, personalTxTitle } from '@/lib/incomeCategories'
import { useUserCacheKey } from '@/hooks/useUserCacheKey'
import { localizeCurrency } from '@/lib/currency'
import {
  accountDisplayName,
  createUserAccounts,
  storeUserAccountDeposit,
  expenseAccountLabel,
  fetchAccountTemplates,
  templateDisplayName,
  type AccountTemplateRow,
  type ExpenseAccountRow,
  type UserAccountDeposit,
  type UserAccountRow,
} from '@/lib/user'
import { Modal } from '@/components/ui/Modal'
import { showSuccessToast } from '@/components/ui/SuccessToast'
import { useAuthStore } from '@/store/useAuthStore'
import { useAppCacheStore } from '@/store/useAppCacheStore'
import { useListsCacheStore } from '@/store/useListsCacheStore'
import { useLocaleStore } from '@/store/useLocaleStore'

export function DashboardPersonalAccounts() {
  const { t } = useTranslation()
  const locale = useLocaleStore((s) => s.language)
  const userKey = useUserCacheKey()
  const token = useAuthStore((s) => s.token)
  const ensurePersonalAccounts = useAppCacheStore((s) => s.ensurePersonalAccounts)
  const ensureExpenseAccounts = useAppCacheStore((s) => s.ensureExpenseAccounts)
  const ensureCounterparties = useListsCacheStore((s) => s.ensureCounterparties)
  const cachedPersonal = useAppCacheStore((s) => s.getPersonalAccounts(userKey))
  const cachedExpenseAccounts = useAppCacheStore((s) => s.getExpenseAccounts(userKey))
  const personalActiveCached = useAppCacheStore((s) => s.isPersonalAccountsActive(userKey))

  const [accounts, setAccounts] = useState<UserAccountRow[]>(cachedPersonal?.accounts ?? [])
  const [deposits, setDeposits] = useState<UserAccountDeposit[]>(cachedPersonal?.deposits ?? [])
  const [expenseAccounts, setExpenseAccounts] = useState<ExpenseAccountRow[]>(
    cachedExpenseAccounts ?? [],
  )
  const [loading, setLoading] = useState(cachedPersonal == null)
  const [refreshing, setRefreshing] = useState(false)
  const [expenseOpen, setExpenseOpen] = useState(false)
  const [fxOpen, setFxOpen] = useState(false)
  const [cpFlow, setCpFlow] = useState<'credit' | 'debit' | null>(null)
  const [templateOpen, setTemplateOpen] = useState(false)
  const [templates, setTemplates] = useState<AccountTemplateRow[]>([])
  const [templatesLoading, setTemplatesLoading] = useState(false)
  const [selectedTemplateIds, setSelectedTemplateIds] = useState<number[]>([])
  const [creating, setCreating] = useState(false)
  const [createError, setCreateError] = useState('')
  const [txOpen, setTxOpen] = useState(false)
  const [txAccountId, setTxAccountId] = useState('')
  const [txAmount, setTxAmount] = useState('')
  const [txCategory, setTxCategory] = useState<string>(INCOME_CATEGORIES[0])
  const [txDate, setTxDate] = useState(todayLocalYmd())
  const [txNote, setTxNote] = useState('')
  const [txError, setTxError] = useState<string | null>(null)
  const [txBusy, setTxBusy] = useState(false)

  const visibleAccounts = accounts

  const isActive =
    personalActiveCached === true ||
    cachedPersonal?.active === true ||
    visibleAccounts.length > 0 ||
    accounts.length > 0

  const expenseMap = useMemo(() => {
    const map: Record<string, string> = {}
    expenseAccounts.forEach((item) => {
      const label = expenseAccountLabel(item, locale)
      map[String(item.id)] = label
      if (item.code) map[String(item.code)] = label
    })
    return map
  }, [expenseAccounts, locale])

  const load = useCallback(
    async (force = false) => {
      const liveToken = useAuthStore.getState().token
      if (!liveToken) return
      if (force) setRefreshing(true)
      else if (!cachedPersonal) setLoading(true)
      try {
        const [personal, sections] = await Promise.all([
          ensurePersonalAccounts(liveToken, userKey, { force }),
          ensureExpenseAccounts(liveToken, userKey, { force }),
          force ? ensureCounterparties(liveToken, userKey, { force: true }) : Promise.resolve(null),
        ])
        // Logout may have cleared the session while requests were in flight.
        if (!useAuthStore.getState().token) return
        if (personal) {
          setAccounts(personal.accounts)
          setDeposits(personal.deposits)
        }
        if (sections?.length) setExpenseAccounts(sections)
      } catch {
        // keep local snapshot
      } finally {
        setLoading(false)
        setRefreshing(false)
      }
    },
    [userKey, cachedPersonal, ensurePersonalAccounts, ensureExpenseAccounts, ensureCounterparties],
  )

  useEffect(() => {
    if (cachedPersonal) {
      setAccounts(cachedPersonal.accounts)
      setDeposits(cachedPersonal.deposits)
      setLoading(false)
    }
  }, [cachedPersonal])

  const refreshPage = useCallback(() => {
    void load(true)
  }, [load])
  useRegisterPageRefresh(refreshPage, refreshing)

  useEffect(() => {
    if (!token) return
    void load(false)
  }, [load, token])

  const openTemplateModal = async () => {
    if (!token) return
    setTemplateOpen(true)
    setCreateError('')
    if (templates.length > 0) {
      setSelectedTemplateIds(templates.map((item) => item.id))
      return
    }
    setTemplatesLoading(true)
    try {
      const incoming = await fetchAccountTemplates(token)
      setTemplates(incoming)
      setSelectedTemplateIds(incoming.map((item) => item.id))
    } catch (err) {
      setCreateError(getApiErrorMessage(err))
    } finally {
      setTemplatesLoading(false)
    }
  }

  const handleCreate = async () => {
    if (!token || selectedTemplateIds.length === 0) {
      setCreateError(t('desktop.select_at_least_one_template'))
      return
    }
    setCreating(true)
    setCreateError('')
    try {
      await createUserAccounts(token, selectedTemplateIds)
      setTemplateOpen(false)
      await load(true)
    } catch (err) {
      setCreateError(getApiErrorMessage(err))
    } finally {
      setCreating(false)
    }
  }

  const openIncomeModal = () => {
    setTxAmount('')
    setTxNote('')
    setTxCategory(INCOME_CATEGORIES[0])
    setTxDate(todayLocalYmd())
    setTxError(null)
    setTxAccountId(visibleAccounts[0] ? String(visibleAccounts[0].id) : '')
    setTxOpen(true)
  }

  const submitCash = async (event: FormEvent) => {
    event.preventDefault()
    if (!token || !txAccountId) return
    setTxBusy(true)
    setTxError(null)
    try {
      await storeUserAccountDeposit(token, {
        amount: Number(txAmount),
        description: txNote.trim() || undefined,
        direction: 'credit',
        account_id: Number(txAccountId),
        income_category: txCategory,
        date: txDate || undefined,
      })
      setTxOpen(false)
      showSuccessToast(t('desktop.saved_success'))
      await load(true)
    } catch (err) {
      setTxError(getApiErrorMessage(err))
    } finally {
      setTxBusy(false)
    }
  }

  const lead = visibleAccounts[0]
  const rest = visibleAccounts.slice(1)

  return (
    <section className="hy-fin">
      {loading && !cachedPersonal ? (
        <p className="muted list-comps__status">{t('desktop.loading')}</p>
      ) : !isActive ? (
        <div className="hy-empty">
          <h6>{t('desktop.user_accounts_not_activated')}</h6>
          <p className="muted">{t('desktop.create_user_account_guide')}</p>
          <button type="button" className="btn-primary" onClick={() => void openTemplateModal()}>
            {t('desktop.create_user_accounts')}
          </button>
        </div>
      ) : (
        <>
          <div className="hy-fin__main">
            <div className="hy-balance">
              {lead ? (
                <>
                  <div className="hy-balance__top">
                    <span>
                      {accountDisplayName(lead, locale)}{' '}
                      <bdi>({localizeCurrency(lead.currency || 'AFN', t)})</bdi>
                    </span>
                  </div>
                  <p className="hy-balance__amount">
                    <bdi>{Number(lead.current_balance ?? 0).toLocaleString('en-US')}</bdi>
                    <small>{localizeCurrency(lead.currency || 'AFN', t)}</small>
                  </p>
                </>
              ) : null}
              {rest.length > 0 ? (
                <div className="hy-balance__more">
                  {rest.map((acc) => (
                    <div key={acc.id}>
                      <span>{accountDisplayName(acc, locale)}</span>
                      <strong>
                        <bdi>{Number(acc.current_balance ?? 0).toLocaleString('en-US')}</bdi>{' '}
                        {localizeCurrency(acc.currency || 'AFN', t)}
                      </strong>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>

            <div className="hy-actions">
              <button
                type="button"
                className="hy-action hy-action--in"
                onClick={openIncomeModal}
                disabled={visibleAccounts.length === 0}
              >
                <span className="hy-action__icon">
                  <i className="fa-solid fa-circle-plus" />
                </span>
                {t('desktop.dash_inject')}
              </button>
              <button type="button" className="hy-action hy-action--in" onClick={() => setCpFlow('credit')}>
                <span className="hy-action__icon">
                  <i className="fa-solid fa-arrow-down" />
                </span>
                {t('desktop.cp_incoming')}
              </button>
              <button type="button" className="hy-action hy-action--out" onClick={() => setCpFlow('debit')}>
                <span className="hy-action__icon">
                  <i className="fa-solid fa-arrow-up" />
                </span>
                {t('desktop.cp_outgoing')}
              </button>
              <button
                type="button"
                className="hy-action hy-action--spend"
                onClick={() => setExpenseOpen(true)}
                disabled={expenseAccounts.length === 0}
              >
                <span className="hy-action__icon">
                  <i className="fa-solid fa-cart-shopping" />
                </span>
                {t('desktop.add_expense')}
              </button>
              <button
                type="button"
                className="hy-action hy-action--fx"
                onClick={() => setFxOpen(true)}
                disabled={visibleAccounts.length < 2}
              >
                <span className="hy-action__icon">
                  <i className="fa-solid fa-right-left" />
                </span>
                {t('desktop.hy_fx_title')}
              </button>
            </div>
          </div>

          <div className="hy-tx">
            <div className="hy-tx__head">
              <h5>{t('desktop.hy_tx_list_title')}</h5>
            </div>
            {deposits.length > 0 ? (
              <div className="hy-tx__list">
                {deposits.slice(0, 5).map((deposit) => {
                  const isCredit = deposit.type === 'credit'
                  const title = personalTxTitle(deposit, t, expenseMap)
                  return (
                    <div key={String(deposit.transaction_id ?? deposit.id)} className="hy-tx__row">
                      <span className={`hy-tx__icon${isCredit ? ' is-in' : ' is-out'}`}>
                        <i className={`fa-solid ${isCredit ? 'fa-arrow-down' : 'fa-arrow-up'}`} />
                      </span>
                      <span className="hy-tx__body">
                        <strong>{title}</strong>
                        <small>{formatJalaliSlash(deposit.date, locale)}</small>
                      </span>
                      <span className={`hy-tx__amount${isCredit ? ' is-in' : ' is-out'}`}>
                        <bdi>{Number(deposit.amount || 0).toLocaleString('en-US')}</bdi>{' '}
                        {localizeCurrency(deposit.currency || 'AFN', t)}
                      </span>
                    </div>
                  )
                })}
              </div>
            ) : (
              <p className="muted hy-tx__empty">{t('desktop.no_record_found')}</p>
            )}
          </div>
        </>
      )}

      <Modal open={templateOpen} onClose={() => !creating && setTemplateOpen(false)} title={t('desktop.create_user_accounts')} wide>
        {templatesLoading ? (
          <p className="muted">{t('desktop.loading')}</p>
        ) : (
          <div className="ua-template-list">
            {templates.map((template) => {
              const checked = selectedTemplateIds.includes(template.id)
              return (
                <label key={template.id} className="ua-template-item">
                  <span className="ua-template-item__left">
                    <input
                      type="checkbox"
                      checked={checked}
                      disabled={creating}
                      onChange={() =>
                        setSelectedTemplateIds((prev) =>
                          prev.includes(template.id)
                            ? prev.filter((id) => id !== template.id)
                            : [...prev, template.id],
                        )
                      }
                    />
                    <span>{templateDisplayName(template, locale)}</span>
                  </span>
                  <span className="muted">{localizeCurrency(template.currency, t)}</span>
                </label>
              )
            })}
          </div>
        )}
        {createError ? <div className="alert-error" style={{ marginTop: 10 }}>{createError}</div> : null}
        <div className="form-actions" style={{ marginTop: 14 }}>
          <button type="button" className="btn-secondary" disabled={creating} onClick={() => setTemplateOpen(false)}>
            {t('desktop.cancel')}
          </button>
          <button type="button" className="btn-primary" disabled={creating} onClick={() => void handleCreate()}>
            {creating ? t('desktop.processing') : t('desktop.save')}
          </button>
        </div>
      </Modal>

      <Modal
        open={txOpen}
        onClose={() => !txBusy && setTxOpen(false)}
        title={t('desktop.dash_inject')}
      >
        <form className="companies-create-form" onSubmit={(event) => void submitCash(event)}>
          {txError ? <div className="alert-error">{txError}</div> : null}
          <div className="form-field">
            <label>{t('desktop.income_category')}</label>
            <select value={txCategory} onChange={(e) => setTxCategory(e.target.value)} required>
              {INCOME_CATEGORIES.map((code) => (
                <option key={code} value={code}>
                  {t(`desktop.income_cat_${code}`)}
                </option>
              ))}
            </select>
          </div>
          <div className="form-field">
            <label>{t('desktop.account')}</label>
            <select value={txAccountId} onChange={(e) => setTxAccountId(e.target.value)} required>
              {visibleAccounts.map((item) => (
                <option key={item.id} value={item.id}>
                  {accountDisplayName(item, locale)} ({localizeCurrency(item.currency || 'AFN', t)})
                </option>
              ))}
            </select>
          </div>
          <div className="form-field">
            <label>{t('desktop.amount')}</label>
            <input
              type="number"
              min="1"
              step="any"
              value={txAmount}
              onChange={(e) => setTxAmount(e.target.value)}
              required
            />
          </div>
          <div className="form-field">
            <label>{t('desktop.date')}</label>
            <JalaliDatePicker value={txDate} onChange={setTxDate} />
          </div>
          <div className="form-field">
            <label>{t('desktop.description')}</label>
            <input value={txNote} onChange={(e) => setTxNote(e.target.value)} />
          </div>
          <div className="form-actions">
            <button type="button" className="btn-secondary" onClick={() => setTxOpen(false)} disabled={txBusy}>
              {t('desktop.cancel')}
            </button>
            <button type="submit" className="btn-primary" disabled={txBusy}>
              {txBusy ? t('desktop.processing') : t('desktop.save')}
            </button>
          </div>
        </form>
      </Modal>

      <AddExpenseModal
        open={expenseOpen}
        onClose={() => setExpenseOpen(false)}
        onSaved={() => void load(true)}
        expenseAccounts={expenseAccounts}
        userAccounts={visibleAccounts}
      />

      {token ? (
        <CurrencyExchangeModal
          open={fxOpen}
          token={token}
          accounts={visibleAccounts}
          locale={locale}
          onClose={() => setFxOpen(false)}
          onDone={() => void load(true)}
        />
      ) : null}

      {token ? (
        <CounterpartyFlowModal
          open={cpFlow !== null}
          direction={cpFlow || 'credit'}
          token={token}
          accounts={visibleAccounts}
          locale={locale}
          onClose={() => setCpFlow(null)}
          onDone={() => void load(true)}
        />
      ) : null}
    </section>
  )
}
