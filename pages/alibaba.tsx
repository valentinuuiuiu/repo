import React from 'react';
import DepartmentLayout from '../src/components/DepartmentLayout';

const AlibabaPage: React.FC = () => {
  const departments = [
    {
      id: 'alibaba',
      name: 'Alibaba',
      code: 'ALB',
      description: 'Alibaba Department',
      stats: {
        products: 350,
        suppliers: 175,
        agents: 15
      }
    }
  ];
  
  return (
    <DepartmentLayout departments={departments}>
      <div>
        <h1>Alibaba Integration Page</h1>
        <p>This page is for managing Alibaba integration features.</p>
        <div className="mt-6">
          <h2 className="text-xl font-semibold">Features</h2>
          <ul className="list-disc pl-6 mt-2">
            <li>Product synchronization with Alibaba</li>
            <li>Supplier management</li>
            <li>Bulk ordering</li>
            <li>Price negotiation</li>
            <li>Shipping logistics</li>
            <li>Quality inspection</li>
            <li>Supplier verification</li>
          </ul>
        </div>
      </div>
    </DepartmentLayout>
  );
};

export default AlibabaPage;