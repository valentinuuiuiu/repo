import React, { useMemo } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  CircularProgress,
  LinearProgress,
  Card,
  CardContent,
  Divider,
  List,
  ListItem,
  ListItemText,
  useTheme,
} from '@mui/material';
import { Agent } from '../../hooks/agents/useAgentManager';
import { AgentStatus } from '../../types/agent';

interface AgentMetricsProps {
  totalAgents: number;
  activeAgents: number;
  selectedAgent: Agent | null | undefined;
}

const AgentMetrics: React.FC<AgentMetricsProps> = ({
  totalAgents,
  activeAgents,
  selectedAgent,
}) => {
  const theme = useTheme();
  
  const MetricCard = ({ 
    title, 
    value, 
    subtitle,
    progress,
  }: { 
    title: string; 
    value: string | number;
    subtitle?: string;
    progress?: number;
  }) => (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
          {title}
        </Typography>
        <Typography variant="h5" component="div" sx={{ mb: 1 }}>
          {value}
        </Typography>
        {progress !== undefined && (
          <LinearProgress 
            variant="determinate" 
            value={progress} 
            sx={{ mb: 1 }}
          />
        )}
        {subtitle && (
          <Typography variant="body2" color="text.secondary">
            {subtitle}
          </Typography>
        )}
      </CardContent>
    </Card>
  );

  const calculateAgentEfficiency = useMemo(() => {
    if (!selectedAgent) return 0;
    
    const successfulResponses = selectedAgent.history.filter(
      h => h.status === 'success'
    ).length;
    
    return selectedAgent.history.length > 0
      ? (successfulResponses / selectedAgent.history.length) * 100
      : 0;
  }, [selectedAgent]);

  const getStatusColor = (status: AgentStatus) => {
    switch (status) {
      case AgentStatus.CONNECTED:
        return theme.palette.success.main;
      case AgentStatus.CONNECTING:
      case AgentStatus.PROCESSING:
        return theme.palette.warning.main;
      case AgentStatus.ERROR:
        return theme.palette.error.main;
      default:
        return theme.palette.grey[500];
    }
  };

  const getResponseTimeMetrics = useMemo(() => {
    if (!selectedAgent?.history.length || selectedAgent.history.length < 2) return null;
    
    const responseTimes = selectedAgent.history.map((h, i, arr) => {
      if (i === 0) return 0;
      const prevTimestamp = new Date(arr[i - 1].timestamp).getTime();
      const currentTimestamp = new Date(h.timestamp).getTime();
      return currentTimestamp - prevTimestamp;
    });
    
    const filteredTimes = responseTimes.filter(t => t > 0);
    if (filteredTimes.length === 0) return null;
    
    const avgResponseTime = filteredTimes.reduce((a, b) => a + b, 0) / filteredTimes.length;
    const maxResponseTime = Math.max(...filteredTimes);
    const minResponseTime = Math.min(...filteredTimes);
    
    return {
      avg: (avgResponseTime / 1000).toFixed(2),
      max: (maxResponseTime / 1000).toFixed(2),
      min: (minResponseTime / 1000).toFixed(2),
    };
  }, [selectedAgent?.history]);

  return (
    <Box>
      <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
        Agent Analytics
      </Typography>
      
      <Grid container spacing={2}>
        {/* Overall Metrics */}
        <Grid item xs={12} sm={6}>
          <MetricCard
            title="Total Agents"
            value={totalAgents || 0}
            subtitle="Deployed in system"
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <MetricCard
            title="Active Agents"
            value={activeAgents || 0}
            progress={totalAgents > 0 ? (activeAgents / totalAgents) * 100 : 0}
            subtitle={`${totalAgents > 0 ? ((activeAgents / totalAgents) * 100).toFixed(1) : 0}% utilization`}
          />
        </Grid>
        
        {/* Selected Agent Metrics */}
        {selectedAgent && (
          <>
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Selected Agent Details
                </Typography>
              </Divider>
            </Grid>
            
            <Grid item xs={12} sm={6} md={4}>
              <MetricCard
                title="Messages Processed"
                value={selectedAgent.history.length || 0}
                subtitle="Total interactions"
              />
            </Grid>
            
            <Grid item xs={12} sm={6} md={4}>
              <MetricCard
                title="Agent Efficiency"
                value={`${calculateAgentEfficiency.toFixed(1)}%`}
                progress={calculateAgentEfficiency}
                subtitle="Success rate"
              />
            </Grid>
            
            <Grid item xs={12} sm={6} md={4}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Current Status
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <Box
                      sx={{
                        width: 12,
                        height: 12,
                        borderRadius: '50%',
                        bgcolor: getStatusColor(selectedAgent.status),
                      }}
                    />
                    <Typography variant="h6">
                      {selectedAgent.status}
                    </Typography>
                  </Box>
                  {selectedAgent.error && (
                    <Typography variant="body2" color="error">
                      Error: {selectedAgent.error.message}
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>
            
            {/* Response Time Metrics */}
            {getResponseTimeMetrics && (
              <Grid item xs={12}>
                <Card>
                  <CardContent>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Response Time Analysis
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={4}>
                        <Typography variant="body2" color="text.secondary">
                          Average
                        </Typography>
                        <Typography variant="h6">
                          {getResponseTimeMetrics.avg}s
                        </Typography>
                      </Grid>
                      <Grid item xs={4}>
                        <Typography variant="body2" color="text.secondary">
                          Fastest
                        </Typography>
                        <Typography variant="h6">
                          {getResponseTimeMetrics.min}s
                        </Typography>
                      </Grid>
                      <Grid item xs={4}>
                        <Typography variant="body2" color="text.secondary">
                          Slowest
                        </Typography>
                        <Typography variant="h6">
                          {getResponseTimeMetrics.max}s
                        </Typography>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
            )}
            
            {/* Recent Activity */}
            {selectedAgent.history.length > 0 && (
              <Grid item xs={12}>
                <Card>
                  <CardContent>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Recent Activity
                    </Typography>
                    <List dense>
                      {[...selectedAgent.history].reverse().slice(0, 5).map((item, index) => (
                        <ListItem key={index} divider={index !== 4}>
                          <ListItemText
                            primary={item.message}
                            secondary={new Date(item.timestamp).toLocaleString()}
                          />
                        </ListItem>
                      ))}
                    </List>
                  </CardContent>
                </Card>
              </Grid>
            )}
          </>
        )}
      </Grid>
    </Box>
  );
};

export default AgentMetrics;