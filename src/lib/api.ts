
import { Product, Receipt, CartItem, SalesData } from "@/types";
import { toast } from "sonner";

// API base URL - change this to your actual backend URL
const API_BASE_URL = "http://localhost:3000/api";

// Local storage keys
const STORAGE_KEYS = {
  PRODUCTS: "simplepos_products",
  RECEIPTS: "simplepos_receipts",
  SALES_DATA: "simplepos_sales_data",
};

// Improved fetch function with error handling and timeout
const fetchAPI = async <T>(
  endpoint: string,
  options?: RequestInit,
  timeout = 5000
): Promise<T> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        "Content-Type": "application/json",
      },
      signal: controller.signal,
      ...options,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    clearTimeout(timeoutId);
    console.error("API request failed:", error);
    throw error;
  }
};

// Fallback to localStorage when API fails
const getFromLocalStorage = <T>(key: string, defaultValue: T): T => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error(`Error reading from localStorage (${key}):`, error);
    return defaultValue;
  }
};

const saveToLocalStorage = <T>(key: string, data: T): void => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error(`Error saving to localStorage (${key}):`, error);
  }
};

// Product operations with improved error handling
export const getProducts = async (): Promise<Product[]> => {
  try {
    const products = await fetchAPI<Product[]>("/products");
    saveToLocalStorage(STORAGE_KEYS.PRODUCTS, products);
    return products;
  } catch (error) {
    console.warn("API request failed, using localStorage fallback for products");
    return getFromLocalStorage<Product[]>(STORAGE_KEYS.PRODUCTS, []);
  }
};

export const getProduct = async (id: string): Promise<Product | undefined> => {
  try {
    const product = await fetchAPI<Product>(`/products/${id}`);
    return product;
  } catch (error) {
    console.warn(`API request failed, using localStorage fallback for product ${id}`);
    const products = getFromLocalStorage<Product[]>(STORAGE_KEYS.PRODUCTS, []);
    return products.find(p => p.id === id);
  }
};

export const createProduct = async (
  product: Omit<Product, "id" | "createdAt" | "updatedAt">
): Promise<Product> => {
  try {
    const newProduct = await fetchAPI<Product>("/products", {
      method: "POST",
      body: JSON.stringify(product),
    });
    
    // Update local cache
    const products = getFromLocalStorage<Product[]>(STORAGE_KEYS.PRODUCTS, []);
    saveToLocalStorage(STORAGE_KEYS.PRODUCTS, [...products, newProduct]);
    
    return newProduct;
  } catch (error) {
    console.warn("API request failed, using localStorage fallback for creating product");
    
    // Create a new product locally
    const products = getFromLocalStorage<Product[]>(STORAGE_KEYS.PRODUCTS, []);
    const newProduct: Product = {
      ...product,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    saveToLocalStorage(STORAGE_KEYS.PRODUCTS, [...products, newProduct]);
    toast.warning("Created product in local storage", {
      description: "Changes will be lost when you clear browser data",
    });
    
    return newProduct;
  }
};

export const updateProduct = async (
  id: string,
  updates: Partial<Product>
): Promise<Product | undefined> => {
  try {
    const updatedProduct = await fetchAPI<Product>(`/products/${id}`, {
      method: "PATCH",
      body: JSON.stringify(updates),
    });
    
    // Update local cache
    const products = getFromLocalStorage<Product[]>(STORAGE_KEYS.PRODUCTS, []);
    const updatedProducts = products.map(p => p.id === id ? { ...p, ...updatedProduct } : p);
    saveToLocalStorage(STORAGE_KEYS.PRODUCTS, updatedProducts);
    
    return updatedProduct;
  } catch (error) {
    console.warn(`API request failed, using localStorage fallback for updating product ${id}`);
    
    // Update product locally
    const products = getFromLocalStorage<Product[]>(STORAGE_KEYS.PRODUCTS, []);
    const index = products.findIndex(p => p.id === id);
    
    if (index === -1) return undefined;
    
    const updatedProduct = {
      ...products[index],
      ...updates,
      updatedAt: new Date(),
    };
    
    products[index] = updatedProduct;
    saveToLocalStorage(STORAGE_KEYS.PRODUCTS, products);
    toast.warning("Updated product in local storage", {
      description: "Changes will be lost when you clear browser data",
    });
    
    return updatedProduct;
  }
};

export const deleteProduct = async (id: string): Promise<boolean> => {
  try {
    await fetchAPI(`/products/${id}`, {
      method: "DELETE",
    });
    
    // Update local cache
    const products = getFromLocalStorage<Product[]>(STORAGE_KEYS.PRODUCTS, []);
    const filteredProducts = products.filter(p => p.id !== id);
    saveToLocalStorage(STORAGE_KEYS.PRODUCTS, filteredProducts);
    
    return true;
  } catch (error) {
    console.warn(`API request failed, using localStorage fallback for deleting product ${id}`);
    
    // Delete product locally
    const products = getFromLocalStorage<Product[]>(STORAGE_KEYS.PRODUCTS, []);
    const filteredProducts = products.filter(p => p.id !== id);
    
    if (filteredProducts.length === products.length) return false;
    
    saveToLocalStorage(STORAGE_KEYS.PRODUCTS, filteredProducts);
    toast.warning("Deleted product from local storage", {
      description: "Changes will be lost when you clear browser data",
    });
    
    return true;
  }
};

// Receipt operations with improved error handling
export const getReceipts = async (
  dateFrom?: Date,
  dateTo?: Date
): Promise<Receipt[]> => {
  try {
    let url = "/receipts";
    
    // Add query parameters for date filtering if provided
    if (dateFrom || dateTo) {
      const params = new URLSearchParams();
      if (dateFrom) params.append("dateFrom", dateFrom.toISOString());
      if (dateTo) params.append("dateTo", dateTo.toISOString());
      url += `?${params.toString()}`;
    }
    
    const receipts = await fetchAPI<Receipt[]>(url);
    
    // Update local cache
    saveToLocalStorage(STORAGE_KEYS.RECEIPTS, receipts);
    
    // Convert string dates to Date objects
    return receipts.map(receipt => ({
      ...receipt,
      createdAt: new Date(receipt.createdAt)
    }));
  } catch (error) {
    console.warn("API request failed, using localStorage fallback for receipts");
    
    let receipts = getFromLocalStorage<Receipt[]>(STORAGE_KEYS.RECEIPTS, [])
      .map(receipt => ({
        ...receipt,
        createdAt: new Date(receipt.createdAt instanceof Date ? receipt.createdAt : new Date(receipt.createdAt))
      }));
    
    // Apply date filters if provided
    if (dateFrom || dateTo) {
      receipts = receipts.filter(receipt => {
        const createdAt = new Date(receipt.createdAt).getTime();
        const fromTime = dateFrom ? dateFrom.getTime() : 0;
        const toTime = dateTo ? dateTo.getTime() : Infinity;
        return createdAt >= fromTime && createdAt <= toTime;
      });
    }
    
    return receipts;
  }
};

export const getReceipt = async (id: string): Promise<Receipt | undefined> => {
  try {
    const receipt = await fetchAPI<Receipt>(`/receipts/${id}`);
    return {
      ...receipt,
      createdAt: new Date(receipt.createdAt)
    };
  } catch (error) {
    console.warn(`API request failed, using localStorage fallback for receipt ${id}`);
    
    const receipts = getFromLocalStorage<Receipt[]>(STORAGE_KEYS.RECEIPTS, []);
    const receipt = receipts.find(r => r.id === id);
    
    return receipt ? {
      ...receipt,
      createdAt: new Date(receipt.createdAt instanceof Date ? receipt.createdAt : new Date(receipt.createdAt))
    } : undefined;
  }
};

export const createReceipt = async (
  receipt: Omit<Receipt, "id" | "createdAt">
): Promise<Receipt> => {
  try {
    const newReceipt = await fetchAPI<Receipt>("/receipts", {
      method: "POST",
      body: JSON.stringify(receipt),
    });
    
    // Update local cache
    const receipts = getFromLocalStorage<Receipt[]>(STORAGE_KEYS.RECEIPTS, []);
    const receiptWithDate = {
      ...newReceipt,
      createdAt: new Date(newReceipt.createdAt)
    };
    saveToLocalStorage(STORAGE_KEYS.RECEIPTS, [...receipts, newReceipt]);
    
    // Update product stock locally
    updateStock(receipt.items);
    
    return receiptWithDate;
  } catch (error) {
    console.warn("API request failed, using localStorage fallback for creating receipt");
    
    // Create a new receipt locally
    const receipts = getFromLocalStorage<Receipt[]>(STORAGE_KEYS.RECEIPTS, []);
    const newReceipt: Receipt = {
      ...receipt,
      id: crypto.randomUUID(),
      createdAt: new Date(),
    };
    
    saveToLocalStorage(STORAGE_KEYS.RECEIPTS, [...receipts, newReceipt]);
    
    // Update product stock locally
    updateStock(receipt.items);
    
    toast.warning("Created receipt in local storage", {
      description: "Changes will be lost when you clear browser data",
    });
    
    return newReceipt;
  }
};

// Update stock helper
export const updateStock = async (items: CartItem[]): Promise<void> => {
  try {
    // Try to update stock via API first
    await fetchAPI("/products/stock", {
      method: "POST",
      body: JSON.stringify({ items }),
    });
  } catch (error) {
    console.warn("API request failed, updating stock locally");
    
    // Fall back to updating stock locally
    const products = getFromLocalStorage<Product[]>(STORAGE_KEYS.PRODUCTS, []);
    
    items.forEach(item => {
      const index = products.findIndex(product => product.id === item.id);
      if (index !== -1) {
        products[index].stock -= item.quantity;
      }
    });
    
    saveToLocalStorage(STORAGE_KEYS.PRODUCTS, products);
  }
};

// Dashboard analytics with improved error handling
export const getDashboardData = async (): Promise<SalesData> => {
  try {
    const data = await fetchAPI<SalesData>("/dashboard");
    saveToLocalStorage(STORAGE_KEYS.SALES_DATA, data);
    return data;
  } catch (error) {
    console.warn("API request failed, using localStorage fallback for dashboard data");
    return getSalesDataFromLocalStorage();
  }
};

// Generate sales data from local receipts
const getSalesDataFromLocalStorage = (): SalesData => {
  const receipts = getFromLocalStorage<Receipt[]>(STORAGE_KEYS.RECEIPTS, [])
    .map(receipt => ({
      ...receipt,
      createdAt: new Date(receipt.createdAt instanceof Date ? receipt.createdAt : new Date(receipt.createdAt))
    }));
  
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

// Seed demo data with improved error handling
export const seedDemoData = async (): Promise<void> => {
  try {
    await fetchAPI("/seed", {
      method: "POST"
    });
  } catch (error) {
    console.warn("API request failed, seeding demo data locally");
    seedLocalDemoData();
  }
};

// Seed local demo data
const seedLocalDemoData = (): void => {
  const products = getFromLocalStorage<Product[]>(STORAGE_KEYS.PRODUCTS, []);
  
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
    
    const newProducts = demoProducts.map(product => ({
      ...product,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date()
    }));
    
    saveToLocalStorage(STORAGE_KEYS.PRODUCTS, newProducts);
    toast.success("Demo data seeded successfully", {
      description: "Using local storage since API is unavailable",
    });
  }
};
