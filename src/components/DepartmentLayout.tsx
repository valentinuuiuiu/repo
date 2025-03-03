import { HandymanAgent } from '@/lib/ai/agents/HandymanAgent';
import React, { useEffect, useState } from 'react';
import { aiService } from '@/lib/ai/agentService';
import { AgentInsight } from '@/lib/ai/types';
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// Dummy components to satisfy TypeScript
const DepartmentWorkflows = () => {
  return <div>Department Workflows Placeholder</div>;
};

const AgentMetrics = () => {
  return <div>Agent Metrics Placeholder</div>;
};

const AgentCommunicationView = () => {
  return <div>Agent Communication View Placeholder</div>;
};

interface Department {
  id: string
  name: string
  code: string
  description?: string
  stats: {
    products: number
    suppliers: number
    agents: number
    activeWorkflows?: number
  }
}

export default function DepartmentLayout({ 
  departments,
  children,
  onDepartmentChange
}: { 
  departments: Department[]
  children: React.ReactNode
  onDepartmentChange?: (departmentId: string) => void
}): JSX.Element { // Ensure the return type is JSX.Element
  // Ensure departments is an array and has at least one item
  const safeDepartments = Array.isArray(departments) && departments.length > 0 
    ? departments 
    : [{ id: 'default', name: 'Default', code: 'DEF', stats: { products: 0, suppliers: 0, agents: 0 } }];
    
  const [activeDepartment, setActiveDepartment] = useState<string>(safeDepartments[0]?.id);
  const [insights, setInsights] = useState<AgentInsight[]>([]);

  // Correctly placed console.log inside the function body
  console.log('Departments:', safeDepartments);
  
  // Handle active department change and notify parent component
  const handleDepartmentChange = (departmentId: string) => {
    setActiveDepartment(departmentId);
    if (onDepartmentChange) {
      onDepartmentChange(departmentId);
    }
  };

  useEffect(() => {
    async function fetchAgentStatuses() {
      try {
        const statuses = await aiService.getAgentStatuses();
        console.log('Agent statuses:', statuses);
      } catch (error) {
        console.error('Error fetching agent statuses:', error);
      }
    }
    fetchAgentStatuses();
    const interval = setInterval(fetchAgentStatuses, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    async function fetchDepartmentInsights() {
      try {
        const agent = new HandymanAgent({});
        const result = await agent.generateDepartmentInsights(activeDepartment);
        if (result.success) {
          const transformedInsights: AgentInsight[] = [
            {
              id: 'handyman-insight',
              agentId: 'handyman-agent',
              type: 'handyman',
              content: JSON.stringify(result.data),
              confidence: result.metadata.confidence,
              timestamp: new Date(),
              metadata: result.metadata
            }
          ];
          setInsights(transformedInsights);
        }
      } catch (error) {
        console.error('Error fetching department insights:', error);
      }
    }
    fetchDepartmentInsights();
  }, [activeDepartment]);

  return (
    <div className="hidden flex-col md:flex">
      <div className="border-b">
        <div className="flex h-16 items-center px-4">
          <div className="ml-auto flex items-center space-x-4">
            <Tabs defaultValue="overview" className="w-[400px]">
              <TabsList>
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="workflows">Workflows</TabsTrigger>
                <TabsTrigger value="agents">AI Agents</TabsTrigger>
                <TabsTrigger value="analytics">Analytics</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>
      </div>
      <Tabs defaultValue={activeDepartment} className="space-y-6">
        <div className="space-between flex items-center px-4 py-2">
          <TabsList>
            <ScrollArea className="w-full whitespace-nowrap">
              <div className="flex w-max space-x-4">
                {safeDepartments.map((dept) => (
                  <TabsTrigger
                    key={dept.id}
                    value={dept.id}
                    onClick={() => handleDepartmentChange(dept.id)}
                    className="flex items-center gap-2"
                  >
                    {dept.name}
                    <Badge variant="secondary" className="ml-2">
                      {dept.stats?.products || 0}
                    </Badge>
                  </TabsTrigger>
                ))}
              </div>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          </TabsList>
        </div>
        
        {safeDepartments.map((dept) => (
          <TabsContent key={dept.id} value={dept.id} className="border-none p-0">
            <Tabs defaultValue="overview">
              <TabsContent value="overview">
                <div className="flex gap-4 p-4">
                  <Card className="flex-1">
                    <div className="p-6">
                      <h3 className="text-2xl font-bold tracking-tight">
                        {dept.name} Dashboard
                      </h3>
                      <p className="text-sm text-muted-foreground">{dept.description}</p>
                      
                      <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <Card className="p-4">
                          <h4 className="text-sm font-medium text-muted-foreground">
                            Products
                          </h4>
                          <div className="text-2xl font-bold">{dept.stats?.products || 0}</div>
                        </Card>
                        <Card className="p-4">
                          <h4 className="text-sm font-medium text-muted-foreground">
                            Suppliers
                          </h4>
                          <div className="text-2xl font-bold">{dept.stats?.suppliers || 0}</div>
                        </Card>
                        <Card className="p-4">
                          <h4 className="text-sm font-medium text-muted-foreground">
                            AI Agents
                          </h4>
                          <div className="text-2xl font-bold">{dept.stats?.agents || 0}</div>
                        </Card>
                        <Card className="p-4">
                          <h4 className="text-sm font-medium text-muted-foreground">
                            Active Workflows
                          </h4>
                          <div className="text-2xl font-bold">
                            {dept.stats?.activeWorkflows || 0}
                          </div>
                        </Card>
                      </div>
                    </div>
                  </Card>
                </div>
                {children}
              </TabsContent>
              <TabsContent value="workflows">
                <DepartmentWorkflows />
              </TabsContent>
              <TabsContent value="agents">
                <div className="grid gap-4 p-4">
                  <AgentMetrics />
                  <AgentCommunicationView />
                </div>
              </TabsContent>
              <TabsContent value="analytics">
                {/* Add department analytics component here */}
              </TabsContent>
            </Tabs>
            <hr />
            <h2>Agent Insights</h2>
            <ul>
              {insights.map(insight => (
                <li key={insight.agentId}>
                  <strong>{insight.agentId}</strong>: {insight.content}
                  <div className="text-sm text-muted-foreground">
                    Confidence: {insight.confidence.toFixed(1)}%
                    {insight.timestamp && (
                      <span> | Timestamp: {insight.timestamp.toISOString()}</span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
