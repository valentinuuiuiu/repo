import { HandymanAgent } from '@/lib/ai/agents/HandymanAgent';
import React, { useEffect, useState } from 'react';
import { aiService, getAgentInsights, AgentInsight, AgentType, AgentPerformance } from '@/lib/ai';
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// Dummy components to satisfy TypeScript
const DepartmentWorkflows = (props: { departmentId: string; onWorkflowComplete: (results: any) => void }) => {
  return <div>Department Workflows Placeholder</div>;
};

const AgentMetrics = (props: { agentId: string; departmentId: string }) => {
  return <div>Agent Metrics Placeholder</div>;
};

const AgentCommunicationView = (props: { departmentId: string }) => {
  return <div>Agent Communication View Placeholder</div>;
};

interface AgentStatus {
  status: 'active' | 'inactive' | 'degraded';
  lastError?: string;
}

interface DepartmentsStatus {
  [department: string]: AgentStatus;
}

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

export function DepartmentLayout({ 
  departments,
  children 
}: { 
  departments: Department[]
  children: React.ReactNode 
}) {
  const [activeDepartment, setActiveDepartment] = useState<string>(departments[0]?.id);
  const [insights, setInsights] = useState<AgentInsight[]>([]);

  useEffect(() => {
    async function fetchAgentStatuses() {
      try {
        const statuses = await aiService.getAgentStatuses();
        // Removed setDepartments call since departments are provided via props
        // You can process statuses if needed
        console.log('Agent statuses:', statuses);
      } catch (error) {
        console.error('Error fetching agent statuses:', error);
      }
    }

    fetchAgentStatuses();

    // Optionally refresh every minute
    const interval = setInterval(fetchAgentStatuses, 60000);
    return () => clearInterval(interval);
  }, []);


// Add this to the existing imports and other code

// Modify the useEffect for insights to use HandymanAgent
useEffect(() => {
  async function fetchDepartmentInsights() {
    try {
      const agent = new HandymanAgent({});
      const result = await agent.generateDepartmentInsights(activeDepartment);

      if (result.success) {
        // Transform HandymanAgent insights into AgentInsight format
        const transformedInsights: AgentInsight[] = [
          {
            agentId: 'handyman-agent',
            name: 'Handyman AI Agent',
            type: 'handyman' as AgentType,
            result: JSON.stringify(result.data),
            status: 'active',
            performance: {
              successRate: result.metadata.confidence * 100,
              averageConfidence: result.metadata.confidence,
              averageProcessingTime: result.metadata.processingTime,
              processingTime: result.metadata.processingTime,
              tasksByType: (result.metadata as any)?.taskTypes ?? {},
              errorRate: (result.metadata as any)?.errorRate ?? 0
            }
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
                {departments.map((dept) => (
                  <TabsTrigger
                    key={dept.id}
                    value={dept.id}
                    onClick={() => setActiveDepartment(dept.id)}
                    className="flex items-center gap-2"
                  >
                    {dept.name}
                    <Badge variant="secondary" className="ml-2">
                      {dept.stats.products}
                    </Badge>
                  </TabsTrigger>
                ))}
              </div>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          </TabsList>
        </div>
        
        {departments.map((dept) => (
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
                          <div className="text-2xl font-bold">{dept.stats.products}</div>
                        </Card>
                        <Card className="p-4">
                          <h4 className="text-sm font-medium text-muted-foreground">
                            Suppliers
                          </h4>
                          <div className="text-2xl font-bold">{dept.stats.suppliers}</div>
                        </Card>
                        <Card className="p-4">
                          <h4 className="text-sm font-medium text-muted-foreground">
                            AI Agents
                          </h4>
                          <div className="text-2xl font-bold">{dept.stats.agents}</div>
                        </Card>
                        <Card className="p-4">
                          <h4 className="text-sm font-medium text-muted-foreground">
                            Active Workflows
                          </h4>
                          <div className="text-2xl font-bold">
                            {dept.stats.activeWorkflows || 0}
                          </div>
                        </Card>
                      </div>
                    </div>
                  </Card>
                </div>
                {children}
              </TabsContent>

              <TabsContent value="workflows">
                <DepartmentWorkflows 
                  departmentId={dept.id}
                  onWorkflowComplete={(results) => {
                    // Handle workflow completion
                  }}
                />
              </TabsContent>

              <TabsContent value="agents">
                <div className="grid gap-4 p-4">
                  <AgentMetrics agentId={dept.id} departmentId={dept.id} />
                  <AgentCommunicationView departmentId={dept.id} />
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
                  <strong>{insight.name}</strong>: {insight.result}
                  <Badge variant={insight.status === 'active' ? 'default' : 'secondary'}>
                    {insight.status}
                  </Badge>
                  <div className="text-sm text-muted-foreground">
                    Success Rate: {insight.performance.successRate.toFixed(1)}%
                    {insight.performance.processingTime && (
                      <span> | Processing Time: {insight.performance.processingTime}ms</span>
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
