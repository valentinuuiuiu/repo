import { Suspense } from "react"
import { DepartmentLayout } from "@/components/DepartmentLayout"
import { DepartmentProducts } from "@/components/dashboard/DepartmentProducts"
import { DepartmentSuppliers } from "@/components/dashboard/DepartmentSuppliers"
import { DepartmentAgents } from "@/components/ai/DepartmentAgents"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"

const defaultDepartments = [
  {
    id: "fashion",
    name: "Fashion & Apparel",
    code: "FASHION",
    description: "Clothing, accessories, and fashion items",
    stats: { products: 1250, suppliers: 45, agents: 8 }
  },
  {
    id: "electronics",
    name: "Electronics & Gadgets",
    code: "ELECTRONICS",
    description: "Consumer electronics and accessories",
    stats: { products: 890, suppliers: 32, agents: 6 }
  },
  {
    id: "home",
    name: "Home & Living",
    code: "HOME",
    description: "Home decor, furniture, and living essentials",
    stats: { products: 1100, suppliers: 38, agents: 7 }
  },
  {
    id: "beauty",
    name: "Beauty & Personal Care",
    code: "BEAUTY",
    description: "Cosmetics, skincare, and personal care items",
    stats: { products: 750, suppliers: 28, agents: 5 }
  }
]

function LoadingSkeleton() {
  return (
    <div className="p-4 space-y-4">
      <Skeleton className="h-[200px] w-full" />
      <div className="grid gap-4 md:grid-cols-4">
        {Array(4).fill(0).map((_, i) => (
          <Skeleton key={i} className="h-[100px]" />
        ))}
      </div>
    </div>
  )
}

export default function DepartmentsPage() {
  return (
    <DepartmentLayout departments={defaultDepartments}>
      <Tabs defaultValue="products" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3 lg:max-w-[400px]">
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="suppliers">Suppliers</TabsTrigger>
          <TabsTrigger value="agents">AI Agents</TabsTrigger>
        </TabsList>
        
        <Suspense fallback={<LoadingSkeleton />}>
          <TabsContent value="products">
            <DepartmentProducts
              departmentId="current"
              initialData={[]}
            />
          </TabsContent>
          
          <TabsContent value="suppliers">
            <DepartmentSuppliers
              departmentId="current"
              suppliers={[]}
            />
          </TabsContent>
          
          <TabsContent value="agents">
            <DepartmentAgents
              departmentId="current"
              agents={[]}
            />
          </TabsContent>
        </Suspense>
      </Tabs>
    </DepartmentLayout>
  )
}