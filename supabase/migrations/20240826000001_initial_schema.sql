-- Create tables for the dropshipping platform

-- Suppliers table
CREATE TABLE IF NOT EXISTS suppliers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  website TEXT,
  rating DECIMAL(3,1) DEFAULT 0,
  fulfillment_speed DECIMAL(5,2) DEFAULT 0,
  quality_score DECIMAL(3,1) DEFAULT 0,
  communication_score DECIMAL(3,1) DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Products table
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  compare_at_price DECIMAL(10,2),
  cost_price DECIMAL(10,2) NOT NULL,
  sku TEXT,
  barcode TEXT,
  inventory INTEGER NOT NULL DEFAULT 0,
  images JSONB DEFAULT '[]'::jsonb,
  category TEXT,
  tags JSONB DEFAULT '[]'::jsonb,
  supplier_id UUID NOT NULL REFERENCES suppliers(id),
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Product variants table
CREATE TABLE IF NOT EXISTS product_variants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  sku TEXT,
  price DECIMAL(10,2) NOT NULL,
  compare_at_price DECIMAL(10,2),
  cost_price DECIMAL(10,2) NOT NULL,
  inventory INTEGER NOT NULL DEFAULT 0,
  options JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Customers table
CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT NOT NULL,
  first_name TEXT,
  last_name TEXT,
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Addresses table
CREATE TABLE IF NOT EXISTS addresses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  company TEXT,
  address1 TEXT NOT NULL,
  address2 TEXT,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  postal_code TEXT NOT NULL,
  country TEXT NOT NULL,
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_number TEXT NOT NULL,
  customer_id UUID NOT NULL REFERENCES customers(id),
  subtotal DECIMAL(10,2) NOT NULL,
  tax DECIMAL(10,2) NOT NULL DEFAULT 0,
  shipping DECIMAL(10,2) NOT NULL DEFAULT 0,
  total DECIMAL(10,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  shipping_address_id UUID REFERENCES addresses(id),
  billing_address_id UUID REFERENCES addresses(id),
  payment_status TEXT NOT NULL DEFAULT 'pending',
  fulfillment_status TEXT NOT NULL DEFAULT 'unfulfilled',
  tracking_number TEXT,
  notes TEXT,
  supplier_id UUID REFERENCES suppliers(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Order items table
CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id),
  variant_id UUID REFERENCES product_variants(id),
  quantity INTEGER NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  cost DECIMAL(10,2) NOT NULL,
  profit DECIMAL(10,2) GENERATED ALWAYS AS ((price - cost) * quantity) STORED,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create function for sales by day
CREATE OR REPLACE FUNCTION get_sales_by_day(
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE
) RETURNS TABLE (
  date DATE,
  order_count BIGINT,
  total_sales DECIMAL(10,2),
  total_profit DECIMAL(10,2)
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    DATE(o.created_at) as date,
    COUNT(o.id) as order_count,
    SUM(o.total) as total_sales,
    SUM(oi.profit) as total_profit
  FROM
    orders o
    LEFT JOIN order_items oi ON o.id = oi.order_id
  WHERE
    o.created_at >= start_date AND
    o.created_at <= end_date
  GROUP BY
    DATE(o.created_at)
  ORDER BY
    date ASC;
END;
$$ LANGUAGE plpgsql;

-- Enable row level security
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Create policies
-- For now, allow all authenticated users to access all data
CREATE POLICY "Allow authenticated users to read suppliers"
  ON suppliers FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to modify suppliers"
  ON suppliers FOR ALL
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to read products"
  ON products FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to modify products"
  ON products FOR ALL
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to read product variants"
  ON product_variants FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to modify product variants"
  ON product_variants FOR ALL
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to read customers"
  ON customers FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to modify customers"
  ON customers FOR ALL
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to read addresses"
  ON addresses FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to modify addresses"
  ON addresses FOR ALL
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to read orders"
  ON orders FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to modify orders"
  ON orders FOR ALL
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to read order items"
  ON order_items FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to modify order items"
  ON order_items FOR ALL
  TO authenticated
  USING (true);

-- Enable realtime subscriptions
ALTER PUBLICATION supabase_realtime ADD TABLE suppliers;
ALTER PUBLICATION supabase_realtime ADD TABLE products;
ALTER PUBLICATION supabase_realtime ADD TABLE product_variants;
ALTER PUBLICATION supabase_realtime ADD TABLE customers;
ALTER PUBLICATION supabase_realtime ADD TABLE addresses;
ALTER PUBLICATION supabase_realtime ADD TABLE orders;
ALTER PUBLICATION supabase_realtime ADD TABLE order_items;
