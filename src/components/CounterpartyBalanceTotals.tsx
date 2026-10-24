import { useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import { useUserCacheKey } from '@/hooks/useUserCacheKey'
import { localizeCurrency } from '@/lib/currency'
import type { CounterpartyBalanceLine, CounterpartyRow } from '@/lib/user'
import { useAuthStore } from '@/store/useAuthStore'
import { hydrateListsCache, useListsCacheStore } from '@/store/useListsCacheStore'

type Props = {
  rows?: CounterpartyRow[]
}

function addAmount(bucket: Map<string, number>, currency: string, amount: number) {
  bucket.set(currency, (bucket.get(currency) || 0) + amount)
}

function currencyOrder(code: string): number {
  if (code === 'AFN') return 0
  if (code === 'USD') return 1
  if (code === 'EUR') return 2
  return 3
}

/** Always derive from sums so labels stay correct even if API balance_type is stale. */
function lineParts(line: CounterpartyBalanceLine) {
  const currency = String(line.currency || 'AFN').toUpperCase()
  const debit = Number(line.debit_sum || 0)
  const credit = Number(line.credit_sum || 0)
  const hasSums = line.debit_sum != null || line.credit_sum != null
  if (hasSums) {
    const net = debit - credit
    return {
      currency,
      // رفت بیشتر => طلب؛ آمد بیشتر => باقی
      talab: net > 0 ? net : 0,
      baqi: net < 0 ? Math.abs(net) : 0,
    }
  }
  const amount = Math.abs(Number(line.net_balance || 0))
  return {
    currency,
    talab: line.balance_type === 'talab' ? amount : 0,
    baqi: line.balance_type === 'baqi' ? amount : 0,
  }
}

function totalsByCurrency(rows: CounterpartyRow[]) {
  const talab = new Map<string, number>()
  const baqi = new Map<string, number>()
  rows.forEach((row) => {
    ;(row.balance_lines ?? []).forEach((line) => {
      const parts = lineParts(line)
      if (parts.talab) addAmount(talab, parts.currency, parts.talab)
      if (parts.baqi) addAmount(baqi, parts.currency, parts.baqi)
    })
  })
  const codes = [...new Set([...talab.keys(), ...baqi.keys()])].sort(
    (a, b) => currencyOrder(a) - currencyOrder(b) || a.localeCompare(b),
  )
  const currencies = codes.length > 0 ? codes : ['AFN']
  return {
    talab: currencies.map((code) => [code, talab.get(code) || 0] as [string, number]),
    baqi: currencies.map((code) => [code, baqi.get(code) || 0] as [string, number]),
    balance: currencies.map((code) => [code, (talab.get(code) || 0) - (baqi.get(code) || 0)] as [string, number]),
  }
}

export function CounterpartyBalanceTotals({ rows }: Props) {
  const { t } = useTranslation()
  const token = useAuthStore((state) => state.token)
  const userKey = useUserCacheKey()
  const ensureCounterparties = useListsCacheStore((state) => state.ensureCounterparties)
  const cachedRows = useListsCacheStore((state) =>
    rows ? null : (state.getCounterparties(userKey)?.counterparties ?? null),
  )
  const fetchedAt = useListsCacheStore((state) =>
    rows ? 0 : (state.bundles[userKey]?.counterpartiesFetchedAt ?? 0),
  )

  useEffect(() => {
    if (rows || !token) return
    void hydrateListsCache(userKey).then(() => ensureCounterparties(token, userKey))
  }, [rows, token, userKey, ensureCounterparties])

  const source = rows ?? cachedRows ?? []
  const totals = useMemo(() => totalsByCurrency(source), [source, fetchedAt])

  return (
    <div className="hy-dues">
      <TotalsCard kind="talab" label={t('desktop.hy_talab_sum')} amounts={totals.talab} t={t} />
      <TotalsCard kind="baqi" label={t('desktop.hy_baqi_sum')} amounts={totals.baqi} t={t} />
      <TotalsCard kind="balance" label={t('desktop.hy_dues_balance')} amounts={totals.balance} t={t} signed />
    </div>
  )
}

function balanceTone(amounts: [string, number][]): 'up' | 'down' | 'flat' | 'mixed' {
  const nonzero = amounts.map(([, amount]) => amount).filter((amount) => amount !== 0)
  if (nonzero.length === 0) return 'flat'
  const hasPlus = nonzero.some((amount) => amount > 0)
  const hasMinus = nonzero.some((amount) => amount < 0)
  if (hasPlus && hasMinus) return 'mixed'
  return hasMinus ? 'down' : 'up'
}

function TotalsCard({
  kind,
  label,
  amounts,
  t,
  signed = false,
}: {
  kind: 'talab' | 'baqi' | 'balance'
  label: string
  amounts: [string, number][]
  t: (key: string) => string
  signed?: boolean
}) {
  const shown = amounts.length > 0 ? amounts : ([['AFN', 0]] as [string, number][])
  const tone = kind === 'balance' ? balanceTone(shown) : null
  const icon = kind === 'talab' ? 'fa-arrow-down' : kind === 'baqi' ? 'fa-arrow-up' : 'fa-scale-balanced'

  return (
    <article className={`hy-dues__card is-${kind}${tone ? ` is-${tone}` : ''}`}>
      <div className="hy-dues__head">
        <span className="hy-dues__icon" aria-hidden>
          <i className={`fa-solid ${icon}`} />
        </span>
        <span>{label}</span>
      </div>
      <div className="hy-dues__amounts">
        {shown.map(([currency, amount]) => (
          <b key={currency} className={signed ? (amount > 0 ? 'is-plus' : amount < 0 ? 'is-minus' : '') : undefined}>
            {signed && amount > 0 ? '+' : ''}
            {amount.toLocaleString('en-US')}
            <small>{localizeCurrency(currency, t)}</small>
          </b>
        ))}
      </div>
    </article>
  )
}
