import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

import { Modal } from '@/components/ui/Modal'

type Props = {
  open: boolean
  companyName: string
  years: number
  customerTotalLabel: string
  resellerPayLabel: string
  boxBalanceLabel: string
  confirming: boolean
  onClose: () => void
  onConfirm: () => void
}

export function ResellerSellConfirmModal({
  open,
  companyName,
  years,
  customerTotalLabel,
  resellerPayLabel,
  boxBalanceLabel,
  confirming,
  onClose,
  onConfirm,
}: Props) {
  const { t } = useTranslation()

  return (
    <Modal
      open={open}
      onClose={() => (!confirming ? onClose() : undefined)}
      title={t('desktop.reseller_sell_confirm_title')}
    >
      <p>{t('desktop.reseller_sell_confirm_desc')}</p>
      <ul className="reseller-quote-list">
        <li>
          <span>{t('desktop.name')}</span>
          <strong>{companyName}</strong>
        </li>
        <li>
          <span>{t('desktop.reseller_sell_years')}</span>
          <strong>{t('desktop.reseller_sell_year_option', { count: years })}</strong>
        </li>
        <li>
          <span>{t('desktop.reseller_sell_customer_total')}</span>
          <strong>{customerTotalLabel}</strong>
        </li>
        <li>
          <span>{t('desktop.reseller_sell_reseller_pay')}</span>
          <strong>{resellerPayLabel}</strong>
        </li>
        <li>
          <span>{t('desktop.reseller_box_balance')}</span>
          <strong>{boxBalanceLabel}</strong>
        </li>
      </ul>
      <div className="form-actions" style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 12 }}>
        <button type="button" className="btn-secondary" disabled={confirming} onClick={onClose}>
          {t('desktop.close')}
        </button>
        <button type="button" className="btn-primary" disabled={confirming} onClick={onConfirm}>
          {confirming ? t('desktop.processing') : t('desktop.reseller_sell_confirm_submit')}
        </button>
      </div>
    </Modal>
  )
}
