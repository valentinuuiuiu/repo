import React from 'react';
import { DataTable } from '../ui/data-table';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';

const Orders = () => {
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Order Management</h1>
        <Button>Create Order</Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Recent Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable 
            columns={[
              { accessorKey: 'id', header: 'Order ID' },
              { accessorKey: 'customer', header: 'Customer' },
              { accessorKey: 'status', header: 'Status' },
              { accessorKey: 'total', header: 'Total' },
              { accessorKey: 'date', header: 'Date' }
            ]} 
            data={[]} 
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default Orders;