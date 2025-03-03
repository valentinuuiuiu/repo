import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { AgentCoordinator } from "@/lib/ai/agent-coordinator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DepartmentAnalytics } from "@/lib/analytics/department-analytics"
import ReactFlow, { 
  MarkerType,
  useNodesState,
  useEdgesState,
  Handle,
  Position
} from 'reactflow'
import 'reactflow/dist/style.css'
import { Terminal } from "lucide-react"

interface AgentDebugData {
  id: string;
  type: string;
  status: 'active' | 'idle' | 'error';
  lastAction: {
    timestamp: string;
    action: string;
    success: boolean;
    duration: number;
  };
  performance: {
    successRate: number;
    avgResponseTime: number;
    totalTasks: number;
  };
  errors: Array<{
    timestamp: string;
    message: string;
    context: Record<string, unknown>;
  }>;
}

interface AgentInteraction {
  from: string;
  to: string;
  message: {
    action: string;
    data: Record<string, unknown>;
    timestamp: number;
  };
}

interface FlowNodeData extends AgentDebugData {
  metrics?: Record<string, unknown>;
}

interface FlowEdgeData {
  timestamp: number;
  action: string;
}

interface AgentMetrics {
  taskSuccess: Array<number>;
  responseTime: Array<number>;
  costSavings: Array<number>;
  agents: Record<string, {
    successRate: number;
    avgResponseTime: number;
    costEfficiency: number;
  }>;
}

const AgentFlowNode: React.FC<{
  data: FlowNodeData;
}> = ({ data }) => (
  <>
    <Handle type="target" position={Position.Top} />
    <div className={`px-4 py-2 rounded-lg border ${
      data.status === 'active' ? 'bg-green-50 border-green-200' :
      data.status === 'error' ? 'bg-red-50 border-red-200' :
      'bg-gray-50 border-gray-200'
    }`}>
      <div className="font-medium">{data.type}</div>
      <div className="text-sm text-muted-foreground">
        {data.lastAction?.action || 'Idle'}
      </div>
      <Badge variant={
        data.status === 'active' ? 'default' :
        data.status === 'error' ? 'destructive' :
        'secondary'
      }>
        {data.status}
      </Badge>
      {data.performance && (
        <div className="mt-2 text-xs">
          Success: {data.performance.successRate}%
        </div>
      )}
    </div>
    <Handle type="source" position={Position.Bottom} />
  </>
);

export function DepartmentAIDebugger({ departmentId }: { departmentId: string }) {
  const [agents, setAgents] = useState<AgentDebugData[]>([]);
  const [interactions, setInteractions] = useState<AgentInteraction[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [coordinator] = useState(() => new AgentCoordinator(departmentId));

  useEffect(() => {
    let isSubscribed = true;

    const updateAgentData = async () => {
      try {
        const metrics = await DepartmentAnalytics.getDepartmentMetrics(departmentId, "24h");
        const mappedMetrics: AgentMetrics = {
          taskSuccess: metrics?.agents?.taskSuccess || [],
          responseTime: metrics?.agents?.responseTime || [],
          costSavings: metrics?.agents?.costSavings || [],
          agents: Object.fromEntries(
            Object.entries(metrics?.agents || {}).map(([id, data]: [string, any]) => [
              id,
              {
                successRate: Number(data?.taskSuccess?.[0] || 0),
                avgResponseTime: Number(data?.responseTime?.[0] || 0),
                costEfficiency: Number(data?.costSavings?.[0] || 0)
              }
            ])
          )
        };
        
        if (!isSubscribed) return;

        const newNodes = agents.map((agent, index) => ({
          id: agent.id,
          type: 'agentNode',
          position: {
            x: 200 + Math.cos(index * (2 * Math.PI / agents.length)) * 200,
            y: 200 + Math.sin(index * (2 * Math.PI / agents.length)) * 200
          },
          data: {
            ...agent,
            metrics: mappedMetrics.agents[agent.id] || {
              successRate: 0,
              avgResponseTime: 0,
              costEfficiency: 0
            }
          } as FlowNodeData
        }));
        setNodes(newNodes);

        const newEdges = interactions
          .filter(i => i.message.timestamp > Date.now() - 3600000)
          .map(interaction => ({
            id: `${interaction.from}-${interaction.to}`,
            source: interaction.from,
            target: interaction.to,
            animated: true,
            markerEnd: { type: MarkerType.Arrow },
            style: { stroke: interaction.message.action.includes('error') ? '#ef4444' : '#3b82f6' },
            data: {
              timestamp: interaction.message.timestamp,
              action: interaction.message.action
            } as FlowEdgeData
          }));
        setEdges(newEdges);
      } catch (error) {
        console.error('Error updating agent data:', error);
      }
    };

    const setupSubscription = async () => {
      const unsubscribe = await coordinator.subscribe('debugger', (message: { type: string; payload: any }) => {
        if (!isSubscribed) return;

        if (message.type === 'agent_status') {
          setAgents(prev => {
            const index = prev.findIndex(a => a.id === message.payload.agentId);
            if (index === -1) return prev;
            const newAgents = [...prev];
            newAgents[index] = {
              ...newAgents[index],
              ...message.payload.status
            };
            return newAgents;
          });
        } else if (message.type === 'agent_interaction') {
          setInteractions(prev => [message.payload, ...prev].slice(0, 100));
        }
      });

      const interval = setInterval(updateAgentData, 5000);
      return () => {
        isSubscribed = false;
        unsubscribe();
        clearInterval(interval);
      };
    };

    const cleanup = setupSubscription();
    return () => {
      cleanup.then(cleanupFn => cleanupFn());
    };
  }, [departmentId, agents, coordinator]);

  return (
    <div className="grid grid-cols-3 gap-6 p-6">
      <div className="col-span-2">
        <Card className="h-[600px]">
          <div className="p-4 border-b">
            <h3 className="text-lg font-medium">Agent Interaction Graph</h3>
          </div>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            nodeTypes={{ agentNode: AgentFlowNode }}
            fitView
          />
        </Card>
      </div>

      <div className="col-span-1 space-y-6">
        <Card>
          <div className="p-4 border-b">
            <h3 className="text-lg font-medium">Agent Status</h3>
          </div>
          <ScrollArea className="h-[300px]">
            <div className="p-4 space-y-4">
              {agents.map(agent => (
                <Card
                  key={agent.id}
                  className={`p-4 cursor-pointer ${
                    selectedAgent === agent.id ? 'border-primary' : ''
                  }`}
                  onClick={() => setSelectedAgent(agent.id)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">{agent.type}</div>
                      <div className="text-sm text-muted-foreground">
                        {new Date(agent.lastAction?.timestamp).toLocaleTimeString()}
                      </div>
                    </div>
                    <Badge variant={
                      agent.status === 'active' ? 'default' :
                      agent.status === 'error' ? 'destructive' :
                      'secondary'
                    }>
                      {agent.status}
                    </Badge>
                  </div>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </Card>

        <Card>
          <div className="p-4 border-b">
            <h3 className="text-lg font-medium">Recent Interactions</h3>
          </div>
          <ScrollArea className="h-[200px]">
            <div className="p-4 space-y-4">
              {interactions.map((interaction, index) => (
                <Card key={index} className="p-3">
                  <div className="flex items-center justify-between">
                    <div className="text-sm">
                      {interaction.from} → {interaction.to}
                    </div>
                    <Badge variant="outline">
                      {new Date(interaction.message.timestamp).toLocaleTimeString()}
                    </Badge>
                  </div>
                  <div className="mt-2 text-sm font-medium">
                    {interaction.message.action}
                  </div>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </Card>

        {selectedAgent && (
          <Card>
            <div className="p-4 border-b">
              <h3 className="text-lg font-medium">Agent Details</h3>
            </div>
            <div className="p-4">
              <Tabs defaultValue="performance">
                <TabsList>
                  <TabsTrigger value="performance">Performance</TabsTrigger>
                  <TabsTrigger value="errors">Errors</TabsTrigger>
                  <TabsTrigger value="logs">Logs</TabsTrigger>
                </TabsList>

                <TabsContent value="performance">
                  {agents.find(a => a.id === selectedAgent)?.performance && (
                    <div className="space-y-4">
                      <div>
                        <div className="text-sm font-medium">Success Rate</div>
                        <div className="text-2xl">
                          {agents.find(a => a.id === selectedAgent)?.performance.successRate}%
                        </div>
                      </div>
                      <div>
                        <div className="text-sm font-medium">Avg Response Time</div>
                        <div className="text-2xl">
                          {agents.find(a => a.id === selectedAgent)?.performance.avgResponseTime}ms
                        </div>
                      </div>
                      <div>
                        <div className="text-sm font-medium">Total Tasks</div>
                        <div className="text-2xl">
                          {agents.find(a => a.id === selectedAgent)?.performance.totalTasks}
                        </div>
                      </div>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="errors">
                  <ScrollArea className="h-[200px]">
                    <div className="space-y-4">
                      {agents.find(a => a.id === selectedAgent)?.errors.map((error, index) => (
                        <Card key={index} className="p-3">
                          <div className="flex items-center gap-2 text-red-500">
                            <Terminal className="h-4 w-4" />
                            <span className="font-medium">{error.message}</span>
                          </div>
                          <div className="mt-2 text-xs text-muted-foreground">
                            {new Date(error.timestamp).toLocaleString()}
                          </div>
                          {error.context && (
                            <pre className="mt-2 p-2 text-xs bg-muted rounded">
                              {JSON.stringify(error.context, null, 2)}
                            </pre>
                          )}
                        </Card>
                      ))}
                    </div>
                  </ScrollArea>
                </TabsContent>

                <TabsContent value="logs">
                  <ScrollArea className="h-[200px]">
                    <pre className="p-4 text-xs font-mono">
                      {/* Add agent logs here */}
                    </pre>
                  </ScrollArea>
                </TabsContent>
              </Tabs>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}