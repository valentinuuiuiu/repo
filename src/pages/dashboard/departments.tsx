import { Suspense, useState, useEffect } from "react"
import DepartmentLayout from "@/components/DepartmentLayout"
import { DepartmentProducts } from "@/components/dashboard/DepartmentProducts"
import { DepartmentSuppliers } from "@/components/dashboard/DepartmentSuppliers"
import { DepartmentAgents } from "@/components/ai/DepartmentAgents"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"

// Updated departments to match database structure from prisma/seed.ts
const defaultDepartments = [
  {
    id: "department-1",
    name: "Engineering",
    code: "ENG",
    description: "Engineering and development department",
    stats: { products: 150, suppliers: 20, agents: 2 }
  },
  {
    id: "department-2",
    name: "Sales",
    code: "SALES",
    description: "Sales and marketing department",
    stats: { products: 120, suppliers: 15, agents: 2 }
  },
  {
    id: "department-3",
    name: "Support",
    code: "SUPPORT",
    description: "Customer support department",
    stats: { products: 80, suppliers: 10, agents: 2 }
  },
  {
    id: "department-4",
    name: "Operations",
    code: "OPS",
    description: "Operations department",
    stats: { products: 100, suppliers: 12, agents: 2 }
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
  const [activeDepartmentId, setActiveDepartmentId] = useState(defaultDepartments[0]?.id || "");

  // Listen for department changes from the DepartmentLayout component
  const handleDepartmentChange = (departmentId: string) => {
    setActiveDepartmentId(departmentId);
  };

  // Create a wrapped DepartmentLayout that passes our handler
  const WrappedDepartmentLayout = ({ children }: { children: React.ReactNode }) => (
    <DepartmentLayout 
      departments={defaultDepartments}
      onDepartmentChange={handleDepartmentChange}
    >
      {children}
    </DepartmentLayout>
  );
  
  return (
    <WrappedDepartmentLayout>
      <Tabs defaultValue="products" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3 lg:max-w-[400px]">
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="suppliers">Suppliers</TabsTrigger>
          <TabsTrigger value="agents">AI Agents</TabsTrigger>
        </TabsList>
        
        <Suspense fallback={<LoadingSkeleton />}>
          <TabsContent value="products">
            <DepartmentProducts
              departmentId={activeDepartmentId}
              initialData={[]}
            />
          </TabsContent>
          
          <TabsContent value="suppliers">
            <DepartmentSuppliers
              departmentId={activeDepartmentId}
              suppliers={[]}
            />
          </TabsContent>
          
          <TabsContent value="agents">
            <DepartmentAgents
              departmentId={activeDepartmentId}
              agents={[]}
            />
          </TabsContent>
        </Suspense>
      </Tabs>
    </WrappedDepartmentLayout>
  )
}