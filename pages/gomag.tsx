import React from 'react';
import DepartmentLayout from '../src/components/DepartmentLayout';

const GomagPage: React.FC = () => {
  const departments = [
    {
      id: 'gomag',
      name: 'GoMag',
      code: 'GMG',
      description: 'GoMag Department',
      stats: {
        products: 80,
        suppliers: 40,
        agents: 4
      }
    }
  ];
  return (
    <DepartmentLayout departments={departments}>
      <div>
        <h1>GoMag Integration Page</h1>
        <p>This page is for managing GoMag integration features.</p>
        <div className="mt-6">
          <h2 className="text-xl font-semibold">Features</h2>
          <ul className="list-disc pl-6 mt-2">
            <li>Product synchronization</li>
            <li>Order management</li>
            <li>Inventory tracking</li>
            <li>Customer data integration</li>
            <li>Pricing management</li>
            <li>Promotion setup</li>
            <li>Sales analytics</li>
          </ul>
        </div>
      </div>
    </DepartmentLayout>
  );
};

export default GomagPage;
