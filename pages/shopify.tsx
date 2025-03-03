import React from 'react';
import DepartmentLayout from '../src/components/DepartmentLayout';

const ShopifyPage: React.FC = () => {
  const departments = [
    {
      id: 'shopify',
      name: 'Shopify',
      code: 'SHP',
      description: 'Shopify Department',
      stats: {
        products: 300,
        suppliers: 150,
        agents: 15
      }
    }
  ];
  return (
    <DepartmentLayout departments={departments}>
      <div>
        <h1>Shopify Integration Page</h1>
        <p>This page is for managing Shopify integration features.</p>
        <div className="mt-6">
          <h2 className="text-xl font-semibold">Features</h2>
          <ul className="list-disc pl-6 mt-2">
            <li>Product synchronization with Shopify</li>
            <li>Order management</li>
            <li>Customer data integration</li>
            <li>Inventory management</li>
            <li>Sales analytics</li>
            <li>Theme customization</li>
          </ul>
        </div>
      </div>
    </DepartmentLayout>
  );
};

export default ShopifyPage;