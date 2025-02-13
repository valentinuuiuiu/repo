import ProductCatalog from "@/components/dashboard/ProductCatalog";

const mockProducts = [
  {
    id: "1",
    title: "Wireless Headphones",
    price: 99.99,
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e",
    supplierRating: 4.5,
    inStock: true,
    category: "Electronics",
  },
  {
    id: "2",
    title: "Smart Watch",
    price: 199.99,
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30",
    supplierRating: 4.8,
    inStock: true,
    category: "Electronics",
  },
  {
    id: "3",
    title: "Laptop Backpack",
    price: 49.99,
    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62",
    supplierRating: 4.2,
    inStock: false,
    category: "Accessories",
  },
];

export default function Products() {
  return (
    <div className="p-6">
      <ProductCatalog products={mockProducts} isLoading={false} />
    </div>
  );
}
