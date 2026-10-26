import { Select } from '@/components/inputs/SearchableSelect'
import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

import type { PublicExchangeRateRow } from '@/lib/user'
import { localizeCurrency } from '@/lib/currency'

function normalizeCurrency(value?: string | null): string {
  return String(value || '').trim().toUpperCase() || '—'
}

function normalizeCurrencyName(value: string | undefined | null, fallbackCode: string): string {
  const normalized = String(value || '').trim()
  return normalized || normalizeCurrency(fallbackCode)
}

function pairKeyOf(a: string, b: string): string {
  return [normalizeCurrency(a), normalizeCurrency(b)].sort().join('__')
}

function formatNumber(value: string | number): string {
  const amount = Number(value)
  if (!Number.isFinite(amount)) return '—'
  return amount.toLocaleString('en-US', {
    minimumFractionDigits: amount % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 6,
  })
}

type Props = {
  rates: PublicExchangeRateRow[]
}

export function ExchangeRateCalculator({ rates }: Props) {
  const { t } = useTranslation()
  const [selectedPairKey, setSelectedPairKey] = useState('')
  const [calcFrom, setCalcFrom] = useState('')
  const [calcTo, setCalcTo] = useState('')
  const [amountText, setAmountText] = useState('1')

  const rateIndex = useMemo(() => {
    const map = new Map<string, number>()
    rates.forEach((rate) => {
      const from = normalizeCurrency(rate.currency_code || rate.currency)
      const to = normalizeCurrency(rate.to_currency_code || rate.to_currency)
      const value = Number(rate.rate)
      if (!Number.isFinite(value) || value <= 0) return
      map.set(`${from}__${to}`, value)
    })
    return map
  }, [rates])

  const pairOptions = useMemo(() => {
    const map = new Map<
      string,
      { key: string; aCode: string; aName: string; bCode: string; bName: string }
    >()
    rates.forEach((rate) => {
      const fromCode = normalizeCurrency(rate.currency_code || rate.currency)
      const toCode = normalizeCurrency(rate.to_currency_code || rate.to_currency)
      if (fromCode === toCode) return
      const key = pairKeyOf(fromCode, toCode)
      if (map.has(key)) return
      map.set(key, {
        key,
        aCode: fromCode,
        aName: normalizeCurrencyName(rate.currency_name, fromCode),
        bCode: toCode,
        bName: normalizeCurrencyName(rate.to_currency_name, toCode),
      })
    })
    return Array.from(map.values()).sort((a, b) => a.key.localeCompare(b.key))
  }, [rates])

  useEffect(() => {
    if (!pairOptions.length) {
      setSelectedPairKey('')
      setCalcFrom('')
      setCalcTo('')
      return
    }
    const selected = pairOptions.find((p) => p.key === selectedPairKey) || pairOptions[0]
    if (selected.key !== selectedPairKey) setSelectedPairKey(selected.key)
    const validCodes = [selected.aCode, selected.bCode]
    if (!validCodes.includes(calcFrom)) setCalcFrom(selected.aCode)
    if (!validCodes.includes(calcTo) || calcTo === calcFrom) setCalcTo(selected.bCode)
  }, [pairOptions, selectedPairKey, calcFrom, calcTo])

  const selectedPair = useMemo(
    () => pairOptions.find((p) => p.key === selectedPairKey) || null,
    [pairOptions, selectedPairKey],
  )

  const directionOptions = useMemo(() => {
    if (!selectedPair) return []
    return [
      { code: selectedPair.aCode, name: selectedPair.aName },
      { code: selectedPair.bCode, name: selectedPair.bName },
    ]
  }, [selectedPair])

  const multiplier = useMemo(() => {
    if (!calcFrom || !calcTo || calcFrom === calcTo) return null
    const direct = rateIndex.get(`${calcFrom}__${calcTo}`)
    if (Number.isFinite(direct) && (direct || 0) > 0) return direct as number
    const reverse = rateIndex.get(`${calcTo}__${calcFrom}`)
    if (Number.isFinite(reverse) && (reverse || 0) > 0) return 1 / (reverse as number)
    return null
  }, [rateIndex, calcFrom, calcTo])

  const amountNumber = Number(amountText)
  const result =
    Number.isFinite(amountNumber) && amountNumber >= 0 && Number.isFinite(multiplier || NaN)
      ? amountNumber * (multiplier as number)
      : null

  const pushKey = (key: string) => {
    setAmountText((prev) => {
      const current = String(prev || '0')
      if (key === 'C') return '0'
      if (key === 'DEL') {
        const next = current.slice(0, -1)
        return next.length ? next : '0'
      }
      if (key === '.') return current.includes('.') ? current : `${current}.`
      if (current === '0') return key
      return `${current}${key}`
    })
  }

  return (
    <div className="xrate-calculator">
      <div className="xrate-calculator__head">
        <h3>{t('desktop.exchange_calculator_title')}</h3>
        <p className="muted">{t('desktop.exchange_calculator_hint')}</p>
      </div>

      <div className="form-field">
        <label>{t('desktop.exchange_pair')}</label>
        <Select value={selectedPairKey} onChange={(e) => setSelectedPairKey(e.target.value)}>
          {pairOptions.map((pair) => (
            <option key={pair.key} value={pair.key}>
              {pair.aName} ({localizeCurrency(pair.aCode, t)}) - {pair.bName} (
              {localizeCurrency(pair.bCode, t)})
            </option>
          ))}
        </Select>
      </div>

      <div className="xrate-calculator__dirs">
        <div className="form-field">
          <label>{t('desktop.exchange_from')}</label>
          <Select
            value={calcFrom}
            onChange={(e) => {
              const nextFrom = e.target.value
              setCalcFrom(nextFrom)
              if (nextFrom === calcTo) {
                setCalcTo(directionOptions.find((opt) => opt.code !== nextFrom)?.code || '')
              }
            }}
          >
            {directionOptions.map((currency) => (
              <option key={`from-${currency.code}`} value={currency.code}>
                {currency.name} ({localizeCurrency(currency.code, t)})
              </option>
            ))}
          </Select>
        </div>
        <div className="form-field">
          <label>{t('desktop.exchange_to')}</label>
          <Select
            value={calcTo}
            onChange={(e) => {
              const nextTo = e.target.value
              setCalcTo(nextTo)
              if (nextTo === calcFrom) {
                setCalcFrom(directionOptions.find((opt) => opt.code !== nextTo)?.code || '')
              }
            }}
          >
            {directionOptions.map((currency) => (
              <option key={`to-${currency.code}`} value={currency.code}>
                {currency.name} ({localizeCurrency(currency.code, t)})
              </option>
            ))}
          </Select>
        </div>
      </div>

      <div className="xrate-calculator__display">
        <div className="muted">{t('desktop.amount')}</div>
        <div className="xrate-calculator__amount">{formatNumber(amountText)}</div>
        <div className="muted" style={{ marginTop: 8 }}>
          {t('desktop.exchange_result')}
        </div>
        <div className="xrate-calculator__result">
          {result === null
            ? t('desktop.exchange_no_path')
            : `${formatNumber(result)} ${localizeCurrency(calcTo, t)}`}
        </div>
      </div>

      <div className="xrate-keypad">
        {['7', '8', '9', '4', '5', '6', '1', '2', '3', '.', '0', 'DEL'].map((key) => (
          <button
            key={key}
            type="button"
            className={`xrate-key${key === 'DEL' ? ' xrate-key--accent' : ''}`}
            onClick={() => pushKey(key)}
          >
            {key === 'DEL' ? '⌫' : key}
          </button>
        ))}
        <button type="button" className="xrate-key xrate-key--accent xrate-key--wide" onClick={() => pushKey('C')}>
          C
        </button>
      </div>
    </div>
  )
}
