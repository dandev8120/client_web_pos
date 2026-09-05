import { accessControlService } from '../services/accessControlService';
import { FunctionNodeDto } from '../dtos/AuthorizationDto';

export interface PermissionTreeNode {
  key: string;
  title: string;
  titleName?: LocalizedTitleName;
  type: 'module' | 'menu' | 'ui_section' | 'action';
  code: string;
  path?: string;
  description?: string;
  children?: PermissionTreeNode[];
}

export interface LocalizedTitleName {
  vi?: string;
  en?: string;
  [languageCode: string]: string | undefined;
}

export interface FunctionTreeNode {
  id: number;
  functionCode: string;
  functionNameKey: string;
  titleKey?: string;
  titleName?: LocalizedTitleName;
  type: 'MODULE' | 'MENU' | 'PAGE' | 'ROUTE' | 'SECTION' | 'ACTION' | 'FIELD' | 'COLUMN' | 'CARD' | 'WIDGET';
  level: number;
  parentId: number | null;
  pathId: string;
  pathCode: string;
  icon?: string;
  url?: string;
  sortOrder: number;
  status: 0 | 1;
  requiresPermission?: boolean;
  children?: FunctionTreeNode[];
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

// Temporary emergency flag only. Keep false for Function Tree  testing with seed/API.
export const _BYPASS_FOR_TESTING = false;

export function isAccessControlBypassEnabled(): boolean {
  return _BYPASS_FOR_TESTING || String(import.meta.env.VITE_ACCESS_CONTROL_BYPASS || '').toLowerCase() === 'true';
}

export const REAL_IDENTITY_SERVER_JWT = `eyJhbGciOiJSUzI1NiIsImtpZCI6IkFCMzREQTJFRTcxMTIxRjhDRkFEQ0RFMDg3MjI0MEQzIiwidHlwIjoiYXQrand0In0.eyJuYmYiOjE3ODUyNTE3MjEsImV4cCI6MTc4NTI1NTMyMSwiaXNzIjoiaHR0cHM6Ly9pZGVudGl0eXNlcnZlci5iaXRpc2dyb3VwLnZuIiwiYXVkIjoic2tvcnViYV9pZGVudGl0eV9hZG1pbl9hcGkiLCJjbGllbnRfaWQiOiJza29ydWJhX2lkZW50aXR5X2FkbWluX2FwaV9zd2FnZ2VydWkiLCJzdWIiOiJkODA0NDlhYy0wNmYzLTQ4OGEtOTFiYy1jNDY4NGU0MTRmOTciLCJhdXRoX3RpbWUiOjE3ODUyNTE3MjEsImlkcCI6ImxvY2FsIiwibmFtZSI6IkTGsMahbmcgQ2jDrSBE4bqrbiIsInJvbGUiOlsiU2tvcnViYUlkZW50aXR5QWRtaW5BZG1pbmlzdHJhdG9yIiwiSWRlbnRpdHlCaXRpc0FkbWluQWRtaW5pc3RyYXRvciJdLCJlbWFpbCI6ImNoaWRhbjI0MTBAZ21haWwuY29tIiwianRpIjoiQjEwOTJEQUZDODQ1MjkyMkE2Q0YyNjE2RUMwRjdFRjgiLCJpYXQiOjE3ODUyNTE3MjEsInNjb3BlIjpbInNrb3J1YmFfaWRlbnRpdHlfYWRtaW5fYXBpIl0sImFtciI6WyJwd2QiXX0.OOcM46xQEkZP1237GDdm49qN8lntUQ19vqaOocUaDpCcK8vA2e_QqOgim18CXLIjugNRFDRnailnn-lHMRTJus992SWrDwK7KB8-tqNnD7zAZDfmkBVP4nbb37CSd5e_NwYFIH01LJ_zjVLggNJkxZ5b05X8DwUhqKh9og3_JWbv88i6-TugVoALqo0VUCRW5Gy2gQkEF7pMBpGKIpz4m0DRwU8o4O1wBNspC89RsgBMrMyQY2eV620vMR9WsVfmAjrLdlnIWhb1lUnWmcSOJ11CyI9QZKncxmbrxRPg1lhVGQQG48vqADgK3VGF3qAuyjjTWhltDC3obxI6eDHRvw`;

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
    description: 'Quyền Quản lý Cửa hàng: Xem & tạo đơn, Hủy đơn, In hóa đơn, Xuất Excel. Bị KHÓA 403 các trang  & Audit Logs.',
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
  return accessControlService.normalizePermissionKey(key);
}

export function getStoredTree(): PermissionTreeNode[] {
  return accessControlService.getPermissionTree();
}

export function saveStoredTree(tree: PermissionTreeNode[]): void {
  accessControlService.savePermissionTree(tree);
}

export interface StoredRole {
  id: string;
  code: string;
  name: string;
  description: string;
  usersCount: number;
  allowedUrls: string[];
  buttonPermissions: string[];
  functionCodes: string[];
  status: 'active' | 'inactive';
  isSystemRole?: boolean;
}

export function getStoredRoles(): StoredRole[] {
  return accessControlService.getRoles();
}

export function saveStoredRoles(roles: StoredRole[]): void {
  accessControlService.saveRoles(roles);
}

export function getStoredFunctionTree(): FunctionTreeNode[] {
  const cached = accessControlService.getCachedMeAuthorization();
  return ((cached?.functionTree?.length ? cached.functionTree : accessControlService.getFunctionTree()) || []) as FunctionTreeNode[];
}

export function getStoredFunctionCodes(userRoles?: string[] | string, explicitCodes?: string[]): string[] {
  if (Array.isArray(explicitCodes) && explicitCodes.length > 0) return explicitCodes;
  const cached = accessControlService.getCachedMeAuthorization();
  if (cached?.functionCodes?.length) return cached.functionCodes;
  return accessControlService.buildSeedMeAuthorization(userRoles).functionCodes;
}

export function hasFunctionPermission(
  functionCode: string,
  userRoles?: string[] | string,
  explicitCodes?: string[]
): boolean {
  if (isAccessControlBypassEnabled()) return true;
  const code = normalizePermissionKey(functionCode);
  const codes = getStoredFunctionCodes(userRoles, explicitCodes).map(normalizePermissionKey);
  if (codes.includes('*')) return true;
  return codes.includes(code);
}

export function getLocalizedFunctionTitle(
  node: Pick<FunctionTreeNode, 'functionCode' | 'functionNameKey' | 'titleKey' | 'titleName'> | Pick<PermissionTreeNode, 'code' | 'title' | 'titleName'>,
  language: string = 'vi'
): string {
  const lang = String(language || 'vi').split('-')[0].toLowerCase();
  const titleName = (node as any).titleName as LocalizedTitleName | undefined;
  const explicitTitle = (node as any).title as string | undefined;
  const code = (node as any).functionCode || (node as any).code || '';
  const key = (node as any).functionNameKey || (node as any).titleKey || '';

  return titleName?.[lang]
    || titleName?.vi
    || titleName?.en
    || explicitTitle
    || String(key || code)
      .replace(/^accessControl\./, '')
      .replace(/[._-]+/g, ' ')
      .replace(/\b\w/g, char => char.toUpperCase())
    || String(code);
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
    r === 'IdentityBitisAdminAdministrator'
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

  // CRITICAL SECURITY FIX: '/' MUST ONLY match root home ('/' or ''), NEVER sub-routes like '/system/access-control'
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
  if (isAccessControlBypassEnabled()) return true;

  const cleanPath = String(targetPath || '').split('?')[0].split('#')[0] || '/';
  if (cleanPath.startsWith('/demo/')) return true;
  const functionCode = accessControlService.resolveFunctionCodeByUrl(cleanPath);
  if (functionCode) {
    // Check if the user has permission for this exact function code
    // OR any descendant function code (child, grandchild, etc.)
    // This enables hierarchical permission: granting SALES_ORDERS_VIEW grants access to /sales/orders
    if (hasFunctionPermission(functionCode, userRoles)) return true;
    
    // Also check if any descendant permission is granted
    const tree = accessControlService.getFunctionTree();
    const findNode = (nodes: FunctionNodeDto[], code: string): FunctionNodeDto | null => {
      for (const node of nodes) {
        if (node.functionCode === code) return node;
        if (node.children) {
          const found = findNode(node.children, code);
          if (found) return found;
        }
      }
      return null;
    };
    const node = findNode(tree, functionCode);
    if (node) {
      const collectDescendantCodes = (n: FunctionNodeDto, codes: string[]) => {
        if (n.children) {
          n.children.forEach(child => {
            codes.push(child.functionCode);
            collectDescendantCodes(child, codes);
          });
        }
      };
      const descendantCodes: string[] = [];
      collectDescendantCodes(node, descendantCodes);
      const userCodes = getStoredFunctionCodes(userRoles).map(normalizePermissionKey);
      if (userCodes.includes('*')) return true;
      for (const dc of descendantCodes) {
        if (userCodes.includes(normalizePermissionKey(dc))) return true;
      }
    }
    return false;
  }

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

export function hasButtonPermission(
  buttonPermissions: string[] | undefined, 
  buttonCode: string, 
  userRoles?: string[] | string
): boolean {
  if (isAccessControlBypassEnabled()) return true;

  const functionCode = accessControlService.resolveFunctionCodeByLegacyButton(buttonCode) || buttonCode;
  if (hasFunctionPermission(functionCode, userRoles)) return true;

  // Dynamically inspect live stored roles from localStorage
  const rolesList = getStoredRoles();
  const userRoleCodes = Array.isArray(userRoles) ? userRoles : userRoles ? [userRoles] : [];
  const matchingRoles = rolesList.filter(r => userRoleCodes.includes(r.code) && r.status === 'active');

  if (matchingRoles.length > 0) {
    for (const r of matchingRoles) {
      if (r.buttonPermissions.includes('*')) return true;
      if (r.buttonPermissions.includes(buttonCode)) return true;
      const aliases = accessControlService.getPermissionAliases(buttonCode);
      if (aliases && aliases.some(alias => r.buttonPermissions.includes(alias))) return true;
    }
    return false;
  }

  // Fallback if no matching stored roles found
  if (buttonPermissions) {
    if (buttonPermissions.includes('*')) return true;
    if (buttonPermissions.includes(buttonCode)) return true;
    const aliases = accessControlService.getPermissionAliases(buttonCode);
    if (aliases && aliases.some(alias => buttonPermissions.includes(alias))) return true;
  }

  return false;
}
