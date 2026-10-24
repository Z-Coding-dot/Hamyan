import { AxiosError } from 'axios'

import { api } from '@/lib/api'
import type {
  BusinessAccountRow,
  BusinessDashboardPayload,
  BusinessDashboardTransaction,
} from '@/lib/user'

type ApiEnvelope<T> = {
  message?: string
  data?: T
}

function authHeaders(token: string) {
  return { Authorization: `Bearer ${token}` }
}

function unwrap<T>(payload: T | ApiEnvelope<T>): T {
  if (payload && typeof payload === 'object' && 'data' in (payload as ApiEnvelope<T>)) {
    return (payload as ApiEnvelope<T>).data as T
  }
  return payload as T
}

export type BusinessCustomerRow = {
  id: number
  customer_id?: number | string | null
  name?: string | null
  company_name?: string | null
  phone?: string | null
  email?: string | null
  address?: string | null
  personality?: string | null
  status?: number | boolean | null
  created_at?: string | null
  invoices_count?: number | string | null
  customerDebts?: Array<{
    id: number
    company_account_id?: number | string | null
    currency?: string | null
    amount?: number | string | null
    account_name?: string | null
  }>
}

export type BusinessVendorRow = {
  id: number
  name?: string | null
  phone?: string | null
  email?: string | null
  status?: number | boolean | null
  vendorDebts?: Array<{
    id: number
    currency?: string | null
    amount?: number | string | null
  }>
}

export type StaffContractAccount = {
  id?: number
  name?: string | null
  currency?: string | null
}

export type StaffContract = {
  id: number
  staff_id?: number
  company_id?: string | number
  start_date?: string | null
  end_date?: string | null
  status?: string | null
  computed_status?: string | null
  termination_date?: string | null
  termination_reason?: string | null
  monthly_salary?: number | string | null
  company_account_id?: number | string | null
  account?: StaffContractAccount | null
  show_url?: string | null
  created_at?: string | null
}

export type BusinessStaffRow = {
  id: number
  name?: string | null
  first_name?: string | null
  last_name?: string | null
  email?: string | null
  phone?: string | null
  address?: string | null
  position?: string | null
  department?: string | null
  status?: string | number | null
  active_contract_start_date?: string | null
  active_contract_end_date?: string | null
  active_contract_monthly_salary?: number | string | null
  active_contract_id?: number | null
  active_contract?: StaffContract | null
  created_at?: string | null
}

export type StaffContractSummary = {
  payable_to_today?: number | null
  payable_to_end_of_month?: number | null
  payable_to_end_of_contract?: number | null
  paid?: number | null
  absence_days?: number | null
  remaining_to_today?: number | null
  remaining_to_end_of_month?: number | null
  remaining_to_end_of_contract?: number | null
}

export type StaffAbsence = {
  id: number
  staff_id?: number | null
  staff_contract_id?: number | null
  absent_on?: string | null
  absent_on_jalali?: string | null
  created_by?: number | null
  creator_name?: string | null
  created_at?: string | null
}

export type StaffSalaryPayment = {
  id: number
  company_account_id?: number | null
  account_name?: string | null
  currency?: string | null
  amount?: number | string | null
  payment_date?: string | null
  payment_date_jalali?: string | null
  salary_month?: string | null
  salary_month_jalali?: string | null
  description?: string | null
  attachment?: string | null
  has_attachment?: boolean
  created_by?: number | null
  creator_name?: string | null
  date_jalali?: string | null
  staff_contract_id?: number | null
  contract_number?: string | null
  contract_show_url?: string | null
  transaction_id?: number | null
  can_delete?: boolean
  account?: StaffContractAccount | null
  created_at?: string | null
}

export type StaffDocument = {
  id: number
  title?: string | null
  file?: string | null
  created_at?: string | null
  creator?: { user_id?: number; name?: string | null } | null
}

export type StaffShowPayload = {
  staff: BusinessStaffRow
  documents?: StaffDocument[]
  contract?: StaffContract | null
  contracts?: StaffContract[]
  activeContract?: StaffContract | null
  payableContract?: StaffContract | null
  activeContractSummary?: StaffContractSummary | null
  salaryPayments?: StaffSalaryPayment[]
  absences?: StaffAbsence[]
  today?: string | null
  isActive?: boolean
  permissions?: {
    canViewStaff?: boolean
    canManageStaff?: boolean
  }
}

export type StaffContractShowPayload = {
  staff: BusinessStaffRow
  contract: StaffContract
  summary?: StaffContractSummary | null
  payments?: StaffSalaryPayment[]
  absences?: StaffAbsence[]
  today?: string | null
  permissions?: {
    canViewStaff?: boolean
    canManageStaff?: boolean
  }
}

export type StaffFormPayload = {
  first_name: string
  last_name: string
  position?: string
  phone?: string
  email?: string
  address?: string
}

export type StaffContractPayload = {
  contract_id?: number | string
  start_date: string
  end_date?: string | null
  status: 'active' | 'terminated'
  termination_date?: string | null
  termination_reason?: string | null
  monthly_salary: number | string
  company_account_id: number | string
}

export type BusinessExpenseFieldRow = {
  id: number
  account_code?: string | null
  account_name?: string | null
  remark?: string | null
  company_id?: string | number | null
  status?: number | boolean | null
}

export type BusinessExpenseRow = {
  id: number
  amount?: number | null
  currency?: string | null
  bill_number?: string | null
  remark?: string | null
  date?: string | null
  field_id?: number | null
  spender_id?: number | null
  company_account_id?: number | null
  account_name?: string | null
  field?: {
    id?: number
    account_name?: string | null
    account_code?: string | null
  } | null
  spender?: {
    id?: number
    first_name?: string | null
    last_name?: string | null
  } | null
  user?: {
    id?: number
    name?: string | null
  } | null
}

export type BusinessExpensesPayload = {
  expenses: BusinessExpenseRow[]
  expenseFields: BusinessExpenseFieldRow[]
  staff?: BusinessStaffRow[]
}

export type BusinessSaleRow = {
  id: number
  invoice_number?: number | string | null
  total_price?: number | null
  paid_amount?: number | null
  remaining_amount?: number | null
  currency?: string | null
  company_account_id?: number | null
  status?: string | null
  customer_name?: string | null
  sale_date?: string | null
  created_at?: string | null
}

export type BusinessItemRow = {
  id: number
  code?: string | null
  name?: string | null
  brand?: string | null
  model?: string | null
  stock?: number | null
  company_stock?: number | null
  warehouse_stock?: number | null
  total_inventory?: number | null
  warehouse_quantities?: Array<{
    warehouse_id: number
    warehouse_name?: string | null
    quantity?: number | null
  }>
  minimum_stock_level?: number | null
  status?: boolean | number | null
  classification?: string | null
  category_id?: number | null
  category_name?: string | null
  unit_id?: number | null
  unit_name?: string | null
  medium_unit_id?: number | null
  medium_unit_name?: string | null
  medium_to_base_qty?: number | null
  large_unit_id?: number | null
  large_unit_name?: string | null
  large_to_base_qty?: number | null
  sale_currency?: string | null
  sale_price?: number | null
  purchase_currency?: string | null
  purchase_unit_cost?: number | null
  purchase_unit_cost_in_capital_currency?: number | null
  inventory_purchase_value?: number | null
  inventory_value_in_capital_currency?: number | null
  type?: string | null
  color?: string | null
  storage_capacity?: number | null
  public?: boolean | null
  can_delete?: boolean
  delete_block_reason?: string | null
}

export type ItemsInventorySummary = {
  capital_currency?: string | null
  total_purchase_value_in_capital_currency?: number | null
  missing_capital_valuation_count?: number | null
  total_inventory_quantity?: number | null
  total_company_stock_quantity?: number | null
  total_warehouse_stock_quantity?: number | null
}

export type ItemsPagePayload = {
  items: BusinessItemRow[]
  warehouses: Array<{ id: number; name?: string | null }>
  itemCategories: Array<{ id: number; name?: string | null }>
  inventorySummary: ItemsInventorySummary
}

export type BusinessItemCategoryRow = {
  id: number
  name?: string | null
  remark?: string | null
  status?: number | null
  items_count?: number | null
}

export type MeasurementUnitRow = {
  id: number
  name?: string | null
  name_fa?: string | null
  name_ps?: string | null
  name_en?: string | null
  name_uz?: string | null
  symbol?: string | null
}

export type BusinessItemShow = BusinessItemRow & {
  generation?: number | null
  ram_capacity?: number | null
  storage_capacity?: number | null
  price_afn?: number | null
  price_usd?: number | null
  image?: string | null
  category?: { id: number; name?: string | null; remark?: string | null } | null
  unit?: MeasurementUnitRow | null
  medium_unit?: MeasurementUnitRow | null
  large_unit?: MeasurementUnitRow | null
  bomComponents?: Array<{
    id?: number
    raw_material_item_id: number
    quantity: number
    raw_material_name?: string | null
    raw_material_code?: string | null
    raw_material?: { id: number; name?: string | null; code?: string | null } | null
  }>
  salePrices?: Array<{
    id: number
    currency?: string | null
    sale_price?: number | null
    is_active?: boolean
    effective_from?: string | null
    sell_account_id?: number | null
  }>
  salePrice?: {
    id: number
    currency?: string | null
    sale_price?: number | null
    sell_account_id?: number | null
  } | null
  latestPurchaseCost?: {
    id?: number
    currency?: string | null
    unit_cost?: number | null
    quantity?: number | null
    cost_date?: string | null
  } | null
}

export type ItemShowPayload = {
  item: BusinessItemShow
  category?: BusinessItemShow['category']
  unit?: MeasurementUnitRow | null
  medium_unit?: MeasurementUnitRow | null
  large_unit?: MeasurementUnitRow | null
  hasProductionMode?: boolean
  isProduct?: boolean
  bomComponents?: BusinessItemShow['bomComponents']
  rawMaterials?: Array<{ id: number; name?: string | null; code?: string | null }>
  capitalAccounts?: Array<{
    id: number
    name?: string | null
    currency?: string | null
    balance?: number | null
    type?: string | null
  }>
  sellAccount?: {
    id: number
    name?: string | null
    currency?: string | null
    balance?: number | null
    type?: string | null
  } | null
  salePrices?: BusinessItemShow['salePrices']
  salePrice?: BusinessItemShow['salePrice']
  latestPurchaseCost?: BusinessItemShow['latestPurchaseCost']
}

export type ItemInventoryRecord = {
  id: number
  source?: string | null
  vendor?: string | null
  warehouse_id?: number | null
  warehouse_name?: string | null
  created_by?: string | null
  date_jalali?: string | null
  currency?: string | null
  quantity?: number | null
  unit_price?: number | null
  total_price?: number | null
  can_delete?: boolean
}

export type ItemPurchaseCostHistoryRow = {
  id: number
  unit_cost?: number | null
  currency?: string | null
  quantity?: number | null
  cost_date?: string | null
  date_jalali?: string | null
  source?: string | null
  source_label?: string | null
  remark?: string | null
}

export type WarehouseDetail = BusinessWarehouseRow & {
  remark?: string | null
  status?: number | null
  items_count?: number | null
  stocked_items_count?: number | null
  total_quantity?: number | null
  can_delete?: boolean
  items?: Array<{
    id?: number
    item_id: number
    name?: string | null
    item_name?: string | null
    code?: string | null
    item_code?: string | null
    quantity?: number
    unit_id?: number | null
    unit_name?: string | null
  }>
}

export type InventoryStockRow = {
  location?: 'company' | 'warehouse' | string | null
  warehouse_item_id?: number | null
  warehouse_id?: number | null
  warehouse_name?: string | null
  item_id: number
  name?: string | null
  code?: string | null
  model?: string | null
  unit_id?: number | null
  unit_name?: string | null
  quantity?: number
  purchase_unit_cost?: number | string | null
  purchase_currency?: string | null
}

export type InventoryPayload = {
  company_stock: InventoryStockRow[]
  warehouses: Array<{
    id: number
    name?: string | null
    address?: string | null
    items: InventoryStockRow[]
    item_count?: number
    total_quantity?: number
  }>
  inventory_rows: InventoryStockRow[]
  warehouse_options: Array<{ id: number; name?: string | null }>
}

export type WarehouseTransferRow = {
  id: number
  type?: string | null
  item_id?: number
  item_name?: string | null
  item_code?: string | null
  from_warehouse_id?: number | null
  from_warehouse_name?: string | null
  to_warehouse_id?: number | null
  to_warehouse_name?: string | null
  quantity?: number
  remark?: string | null
  created_at?: string | null
  is_reversed?: boolean
  reversed_at?: string | null
}

export type ProductionRow = {
  id: number
  product_item_id?: number
  product_name?: string | null
  product_code?: string | null
  quantity?: number
  unit_cost?: number | null
  total_cost?: number | null
  currency?: string | null
  remark?: string | null
  produced_at?: string | null
  created_by_name?: string | null
  components?: Array<{
    raw_material_item_id?: number
    raw_material_name?: string | null
    quantity?: number
  }>
}

export async function fetchBusinessDashboard(
  token: string,
  companyId: string | number,
): Promise<BusinessDashboardPayload> {
  const response = await api.get<BusinessDashboardPayload | ApiEnvelope<BusinessDashboardPayload>>(
    `/user/business/${companyId}/dashboard-details`,
    { headers: authHeaders(token) },
  )
  const data = unwrap(response.data) as BusinessDashboardPayload
  return {
    success: Boolean(data?.success ?? true),
    transactions: Array.isArray(data?.transactions) ? data.transactions : [],
    dashboardDetails: data?.dashboardDetails ?? null,
    todayDetails: data?.todayDetails ?? null,
  }
}

export async function fetchBusinessAccountsList(
  token: string,
  companyId: string | number,
): Promise<BusinessAccountRow[]> {
  const response = await api.get<{ accounts?: BusinessAccountRow[] }>(
    `/user/business/${companyId}/accounts`,
    { headers: authHeaders(token) },
  )
  return Array.isArray(response.data?.accounts) ? response.data.accounts : []
}

export async function fetchBusinessCustomers(
  token: string,
  companyId: string | number,
  fil?: string,
): Promise<BusinessCustomerRow[]> {
  const response = await api.get<ApiEnvelope<{ customers: BusinessCustomerRow[] }>>(
    `/user/business/${companyId}/customers`,
    {
      headers: authHeaders(token),
      params: fil ? { fil } : undefined,
    },
  )
  return unwrap(response.data)?.customers ?? []
}

export async function fetchBusinessVendors(
  token: string,
  companyId: string | number,
  fil?: string,
): Promise<BusinessVendorRow[]> {
  const response = await api.get<{ vendors?: BusinessVendorRow[] }>(
    `/user/business/${companyId}/vendors`,
    {
      headers: authHeaders(token),
      params: fil ? { fil } : undefined,
    },
  )
  return Array.isArray(response.data?.vendors) ? response.data.vendors : []
}

export type PartyDebtRow = {
  id: number
  company_account_id?: number
  account_name?: string | null
  currency?: string | null
  amount?: number | string | null
  description?: string | null
}

export type PartyDebtRecordRow = {
  id: number
  company_account_id?: number
  account_name?: string | null
  currency?: string | null
  previous_amount?: number | string | null
  change_amount?: number | string | null
  new_amount?: number | string | null
  reason?: string | null
  description?: string | null
  created_at?: string | null
}

export type PartyPaymentRow = {
  id: number
  company_account_id?: number
  account_name?: string | null
  currency?: string | null
  amount?: number | string | null
  type?: string | null
  description?: string | null
  invoice_id?: number | string | null
  purchase_id?: number | string | null
  can_delete?: boolean
  created_at?: string | null
}

/** Finalized sale invoice on a customer show page. items_count = line rows, not qty. */
export type PartyInvoiceRow = {
  id: number
  invoice_number?: string | number | null
  currency?: string | null
  total_price?: number | string | null
  paid_amount?: number | string | null
  remaining_amount?: number | string | null
  items_count?: number | string | null
  created_at?: string | null
}

export type CustomerShowPayload = {
  customer: BusinessCustomerRow & {
    address?: string | null
    personality?: string | null
    status?: number | boolean | null
    created_at?: string | null
  }
  customerDebts: PartyDebtRow[]
  customerDebtRecords: PartyDebtRecordRow[]
  customerPayments: PartyPaymentRow[]
  customerInvoices?: PartyInvoiceRow[]
  customer_invoices?: PartyInvoiceRow[]
  invoices?: PartyInvoiceRow[]
  customerPackages?: CustomerInternetPackageRow[]
  permissions?: Record<string, boolean>
}

export function pickCustomerInvoices(
  payload: CustomerShowPayload | null | undefined,
): PartyInvoiceRow[] {
  if (!payload || typeof payload !== 'object') return []
  const raw = payload.customerInvoices ?? payload.customer_invoices ?? payload.invoices
  return Array.isArray(raw) ? raw : []
}

export type PartyPurchaseRow = {
  id: number
  purchase_number?: string | number | null
  currency?: string | null
  total_price?: number | string | null
  paid_amount?: number | string | null
  remaining_amount?: number | string | null
  items_count?: number | string | null
  created_at?: string | null
}

export type VendorShowPayload = {
  vendor: BusinessVendorRow & {
    address?: string | null
    remark?: string | null
  }
  vendorDebts: PartyDebtRow[]
  vendorDebtRecords: PartyDebtRecordRow[]
  vendorPayments: PartyPaymentRow[]
  vendorPurchases?: PartyPurchaseRow[]
  vendor_purchases?: PartyPurchaseRow[]
  purchases?: PartyPurchaseRow[]
  permissions?: Record<string, boolean>
}

export function pickVendorPurchases(
  payload: VendorShowPayload | null | undefined,
): PartyPurchaseRow[] {
  if (!payload || typeof payload !== 'object') return []
  const raw = payload.vendorPurchases ?? payload.vendor_purchases ?? payload.purchases
  return Array.isArray(raw) ? raw : []
}

export async function fetchCustomerShow(
  token: string,
  companyId: string | number,
  customerId: string | number,
): Promise<CustomerShowPayload> {
  const response = await api.get<ApiEnvelope<CustomerShowPayload>>(
    `/user/business/${companyId}/customers/${customerId}`,
    { headers: authHeaders(token) },
  )
  return unwrap(response.data)
}

export async function createBusinessCustomer(
  token: string,
  companyId: string | number,
  payload: {
    name: string
    company_name?: string
    phone?: string
    email?: string
    address?: string
    personality: 'human' | 'company'
  },
): Promise<BusinessCustomerRow> {
  const response = await api.post<ApiEnvelope<{ customer: BusinessCustomerRow }>>(
    `/user/business/${companyId}/customers`,
    payload,
    { headers: authHeaders(token) },
  )
  return unwrap(response.data)?.customer
}

export async function updateBusinessCustomer(
  token: string,
  companyId: string | number,
  customerId: string | number,
  payload: {
    name: string
    company_name?: string
    phone?: string
    email?: string
    address?: string
    personality: 'human' | 'company'
  },
): Promise<BusinessCustomerRow> {
  const response = await api.put<ApiEnvelope<{ customer: BusinessCustomerRow }>>(
    `/user/business/${companyId}/customers/${customerId}`,
    payload,
    { headers: authHeaders(token) },
  )
  return unwrap(response.data)?.customer
}

export async function setCustomerPreviousPayables(
  token: string,
  companyId: string | number,
  customerId: string | number,
  payload: {
    company_account_id: number | string
    amount: number | string
    description?: string
    mode?: 'add' | 'set'
  },
): Promise<void> {
  await api.post(`/user/business/${companyId}/customers/${customerId}/previous-payables`, payload, {
    headers: authHeaders(token),
  })
}

export async function storeCustomerGeneralPayment(
  token: string,
  companyId: string | number,
  customerId: string | number,
  payload: { company_account_id: number | string; amount: number | string; description?: string },
): Promise<void> {
  await api.post(`/user/business/${companyId}/customers/${customerId}/general-payment`, payload, {
    headers: authHeaders(token),
  })
}

export async function deleteCustomerPayment(
  token: string,
  companyId: string | number,
  customerId: string | number,
  paymentId: number | string,
): Promise<void> {
  await api.delete(`/user/business/${companyId}/customers/${customerId}/payments/${paymentId}`, {
    headers: authHeaders(token),
  })
}

export async function fetchVendorShow(
  token: string,
  companyId: string | number,
  vendorId: string | number,
): Promise<VendorShowPayload> {
  const response = await api.get<ApiEnvelope<VendorShowPayload>>(
    `/user/business/${companyId}/vendors/${vendorId}`,
    { headers: authHeaders(token) },
  )
  return unwrap(response.data)
}

export async function createBusinessVendor(
  token: string,
  companyId: string | number,
  payload: { name: string; phone?: string; email?: string; address?: string },
): Promise<BusinessVendorRow> {
  const response = await api.post<ApiEnvelope<{ vendor: BusinessVendorRow }>>(
    `/user/business/${companyId}/vendors`,
    payload,
    { headers: authHeaders(token) },
  )
  return unwrap(response.data)?.vendor
}

export async function updateBusinessVendor(
  token: string,
  companyId: string | number,
  vendorId: string | number,
  payload: { name: string; phone?: string; email?: string; address?: string },
): Promise<BusinessVendorRow> {
  const response = await api.put<ApiEnvelope<{ vendor: BusinessVendorRow }>>(
    `/user/business/${companyId}/vendors/${vendorId}`,
    payload,
    { headers: authHeaders(token) },
  )
  return unwrap(response.data)?.vendor
}

export async function setVendorPreviousPayables(
  token: string,
  companyId: string | number,
  vendorId: string | number,
  payload: { company_account_id: number | string; amount: number | string; description?: string },
): Promise<void> {
  await api.post(`/user/business/${companyId}/vendors/${vendorId}/previous-payables`, payload, {
    headers: authHeaders(token),
  })
}

export async function storeVendorGeneralPayment(
  token: string,
  companyId: string | number,
  vendorId: string | number,
  payload: { company_account_id: number | string; amount: number | string; description?: string },
): Promise<void> {
  await api.post(`/user/business/${companyId}/vendors/${vendorId}/general-payment`, payload, {
    headers: authHeaders(token),
  })
}

export async function deleteVendorPayment(
  token: string,
  companyId: string | number,
  vendorId: string | number,
  paymentId: number | string,
): Promise<void> {
  await api.delete(`/user/business/${companyId}/vendors/${vendorId}/payments/${paymentId}`, {
    headers: authHeaders(token),
  })
}

export async function fetchBusinessStaff(
  token: string,
  companyId: string | number,
): Promise<BusinessStaffRow[]> {
  const response = await api.get<ApiEnvelope<{ staff: BusinessStaffRow[] }>>(
    `/user/business/${companyId}/staff`,
    { headers: authHeaders(token) },
  )
  return unwrap(response.data)?.staff ?? []
}

export async function createBusinessStaff(
  token: string,
  companyId: string | number,
  payload: StaffFormPayload,
): Promise<BusinessStaffRow> {
  const response = await api.post<ApiEnvelope<{ staff: BusinessStaffRow }>>(
    `/user/business/${companyId}/staff`,
    payload,
    { headers: authHeaders(token) },
  )
  return unwrap(response.data)?.staff
}

export async function updateBusinessStaff(
  token: string,
  companyId: string | number,
  staffId: string | number,
  payload: StaffFormPayload,
): Promise<BusinessStaffRow> {
  const response = await api.put<ApiEnvelope<{ staff: BusinessStaffRow }>>(
    `/user/business/${companyId}/staff/${staffId}`,
    payload,
    { headers: authHeaders(token) },
  )
  return unwrap(response.data)?.staff
}

export async function fetchBusinessStaffShow(
  token: string,
  companyId: string | number,
  staffId: string | number,
): Promise<StaffShowPayload> {
  const response = await api.get<ApiEnvelope<StaffShowPayload>>(
    `/user/business/${companyId}/staff/${staffId}`,
    { headers: authHeaders(token) },
  )
  return unwrap(response.data)
}

export async function fetchBusinessStaffContract(
  token: string,
  companyId: string | number,
  staffId: string | number,
  contractId: string | number,
): Promise<StaffContractShowPayload> {
  const response = await api.get<ApiEnvelope<StaffContractShowPayload>>(
    `/user/business/${companyId}/staff/${staffId}/contracts/${contractId}`,
    { headers: authHeaders(token) },
  )
  return unwrap(response.data)
}

export async function storeStaffContract(
  token: string,
  companyId: string | number,
  staffId: string | number,
  payload: StaffContractPayload,
): Promise<{ contract: StaffContract; active_contract: StaffContract | null }> {
  const response = await api.post<
    ApiEnvelope<{ contract: StaffContract; active_contract: StaffContract | null }>
  >(`/user/business/${companyId}/staff/${staffId}/contracts`, payload, {
    headers: authHeaders(token),
  })
  const data = unwrap(response.data)
  return {
    contract: data?.contract,
    active_contract: data?.active_contract ?? null,
  }
}

export async function storeStaffAbsence(
  token: string,
  companyId: string | number,
  staffId: string | number,
  payload: { date: string },
): Promise<StaffAbsence> {
  const response = await api.post<ApiEnvelope<{ absence: StaffAbsence }>>(
    `/user/business/${companyId}/staff/${staffId}/absences`,
    payload,
    { headers: authHeaders(token) },
  )
  return unwrap(response.data)?.absence
}

export async function deleteStaffAbsence(
  token: string,
  companyId: string | number,
  staffId: string | number,
  absenceId: string | number,
): Promise<void> {
  await api.delete(`/user/business/${companyId}/staff/${staffId}/absences/${absenceId}`, {
    headers: authHeaders(token),
  })
}

export async function fetchStaffSalaryPayments(
  token: string,
  companyId: string | number,
  staffId: string | number,
): Promise<StaffSalaryPayment[]> {
  const response = await api.get<ApiEnvelope<{ payments: StaffSalaryPayment[] }>>(
    `/user/business/${companyId}/staff/${staffId}/salary-payments`,
    { headers: authHeaders(token) },
  )
  return unwrap(response.data)?.payments ?? []
}

export async function storeStaffSalaryPayment(
  token: string,
  companyId: string | number,
  staffId: string | number,
  formData: FormData,
): Promise<StaffSalaryPayment> {
  const response = await api.post<ApiEnvelope<{ payment: StaffSalaryPayment }>>(
    `/user/business/${companyId}/staff/${staffId}/salary-payments`,
    formData,
    { headers: authHeaders(token) },
  )
  return unwrap(response.data)?.payment
}

export async function uploadStaffSalaryPaymentAttachment(
  token: string,
  companyId: string | number,
  staffId: string | number,
  paymentId: string | number,
  formData: FormData,
): Promise<{ attachment?: string | null }> {
  const response = await api.post<ApiEnvelope<{ attachment?: string | null }>>(
    `/user/business/${companyId}/staff/${staffId}/salary-payments/${paymentId}/attachment`,
    formData,
    { headers: authHeaders(token) },
  )
  return unwrap(response.data) ?? {}
}

export async function deleteStaffSalaryPayment(
  token: string,
  companyId: string | number,
  staffId: string | number,
  paymentId: string | number,
): Promise<void> {
  await api.delete(`/user/business/${companyId}/staff/${staffId}/salary-payments/${paymentId}`, {
    headers: authHeaders(token),
  })
}

export async function storeStaffDocument(
  token: string,
  companyId: string | number,
  staffId: string | number,
  formData: FormData,
): Promise<StaffDocument> {
  const response = await api.post<ApiEnvelope<{ document: StaffDocument }>>(
    `/user/business/${companyId}/staff/${staffId}/documents`,
    formData,
    { headers: authHeaders(token) },
  )
  return unwrap(response.data)?.document
}

export async function deleteStaffDocument(
  token: string,
  companyId: string | number,
  staffId: string | number,
  documentId: string | number,
): Promise<void> {
  await api.delete(`/user/business/${companyId}/staff/${staffId}/documents/${documentId}`, {
    headers: authHeaders(token),
  })
}

export async function downloadStaffSalaryPaymentAttachment(
  token: string,
  companyId: string | number,
  staffId: string | number,
  paymentId: string | number,
): Promise<Blob> {
  const response = await api.get(
    `/user/business/${companyId}/staff/${staffId}/salary-payments/${paymentId}/download`,
    { headers: authHeaders(token), responseType: 'blob' },
  )
  return response.data as Blob
}

export async function downloadStaffDocument(
  token: string,
  companyId: string | number,
  staffId: string | number,
  documentId: string | number,
): Promise<Blob> {
  const response = await api.get(
    `/user/business/${companyId}/staff/${staffId}/documents/${documentId}/download`,
    { headers: authHeaders(token), responseType: 'blob' },
  )
  return response.data as Blob
}

/** Trigger a browser download for a Blob (Electron renderer / web). */
export function triggerBrowserDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  // Revoke asynchronously so Chromium has time to start the download.
  window.setTimeout(() => URL.revokeObjectURL(url), 1500)
}

export type DownloadedFile = {
  blob: Blob
  filename?: string | null
}

function parseFilenameFromContentDisposition(value: string | undefined): string | null {
  if (!value) return null
  const utf8 = value.match(/filename\*=UTF-8''([^;]+)/i)?.[1]
  if (utf8) {
    try {
      return decodeURIComponent(utf8).replace(/[\r\n]/g, '').trim()
    } catch {
      return utf8.replace(/[\r\n]/g, '').trim()
    }
  }
  const ascii = value.match(/filename=\"?([^\";]+)\"?/i)?.[1]
  return ascii ? ascii.replace(/[\r\n]/g, '').trim() : null
}

export function getSalaryPaymentRemainingAllowed(error: unknown): number | null {
  if (!(error instanceof AxiosError)) return null
  const data = error.response?.data as { remaining_allowed?: number | string } | undefined
  const value = data?.remaining_allowed
  if (value === null || value === undefined || value === '') return null
  const num = Number(value)
  return Number.isFinite(num) ? num : null
}

export async function fetchBusinessExpenses(
  token: string,
  companyId: string | number,
): Promise<BusinessExpensesPayload> {
  const response = await api.get<ApiEnvelope<BusinessExpensesPayload>>(
    `/user/business/${companyId}/expenses`,
    { headers: authHeaders(token) },
  )
  const data = unwrap(response.data)
  return {
    expenses: Array.isArray(data?.expenses) ? data.expenses : [],
    expenseFields: Array.isArray(data?.expenseFields) ? data.expenseFields : [],
  }
}

export async function createExpenseField(
  token: string,
  companyId: string | number,
  payload: { account_code: string; account_name: string },
): Promise<BusinessExpenseFieldRow> {
  const response = await api.post<ApiEnvelope<{ expenseField: BusinessExpenseFieldRow }>>(
    `/user/business/${companyId}/expense-fields`,
    payload,
    { headers: authHeaders(token) },
  )
  return unwrap(response.data)?.expenseField
}

export async function updateExpenseField(
  token: string,
  companyId: string | number,
  fieldId: string | number,
  payload: { account_code: string; account_name: string },
): Promise<BusinessExpenseFieldRow> {
  const response = await api.put<ApiEnvelope<{ expenseField: BusinessExpenseFieldRow }>>(
    `/user/business/${companyId}/expense-fields/${fieldId}`,
    payload,
    { headers: authHeaders(token) },
  )
  return unwrap(response.data)?.expenseField
}

export async function deleteExpenseField(
  token: string,
  companyId: string | number,
  fieldId: string | number,
): Promise<void> {
  await api.delete(`/user/business/${companyId}/expense-fields/${fieldId}`, {
    headers: authHeaders(token),
  })
}

export async function createBusinessExpense(
  token: string,
  companyId: string | number,
  payload: {
    amount: number | string
    date: string
    field_id: number | string
    spender: number | string
    company_account_id: number | string
    bill_number?: string
    remark?: string
  },
): Promise<BusinessExpenseRow> {
  const response = await api.post<ApiEnvelope<{ expense: BusinessExpenseRow }>>(
    `/user/business/${companyId}/expenses`,
    payload,
    { headers: authHeaders(token) },
  )
  return unwrap(response.data)?.expense
}

export async function updateBusinessExpense(
  token: string,
  companyId: string | number,
  expenseId: string | number,
  payload: {
    amount: number | string
    date: string
    field_id: number | string
    spender: number | string
    company_account_id?: number | string
    bill_number?: string
    remark?: string
  },
): Promise<BusinessExpenseRow> {
  const response = await api.put<ApiEnvelope<{ expense: BusinessExpenseRow }>>(
    `/user/business/${companyId}/expenses/${expenseId}`,
    payload,
    { headers: authHeaders(token) },
  )
  return unwrap(response.data)?.expense
}

export async function deleteBusinessExpense(
  token: string,
  companyId: string | number,
  expenseId: string | number,
): Promise<void> {
  await api.delete(`/user/business/${companyId}/expenses/${expenseId}`, {
    headers: authHeaders(token),
  })
}

export type BusinessSalesListMeta = {
  limit: number
  offset: number
  returned: number
  next_offset: number
  has_more: boolean
  total: number
}

export type BusinessSalesListFilters = {
  limit?: number
  offset?: number
  search?: string
  date_from?: string
  date_to?: string
  currency?: string
  status?: 'draft' | 'completed' | string
}

export type BusinessSalesListPayload = {
  sales: BusinessSaleRow[]
  meta: BusinessSalesListMeta
  totals_by_currency: Record<string, number>
}

export async function fetchBusinessSales(
  token: string,
  companyId: string | number,
  params?: BusinessSalesListFilters,
): Promise<BusinessSalesListPayload> {
  const limit = Math.max(1, Math.min(100, Number(params?.limit ?? 50) || 50))
  const offset = Math.max(0, Number(params?.offset ?? 0) || 0)
  const response = await api.get<{
    sales?: BusinessSaleRow[]
    meta?: Partial<BusinessSalesListMeta>
    totals_by_currency?: Record<string, number | string>
  }>(`/user/business/${companyId}/sales`, {
    headers: authHeaders(token),
    params: {
      limit,
      offset,
      search: params?.search || undefined,
      date_from: params?.date_from || undefined,
      date_to: params?.date_to || undefined,
      currency: params?.currency || undefined,
      status: params?.status || undefined,
    },
  })
  const sales = Array.isArray(response.data?.sales) ? response.data.sales : []
  const meta = response.data?.meta ?? {}
  const returned = Number(meta.returned ?? sales.length) || sales.length
  const nextOffset = Number(meta.next_offset ?? offset + returned) || offset + returned
  const total = Number(meta.total ?? nextOffset) || nextOffset
  const totalsRaw = response.data?.totals_by_currency ?? {}
  const totals_by_currency: Record<string, number> = {}
  Object.entries(totalsRaw).forEach(([code, amount]) => {
    const key = String(code || '').toLowerCase()
    if (!key) return
    totals_by_currency[key] = Number(amount) || 0
  })
  return {
    sales,
    totals_by_currency,
    meta: {
      limit: Number(meta.limit ?? limit) || limit,
      offset: Number(meta.offset ?? offset) || offset,
      returned,
      next_offset: nextOffset,
      has_more: Boolean(meta.has_more ?? nextOffset < total),
      total,
    },
  }
}

export type BusinessActivityLogRow = {
  id: number
  actor_name?: string | null
  actor_email?: string | null
  role_code?: string | null
  is_owner?: boolean
  role_label?: string | null
  subject_model?: string | null
  subject_model_label?: string | null
  subject_id?: number | null
  related_subject_model?: string | null
  related_subject_model_label?: string | null
  related_subject_id?: number | null
  method?: string | null
  occurred_at?: string | null
  created_at?: string | null
  entity_label?: string | null
  action_label?: string | null
  summary?: string | null
  reference?: string | null
  detail_lines?: string[]
}

export type BusinessActivityLogsFilters = {
  search?: string
  date_from?: string
  date_to?: string
  method?: string
  status?: string
}

export type BusinessActivityLogsPayload = {
  filters: Required<Pick<BusinessActivityLogsFilters, 'search' | 'date_from' | 'date_to'>> & {
    method: string
    status: string
  }
  logs: {
    data: BusinessActivityLogRow[]
    current_page: number
    last_page: number
    per_page: number
    total: number
    from: number | null
    to: number | null
  }
}

export async function fetchBusinessActivityLogs(
  token: string,
  companyId: string | number,
  params?: BusinessActivityLogsFilters & { page?: number },
): Promise<BusinessActivityLogsPayload> {
  const response = await api.get<BusinessActivityLogsPayload>(
    `/user/business/${companyId}/activity-logs`,
    {
      headers: authHeaders(token),
      params: {
        search: params?.search || undefined,
        date_from: params?.date_from || undefined,
        date_to: params?.date_to || undefined,
        method: params?.method || undefined,
        status: params?.status || undefined,
        page: params?.page || undefined,
      },
    },
  )
  const payload = response.data
  return {
    filters: {
      search: String(payload?.filters?.search ?? ''),
      method: String(payload?.filters?.method ?? ''),
      status: String(payload?.filters?.status ?? ''),
      date_from: String(payload?.filters?.date_from ?? ''),
      date_to: String(payload?.filters?.date_to ?? ''),
    },
    logs: {
      data: Array.isArray(payload?.logs?.data) ? payload.logs.data : [],
      current_page: Number(payload?.logs?.current_page ?? 1) || 1,
      last_page: Number(payload?.logs?.last_page ?? 1) || 1,
      per_page: Number(payload?.logs?.per_page ?? 30) || 30,
      total: Number(payload?.logs?.total ?? 0) || 0,
      from: payload?.logs?.from ?? null,
      to: payload?.logs?.to ?? null,
    },
  }
}

export type SaleInvoiceItemRow = {
  id: number
  item_id?: number
  item_name?: string | null
  item_code?: string | null
  quantity?: number
  price?: number
  total_price?: number
  currency?: string | null
  serial_number?: string | null
  remark?: string | null
  pending?: boolean
  item?: {
    id?: number
    code?: string | null
    name?: string | null
    brand?: string | null
    model?: string | null
    color?: string | null
    generation?: string | null
    ram_capacity?: string | null
    storage_capacity?: string | null
  } | null
}

export type SaleInvoiceShow = {
  id: number
  invoice_number?: number | string | null
  status?: number
  currency?: string | null
  company_account_id?: number | null
  company_account?: {
    id: number
    name?: string | null
    currency?: string | null
    is_sell_account?: boolean
  } | null
  total_price?: number | null
  previous_remaining?: number | null
  discount?: {
    percent?: number | null
    amount?: number | null
  } | null
  payable_amount?: number | null
  notes?: string | null
  sale_date?: string | null
  exchange_rate_id?: number | null
  customer_id?: number | null
  customer?: {
    id: number
    customer_id?: number | string | null
    name?: string | null
    company_name?: string | null
    phone?: string | null
  } | null
  exchange_rate?: { id: number; rate?: number; from_currency?: string; to_currency?: string } | null
  items?: SaleInvoiceItemRow[]
  payment?: {
    id: number
    amount?: number
    currency?: string | null
    type?: string | null
    amount_usd?: number | null
    amount_afn?: number | null
  } | null
  created_at?: string | null
}

export type SaleCatalogItem = {
  id: number
  code?: string | null
  name?: string | null
  image?: string | null
  type?: string | null
  brand?: string | null
  model?: string | null
  color?: string | null
  stock?: number | null
  price_afn?: number | null
  price_usd?: number | null
  purchase_unit_cost?: number | null
  purchase_currency?: string | null
  sale_currency?: string | null
  sale_price?: number | null
  sale_price_afn?: number | null
  sale_price_usd?: number | null
  unit_id?: number | null
  unit_name?: string | null
  medium_unit_id?: number | null
  medium_unit_name?: string | null
  medium_to_base_qty?: number | null
  large_unit_id?: number | null
  large_unit_name?: string | null
  large_to_base_qty?: number | null
}

export type QuickSaleExchangeRateContext = {
  from_currency?: string | null
  to_currency?: string | null
  capital_account_id?: number | null
  sell_account_id?: number | null
  sale_account_id?: number | null
  suggested_rate?: number | null
  rate?: number | null
}

export type SuggestedExchangeRate = {
  id?: number
  rate?: number | null
  from_currency?: string | null
  to_currency?: string | null
}

export type SaleShowPayload = {
  invoice: SaleInvoiceShow
  sell_account?: { id: number; name?: string; currency?: string | null } | null
  sale_account?: {
    id: number
    name?: string
    currency?: string | null
    is_sell_account?: boolean
  } | null
  exchangeRate?: SuggestedExchangeRate | null
  exchangeRateContext?: QuickSaleExchangeRateContext | null
  items?: SaleCatalogItem[]
}

export function parseExchangeRateContextFromError(err: unknown): QuickSaleExchangeRateContext | null {
  if (!(err instanceof AxiosError) || !err.response?.data || typeof err.response.data !== 'object') {
    return null
  }
  const data = err.response.data as Record<string, unknown>
  const nested = (data.exchangeRateContext || data.exchange_rate_context) as
    | QuickSaleExchangeRateContext
    | undefined
  const exchangeRate = (data.exchangeRate || data.exchange_rate) as SuggestedExchangeRate | undefined
  const from = String(data.from_currency || nested?.from_currency || exchangeRate?.from_currency || '').toLowerCase()
  const to = String(data.to_currency || nested?.to_currency || exchangeRate?.to_currency || '').toLowerCase()
  if (!from || !to) return null
  const rawRate =
    data.rate ?? nested?.suggested_rate ?? nested?.rate ?? exchangeRate?.rate ?? null
  const suggested = rawRate != null && rawRate !== '' ? Number(rawRate) : null
  return {
    from_currency: from,
    to_currency: to,
    capital_account_id: nested?.capital_account_id ?? null,
    sell_account_id: nested?.sell_account_id ?? null,
    suggested_rate: suggested != null && Number.isFinite(suggested) && suggested > 0 ? suggested : null,
    rate: suggested != null && Number.isFinite(suggested) && suggested > 0 ? suggested : null,
  }
}

/** Prefer invoice rate, then suggested system rate; empty string if directional and unknown. */
export function suggestedExchangeRateInput(
  invoiceRate: number | string | null | undefined,
  suggested: number | string | null | undefined,
  hasDirectionalPair: boolean,
): string {
  const invoice = Number(invoiceRate)
  if (Number.isFinite(invoice) && invoice > 0) return String(invoice)
  const latest = Number(suggested)
  if (Number.isFinite(latest) && latest > 0) return String(latest)
  return hasDirectionalPair ? '' : '1'
}

export function exchangePairFromAccounts(
  accounts: Array<{ id?: number; is_capital?: boolean; is_sell_account?: boolean; currency?: string | null }>,
): QuickSaleExchangeRateContext | null {
  const capital = accounts.find((a) => a.is_capital)
  const sell = accounts.find((a) => a.is_sell_account)
  const from = String(capital?.currency || '').toLowerCase()
  const to = String(sell?.currency || '').toLowerCase()
  if (!from || !to || from === to) return null
  return {
    from_currency: from,
    to_currency: to,
    capital_account_id: capital?.id ?? null,
    sell_account_id: sell?.id ?? null,
  }
}

export async function fetchSaleShow(
  token: string,
  companyId: string | number,
  invoiceId: string | number,
): Promise<SaleShowPayload> {
  const response = await api.get<ApiEnvelope<SaleShowPayload>>(
    `/user/business/${companyId}/sales/${invoiceId}`,
    { headers: authHeaders(token) },
  )
  return unwrap(response.data)
}

export async function createSaleDraft(
  token: string,
  companyId: string | number,
): Promise<SaleInvoiceShow> {
  const response = await api.post<ApiEnvelope<{ invoice: SaleInvoiceShow }>>(
    `/user/business/${companyId}/sales`,
    {},
    { headers: authHeaders(token) },
  )
  return unwrap(response.data)?.invoice
}

export async function setSaleClient(
  token: string,
  companyId: string | number,
  invoiceId: string | number,
  payload: {
    without_customer?: boolean
    customer_id?: number | string
    company_account_id?: number | string
    currency?: string
    exchange_rate?: number | string
    sale_date?: string | null
  },
): Promise<SaleInvoiceShow> {
  const response = await api.post<ApiEnvelope<{ invoice: SaleInvoiceShow }>>(
    `/user/business/${companyId}/sales/${invoiceId}/client`,
    payload,
    { headers: authHeaders(token) },
  )
  return unwrap(response.data)?.invoice
}

export async function addSaleItem(
  token: string,
  companyId: string | number,
  invoiceId: string | number,
  payload: {
    item_id: number | string
    quantity: number | string
    price: number | string
    currency?: string
    serial_number?: string
    remark?: string
  },
): Promise<SaleInvoiceShow> {
  const response = await api.post<ApiEnvelope<{ invoice: SaleInvoiceShow }>>(
    `/user/business/${companyId}/sales/${invoiceId}/items`,
    payload,
    { headers: authHeaders(token) },
  )
  return unwrap(response.data)?.invoice
}

export async function addSaleItemsBatch(
  token: string,
  companyId: string | number,
  invoiceId: string | number,
  items: Array<{
    item_id: number | string
    quantity: number | string
    price: number | string
    currency?: string
    serial_number?: string
    remark?: string
  }>,
): Promise<SaleInvoiceShow> {
  const response = await api.post<ApiEnvelope<{ invoice: SaleInvoiceShow }>>(
    `/user/business/${companyId}/sales/${invoiceId}/items/batch`,
    { items },
    { headers: authHeaders(token) },
  )
  return unwrap(response.data)?.invoice
}

export async function removeSaleItem(
  token: string,
  companyId: string | number,
  invoiceId: string | number,
  itemSaleId: string | number,
): Promise<SaleInvoiceShow> {
  const response = await api.delete<ApiEnvelope<{ invoice: SaleInvoiceShow }>>(
    `/user/business/${companyId}/sales/${invoiceId}/items/${itemSaleId}`,
    { headers: authHeaders(token) },
  )
  return unwrap(response.data)?.invoice
}

export async function updateSaleItemQuantity(
  token: string,
  companyId: string | number,
  invoiceId: string | number,
  payload: {
    invoice_item_id: number | string
    quantity: number | string
    /** Optional unit sale price for draft invoice lines. */
    price?: number | string
  },
): Promise<SaleInvoiceShow> {
  const response = await api.post<ApiEnvelope<{ invoice: SaleInvoiceShow }>>(
    `/user/business/${companyId}/sales/${invoiceId}/items/update-quantity`,
    payload,
    { headers: authHeaders(token) },
  )
  return unwrap(response.data)?.invoice
}

export async function finalizeSale(
  token: string,
  companyId: string | number,
  invoiceId: string | number,
  payload: {
    paid_amount: number | string
    mode?: string
    paid_account_id?: number | string
    notes?: string
    discount_percent?: number | string
    discount_amount?: number | string
  },
): Promise<SaleInvoiceShow> {
  const response = await api.post<ApiEnvelope<{ invoice: SaleInvoiceShow }>>(
    `/user/business/${companyId}/sales/${invoiceId}/finalize`,
    payload,
    { headers: authHeaders(token) },
  )
  return unwrap(response.data)?.invoice
}

export async function destroySaleDraft(
  token: string,
  companyId: string | number,
  invoiceId: string | number,
): Promise<void> {
  await api.delete(`/user/business/${companyId}/sales/${invoiceId}`, {
    headers: authHeaders(token),
  })
}

export async function reopenSale(
  token: string,
  companyId: string | number,
  invoiceId: string | number,
): Promise<SaleInvoiceShow> {
  const response = await api.post<ApiEnvelope<{ invoice: SaleInvoiceShow }>>(
    `/user/business/${companyId}/sales/${invoiceId}/reopen`,
    {},
    { headers: authHeaders(token) },
  )
  return unwrap(response.data)?.invoice
}

export async function updateSaleNotes(
  token: string,
  companyId: string | number,
  invoiceId: string | number,
  notes: string,
): Promise<SaleInvoiceShow> {
  const response = await api.post<ApiEnvelope<{ invoice: SaleInvoiceShow }>>(
    `/user/business/${companyId}/sales/${invoiceId}/notes`,
    { notes },
    { headers: authHeaders(token) },
  )
  return unwrap(response.data)?.invoice
}

export type QuickSaleCreateResult = {
  invoice: SaleInvoiceShow
  invoice_id: number
}

export type QuickSaleSetupPayload = {
  invoice: SaleInvoiceShow
  items: SaleCatalogItem[]
  exchangeRateContext: QuickSaleExchangeRateContext
}

export type EasySaleCreateResult = {
  invoice: SaleInvoiceShow
  invoice_id: number
}

export type EasySaleSetupPayload = {
  invoice: SaleInvoiceShow
  items: SaleCatalogItem[]
  exchangeRateContext: QuickSaleExchangeRateContext
}

export async function createEasySaleDraft(
  token: string,
  companyId: string | number,
  payload?: { exchange_rate?: number | string },
): Promise<EasySaleCreateResult> {
  const response = await api.post<ApiEnvelope<EasySaleCreateResult>>(
    `/user/business/${companyId}/easy-sales/create`,
    payload ?? {},
    { headers: authHeaders(token) },
  )
  return unwrap(response.data)
}

export async function fetchEasySaleSetup(
  token: string,
  companyId: string | number,
  invoiceId: string | number,
): Promise<EasySaleSetupPayload> {
  const response = await api.get<ApiEnvelope<EasySaleSetupPayload>>(
    `/user/business/${companyId}/easy-sales/${invoiceId}/setup`,
    { headers: authHeaders(token) },
  )
  return unwrap(response.data)
}

export async function easySaleUpdateMeta(
  token: string,
  companyId: string | number,
  invoiceId: string | number,
  payload: {
    without_customer?: boolean
    customer_id?: number | string
    company_account_id?: number | string
    currency?: string
    exchange_rate?: number | string
    sale_date?: string | null
  },
): Promise<SaleInvoiceShow> {
  const response = await api.post<ApiEnvelope<{ invoice: SaleInvoiceShow }>>(
    `/user/business/${companyId}/easy-sales/${invoiceId}/meta`,
    payload,
    { headers: authHeaders(token) },
  )
  return unwrap(response.data)?.invoice
}

export async function easySaleAddItemsBatch(
  token: string,
  companyId: string | number,
  invoiceId: string | number,
  items: Array<{
    item_id: number | string
    quantity: number | string
    price: number | string
    currency?: string
    serial_number?: string
    remark?: string
  }>,
): Promise<SaleInvoiceShow> {
  const response = await api.post<ApiEnvelope<{ invoice: SaleInvoiceShow }>>(
    `/user/business/${companyId}/easy-sales/${invoiceId}/items/batch`,
    { items },
    { headers: authHeaders(token) },
  )
  return unwrap(response.data)?.invoice
}

export async function easySaleScanItem(
  token: string,
  companyId: string | number,
  invoiceId: string | number,
  payload: string | { barcode?: string; item_id?: number | string },
): Promise<{ invoice: SaleInvoiceShow; message?: string }> {
  const body =
    typeof payload === 'string' || typeof payload === 'number'
      ? { barcode: String(payload) }
      : payload
  const response = await api.post<ApiEnvelope<{ invoice: SaleInvoiceShow }>>(
    `/user/business/${companyId}/easy-sales/${invoiceId}/scan`,
    body,
    { headers: authHeaders(token) },
  )
  const data = unwrap(response.data)
  return {
    invoice: data?.invoice,
    message: typeof response.data?.message === 'string' ? response.data.message : undefined,
  }
}

export async function easySaleRemoveItem(
  token: string,
  companyId: string | number,
  invoiceId: string | number,
  itemSaleId: string | number,
): Promise<SaleInvoiceShow> {
  const response = await api.delete<ApiEnvelope<{ invoice: SaleInvoiceShow }>>(
    `/user/business/${companyId}/easy-sales/${invoiceId}/items/${itemSaleId}`,
    { headers: authHeaders(token) },
  )
  return unwrap(response.data)?.invoice
}

export async function easySaleFinalizePayment(
  token: string,
  companyId: string | number,
  invoiceId: string | number,
  payload: {
    paid_amount: number | string
    customer_id?: number | string
    paid_account_id?: number | string
    notes?: string
    discount_percent?: number | string
    discount_amount?: number | string
  },
): Promise<SaleInvoiceShow> {
  const response = await api.post<ApiEnvelope<{ invoice: SaleInvoiceShow }>>(
    `/user/business/${companyId}/easy-sales/${invoiceId}/finalize`,
    payload,
    { headers: authHeaders(token) },
  )
  return unwrap(response.data)?.invoice
}

export type SalesDailyReportRow = {
  item_id?: number | null
  item_name?: string | null
  currency?: string | null
  sold_qty?: number
  total_sales?: number
  average_unit_price?: number
  total_profit?: number
  average_unit_profit?: number
  invoice_count?: number
}

export type SalesDailyReportPayload = {
  salesReportRows: SalesDailyReportRow[]
  summary: {
    date?: string
    total_items?: number
    total_invoices?: number
    total_sold_qty?: number
    totals_by_currency?: Record<string, number>
    profit_totals_by_currency?: Record<string, number>
  }
  reportContext?: { date?: string }
}

export type SalesProfitReportRow = {
  item_id?: number
  item_name?: string | null
  sale_date?: string | null
  invoice_id?: number | null
  invoice_number?: number | string | null
  sold_qty?: number
  sale_in_sell_currency?: number
  purchase_in_sell_currency?: number
  sale_in_capital_currency?: number
  purchase_in_capital_currency?: number
  profit_in_sell_currency?: number
  profit_in_capital_currency?: number
}

export type SalesProfitReportPayload = {
  profitRows: SalesProfitReportRow[]
  summary: {
    total_sold_qty?: number
    total_sale_in_sell_currency?: number
    total_purchase_in_sell_currency?: number
    total_sale_in_capital_currency?: number
    total_purchase_in_capital_currency?: number
    total_profit_in_sell_currency?: number
    total_profit_in_capital_currency?: number
  }
  reportContext?: {
    accounts_differ?: boolean
    sell_account_name?: string | null
    sell_currency?: string | null
    capital_account_name?: string | null
    capital_currency?: string | null
    from?: string | null
    to?: string | null
    view_mode?: string
  }
}

export async function createQuickSale(
  token: string,
  companyId: string | number,
  payload?: { exchange_rate?: number | string },
): Promise<QuickSaleCreateResult> {
  const response = await api.post<ApiEnvelope<QuickSaleCreateResult>>(
    `/user/business/${companyId}/sales/quick-create`,
    payload ?? {},
    { headers: authHeaders(token) },
  )
  return unwrap(response.data)
}

export async function fetchQuickSaleSetup(
  token: string,
  companyId: string | number,
  invoiceId: string | number,
): Promise<QuickSaleSetupPayload> {
  const response = await api.get<ApiEnvelope<QuickSaleSetupPayload>>(
    `/user/business/${companyId}/sales/${invoiceId}/quick-setup`,
    { headers: authHeaders(token) },
  )
  return unwrap(response.data)
}

export async function quickScanSaleItem(
  token: string,
  companyId: string | number,
  invoiceId: string | number,
  payload: string | { barcode?: string; item_id?: number | string },
): Promise<{ invoice: SaleInvoiceShow; message?: string }> {
  const body =
    typeof payload === 'string' || typeof payload === 'number'
      ? { barcode: String(payload) }
      : payload
  const response = await api.post<ApiEnvelope<{ invoice: SaleInvoiceShow }>>(
    `/user/business/${companyId}/sales/${invoiceId}/quick-scan`,
    body,
    { headers: authHeaders(token) },
  )
  const data = unwrap(response.data)
  return {
    invoice: data?.invoice,
    message: typeof response.data?.message === 'string' ? response.data.message : undefined,
  }
}

export async function fetchSalesDailyReport(
  token: string,
  companyId: string | number,
  date?: string,
): Promise<SalesDailyReportPayload> {
  const response = await api.get<ApiEnvelope<SalesDailyReportPayload>>(
    `/user/business/${companyId}/sales-daily-report`,
    {
      headers: authHeaders(token),
      params: date ? { date } : undefined,
    },
  )
  const data = unwrap(response.data)
  return {
    salesReportRows: Array.isArray(data?.salesReportRows) ? data.salesReportRows : [],
    summary: data?.summary ?? {},
    reportContext: data?.reportContext,
  }
}

export type JournalRow = {
  id: number
  company_account_id?: number | null
  account_name?: string | null
  direction?: string | null
  amount?: number | string | null
  in_amount?: number | string | null
  out_amount?: number | string | null
  currency?: string | null
  balance_before?: number | string | null
  balance_after?: number | string | null
  title?: string | null
  description?: string | null
  created_at?: string | null
}

export type JournalPayload = {
  date: string
  rows: JournalRow[]
  summary: {
    count?: number
    in_by_currency?: Record<string, number>
    out_by_currency?: Record<string, number>
  }
}

export async function fetchJournal(
  token: string,
  companyId: string | number,
  date?: string,
): Promise<JournalPayload> {
  const response = await api.get<ApiEnvelope<JournalPayload>>(
    `/user/business/${companyId}/journal`,
    {
      headers: authHeaders(token),
      params: date ? { date } : undefined,
    },
  )
  const data = unwrap(response.data)
  return {
    date: String(data?.date || date || ''),
    rows: Array.isArray(data?.rows) ? data.rows : [],
    summary: data?.summary ?? {},
  }
}

export async function fetchSalesProfitReport(
  token: string,
  companyId: string | number,
  params?: { from?: string; to?: string; view?: string },
): Promise<SalesProfitReportPayload> {
  const response = await api.get<ApiEnvelope<SalesProfitReportPayload>>(
    `/user/business/${companyId}/sales-profit-report`,
    {
      headers: authHeaders(token),
      params: {
        from: params?.from || undefined,
        to: params?.to || undefined,
        view: params?.view || undefined,
      },
    },
  )
  const data = unwrap(response.data)
  return {
    profitRows: Array.isArray(data?.profitRows) ? data.profitRows : [],
    summary: data?.summary ?? {},
    reportContext: data?.reportContext,
  }
}

export type SalesProfitLossSummary = {
  gross_sales_sell?: number
  cogs_sell?: number
  gross_profit_sell?: number
  discounts_sell?: number
  expenses_sell?: number
  transfer_costs_sell?: number
  net_profit_sell?: number
  gross_sales_capital?: number
  cogs_capital?: number
  gross_profit_capital?: number
  discounts_capital?: number
  expenses_capital?: number
  transfer_costs_capital?: number
  net_profit_capital?: number
}

export type SalesProfitLossReportPayload = {
  summary: SalesProfitLossSummary
  reportContext?: {
    accounts_differ?: boolean
    sell_account_name?: string | null
    sell_currency?: string | null
    capital_account_name?: string | null
    capital_currency?: string | null
    from?: string | null
    to?: string | null
  }
}

export async function fetchSalesProfitLossReport(
  token: string,
  companyId: string | number,
  params?: { from?: string; to?: string },
): Promise<SalesProfitLossReportPayload> {
  const response = await api.get<ApiEnvelope<SalesProfitLossReportPayload>>(
    `/user/business/${companyId}/sales-profit-loss-report`,
    {
      headers: authHeaders(token),
      params: {
        from: params?.from || undefined,
        to: params?.to || undefined,
      },
    },
  )
  const data = unwrap(response.data)
  return {
    summary: data?.summary ?? {},
    reportContext: data?.reportContext,
  }
}

export type BusinessWarehouseRow = {
  id: number
  name?: string | null
  address?: string | null
}

export type BusinessPurchaseRow = {
  id: number
  purchase_number?: number | string | null
  total_price?: number | null
  currency?: string | null
  company_account_id?: number | null
  status?: number | null
  vendor_name?: string | null
  vendor?: { id: number; name?: string | null } | null
  company_warehouse_id?: number | null
  warehouse_name?: string | null
  warehouse?: { id: number; name?: string | null } | null
  purchase_date?: string | null
  created_at?: string | null
}

export type BusinessPurchasesListFilters = {
  limit?: number
  offset?: number
  search?: string
  date_from?: string
  date_to?: string
  currency?: string
  status?: 'draft' | 'completed' | string
}

export type BusinessPurchasesListMeta = {
  limit: number
  offset: number
  returned: number
  next_offset: number
  has_more: boolean
  total: number
}

export type BusinessPurchasesListPayload = {
  purchases: BusinessPurchaseRow[]
  meta: BusinessPurchasesListMeta
  totals_by_currency: Record<string, number>
}

export type PurchaseCatalogItem = {
  id: number
  code?: string | null
  name?: string | null
  type?: string | null
  serial_number?: string | null
  stock?: number | null
  price_afn?: number | null
  price_usd?: number | null
  unit_id?: number | null
  unit_name?: string | null
  medium_unit_id?: number | null
  medium_unit_name?: string | null
  medium_to_base_qty?: number | null
  large_unit_id?: number | null
  large_unit_name?: string | null
  large_to_base_qty?: number | null
}

export type PurchaseShow = {
  id: number
  purchase_number?: number | string | null
  status?: number
  currency?: string | null
  total_price?: number | null
  vendor_id?: number | null
  vendor?: { id: number; name?: string | null; phone?: string | null; company_name?: string | null } | null
  company_account_id?: number | null
  account?: { id: number; name?: string | null; currency?: string | null } | null
  company_warehouse_id?: number | null
  warehouse?: {
    id: number
    name?: string | null
    address?: string | null
    status?: number | null
  } | null
  exchange_rate?: {
    id?: number
    rate?: number | null
    from_currency?: string | null
    to_currency?: string | null
  } | null
  items?: Array<{
    id: number
    item_id?: number
    item_name?: string | null
    item_code?: string | null
    quantity?: number
    purchase_price?: number
    total_price?: number
    currency?: string | null
    serial_number?: string | null
    item?: {
      id?: number
      name?: string | null
      code?: string | null
      type?: string | null
      stock?: number | null
      brand?: string | null
      model?: string | null
      color?: string | null
      generation?: number | string | null
      ram_capacity?: number | string | null
      storage_capacity?: number | string | null
    } | null
  }>
  payment?: {
    id: number
    amount?: number
    currency?: string | null
    type?: string | null
    company_account_id?: number | null
    company_account?: {
      id: number
      name?: string | null
      currency?: string | null
    } | null
  } | null
  notes?: string | null
  purchase_date?: string | null
  created_at?: string | null
}

export type PurchaseShowPayload = {
  purchase: PurchaseShow
  items: PurchaseCatalogItem[]
  warehouses: BusinessWarehouseRow[]
  exchangeRateContext?: QuickSaleExchangeRateContext | null
}

export async function fetchBusinessPurchases(
  token: string,
  companyId: string | number,
  params?: BusinessPurchasesListFilters,
): Promise<BusinessPurchasesListPayload> {
  const limit = Math.max(1, Math.min(100, Number(params?.limit ?? 50) || 50))
  const offset = Math.max(0, Number(params?.offset ?? 0) || 0)
  const response = await api.get<
    ApiEnvelope<{
      purchases?: BusinessPurchaseRow[]
      meta?: Partial<BusinessPurchasesListMeta>
      totals_by_currency?: Record<string, number | string>
    }>
  >(`/user/business/${companyId}/purchases`, {
    headers: authHeaders(token),
    params: {
      limit,
      offset,
      search: params?.search || undefined,
      date_from: params?.date_from || undefined,
      date_to: params?.date_to || undefined,
      currency: params?.currency || undefined,
      status: params?.status || undefined,
    },
  })
  const data = unwrap(response.data)
  const purchases = Array.isArray(data?.purchases) ? data.purchases : []
  const meta = data?.meta ?? {}
  const returned = Number(meta.returned ?? purchases.length) || purchases.length
  const nextOffset = Number(meta.next_offset ?? offset + returned) || offset + returned
  const total = Number(meta.total ?? nextOffset) || nextOffset
  const totalsRaw = data?.totals_by_currency ?? {}
  const totals_by_currency: Record<string, number> = {}
  Object.entries(totalsRaw).forEach(([code, amount]) => {
    const key = String(code || '').toLowerCase()
    if (!key) return
    totals_by_currency[key] = Number(amount) || 0
  })
  return {
    purchases,
    totals_by_currency,
    meta: {
      limit: Number(meta.limit ?? limit) || limit,
      offset: Number(meta.offset ?? offset) || offset,
      returned,
      next_offset: nextOffset,
      has_more: Boolean(meta.has_more ?? nextOffset < total),
      total,
    },
  }
}

export async function fetchPurchaseShow(
  token: string,
  companyId: string | number,
  purchaseNumber: string | number,
): Promise<PurchaseShowPayload> {
  const response = await api.get<
    ApiEnvelope<{
      purchase: PurchaseShow
      items?: PurchaseCatalogItem[]
      warehouses?: BusinessWarehouseRow[]
      exchangeRateContext?: QuickSaleExchangeRateContext | null
      exchange_rate_context?: QuickSaleExchangeRateContext | null
    }>
  >(`/user/business/${companyId}/purchases/${purchaseNumber}`, {
    headers: authHeaders(token),
  })
  const data = unwrap(response.data)
  return {
    purchase: data.purchase,
    items: data.items ?? [],
    warehouses: data.warehouses ?? [],
    exchangeRateContext: data.exchangeRateContext || data.exchange_rate_context || null,
  }
}

export async function fetchPurchaseWarehouses(
  token: string,
  companyId: string | number,
): Promise<BusinessWarehouseRow[]> {
  const response = await api.get<ApiEnvelope<{ warehouses: BusinessWarehouseRow[] }>>(
    `/user/business/${companyId}/purchases/warehouses`,
    { headers: authHeaders(token) },
  )
  return unwrap(response.data)?.warehouses ?? []
}

export async function createPurchaseDraft(
  token: string,
  companyId: string | number,
  payload: {
    without_vendor?: boolean
    vendor_id?: number | string
    company_account_id: number | string
    exchange_rate?: number | string
    transfer_to_warehouse?: boolean
    company_warehouse_id?: number | string
    purchase_date?: string | null
  },
): Promise<PurchaseShow> {
  const response = await api.post<ApiEnvelope<{ purchase: PurchaseShow; purchase_number?: number }>>(
    `/user/business/${companyId}/purchases`,
    payload,
    { headers: authHeaders(token) },
  )
  return unwrap(response.data)?.purchase
}

export async function updatePurchaseWarehouse(
  token: string,
  companyId: string | number,
  purchaseId: string | number,
  payload: {
    transfer_to_warehouse?: boolean
    company_warehouse_id?: number | string | null
  },
): Promise<PurchaseShow> {
  const response = await api.post<ApiEnvelope<{ purchase: PurchaseShow }>>(
    `/user/business/${companyId}/purchases/${purchaseId}/warehouse`,
    payload,
    { headers: authHeaders(token) },
  )
  return unwrap(response.data)?.purchase
}

export async function updatePurchaseDate(
  token: string,
  companyId: string | number,
  purchaseId: string | number,
  purchaseDate: string | null,
): Promise<PurchaseShow> {
  const response = await api.post<ApiEnvelope<{ purchase: PurchaseShow }>>(
    `/user/business/${companyId}/purchases/${purchaseId}/date`,
    { purchase_date: purchaseDate },
    { headers: authHeaders(token) },
  )
  return unwrap(response.data)?.purchase
}

export async function updatePurchaseNotes(
  token: string,
  companyId: string | number,
  purchaseId: string | number,
  notes: string,
): Promise<PurchaseShow> {
  const response = await api.post<ApiEnvelope<{ purchase: PurchaseShow }>>(
    `/user/business/${companyId}/purchases/${purchaseId}/notes`,
    { notes },
    { headers: authHeaders(token) },
  )
  return unwrap(response.data)?.purchase
}

export async function completePurchase(
  token: string,
  companyId: string | number,
  purchaseId: string | number,
): Promise<PurchaseShow> {
  const response = await api.post<ApiEnvelope<{ purchase: PurchaseShow }>>(
    `/user/business/${companyId}/purchases/${purchaseId}/complete`,
    {},
    { headers: authHeaders(token) },
  )
  return unwrap(response.data)?.purchase
}

export async function addPurchaseItem(
  token: string,
  companyId: string | number,
  purchaseId: string | number,
  payload: {
    item_id: number | string
    quantity: number | string
    purchase_price: number | string
    serial_number?: string
  },
): Promise<PurchaseShow> {
  const response = await api.post<ApiEnvelope<{ purchase: PurchaseShow }>>(
    `/user/business/${companyId}/purchases/${purchaseId}/items`,
    payload,
    { headers: authHeaders(token) },
  )
  return unwrap(response.data)?.purchase
}

export async function removePurchaseItem(
  token: string,
  companyId: string | number,
  purchaseId: string | number,
  itemId: string | number,
): Promise<PurchaseShow> {
  const response = await api.delete<ApiEnvelope<{ purchase: PurchaseShow }>>(
    `/user/business/${companyId}/purchases/${purchaseId}/items/${itemId}`,
    { headers: authHeaders(token) },
  )
  return unwrap(response.data)?.purchase
}

export async function finalizePurchase(
  token: string,
  companyId: string | number,
  purchaseId: string | number,
  payload: {
    paid_amount?: number | string
    mode?: string
    paid_account_id?: number | string
    notes?: string
  },
): Promise<PurchaseShow> {
  const response = await api.post<ApiEnvelope<{ purchase: PurchaseShow }>>(
    `/user/business/${companyId}/purchases/${purchaseId}/finalize`,
    payload,
    { headers: authHeaders(token) },
  )
  return unwrap(response.data)?.purchase
}

export async function backPurchaseToItems(
  token: string,
  companyId: string | number,
  purchaseId: string | number,
): Promise<PurchaseShow> {
  const response = await api.post<ApiEnvelope<{ purchase: PurchaseShow }>>(
    `/user/business/${companyId}/purchases/${purchaseId}/back-to-items`,
    {},
    { headers: authHeaders(token) },
  )
  return unwrap(response.data)?.purchase
}

export async function destroyPurchase(
  token: string,
  companyId: string | number,
  purchaseId: string | number,
): Promise<void> {
  await api.delete(`/user/business/${companyId}/purchases/${purchaseId}`, {
    headers: authHeaders(token),
  })
}

export async function fetchBusinessItems(
  token: string,
  companyId: string | number,
  classification = 'product',
): Promise<BusinessItemRow[]> {
  const data = await fetchItemsPage(token, companyId, classification)
  return data.items
}

export async function fetchItemsPage(
  token: string,
  companyId: string | number,
  classification = 'product',
): Promise<ItemsPagePayload> {
  const response = await api.get<
    ApiEnvelope<{
      items?: BusinessItemRow[]
      warehouses?: Array<{ id: number; name?: string | null }>
      itemCategories?: Array<{ id: number; name?: string | null }>
      inventorySummary?: ItemsInventorySummary
    }>
  >(`/user/business/${companyId}/items`, {
    headers: authHeaders(token),
    params: { classification },
  })
  const data = unwrap(response.data)
  return {
    items: data?.items ?? [],
    warehouses: data?.warehouses ?? [],
    itemCategories: data?.itemCategories ?? [],
    inventorySummary: data?.inventorySummary ?? {},
  }
}

export type ItemsExcelImportResult = {
  imported: number
  skipped: number
  errors: Array<{ row: number; message: string }>
}

export async function downloadItemsExcelTemplate(
  token: string,
  companyId: string | number,
  classification = 'product',
): Promise<DownloadedFile> {
  const response = await api.get(`/user/business/${companyId}/items/excel-template`, {
    headers: authHeaders(token),
    params: { classification },
    responseType: 'blob',
  })
  return {
    blob: response.data as Blob,
    filename: parseFilenameFromContentDisposition(response.headers['content-disposition']),
  }
}

export async function exportItemsExcel(
  token: string,
  companyId: string | number,
  classification = 'product',
): Promise<DownloadedFile> {
  const response = await api.get(`/user/business/${companyId}/items/excel-export`, {
    headers: authHeaders(token),
    params: { classification },
    responseType: 'blob',
  })
  return {
    blob: response.data as Blob,
    filename: parseFilenameFromContentDisposition(response.headers['content-disposition']),
  }
}

export async function importItemsExcel(
  token: string,
  companyId: string | number,
  file: File,
  classification = 'product',
): Promise<ItemsExcelImportResult> {
  const form = new FormData()
  form.append('file', file)
  form.append('classification', classification)
  const response = await api.post<ApiEnvelope<ItemsExcelImportResult>>(
    `/user/business/${companyId}/items/excel-import`,
    form,
    {
      headers: {
        ...authHeaders(token),
        'Content-Type': 'multipart/form-data',
      },
      timeout: 120000,
    },
  )
  return (
    unwrap(response.data) ?? {
      imported: 0,
      skipped: 0,
      errors: [],
    }
  )
}

export async function fetchMeasurementUnits(
  token: string,
  companyId: string | number,
): Promise<MeasurementUnitRow[]> {
  const response = await api.get<ApiEnvelope<{ units: MeasurementUnitRow[] }>>(
    `/user/business/${companyId}/items/units`,
    { headers: authHeaders(token) },
  )
  return unwrap(response.data)?.units ?? []
}

export async function fetchItemCategories(
  token: string,
  companyId: string | number,
): Promise<BusinessItemCategoryRow[]> {
  const response = await api.get<ApiEnvelope<{ categories: BusinessItemCategoryRow[] }>>(
    `/user/business/${companyId}/item-categories`,
    { headers: authHeaders(token) },
  )
  return unwrap(response.data)?.categories ?? []
}

export async function createItemCategory(
  token: string,
  companyId: string | number,
  payload: { name: string; remark?: string },
): Promise<BusinessItemCategoryRow> {
  const response = await api.post<ApiEnvelope<{ category: BusinessItemCategoryRow }>>(
    `/user/business/${companyId}/item-categories`,
    payload,
    { headers: authHeaders(token) },
  )
  return unwrap(response.data)?.category
}

export async function updateItemCategory(
  token: string,
  companyId: string | number,
  categoryId: number | string,
  payload: { name: string; remark?: string },
): Promise<BusinessItemCategoryRow> {
  const response = await api.put<ApiEnvelope<{ category: BusinessItemCategoryRow }>>(
    `/user/business/${companyId}/item-categories/${categoryId}`,
    payload,
    { headers: authHeaders(token) },
  )
  return unwrap(response.data)?.category
}

export async function deleteItemCategory(
  token: string,
  companyId: string | number,
  categoryId: number | string,
  options?: { detach_items?: boolean },
): Promise<{ detached_items?: number }> {
  const response = await api.delete<ApiEnvelope<{ detached_items?: number } | null>>(
    `/user/business/${companyId}/item-categories/${categoryId}`,
    {
      headers: authHeaders(token),
      data: { detach_items: Boolean(options?.detach_items) },
    },
  )
  return unwrap(response.data) ?? {}
}

export async function createItemDraft(
  token: string,
  companyId: string | number,
  classification: 'product' | 'raw_material' = 'product',
): Promise<BusinessItemShow> {
  const response = await api.post<ApiEnvelope<{ item: BusinessItemShow }>>(
    `/user/business/${companyId}/items`,
    { classification },
    { headers: authHeaders(token) },
  )
  return unwrap(response.data)?.item
}

export async function fetchItemShow(
  token: string,
  companyId: string | number,
  itemId: number | string,
): Promise<BusinessItemShow> {
  const data = await fetchItemShowPayload(token, companyId, itemId)
  return {
    ...data.item,
    category: data.category ?? data.item?.category,
    unit: data.unit ?? data.item?.unit,
    bomComponents: data.bomComponents ?? data.item?.bomComponents,
    salePrices: data.salePrices ?? data.item?.salePrices,
    salePrice: data.salePrice ?? data.item?.salePrice,
    latestPurchaseCost: data.latestPurchaseCost ?? data.item?.latestPurchaseCost,
  }
}

export async function fetchItemShowPayload(
  token: string,
  companyId: string | number,
  itemId: number | string,
): Promise<ItemShowPayload> {
  const response = await api.get<ApiEnvelope<ItemShowPayload>>(
    `/user/business/${companyId}/items/${itemId}`,
    { headers: authHeaders(token) },
  )
  return unwrap(response.data)
}

export async function fetchItemInventories(
  token: string,
  companyId: string | number,
  itemId: number | string,
): Promise<{ inventoryRecords: ItemInventoryRecord[]; item: BusinessItemShow }> {
  const response = await api.get<
    ApiEnvelope<{ inventoryRecords?: ItemInventoryRecord[]; item?: BusinessItemShow }>
  >(`/user/business/${companyId}/items/${itemId}/inventories`, {
    headers: authHeaders(token),
  })
  const data = unwrap(response.data)
  return {
    inventoryRecords: data?.inventoryRecords ?? [],
    item: data?.item as BusinessItemShow,
  }
}

export async function addItemOpeningInventory(
  token: string,
  companyId: string | number,
  itemId: number | string,
  payload: {
    quantity: number | string
    unit_cost: number | string
    capital_account_id: number | string
    remark?: string | null
    cost_date?: string | null
  },
): Promise<{ item?: BusinessItemShow }> {
  const response = await api.post<ApiEnvelope<{ item?: BusinessItemShow }>>(
    `/user/business/${companyId}/items/${itemId}/inventories`,
    payload,
    { headers: authHeaders(token) },
  )
  return unwrap(response.data) ?? {}
}

export async function deleteItemInventoryRecord(
  token: string,
  companyId: string | number,
  itemId: number | string,
  purchaseItemId: number | string,
): Promise<{ updated_item?: BusinessItemShow }> {
  const response = await api.delete<ApiEnvelope<{ updated_item?: BusinessItemShow }>>(
    `/user/business/${companyId}/items/${itemId}/inventories/${purchaseItemId}`,
    { headers: authHeaders(token) },
  )
  return unwrap(response.data) ?? {}
}

export async function fetchItemPurchaseCostHistory(
  token: string,
  companyId: string | number,
  itemId: number | string,
): Promise<{
  item: BusinessItemShow
  costHistory: ItemPurchaseCostHistoryRow[]
  isRawMaterial?: boolean
}> {
  const response = await api.get<
    ApiEnvelope<{
      item: BusinessItemShow
      costHistory?: ItemPurchaseCostHistoryRow[]
      isRawMaterial?: boolean
    }>
  >(`/user/business/${companyId}/items/${itemId}/purchase-cost-history`, {
    headers: authHeaders(token),
  })
  const data = unwrap(response.data)
  return {
    item: data.item,
    costHistory: data.costHistory ?? [],
    isRawMaterial: data.isRawMaterial,
  }
}

export async function uploadItemImage(
  token: string,
  companyId: string | number,
  itemId: number | string,
  file: File,
): Promise<BusinessItemShow | null> {
  const form = new FormData()
  form.append('image', file)
  const response = await api.post<ApiEnvelope<{ item?: BusinessItemShow }>>(
    `/user/business/${companyId}/items/${itemId}/image`,
    form,
    {
      headers: {
        ...authHeaders(token),
        'Content-Type': 'multipart/form-data',
      },
    },
  )
  return unwrap(response.data)?.item ?? null
}

export async function updateBusinessItem(
  token: string,
  companyId: string | number,
  itemId: number | string,
  payload: Record<string, unknown>,
): Promise<BusinessItemShow> {
  const response = await api.put<ApiEnvelope<{ item: BusinessItemShow }>>(
    `/user/business/${companyId}/items/${itemId}`,
    payload,
    { headers: authHeaders(token) },
  )
  return unwrap(response.data)?.item
}

export async function deleteBusinessItem(
  token: string,
  companyId: string | number,
  itemId: number | string,
): Promise<void> {
  await api.delete(`/user/business/${companyId}/items/${itemId}`, {
    headers: authHeaders(token),
  })
}

export async function setItemSalePrice(
  token: string,
  companyId: string | number,
  itemId: number | string,
  payload: {
    sale_price: number | string
    currency?: string
    sell_account_id?: number | string
    remark?: string
  },
): Promise<{
  salePrice?: {
    id: number
    item_id?: number
    currency?: string | null
    sale_price?: number | null
    sell_account_id?: number | null
  }
}> {
  const response = await api.post<
    ApiEnvelope<{
      salePrice?: {
        id: number
        item_id?: number
        currency?: string | null
        sale_price?: number | null
        sell_account_id?: number | null
      }
    }>
  >(`/user/business/${companyId}/items/${itemId}/sale-price`, payload, {
    headers: authHeaders(token),
  })
  return unwrap(response.data) ?? {}
}

export async function updateItemBom(
  token: string,
  companyId: string | number,
  itemId: number | string,
  components: Array<{ raw_material_item_id: number | string; quantity: number | string }>,
): Promise<
  Array<{
    id?: number
    raw_material_item_id: number
    quantity: number
    raw_material_name?: string | null
    raw_material_code?: string | null
  }>
> {
  const response = await api.put<
    ApiEnvelope<{
      components?: Array<{
        id?: number
        raw_material_item_id: number
        quantity: number
        raw_material_name?: string | null
        raw_material_code?: string | null
      }>
    }>
  >(
    `/user/business/${companyId}/items/${itemId}/bom`,
    { components },
    { headers: authHeaders(token) },
  )
  return unwrap(response.data)?.components ?? []
}

export async function fetchWarehouses(
  token: string,
  companyId: string | number,
): Promise<WarehouseDetail[]> {
  const response = await api.get<ApiEnvelope<{ warehouses: WarehouseDetail[] }>>(
    `/user/business/${companyId}/warehouses`,
    { headers: authHeaders(token), params: { with_counts: 1 } },
  )
  return unwrap(response.data)?.warehouses ?? []
}

export async function createWarehouse(
  token: string,
  companyId: string | number,
  payload: { name: string; address?: string; remark?: string },
): Promise<WarehouseDetail> {
  const response = await api.post<ApiEnvelope<{ warehouse: WarehouseDetail }>>(
    `/user/business/${companyId}/warehouses`,
    payload,
    { headers: authHeaders(token) },
  )
  return unwrap(response.data)?.warehouse
}

export async function fetchWarehouseShow(
  token: string,
  companyId: string | number,
  warehouseId: number | string,
): Promise<WarehouseDetail> {
  const response = await api.get<
    ApiEnvelope<{ warehouse: WarehouseDetail; items?: WarehouseDetail['items']; summary?: { item_count?: number; total_quantity?: number } }>
  >(`/user/business/${companyId}/warehouses/${warehouseId}`, {
    headers: authHeaders(token),
  })
  const data = unwrap(response.data)
  const warehouse = data?.warehouse
  return {
    ...warehouse,
    items: data?.items ?? warehouse?.items ?? [],
    items_count: data?.summary?.item_count ?? warehouse?.items_count,
    total_quantity: data?.summary?.total_quantity ?? warehouse?.total_quantity,
  }
}

export async function updateWarehouse(
  token: string,
  companyId: string | number,
  warehouseId: number | string,
  payload: { name: string; address?: string; remark?: string; status?: number },
): Promise<WarehouseDetail> {
  const response = await api.put<ApiEnvelope<{ warehouse: WarehouseDetail }>>(
    `/user/business/${companyId}/warehouses/${warehouseId}`,
    payload,
    { headers: authHeaders(token) },
  )
  return unwrap(response.data)?.warehouse
}

export async function deleteWarehouse(
  token: string,
  companyId: string | number,
  warehouseId: number | string,
): Promise<void> {
  await api.delete(`/user/business/${companyId}/warehouses/${warehouseId}`, {
    headers: authHeaders(token),
  })
}

export async function fetchWarehouseInventory(
  token: string,
  companyId: string | number,
): Promise<InventoryPayload> {
  const response = await api.get<ApiEnvelope<InventoryPayload>>(
    `/user/business/${companyId}/warehouses/inventory`,
    { headers: authHeaders(token) },
  )
  const data = unwrap(response.data)
  const companyStock = Array.isArray(data?.company_stock) ? data.company_stock : []
  const warehouses = Array.isArray(data?.warehouses) ? data.warehouses : []
  const warehouseOptions = Array.isArray(data?.warehouse_options)
    ? data.warehouse_options
    : warehouses.map((w) => ({ id: w.id, name: w.name }))

  // Prefer API flat list; fall back to client flatten matching project order
  // (warehouse stock first, then company stock).
  let inventoryRows = Array.isArray(data?.inventory_rows) ? data.inventory_rows : []
  if (inventoryRows.length === 0) {
    const fromWarehouses = warehouses.flatMap((w) =>
      (w.items || []).map((item) => ({
        ...item,
        location: item.location || 'warehouse',
        warehouse_id: item.warehouse_id ?? w.id,
        warehouse_name: item.warehouse_name ?? w.name,
      })),
    )
    inventoryRows = [...fromWarehouses, ...companyStock]
  }

  return {
    company_stock: companyStock,
    warehouses,
    inventory_rows: inventoryRows,
    warehouse_options: warehouseOptions,
  }
}

export async function fetchWarehouseTransfers(
  token: string,
  companyId: string | number,
): Promise<WarehouseTransferRow[]> {
  const response = await api.get<ApiEnvelope<{ transfers: WarehouseTransferRow[] }>>(
    `/user/business/${companyId}/warehouses/transfers`,
    { headers: authHeaders(token) },
  )
  return unwrap(response.data)?.transfers ?? []
}

export async function createWarehouseTransfer(
  token: string,
  companyId: string | number,
  payload: {
    type: 'warehouse_to_warehouse' | 'warehouse_to_company' | 'company_to_warehouse'
    item_id: number | string
    quantity: number | string
    from_warehouse_id?: number | string | null
    to_warehouse_id?: number | string | null
    remark?: string
  },
): Promise<WarehouseTransferRow> {
  const response = await api.post<ApiEnvelope<{ transfer: WarehouseTransferRow }>>(
    `/user/business/${companyId}/warehouses/transfers`,
    payload,
    { headers: authHeaders(token) },
  )
  return unwrap(response.data)?.transfer
}

export async function reverseWarehouseTransfer(
  token: string,
  companyId: string | number,
  transferId: number | string,
): Promise<void> {
  await api.delete(`/user/business/${companyId}/warehouses/transfers/${transferId}`, {
    headers: authHeaders(token),
  })
}

export async function fetchProductions(
  token: string,
  companyId: string | number,
): Promise<{ products: BusinessItemRow[]; productions: ProductionRow[] }> {
  const response = await api.get<
    ApiEnvelope<{ products: BusinessItemRow[]; productions: ProductionRow[] }>
  >(`/user/business/${companyId}/productions`, { headers: authHeaders(token) })
  const data = unwrap(response.data)
  return {
    products: Array.isArray(data?.products) ? data.products : [],
    productions: Array.isArray(data?.productions) ? data.productions : [],
  }
}

export async function fetchProductsWithBom(
  token: string,
  companyId: string | number,
): Promise<BusinessItemRow[]> {
  const response = await api.get<ApiEnvelope<{ products: BusinessItemRow[] }>>(
    `/user/business/${companyId}/productions/products-with-bom`,
    { headers: authHeaders(token) },
  )
  return unwrap(response.data)?.products ?? []
}

export async function createProduction(
  token: string,
  companyId: string | number,
  payload: {
    product_item_id: number | string
    quantity: number | string
    remark?: string
  },
): Promise<ProductionRow> {
  const response = await api.post<ApiEnvelope<{ production: ProductionRow }>>(
    `/user/business/${companyId}/productions`,
    payload,
    { headers: authHeaders(token) },
  )
  return unwrap(response.data)?.production
}

export async function reverseProduction(
  token: string,
  companyId: string | number,
  productionId: number | string,
): Promise<void> {
  await api.delete(`/user/business/${companyId}/productions/${productionId}`, {
    headers: authHeaders(token),
  })
}

export type AccountTemplateRow = {
  id: number
  currency: string
  name_fa?: string | null
  name_ps?: string | null
  name_en?: string | null
  sort_order?: number
}

export async function fetchAccountTemplates(token: string): Promise<AccountTemplateRow[]> {
  const response = await api.get<
    ApiEnvelope<{ templates: AccountTemplateRow[] }> | { templates?: AccountTemplateRow[] }
  >('/user/account-templates', {
    headers: authHeaders(token),
  })
  const raw = response.data as ApiEnvelope<{ templates: AccountTemplateRow[] }> & {
    templates?: AccountTemplateRow[]
  }
  if (Array.isArray(raw.templates)) return raw.templates
  const data = unwrap(raw as ApiEnvelope<{ templates: AccountTemplateRow[] }>)
  return Array.isArray(data?.templates) ? data.templates : []
}

export async function fetchRecentAccountTransactions(
  token: string,
  companyId: string | number,
  limit = 200,
): Promise<BusinessDashboardTransaction[]> {
  const response = await api.get<{ transactions?: BusinessDashboardTransaction[] }>(
    `/user/business/${companyId}/accounts/recent-transactions`,
    { headers: authHeaders(token), params: { limit } },
  )
  return Array.isArray(response.data?.transactions) ? response.data.transactions : []
}

export async function fetchAccountShow(
  token: string,
  companyId: string | number,
  accountId: string | number,
): Promise<{
  account: BusinessAccountRow & {
    template_name_fa?: string | null
  }
  permissions?: Record<string, boolean>
}> {
  const response = await api.get<
    ApiEnvelope<{
      account: BusinessAccountRow & { template_name_fa?: string | null }
      permissions?: Record<string, boolean>
    }>
  >(`/user/business/${companyId}/accounts/${accountId}`, {
    headers: authHeaders(token),
  })
  return unwrap(response.data)
}

export async function fetchAccountTransactions(
  token: string,
  companyId: string | number,
  accountId: string | number,
  limit = 30,
): Promise<BusinessDashboardTransaction[]> {
  const response = await api.get<{ transactions?: BusinessDashboardTransaction[] }>(
    `/user/business/${companyId}/accounts/${accountId}/transactions`,
    { headers: authHeaders(token), params: { limit } },
  )
  return Array.isArray(response.data?.transactions) ? response.data.transactions : []
}

export async function createBusinessAccount(
  token: string,
  companyId: string | number,
  payload: {
    account_template_id: number | string
    type: string
    name?: string
    set_as_capital?: boolean
    set_as_sell?: boolean
  },
): Promise<void> {
  await api.post(`/user/business/${companyId}/accounts`, payload, {
    headers: authHeaders(token),
  })
}

export async function updateBusinessAccountName(
  token: string,
  companyId: string | number,
  accountId: string | number,
  name: string,
): Promise<void> {
  await api.patch(
    `/user/business/${companyId}/accounts/${accountId}`,
    { name },
    { headers: authHeaders(token) },
  )
}

export async function toggleBusinessAccountStatus(
  token: string,
  companyId: string | number,
  accountId: string | number,
  status: boolean,
): Promise<void> {
  await api.post(
    `/user/business/${companyId}/accounts/${accountId}/toggle-status`,
    { status },
    { headers: authHeaders(token) },
  )
}

export async function deleteBusinessAccount(
  token: string,
  companyId: string | number,
  accountId: string | number,
): Promise<void> {
  await api.delete(`/user/business/${companyId}/accounts/${accountId}`, {
    headers: authHeaders(token),
  })
}

export async function transferBetweenAccounts(
  token: string,
  companyId: string | number,
  payload: {
    from_account_id: number | string
    to_account_id: number | string
    amount: number | string
    remark?: string
  },
): Promise<void> {
  await api.post(`/user/business/${companyId}/accounts/transfer`, payload, {
    headers: authHeaders(token),
  })
}

export type AccountTransferRow = {
  id: number
  from_account_id?: number | null
  to_account_id?: number | null
  from_account_name?: string | null
  to_account_name?: string | null
  amount?: number | string | null
  currency?: string | null
  remark?: string | null
  out_transaction_id?: number | null
  in_transaction_id?: number | null
  created_at?: string | null
}

export async function fetchAccountTransfers(
  token: string,
  companyId: string | number,
): Promise<AccountTransferRow[]> {
  const response = await api.get<ApiEnvelope<{ transfers: AccountTransferRow[] }>>(
    `/user/business/${companyId}/accounts/transfers`,
    { headers: authHeaders(token) },
  )
  const data = unwrap(response.data)
  return Array.isArray(data?.transfers) ? data.transfers : []
}

export async function deleteAccountTransfer(
  token: string,
  companyId: string | number,
  transferId: string | number,
): Promise<void> {
  await api.delete(`/user/business/${companyId}/accounts/transfers/${transferId}`, {
    headers: authHeaders(token),
  })
}

export async function depositToAccount(
  token: string,
  companyId: string | number,
  accountId: string | number,
  payload: { amount: number | string; remark?: string },
): Promise<void> {
  await api.post(`/user/business/${companyId}/accounts/${accountId}/deposit`, payload, {
    headers: authHeaders(token),
  })
}

export async function withdrawFromAccount(
  token: string,
  companyId: string | number,
  accountId: string | number,
  payload: { amount: number | string; remark?: string },
): Promise<void> {
  await api.post(`/user/business/${companyId}/accounts/${accountId}/withdraw`, payload, {
    headers: authHeaders(token),
  })
}

export async function deleteAccountCashMovement(
  token: string,
  companyId: string | number,
  accountId: string | number,
  transactionId: string | number,
): Promise<void> {
  await api.delete(
    `/user/business/${companyId}/accounts/${accountId}/transactions/${transactionId}`,
    { headers: authHeaders(token) },
  )
}

export async function fetchTransactionShow(
  token: string,
  companyId: string | number,
  transactionId: string | number,
): Promise<{
  transaction: BusinessDashboardTransaction & {
    balance_before?: number | string | null
    description?: string | null
    account?: { id: number; name?: string; currency?: string; type?: string; url?: string } | null
  }
  actor?: { id: number; name?: string; email?: string } | null
  sourceDocument?: Record<string, unknown> | null
  batchTransactions?: Array<
    BusinessDashboardTransaction & {
      account?: { id: number; name?: string; currency?: string } | null
    }
  >
}> {
  const response = await api.get<
    ApiEnvelope<{
      transaction: BusinessDashboardTransaction & {
        balance_before?: number | string | null
        description?: string | null
        account?: { id: number; name?: string; currency?: string; type?: string; url?: string } | null
      }
      actor?: { id: number; name?: string; email?: string } | null
      sourceDocument?: Record<string, unknown> | null
      batchTransactions?: Array<
        BusinessDashboardTransaction & {
          account?: { id: number; name?: string; currency?: string } | null
        }
      >
    }>
  >(`/user/business/${companyId}/transactions/${transactionId}`, {
    headers: authHeaders(token),
  })
  return unwrap(response.data)
}

/* ── Business settings & website ───────────────────────────── */

export type CompanyCapabilityMode = 'store' | 'production' | 'service'

export type BusinessSettingsHubPayload = {
  company: {
    company_id: number | string
    name?: string | null
    logo?: string | null
  }
  isOwner: boolean
  canPurgeCompanyData: boolean
  canManageAccess: boolean
  canManageParentCompany: boolean
}

export type BusinessStatusPayload = {
  company: {
    company_id: number | string
    name?: string | null
    is_store?: boolean | null
    is_production?: boolean | null
    is_service?: boolean | null
  }
  ownerEmail?: string | null
}

export type AccessRoleOption = {
  id: number
  code: string
  title: string
  description?: string | null
}

export type AccessUserRow = {
  id: number
  user: {
    id?: number | null
    name?: string | null
    email?: string | null
    profile_photo_path?: string | null
  }
  role: {
    code?: string | null
    title?: string | null
    description?: string | null
  }
  granted_by_name?: string | null
  created_at?: string | null
}

export type AccessSettingsPayload = {
  roleOptions: AccessRoleOption[]
  accessUsers: AccessUserRow[]
  ownerUser: {
    user_id?: number | string | null
    name?: string | null
    email?: string | null
    profile_photo_path?: string | null
  } | null
}

export type ParentCompanyOption = {
  company_id: number | string
  name?: string | null
  type?: string | null
  logo?: string | null
}

export type ParentCompanySettingsPayload = {
  currentParentCompany: ParentCompanyOption | null
  parentCompanyOptions: ParentCompanyOption[]
  hasChildCompanies: boolean
  childCompanies: ParentCompanyOption[]
}

export type CompanySliderRow = {
  id: number
  company_id?: number | string | null
  image?: string | null
  description?: string | null
  status?: number | null
}

export type WebsiteSettingsPayload = {
  company: {
    company_id: number | string
    name?: string | null
  }
  sliders: CompanySliderRow[]
}

export type CodeActionResult = {
  message?: string
  expires_in_seconds?: number
  retry_after_seconds?: number
  company?: BusinessStatusPayload['company']
  redirect?: string
}

export async function fetchBusinessSettingsHub(
  token: string,
  companyId: string | number,
): Promise<BusinessSettingsHubPayload> {
  const response = await api.get<ApiEnvelope<BusinessSettingsHubPayload>>(
    `/user/business/${companyId}/settings`,
    { headers: authHeaders(token) },
  )
  return unwrap(response.data)
}

export async function fetchBusinessStatus(
  token: string,
  companyId: string | number,
): Promise<BusinessStatusPayload> {
  const response = await api.get<ApiEnvelope<BusinessStatusPayload>>(
    `/user/business/${companyId}/settings/business-status`,
    { headers: authHeaders(token) },
  )
  return unwrap(response.data)
}

export async function sendCapabilityCode(
  token: string,
  companyId: string | number,
  mode: CompanyCapabilityMode,
): Promise<CodeActionResult> {
  const response = await api.post<CodeActionResult>(
    `/user/business/${companyId}/settings/capability/${mode}/send-code`,
    {},
    { headers: authHeaders(token) },
  )
  return response.data
}

export async function activateCapability(
  token: string,
  companyId: string | number,
  mode: CompanyCapabilityMode,
  code: string,
): Promise<CodeActionResult> {
  const response = await api.post<CodeActionResult>(
    `/user/business/${companyId}/settings/capability/${mode}/activate`,
    { code },
    { headers: authHeaders(token) },
  )
  return response.data
}

export async function deactivateCapability(
  token: string,
  companyId: string | number,
  mode: CompanyCapabilityMode,
): Promise<CodeActionResult> {
  const response = await api.post<CodeActionResult>(
    `/user/business/${companyId}/settings/capability/${mode}/deactivate`,
    {},
    { headers: authHeaders(token) },
  )
  return response.data
}

export async function fetchAccessSettings(
  token: string,
  companyId: string | number,
): Promise<AccessSettingsPayload> {
  const response = await api.get<ApiEnvelope<AccessSettingsPayload>>(
    `/user/business/${companyId}/settings/access`,
    { headers: authHeaders(token) },
  )
  return unwrap(response.data)
}

export async function lookupAccessUser(
  token: string,
  companyId: string | number,
  email: string,
): Promise<{
  user: AccessUserRow['user']
  existing_access: { id: number; role_code?: string | null; role_title?: string | null } | null
}> {
  const response = await api.get(
    `/user/business/${companyId}/settings/access/lookup-user`,
    { headers: authHeaders(token), params: { email } },
  )
  return response.data
}

export async function storeAccess(
  token: string,
  companyId: string | number,
  payload: { email: string; role_code: string; password: string },
): Promise<string> {
  const response = await api.post<ApiEnvelope<null>>(
    `/user/business/${companyId}/settings/access`,
    payload,
    { headers: authHeaders(token) },
  )
  return response.data?.message || 'ذخیره شد.'
}

export async function removeAccess(
  token: string,
  companyId: string | number,
  accessId: number | string,
  password: string,
): Promise<string> {
  const response = await api.delete<ApiEnvelope<null>>(
    `/user/business/${companyId}/settings/access/${accessId}`,
    { headers: authHeaders(token), data: { password } },
  )
  return response.data?.message || 'حذف شد.'
}

export async function fetchParentCompanySettings(
  token: string,
  companyId: string | number,
): Promise<ParentCompanySettingsPayload> {
  const response = await api.get<ApiEnvelope<ParentCompanySettingsPayload>>(
    `/user/business/${companyId}/settings/parent-company`,
    { headers: authHeaders(token) },
  )
  return unwrap(response.data)
}

export async function updateParentCompany(
  token: string,
  companyId: string | number,
  parentId: number | string | null,
): Promise<string> {
  const response = await api.post<ApiEnvelope<null>>(
    `/user/business/${companyId}/settings/parent-company`,
    { parent_id: parentId },
    { headers: authHeaders(token) },
  )
  return response.data?.message || 'ذخیره شد.'
}

export async function fetchDataPurgeCheckpoint(
  token: string,
  companyId: string | number,
): Promise<{ company: { company_id: number | string; name?: string | null }; ownerEmail?: string | null }> {
  const response = await api.get<
    ApiEnvelope<{ company: { company_id: number | string; name?: string | null }; ownerEmail?: string | null }>
  >(`/user/business/${companyId}/data-purge-checkpoint`, {
    headers: authHeaders(token),
  })
  return unwrap(response.data)
}

export async function sendDataPurgeCode(
  token: string,
  companyId: string | number,
): Promise<CodeActionResult> {
  const response = await api.post<CodeActionResult>(
    `/user/business/${companyId}/data-purge-checkpoint/send-code`,
    {},
    { headers: authHeaders(token) },
  )
  return response.data
}

export async function confirmDataPurge(
  token: string,
  companyId: string | number,
  code: string,
): Promise<CodeActionResult> {
  const response = await api.post<CodeActionResult>(
    `/user/business/${companyId}/data-purge-checkpoint/confirm`,
    { code },
    { headers: authHeaders(token) },
  )
  return response.data
}

export async function fetchWebsiteSettings(
  token: string,
  companyId: string | number,
): Promise<WebsiteSettingsPayload> {
  const response = await api.get<ApiEnvelope<WebsiteSettingsPayload>>(
    `/user/business/${companyId}/website`,
    { headers: authHeaders(token) },
  )
  return unwrap(response.data)
}

export async function uploadCompanySlider(
  token: string,
  companyId: string | number,
  imageBlob: Blob,
): Promise<CompanySliderRow | undefined> {
  const fd = new FormData()
  fd.append('image', imageBlob, 'slider.jpg')
  const response = await api.post<
    ApiEnvelope<{ slider?: CompanySliderRow; success?: boolean; newPath?: string }>
  >(`/user/business/${companyId}/sliders`, fd, {
    headers: { ...authHeaders(token), 'Content-Type': 'multipart/form-data' },
  })
  return unwrap(response.data)?.slider
}

export async function deleteCompanySlider(
  token: string,
  companyId: string | number,
  sliderId: number | string,
): Promise<void> {
  await api.delete(`/user/business/${companyId}/sliders/${sliderId}`, {
    headers: authHeaders(token),
  })
}

export type InternetPackageRow = {
  id: number
  name: string
  data_amount: number
  data_unit: 'mb' | 'gb' | string
  price: number
  validity_amount: number
  validity_unit: 'day' | 'month' | string
  customer_packages_count?: number
}

export type CustomerInternetPackageRow = {
  id: number
  package_id: number
  customer_id: number
  customer_public_id?: number | string | null
  customer_name?: string | null
  customer_phone?: string | null
  package_name: string
  data_amount: number
  data_unit: string
  price: number
  paid_amount: number
  remaining_amount: number
  currency?: string | null
  start_date?: string | null
  end_date?: string | null
  note?: string | null
}

export async function fetchInternetPackages(
  token: string,
  companyId: string | number,
): Promise<InternetPackageRow[]> {
  const response = await api.get<ApiEnvelope<{ packages: InternetPackageRow[] }>>(
    `/user/business/${companyId}/internet-packages`,
    { headers: authHeaders(token) },
  )
  return unwrap(response.data)?.packages ?? []
}

export async function saveInternetPackage(
  token: string,
  companyId: string | number,
  payload: Omit<InternetPackageRow, 'id'>,
  packageId?: number,
): Promise<InternetPackageRow | undefined> {
  const url = packageId
    ? `/user/business/${companyId}/internet-packages/${packageId}`
    : `/user/business/${companyId}/internet-packages`
  const response = packageId
    ? await api.put<ApiEnvelope<{ package: InternetPackageRow }>>(url, payload, { headers: authHeaders(token) })
    : await api.post<ApiEnvelope<{ package: InternetPackageRow }>>(url, payload, { headers: authHeaders(token) })
  return unwrap(response.data)?.package
}

export async function deleteInternetPackage(
  token: string,
  companyId: string | number,
  packageId: number,
): Promise<void> {
  await api.delete(`/user/business/${companyId}/internet-packages/${packageId}`, {
    headers: authHeaders(token),
  })
}

export async function fetchCustomerInternetPackages(
  token: string,
  companyId: string | number,
): Promise<CustomerInternetPackageRow[]> {
  const response = await api.get<ApiEnvelope<{ customer_packages: CustomerInternetPackageRow[] }>>(
    `/user/business/${companyId}/customer-packages`,
    { headers: authHeaders(token) },
  )
  return unwrap(response.data)?.customer_packages ?? []
}

export async function fetchCustomerInternetPackage(
  token: string,
  companyId: string | number,
  saleId: string | number,
): Promise<CustomerInternetPackageRow> {
  const response = await api.get<ApiEnvelope<{ customer_package: CustomerInternetPackageRow }>>(
    `/user/business/${companyId}/customer-packages/${saleId}`,
    { headers: authHeaders(token) },
  )
  return unwrap(response.data)?.customer_package
}

export async function deleteCustomerInternetPackage(
  token: string,
  companyId: string | number,
  saleId: number,
): Promise<void> {
  await api.delete(`/user/business/${companyId}/customer-packages/${saleId}`, {
    headers: authHeaders(token),
  })
}

export async function sellInternetPackage(
  token: string,
  companyId: string | number,
  payload: {
    package_id: number
    customer_id: number
    start_date: string
    end_date: string
    paid_amount: number
    company_account_id?: number
    note?: string
  },
): Promise<CustomerInternetPackageRow | undefined> {
  const response = await api.post<ApiEnvelope<{ customer_package: CustomerInternetPackageRow }>>(
    `/user/business/${companyId}/customer-packages`,
    payload,
    { headers: authHeaders(token) },
  )
  return unwrap(response.data)?.customer_package
}

export type { BusinessDashboardTransaction }
