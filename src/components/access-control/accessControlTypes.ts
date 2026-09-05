import { FunctionNodeDto, RoleResponseDto } from '../../dtos/AuthorizationDto';

export interface AccessControlStats {
  totalRoles: number;
  activeRoles: number;
  ownerRolesCount: number;
  customRolesCount: number;
  totalFunctions: number;
  totalModules: number;
  totalMenus: number;
  totalActions: number;
  selectedRoleCode: string;
  selectedRoleName: string;
  selectedRoleGrantedCount: number;
  selectedRoleTotalCount: number;
  selectedRoleGrantedRate: number;
  selectedRoleAllowedUrlsCount: number;
  selectedRoleButtonPermsCount: number;
  isOwnerRole: boolean;
  syncMode: string;
  securityStatus: string;
}

export interface FlatFunctionRow {
  key: string;
  id: number;
  code: string;
  title: string;
  titleVi: string;
  titleEn: string;
  type: FunctionNodeDto['type'];
  url?: string;
  icon?: string;
  level: number;
  parentId: number | null;
  sortOrder: number;
  status: 0 | 1;
  granted: boolean;
  children?: FlatFunctionRow[];
}

export interface RoleFormData {
  code: string;
  name: string;
  description: string;
  status: 'active' | 'inactive';
  cloneFromRoleCode?: string;
}

export interface FunctionNodeFormData {
  id?: number;
  functionCode: string;
  titleVi: string;
  titleEn: string;
  type: FunctionNodeDto['type'];
  parentId: number | null;
  url?: string;
  icon?: string;
  sortOrder: number;
  status: 0 | 1;
}

export interface ImportJsonbPayload {
  functionTree?: FunctionNodeDto[];
  roleFunctionCodes?: Record<string, string[]>;
  roles?: RoleResponseDto[];
}
