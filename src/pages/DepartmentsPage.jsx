import React from 'react';
import { Container, Typography, Paper, Box, Grid, Divider } from '@mui/material';
import { DepartmentProvider, DepartmentSelector, useDepartment } from '../components/departments';

// Department content component that displays information about the selected department and agent
const DepartmentContent = () => {
  const { currentDepartment, currentAgent } = useDepartment();
  
  if (!currentDepartment) {
    return (
      <Paper elevation={1} sx={{ p: 4, mt: 3, textAlign: 'center' }}>
        <Typography variant="h6" color="text.secondary">
          Please select a department to get started
        </Typography>
      </Paper>
    );
  }
  
  return (
    <Paper elevation={1} sx={{ p: 4, mt: 3 }}>
      <Typography variant="h4" gutterBottom color="primary">
        {currentDepartment.name}
      </Typography>
      
      <Typography variant="body1" paragraph>
        {currentDepartment.description}
      </Typography>
      
      <Divider sx={{ my: 3 }} />
      
      {currentAgent ? (
        <Box>
          <Typography variant="h5" gutterBottom>
            {currentAgent.name}
          </Typography>
          
          <Typography variant="body1" paragraph>
            {currentAgent.description}
          </Typography>
          
          <Box mt={2}>
            <Typography variant="subtitle1" gutterBottom>
              Areas of Expertise:
            </Typography>
            
            <Grid container spacing={1}>
              {currentAgent.expertise.map((skill, index) => (
                <Grid item key={index}>
                  <Box 
                    sx={{ 
                      bgcolor: 'primary.light', 
                      color: 'primary.contrastText',
                      px: 2,
                      py: 0.5,
                      borderRadius: 2
                    }}
                  >
                    {skill}
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Box>
        </Box>
      ) : (
        <Typography variant="body1" color="text.secondary">
          Please select an agent from this department to continue.
        </Typography>
      )}
    </Paper>
  );
};

// Main departments page component
const DepartmentsPage = () => {
  const handleSelectDepartment = (departmentId) => {
    console.log(`Selected department: ${departmentId}`);
  };
  
  const handleSelectAgent = (departmentId, agentId) => {
    console.log(`Selected agent: ${agentId} from department: ${departmentId}`);
  };
  
  return (
    <DepartmentProvider>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography variant="h3" gutterBottom>
          Departments
        </Typography>
        
        <Typography variant="body1" paragraph color="text.secondary">
          Select a department and agent to get specialized assistance for your dropshipping business.
        </Typography>
        
        <DepartmentSelector 
          onSelectDepartment={handleSelectDepartment}
          onSelectAgent={handleSelectAgent}
        />
        
        <DepartmentContent />
        
        {/* Note: The DepartmentChatbot component is imported in the main App.jsx or layout component */}
      </Container>
    </DepartmentProvider>
  );
};

export default DepartmentsPage;