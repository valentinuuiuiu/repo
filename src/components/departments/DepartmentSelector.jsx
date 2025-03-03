import React, { useState } from 'react';
import { getAllDepartments, getAgentsByDepartment } from './departmentConfig';
import { Box, Select, MenuItem, Typography, FormControl, InputLabel, Grid, Paper } from '@mui/material';

const DepartmentSelector = ({ onSelectDepartment, onSelectAgent }) => {
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedAgent, setSelectedAgent] = useState('');
  
  const departments = getAllDepartments();
  const agents = selectedDepartment ? getAgentsByDepartment(selectedDepartment) : [];
  
  const handleDepartmentChange = (event) => {
    const departmentId = event.target.value;
    setSelectedDepartment(departmentId);
    setSelectedAgent(''); // Reset agent when department changes
    onSelectDepartment(departmentId);
  };
  
  const handleAgentChange = (event) => {
    const agentId = event.target.value;
    setSelectedAgent(agentId);
    onSelectAgent(selectedDepartment, agentId);
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
              value={selectedDepartment}
              label="Department"
              onChange={handleDepartmentChange}
            >
              {departments.map((dept) => (
                <MenuItem key={dept.id} value={dept.id}>
                  {dept.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <FormControl fullWidth disabled={!selectedDepartment}>
            <InputLabel id="agent-select-label">Agent</InputLabel>
            <Select
              labelId="agent-select-label"
              id="agent-select"
              value={selectedAgent}
              label="Agent"
              onChange={handleAgentChange}
            >
              {agents.map((agent) => (
                <MenuItem key={agent.id} value={agent.id}>
                  {agent.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
      </Grid>
      
      {selectedAgent && selectedDepartment && (
        <Box mt={2} p={2} bgcolor="rgba(0,0,0,0.03)" borderRadius={1}>
          <Typography variant="subtitle2" color="primary">
            {departments.find(d => d.id === selectedDepartment)?.name} Department
          </Typography>
          <Typography variant="h6">
            {agents.find(a => a.id === selectedAgent)?.name}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {agents.find(a => a.id === selectedAgent)?.description}
          </Typography>
        </Box>
      )}
    </Paper>
  );
};

export default DepartmentSelector;