/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface User {
  name: string;
  role: string;
  avatar?: string;
}

export interface Order {
  id: string;
  customer: string;
  total: number;
  status: 'pending' | 'completed' | 'shipped' | 'cancelled';
  date: string;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  category: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: 'active' | 'inactive';
}
