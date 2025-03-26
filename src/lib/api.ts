
import { Product, Receipt, CartItem, SalesData } from "@/types";

// API base URL - change this to your actual backend URL
const API_BASE_URL = "http://localhost:3000/api";

// Generic fetch function with error handling
const fetchAPI = async <T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> => {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        "Content-Type": "application/json",
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("API request failed:", error);
    throw error;
  }
};

// Product operations
export const getProducts = async (): Promise<Product[]> => {
  return fetchAPI<Product[]>("/products");
};

export const getProduct = async (id: string): Promise<Product | undefined> => {
  return fetchAPI<Product>(`/products/${id}`);
};

export const createProduct = async (
  product: Omit<Product, "id" | "createdAt" | "updatedAt">
): Promise<Product> => {
  return fetchAPI<Product>("/products", {
    method: "POST",
    body: JSON.stringify(product),
  });
};

export const updateProduct = async (
  id: string,
  updates: Partial<Product>
): Promise<Product | undefined> => {
  return fetchAPI<Product>(`/products/${id}`, {
    method: "PATCH", // Changed from PUT to PATCH as per your endpoint specification
    body: JSON.stringify(updates),
  });
};

export const deleteProduct = async (id: string): Promise<boolean> => {
  await fetchAPI(`/products/${id}`, {
    method: "DELETE",
  });
  return true;
};

// This helper function might be needed in your backend implementation
export const updateStock = async (items: CartItem[]): Promise<void> => {
  // Backend should handle stock updates when processing receipts
  // This is now a no-op as the backend will handle this
  console.log("Stock updates should be handled by the backend");
};

// Receipt operations
export const getReceipts = async (
  dateFrom?: Date,
  dateTo?: Date
): Promise<Receipt[]> => {
  let url = "/receipts";
  
  // Add query parameters for date filtering if provided
  if (dateFrom || dateTo) {
    const params = new URLSearchParams();
    if (dateFrom) params.append("dateFrom", dateFrom.toISOString());
    if (dateTo) params.append("dateTo", dateTo.toISOString());
    url += `?${params.toString()}`;
  }
  
  const receipts = await fetchAPI<Receipt[]>(url);
  // Convert string dates to Date objects
  return receipts.map(receipt => ({
    ...receipt,
    createdAt: new Date(receipt.createdAt)
  }));
};

export const getReceipt = async (id: string): Promise<Receipt | undefined> => {
  const receipt = await fetchAPI<Receipt>(`/receipts/${id}`);
  return {
    ...receipt,
    createdAt: new Date(receipt.createdAt)
  };
};

export const createReceipt = async (
  receipt: Omit<Receipt, "id" | "createdAt">
): Promise<Receipt> => {
  const newReceipt = await fetchAPI<Receipt>("/receipts", {
    method: "POST",
    body: JSON.stringify(receipt),
  });
  
  return {
    ...newReceipt,
    createdAt: new Date(newReceipt.createdAt)
  };
};

// Dashboard analytics
export const getDashboardData = async (): Promise<SalesData> => {
  return fetchAPI<SalesData>("/dashboard");
};

// Development only - seed data
export const seedDemoData = async (): Promise<void> => {
  await fetchAPI("/seed", {
    method: "POST"
  });
};

// Add a fallback to localStorage if the API is not available
export const useFallbackDb = () => {
  // Import the original localStorage functions
  const localDb = require("./db");
  
  // Return either the API functions or localStorage functions
  return {
    getProducts: async () => {
      try {
        return await getProducts();
      } catch (error) {
        console.warn("Using localStorage fallback for getProducts");
        return localDb.getProducts();
      }
    },
    getProduct: async (id: string) => {
      try {
        return await getProduct(id);
      } catch (error) {
        console.warn("Using localStorage fallback for getProduct");
        return localDb.getProduct(id);
      }
    },
    createProduct: async (product: Omit<Product, "id" | "createdAt" | "updatedAt">) => {
      try {
        return await createProduct(product);
      } catch (error) {
        console.warn("Using localStorage fallback for createProduct");
        return localDb.createProduct(product);
      }
    },
    updateProduct: async (id: string, updates: Partial<Product>) => {
      try {
        return await updateProduct(id, updates);
      } catch (error) {
        console.warn("Using localStorage fallback for updateProduct");
        return localDb.updateProduct(id, updates);
      }
    },
    deleteProduct: async (id: string) => {
      try {
        return await deleteProduct(id);
      } catch (error) {
        console.warn("Using localStorage fallback for deleteProduct");
        return localDb.deleteProduct(id);
      }
    },
    getReceipts: async (dateFrom?: Date, dateTo?: Date) => {
      try {
        return await getReceipts(dateFrom, dateTo);
      } catch (error) {
        console.warn("Using localStorage fallback for getReceipts");
        return localDb.getReceipts();
      }
    },
    getReceipt: async (id: string) => {
      try {
        return await getReceipt(id);
      } catch (error) {
        console.warn("Using localStorage fallback for getReceipt");
        return localDb.getReceipt(id);
      }
    },
    createReceipt: async (receipt: Omit<Receipt, "id" | "createdAt">) => {
      try {
        return await createReceipt(receipt);
      } catch (error) {
        console.warn("Using localStorage fallback for createReceipt");
        return localDb.createReceipt(receipt);
      }
    },
    getDashboardData: async () => {
      try {
        return await getDashboardData();
      } catch (error) {
        console.warn("Using localStorage fallback for getDashboardData");
        return localDb.getSalesData();
      }
    },
    seedDemoData: async () => {
      try {
        return await seedDemoData();
      } catch (error) {
        console.warn("Using localStorage fallback for seedDemoData");
        return localDb.seedDemoData();
      }
    }
  };
};
