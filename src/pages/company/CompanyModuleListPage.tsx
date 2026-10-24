import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { useOutletContext, useParams, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useShallow } from 'zustand/react/shallow'

import { formatMoney } from '@/lib/companyDashboard'
import { localizeCurrency } from '@/lib/currency'
import {
  fetchBusinessAccountsList,
  fetchBusinessCustomers,
  fetchBusinessExpenses,
  fetchBusinessItems,
  fetchBusinessSales,
  fetchBusinessVendors,
} from '@/lib/business'
import { getApiErrorMessage } from '@/lib/auth'
import type { BusinessShowData } from '@/lib/user'
import { useAuthStore } from '@/store/useAuthStore'

type CompanyOutletContext = {
  business: BusinessShowData
}

type Column = {
  key: string
  label: string
  render?: (row: Record<string, unknown>) => ReactNode
}

type ModuleKind =
  | 'customers'
  | 'vendors'
  | 'accounts'
  | 'expenses'
  | 'sales'
  | 'items'
  | 'raw-materials'

function debtSummary(
  debts: Array<{ currency?: string | null; amount?: number | string | null }> | undefined,
  t: (key: string) => string,
): string {
  if (!debts?.length) return '0'
  return debts
    .map((d) => `${formatMoney(d.amount)} ${localizeCurrency(d.currency, t)}`)
    .join(' | ')
}

export function CompanyModuleListPage({ module }: { module: ModuleKind }) {
  const { t } = useTranslation()
  const { companyId = '' } = useParams()
  const [searchParams] = useSearchParams()
  const { business } = useOutletContext<CompanyOutletContext>()
  const token = useAuthStore(useShallow((state) => state.token))
  const [rows, setRows] = useState<Record<string, unknown>[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const columns = useMemo<Column[]>(() => {
    switch (module) {
      case 'customers':
        return [
          { key: 'name', label: t('desktop.name') },
          { key: 'phone', label: t('desktop.phone') },
          {
            key: 'debts',
            label: t('desktop.receivables'),
            render: (row) => debtSummary(row.customerDebts as never, t),
          },
        ]
      case 'vendors':
        return [
          { key: 'name', label: t('desktop.name') },
          { key: 'phone', label: t('desktop.phone') },
          {
            key: 'debts',
            label: t('desktop.payables'),
            render: (row) => debtSummary(row.vendorDebts as never, t),
          },
        ]
      case 'accounts':
        return [
          { key: 'name', label: t('desktop.name') },
          { key: 'type', label: t('desktop.status') },
          { key: 'currency', label: t('desktop.currency') },
          {
            key: 'balance',
            label: t('desktop.balance'),
            render: (row) => formatMoney(row.balance as never),
          },
        ]
      case 'expenses':
        return [
          { key: 'date', label: t('desktop.date') },
          { key: 'account_name', label: t('desktop.account') },
          {
            key: 'amount',
            label: t('desktop.amount'),
            render: (row) =>
              `${formatMoney(row.amount as never)} ${localizeCurrency(String(row.currency ?? ''), t)}`,
          },
          { key: 'remark', label: t('desktop.status') },
        ]
      case 'sales':
        return [
          { key: 'invoice_number', label: '#' },
          { key: 'customer_name', label: t('desktop.customers') },
          {
            key: 'total_price',
            label: t('desktop.amount'),
            render: (row) =>
              `${formatMoney(row.total_price as never)} ${localizeCurrency(String(row.currency ?? ''), t)}`,
          },
          { key: 'created_at', label: t('desktop.date') },
        ]
      case 'items':
      case 'raw-materials':
        return [
          { key: 'name', label: t('desktop.name') },
          { key: 'code', label: t('desktop.company_id') },
          {
            key: 'stock',
            label: t('desktop.out_of_stock'),
            render: (row) => formatMoney(row.stock as never),
          },
        ]
      default:
        return []
    }
  }, [module, t])

  useEffect(() => {
    if (!token || !companyId) return
    let active = true
    setLoading(true)
    setError(null)

    const fil = searchParams.get('fil') || undefined

    const loader = async () => {
      switch (module) {
        case 'customers':
          return fetchBusinessCustomers(token, companyId, fil)
        case 'vendors':
          return fetchBusinessVendors(token, companyId, fil)
        case 'accounts':
          return fetchBusinessAccountsList(token, companyId)
        case 'expenses':
          return fetchBusinessExpenses(token, companyId).then((data) => data.expenses)
        case 'sales':
          return fetchBusinessSales(token, companyId).then((data) => data.sales)
        case 'items':
          return fetchBusinessItems(token, companyId, 'product')
        case 'raw-materials':
          return fetchBusinessItems(token, companyId, 'raw_material')
        default:
          return []
      }
    }

    void loader()
      .then((data) => {
        if (!active) return
        setRows((data as Record<string, unknown>[]) ?? [])
      })
      .catch((err) => {
        if (!active) return
        setError(getApiErrorMessage(err))
        setRows([])
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [token, companyId, module, searchParams])

  return (
    <div>
      <section className="page-header">
        <p className="muted">{business.company.name}</p>
      </section>

      {error ? <div className="alert-error">{error}</div> : null}

      <section className="page-card">
        {loading ? (
          <p className="muted">{t('desktop.loading')}</p>
        ) : rows.length === 0 ? (
          <p className="muted">{t('desktop.no_companies')}</p>
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  {columns.map((col) => (
                    <th key={col.key}>{col.label}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row, index) => (
                  <tr key={String(row.id ?? index)}>
                    {columns.map((col) => (
                      <td key={col.key}>
                        {col.render
                          ? col.render(row)
                          : String(row[col.key] ?? '—')}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  )
}
