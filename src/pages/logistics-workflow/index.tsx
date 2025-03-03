import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Grid, 
  Paper, 
  Stepper, 
  Step, 
  StepLabel, 
  Button, 
  List, 
  ListItem, 
  ListItemText, 
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField
} from '@mui/material';

interface LogisticsWorkflow {
  id: string;
  name: string;
  steps: string[];
  status: 'pending' | 'in_progress' | 'completed';
  currentStep: number;
}

const LogisticsWorkflowPage: React.FC = () => {
  const [workflows, setWorkflows] = useState<LogisticsWorkflow[]>([
    {
      id: '1',
      name: 'Electronics Shipment',
      steps: [
        'Order Received', 
        'Inventory Check', 
        'Packaging', 
        'Shipping', 
        'Delivery'
      ],
      status: 'in_progress',
      currentStep: 2
    },
    {
      id: '2',
      name: 'Clothing Order',
      steps: [
        'Order Received', 
        'Inventory Check', 
        'Packaging', 
        'Shipping', 
        'Delivery'
      ],
      status: 'pending',
      currentStep: 0
    }
  ]);

  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [newWorkflow, setNewWorkflow] = useState({
    name: '',
    steps: ['Order Received', 'Inventory Check', 'Packaging', 'Shipping', 'Delivery']
  });

  const handleCreateWorkflow = () => {
    const workflowToAdd: LogisticsWorkflow = {
      id: `${workflows.length + 1}`,
      name: newWorkflow.name,
      steps: newWorkflow.steps,
      status: 'pending',
      currentStep: 0
    };

    setWorkflows([...workflows, workflowToAdd]);
    setOpenCreateDialog(false);
    setNewWorkflow({ name: '', steps: ['Order Received', 'Inventory Check', 'Packaging', 'Shipping', 'Delivery'] });
  };

  const getStepColor = (workflowStep: number, currentStep: number) => {
    if (workflowStep < currentStep) return 'success';
    if (workflowStep === currentStep) return 'active';
    return 'disabled';
  };

  return (
    <Box sx={{ width: '100%', maxWidth: 1200, margin: 'auto', p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Logistics Workflow Management
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            mb: 2 
          }}>
            <Typography variant="h6">Active Workflows</Typography>
            <Button 
              variant="contained" 
              color="primary"
              onClick={() => setOpenCreateDialog(true)}
            >
              Create New Workflow
            </Button>
          </Box>

          {workflows.map((workflow) => (
            <Paper 
              key={workflow.id} 
              elevation={3} 
              sx={{ 
                mb: 2, 
                p: 2,
                borderLeft: `5px solid ${
                  workflow.status === 'completed' ? 'green' : 
                  workflow.status === 'in_progress' ? 'blue' : 
                  'gray'
                }`
              }}
            >
              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <Typography variant="h6">{workflow.name}</Typography>
                  <Typography 
                    variant="body2" 
                    color={
                      workflow.status === 'completed' ? 'green' : 
                      workflow.status === 'in_progress' ? 'blue' : 
                      'gray'
                    }
                  >
                    Status: {workflow.status.replace('_', ' ')}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={8}>
                  <Stepper activeStep={workflow.currentStep} alternativeLabel>
                    {workflow.steps.map((label, index) => (
                      <Step key={label}>
                        <StepLabel 
                          color={getStepColor(index, workflow.currentStep)}
                        >
                          {label}
                        </StepLabel>
                      </Step>
                    ))}
                  </Stepper>
                </Grid>
              </Grid>
            </Paper>
          ))}
        </Grid>
      </Grid>

      {/* Create Workflow Dialog */}
      <Dialog 
        open={openCreateDialog} 
        onClose={() => setOpenCreateDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Create New Logistics Workflow</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Workflow Name"
            variant="outlined"
            sx={{ mt: 2, mb: 2 }}
            value={newWorkflow.name}
            onChange={(e) => setNewWorkflow({ ...newWorkflow, name: e.target.value })}
          />
          
          <Typography variant="subtitle1" sx={{ mb: 1 }}>
            Default Workflow Steps:
          </Typography>
          <List>
            {newWorkflow.steps.map((step, index) => (
              <React.Fragment key={step}>
                <ListItem>
                  <ListItemText primary={`${index + 1}. ${step}`} />
                </ListItem>
                {index < newWorkflow.steps.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCreateDialog(false)} color="secondary">
            Cancel
          </Button>
          <Button 
            onClick={handleCreateWorkflow} 
            color="primary" 
            variant="contained"
            disabled={!newWorkflow.name}
          >
            Create Workflow
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default LogisticsWorkflowPage;