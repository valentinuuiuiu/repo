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
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';

interface AgentPerformance {
  name: string;
  department: string;
  completedTasks: number;
  averageResponseTime: number;
  customerSatisfactionScore: number;
}

const PerformanceAnalyticsPage: React.FC = () => {
  const [reportPeriod, setReportPeriod] = useState('monthly');
  const [performanceData, setPerformanceData] = useState<{
    agentPerformance: AgentPerformance[];
    performanceOverTime: { 
      period: string; 
      avgResponseTime: number; 
      completedTasks: number; 
      satisfactionScore: number 
    }[];
  }>({
    agentPerformance: [
      {
        name: 'Sarah Johnson',
        department: 'Customer Support',
        completedTasks: 125,
        averageResponseTime: 15.5,
        customerSatisfactionScore: 4.7
      },
      {
        name: 'Mike Chen',
        department: 'Sales',
        completedTasks: 95,
        averageResponseTime: 22.3,
        customerSatisfactionScore: 4.5
      },
      {
        name: 'Emily Rodriguez',
        department: 'Technical Support',
        completedTasks: 110,
        averageResponseTime: 18.2,
        customerSatisfactionScore: 4.6
      }
    ],
    performanceOverTime: [
      { 
        period: 'Week 1', 
        avgResponseTime: 20, 
        completedTasks: 80, 
        satisfactionScore: 4.5 
      },
      { 
        period: 'Week 2', 
        avgResponseTime: 18, 
        completedTasks: 95, 
        satisfactionScore: 4.6 
      },
      { 
        period: 'Week 3', 
        avgResponseTime: 16, 
        completedTasks: 110, 
        satisfactionScore: 4.7 
      },
      { 
        period: 'Week 4', 
        avgResponseTime: 15, 
        completedTasks: 125, 
        satisfactionScore: 4.8 
      }
    ]
  });

  const handlePeriodChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setReportPeriod(event.target.value as string);
    // In a real app, this would trigger a data fetch
  };

  return (
    <Box sx={{ width: '100%', maxWidth: 1200, margin: 'auto', p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Performance Analytics
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
                Performance Overview
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

        <Grid item xs={12} md={8}>
          <Paper elevation={3} sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Performance Trends
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={performanceData.performanceOverTime}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="period" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Legend />
                <Line 
                  yAxisId="left" 
                  type="monotone" 
                  dataKey="avgResponseTime" 
                  stroke="#8884d8" 
                  name="Avg Response Time (min)" 
                />
                <Line 
                  yAxisId="right" 
                  type="monotone" 
                  dataKey="completedTasks" 
                  stroke="#82ca9d" 
                  name="Completed Tasks" 
                />
                <Line 
                  yAxisId="right" 
                  type="monotone" 
                  dataKey="satisfactionScore" 
                  stroke="#ffc658" 
                  name="Satisfaction Score" 
                />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper elevation={3} sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Key Performance Metrics
            </Typography>
            <Stack spacing={2}>
              <Box>
                <Typography variant="body1" color="text.secondary">
                  Total Completed Tasks
                </Typography>
                <Typography variant="h5" color="primary">
                  {performanceData.agentPerformance.reduce((sum, agent) => sum + agent.completedTasks, 0)}
                </Typography>
              </Box>
              <Box>
                <Typography variant="body1" color="text.secondary">
                  Average Satisfaction Score
                </Typography>
                <Typography variant="h5" color="primary">
                  {(performanceData.agentPerformance.reduce((sum, agent) => sum + agent.customerSatisfactionScore, 0) / performanceData.agentPerformance.length).toFixed(2)}
                </Typography>
              </Box>
            </Stack>
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Paper elevation={3} sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Agent Performance Details
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Agent Name</TableCell>
                    <TableCell>Department</TableCell>
                    <TableCell>Completed Tasks</TableCell>
                    <TableCell>Avg Response Time (min)</TableCell>
                    <TableCell>Satisfaction Score</TableCell>
                    <TableCell>Performance</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {performanceData.agentPerformance.map((agent) => (
                    <TableRow key={agent.name}>
                      <TableCell>{agent.name}</TableCell>
                      <TableCell>{agent.department}</TableCell>
                      <TableCell>{agent.completedTasks}</TableCell>
                      <TableCell>{agent.averageResponseTime}</TableCell>
                      <TableCell>
                        <Chip 
                          label={agent.customerSatisfactionScore.toFixed(1)} 
                          color={
                            agent.customerSatisfactionScore >= 4.5 ? 'success' :
                            agent.customerSatisfactionScore >= 4.0 ? 'warning' : 'error'
                          } 
                          size="small" 
                        />
                      </TableCell>
                      <TableCell sx={{ width: 200 }}>
                        <LinearProgress
                          variant="determinate"
                          value={(agent.customerSatisfactionScore / 5) * 100}
                          color={
                            agent.customerSatisfactionScore >= 4.5 ? 'success' :
                            agent.customerSatisfactionScore >= 4.0 ? 'warning' : 'error'
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

export default PerformanceAnalyticsPage;