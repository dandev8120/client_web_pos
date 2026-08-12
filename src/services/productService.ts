import seedProductsJson from '../seed/seedProducts.json';
import { ProductRequestDto, ProductResponseDto, ProductStatsDto, ProductMapper } from '../dtos/ProductDto';

const LOCAL_STORAGE_KEY = '@@SEED_PRODUCTS_DATA';

export class ProductService {
  /**
   * Load products list from localStorage or initialize from JSON seed file
   */
  public getProducts(): ProductResponseDto[] {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((item, idx) => ProductMapper.toResponseDto(item, `prod-${idx}`));
        }
      }
    } catch (e) {
      console.warn('Failed to parse cached products data, loading from seed file', e);
    }

    // Fallback to seed JSON
    const seedMapped = seedProductsJson.map((item, idx) => ProductMapper.toResponseDto(item, `prod-${idx}`));
    this.saveProducts(seedMapped);
    return seedMapped;
  }

  /**
   * Save products array into localStorage
   */
  public saveProducts(products: ProductResponseDto[]): void {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(products));
    } catch (e) {
      console.error('Failed to save products to localStorage', e);
    }
  }

  /**
   * Get product by SKU or ID
   */
  public getProductById(id: string): ProductResponseDto | undefined {
    const products = this.getProducts();
    return products.find(p => p.id === id || p.key === id);
  }

  /**
   * Create a new product from Request DTO
   */
  public createProduct(requestDto: ProductRequestDto): ProductResponseDto {
    const products = this.getProducts();
    const newProduct = ProductMapper.fromRequestDto(requestDto);
    const updatedList = [newProduct, ...products];
    this.saveProducts(updatedList);
    return newProduct;
  }

  /**
   * Update an existing product
   */
  public updateProduct(key: string, updates: Partial<ProductResponseDto>): ProductResponseDto | null {
    const products = this.getProducts();
    let updatedProduct: ProductResponseDto | null = null;

    const newList = products.map(p => {
      if (p.key === key || p.id === key) {
        updatedProduct = { ...p, ...updates };
        return updatedProduct;
      }
      return p;
    });

    if (updatedProduct) {
      this.saveProducts(newList);
    }
    return updatedProduct;
  }

  /**
   * Delete a product by key or ID
   */
  public deleteProduct(key: string): boolean {
    const products = this.getProducts();
    const filtered = products.filter(p => p.key !== key && p.id !== key);
    if (filtered.length !== products.length) {
      this.saveProducts(filtered);
      return true;
    }
    return false;
  }

  /**
   * Bulk delete products
   */
  public deleteProducts(keys: React.Key[]): void {
    const products = this.getProducts();
    const keySet = new Set(keys.map(String));
    const filtered = products.filter(p => !keySet.has(p.key) && !keySet.has(p.id));
    this.saveProducts(filtered);
  }

  /**
   * Sync product with SAP
   */
  public syncSap(key: string): boolean {
    const updated = this.updateProduct(key, { sapStatus: 1 });
    return updated !== null;
  }

  /**
   * Calculate Product Stats
   */
  public getStats(products?: ProductResponseDto[]): ProductStatsDto {
    const list = products || this.getProducts();
    return ProductMapper.calculateStats(list);
  }

  /**
   * Reset data back to JSON seed file
   */
  public resetToSeed(): ProductResponseDto[] {
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    return this.getProducts();
  }
}

export const productService = new ProductService();
