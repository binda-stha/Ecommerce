const API_BASE_URL = "http://localhost:5001/api";

class ApiService {
  static async fetchProducts(filters = {}) {
    try {
      const params = new URLSearchParams();

      if (filters.search) params.append("search", filters.search);
      if (filters.category) params.append("category", filters.category);
      if (filters.minPrice) params.append("minPrice", filters.minPrice);
      if (filters.maxPrice) params.append("maxPrice", filters.maxPrice);
      if (filters.sortBy) params.append("sortBy", filters.sortBy);
      if (filters.sortOrder) params.append("sortOrder", filters.sortOrder);
      if (filters.page) params.append("page", filters.page);
      if (filters.limit) params.append("limit", filters.limit);

      const url = params.toString()
        ? `${API_BASE_URL}/products?${params.toString()}`
        : `${API_BASE_URL}/products`;

      console.log("🌐 Fetching from URL:", url);

      const response = await fetch(url);

      console.log("📡 Response status:", response.status, response.statusText);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("📄 Response data:", data);
      return data;
    } catch (error) {
      console.error("❌ API fetch error:", error);
      throw error;
    }
  }

  static async fetchProductById(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/products/${id}`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching product:", error);
      throw error;
    }
  }

  static async fetchCategories() {
    try {
      const response = await fetch(`${API_BASE_URL}/products/categories`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching categories:", error);
      throw error;
    }
  }

  // Fallback to mock data if API fails
  static async fetchProductsWithFallback(filters = {}) {
    try {
      console.log("🔌 Attempting API fetch...");
      const result = await this.fetchProducts(filters);
      console.log("✅ API fetch successful:", result);
      return result;
    } catch (error) {
      console.warn("⚠️ API failed, falling back to mock data:", error);

      // Import mock data dynamically
      const { mockProducts } = await import("../data/mockData.js");
      console.log("📦 Loaded mock products:", mockProducts.length, "items");

      // Apply basic filtering to mock data
      let filteredProducts = [...mockProducts];

      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        filteredProducts = filteredProducts.filter(
          (product) =>
            product.name.toLowerCase().includes(searchTerm) ||
            product.description?.toLowerCase().includes(searchTerm)
        );
      }

      if (filters.category && filters.category !== "all") {
        filteredProducts = filteredProducts.filter(
          (product) => product.category === filters.category
        );
      }

      if (filters.minPrice) {
        filteredProducts = filteredProducts.filter(
          (product) => product.price >= filters.minPrice
        );
      }

      if (filters.maxPrice) {
        filteredProducts = filteredProducts.filter(
          (product) => product.price <= filters.maxPrice
        );
      }

      // Apply sorting
      if (filters.sortBy) {
        filteredProducts.sort((a, b) => {
          let aValue = a[filters.sortBy];
          let bValue = b[filters.sortBy];

          if (filters.sortBy === "price") {
            aValue = parseFloat(aValue);
            bValue = parseFloat(bValue);
          }

          if (filters.sortOrder === "desc") {
            return bValue > aValue ? 1 : -1;
          } else {
            return aValue > bValue ? 1 : -1;
          }
        });
      }

      // Apply pagination
      const page = parseInt(filters.page) || 1;
      const limit = parseInt(filters.limit) || 12;
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

      return {
        success: true,
        data: {
          products: paginatedProducts,
          pagination: {
            currentPage: page,
            totalPages: Math.ceil(filteredProducts.length / limit),
            totalProducts: filteredProducts.length,
            hasNext: endIndex < filteredProducts.length,
            hasPrev: page > 1,
          },
        },
      };
    }
  }
}

export default ApiService;
