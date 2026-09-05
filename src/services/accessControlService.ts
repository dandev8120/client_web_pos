import functionTreeSeed from '../seed/access-control/functionTree.json';
import roleFunctionCodesSeed from '../seed/access-control/roleFunctionCodes.json';
import legacyButtonFunctionCodeMapSeed from '../seed/access-control/legacyButtonFunctionCodeMap.json';
import legacyPermissionAliasesSeed from '../seed/access-control/legacyPermissionAliases.json';
import {
  AuthorizationMapper,
  FunctionNodeDto,
  MeAuthorizationResponseDto,
  PermissionNodeDto,
  RoleResponseDto,
} from '../dtos/AuthorizationDto';
import { STORAGE_KEYS } from '../constants/storageKeys';
import { accessControlEndpoints } from '../api/endpoints';

const TREE_STORAGE_KEY = STORAGE_KEYS.ACCESS_CONTROL_TREE;
const FUNCTION_TREE_STORAGE_KEY = STORAGE_KEYS.ACCESS_CONTROL_FUNCTION_TREE;
const ROLES_STORAGE_KEY = STORAGE_KEYS.ACCESS_CONTROL_ROLES;
const ME_AUTHORIZATION_STORAGE_KEY = STORAGE_KEYS.ACCESS_CONTROL_ME;
const ACCESS_CONTROL_API_ENABLED = String(import.meta.env.VITE_ACCESS_CONTROL_API_ENABLED || '').toLowerCase() === 'true';

const defaultFunctionTree = functionTreeSeed as FunctionNodeDto[];
const defaultRoleFunctionCodes = roleFunctionCodesSeed as Record<string, string[]>;
const legacyButtonFunctionCodeMap = legacyButtonFunctionCodeMapSeed as Record<string, string>;
const legacyPermissionAliases = legacyPermissionAliasesSeed as Record<string, string[]>;

const titleKeyFallbacks: Record<string, string> = {
  dashboard: 'Tổng quan',
  sales: 'Bán hàng',
  orders: 'Đơn hàng',
  products: 'Sản phẩm',
  customers: 'Khách hàng',
  promotions: 'Khuyến mãi',
  system_settings: 'Hệ thống',
  access_control: 'Phân quyền',
  vat_config: 'Cấu hình VAT',
  audit_logs: 'Nhật ký hệ thống',
  forms: 'Biểu mẫu',
  icons: 'Biểu tượng',
};

function toReadableTitle(value: string): string {
  return String(value || '')
    .replace(/^accessControl\./, '')
    .replace(/[._-]+/g, ' ')
    .replace(/\b\w/g, char => char.toUpperCase());
}

export class AccessControlService {
  public getFunctionTree(): FunctionNodeDto[] {
    try {
      const saved = localStorage.getItem(FUNCTION_TREE_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Failed to parse cached function tree', e);
    }
    return defaultFunctionTree;
  }

  public saveFunctionTree(tree: FunctionNodeDto[]): void {
    localStorage.setItem(FUNCTION_TREE_STORAGE_KEY, JSON.stringify(tree));
    const permissionTree = this.buildPermissionTreeFromFunctionTree(tree);
    this.savePermissionTree(permissionTree);
    this.notifyUpdate();
  }

  public getRoleFunctionCodesMap(): Record<string, string[]> {
    const roles = this.getRoles();
    const map: Record<string, string[]> = {};
    roles.forEach(r => {
      map[r.code] = r.functionCodes || [];
    });
    return Object.keys(map).length > 0 ? map : defaultRoleFunctionCodes;
  }

  public getLegacyButtonFunctionCodeMap(): Record<string, string> {
    return legacyButtonFunctionCodeMap;
  }

  public getLegacyPermissionAliases(): Record<string, string[]> {
    return legacyPermissionAliases;
  }

  public resolveFunctionCodeByUrl(targetPath: string): string | undefined {
    const cleanPath = String(targetPath || '').split('?')[0].split('#')[0] || '/';
    const walk = (nodes: FunctionNodeDto[]): string | undefined => {
      for (const node of nodes) {
        if (node.url && this.matchUrlPattern(node.url, cleanPath)) return node.functionCode;
        const childMatch = node.children ? walk(node.children) : undefined;
        if (childMatch) return childMatch;
      }
      return undefined;
    };
    return walk(this.getActiveFunctionTree());
  }

  public resolveFunctionCodeByLegacyButton(buttonCode: string): string | undefined {
    const map = this.getLegacyButtonFunctionCodeMap();
    if (map[buttonCode]) return map[buttonCode];
    const aliases = this.getPermissionAliases(buttonCode);
    const mappedAlias = aliases.find(alias => map[alias]);
    return mappedAlias ? map[mappedAlias] : buttonCode;
  }

  public normalizePermissionKey(key: string): string {
    const aliases = this.getLegacyPermissionAliases();
    const canonicalEntry = Object.entries(aliases).find(([canonical, aliasList]) => canonical !== key && aliasList.includes(key));
    return canonicalEntry?.[0] || key;
  }

  public getPermissionAliases(key: string): string[] {
    return this.getLegacyPermissionAliases()[key] || [];
  }

  private getActiveFunctionTree(): FunctionNodeDto[] {
    const cached = this.getCachedMeAuthorization();
    return cached?.functionTree?.length ? cached.functionTree : this.getFunctionTree();
  }

  private matchUrlPattern(pattern: string, targetPath: string): boolean {
    if (!pattern || !targetPath) return false;
    if (pattern === '*') return true;
    const cleanPattern = String(pattern).split('?')[0].split('#')[0] || '/';
    const cleanTarget = String(targetPath).split('?')[0].split('#')[0] || '/';
    if (cleanPattern === cleanTarget) return true;
    if (cleanPattern.endsWith('/*')) return cleanTarget.startsWith(cleanPattern.slice(0, -1));
    if (cleanPattern.endsWith('*')) return cleanTarget.startsWith(cleanPattern.slice(0, -1));
    return false;
  }

  public getCachedMeAuthorization(): MeAuthorizationResponseDto | null {
    try {
      const saved = localStorage.getItem(ME_AUTHORIZATION_STORAGE_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      console.warn('Failed to parse cached authorization data', e);
      return null;
    }
  }

  public saveMeAuthorization(data: MeAuthorizationResponseDto): void {
    localStorage.setItem(ME_AUTHORIZATION_STORAGE_KEY, JSON.stringify(data));
  }

  public buildSeedMeAuthorization(userRoles?: string[] | string): MeAuthorizationResponseDto {
    const roleCodes = Array.isArray(userRoles) ? userRoles : userRoles ? [userRoles] : [];
    const roleMap = this.getRoleFunctionCodesMap();
    const functionCodes = new Set<string>();

    roleCodes.forEach(roleCode => {
      const grants = roleMap[roleCode] || roleMap[String(roleCode).trim()];
      if (Array.isArray(grants)) grants.forEach(code => functionCodes.add(code));
    });

    return {
      functionCodes: Array.from(functionCodes),
      functionTree: this.getFunctionTree(),
      source: 'seed-fallback',
    };
  }

  /**
   * Backend first, local seed second.
   * Temporary seed fallback is isolated here so backend integration only needs to
   * remove this catch/fallback branch after GET /api/v1/me/authorization is ready.
   */
  public async fetchMeAuthorization(userRoles?: string[] | string): Promise<MeAuthorizationResponseDto> {
    if (ACCESS_CONTROL_API_ENABLED) {
      try {
        const response = await accessControlEndpoints.getMeAuthorization();
        const apiData = response.data;
        if (response.success && apiData && Array.isArray(apiData.functionCodes) && apiData.functionCodes.length > 0) {
          const result = { ...apiData, source: 'api' as const };
          this.saveMeAuthorization(result);
          return result;
        }
      } catch {
        // Backend authorization API is not ready yet; keep using local seed silently.
      }
    }

    const seedData = this.buildSeedMeAuthorization(userRoles);
    this.saveMeAuthorization(seedData);
    return seedData;
  }

  public getPermissionTree(): PermissionNodeDto[] {
    try {
      const saved = localStorage.getItem(TREE_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Failed to parse cached authorization tree', e);
    }

    const tree = this.buildPermissionTreeFromFunctionTree(this.getActiveFunctionTree());
    this.savePermissionTree(tree);
    return tree;
  }

  public savePermissionTree(tree: PermissionNodeDto[]): void {
    localStorage.setItem(TREE_STORAGE_KEY, JSON.stringify(tree));
  }

  public getRoles(): RoleResponseDto[] {
    try {
      const saved = localStorage.getItem(ROLES_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.map((role, idx) => AuthorizationMapper.toRoleResponseDto(role, idx));
        }
      }
    } catch (e) {
      console.warn('Failed to parse cached roles', e);
    }

    const roles = this.buildRolesFromFunctionSeed().map((role, idx) => AuthorizationMapper.toRoleResponseDto(role, idx));
    this.saveRoles(roles);
    return roles;
  }

  public saveRoles(roles: RoleResponseDto[]): void {
    localStorage.setItem(ROLES_STORAGE_KEY, JSON.stringify(roles));
    this.notifyUpdate();
  }

  /**
   * API-ready detail loader for the role form.
   * Current implementation reads from localStorage/seed; later this can call
   * GET /api/v1/authorization/roles/{roleCode} without changing the page logic.
   */
  public getRoleByCode(roleCode: string): RoleResponseDto | null {
    const normalizedCode = String(roleCode || '').trim();
    if (!normalizedCode) return null;
    const role = this.getRoles().find(r => r.code.toLowerCase() === normalizedCode.toLowerCase());
    return role ? AuthorizationMapper.toRoleResponseDto(role) : null;
  }

  public async fetchRoles(): Promise<RoleResponseDto[]> {
    if (ACCESS_CONTROL_API_ENABLED) {
      try {
        const response = await accessControlEndpoints.getRoles();
        if (response.success && Array.isArray(response.data) && response.data.length > 0) {
          const roles = response.data.map((r, idx) => AuthorizationMapper.toRoleResponseDto(r, idx));
          this.saveRoles(roles);
          return roles;
        }
      } catch {
        // Backend not ready, keep using local seed/localStorage silently.
      }
    }
    return this.getRoles();
  }

  public async fetchRoleByCode(roleCode: string): Promise<RoleResponseDto | null> {
    const normalizedCode = String(roleCode || '').trim();
    if (!normalizedCode) return null;

    if (ACCESS_CONTROL_API_ENABLED) {
      try {
        const response = await accessControlEndpoints.getRoleByCode(normalizedCode);
        if (response.success && response.data) {
          return AuthorizationMapper.toRoleResponseDto(response.data);
        }
      } catch {
        // Backend not ready, fallback to local.
      }
    }
    return this.getRoleByCode(normalizedCode);
  }

  public async fetchFunctionTree(): Promise<FunctionNodeDto[]> {
    if (ACCESS_CONTROL_API_ENABLED) {
      try {
        const response = await accessControlEndpoints.getFunctionTree();
        if (response.success && Array.isArray(response.data) && response.data.length > 0) {
          this.saveFunctionTree(response.data);
          return response.data;
        }
      } catch {
        // Backend not ready, keep using local seed/localStorage silently.
      }
    }
    return this.getFunctionTree();
  }

  public async fetchFunctionNodeByCode(functionCode: string): Promise<FunctionNodeDto | null> {
    const normalizedCode = String(functionCode || '').trim();
    if (!normalizedCode) return null;

    if (ACCESS_CONTROL_API_ENABLED) {
      try {
        const response = await accessControlEndpoints.getFunctionNodeByCode(normalizedCode);
        if (response.success && response.data) {
          return response.data;
        }
      } catch {
        // Backend not ready, fallback to local.
      }
    }
    return this.getFunctionNodeByCode(normalizedCode);
  }

  public getSuggestedChildType(parentType?: FunctionNodeDto['type']): FunctionNodeDto['type'] {
    if (parentType === 'MODULE') return 'MENU';
    if (parentType === 'MENU') return 'ACTION';
    if (parentType === 'PAGE' || parentType === 'ROUTE') return 'ACTION';
    if (parentType === 'SECTION' || parentType === 'CARD' || parentType === 'WIDGET') return 'ACTION';
    return 'ACTION';
  }

  public getNextChildSortOrder(parentId: number | null | undefined): number {
    const parent = this.getFunctionNodeById(parentId);
    const siblings = parent ? (parent.children || []) : this.getFunctionTree();
    const maxSortOrder = siblings.reduce((max, node) => Math.max(max, Number(node.sortOrder || 0)), 0);
    return maxSortOrder + 1;
  }

  public getFunctionNodeByCode(functionCode: string): FunctionNodeDto | null {
    const normalizedCode = String(functionCode || '').trim();
    if (!normalizedCode) return null;
    return this.cloneFunctionNode(
      this.findNodeByCode(this.getFunctionTree(), normalizedCode)
    );
  }

  public getFunctionNodeById(id: number | null | undefined): FunctionNodeDto | null {
    if (id === null || id === undefined) return null;
    return this.cloneFunctionNode(this.findNodeById(this.getFunctionTree(), Number(id)));
  }

  public async createRole(role: Omit<RoleResponseDto, 'id' | 'usersCount'>): Promise<RoleResponseDto> {
    const functionCodes = Array.isArray(role.functionCodes) ? role.functionCodes : [];
    const payload = {
      code: role.code,
      name: role.name,
      description: role.description || '',
      status: role.status || 'active',
      allowedUrls: role.allowedUrls?.length ? role.allowedUrls : this.deriveAllowedUrlsFromFunctionCodes(functionCodes),
      buttonPermissions: role.buttonPermissions?.length ? role.buttonPermissions : this.deriveLegacyButtonsFromFunctionCodes(functionCodes),
      functionCodes,
      isSystemRole: functionCodes.includes('*'),
    };

    if (ACCESS_CONTROL_API_ENABLED) {
      try {
        const response = await accessControlEndpoints.createRole(payload);
        if (response.success && response.data) {
          const created = AuthorizationMapper.toRoleResponseDto(response.data);
          const roles = this.getRoles();
          this.saveRoles([...roles, created]);
          return created;
        }
      } catch {
        // Backend not ready, fallback to local.
      }
    }

    const newRole = this.createRoleLocal(payload);
    return newRole;
  }

  public async updateRole(roleCode: string, patch: Partial<RoleResponseDto>): Promise<RoleResponseDto | null> {
    if (ACCESS_CONTROL_API_ENABLED) {
      try {
        const response = await accessControlEndpoints.updateRole(roleCode, patch);
        if (response.success && response.data) {
          const updated = AuthorizationMapper.toRoleResponseDto(response.data);
          const roles = this.getRoles();
          const idx = roles.findIndex(r => r.code === roleCode);
          if (idx >= 0) {
            roles[idx] = updated;
            this.saveRoles(roles);
          }
          return updated;
        }
      } catch {
        // Backend not ready, fallback to local.
      }
    }
    return this.updateRoleLocal(roleCode, patch);
  }

  public async updateRoleFunctionCodes(roleCode: string, functionCodes: string[]): Promise<RoleResponseDto | null> {
    const allowedUrls = this.deriveAllowedUrlsFromFunctionCodes(functionCodes);
    const buttonPermissions = this.deriveLegacyButtonsFromFunctionCodes(functionCodes);
    return this.updateRole(roleCode, { functionCodes, allowedUrls, buttonPermissions });
  }

  public async deleteRole(roleCode: string): Promise<boolean> {
    if (ACCESS_CONTROL_API_ENABLED) {
      try {
        const response = await accessControlEndpoints.deleteRole(roleCode);
        if (response.success) {
          const roles = this.getRoles().filter(r => r.code !== roleCode);
          this.saveRoles(roles);
          return true;
        }
      } catch {
        // Backend not ready, fallback to local.
      }
    }
    return this.deleteRoleLocal(roleCode);
  }

  public async createFunctionNode(nodeData: Partial<FunctionNodeDto> & { parentId?: number | null }): Promise<FunctionNodeDto> {
    const suggestedType = nodeData.type || this.getSuggestedChildType(
      nodeData.parentId !== null && nodeData.parentId !== undefined
        ? (this.getFunctionNodeById(nodeData.parentId)?.type || 'MODULE')
        : 'MODULE'
    );

    const payload = {
      functionCode: nodeData.functionCode,
      titleName: nodeData.titleName,
      type: suggestedType,
      parentId: nodeData.parentId ?? null,
      url: nodeData.url,
      icon: nodeData.icon,
      sortOrder: nodeData.sortOrder,
      status: nodeData.status ?? 1,
    };

    if (ACCESS_CONTROL_API_ENABLED) {
      try {
        const response = await accessControlEndpoints.createFunctionNode(payload);
        if (response.success && response.data) {
          const tree = this.getFunctionTree();
          this.saveFunctionTree([...tree, response.data]);
          return response.data;
        }
      } catch {
        // Backend not ready, fallback to local.
      }
    }

    return this.createFunctionNodeLocal({ ...payload, type: suggestedType });
  }

  public async updateFunctionNode(functionCode: string, patch: Partial<FunctionNodeDto>): Promise<FunctionNodeDto | null> {
    if (ACCESS_CONTROL_API_ENABLED) {
      try {
        const response = await accessControlEndpoints.updateFunctionNode(functionCode, patch);
        if (response.success && response.data) {
          const tree = this.getFunctionTree();
          const walk = (nodes: FunctionNodeDto[]): boolean => {
            for (let i = 0; i < nodes.length; i++) {
              if (nodes[i].functionCode === functionCode) {
                nodes[i] = response.data;
                return true;
              }
              if (nodes[i].children && walk(nodes[i].children!)) return true;
            }
            return false;
          };
          walk(tree);
          this.saveFunctionTree(tree);
          return response.data;
        }
      } catch {
        // Backend not ready, fallback to local.
      }
    }
    return this.updateFunctionNodeLocal(functionCode, patch);
  }

  public async deleteFunctionNode(functionCode: string): Promise<boolean> {
    if (ACCESS_CONTROL_API_ENABLED) {
      try {
        const response = await accessControlEndpoints.deleteFunctionNode(functionCode);
        if (response.success) {
          const tree = this.getFunctionTree();
          const removeFromArray = (nodes: FunctionNodeDto[]): FunctionNodeDto[] => {
            return nodes.filter(node => {
              if (node.functionCode === functionCode) return false;
              if (node.children) node.children = removeFromArray(node.children);
              return true;
            });
          };
          this.saveFunctionTree(removeFromArray(tree));
          return true;
        }
      } catch {
        // Backend not ready, fallback to local.
      }
    }
    return this.deleteFunctionNodeLocal(functionCode);
  }

  // Local-only implementations kept as fallback when API is disabled or unavailable.
  private createRoleLocal(role: Omit<RoleResponseDto, 'id' | 'usersCount'>): RoleResponseDto {
    const roles = this.getRoles();
    const functionCodes = Array.isArray(role.functionCodes) ? role.functionCodes : [];
    const newRole: RoleResponseDto = {
      ...role,
      id: `R-${String(roles.length + 1).padStart(2, '0')}`,
      usersCount: 0,
      functionCodes,
      allowedUrls: role.allowedUrls?.length ? role.allowedUrls : this.deriveAllowedUrlsFromFunctionCodes(functionCodes),
      buttonPermissions: role.buttonPermissions?.length ? role.buttonPermissions : this.deriveLegacyButtonsFromFunctionCodes(functionCodes),
      status: role.status || 'active',
      isSystemRole: functionCodes.includes('*'),
    };
    this.saveRoles([...roles, newRole]);
    return newRole;
  }

  private updateRoleLocal(roleCode: string, patch: Partial<RoleResponseDto>): RoleResponseDto | null {
    const roles = this.getRoles();
    const idx = roles.findIndex(r => r.code === roleCode);
    if (idx < 0) return null;
    const existing = roles[idx];
    const updated: RoleResponseDto = {
      ...existing,
      ...patch,
      id: existing.id,
      code: existing.code,
    };
    roles[idx] = updated;
    this.saveRoles(roles);
    return updated;
  }

  private deleteRoleLocal(roleCode: string): boolean {
    const roles = this.getRoles();
    const idx = roles.findIndex(r => r.code === roleCode);
    if (idx < 0) return false;
    roles.splice(idx, 1);
    this.saveRoles(roles);
    return true;
  }

  private createFunctionNodeLocal(nodeData: Partial<FunctionNodeDto> & { parentId?: number | null }): FunctionNodeDto {
    const tree = this.getFunctionTree();
    const maxId = this.findMaxNodeId(tree);
    const newId = maxId + 1;

    const newNode: FunctionNodeDto = {
      id: newId,
      functionCode: String(nodeData.functionCode || `FUNC_${newId}`).toUpperCase().trim(),
      functionNameKey: nodeData.functionNameKey || `accessControl.${String(nodeData.functionCode || newId).toLowerCase()}`,
      titleKey: nodeData.titleKey || undefined,
      titleName: nodeData.titleName || { vi: nodeData.functionCode, en: nodeData.functionCode },
      type: nodeData.type || 'ACTION',
      level: Number(nodeData.level || 1),
      parentId: nodeData.parentId ?? null,
      pathId: '',
      pathCode: '',
      icon: nodeData.icon || undefined,
      url: nodeData.url || undefined,
      sortOrder: Number(nodeData.sortOrder || 1),
      status: (nodeData.status === 0 ? 0 : 1) as 0 | 1,
      children: [],
    };

    if (newNode.parentId === null || newNode.parentId === undefined) {
      newNode.pathId = `/${newId}/`;
      newNode.pathCode = `/${newNode.functionCode}/`;
      newNode.level = 1;
      tree.push(newNode);
    } else {
      const parent = this.findNodeById(tree, newNode.parentId);
      if (parent) {
        newNode.level = (parent.level || 1) + 1;
        newNode.pathId = `${parent.pathId}${newId}/`;
        newNode.pathCode = `${parent.pathCode}${newNode.functionCode}/`;
        if (!parent.children) parent.children = [];
        parent.children.push(newNode);
      } else {
        newNode.parentId = null;
        newNode.pathId = `/${newId}/`;
        newNode.pathCode = `/${newNode.functionCode}/`;
        newNode.level = 1;
        tree.push(newNode);
      }
    }

    this.saveFunctionTree(tree);
    return newNode;
  }

  private updateFunctionNodeLocal(functionCode: string, patch: Partial<FunctionNodeDto>): FunctionNodeDto | null {
    const tree = this.getFunctionTree();
    const walk = (nodes: FunctionNodeDto[]): boolean => {
      for (let i = 0; i < nodes.length; i++) {
        if (nodes[i].functionCode === functionCode) {
          nodes[i] = { ...nodes[i], ...patch };
          this.saveFunctionTree(tree);
          return true;
        }
        if (nodes[i].children && walk(nodes[i].children!)) return true;
      }
      return false;
    };
    walk(tree);
    const node = this.findNodeByCode(tree, functionCode);
    return node ? { ...node, ...patch } : null;
  }

  private deleteFunctionNodeLocal(functionCode: string): boolean {
    const tree = this.getFunctionTree();
    let deleted = false;
    const walk = (nodes: FunctionNodeDto[]): boolean => {
      for (let i = 0; i < nodes.length; i++) {
        if (nodes[i].functionCode === functionCode) {
          nodes.splice(i, 1);
          deleted = true;
          return true;
        }
        if (nodes[i].children && walk(nodes[i].children!)) return true;
      }
      return false;
    };
    walk(tree);
    if (deleted) {
      this.saveFunctionTree(tree);
    }
    return deleted;
  }

  public importJsonb(payload: {
    functionTree?: FunctionNodeDto[];
    roleFunctionCodes?: Record<string, string[]>;
    roles?: RoleResponseDto[];
  }): { success: boolean; message: string } {
    try {
      if (Array.isArray(payload.functionTree) && payload.functionTree.length > 0) {
        this.saveFunctionTree(payload.functionTree);
      }

      if (Array.isArray(payload.roles) && payload.roles.length > 0) {
        this.saveRoles(payload.roles);
      } else if (payload.roleFunctionCodes && typeof payload.roleFunctionCodes === 'object') {
        const roles = Object.entries(payload.roleFunctionCodes).map(([code, functionCodes], idx) => ({
          id: `R-${String(idx + 1).padStart(2, '0')}`,
          code,
          name: code,
          description: '',
          usersCount: 0,
          allowedUrls: this.deriveAllowedUrlsFromFunctionCodes(functionCodes),
          buttonPermissions: this.deriveLegacyButtonsFromFunctionCodes(functionCodes),
          functionCodes,
          status: 'active' as const,
          isSystemRole: functionCodes.includes('*'),
        }));
        this.saveRoles(roles);
      }

      this.notifyUpdate();
      return { success: true, message: 'Nhập cấu hình JSONB thành công!' };
    } catch (e: any) {
      return { success: false, message: `Lỗi khi nhập dữ liệu: ${e.message}` };
    }
  }

  public exportJsonb(): {
    functionTree: FunctionNodeDto[];
    roleFunctionCodes: Record<string, string[]>;
    roles: RoleResponseDto[];
  } {
    return {
      functionTree: this.getFunctionTree(),
      roleFunctionCodes: this.getRoleFunctionCodesMap(),
      roles: this.getRoles(),
    };
  }


  public resetToSeed(): void {
    localStorage.removeItem(TREE_STORAGE_KEY);
    localStorage.removeItem(FUNCTION_TREE_STORAGE_KEY);
    localStorage.removeItem(ROLES_STORAGE_KEY);
    localStorage.removeItem(ME_AUTHORIZATION_STORAGE_KEY);
    this.notifyUpdate();
  }

  private notifyUpdate(): void {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('access-control-update'));
    }
  }

  private findMaxNodeId(nodes: FunctionNodeDto[]): number {
    let max = 0;
    const walk = (items: FunctionNodeDto[]) => {
      items.forEach(node => {
        if (node.id > max) max = node.id;
        if (node.children) walk(node.children);
      });
    };
    walk(nodes);
    return max;
  }

  private findNodeById(nodes: FunctionNodeDto[], id: number): FunctionNodeDto | null {
    for (const node of nodes) {
      if (node.id === id) return node;
      if (node.children) {
        const found = this.findNodeById(node.children, id);
        if (found) return found;
      }
    }
    return null;
  }

  private findNodeByCode(nodes: FunctionNodeDto[], functionCode: string): FunctionNodeDto | null {
    const normalizedCode = functionCode.toLowerCase();
    for (const node of nodes) {
      if (node.functionCode.toLowerCase() === normalizedCode) return node;
      if (node.children) {
        const found = this.findNodeByCode(node.children, functionCode);
        if (found) return found;
      }
    }
    return null;
  }

  private cloneFunctionNode(node: FunctionNodeDto | null): FunctionNodeDto | null {
    if (!node) return null;
    return JSON.parse(JSON.stringify(node)) as FunctionNodeDto;
  }

  private buildRolesFromFunctionSeed(): RoleResponseDto[] {
    return Object.entries(defaultRoleFunctionCodes).map(([code, functionCodes], idx) => ({
      id: `R-${String(idx + 1).padStart(2, '0')}`,
      code,
      name: code,
      description: code.includes('Administrator') ? 'Quản trị viên Hệ thống (Toàn quyền)' : `Vai trò ${code}`,
      usersCount: 0,
      allowedUrls: this.deriveAllowedUrlsFromFunctionCodes(functionCodes),
      buttonPermissions: this.deriveLegacyButtonsFromFunctionCodes(functionCodes),
      functionCodes,
      status: 'active' as const,
      isSystemRole: functionCodes.includes('*'),
    }));
  }

  private buildPermissionTreeFromFunctionTree(nodes: FunctionNodeDto[]): PermissionNodeDto[] {
    const mapType = (type: FunctionNodeDto['type']): PermissionNodeDto['type'] => {
      if (type === 'MODULE') return 'module';
      if (type === 'MENU' || type === 'PAGE' || type === 'ROUTE') return 'menu';
      if (type === 'ACTION') return 'action';
      return 'ui_section';
    };

    return nodes
      .filter(node => node.status === 1)
      .map(node => ({
        key: node.functionCode,
        title: node.titleName?.vi || node.titleName?.en || titleKeyFallbacks[node.titleKey || ''] || toReadableTitle(node.functionNameKey || node.functionCode),
        titleName: node.titleName,
        type: mapType(node.type),
        code: node.functionCode,
        path: node.url || undefined,
        children: node.children?.length ? this.buildPermissionTreeFromFunctionTree(node.children) : undefined,
      }));
  }

  private deriveAllowedUrlsFromFunctionCodes(functionCodes: string[]): string[] {
    if (functionCodes.includes('*')) return ['*'];
    const grants = new Set(functionCodes);
    const urls = new Set<string>();
    const walk = (nodes: FunctionNodeDto[]) => {
      nodes.forEach(node => {
        if (node.url && grants.has(node.functionCode)) urls.add(node.url);
        if (node.children) walk(node.children);
      });
    };
    walk(this.getFunctionTree());
    if (urls.size > 0) urls.add('/');
    return Array.from(urls);
  }

  private deriveLegacyButtonsFromFunctionCodes(functionCodes: string[]): string[] {
    if (functionCodes.includes('*')) return ['*'];
    const grants = new Set(functionCodes);
    return Object.entries(this.getLegacyButtonFunctionCodeMap())
      .filter(([, functionCode]) => grants.has(functionCode))
      .map(([legacyButtonCode]) => legacyButtonCode);
  }
}

export const accessControlService = new AccessControlService();