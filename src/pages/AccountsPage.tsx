import { useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { Modal } from '@/components/ui/Modal'
import { showSuccessToast } from '@/components/ui/SuccessToast'
import { CurrencyExchangeModal } from '@/pages/accounts/CurrencyExchangeModal'
import { getApiErrorMessage } from '@/lib/auth'
import { readPageCache, writePageCache } from '@/lib/devicePageCache'
import { formatJalaliSlash } from '@/lib/datetime'
import { personalTxTitle } from '@/lib/incomeCategories'
import { usePremiumStatus } from '@/hooks/usePremiumStatus'
import { useRegisterPageRefresh } from '@/hooks/useRegisterPageRefresh'
import { useUserCacheKey } from '@/hooks/useUserCacheKey'
import { localizeCurrency } from '@/lib/currency'
import {
  accountDisplayName,
  createUserAccounts,
  deleteUserAccount,
  deleteUserAccountDeposit,
  expenseAccountLabel,
  fetchAccountTemplates,
  fetchAccountsData,
  templateDisplayName,
  type AccountTemplateRow,
  type ExpenseAccountRow,
  type UserAccountDeposit,
  type UserAccountRow,
} from '@/lib/user'
import { useAuthStore } from '@/store/useAuthStore'
import { useAppCacheStore } from '@/store/useAppCacheStore'
import { useLocaleStore } from '@/store/useLocaleStore'

export function AccountsPage() {
  const { t } = useTranslation()
  const locale = useLocaleStore((s) => s.language)
  const userKey = useUserCacheKey()
  const token = useAuthStore((state) => state.token)
  const { premiumActive } = usePremiumStatus()
  const ensureExpenseAccounts = useAppCacheStore((s) => s.ensureExpenseAccounts)
  const setExpenseAccountsCache = useAppCacheStore((s) => s.setExpenseAccounts)
  const setPersonalAccountsCache = useAppCacheStore((s) => s.setPersonalAccounts)
  const cachedExpenseAccounts = useAppCacheStore((s) => s.getExpenseAccounts(userKey))


  const [accounts, setAccounts] = useState<UserAccountRow[]>([])
  const [deposits, setDeposits] = useState<UserAccountDeposit[]>([])
  const [expenseAccounts, setExpenseAccounts] = useState<ExpenseAccountRow[]>(
    cachedExpenseAccounts ?? [],
  )
  const [templatesTotal, setTemplatesTotal] = useState(0)
  const [accountsTotal, setAccountsTotal] = useState(0)
  const [canCreateMore, setCanCreateMore] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState('')

  const [templateOpen, setTemplateOpen] = useState(false)
  const [templates, setTemplates] = useState<AccountTemplateRow[]>([])
  const [templatesLoading, setTemplatesLoading] = useState(false)
  const [selectedTemplateIds, setSelectedTemplateIds] = useState<number[]>([])
  const [creating, setCreating] = useState(false)
  const [createError, setCreateError] = useState('')

  const [selectedDeposit, setSelectedDeposit] = useState<UserAccountDeposit | null>(null)
  const [deleteTxOpen, setDeleteTxOpen] = useState(false)
  const [deletingTx, setDeletingTx] = useState(false)
  const [deleteTxError, setDeleteTxError] = useState('')

  const [selectedAccount, setSelectedAccount] = useState<UserAccountRow | null>(null)
  const [accountModalOpen, setAccountModalOpen] = useState(false)
  const [deleteAccountOpen, setDeleteAccountOpen] = useState(false)
  const [deletingAccount, setDeletingAccount] = useState(false)
  const [deleteAccountError, setDeleteAccountError] = useState('')

  const [refreshing, setRefreshing] = useState(false)
  const [fxOpen, setFxOpen] = useState(false)

  const visibleAccounts = accounts

  const showCreateButton = useMemo(() => {
    if (canCreateMore) return true
    return Number(accountsTotal) < Number(templatesTotal)
  }, [canCreateMore, accountsTotal, templatesTotal])

  const expenseMap = useMemo(() => {
    const map: Record<string, string> = {}
    expenseAccounts.forEach((item) => {
      const label = expenseAccountLabel(item, locale)
      map[String(item.id)] = label
      if (item.code) map[String(item.code)] = label
    })
    return map
  }, [expenseAccounts, locale])

  const primaryAccount = visibleAccounts[0] || accounts[0] || null

  const loadData = useCallback(async (force = false) => {
    if (!token) return
    if (!force) {
      const hit = readPageCache<{
        accounts: UserAccountRow[]
        deposits: UserAccountDeposit[]
        expenseAccounts: ExpenseAccountRow[]
        canCreateMore: boolean
        templatesTotal: number
        accountsTotal: number
      }>(userKey, 'accounts-page')
      if (hit) {
        setAccounts(hit.accounts)
        setDeposits(hit.deposits)
        if (hit.expenseAccounts.length) setExpenseAccounts(hit.expenseAccounts)
        setCanCreateMore(hit.canCreateMore)
        setTemplatesTotal(hit.templatesTotal)
        setAccountsTotal(hit.accountsTotal)
        setLoading(false)
        return
      }
    }
    setRefreshing(force)
    setError(null)
    try {
      const cachedSections = await ensureExpenseAccounts(token, userKey)
      if (cachedSections?.length) {
        setExpenseAccounts(cachedSections)
      }

      const data = await fetchAccountsData(token)
      const incoming = data.accounts ?? []
      setAccounts(incoming)
      setDeposits(Array.isArray(data.deposits) ? data.deposits : [])
      const sections = Array.isArray(data.expense_accounts) ? data.expense_accounts : []
      if (sections.length > 0) {
        setExpenseAccounts(sections)
        await setExpenseAccountsCache(userKey, sections)
      }
      await setPersonalAccountsCache(userKey, {
        accounts: incoming,
        deposits: Array.isArray(data.deposits) ? data.deposits : [],
        active: incoming.length > 0 || Boolean(data.account?.id),
      })
      setCanCreateMore(Boolean(data.can_create_more_accounts))
      setTemplatesTotal(Number(data.templates_total ?? 0))
      setAccountsTotal(Number(data.accounts_total ?? incoming.length))
      writePageCache(userKey, 'accounts-page', {
        accounts: incoming,
        deposits: Array.isArray(data.deposits) ? data.deposits : [],
        expenseAccounts: sections,
        canCreateMore: Boolean(data.can_create_more_accounts),
        templatesTotal: Number(data.templates_total ?? 0),
        accountsTotal: Number(data.accounts_total ?? incoming.length),
      })
    } catch (err) {
      setError(getApiErrorMessage(err))
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [token, userKey, ensureExpenseAccounts, setExpenseAccountsCache, setPersonalAccountsCache])

  useEffect(() => {
    setLoading(true)
    void loadData()
  }, [loadData])

  const refreshPage = useCallback(() => {
    void loadData(true)
  }, [loadData])
  useRegisterPageRefresh(refreshPage, refreshing)

  const ownedTemplateIds = (list: AccountTemplateRow[]) => {
    const owned = new Set(accounts.map((item) => String(item.currency || '').toUpperCase()))
    return list
      .filter((tpl) => owned.has(String(tpl.currency || '').toUpperCase()))
      .map((tpl) => tpl.id)
  }

  const openTemplateModal = async () => {
    setTemplateOpen(true)
    setCreateError('')
    if (templates.length > 0) {
      setSelectedTemplateIds(ownedTemplateIds(templates))
      return
    }
    if (!token) return
    try {
      setTemplatesLoading(true)
      const incoming = await fetchAccountTemplates(token)
      setTemplates(incoming)
      setSelectedTemplateIds(ownedTemplateIds(incoming))
    } catch (err) {
      setCreateError(getApiErrorMessage(err))
    } finally {
      setTemplatesLoading(false)
    }
  }

  const toggleTemplate = (id: number) => {
    setSelectedTemplateIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
  }

  const handleCreateAccounts = async () => {
    if (!token) return
    const freshIds = selectedTemplateIds.filter((id) => !ownedTemplateIds(templates).includes(id))
    if (freshIds.length === 0) {
      setCreateError(t('desktop.select_at_least_one_template'))
      return
    }
    setCreating(true)
    setCreateError('')
    try {
      await createUserAccounts(token, freshIds)
      setTemplateOpen(false)
      showSuccessToast(t('desktop.saved_success'))
      await loadData(true)
    } catch (err) {
      setCreateError(getApiErrorMessage(err))
    } finally {
      setCreating(false)
    }
  }

  const confirmDeleteTx = async () => {
    if (!token || !selectedDeposit) return
    const txId = Number(selectedDeposit.transaction_id ?? selectedDeposit.id)
    setDeletingTx(true)
    setDeleteTxError('')
    try {
      await deleteUserAccountDeposit(token, txId)
      setDeleteTxOpen(false)
      setSelectedDeposit(null)
      showSuccessToast(t('desktop.saved_success'))
      await loadData(true)
    } catch (err) {
      setDeleteTxError(getApiErrorMessage(err))
    } finally {
      setDeletingTx(false)
    }
  }

  const confirmDeleteAccount = async () => {
    if (!token || !selectedAccount) return
    setDeletingAccount(true)
    setDeleteAccountError('')
    try {
      await deleteUserAccount(token, selectedAccount.id)
      setDeleteAccountOpen(false)
      setAccountModalOpen(false)
      setSelectedAccount(null)
      setSuccessMessage(t('desktop.delete_account_success'))
      await loadData(true)
    } catch (err) {
      setDeleteAccountError(getApiErrorMessage(err))
    } finally {
      setDeletingAccount(false)
    }
  }

  const templateModal = (
    <Modal
      open={templateOpen}
      onClose={() => !creating && setTemplateOpen(false)}
      title={t('desktop.hy_create_account_currency')}
      wide
    >
      <div className="ua-alert ua-alert--info">{t('desktop.choose_trade_currencies_note')}</div>

      {templatesLoading ? (
        <p className="muted">{t('desktop.loading')}</p>
      ) : (
        <div className="ua-template-list">
          {templates.length === 0 ? (
            <p className="muted">{t('desktop.no_account_templates')}</p>
          ) : (
            templates.map((template) => {
              const owned = accounts.some(
                (item) =>
                  String(item.currency || '').toUpperCase() === String(template.currency || '').toUpperCase(),
              )
              const checked = owned || selectedTemplateIds.includes(template.id)
              return (
                <label key={template.id} className={`ua-template-item${owned ? ' is-disabled' : ''}`}>
                  <span className="ua-template-item__left">
                    <input
                      type="checkbox"
                      checked={checked}
                      disabled={creating || owned}
                      onChange={() => toggleTemplate(template.id)}
                    />
                    <span>{templateDisplayName(template, locale)}</span>
                  </span>
                  <span className="muted">{localizeCurrency(template.currency, t)}</span>
                </label>
              )
            })
          )}
        </div>
      )}

      {createError ? <div className="alert-error" style={{ marginTop: 10 }}>{createError}</div> : null}

      <div className="form-actions" style={{ marginTop: 14 }}>
        <button type="button" className="btn-secondary" onClick={() => setTemplateOpen(false)} disabled={creating}>
          {t('desktop.cancel')}
        </button>
        <button
          type="button"
          className="btn-primary"
          onClick={() => void handleCreateAccounts()}
          disabled={creating || templatesLoading}
        >
          {creating ? t('desktop.processing') : t('desktop.save')}
        </button>
      </div>
    </Modal>
  )

  if (!loading && !primaryAccount?.id) {
    return (
      <div className="user-accounts-page" dir="rtl">
        <div className="ea-head">
          <div>
            <h2>{t('desktop.hy_accounts_title')}</h2>
            <p>{t('desktop.page_accounts_desc')}</p>
          </div>
        </div>
        <div className="ua-empty-activate">
          <p>{t('desktop.user_accounts_not_activated')}</p>
          <p style={{ marginTop: 8 }}>{t('desktop.create_user_account_guide')}</p>
          <div style={{ marginTop: 14 }}>
            <button type="button" className="btn-primary" onClick={() => void openTemplateModal()} disabled={creating}>
              {creating ? t('desktop.processing') : t('desktop.hy_create_account_currency')}
            </button>
          </div>
        </div>
        {templateModal}
      </div>
    )
  }

  return (
    <div className="user-accounts-page" dir="rtl">
      <div className="ea-head">
        <div>
          <h2>{t('desktop.hy_accounts_title')}</h2>
          <p>{t('desktop.page_accounts_desc')}</p>
        </div>
      </div>

      {error ? <div className="alert-error">{error}</div> : null}
      {successMessage ? <div className="ua-alert ua-alert--success">{successMessage}</div> : null}

      {loading ? (
        <p className="muted">
          <i className="fa-solid fa-spinner fa-spin" /> {t('desktop.loading')}
        </p>
      ) : (
        <>
          <div className="ua-cards">
            {visibleAccounts.map((item) => (
              <button
                type="button"
                key={item.id}
                className="ua-card"
                onClick={() => {
                  setSelectedAccount(item)
                  setDeleteAccountError('')
                  setAccountModalOpen(true)
                }}
              >
                <p className="ua-card__label">{accountDisplayName(item, locale)}</p>
                <p className="ua-card__balance">
                  {Number(item.current_balance ?? 0).toLocaleString('en-US')}{' '}
                  <span>{localizeCurrency(item.currency || 'AFN', t)}</span>
                </p>
              </button>
            ))}
          </div>

          <div className="ua-hint">{t('desktop.account_card_click_hint')}</div>

          <div className="ua-toolbar">
            <button
              type="button"
              className="btn-secondary"
              onClick={() => {
                if (primaryAccount) {
                  setSelectedAccount(primaryAccount)
                  setAccountModalOpen(true)
                }
              }}
            >
              <i className="fa-solid fa-circle-info" />
              {t('desktop.more_details')}
            </button>
          </div>

          <div className="ua-actions">
            {showCreateButton ? (
              <button type="button" className="btn-primary ua-btn--warning" onClick={() => void openTemplateModal()}>
                <i className="fa-solid fa-plus" />
                {t('desktop.hy_create_account_currency')}
              </button>
            ) : null}
            <button
              type="button"
              className="btn-primary hy-action--fx"
              onClick={() => setFxOpen(true)}
              disabled={visibleAccounts.length < 2}
            >
              <i className="fa-solid fa-right-left" />
              {t('desktop.hy_fx_title')}
            </button>
          </div>

          <div className="ua-tx-wrap">
            <div className="ua-tx-title">
              <h3>{t('desktop.transactions')}</h3>
              {premiumActive ? (
                <small className="muted">
                  {t('desktop.premium_account_progress')}: {accountsTotal} / {templatesTotal}
                </small>
              ) : null}
            </div>
            <div className="ua-hint">{t('desktop.transaction_click_hint')}</div>
            <div className="ua-tx-list">
              {deposits.length === 0 ? (
                <p className="muted">{t('desktop.no_record_found')}</p>
              ) : (
                deposits.slice(0, 10).map((deposit) => {
                  const isCredit = deposit.type === 'credit'
                  const title = personalTxTitle(deposit, t, expenseMap)
                  return (
                    <button
                      type="button"
                      key={String(deposit.transaction_id ?? deposit.id)}
                      className="ua-tx-row"
                      onClick={() => setSelectedDeposit(deposit)}
                    >
                      <span className={`ua-tx-icon${isCredit ? ' ua-tx-icon--in' : ' ua-tx-icon--out'}`}>
                        <i className={`fa-solid ${isCredit ? 'fa-arrow-down' : 'fa-arrow-up'}`} />
                      </span>
                      <span className="ua-tx-body">
                        <strong>{title}</strong>
                        <small>
                          {deposit.account_name || t('desktop.account')} (
                          {localizeCurrency(deposit.account_currency || deposit.currency || 'AFN', t)})
                        </small>
                        <small>{formatJalaliSlash(deposit.date, locale)}</small>
                      </span>
                      <span className={`ua-tx-amount${isCredit ? ' ua-tx-amount--in' : ' ua-tx-amount--out'}`}>
                        {Number(deposit.amount || 0).toLocaleString('en-US')}{' '}
                        {localizeCurrency(deposit.currency || 'AFN', t)}
                      </span>
                    </button>
                  )
                })
              )}
            </div>
          </div>
        </>
      )}

      {templateModal}

      <Modal open={Boolean(selectedDeposit)} onClose={() => setSelectedDeposit(null)} title={t('desktop.deposit_detail')}>
        {selectedDeposit ? (
          <>
            <ul className="ua-detail-list">
              <li>
                {t('desktop.amount')}:{' '}
                <strong>
                  {Number(selectedDeposit.amount || 0).toLocaleString('en-US')}{' '}
                  {localizeCurrency(selectedDeposit.currency || 'AFN', t)}
                </strong>
              </li>
              <li>
                {t('desktop.date')}: {formatJalaliSlash(selectedDeposit.date, locale)}
              </li>
              <li>
                {t('desktop.account')}: {selectedDeposit.account_name || '—'}
              </li>
              {selectedDeposit.counterparty_name || selectedDeposit.counterparty_id ? (
                <li>
                  {t('desktop.counterparty')}: {selectedDeposit.counterparty_name || '—'}
                </li>
              ) : null}
              <li>
                {t('desktop.type')}: {personalTxTitle(selectedDeposit, t, expenseMap)}
              </li>
              <li>
                {t('desktop.description')}: {selectedDeposit.description || '—'}
              </li>
            </ul>
            <div className="form-actions" style={{ marginTop: 16 }}>
              <button
                type="button"
                className="btn-primary ua-btn--danger"
                onClick={() => {
                  setDeleteTxError('')
                  setDeleteTxOpen(true)
                }}
              >
                <i className="fa-solid fa-trash" /> {t('desktop.delete')}
              </button>
            </div>
          </>
        ) : null}
      </Modal>

      <Modal open={deleteTxOpen} onClose={() => !deletingTx && setDeleteTxOpen(false)} title={t('desktop.confirm_delete_title')}>
        <p>{t('desktop.confirm_delete_text')}</p>
        {deleteTxError ? <div className="alert-error">{deleteTxError}</div> : null}
        <div className="form-actions">
          <button type="button" className="btn-secondary" onClick={() => setDeleteTxOpen(false)} disabled={deletingTx}>
            {t('desktop.cancel')}
          </button>
          <button type="button" className="btn-primary ua-btn--danger" onClick={() => void confirmDeleteTx()} disabled={deletingTx}>
            {deletingTx ? t('desktop.processing') : t('desktop.delete')}
          </button>
        </div>
      </Modal>

      <Modal
        open={accountModalOpen}
        onClose={() => !deletingAccount && !deleteAccountOpen && setAccountModalOpen(false)}
        title={t('desktop.balance_details')}
      >
        {selectedAccount ? (
          <>
            <ul className="ua-detail-list">
              <li>
                {t('desktop.account')}: <strong>{accountDisplayName(selectedAccount, locale)}</strong>
              </li>
              <li>
                {t('desktop.current_balance')}:{' '}
                <strong>
                  {Number(selectedAccount.current_balance ?? 0).toLocaleString('en-US')}{' '}
                  {localizeCurrency(selectedAccount.currency || 'AFN', t)}
                </strong>
              </li>
              <li>
                {t('desktop.date')}: {formatJalaliSlash(selectedAccount.created_at, locale)}
              </li>
            </ul>
            <p className="muted" style={{ marginTop: 12, lineHeight: 1.7 }}>
              {t('desktop.personal_account_description')}
            </p>
            <div style={{ marginTop: 14 }}>
              {selectedAccount.can_delete ? (
                <>
                  <div className="ua-alert ua-alert--amber">{t('desktop.delete_account_warning')}</div>
                  <button
                    type="button"
                    className="btn-primary ua-btn--danger"
                    onClick={() => {
                      setDeleteAccountError('')
                      setDeleteAccountOpen(true)
                    }}
                  >
                    <i className="fa-solid fa-trash" /> {t('desktop.delete_account')}
                  </button>
                </>
              ) : (
                <div className="ua-alert ua-alert--info">{t('desktop.account_has_tx_delete_blocked')}</div>
              )}
            </div>
          </>
        ) : null}
      </Modal>

      <Modal
        open={deleteAccountOpen}
        onClose={() => !deletingAccount && setDeleteAccountOpen(false)}
        title={t('desktop.confirm_delete_title')}
      >
        <p>{t('desktop.confirm_delete_account_text')}</p>
        {deleteAccountError ? <div className="alert-error">{deleteAccountError}</div> : null}
        <div className="form-actions">
          <button
            type="button"
            className="btn-secondary"
            onClick={() => setDeleteAccountOpen(false)}
            disabled={deletingAccount}
          >
            {t('desktop.cancel')}
          </button>
          <button
            type="button"
            className="btn-primary ua-btn--danger"
            onClick={() => void confirmDeleteAccount()}
            disabled={deletingAccount}
          >
            {deletingAccount ? t('desktop.processing') : t('desktop.delete')}
          </button>
        </div>
      </Modal>

      {token ? (
        <CurrencyExchangeModal
          open={fxOpen}
          token={token}
          accounts={visibleAccounts}
          locale={locale}
          onClose={() => setFxOpen(false)}
          onDone={() => void loadData(true)}
        />
      ) : null}
    </div>
  )
}
