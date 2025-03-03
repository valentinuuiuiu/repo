import React from 'react';
import DepartmentLayout from '../src/components/DepartmentLayout';

const EmagPage: React.FC = () => {
  const departments = [
    {
      id: 'emag',
      name: 'Emag',
      code: 'EMG',
      description: 'Emag Department',
      stats: {
        products: 120,
        suppliers: 60,
        agents: 6
      }
    }
  ];
  return (
    <DepartmentLayout departments={departments}>
      <div>
        <h1>Emag.ro Integration Page</h1>
        <p>This page is for managing Emag.ro integration features.</p>
        <div className="mt-6">
          <h2 className="text-xl font-semibold">Features</h2>
          <ul className="list-disc pl-6 mt-2">
            <li>Product synchronization with Emag.ro</li>
            <li>Romanian market integration</li>
            <li>Order management</li>
            <li>Inventory tracking</li>
            <li>Pricing strategies</li>
            <li>Customer reviews management</li>
            <li>Marketplace analytics</li>
          </ul>
        </div>
      </div>
    </DepartmentLayout>
  );
};

export default EmagPage;