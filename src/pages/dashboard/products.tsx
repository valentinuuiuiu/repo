import { useQuery } from "@tanstack/react-query";
import { productService } from "@/lib/api/products";
import ProductCatalog from "@/components/dashboard/ProductCatalog";

export default function Products() {
  const { data, isLoading } = useQuery(["products"], () =>
    productService.list({
      page: 1,
      limit: 20,
    }),
  );

  return (
    <div className="p-6">
      <ProductCatalog products={data?.products} isLoading={isLoading} />
    </div>
  );
}
