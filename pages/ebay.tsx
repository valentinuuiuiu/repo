import React from 'react';
import DepartmentLayout from '../src/components/DepartmentLayout';

const EbayPage: React.FC = () => {
  const departments = [
    {
      id: 'ebay',
      name: 'eBay',
      code: 'EBY',
      description: 'eBay Department',
      stats: {
        products: 150,
        suppliers: 75,
        agents: 8
      }
    }
  ];
  return (
    <DepartmentLayout departments={departments}>
      <div>
        <h1>eBay Integration Page</h1>
        <p>This page is for managing eBay integration features.</p>
        <div className="mt-6">
          <h2 className="text-xl font-semibold">Features</h2>
          <ul className="list-disc pl-6 mt-2">
            <li>Product listing automation</li>
            <li>Order management</li>
            <li>Inventory synchronization</li>
            <li>Pricing optimization</li>
            <li>Feedback management</li>
            <li>Sales analytics</li>
            <li>Shipping label generation</li>
          </ul>
        </div>
      </div>
    </DepartmentLayout>
  );
};

export default EbayPage;
