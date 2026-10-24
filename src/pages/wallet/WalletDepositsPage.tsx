import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useShallow } from 'zustand/react/shallow'

import { getApiErrorMessage } from '@/lib/auth'
import { formatJalaliSlash } from '@/lib/datetime'
import { fetchWalletData } from '@/lib/user'
import { useAuthStore } from '@/store/useAuthStore'
import { useLocaleStore } from '@/store/useLocaleStore'

type DepositRow = {
  id?: number | string
  amount?: number
  source?: string
  status?: string
  date?: string
  created_at?: string
}

export function WalletDepositsPage() {
  const { t } = useTranslation()
  const locale = useLocaleStore((s) => s.language)
  const { token } = useAuthStore(useShallow((state) => ({ token: state.token })))
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deposits, setDeposits] = useState<DepositRow[]>([])

  useEffect(() => {
    if (!token) return
    const loadData = async () => {
      setLoading(true)
      setError(null)
      try {
        const data = await fetchWalletData(token)
        const incoming = Array.isArray(data.userDeposits) ? (data.userDeposits as DepositRow[]) : []
        setDeposits(
          incoming
            .slice()
            .sort(
              (a, b) =>
                new Date(b.created_at || b.date || 0).getTime() -
                new Date(a.created_at || a.date || 0).getTime(),
            ),
        )
      } catch (err) {
        setDeposits([])
        setError(getApiErrorMessage(err))
      } finally {
        setLoading(false)
      }
    }
    void loadData()
  }, [token])

  return (
    <div className="wallet-v2-wrap" dir="rtl">
      <div className="wallet-transfer-soon-card wallet-transfer-soon-card--start">
        <div className="wallet-transfer-soon-card__head">
          <h4>{t('desktop.deposits')}</h4>
          <Link to="/wallet" className="wallet-v2-action-link">
            {t('desktop.back_to_wallet')}
          </Link>
        </div>

        {error ? <div className="alert-error">{error}</div> : null}

        {loading ? (
          <p className="muted">
            <i className="fa-solid fa-spinner fa-spin" /> {t('desktop.loading')}
          </p>
        ) : deposits.length === 0 ? (
          <div className="wallet-v2-empty">{t('desktop.no_record_found')}</div>
        ) : (
          <div className="wallet-v2-transactions">
            <table className="wallet-v2-table">
              <thead>
                <tr>
                  <th>{t('desktop.amount')}</th>
                  <th>{t('desktop.source')}</th>
                  <th>{t('desktop.status')}</th>
                  <th>{t('desktop.date')}</th>
                </tr>
              </thead>
              <tbody>
                {deposits.map((item) => (
                  <tr key={String(item.id)}>
                    <td>
                      {Number(item.amount || 0).toLocaleString('en-US')} {t('desktop.afn')}
                    </td>
                    <td>{item.source || '—'}</td>
                    <td>{item.status || '—'}</td>
                    <td>{formatJalaliSlash(item.date || item.created_at, locale)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
