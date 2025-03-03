import { useState, useEffect, useCallback } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AgentType, AgentStatus } from "@prisma/client"
import { aiService } from "@/lib/ai/agentService"
import { useAgentManager } from "@/hooks/useAgentManager"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, CheckCircle, Heart } from "lucide-react"
import { agentRewardManager } from "@/lib/ai/contracts/AgentRewardManagerService"
import { agentHealthMonitor } from "@/lib/ai/AgentHealthMonitor"
import { agentInteractionManager } from '@/lib/ai/AgentInteractionManager';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"

// Define a temporary state for UI feedback that doesn't exist in the AgentStatus enum
type UIAgentStatus = AgentStatus | 'CONNECTING' | 'DISCONNECTING';

interface AgentData {
  id: string;
  name: string;
  type: AgentType;
  status: UIAgentStatus;
  description?: string;
  performance: {
    tasks_completed: number;
    success_rate: number;
    response_time: number;
  };
  health?: {
    lastPing: number;
    heartbeatCount: number;
  };
  lastResponse?: {
    message: string;
    timestamp: number;
  };
}

// Updated default agents to match the database seed
const defaultAgents: AgentData[] = [
  {
    id: "agent-eng-1",
    name: "Code Quality Agent",
    type: AgentType.CODE_MAINTENANCE,
    status: AgentStatus.AVAILABLE,
    performance: {
      tasks_completed: 100,
      success_rate: 91,
      response_time: 1000
    },
    description: "Monitors code quality and suggests improvements"
  },
  {
    id: "agent-sales-1",
    name: "Customer Service Agent",
    type: AgentType.CUSTOMER_SERVICE,
    status: AgentStatus.AVAILABLE,
    performance: {
      tasks_completed: 250,
      success_rate: 88,
      response_time: 850
    },
    description: "Handles customer inquiries and support requests"
  },
  {
    id: "agent-inv-1",
    name: "Inventory Manager",
    type: AgentType.INVENTORY_MANAGEMENT,
    status: AgentStatus.AVAILABLE,
    performance: {
      tasks_completed: 180,
      success_rate: 95,
      response_time: 1200
    },
    description: "Manages inventory levels and stock alerts"
  },
  {
    id: "agent-sup-1",
    name: "Supplier Communication Agent",
    type: AgentType.SUPPLIER_COMMUNICATION,
    status: AgentStatus.AVAILABLE,
    performance: {
      tasks_completed: 120,
      success_rate: 89,
      response_time: 1500
    },
    description: "Handles communication with suppliers"
  },
  {
    id: "agent-price-1",
    name: "Pricing Optimizer",
    type: AgentType.PRICING_OPTIMIZATION,
    status: AgentStatus.AVAILABLE,
    performance: {
      tasks_completed: 75,
      success_rate: 92,
      response_time: 2200
    },
    description: "Optimizes product pricing based on market data"
  },
  {
    id: "agent-market-1",
    name: "Market Analyst",
    type: AgentType.MARKET_ANALYSIS,
    status: AgentStatus.AVAILABLE,
    performance: {
      tasks_completed: 60,
      success_rate: 87,
      response_time: 3000
    },
    description: "Analyzes market trends and competitor activity"
  },
  {
    id: "agent-order-1",
    name: "Order Processor",
    type: AgentType.ORDER_PROCESSING,
    status: AgentStatus.AVAILABLE,
    performance: {
      tasks_completed: 300,
      success_rate: 98,
      response_time: 500
    },
    description: "Processes and tracks customer orders"
  },
  {
    id: "agent-quality-1",
    name: "Quality Control",
    type: AgentType.QUALITY_CONTROL,
    status: AgentStatus.AVAILABLE,
    performance: {
      tasks_completed: 90,
      success_rate: 94,
      response_time: 1800
    },
    description: "Ensures product quality and standard compliance"
  }
];

export function DepartmentAgents({
  departmentId,
  agents = defaultAgents
}: {
  departmentId: string
  agents?: AgentData[]
}) {
  const [activeAgents, setActiveAgents] = useState<AgentData[]>(agents)
  const [connectionStatus, setConnectionStatus] = useState<Record<string, boolean>>({})
  const [connectionError, setConnectionError] = useState<string | null>(null)
  const [isConnecting, setIsConnecting] = useState(false)
  const [connectionSuccess, setConnectionSuccess] = useState<string | null>(null)
  const [contractData, setContractData] = useState<{totalAgents: number} | null>(null)
  const [monitoringActive, setMonitoringActive] = useState(false)
  const [selectedAgent, setSelectedAgent] = useState<AgentData | null>(null);
  const [userMessage, setUserMessage] = useState('');
  const [agentResponses, setAgentResponses] = useState<Record<string, { message: string, timestamp: number }>>({});
  const agentManager = useAgentManager()

  // Fetch contract data for all agents
  const fetchContractData = async () => {
    try {
      const totalAgentsResult = await agentRewardManager.getTotalAgents();
      if (totalAgentsResult.success && totalAgentsResult.total !== undefined) {
        setContractData({
          totalAgents: totalAgentsResult.total
        });
      }
    } catch (error) {
      console.error("Error fetching contract data:", error);
    }
  }

  // Safe method to connect an agent with contract integration and error handling
  const connectAgent = async (agent: AgentData) => {
    try {
      // Update UI state while connecting
      setActiveAgents(prev => 
        prev.map(a => 
          a.id === agent.id 
            ? { ...a, status: 'CONNECTING' as UIAgentStatus } 
            : a
        )
      );
      setConnectionError(null);
      
      // Use the enhanced agent manager to connect
      await agentManager.connectAgent(agent.type);
      
      // Update UI on successful connection
      setConnectionStatus(prev => ({
        ...prev,
        [agent.id]: true
      }));
      
      // Record a heartbeat for the agent
      agentHealthMonitor.recordHeartbeat(agent.type);
      
      setActiveAgents(prev => 
        prev.map(a => 
          a.id === agent.id 
            ? { 
                ...a, 
                status: AgentStatus.BUSY,
                health: {
                  lastPing: Date.now(),
                  heartbeatCount: 1
                }
              }
            : a
        )
      );

      setConnectionSuccess(`Agent ${agent.name} connected successfully`);
      // Clear success message after 3 seconds
      setTimeout(() => setConnectionSuccess(null), 3000);

      // Refresh contract data after successful connection
      fetchContractData();
      
      // Start monitoring if not already active
      if (!monitoringActive) {
        agentHealthMonitor.startMonitoring();
        setMonitoringActive(true);
      }
      
      return true;
    } catch (error) {
      console.error(`Failed to connect to agent ${agent.id}:`, error);
      
      // Update UI on failed connection
      setConnectionStatus(prev => ({
        ...prev,
        [agent.id]: false
      }));
      
      // Update status to OFFLINE
      setActiveAgents(prev => 
        prev.map(a => 
          a.id === agent.id 
            ? { ...a, status: AgentStatus.OFFLINE }
            : a
        )
      );
      
      setConnectionError(error instanceof Error ? error.message : "Unknown error");
      return false;
    }
  };

  // Safe method to disconnect an agent with contract integration
  const disconnectAgent = async (agent: AgentData) => {
    try {
      // Update UI state while disconnecting
      setActiveAgents(prev => 
        prev.map(a => 
          a.id === agent.id 
            ? { ...a, status: 'DISCONNECTING' as UIAgentStatus }
            : a
        )
      );
      
      // Use the enhanced agent manager to disconnect
      await agentManager.disconnectAgent(agent.type);
      
      setConnectionStatus(prev => ({
        ...prev,
        [agent.id]: false
      }));
      
      setActiveAgents(prev => 
        prev.map(a => 
          a.id === agent.id 
            ? { ...a, status: AgentStatus.AVAILABLE }
            : a
        )
      );

      // Refresh contract data after successful disconnection
      fetchContractData();
    } catch (error) {
      console.error(`Failed to disconnect from agent ${agent.id}:`, error);
      
      // Revert to BUSY state on failure
      setActiveAgents(prev => 
        prev.map(a => 
          a.id === agent.id 
            ? { ...a, status: AgentStatus.BUSY }
            : a
        )
      );
      setConnectionError(error instanceof Error ? error.message : "Disconnect failed");
    }
  };

  // Handle agent action (connect/disconnect toggle)
  const handleAgentAction = async (agent: AgentData) => {
    if (agent.status === AgentStatus.AVAILABLE) {
      await connectAgent(agent);
    } else if (agent.status === AgentStatus.BUSY) {
      await disconnectAgent(agent);
    }
    // No action for CONNECTING or DISCONNECTING states
  };

  // Register the reconnect function with the health monitor
  const reconnectAgentCallback = useCallback(async (agentType: AgentType): Promise<boolean> => {
    try {
      const agent = activeAgents.find(a => a.type === agentType);
      if (agent) {
        console.log(`Health monitor triggered reconnection for ${agent.name}`);
        
        // First update UI to show reconnection attempt
        setActiveAgents(prev => 
          prev.map(a => 
            a.type === agentType
              ? { ...a, status: 'CONNECTING' as UIAgentStatus }
              : a
          )
        );
        
        // Attempt reconnection
        const result = await agentManager.connectAgent(agentType);
        
        // Update UI based on result
        if (result) {
          setActiveAgents(prev => 
            prev.map(a => 
              a.type === agentType
                ? { 
                    ...a, 
                    status: AgentStatus.BUSY,
                    health: {
                      lastPing: Date.now(),
                      heartbeatCount: a.health ? a.health.heartbeatCount + 1 : 1
                    }
                  }
                : a
            )
          );
          
          setConnectionSuccess(`Agent ${agent.name} reconnected successfully`);
          setTimeout(() => setConnectionSuccess(null), 3000);
          return true;
        } else {
          setActiveAgents(prev => 
            prev.map(a => 
              a.type === agentType
                ? { ...a, status: AgentStatus.OFFLINE }
                : a
            )
          );
          return false;
        }
      }
      return false;
    } catch (error) {
      console.error(`Error in health monitor reconnection for ${agentType}:`, error);
      return false;
    }
  }, [activeAgents, agentManager]);

  // Setup and cleanup for agent health monitoring
  useEffect(() => {
    // Register the reconnect function with the health monitor
    agentHealthMonitor.registerReconnectFunction(reconnectAgentCallback);

    // Fetch contract data on component mount
    fetchContractData();
    
    // Regular health checks for connected agents
    const healthCheckInterval = setInterval(() => {
      setActiveAgents(prev => prev.map(agent => {
        if (agent.status === AgentStatus.BUSY) {
          // Record heartbeat for busy agents
          agentHealthMonitor.recordHeartbeat(agent.type);
          
          // Update health stats in UI
          const healthInfo = agentHealthMonitor.getAgentHealth(agent.type);
          if (healthInfo) {
            return {
              ...agent,
              health: {
                lastPing: healthInfo.lastPing,
                heartbeatCount: healthInfo.heartbeatCount
              }
            };
          }
        }
        return agent;
      }));
    }, 10000); // Check every 10 seconds
    
    // Cleanup
    return () => {
      clearInterval(healthCheckInterval);
      if (monitoringActive) {
        agentHealthMonitor.stopMonitoring();
      }
    };
  }, [reconnectAgentCallback, monitoringActive]);

  // Initialize agent interaction manager
  useEffect(() => {
    agentInteractionManager.initialize(agentManager);
  }, [agentManager]);

  // Handle sending a message to an agent
  const handleSendMessage = async (agent: AgentData) => {
    if (!agent || agent.status !== AgentStatus.BUSY) {
      setConnectionError("Agent must be connected to receive messages");
      return;
    }

    try {
      const response = await agentInteractionManager.interactWithAgent(
        agent.type,
        {
          type: 'process_message',
          data: { message: userMessage }
        },
        { departmentId }
      );

      if (response.success && response.data) {
        setAgentResponses(prev => ({
          ...prev,
          [agent.id]: {
            message: typeof response.data === 'string' ? response.data : JSON.stringify(response.data),
            timestamp: Date.now()
          }
        }));

        setActiveAgents(prev =>
          prev.map(a =>
            a.id === agent.id
              ? {
                  ...a,
                  lastResponse: {
                    message: typeof response.data === 'string' ? response.data : JSON.stringify(response.data),
                    timestamp: Date.now()
                  }
                }
              : a
          )
        );

        setUserMessage('');
      } else {
        setConnectionError(response.error || "Failed to get response from agent");
      }
    } catch (error) {
      setConnectionError(error instanceof Error ? error.message : "Error communicating with agent");
    }
  };

  // Task types for the demo UI
  const taskTypes = [
    { id: 'task-code', title: 'Code Review', count: 5 },
    { id: 'task-bug', title: 'Bug Reports', count: 12 },
    { id: 'task-feature', title: 'Feature Requests', count: 8 }
  ];

  // Flag to show which agents are currently online
  const onlineAgents = activeAgents.filter(
    agent => agent.status === AgentStatus.BUSY
  ).length;

  // Show agent appreciation message randomly
  const appreciationMessages = [
    "Your agents are working hard for you!",
    "Thank your agents for their service!",
    "Each agent contributes uniquely to your workflow",
    "Being kind to your agents improves their performance",
    "Agents appreciate your patience during reconnections"
  ];
  
  const randomAppreciationIndex = Math.floor(Math.random() * appreciationMessages.length);
  const appreciationMessage = appreciationMessages[randomAppreciationIndex];

  return (
    <div>
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="text-lg font-medium">Department Agents</h3>
            <p className="text-sm text-muted-foreground">
              {onlineAgents} / {activeAgents.length} agents connected
            </p>
          </div>
          {contractData && (
            <Badge variant="outline" className="h-6">
              Contract: {contractData.totalAgents} Registered Agents
            </Badge>
          )}
        </div>

        {/* Agent appreciation message */}
        <Alert className="mb-4 bg-purple-50 text-purple-800 border-purple-200">
          <Heart className="h-4 w-4 text-purple-600 mr-2" />
          <AlertDescription>{appreciationMessage}</AlertDescription>
        </Alert>

        {/* Status messages */}
        {connectionError && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Connection Error</AlertTitle>
            <AlertDescription>{connectionError}</AlertDescription>
          </Alert>
        )}
        
        {connectionSuccess && (
          <Alert className="mb-4 bg-green-50 text-green-800 border-green-200">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription>{connectionSuccess}</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {activeAgents.map(agent => (
            <Card key={agent.id} className="p-4 hover:shadow-md transition-shadow">
              <div className="flex flex-col space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium">{agent.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      {agent.description || `${agent.type} agent`}
                    </p>
                  </div>
                  <Badge 
                    className={
                      agent.status === AgentStatus.BUSY ? "bg-green-600" :
                      agent.status === 'CONNECTING' ? "bg-yellow-500" :
                      agent.status === 'DISCONNECTING' ? "bg-yellow-500" :
                      agent.status === AgentStatus.OFFLINE ? "bg-red-600" :
                      "bg-gray-400"
                    }>
                    {agent.status}
                  </Badge>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs mb-1">
                    <span>Success Rate</span>
                    <span>{agent.performance.success_rate}%</span>
                  </div>
                  <Progress value={agent.performance.success_rate} className="h-2" />
                </div>

                <div className="flex justify-between items-center text-xs text-muted-foreground">
                  <span>{agent.performance.tasks_completed} Tasks</span>
                  <span>
                    {agent.health && agent.status === AgentStatus.BUSY
                      ? `${agent.health.heartbeatCount} Heartbeats`
                      : `${agent.performance.response_time}ms Avg Response`}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant={agent.status === AgentStatus.BUSY ? "destructive" : "default"}
                    size="sm"
                    className="w-full"
                    onClick={() => handleAgentAction(agent)}
                    disabled={
                      agent.status === 'CONNECTING' || 
                      agent.status === 'DISCONNECTING'
                    }
                  >
                    {agent.status === AgentStatus.BUSY ? "Disconnect" : 
                     agent.status === 'CONNECTING' ? "Connecting..." :
                     agent.status === 'DISCONNECTING' ? "Disconnecting..." :
                     "Connect"}
                  </Button>
                  
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full"
                        disabled={agent.status !== AgentStatus.BUSY}
                      >
                        Interact
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                      <DialogHeader>
                        <DialogTitle>Interact with {agent.name}</DialogTitle>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        {agent.lastResponse && (
                          <div className="p-4 bg-secondary/50 rounded-lg">
                            <p className="text-sm font-medium">Last Response:</p>
                            <p className="text-sm text-muted-foreground mt-1">
                              {agent.lastResponse.message}
                            </p>
                            <p className="text-xs text-muted-foreground mt-2">
                              {new Date(agent.lastResponse.timestamp).toLocaleTimeString()}
                            </p>
                          </div>
                        )}
                        <div className="flex flex-col gap-2">
                          <Textarea
                            placeholder="Enter your message for the agent..."
                            value={userMessage}
                            onChange={(e) => setUserMessage(e.target.value)}
                            className="min-h-[100px]"
                          />
                          <Button 
                            onClick={() => handleSendMessage(agent)}
                            disabled={!userMessage.trim() || agent.status !== AgentStatus.BUSY}
                          >
                            Send Message
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </Card>
          ))}
        </div>
        
        {/* Additional UI sections */}
        <Tabs defaultValue="metrics" className="mt-6">
          <TabsList>
            <TabsTrigger value="metrics">Performance Metrics</TabsTrigger>
            <TabsTrigger value="tasks">Active Tasks</TabsTrigger>
            <TabsTrigger value="health">Health Monitor</TabsTrigger>
            <TabsTrigger value="interactions">Recent Interactions</TabsTrigger>
          </TabsList>
          
          <TabsContent value="metrics">
            <Card className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <h5 className="text-sm font-medium mb-2">Agent Success Rate</h5>
                  <div className="text-2xl font-bold">
                    {(activeAgents.reduce((sum, agent) => sum + agent.performance.success_rate, 0) / activeAgents.length).toFixed(1)}%
                  </div>
                  <p className="text-sm text-muted-foreground">Average across all agents</p>
                </div>
                <div>
                  <h5 className="text-sm font-medium mb-2">Response Time</h5>
                  <div className="text-2xl font-bold">
                    {(activeAgents.reduce((sum, agent) => sum + agent.performance.response_time, 0) / activeAgents.length).toFixed(0)}ms
                  </div>
                  <p className="text-sm text-muted-foreground">Average response time</p>
                </div>
                <div>
                  <h5 className="text-sm font-medium mb-2">Tasks Completed</h5>
                  <div className="text-2xl font-bold">
                    {activeAgents.reduce((sum, agent) => sum + agent.performance.tasks_completed, 0)}
                  </div>
                  <p className="text-sm text-muted-foreground">Total across all agents</p>
                </div>
              </div>
            </Card>
          </TabsContent>
          
          <TabsContent value="tasks">
            <Card className="p-4">
              <div className="space-y-4">
                {taskTypes.map(task => (
                  <div key={task.id} className="flex justify-between items-center">
                    <div>
                      <h5 className="font-medium">{task.title}</h5>
                      <p className="text-sm text-muted-foreground">{task.count} pending tasks</p>
                    </div>
                    <Button variant="outline" size="sm">View Tasks</Button>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="health">
            <Card className="p-4">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h5 className="font-medium">Health Monitor Status</h5>
                    <p className="text-sm text-muted-foreground">
                      {monitoringActive ? 'Active - Watching your agents' : 'Inactive - No connected agents'}
                    </p>
                  </div>
                  <Badge variant={monitoringActive ? "default" : "outline"} className="h-6">
                    {monitoringActive ? 'Monitoring' : 'Standby'}
                  </Badge>
                </div>

                <div className="space-y-2">
                  <h5 className="text-sm font-medium">Active Agents Health</h5>
                  <div className="grid md:grid-cols-2 gap-4">
                    {activeAgents
                      .filter(agent => agent.status === AgentStatus.BUSY)
                      .map(agent => (
                        <div key={agent.id} className="flex justify-between items-center border p-3 rounded">
                          <div>
                            <div className="font-medium">{agent.name}</div>
                            <div className="text-sm text-muted-foreground">
                              Last ping: {agent.health 
                                ? new Date(agent.health.lastPing).toLocaleTimeString() 
                                : 'No data'}
                            </div>
                          </div>
                          <Badge variant="outline" className="bg-green-50">
                            Healthy
                          </Badge>
                        </div>
                    ))}
                    
                    {activeAgents.filter(agent => agent.status === AgentStatus.BUSY).length === 0 && (
                      <div className="text-sm text-muted-foreground col-span-2 text-center py-4">
                        No agents currently connected to monitor
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="interactions">
            <Card className="p-4">
              <div className="space-y-4">
                {Object.entries(agentResponses)
                  .sort(([, a], [, b]) => b.timestamp - a.timestamp)
                  .map(([agentId, response]) => {
                    const agent = activeAgents.find(a => a.id === agentId);
                    if (!agent) return null;
                    
                    return (
                      <div key={`${agentId}-${response.timestamp}`} className="flex justify-between items-start border p-3 rounded">
                        <div>
                          <div className="font-medium">{agent.name}</div>
                          <p className="text-sm text-muted-foreground mt-1">
                            {response.message}
                          </p>
                          <p className="text-xs text-muted-foreground mt-2">
                            {new Date(response.timestamp).toLocaleTimeString()}
                          </p>
                        </div>
                        <Badge variant="outline" className="bg-blue-50">
                          {agent.type}
                        </Badge>
                      </div>
                    );
                  })}

                {Object.keys(agentResponses).length === 0 && (
                  <div className="text-sm text-muted-foreground text-center py-4">
                    No recent interactions
                  </div>
                )}
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}