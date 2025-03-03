import React from 'react';
import DepartmentLayout from '../src/components/DepartmentLayout';

const WooCommercePage: React.FC = () => {
  const departments = [
    {
      id: 'woocommerce',
      name: 'WooCommerce',
      code: 'WCM',
      description: 'WooCommerce Department',
      stats: {
        products: 250,
        suppliers: 120,
        agents: 12
      }
    }
  ];
  return (
    <DepartmentLayout departments={departments}>
      <div>
        <h1>WooCommerce Integration Page</h1>
        <p>This page is for managing WooCommerce integration features.</p>
        <div className="mt-6">
          <h2 className="text-xl font-semibold">Features</h2>
          <ul className="list-disc pl-6 mt-2">
            <li>Product synchronization with WooCommerce</li>
            <li>Order management</li>
            <li>WordPress integration</li>
            <li>Payment gateway configuration</li>
            <li>Shipping options</li>
            <li>Tax settings</li>
          </ul>
        </div>
      </div>
    </DepartmentLayout>
  );
};

export default WooCommercePage;