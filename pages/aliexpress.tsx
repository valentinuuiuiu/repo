import React from 'react';
import DepartmentLayout from '../src/components/DepartmentLayout';

const AliExpressPage: React.FC = () => {
  const departments = [
    {
      id: 'aliexpress',
      name: 'AliExpress',
      code: 'AXP',
      description: 'AliExpress Department',
      stats: {
        products: 200,
        suppliers: 100,
        agents: 10
      }
    }
  ];
  
  return (
    <DepartmentLayout departments={departments}>
      <div>
        <h1>AliExpress Integration Page</h1>
        <p>This page is for managing AliExpress integration features.</p>
        <div className="mt-6">
          <h2 className="text-xl font-semibold">Features</h2>
          <ul className="list-disc pl-6 mt-2">
            <li>Product synchronization with AliExpress</li>
            <li>Dropshipping automation</li>
            <li>Price monitoring</li>
            <li>Order fulfillment</li>
            <li>Shipping tracking</li>
          </ul>
        </div>
      </div>
    </DepartmentLayout>
  );
};

export default AliExpressPage;