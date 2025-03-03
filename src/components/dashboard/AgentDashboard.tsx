import React, { useState, useEffect } from 'react';
import { useAgentManager } from '../../hooks/agents/useAgentManager';
import { AgentType, AgentStatus } from '../../types/agent';
import { Box, Grid, Paper, Typography, Button, TextField, CircularProgress, Chip, Divider } from '@mui/material';
import AgentCard from './AgentCard';
import AgentChat from './AgentChat';
import AgentMetrics from './AgentMetrics';
import { Link } from 'react-router-dom';
import { NetworkIcon, TestTubeIcon, LayoutDashboardIcon } from 'lucide-react';

const formatAgentType = (agentType: string): string => {
  return agentType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
};
const AgentDashboard: React.FC = () => {
  // Define available agents based on the AgentType enum
  const availableAgents = Object.values(AgentType);
  
  const agentManager = useAgentManager();
  const [selectedAgent, setSelectedAgent] = useState<AgentType | null>(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Initialize with a default agent for better UX
    if (availableAgents.length > 0) {
      handleAddAgent(availableAgents[0]);
    }
  }, []);

  const handleAddAgent = async (type: AgentType) => {
    try {
      setLoading(true);
      setError(null);
      await agentManager.addAgent({
        type,
        autoConnect: true,
      });
      // Auto-select the first agent added
      if (!selectedAgent) {
        setSelectedAgent(type);
      }
    } catch (err) {
      setError(`Failed to add agent: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveAgent = async (type: AgentType) => {
    try {
      setLoading(true);
      setError(null);
      await agentManager.removeAgent(type);
      if (selectedAgent === type) {
        setSelectedAgent(null);
      }
    } catch (err) {
      setError(`Failed to remove agent: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (selectedAgent && message.trim()) {
      try {
        setError(null);
        const agent = agentManager.getAgent(selectedAgent);
        if (agent) {
          await agent.sendMessage(message);
          setMessage('');
        } else {
          setError('Selected agent not found');
        }
      } catch (err) {
        setError(`Failed to send message: ${err instanceof Error ? err.message : String(err)}`);
      }
    }
  };

  const handleBroadcast = async () => {
    if (message.trim()) {
      try {
        setError(null);
        await agentManager.broadcastMessage(message);
        setMessage('');
      } catch (err) {
        setError(`Failed to broadcast message: ${err instanceof Error ? err.message : String(err)}`);
      }
    }
  };

  // For development/testing - create mock response when API is not available
  const handleMockResponse = async () => {
    if (selectedAgent && message.trim()) {
      try {
        const mockResponse = {
          id: `mock-${Date.now()}`,
          timestamp: Date.now(),
          message: `This is a mock response to: "${message}"`,
          agentType: selectedAgent,
          status: 'success' as const
        };
        
        // Get current agent
        const currentAgent = agentManager.getAgent(selectedAgent);
        if (currentAgent) {
          // Update the agent manager (this is a mock implementation)
          // In real implementation, this would be handled by the agent.sendMessage method
          const updatedHistory = [...currentAgent.history, mockResponse];
          
          // For demonstration purposes, we'll just show the mock response in the UI
          // without actually modifying the agent manager's state
          setMessage('');
          
          // Display success message
          setError(`Mock response added: "${mockResponse.message}"`);
        }
      } catch (err) {
        setError(`Mock response error: ${err instanceof Error ? err.message : String(err)}`);
      }
    }
  };

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      {/* Navigation Links */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">AI Agent Dashboard</Typography>
        <Box>
          <Button 
            component={Link} 
            to="/agents/test" 
            variant="outlined" 
            color="primary" 
            sx={{ mr: 2 }}
          >
            Go to Agent Testing Console
          </Button>
          <Button 
            component={Link} 
            to="/dashboard" 
            variant="outlined" 
            color="secondary"
          >
            Back to Dashboard
          </Button>
        </Box>
      </Box>
      
      {error && (
        <Paper sx={{ p: 2, mb: 3, bgcolor: error.startsWith('Mock response added') ? 'success.light' : 'error.light', 
                     color: error.startsWith('Mock response added') ? 'success.contrastText' : 'error.contrastText' }}>
          <Typography>{error}</Typography>
        </Paper>
      )}
      
      <Grid container spacing={3}>
        {/* Header */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h5">Agent Management</Typography>
            <Box>
              <Button 
                variant="contained" 
                color="error" 
                onClick={() => agentManager.disconnectAll()}
                disabled={loading}
              >
                Disconnect All
              </Button>
            </Box>
          </Paper>
        </Grid>
        
        {/* Available Agents */}
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Available Agents
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {availableAgents.map(type => (
                <Button
                  key={type}
                  variant="outlined"
                  onClick={() => handleAddAgent(type)}
                  disabled={loading || agentManager.agents.has(type)}
                >
                  Add {formatAgentType(type)}
                </Button>
              ))}
            </Box>
          </Paper>
        </Grid>
        
        {/* Active Agents */}
        <Grid item xs={12} md={9}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Active Agents
            </Typography>
            {loading && <CircularProgress size={24} sx={{ ml: 2 }} />}
            {agentManager.agents.size === 0 && !loading ? (
              <Typography color="text.secondary">No active agents. Add an agent to get started.</Typography>
            ) : (
              <Grid container spacing={2}>
                {Array.from(agentManager.agents.entries()).map(([type, agent]) => {
                  const agentType = type as AgentType;
                  return (
                    <Grid item xs={12} sm={6} md={4} key={type}>
                      <AgentCard
                        type={agentType}
                        status={agent.status}
                        selected={selectedAgent === agentType}
                        onSelect={() => setSelectedAgent(agentType)}
                        onRemove={() => handleRemoveAgent(agentType)}
                      />
                    </Grid>
                  );
                })}
              </Grid>
            )}
          </Paper>
        </Grid>
        
        {/* Chat and Metrics */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Grid container spacing={2}>
              {/* Chat Section */}
              <Grid item xs={12} md={8}>
                <AgentChat
                  agent={selectedAgent ? agentManager.getAgent(selectedAgent) : null}
                  message={message}
                  onMessageChange={setMessage}
                  onSendMessage={handleSendMessage}
                  onBroadcast={handleBroadcast}
                />
                
                {/* Development Controls */}
                {process.env.NODE_ENV !== 'production' && (
                  <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                    <Button 
                      variant="outlined" 
                      color="secondary"
                      onClick={handleMockResponse}
                      disabled={!selectedAgent || !message.trim()}
                    >
                      Generate Mock Response (Dev Only)
                    </Button>
                  </Box>
                )}
              </Grid>
              
              {/* Metrics Section */}
              <Grid item xs={12} md={4}>
                <AgentMetrics
                  totalAgents={agentManager.agents.size}
                  activeAgents={agentManager.getActiveAgents().length}
                  selectedAgent={selectedAgent ? agentManager.getAgent(selectedAgent) : null}
                />
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Link to="/agents/network">
          <Button variant="outlined" className="w-full h-24 flex flex-col items-center justify-center gap-2">
            <NetworkIcon className="h-6 w-6" />
            <span>Agent Network Visualization</span>
          </Button>
        </Link>
        
        <Link to="/agents/test">
          <Button variant="outlined" className="w-full h-24 flex flex-col items-center justify-center gap-2">
            <TestTubeIcon className="h-6 w-6" />
            <span>Test Agent System</span>
          </Button>
        </Link>
        
        <Link to="/dashboard">
          <Button variant="outlined" className="w-full h-24 flex flex-col items-center justify-center gap-2">
            <LayoutDashboardIcon className="h-6 w-6" />
            <span>Main Dashboard</span>
          </Button>
        </Link>
      </div>
    </Box>
  );
};

export default AgentDashboard;