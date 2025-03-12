import { supabase } from "../supabase";
import { Product, Supplier, Order } from "@/types/schema";

export const api = {
  products: {
    async list(params: {
      search?: string;
      category?: string;
      supplierId?: string;
      minPrice?: number;
      maxPrice?: number;
      minRating?: number;
      inStock?: boolean;
      page?: number;
      limit?: number;
    }) {
      const {
        search,
        category,
        supplierId,
        minPrice,
        maxPrice,
        minRating,
        inStock,
        page = 1,
        limit = 20,
      } = params;

      let query = supabase
        .from("products")
        .select("*, supplier:suppliers(*)", { count: "exact" });

      if (search) {
        query = query.or(
          `title.ilike.%${search}%,description.ilike.%${search}%`,
        );
      }

      if (category) {
        query = query.eq("category", category);
      }

      if (supplierId) {
        query = query.eq("supplierId", supplierId);
      }

      if (minPrice !== undefined) {
        query = query.gte("price", minPrice);
      }

      if (maxPrice !== undefined) {
        query = query.lte("price", maxPrice);
      }

      if (minRating !== undefined) {
        query = query.gte("supplier.rating", minRating);
      }

      if (inStock !== undefined) {
        query = inStock ? query.gt("inventory", 0) : query.eq("inventory", 0);
      }

      const { data, error, count } = await query
        .range((page - 1) * limit, page * limit - 1)
        .order("createdAt", { ascending: false });

      if (error) throw error;

      return {
        products: data as (Product & { supplier: Supplier })[],
        pagination: {
          page,
          limit,
          total: count || 0,
          pages: Math.ceil((count || 0) / limit),
        },
      };
    },

    async getById(id: string) {
      const { data, error } = await supabase
        .from("products")
        .select("*, supplier:suppliers(*), variants:product_variants(*)")
        .eq("id", id)
        .single();

      if (error) throw error;
      return data as Product & { supplier: Supplier };
    },

    async create(product: Omit<Product, "id" | "createdAt" | "updatedAt">) {
      const { data, error } = await supabase
        .from("products")
        .insert(product)
        .select("*, supplier:suppliers(*)")
        .single();

      if (error) throw error;
      return data as Product & { supplier: Supplier };
    },

    async update(id: string, updates: Partial<Product>) {
      const { data, error } = await supabase
        .from("products")
        .update(updates)
        .eq("id", id)
        .select("*, supplier:suppliers(*)")
        .single();

      if (error) throw error;
      return data as Product & { supplier: Supplier };
    },

    async delete(id: string) {
      const { error } = await supabase.from("products").delete().eq("id", id);
      if (error) throw error;
      return true;
    },
  },

  suppliers: {
    async list(params: {
      search?: string;
      status?: string;
      page?: number;
      limit?: number;
    }) {
      const { search, status, page = 1, limit = 20 } = params;

      let query = supabase.from("suppliers").select("*", { count: "exact" });

      if (search) {
        query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%`);
      }

      if (status) {
        query = query.eq("status", status);
      }

      const { data, error, count } = await query
        .range((page - 1) * limit, page * limit - 1)
        .order("name");

      if (error) throw error;

      // Get product counts for each supplier
      const supplierIds = data.map((supplier) => supplier.id);
      const { data: productCounts, error: productError } = await supabase
        .from("products")
        .select("supplierId, count")
        .in("supplierId", supplierIds)
        .group("supplierId");

      if (productError) throw productError;

      // Get order counts for each supplier
      const { data: orderCounts, error: orderError } = await supabase
        .from("orders")
        .select("supplierId, count")
        .in("supplierId", supplierIds)
        .group("supplierId");

      if (orderError) throw orderError;

      // Combine data
      const suppliersWithCounts = data.map((supplier) => {
        const productCount =
          productCounts?.find((p) => p.supplierId === supplier.id)?.count || 0;
        const orderCount =
          orderCounts?.find((o) => o.supplierId === supplier.id)?.count || 0;

        return {
          ...supplier,
          _count: {
            products: productCount,
            orders: orderCount,
          },
        };
      });

      return {
        suppliers: suppliersWithCounts as (Supplier & {
          _count: { products: number; orders: number };
        })[],
        pagination: {
          page,
          limit,
          total: count || 0,
          pages: Math.ceil((count || 0) / limit),
        },
      };
    },

    async getById(id: string) {
      const { data, error } = await supabase
        .from("suppliers")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      return data as Supplier;
    },

    async create(supplier: Omit<Supplier, "id" | "createdAt" | "updatedAt">) {
      const { data, error } = await supabase
        .from("suppliers")
        .insert(supplier)
        .select()
        .single();

      if (error) throw error;
      return data as Supplier;
    },

    async update(id: string, updates: Partial<Supplier>) {
      const { data, error } = await supabase
        .from("suppliers")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data as Supplier;
    },
  },

  orders: {
    async list(params: {
      status?: string;
      customerId?: string;
      supplierId?: string;
      startDate?: Date;
      endDate?: Date;
      page?: number;
      limit?: number;
    }) {
      const {
        status,
        customerId,
        supplierId,
        startDate,
        endDate,
        page = 1,
        limit = 20,
      } = params;

      let query = supabase
        .from("orders")
        .select(
          "*, customer:customers(*), supplier:suppliers(*), items:order_items(*, product:products(*))",
          { count: "exact" },
        );

      if (status) {
        query = query.eq("status", status);
      }

      if (customerId) {
        query = query.eq("customerId", customerId);
      }

      if (supplierId) {
        query = query.eq("supplierId", supplierId);
      }

      if (startDate) {
        query = query.gte("createdAt", startDate.toISOString());
      }

      if (endDate) {
        query = query.lte("createdAt", endDate.toISOString());
      }

      const { data, error, count } = await query
        .range((page - 1) * limit, page * limit - 1)
        .order("createdAt", { ascending: false });

      if (error) throw error;

      return {
        orders: data as Order[],
        pagination: {
          page,
          limit,
          total: count || 0,
          pages: Math.ceil((count || 0) / limit),
        },
      };
    },

    async getById(id: string) {
      const { data, error } = await supabase
        .from("orders")
        .select(
          "*, customer:customers(*), supplier:suppliers(*), items:order_items(*, product:products(*))",
        )
        .eq("id", id)
        .single();

      if (error) throw error;
      return data as Order;
    },
  },

  analytics: {
    async getDashboardStats(dateRange: { start: Date; end: Date }) {
      // Total Orders
      const { count: totalOrders, error: ordersError } = await supabase
        .from("orders")
        .select("*", { count: "exact" })
        .gte("createdAt", dateRange.start.toISOString())
        .lte("createdAt", dateRange.end.toISOString());

      if (ordersError) throw ordersError;

      // Total Revenue
      const { data: revenueData, error: revenueError } = await supabase
        .from("orders")
        .select("total")
        .gte("createdAt", dateRange.start.toISOString())
        .lte("createdAt", dateRange.end.toISOString());

      if (revenueError) throw revenueError;

      const totalRevenue = revenueData.reduce(
        (sum, order) => sum + (order.total || 0),
        0,
      );

      // Total Profit
      const { data: profitData, error: profitError } = await supabase
        .from("order_items")
        .select("profit, order:orders!inner(createdAt)")
        .gte("order.createdAt", dateRange.start.toISOString())
        .lte("order.createdAt", dateRange.end.toISOString());

      if (profitError) throw profitError;

      const totalProfit = profitData.reduce(
        (sum, item) => sum + (item.profit || 0),
        0,
      );

      // Average Order Value
      const averageOrderValue =
        revenueData.length > 0 ? totalRevenue / revenueData.length : 0;

      // Sales By Day
      const { data: salesByDay, error: salesError } = await supabase.rpc(
        "get_sales_by_day",
        {
          start_date: dateRange.start.toISOString(),
          end_date: dateRange.end.toISOString(),
        },
      );

      if (salesError) throw salesError;

      return {
        totalOrders: totalOrders || 0,
        totalRevenue,
        totalProfit,
        averageOrderValue,
        salesByDay: salesByDay || [],
      };
    },
  },
};
