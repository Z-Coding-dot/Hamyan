import { Select } from '@/components/inputs/SearchableSelect'
import { FormEvent, useEffect, useMemo, useRef, useState } from 'react'
import { Link, useOutletContext, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useShallow } from 'zustand/react/shallow'

import { Modal } from '@/components/ui/Modal'
import { showSuccessToast } from '@/components/ui/SuccessToast'
import { TransferBetweenAccountsModal } from '@/pages/company/TransferBetweenAccountsModal'
import { useUserCacheKey } from '@/hooks/useUserCacheKey'
import { getApiErrorMessage } from '@/lib/auth'
import { localizeCurrency } from '@/lib/currency'
import {
  createBusinessAccount,
  deleteBusinessAccount,
  fetchAccountTemplates,
  fetchBusinessAccountsList,
  fetchRecentAccountTransactions,
  toggleBusinessAccountStatus,
  transferBetweenAccounts,
  updateBusinessAccountName,
  type AccountTemplateRow,
} from '@/lib/business'
import {
  formatMoney,
  isCreditTransaction,
  translateTransactionDescription,
  translateTransactionLabel,
} from '@/lib/companyDashboard'
import { formatAfghanDateValue } from '@/lib/datetime'
import type {
  BusinessAccountRow,
  BusinessDashboardTransaction,
  BusinessShowData,
} from '@/lib/user'
import { isBusinessAccountActive, templateDisplayName } from '@/lib/user'
import { useAuthStore } from '@/store/useAuthStore'
import { businessPath } from '@/store/useCompanyContextStore'
import { scheduleBusinessDashboardRefresh } from '@/store/useListsCacheStore'

type CompanyOutletContext = { business: BusinessShowData }

function accountBalance(account: BusinessAccountRow): number {
  const n = Number(account.balance ?? 0)
  return Number.isFinite(n) ? n : 0
}

function isProtectedAccount(account: BusinessAccountRow): boolean {
  return Boolean(account.is_capital || account.is_sell_account)
}

function AccountMiniCard({
  account,
  t,
}: {
  account: BusinessAccountRow
  t: (key: string) => string
}) {
  const title = account.name || account.template_name_fa || t('desktop.account')
  const currency = localizeCurrency(account.currency, t)
  const typeText =
    account.type === 'cash'
      ? t('desktop.cash')
      : account.type === 'bank'
        ? t('desktop.bank')
        : t('desktop.etc')
  const typeClass =
    account.type === 'cash' ? 'acc-t-cash' : account.type === 'bank' ? 'acc-t-bank' : 'acc-t-etc'

  return (
    <div className={`acc-card2 ${typeClass}`}>
      <div className="acc2-top">
        <div className="acc2-title" title={title}>
          {title}
        </div>
        <div className="acc2-badges">
          <span className="acc2-badge acc2-badge-type">{typeText}</span>
          {account.is_capital ? (
            <span className="acc2-badge acc2-badge-capital">{t('desktop.capital')}</span>
          ) : null}
          {account.is_sell_account ? (
            <span className="acc2-badge acc2-badge-sell">{t('desktop.sell_account')}</span>
          ) : null}
        </div>
      </div>
      <div className="acc2-mid">
        <div className="acc2-amount">
          {formatMoney(account.balance)} <span className="acc2-cur">{currency}</span>
        </div>
      </div>
      <div className="acc2-bottom">
        <div className="acc2-meta">
          <i className="fa-solid fa-right-left ms-1" />
          {currency}
        </div>
        <div className={`acc2-status ${account.status ? 'on' : 'off'}`}>
          {account.status ? t('desktop.active') : t('desktop.inactive')}
        </div>
      </div>
    </div>
  )
}

function AccountCardMenu({
  open,
  canRename,
  canDelete,
  canDeactivate,
  canActivate,
  onToggle,
  onClose,
  onRename,
  onDelete,
  onDeactivate,
  onActivate,
}: {
  open: boolean
  canRename: boolean
  canDelete: boolean
  canDeactivate: boolean
  canActivate: boolean
  onToggle: () => void
  onClose: () => void
  onRename: () => void
  onDelete: () => void
  onDeactivate: () => void
  onActivate: () => void
}) {
  const { t } = useTranslation()
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onDoc = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) onClose()
    }
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('mousedown', onDoc)
    window.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDoc)
      window.removeEventListener('keydown', onKey)
    }
  }, [open, onClose])

  return (
    <div className="acc-card-menu" ref={rootRef}>
      <button
        type="button"
        className="acc-card-menu__btn"
        aria-label={t('desktop.account_card_menu')}
        aria-expanded={open}
        onClick={(event) => {
          event.preventDefault()
          event.stopPropagation()
          onToggle()
        }}
      >
        <i className="fa-solid fa-ellipsis-vertical" />
      </button>
      {open ? (
        <div className="acc-card-menu__drop" role="menu">
          {canRename ? (
            <button type="button" role="menuitem" onClick={onRename}>
              <i className="fa-solid fa-pen" /> {t('desktop.edit_account_name')}
            </button>
          ) : null}
          {canDeactivate ? (
            <button type="button" role="menuitem" onClick={onDeactivate}>
              <i className="fa-solid fa-ban" /> {t('desktop.deactivate')}
            </button>
          ) : null}
          {canActivate ? (
            <button type="button" role="menuitem" onClick={onActivate}>
              <i className="fa-solid fa-circle-check" /> {t('desktop.activate')}
            </button>
          ) : null}
          {canDelete ? (
            <button type="button" role="menuitem" className="is-danger" onClick={onDelete}>
              <i className="fa-solid fa-trash" /> {t('desktop.delete_account')}
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}

export function CompanyAccountsPage() {
  const { t, i18n } = useTranslation()
  const { companyId = '' } = useParams()
  const { business } = useOutletContext<CompanyOutletContext>()
  const token = useAuthStore(useShallow((state) => state.token))
  const userKey = useUserCacheKey()
  const locale = (i18n.language?.startsWith('ps')
    ? 'ps'
    : i18n.language?.startsWith('en')
      ? 'en'
      : 'fa') as 'fa' | 'ps' | 'en'

  const [loading, setLoading] = useState(true)
  const [txLoading, setTxLoading] = useState(true)
  const [accounts, setAccounts] = useState<BusinessAccountRow[]>([])
  const [recent, setRecent] = useState<BusinessDashboardTransaction[]>([])
  const [templates, setTemplates] = useState<AccountTemplateRow[]>([])
  const [hasCapital, setHasCapital] = useState(false)
  const [hasSell, setHasSell] = useState(false)
  const [createOpen, setCreateOpen] = useState(false)
  const [transferOpen, setTransferOpen] = useState(false)
  const [menuAccountId, setMenuAccountId] = useState<number | null>(null)
  const [renameTarget, setRenameTarget] = useState<BusinessAccountRow | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<BusinessAccountRow | null>(null)
  const [deactivateTarget, setDeactivateTarget] = useState<BusinessAccountRow | null>(null)
  const [showInactive, setShowInactive] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const canManage =
    Boolean(business.permissions?.canManageAccounts) && business.is_active
  const canDelete =
    Boolean(business.permissions?.canDeleteRecords) && business.is_active
  const canShowMenu = canManage || canDelete
  const canViewTransactions = Boolean(business.permissions?.canViewTransactions)

  const loadAccounts = async () => {
    if (!token) return
    setLoading(true)
    try {
      const list = await fetchBusinessAccountsList(token, companyId)
      setAccounts(list)
      setHasCapital(list.some((a) => a.is_capital))
      setHasSell(list.some((a) => a.is_sell_account))
    } catch (err) {
      setError(getApiErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  const loadRecent = async () => {
    if (!token) return
    setTxLoading(true)
    try {
      setRecent(await fetchRecentAccountTransactions(token, companyId, 200))
    } catch {
      setRecent([])
    } finally {
      setTxLoading(false)
    }
  }

  useEffect(() => {
    if (!token || !companyId) return
    void loadAccounts()
    if (canViewTransactions) void loadRecent()
    else setRecent([])
    void fetchAccountTemplates(token).then(setTemplates).catch(() => setTemplates([]))
  }, [token, companyId, canViewTransactions])

  const sorted = useMemo(
    () => [...accounts].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0)),
    [accounts],
  )
  const inactiveAccounts = useMemo(
    () => sorted.filter((acc) => !isBusinessAccountActive(acc)),
    [sorted],
  )
  const visibleAccounts = useMemo(
    () => (showInactive ? sorted : sorted.filter(isBusinessAccountActive)),
    [sorted, showInactive],
  )
  const canTransferSameCurrency = useMemo(() => {
    const counts = new Map<string, number>()
    for (const acc of accounts) {
      if (!isBusinessAccountActive(acc)) continue
      const key = String(acc.currency || '').toLowerCase()
      if (!key) continue
      counts.set(key, (counts.get(key) || 0) + 1)
    }
    return [...counts.values()].some((count) => count >= 2)
  }, [accounts])

  return (
    <div className="dash-div" dir="rtl">
      <div className="acc-topbar">
        <div className="acc-topbar-left">
          <span className="acc-topbar-title">{t('desktop.total_accounts')}</span>
          <span className="acc-topbar-count">{visibleAccounts.length}</span>
        </div>
        <div className="acc-topbar-right">
          {inactiveAccounts.length > 0 ? (
            <button
              type="button"
              className="btn-secondary btn-sm"
              onClick={() => setShowInactive((current) => !current)}
            >
              <i className={`fa-solid ${showInactive ? 'fa-eye-slash' : 'fa-eye'}`} />{' '}
              {t('desktop.show_inactive_accounts')}
            </button>
          ) : (
            <span className="text-muted small">{t('desktop.hint_click_account')}</span>
          )}
        </div>
      </div>

      {canManage ? (
        <div className="acc-page-actions">
          <button type="button" className="btn-primary" onClick={() => setCreateOpen(true)}>
            <i className="fa-solid fa-plus" /> {t('desktop.create_account')}
          </button>
          <button
            type="button"
            className="btn-secondary"
            disabled={!canTransferSameCurrency}
            title={canTransferSameCurrency ? undefined : t('desktop.transfer_need_two_accounts')}
            onClick={() => setTransferOpen(true)}
          >
            <i className="fa-solid fa-right-left" /> {t('desktop.transfer_between_accounts')}
          </button>
        </div>
      ) : null}

      {error ? <div className="alert-error">{error}</div> : null}

      <div className="acc-grid mt-2">
        {loading ? (
          <div className="p-3 border rounded text-center muted">{t('desktop.loading')}</div>
        ) : visibleAccounts.length === 0 ? (
          <div className="p-3 border rounded text-center muted">{t('desktop.no_accounts_yet')}</div>
        ) : (
          visibleAccounts.map((acc) => {
            const active = isBusinessAccountActive(acc)
            return (
            <div
              key={acc.id}
              className={`acc-card-wrap${canShowMenu ? ' has-menu' : ''}${
                menuAccountId === acc.id ? ' is-open' : ''
              }${active ? '' : ' is-inactive'}`}
            >
              <Link to={businessPath(companyId, `accounts/${acc.id}`)} className="acc-link">
                <AccountMiniCard account={acc} t={t} />
              </Link>
              {canShowMenu ? (
                <AccountCardMenu
                  open={menuAccountId === acc.id}
                  canRename={canManage}
                  canDelete={canDelete}
                  canDeactivate={canManage && active && !isProtectedAccount(acc)}
                  canActivate={canManage && !active}
                  onToggle={() =>
                    setMenuAccountId((current) => (current === acc.id ? null : acc.id))
                  }
                  onClose={() => setMenuAccountId(null)}
                  onRename={() => {
                    setMenuAccountId(null)
                    setRenameTarget(acc)
                  }}
                  onDelete={() => {
                    setMenuAccountId(null)
                    setDeleteTarget(acc)
                  }}
                  onDeactivate={() => {
                    setMenuAccountId(null)
                    setDeactivateTarget(acc)
                  }}
                  onActivate={() => {
                    setMenuAccountId(null)
                    if (!token) return
                    void toggleBusinessAccountStatus(token, companyId, acc.id, true)
                      .then(async () => {
                        showSuccessToast(t('desktop.account_activated'))
                        await loadAccounts()
                        scheduleBusinessDashboardRefresh(token, userKey, companyId)
                      })
                      .catch((err) => setError(getApiErrorMessage(err)))
                  }}
                />
              ) : null}
            </div>
            )
          })
        )}
      </div>

      {canViewTransactions ? (
        <div className="dashboard-cards mt-4">
          <div className="dash-header dash-header--section">
            <h5>
              {t('desktop.account_transactions')} (200)
            </h5>
            <button
              type="button"
              className="btn-secondary btn-sm"
              onClick={() => void loadRecent()}
              disabled={txLoading}
            >
              <i className={`fa-solid fa-rotate${txLoading ? ' fa-spin' : ''}`} />{' '}
              {t('desktop.refresh')}
            </button>
          </div>

          {txLoading ? (
            <p className="muted">{t('desktop.loading')}</p>
          ) : recent.length === 0 ? (
            <p className="muted">{t('desktop.no_transactions')}</p>
          ) : (
            <div className="acc-trans-list">
              {recent.map((tx) => {
                const credit = isCreditTransaction(tx)
                return (
                  <Link
                    key={tx.id}
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
                          sales: t('desktop.sales'),
                          expenses: t('desktop.expenses'),
                        })}
                      </h6>
                      <p>
                        {(tx as { account_name?: string }).account_name || t('desktop.account')} •{' '}
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
                )
              })}
            </div>
          )}
        </div>
      ) : null}

      <CreateAccountModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        templates={templates}
        hasCapital={hasCapital}
        hasSell={hasSell}
        locale={locale}
        onSubmit={async (payload) => {
          if (!token) return
          await createBusinessAccount(token, companyId, payload)
          setCreateOpen(false)
          await loadAccounts()
        }}
      />
      <TransferBetweenAccountsModal
        open={transferOpen}
        onClose={() => setTransferOpen(false)}
        accounts={sorted}
        onSubmit={async (payload) => {
          if (!token) return
          await transferBetweenAccounts(token, companyId, payload)
          showSuccessToast(t('desktop.transfer_success'))
          setTransferOpen(false)
          await loadAccounts()
          if (canViewTransactions) await loadRecent()
          scheduleBusinessDashboardRefresh(token, userKey, companyId)
        }}
      />
      <RenameAccountModal
        open={Boolean(renameTarget)}
        account={renameTarget}
        onClose={() => setRenameTarget(null)}
        onSubmit={async (name) => {
          if (!token || !renameTarget) return
          await updateBusinessAccountName(token, companyId, renameTarget.id, name)
          showSuccessToast(t('desktop.account_name_updated'))
          setRenameTarget(null)
          await loadAccounts()
          scheduleBusinessDashboardRefresh(token, userKey, companyId)
        }}
      />
      <DeleteAccountModal
        open={Boolean(deleteTarget)}
        account={deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onSubmit={async () => {
          if (!token || !deleteTarget) return
          await deleteBusinessAccount(token, companyId, deleteTarget.id)
          showSuccessToast(t('desktop.company_account_deleted'))
          setDeleteTarget(null)
          await loadAccounts()
          if (canViewTransactions) await loadRecent()
          scheduleBusinessDashboardRefresh(token, userKey, companyId)
        }}
      />
      <DeactivateAccountModal
        open={Boolean(deactivateTarget)}
        account={deactivateTarget}
        onClose={() => setDeactivateTarget(null)}
        onSubmit={async () => {
          if (!token || !deactivateTarget) return
          await toggleBusinessAccountStatus(token, companyId, deactivateTarget.id, false)
          showSuccessToast(t('desktop.account_deactivated'))
          setDeactivateTarget(null)
          await loadAccounts()
          scheduleBusinessDashboardRefresh(token, userKey, companyId)
        }}
      />
    </div>
  )
}

function RenameAccountModal({
  open,
  account,
  onClose,
  onSubmit,
}: {
  open: boolean
  account: BusinessAccountRow | null
  onClose: () => void
  onSubmit: (name: string) => Promise<void>
}) {
  const { t } = useTranslation()
  const [name, setName] = useState('')
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) {
      setName('')
      setError(null)
      setProcessing(false)
      return
    }
    setName(account?.name || account?.template_name_fa || '')
    setError(null)
    setProcessing(false)
  }, [open, account])

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) {
      setError(t('desktop.required_field'))
      return
    }
    setProcessing(true)
    setError(null)
    try {
      await onSubmit(trimmed)
    } catch (err) {
      setError(getApiErrorMessage(err))
    } finally {
      setProcessing(false)
    }
  }

  return (
    <Modal open={open} onClose={() => !processing && onClose()} title={t('desktop.edit_account_name')}>
      <form onSubmit={(event) => void submit(event)} className="form-grid">
        {error ? <div className="alert-error">{error}</div> : null}
        <label>
          {t('desktop.name')}
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={160}
            autoFocus
            required
          />
        </label>
        <div className="form-actions">
          <button type="button" className="btn-secondary" disabled={processing} onClick={onClose}>
            {t('desktop.cancel')}
          </button>
          <button type="submit" className="btn-primary" disabled={processing}>
            {processing ? t('desktop.processing') : t('desktop.save')}
          </button>
        </div>
      </form>
    </Modal>
  )
}

function DeleteAccountModal({
  open,
  account,
  onClose,
  onSubmit,
}: {
  open: boolean
  account: BusinessAccountRow | null
  onClose: () => void
  onSubmit: () => Promise<void>
}) {
  const { t } = useTranslation()
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const blocked = Boolean(account?.has_transactions)
  const title = account?.name || account?.template_name_fa || t('desktop.account')

  useEffect(() => {
    if (!open) {
      setError(null)
      setProcessing(false)
    }
  }, [open])

  const submit = async () => {
    if (blocked) return
    setProcessing(true)
    setError(null)
    try {
      await onSubmit()
    } catch (err) {
      setError(getApiErrorMessage(err))
    } finally {
      setProcessing(false)
    }
  }

  return (
    <Modal open={open} onClose={() => !processing && onClose()} title={t('desktop.delete_account')}>
      <div className="form-grid">
        {error ? <div className="alert-error">{error}</div> : null}
        {blocked ? (
          <p className="acc-create-confirm__warn">{t('desktop.account_has_tx_delete_blocked')}</p>
        ) : (
          <>
            <p className="muted mb-0">{t('desktop.confirm_delete_account_text')}</p>
            <p className="acc-create-confirm__warn">{t('desktop.delete_account_warning')}</p>
          </>
        )}
        {account ? (
          <div className="warehouse-transfer-delete-card">
            <div className="fw-semibold">{title}</div>
          </div>
        ) : null}
        <div className="form-actions">
          <button type="button" className="btn-secondary" disabled={processing} onClick={onClose}>
            {blocked ? t('desktop.close') : t('desktop.cancel')}
          </button>
          {blocked ? null : (
            <button type="button" className="btn-danger" disabled={processing} onClick={() => void submit()}>
              {processing ? t('desktop.processing') : t('desktop.delete_account')}
            </button>
          )}
        </div>
      </div>
    </Modal>
  )
}

function DeactivateAccountModal({
  open,
  account,
  onClose,
  onSubmit,
}: {
  open: boolean
  account: BusinessAccountRow | null
  onClose: () => void
  onSubmit: () => Promise<void>
}) {
  const { t } = useTranslation()
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const protectedAccount = Boolean(account && isProtectedAccount(account))
  const hasBalance = Boolean(account && accountBalance(account) > 0)
  const blocked = protectedAccount || hasBalance
  const title = account?.name || account?.template_name_fa || t('desktop.account')
  const blockedText = protectedAccount
    ? t('desktop.cannot_deactivate_capital_or_sell')
    : t('desktop.cannot_deactivate_with_balance')

  useEffect(() => {
    if (!open) {
      setError(null)
      setProcessing(false)
    }
  }, [open])

  const submit = async () => {
    if (blocked) return
    setProcessing(true)
    setError(null)
    try {
      await onSubmit()
    } catch (err) {
      setError(getApiErrorMessage(err))
    } finally {
      setProcessing(false)
    }
  }

  return (
    <Modal open={open} onClose={() => !processing && onClose()} title={t('desktop.deactivate')}>
      <div className="form-grid">
        {error ? <div className="alert-error">{error}</div> : null}
        {blocked ? (
          <p className="acc-create-confirm__warn">{blockedText}</p>
        ) : (
          <p className="muted mb-0">{t('desktop.confirm_deactivate_account')}</p>
        )}
        {account ? (
          <div className="warehouse-transfer-delete-card">
            <div className="fw-semibold">{title}</div>
          </div>
        ) : null}
        <div className="form-actions">
          <button type="button" className="btn-secondary" disabled={processing} onClick={onClose}>
            {blocked ? t('desktop.close') : t('desktop.cancel')}
          </button>
          {blocked ? null : (
            <button type="button" className="btn-primary" disabled={processing} onClick={() => void submit()}>
              {processing ? t('desktop.processing') : t('desktop.deactivate')}
            </button>
          )}
        </div>
      </div>
    </Modal>
  )
}

function CreateAccountModal({
  open,
  onClose,
  templates,
  hasCapital,
  hasSell,
  locale,
  onSubmit,
}: {
  open: boolean
  onClose: () => void
  templates: AccountTemplateRow[]
  hasCapital: boolean
  hasSell: boolean
  locale: 'fa' | 'ps' | 'en'
  onSubmit: (payload: {
    account_template_id: string
    type: string
    name: string
    set_as_capital: boolean
    set_as_sell: boolean
  }) => Promise<void>
}) {
  const { t } = useTranslation()
  const [step, setStep] = useState<1 | 2>(1)
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [templateId, setTemplateId] = useState('')
  const [type, setType] = useState('cash')
  const [name, setName] = useState('')
  const [asCapital, setAsCapital] = useState(false)
  const [asSell, setAsSell] = useState(false)

  useEffect(() => {
    if (!open) {
      setStep(1)
      setError(null)
      setTemplateId('')
      setType('cash')
      setName('')
      setAsCapital(false)
      setAsSell(false)
      setProcessing(false)
    }
  }, [open])

  const selectedTemplate = templates.find((tpl) => String(tpl.id) === String(templateId))
  const typeLabel =
    type === 'cash' ? t('desktop.cash') : type === 'bank' ? t('desktop.bank') : t('desktop.etc')
  const displayName =
    name.trim() ||
    (selectedTemplate ? templateDisplayName(selectedTemplate, locale) : t('desktop.account'))

  const goConfirm = (event: FormEvent) => {
    event.preventDefault()
    setError(null)
    if (!templateId) {
      setError(t('desktop.required_field'))
      return
    }
    setStep(2)
  }

  const submit = async () => {
    setProcessing(true)
    setError(null)
    try {
      await onSubmit({
        account_template_id: templateId,
        type,
        name,
        set_as_capital: asCapital,
        set_as_sell: asSell,
      })
    } catch (err) {
      setError(getApiErrorMessage(err))
      setStep(1)
    } finally {
      setProcessing(false)
    }
  }

  return (
    <Modal
      open={open}
      onClose={() => !processing && onClose()}
      title={
        step === 1 ? t('desktop.create_account') : t('desktop.confirm_create_account_title')
      }
      wide
    >
      {step === 1 ? (
        <form onSubmit={goConfirm} className="form-grid">
          {error ? <div className="alert-error">{error}</div> : null}
          <div className="acc-create-hint">
            <p>{t('desktop.create_account_permanent_note')}</p>
            <p>{t('desktop.create_account_capital_sell_note')}</p>
          </div>
          <label>
            {t('desktop.currency')}
            <Select value={templateId} onChange={(e) => setTemplateId(e.target.value)} required>
              <option value="">{t('desktop.select')}</option>
              {templates.map((tpl) => (
                <option key={tpl.id} value={tpl.id}>
                  {templateDisplayName(tpl, locale)} - {localizeCurrency(tpl.currency, t)}
                </option>
              ))}
            </Select>
          </label>
          <label>
            {t('desktop.account_type')}
            <Select value={type} onChange={(e) => setType(e.target.value)}>
              <option value="cash">{t('desktop.cash')}</option>
              <option value="bank">{t('desktop.bank')}</option>
              <option value="etc">{t('desktop.etc')}</option>
            </Select>
          </label>
          <label>
            {t('desktop.name')}
            <input value={name} onChange={(e) => setName(e.target.value)} />
          </label>
          {!hasCapital ? (
            <label className="check-row">
              <input
                type="checkbox"
                checked={asCapital}
                onChange={(e) => setAsCapital(e.target.checked)}
              />
              {t('desktop.set_as_capital')}
            </label>
          ) : null}
          {!hasSell ? (
            <label className="check-row">
              <input
                type="checkbox"
                checked={asSell}
                onChange={(e) => setAsSell(e.target.checked)}
              />
              {t('desktop.set_as_sell')}
            </label>
          ) : null}
          <div className="form-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>
              {t('desktop.close')}
            </button>
            <button type="submit" className="btn-primary" disabled={!templateId}>
              {t('desktop.continue')}
            </button>
          </div>
        </form>
      ) : (
        <div className="form-grid">
          {error ? <div className="alert-error">{error}</div> : null}
          <div className="acc-create-confirm">
            <p className="acc-create-confirm__warn">{t('desktop.create_account_confirm_warn')}</p>
            <ul className="acc-create-confirm__list">
              <li>
                <strong>{t('desktop.name')}:</strong> {displayName}
              </li>
              <li>
                <strong>{t('desktop.currency')}:</strong>{' '}
                {localizeCurrency(selectedTemplate?.currency, t)}
              </li>
              <li>
                <strong>{t('desktop.account_type')}:</strong> {typeLabel}
              </li>
              <li>
                <strong>{t('desktop.capital')}:</strong>{' '}
                {asCapital ? t('desktop.yes') : t('desktop.no')}
              </li>
              <li>
                <strong>{t('desktop.sell_account')}:</strong>{' '}
                {asSell ? t('desktop.yes') : t('desktop.no')}
              </li>
            </ul>
            <p>{t('desktop.create_account_capital_sell_note')}</p>
            {(asCapital || asSell) && (
              <p className="acc-create-confirm__warn">{t('desktop.note_account_locked')}</p>
            )}
          </div>
          <div className="form-actions">
            <button
              type="button"
              className="btn-secondary"
              disabled={processing}
              onClick={() => setStep(1)}
            >
              {t('desktop.back')}
            </button>
            <button
              type="button"
              className="btn-primary"
              disabled={processing}
              onClick={() => void submit()}
            >
              {processing ? t('desktop.processing') : t('desktop.confirm_create_account')}
            </button>
          </div>
        </div>
      )}
    </Modal>
  )
}

