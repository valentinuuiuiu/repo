-- Insert sample suppliers
INSERT INTO suppliers (id, name, email, phone, website, rating, fulfillment_speed, quality_score, communication_score, status)
VALUES
  ('d0cb3ca1-93f7-4f9d-b1c6-a7a8bccc1b1f', 'Tech Supplies Inc', 'sales@techsupplies.com', '+1-555-123-4567', 'https://techsupplies.com', 4.5, 2.3, 4.6, 4.2, 'active'),
  ('f6a7d8c9-e0b1-4f2e-9d3c-5a6b7c8d9e0f', 'Global Gadgets', 'info@globalgadgets.com', '+1-555-987-6543', 'https://globalgadgets.com', 4.2, 3.1, 4.0, 4.5, 'active'),
  ('a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', 'ElectroWholesale', 'orders@electrowholesale.com', '+1-555-456-7890', 'https://electrowholesale.com', 4.7, 1.8, 4.8, 4.3, 'active'),
  ('c7d8e9f0-a1b2-c3d4-e5f6-a7b8c9d0e1f2', 'Budget Gadgets', 'support@budgetgadgets.com', '+1-555-789-0123', 'https://budgetgadgets.com', 3.8, 4.2, 3.5, 3.9, 'active'),
  ('e3f4a5b6-c7d8-e9f0-a1b2-c3d4e5f6a7b8', 'Premium Tech', 'contact@premiumtech.com', '+1-555-234-5678', 'https://premiumtech.com', 4.9, 2.0, 4.9, 4.7, 'active')
ON CONFLICT (id) DO NOTHING;

-- Insert sample products
INSERT INTO products (id, title, description, price, compare_at_price, cost_price, sku, inventory, images, category, tags, supplier_id, status)
VALUES
  ('1a2b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d', 'Wireless Headphones', 'High-quality wireless headphones with noise cancellation and 30-hour battery life', 99.99, 129.99, 45.00, 'WH-001', 150, '["https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80"]', 'Electronics', '["audio", "wireless", "headphones"]', 'd0cb3ca1-93f7-4f9d-b1c6-a7a8bccc1b1f', 'active'),
  ('2b3c4d5e-6f7a-8b9c-0d1e-2f3a4b5c6d7e', 'Smart Watch', 'Waterproof smart watch with heart rate monitoring and sleep tracking', 199.99, 249.99, 89.50, 'SW-002', 75, '["https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80"]', 'Electronics', '["wearable", "smart watch", "fitness"]', 'f6a7d8c9-e0b1-4f2e-9d3c-5a6b7c8d9e0f', 'active'),
  ('3c4d5e6f-7a8b-9c0d-1e2f-3a4b5c6d7e8f', 'Laptop Backpack', 'Durable laptop backpack with USB charging port and anti-theft design', 49.99, 69.99, 22.50, 'LB-003', 200, '["https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&q=80"]', 'Accessories', '["backpack", "laptop", "travel"]', 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', 'active'),
  ('4d5e6f7a-8b9c-0d1e-2f3a-4b5c6d7e8f9a', 'Wireless Mouse', 'Ergonomic wireless mouse with adjustable DPI and silent clicks', 29.99, 39.99, 12.75, 'WM-004', 300, '["https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=800&q=80"]', 'Electronics', '["mouse", "wireless", "computer"]', 'c7d8e9f0-a1b2-c3d4-e5f6-a7b8c9d0e1f2', 'active'),
  ('5e6f7a8b-9c0d-1e2f-3a4b-5c6d7e8f9a0b', 'Portable Bluetooth Speaker', 'Waterproof portable speaker with 24-hour battery life and deep bass', 59.99, 79.99, 28.50, 'BS-005', 120, '["https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=800&q=80"]', 'Electronics', '["speaker", "bluetooth", "portable"]', 'd0cb3ca1-93f7-4f9d-b1c6-a7a8bccc1b1f', 'active'),
  ('6f7a8b9c-0d1e-2f3a-4b5c-6d7e8f9a0b1c', 'Phone Case', 'Shockproof phone case with card holder and kickstand', 19.99, 24.99, 7.25, 'PC-006', 500, '["https://images.unsplash.com/photo-1541877944-ac82a091518a?w=800&q=80"]', 'Accessories', '["phone", "case", "protection"]', 'f6a7d8c9-e0b1-4f2e-9d3c-5a6b7c8d9e0f', 'active'),
  ('7a8b9c0d-1e2f-3a4b-5c6d-7e8f9a0b1c2d', 'Wireless Charging Pad', 'Fast wireless charging pad compatible with all Qi-enabled devices', 24.99, 34.99, 11.50, 'WC-007', 250, '["https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=800&q=80"]', 'Electronics', '["charger", "wireless", "phone"]', 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', 'active'),
  ('8b9c0d1e-2f3a-4b5c-6d7e-8f9a0b1c2d3e', 'Smart Home Hub', 'Central hub for controlling all your smart home devices', 129.99, 149.99, 65.00, 'SH-008', 80, '["https://images.unsplash.com/photo-1558002038-1055e2dae1d7?w=800&q=80"]', 'Smart Home', '["smart home", "hub", "automation"]', 'e3f4a5b6-c7d8-e9f0-a1b2-c3d4e5f6a7b8', 'active'),
  ('9c0d1e2f-3a4b-5c6d-7e8f-9a0b1c2d3e4f', 'Fitness Tracker', 'Slim fitness tracker with heart rate monitoring and sleep analysis', 79.99, 99.99, 35.25, 'FT-009', 150, '["https://images.unsplash.com/photo-1576243345690-4e4b79b63288?w=800&q=80"]', 'Wearables', '["fitness", "tracker", "health"]', 'c7d8e9f0-a1b2-c3d4-e5f6-a7b8c9d0e1f2', 'active'),
  ('0d1e2f3a-4b5c-6d7e-8f9a-0b1c2d3e4f5a', 'Mechanical Keyboard', 'RGB mechanical keyboard with customizable switches', 89.99, 109.99, 42.50, 'KB-010', 100, '["https://images.unsplash.com/photo-1595225476474-87563907a212?w=800&q=80"]', 'Electronics', '["keyboard", "mechanical", "gaming"]', 'e3f4a5b6-c7d8-e9f0-a1b2-c3d4e5f6a7b8', 'active')
ON CONFLICT (id) DO NOTHING;

-- Insert sample customers
INSERT INTO customers (id, email, first_name, last_name, phone)
VALUES
  ('a0b1c2d3-e4f5-6a7b-8c9d-0e1f2a3b4c5d', 'john.doe@example.com', 'John', 'Doe', '+1-555-111-2222'),
  ('b1c2d3e4-f5a6-7b8c-9d0e-1f2a3b4c5d6e', 'jane.smith@example.com', 'Jane', 'Smith', '+1-555-333-4444'),
  ('c2d3e4f5-a6b7-c8d9-e0f1-2a3b4c5d6e7f', 'bob.johnson@example.com', 'Bob', 'Johnson', '+1-555-555-6666')
ON CONFLICT (id) DO NOTHING;

-- Insert sample addresses
INSERT INTO addresses (id, customer_id, first_name, last_name, address1, city, state, postal_code, country, phone)
VALUES
  ('d3e4f5a6-b7c8-d9e0-f1a2-3b4c5d6e7f8a', 'a0b1c2d3-e4f5-6a7b-8c9d-0e1f2a3b4c5d', 'John', 'Doe', '123 Main St', 'Springfield', 'IL', '62704', 'USA', '+1-555-111-2222'),
  ('e4f5a6b7-c8d9-e0f1-a2b3-4c5d6e7f8a9b', 'b1c2d3e4-f5a6-7b8c-9d0e-1f2a3b4c5d6e', 'Jane', 'Smith', '456 Oak Ave', 'Riverdale', 'NY', '10471', 'USA', '+1-555-333-4444'),
  ('f5a6b7c8-d9e0-f1a2-b3c4-5d6e7f8a9b0c', 'c2d3e4f5-a6b7-c8d9-e0f1-2a3b4c5d6e7f', 'Bob', 'Johnson', '789 Pine Blvd', 'Portland', 'OR', '97205', 'USA', '+1-555-555-6666')
ON CONFLICT (id) DO NOTHING;

-- Insert sample orders
INSERT INTO orders (id, order_number, customer_id, subtotal, tax, shipping, total, status, shipping_address_id, billing_address_id, payment_status, fulfillment_status, supplier_id)
VALUES
  ('a6b7c8d9-e0f1-a2b3-c4d5-e6f7a8b9c0d1', 'ORD-001', 'a0b1c2d3-e4f5-6a7b-8c9d-0e1f2a3b4c5d', 99.99, 8.00, 5.00, 112.99, 'processing', 'd3e4f5a6-b7c8-d9e0-f1a2-3b4c5d6e7f8a', 'd3e4f5a6-b7c8-d9e0-f1a2-3b4c5d6e7f8a', 'paid', 'unfulfilled', 'd0cb3ca1-93f7-4f9d-b1c6-a7a8bccc1b1f'),
  ('b7c8d9e0-f1a2-b3c4-d5e6-f7a8b9c0d1e2', 'ORD-002', 'b1c2d3e4-f5a6-7b8c-9d0e-1f2a3b4c5d6e', 199.99, 16.00, 0.00, 215.99, 'confirmed', 'e4f5a6b7-c8d9-e0f1-a2b3-4c5d6e7f8a9b', 'e4f5a6b7-c8d9-e0f1-a2b3-4c5d6e7f8a9b', 'paid', 'unfulfilled', 'f6a7d8c9-e0b1-4f2e-9d3c-5a6b7c8d9e0f'),
  ('c8d9e0f1-a2b3-c4d5-e6f7-a8b9c0d1e2f3', 'ORD-003', 'c2d3e4f5-a6b7-c8d9-e0f1-2a3b4c5d6e7f', 49.99, 4.00, 5.00, 58.99, 'shipped', 'f5a6b7c8-d9e0-f1a2-b3c4-5d6e7f8a9b0c', 'f5a6b7c8-d9e0-f1a2-b3c4-5d6e7f8a9b0c', 'paid', 'fulfilled', 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d')
ON CONFLICT (id) DO NOTHING;

-- Insert sample order items
INSERT INTO order_items (id, order_id, product_id, quantity, price, cost)
VALUES
  ('d9e0f1a2-b3c4-d5e6-f7a8-b9c0d1e2f3a4', 'a6b7c8d9-e0f1-a2b3-c4d5-e6f7a8b9c0d1', '1a2b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d', 1, 99.99, 45.00),
  ('e0f1a2b3-c4d5-e6f7-a8b9-c0d1e2f3a4b5', 'b7c8d9e0-f1a2-b3c4-d5e6-f7a8b9c0d1e2', '2b3c4d5e-6f7a-8b9c-0d1e-2f3a4b5c6d7e', 1, 199.99, 89.50),
  ('f1a2b3c4-d5e6-f7a8-b9c0-d1e2f3a4b5c6', 'c8d9e0f1-a2b3-c4d5-e6f7-a8b9c0d1e2f3', '3c4d5e6f-7a8b-9c0d-1e2f-3a4b5c6d7e8f', 1, 49.99, 22.50)
ON CONFLICT (id) DO NOTHING;
