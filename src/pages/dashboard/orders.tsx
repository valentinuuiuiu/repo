import React, { useState } from 'react';
import PageLayout from '@/components/layout/PageLayout';
import { useTranslation } from 'react-i18next';

const OrdersPage: React.FC = () => {
  const { t } = useTranslation();

  // Mock order data
  const [orders, setOrders] = useState([
    { id: 1, customer: 'John Doe', date: '2024-02-13', total: 100, status: 'Pending' },
    { id: 2, customer: 'Jane Smith', date: '2024-02-12', total: 200, status: 'Shipped' },
    { id: 3, customer: 'Alice Brown', date: '2024-02-11', total: 150, status: 'Delivered' },
  ]);

  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('asc');
  const [filterStatus, setFilterStatus] = useState('all');

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const handleFilter = (status: string) => {
    setFilterStatus(status);
  };

  const sortedOrders = [...orders].sort((a, b) => {
    const order = sortOrder === 'asc' ? 1 : -1;
    if (sortBy === 'date') {
      return (a.date > b.date ? 1 : -1) * order;
    } else if (sortBy === 'customer') {
      return (a.customer > b.customer ? 1 : -1) * order;
    } else {
      return (a.total - b.total) * order;
    }
  });

  const filteredOrders = filterStatus === 'all' ? sortedOrders : sortedOrders.filter(order => order.status === filterStatus);

  return (
    <PageLayout title={t('Orders')}>
      <div>
        <h1>{t('Orders')}</h1>

        <div>
          <button onClick={() => handleSort('date')}>{t('orders.sortByDate')}</button>
          <button onClick={() => handleSort('customer')}>{t('orders.sortByCustomer')}</button>
          <button onClick={() => handleSort('total')}>{t('orders.sortByTotal')}</button>
        </div>

        <div>
          <button onClick={() => handleFilter('all')}>{t('orders.all')}</button>
          <button onClick={() => handleFilter('Pending')}>{t('orders.pending')}</button>
          <button onClick={() => handleFilter('Shipped')}>{t('orders.shipped')}</button>
          <button onClick={() => handleFilter('Delivered')}>{t('orders.delivered')}</button>
        </div>

        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Customer</th>
              <th>Date</th>
              <th>Total</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.map((order) => (
              <tr key={order.id}>
                <td>{order.id}</td>
                <td>{order.customer}</td>
                <td>{order.date}</td>
                <td>{order.total}</td>
                <td>{order.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </PageLayout>
  );
};

export default OrdersPage;
