import { apiClient } from '../api/apiClient';

export const TENANT_BRANCHES_STORAGE_KEY = 'TENANT_BRANCHS';
export const TENANT_BRANCHES_UPDATED_EVENT = 'tenant-branches-updated';

export interface TenantBranchGroup {
  maNhomSite?: string | null;
  tenNhomSite?: string | null;
  ng_DK?: string | null;
}

export interface TenantBranch {
  maSite: string;
  tenSite?: string | null;
  ng_DK?: string | null;
  maNhomSite?: string | null;
  status?: boolean | null;
  diaChi?: string | null;
  timeOpen?: string | null;
  timeClose?: string | null;
  phone?: string | null;
  tinh?: string | null;
  nhomSite?: TenantBranchGroup | null;
}

function textValue(value: unknown) {
  return value === undefined || value === null ? '' : String(value).trim();
}

function normalizeBranch(raw: any): TenantBranch | null {
  const maSite = textValue(raw?.maSite ?? raw?.MaSite ?? raw?.storeId);
  if (!maSite) return null;

  const nhomSite = raw?.nhomSite ?? raw?.NhomSite ?? null;
  const maNhomSite = textValue(raw?.maNhomSite ?? raw?.MaNhomSite ?? nhomSite?.maNhomSite ?? nhomSite?.MaNhomSite);

  return {
    maSite,
    tenSite: textValue(raw?.tenSite ?? raw?.TenSite) || null,
    ng_DK: raw?.ng_DK ?? raw?.Ng_DK ?? null,
    maNhomSite: maNhomSite || null,
    status: typeof raw?.status === 'boolean'
      ? raw.status
      : typeof raw?.Status === 'boolean'
        ? raw.Status
        : null,
    diaChi: textValue(raw?.diaChi ?? raw?.DiaChi) || null,
    timeOpen: raw?.timeOpen ?? raw?.TimeOpen ?? null,
    timeClose: raw?.timeClose ?? raw?.TimeClose ?? null,
    phone: textValue(raw?.phone ?? raw?.Phone) || null,
    tinh: textValue(raw?.tinh ?? raw?.Tinh) || null,
    nhomSite: nhomSite
      ? {
          maNhomSite: textValue(nhomSite.maNhomSite ?? nhomSite.MaNhomSite ?? maNhomSite) || null,
          tenNhomSite: textValue(nhomSite.tenNhomSite ?? nhomSite.TenNhomSite) || null,
          ng_DK: nhomSite.ng_DK ?? nhomSite.Ng_DK ?? null,
        }
      : null,
  };
}

function normalizeBranches(data: unknown): TenantBranch[] {
  const source = Array.isArray(data)
    ? data
    : Array.isArray((data as any)?.data)
      ? (data as any).data
      : [];

  const branches = source
    .map(normalizeBranch)
    .filter((item): item is TenantBranch => Boolean(item));

  return branches.sort((a, b) => a.maSite.localeCompare(b.maSite, 'vi'));
}

export function getTenantBranches(): TenantBranch[] {
  if (typeof window === 'undefined') return [];

  try {
    const raw = localStorage.getItem(TENANT_BRANCHES_STORAGE_KEY);
    return normalizeBranches(raw ? JSON.parse(raw) : []);
  } catch {
    return [];
  }
}

export function saveTenantBranches(branches: TenantBranch[]) {
  if (typeof window === 'undefined') return;

  localStorage.setItem(TENANT_BRANCHES_STORAGE_KEY, JSON.stringify(branches));
  window.dispatchEvent(new CustomEvent(TENANT_BRANCHES_UPDATED_EVENT, {
    detail: branches,
  }));
}

export async function refreshTenantBranches() {
  const response = await apiClient.get<TenantBranch[]>('/api/sites/all');
  if (!response.success) {
    throw new Error(response.message || 'Không thể tải danh sách cửa hàng');
  }

  const branches = normalizeBranches(response.data);
  saveTenantBranches(branches);
  return branches;
}

export const siteService = {
  getTenantBranches,
  saveTenantBranches,
  refreshTenantBranches,
};
