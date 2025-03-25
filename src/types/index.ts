
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  stock: number;
  image?: string;
  barcode?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface Receipt {
  id: string;
  items: CartItem[];
  subtotal: number;
  tax: number;
  total: number;
  paymentMethod: string;
  customerName?: string;
  customerEmail?: string;
  createdAt: Date;
}

export interface SalesData {
  daily: number;
  weekly: number;
  monthly: number;
  topProducts: {
    name: string;
    sales: number;
  }[];
}
