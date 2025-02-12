import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Star } from "lucide-react";

const mockSuppliers = [
  {
    id: "1",
    name: "Tech Supplies Inc",
    email: "sales@techsupplies.com",
    rating: 4.5,
    status: "active",
    _count: {
      products: 150,
      orders: 1200,
    },
  },
  {
    id: "2",
    name: "Global Gadgets",
    email: "info@globalgadgets.com",
    rating: 4.2,
    status: "active",
    _count: {
      products: 80,
      orders: 800,
    },
  },
];

export default function Suppliers() {
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery(["suppliers", page], () =>
    Promise.resolve(mockSuppliers),
  );

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Suppliers</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Supplier</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead>Products</TableHead>
                <TableHead>Orders</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.map((supplier) => (
                <TableRow key={supplier.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{supplier.name}</div>
                      <div className="text-sm text-gray-500">
                        {supplier.email}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400 mr-1" />
                      {supplier.rating.toFixed(1)}
                    </div>
                  </TableCell>
                  <TableCell>{supplier._count.products}</TableCell>
                  <TableCell>{supplier._count.orders}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        supplier.status === "active" ? "default" : "secondary"
                      }
                    >
                      {supplier.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
