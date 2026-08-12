/**
 * Data Transfer Objects (DTO) and Mapper for RBAC Domain
 */

export interface PermissionNodeDto {
  key: string;
  title: string;
  type: 'module' | 'menu' | 'ui_section' | 'action';
  code: string;
  path?: string;
  description?: string;
  children?: PermissionNodeDto[];
}

export interface RoleRequestDto {
  code: string;
  name: string;
  description: string;
  allowedUrls: string[];
  buttonPermissions: string[];
}

export interface RoleResponseDto {
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

export class RbacMapper {
  static toRoleResponseDto(raw: any, index?: number): RoleResponseDto {
    return {
      id: String(raw.id || `R-${String(index || Date.now()).padStart(2, '0')}`),
      code: String(raw.code || 'ROLE_CUSTOM'),
      name: String(raw.name || 'Vai trò tùy chỉnh'),
      description: String(raw.description || ''),
      usersCount: Number(raw.usersCount ?? 0),
      allowedUrls: Array.isArray(raw.allowedUrls) ? raw.allowedUrls : [],
      buttonPermissions: Array.isArray(raw.buttonPermissions) ? raw.buttonPermissions : [],
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
      status: 'active',
      isSystemRole: false
    };
  }
}
