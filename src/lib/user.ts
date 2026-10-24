import { api } from '@/lib/api'

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

export type UserNote = {
  id: number
  type?: string | null
  title?: string | null
  body?: string | null
  user_id?: number | string | null
  company_id?: number | string | null
  created_at?: string
  updated_at?: string
  unread?: boolean
}

export type BootstrapData = {
  lang: string
  user: Record<string, unknown>
  notes: UserNote[]
  notReadNote: boolean
}

export type UserProfileKyc = {
  id?: number
  whatsapp_number?: string | null
  identity_number?: string | null
  id_scan_front?: string | null
  id_scan_back?: string | null
  verification_video?: string | null
  status?: 'pending' | 'requested' | 'approved' | 'rejected' | string | null
}

export type ProfileUser = {
  id: number
  user_id?: number | string | null
  username?: string | null
  name: string
  lastname?: string | null
  email: string
  profile_photo_path?: string | null
  premium_until?: string | null
  is_premium?: boolean
  profile?: UserProfileKyc | null
}

export type ReferralUser = {
  id: number
  user_id?: number | string | null
  username?: string | null
  name?: string | null
  lastname?: string | null
  email?: string | null
  profile_photo_path?: string | null
  profile?: UserProfileKyc | null
}

export type AffiliateAccount = {
  id: number
  percentage: number
  status: boolean
  created_at?: string | null
  updated_at?: string | null
}

export type AffiliateInvitation = {
  id: number
  user_id?: number | string | null
  username?: string | null
  name?: string | null
  lastname?: string | null
  profile_photo_path?: string | null
  created_at?: string | null
  profile?: { status?: string | null } | null
}

export type AffiliateRequestRow = {
  id: number
  facebook_url?: string | null
  instagram_url?: string | null
  telegram_url?: string | null
  tiktok_url?: string | null
  youtube_url?: string | null
  whatsapp_url?: string | null
  other_social_url?: string | null
  reason?: string | null
  status: 'pending' | 'approved' | 'rejected' | string
  admin_note?: string | null
  reviewed_at?: string | null
  created_at?: string | null
  updated_at?: string | null
}

export type AffiliatePayload = {
  has_account: boolean
  account: AffiliateAccount | null
  can_request?: boolean
  request?: AffiliateRequestRow | null
  invite_user_id?: number | string | null
  invitations: AffiliateInvitation[]
  invitations_count: number
  affiliates_count?: number
  affiliate_limit?: number
  affiliate_open?: boolean
}

export type AffiliateRequestPayload = {
  has_account: boolean
  can_request: boolean
  request: AffiliateRequestRow | null
  affiliates_count?: number
  affiliate_limit?: number
  affiliate_open?: boolean
}

export type AffiliateRequestInput = {
  facebook_url?: string
  instagram_url?: string
  telegram_url?: string
  tiktok_url?: string
  youtube_url?: string
  whatsapp_url?: string
  other_social_url?: string
  reason: string
}

export type ProfileData = {
  user: ProfileUser
  referrals: ReferralUser[]
}

export type WalletData = {
  wallet: { amount?: number; address?: string } | null
  userDeposits: Record<string, unknown>[]
  bonuses: Record<string, unknown>[]
  transactions: Record<string, unknown>[]
}

export const NETRIX_PLATFORM = 'netrix'

export type CompanyRow = {
  company_id: number
  name: string
  logo?: string | null
  platform?: string | null
  parent_id?: number | null
  parent_company_name?: string | null
  is_owner?: boolean
  access_role_code?: string | null
  access_role_title?: string | null
  valid_up_to?: string | null
  is_active?: boolean
  type?: string | null
}

/** Hamyan companies only. Empty platform stays Hamyan and is hidden here. */
export function isHamyanCompany(company: { platform?: string | null }): boolean {
  const platform = String(company.platform || '').trim().toLowerCase()
  return platform === NETRIX_PLATFORM
}

export function filterHamyanCompanies(companies: CompanyRow[]): CompanyRow[] {
  return companies.filter(isHamyanCompany)
}

export type BusinessType = {
  id: number
  code: string
  name: string
  translated_name?: string
  category?: string | null
}

export type UserAccountRow = {
  id: number
  currency: string
  current_balance?: number
  name_fa?: string | null
  name_ps?: string | null
  name_uz?: string | null
  name_en?: string | null
  can_delete?: boolean
  has_transactions?: boolean
  created_at?: string | null
  updated_at?: string | null
}

export type AccountTemplateRow = {
  id: number
  code?: string
  currency: string
  name_fa?: string | null
  name_ps?: string | null
  name_uz?: string | null
  name_en?: string | null
}

export type ExpenseAccountRow = {
  id: number
  code?: string | null
  title_fa?: string | null
  title_ps?: string | null
  title_uz?: string | null
  title_en?: string | null
}

export type UserAccountDeposit = {
  id: number
  transaction_id?: number
  user_account_id?: number
  amount: number
  currency?: string
  balance_after?: number
  type?: string
  date?: string
  description?: string | null
  income_category?: string | null
  exchange?: boolean
  exchange_peer_currency?: string | null
  section?: string | number | null
  counterparty_id?: number | null
  counterparty_customer_id?: string | number | null
  counterparty_name?: string | null
  account_name?: string | null
  account_currency?: string | null
  created_at?: string | null
}

export type AccountsData = {
  account: UserAccountRow | null
  accounts: UserAccountRow[]
  deposits: UserAccountDeposit[]
  expense_accounts?: ExpenseAccountRow[]
  premium_active: boolean
  can_create_more_accounts: boolean
  templates_total?: number
  accounts_total?: number
}

export type CounterpartyBalanceLine = {
  user_account_id?: number
  account_name?: string
  currency?: string
  debit_sum?: number
  credit_sum?: number
  net_balance?: number
  balance_type?: 'talab' | 'baqi' | 'settled' | string
}

export type CounterpartyRow = {
  id: number
  customer_id: number | string
  name: string
  company_name?: string | null
  phone?: string | null
  email?: string | null
  address?: string | null
  personality?: string
  balance_lines?: CounterpartyBalanceLine[]
}

export type CounterpartyTransactionRow = {
  id: number
  counterparty_id?: number
  counterparty_customer_id?: string | number | null
  counterparty_name?: string | null
  user_account_id?: number
  account_name?: string | null
  currency?: string
  type?: string
  amount?: number
  transaction_date?: string
  note?: string | null
  balance_after?: number
}

export type CounterpartyDetailsData = {
  counterparty: CounterpartyRow
  transactions: CounterpartyTransactionRow[]
  summary: CounterpartyBalanceLine[]
}

export type CounterpartiesData = {
  counterparties: CounterpartyRow[]
  premium_active: boolean
  total_count: number
  can_add_counterparty: boolean
  limit_notice: boolean
}

export type CounterpartyFormPayload = {
  name: string
  company_name?: string
  phone?: string
  email?: string
  address?: string
  personality: 'human' | 'company'
}

export async function fetchBootstrap(token: string): Promise<BootstrapData> {
  const response = await api.get<ApiEnvelope<BootstrapData>>('/user/bootstrap', {
    headers: authHeaders(token),
  })
  return unwrap(response.data)
}

export type PublicStats = {
  users_count: number
  affiliates_count?: number
  affiliate_limit?: number
  affiliate_open?: boolean
}

export async function fetchPublicStats(): Promise<PublicStats> {
  const response = await api.get<ApiEnvelope<PublicStats>>('/public/stats')
  return unwrap(response.data)
}

export async function fetchSubscriptionPricing(): Promise<SubscriptionPricing> {
  const response = await api.get<ApiEnvelope<SubscriptionPricing>>('/subscription-pricing')
  return unwrap(response.data)
}

export async function fetchProfileData(token: string): Promise<ProfileData> {
  const response = await api.get<ApiEnvelope<ProfileData>>('/user/profile-data', {
    headers: authHeaders(token),
  })
  return unwrap(response.data)
}

export async function fetchAffiliateData(token: string): Promise<AffiliatePayload> {
  const response = await api.get<ApiEnvelope<AffiliatePayload>>('/user/affiliate', {
    headers: authHeaders(token),
  })
  return unwrap(response.data)
}

export async function fetchAffiliateRequestStatus(
  token: string,
): Promise<AffiliateRequestPayload> {
  const response = await api.get<ApiEnvelope<AffiliateRequestPayload>>('/user/affiliate/request', {
    headers: authHeaders(token),
  })
  return unwrap(response.data)
}

export async function submitAffiliateRequest(
  token: string,
  payload: AffiliateRequestInput,
): Promise<AffiliateRequestPayload & { message?: string }> {
  const body: Record<string, string> = {
    reason: payload.reason.trim(),
  }
  const socialKeys = [
    'facebook_url',
    'instagram_url',
    'telegram_url',
    'tiktok_url',
    'youtube_url',
    'whatsapp_url',
    'other_social_url',
  ] as const
  for (const key of socialKeys) {
    const value = payload[key]?.trim()
    if (value) body[key] = value
  }

  const response = await api.post<
    ApiEnvelope<AffiliateRequestPayload> & { message?: string }
  >('/user/affiliate/request', body, {
    headers: authHeaders(token),
  })
  return {
    ...unwrap(response.data),
    message: typeof response.data.message === 'string' ? response.data.message : undefined,
  }
}

export type SubscriptionResellerQuote = {
  annual_base_fee: number
  annual_discount: number
  list_amount: number
  margin_percent: number
  unit_reseller_cost: number
  unit_profit: number
  min_quantity: number
  starter_min_quantity?: number
  topup_min_quantity?: number
  quantity: number
  starter_pack_total: number
}

export type SubscriptionResellerRequestRow = {
  id: number
  quantity: number
  annual_base_fee: number
  annual_discount: number
  list_amount: number
  margin_percent: number
  unit_reseller_cost: number
  pack_total: number
  reason?: string | null
  status: 'pending' | 'approved' | 'rejected' | string
  admin_note?: string | null
  created_at?: string | null
  reviewed_at?: string | null
}

export type ProvinceRow = {
  id: number
  code: string
  name_fa: string
  name_ps: string
  name_en: string
  sort_order?: number
}

export type SubscriptionResellerAccount = {
  id: number
  margin_percent: number
  status: boolean
  inventory: number
  balance: number
  province_id?: number | null
  province?: ProvinceRow | null
  city_district?: string | null
  address?: string | null
  whatsapp?: string | null
  address_complete?: boolean
  created_at?: string | null
}

export type SubscriptionResellerPurchase = {
  id: number
  quantity: number
  list_amount: number
  unit_reseller_cost: number
  pack_total: number
  reseller_balance_after: number
  created_at?: string | null
}

export type SubscriptionResellerSale = {
  id: number
  company_id: number
  company_name?: string | null
  years: number
  list_unit_amount: number
  list_total_amount: number
  unit_reseller_cost: number
  reseller_total_cost: number
  reseller_balance_after: number
  inventory_after: number
  payment_id?: number | null
  start_date?: string | null
  end_date?: string | null
  created_at?: string | null
}

export type SubscriptionResellerCompanyLookup = {
  company: {
    id: number
    company_id: number
    name?: string | null
    slug?: string | null
    logo?: string | null
    valid_up_to?: string | null
    is_active?: boolean
  }
  unit_pricing: {
    customer_amount: number
    reseller_pay_amount: number
    profit_amount: number
    annual_base_fee?: number
    annual_discount?: number
  }
}

export type SubscriptionResellerPayload = {
  has_account: boolean
  account: SubscriptionResellerAccount | null
  address_complete?: boolean
  can_request: boolean
  can_purchase?: boolean
  request: SubscriptionResellerRequestRow | null
  quote: SubscriptionResellerQuote
  wallet_balance?: number
  purchases?: SubscriptionResellerPurchase[]
  sales?: SubscriptionResellerSale[]
  unit_pricing?: {
    customer_amount: number
    reseller_pay_amount: number
    profit_amount: number
  }
}

export async function fetchProvinces(): Promise<ProvinceRow[]> {
  const response = await api.get<ApiEnvelope<ProvinceRow[]>>('/provinces')
  return unwrap(response.data) ?? []
}

export async function fetchSubscriptionResellerQuote(): Promise<SubscriptionResellerQuote> {
  const response = await api.get<ApiEnvelope<SubscriptionResellerQuote>>(
    '/subscription-resellers/quote',
  )
  return unwrap(response.data)
}

export type PublicResellerRow = {
  id: number
  name?: string | null
  whatsapp?: string | null
  province_id?: number | null
  province?: ProvinceRow | null
  city_district?: string | null
  address?: string | null
}

export async function fetchPublicResellers(
  provinceId?: number | null,
): Promise<PublicResellerRow[]> {
  const response = await api.get<ApiEnvelope<PublicResellerRow[]>>('/subscription-resellers', {
    params: provinceId ? { province_id: provinceId } : undefined,
  })
  return unwrap(response.data) ?? []
}

export async function fetchSubscriptionReseller(
  token: string,
): Promise<SubscriptionResellerPayload> {
  const response = await api.get<ApiEnvelope<SubscriptionResellerPayload>>(
    '/user/subscription-reseller',
    { headers: authHeaders(token) },
  )
  return unwrap(response.data)
}

export async function submitSubscriptionResellerRequest(
  token: string,
  payload: { quantity: number; reason: string },
): Promise<SubscriptionResellerPayload & { message?: string }> {
  const response = await api.post<
    ApiEnvelope<SubscriptionResellerPayload> & { message?: string }
  >(
    '/user/subscription-reseller/request',
    {
      quantity: payload.quantity,
      reason: payload.reason.trim(),
    },
    { headers: authHeaders(token) },
  )
  return {
    ...unwrap(response.data),
    message: typeof response.data.message === 'string' ? response.data.message : undefined,
  }
}

export async function purchaseSubscriptionResellerPack(
  token: string,
  quantity: number,
): Promise<SubscriptionResellerPayload & { message?: string }> {
  const response = await api.post<
    ApiEnvelope<SubscriptionResellerPayload> & { message?: string }
  >(
    '/user/subscription-reseller/purchase',
    { quantity },
    { headers: authHeaders(token) },
  )
  return {
    ...unwrap(response.data),
    message: typeof response.data.message === 'string' ? response.data.message : undefined,
  }
}

export async function updateSubscriptionResellerAddress(
  token: string,
  payload: {
    province_id: number
    city_district: string
    address: string
    whatsapp: string
  },
): Promise<SubscriptionResellerPayload & { message?: string }> {
  const response = await api.post<
    ApiEnvelope<SubscriptionResellerPayload> & { message?: string }
  >(
    '/user/subscription-reseller/address',
    {
      province_id: payload.province_id,
      city_district: payload.city_district.trim(),
      address: payload.address.trim(),
      whatsapp: payload.whatsapp.trim(),
    },
    { headers: authHeaders(token) },
  )
  return {
    ...unwrap(response.data),
    message: typeof response.data.message === 'string' ? response.data.message : undefined,
  }
}

export async function lookupResellerCompany(
  token: string,
  companyId: string | number,
): Promise<SubscriptionResellerCompanyLookup> {
  const response = await api.get<ApiEnvelope<SubscriptionResellerCompanyLookup>>(
    '/user/subscription-reseller/company-lookup',
    {
      headers: authHeaders(token),
      params: { company_id: companyId },
    },
  )
  return unwrap(response.data)
}

export async function sellResellerSubscription(
  token: string,
  payload: { company_id: string | number; years: number },
): Promise<SubscriptionResellerPayload & { message?: string }> {
  const response = await api.post<
    ApiEnvelope<SubscriptionResellerPayload> & { message?: string }
  >(
    '/user/subscription-reseller/sell',
    {
      company_id: payload.company_id,
      years: payload.years,
    },
    { headers: authHeaders(token) },
  )
  return {
    ...unwrap(response.data),
    message: typeof response.data.message === 'string' ? response.data.message : undefined,
  }
}

export type UsernameChangeRow = {
  id: number
  old_username?: string | null
  new_username: string
  created_at?: string | null
}

export type UsernameStatus = {
  username?: string | null
  can_change: boolean
  cooldown_days: number
  last_changed_at?: string | null
  next_change_at?: string | null
  days_remaining: number
  changes: UsernameChangeRow[]
}

export async function fetchUsernameStatus(token: string): Promise<UsernameStatus> {
  const response = await api.get<ApiEnvelope<UsernameStatus>>('/user/username', {
    headers: authHeaders(token),
  })
  return unwrap(response.data)
}

export async function updateUsername(
  token: string,
  username: string,
): Promise<{ user: ProfileUser; status: UsernameStatus; message?: string }> {
  const response = await api.post<
    ApiEnvelope<{ user: ProfileUser; status: UsernameStatus }> & { message?: string }
  >(
    '/user/username',
    { username },
    { headers: authHeaders(token) },
  )
  const data = unwrap(response.data)
  return {
    user: data.user,
    status: data.status,
    message: typeof response.data === 'object' && response.data && 'message' in response.data
      ? String((response.data as { message?: string }).message || '')
      : '',
  }
}

export type InviteeShowData = {
  user: {
    id: number
    user_id?: number | string | null
    username?: string | null
    name?: string | null
    lastname?: string | null
    profile_photo_path?: string | null
    premium_until?: string | null
    is_premium?: boolean
    created_at?: string | null
  }
  profile: {
    status?: string | null
    whatsapp_number?: string | null
  }
}

export async function fetchInviteeShow(token: string, key: string | number): Promise<InviteeShowData> {
  const response = await api.get<ApiEnvelope<InviteeShowData>>(
    `/user/invitees/${encodeURIComponent(String(key))}`,
    {
      headers: authHeaders(token),
    },
  )
  return unwrap(response.data)
}

/** Prefer username, fall back to public user_id. */
export function inviteePath(user: {
  username?: string | null
  user_id?: number | string | null
}): string | null {
  const username = String(user.username || '').trim()
  if (username) return `/invitee/${encodeURIComponent(username)}`
  if (user.user_id == null || String(user.user_id).trim() === '') return null
  return `/invitee/${encodeURIComponent(String(user.user_id))}`
}

export async function updateProfileInfo(
  token: string,
  payload: { name: string; lastname: string; email: string },
): Promise<ProfileUser> {
  const response = await api.post<ApiEnvelope<ProfileUser>>('/user/profile-info/update', payload, {
    headers: authHeaders(token),
  })
  return unwrap(response.data)
}

export async function updateProfilePhoto(token: string, file: File): Promise<{ newPath: string; user: ProfileUser }> {
  const formData = new FormData()
  formData.append('image', file)
  const response = await api.post<ApiEnvelope<{ newPath: string; user: ProfileUser }>>(
    '/user/profile-profile/update',
    formData,
    {
      headers: {
        ...authHeaders(token),
        'Content-Type': 'multipart/form-data',
      },
    },
  )
  return unwrap(response.data)
}

export async function fetchUserKycProfile(token: string): Promise<UserProfileKyc> {
  const response = await api.get<ApiEnvelope<{ profile: UserProfileKyc }>>('/user/user-profile/show', {
    headers: authHeaders(token),
  })
  return unwrap(response.data).profile
}

export async function updateWhatsappNumber(token: string, whatsapp_number: string): Promise<UserProfileKyc> {
  const response = await api.post<ApiEnvelope<{ profile: UserProfileKyc }>>(
    '/user/user-profile/update-whatsapp',
    { whatsapp_number },
    { headers: authHeaders(token) },
  )
  return unwrap(response.data).profile
}

export async function updateIdentityNumber(token: string, identity_number: string): Promise<UserProfileKyc> {
  const response = await api.post<ApiEnvelope<{ profile: UserProfileKyc }>>(
    '/user/user-profile/update-identity-number',
    { identity_number },
    { headers: authHeaders(token) },
  )
  return unwrap(response.data).profile
}

export async function updateIdScanFront(token: string, file: File): Promise<UserProfileKyc> {
  const formData = new FormData()
  formData.append('id_scan_front', file)
  const response = await api.post<ApiEnvelope<{ profile: UserProfileKyc }>>(
    '/user/user-profile/update-id-scan-front',
    formData,
    {
      headers: {
        ...authHeaders(token),
        'Content-Type': 'multipart/form-data',
      },
    },
  )
  return unwrap(response.data).profile
}

export async function updateIdScanBack(token: string, file: File): Promise<UserProfileKyc> {
  const formData = new FormData()
  formData.append('id_scan_back', file)
  const response = await api.post<ApiEnvelope<{ profile: UserProfileKyc }>>(
    '/user/user-profile/update-id-scan-back',
    formData,
    {
      headers: {
        ...authHeaders(token),
        'Content-Type': 'multipart/form-data',
      },
    },
  )
  return unwrap(response.data).profile
}

export async function requestProfileReview(token: string): Promise<UserProfileKyc> {
  const response = await api.post<ApiEnvelope<{ profile: UserProfileKyc }>>(
    '/user/user-profile/request-review',
    {},
    { headers: authHeaders(token) },
  )
  return unwrap(response.data).profile
}

export async function fetchWalletData(token: string): Promise<WalletData> {
  const response = await api.get<ApiEnvelope<WalletData>>('/user/wallet-data', {
    headers: authHeaders(token),
  })
  return unwrap(response.data)
}

export async function storeWalletDeposit(
  token: string,
  payload: { amount: number; isdn: string },
): Promise<void> {
  await api.post('/user/deposit/store', payload, { headers: authHeaders(token) })
}

export async function fetchUserCompanies(token: string): Promise<CompanyRow[]> {
  const response = await api.get<ApiEnvelope<CompanyRow[]>>('/user/companies', {
    headers: authHeaders(token),
    params: { platform: NETRIX_PLATFORM },
  })
  const rows = unwrap(response.data) ?? []
  return filterHamyanCompanies(Array.isArray(rows) ? rows : [])
}

export async function fetchBusinessTypes(token: string): Promise<BusinessType[]> {
  const response = await api.get<ApiEnvelope<BusinessType[]>>('/user/business-types', {
    headers: authHeaders(token),
  })
  return unwrap(response.data) ?? []
}

export async function createBusiness(
  token: string,
  payload: {
    name: string
    service: boolean
    store: boolean
    phone?: string
    address?: string
    slogan?: string
  },
): Promise<CompanyRow[]> {
  await api.post(
    '/user/business/create',
    {
      name: payload.name.trim(),
      service: payload.service,
      store: payload.store,
      phone: payload.phone?.trim() || null,
      address: payload.address?.trim() || null,
      slogan: payload.slogan?.trim() || null,
      platform: NETRIX_PLATFORM,
    },
    {
      headers: authHeaders(token),
    },
  )
  return fetchUserCompanies(token)
}

export type BusinessCompany = {
  id?: number
  company_id: number | string
  name: string
  logo?: string | null
  type?: string | null
  owner?: number | string | null
  parent_id?: number | null
  valid_up_to?: string | null
  status?: string | number | null
  is_production?: boolean
  is_service?: boolean
  is_store?: boolean
  slug?: string | null
  purchase_currency?: string | null
  business_types?: Array<{ id: number; name?: string; code?: string }>
}

export type BusinessPermissions = {
  isOwner?: boolean
  roleCode?: string
  roleTitle?: string | null
  canViewAccounts?: boolean
  canManageAccounts?: boolean
  canViewTransactions?: boolean
  canManageCashBalance?: boolean
  canViewSales?: boolean
  canCreateSales?: boolean
  canManageSales?: boolean
  canViewInventory?: boolean
  canManageInventory?: boolean
  canViewExpenses?: boolean
  canManageExpenses?: boolean
  canViewReceivables?: boolean
  canViewPayables?: boolean
  canViewCustomers?: boolean
  canManageCustomers?: boolean
  canViewVendors?: boolean
  canManageVendors?: boolean
  canViewStaff?: boolean
  canManageStaff?: boolean
  canViewActivityLogs?: boolean
  canViewBusinessSettings?: boolean
  canManageWebsiteSettings?: boolean
  canDeleteRecords?: boolean
  canViewReports?: boolean
}

export type BusinessCompanyProfile = {
  id?: number
  company_id?: number
  name_dari?: string | null
  name_pashto?: string | null
  name_uzbek?: string | null
  name_english?: string | null
  slogan?: string | null
  address_dari?: string | null
  address_pashto?: string | null
  address_uzbek?: string | null
  address_english?: string | null
  phone?: string | null
  whatsapp?: string | null
  facebook?: string | null
  telegram?: string | null
  instagram?: string | null
  youtube?: string | null
  linkedin?: string | null
  twitter?: string | null
}

export type BusinessPaymentRow = {
  id: number
  amount?: number | string | null
  start_date?: string | null
  end_date?: string | null
}

export type SubscriptionPlanOption = {
  code: string
  label: string
  duration_type: 'month' | 'year'
  duration_count: number
  original_amount?: number
  discount_rate?: number
  discount_amount?: number
  payable_amount?: number
  applied_annual_base_fee?: number
}

export type SubscriptionPricing = {
  annual_base_fee?: number
  annual_discount?: number
  options?: SubscriptionPlanOption[]
  defaults?: { duration_type?: string; duration_count?: number }
}

export type BusinessShowData = {
  company: BusinessCompany
  profile?: BusinessCompanyProfile | Record<string, unknown> | null
  is_active: boolean
  valid_up_to?: string | null
  permissions?: BusinessPermissions
  payments?: BusinessPaymentRow[]
  subscriptionPricing?: SubscriptionPricing | null
  walletBalance?: number
}

export type BusinessProfilePayload = BusinessShowData


export type BusinessAccountRow = {
  id: number
  company_id?: number
  type?: string | null
  name?: string | null
  currency: string
  balance?: number | null
  is_capital?: boolean
  is_sell_account?: boolean
  status?: boolean
  sort_order?: number
  has_transactions?: boolean
  template_name_fa?: string | null
  description?: string | null
}

export function isBusinessAccountActive(account: { status?: boolean | number | null }): boolean {
  return account.status !== false && account.status !== 0
}

/** Sale and capital accounts must both exist before the rest of the company is usable. */
export function companyHasSaleAndCapitalAccounts(
  accounts: Array<{
    is_capital?: boolean
    is_sell_account?: boolean
    status?: boolean | number | null
  }>,
): boolean {
  let capital = false
  let sale = false
  for (const account of accounts) {
    if (!isBusinessAccountActive(account)) continue
    if (account.is_capital) capital = true
    if (account.is_sell_account) sale = true
    if (capital && sale) return true
  }
  return false
}

export type BusinessDashboardTransaction = {
  id: number
  amount?: number | string | null
  currency?: string | null
  direction?: string | null
  type?: string | null
  title?: string | null
  field?: string | null
  description?: string | null
  balance_before?: number | string | null
  balance_after?: number | string | null
  account_name?: string | null
  meta?: { action?: string | null } | Record<string, unknown> | null
  sourceable_type?: string | null
  sourceable_id?: number | string | null
  can_delete?: boolean
  created_at?: string | null
}

export type BusinessDashboardDetails = {
  cash_in_by_currency?: Record<string, number | string> | null
  cash_out_by_currency?: Record<string, number | string> | null
  sales_by_currency?: Record<string, number | string> | null
  deposits_by_currency?: Record<string, number | string> | null
  withdrawals_by_currency?: Record<string, number | string> | null
  expenses_by_currency?: Record<string, number | string> | null
  /** Jalali-month receivable increases (same date rules as todayDetails). */
  receivables_by_currency?: Record<string, number | string> | null
  /** Jalali-month payable increases (same date rules as todayDetails). */
  payables_by_currency?: Record<string, number | string> | null
  staff?: number | null
  customers?: number | null
  vendors?: number | null
  inventory_alerts?: { out_of_stock?: number; low_stock?: number } | null
  /** Current outstanding customer balances (snapshot). */
  customer_payables_by_currency?: Record<string, number | string> | null
  /** Current outstanding vendor balances (snapshot). */
  vendor_payables_by_currency?: Record<string, number | string> | null
}

export type BusinessTodayDetails = {
  cash_in_by_currency?: Record<string, number | string> | null
  cash_out_by_currency?: Record<string, number | string> | null
  sales_by_currency?: Record<string, number | string> | null
  deposits_by_currency?: Record<string, number | string> | null
  withdrawals_by_currency?: Record<string, number | string> | null
  expenses_by_currency?: Record<string, number | string> | null
  receivables_by_currency?: Record<string, number | string> | null
  payables_by_currency?: Record<string, number | string> | null
}

export type BusinessDashboardPayload = {
  success?: boolean
  transactions: BusinessDashboardTransaction[]
  dashboardDetails: BusinessDashboardDetails | null
  todayDetails: BusinessTodayDetails | null
}

/** Short-lived memory cache so remounting CompanyLayout does not burn the API rate limit. */
const BUSINESS_SHOW_TTL_MS = 10 * 60 * 1000
const businessShowCache = new Map<string, { data: BusinessShowData; fetchedAt: number }>()
const businessShowInflight = new Map<string, Promise<BusinessShowData>>()

export function invalidateBusinessShow(companyId?: string | number): void {
  if (companyId == null) {
    businessShowCache.clear()
    return
  }
  businessShowCache.delete(String(companyId))
}

export async function fetchBusiness(
  token: string,
  companyId: string | number,
  options?: { force?: boolean },
): Promise<BusinessShowData> {
  const key = String(companyId)
  const force = options?.force === true

  if (!force) {
    const hit = businessShowCache.get(key)
    if (hit && Date.now() - hit.fetchedAt < BUSINESS_SHOW_TTL_MS) {
      return hit.data
    }
    const pending = businessShowInflight.get(key)
    if (pending) return pending
  }

  const request = (async () => {
    const response = await api.get<ApiEnvelope<BusinessShowData>>(`/user/business/${companyId}`, {
      headers: authHeaders(token),
    })
    const data = unwrap(response.data)
    businessShowCache.set(key, { data, fetchedAt: Date.now() })
    return data
  })().finally(() => {
    businessShowInflight.delete(key)
  })

  businessShowInflight.set(key, request)
  return request
}

export async function fetchBusinessProfile(
  token: string,
  companyId: string | number,
): Promise<BusinessProfilePayload> {
  const response = await api.get<ApiEnvelope<BusinessProfilePayload>>(
    `/user/business/${companyId}/profile`,
    { headers: authHeaders(token) },
  )
  return unwrap(response.data)
}

export async function updateBusinessCompanyProfile(
  token: string,
  companyId: string | number,
  payload: Partial<BusinessCompanyProfile>,
): Promise<BusinessCompanyProfile> {
  const response = await api.post<ApiEnvelope<{ updatedProfile?: BusinessCompanyProfile }>>(
    `/user/business/${companyId}/profile`,
    payload,
    { headers: authHeaders(token) },
  )
  return unwrap(response.data)?.updatedProfile as BusinessCompanyProfile
}

export async function updateBusinessLogo(
  token: string,
  companyId: string | number,
  file: Blob,
  filename = 'logo.jpg',
): Promise<{ newPath: string }> {
  const form = new FormData()
  form.append('image', file, filename)
  const response = await api.post<ApiEnvelope<{ newPath?: string; success?: boolean }>>(
    `/user/business/${companyId}/update/logo`,
    form,
    {
      headers: {
        ...authHeaders(token),
        'Content-Type': 'multipart/form-data',
      },
    },
  )
  const data = unwrap(response.data)
  return { newPath: String(data?.newPath || '') }
}

export async function updateBusinessName(
  token: string,
  companyId: string | number,
  name: string,
): Promise<void> {
  await api.post(
    `/user/business/${companyId}/update/name`,
    { name },
    { headers: authHeaders(token) },
  )
}

export async function updateBusinessSlug(
  token: string,
  companyId: string | number,
  username: string,
): Promise<void> {
  await api.post(
    `/user/business/${companyId}/update/slug`,
    { username },
    { headers: authHeaders(token) },
  )
}

export async function renewBusinessSubscription(
  token: string,
  companyId: string | number,
  payload: { duration_type: 'month' | 'year'; duration_count: number },
): Promise<{
  payments?: BusinessPaymentRow[]
  walletBalance?: number
  valid_up_to?: string | null
  is_active?: boolean
  message?: string
}> {
  const response = await api.post<
    ApiEnvelope<{
      payments?: BusinessPaymentRow[]
      walletBalance?: number
      valid_up_to?: string | null
      is_active?: boolean
    }> & { message?: string }
  >(`/user/business/${companyId}/renew`, payload, { headers: authHeaders(token) })
  const data = unwrap(response.data)
  return {
    ...data,
    message: response.data?.message,
  }
}

export async function fetchBusinessAccounts(
  token: string,
  companyId: string | number,
): Promise<BusinessAccountRow[]> {
  try {
    const response = await api.get<{
      accounts?: BusinessAccountRow[]
      data?: { accounts?: BusinessAccountRow[] } | BusinessAccountRow[]
    }>(`/user/business/${companyId}/accounts`, {
      headers: authHeaders(token),
    })
    const payload = response.data
    // Project returns { accounts } (no envelope); API success() wraps as { data }.
    if (Array.isArray(payload?.accounts)) return payload.accounts
    const data = unwrap(payload)
    if (Array.isArray(data)) return data
    return Array.isArray(data?.accounts) ? data.accounts : []
  } catch {
    return []
  }
}

export async function fetchBusinessDashboardDetails(
  token: string,
  companyId: string | number,
): Promise<BusinessDashboardPayload> {
  try {
    const response = await api.get<ApiEnvelope<BusinessDashboardPayload>>(
      `/user/business/${companyId}/dashboard-details`,
      { headers: authHeaders(token) },
    )
    const data = unwrap(response.data)
    return {
      success: Boolean(data?.success),
      transactions: Array.isArray(data?.transactions) ? data.transactions : [],
      dashboardDetails: data?.dashboardDetails ?? null,
      todayDetails: data?.todayDetails ?? null,
    }
  } catch {
    return {
      success: false,
      transactions: [],
      dashboardDetails: null,
      todayDetails: null,
    }
  }
}

export async function fetchAccountsData(token: string): Promise<AccountsData> {
  const response = await api.get<ApiEnvelope<AccountsData>>('/user/account-deposits', {
    headers: authHeaders(token),
  })
  return unwrap(response.data)
}

export async function fetchAccountTemplates(token: string): Promise<AccountTemplateRow[]> {
  const response = await api.get<ApiEnvelope<{ templates: AccountTemplateRow[] }> | { templates: AccountTemplateRow[] }>(
    '/user/account-templates',
    { headers: authHeaders(token) },
  )
  const raw = response.data as ApiEnvelope<{ templates: AccountTemplateRow[] }> & {
    templates?: AccountTemplateRow[]
  }
  if (Array.isArray(raw.templates)) return raw.templates
  const data = unwrap(raw as ApiEnvelope<{ templates: AccountTemplateRow[] }>)
  return Array.isArray(data?.templates) ? data.templates : []
}

export async function createUserAccounts(token: string, templateIds: number[]): Promise<void> {
  await api.post('/user/account', { template_ids: templateIds }, { headers: authHeaders(token) })
}

export async function storeUserAccountDeposit(
  token: string,
  payload: {
    amount: number
    description?: string
    direction: 'credit'
    account_id: number
    income_category: string
    date?: string
  },
): Promise<void> {
  await api.post('/user/accounts/deposit', payload, { headers: authHeaders(token) })
}

export async function exchangeUserAccounts(
  token: string,
  payload: {
    from_account_id: number
    to_account_id: number
    amount: number
    rate: number
    rate_direction: 'from_to' | 'to_from'
    date?: string
    description?: string
  },
): Promise<void> {
  await api.post('/user/accounts/exchange', payload, { headers: authHeaders(token) })
}

export async function deleteUserAccountDeposit(token: string, transactionId: number): Promise<void> {
  await api.delete(`/user/accounts/deposit/destroy/${transactionId}`, {
    headers: authHeaders(token),
  })
}

export async function deleteUserAccount(token: string, accountId: number): Promise<void> {
  await api.delete(`/user/accounts/${accountId}`, { headers: authHeaders(token) })
}

export async function storeCounterpartyTransaction(
  token: string,
  payload: {
    counterparty_id: number
    user_account_id: number
    type: 'credit' | 'debit'
    amount: number
    transaction_date?: string
    note?: string
  },
): Promise<void> {
  await api.post('/user/counterparty-transactions', payload, { headers: authHeaders(token) })
}

export async function fetchCounterparties(
  token: string,
  search = '',
): Promise<CounterpartiesData> {
  const response = await api.get<ApiEnvelope<CounterpartiesData>>('/user/counterparties/list', {
    headers: authHeaders(token),
    params: search ? { search } : undefined,
  })
  return unwrap(response.data)
}

export async function createCounterparty(
  token: string,
  payload: CounterpartyFormPayload,
): Promise<void> {
  await api.post('/user/counterparties', payload, { headers: authHeaders(token) })
}

export async function updateCounterparty(
  token: string,
  customerId: string | number,
  payload: CounterpartyFormPayload,
): Promise<CounterpartyRow> {
  const response = await api.put<ApiEnvelope<{ counterparty: CounterpartyRow }>>(
    `/user/counterparties/${customerId}`,
    payload,
    { headers: authHeaders(token) },
  )
  return unwrap(response.data).counterparty
}

export async function fetchCounterpartyDetails(
  token: string,
  customerId: string | number,
  params?: { type?: string; start_date?: string; end_date?: string },
): Promise<CounterpartyDetailsData> {
  const response = await api.get<ApiEnvelope<CounterpartyDetailsData>>(
    `/user/counterparties/${customerId}/details`,
    { headers: authHeaders(token), params },
  )
  return unwrap(response.data)
}

export async function fetchCounterpartyTransactions(
  token: string,
  params?: {
    search?: string
    type?: string
    start_date?: string
    end_date?: string
    counterparty_id?: number
  },
): Promise<CounterpartyTransactionRow[]> {
  const response = await api.get<ApiEnvelope<{ transactions: CounterpartyTransactionRow[] }>>(
    '/user/counterparty-transactions',
    { headers: authHeaders(token), params },
  )
  const data = unwrap(response.data)
  return Array.isArray(data?.transactions) ? data.transactions : []
}

export async function fetchNotifications(token: string): Promise<{
  notes: UserNote[]
  notReadNote: boolean
}> {
  const response = await api.get<ApiEnvelope<{ notes: UserNote[]; notReadNote: boolean }>>(
    '/user/notifications',
    { headers: authHeaders(token) },
  )
  return unwrap(response.data)
}

export async function markNotificationsRead(token: string, id?: number): Promise<void> {
  const path = id ? `/user/notifications/mark-read/${id}` : '/user/notifications/mark-read'
  await api.post(path, {}, { headers: authHeaders(token) })
}

export async function fetchBusinessNotifications(
  token: string,
  companyId: string | number,
): Promise<{
  notes: UserNote[]
  notReadNote: boolean
}> {
  const response = await api.get<ApiEnvelope<{ notes: UserNote[]; notReadNote: boolean }>>(
    `/user/business/${companyId}/notifications`,
    { headers: authHeaders(token) },
  )
  return unwrap(response.data)
}

export async function markBusinessNotificationsRead(
  token: string,
  companyId: string | number,
  id?: number,
): Promise<void> {
  const path = id
    ? `/user/business/${companyId}/notifications/mark-read/${id}`
    : `/user/business/${companyId}/notifications/mark-read`
  await api.post(path, {}, { headers: authHeaders(token) })
}

export type PremiumData = {
  premiumPriceYearly: number
  premiumPriceMonthly: number
  walletBalance: number
  premiumUntil?: string | null
  isPremium?: boolean
}

export type UserExpenseRow = {
  id: number
  user_account_id?: number
  user_expense_account_id?: number
  account_name?: string | null
  expense_title?: string | null
  amount: number
  currency?: string
  expense_date?: string | null
  description?: string | null
}

export type ExpenseListData = {
  premium_active?: boolean
  accounts: Array<{ id: number; name?: string | null; currency?: string }>
  expenses: UserExpenseRow[]
}

export type ExpenseAnalysisRow = {
  id: number
  code?: string | null
  title?: string | null
  totals: Array<{ currency: string; amount: number }>
}

export type ExpenseDailyPoint = {
  date: string
  user_expense_account_id: number
  currency: string
  amount: number
}

export type ExpenseAnalysisData = {
  premium_active?: boolean
  accounts: ExpenseAnalysisRow[]
  daily?: ExpenseDailyPoint[]
  message?: string
}

export async function fetchPremiumData(token: string): Promise<PremiumData> {
  const response = await api.get<ApiEnvelope<PremiumData>>('/user/premium', {
    headers: authHeaders(token),
  })
  return unwrap(response.data)
}

export async function activatePremium(
  token: string,
  durationType: 'month' | 'year',
): Promise<{ walletBalance: number; premiumUntil: string; message?: string }> {
  const response = await api.post<
    ApiEnvelope<{ walletBalance: number; premiumUntil: string }> & { message?: string }
  >('/user/premium/activate', { duration_type: durationType }, { headers: authHeaders(token) })
  const data = unwrap(response.data)
  return {
    walletBalance: Number(data.walletBalance ?? 0),
    premiumUntil: String(data.premiumUntil ?? ''),
    message: response.data.message,
  }
}

export async function fetchExpenseAccounts(token: string): Promise<ExpenseAccountRow[]> {
  const response = await api.get<ApiEnvelope<{ expense_accounts: ExpenseAccountRow[] }>>(
    '/user/expense-accounts',
    { headers: authHeaders(token) },
  )
  const data = unwrap(response.data)
  return Array.isArray(data?.expense_accounts) ? data.expense_accounts : []
}

export async function storeUserExpense(
  token: string,
  payload: {
    amount: number
    date: string
    user_expense_account_id: number
    user_account_id?: number
    description?: string
  },
): Promise<void> {
  await api.post('/user/expenses', payload, { headers: authHeaders(token) })
}

export async function fetchUserExpensesData(
  token: string,
  params?: { user_account_id?: number; start_date?: string; end_date?: string },
): Promise<ExpenseListData> {
  const response = await api.get<ApiEnvelope<ExpenseListData>>('/user/expenses/data', {
    headers: authHeaders(token),
    params,
  })
  const data = unwrap(response.data)
  return {
    premium_active: Boolean(data?.premium_active),
    accounts: Array.isArray(data?.accounts) ? data.accounts : [],
    expenses: Array.isArray(data?.expenses) ? data.expenses : [],
  }
}

export async function fetchExpenseAnalysisData(
  token: string,
  params?: { start_date?: string; end_date?: string },
): Promise<ExpenseAnalysisData> {
  const response = await api.get<ApiEnvelope<ExpenseAnalysisData>>('/user/expense-analysis/data', {
    headers: authHeaders(token),
    params,
  })
  const data = unwrap(response.data)
  return {
    premium_active: Boolean(data?.premium_active),
    accounts: Array.isArray(data?.accounts) ? data.accounts : [],
    daily: Array.isArray(data?.daily) ? data.daily : [],
    message: data?.message,
  }
}

export type PublicExchangeRateRow = {
  id: number
  currency?: string
  currency_code?: string
  currency_name?: string
  to_currency?: string
  to_currency_code?: string
  to_currency_name?: string
  rate: number
  created_by?: string | null
  created_at?: string | null
  updated_at?: string | null
}

export type PublicExchangeRateDetail = {
  rate: PublicExchangeRateRow
  history: PublicExchangeRateRow[]
}

export async function fetchLatestPublicExchangeRates(
  token?: string | null,
): Promise<PublicExchangeRateRow[]> {
  const response = await api.get<ApiEnvelope<{ rates: PublicExchangeRateRow[] }> | { rates: PublicExchangeRateRow[] }>(
    '/exchange-rates/latest',
    { headers: token ? authHeaders(token) : undefined },
  )
  const raw = response.data as ApiEnvelope<{ rates: PublicExchangeRateRow[] }> & {
    rates?: PublicExchangeRateRow[]
  }
  if (Array.isArray(raw.rates)) return raw.rates
  const data = unwrap(raw as ApiEnvelope<{ rates: PublicExchangeRateRow[] }>)
  return Array.isArray(data?.rates) ? data.rates : []
}

export async function fetchPublicExchangeRateDetail(
  from: string,
  to: string,
  token?: string | null,
): Promise<PublicExchangeRateDetail> {
  const response = await api.get<ApiEnvelope<PublicExchangeRateDetail>>(
    `/exchange-rates/${encodeURIComponent(from)}/${encodeURIComponent(to)}`,
    { headers: token ? authHeaders(token) : undefined },
  )
  const data = unwrap(response.data)
  return {
    rate: data.rate,
    history: Array.isArray(data.history) ? data.history : [],
  }
}

export type UlanishProductCard = {
  id: number
  name: string
  slug: string
  logo?: string | null
  website_url?: string | null
  subtitle?: string | null
}

export async function fetchUlanishProducts(): Promise<UlanishProductCard[]> {
  const response = await api.get<ApiEnvelope<{ items: UlanishProductCard[] }>>('/ulanish/products')
  const data = unwrap(response.data)
  return Array.isArray(data?.items) ? data.items : []
}

export function accountDisplayName(account?: UserAccountRow | null, locale = 'fa'): string {
  if (!account) return '-'
  if (locale === 'ps') return account.name_ps || account.name_fa || account.name_en || account.currency
  if (locale === 'en') return account.name_en || account.name_fa || account.name_ps || account.currency
  return account.name_fa || account.name_ps || account.name_en || account.currency
}

export function templateDisplayName(template?: AccountTemplateRow | null, locale = 'fa'): string {
  if (!template) return '-'
  if (locale === 'ps') return template.name_ps || template.name_fa || template.name_en || template.currency
  if (locale === 'en') return template.name_en || template.name_fa || template.name_ps || template.currency
  return template.name_fa || template.name_ps || template.name_en || template.currency
}

export function expenseAccountLabel(item?: ExpenseAccountRow | null, locale = 'fa'): string {
  if (!item) return '-'
  if (locale === 'ps') return item.title_ps || item.title_fa || item.title_en || item.code || '-'
  if (locale === 'en') return item.title_en || item.title_fa || item.title_ps || item.code || '-'
  return item.title_fa || item.title_ps || item.title_en || item.code || '-'
}
