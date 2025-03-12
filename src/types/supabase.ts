export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      addresses: {
        Row: {
          address1: string
          address2: string | null
          city: string
          company: string | null
          country: string
          created_at: string | null
          customer_id: string | null
          first_name: string
          id: string
          last_name: string
          phone: string | null
          postal_code: string
          state: string
          updated_at: string | null
        }
        Insert: {
          address1: string
          address2?: string | null
          city: string
          company?: string | null
          country: string
          created_at?: string | null
          customer_id?: string | null
          first_name: string
          id?: string
          last_name: string
          phone?: string | null
          postal_code: string
          state: string
          updated_at?: string | null
        }
        Update: {
          address1?: string
          address2?: string | null
          city?: string
          company?: string | null
          country?: string
          created_at?: string | null
          customer_id?: string | null
          first_name?: string
          id?: string
          last_name?: string
          phone?: string | null
          postal_code?: string
          state?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "addresses_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      customers: {
        Row: {
          created_at: string | null
          email: string
          first_name: string | null
          id: string
          last_name: string | null
          phone: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          phone?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          phone?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      order_items: {
        Row: {
          cost: number
          created_at: string | null
          id: string
          order_id: string
          price: number
          product_id: string
          profit: number | null
          quantity: number
          updated_at: string | null
          variant_id: string | null
        }
        Insert: {
          cost: number
          created_at?: string | null
          id?: string
          order_id: string
          price: number
          product_id: string
          profit?: number | null
          quantity: number
          updated_at?: string | null
          variant_id?: string | null
        }
        Update: {
          cost?: number
          created_at?: string | null
          id?: string
          order_id?: string
          price?: number
          product_id?: string
          profit?: number | null
          quantity?: number
          updated_at?: string | null
          variant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "product_variants"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          billing_address_id: string | null
          created_at: string | null
          customer_id: string
          fulfillment_status: string
          id: string
          notes: string | null
          order_number: string
          payment_status: string
          shipping: number
          shipping_address_id: string | null
          status: string
          subtotal: number
          supplier_id: string | null
          tax: number
          total: number
          tracking_number: string | null
          updated_at: string | null
        }
        Insert: {
          billing_address_id?: string | null
          created_at?: string | null
          customer_id: string
          fulfillment_status?: string
          id?: string
          notes?: string | null
          order_number: string
          payment_status?: string
          shipping?: number
          shipping_address_id?: string | null
          status?: string
          subtotal: number
          supplier_id?: string | null
          tax?: number
          total: number
          tracking_number?: string | null
          updated_at?: string | null
        }
        Update: {
          billing_address_id?: string | null
          created_at?: string | null
          customer_id?: string
          fulfillment_status?: string
          id?: string
          notes?: string | null
          order_number?: string
          payment_status?: string
          shipping?: number
          shipping_address_id?: string | null
          status?: string
          subtotal?: number
          supplier_id?: string | null
          tax?: number
          total?: number
          tracking_number?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_billing_address_id_fkey"
            columns: ["billing_address_id"]
            isOneToOne: false
            referencedRelation: "addresses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_shipping_address_id_fkey"
            columns: ["shipping_address_id"]
            isOneToOne: false
            referencedRelation: "addresses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      product_variants: {
        Row: {
          compare_at_price: number | null
          cost_price: number
          created_at: string | null
          id: string
          inventory: number
          options: Json
          price: number
          product_id: string
          sku: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          compare_at_price?: number | null
          cost_price: number
          created_at?: string | null
          id?: string
          inventory?: number
          options?: Json
          price: number
          product_id: string
          sku?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          compare_at_price?: number | null
          cost_price?: number
          created_at?: string | null
          id?: string
          inventory?: number
          options?: Json
          price?: number
          product_id?: string
          sku?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "product_variants_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          barcode: string | null
          category: string | null
          compare_at_price: number | null
          cost_price: number
          created_at: string | null
          description: string | null
          id: string
          images: Json | null
          inventory: number
          price: number
          sku: string | null
          status: string
          supplier_id: string
          tags: Json | null
          title: string
          updated_at: string | null
        }
        Insert: {
          barcode?: string | null
          category?: string | null
          compare_at_price?: number | null
          cost_price: number
          created_at?: string | null
          description?: string | null
          id?: string
          images?: Json | null
          inventory?: number
          price: number
          sku?: string | null
          status?: string
          supplier_id: string
          tags?: Json | null
          title: string
          updated_at?: string | null
        }
        Update: {
          barcode?: string | null
          category?: string | null
          compare_at_price?: number | null
          cost_price?: number
          created_at?: string | null
          description?: string | null
          id?: string
          images?: Json | null
          inventory?: number
          price?: number
          sku?: string | null
          status?: string
          supplier_id?: string
          tags?: Json | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "products_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      suppliers: {
        Row: {
          communication_score: number | null
          created_at: string | null
          email: string
          fulfillment_speed: number | null
          id: string
          name: string
          phone: string | null
          quality_score: number | null
          rating: number | null
          status: string
          updated_at: string | null
          website: string | null
        }
        Insert: {
          communication_score?: number | null
          created_at?: string | null
          email: string
          fulfillment_speed?: number | null
          id?: string
          name: string
          phone?: string | null
          quality_score?: number | null
          rating?: number | null
          status?: string
          updated_at?: string | null
          website?: string | null
        }
        Update: {
          communication_score?: number | null
          created_at?: string | null
          email?: string
          fulfillment_speed?: number | null
          id?: string
          name?: string
          phone?: string | null
          quality_score?: number | null
          rating?: number | null
          status?: string
          updated_at?: string | null
          website?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_sales_by_day: {
        Args: {
          start_date: string
          end_date: string
        }
        Returns: {
          date: string
          order_count: number
          total_sales: number
          total_profit: number
        }[]
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
