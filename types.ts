
export interface Product {
  id: string; // Barcode
  name: string;
  category: string;
  subcategory?: string;
  price: number;
  cost: number;
  stock: number;
  imageUrl?: string;
  thresholdPrice?: number;
}

export interface CartItem extends Product {
  quantity: number;
  finalPrice: number;
}

export interface Sale {
  id: string;
  date: string; // ISO string
  items: CartItem[];
  subtotal: number;
  discount: number;
  discountPercentage: number;
  total: number;
  profit: number;
}

// FIX: Added missing ShopSettings interface.
export interface ShopSettings {
  name: string;
  logo: string;
}

// Added missing DayBookEntry interface to resolve import error in App.tsx
export interface DayBookEntry {
  id: string;
  date: string; // ISO string
  description: string;
  type: 'expense' | 'profit';
  amount: number; // Store as a positive number
}
