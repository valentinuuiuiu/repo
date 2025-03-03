import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Grid, 
  Paper, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Button, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem,
  Chip,
  Stack,
  LinearProgress
} from '@mui/material';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Legend, 
  Tooltip 
} from 'recharts';

interface InventoryItem {
  name: string;
  currentStock: number;
  minimumStock: number;
  category: string;
  status: 'in_stock' | 'low_stock' | 'out_of_stock';
}

const InventoryReportPage: React.FC = () => {
  const [reportPeriod, setReportPeriod] = useState('monthly');
  const [inventoryData, setInventoryData] = useState<{
    totalProducts: number;
    inventoryItems: InventoryItem[];
    stockStatusSummary: { 
      inStock: number; 
      lowStock: number; 
      outOfStock: number; 
    };
  }>({
    totalProducts: 50,
    inventoryItems: [
      {
        name: 'Wireless Headphones',
        currentStock: 100,
        minimumStock: 20,
        category: 'Electronics',
        status: 'in_stock'
      },
      {
        name: 'Smart Watch',
        currentStock: 15,
        minimumStock: 50,
        category: 'Electronics',
        status: 'low_stock'
      },
      {
        name: 'Bluetooth Speaker',
        currentStock: 0,
        minimumStock: 30,
        category: 'Electronics',
        status: 'out_of_stock'
      },
      {
        name: 'Fitness Tracker',
        currentStock: 45,
        minimumStock: 20,
        category: 'Electronics',
        status: 'in_stock'
      },
      {
        name: 'Portable Charger',
        currentStock: 10,
        minimumStock: 50,
        category: 'Electronics',
        status: 'low_stock'
      }
    ],
    stockStatusSummary: {
      inStock: 2,
      lowStock: 2,
      outOfStock: 1
    }
  });

  const handlePeriodChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setReportPeriod(event.target.value as string);
    // In a real app, this would trigger a data fetch
  };

  const stockStatusColors = {
    'in_stock': '#4caf50',
    'low_stock': '#ff9800',
    'out_of_stock': '#f44336'
  };

  const pieChartData = [
    { name: 'In Stock', value: inventoryData.stockStatusSummary.inStock },
    { name: 'Low Stock', value: inventoryData.stockStatusSummary.lowStock },
    { name: 'Out of Stock', value: inventoryData.stockStatusSummary.outOfStock }
  ];

  return (
    <Box sx={{ width: '100%', maxWidth: 1200, margin: 'auto', p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Inventory Report
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper elevation={3} sx={{ p: 2, mb: 2 }}>
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center' 
            }}>
              <Typography variant="h6">
                Inventory Overview
              </Typography>
              <FormControl variant="outlined" size="small" sx={{ minWidth: 120 }}>
                <InputLabel>Period</InputLabel>
                <Select
                  value={reportPeriod}
                  onChange={handlePeriodChange}
                  label="Period"
                >
                  <MenuItem value="monthly">Monthly</MenuItem>
                  <MenuItem value="quarterly">Quarterly</MenuItem>
                  <MenuItem value="yearly">Yearly</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper elevation={3} sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Inventory Summary
            </Typography>
            <Stack spacing={2}>
              <Box>
                <Typography variant="body1" color="text.secondary">
                  Total Products
                </Typography>
                <Typography variant="h5" color="primary">
                  {inventoryData.totalProducts}
                </Typography>
              </Box>
              <Box>
                <Typography variant="body1" color="text.secondary">
                  Stock Status
                </Typography>
                <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                  <Chip 
                    label={`In Stock: ${inventoryData.stockStatusSummary.inStock}`} 
                    color="success" 
                    size="small" 
                  />
                  <Chip 
                    label={`Low Stock: ${inventoryData.stockStatusSummary.lowStock}`} 
                    color="warning" 
                    size="small" 
                  />
                  <Chip 
                    label={`Out of Stock: ${inventoryData.stockStatusSummary.outOfStock}`} 
                    color="error" 
                    size="small" 
                  />
                </Stack>
              </Box>
            </Stack>
          </Paper>
        </Grid>

        <Grid item xs={12} md={8}>
          <Paper elevation={3} sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Stock Status Distribution
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieChartData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={
                        entry.name === 'In Stock' ? stockStatusColors['in_stock'] :
                        entry.name === 'Low Stock' ? stockStatusColors['low_stock'] :
                        stockStatusColors['out_of_stock']
                      } 
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Paper elevation={3} sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Detailed Inventory Status
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Product Name</TableCell>
                    <TableCell>Category</TableCell>
                    <TableCell>Current Stock</TableCell>
                    <TableCell>Minimum Stock</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Stock Level</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {inventoryData.inventoryItems.map((item) => (
                    <TableRow key={item.name}>
                      <TableCell>{item.name}</TableCell>
                      <TableCell>{item.category}</TableCell>
                      <TableCell>{item.currentStock}</TableCell>
                      <TableCell>{item.minimumStock}</TableCell>
                      <TableCell>
                        <Chip 
                          label={item.status.replace('_', ' ')} 
                          color={
                            item.status === 'in_stock' ? 'success' :
                            item.status === 'low_stock' ? 'warning' : 'error'
                          } 
                          size="small" 
                        />
                      </TableCell>
                      <TableCell sx={{ width: 200 }}>
                        <LinearProgress
                          variant="determinate"
                          value={(item.currentStock / item.minimumStock) * 100}
                          color={
                            item.status === 'in_stock' ? 'success' :
                            item.status === 'low_stock' ? 'warning' : 'error'
                          }
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default InventoryReportPage;