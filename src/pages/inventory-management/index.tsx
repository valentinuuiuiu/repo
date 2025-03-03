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
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel
} from '@mui/material';

interface InventoryItem {
  id: string;
  name: string;
  sku: string;
  category: string;
  quantity: number;
  unitPrice: number;
  supplier: string;
  status: 'in_stock' | 'low_stock' | 'out_of_stock';
}

const InventoryManagementPage: React.FC = () => {
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([
    {
      id: '1',
      name: 'Wireless Headphones',
      sku: 'WH-001',
      category: 'Electronics',
      quantity: 50,
      unitPrice: 99.99,
      supplier: 'TechGear Inc.',
      status: 'in_stock'
    },
    {
      id: '2',
      name: 'Smart Watch',
      sku: 'SW-002',
      category: 'Electronics',
      quantity: 10,
      unitPrice: 199.99,
      supplier: 'InnoTech Solutions',
      status: 'low_stock'
    }
  ]);

  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [newItem, setNewItem] = useState<Partial<InventoryItem>>({});

  const handleAddItem = () => {
    const itemToAdd: InventoryItem = {
      id: `${inventoryItems.length + 1}`,
      name: newItem.name || '',
      sku: newItem.sku || '',
      category: newItem.category || 'Uncategorized',
      quantity: newItem.quantity || 0,
      unitPrice: newItem.unitPrice || 0,
      supplier: newItem.supplier || 'Unknown',
      status: newItem.quantity && newItem.quantity > 20 ? 'in_stock' : 
              newItem.quantity && newItem.quantity > 0 ? 'low_stock' : 'out_of_stock'
    };

    setInventoryItems([...inventoryItems, itemToAdd]);
    setOpenAddDialog(false);
    setNewItem({});
  };

  const getStatusColor = (status: InventoryItem['status']) => {
    switch (status) {
      case 'in_stock': return 'green';
      case 'low_stock': return 'orange';
      case 'out_of_stock': return 'red';
    }
  };

  return (
    <Box sx={{ width: '100%', maxWidth: 1200, margin: 'auto', p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Inventory Management
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper elevation={3}>
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              p: 2 
            }}>
              <Typography variant="h6">Inventory Items</Typography>
              <Button 
                variant="contained" 
                color="primary"
                onClick={() => setOpenAddDialog(true)}
              >
                Add New Item
              </Button>
            </Box>

            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>SKU</TableCell>
                    <TableCell>Category</TableCell>
                    <TableCell>Quantity</TableCell>
                    <TableCell>Unit Price</TableCell>
                    <TableCell>Supplier</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {inventoryItems.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.name}</TableCell>
                      <TableCell>{item.sku}</TableCell>
                      <TableCell>{item.category}</TableCell>
                      <TableCell>{item.quantity}</TableCell>
                      <TableCell>${item.unitPrice.toFixed(2)}</TableCell>
                      <TableCell>{item.supplier}</TableCell>
                      <TableCell>
                        <Typography 
                          sx={{ 
                            color: getStatusColor(item.status),
                            fontWeight: 'bold'
                          }}
                        >
                          {item.status.replace('_', ' ')}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>

      {/* Add Item Dialog */}
      <Dialog 
        open={openAddDialog} 
        onClose={() => setOpenAddDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Add New Inventory Item</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Item Name"
                value={newItem.name || ''}
                onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="SKU"
                value={newItem.sku || ''}
                onChange={(e) => setNewItem({ ...newItem, sku: e.target.value })}
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth variant="outlined">
                <InputLabel>Category</InputLabel>
                <Select
                  value={newItem.category || ''}
                  onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                  label="Category"
                >
                  <MenuItem value="Electronics">Electronics</MenuItem>
                  <MenuItem value="Clothing">Clothing</MenuItem>
                  <MenuItem value="Accessories">Accessories</MenuItem>
                  <MenuItem value="Other">Other</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Quantity"
                type="number"
                value={newItem.quantity || ''}
                onChange={(e) => setNewItem({ ...newItem, quantity: Number(e.target.value) })}
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Unit Price"
                type="number"
                value={newItem.unitPrice || ''}
                onChange={(e) => setNewItem({ ...newItem, unitPrice: Number(e.target.value) })}
                variant="outlined"
                InputProps={{
                  startAdornment: '$'
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Supplier"
                value={newItem.supplier || ''}
                onChange={(e) => setNewItem({ ...newItem, supplier: e.target.value })}
                variant="outlined"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAddDialog(false)} color="secondary">
            Cancel
          </Button>
          <Button 
            onClick={handleAddItem} 
            color="primary" 
            variant="contained"
            disabled={!newItem.name || !newItem.sku}
          >
            Add Item
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default InventoryManagementPage;