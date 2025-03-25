
import { Product, Receipt, CartItem } from "@/types";

// In a real application, this would use an actual SQLite database
// For this demo, we'll use localStorage to simulate a database

// Initialize database
const initDB = () => {
  if (!localStorage.getItem('products')) {
    localStorage.setItem('products', JSON.stringify([]));
  }
  
  if (!localStorage.getItem('receipts')) {
    localStorage.setItem('receipts', JSON.stringify([]));
  }
};

// Product operations
export const getProducts = (): Product[] => {
  initDB();
  return JSON.parse(localStorage.getItem('products') || '[]');
};

export const getProduct = (id: string): Product | undefined => {
  const products = getProducts();
  return products.find(product => product.id === id);
};

export const createProduct = (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Product => {
  const products = getProducts();
  const newProduct: Product = {
    ...product,
    id: crypto.randomUUID(),
    createdAt: new Date(),
    updatedAt: new Date()
  };
  
  localStorage.setItem('products', JSON.stringify([...products, newProduct]));
  return newProduct;
};

export const updateProduct = (id: string, updates: Partial<Product>): Product | undefined => {
  const products = getProducts();
  const index = products.findIndex(product => product.id === id);
  
  if (index === -1) return undefined;
  
  const updatedProduct = {
    ...products[index],
    ...updates,
    updatedAt: new Date()
  };
  
  products[index] = updatedProduct;
  localStorage.setItem('products', JSON.stringify(products));
  
  return updatedProduct;
};

export const deleteProduct = (id: string): boolean => {
  const products = getProducts();
  const filtered = products.filter(product => product.id !== id);
  
  if (filtered.length === products.length) return false;
  
  localStorage.setItem('products', JSON.stringify(filtered));
  return true;
};

export const updateStock = (items: CartItem[]): void => {
  const products = getProducts();
  
  items.forEach(item => {
    const index = products.findIndex(product => product.id === item.id);
    if (index !== -1) {
      products[index].stock -= item.quantity;
    }
  });
  
  localStorage.setItem('products', JSON.stringify(products));
};

// Receipt operations
export const getReceipts = (): Receipt[] => {
  initDB();
  return JSON.parse(localStorage.getItem('receipts') || '[]').map((receipt: any) => ({
    ...receipt,
    createdAt: new Date(receipt.createdAt)
  }));
};

export const getReceipt = (id: string): Receipt | undefined => {
  const receipts = getReceipts();
  return receipts.find(receipt => receipt.id === id);
};

export const createReceipt = (receipt: Omit<Receipt, 'id' | 'createdAt'>): Receipt => {
  const receipts = getReceipts();
  const newReceipt: Receipt = {
    ...receipt,
    id: crypto.randomUUID(),
    createdAt: new Date()
  };
  
  localStorage.setItem('receipts', JSON.stringify([...receipts, newReceipt]));
  
  // Update stock
  updateStock(receipt.items);
  
  return newReceipt;
};

// Analytics
export const getSalesData = (): { daily: number; weekly: number; monthly: number; topProducts: { name: string; sales: number }[] } => {
  const receipts = getReceipts();
  const now = new Date();
  
  // Daily sales (last 24 hours)
  const dailySales = receipts
    .filter(receipt => {
      const date = new Date(receipt.createdAt);
      return now.getTime() - date.getTime() < 24 * 60 * 60 * 1000;
    })
    .reduce((sum, receipt) => sum + receipt.total, 0);
  
  // Weekly sales (last 7 days)
  const weeklySales = receipts
    .filter(receipt => {
      const date = new Date(receipt.createdAt);
      return now.getTime() - date.getTime() < 7 * 24 * 60 * 60 * 1000;
    })
    .reduce((sum, receipt) => sum + receipt.total, 0);
  
  // Monthly sales (last 30 days)
  const monthlySales = receipts
    .filter(receipt => {
      const date = new Date(receipt.createdAt);
      return now.getTime() - date.getTime() < 30 * 24 * 60 * 60 * 1000;
    })
    .reduce((sum, receipt) => sum + receipt.total, 0);
  
  // Top products
  const productSales: Record<string, number> = {};
  
  receipts.forEach(receipt => {
    receipt.items.forEach(item => {
      if (!productSales[item.name]) {
        productSales[item.name] = 0;
      }
      productSales[item.name] += item.quantity;
    });
  });
  
  const topProducts = Object.entries(productSales)
    .map(([name, sales]) => ({ name, sales }))
    .sort((a, b) => b.sales - a.sales)
    .slice(0, 5);
  
  return {
    daily: dailySales,
    weekly: weeklySales,
    monthly: monthlySales,
    topProducts
  };
};

// Seed demo data
export const seedDemoData = () => {
  const products = getProducts();
  
  if (products.length === 0) {
    const demoProducts = [
      {
        name: "Espresso",
        description: "Strong coffee brewed by forcing hot water through finely-ground coffee beans",
        price: 3.50,
        category: "Beverages",
        stock: 100,
        barcode: "1234567890"
      },
      {
        name: "Cappuccino",
        description: "Coffee drink with espresso, hot milk, and steamed milk foam",
        price: 4.50,
        category: "Beverages",
        stock: 100,
        barcode: "2345678901"
      },
      {
        name: "Croissant",
        description: "Buttery, flaky viennoiserie pastry",
        price: 3.75,
        category: "Pastries",
        stock: 20,
        barcode: "3456789012"
      },
      {
        name: "Chocolate Muffin",
        description: "Sweet, moist cake with chocolate chips",
        price: 3.25,
        category: "Pastries",
        stock: 15,
        barcode: "4567890123"
      },
      {
        name: "Green Tea",
        description: "Healthy tea with antioxidants",
        price: 3.00,
        category: "Beverages",
        stock: 30,
        barcode: "5678901234"
      }
    ];
    
    demoProducts.forEach(product => {
      createProduct(product);
    });
  }
};
