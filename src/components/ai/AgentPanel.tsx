import React, { useEffect, useState } from 'react';
import { getAgentInsights, AgentInsight } from '../../lib/ai/agentService';

interface AgentPanelProps {
  departmentId: string;
}

const AgentPanel: React.FC<AgentPanelProps> = ({ departmentId }) => {
  const [insights, setInsights] = useState<AgentInsight[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    getAgentInsights(departmentId)
      .then(data => {
        setInsights(data);
        setLoading(false);
      })
      .catch(err => {
        setError('Failed to load insights');
        setLoading(false);
      });
  }, [departmentId]);

  if (loading) return <div>Loading agent insights...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="agent-panel">
      <h2>Agent Insights</h2>
      <ul>
        {insights.map(insight => (
          <li key={insight.id}>
            <strong>{insight.name}</strong>: {insight.result}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AgentPanel;
