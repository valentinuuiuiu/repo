import React, { useState } from 'react';
import { 
  getAllDepartments, 
  getAgentsByDepartment 
} from './departmentConfig';
import { Department, Agent } from './types';
import { useDepartment } from './DepartmentContext';
import { 
  Box, 
  Select, 
  MenuItem, 
  Typography, 
  FormControl, 
  InputLabel, 
  Grid, 
  Paper 
} from '@mui/material';

interface DepartmentSelectorProps {
  onSelectDepartment?: (departmentId: string) => void;
  onSelectAgent?: (departmentId: string, agentId: string) => void;
}

const DepartmentSelector: React.FC<DepartmentSelectorProps> = ({ 
  onSelectDepartment, 
  onSelectAgent 
}) => {
  const { selectDepartment, selectAgent, currentDepartment, currentAgent } = useDepartment();
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<string>('');
  const [selectedAgentId, setSelectedAgentId] = useState<string>('');
  
  const departments = getAllDepartments();
  const agents = selectedDepartmentId 
    ? getAgentsByDepartment(selectedDepartmentId) 
    : [];
  
  const handleDepartmentChange = (departmentId: string) => {
    setSelectedDepartmentId(departmentId);
    setSelectedAgentId(''); // Reset agent when department changes
    
    // Call both local and prop-based handlers
    selectDepartment(departmentId);
    onSelectDepartment?.(departmentId);
  };
  
  const handleAgentChange = (agentId: string) => {
    if (!selectedDepartmentId) return;
    
    setSelectedAgentId(agentId);
    
    // Call both local and prop-based handlers
    selectAgent(selectedDepartmentId, agentId);
    onSelectAgent?.(selectedDepartmentId, agentId);
  };
  
  return (
    <Paper elevation={2} sx={{ p: 2, mb: 3 }}>
      <Typography variant="h6" gutterBottom>
        Department & Agent Selection
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <FormControl fullWidth>
            <InputLabel id="department-select-label">Department</InputLabel>
            <Select
              labelId="department-select-label"
              id="department-select"
              value={selectedDepartmentId}
              label="Department"
              onChange={(e) => handleDepartmentChange(e.target.value as string)}
            >
              {departments.map((dept: Department) => (
                <MenuItem key={dept.id} value={dept.id}>
                  {dept.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <FormControl fullWidth disabled={!selectedDepartmentId}>
            <InputLabel id="agent-select-label">Agent</InputLabel>
            <Select
              labelId="agent-select-label"
              id="agent-select"
              value={selectedAgentId}
              label="Agent"
              onChange={(e) => handleAgentChange(e.target.value as string)}
            >
              {agents.map((agent: Agent) => (
                <MenuItem key={agent.id} value={agent.id}>
                  {agent.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
      </Grid>
      
      {currentAgent && currentDepartment && (
        <Box mt={2} p={2} bgcolor="rgba(0,0,0,0.03)" borderRadius={1}>
          <Typography variant="subtitle2" color="primary">
            {currentDepartment.name} Department
          </Typography>
          <Typography variant="h6">
            {currentAgent.name}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {currentAgent.description}
          </Typography>
          <Typography variant="body2" color="text.secondary" mt={1}>
            Expertise: {currentAgent.expertise.join(', ')}
          </Typography>
        </Box>
      )}
    </Paper>
  );
};

export default DepartmentSelector;