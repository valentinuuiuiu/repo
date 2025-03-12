import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api/supabase-api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Loader2, Plus, Filter, ArrowUpDown } from "lucide-react";
import ProductCatalog from "@/components/dashboard/ProductCatalog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";

export default function Products() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);
  const [supplierRating, setSupplierRating] = useState("all");
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const [isLoading, setIsLoading] = useState(false);

  // Form state for new product
  const [newProduct, setNewProduct] = useState({
    title: "",
    description: "",
    price: 0,
    costPrice: 0,
    category: "",
    inventory: 0,
    supplierId: "",
    status: "active",
    images: [""],
    tags: [],
  });

  // Fetch products
  const {
    data,
    isLoading: isProductsLoading,
    refetch,
  } = useQuery(
    [
      "products",
      searchQuery,
      selectedCategory,
      priceRange,
      supplierRating,
      activeTab,
    ],
    async () => {
      try {
        const params: any = {
          search: searchQuery || undefined,
          category: selectedCategory !== "all" ? selectedCategory : undefined,
          minPrice: priceRange[0] > 0 ? priceRange[0] : undefined,
          maxPrice: priceRange[1] < 1000 ? priceRange[1] : undefined,
          minRating:
            supplierRating !== "all" ? parseInt(supplierRating) : undefined,
          inStock:
            activeTab === "in-stock"
              ? true
              : activeTab === "out-of-stock"
                ? false
                : undefined,
        };

        // Use mock data for now
        return {
          products: [
            {
              id: "1",
              title: "Wireless Headphones",
              price: 99.99,
              image:
                "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80",
              supplierRating: 4.5,
              inStock: true,
              category: "Electronics",
            },
            {
              id: "2",
              title: "Smart Watch",
              price: 199.99,
              image:
                "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80",
              supplierRating: 4.8,
              inStock: true,
              category: "Electronics",
            },
            {
              id: "3",
              title: "Laptop Backpack",
              price: 49.99,
              image:
                "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&q=80",
              supplierRating: 4.2,
              inStock: false,
              category: "Accessories",
            },
            {
              id: "4",
              title: "Wireless Mouse",
              price: 29.99,
              image:
                "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=800&q=80",
              supplierRating: 4.6,
              inStock: true,
              category: "Electronics",
            },
            {
              id: "5",
              title: "Bluetooth Speaker",
              price: 79.99,
              image:
                "https://images.unsplash.com/photo-1589003077984-894e133dabab?w=800&q=80",
              supplierRating: 4.3,
              inStock: true,
              category: "Electronics",
            },
            {
              id: "6",
              title: "Phone Case",
              price: 19.99,
              image:
                "https://images.unsplash.com/photo-1541877944-ac82a091518a?w=800&q=80",
              supplierRating: 3.9,
              inStock: true,
              category: "Accessories",
            },
          ],
        };
        // In a real implementation, use the API
        // return await api.products.list(params);
      } catch (error) {
        console.error("Error fetching products:", error);
        return { products: [] };
      }
    },
  );

  // Fetch suppliers for dropdown
  const { data: suppliersData } = useQuery(["suppliers"], async () => {
    // Mock data for now
    return {
      suppliers: [
        { id: "1", name: "Tech Supplies Inc" },
        { id: "2", name: "Global Electronics" },
        { id: "3", name: "Accessory World" },
      ],
    };
    // In a real implementation, use the API
    // return await api.suppliers.list({});
  });

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // In a real implementation, use the API
      // await api.products.create({
      //   ...newProduct,
      //   tags: typeof newProduct.tags === 'string' ? newProduct.tags.split(',') : newProduct.tags,
      // });

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      toast({
        title: "Product added",
        description: `${newProduct.title} has been added to your catalog`,
      });

      setIsAddProductOpen(false);
      setNewProduct({
        title: "",
        description: "",
        price: 0,
        costPrice: 0,
        category: "",
        inventory: 0,
        supplierId: "",
        status: "active",
        images: [""],
        tags: [],
      });
      refetch();
    } catch (error: any) {
      toast({
        title: "Error adding product",
        description:
          error.message || "An error occurred while adding the product",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (value: string) => {
    setSearchQuery(value);
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
  };

  const handlePriceRangeChange = (range: [number, number]) => {
    setPriceRange(range);
  };

  const handleSupplierRatingChange = (rating: string) => {
    setSupplierRating(rating);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Products</h1>
        <Dialog open={isAddProductOpen} onOpenChange={setIsAddProductOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Add Product
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Add New Product</DialogTitle>
              <DialogDescription>
                Fill in the details to add a new product to your catalog.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddProduct} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Product Title</Label>
                  <Input
                    id="title"
                    value={newProduct.title}
                    onChange={(e) =>
                      setNewProduct({ ...newProduct, title: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Input
                    id="category"
                    value={newProduct.category}
                    onChange={(e) =>
                      setNewProduct({ ...newProduct, category: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="price">Price ($)</Label>
                  <Input
                    id="price"
                    type="number"
                    min="0"
                    step="0.01"
                    value={newProduct.price}
                    onChange={(e) =>
                      setNewProduct({
                        ...newProduct,
                        price: parseFloat(e.target.value),
                      })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="costPrice">Cost Price ($)</Label>
                  <Input
                    id="costPrice"
                    type="number"
                    min="0"
                    step="0.01"
                    value={newProduct.costPrice}
                    onChange={(e) =>
                      setNewProduct({
                        ...newProduct,
                        costPrice: parseFloat(e.target.value),
                      })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="inventory">Inventory</Label>
                  <Input
                    id="inventory"
                    type="number"
                    min="0"
                    value={newProduct.inventory}
                    onChange={(e) =>
                      setNewProduct({
                        ...newProduct,
                        inventory: parseInt(e.target.value),
                      })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="supplier">Supplier</Label>
                  <Select
                    value={newProduct.supplierId}
                    onValueChange={(value) =>
                      setNewProduct({ ...newProduct, supplierId: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select supplier" />
                    </SelectTrigger>
                    <SelectContent>
                      {suppliersData?.suppliers.map((supplier) => (
                        <SelectItem key={supplier.id} value={supplier.id}>
                          {supplier.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={newProduct.status}
                    onValueChange={(value) =>
                      setNewProduct({ ...newProduct, status: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="archived">Archived</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="image">Image URL</Label>
                  <Input
                    id="image"
                    value={newProduct.images[0]}
                    onChange={(e) =>
                      setNewProduct({ ...newProduct, images: [e.target.value] })
                    }
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newProduct.description}
                  onChange={(e) =>
                    setNewProduct({
                      ...newProduct,
                      description: e.target.value,
                    })
                  }
                  rows={3}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tags">Tags (comma separated)</Label>
                <Input
                  id="tags"
                  value={
                    Array.isArray(newProduct.tags)
                      ? newProduct.tags.join(",")
                      : newProduct.tags
                  }
                  onChange={(e) =>
                    setNewProduct({
                      ...newProduct,
                      tags: e.target.value.split(",").map((tag) => tag.trim()),
                    })
                  }
                  placeholder="wireless, bluetooth, electronics"
                />
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsAddProductOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Adding...
                    </>
                  ) : (
                    "Add Product"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Product Catalog</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs
            defaultValue="all"
            value={activeTab}
            onValueChange={setActiveTab}
            className="mb-6"
          >
            <TabsList>
              <TabsTrigger value="all">All Products</TabsTrigger>
              <TabsTrigger value="in-stock">In Stock</TabsTrigger>
              <TabsTrigger value="out-of-stock">Out of Stock</TabsTrigger>
            </TabsList>
          </Tabs>

          {isProductsLoading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <ProductCatalog
              onSearch={handleSearch}
              onCategoryChange={handleCategoryChange}
              onPriceRangeChange={handlePriceRangeChange}
              onSupplierRatingChange={handleSupplierRatingChange}
              products={data?.products || []}
              isLoading={isProductsLoading}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
