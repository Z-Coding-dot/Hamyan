import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

type ShareButtonsProps = {
  url?: string
  title?: string
  text?: string
  hashtags?: string
}

export function ShareButtons({ url, title, text, hashtags = 'ishanch' }: ShareButtonsProps) {
  const { t } = useTranslation()
  const [copied, setCopied] = useState(false)
  const [nativeSupported, setNativeSupported] = useState(false)

  const shareUrl = useMemo(
    () => url || (typeof window !== 'undefined' ? window.location.href.split('#')[0] : ''),
    [url],
  )
  const shareTitle = title || t('desktop.cw_share')
  const shareText = text || shareTitle

  useEffect(() => {
    setNativeSupported(typeof navigator !== 'undefined' && typeof navigator.share === 'function')
  }, [])

  const copyToClipboard = () => {
    if (!shareUrl) return
    void navigator.clipboard.writeText(shareUrl).then(() => {
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    })
  }

  const nativeShare = async () => {
    try {
      await navigator.share({ title: shareTitle, text: shareText, url: shareUrl })
    } catch {
      /* cancelled */
    }
  }

  const twHashtags = hashtags
    ? `&hashtags=${encodeURIComponent(hashtags.replace(/\s+/g, ''))}`
    : ''

  return (
    <div className="cw-share">
      <span className="cw-share__label">{t('desktop.cw_share')}:</span>

      {nativeSupported ? (
        <button type="button" className="cw-share__btn cw-share__btn--primary" onClick={() => void nativeShare()}>
          <i className="fa-solid fa-share-nodes" />
          {t('desktop.cw_share')}
        </button>
      ) : null}

      <a
        className="cw-share__btn"
        href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
        target="_blank"
        rel="noopener noreferrer"
      >
        <i className="fa-brands fa-facebook" />
      </a>
      <a
        className="cw-share__btn"
        href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}${twHashtags}`}
        target="_blank"
        rel="noopener noreferrer"
      >
        <i className="fa-brands fa-x-twitter" />
      </a>
      <a
        className="cw-share__btn cw-share__btn--wa"
        href={`https://wa.me/?text=${encodeURIComponent(`${shareText}\n${shareUrl}`)}`}
        target="_blank"
        rel="noopener noreferrer"
      >
        <i className="fa-brands fa-whatsapp" />
      </a>
      <a
        className="cw-share__btn"
        href={`https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`}
        target="_blank"
        rel="noopener noreferrer"
      >
        <i className="fa-brands fa-telegram" />
      </a>
      <a
        className="cw-share__btn"
        href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`}
        target="_blank"
        rel="noopener noreferrer"
      >
        <i className="fa-brands fa-linkedin" />
      </a>
      <a
        className="cw-share__btn"
        href={`mailto:?subject=${encodeURIComponent(shareTitle)}&body=${encodeURIComponent(`${shareText}\n\n${shareUrl}`)}`}
      >
        <i className="fa-solid fa-envelope" />
      </a>
      <button type="button" className="cw-share__btn" onClick={copyToClipboard}>
        <i className="fa-regular fa-clipboard" />
        {copied ? t('desktop.cw_copied') : t('desktop.cw_copy_link')}
      </button>
    </div>
  )
}
