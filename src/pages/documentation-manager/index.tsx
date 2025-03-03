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
  InputLabel,
  Chip
} from '@mui/material';

interface Document {
  id: string;
  title: string;
  type: 'invoice' | 'purchase_order' | 'shipping_manifest' | 'receipt' | 'contract' | 'return_form';
  createdDate: string;
  status: 'draft' | 'active' | 'archived';
  tags: string[];
}

const DocumentationManagerPage: React.FC = () => {
  const [documents, setDocuments] = useState<Document[]>([
    {
      id: '1',
      title: 'Electronics Order #1234',
      type: 'invoice',
      createdDate: '2023-11-15',
      status: 'active',
      tags: ['electronics', 'Q4 sales']
    },
    {
      id: '2',
      title: 'Supplier Contract - TechGear',
      type: 'contract',
      createdDate: '2023-10-20',
      status: 'active',
      tags: ['supplier', 'long-term']
    }
  ]);

  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [newDocument, setNewDocument] = useState<Partial<Document>>({});

  const handleAddDocument = () => {
    const documentToAdd: Document = {
      id: `${documents.length + 1}`,
      title: newDocument.title || '',
      type: newDocument.type || 'invoice',
      createdDate: new Date().toISOString().split('T')[0],
      status: 'draft',
      tags: newDocument.tags || []
    };

    setDocuments([...documents, documentToAdd]);
    setOpenAddDialog(false);
    setNewDocument({});
  };

  const getStatusColor = (status: Document['status']) => {
    switch (status) {
      case 'draft': return 'gray';
      case 'active': return 'green';
      case 'archived': return 'red';
    }
  };

  return (
    <Box sx={{ width: '100%', maxWidth: 1200, margin: 'auto', p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Documentation Manager
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            mb: 2 
          }}>
            <Typography variant="h6">Document Repository</Typography>
            <Button 
              variant="contained" 
              color="primary"
              onClick={() => setOpenAddDialog(true)}
            >
              Add New Document
            </Button>
          </Box>

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Title</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Created Date</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Tags</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {documents.map((doc) => (
                  <TableRow key={doc.id}>
                    <TableCell>{doc.title}</TableCell>
                    <TableCell>{doc.type.replace('_', ' ')}</TableCell>
                    <TableCell>{doc.createdDate}</TableCell>
                    <TableCell>
                      <Typography 
                        sx={{ 
                          color: getStatusColor(doc.status),
                          fontWeight: 'bold'
                        }}
                      >
                        {doc.status}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {doc.tags.map((tag) => (
                        <Chip 
                          key={tag} 
                          label={tag} 
                          size="small" 
                          sx={{ mr: 0.5, mb: 0.5 }} 
                        />
                      ))}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>
      </Grid>

      {/* Add Document Dialog */}
      <Dialog 
        open={openAddDialog} 
        onClose={() => setOpenAddDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Add New Document</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Document Title"
                value={newDocument.title || ''}
                onChange={(e) => setNewDocument({ ...newDocument, title: e.target.value })}
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth variant="outlined">
                <InputLabel>Document Type</InputLabel>
                <Select
                  value={newDocument.type || 'invoice'}
                  onChange={(e) => setNewDocument({ ...newDocument, type: e.target.value as Document['type'] })}
                  label="Document Type"
                >
                  <MenuItem value="invoice">Invoice</MenuItem>
                  <MenuItem value="purchase_order">Purchase Order</MenuItem>
                  <MenuItem value="shipping_manifest">Shipping Manifest</MenuItem>
                  <MenuItem value="receipt">Receipt</MenuItem>
                  <MenuItem value="contract">Contract</MenuItem>
                  <MenuItem value="return_form">Return Form</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Tags (comma separated)"
                value={(newDocument.tags || []).join(', ')}
                onChange={(e) => setNewDocument({ 
                  ...newDocument, 
                  tags: e.target.value.split(',').map(tag => tag.trim()).filter(Boolean) 
                })}
                variant="outlined"
                placeholder="e.g., electronics, Q4 sales"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAddDialog(false)} color="secondary">
            Cancel
          </Button>
          <Button 
            onClick={handleAddDocument} 
            color="primary" 
            variant="contained"
            disabled={!newDocument.title}
          >
            Add Document
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DocumentationManagerPage;