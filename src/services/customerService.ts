import seedCustomersJson from '../seed/seedCustomers.json';
import { CustomerRequestDto, CustomerResponseDto, CustomerMapper } from '../dtos/CustomerDto';

const LOCAL_STORAGE_KEY = '@@SEED_CUSTOMERS_DATA';

export class CustomerService {
  /**
   * Load customer list from localStorage or initialize from JSON seed file
   */
  public getCustomers(): CustomerResponseDto[] {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((item, idx) => CustomerMapper.toResponseDto(item, idx));
        }
      }
    } catch (e) {
      console.warn('Failed to parse cached customers data, loading from seed file', e);
    }

    const seedMapped = seedCustomersJson.map((item, idx) => CustomerMapper.toResponseDto(item, idx));
    this.saveCustomers(seedMapped);
    return seedMapped;
  }

  /**
   * Save customer array into localStorage
   */
  public saveCustomers(customers: CustomerResponseDto[]): void {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(customers));
    } catch (e) {
      console.error('Failed to save customers to localStorage', e);
    }
  }

  /**
   * Create a new customer from Request DTO
   */
  public createCustomer(dto: CustomerRequestDto): CustomerResponseDto {
    const customers = this.getCustomers();
    const newCust = CustomerMapper.fromRequestDto(dto);
    const updated = [newCust, ...customers];
    this.saveCustomers(updated);
    return newCust;
  }

  /**
   * Update an existing customer
   */
  public updateCustomer(key: string, updates: Partial<CustomerResponseDto>): CustomerResponseDto | null {
    const customers = this.getCustomers();
    let updatedCust: CustomerResponseDto | null = null;

    const newList = customers.map(c => {
      if (c.key === key || c.id === key) {
        updatedCust = { ...c, ...updates };
        return updatedCust;
      }
      return c;
    });

    if (updatedCust) {
      this.saveCustomers(newList);
    }
    return updatedCust;
  }

  /**
   * Delete customer by key
   */
  public deleteCustomer(key: string): boolean {
    const customers = this.getCustomers();
    const filtered = customers.filter(c => c.key !== key && c.id !== key);
    if (filtered.length !== customers.length) {
      this.saveCustomers(filtered);
      return true;
    }
    return false;
  }

  /**
   * Reset data back to JSON seed file
   */
  public resetToSeed(): CustomerResponseDto[] {
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    return this.getCustomers();
  }
}

export const customerService = new CustomerService();
