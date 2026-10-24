import type { SupportedLanguage } from '@/store/useLocaleStore'

type DesktopStrings = {
  app_name: string
  brand_slogan: string
  tagline: string
  login_subtitle: string
  register_subtitle: string
  register_subtitle_long: string
  forgot_password_subtitle: string
  create_account: string
  already_have_account: string
  no_account_yet: string
  optional: string
  language_title: string
  language_fa: string
  language_ps: string
  language_en: string
  welcome_user: string
  welcome_guest: string
  welcome_back: string
  login_heading: string
  login_download_prompt: string
  login_download_link: string
  download_apps: string
  download_badge: string
  download_title: string
  download_subtitle: string
  download_have_account: string
  download_also_title: string
  download_windows_title: string
  download_windows_desc: string
  download_windows_cta: string
  download_android_title: string
  download_android_desc: string
  download_android_cta: string
  download_ios_title: string
  download_ios_desc: string
  download_ios_cta: string
  download_coming_soon: string
  home_page_title: string
  back_to_home: string
  back_to_dashboard: string
  ishanch_whatsapp_label: string
  ishanch_whatsapp_message: string
  home_welcome: string
  home_welcome_desc: string
  home_users_badge: string
  home_users_title: string
  home_users_desc: string
  home_users_cta: string
  home_help_badge: string
  home_help_title: string
  home_help_desc: string
  home_help_point1: string
  home_help_point2: string
  home_help_point3: string
  home_help_cta: string
  home_affiliate_banner_badge: string
  home_affiliate_banner_title: string
  home_affiliate_banner_desc: string
  home_affiliate_banner_cta: string
  public_affiliate_nav: string
  public_affiliate_title: string
  public_affiliate_slogan: string
  public_affiliate_slogan_hint: string
  public_affiliate_seo: string
  public_affiliate_badge: string
  public_affiliate_lead: string
  public_affiliate_limit: string
  public_affiliate_why_1_title: string
  public_affiliate_why_1_desc: string
  public_affiliate_why_2_title: string
  public_affiliate_why_2_desc: string
  public_affiliate_why_3_title: string
  public_affiliate_why_3_desc: string
  public_affiliate_how_title: string
  public_affiliate_step_1: string
  public_affiliate_step_2: string
  public_affiliate_step_3: string
  public_affiliate_cta_guest: string
  public_affiliate_cta_auth: string
  public_affiliate_cta_login: string
  public_affiliate_full_badge: string
  public_affiliate_full_title: string
  public_affiliate_full_desc: string
  subscription_pricing_nav: string
  subscription_pricing_title: string
  subscription_pricing_seo: string
  subscription_pricing_badge: string
  subscription_pricing_lead: string
  subscription_pricing_note: string
  subscription_pricing_month: string
  home_reseller_banner_badge: string
  home_reseller_banner_title: string
  home_reseller_banner_desc: string
  home_reseller_banner_cta: string
  reseller_nav: string
  reseller_become_nav: string
  reseller_view_directory: string
  reseller_title: string
  reseller_seo: string
  reseller_badge: string
  reseller_slogan: string
  reseller_lead: string
  reseller_cta_guest: string
  reseller_cta_auth: string
  reseller_cta_login: string
  reseller_how_title: string
  reseller_step_1: string
  reseller_step_2: string
  reseller_step_3: string
  reseller_directory_title: string
  reseller_directory_seo: string
  reseller_directory_lead: string
  reseller_directory_lead_1: string
  reseller_directory_lead_2: string
  reseller_directory_lead_3: string
  reseller_directory_support_whatsapp: string
  reseller_directory_empty: string
  reseller_directory_empty_filtered: string
  reseller_directory_filter: string
  reseller_directory_filter_all: string
  reseller_directory_filter_hint: string
  reseller_directory_whatsapp: string
  reseller_directory_address: string
  reseller_why_1_title: string
  reseller_why_1_desc: string
  reseller_why_2_title: string
  reseller_why_2_desc: string
  reseller_why_3_title: string
  reseller_why_3_desc: string
  reseller_price_title: string
  reseller_fee: string
  reseller_discount: string
  reseller_list_price: string
  reseller_unit_cost: string
  reseller_unit_profit: string
  reseller_starter_pack: string
  reseller_formula_hint: string
  reseller_apply_title: string
  reseller_apply_desc: string
  reseller_apply_form_title: string
  reseller_quantity: string
  reseller_min_qty_error: string
  reseller_request_reason: string
  reseller_reason_placeholder: string
  reseller_request_submit: string
  reseller_request_success: string
  reseller_request_status_title: string
  reseller_request_pack: string
  reseller_card_title: string
  reseller_card_desc: string
  reseller_card_cta: string
  reseller_card_pending_title: string
  reseller_card_pending_desc: string
  reseller_card_pending_cta: string
  reseller_charge_title: string
  reseller_charge_desc: string
  reseller_charge_pay: string
  reseller_charge_pay_hint: string
  reseller_pay_label: string
  reseller_charge_receipt: string
  reseller_charge_after: string
  reseller_wallet_balance: string
  reseller_receipt_form_title: string
  reseller_receipt_submit: string
  reseller_receipt_success: string
  reseller_receipt_min: string
  reseller_receipt_pack_amount: string
  reseller_buy_title: string
  reseller_auto_agent_hint: string
  reseller_buy_submit: string
  reseller_buy_success: string
  reseller_buy_need_more: string
  reseller_buy_disabled_reason: string
  reseller_pack_cost: string
  reseller_page_title: string
  reseller_page_desc: string
  reseller_box_balance: string
  reseller_inventory: string
  reseller_unit_record_title: string
  reseller_customer_charge: string
  reseller_pays_from_box: string
  reseller_purchases_title: string
  reseller_sales_title: string
  reseller_sell_cta: string
  reseller_sell_page_title: string
  reseller_sell_page_desc: string
  reseller_sell_company_id: string
  reseller_sell_search: string
  reseller_sell_years: string
  reseller_sell_year_option: string
  reseller_sell_submit: string
  reseller_sell_success: string
  reseller_sell_confirm_title: string
  reseller_sell_confirm_desc: string
  reseller_sell_confirm_submit: string
  reseller_sell_customer_total: string
  reseller_sell_reseller_pay: string
  reseller_sell_valid_until: string
  reseller_sell_disabled_reason: string
  reseller_sale_row: string
  reseller_open_page: string
  reseller_send_whatsapp: string
  reseller_buy_more: string
  reseller_address_title: string
  reseller_address_desc: string
  reseller_address_required: string
  reseller_address_submit: string
  reseller_address_success: string
  reseller_province: string
  reseller_province_placeholder: string
  reseller_province_required: string
  reseller_city_district: string
  reseller_full_address: string
  reseller_whatsapp: string
  reseller_address_edit: string
  reseller_address_add: string
  reseller_buy_confirm_title: string
  reseller_buy_confirm_desc: string
  reseller_buy_confirm_terms_hint: string
  reseller_buy_confirm_submit: string
  reseller_confirm_pack_total: string
  reseller_confirm_wallet: string
  reseller_terms_title: string
  reseller_terms_heading: string
  reseller_terms_intro: string
  reseller_terms_link: string
  reseller_terms_sections: Array<{ title: string; items: string[] }>
  home_cta_title: string
  home_cta_desc: string
  home_cta_button: string
  home_notice_1: string
  home_notice_2: string
  home_notice_3: string
  home_features_title: string
  home_features_desc: string
  home_feature_1_title: string
  home_feature_1_desc: string
  home_feature_2_title: string
  home_feature_2_desc: string
  home_feature_3_title: string
  home_feature_3_desc: string
  home_feature_4_title: string
  home_feature_4_desc: string
  home_feature_5_title: string
  home_feature_5_desc: string
  home_feature_6_title: string
  home_feature_6_desc: string
  home_footer_copy: string
  terms: string
  policies: string
  cw_home: string
  cw_products: string
  cw_contact: string
  cw_latest_products: string
  cw_all_products: string
  cw_no_products: string
  cw_search_products: string
  cw_sort_newest: string
  cw_sort_oldest: string
  cw_sort_price_asc: string
  cw_sort_price_desc: string
  cw_apply: string
  cw_contact_info: string
  cw_address: string
  cw_not_available: string
  cw_not_found: string
  cw_related_products: string
  cw_in_stock: string
  cw_out_of_stock: string
  cw_call: string
  cw_we_are_here: string
  cw_category: string
  cw_order: string
  cw_whatsapp_order_text: string
  cw_call_now: string
  cw_share: string
  cw_copy_link: string
  cw_copied: string
  cw_details: string
  cw_back: string
  cw_email: string
  cw_map_coming_soon: string
  cw_afn: string
  cw_description: string
  secure_access: string
  secure_access_hint: string
  saved_accounts: string
  saved_accounts_hint: string
  saved_accounts_quick: string
  remove_saved_account: string
  show_saved_accounts: string
  use_another_account: string
  remember_section: string
  save_account_on_device: string
  join_ishanch: string
  register_heading: string
  enter_email_first: string
  send_code: string
  sending_code: string
  resend_after: string
  seconds_short: string
  forgot_password_heading: string
  go_to_register: string
  email_verification_code: string
  email_verification_code_invalid: string
  send_email_code: string
  email_code_sent: string
  email_code_send_failed: string
  email_required_for_code: string
  resend_in_seconds: string
  debug_code: string
  api_connection_error: string
  offline_banner: string
  offline_operation_blocked: string
  too_many_requests: string
  forbidden: string
  auth_invalid_credentials: string
  logout_success: string
  validation_invalid_data: string
  validation_required: string
  validation_email: string
  validation_min_string: string
  validation_confirmed: string
  validation_unique: string
  validation_digits: string
  generic_request_error: string
  forgot_password_sent_hint: string
  forgot_password_code_intro: string
  reset_password_heading: string
  reset_password_subtitle: string
  reset_password_success: string
  reset_password_missing_token: string
  change_password_button: string
  current_password: string
  new_password: string
  confirm_password: string
  password_min_length: string
  password_mismatch: string
  password_updated_success: string
  back_to_login: string
  guest_panel_eyebrow: string
  guest_panel_title: string
  guest_panel_badge: string
  guest_panel_description: string
  guest_feature_growth_title: string
  guest_feature_growth_desc: string
  guest_feature_management_title: string
  guest_feature_management_desc: string
  guest_feature_security_title: string
  guest_feature_security_desc: string
  guest_chip_login: string
  guest_chip_register: string
  guest_chip_access: string
  dashboard_title: string
  refresh: string
  logout: string
  api_label: string
  businesses: string
  wallet: string
  premium: string
  profile_status: string
  premium_active: string
  premium_inactive: string
  profile_approved: string
  profile_pending: string
  companies_list: string
  companies_dash_title: string
  companies_dash_desc: string
  loading: string
  no_companies: string
  online_tagline: string
  nav_dashboard: string
  nav_profile: string
  nav_wallet: string
  nav_accounts: string
  nav_counterparties: string
  nav_premium: string
  nav_companies: string
  nav_notifications: string
  user_notifications: string
  business_notifications: string
  nav_settings: string
  nav_help: string
  help_center: string
  help_page_welcome: string
  help_videos_intro: string
  help_search_placeholder: string
  help_clear_search: string
  help_no_results: string
  help_show_video: string
  help_back_to_list: string
  help_no_video: string
  help_copy_share: string
  help_copied: string
  menu: string
  nav_back: string
  nav_forward: string
  toolbar_aria: string
  page_settings_desc: string
  change_language: string
  choose_language: string
  changing_language: string
  close: string
  switching_workspace: string
  sidebar_business_count: string
  sidebar_personal_account: string
  sidebar_user_suffix: string
  sidebar_group_trade: string
  sidebar_group_people: string
  sidebar_group_inventory: string
  sidebar_group_accounts: string
  sidebar_group_reports: string
  sidebar_group_expenses: string
  other_options: string
  mark_all_read: string
  no_notifications: string
  notification: string
  view_all_notifications: string
  note_referralBonus: string
  note_networkBuilding: string
  note_depositSuccess: string
  note_depositRejected: string
  note_paymentSuccess: string
  note_paymentFailed: string
  note_completeYourKyc: string
  note_kycCompletionAsked: string
  note_kycAccepted: string
  note_kycRejected: string
  note_BonusApproved: string
  note_DepositApproved: string
  note_marketingBonusApproved: string
  note_marketingBonus: string
  page_profile_desc: string
  page_wallet_desc: string
  your_wallet: string
  available_amount: string
  wallet_address: string
  copy: string
  copied: string
  wallet_transfer: string
  wallet_withdraw: string
  wallet_add_money: string
  wallet_add_money_title: string
  wallet_add_money_lead: string
  wallet_add_money_cta: string
  bonuses: string
  wallet_notes: string
  download_card: string
  downloading_card: string
  wallet_history: string
  type: string
  source: string
  all: string
  credit_in: string
  debit_out: string
  no_record_found: string
  gregorian_date_label: string
  recommended: string
  activate_premium: string
  premium_hero_sub: string
  premium_price_monthly: string
  premium_price_yearly: string
  premium_valid_until: string
  wallet_balance: string
  normal_user: string
  normal_user_desc: string
  premium_user_desc: string
  premium_one_month: string
  premium_one_year: string
  premium_charge_note: string
  premium_activated_success: string
  confirm: string
  add_expense: string
  expenses_page: string
  expenses_page_desc: string
  expense_analysis: string
  expense_analysis_desc: string
  expense_analysis_premium_note: string
  expense_section: string
  expense_saved_success: string
  go_to_accounts: string
  become_premium: string
  quick_links: string
  dashboard_hero_badge: string
  dashboard_hero_with_companies: string
  dashboard_hero_without_companies: string
  dashboard_businesses_hint: string
  dashboard_premium_hint: string
  dashboard_profile_hint: string
  dashboard_premium_banner_title: string
  dashboard_premium_banner_desc: string
  dashboard_premium_banner_action: string
  dashboard_empty_title: string
  dashboard_empty_desc: string
  dashboard_empty_action: string
  personal_deals: string
  last_transactions: string
  exchange_rates_title: string
  exchange_rates_subtitle: string
  latest_exchange_rates: string
  view_all_exchange_rates: string
  exchange_one_equals: string
  exchange_calculator_title: string
  exchange_calculator_hint: string
  exchange_pair: string
  exchange_from: string
  exchange_to: string
  exchange_result: string
  exchange_no_path: string
  exchange_no_data: string
  exchange_rate_label: string
  exchange_examples: string
  exchange_for_amount: string
  last_update: string
  note: string
  sarai_rate_note: string
  exchange_rate_detail_desc: string
  exchange_history: string
  invalid_gregorian_date: string
  wallet_scroll_hint: string
  back_to_wallet: string
  transfer_soon: string
  withdraw_soon: string
  transfer_conditions: string
  transfer_condition_identity: string
  transfer_condition_premium: string
  withdraw_conditions: string
  withdraw_condition_identity: string
  wallet_note_1: string
  wallet_note_2: string
  wallet_note_3: string
  afn: string
  page_accounts_desc: string
  create_user_accounts: string
  user_accounts_not_activated: string
  create_user_account_guide: string
  choose_trade_currencies_note: string
  premium_currency_lock_note: string
  premium_template_select_note: string
  select_at_least_one_template: string
  no_account_templates: string
  premium_accounts_hidden_note: string
  account_card_click_hint: string
  more_details: string
  personal_accounts_guide: string
  cp_transactions_guide: string
  cp_incoming: string
  cp_outgoing: string
  add_funds: string
  withdraw: string
  search_counterparty: string
  counterparty: string
  description: string
  premium_account_progress: string
  transaction_click_hint: string
  deposit_added: string
  deposit_detail: string
  afn_only_operation_note: string
  premium_can_select_account: string
  confirm_delete_title: string
  confirm_delete_text: string
  balance_details: string
  current_balance: string
  personal_account_description: string
  delete_account_warning: string
  delete_account: string
  delete_account_success: string
  account_has_tx_delete_blocked: string
  confirm_delete_account_text: string
  personal_accounts_guide_intro: string
  guide_create_account: string
  guide_balance_meaning: string
  guide_add_withdraw: string
  guide_transactions: string
  guide_delete_account: string
  guide_premium: string
  cp_guide_intro: string
  cp_guide_incoming: string
  cp_guide_outgoing: string
  cp_guide_account: string
  cp_guide_balance: string
  page_counterparties_desc: string
  counterparty_free_limit_note: string
  counterparty_add_locked_note: string
  premium_counterparty_add_open: string
  counterparty_transactions: string
  baqi_talab_meaning: string
  counterparty_count_label: string
  balance_or_talab: string
  talab: string
  baqi: string
  settled: string
  edit_counterparty: string
  personality_human: string
  personality_company: string
  no_counterparties: string
  counterparty_details: string
  counterparty_not_found: string
  total_outgoing: string
  total_incoming: string
  page_companies_desc: string
  save_changes: string
  create_business: string
  add_counterparty: string
  search: string
  balance: string
  amount: string
  status: string
  date: string
  name: string
  lastname: string
  email: string
  phone: string
  currency: string
  active: string
  inactive: string
  create: string
  business_name: string
  business_type: string
  parent_company: string
  none: string
  transactions: string
  deposits: string
  referrals: string
  saved_success: string
  save: string
  processing: string
  edit: string
  profile_photo: string
  update_profile_photo: string
  update_profile_info: string
  choose_photo: string
  choose_another_photo: string
  avatar_crop_hint: string
  avatar_compress_failed: string
  no_file_selected: string
  info_upload_success: string
  email_change_note: string
  identity_details: string
  whatsapp_number: string
  identity_number: string
  id_scan_front: string
  id_scan_back: string
  id_scan_crop_hint: string
  id_scan_compress_failed: string
  no_image: string
  status_approved: string
  status_rejected: string
  status_requested: string
  status_pending: string
  request_review: string
  confirm_request_review_title: string
  confirm_request_review_note: string
  request_sent: string
  send_request: string
  user_id: string
  copy_user_id: string
  copied: string
  copied_success: string
  public_user_id_note: string
  your_invite_link: string
  copy_invite_link: string
  visit_public_profile: string
  invitation_message: string
  your_community_count: string
  no_referrals_yet: string
  jalali_date: string
  gregorian_date: string
  gregorian_equivalent: string
  click_for_gregorian: string
  local_timezone_note: string
  sidebar_open: string
  sidebar_close: string
  sidebar_switch_account: string
  syncing: string
  company: string
  company_dashboard: string
  company_dashboard_desc: string
  company_inactive_alert: string
  company_id: string
  copy_company_id: string
  public_company_id_note: string
  valid_until: string
  valid_date: string
  company_validity: string
  enter_business: string
  customers: string
  vendors: string
  staff: string
  company_accounts: string
  warehouses: string
  warehouse_inventory: string
  warehouse_transfers: string
  warehouse_transfer_records: string
  new_transfer: string
  no_transfer_records: string
  no_warehouse_inventory: string
  all_locations: string
  all_warehouses: string
  company_sales_center_full: string
  from_warehouse: string
  to_warehouse: string
  location: string
  available: string
  item_required: string
  today_date: string
  transfer: string
  transfer_type: string
  transfer_route: string
  warehouse_to_warehouse: string
  warehouse_to_company: string
  company_to_warehouse: string
  company_sales_center: string
  transfer_reversed: string
  delete_transfer: string
  confirm_delete_transfer: string
  item: string
  add_warehouse: string
  edit_warehouse: string
  delete_warehouse: string
  confirm_delete_warehouse: string
  warehouse_has_items_not_deletable: string
  insert: string
  sale: string
  sales: string
  expenses: string
  cash_deposits: string
  cash_withdrawals: string
  items: string
  items_products: string
  daily_sales_report: string
  profit_report: string
  profit_loss_report: string
  journal: string
  journal_detail: string
  journal_balance: string
  journal_time: string
  no_journal_on_date: string
  partners: string
  coming_soon: string
  items_sold: string
  qty_sold: string
  invoices_count: string
  day_sales_total: string
  day_profit_total: string
  total_sales: string
  total_purchases: string
  search_sales_hint: string
  search_purchases_hint: string
  avg_unit_price: string
  profit_per_unit: string
  no_sales_on_date: string
  gross_profit_note: string
  from_date: string
  to_date: string
  view_separate: string
  show_merged: string
  view_by_invoice: string
  print_pdf: string
  sale_account: string
  capital_account: string
  sale_cost: string
  sale_cost_capital: string
  purchase_cost_capital: string
  profit_in_sale_account: string
  profit_in_capital_account: string
  sale_invoice: string
  sold_quantity: string
  raw_materials: string
  productions: string
  item_categories: string
  add_category: string
  edit_category: string
  delete_category_confirm_title: string
  delete_category_confirm_message: string
  delete_category_detach_warning: string
  confirm_detach_and_delete_category: string
  purchases: string
  activity_logs: string
  activity_logs_subtitle: string
  activity_logs_search_placeholder: string
  no_activity_logs: string
  activity_log_fallback: string
  activity_entity_fallback: string
  date_from: string
  date_to: string
  clear_filters: string
  apply_filters: string
  previous: string
  next: string
  model: string
  related: string
  business: string
  website: string
  view_all: string
  cash: string
  bank: string
  etc: string
  capital: string
  sell_account: string
  account: string
  company_accounts_cash_bank: string
  dash_today: string
  dash_month: string
  dash_other: string
  dash_today_details: string
  dash_month_details: string
  dash_other_details: string
  receivables: string
  payables: string
  out_of_stock: string
  out_of_stock_items: string
  low_stock_items: string
  no_accounts_yet: string
  no_transactions: string
  credit: string
  debit: string
  tx_purchase_payment: string
  tx_purchase_reopen: string
  tx_purchase: string
  tx_sale_invoice_payment: string
  tx_sale_invoice_reopen: string
  tx_sale_reopen: string
  tx_cash_deposit: string
  tx_cash_withdraw: string
  tx_customer_general_payment: string
  tx_customer_payment_reversal: string
  tx_vendor_general_payment: string
  tx_vendor_prepayment_return: string
  tx_vendor_payment_reversal: string
  tx_vendor_negative_payment_reversal: string
  tx_staff_salary_payment: string
  tx_staff_salary_payment_reversal: string
  tx_expense: string
  tx_expense_updated: string
  tx_expense_updated_reversal: string
  tx_expense_deleted_reversal: string
  tx_transfer_in: string
  tx_transfer_out: string
  currency_afn: string
  currency_usd: string
  currency_eur: string
  currency_irr: string
  currency_pkr: string
  currency_gbp: string
  currency_aed: string
  currency_try: string
  currency_cny: string
  currency_inr: string
  currency_sar: string
  total_accounts: string
  hint_click_account: string
  account_transactions: string
  account_details: string
  account_type: string
  note_account_locked: string
  create_account_permanent_note: string
  create_account_capital_sell_note: string
  create_account_confirm_warn: string
  confirm_create_account_title: string
  confirm_create_account: string
  transfer_between_accounts: string
  transfer_from_account: string
  transfer_to_account: string
  transfer_same_currency_only: string
  transfer_need_two_accounts: string
  transfer_success: string
  transfer_insufficient_balance: string
  account_transfers: string
  no_account_transfers: string
  delete_account_transfer: string
  confirm_delete_account_transfer: string
  confirm_delete_account_transfer_warn: string
  account_transfer_deleted: string
  edit_account_name: string
  account_name_updated: string
  company_account_deleted: string
  account_card_menu: string
  show_inactive_accounts: string
  hide_inactive_accounts: string
  confirm_deactivate_account: string
  account_deactivated: string
  account_activated: string
  cannot_deactivate_capital_or_sell: string
  cannot_deactivate_with_balance: string
  deposit_to_account: string
  withdraw_from_account: string
  cash_added_successfully: string
  cash_withdrawn_successfully: string
  confirm_delete_cash_movement: string
  cash_movement_deleted: string
  remark: string
  select: string
  set_as_capital: string
  set_as_sell: string
  balance_after: string
  balance_before: string
  transaction_details: string
  registered_by: string
  transaction_number: string
  related_source: string
  no_related_document: string
  company_dashboard_loading_hint: string
  quick_access: string
  company_modules_hint: string
  module_coming_soon: string
  business_status: string
  business_status_hint: string
  business_status_description: string
  manage_business_status: string
  company_user_access: string
  company_user_access_hint: string
  access_roles_guide_title: string
  access_roles_guide_subtitle: string
  access_role_badge: string
  owner_full_access_note: string
  manage_user_access: string
  parent_company_link: string
  parent_company_link_hint: string
  manage_parent_company: string
  data_purge_title: string
  data_purge_hint: string
  data_purge_warning: string
  data_purge_done: string
  go_data_purge: string
  confirm_data_purge: string
  return: string
  store_mode_full: string
  store_mode_description: string
  store_mode_active_hint: string
  production_mode_full: string
  production_mode_description: string
  production_mode_active_hint: string
  service_mode_full: string
  service_mode_description: string
  service_mode_active_hint: string
  code_will_send_to: string
  send_verification_code: string
  verification_code: string
  verification_code_sent: string
  verification_code_required: string
  resend_code: string
  resend_in: string
  activate: string
  deactivate: string
  capability_activated: string
  capability_deactivated: string
  add_user_access: string
  edit_user_access: string
  delete_user_access: string
  confirm_delete_access: string
  owner_password: string
  role: string
  role_owner: string
  company_role_title_owner: string
  company_role_description_owner: string
  company_role_title_admin: string
  company_role_description_admin: string
  company_role_title_manager: string
  company_role_description_manager: string
  company_role_title_sales_full_manager: string
  company_role_description_sales_full_manager: string
  company_role_title_sales_manager: string
  company_role_description_sales_manager: string
  company_role_title_accountant: string
  company_role_description_accountant: string
  company_role_title_analyser: string
  company_role_description_analyser: string
  company_role_title_hr: string
  company_role_description_hr: string
  granted_by: string
  existing_access: string
  current_parent_company: string
  parent_already_linked: string
  child_companies: string
  has_children_no_parent: string
  select_parent_company: string
  connect_parent_company: string
  confirm_parent_connect: string
  no_parent_options: string
  add_slider_image: string
  existing_slider_images: string
  slider: string
  no_data: string
  no_file: string
  drag_and_drop: string
  upload_failed: string
  deleted_success: string
  confirm_delete_slider: string
  store_mode: string
  production_mode: string
  address: string
  filter_all: string
  add_customer: string
  add_vendor: string
  search_by_name: string
  receivables_summary: string
  payables_summary: string
  by_currency: string
  no_receivables_summary: string
  no_payables_summary: string
  no_customers: string
  no_matching_customers: string
  no_matching_vendors: string
  no_vendors: string
  company_name: string
  action: string
  view: string
  more: string
  total_count: string
  tip_receivables: string
  tip_payables: string
  has_receivable: string
  has_payable: string
  customer_setup: string
  vendor_setup: string
  back: string
  customer_details: string
  vendor_details: string
  personality: string
  personality_human: string
  personality_company: string
  set_previous_receivables: string
  set_previous_payables: string
  previous_balance_mode: string
  add_previous_balance: string
  set_previous_balance: string
  add_previous_balance_hint: string
  set_previous_balance_hint: string
  current_account_remaining: string
  remaining_after_save: string
  remaining_cannot_be_negative: string
  general_payment: string
  customer_payment_signed_hint: string
  payment_to_customer: string
  business_owes_customer: string
  vendor_general_pay: string
  vendor_payment_signed_hint: string
  prepayment: string
  debt_history: string
  customer_payables_records: string
  customer_payments_list: string
  customer_purchases: string
  vendor_purchases: string
  invoice_total: string
  remaining_amount: string
  item_rows: string
  vendor_payables_records: string
  vendor_payments_list: string
  no_payables_records: string
  previous_amount: string
  change_amount: string
  new_amount: string
  confirm_delete_payment_title: string
  confirm_delete_payment_body: string
  payment_linked_to_invoice: string
  payment_linked_to_purchase: string
  debt_reason_manualSetup: string
  debt_reason_vendorPayment: string
  debt_reason_vendorPaymentReversal: string
  payments: string
  no_records: string
  no_payments: string
  finalized: string
  draft: string
  no_sales: string
  load_more: string
  loading_more: string
  no_purchases: string
  no_items: string
  add_purchase: string
  create_purchase: string
  purchase_number: string
  incomplete: string
  complete: string
  complete_purchase: string
  vendor_name: string
  not_assigned: string
  warehouse_locked_after_items: string
  full_auto_payment_no_vendor: string
  perform_payment: string
  barcode_not_found: string
  barcode_placeholder: string
  type_to_search_item: string
  vendor_required: string
  exchange_rate_required: string
  warehouse_required: string
  company_account: string
  sale_bill_currency: string
  continue: string
  delete_draft_purchase: string
  delete_purchase_confirm_title: string
  delete_purchase_confirm_message: string
  delete_purchase_effects_title: string
  delete_purchase_effects_1: string
  delete_purchase_effects_2: string
  delete_purchase_effects_3: string
  delete_purchase_effects_4: string
  confirm_back_to_edit_purchase: string
  reopen_purchase_for_edit: string
  serial_required: string
  price_required: string
  quantity_required: string
  equivalent: string
  nothing_to_pay: string
  no_warehouses: string
  search_vendor_placeholder: string
  select_item: string
  required_field: string
  without_customer: string
  without_vendor: string
  exchange_rate: string
  add_item: string
  add_raw_material: string
  download_items_excel_template: string
  export_items_excel: string
  import_items_excel: string
  importing_items_excel: string
  items_excel_import_success: string
  items_excel_import_partial: string
  no_raw_materials: string
  no_matching_items_filter: string
  search_by_code: string
  all_categories: string
  no_category: string
  all_inventory_locations: string
  company_stock_only: string
  all_inventory: string
  zero_inventory: string
  positive_inventory: string
  sort_default: string
  sort_stock_high_to_low: string
  sort_stock_low_to_high: string
  filters: string
  inventory_summary: string
  inventory_purchase_value_total: string
  total_inventory_quantity: string
  company_stock: string
  warehouse_stock: string
  capital_currency_missing: string
  inventory_valuation_partial: string
  stock_status_legend: string
  in_stock_status: string
  low_stock_alert: string
  out_of_stock_alert: string
  purchase_cost: string
  inventory_value_capital: string
  sale_price_label: string
  inventory: string
  show_barcode: string
  confirm_delete_item: string
  confirm_delete_item_body: string
  not_deletable: string
  item_category: string
  unit_label: string
  unit_small: string
  unit_medium: string
  unit_large: string
  unit_to_base_qty: string
  unit_scale_hint: string
  measure_unit: string
  quantity: string
  price: string
  inventory_purchase_value_capital: string
  minimum_stock_level: string
  show_on_website: string
  yes: string
  no: string
  average_cost_history: string
  download_item_card: string
  no_code: string
  double_click_to_download: string
  item_details: string
  item_specs: string
  brand: string
  color: string
  generation: string
  storage: string
  item_type: string
  item_type_normal: string
  item_type_digital: string
  avg_purchase_cost: string
  add_inventory: string
  upload_image: string
  set_sale_price: string
  reload: string
  inventory_history: string
  opening_inventory: string
  purchases_without_warehouse: string
  no_inventory: string
  no_matching_inventory: string
  vendor: string
  total: string
  purchase: string
  delete_inventory_confirm: string
  sell_account_missing: string
  unit_cost: string
  capital_account: string
  image: string
  image_required: string
  item_image_crop_hint: string
  item_image_compress_failed: string
  product_bom_title: string
  product_bom_hint: string
  setup_bom: string
  no_bom_components: string
  clear_all: string
  clear_bom_confirm: string
  add_row: string
  latest: string
  no_records: string
  code: string
  business_profile: string
  company_subscription_page_title: string
  company_subscription_validity: string
  company_subscription_history: string
  update_logo: string
  username: string
  company_info: string
  name_dari: string
  name_pashto: string
  name_uzbek: string
  name_english: string
  address_dari: string
  address_pashto: string
  address_uzbek: string
  address_english: string
  whatsapp: string
  your_website_link: string
  copy_link: string
  visit_website: string
  copied_success: string
  renew: string
  update_company_name: string
  name_update_note: string
  set_username: string
  invalid_slug: string
  slug_once_note: string
  update_company_profile: string
  drag_and_drop_image: string
  zoom: string
  payable_amount: string
  insufficient_wallet: string
  payment_success: string
  discount: string
  discount_percent: string
  discount_amount: string
  discount_exceeds_total: string
  company_payment_title: string
  company_payment_details: string
  company_payment_note1: string
  company_payment_plan_info_month: string
  company_payment_plan_info_year: string
  company_payment_price_prefix: string
  company_payment_price_suffix: string
  company_payment_note2: string
  renew_duration: string
  annual_base_fee: string
  original_price: string
  valid_until_with_renew: string
  finalize_payment: string
  payment_mode: string
  pay_full: string
  pay_partial: string
  pay_remaining: string
  awaiting_payment: string
  delete: string
  quick_sale: string
  easy_sale: string
  easy_sale_intro: string
  easy_sale_new: string
  easy_sale_view: string
  unsaved_sale_leave_title: string
  unsaved_sale_leave_message: string
  unsaved_sale_leave_confirm: string
  start_easy_sale: string
  easy_sale_pay: string
  easy_sale_full_payment_required: string
  search_customer: string
  scan_barcode: string
  camera_permission_required: string
  allow_camera: string
  camera_unavailable: string
  barcode: string
  transfer_to_warehouse: string
  warehouse: string
  complete_items: string
  needs_exchange_rate: string
  exchange_rate_pair: string
  exchange_rate_direction: string
  latest_exchange_rate: string
  sale_step_customer: string
  sale_step_items: string
  sale_step_payment: string
  sale_step_complete: string
  next_step: string
  prev_step: string
  expense_fields_list: string
  manage_expense_fields: string
  add_expense: string
  edit_expense: string
  expense_list: string
  no_expenses: string
  no_expense_fields: string
  account_code: string
  account_name: string
  bill_number: string
  spender: string
  creator: string
  confirm_delete_expense: string
  delete_expense_confirm: string
  select_account: string
  cancel: string
  unknown: string
  invoice_details: string
  invoice_number: string
  invoice_summary: string
  paid_amount: string
  remaining_balance: string
  previous_remaining: string
  total_remaining: string
  paid_amount_covers_previous_hint: string
  confirm_delete_item_from_invoice: string
  delete_draft_sale: string
  only_draft_deletable: string
  delete_sale_confirm_title: string
  delete_sale_confirm_message: string
  delete_sale_effects_title: string
  delete_sale_effects_1: string
  delete_sale_effects_2: string
  delete_sale_effects_3: string
  delete_sale_effects_4: string
  delete_sale_second_confirm: string
  confirm_delete_step_one: string
  confirm_delete: string
  back_to_edit_sale: string
  confirm_back_to_edit_sale: string
  search_item: string
  search_item_placeholder: string
  barcode_scan_placeholder: string
  no_matching_items: string
  find: string
  item_not_found: string
  insufficient_stock: string
  item_sale_price_required: string
  item_purchase_cost_required: string
  serial_number: string
  reset_item_price: string
  go_to_payment: string
  invoice_rate_missing: string
  payment: string
  total_payable: string
  without_customer_payment_hint: string
  enter_paid_amount: string
  paid_amount_positive: string
  paid_amount_not_exceed: string
  complete_without_customer: string
  finalize_full_payment: string
  finalize_partial_payment: string
  finalize_remaining_only: string
  add_more_item: string
  total_items: string
  barcode_item_added: string
  dash_price_search: string
  dash_tools: string
  dash_price_search_placeholder: string
  dash_price_search_hint: string
  dash_price_not_set: string
  invoice_empty: string
  print_invoice: string
  print_with_equivalent: string
  print_invoice_a5: string
  print_invoice_80mm: string
  download_pdf_a5: string
  download_pdf_a4: string
  download_pdf_80mm: string
  download_image_a5: string
  download_image_80mm: string
  payment_receipt: string
  payment_receipt_number: string
  payment_row_menu: string
  invoice_export_failed: string
  invoice_saved_to_ishanch: string
  customer_name: string
  unit_price: string
  unit_price_short: string
  price_per_unit: string
  total_cost: string
  ram_capacity: string
  storage_capacity: string
  invoice_item_details: string
  add_invoice_note: string
  edit_invoice_note: string
  invoice_note_placeholder: string
  invoice_note_saved: string
  sale_date: string
  purchase_date: string
  date_picker_today: string
  date_picker_clear: string
  add_staff: string
  edit_staff: string
  no_staff: string
  position: string
  first_name: string
  last_name: string
  contract: string
  contracts: string
  monthly_salary: string
  pay_salary: string
  documents: string
  terminate_contract: string
  start_date: string
  end_date: string
  termination_date: string
  termination_reason: string
  salary_month: string
  payment_date: string
  attachment: string
  hire_date: string
  active_contract: string
  no_active_contract: string
  payable_to_today: string
  payable_to_end_of_month: string
  payable_to_end_of_contract: string
  remaining_to_today: string
  remaining_to_end_of_month: string
  remaining_to_end_of_contract: string
  paid_amount_staff: string
  remaining_allowed: string
  add_staff_contract: string
  edit_staff_contract: string
  show_active_contract: string
  staff_contract: string
  no_staff_contract: string
  contract_history: string
  no_contract_history: string
  salary_payments: string
  no_salary_payments: string
  add_staff_document: string
  no_staff_documents: string
  document_title: string
  file: string
  download: string
  created_at: string
  jalali_equivalent: string
  contract_status_active: string
  contract_status_ended: string
  contract_status_terminated: string
  contract_details: string
  this_contract_summary: string
  contract_settled: string
  contract_settled_hint: string
  closed_contract_paid: string
  previous_contract_info: string
  active_contract_summary: string
  confirm_delete_salary_payment: string
  confirm_delete_document: string
  document_title_file_required: string
  related_contract: string
  add_payment_document: string
  replace_payment_document: string
  add_staff_absence: string
  absence_date: string
  absences: string
  absence_days: string
  no_absences: string
  no_staff_with_active_contract: string
  confirm_delete_absence: string
  affiliate_account: string
  affiliate_dashboard_card_title: string
  affiliate_dashboard_card_desc: string
  affiliate_percentage: string
  affiliate_active: string
  affiliate_inactive: string
  affiliate_since: string
  affiliate_invitations: string
  affiliate_invitations_hint: string
  affiliate_no_invitations: string
  affiliate_open_page: string
  affiliate_page_title: string
  affiliate_invite_link: string
  affiliate_how_title: string
  affiliate_how_invite: string
  affiliate_how_percent: string
  affiliate_how_example: string
  affiliate_how_wallet: string
  affiliate_open_wallet: string
  affiliate_apply_title: string
  affiliate_apply_desc: string
  affiliate_apply_form_title: string
  affiliate_apply_social_hint: string
  affiliate_apply_unavailable: string
  affiliate_capacity_full: string
  affiliate_apply_card_title: string
  affiliate_apply_card_desc: string
  affiliate_apply_card_cta: string
  affiliate_apply_card_pending_title: string
  affiliate_apply_card_pending_desc: string
  affiliate_apply_card_pending_cta: string
  affiliate_social_facebook: string
  affiliate_social_instagram: string
  affiliate_social_telegram: string
  affiliate_social_tiktok: string
  affiliate_social_youtube: string
  affiliate_social_whatsapp: string
  affiliate_social_other: string
  affiliate_request_reason: string
  affiliate_request_reason_hint: string
  affiliate_request_reason_placeholder: string
  affiliate_request_submit: string
  affiliate_request_success: string
  affiliate_request_status_title: string
  affiliate_request_status_pending: string
  affiliate_request_status_approved: string
  affiliate_request_status_rejected: string
  affiliate_request_pending_desc: string
  affiliate_request_rejected_desc: string
  affiliate_request_admin_note: string
  affiliate_request_submitted_at: string
  invitee_page_title: string
  invitee_open_whatsapp: string
  invitee_no_whatsapp: string
  username_invalid_hint: string
  username_cooldown_rule: string
  username_cooldown_hint: string
  username_updated_success: string
  username_history: string
  username_history_empty: string
}

const desktopResources: Record<SupportedLanguage, { desktop: DesktopStrings }> = {
  fa: {
    desktop: {
      app_name: 'همیان',
      brand_slogan: 'مدیریت کسب و کار',
      tagline: 'سیستم مدیریت کسب و کار و رشد',
      login_subtitle: 'برای ادامه به حساب خود وارد شوید.',
      register_subtitle: 'برای شروع کار، حساب جدید بسازید.',
      register_subtitle_long:
        'ثبت‌نام کنید تا به خدمات، ابزارها و امکانات شخصی و تجارتی همیان دسترسی داشته باشید.',
      forgot_password_subtitle: 'ایمیل خود را وارد کنید تا لینک بازیابی رمز ارسال شود.',
      create_account: 'ایجاد حساب جدید',
      already_have_account: 'قبلاً حساب ساخته‌اید؟ ورود',
      no_account_yet: 'حساب ندارید؟ ثبت‌نام',
      optional: 'اختیاری',
      language_title: 'زبان',
      language_fa: 'دری',
      language_ps: 'پښتو',
      language_en: 'English',
      welcome_user: 'خوش آمدید {{name}}',
      welcome_guest: 'خوش آمدید',
      welcome_back: 'دوباره خوش آمدید',
      login_heading: 'ورود به حساب کاربری',
      login_download_prompt: 'می‌توانید اپلیکیشن دسکتاپ، اندروید یا iOS را نیز دانلود کنید.',
      login_download_link: 'رفتن به صفحه دانلود',
      download_apps: 'دانلود اپلیکیشن‌ها',
      download_badge: 'اپلیکیشن‌های همیان',
      download_title: 'دانلود اپلیکیشن همیان',
      download_subtitle:
        'نسخهٔ دسکتاپ ویندوز، اندروید و iOS را دریافت کنید و کسب‌وکارتان را هرجا مدیریت کنید.',
      download_have_account: 'حساب دارید؟ ورود',
      download_also_title: 'بدون ورود هم ببینید',
      download_windows_title: 'ویندوز (دسکتاپ)',
      download_windows_desc: 'نسخهٔ نصبی ویندوز ۶۴بیتی — مناسب کامپیوتر رومیزی و لپ‌تاپ.',
      download_windows_cta: 'دانلود برای ویندوز',
      download_android_title: 'اندروید',
      download_android_desc: 'اپ موبایل اندروید را از فروشگاه یا لینک مستقیم دریافت کنید.',
      download_android_cta: 'دانلود برای اندروید',
      download_ios_title: 'iOS',
      download_ios_desc: 'اپ آیفون و آیپد را از اپ‌استور دانلود کنید.',
      download_ios_cta: 'دانلود برای iOS',
      download_coming_soon: 'به‌زودی',
      home_page_title: 'صفحه اصلی',
      back_to_home: 'بازگشت به صفحه اصلی',
      back_to_dashboard: 'بازگشت به داشبورد',
      ishanch_whatsapp_label: 'گفتگو با پشتیبانی همیان در واتساپ',
      ishanch_whatsapp_message: 'سلام، از وبسایت همیان پیام می‌دهم.',
      home_welcome: 'به بزرگ‌ترین پلتفرم مدیریت کسب‌وکار در افغانستان خوش آمدید.',
      home_welcome_desc:
        'با همیان خرید و فروش، درآمد و مصارف، موجودی اموال و مشتریان خود را به‌صورت یکپارچه مدیریت کنید.',
      home_users_badge: 'اجتماع همیان',
      home_users_title: '{{count}} کاربر همین حالا با همیان کار می‌کنند',
      home_users_desc:
        'هر روز کسب‌وکارهای بیشتری در افغانستان به همیان می‌پیوندند. شما هم رایگان ثبت‌نام کنید و مدیریت کسب‌وکارتان را از همین امروز شروع کنید.',
      home_users_cta: 'به همیان بپیوندید',
      home_help_badge: 'مرکز کمک',
      home_help_title: 'راهنما و آموزش برای شروع سریع',
      home_help_desc: 'برای یادگیری امکانات سیستم و حل پرسش‌های رایج به مرکز کمک مراجعه کنید.',
      home_help_point1: 'راهنمای ورود، ثبت‌نام و مدیریت حساب',
      home_help_point2: 'آموزش فروش، خرید، انبار و مصارف',
      home_help_point3: 'نکات عملی برای کسب‌وکارهای افغانی',
      home_help_cta: 'ورود به مرکز کمک',
      home_affiliate_banner_badge: 'گروه محدود افلییت',
      home_affiliate_banner_title: 'یک‌بار دعوت کن، هر سال درآمد کن',
      home_affiliate_banner_desc:
        'درآمد افلییت همیشگی است. در افغانستان فقط {{count}} افلییت خواهیم داشت.',
      home_affiliate_banner_cta: 'شرایط پیوستن',
      public_affiliate_nav: 'افلییت',
      public_affiliate_title: 'افلییت همیان',
      public_affiliate_slogan: 'یک‌بار دعوت کن، هر سال درآمد کن',
      public_affiliate_slogan_hint: 'درآمد افلییت همیشگی است.',
      public_affiliate_seo:
        'یک‌بار دعوت کن، هر سال درآمد کن. درآمد افلییت همیان همیشگی است — فقط ۱۰۰ افلییت در افغانستان.',
      public_affiliate_badge: 'فقط {{count}} نفر در افغانستان',
      public_affiliate_lead:
        'اگر مخاطب، شبکه اجتماعی و انگیزه معرفی همیان را دارید، برای عضویت در گروه افلییت درخواست دهید.',
      public_affiliate_limit:
        'ظرفیت محدود است: در افغانستان فقط {{count}} افلییت خواهیم داشت.',
      public_affiliate_why_1_title: 'پاداش دعوت',
      public_affiliate_why_1_desc:
        'از هر دعوت موفق، معادل {{amount}} افغانی به دست می‌آورید.',
      public_affiliate_why_2_title: 'سهم از پرداخت‌ها',
      public_affiliate_why_2_desc:
        'از پرداخت‌های دعوت‌شدگان، هر سال فیصدی افلییت می‌گیرید — درآمد قطع نمی‌شود.',
      public_affiliate_why_3_title: 'واریز به بکسک',
      public_affiliate_why_3_desc:
        'درآمد دعوت و فیصدی به بکسک همیان شما جمع می‌شود و قابل برداشت است.',
      public_affiliate_how_title: 'چگونه عضو شوید؟',
      public_affiliate_step_1: 'حساب همیان بسازید یا وارد شوید.',
      public_affiliate_step_2: 'لینک سوشیال‌ها و دلیل پیوستن را در فرم درخواست بفرستید.',
      public_affiliate_step_3: 'پس از بررسی، در صورت تأیید اکانت افلییت فعال می‌شود.',
      public_affiliate_cta_guest: 'ثبت‌نام و پیوستن',
      public_affiliate_cta_auth: 'ارسال درخواست افلییت',
      public_affiliate_cta_login: 'حساب دارید؟ ورود',
      public_affiliate_full_badge: 'ظرفیت تکمیل',
      public_affiliate_full_title: 'ظرفیت افلییت تکمیل شده است',
      public_affiliate_full_desc:
        'در افغانستان فقط {{count}} افلییت خواهیم داشت و ظرفیت فعلی تکمیل شده است.',
      subscription_pricing_nav: 'نرخ‌های سبسکریپشن',
      subscription_pricing_title: 'قیمت سبسکریپشن کسب‌وکار',
      subscription_pricing_seo:
        'فیس سالانه، تخفیف و مبلغ قابل پرداخت سبسکریپشن کسب‌وکار همیان برای ۱ تا ۵ سال.',
      subscription_pricing_badge: 'قیمت‌گذاری رسمی',
      subscription_pricing_lead:
        'فیس اصلی و تخفیف فعلی را ببینید و مبلغ ۱ تا ۵ سال را محاسبه کنید.',
      subscription_pricing_note:
        'مبلغ نهایی هنگام تمدید در پروفایل کسب‌وکار یا خرید از نمایندگی اعمال می‌شود.',
      subscription_pricing_month: '۱ ماه',
      home_reseller_banner_badge: 'نمایندگی فروش',
      home_reseller_banner_title: 'ریسلر همیان شوید',
      home_reseller_banner_desc:
        'از هر فروش {{percent}}٪ مفاد بگیرید. برای شروع حداقل {{count}} سبسکریپشن بخرید.',
      home_reseller_banner_cta: 'چطور ریسلر شویم',
      reseller_nav: 'نمایندگی‌ها',
      reseller_become_nav: 'ریسلر شوید',
      reseller_view_directory: 'مشاهده نمایندگی‌ها',
      reseller_title: 'ریسلر همیان شوید',
      reseller_seo:
        'ریسلر همیان شوید؛ ۳۰٪ مفاد و خرید اولیه حداقل ۱۰ سبسکریپشن با قیمت نمایندگی.',
      reseller_badge: 'نمایندگی فروش سبسکریپشن',
      reseller_slogan: 'ریسلر شوید و ۳۰٪ مفاد بگیرید',
      reseller_lead:
        'با خرید بسته نمایندگی، خودکار ریسلر می‌شوید و می‌توانید سبسکریپشن کسب‌وکار را بفروشید.',
      reseller_cta_guest: 'ثبت‌نام و ریسلر شوید',
      reseller_cta_auth: 'خرید بسته و ریسلر شوید',
      reseller_cta_login: 'حساب دارید؟ ورود',
      reseller_how_title: 'چطور ریسلر شویم؟',
      reseller_step_1: 'حساب همیان بسازید یا وارد شوید و بکسک همیان را شارژ کنید.',
      reseller_step_2: 'حداقل ۱۰ سبسکریپشن را با قیمت نمایندگی بخرید؛ حساب ریسلری خودکار فعال می‌شود.',
      reseller_step_3: 'آدرس فیزیکی و واتساپ را ثبت کنید و از صفحه ریسلر، سبسکریپشن بفروشید.',
      reseller_directory_title: 'نمایندگی‌ها',
      reseller_directory_seo: 'فهرست نمایندگی‌های فروش همیان با واتساپ و آدرس.',
      reseller_directory_lead:
        'برای خرید سالانه جهت فعال‌سازی دیتابیس کسب‌وکار خود، با نزدیک‌ترین نمایندگی تماس گرفته و نزد آن مراجعه کنید.',
      reseller_directory_lead_1:
        'برای خرید سالانه جهت فعال‌سازی دیتابیس کسب‌وکار خود، با نزدیک‌ترین نمایندگی تماس گرفته، و نزد آن مراجعه کنید.',
      reseller_directory_lead_2:
        'هزینه را بپردازید و در همانجا از فعال شدن کسب‌وکار خود اطمینان حاصل کنید.',
      reseller_directory_lead_3:
        'در صورت نیاز به کمک و رهنمایی، یا بروز مشکلات، با مدیریت همیان ارتباط بگیرید.',
      reseller_directory_support_whatsapp: 'واتساپ همیان',
      reseller_directory_empty: 'هنوز نمایندگی عمومی ثبت نشده است.',
      reseller_directory_empty_filtered: 'در این ولایت نمایندگی ثبت نشده است.',
      reseller_directory_filter: 'فیلتر بر اساس ولایت',
      reseller_directory_filter_all: 'همه ولایات',
      reseller_directory_filter_hint: 'یکی از ۳۴ ولایت را انتخاب کنید تا نمایندگی‌های همان ولایت نمایش داده شوند.',
      reseller_directory_whatsapp: 'واتساپ',
      reseller_directory_address: 'آدرس',
      reseller_why_1_title: 'مفاد ۳۰٪',
      reseller_why_1_desc: 'از فروش هر سبسکریپشن همیان {{percent}}٪ مفاد می‌گیرید.',
      reseller_why_2_title: 'شروع با ۱۰ سبسکریپشن',
      reseller_why_2_desc: 'در ابتدا باید حداقل {{count}} سبسکریپشن بخرید.',
      reseller_why_3_title: 'قیمت نمایندگی',
      reseller_why_3_desc:
        'هزینه واحد = (فی سبسکریپشن − تخفیف) منهای {{percent}}٪.',
      reseller_price_title: 'محاسبه قیمت فعلی',
      reseller_fee: 'فیس/هزینه سبسکریپشن سالانه',
      reseller_discount: 'تخفیف',
      reseller_list_price: 'قیمت مشتری (فی − تخفیف)',
      reseller_unit_cost: 'هزینه نمایندگی هر واحد',
      reseller_unit_profit: 'مفاد هر فروش',
      reseller_starter_pack: 'هزینه شروع ({{count}} واحد)',
      reseller_formula_hint:
        'هزینه واحد = (فی − تخفیف) منهای {{percent}}٪. حداقل خرید اولیه ۱۰ واحد است.',
      reseller_apply_title: 'نماینده فروش شوید',
      reseller_apply_desc:
        'درخواست لازم نیست. با پرداخت و خرید حداقل {{count}} سبسکریپشن، خودکار نماینده فروش می‌شوید.',
      reseller_apply_form_title: 'فرم درخواست',
      reseller_quantity: 'تعداد سبسکریپشن برای شروع',
      reseller_min_qty_error: 'حداقل {{count}} سبسکریپشن لازم است.',
      reseller_request_reason: 'چرا می‌خواهید نماینده فروش باشید؟',
      reseller_reason_placeholder: 'مثلاً شبکه فروش، ولایت فعالیت، و برنامه فروش سبسکریپشن…',
      reseller_request_submit: 'ارسال درخواست نمایندگی',
      reseller_request_success: 'درخواست نمایندگی ثبت شد و در حال بررسی است.',
      reseller_request_status_title: 'وضعیت درخواست نمایندگی',
      reseller_request_pack: '{{count}} واحد — جمع {{amount}} افغانی',
      reseller_card_title: 'ریسلر همیان شوید!',
      reseller_card_desc:
        'حداقل ۱۰ سبسکریپشن بخرید و نماینده شوید. ۳۰ درصد مفاد بگیرید.',
      reseller_card_cta: 'خرید بسته نمایندگی',
      reseller_card_pending_title: 'درخواست نمایندگی در حال بررسی',
      reseller_card_pending_desc: 'درخواست شما ثبت شده و منتظر بررسی است.',
      reseller_card_pending_cta: 'مشاهده وضعیت درخواست',
      reseller_charge_title: 'شارژ بکسک همیان',
      reseller_charge_desc:
        'ابتدا مبلغ مورد نظر را به بکسک همیان اضافه کنید. تا وقتی بکسک شارژ نشده باشد، خرید بسته نمایندگی ممکن نیست.',
      reseller_charge_pay:
        'برای افزودن پول به بکسک همیان، مبلغ را به حساب پی {{pay}} بفرستید.',
      reseller_charge_pay_hint: 'برای افزودن پول به بکسک همیان، مبلغ را به حساب پی زیر بفرستید:',
      reseller_pay_label: 'حساب پی همیان',
      reseller_charge_receipt: 'رسید پرداخت را در واتساپ همیان بفرستید.',
      reseller_charge_after:
        'پس از آن که بکسک همیان شارژ شد، بسته نمایندگی برای شما فعال می‌شود و نماینده فروش می‌شوید.',
      reseller_wallet_balance: 'موجودی بکسک همیان: {{amount}} افغانی',
      reseller_receipt_form_title: 'ثبت رسید پرداخت',
      reseller_receipt_submit: 'ثبت رسید',
      reseller_receipt_success: 'رسید ثبت شد و پس از تأیید، بکسک همیان شارژ می‌شود.',
      reseller_receipt_min: 'حداقل مبلغ واریز {{min}} افغانی است.',
      reseller_receipt_pack_amount:
        'برای خرید {{count}} اکانت سبسکریپشن باید {{amount}} افغانی پرداخت کنید.',
      reseller_buy_title: 'خرید بسته نمایندگی',
      reseller_auto_agent_hint:
        'پس از خرید موفق، حساب ریسلری شما ساخته می‌شود و خودکار نماینده فروش خواهید بود.',
      reseller_buy_submit: 'خرید بسته',
      reseller_buy_success: 'بسته نمایندگی خریداری شد. شما اکنون نماینده فروش هستید.',
      reseller_buy_need_more:
        'موجودی بکسک همیان برای این بسته کافی نیست. مبلغ بسته {{need}} افغانی است.',
      reseller_buy_disabled_reason:
        'دکمه غیرفعال است چون موجودی بکسک همیان ({{balance}} افغانی) کمتر از هزینه بسته ({{need}} افغانی) است. ابتدا بکسک را شارژ کنید.',
      reseller_pack_cost: 'هزینه این بسته: {{amount}} افغانی',
      reseller_page_title: 'حساب نمایندگی فروش',
      reseller_page_desc: 'موجودی بکسک ریسلری و نرخ هر سبسکریپشن.',
      reseller_box_balance: 'موجودی بکسک ریسلری',
      reseller_inventory: 'موجودی واحد',
      reseller_unit_record_title: 'نرخ هر سبسکریپشن',
      reseller_customer_charge: 'مبلغ قابل دریافت از مشتری',
      reseller_pays_from_box: 'پرداخت از بکسک ریسلری',
      reseller_purchases_title: 'خریدهای بسته',
      reseller_sales_title: 'فروش‌های سبسکریپشن',
      reseller_sell_cta: 'فروش سبسکریپشن',
      reseller_sell_page_title: 'فروش سبسکریپشن به کسب‌وکار',
      reseller_sell_page_desc:
        'شناسه عمومی کسب‌وکار را وارد کنید، مدت را انتخاب کنید و از موجودی بکسک ریسلری پرداخت کنید.',
      reseller_sell_company_id: 'شناسه عمومی کسب‌وکار',
      reseller_sell_search: 'جستجو',
      reseller_sell_years: 'مدت (سال)',
      reseller_sell_year_option: '{{count}} سال',
      reseller_sell_submit: 'خرید و فعال‌سازی',
      reseller_sell_success: 'سبسکریپشن برای کسب‌وکار ثبت شد.',
      reseller_sell_confirm_title: 'تأیید فروش سبسکریپشن',
      reseller_sell_confirm_desc: 'با تأیید، مبلغ از بکسک ریسلری کسر و اعتبار کسب‌وکار تمدید می‌شود.',
      reseller_sell_confirm_submit: 'تأیید و پرداخت',
      reseller_sell_customer_total: 'مبلغ ثبت‌شده برای کسب‌وکار',
      reseller_sell_reseller_pay: 'پرداخت از بکسک ریسلری',
      reseller_sell_valid_until: 'اعتبار تا',
      reseller_sell_disabled_reason:
        'موجودی بکسک ریسلری ({{balance}} افغانی) یا واحدها ({{inventory}}) برای این فروش کافی نیست. نیاز: {{need}} افغانی و {{years}} واحد.',
      reseller_sale_row: '{{name}} — {{years}} سال — {{amount}} افغانی',
      reseller_open_page: 'مشاهده صفحه نمایندگی',
      reseller_send_whatsapp: 'ارسال رسید در واتساپ',
      reseller_buy_more: 'خرید بسته بیشتر',
      reseller_address_title: 'آدرس فیزیکی نمایندگی',
      reseller_address_desc:
        'برای نمایندگی فروش، ولایت، شهر/ولسوالی، آدرس کامل و شماره واتساپ خود را ثبت کنید.',
      reseller_address_required: 'ثبت آدرس فیزیکی الزامی است.',
      reseller_address_submit: 'ذخیره آدرس',
      reseller_address_success: 'آدرس فیزیکی نمایندگی ثبت شد.',
      reseller_province: 'ولایت',
      reseller_province_placeholder: 'انتخاب ولایت',
      reseller_province_required: 'ولایت را انتخاب کنید.',
      reseller_city_district: 'شهر / ولسوالی',
      reseller_full_address: 'آدرس کامل',
      reseller_whatsapp: 'شماره واتساپ',
      reseller_address_edit: 'ویرایش آدرس',
      reseller_address_add: 'ثبت آدرس',
      reseller_buy_confirm_title: 'تأیید خرید بسته نمایندگی',
      reseller_buy_confirm_desc: 'لطفاً جزئیات خرید را بررسی کنید و در صورت موافقت تأیید نمایید.',
      reseller_buy_confirm_terms_hint: 'با تأیید خرید، شرایط ریسلری همیان را می‌پذیرید:',
      reseller_buy_confirm_submit: 'تأیید و خرید',
      reseller_confirm_pack_total: 'هزینه بسته',
      reseller_confirm_wallet: 'موجودی بکسک همیان',
      reseller_terms_title: 'شرایط ریسلری',
      reseller_terms_heading: 'شرایط نمایندگی فروش (ریسلری) همیان',
      reseller_terms_intro:
        'با خرید بسته نمایندگی و فعالیت به‌عنوان ریسلر همیان، این شرایط را می‌پذیرید.',
      reseller_terms_link: 'شرایط ریسلری',
      reseller_terms_sections: [
        {
          title: 'فعال‌سازی نمایندگی',
          items: [
            'با خرید حداقل ۱۰ سبسکریپشن، حساب ریسلری فعال می‌شود.',
            'پس از خرید اول، خریدهای بعدی حداقل ۵ واحد است.',
            'مبلغ خرید از بکسک همیان کسر و به بکسک ریسلری افزوده می‌شود.',
          ],
        },
        {
          title: 'قیمت و مفاد',
          items: [
            'قیمت مشتری برابر است با فیس سالانه منهای تخفیف.',
            'هزینه ریسلر برابر است با ۷۰٪ قیمت مشتری؛ مفاد ریسلر ۳۰٪ است.',
            'قیمت‌ها ممکن است بر اساس فیس رسمی همیان به‌روز شوند.',
          ],
        },
        {
          title: 'آدرس و تماس',
          items: [
            'ثبت ولایت، شهر/ولسوالی، آدرس کامل و واتساپ برای ریسلر الزامی است.',
            'اطلاعات تماس باید درست و قابل دسترس باشد.',
          ],
        },
        {
          title: 'مسئولیت‌ها',
          items: [
            'ریسلر باید اطلاعات صحیح درباره سبسکریپشن همیان به مشتری بدهد.',
            'سوءاستفاده، فروش غیرمجاز، یا ارائه اطلاعات نادرست می‌تواند به تعلیق حساب منجر شود.',
            'همیان می‌تواند شرایط را به‌روز کند؛ نسخهٔ منتشرشده در همین صفحه معتبر است.',
          ],
        },
      ],
      home_cta_title: 'آیا به یک دیتابیس یکپارچه و امن نیاز دارید؟',
      home_cta_desc:
        'همیان برای مدیریت فروش، مصارف، مشتریان، وبسایت اختصاصی و گزارش‌ها آماده است. همین حالا رایگان شروع کنید.',
      home_cta_button: 'ساخت حساب رایگان',
      home_notice_1: 'آیا به دیتابیس آنلاین نیاز دارید؟',
      home_notice_2: 'دیتابیس امن و همیشه‌در دسترس داشته باشید.',
      home_notice_3: 'محصولات و خدمات‌تان را آنلاین مدیریت کنید.',
      home_features_title: 'ویژگی‌های اصلی سیستم',
      home_features_desc: 'همیان چه امکاناتی را برای شما فراهم می‌سازد؟',
      home_feature_1_title: 'مدیریت بیش از ۵۰ مدل کسب‌وکار',
      home_feature_1_desc: 'همیان مناسب هر نوع کسب‌وکار است.',
      home_feature_2_title: 'امن و قابل اعتماد',
      home_feature_2_desc: 'داده‌های شما با امنیت بالا محافظت می‌شود.',
      home_feature_3_title: 'پشتیبانی و ارتقای همیشگی',
      home_feature_3_desc: 'سیستم به‌روزرسانی مداوم دریافت می‌کند.',
      home_feature_4_title: 'ایجاد حساب و کسب‌وکار نامحدود',
      home_feature_4_desc: 'هر کاربر می‌تواند چندین کسب‌وکار را مدیریت کند.',
      home_feature_5_title: 'وبسایت اختصاصی برای هر کسب‌وکار',
      home_feature_5_desc: 'هر کسب‌وکار صفحه اختصاصی خود را دارد.',
      home_feature_6_title: 'اپلیکیشن دسکتاپ و موبایل',
      home_feature_6_desc: 'در ویندوز، اندروید و iOS نیز در دسترس است.',
      home_footer_copy: 'کلیه حقوق محفوظ است.',
      terms: 'شرایط',
      policies: 'پالیسی‌ها',
      cw_home: 'صفحه اصلی',
      cw_products: 'محصولات',
      cw_contact: 'تماس با ما',
      cw_latest_products: 'محصولات تازه',
      cw_all_products: 'همه محصولات',
      cw_no_products: 'هنوز محصولی ثبت نشده است.',
      cw_search_products: 'جستجوی محصول...',
      cw_sort_newest: 'جدیدترین',
      cw_sort_oldest: 'قدیمی‌ترین',
      cw_sort_price_asc: 'قیمت (کم به زیاد)',
      cw_sort_price_desc: 'قیمت (زیاد به کم)',
      cw_apply: 'اعمال',
      cw_contact_info: 'اطلاعات تماس',
      cw_address: 'آدرس',
      cw_not_available: 'ثبت نیست',
      cw_not_found: 'کسب‌وکار یافت نشد.',
      cw_related_products: 'محصولات مرتبط',
      cw_in_stock: 'موجود در انبار',
      cw_out_of_stock: 'ناموجود',
      cw_call: 'تماس',
      cw_we_are_here: 'در خدمت شما هستیم',
      cw_category: 'دسته',
      cw_order: 'سفارش',
      cw_whatsapp_order_text:
        'سلام، در مورد محصول «{{product}}» معلومات بیشتر می‌خواهم.\n— واصله از همیان\n\n{{url}}',
      cw_call_now: 'تماس فوری',
      cw_share: 'شریک‌سازی',
      cw_copy_link: 'کاپی لینک',
      cw_copied: 'کاپی شد!',
      cw_details: 'مشخصات',
      cw_back: 'بازگشت',
      cw_email: 'ایمیل',
      cw_map_coming_soon: 'نمایش نقشه به‌زودی',
      cw_afn: 'افغانی',
      cw_description: 'توضیحات',
      secure_access: 'دسترسی امن',
      secure_access_hint: 'ورود مطمئن به حساب شما',
      saved_accounts: 'حساب های ذخیره شده',
      saved_accounts_hint: 'با کلیک روی ایمیل وارد شوید.',
      saved_accounts_quick: 'انتخاب سریع حساب',
      remove_saved_account: 'حذف حساب ذخیره شده',
      show_saved_accounts: 'ذخیره شده ها',
      use_another_account: 'ورود با حساب جدید',
      remember_section: 'تنظیمات ورود',
      save_account_on_device: 'ایمیل و پسورد این حساب در این دستگاه ذخیره شود',
      join_ishanch: 'به همیان بپیوندید',
      register_heading: 'ایجاد حساب جدید',
      enter_email_first: 'ابتدا ایمیل خود را وارد کنید.',
      send_code: 'ارسال کد',
      sending_code: 'در حال ارسال...',
      resend_after: 'ارسال دوباره بعد از',
      seconds_short: 'ثانیه',
      forgot_password_heading: 'بازیابی پسورد',
      go_to_register: 'رفتن به راجستر',
      email_verification_code: 'کد تأیید ایمیل',
      email_verification_code_invalid: 'کد تأیید ایمیل باید 6 رقم باشد.',
      send_email_code: 'ارسال کد تأیید',
      email_code_sent: 'کد تأیید ایمیل ارسال شد.',
      email_code_send_failed: 'ارسال کد تأیید انجام نشد.',
      email_required_for_code: 'اول ایمیل را وارد کنید.',
      resend_in_seconds: 'ارسال مجدد تا {{seconds}} ثانیه',
      debug_code: 'کد تست',
      api_connection_error: 'اتصال به سرور برقرار نشد. API را بررسی کنید.',
      offline_banner: 'به اینترنت وصل نیستید. عملیات‌های مهم تا زمان اتصال مجدد انجام نمی‌شوند.',
      offline_operation_blocked: 'به اینترنت وصل نیستید. این عملیات قابل اجرا نیست.',
      too_many_requests: 'درخواست‌های زیاد ارسال شد. لطفاً کمی صبر کنید و دوباره کوشش کنید.',
      forbidden: 'شما دسترسی لازم را ندارید.',
      auth_invalid_credentials: 'ایمیل یا رمز عبور نادرست است.',
      logout_success: 'خروج موفقانه انجام شد.',
      validation_invalid_data: 'اطلاعات واردشده نامعتبر است.',
      validation_required: 'پر کردن {{field}} الزامی است.',
      validation_email: '{{field}} باید یک ایمیل معتبر باشد.',
      validation_min_string: '{{field}} باید حداقل {{min}} کاراکتر باشد.',
      validation_confirmed: 'تأیید {{field}} مطابقت ندارد.',
      validation_unique: '{{field}} قبلاً استفاده شده است.',
      validation_digits: '{{field}} باید {{digits}} رقم باشد.',
      generic_request_error: 'درخواست انجام نشد. لطفاً دوباره کوشش کنید.',
      forgot_password_sent_hint: 'کد تغییر رمز عبور به ایمیل شما ارسال شد.',
      forgot_password_code_intro:
        'ایمیل خود را وارد کنید، کد تأیید را بگیرید، سپس رمز عبور جدید را در همین صفحه تنظیم کنید.',
      reset_password_heading: 'تغییر پسورد',
      reset_password_subtitle: 'رمز عبور جدید خود را وارد کنید.',
      reset_password_success: 'رمز عبور شما با موفقیت تغییر کرد.',
      reset_password_missing_token: 'لینک بازنشانی نامعتبر است.',
      change_password_button: 'تغییر پسورد',
      current_password: 'پسورد فعلی',
      new_password: 'پسورد جدید',
      confirm_password: 'تایید پسورد جدید',
      password_min_length: 'پسورد باید حداقل ۸ کاراکتر باشد.',
      password_mismatch: 'پسورد جدید و تایید آن یکسان نیستند.',
      password_updated_success: 'رمز عبور با موفقیت تغییر کرد.',
      back_to_login: 'رفتن به ورود',
      guest_panel_eyebrow: 'خدمات حساب و مدیریت',
      guest_panel_title: 'همه چیز برای ورود و شروع کار آماده است',
      guest_panel_badge: 'حرفه‌ای و قابل اعتماد',
      guest_panel_description:
        'برای مدیریت بهتر فعالیت‌های روزانه، پیگیری کارها، و دسترسی آسان به خدمات حساب کاربری خود، از همین‌جا وارد شوید یا حساب جدید بسازید.',
      guest_feature_growth_title: 'رشد منظم',
      guest_feature_growth_desc: 'پیگیری بهتر کارها و تصمیم‌گیری روشن‌تر برای کسب و کار.',
      guest_feature_management_title: 'مدیریت عملی',
      guest_feature_management_desc: 'دسترسی سریع به اطلاعات حساب و بخش‌های مهم سیستم.',
      guest_feature_security_title: 'دسترسی مطمئن',
      guest_feature_security_desc: 'ورود و ثبت‌نام امن برای کاربران جدید و فعلی.',
      guest_chip_login: 'ورود کاربران',
      guest_chip_register: 'ثبت‌نام اعضای جدید',
      guest_chip_access: 'دسترسی به خدمات حساب',
      dashboard_title: 'داشبورد',
      refresh: 'بروزرسانی',
      logout: 'خروج',
      api_label: 'اتصال به API',
      businesses: 'کسب‌وکارها',
      wallet: 'کیف پول',
      premium: 'حق اشتراک',
      profile_status: 'وضعیت پروفایل',
      premium_active: 'فعال',
      premium_inactive: 'غیرفعال',
      profile_approved: 'تأیید شده',
      profile_pending: 'در انتظار تأیید',
      companies_list: 'لیست کسب‌وکارها',
      companies_dash_title: 'در اینجا لیست کاروبار خود را می‌بینید.',
      companies_dash_desc:
        'با کلیک روی هر کدام، می‌توانید به تمام معاملات مرتبط دسترسی پیدا کرده، داده‌ها را اضافه، کم، ویرایش، چاپ یا به‌عنوان پی‌دی‌اف ذخیره کنید.',
      loading: 'در حال بارگذاری…',
      no_companies: 'هنوز کسب‌وکاری ثبت نشده است.',
      online_tagline: 'متصل به سرور همیان',
      nav_dashboard: 'داشبورد',
      nav_profile: 'پروفایل',
      nav_wallet: 'بکسک اولنیش',
      nav_accounts: 'حسابات شخصی',
      nav_counterparties: 'معامله‌داران',
      nav_premium: 'حساب ممتاز',
      nav_companies: 'کسب‌وکارها',
      nav_notifications: 'اعلان‌ها',
      user_notifications: 'اعلان‌های کاربر',
      business_notifications: 'اعلان‌های کسب‌وکار',
      nav_settings: 'تنظیمات',
      nav_help: 'مرکز کمک',
      help_center: 'مرکز کمک',
      help_page_welcome: 'به مرکز کمک همیان خوش آمدید',
      help_videos_intro:
        'تمام گزینه‌های زیر راهنماهایی هستند که با کلیک روی آن‌ها می‌توانید ویدیوی آموزشی را مشاهده کنید.',
      help_search_placeholder: 'جستجو در عنوان یا دسته...',
      help_clear_search: 'پاک کردن جستجو',
      help_no_results: 'هیچ مطلبی یافت نشد!',
      help_show_video: 'نمایش ویدیو',
      help_back_to_list: 'برگشت به مرکز کمک',
      help_no_video: 'ویدیو برای این راهنما در دسترس نیست.',
      help_copy_share: 'کاپی عنوان، توضیح و لینک',
      help_copied: 'کاپی شد!',
      menu: 'منو',
      nav_back: 'برگشت',
      nav_forward: 'جلو',
      toolbar_aria: 'نوار ناوبری',
      page_settings_desc: 'تنظیمات حساب و زبان اپلیکیشن',
      change_language: 'تغییر زبان',
      choose_language: 'زبان مورد نظر خود را انتخاب کنید',
      changing_language: 'در حال تغییر زبان...',
      close: 'بستن',
      switching_workspace: 'در حال ورود به {{name}}...',
      sidebar_business_count: '{{count}} کسب‌وکار',
      sidebar_personal_account: 'حساب شخصی',
      sidebar_user_suffix: 'کاربر',
      sidebar_group_trade: 'خرید و فروش',
      sidebar_group_people: 'اشخاص / معامله‌داران',
      sidebar_group_inventory: 'انبار و اجناس',
      sidebar_group_accounts: 'حسابات مالی',
      sidebar_group_reports: 'گزارشات',
      sidebar_group_expenses: 'مصارف',
      other_options: 'سایر گزینه‌ها',
      mark_all_read: 'همه خوانده شد',
      no_notifications: 'اعلانی وجود ندارد.',
      notification: 'اعلان',
      view_all_notifications: 'مشاهده همه',
      note_referralBonus: 'از دعوت دیگران جایزه بالقوه دریافت کردید',
      note_networkBuilding: 'از کمک به ایجاد اجتماع همیان، جایزه بالقوه دریافت کردید.',
      note_depositSuccess: 'واریز با موفقیت انجام شد.',
      note_depositRejected: 'واریز رد شد.',
      note_paymentSuccess: 'پرداخت با موفقیت انجام شد.',
      note_paymentFailed: 'پرداخت ناموفق بود.',
      note_completeYourKyc: 'احراز هویت خود را تکمیل کنید.',
      note_kycCompletionAsked: 'تکمیل احراز هویت درخواست شد.',
      note_kycAccepted: 'احراز هویت تأیید شد.',
      note_kycRejected: 'احراز هویت رد شد.',
      note_BonusApproved: 'بونوس تایید شد.',
      note_DepositApproved: 'دیپازیت تایید شد',
      note_marketingBonusApproved: 'جایزه بازاریابی به حساب شما افزوده شد',
      note_marketingBonus: 'جایزه بالقوه بازاریابی دریافت کردید!',
      page_profile_desc: 'اطلاعات حساب و پروفایل کاربری',
      page_wallet_desc: 'موجودی و تاریخچهٔ بکسک اولنیش',
      your_wallet: 'بکسک اولنیش',
      available_amount: 'موجودی قابل استفاده',
      wallet_address: 'آدرس بکسک اولنیش',
      copy: 'کاپی آدرس',
      wallet_transfer: 'انتقال پول',
      wallet_withdraw: 'برداشت',
      wallet_add_money: 'افزودن پول',
      wallet_add_money_title: 'افزودن پول به بکسک همیان',
      wallet_add_money_lead:
        'هر مبلغی که در نظر دارید به این حساب پی بفرستید، سپس سند رسید را در واتساپ همیان ارسال کنید.',
      wallet_add_money_cta: 'افزودن پول',
      bonuses: 'پاداش‌ها',
      wallet_notes: 'یادداشت‌ها',
      download_card: 'دانلود کارت',
      downloading_card: 'در حال دانلود…',
      wallet_history: 'تاریخچه',
      type: 'نوع',
      source: 'منبع',
      all: 'همه',
      credit_in: 'آمد',
      debit_out: 'رفت',
      no_record_found: 'هیچ رکوردی یافت نشد',
      gregorian_date_label: 'تاریخ (میلادی)',
      recommended: 'پیشنهادی',
      activate_premium: 'فعال‌سازی کاربرممتاز',
      premium_hero_sub:
        'با فعال‌سازی کاربرممتاز، تجربه حرفه‌ای‌تر، امکانات گسترده‌تر و رشد سریع‌تر در همیان را دریافت می‌کنید.',
      premium_price_monthly: 'هزینه یک‌ماهه',
      premium_price_yearly: 'هزینه یک‌ساله',
      premium_valid_until: 'اعتبار کاربرممتاز تا',
      wallet_balance: 'موجودی بکسک',
      normal_user: 'کاربر عادی',
      normal_user_desc: 'امکانات پایه برای شروع و مدیریت روزمره.',
      premium_user_desc: 'امکانات پیشرفته برای رشد سریع‌تر و حضور حرفه‌ای‌تر.',
      premium_one_month: 'یک ماهه',
      premium_one_year: 'یک ساله',
      premium_charge_note: 'مبلغ {{amount}} افغانی از بکسک همیان کسر می‌شود.',
      premium_activated_success: 'کاربرممتاز با موفقیت فعال شد.',
      confirm: 'تأیید',
      expenses_page: 'مصارفات',
      expenses_page_desc: 'لیست مصارف ثبت‌شده از حسابات شخصی.',
      expense_analysis: 'تحلیل مصارف',
      expense_analysis_desc: 'جمع‌بندی مصارف بر اساس بخش مصرف.',
      expense_analysis_premium_note:
        'شما کاربر ممتاز نیستید؛ تحلیل مصارف برای کاربران ممتاز نمایش داده می‌شود.',
      expense_section: 'بخش مصرف',
      expense_saved_success: 'مصرف موفقانه ثبت شد.',
      go_to_accounts: 'رفتن به حسابات شخصی',
      become_premium: 'کاربرممتاز شوید',
      quick_links: 'دسترسی سریع',
      dashboard_hero_badge: 'داشبورد همیان',
      dashboard_hero_with_companies:
        'کسب‌وکارهای خود را از همین داشبورد مدیریت کنید و سریع‌تر به بخش‌های اصلی دسترسی بگیرید.',
      dashboard_hero_without_companies:
        'برای شروع، اولین کسب‌وکار خود را ایجاد کنید تا مدیریت معاملات و اطلاعات شما آغاز شود.',
      dashboard_businesses_hint: 'مدیریت شرکت‌ها',
      dashboard_premium_hint: 'کاربر ممتاز',
      dashboard_profile_hint: 'حساب کاربری',
      dashboard_premium_banner_title: 'کاربر ممتاز را فعال کنید',
      dashboard_premium_banner_desc:
        'با کاربر ممتاز، امکانات حرفه‌ای بیشتر، محدودیت کمتر و امتیازهای ویژه دریافت می‌کنید.',
      dashboard_premium_banner_action: 'مشاهده پلن‌ها',
      dashboard_empty_title: 'هنوز کسب‌وکاری ثبت نشده است',
      dashboard_empty_desc: 'از منوی کناری گزینه ایجاد کسب‌وکار را بزنید تا اولین کمپنی شما ساخته شود.',
      dashboard_empty_action: 'شروع از ایجاد کسب‌وکار',
      personal_deals: 'معاملات شخصی',
      last_transactions: 'آخرین تراکنش‌ها',
      exchange_rates_title: 'نرخ ارزها',
      exchange_rates_subtitle: 'آخرین نرخ‌های ثبت‌شده برای هر جفت ارز در این صفحه نمایش داده می‌شود.',
      latest_exchange_rates: 'آخرین نرخ‌های تبادله',
      view_all_exchange_rates: 'مشاهده همه',
      exchange_one_equals: '۱ {{from}} = {{rate}} {{to}}',
      exchange_calculator_title: 'ماشین حساب نرخ ارز',
      exchange_calculator_hint: 'مقدار را با کیپد وارد کنید و ارز مبدأ و مقصد را انتخاب نمایید.',
      exchange_pair: 'جفت ارز',
      exchange_from: 'از',
      exchange_to: 'به',
      exchange_result: 'نتیجه',
      exchange_no_path: 'نرخ در دسترس نیست',
      exchange_no_data: 'هنوز هیچ نرخ تبادله‌ای ثبت نشده است.',
      exchange_rate_label: 'نرخ',
      exchange_examples: 'نمونه تبدیل',
      exchange_for_amount: 'برای',
      last_update: 'آخرین به‌روزرسانی',
      note: 'یادداشت',
      sarai_rate_note: 'به اساس نرخ روز سرای شهزاده',
      exchange_rate_detail_desc: 'جزئیات نرخ و تاریخچه این جفت ارز.',
      exchange_history: 'تاریخچه نرخ',
      invalid_gregorian_date: 'تاریخ میلادی معتبر نیست.',
      wallet_scroll_hint: 'برای دیدن گزینه‌های بیشتر، به چپ و راست اسکرول کنید.',
      back_to_wallet: 'بازگشت به بکسک همیان',
      transfer_soon: 'این بخش به زودی فعال خواهد شد.',
      withdraw_soon: 'این بخش به زودی فعال خواهد شد.',
      transfer_conditions: 'شرایط انتقال',
      transfer_condition_identity: 'کاربر فرستنده و دریافت‌کننده باید تایید هویت شده باشند.',
      transfer_condition_premium: 'کاربر فرستنده و دریافت‌کننده باید کاربرممتاز باشند.',
      withdraw_conditions: 'شرایط برداشت',
      withdraw_condition_identity: 'برای برداشت، تایید هویت کاربر حتمی است.',
      wallet_note_1:
        'پول بکسک شما در هر زمان قابل برداشت می‌باشد. شما می‌توانید هر بار حداقل 500 افغانی را از حساب خود برداشت کنید. شرکت اولنیش متعهد است تا پول‌های واریزی و درآمدهای شما را به موقع پرداخت کند.',
      wallet_note_2:
        'از این پول می‌توانید در سبسکریپشن کاربرممتاز، خرید کتاب، خرید بسته‌های آموزشی، سبسکریپشن کسب‌وکار و خرید در همیان بازار استفاده کنید.',
      wallet_note_3: 'همچنین می‌توانید پول بکسک خود را قسمتی یا کامل به شخص دیگری بفرستید.',
      afn: 'افغانی',
      page_accounts_desc: 'حسابات چندارزی و تراکنش‌ها',
      create_user_accounts: 'ایجاد حسابات شخصی',
      user_accounts_not_activated: 'حسابات شخصی شما هنوز فعال نشده‌اند.',
      create_user_account_guide: 'با ایجاد حساب شخصی می‌توانید مصارف و معاملات شخصی خود را مدیریت کنید.',
      choose_trade_currencies_note: 'اسعار مورد معامله خود را انتخاب کنید؛ سپس حسابات شخصی فعال می‌شود.',
      premium_currency_lock_note:
        'شما فعلاً کاربرممتاز نیستید؛ فقط اکونت افغانی نمایش داده می‌شود.',
      premium_template_select_note: 'برای کاربران ممتاز، تمام اکونت تمپلیت‌ها قابل انتخاب‌اند.',
      select_at_least_one_template: 'لطفاً حداقل یک اکونت تمپلیت را انتخاب کنید.',
      no_account_templates: 'اکونت تمپلیتی یافت نشد.',
      premium_accounts_hidden_note:
        'شما کاربر ممتاز نیستید؛ فقط اکونت افغانی نمایش داده می‌شود.',
      account_card_click_hint: 'برای دیدن جزئیات و گزینه حذف حساب، روی هر حساب کلیک کنید.',
      more_details: 'جزئیات بیشتر',
      personal_accounts_guide: 'راهنمای حسابات شخصی',
      cp_transactions_guide: 'راهنمای رفت و آمدها',
      cp_incoming: 'آمد از',
      cp_outgoing: 'رفت به',
      add_funds: 'افزودن',
      withdraw: 'برداشت',
      search_counterparty: 'جستجوی معامله‌دار',
      counterparty: 'معامله‌دار',
      description: 'توضیحات',
      premium_account_progress: 'تعداد اکونت‌های شما',
      transaction_click_hint: 'برای دیدن جزئیات، روی هر تراکنش کلیک کنید.',
      deposit_added: 'واریز',
      deposit_detail: 'جزئیات تراکنش',
      afn_only_operation_note: 'برای افزودن و برداشت مستقیم، فقط اکونت افغانی قابل انتخاب است.',
      premium_can_select_account: 'شما کاربر ممتاز هستید؛ می‌توانید اکونت مورد نظر را انتخاب کنید.',
      confirm_delete_title: 'تأیید حذف',
      confirm_delete_text: 'آیا مطمئن هستید که می‌خواهید حذف کنید؟',
      balance_details: 'جزئیات بیلانس',
      current_balance: 'موجودی فعلی',
      personal_account_description:
        'این موجودی مربوط به حساب شخصی شماست و از حسابات کسب‌وکار جداست. تراکنش‌های این بخش برای مدیریت بودجه شخصی طراحی شده‌اند.',
      delete_account_warning: 'هشدار: با حذف این حساب، عملیات قابل برگشت نیست.',
      delete_account: 'حذف حساب',
      delete_account_success: 'حساب شخصی موفقانه حذف شد.',
      account_has_tx_delete_blocked: 'این حساب تراکنش دارد و قابل حذف نیست.',
      confirm_delete_account_text: 'آیا مطمئن هستید که می‌خواهید این حساب را حذف کنید؟',
      personal_accounts_guide_intro:
        'حسابات شخصی برای مدیریت پول شخصی شما طراحی شده و از حسابات کسب‌وکار جداست.',
      guide_create_account: 'ایجاد حساب: با دکمه ایجاد حسابات شخصی، حساب‌ها بر اساس تمپلیت فعال می‌شوند.',
      guide_balance_meaning: 'معنی بیلانس: بیلانس هر کارت موجودی همان ارز در حساب شخصی شماست.',
      guide_add_withdraw: 'افزایش/برداشت: ثبت افزودن یا برداشت، بیلانس را همان لحظه بروزرسانی می‌کند.',
      guide_transactions: 'جزئیات تراکنش: با کلیک روی هر تراکنش مبلغ، تاریخ و توضیحات دیده می‌شود.',
      guide_delete_account: 'حذف حساب: فقط وقتی ممکن است که هیچ تراکنشی نداشته باشد.',
      guide_premium: 'همهٔ ارزهای حساب شخصی بدون کاربر ممتاز قابل استفاده‌اند. معامله‌دار بدون ممتاز تا ۳۰ نفر است.',
      cp_guide_intro: 'این بخش برای ثبت و پیگیری رفت و آمد پول با معامله‌داران است.',
      cp_guide_incoming: 'آمد از: وقتی از معامله‌دار پول دریافت می‌کنید.',
      cp_guide_outgoing: 'رفت به: وقتی به معامله‌دار پول می‌پردازید.',
      cp_guide_account: 'وابسته به حساب: هر رفت و آمد روی یک حساب شخصی مشخص ثبت می‌شود.',
      cp_guide_balance: 'باقی/طلب برای هر حساب و هر ارز جدا محاسبه می‌شود.',
      page_counterparties_desc: 'مدیریت معامله‌داران شخصی',
      counterparty_free_limit_note:
        'در حالت عادی فقط 30 معامله‌دار اول نمایش داده می‌شود. برای دسترسی به همه، حساب ممتاز فعال کنید.',
      counterparty_add_locked_note:
        'در حالت عادی، پس از رسیدن به 30 معامله‌دار، افزودن جدید نیاز به حساب ممتاز دارد.',
      premium_counterparty_add_open: 'حساب ممتاز فعال است؛ افزودن معامله‌دار همیشه باز است.',
      counterparty_transactions: 'رفت و آمدها',
      baqi_talab_meaning:
        'راهنما: اگر باقی نمایش داده شود یعنی شما به معامله‌دار بدهکارید؛ اگر طلب باشد یعنی معامله‌دار به شما بدهکار است.',
      counterparty_count_label: 'تعداد معامله‌داران',
      balance_or_talab: 'باقی / طلب',
      talab: 'طلب',
      baqi: 'باقی',
      settled: 'تصفیه',
      edit_counterparty: 'ویرایش معامله‌دار',
      no_counterparties: 'هیچ معامله‌داری یافت نشد.',
      counterparty_details: 'جزئیات معامله‌دار',
      counterparty_not_found: 'معامله‌دار یافت نشد.',
      total_outgoing: 'مجموع رفت به',
      total_incoming: 'مجموع آمد از',
      page_companies_desc: 'لیست و ایجاد کسب‌وکار',
      save_changes: 'ذخیره تغییرات',
      create_business: 'ایجاد کسب‌وکار',
      add_counterparty: 'افزودن معامله‌دار',
      search: 'جستجو',
      balance: 'موجودی',
      amount: 'مبلغ',
      status: 'وضعیت',
      date: 'تاریخ',
      name: 'نام',
      lastname: 'تخلص',
      email: 'ایمیل',
      phone: 'تلفن',
      currency: 'ارز',
      active: 'فعال',
      inactive: 'غیرفعال',
      create: 'ایجاد',
      business_name: 'نام کسب‌وکار',
      business_type: 'نوع کسب‌وکار',
      parent_company: 'شرکت اصلی',
      none: 'ندارد',
      transactions: 'تراکنش‌ها',
      deposits: 'واریزها',
      referrals: 'معرفی‌شدگان',
      saved_success: 'با موفقیت ذخیره شد.',
      save: 'ذخیره',
      processing: 'در حال پردازش...',
      edit: 'ویرایش',
      profile_photo: 'عکس پروفایل',
      update_profile_photo: 'ویرایش عکس پروفایل',
      update_profile_info: 'ویرایش معلومات پروفایل',
      choose_photo: 'انتخاب تصویر',
      choose_another_photo: 'انتخاب تصویر دیگر',
      avatar_crop_hint: 'تصویر را به صورت مربعی (۱:۱) کراپ کنید. حجم نهایی حداکثر ۱۵۰ کیلوبایت می‌شود.',
      avatar_compress_failed: 'فشرده‌سازی تصویر به زیر ۱۵۰ کیلوبایت ممکن نشد. تصویر دیگری انتخاب کنید.',
      no_file_selected: 'فایل انتخاب نشده است.',
      info_upload_success: 'با موفقیت ثبت شد.',
      email_change_note: 'در صورت تغییر ایمیل، تأیید دوباره لازم است.',
      identity_details: 'جزئیات هویت',
      whatsapp_number: 'شماره واتساپ',
      identity_number: 'نمبر تذکره',
      id_scan_front: 'اسکن روی تذکره',
      id_scan_back: 'اسکن پشت تذکره',
      id_scan_crop_hint:
        'تصویر را مطابق نسبت کارت تذکره کراپ کنید. حجم فایل انتخابی محدود نیست؛ هنگام آپلود حداکثر ۵۱۲ کیلوبایت می‌شود.',
      id_scan_compress_failed:
        'فشرده‌سازی تصویر به زیر ۵۱۲ کیلوبایت ممکن نشد. تصویر دیگری انتخاب کنید.',
      no_image: 'بدون تصویر',
      status_approved: 'تایید شده',
      status_rejected: 'رد شده',
      status_requested: 'درخواست شده',
      status_pending: 'در انتظار',
      request_review: 'درخواست بررسی',
      confirm_request_review_title: 'تایید ارسال درخواست بررسی',
      confirm_request_review_note: 'با ارسال درخواست، معلومات هویتی شما جهت بررسی فرستاده می‌شود.',
      request_sent: 'درخواست شما ارسال شد.',
      send_request: 'ارسال درخواست',
      user_id: 'شناسه کاربر',
      copy_user_id: 'کاپی',
      copied: 'کاپی شد',
      public_user_id_note:
        'یادداشت: این آیدی برای استفاده عمومی است. با دعوت از دوستان به این سیستم، درآمد خواهید کرد. پس دعوت کردن را همین اکنون شروع کنید.',
      your_invite_link: 'لینک دعوت شما',
      copy_invite_link: 'کاپی لینک دعوت',
      visit_public_profile: 'تماشای پروفایل عمومی',
      invitation_message:
        'سلام به شما! اگر یک فروشگاه دارید، به بزرگترین پلتفرم آنلاین مدیریت کسب و کار افغانستان بپیوندید و به آسانی کسب و کار خود را مدیریت کنید. شما همچنان می توانید با دعوت دیگران به این سیستم، درآمد کسب کنید. بخاطر راجستر نمودن، از لینک دعوت من استفاده کنید: :link',
      your_community_count: 'اجتماع شما: {{count}} تن',
      no_referrals_yet: 'تا هنوز کسی را دعوت نکرده اید!',
      jalali_date: 'تاریخ هجری شمسی (افغانستان)',
      gregorian_date: 'تاریخ میلادی',
      gregorian_equivalent: 'معادل میلادی',
      click_for_gregorian: 'برای دیدن تاریخ میلادی کلیک کنید',
      local_timezone_note: 'زمان بر اساس منطقه زمانی محلی سیستم شما نمایش داده می‌شود.',
      sidebar_open: 'باز کردن سایدبار',
      sidebar_close: 'بستن سایدبار',
      sidebar_switch_account: 'تغییر حساب',
      syncing: 'در حال همگام‌سازی…',
      company: 'کمپنی',
      company_dashboard: 'داشبورد کسب‌وکار',
      company_dashboard_desc: 'خلاصه وضعیت و اطلاعات این کسب‌وکار',
      company_inactive_alert:
        'سیستم برای این شرکت ({{company}}) غیر فعال می‌باشد. بخاطر فعال نمودن سیستم، پرداخت سالانه را انجام دهید. در غیر صورت درج دیتای روزمره شما ناممکن خواهد بود.',
      company_id: 'شناسه کسب‌وکار',
      copy_company_id: 'کاپی',
      public_company_id_note:
        'در موارد عمومی، خرید از ریسلرها، و سایر گزینه‌ها استفاده می‌شود.',
      valid_until: 'معتبر تا',
      valid_date: 'اعتبار',
      company_validity: 'اعتبار کسب‌وکار',
      enter_business: 'ورود به کسب‌وکار',
      customers: 'مشتریان',
      vendors: 'فروشندگان',
      staff: 'کارمندان',
      company_accounts: 'حسابات',
      warehouses: 'گدام‌ها',
      warehouse_inventory: 'موجودی گدام',
      warehouse_transfers: 'انتقالات گدام',
      warehouse_transfer_records: 'ریکوردهای انتقال اجناس',
      new_transfer: 'انتقال جدید',
      no_transfer_records: 'ریکورد انتقالی یافت نشد.',
      no_warehouse_inventory: 'موجودی یافت نشد.',
      all_locations: 'همه محل‌ها',
      all_warehouses: 'همه گدام‌ها',
      company_sales_center_full: 'مرکز فروش (کمپنی)',
      from_warehouse: 'از گدام',
      to_warehouse: 'به گدام',
      location: 'محل',
      available: 'موجود',
      item_required: 'انتخاب جنس الزامی است.',
      today_date: 'تاریخ امروز',
      transfer: 'انتقال',
      transfer_type: 'نوع',
      transfer_route: 'مسیر',
      warehouse_to_warehouse: 'گدام به گدام',
      warehouse_to_company: 'گدام به مرکز فروش',
      company_to_warehouse: 'مرکز فروش به گدام',
      company_sales_center: 'مرکز فروش',
      transfer_reversed: 'برگشت داده شده',
      delete_transfer: 'حذف انتقال',
      confirm_delete_transfer: 'این انتقال حذف/برگشت داده شود؟',
      item: 'جنس',
      add_warehouse: 'افزودن گدام',
      edit_warehouse: 'ویرایش گدام',
      delete_warehouse: 'حذف گدام',
      confirm_delete_warehouse: 'آیا از حذف این گدام مطمئن هستید؟',
      warehouse_has_items_not_deletable:
        'گدام دارای جنس است و قابل حذف نیست. ابتدا اجناس را از گدام خارج کنید.',
      insert: 'درج',
      sale: 'فروش',
      sales: 'فروشات',
      expenses: 'مصارف',
      cash_deposits: 'تزریقات نقدی',
      cash_withdrawals: 'برداشت‌ها',
      items: 'اجناس',
      items_products: 'اجناس / محصولات',
      daily_sales_report: 'گزارش فروشات روزانه',
      profit_report: 'گزارش مفاد',
      profit_loss_report: 'گزارش مفاد و ضرر',
      journal: 'روزنامچه',
      journal_detail: 'تفصیل',
      journal_balance: 'بیلانس',
      journal_time: 'زمان',
      no_journal_on_date: 'در این تاریخ تراکنشی ثبت نشده است.',
      partners: 'شرکا',
      coming_soon: 'به زودی',
      items_sold: 'اجناس فروخته شده',
      qty_sold: 'مقدار فروخته شده',
      invoices_count: 'تعداد فاکتورها',
      day_sales_total: 'مجموع فروش روز',
      day_profit_total: 'مفاد کلی روز',
      total_sales: 'مجموع فروش',
      total_purchases: 'مجموع خرید',
      search_sales_hint: 'جستجو بر اساس مشتری یا نمبر بل',
      search_purchases_hint: 'جستجو بر اساس فروشنده یا نمبر بل',
      avg_unit_price: 'اوسط قیمت فی واحد',
      profit_per_unit: 'مفاد فی واحد',
      no_sales_on_date: 'در این تاریخ فروش ثبت نشده است.',
      gross_profit_note:
        'یادداشت: ارقام این صفحه مفاد ناخالص را نشان می‌دهد. مفاد خالص در بخش گزارش مفاد/ضرر نمایش داده خواهد شد.',
      from_date: 'از تاریخ',
      to_date: 'تا تاریخ',
      view_separate: 'نمایش جداجدا',
      show_merged: 'نمایش یکجایی',
      view_by_invoice: 'نمایش به اساس بل',
      print_pdf: 'چاپ/PDF',
      sale_account: 'اکونت فروش',
      sale_cost: 'هزینه فروش',
      sale_cost_capital: 'هزینه فروش در سرمایه',
      purchase_cost_capital: 'هزینه خرید در سرمایه',
      profit_in_sale_account: 'مفاد در اکونت فروش',
      profit_in_capital_account: 'مفاد در اکونت سرمایه',
      sale_invoice: 'بل فروش',
      sold_quantity: 'تعداد فروخته شده',
      raw_materials: 'مواد خام',
      productions: 'تولیدات',
      item_categories: 'کتگوری اجناس',
      add_category: 'افزودن دسته‌بندی',
      edit_category: 'ویرایش دسته‌بندی',
      delete_category_confirm_title: 'تایید حذف کتگوری',
      delete_category_confirm_message: 'آیا مطمئن هستید که این کتگوری حذف شود؟',
      delete_category_detach_warning:
        'کتگوری «{{name}}» دارای {{count}} جنس مرتبط است. با تایید حذف، کتگوری این اجناس خالی (بدون کتگوری) می‌شود. آیا ادامه می‌دهید؟',
      confirm_detach_and_delete_category: 'بله، جدا کن و حذف شود',
      purchases: 'خریدها',
      activity_logs: 'دیده‌بان همیان',
      activity_logs_subtitle:
        'در این صفحه فقط خلاصهٔ ساده و قابل‌فهم از تغییرات کمپنی نمایش داده می‌شود.',
      activity_logs_search_placeholder: 'نام کاربر، ایمیل یا نوع بخش',
      no_activity_logs: 'لاگی برای نمایش یافت نشد.',
      activity_log_fallback: 'تغییر جدید ثبت شد',
      activity_entity_fallback: 'اطلاعات',
      date_from: 'از تاریخ',
      date_to: 'تا تاریخ',
      clear_filters: 'پاک‌کردن',
      apply_filters: 'فیلتر',
      previous: 'قبلی',
      next: 'بعدی',
      model: 'مدل',
      related: 'مرتبط',
      business: 'کسب‌وکار',
      website: 'ویبسایت',
      view_all: 'مشاهده همه',
      cash: 'دخل',
      bank: 'بانک',
      etc: 'غیره',
      capital: 'سرمایه اصلی',
      sell_account: 'حساب فروش',
      account: 'حساب',
      company_accounts_cash_bank: 'حسابات / دخل و بانک',
      dash_today: 'امروز',
      dash_month: 'این ماه',
      dash_other: 'سایر',
      dash_today_details: 'خلاصه معاملات امروز',
      dash_month_details: 'خلاصه معاملات ماه',
      dash_other_details: 'سایر اطلاعات مهم',
      receivables: 'حساب های دریافتی',
      payables: 'حساب های پرداختی',
      out_of_stock: 'نزدیک تمام',
      out_of_stock_items: 'اجناس ختم شده',
      low_stock_items: 'اجناس در حد هشدار',
      no_accounts_yet: 'هنوز هیچ حسابی ایجاد نشده است.',
      no_transactions: 'هیچ تراکنشی یافت نشد.',
      credit: 'آمد',
      debit: 'رفت',
      tx_purchase_payment: 'پرداخت خرید',
      tx_purchase_reopen: 'بازگشایی خرید',
      tx_purchase: 'خرید',
      tx_sale_invoice_payment: 'پرداخت بل فروش',
      tx_sale_invoice_reopen: 'برگشت بل فروش',
      tx_sale_reopen: 'برگشت فروش',
      tx_cash_deposit: 'ازدیاد پول',
      tx_cash_withdraw: 'برداشت پول',
      tx_customer_general_payment: 'دریافت مشتری',
      tx_customer_payment_reversal: 'برگشت پرداخت مشتری',
      tx_vendor_general_payment: 'پرداخت به فروشنده',
      tx_vendor_prepayment_return: 'برگشت پیش‌پرداخت فروشنده',
      tx_vendor_payment_reversal: 'برگشت پرداخت فروشنده',
      tx_vendor_negative_payment_reversal: 'برگشت پرداخت منفی فروشنده',
      tx_staff_salary_payment: 'پرداخت معاش کارمند',
      tx_staff_salary_payment_reversal: 'برگشت پرداخت معاش',
      tx_expense: 'مصرف',
      tx_expense_updated: 'ویرایش مصرف',
      tx_expense_updated_reversal: 'برگشت ویرایش مصرف',
      tx_expense_deleted_reversal: 'برگشت حذف مصرف',
      tx_transfer_in: 'انتقال به این حساب',
      tx_transfer_out: 'انتقال از این حساب',
      currency_afn: 'افغانی',
      currency_usd: 'دالر',
      currency_eur: 'یورو',
      currency_irr: 'تومان',
      currency_pkr: 'کلدار',
      currency_gbp: 'پوند',
      currency_aed: 'درهم',
      currency_try: 'لیر',
      currency_cny: 'یوآن',
      currency_inr: 'روپیه',
      currency_sar: 'ریال سعودی',
      total_accounts: 'مجموع حسابات',
      hint_click_account: 'برای دیدن جزئیات، روی کارت کلیک کنید.',
      account_transactions: 'تراکنش‌های حساب',
      account_details: 'جزئیات حساب',
      account_type: 'نوع حساب',
      note_account_locked: 'نوت: سرمایه اصلی و حساب فروش بعد از تعیین، قابل تغییر نیستند.',
      create_account_permanent_note:
        'توجه: نام حساب بعداً قابل ویرایش است. حذف فقط وقتی ممکن است که هیچ تراکنشی روی حساب نباشد.',
      create_account_capital_sell_note:
        'حساب سرمایه و حساب فروش می‌توانند جدا باشند (مثلاً سرمایه به دالر و فروش به افغانی) یا هر دو روی یک حساب باشند.',
      create_account_confirm_warn:
        'لطفاً اطلاعات زیر را بررسی کنید. نام حساب بعداً قابل ویرایش است؛ نوع و ارز پس از ایجاد تغییر نمی‌کند.',
      confirm_create_account_title: 'تأیید ایجاد حساب',
      confirm_create_account: 'بله، ایجاد شود',
      transfer_between_accounts: 'انتقال بین حساب‌ها',
      transfer_from_account: 'از حساب',
      transfer_to_account: 'به حساب',
      transfer_same_currency_only: 'انتقال فقط بین حساب‌های هم‌ارز ممکن است.',
      transfer_need_two_accounts: 'برای انتقال حداقل دو حساب هم‌ارز لازم است.',
      transfer_success: 'انتقال ثبت شد.',
      transfer_insufficient_balance: 'موجودی حساب مبدأ کافی نیست.',
      account_transfers: 'انتقالات',
      no_account_transfers: 'هنوز انتقالی بین حساب‌ها ثبت نشده است.',
      delete_account_transfer: 'حذف انتقال',
      confirm_delete_account_transfer: 'آیا از حذف این انتقال مطمئن هستید؟',
      confirm_delete_account_transfer_warn:
        'با تأیید، موجودی حساب مبدأ و مقصد به حالت قبل از این انتقال برمی‌گردد.',
      account_transfer_deleted: 'انتقال حذف شد و موجودی‌ها به حالت قبل برگشت.',
      edit_account_name: 'ویرایش اسم',
      account_name_updated: 'نام حساب به‌روز شد.',
      company_account_deleted: 'حساب حذف شد.',
      account_card_menu: 'گزینه‌های حساب',
      show_inactive_accounts: 'حسابات غیرفعال',
      hide_inactive_accounts: 'حسابات غیرفعال',
      confirm_deactivate_account:
        'این حساب غیرفعال شود؟ از لیست اصلی پنهان می‌شود و برای تراکنش‌های جدید قابل انتخاب نخواهد بود.',
      account_deactivated: 'حساب غیرفعال شد.',
      account_activated: 'حساب فعال شد.',
      cannot_deactivate_capital_or_sell: 'حساب سرمایه و حساب فروش قابل غیرفعال‌سازی نیستند.',
      cannot_deactivate_with_balance: 'حسابی که بیلانس دارد قابل غیرفعال‌سازی نیست.',
      deposit_to_account: 'افزودن پول به حساب',
      withdraw_from_account: 'برداشت از حساب',
      cash_added_successfully: 'با موفقیت اضافه شد.',
      cash_withdrawn_successfully: 'با موفقیت برداشت شد.',
      confirm_delete_cash_movement: 'آیا از حذف این تزریق/برداشت مطمئن هستید؟ موجودی حساب اصلاح می‌شود.',
      cash_movement_deleted: 'تراکنش با موفقیت حذف شد.',
      remark: 'یادداشت',
      select: 'انتخاب کنید',
      set_as_capital: 'تعیین به‌عنوان سرمایه اصلی',
      set_as_sell: 'تعیین به‌عنوان حساب فروش',
      balance_after: 'بیلانس بعد',
      balance_before: 'بیلانس قبل',
      transaction_details: 'جزئیات تراکنش',
      registered_by: 'ثبت‌کننده',
      transaction_number: 'نمبر تراکنش',
      related_source: 'سند مرتبط',
      no_related_document: 'اطلاعاتی موجود نیست.',
      company_dashboard_loading_hint:
        'خلاصه‌ی مالی پس از فعال شدن API داشبورد کسب‌وکار در اینجا نمایش داده می‌شود.',
      quick_access: 'دسترسی سریع',
      company_modules_hint:
        'از سایدبار می‌توانید بین بخش‌های کسب‌وکار جابه‌جا شوید. برخی ماژول‌ها به‌زودی فعال می‌شوند.',
      module_coming_soon: 'این بخش به‌زودی در اپ دسکتاپ فعال می‌شود.',
      business_status: 'وضعیت کسب‌وکار',
      business_status_hint: 'حالت فروشگاه، تولیدی و خدماتی را از این بخش فعال یا غیرفعال کنید.',
      business_status_description:
        'حالت‌های فروشگاه، تولیدی و خدماتی را از این بخش مدیریت کنید. برای فعال‌سازی مجدد، کد تایید به ایمیل آونر ارسال می‌شود.',
      manage_business_status: 'مدیریت وضعیت کسب‌وکار',
      company_user_access: 'دسترسی کاربران کمپنی',
      company_user_access_hint:
        'فهرست کاربرانی را که به این کمپنی دسترسی دارند ببینید و برای کاربران جدید دسترسی تعریف کنید.',
      access_roles_guide_title: 'تشریح رول های دسترسی',
      access_roles_guide_subtitle:
        'قبل از درج دسترسی، نقش مناسب هر کاربر را از این فهرست انتخاب کنید.',
      access_role_badge: 'رول دسترسی',
      owner_full_access_note: 'مالک همیشه دسترسی کامل دارد و از این فهرست حذف نمی‌شود.',
      manage_user_access: 'مدیریت دسترسی کاربران',
      parent_company_link: 'اتصال به شرکت اصلی',
      parent_company_link_hint:
        'اگر این کسب و کار زیرمجموعه است، از این بخش شرکت اصلی آن را انتخاب یا اتصال فعلی را حذف کنید.',
      manage_parent_company: 'تنظیم شرکت اصلی',
      data_purge_title: 'پاک سازی کامل دیتای کمپنی',
      data_purge_hint: 'این عملیات تمام معلومات مربوط به کمپنی را به صورت کامل و غیرقابل برگشت حذف می‌کند.',
      data_purge_warning:
        'هشدار: پس از تایید، تمام دیتای عملیاتی این کمپنی حذف می‌شود و قابل برگشت نیست. رکورد خود کمپنی و پرداخت‌های اشتراک باقی می‌ماند.',
      data_purge_done: 'پاک‌سازی کامل دیتای کمپنی با موفقیت انجام شد.',
      go_data_purge: 'رفتن به چک پوینت پاک سازی دیتا',
      confirm_data_purge: 'تایید پاک‌سازی دیتا',
      return: 'برگشت',
      store_mode_full: 'حالت فروشگاه',
      store_mode_description:
        'با فعال بودن حالت فروشگاه، منوی فروش، موجودی، اجناس و سایر امکانات فروشگاهی در کمپنی نمایش داده می‌شود.',
      store_mode_active_hint: 'امکانات فروشگاهی (فروش، موجودی، اجناس و ...) در دسترس هستند.',
      production_mode_full: 'حالت تولیدی',
      production_mode_description: 'با فعال بودن حالت تولیدی، امکانات تولید و مواد اولیه در کمپنی در دسترس می‌شود.',
      production_mode_active_hint: 'امکانات تولیدی فعال است.',
      service_mode_full: 'حالت خدماتی',
      service_mode_description: 'با فعال بودن حالت خدماتی، امکانات ویژه بخش خدمات در دسترس می‌شود.',
      service_mode_active_hint: 'امکانات خدماتی فعال است.',
      code_will_send_to: 'کد تایید به این ایمیل ارسال می‌شود',
      send_verification_code: 'ارسال کد تایید',
      verification_code: 'کد تایید',
      verification_code_sent: 'کد تایید به ایمیل شما ارسال شد.',
      verification_code_required: 'کد تایید باید 6 رقم باشد.',
      resend_code: 'ارسال مجدد کد',
      resend_in: 'ارسال مجدد تا',
      activate: 'فعال‌سازی',
      deactivate: 'غیرفعال‌سازی',
      capability_activated: 'با موفقیت فعال شد.',
      capability_deactivated: 'با موفقیت غیرفعال شد.',
      add_user_access: 'افزودن دسترسی کاربر',
      edit_user_access: 'ویرایش دسترسی کاربر',
      delete_user_access: 'حذف دسترسی کاربر',
      confirm_delete_access: 'حذف دسترسی برای',
      owner_password: 'رمز عبور آونر',
      role: 'نقش',
      role_owner: 'صاحب اصلی',
      company_role_title_owner: 'صاحب اصلی',
      company_role_description_owner:
        'دسترسی کامل به همه بخش‌ها، از جمله حذف رکوردها، مدیریت دسترسی کاربران، اتصال به شرکت اصلی و پاک‌سازی دیتای کمپنی.',
      company_role_title_admin: 'ادمین',
      company_role_description_admin:
        'دسترسی کامل از جمله حذف رکوردها. نمی‌تواند مالک را حذف کند، کمپنی را به کمپنی اصلی وصل کند، یا دیتای کمپنی را پاک‌سازی کند (فقط صاحب اصلی).',
      company_role_title_manager: 'مدیر',
      company_role_description_manager:
        'دسترسی کامل به عملیات روزمره بدون حذف رکوردها، بدون مدیریت دسترسی کاربران، و با محدودیت‌های ادمین.',
      company_role_title_sales_full_manager: 'مدیر عمومی فروش',
      company_role_description_sales_full_manager:
        'می‌تواند فروش و خرید را با محدودیت‌های مدیر مدیریت کند؛ گزارشات را نمی‌بیند و نمی‌تواند رکوردها را حذف کند.',
      company_role_title_sales_manager: 'مدیر فروش',
      company_role_description_sales_manager:
        'می‌تواند فروش ایجاد و مدیریت کند، اما نمی‌تواند رکوردها را حذف کند.',
      company_role_title_accountant: 'حسابدار',
      company_role_description_accountant:
        'می‌تواند حساب‌ها، مصارف، پرداخت معاشات و گزارش‌های مالی را مدیریت کند، بدون تنظیمات دسترسی، حذف تخریبی یا تنظیمات تخریبی کسب‌وکار.',
      company_role_title_analyser: 'تحلیل‌گر',
      company_role_description_analyser:
        'فقط دسترسی مشاهده به خریدها، فروش‌ها، مصارف و پرداخت‌های معاش دارد.',
      company_role_title_hr: 'منابع بشری',
      company_role_description_hr: 'فقط به مدیریت کارمندان محدود است و نمی‌تواند رکوردها را حذف کند.',
      granted_by: 'اعطا شده توسط',
      existing_access: 'دسترسی موجود',
      current_parent_company: 'شرکت اصلی فعلی',
      parent_already_linked: 'این کمپنی هم‌اکنون به یک شرکت اصلی وصل است.',
      child_companies: 'شرکت‌های زیرمجموعه',
      has_children_no_parent: 'چون این شرکت زیرمجموعه دارد، نمی‌تواند به شرکت اصلی دیگری وصل شود.',
      select_parent_company: 'شرکت اصلی را انتخاب کنید',
      connect_parent_company: 'وصل کردن به شرکت اصلی',
      confirm_parent_connect: 'آیا از اتصال به این شرکت اصلی مطمئن هستید؟',
      no_parent_options: 'شرکت واجد شرایطی برای اتصال به‌عنوان شرکت اصلی یافت نشد.',
      add_slider_image: 'درج عکس اسلایدر',
      existing_slider_images: 'تصاویر ثبت‌شده',
      slider: 'اسلایدر',
      no_data: 'موردی وجود ندارد.',
      no_file: 'هیچ فایلی انتخاب نشد.',
      drag_and_drop: 'عکس را درگ کنید یا کلیک کنید',
      upload_failed: 'اشکال در آپلود تصویر.',
      deleted_success: 'با موفقیت حذف شد.',
      confirm_delete_slider: 'آیا مطمئن هستید که می‌خواهید این عکس اسلایدر را حذف کنید؟',
      store_mode: 'فروشگاهی',
      production_mode: 'تولیدی',
      address: 'آدرس',
      filter_all: 'همه',
      add_customer: 'ازدیاد مشتری',
      add_vendor: 'ازدیاد فروشنده',
      search_by_name: 'جستجو به اساس اسم',
      receivables_summary: 'مجموع قابل دریافت از مشتریان',
      payables_summary: 'مجموع قابل پرداخت به فروشندگان',
      by_currency: 'به تفکیک ارز',
      no_receivables_summary: 'مبلغ قابل دریافت ثبت نشده است.',
      no_payables_summary: 'مبلغ قابل پرداخت ثبت نشده است.',
      no_customers: 'هیچ مشتری موجود نیست.',
      no_matching_customers: 'هیچ مشتری با این اسم پیدا نشد.',
      no_matching_vendors: 'هیچ فروشنده‌ای با این اسم پیدا نشد.',
      no_vendors: 'هیچ فروشنده موجود نیست.',
      company_name: 'نام شرکت',
      action: 'عمل',
      view: 'نمایش',
      more: 'بیشتر',
      total_count: 'تعداد',
      tip_receivables: 'باقیات به تفکیک اکونت نمایش داده می‌شود.',
      tip_payables: 'باقیات به تفکیک ارز/اکونت نمایش داده می‌شود.',
      has_receivable: 'دارای باقیات دریافتی',
      has_payable: 'دارای باقیات',
      customer_setup: 'تنظیم معلومات مشتری',
      vendor_setup: 'تنظیم معلومات فروشنده',
      back: 'برگشت',
      customer_details: 'مشخصات مشتری',
      vendor_details: 'مشخصات فروشنده',
      personality: 'شخصیت',
      personality_human: 'حقیقی',
      personality_company: 'حقوقی',
      set_previous_receivables: 'تعیین باقیات قبلی',
      set_previous_payables: 'تنظیم باقیات گذشته',
      previous_balance_mode: 'نوع ثبت باقیات',
      add_previous_balance: 'افزودن باقیات',
      set_previous_balance: 'تنظیم باقیات',
      add_previous_balance_hint:
        'مبلغ واردشده به باقیات فعلی همین حساب اضافه می‌شود. مثال: اگر باقیات ۵۰۰ باشد و ۱۰۰۰ بزنید، باقیات ۱۵۰۰ می‌شود.',
      set_previous_balance_hint:
        'باقیات همین حساب به مبلغ واردشده اصلاح می‌شود و افزایش نمی‌یابد. مثال: اگر باقیات ۵۰۰ باشد و ۱۰۰۰ بزنید، باقیات ۱۰۰۰ می‌شود نه ۱۵۰۰.',
      current_account_remaining: 'باقیات فعلی این حساب',
      remaining_after_save: 'باقیات بعد از ذخیره',
      remaining_cannot_be_negative: 'باقیات نمی‌تواند منفی باشد.',
      general_payment: 'پرداخت مشتری',
      customer_payment_signed_hint:
        'مبلغ مثبت = دریافت از مشتری (حتی بیشتر از باقی → کسب‌وکار بدهکار می‌شود)؛ مبلغ منفی = پرداخت به مشتری (از دخل کم و به باقیات اضافه می‌شود).',
      payment_to_customer: 'پرداخت به مشتری',
      business_owes_customer: 'بدهکار مشتری',
      vendor_general_pay: 'پرداخت به فروشنده',
      vendor_payment_signed_hint:
        'مبلغ مثبت = پرداخت به فروشنده؛ مبلغ منفی = برگشت پیش‌پرداخت.',
      prepayment: 'پیش پرداخت',
      debt_history: 'تاریخچه باقیات',
      customer_payables_records: 'ریکاردهای باقیات مشتری',
      customer_payments_list: 'لیست پرداخت‌های مشتری',
      customer_purchases: 'خریدهای مشتری',
      vendor_purchases: 'خریدها از فروشنده',
      invoice_total: 'هزینه کلی',
      remaining_amount: 'باقی',
      item_rows: 'ردیف جنس',
      vendor_payables_records: 'ریکاردهای باقیات فروشنده',
      vendor_payments_list: 'لیست پرداخت‌های فروشنده',
      no_payables_records: 'هیچ ریکاردی ثبت نشده است.',
      previous_amount: 'مبلغ قبلی',
      change_amount: 'تغییر',
      new_amount: 'مبلغ جدید',
      confirm_delete_payment_title: 'تایید حذف پرداخت',
      confirm_delete_payment_body:
        'آیا مطمئن هستید که این پرداخت را حذف کنید؟ این عملیات برگشت‌ناپذیر است و ماندهٔ مشتری به اندازهٔ همین پرداخت افزایش می‌یابد.',
      payment_linked_to_invoice: 'وصل به فاکتور - قابل حذف نیست',
      payment_linked_to_purchase: 'وصل به خرید - قابل حذف نیست',
      debt_reason_manualSetup: 'تنظیم دستی',
      debt_reason_vendorPayment: 'پرداخت به فروشنده',
      debt_reason_vendorPaymentReversal: 'برگشت پرداخت فروشنده',
      payments: 'پرداخت‌ها',
      no_payments: 'پرداختی ثبت نشده است.',
      finalized: 'تکمیل‌شده',
      draft: 'پیش‌نویس',
      no_sales: 'هیچ فروشی موجود نیست.',
      load_more: 'بیشتر',
      loading_more: 'در حال بارگذاری…',
      no_purchases: 'هیچ خریدی موجود نیست.',
      no_items: 'هیچ جنسی موجود نیست.',
      add_purchase: 'ازدیاد خرید',
      create_purchase: 'ایجاد خرید',
      purchase_number: 'نمبر خرید',
      incomplete: 'ناتکمیل',
      complete: 'تکمیل',
      complete_purchase: 'تکمیل خرید',
      vendor_name: 'اسم فروشنده',
      not_assigned: 'تعیین نشده',
      warehouse_locked_after_items: 'پس از افزودن اقلام، تغییر گدام ممکن نیست.',
      full_auto_payment_no_vendor:
        'این خرید بدون فروشنده است؛ با زدن دکمه پرداخت، کل مبلغ به‌صورت کامل پرداخت می‌شود.',
      perform_payment: 'انجام پرداخت',
      barcode_not_found: 'جنس با این بارکد یافت نشد.',
      barcode_placeholder: 'بارکد را اسکن یا وارد کنید...',
      type_to_search_item: 'ابتدا جستجو کنید تا لیست نمایش داده شود.',
      vendor_required: 'فروشنده را انتخاب کنید.',
      exchange_rate_required: 'نرخ تبادله معتبر وارد کنید.',
      warehouse_required: 'گدام مورد نظر را انتخاب کنید.',
      company_account: 'اکونت کمپنی',
      sale_bill_currency: 'ارز فروش این بل',
      continue: 'ادامه',
      delete_draft_purchase: 'حذف خرید (پیش‌نویس)',
      delete_purchase_confirm_title: 'تایید حذف خرید',
      delete_purchase_confirm_message: 'آیا مطمئن هستید که می‌خواهید این خرید را حذف کنید؟',
      delete_purchase_effects_title: 'با حذف، موارد زیر انجام می‌شود:',
      delete_purchase_effects_1: 'تمام آیتم‌های این خرید حذف می‌شوند.',
      delete_purchase_effects_2: 'موجودی اجناس به اندازه مقادیر اضافه‌شده در این خرید کاهش می‌یابد.',
      delete_purchase_effects_3: 'فقط خریدهای پیش‌نویس قابل حذف‌اند (نباید پرداخت/بدهی ثبت شده باشد).',
      delete_purchase_effects_4: 'این کار غیرقابل بازگشت است.',
      confirm_back_to_edit_purchase: 'آیا مطمئن هستید که می‌خواهید این بل خرید را به ویرایش برگردانید؟',
      reopen_purchase_for_edit: 'برگشت بل به ویرایش',
      serial_required: 'سریال نمبر الزامی است.',
      price_required: 'قیمت فی معتبر نیست.',
      quantity_required: 'تعداد معتبر نیست.',
      equivalent: 'معادل',
      nothing_to_pay: 'مبلغی برای پرداخت باقی نمانده است.',
      no_warehouses: 'گدام فعالی ثبت نشده است.',
      search_vendor_placeholder: 'جستجو به اساس نام فروشنده...',
      select_item: 'انتخاب جنس',
      required_field: 'پر کردن این فیلد الزامی است.',
      without_customer: 'بدون مشتری',
      without_vendor: 'بدون فروشنده',
      exchange_rate: 'نرخ تبادله',
      add_item: 'افزودن جنس',
      add_raw_material: 'افزودن مواد خام',
      download_items_excel_template: 'دانلود فارمت اکسل',
      export_items_excel: 'خروجی اکسل',
      import_items_excel: 'وارد کردن از اکسل',
      importing_items_excel: 'در حال وارد کردن…',
      items_excel_import_success: '{{count}} جنس با موفقیت وارد شد.',
      items_excel_import_partial: '{{imported}} وارد شد؛ {{failed}} ردیف خطا داشت.',
      no_raw_materials: 'هیچ مواد خامی موجود نیست.',
      no_matching_items_filter: 'هیچ جنسی با این فیلتر پیدا نشد.',
      search_by_code: 'فلتر به اساس کد',
      all_categories: 'همه دسته‌بندی‌ها',
      no_category: 'بدون دسته‌بندی',
      all_inventory_locations: 'کل موجودی (کمپنی + گدام)',
      company_stock_only: 'فقط موجودی کمپنی',
      all_inventory: 'همه موجودی',
      zero_inventory: 'فقط موجودی صفر',
      positive_inventory: 'فقط بیشتر از صفر',
      sort_default: 'سورت پیش‌فرض',
      sort_stock_high_to_low: 'موجودی: زیاد به کم',
      sort_stock_low_to_high: 'موجودی: کم به زیاد',
      filters: 'فلترها',
      inventory_summary: 'خلاصه موجودی',
      inventory_purchase_value_total: 'مجموع ارزش کل اجناس قبل از فروش',
      total_inventory_quantity: 'مجموع تعداد موجودی',
      company_stock: 'کمپنی',
      warehouse_stock: 'گدام',
      capital_currency_missing: 'برای نمایش ارزش اجناس به ارز سرمایه، حساب سرمایه را تعیین کنید.',
      inventory_valuation_partial: 'ارزش بعضی اجناس به دلیل نبود نرخ تبادله یا قیمت خرید محاسبه نشده است.',
      stock_status_legend: 'تشریح علامت های موجودی',
      in_stock_status: 'جنس موجود است',
      low_stock_alert: 'موجودی این جنس به حد هشدار رسیده است',
      out_of_stock_alert: 'موجودی این جنس ختم شده است',
      purchase_cost: 'هزینه خرید',
      inventory_value_capital: 'ارزش موجودی به ارز سرمایه',
      sale_price_label: 'قیمت فروش',
      inventory: 'موجودی',
      show_barcode: 'نمایش بارکد',
      confirm_delete_item: 'حذف جنس',
      confirm_delete_item_body: 'آیا از حذف این جنس مطمئن هستید؟ این عمل برگشت‌ناپذیر است.',
      not_deletable: 'قابل حذف نیست',
      item_category: 'دسته‌بندی',
      unit_label: 'واحد',
      unit_small: 'واحد کوچک (پایه)',
      unit_medium: 'واحد متوسط',
      unit_large: 'واحد بزرگ',
      unit_to_base_qty: 'معادل واحد کوچک',
      unit_scale_hint: 'موجودی همیشه با واحد کوچک ذخیره می‌شود. متوسط و بزرگ اختیاری‌اند.',
      measure_unit: 'واحد اندازه‌گیری',
      quantity: 'تعداد',
      price: 'قیمت',
      inventory_purchase_value_capital: 'ارزش موجودی به ارز سرمایه',
      minimum_stock_level: 'حداقل موجودی برای هشدار',
      show_on_website: 'عمومی (در وبسایت نمایش داده می‌شود)',
      yes: 'بلی',
      no: 'نخیر',
      average_cost_history: 'تاریخچه میانگین نرخ‌ها',
      download_item_card: 'دانلود به شکل عکس',
      no_code: 'برای این جنس کد تنظیم نشده است.',
      double_click_to_download: 'دبل کلیک برای دانلود',
      item_details: 'جزئیات جنس',
      item_specs: 'مشخصات جنس',
      brand: 'برند',
      color: 'رنگ',
      generation: 'نسل',
      storage: 'حافظه',
      item_type: 'نوعیت جنس',
      item_type_normal: 'عادی',
      item_type_digital: 'دیجیتال',
      avg_purchase_cost: 'نرخ اوسط خرید',
      add_inventory: 'اضافه کردن به موجودی',
      upload_image: 'آپلود عکس',
      set_sale_price: 'تعیین نرخ فروش',
      reload: 'ریلود',
      inventory_history: 'تاریخچه‌ی موجودی',
      opening_inventory: 'موجودی قبلی',
      purchases_without_warehouse: 'خرید بدون گدام',
      no_inventory: 'هیچ رکوردی نیست.',
      no_matching_inventory: 'هیچ رکوردی با این فیلتر پیدا نشد.',
      vendor: 'فروشنده',
      total: 'مجموع',
      purchase: 'خرید',
      delete_inventory_confirm: 'آیا مطمئن هستید که می‌خواهید این رکورد را حذف کنید؟',
      sell_account_missing: 'حساب فروش کمپنی تنظیم نشده است.',
      unit_cost: 'هزینه واحد',
      capital_account: 'حساب سرمایه',
      image: 'عکس',
      image_required: 'انتخاب عکس حتمی است.',
      item_image_crop_hint:
        'تصویر را مربعی (۱:۱) کراپ کنید. حجم انتخاب محدود نیست؛ هنگام آپلود حداکثر ۲۵۶ کیلوبایت می‌شود.',
      item_image_compress_failed:
        'فشرده‌سازی تصویر به زیر ۲۵۶ کیلوبایت ممکن نشد. تصویر دیگری انتخاب کنید.',
      product_bom_title: 'اجزای تولید',
      product_bom_hint: 'مواد خام لازم برای ساخت یک واحد',
      setup_bom: 'تنظیم اجزا',
      no_bom_components: 'اجزا تنظیم نشده است.',
      clear_all: 'پاک کردن همه',
      clear_bom_confirm: 'همه اجزای تولید پاک شوند؟',
      add_row: 'افزودن ردیف',
      latest: 'آخرین',
      no_records: 'رکوردی یافت نشد.',
      code: 'کد',
      business_profile: 'پروفایل',
      company_subscription_page_title: 'اعتبار و سبسکریپشن‌ها',
      company_subscription_validity: 'اعتبار فعلی',
      company_subscription_history: 'تاریخچه سبسکریپشن‌ها',
      update_logo: 'ویرایش لوگوی کمپنی',
      username: 'نام کاربری',
      company_info: 'مشخصات',
      name_dari: 'نام دری',
      name_pashto: 'نام پشتو',
      name_uzbek: 'نام اوزبیکی',
      name_english: 'نام انگلیسی',
      address_dari: 'آدرس دری',
      address_pashto: 'آدرس پشتو',
      address_uzbek: 'آدرس اوزبیکی',
      address_english: 'آدرس انگلیسی',
      whatsapp: 'واتساپ',
      your_website_link: 'لینک وب سایت شما',
      copy_link: 'کاپی کردن لینک',
      visit_website: 'مشاهده وب سایت',
      copied_success: 'موفقانه کاپی شد!',
      renew: 'تمدید',
      update_company_name: 'ویرایش نام کمپنی',
      name_update_note: 'ویرایش‌های نام شرکت به شکل دائمی ذخیره می‌شود.',
      set_username: 'تنظیم نام کاربری',
      invalid_slug: 'نام کاربری نامعتبر است',
      slug_once_note: 'نام کاربری معمولاً یک‌بار تنظیم می‌شود.',
      update_company_profile: 'تنظیم مشخصات کمپنی',
      drag_and_drop_image: 'تصویر را اینجا رها کنید یا انتخاب نمایید',
      zoom: 'بزرگ‌نمایی',
      payable_amount: 'مبلغ قابل پرداخت',
      insufficient_wallet: 'موجودی بکسک کافی نیست.',
      payment_success: 'پرداخت موفقیت‌آمیز بود.',
      discount: 'تخفیف',
      discount_percent: 'فیصدی تخفیف',
      discount_amount: 'مبلغ تخفیف',
      discount_exceeds_total: 'مبلغ تخفیف نمی‌تواند از مجموع بل بیشتر باشد.',
      company_payment_title: 'پرداخت برای تمدید',
      company_payment_details: 'با انجام این پرداخت، اعتبار کمپنی تمدید می شود.',
      company_payment_note1: 'این پرداخت غیرقابل بازگشت است.',
      company_payment_plan_info_month:
        'شما بسته ماهانه را انتخاب کرده‌اید و اعتبار کمپنی به اندازه یک ماه تمدید می‌شود.',
      company_payment_plan_info_year:
        'برای بسته سالانه، سال اول مطابق نرخ فعلی محاسبه می‌شود و سال‌های بعدی با نرخ عادی و تخفیف ویژه تمدید حساب می‌گردد.',
      company_payment_price_prefix: 'برای این تمدید شما باید',
      company_payment_price_suffix: 'بپردازید.',
      company_payment_note2: 'قبل از پرداخت، موجودی حساب خود را بررسی کنید.',
      renew_duration: 'مدت تمدید را انتخاب کنید',
      annual_base_fee: 'نرخ سالانه',
      original_price: 'مبلغ عادی',
      valid_until_with_renew: 'تاریخ اعتبار با تمدید',
      finalize_payment: 'تکمیل پرداخت',
      payment_mode: 'حالت پرداخت',
      pay_full: 'پرداخت کامل',
      pay_partial: 'پرداخت جزئی',
      pay_remaining: 'باقی‌مانده',
      awaiting_payment: 'در انتظار پرداخت',
      delete: 'حذف',
      quick_sale: 'فروش سریع',
      easy_sale: 'فروش آسان',
      easy_sale_intro: 'برای شروع فروش آسان، یک بل جدید ایجاد کنید.',
      easy_sale_new: 'فروش آسان جدید',
      easy_sale_view: 'نمایش آسان',
      unsaved_sale_leave_title: 'دیتای ذخیره‌نشده',
      unsaved_sale_leave_message:
        'اجناس اضافه‌شده هنوز در دیتابیس ذخیره نشده‌اند. اگر این صفحه را ترک کنید، این اقلام از بل حذف خواهند شد.',
      unsaved_sale_leave_confirm: 'ترک صفحه',
      start_easy_sale: 'شروع فروش آسان',
      easy_sale_pay: 'مقدار پرداخت',
      easy_sale_full_payment_required: 'بدون مشتری، مقدار پرداخت باید دقیقاً برابر مجموع باشد.',
      search_customer: 'جستجوی مشتری...',
      scan_barcode: 'اسکن بارکد',
      camera_permission_required: 'برای اسکن بارکد، اجازه دسترسی به دوربین لازم است.',
      allow_camera: 'اجازه دسترسی به دوربین',
      camera_unavailable: 'دوربین در دسترس نیست. بارکد را دستی وارد کنید.',
      barcode: 'بارکد',
      transfer_to_warehouse: 'انتقال به گدام',
      warehouse: 'گدام',
      complete_items: 'تکمیل اقلام',
      needs_exchange_rate: 'نرخ تبادله لازم است',
      exchange_rate_pair: 'نرخ تبادله ({{from}}) به ({{to}})',
      exchange_rate_direction: 'جهت نرخ تبادله: {{from}} به {{to}}',
      latest_exchange_rate: 'آخرین نرخ تبادله کمپنی',
      sale_step_customer: 'مشتری',
      sale_step_items: 'اجناس',
      sale_step_payment: 'پرداخت',
      sale_step_complete: 'تکمیل',
      next_step: 'مرحله بعد',
      prev_step: 'مرحله قبل',
      expense_fields_list: 'لیست بخش مصارف',
      manage_expense_fields: 'مدیریت بخش مصارف',
      add_expense: 'افزودن مصرف',
      edit_expense: 'ویرایش مصرف',
      expense_list: 'جدول مصارف',
      no_expenses: 'هیچ مصرفی موجود نیست',
      no_expense_fields: 'هیچ بخشی موجود نیست',
      account_code: 'کد بخش',
      account_name: 'نام بخش',
      bill_number: 'نمبر بل',
      spender: 'مصرف کننده',
      creator: 'ایجاد کننده',
      confirm_delete_expense: 'تایید حذف مصرف',
      delete_expense_confirm: 'آیا مطمئن هستید این مصرف را حذف کنید؟ این عملیات برگشت‌ناپذیر است.',
      select_account: 'انتخاب حساب',
      cancel: 'لغو',
      unknown: 'نامشخص',
      invoice_details: 'جزئیات بل',
      invoice_number: 'نمبر بل',
      invoice_summary: 'خلاصه بل',
      paid_amount: 'پرداخت شده',
      remaining_balance: 'باقی',
      previous_remaining: 'باقیات گذشته',
      total_remaining: 'مجموع باقیات',
      paid_amount_covers_previous_hint: 'اگر مبلغ پرداختی بیشتر از مبلغ بل باشد، از باقیات گذشته کم می‌شود.',
      confirm_delete_item_from_invoice: 'آیا این جنس از بل حذف شود؟',
      delete_draft_sale: 'حذف فاکتور (پیش‌نویس)',
      only_draft_deletable: 'فقط فاکتورهای پیش‌نویس قابل حذف‌اند',
      delete_sale_confirm_title: 'تایید حذف فاکتور',
      delete_sale_confirm_message: 'آیا مطمئن هستید که می‌خواهید این فاکتور را حذف کنید؟',
      delete_sale_effects_title: 'با حذف، موارد زیر انجام می‌شود:',
      delete_sale_effects_1: 'تمام ردیف‌های این فاکتور حذف می‌شوند.',
      delete_sale_effects_2: 'موجودی اجناس به‌اندازهٔ مقادیر فروخته‌شده در این فاکتور، به انبار برمی‌گردد.',
      delete_sale_effects_3: 'فقط فاکتورهای پیش‌نویس قابل حذف‌اند (نباید پرداخت/بدهی ثبت شده باشد).',
      delete_sale_effects_4: 'این کار غیرقابل بازگشت است.',
      delete_sale_second_confirm: 'تایید دوم: برای حذف قطعی، دوباره تایید کنید.',
      confirm_delete_step_one: 'متوجه شدم — ادامه',
      confirm_delete: 'بله، حذف شود',
      back_to_edit_sale: 'برگشت به ویرایش',
      confirm_back_to_edit_sale:
        'آیا مطمئن هستید که می‌خواهید این بل را به حالت ویرایش برگردانید؟',
      search_item: 'جستجو به اساس نام جنس',
      search_item_placeholder: 'نام، بارکد یا سریال جنس را جستجو کنید...',
      barcode_scan_placeholder: 'بارکد را اسکن کنید',
      no_matching_items: 'جنسی با این جستجو پیدا نشد.',
      find: 'یافتن',
      item_not_found: 'جنس با این بارکد پیدا نشد.',
      insufficient_stock: 'موجودی کافی نیست.',
      item_sale_price_required: 'قیمت فروش این جنس مشخص نیست. ابتدا قیمت فروش را تعیین کنید.',
      item_purchase_cost_required: 'قیمت خرید معتبر برای این جنس موجود نیست. ابتدا قیمت خرید را ثبت کنید.',
      serial_number: 'سریال نمبر',
      reset_item_price: 'بازگشت به قیمت پیش‌فرض جنس',
      go_to_payment: 'رفتن به پرداخت',
      invoice_rate_missing: 'نرخ تبادله روی فاکتور تنظیم نشده است. ابتدا در مرحله مشتری نرخ را تعیین کنید.',
      payment: 'پرداخت',
      total_payable: 'مجموع مبلغ قابل پرداخت',
      without_customer_payment_hint:
        'این فاکتور بدون مشتری است و با تکمیل، پرداخت به‌صورت کامل ثبت می‌شود.',
      enter_paid_amount: 'مبلغ پرداختی را وارد کنید',
      paid_amount_positive: 'مبلغ پرداختی باید بیشتر از صفر باشد.',
      paid_amount_not_exceed: 'مبلغ پرداختی نمی‌تواند از مجموع بل به‌علاوه باقیات گذشته بیشتر باشد.',
      complete_without_customer: 'تکمیل',
      finalize_full_payment: 'تکمیل با پرداخت کامل',
      finalize_partial_payment: 'تکمیل با مقداری پرداخت',
      finalize_remaining_only: 'تکمیل با باقی کامل',
      add_more_item: 'اضافه کردن جنس دیگر',
      total_items: 'تعداد مجموعی',
      barcode_item_added: 'جنس به بل اضافه شد.',
      dash_price_search: 'نرخ جنس',
      dash_tools: 'تولز',
      dash_price_search_placeholder: 'جستجوی نرخ جنس — نام یا بارکد...',
      dash_price_search_hint: 'نام یا بارکد را تایپ کنید تا نرخ فروش نمایش داده شود.',
      dash_price_not_set: 'نرخ فروش تعیین نشده',
      invoice_empty: 'بل خالی است. ابتدا جنس اسکن کنید.',
      print_invoice: 'چاپ بل',
      print_with_equivalent: 'چاپ با معادل',
      print_invoice_a5: 'چاپ بل A5',
      print_invoice_80mm: 'چاپ بل 80mm',
      download_pdf_a5: 'دانلود PDF A5',
      download_pdf_a4: 'دانلود PDF A4',
      download_pdf_80mm: 'دانلود PDF 80mm',
      download_image_a5: 'دانلود عکس A5',
      download_image_80mm: 'دانلود عکس 80mm',
      payment_receipt: 'رسید پرداخت',
      payment_receipt_number: 'نمبر رسید',
      payment_row_menu: 'گزینه‌های پرداخت',
      invoice_export_failed: 'در آماده‌سازی فایل خروجی مشکل پیش آمد.',
      invoice_saved_to_ishanch: 'فایل در پوشه Hamyan روی دسکتاپ ذخیره شد.',
      customer_name: 'اسم مشتری',
      unit_price: 'قیمت واحد',
      unit_price_short: 'فی',
      price_per_unit: 'قیمت فی واحد',
      total_cost: 'مجموع هزینه',
      ram_capacity: 'RAM',
      storage_capacity: 'حافظه',
      invoice_item_details: 'تفصیلات',
      add_invoice_note: 'افزودن یادداشت',
      edit_invoice_note: 'ویرایش یادداشت',
      invoice_note_placeholder: 'متن یادداشت بل را بنویسید...',
      invoice_note_saved: 'یادداشت ذخیره شد.',
      sale_date: 'تاریخ فروش',
      purchase_date: 'تاریخ خرید',
      date_picker_today: 'امروز',
      date_picker_clear: 'پاک کردن',
      add_staff: 'افزودن کارمند',
      edit_staff: 'ویرایش کارمند',
      no_staff: 'هیچ کارمند موجود نیست.',
      position: 'سمت',
      first_name: 'نام',
      last_name: 'تخلص',
      contract: 'قرارداد',
      contracts: 'قراردادها',
      monthly_salary: 'معاش ماهانه',
      pay_salary: 'پرداخت معاش',
      documents: 'اسناد',
      terminate_contract: 'فسخ قرارداد',
      start_date: 'تاریخ شروع',
      end_date: 'تاریخ ختم',
      termination_date: 'تاریخ فسخ',
      termination_reason: 'دلیل فسخ',
      salary_month: 'ماه معاش',
      payment_date: 'تاریخ پرداخت',
      attachment: 'پیوست',
      hire_date: 'تاریخ استخدام',
      active_contract: 'قرارداد فعال',
      no_active_contract: 'برای پرداخت معاش، قرارداد فعال موجود نیست.',
      payable_to_today: 'قابل پرداخت تا امروز',
      payable_to_end_of_month: 'قابل پرداخت تا ختم ماه',
      payable_to_end_of_contract: 'قابل پرداخت تا ختم قرارداد',
      remaining_to_today: 'باقی تا امروز',
      remaining_to_end_of_month: 'باقی تا ختم ماه',
      remaining_to_end_of_contract: 'باقی تا ختم قرارداد',
      paid_amount_staff: 'پرداخت شده',
      remaining_allowed: 'مبلغ باقی قابل پرداخت',
      add_staff_contract: 'درج قرارداد استخدام',
      edit_staff_contract: 'ویرایش قرارداد استخدام',
      show_active_contract: 'نمایش قرارداد فعال',
      staff_contract: 'قرارداد استخدام',
      no_staff_contract: 'هنوز قرارداد استخدام ثبت نشده است.',
      contract_history: 'قراردادهای کامل‌شده و فسخ‌شده',
      no_contract_history: 'قرارداد ختم‌شده یا فسخ‌شده موجود نیست.',
      salary_payments: 'پرداخت‌های معاش',
      no_salary_payments: 'هیچ پرداخت معاشی ثبت نشده است.',
      add_staff_document: 'درج اسناد',
      no_staff_documents: 'هیچ سندی ثبت نشده است.',
      document_title: 'عنوان',
      file: 'فایل',
      download: 'دانلود',
      created_at: 'ایجاد شده در',
      jalali_equivalent: 'معادل شمسی',
      contract_status_active: 'فعال',
      contract_status_ended: 'ختم شده',
      contract_status_terminated: 'فسخ شده',
      contract_details: 'جزئیات قرارداد',
      this_contract_summary: 'مشخصات کلی این قرارداد',
      contract_settled: 'تصفیه شده است',
      contract_settled_hint: 'برای این قرارداد هیچ باقی قابل پرداخت ثبت نیست.',
      closed_contract_paid: 'برای این قرارداد، مبلغ قابل پرداخت باقی نمانده است.',
      previous_contract_info:
        'قرارداد قبلی پایان یافته یا فسخ شده است؛ اکنون می‌توانید قرارداد جدید درج کنید.',
      active_contract_summary: 'مشخصات کلی قرارداد فعال',
      confirm_delete_salary_payment:
        'آیا مطمئن هستید که این پرداخت معاش حذف شود؟ با حذف آن، مبلغ به حساب کمپنی برگردانده می‌شود.',
      confirm_delete_document: 'آیا مطمئن هستید که این سند حذف شود؟',
      document_title_file_required: 'عنوان و فایل سند را انتخاب کنید.',
      related_contract: 'نمبر قرارداد',
      add_payment_document: 'درج سند پرداخت',
      replace_payment_document: 'تغییر سند پرداخت',
      add_staff_absence: 'درج غیرحاضری',
      absence_date: 'تاریخ غیرحاضری',
      absences: 'غیرحاضری‌ها',
      absence_days: 'روزهای غیرحاضری',
      no_absences: 'هیچ غیرحاضری ثبت نشده است.',
      no_staff_with_active_contract: 'هیچ کارمندی با قرارداد فعال موجود نیست.',
      confirm_delete_absence: 'آیا مطمئن هستید که این غیرحاضری حذف شود؟',
      affiliate_account: 'اکانت افلییت',
      affiliate_dashboard_card_title: 'شما افلییت همیان هستید',
      affiliate_dashboard_card_desc:
        'سهم همکاری، وضعیت حساب و دعوت‌هایی که پس از فعال‌سازی اکانت افلییت انجام داده‌اید را ببینید.',
      affiliate_percentage: 'درصد همکاری',
      affiliate_active: 'فعال',
      affiliate_inactive: 'غیرفعال',
      affiliate_since: 'از تاریخ',
      affiliate_invitations: 'دعوت‌های افلییت',
      affiliate_invitations_hint:
        'فقط دعوت‌هایی که بعد از ایجاد اکانت افلییت ثبت شده‌اند اینجا نمایش داده می‌شوند.',
      affiliate_no_invitations: 'هنوز دعوتی پس از ایجاد اکانت افلییت ثبت نشده است.',
      affiliate_open_page: 'مشاهده صفحه افلییت',
      affiliate_page_title: 'اکانت افلییت',
      affiliate_invite_link: 'لینک دعوت افلییت',
      affiliate_how_title: 'نحوه درآمد افلییت',
      affiliate_how_invite:
        'از هر دعوت موفق، معادل {{amount}} افغانی به دست می‌آورید.',
      affiliate_how_percent:
        'از پرداخت‌های تمام دعوت‌های افلییت خود، فیصدی افلییت را به دست می‌آورید.',
      affiliate_how_example:
        'مثلاً از هر {{base}} افغانی، {{percent}} فیصد = {{amount}} افغانی',
      affiliate_how_wallet:
        'فیصدی‌ها و درآمدهای دعوت به بکسک همیان شما جمع می‌شود و هر زمان قابل برداشت است.',
      affiliate_open_wallet: 'مشاهده بکسک همیان',
      affiliate_apply_title: 'درخواست افلییت همیان',
      affiliate_apply_desc:
        'لینک شبکه‌های اجتماعی خود را بفرستید و بگویید چرا می‌خواهید افلییت همیان باشید.',
      affiliate_apply_form_title: 'فرم درخواست',
      affiliate_apply_social_hint: 'حداقل یک لینک سوشیال مدیا الزامی است.',
      affiliate_apply_unavailable: 'ثبت درخواست افلییت فعلاً در دسترس نیست.',
      affiliate_capacity_full:
        'ظرفیت افلییت تکمیل شده است (حداکثر {{count}} نفر). درخواست جدید پذیرفته نمی‌شود.',
      affiliate_apply_card_title: 'افلییت همیان شوید',
      affiliate_apply_card_desc:
        'با ارسال لینک‌های سوشیال و توضیح انگیزه‌تان، برای اکانت افلییت درخواست دهید.',
      affiliate_apply_card_cta: 'ثبت درخواست افلییت',
      affiliate_apply_card_pending_title: 'درخواست افلییت در حال بررسی',
      affiliate_apply_card_pending_desc: 'درخواست شما ثبت شده و منتظر بررسی است.',
      affiliate_apply_card_pending_cta: 'مشاهده وضعیت درخواست',
      affiliate_social_facebook: 'فیسبوک',
      affiliate_social_instagram: 'اینستاگرام',
      affiliate_social_telegram: 'تلگرام',
      affiliate_social_tiktok: 'تیک‌تاک',
      affiliate_social_youtube: 'یوتیوب',
      affiliate_social_whatsapp: 'واتساپ',
      affiliate_social_other: 'سایر سوشیال',
      affiliate_request_reason: 'چرا می‌خواهید افلییت همیان باشید؟',
      affiliate_request_reason_hint: 'حداقل ۲۰ کاراکتر بنویسید.',
      affiliate_request_reason_placeholder:
        'مثلاً مخاطبان من، تجربه معرفی محصولات، و برنامه‌ام برای معرفی همیان…',
      affiliate_request_submit: 'ارسال درخواست',
      affiliate_request_success: 'درخواست افلییت شما ثبت شد و در حال بررسی است.',
      affiliate_request_status_title: 'وضعیت درخواست',
      affiliate_request_status_pending: 'در حال بررسی',
      affiliate_request_status_approved: 'تأیید شده',
      affiliate_request_status_rejected: 'رد شده',
      affiliate_request_pending_desc: 'پس از بررسی نتیجه به شما اطلاع داده می‌شود.',
      affiliate_request_rejected_desc:
        'این درخواست رد شده است. می‌توانید پس از اصلاح اطلاعات دوباره درخواست دهید.',
      affiliate_request_admin_note: 'یادداشت بررسی',
      affiliate_request_submitted_at: 'ثبت‌شده در {{date}}',
      invitee_page_title: 'نمایش کاربر دعوت‌شده',
      invitee_open_whatsapp: 'ارسال پیام در واتساپ',
      invitee_no_whatsapp: 'شماره واتساپ ثبت نشده است.',
      username_invalid_hint:
        'نام کاربری باید با حرف انگلیسی شروع شود و فقط حروف کوچک، عدد و زیرخط داشته باشد (۳ تا ۳۰ کاراکتر).',
      username_cooldown_rule: 'تغییر نام کاربری هر {{days}} روز یک‌بار مجاز است.',
      username_cooldown_hint: 'تا تغییر بعدی حدود {{days}} روز باقی مانده است.',
      username_updated_success: 'نام کاربری با موفقیت تغییر کرد.',
      username_history: 'تاریخچه تغییر نام کاربری',
      username_history_empty: 'هنوز تغییری برای نام کاربری ثبت نشده است.',
    },
  },
  ps: {
    desktop: {
      app_name: 'همیان',
      brand_slogan: 'د سوداګرۍ مدیریت',
      tagline: 'د سوداګرۍ مدیریت او ودې سیستم',
      login_subtitle: 'د دوام لپاره خپل حساب ته ننوځئ.',
      register_subtitle: 'د پیل لپاره نوی حساب جوړ کړئ.',
      register_subtitle_long:
        'ثبت نام وکړئ ترڅو د همیان شخصي او سوداګریز خدماتو، وسایلو او امکاناتو ته لاسرسی ولرئ.',
      forgot_password_subtitle: 'خپل بریښنالیک ولیکئ ترڅو د پاسورډ د بیاځلي ترلاسه کولو لینک واستول شي.',
      create_account: 'نوی حساب جوړ کړئ',
      already_have_account: 'پخوا مو حساب جوړ کړی؟ ننوتل',
      no_account_yet: 'حساب نلرئ؟ ثبت نام',
      optional: 'اختیاري',
      language_title: 'د اپ ژبه',
      language_fa: 'دری',
      language_ps: 'پښتو',
      language_en: 'English',
      welcome_user: 'ښه راغلاست {{name}}',
      welcome_guest: 'ښه راغلاست',
      welcome_back: 'بیا ښه راغلاست',
      login_heading: 'حساب ته ننوتل',
      login_download_prompt: 'تاسو کولی شئ د ډیسټاپ، اندروید یا iOS اپلیکیشن هم ډاونلوډ کړئ.',
      login_download_link: 'ډاونلوډ پاڼې ته لاړ شئ',
      download_apps: 'اپلیکیشنونه ډاونلوډ',
      download_badge: 'د همیان اپلیکیشنونه',
      download_title: 'د همیان اپلیکیشن ډاونلوډ',
      download_subtitle:
        'د وینډوز ډیسټاپ، اندروید او iOS نسخې ترلاسه کړئ او خپله سوداګري هرچیرې مدیریت کړئ.',
      download_have_account: 'حساب لرئ؟ ننوتون',
      download_also_title: 'پرته له ننوتو هم وګورئ',
      download_windows_title: 'وینډوز (ډیسټاپ)',
      download_windows_desc: 'د وینډوز ۶۴ بټ نصبي نسخه — د کمپیوټر او لپ‌ټاپ لپاره.',
      download_windows_cta: 'د وینډوز لپاره ډاونلوډ',
      download_android_title: 'اندروید',
      download_android_desc: 'د اندروید موبایل اپ د پلورنځي یا مستقیم لینک څخه ترلاسه کړئ.',
      download_android_cta: 'د اندروید لپاره ډاونلوډ',
      download_ios_title: 'iOS',
      download_ios_desc: 'د آیفون او آیپېډ اپ د اپ‌سټور څخه ډاونلوډ کړئ.',
      download_ios_cta: 'د iOS لپاره ډاونلوډ',
      download_coming_soon: 'ډیر ژر',
      home_page_title: 'اصلي پاڼه',
      back_to_home: 'اصلي پاڼې ته بیرته',
      back_to_dashboard: 'ډشبورډ ته بیرته',
      ishanch_whatsapp_label: 'د همیان ملاتړ سره په واتساپ خبرې',
      ishanch_whatsapp_message: 'سلام، زه د همیان ویب‌سایت څخه پیام کوم.',
      home_welcome: 'افغانستان کې د سوداګرۍ د مدیریت ترټولو لوی پلیټفارم ته ښه راغلاست.',
      home_welcome_desc:
        'د همیان سره پیرود، پلور، عواید او مصارف، موجودی او پیرودونکي په یوه ځای کې اداره کړئ.',
      home_users_badge: 'د همیان ټولنه',
      home_users_title: '{{count}} کارنان اوس د همیان سره کار کوي',
      home_users_desc:
        'هره ورځ نورې سوداګرۍ په افغانستان کې همیان ته راځي. تاسو هم وړيا ثبت نام وکړئ او نن یې پیل کړئ.',
      home_users_cta: 'همیان ته راشئ',
      home_help_badge: 'د مرستې مرکز',
      home_help_title: 'د چټک پیل لپاره لارښود او روزنه',
      home_help_desc: 'د سیسټم امکاناتو زده کړې او عامو پوښتنو لپاره د مرستې مرکز وکاروئ.',
      home_help_point1: 'ننوتل، نوم لیکنه او د حساب مدیریت',
      home_help_point2: 'پلور، پیرود، ګودام او مصارف',
      home_help_point3: 'د افغاني سوداګریو لپاره عملي لارښوونې',
      home_help_cta: 'د مرستې مرکز ته لاړ شئ',
      home_affiliate_banner_badge: 'د محدود افیلیټ ډله',
      home_affiliate_banner_title: 'یو ځل بلنه ورکړه، هر کال عاید وکړه',
      home_affiliate_banner_desc:
        'د افیلیټ عاید تلپاتې دی. په افغانستان کې به یوازې {{count}} افیلیټ ولرو.',
      home_affiliate_banner_cta: 'د پیوستون شرطونه',
      public_affiliate_nav: 'افیلیټ',
      public_affiliate_title: 'د همیان افیلیټ',
      public_affiliate_slogan: 'یو ځل بلنه ورکړه، هر کال عاید وکړه',
      public_affiliate_slogan_hint: 'د افیلیټ عاید تلپاتې دی.',
      public_affiliate_seo:
        'یو ځل بلنه ورکړه، هر کال عاید وکړه. د همیان افیلیټ عاید تلپاتې دی — په افغانستان کې یوازې ۱۰۰ افیلیټ.',
      public_affiliate_badge: 'په افغانستان کې یوازې {{count}} کسان',
      public_affiliate_lead:
        'که لیدونکي، ټولنیزې رسنۍ او د همیان د معرفي هیله لرئ، د افیلیټ غړیتوب لپاره غوښتنه وکړئ.',
      public_affiliate_limit:
        'ظرفیت محدود دی: په افغانستان کې به یوازې {{count}} افیلیټ ولرو.',
      public_affiliate_why_1_title: 'د بلنې انعام',
      public_affiliate_why_1_desc:
        'له هرې بریالۍ بلنې، {{amount}} افغانۍ ترلاسه کوئ.',
      public_affiliate_why_2_title: 'له تادیو برخه',
      public_affiliate_why_2_desc:
        'له تادیو د رابلل شویو کسانو هر کال د افیلیټ فیصدي اخلئ — عاید نه پرې کېږي.',
      public_affiliate_why_3_title: 'بکسک ته جمع',
      public_affiliate_why_3_desc:
        'د بلنې عاید او فیصدي ستاسو د همیان بکسک ته جمع کېږي او د ایستلو وړ دي.',
      public_affiliate_how_title: 'څنګه غړی شئ؟',
      public_affiliate_step_1: 'د همیان حساب جوړ کړئ یا ننوځئ.',
      public_affiliate_step_2: 'د ټولنیزو لینکونو او د پیوستون دلیل په فورمه کې واستوئ.',
      public_affiliate_step_3: 'له کتنې وروسته، که تأیید شو، د افیلیټ اکونټ فعالېږي.',
      public_affiliate_cta_guest: 'ثبت نام او پیوستون',
      public_affiliate_cta_auth: 'د افیلیټ غوښتنه واستوئ',
      public_affiliate_cta_login: 'حساب لرئ؟ ننوتل',
      public_affiliate_full_badge: 'ظرفیت بشپړ',
      public_affiliate_full_title: 'د افیلیټ ظرفیت بشپړ شوی دی',
      public_affiliate_full_desc:
        'په افغانستان کې به یوازې {{count}} افیلیټ ولرو او اوسنی ظرفیت بشپړ دی.',
      subscription_pricing_nav: 'د سبسکرپشن نرخونه',
      subscription_pricing_title: 'د سوداګرۍ سبسکرپشن بیه',
      subscription_pricing_seo:
        'د همیان د سوداګرۍ سبسکرپشن کلنی فیس، تخفیف او د ۱ تر ۵ کلونو د ورکړې وړ مبلغ.',
      subscription_pricing_badge: 'رسمي بیه',
      subscription_pricing_lead:
        'اوسنی اصلي فیس او تخفیف وګورئ او د ۱ تر ۵ کلونو مبلغ محاسبه کړئ.',
      subscription_pricing_note:
        'نهایی مبلغ د تمدید پر مهال په پروفایل یا له نمایندګۍ پېر کې پلی کېږي.',
      subscription_pricing_month: '۱ میاشت',
      home_reseller_banner_badge: 'د پلور نمایندګي',
      home_reseller_banner_title: 'د همیان ریسلر شئ',
      home_reseller_banner_desc:
        'له هر پلور {{percent}}٪ ګټه واخلئ. د پیل لپاره لږ تر لږه {{count}} سبسکرپشن وپیرئ.',
      home_reseller_banner_cta: 'څنګه ریسلر شو',
      reseller_nav: 'نمایندګۍ',
      reseller_become_nav: 'ریسلر شئ',
      reseller_view_directory: 'نمایندګۍ وګورئ',
      reseller_title: 'د همیان ریسلر شئ',
      reseller_seo:
        'د همیان ریسلر شئ؛ ۳۰٪ ګټه او لږ تر لږه ۱۰ سبسکرپشن په د نمایندګۍ بیه.',
      reseller_badge: 'د سبسکرپشن د پلور نمایندګي',
      reseller_slogan: 'ریسلر شئ او ۳۰٪ ګټه واخلئ',
      reseller_lead:
        'د نمایندګۍ بسته وپیرئ؛ په اتومات ډول ریسلر کېږئ او د سوداګرۍ سبسکرپشن وپلورئ.',
      reseller_cta_guest: 'ثبت نام او ریسلر شئ',
      reseller_cta_auth: 'بسته وپیرئ او ریسلر شئ',
      reseller_cta_login: 'حساب لرئ؟ ننوتل',
      reseller_how_title: 'څنګه ریسلر شو؟',
      reseller_step_1: 'د همیان حساب جوړ کړئ یا ننوځئ او بکسک چارچ کړئ.',
      reseller_step_2: 'لږ تر لږه ۱۰ سبسکرپشن په د نمایندګۍ بیه وپیرئ؛ ریسلري حساب په اتومات فعالېږي.',
      reseller_step_3: 'فزیکي پته او واتساپ ثبت کړئ او له ریسلر پاڼې سبسکرپشن وپلورئ.',
      reseller_directory_title: 'نمایندګۍ',
      reseller_directory_seo: 'د همیان د پلور نمایندګیو لړۍ له واتساپ او پتې سره.',
      reseller_directory_lead:
        'د خپل کسب‌وکار ډیټابیس فعالولو لپاره کلني پېر، له نږدې نمایندګۍ سره اړیکه ونیسئ او ورته لاړ شئ.',
      reseller_directory_lead_1:
        'د خپل کسب‌وکار ډیټابیس فعالولو لپاره کلني پېر، له نږدې نمایندګۍ سره اړیکه ونیسئ او ورته لاړ شئ.',
      reseller_directory_lead_2:
        'لګښت ورکړئ او همدلته د خپل کسب‌وکار له فعالېدو ډاډ ترلاسه کړئ.',
      reseller_directory_lead_3:
        'که مرستې او لارښوونې ته اړتیا لرئ، یا ستونزه رامنځته شي، له د همیان مدیریت سره اړیکه ونیسئ.',
      reseller_directory_support_whatsapp: 'د همیان واتساپ',
      reseller_directory_empty: 'تر اوسه عامه نمایندګي ثبت شوې نه ده.',
      reseller_directory_empty_filtered: 'په دې ولایت کې نمایندګي ثبت شوې نه ده.',
      reseller_directory_filter: 'د ولایت له مخې فلټر',
      reseller_directory_filter_all: 'ټول ولایتونه',
      reseller_directory_filter_hint: 'له ۳۴ ولایتونو څخه یو وټاکئ ترڅو د هماغه ولایت نمایندګۍ وښودل شي.',
      reseller_directory_whatsapp: 'واتساپ',
      reseller_directory_address: 'پته',
      reseller_why_1_title: '۳۰٪ ګټه',
      reseller_why_1_desc: 'له پلور د هر سبسکرپشن {{percent}}٪ ګټه اخلئ.',
      reseller_why_2_title: 'پیل له ۱۰ سبسکرپشنو',
      reseller_why_2_desc: 'په پیل کې باید لږ تر لږه {{count}} سبسکرپشن وپیرئ.',
      reseller_why_3_title: 'د نمایندګۍ بیه',
      reseller_why_3_desc: 'د واحد لګښت = (فی − تخفیف) منفي {{percent}}٪.',
      reseller_price_title: 'د اوسنۍ بیې محاسبه',
      reseller_fee: 'د کلني سبسکرپشن فیس/لګښت',
      reseller_discount: 'تخفیف',
      reseller_list_price: 'د پیرودونکي بیه (فی − تخفیف)',
      reseller_unit_cost: 'د نمایندګۍ د واحد لګښت',
      reseller_unit_profit: 'له هر پلور ګټه',
      reseller_starter_pack: 'د پیل لګښت ({{count}} واحد)',
      reseller_formula_hint:
        'د واحد لګښت = (فی − تخفیف) منفي {{percent}}٪. لږ تر لږه لومړی پیر ۱۰ واحد دی.',
      reseller_apply_title: 'د پلور نماینده شئ',
      reseller_apply_desc:
        'غوښتنه اړینه نه ده. په تادیه او لږ تر لږه {{count}} سبسکرپشن پېر سره په اتومات ډول نماینده کېږئ.',
      reseller_apply_form_title: 'د غوښتنې فورمه',
      reseller_quantity: 'د پیل لپاره د سبسکرپشن شمېر',
      reseller_min_qty_error: 'لږ تر لږه {{count}} سبسکرپشن اړین دي.',
      reseller_request_reason: 'ولې غواړئ د پلور نماینده شئ؟',
      reseller_reason_placeholder: 'د بېلګې په توګه شبکه، ولایت، او د پلور پلان…',
      reseller_request_submit: 'د نمایندګۍ غوښتنه واستوئ',
      reseller_request_success: 'د نمایندګۍ غوښتنه ثبت شوه او په بررسی کې ده.',
      reseller_request_status_title: 'د نمایندګۍ د غوښتنې حالت',
      reseller_request_pack: '{{count}} واحد — ټول {{amount}} افغانۍ',
      reseller_card_title: 'د همیان ریسلر شئ!',
      reseller_card_desc:
        'لږ تر لږه ۱۰ سبسکرپشن وپیرئ او نماینده شئ. ۳۰ سلنه ګټه واخلئ.',
      reseller_card_cta: 'د نمایندګۍ بسته وپیرئ',
      reseller_card_pending_title: 'د نمایندګۍ غوښتنه په بررسی کې ده',
      reseller_card_pending_desc: 'ستاسو غوښتنه ثبت شوې او د کتنې په تمه ده.',
      reseller_card_pending_cta: 'د غوښتنې حالت وګورئ',
      reseller_charge_title: 'د همیان بکسک چارج',
      reseller_charge_desc:
        'لومړی اړین مبلغ د همیان بکسک ته اضافه کړئ. تر هغه چې بکسک چارج نه وي، د نمایندګۍ بسته نشي پېرل کېدای.',
      reseller_charge_pay:
        'د بکسک د چارج لپاره مبلغ د پی حساب {{pay}} ته واستوئ.',
      reseller_charge_pay_hint: 'د بکسک د چارج لپاره مبلغ لاندې د پی حساب ته واستوئ:',
      reseller_pay_label: 'د همیان پی حساب',
      reseller_charge_receipt: 'د تادیې رسېد د همیان واتساپ ته واستوئ.',
      reseller_charge_after:
        'وروسته له دې چې د همیان بکسک چارج شي، د نمایندګۍ بسته درته فعالېږي او د پلور نماینده کېږئ.',
      reseller_wallet_balance: 'د همیان بکسک موجودي: {{amount}} افغانۍ',
      reseller_receipt_form_title: 'د تادیې رسېد ثبت',
      reseller_receipt_submit: 'رسېد ثبت کړئ',
      reseller_receipt_success: 'رسېد ثبت شو؛ وروسته له تأیید به بکسک چارج شي.',
      reseller_receipt_min: 'لږ تر لږه د واریز مبلغ {{min}} افغانۍ دی.',
      reseller_receipt_pack_amount:
        'د {{count}} سبسکرپشن اکونټ پېر لپاره باید {{amount}} افغانۍ ورکړئ.',
      reseller_buy_title: 'د نمایندګۍ بستې پېر',
      reseller_auto_agent_hint:
        'له بریالي پېر وروسته ستاسو ریسلري حساب جوړېږي او په اتومات ډول د پلور نماینده کېږئ.',
      reseller_buy_submit: 'بسته وپیرئ',
      reseller_buy_success: 'د نمایندګۍ بسته وپېرل شوه. تاسو اوس د پلور نماینده یاست.',
      reseller_buy_need_more:
        'د همیان بکسک د دې بستې لپاره کافي نه دی. د بستې مبلغ {{need}} افغانۍ دی.',
      reseller_buy_disabled_reason:
        'تڼۍ غیر فعاله ده ځکه د همیان بکسک موجودي ({{balance}} افغانۍ) د بستې لګښت ({{need}} افغانۍ) څخه کمه ده. لومړی بکسک چارج کړئ.',
      reseller_pack_cost: 'د دې بستې لګښت: {{amount}} افغانۍ',
      reseller_page_title: 'د پلور د نمایندګۍ حساب',
      reseller_page_desc: 'د ریسلري بکسک موجودي او د هر سبسکرپشن نرخ.',
      reseller_box_balance: 'د ریسلري بکسک موجودي',
      reseller_inventory: 'د واحد موجودي',
      reseller_unit_record_title: 'د هر سبسکرپشن نرخ',
      reseller_customer_charge: 'له پیرودونکي څخه د اخیستلو مبلغ',
      reseller_pays_from_box: 'له ریسلري بکسک څخه تادیه',
      reseller_purchases_title: 'د بستو پېرونه',
      reseller_sales_title: 'د سبسکریپشن پلورونه',
      reseller_sell_cta: 'سبسکریپشن وپلورئ',
      reseller_sell_page_title: 'سبسکریپشن کسب‌وکار ته وپلورئ',
      reseller_sell_page_desc:
        'د کسب‌وکار عامه پېژندونکی ولیکئ، موده وټاکئ او له ریسلري بکسک څخه تادیه وکړئ.',
      reseller_sell_company_id: 'د کسب‌وکار عامه پېژندونکی',
      reseller_sell_search: 'لټون',
      reseller_sell_years: 'موده (کال)',
      reseller_sell_year_option: '{{count}} کال',
      reseller_sell_submit: 'پېرود او فعالول',
      reseller_sell_success: 'سبسکریپشن د کسب‌وکار لپاره ثبت شو.',
      reseller_sell_confirm_title: 'د سبسکریپشن پلور تایید',
      reseller_sell_confirm_desc: 'په تایید سره مبلغ له ریسلري بکسک کمېږي او د کسب‌وکار اعتبار غځېږي.',
      reseller_sell_confirm_submit: 'تایید او تادیه',
      reseller_sell_customer_total: 'د کسب‌وکار لپاره ثبت شوی مبلغ',
      reseller_sell_reseller_pay: 'له ریسلري بکسک څخه تادیه',
      reseller_sell_valid_until: 'اعتبار تر',
      reseller_sell_disabled_reason:
        'د ریسلري بکسک موجودي ({{balance}} افغانۍ) یا واحدونه ({{inventory}}) د دې پلور لپاره بسنه نه کوي. اړتیا: {{need}} افغانۍ او {{years}} واحد.',
      reseller_sale_row: '{{name}} — {{years}} کال — {{amount}} افغانۍ',
      reseller_open_page: 'د نمایندګۍ پاڼه وګورئ',
      reseller_send_whatsapp: 'رسېد په واتساپ واستوئ',
      reseller_buy_more: 'نورې بستې وپیرئ',
      reseller_address_title: 'د نمایندګۍ فزیکي پته',
      reseller_address_desc:
        'د پلور نمایندګۍ لپاره ولایت، ښار/ولسوالی، بشپړه پته او د واتساپ شمېره ثبت کړئ.',
      reseller_address_required: 'د فزیکي پتې ثبت اړین دی.',
      reseller_address_submit: 'پته خوندي کړئ',
      reseller_address_success: 'د نمایندګۍ فزیکي پته ثبت شوه.',
      reseller_province: 'ولایت',
      reseller_province_placeholder: 'ولایت وټاکئ',
      reseller_province_required: 'ولایت وټاکئ.',
      reseller_city_district: 'ښار / ولسوالی',
      reseller_full_address: 'بشپړه پته',
      reseller_whatsapp: 'د واتساپ شمېره',
      reseller_address_edit: 'پته سمون',
      reseller_address_add: 'پته ثبت',
      reseller_buy_confirm_title: 'د نمایندګۍ د بستې پېر تایید',
      reseller_buy_confirm_desc: 'مهرباني وکړئ د پېر جزئیات وګورئ او که موافق یاست تایید یې کړئ.',
      reseller_buy_confirm_terms_hint: 'په تایید سره د همیان د ریسلرۍ شرطونه منئ:',
      reseller_buy_confirm_submit: 'تایید او پېر',
      reseller_confirm_pack_total: 'د بستې لګښت',
      reseller_confirm_wallet: 'د همیان بکسک موجودي',
      reseller_terms_title: 'د ریسلرۍ شرطونه',
      reseller_terms_heading: 'د همیان د پلور نمایندګۍ (ریسلري) شرطونه',
      reseller_terms_intro:
        'د نمایندګۍ بستې په پېر او د ریسلر په توګه فعالیت سره دا شرطونه منئ.',
      reseller_terms_link: 'د ریسلرۍ شرطونه',
      reseller_terms_sections: [
        {
          title: 'د نمایندګۍ فعالول',
          items: [
            'په لږ تر لږه ۱۰ سبسکرپشن پېر سره ریسلري حساب فعالېږي.',
            'له لومړي پېر وروسته راتلونکي پېرونه لږ تر لږه ۵ واحد دي.',
            'د پېر مبلغ د همیان بکسک څخه کمیږي او ریسلري بکسک ته زیاتیږي.',
          ],
        },
        {
          title: 'بیه او ګټه',
          items: [
            'د پیرودونکي بیه د کلني فیس منفي تخفیف ده.',
            'د ریسلر لګښت د پیرودونکي بیه ۷۰٪ دی؛ ګټه ۳۰٪ ده.',
            'بیې ممکن د همیان رسمي فیس سره تازه شي.',
          ],
        },
        {
          title: 'پته او اړیکه',
          items: [
            'د ریسلر لپاره ولایت، ښار/ولسوالی، بشپړه پته او واتساپ ثبت اړین دي.',
            'د اړیکې معلومات باید سم او د لاسرسي وړ وي.',
          ],
        },
        {
          title: 'مسؤلیتونه',
          items: [
            'ریسلر باید د همیان سبسکرپشن په اړه سمه معلومات ورکړي.',
            'ناسم معلومات یا ناسم کار کولی شي حساب وځنډوي.',
            'همیان کولی شي شرطونه تازه کړي؛ همدا پاڼه باوري نسخه ده.',
          ],
        },
      ],
      home_cta_title: 'ایا تاسو یوه یوځای او خوندي ډیټابیس ته اړتیا لرئ؟',
      home_cta_desc:
        'همیان د پلور، مصارف، پیرودونکو، ځانګړې ویبپاڼې او راپورونو لپاره چمتو دی. همدا اوس وړیا پیل وکړئ.',
      home_cta_button: 'وړیا حساب جوړ کړئ',
      home_notice_1: 'آیا آنلاین ډیټابیس ته اړتیا لرئ؟',
      home_notice_2: 'خوندي او تل شتون لرونکی ډیټابیس ولرئ.',
      home_notice_3: 'خپل محصولات او خدمتونه آنلاین اداره کړئ.',
      home_features_title: 'د سیسټم اصلي ځانګړتیاوې',
      home_features_desc: 'همیان تاسو ته کوم امکانات برابروي؟',
      home_feature_1_title: 'د ۵۰ څخه زیاتو سوداګریز ماډلونه مدیریت',
      home_feature_1_desc: 'همیان د هر ډول سوداګرۍ لپاره مناسب دی.',
      home_feature_2_title: 'خوندي او باوري',
      home_feature_2_desc: 'ستاسو معلومات په لوړه امنیت ساتل کیږي.',
      home_feature_3_title: 'دایمي ملاتړ او پرمختګ',
      home_feature_3_desc: 'سیسټم پرله‌پسې تازه کیږي.',
      home_feature_4_title: 'نامحدود حساب او سوداګري',
      home_feature_4_desc: 'هره کارونکی کولی شي څو سوداګرۍ اداره کړي.',
      home_feature_5_title: 'د هرې سوداګرۍ لپاره ځانګړې ویبپاڼه',
      home_feature_5_desc: 'هره سوداګري خپل ځانګړی پاڼه لري.',
      home_feature_6_title: 'ډیسټاپ او موبایل اپلیکیشن',
      home_feature_6_desc: 'په وینډوز، اندروید او iOS کې هم شتون لري.',
      home_footer_copy: 'ټول حقونه ساتل شوي دي.',
      terms: 'شرایط',
      policies: 'پالیسۍ',
      cw_home: 'اصلي پاڼه',
      cw_products: 'محصولات',
      cw_contact: 'اړیکه',
      cw_latest_products: 'نوی محصولات',
      cw_all_products: 'ټول محصولات',
      cw_no_products: 'تر اوسه محصول نه دی ثبت شوی.',
      cw_search_products: 'د محصول لټون...',
      cw_sort_newest: 'نوی‌ترین',
      cw_sort_oldest: 'زوړ',
      cw_sort_price_asc: 'بیه (کم څخه زیات)',
      cw_sort_price_desc: 'بیه (زیات څخه کم)',
      cw_apply: 'پلي کول',
      cw_contact_info: 'د اړیکې معلومات',
      cw_address: 'پته',
      cw_not_available: 'ثبت نه دی',
      cw_not_found: 'سوداګري ونه موندل شوه.',
      cw_related_products: 'اړوند محصولات',
      cw_in_stock: 'په ګودام کې موجود',
      cw_out_of_stock: 'نشته',
      cw_call: 'تماس',
      cw_we_are_here: 'ستاسو په خدمت کې یو',
      cw_category: 'کټګوري',
      cw_order: 'سفارش',
      cw_whatsapp_order_text:
        'سلام، زه د «{{product}}» محصول په اړه نور معلومات غواړم.\n— د همیان څخه\n\n{{url}}',
      cw_call_now: 'فوري تماس',
      cw_share: 'شریکول',
      cw_copy_link: 'لینک کاپي',
      cw_copied: 'کاپي شو!',
      cw_details: 'مشخصات',
      cw_back: 'بیرته',
      cw_email: 'ایمیل',
      cw_map_coming_soon: 'نقشه ډېر ژر',
      cw_afn: 'افغانۍ',
      cw_description: 'توضیحات',
      secure_access: 'خوندي لاسرسی',
      secure_access_hint: 'ستاسو حساب ته باوري ننوتل',
      saved_accounts: 'خوندي شوي حسابونه',
      saved_accounts_hint: 'په ایمیل کلیک وکړئ ترڅو ننوځئ.',
      saved_accounts_quick: 'چټک حساب غوره کول',
      remove_saved_account: 'خوندي حساب حذف کړئ',
      show_saved_accounts: 'خوندي شوي',
      use_another_account: 'نوی حساب سره ننوتل',
      remember_section: 'د ننوتلو تنظیمات',
      save_account_on_device: 'په دې وسیله کې د دې حساب ایمیل او پاسورډ خوندي کړئ',
      join_ishanch: 'همیان سره یوځای شئ',
      register_heading: 'نوی حساب جوړ کړئ',
      enter_email_first: 'لومړی خپل بریښنالیک ولیکئ.',
      send_code: 'کوډ ولېږئ',
      sending_code: 'لېږل کېږي...',
      resend_after: 'بیا لېږل وروسته له',
      seconds_short: 'ثانیو',
      forgot_password_heading: 'پاسورډ بیاځلي ترلاسه کول',
      go_to_register: 'ثبت نام ته لاړ شئ',
      email_verification_code: 'د ایمیل تایید کوډ',
      email_verification_code_invalid: 'د ایمیل تایید کوډ باید 6 عدده وي.',
      send_email_code: 'د تایید کوډ لېږل',
      email_code_sent: 'د ایمیل تایید کوډ ولېږل شو.',
      email_code_send_failed: 'د تایید کوډ لېږل ناکام شول.',
      email_required_for_code: 'لومړی ایمیل ولیکئ.',
      resend_in_seconds: 'بیا لېږل تر {{seconds}} ثانیو',
      debug_code: 'ټیسټ کوډ',
      api_connection_error: 'سرور سره اړیکه نشوه. API وګورئ.',
      offline_banner: 'انټرنیټ ته وصل نه یاست. مهم عملیات تر بیا وصلېدو پورې نه کېږي.',
      offline_operation_blocked: 'انټرنیټ ته وصل نه یاست. دا عملیات نه شي اجرا کېدای.',
      too_many_requests: 'ډېرې غوښتنې ولېږل شوې. لږ انتظار وکړئ او بیا هڅه وکړئ.',
      forbidden: 'تاسو د دې عمل لپاره اړین لاسرسی نه لرئ.',
      auth_invalid_credentials: 'بریښنالیک یا پاسورډ ناسم دی.',
      logout_success: 'په بریالیتوب وتلئ.',
      validation_invalid_data: 'ورودي معلومات ناسم دي.',
      validation_required: '{{field}} اړین دی.',
      validation_email: '{{field}} باید سمه بریښنالیک پته وي.',
      validation_min_string: '{{field}} باید لږ تر لږه {{min}} توري وي.',
      validation_confirmed: 'د {{field}} تایید سمون نه لري.',
      validation_unique: '{{field}} دمخه کارول شوی دی.',
      validation_digits: '{{field}} باید {{digits}} رقمونه وي.',
      generic_request_error: 'غوښتنه ناکامه شوه. بیا هڅه وکړئ.',
      forgot_password_sent_hint: 'د پاسورډ د بدلولو کوډ ستاسو بریښنالیک ته ولېږل شو.',
      forgot_password_code_intro:
        'خپل بریښنالیک ولیکئ، د تایید کوډ واخلئ، بیا په همدې پاڼه نوی پاسورډ تنظیم کړئ.',
      reset_password_heading: 'پاسورډ بدلول',
      reset_password_subtitle: 'خپل نوی پاسورډ ولیکئ.',
      reset_password_success: 'ستاسو پاسورډ په بریالیتوب بدل شو.',
      reset_password_missing_token: 'د بیاځلي تنظیم لینک ناسم دی.',
      change_password_button: 'پاسورډ بدلول',
      current_password: 'اوسنی پاسورډ',
      new_password: 'نوی پاسورډ',
      confirm_password: 'د نوي پاسورډ تایید',
      password_min_length: 'پاسورډ باید لږ تر لږه ۸ توري وي.',
      password_mismatch: 'نوی پاسورډ او تایید یې سره سمون نه لري.',
      password_updated_success: 'پاسورډ په بریالیتوب بدل شو.',
      back_to_login: 'ننوتلو ته لاړ شئ',
      guest_panel_eyebrow: 'د حساب او مدیریت خدمات',
      guest_panel_title: 'د پیل لپاره هر څه چمتو دي',
      guest_panel_badge: 'مسلکي او باوري',
      guest_panel_description:
        'د ورځنیو فعالیتونو ښه مدیریت، د کارونو تعقیب، او د حساب خدماتو اسانه لاسرسی لپاره دلته ننوځئ یا نوی حساب جوړ کړئ.',
      guest_feature_growth_title: 'منظم وده',
      guest_feature_growth_desc: 'د کارونو ښه تعقیب او د سوداګرۍ لپاره روښانه پریکړه.',
      guest_feature_management_title: 'عملي مدیریت',
      guest_feature_management_desc: 'حساب معلوماتو او مهم برخو ته چټک لاسرسی.',
      guest_feature_security_title: 'باوري لاسرسی',
      guest_feature_security_desc: 'نوي او موجوده کاروونکو لپاره خوندي ننوتل او ثبت نام.',
      guest_chip_login: 'د کاروونکو ننوتل',
      guest_chip_register: 'د نوو غړو ثبت نام',
      guest_chip_access: 'د حساب خدماتو لاسرسی',
      dashboard_title: 'ډشبورډ',
      refresh: 'تازه کول',
      logout: 'وتل',
      api_label: 'API اړیکه',
      businesses: 'سوداګرۍ',
      wallet: 'بټوه',
      premium: 'اشتراک',
      profile_status: 'د پروفایل حالت',
      premium_active: 'فعال',
      premium_inactive: 'غیرفعال',
      profile_approved: 'تایید شوی',
      profile_pending: 'د تایید په انتظار',
      companies_list: 'د سوداګریو لست',
      companies_dash_title: 'دلته د خپل کاروبار لست وګورئ.',
      companies_dash_desc:
        'په هر یوه کلیک وکړئ ترڅو اړونده معامله‌ګانو ته لاسرسی ومومئ او معلومات زیات، کم، سمون، چاپ یا PDF کړئ.',
      loading: 'په بارولو کې…',
      no_companies: 'تر اوسه هیڅ سوداګري ثبت شوې نه ده.',
      online_tagline: 'د همیان سرور سره وصل',
      nav_dashboard: 'ډشبورډ',
      nav_profile: 'پروفایل',
      nav_wallet: 'د اولنیش بکسک',
      nav_accounts: 'شخصي حسابونه',
      nav_counterparties: 'معامله‌داران',
      nav_premium: 'ممتاز حساب',
      nav_companies: 'سوداګرۍ',
      nav_notifications: 'خبرتیاوې',
      user_notifications: 'د کارونکي خبرتیاوې',
      business_notifications: 'د سوداګرۍ خبرتیاوې',
      nav_settings: 'تنظیمات',
      nav_help: 'مرکز مرستې',
      help_center: 'مرکز مرستې',
      help_page_welcome: 'د همیان مرکز مرستې ته ښه راغلاست',
      help_videos_intro:
        'لاندې ټولې اختیارونه لارښودونه دي؛ په کلیک سره کولی شئ روزونکي ویډیو وګورئ.',
      help_search_placeholder: 'په عنوان یا کټګوري کې لټون...',
      help_clear_search: 'لټون پاکول',
      help_no_results: 'هیڅ مطلب ونه موندل شو!',
      help_show_video: 'ویډیو ښودل',
      help_back_to_list: 'بیرته مرکز مرستې ته',
      help_no_video: 'د دې لارښود لپاره ویډیو نشته.',
      help_copy_share: 'عنوان، توضیح او لینک کاپي کړئ',
      help_copied: 'کاپي شو!',
      menu: 'مینو',
      nav_back: 'شاته',
      nav_forward: 'مخکې',
      toolbar_aria: 'د ناوبري پټه',
      page_settings_desc: 'د حساب او د اپ د ژبې تنظیمات',
      change_language: 'د ژبې بدلول',
      choose_language: 'خپله ژبه وټاکئ',
      changing_language: 'ژبه بدلېږي...',
      close: 'بندول',
      switching_workspace: 'په {{name}} کې ننوتل...',
      sidebar_business_count: '{{count}} سوداګري',
      sidebar_personal_account: 'شخصي حساب',
      sidebar_user_suffix: 'کاروونکی',
      sidebar_group_trade: 'پېر او پلور',
      sidebar_group_people: 'اشخاص / معامله‌داران',
      sidebar_group_inventory: 'ګودام او توکي',
      sidebar_group_accounts: 'مالي حسابونه',
      sidebar_group_reports: 'راپورونه',
      sidebar_group_expenses: 'لګښتونه',
      other_options: 'نور اختیارونه',
      mark_all_read: 'ټول لوستل شول',
      no_notifications: 'هیڅ خبرتیا نشته.',
      notification: 'خبرتیا',
      view_all_notifications: 'ټول وګورئ',
      note_referralBonus: 'تاسو د نورو خلکو بلنې څخه بالقوه جایزه ترلاسه کړې.',
      note_networkBuilding: 'تاسو د همیان د ټولنې جوړولو کې د مرستې لپاره بالقوه جایزه ترلاسه کړې.',
      note_depositSuccess: 'واریزه په بریالیتوب سره ترسره شوه.',
      note_depositRejected: 'واریزه رد شوه.',
      note_paymentSuccess: 'تادیه په بریالیتوب سره ترسره شوه.',
      note_paymentFailed: 'تادیه ناکامه وه.',
      note_completeYourKyc: 'خپل احراز هویت بشپړ کړئ.',
      note_kycCompletionAsked: 'د احراز هویت بشپړول غوښتل شوي.',
      note_kycAccepted: 'احراز هویت تایید شو.',
      note_kycRejected: 'احراز هویت رد شو.',
      note_BonusApproved: 'بونوس تایید شو.',
      note_DepositApproved: 'ډیپازټ تایید شو.',
      note_marketingBonusApproved: 'د بازار موندنې جایزه ستاسو حساب ته اضافه شوه.',
      note_marketingBonus: 'تاسو بالقوه د بازار موندنې جایزه ترلاسه کړې!',
      page_profile_desc: 'د حساب او پروفایل معلومات',
      page_wallet_desc: 'د اولنیش بکسک موجودي او تاریخچه',
      your_wallet: 'د اولنیش بکسک',
      available_amount: 'د استفادې وړ موجودي',
      wallet_address: 'د اولنیش بکسک پته',
      copy: 'پته کاپي کړئ',
      wallet_transfer: 'د پیسو لیږد',
      wallet_withdraw: 'ایستل',
      wallet_add_money: 'پیسې زیاتول',
      wallet_add_money_title: 'پیسې د همیان بکسک ته زیاتول',
      wallet_add_money_lead:
        'هر مبلغ چې غواړئ دې د پی حساب ته واستوئ، بیا د تادیې سند د همیان واتساپ ته ولېږئ.',
      wallet_add_money_cta: 'پیسې زیاتول',
      bonuses: 'پاداشونه',
      wallet_notes: 'یادښتونه',
      download_card: 'کارت ډاونلوډ',
      downloading_card: 'په ډاونلوډ کې…',
      wallet_history: 'تاریخچه',
      type: 'ډول',
      source: 'سرچینه',
      all: 'ټول',
      credit_in: 'راتلونکی',
      debit_out: 'وتلی',
      no_record_found: 'هیڅ ریکارډ ونه موندل شو',
      gregorian_date_label: 'نیټه (میلادي)',
      recommended: 'وړاندیز شوی',
      activate_premium: 'ممتاز فعالول',
      premium_hero_sub: 'د ممتاز حساب سره غوره امکانات او چټک وده ترلاسه کړئ.',
      premium_price_monthly: 'میاشتني لګښت',
      premium_price_yearly: 'کلني لګښت',
      premium_valid_until: 'ممتاز تر',
      wallet_balance: 'د بکسک موجودي',
      normal_user: 'عادي کاروونکی',
      normal_user_desc: 'بنسټیز امکانات د ورځني مدیریت لپاره.',
      premium_user_desc: 'پرمختللي امکانات د چټکې ودې لپاره.',
      premium_one_month: 'یوه میاشت',
      premium_one_year: 'یو کال',
      premium_charge_note: 'د {{amount}} افغانۍ پیسې به له بکسک څخه کمې شي.',
      premium_activated_success: 'ممتاز حساب په بریالیتوب سره فعال شو.',
      confirm: 'تایید',
      expenses_page: 'لګښتونه',
      expenses_page_desc: 'د شخصي حسابونو ثبت شوي لګښتونه.',
      expense_analysis: 'د لګښتونو تحلیل',
      expense_analysis_desc: 'د لګښت برخو پر بنسټ لنډیز.',
      expense_analysis_premium_note: 'تاسو ممتاز نه یاست؛ تحلیل یوازې د ممتاز لپاره دی.',
      expense_section: 'د لګښت برخه',
      expense_saved_success: 'لګښت په بریالیتوب ثبت شو.',
      go_to_accounts: 'شخصي حسابونو ته',
      become_premium: 'ممتاز شئ',
      quick_links: 'چټک لینکونه',
      dashboard_hero_badge: 'همیان داشبورد',
      dashboard_hero_with_companies: 'خپلې سوداګرۍ له همدې ځایه اداره کړئ.',
      dashboard_hero_without_companies: 'لومړی سوداګري جوړه کړئ.',
      dashboard_businesses_hint: 'د شرکتونو مدیریت',
      dashboard_premium_hint: 'ممتاز کاروونکی',
      dashboard_profile_hint: 'کارن حساب',
      dashboard_premium_banner_title: 'ممتاز فعال کړئ',
      dashboard_premium_banner_desc: 'د غوره امکاناتو او کم محدودیت لپاره ممتاز فعال کړئ.',
      dashboard_premium_banner_action: 'پلانونه وګورئ',
      dashboard_empty_title: 'تر اوسه سوداګري نشته',
      dashboard_empty_desc: 'له مینو څخه سوداګري جوړه کړئ.',
      dashboard_empty_action: 'د سوداګرۍ له جوړولو پیل',
      personal_deals: 'شخصي معاملات',
      last_transactions: 'وروستي تراکنشونه',
      exchange_rates_title: 'د اسعارو نرخونه',
      exchange_rates_subtitle: 'د هر جفت اسعار وروستي نرخونه دلته ښودل کېږي.',
      latest_exchange_rates: 'وروستي د تبادلي نرخونه',
      view_all_exchange_rates: 'ټول وګورئ',
      exchange_one_equals: '۱ {{from}} = {{rate}} {{to}}',
      exchange_calculator_title: 'د اسعارو ماشین حساب',
      exchange_calculator_hint: 'مقدار ولیکئ او اسعار وټاکئ.',
      exchange_pair: 'د اسعارو جوړه',
      exchange_from: 'له',
      exchange_to: 'ته',
      exchange_result: 'نتیجه',
      exchange_no_path: 'نرخ نشته',
      exchange_no_data: 'تر اوسه هیڅ نرخ نه دی ثبت شوی.',
      exchange_rate_label: 'نرخ',
      exchange_examples: 'د بدلون بیلګې',
      exchange_for_amount: 'د',
      last_update: 'وروستی تازه والی',
      note: 'یادښت',
      sarai_rate_note: 'د سرای شهزاده د ورځې نرخ',
      exchange_rate_detail_desc: 'د دې جفت اسعارو جزئیات او تاریخچه.',
      exchange_history: 'د نرخ تاریخچه',
      invalid_gregorian_date: 'میلادي نیټه سمه نه ده.',
      wallet_scroll_hint: 'د نورو اختیارونو لپاره کیڼ او ښي سکрол وکړئ.',
      back_to_wallet: 'بېرته بټوې ته',
      transfer_soon: 'دا برخه ډېر ژر فعاله کېږي.',
      withdraw_soon: 'دا برخه ډېر ژر فعاله کېږي.',
      transfer_conditions: 'د لیږد شرطونه',
      transfer_condition_identity: 'لیږونکی او اخیستونکی باید تایید هویت شوي وي.',
      transfer_condition_premium: 'لیږونکی او اخیستونکی باید ممتاز کاروونکي وي.',
      withdraw_conditions: 'د ایستلو شرطونه',
      withdraw_condition_identity: 'د پیسو ایستلو لپاره تایید هویت حتمي دی.',
      wallet_note_1:
        'ستاسو د بټوې پیسې هر وخت ایستل کېدای شي. هر ځل لږترلږه 500 افغانۍ ایستلی شئ.',
      wallet_note_2:
        'دا پیسې د ممتاز ګډون، کتابونو، روزنیزو بستو او بازار کې کارولی شئ.',
      wallet_note_3: 'همدا راز کولی شئ خپلې پیسې بل چاته ولیږئ.',
      afn: 'افغانۍ',
      page_accounts_desc: 'څو اسعارې حسابونه او معاملات',
      create_user_accounts: 'شخصي حسابونه جوړول',
      user_accounts_not_activated: 'ستاسو شخصي حسابونه لا فعال نه دي.',
      create_user_account_guide: 'د شخصي حساب په جوړولو سره خپل لګښتونه او معاملات اداره کولی شئ.',
      choose_trade_currencies_note: 'خپل اسعار وټاکئ، بیا به شخصي حسابونه فعال شي.',
      premium_currency_lock_note: 'تاسو اوس ممتاز نه یاست؛ یوازې افغانۍ حساب ښودل کېږي.',
      premium_template_select_note: 'د ممتاز کاروونکو لپاره ټول تمپلیټونه د انتخاب وړ دي.',
      select_at_least_one_template: 'لږترلږه یو تمپلیټ وټاکئ.',
      no_account_templates: 'هیڅ حساب تمپلیټ ونه موندل شو.',
      premium_accounts_hidden_note: 'تاسو ممتاز نه یاست؛ یوازې افغانۍ حساب ښودل کېږي.',
      account_card_click_hint: 'د جزئیاتو لپاره په هر حساب کلیک وکړئ.',
      more_details: 'نور جزئیات',
      personal_accounts_guide: 'د شخصي حسابونو لارښود',
      cp_transactions_guide: 'د راتلو او تلو لارښود',
      cp_incoming: 'راتلل له',
      cp_outgoing: 'تلل ته',
      add_funds: 'زیاتول',
      withdraw: 'ایستل',
      search_counterparty: 'معامله‌دار لټون',
      counterparty: 'معامله‌دار',
      description: 'تشریح',
      premium_account_progress: 'ستاسو د حسابونو شمېر',
      transaction_click_hint: 'د جزئیاتو لپاره په هره معامله کلیک وکړئ.',
      deposit_added: 'واریز',
      deposit_detail: 'د معاملې جزئیات',
      afn_only_operation_note: 'د زیاتولو او ایستلو لپاره یوازې افغانۍ حساب کیږي.',
      premium_can_select_account: 'تاسو ممتاز یاست؛ خپل حساب وټاکلی شئ.',
      confirm_delete_title: 'د حذف تایید',
      confirm_delete_text: 'ایا ډاډه یاست چې حذف یې کړئ؟',
      balance_details: 'د بیلانس جزئیات',
      current_balance: 'اوسنی موجودي',
      personal_account_description: 'دا موجودي ستاسو شخصي حساب ته اړه لري او د سوداګرۍ حسابونو نه جلا دی.',
      delete_account_warning: 'خبرتیا: د حساب حذف بیرته نه کېږي.',
      delete_account: 'حساب حذف',
      delete_account_success: 'شخصي حساب په بریالیتوب سره حذف شو.',
      account_has_tx_delete_blocked: 'دا حساب معاملات لري او حذف کېدای نه شي.',
      confirm_delete_account_text: 'ایا ډاډه یاست چې دا حساب حذف کړئ؟',
      personal_accounts_guide_intro: 'شخصي حسابونه د شخصي پیسو لپاره دي او د سوداګرۍ نه جلا دي.',
      guide_create_account: 'حساب جوړول: د تمپلیټ پر بنسټ حسابونه فعالېږي.',
      guide_balance_meaning: 'بیلانس: د هر کارت موجودي په هماغه اسعارو کې ده.',
      guide_add_withdraw: 'زیاتول/ایستل: سملاسي بیلانس تازه کوي.',
      guide_transactions: 'معاملات: په کلیک سره جزئیات وګورئ.',
      guide_delete_account: 'حذف: یوازې که معامله نه لري.',
      guide_premium: 'ټول اسعار بې له ممتاز حسابه کارېږي. معامله‌داران تر ۳۰ پورې دي.',
      cp_guide_intro: 'دا برخه د معامله‌دارانو سره د پیسو تګ راتګ لپاره ده.',
      cp_guide_incoming: 'راتلل له: کله چې له معامله‌دار پیسې اخلی.',
      cp_guide_outgoing: 'تلل ته: کله چې معامله‌دار ته پیسې ورکوئ.',
      cp_guide_account: 'په حساب پورې تړلی: هره معامله پر یوه شخصي حساب ثبتېږي.',
      cp_guide_balance: 'پاتې/طلب د هر حساب او هر اسعارو لپاره جلا حسابېږي.',
      page_counterparties_desc: 'شخصي معامله‌داران',
      counterparty_free_limit_note:
        'په عادي حالت کې یوازې لومړي 30 معامله‌داران ښودل کېږي. د ټولو لپاره ممتاز حساب فعال کړئ.',
      counterparty_add_locked_note:
        'په عادي حالت کې له 30 وروسته د نوي معامله‌دار زیاتول ممتاز حساب غواړي.',
      premium_counterparty_add_open: 'ممتاز حساب فعال دی؛ زیاتول تل پرانیستی دی.',
      counterparty_transactions: 'راتلل او تلل',
      baqi_talab_meaning:
        'لارښود: که پاتې وي، تاسو پور لرئ؛ که طلب وي، معامله‌دار تاسو ته پور لري.',
      counterparty_count_label: 'د معامله‌دارانو شمېر',
      balance_or_talab: 'پاتې / طلب',
      talab: 'طلب',
      baqi: 'پاتې',
      settled: 'تصفیه',
      edit_counterparty: 'معامله‌دار سمون',
      no_counterparties: 'هیڅ معامله‌دار ونه موندل شو.',
      counterparty_details: 'د معامله‌دار جزئیات',
      counterparty_not_found: 'معامله‌دار ونه موندل شو.',
      total_outgoing: 'ټول تلل',
      total_incoming: 'ټول راتلل',
      page_companies_desc: 'د سوداګریو لست او جوړول',
      save_changes: 'بدلونونه خوندي کړئ',
      create_business: 'سوداګري جوړه کړئ',
      add_counterparty: 'معامله‌دار اضافه کړئ',
      search: 'لټون',
      balance: 'موجودي',
      amount: 'مقدار',
      status: 'حالت',
      date: 'نیټه',
      name: 'نوم',
      lastname: 'تخلص',
      email: 'بریښنالیک',
      phone: 'تلیفون',
      currency: 'اسعار',
      active: 'فعال',
      inactive: 'غیرفعال',
      create: 'جوړول',
      business_name: 'د سوداګرۍ نوم',
      business_type: 'د سوداګرۍ ډول',
      parent_company: 'اصلي شرکت',
      none: 'نشته',
      transactions: 'معاملات',
      deposits: 'واریزونه',
      referrals: 'معرفي شوي',
      saved_success: 'په بریالیتوب سره خوندي شو.',
      save: 'خوندي کول',
      processing: 'په پروسس کې...',
      edit: 'سمون',
      profile_photo: 'د پروفایل عکس',
      update_profile_photo: 'د پروفایل عکس سمون',
      update_profile_info: 'د پروفایل معلوماتو سمون',
      choose_photo: 'عکس وټاکئ',
      choose_another_photo: 'بل عکس وټاکئ',
      avatar_crop_hint: 'عکس په مربع (۱:۱) کراپ کړئ. وروستی حجم تر ۱۵۰ کیلوبایټ پورې کمېږي.',
      avatar_compress_failed: 'د عکس کمپریس تر ۱۵۰ کیلوبایټ ممکن نشو. بله عکس وټاکئ.',
      no_file_selected: 'هیڅ فایل نه دی ټاکل شوی.',
      info_upload_success: 'په بریالیتوب ثبت شو.',
      email_change_note: 'که بریښنالیک بدل کړئ، بیا تایید اړین دی.',
      identity_details: 'د هویت جزئیات',
      whatsapp_number: 'د واټساپ شمېره',
      identity_number: 'د تذکرې شمېره',
      id_scan_front: 'د تذکرې مخ اسکین',
      id_scan_back: 'د تذکرې شا اسکین',
      id_scan_crop_hint:
        'عکس د تذکرې کارت په تناسب کراپ کړئ. د ټاکل شوي فایل حجم محدود نه دی؛ په پورته کولو کې تر ۵۱۲ کیلوبایټ پورې کمېږي.',
      id_scan_compress_failed: 'د عکس کمپریس تر ۵۱۲ کیلوبایټ ممکن نشو. بله عکس وټاکئ.',
      no_image: 'بې عکس',
      status_approved: 'تایید شوی',
      status_rejected: 'رد شوی',
      status_requested: 'غوښتنه شوې',
      status_pending: 'په انتظار',
      request_review: 'د کتنې غوښتنه',
      confirm_request_review_title: 'د کتنې غوښتنې تایید',
      confirm_request_review_note: 'په غوښتنه سره ستاسو د هویت معلومات د کتنې لپاره استول کیږي.',
      request_sent: 'ستاسو غوښتنه ولېږل شوه.',
      send_request: 'غوښتنه واستوئ',
      user_id: 'د کارن پېژند',
      copy_user_id: 'کاپي',
      copied: 'کاپي شو',
      public_user_id_note:
        'یادښت: دا آي ډي عامه ده. د ملګرو په بلنه کولای شئ عاید ترلاسه کړئ. همدا اوس بلنه پیل کړئ.',
      your_invite_link: 'ستاسو د بلنې لینک',
      copy_invite_link: 'د بلنې لینک کاپي',
      visit_public_profile: 'عامه پروفایل وګورئ',
      invitation_message:
        'سلام! که دوکان لرئ، د افغانستان تر ټولو لوی آنلاین مدیریت سیستم ته ورشئ او سوداګري اسانه مدیریت کړئ. همدارنګه د نورو په رابللو عاید ترلاسه کولی شئ. د ثبت نام لپاره زما د بلنې لینک وکاروئ: :link',
      your_community_count: 'ستاسو ټولنه: {{count}} تنه',
      no_referrals_yet: 'تر اوسه مو څوک نه دي رابللي!',
      jalali_date: 'افغانستاني لمریز نیټه',
      gregorian_date: 'میلادي نیټه',
      gregorian_equivalent: 'میلادي معادل',
      click_for_gregorian: 'د میلادي نیټې لپاره کلیک وکړئ',
      local_timezone_note: 'وخت د ستاسو محلي وخت په اساس ښودل کیږي.',
      sidebar_open: 'سایډبار پرانیستل',
      sidebar_close: 'سایډبار تړل',
      sidebar_switch_account: 'حساب بدلول',
      syncing: 'همغږي کیږي…',
      company: 'شرکت',
      company_dashboard: 'د سوداګرۍ ډشبورډ',
      company_dashboard_desc: 'د دې سوداګرۍ د وضعیت لنډیز',
      company_inactive_alert:
        'سیسټم د ({{company}}) لپاره غیرفعال دی. د سیسټم د فعالولو لپاره، کالنی پیسې ورکړئ. که نه نو تاسو به نشئ کولی روزانه معلومات دننه کړئ.',
      company_id: 'د سوداګرۍ پېژند',
      copy_company_id: 'کاپي',
      public_company_id_note:
        'په عامو مواردو، له ریسلرانو پېر، او نورو اختیارونو کې کارېږي.',
      valid_until: 'تر دې نېټې اعتبار',
      valid_date: 'اعتبار',
      company_validity: 'د سوداګرۍ اعتبار',
      enter_business: 'سوداګرۍ ته ننوتل',
      customers: 'پیرودونکي',
      vendors: 'پلورونکي',
      staff: 'کارکوونکي',
      company_accounts: 'حسابونه',
      warehouses: 'ګدامونه',
      warehouse_inventory: 'د ګدام موجودي',
      warehouse_transfers: 'د ګدام لیږدونه',
      warehouse_transfer_records: 'د توکو د لیږد ریکارډونه',
      new_transfer: 'نوی لیږد',
      no_transfer_records: 'د لیږد ریکارډ ونه موندل شو.',
      no_warehouse_inventory: 'موجودي ونه موندل شوه.',
      all_locations: 'ټول ځایونه',
      all_warehouses: 'ټول ګدامونه',
      company_sales_center_full: 'د پلور مرکز (شرکت)',
      from_warehouse: 'له ګدام څخه',
      to_warehouse: 'ګدام ته',
      location: 'ځای',
      available: 'موجود',
      item_required: 'د توکي ټاکنه لازمي ده.',
      today_date: 'ننۍ نیټه',
      transfer: 'لیږد',
      transfer_type: 'ډول',
      transfer_route: 'لاره',
      warehouse_to_warehouse: 'ګدام ته ګدام',
      warehouse_to_company: 'ګدام څخه د پلور مرکز ته',
      company_to_warehouse: 'د پلور مرکز څخه ګدام ته',
      company_sales_center: 'د پلور مرکز',
      transfer_reversed: 'بیرته شوی',
      delete_transfer: 'لیږد حذف',
      confirm_delete_transfer: 'دا لیږد حذف/بیرته شي؟',
      item: 'توکی',
      add_warehouse: 'ګدام زیاتول',
      edit_warehouse: 'ګدام سمول',
      delete_warehouse: 'ګدام حذف',
      confirm_delete_warehouse: 'ایا ډاډه یاست چې دا ګدام حذف کړئ؟',
      warehouse_has_items_not_deletable:
        'ګدام توکي لري او حذفېدای نه شي. لومړی توکي له ګدامه وباسئ.',
      insert: 'درج',
      sale: 'پلور',
      sales: 'پلورونه',
      expenses: 'لګښتونه',
      cash_deposits: 'نغدي تزریقات',
      cash_withdrawals: 'برداشتونه',
      items: 'توکي',
      items_products: 'توکي / محصولات',
      daily_sales_report: 'د ورځني پلور راپور',
      profit_report: 'د ګټې راپور',
      profit_loss_report: 'د ګټې او تاوان راپور',
      journal: 'ورځپاڼچه',
      journal_detail: 'تشریح',
      journal_balance: 'بیلانس',
      journal_time: 'وخت',
      no_journal_on_date: 'په دې نېټه هیڅ معامله نه ده ثبت شوې.',
      partners: 'شریکان',
      coming_soon: 'ډېر ژر',
      items_sold: 'پلورل شوي توکي',
      qty_sold: 'پلورل شوی مقدار',
      invoices_count: 'د بلونو شمېر',
      day_sales_total: 'د ورځې ټول پلور',
      day_profit_total: 'د ورځې ټوله ګټه',
      total_sales: 'ټول پلور',
      total_purchases: 'ټول پېرود',
      search_sales_hint: 'د پیرودونکي یا بل شمېرې له مخې لټون',
      search_purchases_hint: 'د پلورونکي یا بل شمېرې له مخې لټون',
      avg_unit_price: 'اوسط د واحد بیه',
      profit_per_unit: 'د واحد ګټه',
      no_sales_on_date: 'په دې نېټه پلور نه دی ثبت شوی.',
      gross_profit_note:
        'یادښت: د دې پاڼې ارقام ناخالصه ګټه ښيي. خالصه ګټه به په راپور ګټه/تاوان کې وښودل شي.',
      from_date: 'له نېټې',
      to_date: 'تر نېټې',
      view_separate: 'جلا ننداره',
      show_merged: 'یوځای ننداره',
      view_by_invoice: 'د بل پر بنسټ ننداره',
      print_pdf: 'چاپ/PDF',
      sale_account: 'د پلور اکونټ',
      sale_cost: 'د پلور لګښت',
      sale_cost_capital: 'د پلور لګښت په سرمایه کې',
      purchase_cost_capital: 'د پیرود لګښت په سرمایه کې',
      profit_in_sale_account: 'ګټه په د پلور اکونټ',
      profit_in_capital_account: 'ګټه په د سرمایې اکونټ',
      sale_invoice: 'د پلور بل',
      sold_quantity: 'پلورل شوې شمېره',
      raw_materials: 'خام مواد',
      productions: 'تولیدات',
      item_categories: 'د توکو کټګورۍ',
      add_category: 'کټګوري زیاتول',
      edit_category: 'کټګوري سمول',
      delete_category_confirm_title: 'د کټګورۍ د حذف تایید',
      delete_category_confirm_message: 'ایا ډاډه یاست چې دا کټګوري حذف شي؟',
      delete_category_detach_warning:
        'کټګوري «{{name}}» {{count}} اړوند توکي لري. د حذف په تایید سره به د دغو توکو کټګوري تشه شي. آیا دوام ورکوئ؟',
      confirm_detach_and_delete_category: 'هو، جلا کړه او حذف يې کړه',
      purchases: 'پیرودونه',
      activity_logs: 'د همیان دیده‌بان',
      activity_logs_subtitle:
        'په دې صفحه کې یوازې د شرکت د بدلونونو ساده او د پوهېدو وړ لنډیز ښودل کیږي.',
      activity_logs_search_placeholder: 'د کارونکي نوم، بریښنالیک یا برخه',
      no_activity_logs: 'د ښودلو لپاره هیڅ لاګ و نه موندل شو.',
      activity_log_fallback: 'نوی بدلون ثبت شو',
      activity_entity_fallback: 'معلومات',
      date_from: 'له نېټې',
      date_to: 'تر نېټې',
      clear_filters: 'پاکول',
      apply_filters: 'فلټر',
      previous: 'مخکې',
      next: 'راتلونکی',
      model: 'ماډل',
      related: 'اړوند',
      business: 'سوداګري',
      website: 'ویبپاڼه',
      view_all: 'ټول وګورئ',
      cash: 'نغدي',
      bank: 'بانک',
      etc: 'نور',
      capital: 'اصلي سرمایه',
      sell_account: 'د پلور حساب',
      account: 'حساب',
      company_accounts_cash_bank: 'حسابونه / نغدي او بانک',
      dash_today: 'نن',
      dash_month: 'دا میاشت',
      dash_other: 'نور',
      dash_today_details: 'د نن ورځې معاملاتو لنډیز',
      dash_month_details: 'د میاشتې معاملاتو لنډیز',
      dash_other_details: 'نور مهم معلومات',
      receivables: 'د ترلاسه کولو وړ حسابونه',
      payables: 'د ورکولو وړ حسابونه',
      out_of_stock: 'نژدې تمام',
      out_of_stock_items: 'ختم شوي توکي',
      low_stock_items: 'د خبرداری په حد توکي',
      no_accounts_yet: 'تر اوسه هیڅ حساب نه دی جوړ شوی.',
      no_transactions: 'هیڅ معامله ونه موندل شوه.',
      credit: 'آمد',
      debit: 'رفت',
      tx_purchase_payment: 'د پېرود تادیه',
      tx_purchase_reopen: 'د پېرود بیا پرانیستل',
      tx_purchase: 'پېرود',
      tx_sale_invoice_payment: 'د خرڅلاو بل تادیه',
      tx_sale_invoice_reopen: 'د خرڅلاو بل بیرته ستنیدنه',
      tx_sale_reopen: 'د پلور بیرته ستنیدنه',
      tx_cash_deposit: 'د پیسو زیاتوالی',
      tx_cash_withdraw: 'د پیسو ایستل',
      tx_customer_general_payment: 'د پیرودونکي ترلاسه کول',
      tx_customer_payment_reversal: 'د پیرودونکي تادیې بیرته ستنیدنه',
      tx_vendor_general_payment: 'پلورونکي ته تادیه',
      tx_vendor_prepayment_return: 'د پلورونکي مخکې تادیې بیرته',
      tx_vendor_payment_reversal: 'د پلورونکي تادیې بیرته ستنیدنه',
      tx_vendor_negative_payment_reversal: 'د پلورونکي منفي تادیې بیرته',
      tx_staff_salary_payment: 'د کارمند معاش تادیه',
      tx_staff_salary_payment_reversal: 'د معاش تادیې بیرته ستنیدنه',
      tx_expense: 'لګښت',
      tx_expense_updated: 'د لګښت سمون',
      tx_expense_updated_reversal: 'د لګښت سمون بیرته ستنیدنه',
      tx_expense_deleted_reversal: 'د لګښت حذف بیرته ستنیدنه',
      tx_transfer_in: 'دې حساب ته انتقال',
      tx_transfer_out: 'له دې حسابه انتقال',
      currency_afn: 'افغانۍ',
      currency_usd: 'ډالر',
      currency_eur: 'یورو',
      currency_irr: 'تومان',
      currency_pkr: 'کلدار',
      currency_gbp: 'پونډ',
      currency_aed: 'درهم',
      currency_try: 'لیر',
      currency_cny: 'یوآن',
      currency_inr: 'روپۍ',
      currency_sar: 'سعودي ریال',
      total_accounts: 'ټول حسابونه',
      hint_click_account: 'د جزئیاتو لپاره په کارت کلیک وکړئ.',
      account_transactions: 'د حساب معاملات',
      account_details: 'د حساب جزئیات',
      account_type: 'د حساب ډول',
      note_account_locked: 'یادښت: اصلي سرمایه او د پلور حساب وروسته له ټاکلو نه بدلېږي.',
      create_account_permanent_note:
        'پام: نوم حساب وروسته سمول کېږي. حذف یوازې هغه وخت کېږي چې حساب هیڅ معامله ونه لري.',
      create_account_capital_sell_note:
        'د سرمایې او پلور حسابونه جلا کېدای شي (لکه سرمایه په ډالر او پلور په افغانۍ) یا دواړه په یوه حساب وي.',
      create_account_confirm_warn:
        'مهرباني وکړئ لاندې معلومات وګورئ. نوم وروسته سمول کېږي؛ ډول او اسعار نه بدلیږي.',
      confirm_create_account_title: 'د حساب د جوړولو تایید',
      confirm_create_account: 'هو، جوړ شي',
      transfer_between_accounts: 'د حسابونو ترمنځ لېږد',
      transfer_from_account: 'له حسابه',
      transfer_to_account: 'حساب ته',
      transfer_same_currency_only: 'لېږد یوازې د ورته اسعارو حسابونو ترمنځ کېږي.',
      transfer_need_two_accounts: 'د لېږد لپاره لږ تر لږه دوه ورته اسعارو حسابونه پکار دي.',
      transfer_success: 'لېږد ثبت شو.',
      transfer_insufficient_balance: 'د مبدأ حساب موجودي کافي نه ده.',
      account_transfers: 'لېږدونه',
      no_account_transfers: 'تر اوسه د حسابونو ترمنځ لېږد نه دی ثبت شوی.',
      delete_account_transfer: 'لېږد حذف',
      confirm_delete_account_transfer: 'ایا ډاډه یاست چې دا لېږد حذف کړئ؟',
      confirm_delete_account_transfer_warn:
        'په تایید سره د مبدأ او مقصد حسابونو موجودي د دې لېږد نه مخکې حالت ته راګرځي.',
      account_transfer_deleted: 'لېږد حذف شو او موجودي پخواني حالت ته راوګرځېدې.',
      edit_account_name: 'د نوم سمون',
      account_name_updated: 'د حساب نوم تازه شو.',
      company_account_deleted: 'حساب حذف شو.',
      account_card_menu: 'د حساب اختیارونه',
      show_inactive_accounts: 'غیرفعال حسابونه',
      hide_inactive_accounts: 'غیرفعال حسابونه',
      confirm_deactivate_account:
        'دا حساب غیرفعال شي؟ له اصلي لیسته پټېږي او د نويو معاملاتو لپاره نه ټاکل کېږي.',
      account_deactivated: 'حساب غیرفعال شو.',
      account_activated: 'حساب فعال شو.',
      cannot_deactivate_capital_or_sell: 'د سرمایې او پلور حسابونه غیرفعال کېدای نه شي.',
      cannot_deactivate_with_balance: 'هغه حساب چې بیلانس لري غیرفعال کېدای نه شي.',
      deposit_to_account: 'حساب ته پیسې اضافه کول',
      withdraw_from_account: 'له حسابه ایستل',
      cash_added_successfully: 'په بریالیتوب اضافه شو.',
      cash_withdrawn_successfully: 'په بریالیتوب وایستل شو.',
      confirm_delete_cash_movement: 'ایا ډاډه یاست چې دا تزریق/ایستل حذف کړئ؟ بیلانس تازه کېږي.',
      cash_movement_deleted: 'معامله په بریالیتوب سره حذف شوه.',
      remark: 'یادښت',
      select: 'وټاکئ',
      set_as_capital: 'د اصلي سرمایې په توګه ټاکل',
      set_as_sell: 'د پلور حساب په توګه ټاکل',
      balance_after: 'وروسته بیلانس',
      balance_before: 'مخکې بیلانس',
      transaction_details: 'د معاملې جزئیات',
      registered_by: 'ثبت کوونکی',
      transaction_number: 'د معاملې شمېره',
      related_source: 'اړوند سند',
      no_related_document: 'معلومات نشته.',
      company_dashboard_loading_hint: 'ماليصیل لنډیز به د داشبورډ API تر فعالېدو وروسته دلته ښکاره شي.',
      quick_access: 'چټک لاسرسی',
      company_modules_hint: 'له سایډبار څخه د سوداګرۍ برخو ته لاړ شئ. ځینې ماډیولونه به ژر فعال شي.',
      module_coming_soon: 'دا برخه به ژر په ډیسکټاپ کې فعاله شي.',
      business_status: 'د سوداګرۍ وضعیت',
      business_status_hint: 'د پلورنځي، تولیدي او خدماتي حالتونه له دې برخې فعال یا غیرفعال کړئ.',
      business_status_description:
        'د پلورنځي، تولیدي او خدماتي حالتونه دلته مدیریت کړئ. د بیا فعالولو لپاره د تایید کوډ د مالک بریښنالیک ته ځي.',
      manage_business_status: 'د سوداګرۍ وضعیت مدیریت',
      company_user_access: 'د شرکت کاروونکو لاسرسی',
      company_user_access_hint: 'هغه کاروونکي وګورئ چې دې شرکت ته لاسرسی لري او نوی لاسرسی تعریف کړئ.',
      access_roles_guide_title: 'د لاسرسي رولونو تشریح',
      access_roles_guide_subtitle: 'د لاسرسي ورکولو مخکې د هر کاروونکي لپاره مناسب رول له دې لیست څخه وټاکئ.',
      access_role_badge: 'د لاسرسي رول',
      owner_full_access_note: 'مالک تل بشپړ لاسرسی لري او له دې لیست څخه نه حذفېږي.',
      manage_user_access: 'د کاروونکو لاسرسی مدیریت',
      parent_company_link: 'له اصلي شرکت سره نښلول',
      parent_company_link_hint: 'که دا سوداګري فرعي وي، له دې برخې اصلي شرکت وټاکئ.',
      manage_parent_company: 'اصلي شرکت تنظیم',
      data_purge_title: 'د شرکت ټولې ډیټا پاکول',
      data_purge_hint: 'دا عمل د شرکت ټول معلومات په بشپړ او نه راګرځېدونکي ډول ړنګوي.',
      data_purge_warning:
        'خبرداری: له تایید وروسته د شرکت عملیاتي ډیټا ړنګېږي او بیرته نه راځي. د شرکت ریکارډ او ګډون تادیات پاتې کېږي.',
      data_purge_done: 'د شرکت ډیټا په بریالیتوب پاک شوه.',
      go_data_purge: 'د پاکولو چک‌پوینت ته لاړ شه',
      confirm_data_purge: 'د ډیټا پاکول تایید',
      return: 'شاته',
      store_mode_full: 'د پلورنځي حالت',
      store_mode_description: 'په فعال حالت کې پلور، موجودي او توکي ښکاره کېږي.',
      store_mode_active_hint: 'د پلورنځي امکانات فعال دي.',
      production_mode_full: 'د تولید حالت',
      production_mode_description: 'په فعال حالت کې د تولید امکانات فعالېږي.',
      production_mode_active_hint: 'د تولید امکانات فعال دي.',
      service_mode_full: 'د خدماتو حالت',
      service_mode_description: 'په فعال حالت کې د خدماتو امکانات فعالېږي.',
      service_mode_active_hint: 'د خدماتو امکانات فعال دي.',
      code_will_send_to: 'د تایید کوډ دې بریښنالیک ته ځي',
      send_verification_code: 'د تایید کوډ ولېږئ',
      verification_code: 'د تایید کوډ',
      verification_code_sent: 'د تایید کوډ ستاسو بریښنالیک ته واستول شو.',
      verification_code_required: 'د تایید کوډ باید ۶ عددونه وي.',
      resend_code: 'بیا ولېږئ',
      resend_in: 'بیا لیږل تر',
      activate: 'فعالول',
      deactivate: 'غیرفعالول',
      capability_activated: 'په بریالیتوب فعال شو.',
      capability_deactivated: 'په بریالیتوب غیرفعال شو.',
      add_user_access: 'نوی لاسرسی اضافه کړئ',
      edit_user_access: 'لاسرسی سمول',
      delete_user_access: 'لاسرسی ړنګول',
      confirm_delete_access: 'لاسرسی ړنګول لپاره',
      owner_password: 'د مالک پټنوم',
      role: 'رول',
      role_owner: 'اصلي خاوند',
      company_role_title_owner: 'اصلي مالک',
      company_role_description_owner:
        'ټولو برخو ته بشپړ لاسرسی، له ریکارډونو حذفولو، د کاروونکو لاسرسي مدیریت، له اصلي شرکت سره نښلولو او د شرکت ډیټا پاکولو سره.',
      company_role_title_admin: 'اډمین',
      company_role_description_admin:
        'بشپړ لاسرسی له ډېټا حذفولو سره. مالک نه شي لرې کولی، شرکت له اصلي شرکت سره نه شي نښلولای، او د شرکت معلومات نه شي پاکولی (یوازې مالک).',
      company_role_title_manager: 'منیجر',
      company_role_description_manager:
        'د ورځني عملیاتو بشپړ لاسرسی پرته له ریکارډونو حذفولو، پرته له د کاروونکو لاسرسي مدیریت، او د اډمین له محدودیتونو سره.',
      company_role_title_sales_full_manager: 'د پلور عمومي منیجر',
      company_role_description_sales_full_manager:
        'خرڅلاو او پېرود د منیجر له محدودیتونو سره اداره کولی شي؛ راپورونه نه شي لیدلی او ریکارډونه نه شي حذف کولی.',
      company_role_title_sales_manager: 'د پلور منیجر',
      company_role_description_sales_manager: 'خرڅلاو جوړ او اداره کولی شي، خو ریکارډونه نه شي حذف کولی.',
      company_role_title_accountant: 'محاسب',
      company_role_description_accountant:
        'حسابونه، لګښتونه، معاش تادیات او مالي راپورونه اداره کولی شي، پرته له لاسرسي تنظیماتو، تخریبي حذف او تخریبي سوداګریزو تنظیماتو.',
      company_role_title_analyser: 'شنونکی',
      company_role_description_analyser: 'یوازې د پېرود، خرڅلاو، لګښتونو او معاش تادیاتو د لیدلو اجازه لري.',
      company_role_title_hr: 'بشري سرچینې',
      company_role_description_hr: 'یوازې د کارکوونکو مدیریت ته محدود دی او ریکارډونه نه شي حذف کولی.',
      granted_by: 'ورکړل شوی له',
      existing_access: 'موجود لاسرسی',
      current_parent_company: 'اوسنی اصلي شرکت',
      parent_already_linked: 'دا شرکت لا له اصلي شرکت سره نښتی دی.',
      child_companies: 'فرعي شرکتونه',
      has_children_no_parent: 'ځکه چې فرعي شرکت لري، نشي کولی بل اصلي شرکت وټاکي.',
      select_parent_company: 'اصلي شرکت وټاکئ',
      connect_parent_company: 'له اصلي شرکت سره ونښلول',
      confirm_parent_connect: 'ایا له دې اصلي شرکت سره د نښلولو ډاډه یاست؟',
      no_parent_options: 'د اصلي شرکت لپاره مناسب شرکت ونه موندل شو.',
      add_slider_image: 'د سلایډر انځور اضافه کړئ',
      existing_slider_images: 'ثبت شوي انځورونه',
      slider: 'سلایډر',
      no_data: 'هیڅ مورد نشته.',
      no_file: 'هیڅ فایل نه دی ټاکل شوی.',
      drag_and_drop: 'انځور کش کړئ یا کلیک وکړئ',
      upload_failed: 'د انځور اپلوډ کې ستونزه.',
      deleted_success: 'په بریالیتوب ړنګ شو.',
      confirm_delete_slider: 'ایا ډاډه یاست چې دا د سلایډر انځور ړنګ کړئ؟',
      store_mode: 'پلورنځی',
      production_mode: 'تولیدي',
      address: 'پته',
      filter_all: 'ټول',
      add_customer: 'پیرودونکی زیاتول',
      add_vendor: 'پلورونکی زیاتول',
      search_by_name: 'د نوم له مخې لټون',
      receivables_summary: 'د پیرودونکو څخه د ترلاسه کولو وړ مجموعه',
      payables_summary: 'پلورونکو ته د ورکړې وړ مجموعه',
      by_currency: 'د اسعارو پر بنسټ',
      no_receivables_summary: 'د ترلاسه کولو وړ مبلغ ثبت شوی نه دی.',
      no_payables_summary: 'د ورکړې وړ مبلغ ثبت شوی نه دی.',
      no_customers: 'هیڅ پیرودونکی نشته.',
      no_matching_customers: 'په دې نوم هیڅ پیرودونکی ونه موندل شو.',
      no_matching_vendors: 'په دې نوم هیڅ پلورونکی ونه موندل شو.',
      no_vendors: 'هیڅ پلورونکی نشته.',
      company_name: 'د شرکت نوم',
      action: 'عمل',
      view: 'کتل',
      more: 'نور',
      total_count: 'شمېر',
      tip_receivables: 'پاتې تاوان د حساب پر بنسټ ښودل کېږي.',
      tip_payables: 'پاتې تاوان د اسعارو/حساب پر بنسټ ښودل کېږي.',
      has_receivable: 'د ترلاسه کولو وړ پاتې لري',
      has_payable: 'پاتې لري',
      customer_setup: 'د پیرودونکي معلومات تنظیمول',
      vendor_setup: 'د پلورونکي معلومات تنظیمول',
      back: 'بیرته',
      customer_details: 'د پیرودونکي جزئیات',
      vendor_details: 'د پلورونکي جزئیات',
      personality: 'شخصیت',
      personality_human: 'حقیقي',
      personality_company: 'حقوقي',
      set_previous_receivables: 'پخوانۍ پاتې تاوان ټاکل',
      set_previous_payables: 'پخوانۍ پاتې تاوان تنظیمول',
      previous_balance_mode: 'د پاتې ثبت ډول',
      add_previous_balance: 'پاتې زیاتول',
      set_previous_balance: 'پاتې تنظیمول',
      add_previous_balance_hint:
        'داخل شوی مبلغ د همدې حساب پر اوسنۍ پاتې اضافه کېږي. بېلګه: که پاتې ۵۰۰ وي او ۱۰۰۰ ووهئ، پاتې ۱۵۰۰ کېږي.',
      set_previous_balance_hint:
        'د همدې حساب پاتې د داخل شوي مبلغ سره اصلاح کېږي، زیاتېږي نه. بېلګه: که پاتې ۵۰۰ وي او ۱۰۰۰ ووهئ، پاتې ۱۰۰۰ کېږي نه ۱۵۰۰.',
      current_account_remaining: 'د دې حساب اوسنۍ پاتې',
      remaining_after_save: 'پاتې وروسته له ذخیره',
      remaining_cannot_be_negative: 'پاتې نشي منفي کېدای.',
      general_payment: 'د پیرودونکي تادیه',
      customer_payment_signed_hint:
        'مثبت مبلغ = د پیرودونکي ترلاسه کول (حتی له پاتې څخه زیات → سوداګري پیرودونکي ته پورېږي)؛ منفي مبلغ = پیرودونکي ته تادیه (له دخل کمېږي او پاتې زیاتېږي).',
      payment_to_customer: 'پیرودونکي ته تادیه',
      business_owes_customer: 'پیرودونکي ته پوروړی',
      vendor_general_pay: 'پلورونکي ته تادیه',
      vendor_payment_signed_hint:
        'مثبت مبلغ = پلورونکي ته تادیه؛ منفي مبلغ = د مخکې تادیې بیرته ورکړه.',
      prepayment: 'مخکې تادیه',
      debt_history: 'د پاتې تاوان تاریخچه',
      customer_payables_records: 'د پیرودونکي د پاتې ریکارډونه',
      customer_payments_list: 'د پیرودونکي د تادیاتو لیست',
      customer_purchases: 'د پیرودونکي پېرونه',
      vendor_purchases: 'له پلورونکي پېرونه',
      invoice_total: 'ټوله لګښت',
      remaining_amount: 'پاتې',
      item_rows: 'د توکو ردیفونه',
      vendor_payables_records: 'د پلورونکي د پاتې ریکارډونه',
      vendor_payments_list: 'د پلورونکي د تادیاتو لیست',
      no_payables_records: 'هیڅ ریکارډ ثبت شوی نه دی.',
      previous_amount: 'پخوانی مبلغ',
      change_amount: 'بدلون',
      new_amount: 'نوی مبلغ',
      confirm_delete_payment_title: 'د تادیې د حذف تایید',
      confirm_delete_payment_body:
        'ایا ډاډه یاست چې دا تادیه حذف کړئ؟ دا عمل بیرته نه کېږي او د پیرودونکي پاتې همدومره زیاتیږي.',
      payment_linked_to_invoice: 'له فاکتور سره تړلی - نه شي حذف کېدای',
      payment_linked_to_purchase: 'له پیرود سره تړلی - نه شي حذف کېدای',
      debt_reason_manualSetup: 'لاسي تنظیم',
      debt_reason_vendorPayment: 'پلورونکي ته تادیه',
      debt_reason_vendorPaymentReversal: 'د پلورونکي تادیې بیرته',
      payments: 'تادیات',
      no_payments: 'هیڅ تادیه ثبت شوې نه ده.',
      finalized: 'بشپړ شوی',
      draft: 'مسوده',
      no_sales: 'هیڅ پلور نشته.',
      load_more: 'نور',
      loading_more: 'په بارولو کې…',
      no_purchases: 'هیڅ پیرود نشته.',
      no_items: 'هیڅ توکی نشته.',
      add_purchase: 'پیرود زیاتول',
      create_purchase: 'پیرود جوړول',
      purchase_number: 'د پیرود شمېره',
      incomplete: 'نابشپړ',
      complete: 'بشپړ',
      complete_purchase: 'پیرود بشپړول',
      vendor_name: 'د پلورونکي نوم',
      not_assigned: 'نه دی ټاکل شوی',
      warehouse_locked_after_items: 'د توکو له زیاتولو وروسته ګدام نه شي بدلېدای.',
      full_auto_payment_no_vendor:
        'دا پیرود پرته له پلورونکي دی؛ د تادیې په تڼۍ به ټوله اندازه بشپړه تادیه شي.',
      perform_payment: 'تادیه ترسره کول',
      barcode_not_found: 'په دې بارکوډ توکی ونه موندل شو.',
      barcode_placeholder: 'بارکوډ سکین یا دننه کړئ...',
      type_to_search_item: 'لومړی ولټوئ ترڅو لیست ښکاره شي.',
      vendor_required: 'پلورونکی وټاکئ.',
      exchange_rate_required: 'سم د تبادلې نرخ ولیکئ.',
      warehouse_required: 'اړین ګدام وټاکئ.',
      company_account: 'د کمپنۍ اکونټ',
      sale_bill_currency: 'د دې بل د خرڅلاو اسعار',
      continue: 'ادامه',
      delete_draft_purchase: 'د مسودې پیرود حذف',
      delete_purchase_confirm_title: 'د پیرود حذف تایید',
      delete_purchase_confirm_message: 'ایا ډاډه یاست چې دا پیرود حذف کړئ؟',
      delete_purchase_effects_title: 'په حذف سره دا کارونه کېږي:',
      delete_purchase_effects_1: 'ټول توکي له دې پیروده لرې کېږي.',
      delete_purchase_effects_2: 'د توکو موجودي د دې پیرود په اندازه کميږي.',
      delete_purchase_effects_3: 'یوازې مسوده پیرودونه حذف کېږي.',
      delete_purchase_effects_4: 'دا عمل بیرته نه کېږي.',
      confirm_back_to_edit_purchase: 'ایا ډاډه یاست چې دا بل بیرته ایډیټ ته راوګرځوئ؟',
      reopen_purchase_for_edit: 'بل بیرته ایډیټ ته',
      serial_required: 'سریال نمبر اړین دی.',
      price_required: 'د واحد بیه سمه نه ده.',
      quantity_required: 'مقدار سم نه دی.',
      equivalent: 'معادل',
      nothing_to_pay: 'د تادیې لپاره هیڅ نه پاتې دی.',
      no_warehouses: 'فعال ګدام نشته.',
      search_vendor_placeholder: 'د پلورونکي نوم سره لټون...',
      select_item: 'توکی وټاکئ',
      required_field: 'دا ساحه لازمي ده.',
      without_customer: 'پرته له پیرودونکي',
      without_vendor: 'پرته له پلورونکي',
      exchange_rate: 'د تبادلې نرخ',
      add_item: 'توکی زیاتول',
      add_raw_material: 'خام مواد زیاتول',
      download_items_excel_template: 'د اکسل فارمټ ډاونلوډ',
      export_items_excel: 'اکسل صادرات',
      import_items_excel: 'له اکسله واردول',
      importing_items_excel: 'په واردولو کې…',
      items_excel_import_success: '{{count}} توکي په بریالیتوب سره وارد شول.',
      items_excel_import_partial: '{{imported}} وارد شول؛ {{failed}} قطارونه تېروتنه لري.',
      no_raw_materials: 'هیڅ خام مواد نشته.',
      no_matching_items_filter: 'په دې فلټر هیڅ توکی ونه موندل شو.',
      search_by_code: 'د کوډ له مخې فلټر',
      all_categories: 'ټولې کټګورۍ',
      no_category: 'پرته له کټګورۍ',
      all_inventory_locations: 'ټوله موجودي (شرکت + ګدام)',
      company_stock_only: 'یوازې د شرکت موجودي',
      all_inventory: 'ټوله موجودي',
      zero_inventory: 'یوازې صفر موجودي',
      positive_inventory: 'یوازې له صفر زیاته',
      sort_default: 'اصلي ترتیب',
      sort_stock_high_to_low: 'موجودي: زیاته تر کمه',
      sort_stock_low_to_high: 'موجودي: کمه تر زیاته',
      filters: 'فلټرونه',
      inventory_summary: 'د موجودۍ لنډیز',
      inventory_purchase_value_total: 'د توکو ټول ارزښت مخکې له پلور',
      total_inventory_quantity: 'د موجودۍ ټول شمېر',
      company_stock: 'شرکت',
      warehouse_stock: 'ګدام',
      capital_currency_missing: 'د ارزښت ښودلو لپاره د سرمایې حساب وټاکئ.',
      inventory_valuation_partial: 'د ځینو توکو ارزښت د نرخ یا بیه نشتون له امله حساب نه شو.',
      stock_status_legend: 'د موجودۍ نښې تشریح',
      in_stock_status: 'توکی موجود دی',
      low_stock_alert: 'موجودي د خبرداری حد ته رسېدلې',
      out_of_stock_alert: 'د دې توکي موجودي ختمه شوې',
      purchase_cost: 'د پیرود لګښت',
      inventory_value_capital: 'د موجودۍ ارزښت په د سرمایې اسعارو',
      sale_price_label: 'د پلور بیه',
      inventory: 'موجودي',
      show_barcode: 'بارکوډ ښودل',
      confirm_delete_item: 'توکی حذف',
      confirm_delete_item_body: 'ایا ډاډه یاست چې دا توکی حذف کړئ؟ دا عمل بیرته نه کېږي.',
      not_deletable: 'نه شي حذف کېدای',
      item_category: 'کټګوري',
      unit_label: 'واحد',
      unit_small: 'کوچنی واحد (اساسي)',
      unit_medium: 'منځنی واحد',
      unit_large: 'لوی واحد',
      unit_to_base_qty: 'معادل کوچني واحد',
      unit_scale_hint: 'موجودي تل په کوچني واحد ذخیره کېږي. منځنی او لوی اختیاري دي.',
      measure_unit: 'د اندازې واحد',
      quantity: 'شمېر',
      price: 'بیه',
      inventory_purchase_value_capital: 'د موجودۍ ارزښت په د سرمایې اسعارو',
      minimum_stock_level: 'د خبرتیا لپاره لږترلږه موجودي',
      show_on_website: 'عمومي (په ویب‌سایت کې ښودل کېږي)',
      yes: 'هو',
      no: 'نه',
      average_cost_history: 'د اوسط نرخ تاریخچه',
      download_item_card: 'د عکس په توګه ډاونلوډ',
      no_code: 'د دې توکي لپاره کوډ نه دی ټاکل شوی.',
      double_click_to_download: 'د ډاونلوډ لپاره دوه ځلې کلیک',
      item_details: 'د توکي جزئیات',
      item_specs: 'د توکي مشخصات',
      brand: 'برانډ',
      color: 'رنګ',
      generation: 'نسل',
      storage: 'حافظه',
      item_type: 'د جنس ډول',
      item_type_normal: 'عادي',
      item_type_digital: 'ډیجیټل',
      avg_purchase_cost: 'د پیرود اوسط نرخ',
      add_inventory: 'موجودۍ ته زیاتول',
      upload_image: 'عکس اپلوډ',
      set_sale_price: 'د پلور نرخ ټاکل',
      reload: 'ریلوډ',
      inventory_history: 'د موجودۍ تاریخچه',
      opening_inventory: 'پخوانۍ موجودي',
      purchases_without_warehouse: 'پرته له ګدامه پیرود',
      no_inventory: 'هیڅ ریکارډ نشته.',
      no_matching_inventory: 'له دې فلټر سره هیڅ ریکارډ ونه موندل شو.',
      vendor: 'پلورونکی',
      total: 'مجموع',
      purchase: 'پیرود',
      delete_inventory_confirm: 'ایا ډاډه یاست چې دا ریکارډ حذف کړئ؟',
      sell_account_missing: 'د شرکت د پلور حساب نه دی تنظیم شوی.',
      unit_cost: 'د واحد لګښت',
      capital_account: 'د سرمایې حساب',
      image: 'عکس',
      image_required: 'د عکس ټاکنه حتمي ده.',
      item_image_crop_hint:
        'عکس په مربع (۱:۱) کراپ کړئ. د ټاکل شوي فایل حجم محدود نه دی؛ په پورته کولو کې تر ۲۵۶ کیلوبایټ پورې کمېږي.',
      item_image_compress_failed: 'د عکس کمپریس تر ۲۵۶ کیلوبایټ ممکن نشو. بله عکس وټاکئ.',
      product_bom_title: 'د تولید برخې',
      product_bom_hint: 'د یو واحد جوړولو لپاره اړین خام مواد',
      setup_bom: 'برخې تنظیم',
      no_bom_components: 'برخې نه دي تنظیم شوي.',
      clear_all: 'ټول پاکول',
      clear_bom_confirm: 'ټولې د تولید برخې پاکې شي؟',
      add_row: 'کرښه زیاتول',
      latest: 'وروستی',
      no_records: 'ریکارډ ونه موندل شو.',
      code: 'کوډ',
      business_profile: 'پروفایل',
      company_subscription_page_title: 'اعتبار او سبسکرپشنونه',
      company_subscription_validity: 'اوسنی اعتبار',
      company_subscription_history: 'د سبسکرپشنونو تاریخچه',
      update_logo: 'د شرکت لوګو سمون',
      username: 'کارن نوم',
      company_info: 'مشخصات',
      name_dari: 'دري نوم',
      name_pashto: 'پښتو نوم',
      name_uzbek: 'ازبکي نوم',
      name_english: 'انګلیسي نوم',
      address_dari: 'دري پته',
      address_pashto: 'پښتو پته',
      address_uzbek: 'ازبکي پته',
      address_english: 'انګلیسي پته',
      whatsapp: 'واټساپ',
      your_website_link: 'ستاسو د ویب‌سایت لینک',
      copy_link: 'لینک کاپي کول',
      visit_website: 'ویب‌سایت کتل',
      copied_success: 'په بریالیتوب کاپي شو!',
      renew: 'تمدید',
      update_company_name: 'د شرکت نوم سمون',
      name_update_note: 'د شرکت د نوم بدلونونه دایمي خوندي کېږي.',
      set_username: 'د کارن نوم تنظیم',
      invalid_slug: 'کارن نوم ناسم دی',
      slug_once_note: 'کارن نوم معمولاً یو ځل تنظیمېږي.',
      update_company_profile: 'د شرکت مشخصات تنظیم',
      drag_and_drop_image: 'انځور دلته واچوئ یا وټاکئ',
      zoom: 'زوم',
      payable_amount: 'د ورکړې وړ مبلغ',
      insufficient_wallet: 'د بټوې موجودي کافي نه ده.',
      payment_success: 'تادیه بریالۍ وه.',
      discount: 'تخفیف',
      discount_percent: 'د تخفیف فیصدي',
      discount_amount: 'د تخفیف مبلغ',
      discount_exceeds_total: 'د تخفیف مبلغ باید له ټول بل څخه زیات نه وي.',
      company_payment_title: 'د تمدید لپاره تادیه',
      company_payment_details: 'په دې تادیه سره د شرکت اعتبار تمدیدېږي.',
      company_payment_note1: 'دا تادیه بیرته نه کېږي.',
      company_payment_plan_info_month:
        'تاسو میاشتنی بسته ټاکلې ده او د شرکت اعتبار یوه میاشت تمدیدېږي.',
      company_payment_plan_info_year:
        'د کلني بسته لپاره لومړی کال د اوسني نرخ له مخې محاسبه کېږي او پاتې کالونه د عادي نرخ او ځانګړي تخفیف سره.',
      company_payment_price_prefix: 'د دې تمدید لپاره باید',
      company_payment_price_suffix: 'وپردازی.',
      company_payment_note2: 'مخکې له تادیې، د حساب موجودي وګورئ.',
      renew_duration: 'د تمدید موده وټاکئ',
      annual_base_fee: 'کلنی نرخ',
      original_price: 'عادي مبلغ',
      valid_until_with_renew: 'د اعتبار نېټه له تمدید سره',
      finalize_payment: 'تادیه بشپړول',
      payment_mode: 'د تادیې حالت',
      pay_full: 'بشپړه تادیه',
      pay_partial: 'جزئی تادیه',
      pay_remaining: 'پاتې',
      awaiting_payment: 'د تادیې په تمه',
      delete: 'ړنګول',
      quick_sale: 'چټک پلور',
      easy_sale: 'اسانه پلور',
      easy_sale_intro: 'د اسانه پلور لپاره نوی بل جوړ کړئ.',
      easy_sale_new: 'نوی اسانه پلور',
      easy_sale_view: 'اسانه لید',
      unsaved_sale_leave_title: 'ناببرمه شوې ډیټا',
      unsaved_sale_leave_message:
        'زیات شوي توکي لا هم په ډیټابیس کې نه دي خوندي. که دا پاڼه پرېږدئ، دا اقلام له بل څخه ړنګېږي.',
      unsaved_sale_leave_confirm: 'پاڼه پرېښودل',
      start_easy_sale: 'اسانه پلور پیل',
      easy_sale_pay: 'د ورکړې اندازه',
      easy_sale_full_payment_required: 'له مشتري پرته، ورکړه باید له ټول مبلغ سره برابره وي.',
      search_customer: 'د پیرودونکي لټون...',
      scan_barcode: 'بارکوډ سکین',
      camera_permission_required: 'د بارکوډ سکین لپاره د کامرې اجازه اړینه ده.',
      allow_camera: 'د کامرې اجازه ورکړئ',
      camera_unavailable: 'کمره شتون نلري. بارکوډ په لاس ولیکئ.',
      barcode: 'بارکوډ',
      transfer_to_warehouse: 'ګودام ته لیږدول',
      warehouse: 'ګودام',
      complete_items: 'توکي بشپړول',
      needs_exchange_rate: 'د تبادلې نرخ اړین دی',
      exchange_rate_pair: 'د تبادلې نرخ ({{from}}) ته ({{to}})',
      exchange_rate_direction: 'د تبادلې نرخ لوری: {{from}} ته {{to}}',
      latest_exchange_rate: 'د کمپنۍ وروستی د تبادلې نرخ',
      sale_step_customer: 'پیرودونکی',
      sale_step_items: 'توکي',
      sale_step_payment: 'تادیه',
      sale_step_complete: 'بشپړول',
      next_step: 'راتلونکی مرحله',
      prev_step: 'مخکینۍ مرحله',
      expense_fields_list: 'د لګښت برخو لیست',
      manage_expense_fields: 'د لګښت برخو مدیریت',
      add_expense: 'لګښت زیاتول',
      edit_expense: 'لګښت سمول',
      expense_list: 'د لګښتونو جدول',
      no_expenses: 'هیڅ لګښت نشته',
      no_expense_fields: 'هیڅ برخه نشته',
      account_code: 'د برخې کوډ',
      account_name: 'د برخې نوم',
      bill_number: 'د بل شمېره',
      spender: 'لګښت کوونکی',
      creator: 'جوړونکی',
      confirm_delete_expense: 'د لګښت د حذف تایید',
      delete_expense_confirm: 'ایا ډاډه یاست چې دا لګښت حذف کړئ؟ دا عمل بیرته نه راګرځي.',
      select_account: 'حساب ټاکل',
      cancel: 'لغوه',
      unknown: 'نامعلوم',
      invoice_details: 'د بل جزئیات',
      invoice_number: 'د بل شمېره',
      invoice_summary: 'د بل لنډیز',
      paid_amount: 'تادیه شوی',
      remaining_balance: 'پاتې',
      previous_remaining: 'پخوانۍ پاتې',
      total_remaining: 'ټول پاتې',
      paid_amount_covers_previous_hint: 'که تادیه له مبلغ بل زیاته وي، له پخوانۍ پاتې څخه کمېږي.',
      confirm_delete_item_from_invoice: 'آیا دا توکی له بله لرې شي؟',
      delete_draft_sale: 'د مسودې بل حذف',
      only_draft_deletable: 'یوازې مسوده بلونه حذف کېږي',
      delete_sale_confirm_title: 'د بل د حذف تایید',
      delete_sale_confirm_message: 'آیا ډاډه یاست چې دا بل حذف کړئ؟',
      delete_sale_effects_title: 'په حذف سره دا کارونه کېږي:',
      delete_sale_effects_1: 'د دې بل ټولې کرښې حذف کېږي.',
      delete_sale_effects_2: 'د خرڅو شویو توکو شمېر بیرته پانګې ته ورګرځي.',
      delete_sale_effects_3: 'یوازې مسوده بلونه حذف کېږي.',
      delete_sale_effects_4: 'دا عمل نه بیرته کېږي.',
      delete_sale_second_confirm: 'دویم تایید: د قطعي حذف لپاره بیا تایید کړئ.',
      confirm_delete_step_one: 'پوه شوم — دوام',
      confirm_delete: 'هو، حذف شي',
      back_to_edit_sale: 'بیرته سمون ته',
      confirm_back_to_edit_sale: 'ایا ډاډه یاست چې دا بل بیرته د سمون حالت ته راوګرځوئ؟',
      search_item: 'د توکي نوم سره لټون',
      search_item_placeholder: 'نوم، بارکوډ یا سیریل ولټوئ...',
      barcode_scan_placeholder: 'بارکوډ سکین کړئ',
      no_matching_items: 'په دې لټون کې توکی ونه موندل شو.',
      find: 'موندل',
      item_not_found: 'په دې بارکوډ توکی ونه موندل شو.',
      insufficient_stock: 'موجودي کافي نه ده.',
      item_sale_price_required: 'د دې توکي د پلور بیه نه ده ټاکل شوې. لومړی د پلور بیه وټاکئ.',
      item_purchase_cost_required: 'د دې توکي د پېرود باوري بیه نشته. لومړی د پېرود بیه ثبت کړئ.',
      serial_number: 'سریال نمبر',
      reset_item_price: 'د توکي اصلي قیمت ته بیرته',
      go_to_payment: 'تادیې ته تلل',
      invoice_rate_missing: 'د تبادلې نرخ په بل کې نه دی ټاکل شوی. لومړی په پیرودونکي مرحله کې نرخ وټاکئ.',
      payment: 'تادیه',
      total_payable: 'د تادیې ټوله اندازه',
      without_customer_payment_hint:
        'دا بل له پیرودونکي پرته دی او په بشپړولو سره تادیه په بشپړه توګه ثبتېږي.',
      enter_paid_amount: 'د تادیې اندازه ولیکئ',
      paid_amount_positive: 'د تادیې اندازه باید له صفره زیاته وي.',
      paid_amount_not_exceed: 'د تادیې اندازه نشی کولی له مبلغ بل او پخوانۍ پاتې زیاته شي.',
      complete_without_customer: 'بشپړول',
      finalize_full_payment: 'بشپړول له بشپړې تادیې سره',
      finalize_partial_payment: 'بشپړول له جزوي تادیې سره',
      finalize_remaining_only: 'بشپړول له بشپړ پاتې سره',
      add_more_item: 'بل توکی زیاتول',
      total_items: 'ټوله شمېره',
      barcode_item_added: 'توکی بل ته زیات شو.',
      dash_price_search: 'د توکي نرخ',
      dash_tools: 'تولز',
      dash_price_search_placeholder: 'د توکي نرخ لټون — نوم یا بارکوډ...',
      dash_price_search_hint: 'نوم یا بارکوډ ولیکئ ترڅو د پلور نرخ وښودل شي.',
      dash_price_not_set: 'د پلور نرخ نه دی ټاکل شوی',
      invoice_empty: 'بل تش دی. لومړی توکی سکین کړئ.',
      print_invoice: 'بل چاپ',
      print_with_equivalent: 'د معادل سره چاپ',
      print_invoice_a5: 'د بل چاپ A5',
      print_invoice_80mm: 'د بل چاپ 80mm',
      download_pdf_a5: 'PDF A5 ډاونلوډ',
      download_pdf_a4: 'PDF A4 ډاونلوډ',
      download_pdf_80mm: 'PDF 80mm ډاونلوډ',
      download_image_a5: 'د انځور A5 ډاونلوډ',
      download_image_80mm: 'د انځور 80mm ډاونلوډ',
      payment_receipt: 'د تادیې رسېد',
      payment_receipt_number: 'د رسېد نمبر',
      payment_row_menu: 'د تادیې اختیارونه',
      invoice_export_failed: 'د فایل جوړولو کې ستونزه رامنځته شوه.',
      invoice_saved_to_ishanch: 'فایل د ډیسکټاپ په پوشه Hamyan کې خوندي شو.',
      customer_name: 'د پیرودونکي نوم',
      unit_price: 'د واحد بیه',
      unit_price_short: 'فی',
      price_per_unit: 'د فی واحد بیه',
      total_cost: 'ټول لګښت',
      ram_capacity: 'RAM',
      storage_capacity: 'حافظه',
      invoice_item_details: 'تفصیلات',
      add_invoice_note: 'یادښت زیاتول',
      edit_invoice_note: 'یادښت سمول',
      invoice_note_placeholder: 'د بل یادښت ولیکئ...',
      invoice_note_saved: 'یادښت خوندي شو.',
      sale_date: 'د پلور نیټه',
      purchase_date: 'د پېر نیټه',
      date_picker_today: 'نن',
      date_picker_clear: 'پاکول',
      add_staff: 'کارکوونکی زیاتول',
      edit_staff: 'کارکوونکی سمول',
      no_staff: 'هیڅ کارکوونکی نشته.',
      position: 'ځای / دنده',
      first_name: 'نوم',
      last_name: 'تخلص',
      contract: 'قرارداد',
      contracts: 'قراردادونه',
      monthly_salary: 'میاشتنی معاش',
      pay_salary: 'د معاش تادیه',
      documents: 'اسناد',
      terminate_contract: 'قرارداد فسخ',
      start_date: 'د پیل نیټه',
      end_date: 'د پای نیټه',
      termination_date: 'د فسخ نیټه',
      termination_reason: 'د فسخ دلیل',
      salary_month: 'د معاش میاشت',
      payment_date: 'د تادیې نیټه',
      attachment: 'ضمیمه',
      hire_date: 'د ګومارنې نیټه',
      active_contract: 'فعال قرارداد',
      no_active_contract: 'د معاش تادیې لپاره فعال قرارداد نشته.',
      payable_to_today: 'تر نن ورځې ورکړل کېدونکی',
      payable_to_end_of_month: 'تر میاشتې پای ورکړل کېدونکی',
      payable_to_end_of_contract: 'تر قرارداد پای ورکړل کېدونکی',
      remaining_to_today: 'تر نن ورځې پاتې',
      remaining_to_end_of_month: 'تر میاشتې پای پاتې',
      remaining_to_end_of_contract: 'تر قرارداد پای پاتې',
      paid_amount_staff: 'تادیه شوی',
      remaining_allowed: 'پاتې ورکړل کېدونکی مبلغ',
      add_staff_contract: 'د ګومارنې قرارداد درج',
      edit_staff_contract: 'د ګومارنې قرارداد سمول',
      show_active_contract: 'فعال قرارداد ښودل',
      staff_contract: 'د ګومارنې قرارداد',
      no_staff_contract: 'تر اوسه د ګومارنې قرارداد نه دی ثبت شوی.',
      contract_history: 'بشپړ او فسخ شوي قراردادونه',
      no_contract_history: 'بشپړ یا فسخ شوی قرارداد نشته.',
      salary_payments: 'د معاش تادیې',
      no_salary_payments: 'هیڅ د معاش تادیه نه ده ثبت شوې.',
      add_staff_document: 'اسناد درج',
      no_staff_documents: 'هیڅ سند نه دی ثبت شوی.',
      document_title: 'عنوان',
      file: 'فایل',
      download: 'ډاونلوډ',
      created_at: 'جوړ شوی په',
      jalali_equivalent: 'لمریز معادل',
      contract_status_active: 'فعال',
      contract_status_ended: 'پای ته رسېدلی',
      contract_status_terminated: 'فسخ شوی',
      contract_details: 'د قرارداد جزئیات',
      this_contract_summary: 'د دې قرارداد لنډیز',
      contract_settled: 'تصفیه شوی دی',
      contract_settled_hint: 'د دې قرارداد لپاره پاتې ورکړل کېدونکی مبلغ نشته.',
      closed_contract_paid: 'د دې قرارداد لپاره پاتې ورکړل کېدونکی مبلغ نشته.',
      previous_contract_info:
        'پخوانی قرارداد پای ته رسېدلی یا فسخ شوی؛ اوس نوی قرارداد درج کولی شئ.',
      active_contract_summary: 'د فعال قرارداد لنډیز',
      confirm_delete_salary_payment:
        'ایا ډاډه یاست چې دا د معاش تادیه حذف شي؟ د حذف سره مبلغ کمپنۍ حساب ته راستنیږي.',
      confirm_delete_document: 'ایا ډاډه یاست چې دا سند حذف شي؟',
      document_title_file_required: 'د سند عنوان او فایل وټاکئ.',
      related_contract: 'د قرارداد شمېره',
      add_payment_document: 'د تادیې سند درج',
      replace_payment_document: 'د تادیې سند بدلول',
      add_staff_absence: 'غیرحاضري درج',
      absence_date: 'د غیرحاضري نیټه',
      absences: 'غیرحاضري',
      absence_days: 'د غیرحاضري ورځې',
      no_absences: 'هیڅ غیرحاضري نه ده ثبت شوې.',
      no_staff_with_active_contract: 'هیڅ کارکوونکی د فعال قرارداد سره نشته.',
      confirm_delete_absence: 'ایا ډاډه یاست چې دا غیرحاضري حذف شي؟',
      affiliate_account: 'د افیلیټ اکونټ',
      affiliate_dashboard_card_title: 'تاسو د همیان افیلیټ یاست',
      affiliate_dashboard_card_desc:
        'د همکارۍ سلنه، د اکونټ حالت او هغه بلنې وګورئ چې د افیلیټ اکونټ له جوړېدو وروسته مو کړي.',
      affiliate_percentage: 'د همکارۍ سلنه',
      affiliate_active: 'فعال',
      affiliate_inactive: 'غیرفعال',
      affiliate_since: 'له نېټې',
      affiliate_invitations: 'د افیلیټ بلنې',
      affiliate_invitations_hint:
        'یوازې هغه بلنې چې د افیلیټ اکونټ له جوړېدو وروسته ثبت شوي دلته ښکاري.',
      affiliate_no_invitations: 'تر اوسه د افیلیټ اکونټ له جوړېدو وروسته هیڅ بلنه نه ده ثبت شوې.',
      affiliate_open_page: 'د افیلیټ پاڼه وګورئ',
      affiliate_page_title: 'د افیلیټ اکونټ',
      affiliate_invite_link: 'د افیلیټ بلنې لینک',
      affiliate_how_title: 'د افیلیټ عاید څنګه دی',
      affiliate_how_invite:
        'له هرې بریالۍ بلنې، {{amount}} افغانۍ ترلاسه کوئ.',
      affiliate_how_percent:
        'له تادیو د خپلو ټولو افیلیټ بلنو، د افیلیټ فیصدي ترلاسه کوئ.',
      affiliate_how_example:
        'د بېلګې په توګه له هر {{base}} افغانیو، {{percent}} فیصد = {{amount}} افغانۍ',
      affiliate_how_wallet:
        'فیصدي او د بلنې عاید ستاسو د همیان بکسک ته جمع کېږي او هر وخت د ایستلو وړ دی.',
      affiliate_open_wallet: 'بکسک وګورئ',
      affiliate_apply_title: 'د همیان افیلیټ غوښتنه',
      affiliate_apply_desc:
        'د خپلو ټولنیزو رسنیو لینکونه واستوئ او ووایاست ولې غواړئ د همیان افیلیټ شئ.',
      affiliate_apply_form_title: 'د غوښتنې فورمه',
      affiliate_apply_social_hint: 'لږ تر لږه یو ټولنیز لینک اړین دی.',
      affiliate_apply_unavailable: 'د افیلیټ غوښتنه اوس مهال شتون نلري.',
      affiliate_capacity_full:
        'د افیلیټ ظرفیت بشپړ دی (اعظمي {{count}} کسان). نوې غوښتنه نه منل کېږي.',
      affiliate_apply_card_title: 'د همیان افیلیټ شئ',
      affiliate_apply_card_desc:
        'د ټولنیزو لینکونو او خپل هدف په لیکلو سره د افیلیټ اکونټ لپاره غوښتنه وکړئ.',
      affiliate_apply_card_cta: 'د افیلیټ غوښتنه ثبت',
      affiliate_apply_card_pending_title: 'د افیلیټ غوښتنه په بررسی کې ده',
      affiliate_apply_card_pending_desc: 'ستاسو غوښتنه ثبت شوې او د کتنې په تمه ده.',
      affiliate_apply_card_pending_cta: 'د غوښتنې حالت وګورئ',
      affiliate_social_facebook: 'فیسبوک',
      affiliate_social_instagram: 'انستاګرام',
      affiliate_social_telegram: 'ټیلیګرام',
      affiliate_social_tiktok: 'ټیک‌ټاک',
      affiliate_social_youtube: 'یوټیوب',
      affiliate_social_whatsapp: 'واټساپ',
      affiliate_social_other: 'نور ټولنیز',
      affiliate_request_reason: 'ولې غواړئ د همیان افیلیټ شئ؟',
      affiliate_request_reason_hint: 'لږ تر لږه ۲۰ توري ولیکئ.',
      affiliate_request_reason_placeholder:
        'د بېلګې په توګه ستاسو لیدونکي، تجربه، او د همیان د معرفي پلان…',
      affiliate_request_submit: 'غوښتنه واستوئ',
      affiliate_request_success: 'ستاسو د افیلیټ غوښتنه ثبت شوه او په بررسی کې ده.',
      affiliate_request_status_title: 'د غوښتنې حالت',
      affiliate_request_status_pending: 'په بررسی کې',
      affiliate_request_status_approved: 'تأیید شوی',
      affiliate_request_status_rejected: 'رد شوی',
      affiliate_request_pending_desc: 'له کتنې وروسته نتیجه درته خبر ورکول کېږي.',
      affiliate_request_rejected_desc:
        'دا غوښتنه رد شوې. کولی شئ معلومات سم کړئ او بیا غوښتنه وکړئ.',
      affiliate_request_admin_note: 'د بررسی یادښت',
      affiliate_request_submitted_at: 'ثبت شوی په {{date}}',
      invitee_page_title: 'د رابلل شوي کارن نمایش',
      invitee_open_whatsapp: 'په واټساپ پیام واستوئ',
      invitee_no_whatsapp: 'د واټساپ شمېره نه ده ثبت شوې.',
      username_invalid_hint:
        'کارن نوم باید په انګلیسي توري پیل شي او یوازې کوچني توري، شمېرې او _ ولري (۳ تر ۳۰ توري).',
      username_cooldown_rule: 'د کارن نوم بدلول هر {{days}} ورځې یو ځل مجاز دی.',
      username_cooldown_hint: 'تر راتلونکي بدلون پورې شاوخوا {{days}} ورځې پاتې دي.',
      username_updated_success: 'کارن نوم په بریالیتوب بدل شو.',
      username_history: 'د کارن نوم د بدلون تاریخچه',
      username_history_empty: 'تر اوسه د کارن نوم بدلون نه دی ثبت شوی.',
    },
  },
  en: {
    desktop: {
      app_name: 'Hamyan',
      brand_slogan: 'Business management',
      tagline: 'Business management and growth system',
      login_subtitle: 'Sign in to your account to continue.',
      register_subtitle: 'Create an account to get started with Hamyan.',
      register_subtitle_long:
        'Register to access Hamyan personal and business tools, services, and features.',
      forgot_password_subtitle: 'Enter your email to receive a password reset link.',
      create_account: 'Create new account',
      already_have_account: 'Already have an account? Sign in',
      no_account_yet: "Don't have an account? Register",
      optional: 'Optional',
      language_title: 'Language',
      language_fa: 'Dari',
      language_ps: 'Pashto',
      language_en: 'English',
      welcome_user: 'Welcome, {{name}}',
      welcome_guest: 'Welcome',
      welcome_back: 'Welcome back',
      login_heading: 'Sign in to your account',
      login_download_prompt: 'You can also download the desktop, Android, or iOS apps.',
      login_download_link: 'Go to downloads',
      download_apps: 'Download apps',
      download_badge: 'Hamyan apps',
      download_title: 'Download Hamyan apps',
      download_subtitle:
        'Get the Windows desktop, Android, and iOS apps to manage your business anywhere.',
      download_have_account: 'Have an account? Sign in',
      download_also_title: 'Browse without signing in',
      download_windows_title: 'Windows (Desktop)',
      download_windows_desc: '64-bit Windows installer — for desktop and laptop PCs.',
      download_windows_cta: 'Download for Windows',
      download_android_title: 'Android',
      download_android_desc: 'Get the Android mobile app from the store or direct link.',
      download_android_cta: 'Download for Android',
      download_ios_title: 'iOS',
      download_ios_desc: 'Download the iPhone and iPad app from the App Store.',
      download_ios_cta: 'Download for iOS',
      download_coming_soon: 'Coming soon',
      home_page_title: 'Home',
      back_to_home: 'Back to home',
      back_to_dashboard: 'Back to dashboard',
      ishanch_whatsapp_label: 'Chat with Hamyan support on WhatsApp',
      ishanch_whatsapp_message: 'Hello, I am messaging from the Hamyan website.',
      home_welcome: 'Welcome to Afghanistan’s leading business management platform.',
      home_welcome_desc:
        'With Hamyan you can manage sales, purchases, income and expenses, inventory, and customers in one place.',
      home_users_badge: 'Hamyan community',
      home_users_title: '{{count}} people already work with Hamyan',
      home_users_desc:
        'More businesses in Afghanistan join Hamyan every day. Register for free and start managing your business today.',
      home_users_cta: 'Join Hamyan',
      home_help_badge: 'Help center',
      home_help_title: 'Guides and training to get started fast',
      home_help_desc: 'Visit the help center to learn the system and answer common questions.',
      home_help_point1: 'Sign-in, registration, and account management',
      home_help_point2: 'Sales, purchases, warehouse, and expenses',
      home_help_point3: 'Practical tips for Afghan businesses',
      home_help_cta: 'Open help center',
      home_affiliate_banner_badge: 'Limited affiliate group',
      home_affiliate_banner_title: 'Invite once. Earn every year.',
      home_affiliate_banner_desc:
        'Affiliate income is ongoing. We will have only {{count}} affiliates in Afghanistan.',
      home_affiliate_banner_cta: 'See how to join',
      public_affiliate_nav: 'Affiliate',
      public_affiliate_title: 'Hamyan affiliates',
      public_affiliate_slogan: 'Invite once. Earn every year.',
      public_affiliate_slogan_hint: 'Affiliate income is ongoing.',
      public_affiliate_seo:
        'Invite once. Earn every year. Hamyan affiliate income is ongoing — only 100 affiliates in Afghanistan.',
      public_affiliate_badge: 'Only {{count}} people in Afghanistan',
      public_affiliate_lead:
        'If you have an audience, social presence, and the drive to introduce Hamyan, apply to join the affiliate group.',
      public_affiliate_limit:
        'Capacity is limited: we will have only {{count}} affiliates in Afghanistan.',
      public_affiliate_why_1_title: 'Invitation reward',
      public_affiliate_why_1_desc:
        'For each successful invitation, you earn {{amount}} AFN.',
      public_affiliate_why_2_title: 'Share of payments',
      public_affiliate_why_2_desc:
        'You earn an affiliate percentage from their payments every year — the income does not stop.',
      public_affiliate_why_3_title: 'Paid to wallet',
      public_affiliate_why_3_desc:
        'Invitation rewards and percentage earnings are added to your Hamyan wallet and can be withdrawn.',
      public_affiliate_how_title: 'How to join',
      public_affiliate_step_1: 'Create a Hamyan account or sign in.',
      public_affiliate_step_2: 'Submit your social links and your reason for joining.',
      public_affiliate_step_3: 'After review, if approved, your affiliate account is activated.',
      public_affiliate_cta_guest: 'Register and join',
      public_affiliate_cta_auth: 'Submit affiliate request',
      public_affiliate_cta_login: 'Already have an account? Sign in',
      public_affiliate_full_badge: 'Capacity full',
      public_affiliate_full_title: 'Affiliate capacity is full',
      public_affiliate_full_desc:
        'We will have only {{count}} affiliates in Afghanistan, and the current capacity is full.',
      subscription_pricing_nav: 'Subscription rates',
      subscription_pricing_title: 'Business subscription pricing',
      subscription_pricing_seo:
        'Hamyan business subscription annual fee, discount, and payable amount for 1 to 5 years.',
      subscription_pricing_badge: 'Official pricing',
      subscription_pricing_lead:
        'See the current base fee and discount, and calculate the amount for 1 to 5 years.',
      subscription_pricing_note:
        'The final amount is applied when renewing in the business profile or buying from a reseller.',
      subscription_pricing_month: '1 month',
      home_reseller_banner_badge: 'Sales agency',
      home_reseller_banner_title: 'Become a Hamyan reseller',
      home_reseller_banner_desc:
        'Earn {{percent}}% profit on each sale. Start by buying at least {{count}} subscriptions.',
      home_reseller_banner_cta: 'How to become a reseller',
      reseller_nav: 'Resellers',
      reseller_become_nav: 'Become a reseller',
      reseller_view_directory: 'View resellers',
      reseller_title: 'Become a Hamyan reseller',
      reseller_seo:
        'Become a Hamyan reseller: 30% profit and a starter pack of at least 10 subscriptions at agency price.',
      reseller_badge: 'Subscription sales agency',
      reseller_slogan: 'Become a reseller and earn 30% profit',
      reseller_lead:
        'Buy a reseller pack to activate automatically, then sell business subscriptions.',
      reseller_cta_guest: 'Register and become a reseller',
      reseller_cta_auth: 'Buy a pack and become a reseller',
      reseller_cta_login: 'Already have an account? Sign in',
      reseller_how_title: 'How to become a reseller',
      reseller_step_1: 'Create a Hamyan account or sign in, then top up your Hamyan wallet.',
      reseller_step_2: 'Buy at least 10 subscriptions at reseller price; your reseller account activates automatically.',
      reseller_step_3: 'Add your physical address and WhatsApp, then sell subscriptions from the reseller page.',
      reseller_directory_title: 'Resellers',
      reseller_directory_seo: 'Directory of Hamyan sales resellers with WhatsApp and address.',
      reseller_directory_lead:
        'For an annual purchase to activate your business database, contact the nearest reseller and visit them in person.',
      reseller_directory_lead_1:
        'For an annual purchase to activate your business database, contact the nearest reseller and visit them in person.',
      reseller_directory_lead_2:
        'Pay the fee there and make sure your business is activated on the spot.',
      reseller_directory_lead_3:
        'If you need help or guidance, or if problems occur, contact Hamyan management.',
      reseller_directory_support_whatsapp: 'Hamyan WhatsApp',
      reseller_directory_empty: 'No public resellers are listed yet.',
      reseller_directory_empty_filtered: 'No resellers are listed in this province.',
      reseller_directory_filter: 'Filter by province',
      reseller_directory_filter_all: 'All provinces',
      reseller_directory_filter_hint: 'Choose one of the 34 provinces to show resellers in that province.',
      reseller_directory_whatsapp: 'WhatsApp',
      reseller_directory_address: 'Address',
      reseller_why_1_title: '30% profit',
      reseller_why_1_desc: 'You earn {{percent}}% profit on each Hamyan subscription you sell.',
      reseller_why_2_title: 'Start with 10 subscriptions',
      reseller_why_2_desc: 'You must buy at least {{count}} subscriptions to start.',
      reseller_why_3_title: 'Agency price',
      reseller_why_3_desc: 'Unit cost = (subscription fee − discount) minus {{percent}}%.',
      reseller_price_title: 'Current price calculation',
      reseller_fee: 'Annual subscription fee/cost',
      reseller_discount: 'Discount',
      reseller_list_price: 'Customer price (fee − discount)',
      reseller_unit_cost: 'Agency cost per unit',
      reseller_unit_profit: 'Profit per sale',
      reseller_starter_pack: 'Starter pack ({{count}} units)',
      reseller_formula_hint:
        'Unit cost = (fee − discount) minus {{percent}}%. The minimum starter purchase is 10 units.',
      reseller_apply_title: 'Become a sales reseller',
      reseller_apply_desc:
        'No application needed. Pay and buy at least {{count}} subscriptions to become a reseller automatically.',
      reseller_apply_form_title: 'Application form',
      reseller_quantity: 'Starter subscription quantity',
      reseller_min_qty_error: 'At least {{count}} subscriptions are required.',
      reseller_request_reason: 'Why do you want to be a sales agent?',
      reseller_reason_placeholder: 'For example your sales network, province, and plan…',
      reseller_request_submit: 'Submit agency request',
      reseller_request_success: 'Your agency request was submitted and is under review.',
      reseller_request_status_title: 'Agency request status',
      reseller_request_pack: '{{count}} units — total {{amount}} AFN',
      reseller_card_title: 'Become a Hamyan reseller!',
      reseller_card_desc:
        'Buy at least 10 subscriptions and become a reseller. Earn 30% profit.',
      reseller_card_cta: 'Buy reseller pack',
      reseller_card_pending_title: 'Agency request under review',
      reseller_card_pending_desc: 'Your request has been submitted and is awaiting review.',
      reseller_card_pending_cta: 'View request status',
      reseller_charge_title: 'Charge your Hamyan wallet',
      reseller_charge_desc:
        'Add the required amount to your Hamyan wallet first. You cannot buy a reseller pack until the wallet is charged.',
      reseller_charge_pay:
        'To add money to your Hamyan wallet, send the amount to Pay account {{pay}}.',
      reseller_charge_pay_hint: 'To add money to your Hamyan wallet, send the amount to this Pay account:',
      reseller_pay_label: 'Hamyan Pay account',
      reseller_charge_receipt: 'Send the payment receipt on Hamyan WhatsApp.',
      reseller_charge_after:
        'After your Hamyan wallet is charged, the reseller pack is activated and you become a sales reseller.',
      reseller_wallet_balance: 'Hamyan wallet balance: {{amount}} AFN',
      reseller_receipt_form_title: 'Submit payment receipt',
      reseller_receipt_submit: 'Submit receipt',
      reseller_receipt_success: 'Receipt submitted. Your Hamyan wallet will be charged after confirmation.',
      reseller_receipt_min: 'Minimum deposit is {{min}} AFN.',
      reseller_receipt_pack_amount:
        'To buy {{count}} subscription accounts you must pay {{amount}} AFN.',
      reseller_buy_title: 'Buy reseller pack',
      reseller_auto_agent_hint:
        'After a successful purchase, your reseller account is created and you become a sales reseller automatically.',
      reseller_buy_submit: 'Buy pack',
      reseller_buy_success: 'Reseller pack purchased. You are now a sales reseller.',
      reseller_buy_need_more:
        'Your Hamyan wallet is not enough for this pack. The pack costs {{need}} AFN.',
      reseller_buy_disabled_reason:
        'The button is disabled because your Hamyan wallet balance ({{balance}} AFN) is less than the pack cost ({{need}} AFN). Charge your wallet first.',
      reseller_pack_cost: 'This pack costs: {{amount}} AFN',
      reseller_page_title: 'Reseller account',
      reseller_page_desc: 'Reseller wallet balance and per-subscription rates.',
      reseller_box_balance: 'Reseller wallet balance',
      reseller_inventory: 'Unit inventory',
      reseller_unit_record_title: 'Rate per subscription',
      reseller_customer_charge: 'Amount you may charge the customer',
      reseller_pays_from_box: 'Paid from reseller wallet',
      reseller_purchases_title: 'Pack purchases',
      reseller_sales_title: 'Subscription sales',
      reseller_sell_cta: 'Sell subscription',
      reseller_sell_page_title: 'Sell subscription to a business',
      reseller_sell_page_desc:
        'Enter the public business ID, choose years, and pay from your reseller box balance.',
      reseller_sell_company_id: 'Public business ID',
      reseller_sell_search: 'Search',
      reseller_sell_years: 'Duration (years)',
      reseller_sell_year_option: '{{count}} year(s)',
      reseller_sell_submit: 'Purchase and activate',
      reseller_sell_success: 'Subscription recorded for the business.',
      reseller_sell_confirm_title: 'Confirm subscription sale',
      reseller_sell_confirm_desc:
        'On confirm, the amount is deducted from the reseller box and the business validity is extended.',
      reseller_sell_confirm_submit: 'Confirm and pay',
      reseller_sell_customer_total: 'Amount recorded for the business',
      reseller_sell_reseller_pay: 'Pay from reseller box',
      reseller_sell_valid_until: 'Valid until',
      reseller_sell_disabled_reason:
        'Reseller box balance ({{balance}} AFN) or units ({{inventory}}) is not enough. Need {{need}} AFN and {{years}} unit(s).',
      reseller_sale_row: '{{name}} — {{years}} year(s) — {{amount}} AFN',
      reseller_open_page: 'Open reseller page',
      reseller_send_whatsapp: 'Send receipt on WhatsApp',
      reseller_buy_more: 'Buy more packs',
      reseller_address_title: 'Reseller physical address',
      reseller_address_desc:
        'Register your province, city/district, full address, and WhatsApp number for sales agency.',
      reseller_address_required: 'Physical address registration is required.',
      reseller_address_submit: 'Save address',
      reseller_address_success: 'Reseller physical address saved.',
      reseller_province: 'Province',
      reseller_province_placeholder: 'Select province',
      reseller_province_required: 'Please select a province.',
      reseller_city_district: 'City / district',
      reseller_full_address: 'Full address',
      reseller_whatsapp: 'WhatsApp number',
      reseller_address_edit: 'Edit address',
      reseller_address_add: 'Add address',
      reseller_buy_confirm_title: 'Confirm reseller pack purchase',
      reseller_buy_confirm_desc: 'Please review the purchase details and confirm if you agree.',
      reseller_buy_confirm_terms_hint: 'By confirming, you accept the Hamyan reseller terms:',
      reseller_buy_confirm_submit: 'Confirm and buy',
      reseller_confirm_pack_total: 'Pack cost',
      reseller_confirm_wallet: 'Hamyan wallet balance',
      reseller_terms_title: 'Reseller terms',
      reseller_terms_heading: 'Hamyan reseller (sales agency) terms',
      reseller_terms_intro:
        'By buying a reseller pack and acting as a Hamyan reseller, you accept these terms.',
      reseller_terms_link: 'Reseller terms',
      reseller_terms_sections: [
        {
          title: 'Activating reseller status',
          items: [
            'Buying at least 10 subscriptions activates the reseller account.',
            'After the first purchase, later purchases have a minimum of 5 units.',
            'The purchase amount is deducted from the Hamyan wallet and added to the reseller wallet.',
          ],
        },
        {
          title: 'Pricing and profit',
          items: [
            'Customer price equals the annual fee minus discount.',
            'Reseller cost is 70% of the customer price; reseller profit is 30%.',
            'Prices may update based on official Hamyan fees.',
          ],
        },
        {
          title: 'Address and contact',
          items: [
            'Province, city/district, full address, and WhatsApp are required for resellers.',
            'Contact details must be accurate and reachable.',
          ],
        },
        {
          title: 'Responsibilities',
          items: [
            'Resellers must give accurate information about Hamyan subscriptions.',
            'Misuse or false information may lead to account suspension.',
            'Hamyan may update these terms; the version on this page is authoritative.',
          ],
        },
      ],
      home_cta_title: 'Need a secure, unified database?',
      home_cta_desc:
        'Hamyan is ready for sales, expenses, customers, dedicated websites, and reports. Start free today.',
      home_cta_button: 'Create a free account',
      home_notice_1: 'Need an online database?',
      home_notice_2: 'Keep a secure, always-available database.',
      home_notice_3: 'Manage your products and services online.',
      home_features_title: 'Core system features',
      home_features_desc: 'What does Hamyan provide for you?',
      home_feature_1_title: 'Manage 50+ business models',
      home_feature_1_desc: 'Hamyan fits many kinds of businesses.',
      home_feature_2_title: 'Secure and trustworthy',
      home_feature_2_desc: 'Your data is protected with strong security.',
      home_feature_3_title: 'Ongoing support and upgrades',
      home_feature_3_desc: 'The system receives continuous updates.',
      home_feature_4_title: 'Unlimited accounts and businesses',
      home_feature_4_desc: 'Each user can manage multiple businesses.',
      home_feature_5_title: 'Dedicated website per business',
      home_feature_5_desc: 'Every business gets its own page.',
      home_feature_6_title: 'Desktop and mobile apps',
      home_feature_6_desc: 'Also available on Windows, Android, and iOS.',
      home_footer_copy: 'All rights reserved.',
      terms: 'Terms',
      policies: 'Policies',
      cw_home: 'Home',
      cw_products: 'Products',
      cw_contact: 'Contact us',
      cw_latest_products: 'Latest products',
      cw_all_products: 'All products',
      cw_no_products: 'No products yet.',
      cw_search_products: 'Search products...',
      cw_sort_newest: 'Newest',
      cw_sort_oldest: 'Oldest',
      cw_sort_price_asc: 'Price (low to high)',
      cw_sort_price_desc: 'Price (high to low)',
      cw_apply: 'Apply',
      cw_contact_info: 'Contact info',
      cw_address: 'Address',
      cw_not_available: 'Not available',
      cw_not_found: 'Business not found.',
      cw_related_products: 'Related products',
      cw_in_stock: 'In stock',
      cw_out_of_stock: 'Out of stock',
      cw_call: 'Call',
      cw_we_are_here: 'We are here for you',
      cw_category: 'Category',
      cw_order: 'Order',
      cw_whatsapp_order_text:
        'Hello, I would like more information about “{{product}}”.\n— via Hamyan\n\n{{url}}',
      cw_call_now: 'Call now',
      cw_share: 'Share',
      cw_copy_link: 'Copy link',
      cw_copied: 'Copied!',
      cw_details: 'Details',
      cw_back: 'Back',
      cw_email: 'Email',
      cw_map_coming_soon: 'Map coming soon',
      cw_afn: 'AFN',
      cw_description: 'Description',
      secure_access: 'Secure access',
      secure_access_hint: 'Safe sign-in to your account',
      saved_accounts: 'Saved accounts',
      saved_accounts_hint: 'Click an email to sign in.',
      saved_accounts_quick: 'Quick account pick',
      remove_saved_account: 'Remove saved account',
      show_saved_accounts: 'Saved accounts',
      use_another_account: 'Sign in with another account',
      remember_section: 'Sign-in options',
      save_account_on_device: 'Save this account email and password on this device',
      join_ishanch: 'Join Hamyan',
      register_heading: 'Create a new account',
      enter_email_first: 'Please enter your email first.',
      send_code: 'Send code',
      sending_code: 'Sending...',
      resend_after: 'Resend after',
      seconds_short: 'seconds',
      forgot_password_heading: 'Password recovery',
      go_to_register: 'Go to register',
      email_verification_code: 'Email verification code',
      email_verification_code_invalid: 'Verification code must be 6 digits.',
      send_email_code: 'Send verification code',
      email_code_sent: 'Verification code sent.',
      email_code_send_failed: 'Could not send verification code.',
      email_required_for_code: 'Please enter your email first.',
      resend_in_seconds: 'Resend in {{seconds}} seconds',
      debug_code: 'Debug code',
      api_connection_error: 'Could not connect to the server. Check the API.',
      offline_banner: 'You are offline. Important operations are paused until you reconnect.',
      offline_operation_blocked: 'You are offline. This operation cannot be performed.',
      too_many_requests: 'Too many requests. Please wait a moment and try again.',
      forbidden: 'You do not have permission to perform this action.',
      auth_invalid_credentials: 'The provided credentials are incorrect.',
      logout_success: 'Logged out successfully.',
      validation_invalid_data: 'The given data was invalid.',
      validation_required: 'The {{field}} field is required.',
      validation_email: 'The {{field}} must be a valid email address.',
      validation_min_string: 'The {{field}} must be at least {{min}} characters.',
      validation_confirmed: 'The {{field}} confirmation does not match.',
      validation_unique: 'The {{field}} has already been taken.',
      validation_digits: 'The {{field}} must be {{digits}} digits.',
      generic_request_error: 'Request failed. Please try again.',
      forgot_password_sent_hint: 'A password reset code has been sent to your email.',
      forgot_password_code_intro:
        'Enter your email, get a verification code, then set your new password on this page.',
      reset_password_heading: 'Reset password',
      reset_password_subtitle: 'Enter your new password.',
      reset_password_success: 'Your password was changed successfully.',
      reset_password_missing_token: 'The reset link is invalid.',
      change_password_button: 'Change password',
      current_password: 'Current password',
      new_password: 'New password',
      confirm_password: 'Confirm new password',
      password_min_length: 'Password must be at least 8 characters.',
      password_mismatch: 'New password and confirmation do not match.',
      password_updated_success: 'Password updated successfully.',
      back_to_login: 'Back to sign in',
      guest_panel_eyebrow: 'Account and management services',
      guest_panel_title: 'Everything is ready to sign in and get started',
      guest_panel_badge: 'Professional and trusted',
      guest_panel_description:
        'Sign in or create an account here for better daily management, task tracking, and easy access to your account services.',
      guest_feature_growth_title: 'Steady growth',
      guest_feature_growth_desc: 'Track work better and make clearer business decisions.',
      guest_feature_management_title: 'Practical management',
      guest_feature_management_desc: 'Quick access to account data and key system areas.',
      guest_feature_security_title: 'Trusted access',
      guest_feature_security_desc: 'Secure sign-in and registration for new and existing users.',
      guest_chip_login: 'User sign-in',
      guest_chip_register: 'New member registration',
      guest_chip_access: 'Account services access',
      dashboard_title: 'Dashboard',
      refresh: 'Refresh',
      logout: 'Sign out',
      api_label: 'API connection',
      businesses: 'Businesses',
      wallet: 'Wallet',
      premium: 'Premium',
      profile_status: 'Profile status',
      premium_active: 'Active',
      premium_inactive: 'Inactive',
      profile_approved: 'Approved',
      profile_pending: 'Pending approval',
      companies_list: 'Business list',
      companies_dash_title: 'Here you can see your businesses.',
      companies_dash_desc:
        'Click any business to open its transactions and add, edit, print, or export data as PDF.',
      loading: 'Loading…',
      no_companies: 'No businesses registered yet.',
      online_tagline: 'Connected to Hamyan server',
      nav_dashboard: 'Dashboard',
      nav_profile: 'Profile',
      nav_wallet: 'Ulanish Wallet',
      nav_accounts: 'Personal accounts',
      nav_counterparties: 'Counterparties',
      nav_premium: 'Premium',
      nav_companies: 'Businesses',
      nav_notifications: 'Notifications',
      user_notifications: 'User notifications',
      business_notifications: 'Business notifications',
      nav_settings: 'Settings',
      nav_help: 'Help center',
      help_center: 'Help center',
      help_page_welcome: 'Welcome to the Hamyan help center',
      help_videos_intro:
        'The options below are guides. Click any item to watch the tutorial video.',
      help_search_placeholder: 'Search title or category...',
      help_clear_search: 'Clear search',
      help_no_results: 'No guides found!',
      help_show_video: 'Show video',
      help_back_to_list: 'Back to help center',
      help_no_video: 'No video is available for this guide.',
      help_copy_share: 'Copy title, description, and link',
      help_copied: 'Copied!',
      menu: 'Menu',
      nav_back: 'Back',
      nav_forward: 'Forward',
      toolbar_aria: 'Navigation toolbar',
      page_settings_desc: 'Account and language settings',
      change_language: 'Change language',
      choose_language: 'Choose your preferred language',
      changing_language: 'Changing language...',
      close: 'Close',
      switching_workspace: 'Switching to {{name}}...',
      sidebar_business_count: '{{count}} businesses',
      sidebar_personal_account: 'Personal account',
      sidebar_user_suffix: 'user',
      sidebar_group_trade: 'Sales & purchases',
      sidebar_group_people: 'Persons / counterparties',
      sidebar_group_inventory: 'Inventory',
      sidebar_group_accounts: 'Financial accounts',
      sidebar_group_reports: 'Reports',
      sidebar_group_expenses: 'Expenses',
      other_options: 'Other options',
      mark_all_read: 'Mark all read',
      no_notifications: 'No notifications.',
      notification: 'Notification',
      view_all_notifications: 'View all',
      note_referralBonus: 'You earned a potential reward for inviting others.',
      note_networkBuilding: 'You earned a potential reward for helping build the Hamyan community.',
      note_depositSuccess: 'Deposit completed successfully.',
      note_depositRejected: 'Deposit was rejected.',
      note_paymentSuccess: 'Payment completed successfully.',
      note_paymentFailed: 'Payment failed.',
      note_completeYourKyc: 'Complete your KYC verification.',
      note_kycCompletionAsked: 'KYC completion has been requested.',
      note_kycAccepted: 'KYC approved.',
      note_kycRejected: 'KYC rejected.',
      note_BonusApproved: 'Bonus approved.',
      note_DepositApproved: 'Deposit approved.',
      note_marketingBonusApproved: 'Marketing reward has been credited to your account.',
      note_marketingBonus: 'You earned a potential marketing reward!',
      page_profile_desc: 'Account and profile information',
      page_wallet_desc: 'Ulanish wallet balance and history',
      your_wallet: 'Ulanish Wallet',
      available_amount: 'Available balance',
      wallet_address: 'Ulanish wallet address',
      copy: 'Copy address',
      wallet_transfer: 'Transfer',
      wallet_withdraw: 'Withdraw',
      wallet_add_money: 'Add money',
      wallet_add_money_title: 'Add money to Hamyan wallet',
      wallet_add_money_lead:
        'Send any amount you want to this Pay account, then send the receipt on Hamyan WhatsApp.',
      wallet_add_money_cta: 'Add money',
      bonuses: 'Bonuses',
      wallet_notes: 'Notes',
      download_card: 'Download card',
      downloading_card: 'Downloading…',
      wallet_history: 'History',
      type: 'Type',
      source: 'Source',
      all: 'All',
      credit_in: 'Cash in',
      debit_out: 'Cash out',
      no_record_found: 'No records found',
      gregorian_date_label: 'Date (Gregorian)',
      recommended: 'Recommended',
      activate_premium: 'Activate premium',
      premium_hero_sub:
        'Activate premium for a more professional experience, broader features, and faster growth on Hamyan.',
      premium_price_monthly: 'Monthly price',
      premium_price_yearly: 'Yearly price',
      premium_valid_until: 'Premium valid until',
      wallet_balance: 'Wallet balance',
      normal_user: 'Normal user',
      normal_user_desc: 'Basic features for everyday management.',
      premium_user_desc: 'Advanced features for faster growth and a more professional presence.',
      premium_one_month: 'One month',
      premium_one_year: 'One year',
      premium_charge_note: '{{amount}} AFN will be deducted from your Hamyan wallet.',
      premium_activated_success: 'Premium activated successfully.',
      confirm: 'Confirm',
      expenses_page: 'Expenses',
      expenses_page_desc: 'Expenses recorded from personal accounts.',
      expense_analysis: 'Expense analysis',
      expense_analysis_desc: 'Expense totals by category.',
      expense_analysis_premium_note: 'Expense analysis is available for premium users.',
      expense_section: 'Expense category',
      expense_saved_success: 'Expense saved successfully.',
      go_to_accounts: 'Go to personal accounts',
      become_premium: 'Become premium',
      quick_links: 'Quick links',
      dashboard_hero_badge: 'Hamyan dashboard',
      dashboard_hero_with_companies:
        'Manage your businesses from this dashboard and reach the main sections faster.',
      dashboard_hero_without_companies:
        'Create your first business to start managing transactions and information.',
      dashboard_businesses_hint: 'Manage companies',
      dashboard_premium_hint: 'Premium user',
      dashboard_profile_hint: 'User account',
      dashboard_premium_banner_title: 'Activate premium',
      dashboard_premium_banner_desc:
        'Get more professional features, fewer limits, and special benefits with premium.',
      dashboard_premium_banner_action: 'View plans',
      dashboard_empty_title: 'No businesses yet',
      dashboard_empty_desc: 'Use the sidebar to create your first company.',
      dashboard_empty_action: 'Start by creating a business',
      personal_deals: 'Personal deals',
      last_transactions: 'Latest transactions',
      exchange_rates_title: 'Exchange rates',
      exchange_rates_subtitle: 'Latest recorded rates for each currency pair are shown here.',
      latest_exchange_rates: 'Latest exchange rates',
      view_all_exchange_rates: 'View all',
      exchange_one_equals: '1 {{from}} = {{rate}} {{to}}',
      exchange_calculator_title: 'Currency calculator',
      exchange_calculator_hint: 'Enter an amount and choose source and target currencies.',
      exchange_pair: 'Currency pair',
      exchange_from: 'From',
      exchange_to: 'To',
      exchange_result: 'Result',
      exchange_no_path: 'Rate unavailable',
      exchange_no_data: 'No exchange rates have been recorded yet.',
      exchange_rate_label: 'Rate',
      exchange_examples: 'Conversion samples',
      exchange_for_amount: 'For',
      last_update: 'Last update',
      note: 'Note',
      sarai_rate_note: 'Based on Sarai Shahzada daily rate',
      exchange_rate_detail_desc: 'Rate details and history for this currency pair.',
      exchange_history: 'Rate history',
      invalid_gregorian_date: 'Invalid Gregorian date.',
      wallet_scroll_hint: 'Scroll left and right to see more options.',
      back_to_wallet: 'Back to Hamyan wallet',
      transfer_soon: 'This section will be available soon.',
      withdraw_soon: 'This section will be available soon.',
      transfer_conditions: 'Transfer conditions',
      transfer_condition_identity: 'Both sender and receiver must be identity-verified.',
      transfer_condition_premium: 'Both sender and receiver must be premium users.',
      withdraw_conditions: 'Withdraw conditions',
      withdraw_condition_identity: 'Identity verification is required to withdraw.',
      wallet_note_1:
        'Your wallet balance can be withdrawn at any time. Minimum withdrawal is 500 AFN each time.',
      wallet_note_2:
        'You can use this balance for premium subscription, books, learning packs, business subscription, and Hamyan market purchases.',
      wallet_note_3: 'You can also send part or all of your wallet balance to another person.',
      afn: 'AFN',
      page_accounts_desc: 'Multi-currency accounts and transactions',
      create_user_accounts: 'Create personal accounts',
      user_accounts_not_activated: 'Your personal accounts are not activated yet.',
      create_user_account_guide: 'Create personal accounts to manage your personal spending and transfers.',
      choose_trade_currencies_note: 'Choose the currencies you trade with to activate personal accounts.',
      premium_currency_lock_note: 'You are not premium yet; only the AFN account is shown.',
      premium_template_select_note: 'Premium users can select all account templates.',
      select_at_least_one_template: 'Please select at least one account template.',
      no_account_templates: 'No account templates found.',
      premium_accounts_hidden_note: 'You are not premium; only the AFN account is shown.',
      account_card_click_hint: 'Click an account card to view details and delete options.',
      more_details: 'More details',
      personal_accounts_guide: 'Personal accounts guide',
      cp_transactions_guide: 'In/out transfers guide',
      cp_incoming: 'Incoming from',
      cp_outgoing: 'Outgoing to',
      add_funds: 'Add',
      withdraw: 'Withdraw',
      search_counterparty: 'Search counterparty',
      counterparty: 'Counterparty',
      description: 'Description',
      premium_account_progress: 'Your accounts',
      transaction_click_hint: 'Click a transaction to view details.',
      deposit_added: 'Deposit',
      deposit_detail: 'Transaction details',
      afn_only_operation_note: 'Only AFN can be used for direct add/withdraw.',
      premium_can_select_account: 'As a premium user you can choose any account.',
      confirm_delete_title: 'Confirm delete',
      confirm_delete_text: 'Are you sure you want to delete this?',
      balance_details: 'Balance details',
      current_balance: 'Current balance',
      personal_account_description:
        'This balance belongs to your personal accounts and is separate from business accounts.',
      delete_account_warning: 'Warning: deleting this account cannot be undone.',
      delete_account: 'Delete account',
      delete_account_success: 'Personal account deleted successfully.',
      account_has_tx_delete_blocked: 'This account has transactions and cannot be deleted.',
      confirm_delete_account_text: 'Are you sure you want to delete this account?',
      personal_accounts_guide_intro:
        'Personal accounts manage your own money and are separate from business accounts.',
      guide_create_account: 'Create accounts: activate templates to start personal accounting.',
      guide_balance_meaning: 'Balance: each card shows your available amount in that currency.',
      guide_add_withdraw: 'Add/withdraw updates the balance immediately.',
      guide_transactions: 'Transactions: open any row for full details.',
      guide_delete_account: 'Delete is only allowed when the account has no transactions.',
      guide_premium: 'Every personal-account currency works without premium. Free counterparties are capped at 30.',
      cp_guide_intro: 'Use this section to track money in and out with counterparties.',
      cp_guide_incoming: 'Incoming: when you receive money from a counterparty.',
      cp_guide_outgoing: 'Outgoing: when you pay a counterparty.',
      cp_guide_account: 'Each transfer is tied to one personal account.',
      cp_guide_balance: 'Remaining/due is calculated per account and currency.',
      page_counterparties_desc: 'Manage personal counterparties',
      counterparty_free_limit_note:
        'In free mode only the first 30 counterparties are shown. Activate premium to see all.',
      counterparty_add_locked_note:
        'In free mode, adding more than 30 counterparties requires premium.',
      premium_counterparty_add_open: 'Premium is active; adding counterparties is unrestricted.',
      counterparty_transactions: 'In / out transfers',
      baqi_talab_meaning:
        'Guide: Remaining means you owe the counterparty; Due means they owe you.',
      counterparty_count_label: 'Counterparties count',
      balance_or_talab: 'Remaining / Due',
      talab: 'Due',
      baqi: 'Remaining',
      settled: 'Settled',
      edit_counterparty: 'Edit counterparty',
      no_counterparties: 'No counterparties found.',
      counterparty_details: 'Counterparty details',
      counterparty_not_found: 'Counterparty not found.',
      total_outgoing: 'Total outgoing',
      total_incoming: 'Total incoming',
      page_companies_desc: 'List and create businesses',
      save_changes: 'Save changes',
      create_business: 'Create business',
      add_counterparty: 'Add counterparty',
      search: 'Search',
      balance: 'Balance',
      amount: 'Amount',
      status: 'Status',
      date: 'Date',
      name: 'Name',
      lastname: 'Last name',
      email: 'Email',
      phone: 'Phone',
      currency: 'Currency',
      active: 'Active',
      inactive: 'Inactive',
      create: 'Create',
      business_name: 'Business name',
      business_type: 'Business type',
      parent_company: 'Parent company',
      none: 'None',
      transactions: 'Transactions',
      deposits: 'Deposits',
      referrals: 'Referrals',
      saved_success: 'Saved successfully.',
      save: 'Save',
      processing: 'Processing...',
      edit: 'Edit',
      profile_photo: 'Profile photo',
      update_profile_photo: 'Update profile photo',
      update_profile_info: 'Update profile info',
      choose_photo: 'Choose photo',
      choose_another_photo: 'Choose another photo',
      avatar_crop_hint: 'Crop the image to a square (1:1). Final size will be at most 150KB.',
      avatar_compress_failed: 'Could not compress the image under 150KB. Please choose another photo.',
      no_file_selected: 'No file selected.',
      info_upload_success: 'Saved successfully.',
      email_change_note: 'Changing email may require re-verification.',
      identity_details: 'Identity details',
      whatsapp_number: 'WhatsApp number',
      identity_number: 'ID number',
      id_scan_front: 'ID scan (front)',
      id_scan_back: 'ID scan (back)',
      id_scan_crop_hint:
        'Crop to the national ID card aspect ratio. Selected file size is unrestricted; upload is compressed to at most 512KB.',
      id_scan_compress_failed: 'Could not compress the image under 512KB. Please choose another photo.',
      no_image: 'No image',
      status_approved: 'Approved',
      status_rejected: 'Rejected',
      status_requested: 'Requested',
      status_pending: 'Pending',
      request_review: 'Request review',
      confirm_request_review_title: 'Confirm review request',
      confirm_request_review_note: 'Your identity information will be submitted for review.',
      request_sent: 'Your request was sent.',
      send_request: 'Send request',
      user_id: 'User ID',
      copy_user_id: 'Copy',
      copied: 'Copied',
      public_user_id_note:
        'Note: This ID is public. Invite friends to earn. Start inviting now.',
      your_invite_link: 'Your invite link',
      copy_invite_link: 'Copy invite link',
      visit_public_profile: 'View public profile',
      invitation_message:
        'Hi! If you have a shop, join the largest online business management platform in Afghanistan and manage your business easily. You can also earn by inviting others. Use my invite link to register: :link',
      your_community_count: 'Your community: {{count}} people',
      no_referrals_yet: 'You have not invited anyone yet!',
      jalali_date: 'Afghan solar date',
      gregorian_date: 'Gregorian date',
      gregorian_equivalent: 'Gregorian equivalent',
      click_for_gregorian: 'Click to view Gregorian date',
      local_timezone_note: 'Time is shown in your system local timezone.',
      sidebar_open: 'Open sidebar',
      sidebar_close: 'Close sidebar',
      sidebar_switch_account: 'Switch account',
      syncing: 'Syncing…',
      company: 'Company',
      company_dashboard: 'Business dashboard',
      company_dashboard_desc: 'Overview of this business',
      company_inactive_alert:
        'The system for this company ({{company}}) is inactive. Please make the annual payment to activate it. Otherwise, you will not be able to enter daily data.',
      company_id: 'Business ID',
      copy_company_id: 'Copy',
      public_company_id_note:
        'Used for public cases, buying from resellers, and other options.',
      valid_until: 'Valid until',
      valid_date: 'Validity',
      company_validity: 'Business validity',
      enter_business: 'Enter business',
      customers: 'Customers',
      vendors: 'Vendors',
      staff: 'Staff',
      company_accounts: 'Accounts',
      warehouses: 'Warehouses',
      warehouse_inventory: 'Warehouse inventory',
      warehouse_transfers: 'Warehouse transfers',
      warehouse_transfer_records: 'Item transfer records',
      new_transfer: 'New transfer',
      no_transfer_records: 'No transfer records found.',
      no_warehouse_inventory: 'No inventory found.',
      all_locations: 'All locations',
      all_warehouses: 'All warehouses',
      company_sales_center_full: 'Sales center (company)',
      from_warehouse: 'From warehouse',
      to_warehouse: 'To warehouse',
      location: 'Location',
      available: 'Available',
      item_required: 'Selecting an item is required.',
      today_date: "Today's date",
      transfer: 'Transfer',
      transfer_type: 'Type',
      transfer_route: 'Route',
      warehouse_to_warehouse: 'Warehouse to warehouse',
      warehouse_to_company: 'Warehouse to sales center',
      company_to_warehouse: 'Sales center to warehouse',
      company_sales_center: 'Sales center',
      transfer_reversed: 'Reversed',
      delete_transfer: 'Delete transfer',
      confirm_delete_transfer: 'Reverse/delete this transfer?',
      item: 'Item',
      add_warehouse: 'Add warehouse',
      edit_warehouse: 'Edit warehouse',
      delete_warehouse: 'Delete warehouse',
      confirm_delete_warehouse: 'Are you sure you want to delete this warehouse?',
      warehouse_has_items_not_deletable:
        'This warehouse has items and cannot be deleted. Move items out first.',
      insert: 'Create',
      sale: 'Sale',
      sales: 'Sales',
      expenses: 'Expenses',
      cash_deposits: 'Cash deposits',
      cash_withdrawals: 'Withdrawals',
      items: 'Items',
      items_products: 'Items / products',
      daily_sales_report: 'Daily sales report',
      profit_report: 'Profit report',
      profit_loss_report: 'Profit & loss report',
      journal: 'Journal',
      journal_detail: 'Detail',
      journal_balance: 'Balance',
      journal_time: 'Time',
      no_journal_on_date: 'No transactions recorded on this date.',
      partners: 'Partners',
      coming_soon: 'Coming soon',
      items_sold: 'Items sold',
      qty_sold: 'Quantity sold',
      invoices_count: 'Invoice count',
      day_sales_total: 'Day sales total',
      day_profit_total: 'Day profit total',
      total_sales: 'Total sales',
      total_purchases: 'Total purchases',
      search_sales_hint: 'Search by customer or bill number',
      search_purchases_hint: 'Search by vendor or bill number',
      avg_unit_price: 'Average unit price',
      profit_per_unit: 'Profit per unit',
      no_sales_on_date: 'No sales recorded on this date.',
      gross_profit_note:
        'Note: figures on this page show gross profit. Net profit will appear in the profit/loss report.',
      from_date: 'From date',
      to_date: 'To date',
      view_separate: 'Separate view',
      show_merged: 'Merged view',
      view_by_invoice: 'By invoice',
      print_pdf: 'Print/PDF',
      sale_account: 'Sale account',
      sale_cost: 'Sale cost',
      sale_cost_capital: 'Sale cost in capital',
      purchase_cost_capital: 'Purchase cost in capital',
      profit_in_sale_account: 'Profit in sale account',
      profit_in_capital_account: 'Profit in capital account',
      sale_invoice: 'Sale invoice',
      sold_quantity: 'Quantity sold',
      raw_materials: 'Raw materials',
      productions: 'Productions',
      item_categories: 'Item categories',
      add_category: 'Add category',
      edit_category: 'Edit category',
      delete_category_confirm_title: 'Confirm category deletion',
      delete_category_confirm_message: 'Are you sure you want to delete this category?',
      delete_category_detach_warning:
        'Category “{{name}}” has {{count}} related items. If you confirm deletion, those items will have no category. Continue?',
      confirm_detach_and_delete_category: 'Yes, unlink and delete',
      purchases: 'Purchases',
      activity_logs: 'Hamyan Watch',
      activity_logs_subtitle:
        'This page shows a simple, readable summary of company changes.',
      activity_logs_search_placeholder: 'User name, email, or section',
      no_activity_logs: 'No activity logs found.',
      activity_log_fallback: 'A new change was recorded',
      activity_entity_fallback: 'Info',
      date_from: 'From date',
      date_to: 'To date',
      clear_filters: 'Clear',
      apply_filters: 'Filter',
      previous: 'Previous',
      next: 'Next',
      model: 'Model',
      related: 'Related',
      business: 'Business',
      website: 'Website',
      view_all: 'View all',
      cash: 'Cash',
      bank: 'Bank',
      etc: 'Other',
      capital: 'Main capital',
      sell_account: 'Sales account',
      account: 'Account',
      company_accounts_cash_bank: 'Accounts / cash & bank',
      dash_today: 'Today',
      dash_month: 'This month',
      dash_other: 'Other',
      dash_today_details: "Today's summary",
      dash_month_details: 'Monthly summary',
      dash_other_details: 'Other key info',
      receivables: 'Receivables',
      payables: 'Payables',
      out_of_stock: 'Out of stock',
      out_of_stock_items: 'Out of stock items',
      low_stock_items: 'Low stock items',
      no_accounts_yet: 'No accounts created yet.',
      no_transactions: 'No transactions found.',
      credit: 'Cash in',
      debit: 'Cash out',
      tx_purchase_payment: 'Purchase payment',
      tx_purchase_reopen: 'Purchase reopen',
      tx_purchase: 'Purchase',
      tx_sale_invoice_payment: 'Sale invoice payment',
      tx_sale_invoice_reopen: 'Sale invoice reopen',
      tx_sale_reopen: 'Sale reopen',
      tx_cash_deposit: 'Cash deposit',
      tx_cash_withdraw: 'Cash withdraw',
      tx_customer_general_payment: 'Customer payment',
      tx_customer_payment_reversal: 'Customer payment reversal',
      tx_vendor_general_payment: 'Vendor payment',
      tx_vendor_prepayment_return: 'Vendor prepayment return',
      tx_vendor_payment_reversal: 'Vendor payment reversal',
      tx_vendor_negative_payment_reversal: 'Vendor negative payment reversal',
      tx_staff_salary_payment: 'Staff salary payment',
      tx_staff_salary_payment_reversal: 'Staff salary payment reversal',
      tx_expense: 'Expense',
      tx_expense_updated: 'Expense updated',
      tx_expense_updated_reversal: 'Expense update reversal',
      tx_expense_deleted_reversal: 'Expense delete reversal',
      tx_transfer_in: 'Transfer in',
      tx_transfer_out: 'Transfer out',
      currency_afn: 'Afghani',
      currency_usd: 'Dollar',
      currency_eur: 'Euro',
      currency_irr: 'Toman',
      currency_pkr: 'Rupee',
      currency_gbp: 'Pound',
      currency_aed: 'Dirham',
      currency_try: 'Lira',
      currency_cny: 'Yuan',
      currency_inr: 'Rupee',
      currency_sar: 'Saudi Riyal',
      total_accounts: 'Total accounts',
      hint_click_account: 'Click a card to view details.',
      account_transactions: 'Account transactions',
      account_details: 'Account details',
      account_type: 'Account type',
      note_account_locked: 'Note: capital and sell accounts cannot be changed after assignment.',
      create_account_permanent_note:
        'Note: the account name can be edited later. Deletion is allowed only when the account has no transactions.',
      create_account_capital_sell_note:
        'Capital and sell accounts can be separate (e.g. capital in USD, sales in AFN) or the same account.',
      create_account_confirm_warn:
        'Please review the details below. The name can be edited later; type and currency cannot change after creation.',
      confirm_create_account_title: 'Confirm create account',
      confirm_create_account: 'Yes, create account',
      transfer_between_accounts: 'Transfer between accounts',
      transfer_from_account: 'From account',
      transfer_to_account: 'To account',
      transfer_same_currency_only: 'Transfers are only possible between same-currency accounts.',
      transfer_need_two_accounts: 'At least two same-currency accounts are required to transfer.',
      transfer_success: 'Transfer recorded.',
      transfer_insufficient_balance: 'Source account does not have enough balance.',
      account_transfers: 'Transfers',
      no_account_transfers: 'No account transfers have been recorded yet.',
      delete_account_transfer: 'Delete transfer',
      confirm_delete_account_transfer: 'Are you sure you want to delete this transfer?',
      confirm_delete_account_transfer_warn:
        'The source and destination account balances will revert to their previous state.',
      account_transfer_deleted: 'Transfer deleted and balances reverted.',
      edit_account_name: 'Edit name',
      account_name_updated: 'Account name updated.',
      company_account_deleted: 'Account deleted.',
      account_card_menu: 'Account options',
      show_inactive_accounts: 'Inactive accounts',
      hide_inactive_accounts: 'Inactive accounts',
      confirm_deactivate_account:
        'Deactivate this account? It will be hidden from the main list and unavailable for new transactions.',
      account_deactivated: 'Account deactivated.',
      account_activated: 'Account activated.',
      cannot_deactivate_capital_or_sell: 'Capital and sales accounts cannot be deactivated.',
      cannot_deactivate_with_balance: 'An account with a balance cannot be deactivated.',
      deposit_to_account: 'Deposit to account',
      withdraw_from_account: 'Withdraw from account',
      cash_added_successfully: 'Added successfully.',
      cash_withdrawn_successfully: 'Withdrawn successfully.',
      confirm_delete_cash_movement: 'Delete this deposit/withdrawal? The account balance will be adjusted.',
      cash_movement_deleted: 'Transaction deleted successfully.',
      remark: 'Remark',
      select: 'Select',
      set_as_capital: 'Set as main capital',
      set_as_sell: 'Set as sales account',
      balance_after: 'Balance after',
      balance_before: 'Balance before',
      transaction_details: 'Transaction details',
      registered_by: 'Registered by',
      transaction_number: 'Transaction number',
      related_source: 'Related document',
      no_related_document: 'No related data.',
      company_dashboard_loading_hint:
        'Financial summaries will appear here once the business dashboard API is available.',
      quick_access: 'Quick access',
      company_modules_hint:
        'Use the sidebar to move between business modules. Some modules will arrive soon.',
      module_coming_soon: 'This module will be available soon in the desktop app.',
      business_status: 'Business status',
      business_status_hint: 'Enable or disable store, production, and service modes from this section.',
      business_status_description:
        'Manage store, production, and service modes here. Re-activation sends a verification code to the owner email.',
      manage_business_status: 'Manage business status',
      company_user_access: 'Company user access',
      company_user_access_hint: 'View users who can access this company and grant access to new users.',
      access_roles_guide_title: 'Access roles guide',
      access_roles_guide_subtitle: 'Before granting access, choose the right role for each user from this list.',
      access_role_badge: 'Access role',
      owner_full_access_note: 'The owner always has full access and cannot be removed from this list.',
      manage_user_access: 'Manage user access',
      parent_company_link: 'Parent company link',
      parent_company_link_hint: 'If this business is a subsidiary, choose or clear its parent company here.',
      manage_parent_company: 'Set parent company',
      data_purge_title: 'Purge all company data',
      data_purge_hint: 'This permanently deletes all company operational data and cannot be undone.',
      data_purge_warning:
        'Warning: after confirmation, all operational data for this company is deleted permanently. The company record and subscription payments remain.',
      data_purge_done: 'Company data purged successfully.',
      go_data_purge: 'Go to data purge checkpoint',
      confirm_data_purge: 'Confirm data purge',
      return: 'Back',
      store_mode_full: 'Store mode',
      store_mode_description: 'When enabled, sales, inventory, items, and related store features are shown.',
      store_mode_active_hint: 'Store features are available.',
      production_mode_full: 'Production mode',
      production_mode_description: 'When enabled, production features become available.',
      production_mode_active_hint: 'Production features are active.',
      service_mode_full: 'Service mode',
      service_mode_description: 'When enabled, service-specific features become available.',
      service_mode_active_hint: 'Service features are active.',
      code_will_send_to: 'Verification code will be sent to',
      send_verification_code: 'Send verification code',
      verification_code: 'Verification code',
      verification_code_sent: 'Verification code sent to your email.',
      verification_code_required: 'Verification code must be 6 digits.',
      resend_code: 'Resend code',
      resend_in: 'Resend in',
      activate: 'Activate',
      deactivate: 'Deactivate',
      capability_activated: 'Activated successfully.',
      capability_deactivated: 'Deactivated successfully.',
      add_user_access: 'Add user access',
      edit_user_access: 'Edit user access',
      delete_user_access: 'Delete user access',
      confirm_delete_access: 'Delete access for',
      owner_password: 'Owner password',
      role: 'Role',
      role_owner: 'Owner',
      company_role_title_owner: 'Owner',
      company_role_description_owner:
        'Full access to every area, including deleting records, managing user access, linking a parent company, and purging company data.',
      company_role_title_admin: 'Admin',
      company_role_description_admin:
        'Full access including deleting records. Cannot remove the owner, link the company to a main company, or purge company data (owner only).',
      company_role_title_manager: 'Manager',
      company_role_description_manager:
        'Full daily operation access without deleting records, without managing user access, and with admin restrictions.',
      company_role_title_sales_full_manager: 'Sales Full Manager',
      company_role_description_sales_full_manager:
        'Can manage sales and purchases with manager restrictions; cannot view reports and cannot delete records.',
      company_role_title_sales_manager: 'Sales Manager',
      company_role_description_sales_manager: 'Can create and manage sales, but cannot delete records.',
      company_role_title_accountant: 'Accountant',
      company_role_description_accountant:
        'Can manage accounts, expenses, salary payments, and financial reports without access settings, destructive deletes, or destructive business settings.',
      company_role_title_analyser: 'Analyser',
      company_role_description_analyser: 'Read-only access to purchases, sales, expenses, and salary payments.',
      company_role_title_hr: 'HR',
      company_role_description_hr: 'Limited to staff management and cannot delete records.',
      granted_by: 'Granted by',
      existing_access: 'Existing access',
      current_parent_company: 'Current parent company',
      parent_already_linked: 'This company is already linked to a parent company.',
      child_companies: 'Child companies',
      has_children_no_parent: 'Because this company has subsidiaries, it cannot link to another parent.',
      select_parent_company: 'Select parent company',
      connect_parent_company: 'Connect to parent company',
      confirm_parent_connect: 'Are you sure you want to connect to this parent company?',
      no_parent_options: 'No eligible parent company was found.',
      add_slider_image: 'Add slider image',
      existing_slider_images: 'Saved images',
      slider: 'Slider',
      no_data: 'Nothing here yet.',
      no_file: 'No file selected.',
      drag_and_drop: 'Drag an image here or click',
      upload_failed: 'Image upload failed.',
      deleted_success: 'Deleted successfully.',
      confirm_delete_slider: 'Are you sure you want to delete this slider image?',
      store_mode: 'Store',
      production_mode: 'Production',
      address: 'Address',
      filter_all: 'All',
      add_customer: 'Add customer',
      add_vendor: 'Add vendor',
      search_by_name: 'Search by name',
      receivables_summary: 'Total receivables from customers',
      payables_summary: 'Total payables to vendors',
      by_currency: 'By currency',
      no_receivables_summary: 'No receivables recorded.',
      no_payables_summary: 'No payables recorded.',
      no_customers: 'No customers found.',
      no_matching_customers: 'No customers match this name.',
      no_matching_vendors: 'No vendors match this name.',
      no_vendors: 'No vendors found.',
      company_name: 'Company name',
      action: 'Action',
      view: 'View',
      more: 'More',
      total_count: 'Total',
      tip_receivables: 'Receivables are shown per account.',
      tip_payables: 'Payables are shown per currency/account.',
      has_receivable: 'Has outstanding receivables',
      has_payable: 'Has outstanding payables',
      customer_setup: 'Customer setup',
      vendor_setup: 'Vendor setup',
      back: 'Back',
      customer_details: 'Customer details',
      vendor_details: 'Vendor details',
      personality: 'Personality',
      personality_human: 'Individual',
      personality_company: 'Company',
      set_previous_receivables: 'Set previous receivables',
      set_previous_payables: 'Set previous payables',
      previous_balance_mode: 'How to record remaining',
      add_previous_balance: 'Add remaining',
      set_previous_balance: 'Adjust remaining',
      add_previous_balance_hint:
        'The entered amount is added to the current remaining on this account. Example: if remaining is 500 and you enter 1000, remaining becomes 1500.',
      set_previous_balance_hint:
        'The remaining on this account is corrected to the entered amount; it is not increased. Example: if remaining is 500 and you enter 1000, remaining becomes 1000, not 1500.',
      current_account_remaining: 'Current remaining on this account',
      remaining_after_save: 'Remaining after save',
      remaining_cannot_be_negative: 'Remaining cannot be negative.',
      general_payment: 'Customer payment',
      customer_payment_signed_hint:
        'Positive amount = receive from customer (even above remaining → business owes customer); negative amount = pay customer (cash out, remaining increases).',
      payment_to_customer: 'Payment to customer',
      business_owes_customer: 'Owes customer',
      vendor_general_pay: 'Pay vendor',
      vendor_payment_signed_hint:
        'Positive amount = pay vendor; negative amount = return prepayment.',
      prepayment: 'Prepayment',
      debt_history: 'Debt history',
      customer_payables_records: 'Customer receivable records',
      customer_payments_list: 'Customer payments',
      customer_purchases: 'Customer purchases',
      vendor_purchases: 'Purchases from vendor',
      invoice_total: 'Total',
      remaining_amount: 'Remaining',
      item_rows: 'Item lines',
      vendor_payables_records: 'Vendor payable records',
      vendor_payments_list: 'Vendor payments',
      no_payables_records: 'No payable records yet.',
      previous_amount: 'Previous amount',
      change_amount: 'Change',
      new_amount: 'New amount',
      confirm_delete_payment_title: 'Confirm delete payment',
      confirm_delete_payment_body:
        'Are you sure you want to delete this payment? This cannot be undone and the customer balance will increase by this amount.',
      payment_linked_to_invoice: 'Linked to invoice — cannot delete',
      payment_linked_to_purchase: 'Linked to purchase — cannot delete',
      debt_reason_manualSetup: 'Manual setup',
      debt_reason_vendorPayment: 'Vendor payment',
      debt_reason_vendorPaymentReversal: 'Vendor payment reversal',
      payments: 'Payments',
      no_payments: 'No payments yet.',
      finalized: 'Finalized',
      draft: 'Draft',
      no_sales: 'No sales found.',
      load_more: 'Load more',
      loading_more: 'Loading…',
      no_purchases: 'No purchases found.',
      no_items: 'No items found.',
      add_purchase: 'Add purchase',
      create_purchase: 'Create purchase',
      purchase_number: 'Purchase number',
      incomplete: 'Incomplete',
      complete: 'Complete',
      complete_purchase: 'Complete purchase',
      vendor_name: 'Vendor name',
      not_assigned: 'Not assigned',
      warehouse_locked_after_items: 'Warehouse cannot be changed after items are added.',
      full_auto_payment_no_vendor:
        'This purchase has no vendor; clicking pay will settle the full amount.',
      perform_payment: 'Make payment',
      barcode_not_found: 'No item found for this barcode.',
      barcode_placeholder: 'Scan or enter barcode...',
      type_to_search_item: 'Search first to show the item list.',
      vendor_required: 'Please select a vendor.',
      exchange_rate_required: 'Enter a valid exchange rate.',
      warehouse_required: 'Please select a warehouse.',
      company_account: 'Company account',
      sale_bill_currency: 'Sale currency of this bill',
      continue: 'Continue',
      delete_draft_purchase: 'Delete draft purchase',
      delete_purchase_confirm_title: 'Confirm purchase deletion',
      delete_purchase_confirm_message: 'Are you sure you want to delete this purchase?',
      delete_purchase_effects_title: 'Deleting will:',
      delete_purchase_effects_1: 'Remove all items on this purchase.',
      delete_purchase_effects_2: 'Reduce inventory by the quantities added here.',
      delete_purchase_effects_3: 'Only draft purchases can be deleted.',
      delete_purchase_effects_4: 'This action cannot be undone.',
      confirm_back_to_edit_purchase: 'Are you sure you want to reopen this purchase for editing?',
      reopen_purchase_for_edit: 'Reopen purchase for edit',
      serial_required: 'Serial number is required.',
      price_required: 'Unit price is invalid.',
      quantity_required: 'Quantity is invalid.',
      equivalent: 'Equivalent',
      nothing_to_pay: 'Nothing left to pay.',
      no_warehouses: 'No active warehouses found.',
      search_vendor_placeholder: 'Search by vendor name...',
      select_item: 'Select item',
      required_field: 'This field is required.',
      without_customer: 'Without customer',
      without_vendor: 'Without vendor',
      exchange_rate: 'Exchange rate',
      add_item: 'Add item',
      add_raw_material: 'Add raw material',
      download_items_excel_template: 'Download Excel template',
      export_items_excel: 'Export Excel',
      import_items_excel: 'Import from Excel',
      importing_items_excel: 'Importing…',
      items_excel_import_success: '{{count}} item(s) imported successfully.',
      items_excel_import_partial: '{{imported}} imported; {{failed}} row(s) had errors.',
      no_raw_materials: 'No raw materials found.',
      no_matching_items_filter: 'No items match these filters.',
      search_by_code: 'Filter by code',
      all_categories: 'All categories',
      no_category: 'No category',
      all_inventory_locations: 'All stock (company + warehouse)',
      company_stock_only: 'Company stock only',
      all_inventory: 'All inventory',
      zero_inventory: 'Zero stock only',
      positive_inventory: 'Positive stock only',
      sort_default: 'Default sort',
      sort_stock_high_to_low: 'Stock: high to low',
      sort_stock_low_to_high: 'Stock: low to high',
      filters: 'Filters',
      inventory_summary: 'Inventory summary',
      inventory_purchase_value_total: 'Total inventory value before sales',
      total_inventory_quantity: 'Total inventory quantity',
      company_stock: 'Company',
      warehouse_stock: 'Warehouse',
      capital_currency_missing: 'Set a capital account to show inventory value in capital currency.',
      inventory_valuation_partial: 'Some items could not be valued due to missing exchange rate or purchase cost.',
      stock_status_legend: 'Stock status legend',
      in_stock_status: 'In stock',
      low_stock_alert: 'Stock has reached the warning level',
      out_of_stock_alert: 'This item is out of stock',
      purchase_cost: 'Purchase cost',
      inventory_value_capital: 'Inventory value in capital currency',
      sale_price_label: 'Sale price',
      inventory: 'Inventory',
      show_barcode: 'Show barcode',
      confirm_delete_item: 'Delete item',
      confirm_delete_item_body: 'Are you sure you want to delete this item? This cannot be undone.',
      not_deletable: 'Not deletable',
      item_category: 'Category',
      unit_label: 'Unit',
      unit_small: 'Small unit (base)',
      unit_medium: 'Medium unit',
      unit_large: 'Large unit',
      unit_to_base_qty: 'Equals small units',
      unit_scale_hint: 'Stock is always stored in the small unit. Medium and large are optional.',
      measure_unit: 'Unit of measure',
      quantity: 'Quantity',
      price: 'Price',
      inventory_purchase_value_capital: 'Inventory value in capital currency',
      minimum_stock_level: 'Minimum stock for alert',
      show_on_website: 'Public (shown on website)',
      yes: 'Yes',
      no: 'No',
      average_cost_history: 'Average cost history',
      download_item_card: 'Download as image',
      no_code: 'No code is set for this item.',
      double_click_to_download: 'Double-click to download',
      item_details: 'Item details',
      item_specs: 'Item specifications',
      brand: 'Brand',
      color: 'Color',
      generation: 'Generation',
      storage: 'Storage',
      item_type: 'Item type',
      item_type_normal: 'Normal',
      item_type_digital: 'Digital',
      avg_purchase_cost: 'Average purchase cost',
      add_inventory: 'Add to inventory',
      upload_image: 'Upload image',
      set_sale_price: 'Set sale price',
      reload: 'Reload',
      inventory_history: 'Inventory history',
      opening_inventory: 'Opening inventory',
      purchases_without_warehouse: 'Purchases without warehouse',
      no_inventory: 'No records found.',
      no_matching_inventory: 'No records match this filter.',
      vendor: 'Vendor',
      total: 'Total',
      purchase: 'Purchase',
      delete_inventory_confirm: 'Are you sure you want to delete this record?',
      sell_account_missing: 'Company sell account is not configured.',
      unit_cost: 'Unit cost',
      capital_account: 'Capital account',
      image: 'Image',
      image_required: 'Selecting an image is required.',
      item_image_crop_hint:
        'Crop the image to a square (1:1). Selected file size is unrestricted; upload is compressed to at most 256KB.',
      item_image_compress_failed: 'Could not compress the image under 256KB. Please choose another photo.',
      product_bom_title: 'Production components',
      product_bom_hint: 'Raw materials needed for one unit',
      setup_bom: 'Set up components',
      no_bom_components: 'No components configured.',
      clear_all: 'Clear all',
      clear_bom_confirm: 'Clear all production components?',
      add_row: 'Add row',
      latest: 'Latest',
      no_records: 'No records found.',
      code: 'Code',
      business_profile: 'Profile',
      company_subscription_page_title: 'Validity & subscriptions',
      company_subscription_validity: 'Current validity',
      company_subscription_history: 'Subscription history',
      update_logo: 'Update company logo',
      username: 'Username',
      company_info: 'Details',
      name_dari: 'Dari name',
      name_pashto: 'Pashto name',
      name_uzbek: 'Uzbek name',
      name_english: 'English name',
      address_dari: 'Dari address',
      address_pashto: 'Pashto address',
      address_uzbek: 'Uzbek address',
      address_english: 'English address',
      whatsapp: 'WhatsApp',
      your_website_link: 'Your website link',
      copy_link: 'Copy link',
      visit_website: 'Visit website',
      copied_success: 'Copied successfully!',
      renew: 'Renew',
      update_company_name: 'Edit company name',
      name_update_note: 'Company name changes are stored permanently.',
      set_username: 'Set username',
      invalid_slug: 'Invalid username',
      slug_once_note: 'Username is usually set only once.',
      update_company_profile: 'Update company details',
      drag_and_drop_image: 'Drop an image here or choose one',
      zoom: 'Zoom',
      payable_amount: 'Payable amount',
      insufficient_wallet: 'Insufficient wallet balance.',
      payment_success: 'Payment successful.',
      discount: 'Discount',
      discount_percent: 'Discount percent',
      discount_amount: 'Discount amount',
      discount_exceeds_total: 'Discount cannot exceed the invoice total.',
      company_payment_title: 'Payment for renewal',
      company_payment_details: 'This payment extends company validity.',
      company_payment_note1: 'This payment is non-refundable.',
      company_payment_plan_info_month:
        'You selected the monthly plan; company validity will be extended by one month.',
      company_payment_plan_info_year:
        'For annual plans, the first year uses the current tariff; extra years use the standard rate with renewal discount.',
      company_payment_price_prefix: 'For this renewal you must pay',
      company_payment_price_suffix: '.',
      company_payment_note2: 'Check your wallet balance before paying.',
      renew_duration: 'Select renewal duration',
      annual_base_fee: 'Annual rate',
      original_price: 'Regular amount',
      valid_until_with_renew: 'Validity after renewal',
      finalize_payment: 'Finalize payment',
      payment_mode: 'Payment mode',
      pay_full: 'Full payment',
      pay_partial: 'Partial payment',
      pay_remaining: 'Leave remaining',
      awaiting_payment: 'Awaiting payment',
      delete: 'Delete',
      quick_sale: 'Quick sale',
      easy_sale: 'Easy sale',
      easy_sale_intro: 'Create a new bill to start an easy sale.',
      easy_sale_new: 'New easy sale',
      easy_sale_view: 'Easy view',
      unsaved_sale_leave_title: 'Unsaved data',
      unsaved_sale_leave_message:
        'Added items are not saved to the database yet. If you leave this page, those items will be removed from the bill.',
      unsaved_sale_leave_confirm: 'Leave page',
      start_easy_sale: 'Start easy sale',
      easy_sale_pay: 'Paid amount',
      easy_sale_full_payment_required: 'Without a customer, paid amount must exactly equal total.',
      search_customer: 'Search customer...',
      scan_barcode: 'Scan barcode',
      camera_permission_required: 'Camera access is required to scan barcodes.',
      allow_camera: 'Allow camera access',
      camera_unavailable: 'Camera is unavailable. Enter the barcode manually.',
      barcode: 'Barcode',
      transfer_to_warehouse: 'Transfer to warehouse',
      warehouse: 'Warehouse',
      complete_items: 'Complete items',
      needs_exchange_rate: 'Exchange rate is required',
      exchange_rate_pair: 'Exchange rate ({{from}}) to ({{to}})',
      exchange_rate_direction: 'Rate direction: {{from}} to {{to}}',
      latest_exchange_rate: 'Latest company exchange rate',
      sale_step_customer: 'Customer',
      sale_step_items: 'Items',
      sale_step_payment: 'Payment',
      sale_step_complete: 'Complete',
      next_step: 'Next step',
      prev_step: 'Previous step',
      expense_fields_list: 'Expense sections list',
      manage_expense_fields: 'Manage expense sections',
      add_expense: 'Add expense',
      edit_expense: 'Edit expense',
      expense_list: 'Expenses table',
      no_expenses: 'No expenses found',
      no_expense_fields: 'No expense sections found',
      account_code: 'Section code',
      account_name: 'Section name',
      bill_number: 'Bill number',
      spender: 'Spender',
      creator: 'Creator',
      confirm_delete_expense: 'Confirm expense deletion',
      delete_expense_confirm: 'Are you sure you want to delete this expense? This cannot be undone.',
      select_account: 'Select account',
      cancel: 'Cancel',
      unknown: 'Unknown',
      invoice_details: 'Invoice details',
      invoice_number: 'Invoice number',
      invoice_summary: 'Invoice summary',
      paid_amount: 'Paid',
      remaining_balance: 'Remaining',
      previous_remaining: 'Previous remaining',
      total_remaining: 'Total remaining',
      paid_amount_covers_previous_hint: 'If the paid amount is more than the bill, the extra reduces previous remaining.',
      confirm_delete_item_from_invoice: 'Remove this item from the invoice?',
      delete_draft_sale: 'Delete draft invoice',
      only_draft_deletable: 'Only draft invoices can be deleted',
      delete_sale_confirm_title: 'Confirm invoice deletion',
      delete_sale_confirm_message: 'Are you sure you want to delete this invoice?',
      delete_sale_effects_title: 'Deleting will:',
      delete_sale_effects_1: 'Remove all lines on this invoice.',
      delete_sale_effects_2: 'Return sold quantities back to stock.',
      delete_sale_effects_3: 'Only draft invoices can be deleted (no payment/debt).',
      delete_sale_effects_4: 'This action cannot be undone.',
      delete_sale_second_confirm: 'Second confirmation: confirm again to permanently delete.',
      confirm_delete_step_one: 'I understand — continue',
      confirm_delete: 'Yes, delete',
      back_to_edit_sale: 'Back to edit',
      confirm_back_to_edit_sale: 'Are you sure you want to reopen this invoice for editing?',
      search_item: 'Search by item name',
      search_item_placeholder: 'Search by name, barcode or serial...',
      barcode_scan_placeholder: 'Scan barcode',
      no_matching_items: 'No matching items found.',
      find: 'Find',
      item_not_found: 'No item found for this barcode.',
      insufficient_stock: 'Not enough stock.',
      item_sale_price_required: 'This item has no sale price. Set the sale price first.',
      item_purchase_cost_required: 'This item has no valid purchase cost. Record a purchase cost first.',
      serial_number: 'Serial number',
      reset_item_price: 'Reset to default sale price',
      go_to_payment: 'Go to payment',
      invoice_rate_missing: 'Exchange rate is missing on this invoice. Set it in the customer step first.',
      payment: 'Payment',
      total_payable: 'Total amount due',
      without_customer_payment_hint:
        'This invoice has no customer; completing records full payment.',
      enter_paid_amount: 'Enter paid amount',
      paid_amount_positive: 'Paid amount must be greater than zero.',
      paid_amount_not_exceed: 'Paid amount cannot exceed the bill total plus previous remaining.',
      complete_without_customer: 'Complete',
      finalize_full_payment: 'Complete with full payment',
      finalize_partial_payment: 'Complete with partial payment',
      finalize_remaining_only: 'Complete with full remaining',
      add_more_item: 'Add another item',
      total_items: 'Total items',
      barcode_item_added: 'Item added to invoice.',
      dash_price_search: 'Item price',
      dash_tools: 'Tools',
      dash_price_search_placeholder: 'Search item price — name or barcode...',
      dash_price_search_hint: 'Type a name or barcode to see the sale price.',
      dash_price_not_set: 'Sale price not set',
      invoice_empty: 'Invoice is empty. Scan an item first.',
      print_invoice: 'Print invoice',
      print_with_equivalent: 'Print with equivalent',
      print_invoice_a5: 'Print invoice A5',
      print_invoice_80mm: 'Print invoice 80mm',
      download_pdf_a5: 'Download PDF A5',
      download_pdf_a4: 'Download PDF A4',
      download_pdf_80mm: 'Download PDF 80mm',
      download_image_a5: 'Download image A5',
      download_image_80mm: 'Download image 80mm',
      payment_receipt: 'Payment receipt',
      payment_receipt_number: 'Receipt number',
      payment_row_menu: 'Payment options',
      invoice_export_failed: 'Failed to prepare the export file.',
      invoice_saved_to_ishanch: 'File saved to the Hamyan folder on the Desktop.',
      customer_name: 'Customer name',
      unit_price: 'Unit price',
      unit_price_short: 'Unit',
      price_per_unit: 'Unit price',
      total_cost: 'Total cost',
      ram_capacity: 'RAM',
      storage_capacity: 'Storage',
      invoice_item_details: 'Details',
      add_invoice_note: 'Add note',
      edit_invoice_note: 'Edit note',
      invoice_note_placeholder: 'Write the invoice note...',
      invoice_note_saved: 'Note saved.',
      sale_date: 'Sale date',
      purchase_date: 'Purchase date',
      date_picker_today: 'Today',
      date_picker_clear: 'Clear',
      add_staff: 'Add staff',
      edit_staff: 'Edit staff',
      no_staff: 'No staff found.',
      position: 'Position',
      first_name: 'First name',
      last_name: 'Last name',
      contract: 'Contract',
      contracts: 'Contracts',
      monthly_salary: 'Monthly salary',
      pay_salary: 'Pay salary',
      documents: 'Documents',
      terminate_contract: 'Terminate contract',
      start_date: 'Start date',
      end_date: 'End date',
      termination_date: 'Termination date',
      termination_reason: 'Termination reason',
      salary_month: 'Salary month',
      payment_date: 'Payment date',
      attachment: 'Attachment',
      hire_date: 'Hire date',
      active_contract: 'Active contract',
      no_active_contract: 'No active contract available for salary payment.',
      payable_to_today: 'Payable to today',
      payable_to_end_of_month: 'Payable to end of month',
      payable_to_end_of_contract: 'Payable to end of contract',
      remaining_to_today: 'Remaining to today',
      remaining_to_end_of_month: 'Remaining to end of month',
      remaining_to_end_of_contract: 'Remaining to end of contract',
      paid_amount_staff: 'Paid',
      remaining_allowed: 'Remaining payable',
      add_staff_contract: 'Add employment contract',
      edit_staff_contract: 'Edit employment contract',
      show_active_contract: 'View active contract',
      staff_contract: 'Employment contract',
      no_staff_contract: 'No employment contract has been registered yet.',
      contract_history: 'Completed and terminated contracts',
      no_contract_history: 'No completed or terminated contracts.',
      salary_payments: 'Salary payments',
      no_salary_payments: 'No salary payments registered.',
      add_staff_document: 'Add document',
      no_staff_documents: 'No documents registered.',
      document_title: 'Title',
      file: 'File',
      download: 'Download',
      created_at: 'Created at',
      jalali_equivalent: 'Solar equivalent',
      contract_status_active: 'Active',
      contract_status_ended: 'Ended',
      contract_status_terminated: 'Terminated',
      contract_details: 'Contract details',
      this_contract_summary: 'This contract summary',
      contract_settled: 'Settled',
      contract_settled_hint: 'There is no remaining payable amount for this contract.',
      closed_contract_paid: 'No remaining payable amount for this contract.',
      previous_contract_info:
        'The previous contract has ended or been terminated; you can add a new contract now.',
      active_contract_summary: 'Active contract summary',
      confirm_delete_salary_payment:
        'Are you sure you want to delete this salary payment? The amount will be returned to the company account.',
      confirm_delete_document: 'Are you sure you want to delete this document?',
      document_title_file_required: 'Enter a title and choose a file.',
      related_contract: 'Contract #',
      add_payment_document: 'Add payment document',
      replace_payment_document: 'Replace payment document',
      add_staff_absence: 'Record absence',
      absence_date: 'Absence date',
      absences: 'Absences',
      absence_days: 'Absence days',
      no_absences: 'No absences recorded.',
      no_staff_with_active_contract: 'No staff with an active contract.',
      confirm_delete_absence: 'Are you sure you want to delete this absence?',
      affiliate_account: 'Affiliate account',
      affiliate_dashboard_card_title: 'You are a Hamyan affiliate',
      affiliate_dashboard_card_desc:
        'See your partnership share, account status, and invitations made after your affiliate account was created.',
      affiliate_percentage: 'Partnership share',
      affiliate_active: 'Active',
      affiliate_inactive: 'Inactive',
      affiliate_since: 'Since',
      affiliate_invitations: 'Affiliate invitations',
      affiliate_invitations_hint:
        'Only invitations registered after your affiliate account was created are shown here.',
      affiliate_no_invitations: 'No invitations have been registered since your affiliate account was created.',
      affiliate_open_page: 'Open affiliate page',
      affiliate_page_title: 'Affiliate account',
      affiliate_invite_link: 'Affiliate invite link',
      affiliate_how_title: 'How affiliate earnings work',
      affiliate_how_invite:
        'For each successful invitation, you earn {{amount}} AFN.',
      affiliate_how_percent:
        'From the payments of all your affiliate invitations, you earn your affiliate percentage.',
      affiliate_how_example:
        'For example, from every {{base}} AFN, {{percent}}% = {{amount}} AFN',
      affiliate_how_wallet:
        'Invitation rewards and percentage earnings are added to your Hamyan wallet and can be withdrawn at any time.',
      affiliate_open_wallet: 'Open Hamyan wallet',
      affiliate_apply_title: 'Apply to be a Hamyan affiliate',
      affiliate_apply_desc:
        'Share your social media links and tell us why you want to become a Hamyan affiliate.',
      affiliate_apply_form_title: 'Application form',
      affiliate_apply_social_hint: 'At least one social media link is required.',
      affiliate_apply_unavailable: 'Affiliate applications are not available right now.',
      affiliate_capacity_full:
        'Affiliate capacity is full (max {{count}} people). New applications are not accepted.',
      affiliate_apply_card_title: 'Become a Hamyan affiliate',
      affiliate_apply_card_desc:
        'Submit your social links and motivation to request an affiliate account.',
      affiliate_apply_card_cta: 'Submit affiliate request',
      affiliate_apply_card_pending_title: 'Affiliate request under review',
      affiliate_apply_card_pending_desc: 'Your request has been submitted and is awaiting review.',
      affiliate_apply_card_pending_cta: 'View request status',
      affiliate_social_facebook: 'Facebook',
      affiliate_social_instagram: 'Instagram',
      affiliate_social_telegram: 'Telegram',
      affiliate_social_tiktok: 'TikTok',
      affiliate_social_youtube: 'YouTube',
      affiliate_social_whatsapp: 'WhatsApp',
      affiliate_social_other: 'Other social',
      affiliate_request_reason: 'Why do you want to be a Hamyan affiliate?',
      affiliate_request_reason_hint: 'Write at least 20 characters.',
      affiliate_request_reason_placeholder:
        'For example your audience, experience promoting products, and your plan to introduce Hamyan…',
      affiliate_request_submit: 'Submit request',
      affiliate_request_success: 'Your affiliate request was submitted and is under review.',
      affiliate_request_status_title: 'Request status',
      affiliate_request_status_pending: 'Under review',
      affiliate_request_status_approved: 'Approved',
      affiliate_request_status_rejected: 'Rejected',
      affiliate_request_pending_desc: 'You will be notified after the review.',
      affiliate_request_rejected_desc:
        'This request was rejected. You can update your details and apply again.',
      affiliate_request_admin_note: 'Review note',
      affiliate_request_submitted_at: 'Submitted on {{date}}',
      invitee_page_title: 'Invited user profile',
      invitee_open_whatsapp: 'Message on WhatsApp',
      invitee_no_whatsapp: 'No WhatsApp number registered.',
      username_invalid_hint:
        'Username must start with a letter and use only lowercase letters, numbers, and underscores (3–30 characters).',
      username_cooldown_rule: 'You can change your username once every {{days}} days.',
      username_cooldown_hint: 'About {{days}} day(s) remain until the next change is allowed.',
      username_updated_success: 'Username updated successfully.',
      username_history: 'Username change history',
      username_history_empty: 'No username changes have been recorded yet.',
    },
  },
}

export default desktopResources
