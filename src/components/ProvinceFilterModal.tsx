import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import { Modal } from '@/components/ui/Modal'
import type { ProvinceRow } from '@/lib/user'
import type { SupportedLanguage } from '@/store/useLocaleStore'

type Props = {
  open: boolean
  provinces: ProvinceRow[]
  language: SupportedLanguage
  selectedId: string
  onClose: () => void
  onSelect: (provinceId: string) => void
}

function provinceLabel(
  province: Pick<ProvinceRow, 'name_fa' | 'name_ps' | 'name_en'>,
  language: SupportedLanguage,
): string {
  if (language === 'ps') return province.name_ps || province.name_fa
  if (language === 'en') return province.name_en || province.name_fa
  return province.name_fa
}

export function ProvinceFilterModal({
  open,
  provinces,
  language,
  selectedId,
  onClose,
  onSelect,
}: Props) {
  const { t } = useTranslation()

  const sorted = useMemo(
    () =>
      [...provinces].sort((a, b) =>
        provinceLabel(a, language).localeCompare(provinceLabel(b, language), language),
      ),
    [provinces, language],
  )

  return (
    <Modal open={open} onClose={onClose} title={t('desktop.reseller_directory_filter')} wide>
      <p className="province-filter-modal__hint">{t('desktop.reseller_directory_filter_hint')}</p>
      <div className="province-filter-modal__grid">
        <button
          type="button"
          className={`province-filter-modal__chip${selectedId === '' ? ' is-selected' : ''}`}
          onClick={() => {
            onSelect('')
            onClose()
          }}
        >
          <i className="fa-solid fa-map" aria-hidden />
          <span>{t('desktop.reseller_directory_filter_all')}</span>
        </button>
        {sorted.map((row) => {
          const selected = String(row.id) === selectedId
          return (
            <button
              key={row.id}
              type="button"
              className={`province-filter-modal__chip${selected ? ' is-selected' : ''}`}
              onClick={() => {
                onSelect(String(row.id))
                onClose()
              }}
            >
              <i className="fa-solid fa-location-dot" aria-hidden />
              <span>{provinceLabel(row, language)}</span>
            </button>
          )
        })}
      </div>
    </Modal>
  )
}
