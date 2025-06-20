import React, { useState, useEffect } from 'react';
import { agents, AgentCategory, AgentRole } from '../config/agents';
import { AgentType, AgentStatus } from '../types/agent';
import { useAgentManager } from '../hooks/agents/useAgentManager';
import type { Agent } from '../hooks/agents/useAgentManager';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { aiService } from '@/lib/ai';

const DepartmentCard: React.FC<{ category: AgentCategory; agents: Agent[] }> = ({ category, agents }) => {
  const teamLeader = agents.find(a => 
    agents.find(ag => ag.type === `${category}-leader`) !== undefined
  );
  return (
    <Card className="mb-6">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="capitalize">{category.replace('_', ' ')}</CardTitle>
          {teamLeader && (
            <Badge variant="outline">
              Led by: {teamLeader.type}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid md:grid-cols-2 gap-4">
          {agents.map(agent => (
            <AgentCard key={agent.type} agent={agent} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

const AgentCard: React.FC<{ agent: Agent; isAvailableAgent?: boolean }> = ({ agent, isAvailableAgent = false }) => {
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;
    
    try {
      setIsLoading(true);
      setError(null);
      await agent.sendMessage(prompt);
      setPrompt('');
    } catch (error) {
      setError('Failed to get agent response. Please try again.');
      console.error('Error getting agent response:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Card className="bg-white">
      <CardContent className="pt-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="font-medium">{agent.type}</h3>
            <div className="flex gap-2 mt-1">
              <Badge variant={agent.status === AgentStatus.CONNECTED ? "default" : "secondary"} className="text-xs">
                {agent.status}
              </Badge>
            </div>
          </div>
        </div>
        
        {error && (
          <div className="text-red-500 text-sm mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Send instructions..."
              className="flex-1 p-2 border rounded"
              disabled={isLoading || agent.status !== AgentStatus.CONNECTED}
            />
            <button
              type="submit"
              disabled={isLoading || !prompt.trim() || agent.status !== AgentStatus.CONNECTED}
              className="px-4 py-2 bg-primary text-primary-foreground rounded disabled:bg-muted disabled:text-muted-foreground hover:bg-primary/90"
              onClick={(e) => {
                if (isAvailableAgent) e.stopPropagation();
              }}
            >
              {isLoading ? 'Sending...' : 'Send'}
            </button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export const AgentDashboard: React.FC = () => {
  const agentManager = useAgentManager(agents.map(agent => ({ type: agent.id as AgentType, autoConnect: true })));
  const [selectedTab, setSelectedTab] = useState<'departments' | 'available'>('departments');
  const [initializeError, setInitializeError] = useState<string | null>(null);

  useEffect(() => {
    const initializeAgents = async () => {
      try {
        setInitializeError(null);
        // Initialize AI service and connect to agents
        await aiService.initialize();
        
        // Attempt to connect each agent
        for (const agent of agents) {
          try {
            await agentManager.addAgent({
              type: agent.id as AgentType,
              autoConnect: true
            });
          } catch (error) {
            console.warn(`Failed to initialize agent ${agent.id}:`, error);
          }
        }
      } catch (error) {
        console.error('Failed to initialize agents:', error);
        setInitializeError('Failed to initialize agent system. Please refresh the page or contact support.');
      }
    };

    initializeAgents();

    return () => {
      // Cleanup: disconnect all agents
      agentManager.disconnectAll();
    };
  }, []);

  const handleAddAgent = async (agentId: string) => {
    try {
      await agentManager.addAgent({
        type: agentId as AgentType,
        autoConnect: true
      });
    } catch (error) {
      console.error('Error adding agent:', error);
    }
  };

  const agentsByDepartment = Object.values(AgentCategory).reduce((acc, category) => {
    acc[category] = Array.from(agentManager.agents.values())
      .filter(agent => agent.type.includes(category));
    return acc;
  }, {} as Record<AgentCategory, Agent[]>);

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">AI Department Dashboard</h1>
        <Badge variant="secondary" className="text-lg">
          {Array.from(agentManager.agents.values()).length} Active Agents
        </Badge>
      </div>

      {initializeError && (
        <div className="bg-destructive/10 text-destructive p-4 rounded-md mb-6">
          {initializeError}
        </div>
      )}

      <Tabs value={selectedTab} onValueChange={(value) => setSelectedTab(value as any)}>
        <TabsList className="mb-6">
          <TabsTrigger value="departments">Departments</TabsTrigger>
          <TabsTrigger value="available">Available Agents</TabsTrigger>
        </TabsList>

        <TabsContent value="departments">
          {Object.entries(agentsByDepartment).map(([category, agents]) => (
            agents.length > 0 && (
              <DepartmentCard 
                key={category} 
                category={category as AgentCategory}
                agents={agents}
              />
            )
          ))}
        </TabsContent>

        <TabsContent value="available">
          <Card>
            <CardHeader>
              <CardTitle>Available Agents</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {agents
                  .filter(agent => !agentManager.agents.has(agent.id as AgentType))
                  .map(agent => (
                    <Card key={agent.id} className="p-4 hover:bg-muted cursor-pointer"
                         onClick={() => handleAddAgent(agent.id)}>
                      <h3 className="font-medium">{agent.name}</h3>
                      <p className="text-sm text-muted-foreground mt-1">{agent.description}</p>
                      <div className="mt-2">
                        <Badge variant="outline">{agent.category}</Badge>
                        <Badge variant="outline" className="ml-2">{agent.role}</Badge>
                      </div>
                      <div className="mt-3 text-sm text-muted-foreground">
                        {agent.capabilities.slice(0, 2).map(cap => (
                          <div key={cap}>• {cap}</div>
                        ))}
                        {agent.capabilities.length > 2 ? (
                          <div>• {agent.capabilities.length - 2} more...</div>
                        ) : null}
                      </div>
                    </Card>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AgentDashboard;