export const STORAGE_KEYS = {
  ACCESS_TOKEN: '@@POS-PORTAL:TOKEN',
  LEGACY_ACCESS_TOKEN: 'access_token',
  PORTAL_SESSION: '@@WEB_POS_PORTAL',
  THEME_MODE: 'themeMode',
  LAYOUT: 'layout',
  TENANT_BRANCHES: 'TENANT_BRANCHS',
  RBAC_TREE: '@@RBAC_TREE',
  RBAC_ROLES: '@@RBAC_ROLES',
  PRODUCTS: 'SEED_PRODUCTS_DATA',
  CUSTOMERS: '@@SEED_CUSTOMERS_DATA',
  AUDIT_LOG: 'WEB_POS_AUDIT_LOG',
  UI_AUDIT_LOGS: 'ui_audit_logs',
  USER_ID: 'userId',
  PROMO_PRESETS: 'pos_promo_presets',
  POS_CONSOLE_MENUS: 'pos_console_menus',
  POS_PROMOTIONS: 'pos_promotions',
  PROMOTIONS_LIST: 'pos_promotions_list',
  PRINTER_CONFIG: 'k80_printer_config',
} as const;

export const STORAGE_KEY_PREFIXES = {
  OIDC_USER: 'oidc.user:',
} as const;

export type StorageKey = typeof STORAGE_KEYS[keyof typeof STORAGE_KEYS];
