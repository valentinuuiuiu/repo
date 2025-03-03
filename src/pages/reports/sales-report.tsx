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
  Stack
} from '@mui/material';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';

interface SalesData {
  period: string;
  totalRevenue: number;
  numberOfOrders: number;
  topProducts: { name: string; revenue: number }[];
}

const SalesReportPage: React.FC = () => {
  const [reportPeriod, setReportPeriod] = useState('monthly');
  const [salesData, setSalesData] = useState<SalesData>({
    period: 'November 2023',
    totalRevenue: 125750.50,
    numberOfOrders: 342,
    topProducts: [
      { name: 'Wireless Headphones', revenue: 45000 },
      { name: 'Smart Watch', revenue: 35000 },
      { name: 'Bluetooth Speaker', revenue: 25000 },
      { name: 'Fitness Tracker', revenue: 15000 },
      { name: 'Portable Charger', revenue: 5750.50 }
    ]
  });

  const chartData = salesData.topProducts.map(product => ({
    name: product.name,
    revenue: product.revenue
  }));

  const handlePeriodChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setReportPeriod(event.target.value as string);
    // In a real app, this would trigger a data fetch
  };

  return (
    <Box sx={{ width: '100%', maxWidth: 1200, margin: 'auto', p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Sales Report
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
                Sales Overview - {salesData.period}
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
              Key Metrics
            </Typography>
            <Stack spacing={2}>
              <Box>
                <Typography variant="body1" color="text.secondary">
                  Total Revenue
                </Typography>
                <Typography variant="h5" color="primary">
                  ${salesData.totalRevenue.toLocaleString()}
                </Typography>
              </Box>
              <Box>
                <Typography variant="body1" color="text.secondary">
                  Number of Orders
                </Typography>
                <Typography variant="h5" color="primary">
                  {salesData.numberOfOrders}
                </Typography>
              </Box>
            </Stack>
          </Paper>
        </Grid>

        <Grid item xs={12} md={8}>
          <Paper elevation={3} sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Top Products by Revenue
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="revenue" fill="#8884d8" name="Revenue ($)" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Paper elevation={3} sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Top Products Details
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Product Name</TableCell>
                    <TableCell>Revenue</TableCell>
                    <TableCell>Percentage of Total</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {salesData.topProducts.map((product) => (
                    <TableRow key={product.name}>
                      <TableCell>{product.name}</TableCell>
                      <TableCell>${product.revenue.toLocaleString()}</TableCell>
                      <TableCell>
                        <Chip 
                          label={`${((product.revenue / salesData.totalRevenue) * 100).toFixed(2)}%`} 
                          color="primary" 
                          size="small" 
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

export default SalesReportPage;