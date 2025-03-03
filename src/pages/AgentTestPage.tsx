import React from 'react';
import AgentTest from '../components/AgentTest';
import { Box, Container, Button, Typography, Paper } from '@mui/material';
import { Link } from 'react-router-dom';

const AgentTestPage: React.FC = () => {
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
      {/* Navigation Links */}
      <Paper sx={{ p: 2, mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h5">AI Agent Testing Console</Typography>
        <Box>
          <Button 
            component={Link} 
            to="/agents" 
            variant="outlined" 
            color="primary" 
            sx={{ mr: 2 }}
          >
            Back to Agent Dashboard
          </Button>
          <Button 
            component={Link} 
            to="/dashboard" 
            variant="outlined" 
            color="secondary"
          >
            Main Dashboard
          </Button>
        </Box>
      </Paper>
      
      <Box sx={{ py: 2 }}>
        <AgentTest />
      </Box>
    </Container>
  );
};

export default AgentTestPage;