export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  compareAtPrice?: number;
  costPrice: number;
  sku: string;
  barcode?: string;
  inventory: number;
  images: string[];
  category: string;
  tags: string[];
  supplier: Supplier;
  supplierId: string;
  variants: ProductVariant[];
  status: "active" | "draft" | "archived";
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductVariant {
  id: string;
  productId: string;
  title: string;
  sku: string;
  price: number;
  compareAtPrice?: number;
  costPrice: number;
  inventory: number;
  options: Record<string, string>;
}

export interface Supplier {
  id: string;
  name: string;
  email: string;
  phone?: string;
  website?: string;
  rating: number;
  fulfillmentSpeed: number;
  qualityScore: number;
  communicationScore: number;
  products: Product[];
  orders: Order[];
  status: "active" | "inactive";
}

export interface Order {
  id: string;
  orderNumber: string;
  customer: Customer;
  customerId: string;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  status: OrderStatus;
  shippingAddress: Address;
  billingAddress: Address;
  paymentStatus: PaymentStatus;
  fulfillmentStatus: FulfillmentStatus;
  trackingNumber?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  variantId?: string;
  quantity: number;
  price: number;
  cost: number;
  profit: number;
}

export interface Customer {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  orders: Order[];
  addresses: Address[];
}

export interface Address {
  id: string;
  customerId?: string;
  firstName: string;
  lastName: string;
  company?: string;
  address1: string;
  address2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone?: string;
}

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "refunded";

export type PaymentStatus =
  | "pending"
  | "authorized"
  | "paid"
  | "partially_refunded"
  | "refunded"
  | "failed";

export type FulfillmentStatus =
  | "unfulfilled"
  | "partially_fulfilled"
  | "fulfilled"
  | "cancelled";
