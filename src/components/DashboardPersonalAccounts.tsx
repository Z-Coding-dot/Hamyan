import { Select } from '@/components/inputs/SearchableSelect'
import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { AnimatePresence, m, useReducedMotion } from 'framer-motion'
import { useIsMobileSidebar } from '@/hooks/useMediaQuery'

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
  const isMobile = useIsMobileSidebar()
  const reduceMotion = useReducedMotion()
  const [activeAccountIndex, setActiveAccountIndex] = useState(0)
  const [swipeDirection, setSwipeDirection] = useState(1)
  const [balanceHidden, setBalanceHidden] = useState(false)
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

  const openIncomeModal = () => setTxOpen(true)


  const lead = visibleAccounts[0]
  const rest = visibleAccounts.slice(1)
  const currentIndex = Math.min(activeAccountIndex, Math.max(0, visibleAccounts.length - 1))
  const currentAccount = visibleAccounts[currentIndex]
  const switchAccount = (next: number) => {
    const clamped = Math.max(0, Math.min(visibleAccounts.length - 1, next))
    setSwipeDirection((clamped > currentIndex ? 1 : -1) * (locale === 'en' ? 1 : -1))
    setActiveAccountIndex(clamped)
  }
  const accountMoves = deposits.filter((row) => Number(row.user_account_id) === currentAccount?.id)
  const incoming = accountMoves.filter((row) => row.type === 'credit').reduce((sum, row) => sum + Number(row.amount || 0), 0)
  const outgoing = accountMoves.filter((row) => row.type === 'debit').reduce((sum, row) => sum + Number(row.amount || 0), 0)

  return (
    <section className="hy-fin">
      {loading && !cachedPersonal ? (
        <p className="muted list-comps__status">{t('desktop.loading')}</p>
      ) : !isActive ? (
        <div className="hy-empty">
          <span className="hy-empty__icon" aria-hidden="true"><i className="fa-solid fa-wallet" /></span>
          <h3>{t('desktop.user_accounts_not_activated')}</h3>
          <p className="muted">{t('desktop.create_user_account_guide')}</p>
          <button type="button" className="btn-primary" onClick={() => void openTemplateModal()}>
            <i className="fa-solid fa-plus" aria-hidden="true" />
            {t('desktop.create_user_accounts')}
          </button>
        </div>
      ) : (
        <>
          <div className="hy-fin__main">
            {isMobile && currentAccount && <section className="hy-wallet-carousel" aria-roledescription="carousel" aria-label={t('desktop.hy_mobile_accounts')}>
              <div className="hy-wallet-carousel__viewport" onKeyDown={(event) => {
                if (!['ArrowLeft', 'ArrowRight'].includes(event.key)) return
                event.preventDefault()
                switchAccount(currentIndex + ((event.key === 'ArrowRight') === (locale === 'en') ? 1 : -1))
              }}>
                <AnimatePresence initial={false} mode="popLayout" custom={swipeDirection}>
                  <m.article key={currentAccount.id} className="hy-wallet-card" data-currency={currentAccount.currency || 'AFN'} tabIndex={0} custom={swipeDirection}
                    variants={{ enter: (direction: number) => ({ opacity: 0, x: reduceMotion ? 0 : direction * 100 }), exit: (direction: number) => ({ opacity: 0, x: reduceMotion ? 0 : -direction * 100 }) }}
                    initial={reduceMotion ? false : 'enter'} animate={{ opacity: 1, x: 0 }} exit="exit"
                    transition={reduceMotion ? { duration: 0 } : { type: 'spring', stiffness: 340, damping: 34 }}
                    drag={visibleAccounts.length > 1 ? 'x' : false} dragConstraints={{ left: 0, right: 0 }} dragElastic={.3} dragSnapToOrigin
                    onDragEnd={(_, info) => { if (Math.abs(info.offset.x) > 45 || Math.abs(info.velocity.x) > 450) switchAccount(currentIndex + ((info.offset.x < 0) === (locale === 'en') ? 1 : -1)) }}
                    aria-label={t('desktop.hy_mobile_account_position', { current: currentIndex + 1, total: visibleAccounts.length })}>
                    <div className="hy-wallet-card__top"><span><i className="fa-solid fa-wallet" aria-hidden="true" />{accountDisplayName(currentAccount, locale)}</span><bdi className="hy-wallet-card__currency">{currentAccount.currency || 'AFN'}</bdi><button type="button" aria-label={t(balanceHidden ? 'desktop.hy_mobile_show_balance' : 'desktop.hy_mobile_hide_balance')} onClick={() => setBalanceHidden((value) => !value)}><i className={`fa-regular ${balanceHidden ? 'fa-eye-slash' : 'fa-eye'}`} aria-hidden="true" /></button></div>
                    <p className="hy-wallet-card__label">{t('desktop.hy_mobile_balance')}<i className="fa-solid fa-microchip hy-wallet-card__chip" aria-hidden="true" /></p>
                    <strong className="hy-wallet-card__amount"><bdi>{balanceHidden ? '••••••' : Number(currentAccount.current_balance ?? 0).toLocaleString('en-US')}</bdi><small>{localizeCurrency(currentAccount.currency || 'AFN', t)}</small></strong>
                    <div className="hy-wallet-card__stats"><div><span><i className="fa-solid fa-arrow-down" aria-hidden="true" />{t('desktop.total_incoming')}</span><bdi>{balanceHidden ? '••••' : incoming.toLocaleString('en-US')}</bdi></div><div><span><i className="fa-solid fa-arrow-up" aria-hidden="true" />{t('desktop.total_outgoing')}</span><bdi>{balanceHidden ? '••••' : outgoing.toLocaleString('en-US')}</bdi></div></div>
                  </m.article>
                </AnimatePresence>
              </div>
              {visibleAccounts.length > 1 && <><div className="hy-wallet-carousel__dots">{visibleAccounts.map((account, index) => <button key={account.id} type="button" aria-label={accountDisplayName(account, locale)} aria-current={index === currentIndex ? 'true' : undefined} onClick={() => switchAccount(index)}><span /></button>)}</div><p className="hy-wallet-carousel__hint">{t('desktop.hy_mobile_swipe_hint')}</p></>}
            </section>}
            {!isMobile && <div className="hy-balance">
              {lead ? (
                <>
                  <div className="hy-balance__top">
                    <i className="fa-solid fa-wallet" aria-hidden="true" />
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
            </div>}

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

          {isMobile && <div className="hy-mobile-activity">{(['credit', 'debit'] as const).map((direction) => {
            const recent = deposits.filter((row) => row.type === direction).slice(0, 3)
            return <section key={direction} className={`hy-mobile-activity__section is-${direction}`}><h3>{t(direction === 'credit' ? 'desktop.hy_mobile_recent_income' : 'desktop.hy_mobile_recent_expenses')}</h3>{recent.length ? recent.map((deposit) => <div key={String(deposit.transaction_id ?? deposit.id)} className="hy-tx__row"><span className={`hy-tx__icon ${direction === 'credit' ? 'is-in' : 'is-out'}`}><i className={`fa-solid ${direction === 'credit' ? 'fa-money-bill-transfer' : 'fa-receipt'}`} aria-hidden="true" /></span><span className="hy-tx__body"><strong>{personalTxTitle(deposit, t, expenseMap)}</strong><small>{formatJalaliSlash(deposit.date, locale)}</small></span><span className="hy-tx__amount"><bdi>{Number(deposit.amount || 0).toLocaleString('en-US')}</bdi><small>{localizeCurrency(deposit.currency || 'AFN', t)}</small></span></div>) : <p className="hy-mobile-activity__empty">{t('desktop.no_record_found')}</p>}</section>
          })}</div>}
          <div className="hy-tx hy-desktop-activity">
            <div className="hy-tx__head">
              <span className="hy-tx__heading-icon" aria-hidden="true"><i className="fa-solid fa-clock-rotate-left" /></span>
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
              <div className="hy-tx__empty"><i className="fa-regular fa-folder-open" aria-hidden="true" /><p>{t('desktop.no_record_found')}</p></div>
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

      <IncomeEntryModal open={txOpen} onClose={() => setTxOpen(false)} accounts={visibleAccounts} onSaved={() => load(true)} />

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


export function IncomeEntryModal({ open, onClose, accounts: visibleAccounts, onSaved }: {
  open: boolean
  onClose: () => void
  accounts: UserAccountRow[]
  onSaved: () => void | Promise<void>
}) {
  const { t } = useTranslation()
  const locale = useLocaleStore((s) => s.language)
  const token = useAuthStore((s) => s.token)
  const [txAccountId, setTxAccountId] = useState('')
  const [txAmount, setTxAmount] = useState('')
  const [txCategory, setTxCategory] = useState<string>(INCOME_CATEGORIES[0])
  const [txDate, setTxDate] = useState(todayLocalYmd())
  const [txNote, setTxNote] = useState('')
  const [txError, setTxError] = useState<string | null>(null)
  const [txBusy, setTxBusy] = useState(false)
  useEffect(() => {
    if (!open) return
    setTxAmount('')
    setTxNote('')
    setTxCategory(INCOME_CATEGORIES[0])
    setTxDate(todayLocalYmd())
    setTxError(null)
    setTxAccountId(visibleAccounts[0] ? String(visibleAccounts[0].id) : '')
  }, [open, visibleAccounts[0]?.id])

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
      onClose()
      showSuccessToast(t('desktop.saved_success'))
      await onSaved()
    } catch (err) {
      setTxError(getApiErrorMessage(err))
    } finally {
      setTxBusy(false)
    }
  }

  return (
      <Modal
        open={open}
        onClose={() => !txBusy && onClose()}
        title={t('desktop.dash_inject')}
        wide
        className="hy-party-dialog hy-finance-dialog hy-income-dialog"
      >
        <form className="companies-create-form hy-party-form" onSubmit={(event) => void submitCash(event)}>
          <div className="hy-party-form__intro"><span aria-hidden="true"><i className="fa-solid fa-arrow-down" /></span><p>{t('desktop.hy_income_form_note')}</p></div>
          {txError ? <div className="alert-error">{txError}</div> : null}
          <div className="hy-party-form__grid">
          <div className="form-field">
            <label htmlFor="income-category">{t('desktop.income_category')}</label>
            <Select id="income-category" value={txCategory} onChange={(e) => setTxCategory(e.target.value)} required>
              {INCOME_CATEGORIES.map((code) => (
                <option key={code} value={code}>
                  {t(`desktop.income_cat_${code}`)}
                </option>
              ))}
            </Select>
          </div>
          <div className="form-field">
            <label htmlFor="income-account">{t('desktop.account')}</label>
            <Select id="income-account" value={txAccountId} onChange={(e) => setTxAccountId(e.target.value)} required>
              {visibleAccounts.map((item) => (
                <option key={item.id} value={item.id}>
                  {accountDisplayName(item, locale)} ({localizeCurrency(item.currency || 'AFN', t)})
                </option>
              ))}
            </Select>
          </div>
          <div className="form-field hy-party-form__full">
            <label htmlFor="income-amount">{t('desktop.amount')} <span className="hy-required" aria-hidden="true">*</span></label>
            <div className="hy-flow-amount">
            <input
              id="income-amount"
              type="number"
              inputMode="decimal"
              placeholder="0.00"
              min="1"
              step="any"
              value={txAmount}
              onChange={(e) => setTxAmount(e.target.value)}
              required
            />
            <span>{localizeCurrency(visibleAccounts.find((item) => String(item.id) === txAccountId)?.currency || 'AFN', t)}</span>
            </div>
          </div>
          <div className="form-field">
            <label htmlFor="income-date">{t('desktop.date')}</label>
            <JalaliDatePicker id="income-date" value={txDate} onChange={setTxDate} />
          </div>
          <div className="form-field">
            <label htmlFor="income-note">{t('desktop.description')}</label>
            <input id="income-note" value={txNote} onChange={(e) => setTxNote(e.target.value)} />
          </div>
          </div>
          <div className="form-actions">
            <button type="button" className="btn-secondary" onClick={() => onClose()} disabled={txBusy}>
              {t('desktop.cancel')}
            </button>
            <button type="submit" className="btn-primary" disabled={txBusy}>
              {txBusy ? t('desktop.processing') : t('desktop.save')}
            </button>
          </div>
        </form>
      </Modal>
  )
}
