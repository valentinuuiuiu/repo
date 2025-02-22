import { useState } from "react"
import { DataTable } from "@/components/ui/data-table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Dialog } from "@/components/ui/dialog"
import { DropdownMenu } from "@/components/ui/dropdown-menu"
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface ProductData {
  id: string
  title: string
  price: number
  compareAtPrice: number | null
  costPrice: number
  inventory: number
  supplier: {
    name: string
    rating: number
  }
  status: string
  department: {
    name: string
  }
}

const columns = [
  {
    accessorKey: "title",
    header: "Product",
    cell: ({ row }) => {
      const product = row.original
      return (
        <div className="flex items-center gap-2">
          <div className="w-12 h-12 rounded-md bg-gray-100">
            {/* Product image placeholder */}
          </div>
          <div>
            <div className="font-medium">{product.title}</div>
            <div className="text-sm text-muted-foreground">
              SKU: {product.id.slice(0, 8)}
            </div>
          </div>
        </div>
      )
    }
  },
  {
    accessorKey: "price",
    header: "Price",
    cell: ({ row }) => {
      const price = parseFloat(row.getValue("price"))
      const formatted = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(price)
      return <div>{formatted}</div>
    }
  },
  {
    accessorKey: "inventory",
    header: "Stock",
    cell: ({ row }) => {
      const inventory = row.getValue("inventory") as number
      return (
        <Badge variant={inventory > 10 ? "default" : "destructive"}>
          {inventory} in stock
        </Badge>
      )
    }
  },
  {
    accessorKey: "supplier.name",
    header: "Supplier",
    cell: ({ row }) => {
      const supplier = row.original.supplier
      return (
        <div className="flex items-center gap-2">
          <div>{supplier.name}</div>
          <Badge variant="secondary">{supplier.rating}★</Badge>
        </div>
      )
    }
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string
      return (
        <Badge variant={status === "active" ? "success" : "secondary"}>
          {status}
        </Badge>
      )
    }
  }
]

export function DepartmentProducts({
  departmentId,
  initialData,
}: {
  departmentId: string
  initialData: ProductData[]
}) {
  const [data, setData] = useState(initialData)
  const [sorting, setSorting] = useState([])
  const [columnFilters, setColumnFilters] = useState([])
  const [globalFilter, setGlobalFilter] = useState("")

  return (
    <div className="p-4 space-y-4">
      <Card className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="space-y-1">
            <h2 className="text-2xl font-semibold tracking-tight">
              Department Products
            </h2>
            <p className="text-sm text-muted-foreground">
              Manage and monitor your department's product catalog
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Input
              placeholder="Search products..."
              value={globalFilter ?? ""}
              onChange={(event) => setGlobalFilter(event.target.value)}
              className="max-w-sm"
            />
            <Button>Add Product</Button>
          </div>
        </div>

        <div className="flex gap-4 mb-4">
          <Select defaultValue="all">
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Products</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
            </SelectContent>
          </Select>

          <Select defaultValue="all">
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by supplier" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Suppliers</SelectItem>
              {/* Add supplier options dynamically */}
            </SelectContent>
          </Select>
        </div>

        <DataTable
          columns={columns}
          data={data}
          sorting={sorting}
          setSorting={setSorting}
          columnFilters={columnFilters}
          setColumnFilters={setColumnFilters}
          globalFilter={globalFilter}
          setGlobalFilter={setGlobalFilter}
        />
      </Card>
    </div>
  )
}