import seedRbacJson from '../seed/seedRbac.json';
import { PermissionNodeDto, RoleRequestDto, RoleResponseDto, RbacMapper } from '../dtos/RbacDto';
import { STORAGE_KEYS } from '../constants/storageKeys';

const TREE_STORAGE_KEY = STORAGE_KEYS.RBAC_TREE;
const ROLES_STORAGE_KEY = STORAGE_KEYS.RBAC_ROLES;

export class RbacService {
  /**
   * Get UI Permission Tree
   */
  public getPermissionTree(): PermissionNodeDto[] {
    try {
      const saved = localStorage.getItem(TREE_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Failed to parse cached RBAC tree', e);
    }
    const tree = seedRbacJson.permissionTree as PermissionNodeDto[];
    this.savePermissionTree(tree);
    return tree;
  }

  public savePermissionTree(tree: PermissionNodeDto[]): void {
    localStorage.setItem(TREE_STORAGE_KEY, JSON.stringify(tree));
  }

  /**
   * Get Roles
   */
  public getRoles(): RoleResponseDto[] {
    try {
      const saved = localStorage.getItem(ROLES_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.map((role, idx) => RbacMapper.toRoleResponseDto(role, idx));
        }
      }
    } catch (e) {
      console.warn('Failed to parse cached roles', e);
    }

    const roles = seedRbacJson.roles.map((role, idx) => RbacMapper.toRoleResponseDto(role, idx));
    this.saveRoles(roles);
    return roles;
  }

  public saveRoles(roles: RoleResponseDto[]): void {
    localStorage.setItem(ROLES_STORAGE_KEY, JSON.stringify(roles));
  }

  public createRole(dto: RoleRequestDto): RoleResponseDto {
    const roles = this.getRoles();
    const newRole = RbacMapper.fromRoleRequestDto(dto);
    const updated = [...roles, newRole];
    this.saveRoles(updated);
    return newRole;
  }

  public updateRolePermissions(roleCode: string, allowedUrls: string[], buttonPermissions: string[]): RoleResponseDto | null {
    const roles = this.getRoles();
    let updatedRole: RoleResponseDto | null = null;
    const updated = roles.map(r => {
      if (r.code === roleCode) {
        updatedRole = {
          ...r,
          allowedUrls,
          buttonPermissions
        };
        return updatedRole;
      }
      return r;
    });

    if (updatedRole) {
      this.saveRoles(updated);
    }
    return updatedRole;
  }

  public deleteRole(roleCode: string): boolean {
    const roles = this.getRoles();
    const filtered = roles.filter(r => r.code !== roleCode);
    if (filtered.length !== roles.length) {
      this.saveRoles(filtered);
      return true;
    }
    return false;
  }

  public resetToSeed(): void {
    localStorage.removeItem(TREE_STORAGE_KEY);
    localStorage.removeItem(ROLES_STORAGE_KEY);
  }
}

export const rbacService = new RbacService();
