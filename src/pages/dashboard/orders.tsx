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

const mockOrders = [
  {
    id: "1",
    orderNumber: "ORD-001",
    customer: {
      firstName: "John",
      lastName: "Doe",
      email: "john@example.com",
    },
    status: "processing",
    total: 299.99,
    createdAt: new Date().toISOString(),
  },
  {
    id: "2",
    orderNumber: "ORD-002",
    customer: {
      firstName: "Jane",
      lastName: "Smith",
      email: "jane@example.com",
    },
    status: "completed",
    total: 199.99,
    createdAt: new Date().toISOString(),
  },
];

export default function Orders() {
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery(["orders", page], () =>
    Promise.resolve({ orders: mockOrders }),
  );

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell>{order.orderNumber}</TableCell>
                  <TableCell>
                    {order.customer.firstName} {order.customer.lastName}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        order.status === "completed" ? "default" : "secondary"
                      }
                    >
                      {order.status}
                    </Badge>
                  </TableCell>
                  <TableCell>${order.total.toFixed(2)}</TableCell>
                  <TableCell>
                    {new Date(order.createdAt).toLocaleDateString()}
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
