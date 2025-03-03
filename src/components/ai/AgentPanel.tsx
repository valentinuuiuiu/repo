import React, { useEffect, useState } from 'react';
import { getAgentInsights, AgentInsight } from '../../lib/ai/agentService';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AgentResponse, AgentType } from '../../types/agent';
import { AgentManager } from '../../lib/ai/AgentManager';

interface AgentPanelProps {
  departmentId: string;
}

const processAgentResponse = (data: AgentResponse) => {
  return {
    id: data.id,
    timestamp: data.timestamp,
    message: data.message,
    agentType: data.agentType,
    status: data.status
  };
};

const agentManager = AgentManager.getInstance();

const AgentPanel: React.FC<AgentPanelProps> = ({ departmentId }) => {
  const [insights, setInsights] = useState<AgentInsight[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    getAgentInsights(departmentId)
      .then(data => {
        setInsights(data);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, [departmentId]);

  const handleRestart = async () => {
    try {
      setIsLoading(true);
      await agentManager.restartAgents();
    } catch {
      // Error handling managed by AIService
    } finally {
      setIsLoading(false);
    }
  };

  if (loading) return <div>Loading agent insights...</div>;

  return (
    <Card className="p-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Agent Control Panel</h3>
        <Button 
          onClick={handleRestart}
          disabled={isLoading}
        >
          {isLoading ? 'Restarting...' : 'Restart Agents'}
        </Button>
      </div>
      <h2>Agent Insights</h2>
      <ul>
        {insights.map(insight => (
          <li key={insight.id}>
            <strong>{insight.name}</strong>: {insight.result}
          </li>
        ))}
      </ul>
    </Card>
  );
};

export default AgentPanel;
