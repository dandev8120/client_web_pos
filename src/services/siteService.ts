import { apiClient } from '../api/apiClient';
import { STORAGE_KEYS } from '../constants/storageKeys';

export const TENANT_BRANCHES_STORAGE_KEY = STORAGE_KEYS.TENANT_BRANCHES;
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

type RawRecord = Record<string, unknown>;

function textValue(value: unknown) {
  return value === undefined || value === null ? '' : String(value).trim();
}

function isRecord(value: unknown): value is RawRecord {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function pickValue(source: RawRecord, ...keys: string[]) {
  for (const key of keys) {
    if (source[key] !== undefined) {
      return source[key];
    }
  }

  return undefined;
}

function pickText(source: RawRecord, ...keys: string[]) {
  return textValue(pickValue(source, ...keys));
}

function pickRecord(source: RawRecord, ...keys: string[]) {
  const value = pickValue(source, ...keys);
  return isRecord(value) ? value : null;
}

function pickBoolean(source: RawRecord, ...keys: string[]) {
  const value = pickValue(source, ...keys);
  return typeof value === 'boolean' ? value : null;
}

function normalizeBranch(raw: unknown): TenantBranch | null {
  if (!isRecord(raw)) return null;

  const maSite = pickText(raw, 'maSite', 'MaSite', 'storeId');
  if (!maSite) return null;

  const nhomSite = pickRecord(raw, 'nhomSite', 'NhomSite');
  const maNhomSite = textValue(
    pickValue(raw, 'maNhomSite', 'MaNhomSite')
    ?? (nhomSite ? pickValue(nhomSite, 'maNhomSite', 'MaNhomSite') : undefined)
  );

  return {
    maSite,
    tenSite: pickText(raw, 'tenSite', 'TenSite') || null,
    ng_DK: pickText(raw, 'ng_DK', 'Ng_DK') || null,
    maNhomSite: maNhomSite || null,
    status: pickBoolean(raw, 'status', 'Status'),
    diaChi: pickText(raw, 'diaChi', 'DiaChi') || null,
    timeOpen: pickText(raw, 'timeOpen', 'TimeOpen') || null,
    timeClose: pickText(raw, 'timeClose', 'TimeClose') || null,
    phone: pickText(raw, 'phone', 'Phone') || null,
    tinh: pickText(raw, 'tinh', 'Tinh') || null,
    nhomSite: nhomSite
      ? {
          maNhomSite: textValue(pickValue(nhomSite, 'maNhomSite', 'MaNhomSite') ?? maNhomSite) || null,
          tenNhomSite: pickText(nhomSite, 'tenNhomSite', 'TenNhomSite') || null,
          ng_DK: pickText(nhomSite, 'ng_DK', 'Ng_DK') || null,
        }
      : null,
  };
}

function normalizeBranches(data: unknown): TenantBranch[] {
  const source = Array.isArray(data)
    ? data
    : isRecord(data) && Array.isArray(data.data)
      ? data.data
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
