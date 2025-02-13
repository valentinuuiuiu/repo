import React, { useState } from 'react';
import PageLayout from '@/components/layout/PageLayout';

const SuppliersPage: React.FC = () => {
  // Mock supplier data
  const [suppliers, setSuppliers] = useState([
    { id: 1, name: 'Supplier A', contact: 'John Doe', rating: 4, category: 'Electronics' },
    { id: 2, name: 'Supplier B', contact: 'Jane Smith', rating: 3, category: 'Clothing' },
    { id: 3, name: 'Supplier C', contact: 'Peter Jones', rating: 5, category: 'Home & Garden' },
  ]);

  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [filterCategory, setFilterCategory] = useState('all');

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const handleFilter = (category: string) => {
    setFilterCategory(category);
  };

  const sortedSuppliers = [...suppliers].sort((a, b) => {
    const order = sortOrder === 'asc' ? 1 : -1;
    if (sortBy === 'name') {
      return (a.name > b.name ? 1 : -1) * order;
    } else {
      return (a.contact > b.contact ? 1 : -1) * order;
    }
  });

  const filteredSuppliers = filterCategory === 'all' ? sortedSuppliers : sortedSuppliers.filter(supplier => supplier.category === filterCategory);


  return (
    <PageLayout title="Suppliers">
      <div>
        <h1>Suppliers</h1>

        <div>
          <button onClick={() => handleSort('name')}>Sort by Name</button>
          <button onClick={() => handleSort('contact')}>Sort by Contact</button>
        </div>

        <div>
          <button onClick={() => handleFilter('all')}>All</button>
          <button onClick={() => handleFilter('Electronics')}>Electronics</button>
          <button onClick={() => handleFilter('Clothing')}>Clothing</button>
          <button onClick={() => handleFilter('Home & Garden')}>Home & Garden</button>
        </div>

        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Contact</th>
              <th>Rating</th>
              <th>Category</th>
            </tr>
          </thead>
          <tbody>
            {filteredSuppliers.map((supplier) => (
              <tr key={supplier.id}>
                <td>{supplier.id}</td>
                <td>{supplier.name}</td>
                <td>{supplier.contact}</td>
                <td>{supplier.rating}</td>
                <td>{supplier.category}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </PageLayout>
  );
};

export default SuppliersPage;
