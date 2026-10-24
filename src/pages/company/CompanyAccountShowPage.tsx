import { FormEvent, useEffect, useState } from 'react'
import { Link, useOutletContext, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useShallow } from 'zustand/react/shallow'

import { Modal } from '@/components/ui/Modal'
import { showSuccessToast } from '@/components/ui/SuccessToast'
import { useUserCacheKey } from '@/hooks/useUserCacheKey'
import { getApiErrorMessage } from '@/lib/auth'
import { localizeCurrency } from '@/lib/currency'
import {
  deleteAccountCashMovement,
  depositToAccount,
  fetchAccountShow,
  fetchAccountTransactions,
  toggleBusinessAccountStatus,
  withdrawFromAccount,
} from '@/lib/business'
import {
  formatMoney,
  isCreditTransaction,
  translateTransactionDescription,
  translateTransactionLabel,
} from '@/lib/companyDashboard'
import { formatAfghanDateValue } from '@/lib/datetime'
import type { BusinessAccountRow, BusinessDashboardTransaction, BusinessShowData } from '@/lib/user'
import { isBusinessAccountActive } from '@/lib/user'
import { useAuthStore } from '@/store/useAuthStore'
import { businessPath } from '@/store/useCompanyContextStore'
import { scheduleBusinessDashboardRefresh } from '@/store/useListsCacheStore'

type CompanyOutletContext = { business: BusinessShowData }

function isManualCashMovement(tx: BusinessDashboardTransaction): boolean {
  if (tx.can_delete === true) return true
  if (tx.sourceable_type || tx.sourceable_id) return false
  const action = String((tx.meta as { action?: string } | null)?.action || '')
  const title = String(tx.title || '')
  return (
    action === 'deposit_to_account' ||
    action === 'withdraw_from_account' ||
    title === 'Cash Deposit' ||
    title === 'Cash Withdraw'
  )
}

export function CompanyAccountShowPage() {
  const { t, i18n } = useTranslation()
  const { companyId = '', accountId = '' } = useParams()
  const { business } = useOutletContext<CompanyOutletContext>()
  const token = useAuthStore(useShallow((state) => state.token))
  const userKey = useUserCacheKey()
  const locale = (i18n.language?.startsWith('ps')
    ? 'ps'
    : i18n.language?.startsWith('en')
      ? 'en'
      : 'fa') as 'fa' | 'ps' | 'en'

  const [account, setAccount] = useState<(BusinessAccountRow & { template_name_fa?: string | null }) | null>(
    null,
  )
  const [transactions, setTransactions] = useState<BusinessDashboardTransaction[]>([])
  const [loading, setLoading] = useState(true)
  const [txLoading, setTxLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [canManage, setCanManage] = useState(false)
  const [canDelete, setCanDelete] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<BusinessDashboardTransaction | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [activating, setActivating] = useState(false)

  const load = async () => {
    if (!token || !companyId || !accountId) return
    setLoading(true)
    setError(null)
    try {
      const data = await fetchAccountShow(token, companyId, accountId)
      setAccount(data.account)
      setCanManage(Boolean(data.permissions?.canManageAccounts) && business.is_active)
      setCanDelete(
        Boolean(data.permissions?.canDeleteRecords ?? business.permissions?.canDeleteRecords) &&
          business.is_active,
      )
    } catch (err) {
      setError(getApiErrorMessage(err))
      setAccount(null)
    } finally {
      setLoading(false)
    }
  }

  const loadTx = async () => {
    if (!token || !companyId || !accountId) return
    setTxLoading(true)
    try {
      setTransactions(await fetchAccountTransactions(token, companyId, accountId, 30))
    } catch {
      setTransactions([])
    } finally {
      setTxLoading(false)
    }
  }

  useEffect(() => {
    void load()
    void loadTx()
  }, [token, companyId, accountId])

  const confirmDelete = async () => {
    if (!token || !deleteTarget || !account) return
    setDeleting(true)
    setDeleteError(null)
    try {
      await deleteAccountCashMovement(token, companyId, account.id, deleteTarget.id)
      showSuccessToast(t('desktop.cash_movement_deleted'))
      setDeleteTarget(null)
      void load()
      void loadTx()
      scheduleBusinessDashboardRefresh(token, userKey, companyId)
    } catch (err) {
      setDeleteError(getApiErrorMessage(err))
    } finally {
      setDeleting(false)
    }
  }

  if (loading) {
    return (
      <div className="center-screen">
        <div className="spinner" />
      </div>
    )
  }

  if (!account) {
    return <div className="alert-error">{error || t('desktop.module_coming_soon')}</div>
  }

  const title = account.name || account.template_name_fa || t('desktop.account')
  const typeText =
    account.type === 'cash'
      ? t('desktop.cash')
      : account.type === 'bank'
        ? t('desktop.bank')
        : t('desktop.etc')
  const typeClass =
    account.type === 'cash' ? 'acc-t-cash' : account.type === 'bank' ? 'acc-t-bank' : 'acc-t-etc'
  const accountActive = isBusinessAccountActive(account)

  return (
    <div className="dash-div" dir="rtl">
      <div className="dash-header dash-header--section mb-2">
        <h5 className="mb-0">
          {t('desktop.account_details')} <span>{business.company.name}</span>
        </h5>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <Link to={businessPath(companyId)} className="btn-secondary btn-sm">
            <i className="fa-solid fa-house" /> {t('desktop.nav_dashboard')}
          </Link>
          <Link to={businessPath(companyId, 'accounts')} className="btn-secondary btn-sm">
            <i className="fa-solid fa-list-ul" /> {t('desktop.company_accounts')}
          </Link>
        </div>
      </div>

      {error ? <div className="alert-error">{error}</div> : null}

      <div className="acc-show-wrap">
        <div className={`acc-show-card ${typeClass}`}>
          <div className="acc-show-top">
            <div className="acc-show-title">
              <i className="fa-regular fa-credit-card" /> {title}
            </div>
            <div className="acc-show-badges">
              <span className="acc2-badge acc2-badge-type">{typeText}</span>
              {account.is_capital ? (
                <span className="acc2-badge acc2-badge-capital">{t('desktop.capital')}</span>
              ) : null}
              {account.is_sell_account ? (
                <span className="acc2-badge acc2-badge-sell">{t('desktop.sell_account')}</span>
              ) : null}
              <span className={`acc2-status ${account.status ? 'on' : 'off'}`}>
                {account.status ? t('desktop.active') : t('desktop.inactive')}
              </span>
            </div>
          </div>

          <div className="acc-show-amount">
            {formatMoney(account.balance)}{' '}
            <span className="acc-show-cur">{localizeCurrency(account.currency, t)}</span>
          </div>

          <div className="acc-show-grid">
            <div className="acc-show-item">
              <div className="k">{t('desktop.currency')}</div>
              <div className="v">{localizeCurrency(account.currency, t)}</div>
            </div>
            <div className="acc-show-item">
              <div className="k">{t('desktop.account_type')}</div>
              <div className="v">{typeText}</div>
            </div>
            <div className="acc-show-item">
              <div className="k">{t('desktop.status')}</div>
              <div className="v">{account.status ? t('desktop.active') : t('desktop.inactive')}</div>
            </div>
            <div className="acc-show-item">
              <div className="k">{t('desktop.balance')}</div>
              <div className="v">
                {formatMoney(account.balance)} {localizeCurrency(account.currency, t)}
              </div>
            </div>
          </div>

          <div className="acc-show-note">{t('desktop.note_account_locked')}</div>
        </div>

        {canManage && accountActive ? (
          <AccountCashActions
            companyId={companyId}
            accountId={account.id}
            currency={account.currency}
            onSuccess={() => {
              void load()
              void loadTx()
              scheduleBusinessDashboardRefresh(token, userKey, companyId)
            }}
          />
        ) : null}

        {canManage && !accountActive ? (
          <div className="acc-cash-actions">
            <button
              type="button"
              className="btn-primary"
              disabled={activating || !token}
              onClick={() => {
                if (!token) return
                setActivating(true)
                void toggleBusinessAccountStatus(token, companyId, account.id, true)
                  .then(async () => {
                    showSuccessToast(t('desktop.account_activated'))
                    await load()
                    scheduleBusinessDashboardRefresh(token, userKey, companyId)
                  })
                  .catch((err) => setError(getApiErrorMessage(err)))
                  .finally(() => setActivating(false))
              }}
            >
              <i className={`fa-solid ${activating ? 'fa-spinner fa-spin' : 'fa-circle-check'}`} />{' '}
              {activating ? t('desktop.processing') : t('desktop.activate')}
            </button>
          </div>
        ) : null}

        <div className="acc-trans-wrap mt-3">
          <div className="acc-trans-head">
            <div>
              <h6 style={{ margin: 0 }}>{t('desktop.transactions')}</h6>
              <span className="muted" style={{ fontSize: '0.8rem' }}>
                {t('desktop.account_transactions')}
              </span>
            </div>
            <button
              type="button"
              className="btn-secondary btn-sm"
              onClick={() => void loadTx()}
              disabled={txLoading}
            >
              <i className={`fa-solid fa-rotate${txLoading ? ' fa-spin' : ''}`} /> {t('desktop.refresh')}
            </button>
          </div>

          {txLoading ? (
            <p className="muted">{t('desktop.loading')}</p>
          ) : transactions.length === 0 ? (
            <div className="acc-trans-empty">{t('desktop.no_transactions')}</div>
          ) : (
            <div className="acc-trans-list">
              {transactions.map((tx) => {
                const credit = isCreditTransaction(tx)
                const showDelete = canDelete && isManualCashMovement(tx)
                return (
                  <div
                    key={tx.id}
                    className={`tx-card-row${credit ? ' is-credit' : ' is-debit'}`}
                  >
                    <Link
                      to={businessPath(companyId, `transactions/${tx.id}`)}
                      className={`tx-card-link${credit ? ' is-credit' : ' is-debit'}`}
                    >
                      <div className={`tx-card-badge${credit ? ' is-credit' : ' is-debit'}`}>
                        <i className={`fa-solid ${credit ? 'fa-arrow-up' : 'fa-arrow-down'}`} />
                      </div>
                      <div className="tx-card-body">
                        <h6>
                          {translateTransactionLabel(tx, {
                            credit: t('desktop.credit'),
                            debit: t('desktop.debit'),
                          })}
                        </h6>
                        <p>
                          {formatAfghanDateValue(tx.created_at, locale)}
                          {tx.description
                            ? ` • ${translateTransactionDescription(tx.description)}`
                            : ''}
                        </p>
                      </div>
                      <div className={`tx-card-amount${credit ? ' is-credit' : ' is-debit'}`}>
                        <strong>
                          {formatMoney(tx.amount)}{' '}
                          <span>{localizeCurrency(tx.currency, t)}</span>
                        </strong>
                        {tx.balance_after != null ? (
                          <small>
                            {t('desktop.balance_after')}: {formatMoney(tx.balance_after)}
                          </small>
                        ) : null}
                      </div>
                    </Link>
                    {showDelete ? (
                      <button
                        type="button"
                        className="btn-danger btn-sm tx-card-delete"
                        title={t('desktop.delete')}
                        onClick={() => {
                          setDeleteError(null)
                          setDeleteTarget(tx)
                        }}
                      >
                        <i className="fa-solid fa-trash" />
                      </button>
                    ) : null}
                  </div>
                )
              })}
            </div>
          )}
        </div>

        <div style={{ marginTop: 16 }}>
          <Link to={businessPath(companyId, 'accounts')} className="btn-secondary">
            <i className="fa-solid fa-arrow-right" /> {t('desktop.close')}
          </Link>
        </div>
      </div>

      <Modal
        open={deleteTarget !== null}
        onClose={() => !deleting && setDeleteTarget(null)}
        title={t('desktop.confirm_delete_title')}
      >
        {deleteError ? <div className="alert-error">{deleteError}</div> : null}
        <p>{t('desktop.confirm_delete_cash_movement')}</p>
        {deleteTarget ? (
          <p className="muted">
            {formatMoney(deleteTarget.amount)} {localizeCurrency(deleteTarget.currency, t)}
          </p>
        ) : null}
        <div className="form-actions">
          <button
            type="button"
            className="btn-secondary"
            disabled={deleting}
            onClick={() => setDeleteTarget(null)}
          >
            {t('desktop.cancel')}
          </button>
          <button type="button" className="btn-danger" disabled={deleting} onClick={() => void confirmDelete()}>
            {deleting ? t('desktop.loading') : t('desktop.delete')}
          </button>
        </div>
      </Modal>
    </div>
  )
}

function AccountCashActions({
  companyId,
  accountId,
  currency,
  onSuccess,
}: {
  companyId: string
  accountId: number
  currency?: string | null
  onSuccess: () => void
}) {
  const { t } = useTranslation()
  const token = useAuthStore((s) => s.token)
  const [mode, setMode] = useState<'deposit' | 'withdraw' | null>(null)
  const [amount, setAmount] = useState('')
  const [remark, setRemark] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const close = () => {
    setMode(null)
    setAmount('')
    setRemark('')
    setError(null)
  }

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    if (!token || !mode) return
    setLoading(true)
    setError(null)
    try {
      const payload = { amount, remark: remark || undefined }
      if (mode === 'deposit') await depositToAccount(token, companyId, accountId, payload)
      else await withdrawFromAccount(token, companyId, accountId, payload)
      showSuccessToast(
        mode === 'deposit'
          ? t('desktop.cash_added_successfully')
          : t('desktop.cash_withdrawn_successfully'),
      )
      onSuccess()
      close()
    } catch (err) {
      setError(getApiErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div className="acc-cash-actions action-create">
        <button type="button" className="btn-secondary" onClick={() => setMode('deposit')}>
          <i className="fa-solid fa-circle-plus" /> {t('desktop.deposit_to_account')}
        </button>
        <button type="button" className="btn-secondary" onClick={() => setMode('withdraw')}>
          <i className="fa-solid fa-circle-minus" /> {t('desktop.withdraw_from_account')}
        </button>
      </div>

      <Modal
        open={mode !== null}
        onClose={close}
        title={
          mode === 'deposit' ? t('desktop.deposit_to_account') : t('desktop.withdraw_from_account')
        }
      >
        <form onSubmit={(e) => void submit(e)} className="form-grid">
          {error ? <div className="alert-error">{error}</div> : null}
          <p className="muted">
            {t('desktop.currency')}: <strong>{localizeCurrency(currency, t)}</strong>
          </p>
          <label>
            {t('desktop.amount')}
            <input
              type="number"
              step="0.01"
              min="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </label>
          <label>
            {t('desktop.remark')}
            <input value={remark} onChange={(e) => setRemark(e.target.value)} />
          </label>
          <div className="form-actions">
            <button type="button" className="btn-secondary" onClick={close} disabled={loading}>
              {t('desktop.cancel')}
            </button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? t('desktop.loading') : t('desktop.save')}
            </button>
          </div>
        </form>
      </Modal>
    </>
  )
}
