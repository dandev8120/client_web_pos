/**
 * Data Transfer Objects (DTO) and Mapper for authorization configuration.
 */

export interface PermissionNodeDto {
  key: string;
  title: string;
  titleName?: LocalizedTitleName;
  type: 'module' | 'menu' | 'ui_section' | 'action';
  code: string;
  path?: string;
  description?: string;
  children?: PermissionNodeDto[];
}

export interface LocalizedTitleName {
  vi?: string;
  en?: string;
  [languageCode: string]: string | undefined;
}

export type FunctionNodeType = 'MODULE' | 'MENU' | 'PAGE' | 'ROUTE' | 'SECTION' | 'ACTION' | 'FIELD' | 'COLUMN' | 'CARD' | 'WIDGET';

export interface FunctionNodeDto {
  id: number;
  functionCode: string;
  functionNameKey: string;
  titleKey?: string;
  titleName?: LocalizedTitleName;
  type: FunctionNodeType;
  level: number;
  parentId: number | null;
  pathId: string;
  pathCode: string;
  icon?: string;
  url?: string;
  sortOrder: number;
  status: 0 | 1;
  children?: FunctionNodeDto[];
}

export interface MeAuthorizationResponseDto {
  functionCodes: string[];
  functionTree: FunctionNodeDto[];
  source?: 'api' | 'seed-fallback' | 'cache';
}

export interface RoleRequestDto {
  code: string;
  name: string;
  description: string;
  allowedUrls: string[];
  buttonPermissions: string[];
  functionCodes?: string[];
}

export interface RoleResponseDto {
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

export class AuthorizationMapper {
  static toRoleResponseDto(raw: any, index?: number): RoleResponseDto {
    return {
      id: String(raw.id || `R-${String(index || Date.now()).padStart(2, '0')}`),
      code: String(raw.code || 'ROLE_CUSTOM'),
      name: String(raw.name || 'Vai trò tùy chỉnh'),
      description: String(raw.description || ''),
      usersCount: Number(raw.usersCount ?? 0),
      allowedUrls: Array.isArray(raw.allowedUrls) ? raw.allowedUrls : [],
      buttonPermissions: Array.isArray(raw.buttonPermissions) ? raw.buttonPermissions : [],
      functionCodes: Array.isArray(raw.functionCodes) ? raw.functionCodes : [],
      status: raw.status === 'inactive' ? 'inactive' : 'active',
      isSystemRole: Boolean(raw.isSystemRole)
    };
  }

  static fromRoleRequestDto(dto: RoleRequestDto): RoleResponseDto {
    return {
      id: `R-${Math.floor(10 + Math.random() * 90)}`,
      code: dto.code.toUpperCase(),
      name: dto.name,
      description: dto.description || '',
      usersCount: 0,
      allowedUrls: dto.allowedUrls,
      buttonPermissions: dto.buttonPermissions,
      functionCodes: Array.isArray(dto.functionCodes) ? dto.functionCodes : [],
      status: 'active',
      isSystemRole: false
    };
  }
}
