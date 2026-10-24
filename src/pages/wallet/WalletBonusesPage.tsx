import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useShallow } from 'zustand/react/shallow'

import { getApiErrorMessage } from '@/lib/auth'
import { formatJalaliSlash } from '@/lib/datetime'
import { fetchWalletData } from '@/lib/user'
import { useAuthStore } from '@/store/useAuthStore'
import { useLocaleStore } from '@/store/useLocaleStore'

type BonusRow = {
  id?: number | string
  amount?: number
  status?: string
  created_at?: string
}

export function WalletBonusesPage() {
  const { t } = useTranslation()
  const locale = useLocaleStore((s) => s.language)
  const { token } = useAuthStore(useShallow((state) => ({ token: state.token })))
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [bonuses, setBonuses] = useState<BonusRow[]>([])

  useEffect(() => {
    if (!token) return
    const loadData = async () => {
      setLoading(true)
      setError(null)
      try {
        const data = await fetchWalletData(token)
        const incoming = Array.isArray(data.bonuses) ? (data.bonuses as BonusRow[]) : []
        setBonuses(
          incoming
            .slice()
            .sort(
              (a, b) =>
                new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime(),
            ),
        )
      } catch (err) {
        setBonuses([])
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
          <h4>{t('desktop.bonuses')}</h4>
          <Link to="/wallet" className="wallet-v2-action-link">
            {t('desktop.back_to_wallet')}
          </Link>
        </div>

        {error ? <div className="alert-error">{error}</div> : null}

        {loading ? (
          <p className="muted">
            <i className="fa-solid fa-spinner fa-spin" /> {t('desktop.loading')}
          </p>
        ) : bonuses.length === 0 ? (
          <div className="wallet-v2-empty">{t('desktop.no_record_found')}</div>
        ) : (
          <div className="wallet-v2-transactions">
            <table className="wallet-v2-table">
              <thead>
                <tr>
                  <th>{t('desktop.amount')}</th>
                  <th>{t('desktop.status')}</th>
                  <th>{t('desktop.date')}</th>
                </tr>
              </thead>
              <tbody>
                {bonuses.map((item) => (
                  <tr key={String(item.id)}>
                    <td>
                      {Number(item.amount || 0).toLocaleString('en-US')} {t('desktop.afn')}
                    </td>
                    <td>{item.status || '—'}</td>
                    <td>{formatJalaliSlash(item.created_at, locale)}</td>
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
