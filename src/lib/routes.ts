export function getPageTitleKey(pathname: string): string {
  if (pathname.startsWith('/business/')) {
    const parts = pathname.split('/').filter(Boolean)
    // ['business', ':id', maybe nested path like 'warehouses/inventory']
    const nested = parts.slice(2).join('/')
    if (!nested) return 'company_dashboard'
    const map: Record<string, string> = {
      profile: 'nav_profile',
      subscription: 'company_subscription_page_title',
      customers: 'customers',
      vendors: 'vendors',
      staff: 'staff',
      accounts: 'company_accounts',
      'accounts/transfers': 'account_transfers',
      warehouses: 'warehouses',
      'warehouses/inventory': 'warehouse_inventory',
      'warehouses/transfers': 'warehouse_transfers',
      inventory: 'warehouse_inventory',
      sale: 'sale',
      'easy-sale': 'easy_sale',
      sales: 'sales',
      'sales-daily-report': 'daily_sales_report',
      'sales-profit-report': 'profit_report',
      'sales-profit-loss-report': 'profit_loss_report',
      journal: 'journal',
      expenses: 'expenses',
      items: 'items_products',
      packages: 'packages',
      'package-sale': 'sell_package',
      'customer-packages': 'customer_packages',
      'raw-materials': 'raw_materials',
      productions: 'productions',
      'item-categories': 'item_categories',
      purchase: 'create_purchase',
      purchases: 'purchases',
      notifications: 'business_notifications',
      'activity-logs': 'activity_logs',
      settings: 'nav_settings',
      website: 'website',
    }
    return map[nested] ?? map[parts[2] ?? ''] ?? 'company_dashboard'
  }

  const PAGE_TITLE_KEYS: Record<string, string> = {
    '/': 'home_page_title',
    '/dashboard': 'nav_dashboard',
    '/affiliate': 'affiliate_page_title',
    '/profile': 'nav_profile',
    '/wallet': 'nav_wallet',
    '/wallet/transfer': 'wallet_transfer',
    '/wallet/withdraw': 'wallet_withdraw',
    '/wallet/deposits': 'deposits',
    '/wallet/bonuses': 'bonuses',
    '/accounts': 'nav_accounts',
    '/incomes': 'hy_incomes_page',
    '/expenses': 'expenses_page',
    '/expense-analysis': 'expense_analysis',
    '/guide': 'hy_guide_page',
    '/counterparties': 'nav_counterparties',
    '/counterparties/transactions': 'counterparty_transactions',
    '/companies': 'nav_companies',
    '/notifications': 'user_notifications',
    '/settings': 'nav_settings',
    '/premium': 'nav_premium',
    '/login': 'login_heading',
    '/register': 'register_heading',
    '/forgot-password': 'forgot_password_heading',
    '/reset-password': 'reset_password_heading',
    '/download': 'download_apps',
    '/affiliates': 'public_affiliate_title',
    '/resellers': 'reseller_directory_title',
    '/become-reseller': 'reseller_title',
    '/subscription-pricing': 'subscription_pricing_title',
    '/reseller': 'reseller_page_title',
    '/reseller/apply': 'reseller_apply_title',
    '/reseller/sell': 'reseller_sell_page_title',
    '/help': 'help_center',
    '/exchange-rates': 'exchange_rates_title',
    '/terms': 'terms',
    '/policies': 'policies',
    '/reseller-terms': 'reseller_terms_title',
  }

  if (pathname.startsWith('/invitee/') || pathname.startsWith('/users/')) {
    return 'invitee_page_title'
  }

  if (pathname.startsWith('/reset-password')) {
    return 'reset_password_heading'
  }

  if (pathname.startsWith('/help/')) {
    return 'help_center'
  }

  if (pathname.startsWith('/exchange-rates/')) {
    return 'exchange_rates_title'
  }

  if (pathname.startsWith('/counterparties/')) {
    return PAGE_TITLE_KEYS[pathname] ?? 'nav_counterparties'
  }

  return PAGE_TITLE_KEYS[pathname] ?? 'home_page_title'
}
