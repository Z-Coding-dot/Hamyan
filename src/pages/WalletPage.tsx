import { Select } from '@/components/inputs/SearchableSelect'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useShallow } from 'zustand/react/shallow'

import { Modal } from '@/components/ui/Modal'
import { HesabPayAccountCard } from '@/components/HesabPayAccountCard'
import { getApiErrorMessage } from '@/lib/auth'
import { formatJalaliSlash } from '@/lib/datetime'
import { fetchWalletData } from '@/lib/user'
import { whatsappChatUrl } from '@/lib/whatsapp'
import { useAuthStore } from '@/store/useAuthStore'
import { useLocaleStore } from '@/store/useLocaleStore'

const SUPPORT_WHATSAPP = '0703098630'

type WalletTx = {
  id?: string | number
  amount?: number
  type_label?: string
  source?: string
  date?: string
  created_at?: string
}

function formatGregorianYmd(value: string | null | undefined): string {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

async function downloadWalletCardImage(
  card: HTMLElement,
  amountLabel: string,
  address: string,
): Promise<void> {
  const width = Math.max(card.offsetWidth, 420)
  const height = Math.max(card.offsetHeight, 220)
  const canvas = document.createElement('canvas')
  canvas.width = width * 2
  canvas.height = height * 2
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  ctx.scale(2, 2)
  const gradient = ctx.createLinearGradient(0, 0, width, height)
  gradient.addColorStop(0, '#2e1d12')
  gradient.addColorStop(0.46, '#5c3618')
  gradient.addColorStop(1, '#f08a24')
  ctx.fillStyle = gradient
  roundRect(ctx, 0, 0, width, height, 18)
  ctx.fill()

  ctx.fillStyle = '#ffffff'
  ctx.font = '800 18px sans-serif'
  ctx.fillText('Hamyan Card', 18, 36)
  ctx.font = '12px sans-serif'
  ctx.globalAlpha = 0.9
  ctx.fillText(amountLabel, 18, 78)
  ctx.globalAlpha = 1
  ctx.font = '800 28px sans-serif'
  const balanceText = card.querySelector('.ivc-balance-value')?.textContent?.trim() || ''
  ctx.fillText(balanceText, 18, 112)
  ctx.font = '12px sans-serif'
  ctx.globalAlpha = 0.9
  ctx.fillText(address ? 'Wallet address' : '', 18, 148)
  ctx.globalAlpha = 1
  ctx.font = '13px monospace'
  wrapText(ctx, address || '-', 18, 170, width - 36, 18)

  const url = canvas.toDataURL('image/png')
  const link = document.createElement('a')
  link.href = url
  link.download = 'ishanch-wallet-card.png'
  link.click()
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + w, y, x + w, y + h, r)
  ctx.arcTo(x + w, y + h, x, y + h, r)
  ctx.arcTo(x, y + h, x, y, r)
  ctx.arcTo(x, y, x + w, y, r)
  ctx.closePath()
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
) {
  const words = text.split('')
  let line = ''
  let yy = y
  for (const ch of words) {
    const test = line + ch
    if (ctx.measureText(test).width > maxWidth && line) {
      ctx.fillText(line, x, yy)
      line = ch
      yy += lineHeight
    } else {
      line = test
    }
  }
  if (line) ctx.fillText(line, x, yy)
}

export function WalletPage() {
  const { t } = useTranslation()
  const locale = useLocaleStore((s) => s.language)
  const { token } = useAuthStore(useShallow((state) => ({ token: state.token })))
  const cardRef = useRef<HTMLDivElement>(null)

  const [wallet, setWallet] = useState<{ amount?: number; address?: string }>({ amount: 0 })
  const [transactions, setTransactions] = useState<WalletTx[]>([])
  const [pageLoading, setPageLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [copySuccess, setCopySuccess] = useState(false)
  const [downloadingCard, setDownloadingCard] = useState(false)
  const [showNotesModal, setShowNotesModal] = useState(false)
  const [showAddMoneyModal, setShowAddMoneyModal] = useState(false)
  const [typeFilter, setTypeFilter] = useState('all')
  const [gregorianDateFilter, setGregorianDateFilter] = useState('')

  const addMoneyWhatsappHref = useMemo(
    () => whatsappChatUrl(SUPPORT_WHATSAPP, t('desktop.wallet_add_money_title')),
    [t],
  )
  useEffect(() => {
    if (!token) return
    const loadData = async () => {
      setPageLoading(true)
      setError(null)
      try {
        const data = await fetchWalletData(token)
        setWallet(data.wallet || { amount: 0 })
        setTransactions(Array.isArray(data.transactions) ? (data.transactions as WalletTx[]) : [])
      } catch (err) {
        setWallet({ amount: 0 })
        setTransactions([])
        setError(getApiErrorMessage(err))
      } finally {
        setPageLoading(false)
      }
    }
    void loadData()
  }, [token])

  const rows = useMemo(
    () =>
      transactions
        .slice()
        .sort(
          (a, b) =>
            new Date(b.created_at || b.date || 0).getTime() -
            new Date(a.created_at || a.date || 0).getTime(),
        ),
    [transactions],
  )

  const normalizedFilterDate = useMemo(() => {
    const raw = String(gregorianDateFilter || '').trim()
    if (!raw) return null
    if (!/^\d{4}-\d{2}-\d{2}$/.test(raw)) return 'INVALID'
    const parsed = new Date(`${raw}T00:00:00`)
    if (Number.isNaN(parsed.getTime())) return 'INVALID'
    return raw
  }, [gregorianDateFilter])

  const filteredRows = useMemo(() => {
    return rows.filter((tx) => {
      const txType = String(tx.type_label || '').trim()
      const typeOk = typeFilter === 'all' || txType === typeFilter
      if (!typeOk) return false
      if (!normalizedFilterDate) return true
      if (normalizedFilterDate === 'INVALID') return false
      return formatGregorianYmd(tx.date || tx.created_at) === normalizedFilterDate
    })
  }, [rows, typeFilter, normalizedFilterDate])

  const walletNotes = [t('desktop.wallet_note_1'), t('desktop.wallet_note_2'), t('desktop.wallet_note_3')]

  const copyWalletAddress = async () => {
    const value = String(wallet?.address || '').trim()
    if (!value) return
    try {
      await navigator.clipboard.writeText(value)
      setCopySuccess(true)
      window.setTimeout(() => setCopySuccess(false), 1500)
    } catch {
      setCopySuccess(false)
    }
  }

  const downloadCardImage = async () => {
    if (!cardRef.current || downloadingCard) return
    try {
      setDownloadingCard(true)
      await downloadWalletCardImage(
        cardRef.current,
        t('desktop.available_amount'),
        String(wallet?.address || ''),
      )
    } finally {
      setDownloadingCard(false)
    }
  }

  if (pageLoading) {
    return (
      <div className="wallet-v2-wrap">
        <p className="muted" style={{ textAlign: 'center' }}>
          <i className="fa-solid fa-spinner fa-spin" /> {t('desktop.loading')}
        </p>
      </div>
    )
  }

  return (
    <div className="wallet-v2-wrap" dir="rtl">
      {error ? <div className="alert-error">{error}</div> : null}

      <div className="ishanch-visa-card" ref={cardRef}>
        <div className="ivc-top">
          <div>
            <h5>{t('desktop.your_wallet')}</h5>
            <p>Hamyan Card</p>
          </div>
          <div className="ivc-chip">
            <i className="fa-solid fa-wallet" />
          </div>
        </div>

        <div className="ivc-balance-label">{t('desktop.available_amount')}</div>
        <div className="ivc-balance-value">
          {Number(wallet?.amount || 0).toLocaleString('en-US')} <span>{t('desktop.afn')}</span>
        </div>

        <div className="ivc-address-row">
          <div className="ivc-address-label">{t('desktop.wallet_address')}</div>
        </div>
        <div className="ivc-address-value">{wallet?.address || '—'}</div>
      </div>

      <section className="wallet-add-money-card">
        <div className="wallet-add-money-card__text">
          <h3>{t('desktop.wallet_add_money')}</h3>
          <p>{t('desktop.wallet_add_money_lead')}</p>
        </div>
        <button
          type="button"
          className="btn-primary wallet-add-money-card__btn"
          onClick={() => setShowAddMoneyModal(true)}
        >
          <i className="fa-solid fa-plus" aria-hidden />
          {t('desktop.wallet_add_money_cta')}
        </button>
      </section>

      <div className="wallet-v2-actions">
        <Link to="/wallet/transfer" className="wallet-v2-action-link">
          <i className="fa-solid fa-right-left" />
          {t('desktop.wallet_transfer')}
        </Link>
        <Link to="/wallet/withdraw" className="wallet-v2-action-link">
          <i className="fa-solid fa-money-bill-wave" />
          {t('desktop.wallet_withdraw')}
        </Link>
        <Link to="/wallet/deposits" className="wallet-v2-action-link">
          <i className="fa-solid fa-arrow-down" />
          {t('desktop.deposits')}
        </Link>
        <Link to="/wallet/bonuses" className="wallet-v2-action-link">
          <i className="fa-solid fa-gift" />
          {t('desktop.bonuses')}
        </Link>
        <button type="button" className="wallet-v2-action-link" onClick={() => setShowNotesModal(true)}>
          <i className="fa-regular fa-note-sticky" />
          {t('desktop.wallet_notes')}
        </button>
        <button type="button" className="wallet-v2-action-link" onClick={() => void copyWalletAddress()}>
          <i className="fa-regular fa-copy" />
          {copySuccess ? t('desktop.copied') : t('desktop.copy')}
        </button>
        <button
          type="button"
          className="wallet-v2-action-link"
          onClick={() => void downloadCardImage()}
          disabled={downloadingCard}
        >
          <i className="fa-solid fa-download" />
          {downloadingCard ? t('desktop.downloading_card') : t('desktop.download_card')}
        </button>
      </div>

      <div className="wallet-v2-scroll-hint" aria-live="polite">
        <span className="wallet-v2-scroll-hint-arrow" aria-hidden="true">
          ←
        </span>
        {t('desktop.wallet_scroll_hint')}
        <span className="wallet-v2-scroll-hint-arrow" aria-hidden="true">
          →
        </span>
      </div>

      <div className="wallet-v2-transactions">
        <div className="wallet-v2-transactions-title">{t('desktop.wallet_history')}</div>
        <div className="wallet-v2-filter-row">
          <div className="wallet-v2-filter-item">
            <label>{t('desktop.type')}</label>
            <Select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
              <option value="all">{t('desktop.all')}</option>
              <option value="آمد">{t('desktop.credit_in')}</option>
              <option value="رفت">{t('desktop.debit_out')}</option>
            </Select>
          </div>
          <div className="wallet-v2-filter-item">
            <label>{t('desktop.gregorian_date_label')}</label>
            <input
              type="date"
              value={gregorianDateFilter}
              onChange={(e) => setGregorianDateFilter(e.target.value)}
            />
          </div>
        </div>

        {normalizedFilterDate === 'INVALID' ? (
          <div className="wallet-v2-invalid-date">{t('desktop.invalid_gregorian_date')}</div>
        ) : null}

        {filteredRows.length === 0 ? (
          <div className="wallet-v2-empty">{t('desktop.no_record_found')}</div>
        ) : (
          <table className="wallet-v2-table">
            <thead>
              <tr>
                <th>{t('desktop.amount')}</th>
                <th>{t('desktop.type')}</th>
                <th>{t('desktop.source')}</th>
                <th>{t('desktop.date')}</th>
              </tr>
            </thead>
            <tbody>
              {filteredRows.map((tx) => (
                <tr key={String(tx.id)}>
                  <td>
                    {Number(tx.amount || 0).toLocaleString('en-US')} {t('desktop.afn')}
                  </td>
                  <td>
                    {tx.type_label === 'آمد' ? (
                      <span className="wallet-type-badge wallet-type-in">
                        <i className="fa-solid fa-arrow-down" />
                        {t('desktop.credit_in')}
                      </span>
                    ) : tx.type_label === 'رفت' ? (
                      <span className="wallet-type-badge wallet-type-out">
                        <i className="fa-solid fa-arrow-up" />
                        {t('desktop.debit_out')}
                      </span>
                    ) : (
                      tx.type_label || '—'
                    )}
                  </td>
                  <td>{tx.source || '—'}</td>
                  <td>{formatJalaliSlash(tx.date || tx.created_at, locale)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Modal open={showNotesModal} onClose={() => setShowNotesModal(false)} title={t('desktop.wallet_notes')}>
        <ol className="wallet-notes-modal-list">
          {walletNotes.map((item, idx) => (
            <li key={`wm-${idx}`}>{item}</li>
          ))}
        </ol>
      </Modal>

      <Modal
        open={showAddMoneyModal}
        onClose={() => setShowAddMoneyModal(false)}
        title={t('desktop.wallet_add_money_title')}
        wide
      >
        <div className="wallet-add-money-modal">
          <p>{t('desktop.wallet_add_money_lead')}</p>
          <HesabPayAccountCard />
          {addMoneyWhatsappHref ? (
            <a
              className="btn-secondary reseller-wa-receipt-btn"
              href={addMoneyWhatsappHref}
              target="_blank"
              rel="noreferrer"
            >
              <i className="fa-brands fa-whatsapp" aria-hidden /> {t('desktop.reseller_send_whatsapp')}
            </a>
          ) : null}
        </div>
      </Modal>
    </div>
  )
}
