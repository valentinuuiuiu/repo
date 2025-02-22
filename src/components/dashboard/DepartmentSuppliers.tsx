import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { TabsContent } from "@/components/ui/tabs"
import { DataTable } from "@/components/ui/data-table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface SupplierData {
  id: string
  name: string
  email: string
  website: string
  rating: number
  fulfillmentSpeed: number
  qualityScore: number
  communicationScore: number
  integration: string
  status: string
  productCount: number
  orderCount: number
}

const columns = [
  {
    accessorKey: "name",
    header: "Supplier",
    cell: ({ row }) => {
      const supplier = row.original
      return (
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9">
            {supplier.name.charAt(0).toUpperCase()}
          </Avatar>
          <div>
            <div className="font-medium">{supplier.name}</div>
            <div className="text-sm text-muted-foreground">{supplier.email}</div>
          </div>
        </div>
      )
    }
  },
  {
    accessorKey: "rating",
    header: "Performance",
    cell: ({ row }) => {
      const supplier = row.original
      return (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span>Rating</span>
            <span className="font-medium">{supplier.rating}/5</span>
          </div>
          <Progress value={supplier.rating * 20} />
        </div>
      )
    }
  },
  {
    accessorKey: "fulfillmentSpeed",
    header: "Fulfillment",
    cell: ({ row }) => {
      const speed = row.getValue("fulfillmentSpeed")
      return (
        <div className="flex items-center gap-2">
          <div className={`h-2 w-2 rounded-full ${speed >= 4 ? 'bg-green-500' : speed >= 3 ? 'bg-yellow-500' : 'bg-red-500'}`} />
          <span>{speed} days avg.</span>
        </div>
      )
    }
  },
  {
    accessorKey: "integration",
    header: "Platform",
    cell: ({ row }) => {
      const platform = row.getValue("integration")
      return (
        <div className="flex items-center gap-2">
          <span className="font-medium">{platform}</span>
        </div>
      )
    }
  },
  {
    accessorKey: "productCount",
    header: "Products",
    cell: ({ row }) => row.getValue("productCount")
  }
]

export function DepartmentSuppliers({
  departmentId,
  suppliers
}: {
  departmentId: string
  suppliers: SupplierData[]
}) {
  const [data, setData] = useState(suppliers)
  const [sorting, setSorting] = useState([])
  const [globalFilter, setGlobalFilter] = useState("")

  return (
    <div className="p-4 space-y-4">
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="space-y-1">
            <h2 className="text-2xl font-semibold">Department Suppliers</h2>
            <p className="text-sm text-muted-foreground">
              Manage and monitor supplier performance
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Select defaultValue="all">
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by platform" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Platforms</SelectItem>
                <SelectItem value="SHOPIFY">Shopify</SelectItem>
                <SelectItem value="ALIBABA">Alibaba</SelectItem>
                <SelectItem value="ALIEXPRESS">AliExpress</SelectItem>
                <SelectItem value="AMAZON">Amazon</SelectItem>
              </SelectContent>
            </Select>
            <Button>Add Supplier</Button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-4 mb-6">
          <Card className="p-4">
            <h3 className="text-sm font-medium text-muted-foreground">
              Total Suppliers
            </h3>
            <p className="text-2xl font-bold">{suppliers.length}</p>
          </Card>
          <Card className="p-4">
            <h3 className="text-sm font-medium text-muted-foreground">
              Avg. Rating
            </h3>
            <p className="text-2xl font-bold">
              {(suppliers.reduce((acc, s) => acc + s.rating, 0) / suppliers.length).toFixed(1)}
            </p>
          </Card>
          <Card className="p-4">
            <h3 className="text-sm font-medium text-muted-foreground">
              Avg. Fulfillment
            </h3>
            <p className="text-2xl font-bold">
              {(suppliers.reduce((acc, s) => acc + s.fulfillmentSpeed, 0) / suppliers.length).toFixed(1)}d
            </p>
          </Card>
          <Card className="p-4">
            <h3 className="text-sm font-medium text-muted-foreground">
              Total Products
            </h3>
            <p className="text-2xl font-bold">
              {suppliers.reduce((acc, s) => acc + s.productCount, 0)}
            </p>
          </Card>
        </div>

        <DataTable
          columns={columns}
          data={data}
          sorting={sorting}
          setSorting={setSorting}
          globalFilter={globalFilter}
          setGlobalFilter={setGlobalFilter}
        />
      </Card>
    </div>
  )
}