import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

export function WalletTransferPage() {
  const { t } = useTranslation()

  return (
    <div className="wallet-v2-wrap" dir="rtl">
      <div className="wallet-transfer-soon-card">
        <div className="wallet-transfer-icon">
          <i className="fa-solid fa-right-left" />
        </div>
        <h4>{t('desktop.wallet_transfer')}</h4>
        <p>{t('desktop.transfer_soon')}</p>

        <div className="wallet-transfer-rules">
          <h6>{t('desktop.transfer_conditions')}</h6>
          <ul>
            <li>{t('desktop.transfer_condition_identity')}</li>
            <li>{t('desktop.transfer_condition_premium')}</li>
          </ul>
        </div>

        <div className="wallet-sub-back">
          <Link to="/wallet" className="wallet-v2-action-link">
            <i className="fa-solid fa-arrow-right" />
            {t('desktop.back_to_wallet')}
          </Link>
        </div>
      </div>
    </div>
  )
}
