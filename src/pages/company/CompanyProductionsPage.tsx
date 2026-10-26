import { Select } from '@/components/inputs/SearchableSelect'
import { FormEvent, useEffect, useState } from 'react'
import { Link, useOutletContext, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useShallow } from 'zustand/react/shallow'
import { Modal } from '@/components/ui/Modal'
import { createProduction, fetchProductions, fetchProductsWithBom, reverseProduction, type BusinessItemRow, type ProductionRow } from '@/lib/business'
import { getApiErrorMessage } from '@/lib/auth'
import { formatAfghanDateValue } from '@/lib/datetime'
import { formatMoney } from '@/lib/companyDashboard'
import type { BusinessShowData } from '@/lib/user'
import { useAuthStore } from '@/store/useAuthStore'
import { businessPath } from '@/store/useCompanyContextStore'
import { localizeCurrency } from '@/lib/currency'
type CompanyOutletContext = { business: BusinessShowData }
export function CompanyProductionsPage() {
 const { t, i18n } = useTranslation(); const { companyId = '' } = useParams(); const { business } = useOutletContext<CompanyOutletContext>(); const token = useAuthStore(useShallow((s) => s.token)); const canManage = Boolean(business.permissions?.canManageInventory) && business.is_active; const canDelete = Boolean(business.permissions?.canDeleteRecords) && business.is_active; const production = Boolean((business.company as { is_production?: boolean }).is_production); const locale = i18n.language.startsWith('ps') ? 'ps' : i18n.language.startsWith('en') ? 'en' : 'fa'
 const [rows, setRows] = useState<ProductionRow[]>([]); const [products, setProducts] = useState<BusinessItemRow[]>([]); const [error, setError] = useState<string | null>(null); const [open, setOpen] = useState(false)
 const load = async () => { if (!token || !production) return; try { const data = await fetchProductions(token, companyId); setRows(data.productions) } catch (e) { setError(getApiErrorMessage(e)) } }
 useEffect(() => { void load(); if (token && production) void fetchProductsWithBom(token, companyId).then(setProducts).catch(() => setProducts([])) }, [token, companyId, production])
 const reverse = async (id: number) => { if (!token || !window.confirm('آیا برگشت شود؟')) return; try { await reverseProduction(token, companyId, id); await load() } catch (e) { setError(getApiErrorMessage(e)) } }
 if (!production) return <div className="dash-div party-page" dir="rtl"><div className="alert-error">تولید برای این شرکت فعال نیست.</div></div>
 return <div className="dash-div party-page" dir="rtl"><div className="party-toolbar"><Link className="btn-secondary btn-sm" to={businessPath(companyId)}>{t('desktop.back')}</Link>{canManage && <button className="btn-primary" onClick={() => setOpen(true)}>ثبت تولید</button>}</div>{error && <div className="alert-error">{error}</div>}<div className="table-wrap party-table-wrap"><table className="data-table"><thead><tr><th>{t('desktop.items')}</th><th>{t('desktop.quantity')}</th><th>هزینه واحد</th><th>هزینه کل</th><th>{t('desktop.remark')}</th><th>{t('desktop.date')}</th><th>{t('desktop.action')}</th></tr></thead><tbody>{rows.map((r) => <tr key={r.id}><td>{r.product_name || r.product_code}</td><td>{r.quantity}</td><td>{formatMoney(r.unit_cost)} {localizeCurrency(r.currency, t)}</td><td>{formatMoney(r.total_cost)} {localizeCurrency(r.currency, t)}</td><td>{r.remark || '—'}</td><td>{formatAfghanDateValue(r.produced_at, locale)}</td><td>{canDelete && <button className="btn-danger btn-sm" onClick={() => void reverse(r.id)}>برگشت</button>}</td></tr>)}</tbody></table></div><ProductionModal open={open} products={products} onClose={() => setOpen(false)} onSave={async (p) => { if (!token) return; await createProduction(token, companyId, p); setOpen(false); await load() }} /></div>
}
function ProductionModal({ open, products, onClose, onSave }: { open: boolean; products: BusinessItemRow[]; onClose: () => void; onSave: (p: { product_item_id: string; quantity: string; remark?: string }) => Promise<void> }) {
 const { t } = useTranslation(); const [product, setProduct] = useState(''); const [quantity, setQuantity] = useState('1'); const [remark, setRemark] = useState(''); const [error, setError] = useState<string | null>(null); useEffect(() => { if (!open) { setProduct(''); setQuantity('1'); setRemark(''); setError(null) } }, [open]); const submit = async (e: FormEvent) => { e.preventDefault(); try { await onSave({ product_item_id: product, quantity, remark: remark || undefined }) } catch (err) { setError(getApiErrorMessage(err)) } }
 return <Modal open={open} onClose={onClose} title="ثبت تولید"><form className="form-grid" onSubmit={(e) => void submit(e)}>{error && <div className="alert-error">{error}</div>}<label>{t('desktop.items')}<Select required value={product} onChange={(e) => setProduct(e.target.value)}><option value="">انتخاب</option>{products.map((p) => <option key={p.id} value={p.id}>{p.name} ({p.code})</option>)}</Select></label><label>{t('desktop.quantity')}<input type="number" min="0.0001" step="any" required value={quantity} onChange={(e) => setQuantity(e.target.value)} /></label><label>{t('desktop.remark')}<input value={remark} onChange={(e) => setRemark(e.target.value)} /></label><div className="form-actions"><button type="button" className="btn-secondary" onClick={onClose}>{t('desktop.close')}</button><button className="btn-primary">{t('desktop.save')}</button></div></form></Modal>
}
