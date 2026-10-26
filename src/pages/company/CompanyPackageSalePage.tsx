import { Select } from '@/components/inputs/SearchableSelect'
import { FormEvent, useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate, useOutletContext, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useShallow } from 'zustand/react/shallow'

import { JalaliDatePicker } from '@/components/inputs/JalaliDatePicker'
import { SearchField } from '@/components/inputs/SearchField'
import { Modal } from '@/components/ui/Modal'
import { showSuccessToast } from '@/components/ui/SuccessToast'
import { getApiErrorMessage } from '@/lib/auth'
import {
  createBusinessCustomer,
  fetchBusinessAccountsList,
  fetchBusinessCustomers,
  fetchInternetPackages,
  sellInternetPackage,
  type BusinessCustomerRow,
  type CustomerInternetPackageRow,
  type InternetPackageRow,
} from '@/lib/business'
import type { InvoicePaperSize, InvoicePrintTheme } from '@/lib/invoicePrint'
import { formatMoney } from '@/lib/companyDashboard'
import { formatJalaliSlashFromYmd, todayLocalYmd } from '@/lib/datetime'
import { isBusinessAccountActive, type BusinessAccountRow, type BusinessShowData } from '@/lib/user'
import { PackageSaleBill } from '@/pages/company/PackageSaleBill'
import { SaleInvoicePrintActions } from '@/pages/company/SaleInvoicePrintActions'
import { useAuthStore } from '@/store/useAuthStore'
import { businessPath } from '@/store/useCompanyContextStore'

type CompanyOutletContext = { business: BusinessShowData }
type Step = 1 | 2 | 3 | 4

function addValidity(ymd: string, amount: number, unit: string): string {
  const [year, month, day] = ymd.split('-').map(Number)
  if (!year || !month || !day || !amount) return ymd
  const date = new Date(year, month - 1, day, 12)
  if (unit === 'month') date.setMonth(date.getMonth() + amount)
  else date.setDate(date.getDate() + amount)
  const nextMonth = String(date.getMonth() + 1).padStart(2, '0')
  const nextDay = String(date.getDate()).padStart(2, '0')
  return `${date.getFullYear()}-${nextMonth}-${nextDay}`
}

export function CompanyPackageSalePage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { companyId = '' } = useParams()
  const { business } = useOutletContext<CompanyOutletContext>()
  const token = useAuthStore(useShallow((s) => s.token))
  const canSell = Boolean(business.permissions?.canCreateSales) && business.is_active

  const [step, setStep] = useState<Step>(1)
  const [packages, setPackages] = useState<InternetPackageRow[]>([])
  const [customers, setCustomers] = useState<BusinessCustomerRow[]>([])
  const [accounts, setAccounts] = useState<BusinessAccountRow[]>([])
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [query, setQuery] = useState('')
  const [customer, setCustomer] = useState<BusinessCustomerRow | null>(null)
  const [packageId, setPackageId] = useState('')
  const [startDate, setStartDate] = useState(todayLocalYmd())
  const [endDate, setEndDate] = useState(todayLocalYmd())
  const [endTouched, setEndTouched] = useState(false)
  const [paid, setPaid] = useState('')
  const [accountId, setAccountId] = useState('')
  const [note, setNote] = useState('')
  const [sold, setSold] = useState<CustomerInternetPackageRow | null>(null)
  const [printPaperSize, setPrintPaperSize] = useState<InvoicePaperSize>('a5')
  const [printTheme, setPrintTheme] = useState<InvoicePrintTheme>('classic')
  const billRef = useRef<HTMLDivElement>(null)
  const [createOpen, setCreateOpen] = useState(false)
  const [creating, setCreating] = useState(false)
  const [createError, setCreateError] = useState<string | null>(null)
  const [newName, setNewName] = useState('')
  const [newPhone, setNewPhone] = useState('')
  const [newAddress, setNewAddress] = useState('')

  const selectedPackage = packages.find((row) => String(row.id) === packageId) ?? null
  const price = selectedPackage?.price ?? 0
  const paidNumber = Number(paid || 0)
  const remaining = Math.max(0, Math.round((price - (Number.isFinite(paidNumber) ? paidNumber : 0)) * 100) / 100)
  const activeAccounts = useMemo(
    () => accounts.filter((account) => isBusinessAccountActive(account)),
    [accounts],
  )
  const filteredCustomers = useMemo(() => {
    const needle = query.trim().toLowerCase()
    if (!needle) return customers
    return customers.filter((row) =>
      `${row.name || ''} ${row.company_name || ''} ${row.phone || ''}`.toLowerCase().includes(needle),
    )
  }, [customers, query])

  useEffect(() => {
    if (!token) return
    void (async () => {
      try {
        const [catalog, people, accountRows] = await Promise.all([
          fetchInternetPackages(token, companyId),
          fetchBusinessCustomers(token, companyId),
          fetchBusinessAccountsList(token, companyId),
        ])
        setPackages(catalog)
        setCustomers(people)
        setAccounts(accountRows)
        const sellAccount = accountRows.find((account) => account.is_sell_account && isBusinessAccountActive(account))
          ?? accountRows.find((account) => isBusinessAccountActive(account))
        if (sellAccount) setAccountId(String(sellAccount.id))
      } catch (err) {
        setError(getApiErrorMessage(err))
      }
    })()
  }, [token, companyId])

  useEffect(() => {
    if (!selectedPackage || endTouched) return
    setEndDate(addValidity(startDate, selectedPackage.validity_amount, selectedPackage.validity_unit))
  }, [selectedPackage, startDate, endTouched])

  const steps = [
    { id: 1 as const, label: t('desktop.package_sale_step_customer') },
    { id: 2 as const, label: t('desktop.package_sale_step_package') },
    { id: 3 as const, label: t('desktop.package_sale_step_payment') },
    { id: 4 as const, label: t('desktop.package_sale_step_done') },
  ]
  const unitLabel = (unit: string) => (unit === 'mb' ? t('desktop.package_unit_mb') : t('desktop.package_unit_gb'))
  const validityLabel = (amount: number, unit: string) =>
    `${amount} ${unit === 'month' ? t('desktop.package_unit_month') : t('desktop.package_unit_day')}`

  const openCreate = () => {
    const typed = query.trim()
    const looksLikePhone = /^[+0-9][\d\s()+-]{2,}$/.test(typed)
    setCreateError(null)
    setNewName(looksLikePhone ? '' : typed)
    setNewPhone(looksLikePhone ? typed.replace(/\s/g, '').slice(0, 15) : '')
    setNewAddress('')
    setCreateOpen(true)
  }

  const createCustomer = async (event: FormEvent) => {
    event.preventDefault()
    if (!token || !newName.trim()) return
    setCreating(true)
    setCreateError(null)
    try {
      const created = await createBusinessCustomer(token, companyId, {
        name: newName.trim(),
        phone: newPhone.trim() || undefined,
        address: newAddress.trim() || undefined,
        personality: 'human',
      })
      if (!created?.id) return
      setCustomers((prev) => [created, ...prev.filter((row) => row.id !== created.id)])
      setCustomer(created)
      setQuery('')
      setCreateOpen(false)
    } catch (err) {
      setCreateError(getApiErrorMessage(err))
    } finally {
      setCreating(false)
    }
  }

  const choosePackage = (row: InternetPackageRow) => {
    setPackageId(String(row.id))
    setEndTouched(false)
    setPaid(String(row.price))
  }

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    if (!token || !customer || !selectedPackage) return
    setBusy(true)
    setError(null)
    try {
      const saved = await sellInternetPackage(token, companyId, {
        package_id: selectedPackage.id,
        customer_id: customer.id,
        start_date: startDate,
        end_date: endDate,
        paid_amount: Number(paid || 0),
        company_account_id: accountId ? Number(accountId) : undefined,
        note: note.trim() || undefined,
      })
      setSold(saved ?? null)
      showSuccessToast(t('desktop.package_sold'))
      setStep(4)
    } catch (err) {
      setError(getApiErrorMessage(err))
    } finally {
      setBusy(false)
    }
  }

  if (!canSell) {
    return (
      <div className="dash-div party-page" dir="rtl">
        <div className="alert-error">{t('desktop.no_sales')}</div>
        <Link className="btn-secondary btn-sm" to={businessPath(companyId, 'customer-packages')}>
          {t('desktop.back')}
        </Link>
      </div>
    )
  }

  return (
    <div className="dash-div party-page" dir="rtl">
      <div className="party-toolbar no-print">
        <Link to={businessPath(companyId, 'customer-packages')} className="btn-secondary btn-sm">
          <i className="fa-solid fa-reply" /> {t('desktop.back')}
        </Link>
      </div>
      <div className="dash-header dash-header--section mb-3">
        <h5 className="mb-0">{t('desktop.sell_package')}</h5>
      </div>

      <div className="sale-steps" aria-label={t('desktop.sell_package')}>
        {steps.map((row) => (
          <span
            key={row.id}
            className={['sale-step-chip', step === row.id ? 'is-active' : '', step > row.id ? 'is-done' : '']
              .filter(Boolean)
              .join(' ')}
          >
            <span className="sale-step-chip__num">{row.id}</span>
            {row.label}
          </span>
        ))}
      </div>

      {error ? <div className="alert-error">{error}</div> : null}
      {packages.length === 0 && step < 4 ? <p className="muted">{t('desktop.package_empty_catalog')}</p> : null}

      {step === 1 ? (
        <div className="party-summary form-grid">
          <h6 style={{ margin: 0 }}>{t('desktop.package_sale_step_customer')}</h6>
          <SearchField
            value={query}
            onChange={setQuery}
            placeholder={t('desktop.package_search_customer')}
            autoFocus
          />
          <div className="form-actions" style={{ marginTop: 0 }}>
            <button type="button" className="btn-secondary" onClick={openCreate}>
              {t('desktop.add_customer')}
            </button>
          </div>
          {customer ? (
            <p className="muted" style={{ margin: 0 }}>
              {t('desktop.package_customer_selected')}: <strong>{customer.name || customer.company_name}</strong>
              {customer.phone ? ` · ${customer.phone}` : ''}
            </p>
          ) : null}
          <div className="package-choice">
            {filteredCustomers.length === 0 ? (
              <p className="muted" style={{ margin: 0 }}>
                {t('desktop.package_customer_missing')}{' '}
                <button type="button" className="btn-secondary btn-sm" onClick={openCreate}>
                  {t('desktop.add_customer')}
                </button>
              </p>
            ) : (
              filteredCustomers.map((row) => (
                <button
                  key={row.id}
                  type="button"
                  className={`package-choice__item${customer?.id === row.id ? ' is-selected' : ''}`}
                  onClick={() => setCustomer(row)}
                >
                  <strong>{row.name || row.company_name}</strong>
                  {row.phone ? <span dir="ltr">{row.phone}</span> : null}
                </button>
              ))
            )}
          </div>
          <div className="form-actions">
            <button type="button" className="btn-primary" disabled={!customer} onClick={() => setStep(2)}>
              {t('desktop.next_step')}
            </button>
          </div>
        </div>
      ) : null}

      {step === 2 ? (
        <div className="party-summary form-grid">
          <h6 style={{ margin: 0 }}>{t('desktop.package_sale_step_package')}</h6>
          <div className="package-choice">
            {packages.map((row) => (
              <button
                key={row.id}
                type="button"
                className={`package-choice__item${packageId === String(row.id) ? ' is-selected' : ''}`}
                onClick={() => choosePackage(row)}
              >
                <strong>{row.name}</strong>
                <span>
                  {formatMoney(row.data_amount)} {unitLabel(row.data_unit)} · {formatMoney(row.price)} ·{' '}
                  {validityLabel(row.validity_amount, row.validity_unit)}
                </span>
              </button>
            ))}
          </div>
          <label>
            {t('desktop.package_start')}
            <JalaliDatePicker
              value={startDate}
              onChange={(value) => {
                setEndTouched(false)
                setStartDate(value)
              }}
            />
          </label>
          <label>
            {t('desktop.package_end')}
            <JalaliDatePicker
              value={endDate}
              onChange={(value) => {
                setEndTouched(true)
                setEndDate(value)
              }}
            />
          </label>
          <div className="form-actions">
            <button type="button" className="btn-secondary" onClick={() => setStep(1)}>
              {t('desktop.prev_step')}
            </button>
            <button type="button" className="btn-primary" disabled={!selectedPackage} onClick={() => setStep(3)}>
              {t('desktop.next_step')}
            </button>
          </div>
        </div>
      ) : null}

      {step === 3 ? (
        <form className="party-summary form-grid" onSubmit={(event) => void submit(event)}>
          <h6 style={{ margin: 0 }}>{t('desktop.package_sale_step_payment')}</h6>
          <p className="muted" style={{ margin: 0 }}>
            {customer?.name || customer?.company_name} · {selectedPackage?.name} · {formatJalaliSlashFromYmd(startDate)}{' '}
            — {formatJalaliSlashFromYmd(endDate)}
          </p>
          <label>
            {t('desktop.package_price')}
            <input className="eng-input" dir="ltr" value={formatMoney(price)} readOnly />
          </label>
          <label>
            {t('desktop.package_paid')}
            <input
              className="eng-input"
              dir="ltr"
              inputMode="decimal"
              value={paid}
              onChange={(event) => setPaid(event.target.value)}
              required
            />
            <span className="muted small" style={{ display: 'block', marginTop: 4 }}>
              {t('desktop.package_paid_hint')} {t('desktop.package_remaining')}: {formatMoney(remaining)}
            </span>
          </label>
          <label>
            {t('desktop.payment_account')}
            <Select value={accountId} onChange={(event) => setAccountId(event.target.value)} required={price > 0}>
              <option value="">{t('desktop.select')}</option>
              {activeAccounts.map((account) => (
                <option key={account.id} value={account.id}>
                  {account.name} ({account.currency})
                </option>
              ))}
            </Select>
          </label>
          <label>
            {t('desktop.note')}
            <input value={note} onChange={(event) => setNote(event.target.value)} />
          </label>
          <div className="form-actions">
            <button type="button" className="btn-secondary" disabled={busy} onClick={() => setStep(2)}>
              {t('desktop.prev_step')}
            </button>
            <button className="btn-primary" disabled={busy || !selectedPackage}>
              {busy ? t('desktop.processing') : t('desktop.save')}
            </button>
          </div>
        </form>
      ) : null}

      <Modal open={createOpen} onClose={() => !creating && setCreateOpen(false)} title={t('desktop.add_customer')}>
        <form className="form-grid" onSubmit={(event) => void createCustomer(event)}>
          {createError ? <div className="alert-error">{createError}</div> : null}
          <label>
            {t('desktop.name')}
            <input value={newName} onChange={(event) => setNewName(event.target.value)} required />
          </label>
          <label>
            {t('desktop.phone')}
            <input
              className="eng-input"
              dir="ltr"
              value={newPhone}
              onChange={(event) => setNewPhone(event.target.value)}
            />
          </label>
          <label>
            {t('desktop.address')}
            <input value={newAddress} onChange={(event) => setNewAddress(event.target.value)} />
          </label>
          <div className="form-actions">
            <button type="button" className="btn-secondary" disabled={creating} onClick={() => setCreateOpen(false)}>
              {t('desktop.cancel')}
            </button>
            <button className="btn-primary" disabled={creating || !newName.trim()}>
              {creating ? t('desktop.processing') : t('desktop.save')}
            </button>
          </div>
        </form>
      </Modal>

      {step === 4 && customer && selectedPackage ? (
        <>
          <PackageSaleBill
            ref={billRef}
            sale={{
              id: sold?.id,
              customerName: customer.name || customer.company_name || '—',
              customerPhone: customer.phone,
              packageName: selectedPackage.name,
              dataAmount: selectedPackage.data_amount,
              dataUnit: selectedPackage.data_unit,
              validityAmount: selectedPackage.validity_amount,
              validityUnit: selectedPackage.validity_unit,
              startDate: sold?.start_date || startDate,
              endDate: sold?.end_date || endDate,
              price,
              paid: Number.isFinite(paidNumber) ? paidNumber : 0,
              remaining,
              currency: sold?.currency || activeAccounts.find((account) => String(account.id) === accountId)?.currency,
              note,
            }}
            company={business.company}
            profile={business.profile}
            printPaperSize={printPaperSize}
            printTheme={printTheme}
          />
          <div className="party-summary party-summary--complete mt-3 no-print">
            <h6 style={{ marginTop: 0 }}>{t('desktop.package_sale_done_title')}</h6>
            <SaleInvoicePrintActions
              invoiceRef={billRef}
              invoiceNumber={sold?.id ?? selectedPackage.id}
              canPrintWithEquivalent={false}
              showEquivalentInPrint={false}
              onShowEquivalentChange={() => undefined}
              onPaperSizeChange={setPrintPaperSize}
              printTheme={printTheme}
              onPrintThemeChange={setPrintTheme}
              busy={busy}
              onBusyChange={setBusy}
              onError={setError}
            />
            <div className="form-actions" style={{ justifyContent: 'center', width: '100%', maxWidth: 420 }}>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => navigate(businessPath(companyId, 'customer-packages'))}
              >
                {t('desktop.customer_packages')}
              </button>
              <button
                type="button"
                className="btn-primary"
                onClick={() => {
                  setStep(1)
                  setSold(null)
                  setCustomer(null)
                  setQuery('')
                  setPackageId('')
                  setPaid('')
                  setNote('')
                  setStartDate(todayLocalYmd())
                  setEndTouched(false)
                }}
              >
                {t('desktop.sell_package')}
              </button>
            </div>
          </div>
        </>
      ) : null}
    </div>
  )
}
