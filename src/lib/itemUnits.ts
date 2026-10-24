export type ItemUnitScale = 'base' | 'medium' | 'large'

export type ItemMultiUnitFields = {
  unit_id?: number | null
  unit_name?: string | null
  medium_unit_id?: number | null
  medium_unit_name?: string | null
  medium_to_base_qty?: number | null
  large_unit_id?: number | null
  large_unit_name?: string | null
  large_to_base_qty?: number | null
}

export type ItemUnitOption = {
  scale: ItemUnitScale
  unitId: number
  label: string
  factor: number
}

function toNum(value: unknown): number {
  const n = Number(value)
  return Number.isFinite(n) ? n : 0
}

export function itemUnitFactor(item: ItemMultiUnitFields | null | undefined, scale: ItemUnitScale): number {
  if (!item) return scale === 'base' ? 1 : 0
  if (scale === 'base') return 1
  if (scale === 'medium') {
    return item.medium_unit_id && toNum(item.medium_to_base_qty) > 0 ? toNum(item.medium_to_base_qty) : 0
  }
  return item.large_unit_id && toNum(item.large_to_base_qty) > 0 ? toNum(item.large_to_base_qty) : 0
}

export function itemUnitOptions(item: ItemMultiUnitFields | null | undefined): ItemUnitOption[] {
  if (!item?.unit_id) return []
  const options: ItemUnitOption[] = [
    {
      scale: 'base',
      unitId: Number(item.unit_id),
      label: item.unit_name || String(item.unit_id),
      factor: 1,
    },
  ]
  if (item.medium_unit_id && toNum(item.medium_to_base_qty) > 0) {
    options.push({
      scale: 'medium',
      unitId: Number(item.medium_unit_id),
      label: item.medium_unit_name || String(item.medium_unit_id),
      factor: toNum(item.medium_to_base_qty),
    })
  }
  if (item.large_unit_id && toNum(item.large_to_base_qty) > 0) {
    options.push({
      scale: 'large',
      unitId: Number(item.large_unit_id),
      label: item.large_unit_name || String(item.large_unit_id),
      factor: toNum(item.large_to_base_qty),
    })
  }
  return options
}

export function hasExtraItemUnits(item: ItemMultiUnitFields | null | undefined): boolean {
  return itemUnitOptions(item).length > 1
}

export function toBaseQuantity(
  quantity: number,
  item: ItemMultiUnitFields | null | undefined,
  scale: ItemUnitScale,
): number {
  const factor = itemUnitFactor(item, scale)
  if (!(quantity > 0) || !(factor > 0)) return 0
  return Math.round(quantity * factor * 1000) / 1000
}

export function fromBaseQuantity(
  baseQuantity: number,
  item: ItemMultiUnitFields | null | undefined,
  scale: ItemUnitScale,
): number {
  const factor = itemUnitFactor(item, scale)
  if (!(baseQuantity > 0) || !(factor > 0)) return 0
  return Math.round((baseQuantity / factor) * 1000) / 1000
}

/** Price per selected unit from a base-unit price. */
export function priceForScale(baseUnitPrice: number, factor: number): number {
  if (!(baseUnitPrice > 0) || !(factor > 0)) return 0
  return Math.round(baseUnitPrice * factor * 100) / 100
}

/** Base-unit price from a selected-unit price. */
export function basePriceFromScale(selectedUnitPrice: number, factor: number): number {
  if (!(selectedUnitPrice > 0) || !(factor > 0)) return 0
  return Math.round((selectedUnitPrice / factor) * 10000) / 10000
}

export function formatItemUnitsLabel(item: ItemMultiUnitFields | null | undefined): string {
  const options = itemUnitOptions(item)
  if (!options.length) return ''
  return options.map((o) => o.label).join(' / ')
}
