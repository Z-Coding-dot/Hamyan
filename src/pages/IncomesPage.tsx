import { useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useShallow } from 'zustand/react/shallow'

import { JalaliDatePicker } from '@/components/inputs/JalaliDatePicker'
import { useRegisterPageRefresh } from '@/hooks/useRegisterPageRefresh'
import { useUserCacheKey } from '@/hooks/useUserCacheKey'
import { getApiErrorMessage } from '@/lib/auth'
import { localizeCurrency } from '@/lib/currency'
import { formatJalaliSlash } from '@/lib/datetime'
import { INCOME_CATEGORIES, incomeCategoryKey } from '@/lib/incomeCategories'
import { type UserAccountDeposit } from '@/lib/user'
import { useAppCacheStore } from '@/store/useAppCacheStore'
import { useAuthStore } from '@/store/useAuthStore'
import { useLocaleStore } from '@/store/useLocaleStore'

function ymd(value?: string | null): string {
  return String(value || '').slice(0, 10)
}

function isPersonalIncome(row: UserAccountDeposit): boolean {
  if (row.type !== 'credit') return false
  if (row.counterparty_id || row.counterparty_name) return false
  return true
}

export function IncomesPage() {
  const { t } = useTranslation()
  const locale = useLocaleStore((s) => s.language)
  const token = useAuthStore(useShallow((s) => s.token))
  const userKey = useUserCacheKey()
  const ensurePersonalAccounts = useAppCacheStore((s) => s.ensurePersonalAccounts)
  const cachedDeposits = useAppCacheStore((s) => s.getPersonalAccounts(userKey)?.deposits)

  const [rows, setRows] = useState<UserAccountDeposit[]>(
    (cachedDeposits ?? []).filter(isPersonalIncome),
  )
  const [category, setCategory] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [loading, setLoading] = useState(cachedDeposits == null)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(
    (force = false) => {
      if (!token) return
      if (force) setRefreshing(true)
      else if (!cachedDeposits) setLoading(true)
      setError(null)
      void ensurePersonalAccounts(token, userKey, { force })
        .then((data) => {
          setRows((data?.deposits ?? []).filter(isPersonalIncome))
        })
        .catch((err) => {
          setError(getApiErrorMessage(err))
        })
        .finally(() => {
          setLoading(false)
          setRefreshing(false)
        })
    },
    [token, userKey, cachedDeposits, ensurePersonalAccounts],
  )

  useEffect(() => {
    load(false)
  }, [load])

  const refreshPage = useCallback(() => {
    load(true)
  }, [load])
  useRegisterPageRefresh(refreshPage, refreshing)

  const visible = useMemo(() => {
    return rows.filter((row) => {
      const day = ymd(row.date)
      if (startDate && day < startDate) return false
      if (endDate && day > endDate) return false
      if (category && row.income_category !== category) return false
      return true
    })
  }, [rows, startDate, endDate, category])

  return (
    <div className="user-accounts-page hy-exp" dir="rtl">
      <div className="ea-head">
        <div>
          <h2>{t('desktop.hy_incomes_page')}</h2>
          <p>{t('desktop.hy_incomes_desc')}</p>
        </div>
      </div>

      {error ? <div className="alert-error">{error}</div> : null}

      <div className="hy-exp__filters">
        <label>
          {t('desktop.income_category')}
          <select value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="">{t('desktop.all')}</option>
            {INCOME_CATEGORIES.map((code) => (
              <option key={code} value={code}>
                {t(`desktop.income_cat_${code}`)}
              </option>
            ))}
          </select>
        </label>
        <label>
          {t('desktop.start_date')}
          <JalaliDatePicker value={startDate} onChange={setStartDate} allowEmpty />
        </label>
        <label>
          {t('desktop.end_date')}
          <JalaliDatePicker value={endDate} onChange={setEndDate} allowEmpty />
        </label>
      </div>

      <section className="hy-tx">
        <div className="hy-tx__head">
          <h5>{t('desktop.hy_incomes_page')}</h5>
        </div>
        {loading ? (
          <p className="hy-tx__empty muted">{t('desktop.loading')}</p>
        ) : visible.length === 0 ? (
          <p className="hy-tx__empty muted">{t('desktop.no_record_found')}</p>
        ) : (
          visible.map((item) => {
            const categoryKey = incomeCategoryKey(item.income_category)
            return (
              <article key={String(item.transaction_id ?? item.id)} className="hy-tx__row">
                <span className="hy-tx__icon is-in">
                  <i className="fa-solid fa-arrow-down" />
                </span>
                <span className="hy-tx__body">
                  <strong>{categoryKey ? t(categoryKey) : t('desktop.dash_inject')}</strong>
                  <small>
                    {item.account_name || t('desktop.account')} ({localizeCurrency(item.currency || 'AFN', t)})
                    {' · '}
                    <bdi>{formatJalaliSlash(item.date, locale)}</bdi>
                    {item.description ? ` · ${item.description}` : ''}
                  </small>
                </span>
                <span className="hy-tx__amount is-in">
                  <bdi>{Number(item.amount || 0).toLocaleString('en-US')}</bdi>{' '}
                  {localizeCurrency(item.currency || 'AFN', t)}
                </span>
              </article>
            )
          })
        )}
      </section>
    </div>
  )
}
