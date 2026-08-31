export interface PermissionTreeNode {
  key: string;
  title: string;
  type: 'module' | 'menu' | 'ui_section' | 'action';
  code: string;
  path?: string;
  description?: string;
  children?: PermissionTreeNode[];
}

export interface UserProfile {
  id: string;
  username: string;
  name: string;
  email: string;
  roleTitle: string;
  roles: string[];
  allowedUrls: string[];
  buttonPermissions: string[];
  avatarBg: string;
  description: string;
  jwtToken: string;
  isExpired?: boolean;
}

// Temporary test mode: RBAC is currently mocked, so keep every route/action open
// while validating real app modules. Set this to false when real permissions are wired.
export const RBAC_BYPASS_FOR_TESTING = true;

export function isRbacBypassEnabled(): boolean {
  return RBAC_BYPASS_FOR_TESTING || String(import.meta.env.VITE_RBAC_BYPASS || '').toLowerCase() === 'flase';
}

export const REAL_IDENTITY_SERVER_JWT = `eyJhbGciOiJSUzI1NiIsImtpZCI6IkFCMzREQTJFRTcxMTIxRjhDRkFEQ0RFMDg3MjI0MEQzIiwidHlwIjoiYXQrand0In0.eyJuYmYiOjE3ODUyNTE3MjEsImV4cCI6MTc4NTI1NTMyMSwiaXNzIjoiaHR0cHM6Ly9pZGVudGl0eXNlcnZlci5iaXRpc2dyb3VwLnZuIiwiYXVkIjoic2tvcnViYV9pZGVudGl0eV9hZG1pbl9hcGkiLCJjbGllbnRfaWQiOiJza29ydWJhX2lkZW50aXR5X2FkbWluX2FwaV9zd2FnZ2VydWkiLCJzdWIiOiJkODA0NDlhYy0wNmYzLTQ4OGEtOTFiYy1jNDY4NGU0MTRmOTciLCJhdXRoX3RpbWUiOjE3ODUyNTE3MjEsImlkcCI6ImxvY2FsIiwibmFtZSI6IkTGsMahbmcgQ2jDrSBE4bqrbiIsInJvbGUiOlsiU2tvcnViYUlkZW50aXR5QWRtaW5BZG1pbmlzdHJhdG9yIiwiSWRlbnRpdHlCaXRpc0FkbWluQWRtaW5pc3RyYXRvciJdLCJlbWFpbCI6ImNoaWRhbjI0MTBAZ21haWwuY29tIiwianRpIjoiQjEwOTJEQUZDODQ1MjkyMkE2Q0YyNjE2RUMwRjdFRjgiLCJpYXQiOjE3ODUyNTE3MjEsInNjb3BlIjpbInNrb3J1YmFfaWRlbnRpdHlfYWRtaW5fYXBpIl0sImFtciI6WyJwd2QiXX0.OOcM46xQEkZP1237GDdm49qN8lntUQ19vqaOocUaDpCcK8vA2e_QqOgim18CXLIjugNRFDRnailnn-lHMRTJus992SWrDwK7KB8-tqNnD7zAZDfmkBVP4nbb37CSd5e_NwYFIH01LJ_zjVLggNJkxZ5b05X8DwUhqKh9og3_JWbv88i6-TugVoALqo0VUCRW5Gy2gQkEF7pMBpGKIpz4m0DRwU8o4O1wBNspC89RsgBMrMyQY2eV620vMR9WsVfmAjrLdlnIWhb1lUnWmcSOJ11CyI9QZKncxmbrxRPg1lhVGQQG48vqADgK3VGF3qAuyjjTWhltDC3obxI6eDHRvw`;

// Hierarchical Permission Tree Architecture (Rễ cây Phân quyền Cấp bậc UI)
export const UI_PERMISSION_TREE: PermissionTreeNode[] = [
  {
    key: 'mod_sales',
    title: 'Quản lý Bán hàng & POS (Sales & POS)',
    type: 'module',
    code: 'mod_sales',
    description: 'Phân hệ xử lý đơn hàng, kho sản phẩm, khách hàng & khuyến mãi',
    children: [
      {
        key: 'menu_sales_orders',
        title: 'Đơn hàng & POS (/sales/orders)',
        type: 'menu',
        code: 'menu_sales_orders',
        path: '/sales/orders',
        children: [
          {
            key: 'ui_orders_filter',
            title: 'Khung Tìm kiếm & Bộ lọc Đơn hàng',
            type: 'ui_section',
            code: 'ui_orders_filter',
            children: [
              { key: 'btn_orders_search', title: 'Nút Tìm kiếm đơn hàng', type: 'action', code: 'sales.orders.btn_search' },
              { key: 'btn_orders_reset', title: 'Nút Xóa bộ lọc tìm kiếm', type: 'action', code: 'sales.orders.btn_reset' }
            ]
          },
          {
            key: 'ui_orders_table',
            title: 'Bảng Danh sách Đơn hàng & Thao tác',
            type: 'ui_section',
            code: 'ui_orders_table',
            children: [
              { key: 'btn_orders_create', title: 'Nút Tạo đơn hàng mới (POS)', type: 'action', code: 'sales.orders.btn_create' },
              { key: 'btn_orders_cancel', title: 'Nút Hủy đơn hàng (Cancel Order)', type: 'action', code: 'sales.orders.btn_cancel' },
              { key: 'btn_orders_export', title: 'Nút Xuất file Excel báo cáo đơn', type: 'action', code: 'sales.orders.btn_export' }
            ]
          },
          {
            key: 'ui_orders_modal_print',
            title: 'Modal In Hóa đơn VAT (VAT Invoice Modal)',
            type: 'ui_section',
            code: 'ui_orders_modal_print',
            children: [
              { key: 'btn_orders_print', title: 'Nút In Hóa đơn VAT & Xem trước', type: 'action', code: 'sales.orders.btn_print' }
            ]
          }
        ]
      },
      {
        key: 'menu_sales_products',
        title: 'Sản phẩm & Tồn kho (/sales/products)',
        type: 'menu',
        code: 'menu_sales_products',
        path: '/sales/products',
        children: [
          {
            key: 'ui_products_table',
            title: 'Bảng Quản lý Danh mục Sản phẩm',
            type: 'ui_section',
            code: 'ui_products_table',
            children: [
              { key: 'btn_products_create', title: 'Nút Thêm sản phẩm mới', type: 'action', code: 'sales.products.btn_create' },
              { key: 'btn_products_edit', title: 'Nút Sửa thông tin sản phẩm', type: 'action', code: 'sales.products.btn_edit' },
              { key: 'btn_products_delete', title: 'Nút Xóa sản phẩm', type: 'action', code: 'sales.products.btn_delete' }
            ]
          }
        ]
      },
      {
        key: 'menu_sales_customers',
        title: 'Quản lý Khách hàng (/sales/customers)',
        type: 'menu',
        code: 'menu_sales_customers',
        path: '/sales/customers',
        children: [
          {
            key: 'ui_customers_table',
            title: 'Bảng Khách hàng & Điểm tích lũy',
            type: 'ui_section',
            code: 'ui_customers_table',
            children: [
              { key: 'btn_customers_create', title: 'Nút Thêm khách hàng mới', type: 'action', code: 'sales.customers.btn_create' },
              { key: 'btn_customers_export', title: 'Nút Xuất danh sách khách hàng', type: 'action', code: 'sales.customers.btn_export' }
            ]
          }
        ]
      },
      {
        key: 'menu_sales_promotions',
        title: 'Chương trình Khuyến mãi (/sales/promotions)',
        type: 'menu',
        code: 'menu_sales_promotions',
        path: '/sales/promotions',
        children: [
          {
            key: 'ui_promotions_table',
            title: 'Bảng Mã giảm giá & Ưu đãi',
            type: 'ui_section',
            code: 'ui_promotions_table',
            children: [
              { key: 'btn_promotions_create', title: 'Nút Tạo chương trình khuyến mãi', type: 'action', code: 'sales.promotions.btn_create' }
            ]
          }
        ]
      }
    ]
  },
  {
    key: 'mod_system',
    title: 'Quản lý Hệ thống (System Administration)',
    type: 'module',
    code: 'mod_system',
    description: 'Cấu hình phân quyền RBAC, Audit logs, VAT & Biểu mẫu',
    children: [
      {
        key: 'menu_system_rbac',
        title: 'Phân quyền & Vai trò RBAC (/system/rbac)',
        type: 'menu',
        code: 'menu_system_rbac',
        path: '/system/rbac',
        children: [
          {
            key: 'ui_rbac_tree',
            title: 'Cây Phân quyền UI & Ma trận Vai trò',
            type: 'ui_section',
            code: 'ui_rbac_tree',
            children: [
              { key: 'btn_rbac_create_role', title: 'Nút Tạo Vai trò / Chức danh mới', type: 'action', code: 'system.rbac.btn_create_role' },
              { key: 'btn_rbac_save', title: 'Nút Lưu Cấu hình Phân quyền Cây UI', type: 'action', code: 'system.rbac.btn_save' }
            ]
          }
        ]
      },
      {
        key: 'menu_system_vat',
        title: 'Cấu hình UI VAT (/system/vat-config)',
        type: 'menu',
        code: 'menu_system_vat',
        path: '/system/vat-config',
        children: [
          {
            key: 'ui_vat_form',
            title: 'Biểu mẫu Thiết lập Thuế VAT & Hóa đơn',
            type: 'ui_section',
            code: 'ui_vat_form',
            children: [
              { key: 'btn_vat_save', title: 'Nút Lưu Cấu hình VAT Hệ thống', type: 'action', code: 'system.vat.btn_save' }
            ]
          }
        ]
      },
      {
        key: 'menu_system_audit',
        title: 'Nhật ký Audit Logs (/system/audit-logs)',
        type: 'menu',
        code: 'menu_system_audit',
        path: '/system/audit-logs',
        children: [
          {
            key: 'ui_audit_table',
            title: 'Bảng Nhật ký Lịch sử Thao tác',
            type: 'ui_section',
            code: 'ui_audit_table',
            children: [
              { key: 'btn_audit_export', title: 'Nút Xuất file Excel Audit Logs', type: 'action', code: 'system.audit.btn_export' },
              { key: 'btn_audit_delete', title: 'Nút Xóa Lịch sử Log (Nguy hiểm)', type: 'action', code: 'system.audit.btn_delete' }
            ]
          }
        ]
      },
      {
        key: 'menu_system_forms',
        title: 'Biểu mẫu Đăng ký VAT (/system/forms)',
        type: 'menu',
        code: 'menu_system_forms',
        path: '/system/forms',
        children: [
          {
            key: 'ui_forms_table',
            title: 'Danh sách Mẫu Biểu mẫu Doanh nghiệp',
            type: 'ui_section',
            code: 'ui_forms_table',
            children: [
              { key: 'btn_forms_export', title: 'Nút Tải / Xuất Mẫu Biểu mẫu', type: 'action', code: 'system.forms.btn_export' }
            ]
          }
        ]
      }
    ]
  }
];

export const PRESET_USERS: UserProfile[] = [
  {
    id: 'usr_01',
    username: 'chidan2410',
    name: 'Dương Chí Dẫn',
    email: 'chidan2410@gmail.com',
    roleTitle: 'Quản trị viên Hệ thống (Identity Admin)',
    roles: ['SkorubaIdentityAdminAdministrator', 'IdentityBitisAdminAdministrator'],
    allowedUrls: ['*'], // Full access
    buttonPermissions: ['*'], // All buttons permitted
    avatarBg: '#2563eb',
    description: 'Toàn quyền truy cập tất cả Menu, URL Route & mọi Nút bấm hệ thống (JWT IdentityServer thật).',
    jwtToken: REAL_IDENTITY_SERVER_JWT
  },
  {
    id: 'usr_02',
    username: 'store_manager',
    name: 'Trần Văn Hoàng',
    email: 'hoang.tv@bitisgroup.vn',
    roleTitle: 'Cửa hàng trưởng (Store Manager)',
    roles: ['STORE_MANAGER'],
    allowedUrls: [
      '/',
      '/sales/orders',
      '/sales/products',
      '/sales/customers',
      '/sales/promotions',
      '/system/forms'
    ],
    buttonPermissions: [
      'sales.orders.btn_search',
      'sales.orders.btn_reset',
      'sales.orders.btn_create',
      'sales.orders.btn_cancel',
      'sales.orders.btn_export',
      'sales.orders.btn_print',
      'sales.products.btn_create',
      'sales.products.btn_edit',
      'sales.customers.btn_create',
      'sales.customers.btn_export',
      'sales.promotions.btn_create',
      'system.forms.btn_export'
    ],
    avatarBg: '#7c3aed',
    description: 'Quyền Quản lý Cửa hàng: Xem & tạo đơn, Hủy đơn, In hóa đơn, Xuất Excel. Bị KHÓA 403 các trang RBAC & Audit Logs.',
    jwtToken: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1lIjoiVHLDsyBuIFbEg24gSG/DoG5nIiwicm9sZSI6WyJTVE9SRV9NQU5BR0VSIl0sImVtYWlsIjoiaG9hbmcudHZAYml0aXNncm91cC52biIsImlhdCI6MTc4NTI1MTcyMX0.signature`
  },
  {
    id: 'usr_03',
    username: 'cashier_nga',
    name: 'Lê Thị Nga',
    email: 'nga.lt@bitisgroup.vn',
    roleTitle: 'Thu ngân / Bán hàng (Cashier)',
    roles: ['CASHIER'],
    allowedUrls: [
      '/',
      '/sales/orders',
      '/sales/products'
    ],
    buttonPermissions: [
      'sales.orders.btn_search',
      'sales.orders.btn_reset',
      'sales.orders.btn_create',
      'sales.orders.btn_print'
    ],
    avatarBg: '#059669',
    description: 'Quyền Thu ngân: Chỉ xem danh sách Đơn & Sản phẩm, Tạo đơn mới, In hóa đơn. KHÔNG ĐƯỢC Hủy đơn, KHÔNG Xuất Excel (Sẽ hiện Tooltip Khóa 403).',
    jwtToken: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1lIjoiTMOqIFRo4buLIE5nYSIsInJvbGUiOlsiQ0FTSElFUiJdLCJlbWFpbCI6Im5nYS5sdEBiaXRpc2dyb3VwLnZuIiwiaWF0IjoxNzg1MjUxNzIxfQ.signature`
  },
  {
    id: 'usr_04',
    username: 'auditor_duc',
    name: 'Nguyễn Minh Đức',
    email: 'duc.nm@bitisgroup.vn',
    roleTitle: 'Kiểm toán & Kế toán (Auditor)',
    roles: ['AUDITOR'],
    allowedUrls: [
      '/',
      '/sales/orders',
      '/system/audit-logs'
    ],
    buttonPermissions: [
      'sales.orders.btn_search',
      'sales.orders.btn_reset',
      'sales.orders.btn_export',
      'system.audit.btn_export'
    ],
    avatarBg: '#d97706',
    description: 'Quyền Kiểm toán: Chỉ xem Đơn hàng & Audit Logs, Xuất file Excel báo cáo. KHÔNG Tạo/Hủy đơn, KHÔNG In hóa đơn, KHÔNG Xóa log.',
    jwtToken: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1lIjoiTmd1eeG7gW4gTWluaCDEkMOjYyIsInJvbGUiOlsiQVVESVRPUiJdLCJlbWFpbCI6ImR1Yy5ubUBiaXRpc2dyb3VwLnZuIiwiaWF0IjoxNzg1MjUxNzIxfQ.signature`
  },
  {
    id: 'usr_05',
    username: 'expired_user',
    name: 'Trần Quốc Bảo (Token Expired Test)',
    email: 'bao.tq@bitisgroup.vn',
    roleTitle: 'Tài khoản Hết Hạn Token (401 Demo)',
    roles: ['EXPIRED_USER'],
    allowedUrls: [],
    buttonPermissions: [],
    avatarBg: '#dc2626',
    description: 'Giả lập JWT Access Token đã HẾT HẠN (exp). Khi hệ thống kiểm tra token hết hạn, ứng dụng lập tức khóa và chuyển sang Trang lỗi 401 Unauthorized.',
    jwtToken: `EXPIRED_JWT_TOKEN_SAMPLE`,
    isExpired: true
  }
];

export function normalizePermissionKey(key: string): string {
  const map: Record<string, string> = {
    'btn_cancel_order': 'sales.orders.btn_cancel',
    'btn_print_invoice': 'sales.orders.btn_print',
    'btn_export_excel': 'sales.orders.btn_export',
    'btn_create_order': 'sales.orders.btn_create',
    'btn_edit_product': 'sales.products.btn_edit',
    'btn_delete_audit': 'system.audit.btn_delete',
    'btn_vat_config': 'system.vat.btn_save',
    'btn_manage_rbac': 'system.rbac.btn_save'
  };
  return map[key] || key;
}

import { rbacService } from '../services/rbacService';

export function getStoredTree(): PermissionTreeNode[] {
  return rbacService.getPermissionTree();
}

export function saveStoredTree(tree: PermissionTreeNode[]): void {
  rbacService.savePermissionTree(tree);
}

export interface StoredRole {
  id: string;
  code: string;
  name: string;
  description: string;
  usersCount: number;
  allowedUrls: string[];
  buttonPermissions: string[];
  status: 'active' | 'inactive';
  isSystemRole?: boolean;
}

export function getStoredRoles(): StoredRole[] {
  return rbacService.getRoles();
}

export function saveStoredRoles(roles: StoredRole[]): void {
  rbacService.saveRoles(roles);
}

export function deriveAllowedUrlsFromCheckedKeys(checkedKeys: (string | number | React.Key)[], treeNodes?: PermissionTreeNode[]): string[] {
  if (!checkedKeys || checkedKeys.length === 0) return [];
  
  const keysArray = checkedKeys.map(k => String(k));
  if (keysArray.includes('*')) {
    return ['*'];
  }

  const tree = treeNodes || getStoredTree();
  const checkedSet = new Set(keysArray.map(k => normalizePermissionKey(k)));
  const urls = new Set<string>();

  const walk = (nodes: PermissionTreeNode[]) => {
    for (const node of nodes) {
      const isChecked = checkedSet.has(node.code);
      if (isChecked && node.path) {
        urls.add(node.path);
      }
      if (node.children && node.children.length > 0) {
        walk(node.children);
      }
    }
  };

  walk(tree);

  // If at least one path or button key is checked, add home dashboard '/'
  if (urls.size > 0 || checkedSet.size > 0) {
    urls.add('/');
  }

  return Array.from(urls);
}

export function getAllTreeNodeKeys(treeNodes?: PermissionTreeNode[]): Set<string> {
  const tree = treeNodes || getStoredTree();
  const keys = new Set<string>();
  const walk = (nodes: PermissionTreeNode[]) => {
    nodes.forEach(n => {
      keys.add(n.code);
      if (n.children) walk(n.children);
    });
  };
  walk(tree);
  return keys;
}

export function isAdminUser(userRoles?: string[] | string): boolean {
  if (!userRoles) return false;
  const rolesArray = Array.isArray(userRoles) ? userRoles : [userRoles];
  return rolesArray.some(r => 
    r === 'SkorubaIdentityAdminAdministrator' || 
    r === 'IdentityBitisAdminAdministrator' || 
    r === 'ADMIN' || 
    r === 'admin'
  );
}

export function matchUrlPattern(pattern: string, targetPath: string): boolean {
  if (!pattern || !targetPath) return false;
  if (pattern === '*') return true;
  if (pattern === targetPath) return true;

  // Clean query string and hash fragments
  const cleanPath = String(targetPath || '').split('?')[0].split('#')[0];
  const cleanPattern = String(pattern || '').split('?')[0].split('#')[0];

  if (cleanPattern === cleanPath) return true;

  // CRITICAL SECURITY FIX: '/' MUST ONLY match root home ('/' or ''), NEVER sub-routes like '/system/rbac'
  if (cleanPattern === '/') {
    return cleanPath === '/' || cleanPath === '';
  }

  // Wildcard prefix matching e.g. '/sales/*'
  if (cleanPattern.endsWith('/*')) {
    const prefix = cleanPattern.slice(0, -2);
    return cleanPath === prefix || cleanPath.startsWith(prefix + '/');
  }

  // Exact subpath matching e.g. pattern '/sales/orders' matching '/sales/orders/detail'
  if (cleanPath.startsWith(cleanPattern + '/')) {
    return true;
  }

  return false;
}

export function canAccessUrl(allowedUrls: string[] | undefined, targetPath: string, userRoles?: string[] | string): boolean {
  if (isRbacBypassEnabled()) return true;
  if (isAdminUser(userRoles)) return true;

  // Resolve allowedUrls from stored roles in real-time
  const rolesList = getStoredRoles();
  const userRoleCodes = Array.isArray(userRoles) ? userRoles : userRoles ? [userRoles] : [];
  const matchingRoles = rolesList.filter(r => userRoleCodes.includes(r.code) && r.status === 'active');

  let effectiveUrls: string[] = [];
  if (matchingRoles.length > 0) {
    effectiveUrls = matchingRoles.flatMap(r => r.allowedUrls || []);
  } else if (allowedUrls) {
    effectiveUrls = allowedUrls;
  }

  if (!effectiveUrls || effectiveUrls.length === 0) return false;
  if (effectiveUrls.includes('*')) return true;

  return effectiveUrls.some(pattern => matchUrlPattern(pattern, targetPath));
}

// Map alias legacy keys to new tree codes for seamless backwards compatibility
const PERMISSION_ALIASES: Record<string, string[]> = {
  'sales.orders.btn_cancel': ['btn_cancel_order'],
  'btn_cancel_order': ['sales.orders.btn_cancel'],
  'sales.orders.btn_print': ['btn_print_invoice'],
  'btn_print_invoice': ['sales.orders.btn_print'],
  'sales.orders.btn_export': ['btn_export_excel'],
  'btn_export_excel': ['sales.orders.btn_export', 'system.audit.btn_export'],
  'sales.orders.btn_create': ['btn_create_order'],
  'btn_create_order': ['sales.orders.btn_create'],
  'system.audit.btn_delete': ['btn_delete_audit'],
  'btn_delete_audit': ['system.audit.btn_delete'],
  'system.vat.btn_save': ['btn_vat_config'],
  'btn_vat_config': ['system.vat.btn_save'],
  'system.rbac.btn_save': ['btn_manage_rbac'],
  'btn_manage_rbac': ['system.rbac.btn_save'],
};

export function hasButtonPermission(
  buttonPermissions: string[] | undefined, 
  buttonCode: string, 
  userRoles?: string[] | string
): boolean {
  if (isRbacBypassEnabled()) return true;
  if (isAdminUser(userRoles)) return true;

  // Dynamically inspect live stored roles from localStorage
  const rolesList = getStoredRoles();
  const userRoleCodes = Array.isArray(userRoles) ? userRoles : userRoles ? [userRoles] : [];
  const matchingRoles = rolesList.filter(r => userRoleCodes.includes(r.code) && r.status === 'active');

  if (matchingRoles.length > 0) {
    for (const r of matchingRoles) {
      if (r.buttonPermissions.includes('*')) return true;
      if (r.buttonPermissions.includes(buttonCode)) return true;
      const aliases = PERMISSION_ALIASES[buttonCode];
      if (aliases && aliases.some(alias => r.buttonPermissions.includes(alias))) return true;
    }
    return false;
  }

  // Fallback if no matching stored roles found
  if (buttonPermissions) {
    if (buttonPermissions.includes('*')) return true;
    if (buttonPermissions.includes(buttonCode)) return true;
    const aliases = PERMISSION_ALIASES[buttonCode];
    if (aliases && aliases.some(alias => buttonPermissions.includes(alias))) return true;
  }

  return false;
}
