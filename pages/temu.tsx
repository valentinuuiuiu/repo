import React from 'react';
import DepartmentLayout from '../src/components/DepartmentLayout';

const TemuPage: React.FC = () => {
  const departments = [
    {
      id: 'temu',
      name: 'Temu',
      code: 'TMU',
      description: 'Temu Department',
      stats: {
        products: 180,
        suppliers: 90,
        agents: 7
      }
    }
  ];
  
  return (
    <DepartmentLayout departments={departments}>
      <div>
        <h1>Temu Integration Page</h1>
        <p>This page is for managing Temu integration features.</p>
        <div className="mt-6">
          <h2 className="text-xl font-semibold">Features</h2>
          <ul className="list-disc pl-6 mt-2">
            <li>Product synchronization with Temu</li>
            <li>Order management</li>
            <li>Inventory tracking</li>
            <li>Supplier communication</li>
            <li>Bulk product import</li>
            <li>Price monitoring</li>
            <li>Sales analytics</li>
          </ul>
        </div>
        <div className="mt-6">
          <h2 className="text-xl font-semibold">API Status</h2>
          <div className="bg-green-100 p-3 rounded mt-2">
            <span className="font-medium">Connected</span> - Last synced: Today at 10:30 AM
          </div>
        </div>
      </div>
    </DepartmentLayout>
  );
};

export default TemuPage;