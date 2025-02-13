import React, { useState } from 'react';
import PageLayout from '@/components/layout/PageLayout';

const ProductsPage: React.FC = () => {
  // Mock product data
  const [products, setProducts] = useState([
    { id: 1, name: 'Product A', price: 20, category: 'Electronics' },
    { id: 2, name: 'Product B', price: 30, category: 'Clothing' },
    { id: 3, name: 'Product C', price: 15, category: 'Home & Garden' },
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

  const sortedProducts = [...products].sort((a, b) => {
    const order = sortOrder === 'asc' ? 1 : -1;
    if (sortBy === 'name') {
      return (a.name > b.name ? 1 : -1) * order;
    } else {
      return (a.price - b.price) * order;
    }
  });

  const filteredProducts = filterCategory === 'all' ? sortedProducts : sortedProducts.filter(product => product.category === filterCategory);

  return (
    <PageLayout title="Products">
      <div>
        <h1>Products</h1>

        <div>
          <button onClick={() => handleSort('name')}>Sort by Name</button>
          <button onClick={() => handleSort('price')}>Sort by Price</button>
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
              <th>Price</th>
              <th>Category</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.map((product) => (
              <tr key={product.id}>
                <td>{product.id}</td>
                <td>{product.name}</td>
                <td>{product.price}</td>
                <td>{product.category}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </PageLayout>
  );
};

export default ProductsPage;
