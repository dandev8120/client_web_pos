/**
 * Data Transfer Objects (DTO) and Mapper for Product Domain
 */

export interface ProductRequestDto {
  id?: string; // SKU code
  barcode?: string;
  name: string;
  category: string;
  storeId?: string;
  price: number;
  costPrice?: number;
  stock: number;
  unit?: string;
  vatRate?: number;
  promotion?: string;
  supplier?: string;
  image?: string;
}

export interface ProductResponseDto {
  key: string;
  id: string; // SKU
  barcode: string;
  name: string;
  category: string;
  storeId: string;
  price: number;
  costPrice: number;
  stock: number;
  unit: string;
  vatRate: number;
  promotion: string;
  supplier: string;
  createdDate: string;
  sapStatus: number; // 1 = synced, 0 = pending
  status: 'active' | 'low_stock' | 'out_of_stock' | 'discontinued';
  image?: string;
}

export interface ProductStatsDto {
  totalProducts: number;
  activeProducts: number;
  activeRate: number;
  totalInventoryValue: number;
  avgUnitPrice: number;
  totalStockUnits: number;
  lowStockCount: number;
  lowStockRate: number;
  promotedCount: number;
  syncedSapCount: number;
  categories: { name: string; count: number; color: string }[];
}

export class ProductMapper {
  static toResponseDto(raw: any, defaultKey?: string): ProductResponseDto {
    const stock = Number(raw.stock ?? 0);
    let status: ProductResponseDto['status'] = raw.status || 'active';
    if (stock === 0) {
      status = 'out_of_stock';
    } else if (stock <= 20 && status !== 'discontinued') {
      status = 'low_stock';
    }

    return {
      key: String(raw.key || defaultKey || `prod-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`),
      id: String(raw.id || raw.sku || `PROD-${Math.floor(1000 + Math.random() * 9000)}`),
      barcode: String(raw.barcode || `89385${Math.floor(100000 + Math.random() * 900000)}`),
      name: String(raw.name || raw.productName || 'Sản phẩm mới'),
      category: String(raw.category || 'Giày dép'),
      storeId: String(raw.storeId || 'ST-001'),
      price: Number(raw.price ?? 0),
      costPrice: Number(raw.costPrice ?? raw.cost ?? 0),
      stock: stock,
      unit: String(raw.unit || 'Cái'),
      vatRate: Number(raw.vatRate ?? 8),
      promotion: String(raw.promotion || 'Không'),
      supplier: String(raw.supplier || 'Nhà cung cấp Việt Nam'),
      createdDate: String(raw.createdDate || new Date().toISOString().replace('T', ' ').substring(0, 19)),
      sapStatus: Number(raw.sapStatus ?? 1),
      status: status,
      image: raw.image || `https://picsum.photos/seed/${raw.id || 'prod'}/120/120`
    };
  }

  static fromRequestDto(dto: ProductRequestDto, existingKey?: string): ProductResponseDto {
    const sku = dto.id || `PROD-${Math.floor(1000 + Math.random() * 9000)}`;
    const barcode = dto.barcode || `89385${Math.floor(100000 + Math.random() * 900000)}`;
    const stock = dto.stock ?? 0;
    const status: ProductResponseDto['status'] = stock === 0 ? 'out_of_stock' : (stock <= 20 ? 'low_stock' : 'active');

    return {
      key: existingKey || `prod-${Date.now()}`,
      id: sku,
      barcode: barcode,
      name: dto.name,
      category: dto.category,
      storeId: dto.storeId || 'ST-001',
      price: dto.price,
      costPrice: dto.costPrice ?? 0,
      stock: stock,
      unit: dto.unit || 'Cái',
      vatRate: dto.vatRate ?? 8,
      promotion: dto.promotion || 'Không',
      supplier: dto.supplier || 'Nhà cung cấp Việt Nam',
      createdDate: new Date().toISOString().replace('T', ' ').substring(0, 19),
      sapStatus: 1,
      status: status,
      image: dto.image || `https://picsum.photos/seed/${sku}/120/120`
    };
  }

  static calculateStats(products: ProductResponseDto[]): ProductStatsDto {
    const totalProducts = products.length;
    const activeProducts = products.filter(p => p.status === 'active').length;
    const activeRate = totalProducts > 0 ? Math.round((activeProducts / totalProducts) * 100) : 0;

    const totalInventoryValue = products.reduce((acc, p) => acc + p.price * p.stock, 0);
    const avgUnitPrice = totalProducts > 0 ? Math.round(products.reduce((acc, p) => acc + p.price, 0) / totalProducts) : 0;

    const totalStockUnits = products.reduce((acc, p) => acc + p.stock, 0);
    const lowStockCount = products.filter(p => p.stock <= 20).length;
    const lowStockRate = totalProducts > 0 ? Math.round((lowStockCount / totalProducts) * 100) : 0;

    const promotedCount = products.filter(p => p.promotion && p.promotion !== 'Không').length;
    const syncedSapCount = products.filter(p => p.sapStatus === 1).length;

    const catMap: Record<string, number> = {};
    products.forEach(p => {
      catMap[p.category] = (catMap[p.category] || 0) + 1;
    });

    const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6'];
    const categories = Object.keys(catMap).map((catName, idx) => ({
      name: catName,
      count: catMap[catName],
      color: colors[idx % colors.length]
    }));

    return {
      totalProducts,
      activeProducts,
      activeRate,
      totalInventoryValue,
      avgUnitPrice,
      totalStockUnits,
      lowStockCount,
      lowStockRate,
      promotedCount,
      syncedSapCount,
      categories
    };
  }
}
