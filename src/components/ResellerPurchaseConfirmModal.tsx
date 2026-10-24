import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

import { Modal } from '@/components/ui/Modal'

type Props = {
  open: boolean
  quantity: number
  packTotalLabel: string
  walletBalanceLabel: string
  confirming: boolean
  onClose: () => void
  onConfirm: () => void
}

export function ResellerPurchaseConfirmModal({
  open,
  quantity,
  packTotalLabel,
  walletBalanceLabel,
  confirming,
  onClose,
  onConfirm,
}: Props) {
  const { t } = useTranslation()

  return (
    <Modal
      open={open}
      onClose={() => (!confirming ? onClose() : undefined)}
      title={t('desktop.reseller_buy_confirm_title')}
    >
      <p>{t('desktop.reseller_buy_confirm_desc')}</p>
      <ul className="reseller-quote-list">
        <li>
          <span>{t('desktop.reseller_quantity')}</span>
          <strong>{quantity}</strong>
        </li>
        <li>
          <span>{t('desktop.reseller_confirm_pack_total')}</span>
          <strong>{packTotalLabel}</strong>
        </li>
        <li>
          <span>{t('desktop.reseller_confirm_wallet')}</span>
          <strong>{walletBalanceLabel}</strong>
        </li>
      </ul>
      <p>
        {t('desktop.reseller_buy_confirm_terms_hint')}{' '}
        <Link to="/reseller-terms" target="_blank" rel="noreferrer">
          {t('desktop.reseller_terms_link')}
        </Link>
      </p>
      <div className="form-actions" style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 12 }}>
        <button type="button" className="btn-secondary" disabled={confirming} onClick={onClose}>
          {t('desktop.close')}
        </button>
        <button type="button" className="btn-primary" disabled={confirming} onClick={onConfirm}>
          {confirming ? t('desktop.processing') : t('desktop.reseller_buy_confirm_submit')}
        </button>
      </div>
    </Modal>
  )
}
