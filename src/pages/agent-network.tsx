import React, { useEffect, useState } from 'react';
import { 
  AgentNetworkGraph 
} from '@/components/ai/AgentNetworkGraph';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { CircleIcon, CheckCircleIcon, ActivityIcon, LayersIcon } from 'lucide-react';
import { standardWorkflows } from '@/lib/ai/workflows/StandardWorkflows';

// This would normally be fetched from your API
async function fetchAgentNetwork() {
  // For demo purposes, we'll create a mock network
  const mockGraph = {
    nodes: [
      // Department nodes
      {
        id: 'dept:dept-commerce',
        type: 'department',
        label: 'Commerce Operations',
        properties: { departmentId: 'dept-commerce', name: 'Commerce Operations', agentCount: 2 }
      },
      {
        id: 'dept:dept-cx',
        type: 'department',
        label: 'Customer Experience',
        properties: { departmentId: 'dept-cx', name: 'Customer Experience', agentCount: 2 }
      },
      {
        id: 'dept:dept-supply',
        type: 'department',
        label: 'Supply Chain',
        properties: { departmentId: 'dept-supply', name: 'Supply Chain', agentCount: 2 }
      },
      {
        id: 'dept:dept-intel',
        type: 'department',
        label: 'Market Intelligence',
        properties: { departmentId: 'dept-intel', name: 'Market Intelligence', agentCount: 1 }
      },
      {
        id: 'dept:dept-optimize',
        type: 'department',
        label: 'Platform Optimization',
        properties: { departmentId: 'dept-optimize', name: 'Platform Optimization', agentCount: 1 }
      },
      
      // Agent nodes
      {
        id: 'agent:agent-pricing',
        type: 'agent',
        label: 'Pricing Optimization Agent',
        properties: { 
          agentId: 'agent-pricing', 
          name: 'Pricing Optimization Agent', 
          departmentId: 'dept-commerce',
          capabilities: ['price analysis', 'margin optimization'] 
        }
      },
      {
        id: 'agent:agent-inventory',
        type: 'agent',
        label: 'Inventory Management Agent',
        properties: { 
          agentId: 'agent-inventory', 
          name: 'Inventory Management Agent', 
          departmentId: 'dept-commerce',
          capabilities: ['stock tracking', 'demand forecasting'] 
        }
      },
      {
        id: 'agent:agent-support',
        type: 'agent',
        label: 'Customer Support Agent',
        properties: { 
          agentId: 'agent-support', 
          name: 'Customer Support Agent', 
          departmentId: 'dept-cx',
          capabilities: ['ticket management', 'customer communication'] 
        }
      },
      {
        id: 'agent:agent-orders',
        type: 'agent',
        label: 'Order Processing Agent',
        properties: { 
          agentId: 'agent-orders', 
          name: 'Order Processing Agent', 
          departmentId: 'dept-cx',
          capabilities: ['order validation', 'payment processing'] 
        }
      },
      {
        id: 'agent:agent-supplier',
        type: 'agent',
        label: 'Supplier Relations Agent',
        properties: { 
          agentId: 'agent-supplier', 
          name: 'Supplier Relations Agent', 
          departmentId: 'dept-supply',
          capabilities: ['supplier coordination', 'order placement'] 
        }
      },
      {
        id: 'agent:agent-quality',
        type: 'agent',
        label: 'Quality Control Agent',
        properties: { 
          agentId: 'agent-quality', 
          name: 'Quality Control Agent', 
          departmentId: 'dept-supply',
          capabilities: ['quality assessment', 'supplier evaluation'] 
        }
      },
      {
        id: 'agent:agent-market',
        type: 'agent',
        label: 'Market Analysis Agent',
        properties: { 
          agentId: 'agent-market', 
          name: 'Market Analysis Agent', 
          departmentId: 'dept-intel',
          capabilities: ['trend analysis', 'competitor tracking'] 
        }
      },
      {
        id: 'agent:agent-platform',
        type: 'agent',
        label: 'Platform Maintenance Agent',
        properties: { 
          agentId: 'agent-platform', 
          name: 'Platform Maintenance Agent', 
          departmentId: 'dept-optimize',
          capabilities: ['performance monitoring', 'system maintenance'] 
        }
      },
      
      // Add workflow node
      {
        id: 'workflow:workflow-product-onboard',
        type: 'workflow',
        label: 'Product Onboarding',
        properties: { 
          workflowId: 'workflow-product-onboard', 
          name: 'Product Onboarding', 
          status: 'pending',
          progress: 0,
          startedAt: new Date().toISOString()
        }
      },
      
      // Add task nodes
      {
        id: 'task:workflow-product-onboard:market-analysis',
        type: 'task',
        label: 'Market Analysis',
        properties: {
          taskId: 'market-analysis',
          name: 'market_analysis',
          status: 'pending',
          priority: 'medium',
          createdAt: new Date().toISOString()
        }
      },
      {
        id: 'task:workflow-product-onboard:pricing-strategy',
        type: 'task',
        label: 'Pricing Strategy',
        properties: {
          taskId: 'pricing-strategy',
          name: 'pricing_optimization',
          status: 'pending',
          priority: 'high',
          createdAt: new Date().toISOString()
        }
      },
      {
        id: 'task:workflow-product-onboard:inventory-setup',
        type: 'task',
        label: 'Inventory Setup',
        properties: {
          taskId: 'inventory-setup',
          name: 'inventory_management',
          status: 'pending',
          priority: 'high',
          createdAt: new Date().toISOString()
        }
      },
      {
        id: 'task:workflow-product-onboard:supplier-setup',
        type: 'task',
        label: 'Supplier Setup',
        properties: {
          taskId: 'supplier-setup',
          name: 'supplier_communication',
          status: 'pending',
          priority: 'high',
          createdAt: new Date().toISOString()
        }
      },
      {
        id: 'task:workflow-product-onboard:quality-check',
        type: 'task',
        label: 'Quality Check',
        properties: {
          taskId: 'quality-check',
          name: 'quality_control',
          status: 'pending',
          priority: 'high',
          createdAt: new Date().toISOString()
        }
      }
    ],
    
    edges: [
      // Department-Agent membership edges
      {
        id: 'edge-1',
        source: 'agent:agent-pricing',
        target: 'dept:dept-commerce',
        type: 'member_of',
        properties: { joinedAt: new Date().toISOString(), role: 'PRICING_OPTIMIZATION' }
      },
      {
        id: 'edge-2',
        source: 'agent:agent-inventory',
        target: 'dept:dept-commerce',
        type: 'member_of',
        properties: { joinedAt: new Date().toISOString(), role: 'INVENTORY_MANAGEMENT' }
      },
      {
        id: 'edge-3',
        source: 'agent:agent-support',
        target: 'dept:dept-cx',
        type: 'member_of',
        properties: { joinedAt: new Date().toISOString(), role: 'CUSTOMER_SERVICE' }
      },
      {
        id: 'edge-4',
        source: 'agent:agent-orders',
        target: 'dept:dept-cx',
        type: 'member_of',
        properties: { joinedAt: new Date().toISOString(), role: 'ORDER_PROCESSING' }
      },
      {
        id: 'edge-5',
        source: 'agent:agent-supplier',
        target: 'dept:dept-supply',
        type: 'member_of',
        properties: { joinedAt: new Date().toISOString(), role: 'SUPPLIER_COMMUNICATION' }
      },
      {
        id: 'edge-6',
        source: 'agent:agent-quality',
        target: 'dept:dept-supply',
        type: 'member_of',
        properties: { joinedAt: new Date().toISOString(), role: 'QUALITY_CONTROL' }
      },
      {
        id: 'edge-7',
        source: 'agent:agent-market',
        target: 'dept:dept-intel',
        type: 'member_of',
        properties: { joinedAt: new Date().toISOString(), role: 'MARKET_ANALYSIS' }
      },
      {
        id: 'edge-8',
        source: 'agent:agent-platform',
        target: 'dept:dept-optimize',
        type: 'member_of',
        properties: { joinedAt: new Date().toISOString(), role: 'CODE_MAINTENANCE' }
      },
      
      // Agent collaboration edges
      {
        id: 'edge-collab-1',
        source: 'agent:agent-pricing',
        target: 'agent:agent-market',
        type: 'collaborates_with',
        properties: { successRate: 0.85, frequency: 15, lastCollaborated: new Date().toISOString() }
      },
      {
        id: 'edge-collab-2',
        source: 'agent:agent-inventory',
        target: 'agent:agent-supplier',
        type: 'collaborates_with',
        properties: { successRate: 0.92, frequency: 23, lastCollaborated: new Date().toISOString() }
      },
      {
        id: 'edge-collab-3',
        source: 'agent:agent-orders',
        target: 'agent:agent-support',
        type: 'collaborates_with',
        properties: { successRate: 0.78, frequency: 41, lastCollaborated: new Date().toISOString() }
      },
      
      // Workflow task connections
      {
        id: 'edge-workflow-1',
        source: 'workflow:workflow-product-onboard',
        target: 'task:workflow-product-onboard:market-analysis',
        type: 'workflow_step',
        properties: { stepId: 'market-analysis', order: 0, dependsOn: [] }
      },
      {
        id: 'edge-workflow-2',
        source: 'workflow:workflow-product-onboard',
        target: 'task:workflow-product-onboard:pricing-strategy',
        type: 'workflow_step',
        properties: { stepId: 'pricing-strategy', order: 1, dependsOn: ['market-analysis'] }
      },
      {
        id: 'edge-workflow-3',
        source: 'workflow:workflow-product-onboard',
        target: 'task:workflow-product-onboard:inventory-setup',
        type: 'workflow_step',
        properties: { stepId: 'inventory-setup', order: 2, dependsOn: ['pricing-strategy'] }
      },
      {
        id: 'edge-workflow-4',
        source: 'workflow:workflow-product-onboard',
        target: 'task:workflow-product-onboard:supplier-setup',
        type: 'workflow_step',
        properties: { stepId: 'supplier-setup', order: 3, dependsOn: ['inventory-setup'] }
      },
      {
        id: 'edge-workflow-5',
        source: 'workflow:workflow-product-onboard',
        target: 'task:workflow-product-onboard:quality-check',
        type: 'workflow_step',
        properties: { stepId: 'quality-check', order: 4, dependsOn: ['supplier-setup'] }
      },
      
      // Task dependencies
      {
        id: 'edge-dep-1',
        source: 'task:workflow-product-onboard:market-analysis',
        target: 'task:workflow-product-onboard:pricing-strategy',
        type: 'depends_on',
        properties: { createdAt: new Date().toISOString() }
      },
      {
        id: 'edge-dep-2',
        source: 'task:workflow-product-onboard:pricing-strategy',
        target: 'task:workflow-product-onboard:inventory-setup',
        type: 'depends_on',
        properties: { createdAt: new Date().toISOString() }
      },
      {
        id: 'edge-dep-3',
        source: 'task:workflow-product-onboard:inventory-setup',
        target: 'task:workflow-product-onboard:supplier-setup',
        type: 'depends_on',
        properties: { createdAt: new Date().toISOString() }
      },
      {
        id: 'edge-dep-4',
        source: 'task:workflow-product-onboard:supplier-setup',
        target: 'task:workflow-product-onboard:quality-check',
        type: 'depends_on',
        properties: { createdAt: new Date().toISOString() }
      },
      
      // Task assignments
      {
        id: 'edge-assign-1',
        source: 'task:workflow-product-onboard:market-analysis',
        target: 'agent:agent-market',
        type: 'assigned_to',
        properties: { assignedAt: new Date().toISOString(), status: 'pending' }
      },
      {
        id: 'edge-assign-2',
        source: 'task:workflow-product-onboard:pricing-strategy',
        target: 'agent:agent-pricing',
        type: 'assigned_to',
        properties: { assignedAt: new Date().toISOString(), status: 'pending' }
      },
      {
        id: 'edge-assign-3',
        source: 'task:workflow-product-onboard:inventory-setup',
        target: 'agent:agent-inventory',
        type: 'assigned_to',
        properties: { assignedAt: new Date().toISOString(), status: 'pending' }
      },
      {
        id: 'edge-assign-4',
        source: 'task:workflow-product-onboard:supplier-setup',
        target: 'agent:agent-supplier',
        type: 'assigned_to',
        properties: { assignedAt: new Date().toISOString(), status: 'pending' }
      },
      {
        id: 'edge-assign-5',
        source: 'task:workflow-product-onboard:quality-check',
        target: 'agent:agent-quality',
        type: 'assigned_to',
        properties: { assignedAt: new Date().toISOString(), status: 'pending' }
      }
    ]
  };
  
  return mockGraph;
}

// Add proper types for graph data and fix state initialization
interface GraphNode {
  id: string;
  type: string;
  label: string;
  properties: Record<string, any>;
}

interface GraphData {
  nodes: GraphNode[];
  edges: Array<{
    id: string;
    source: string;
    target: string;
    type: string;
    properties: Record<string, any>;
  }>;
}

export default function AgentNetworkPage() {
  const [activeWorkflowId, setActiveWorkflowId] = useState("workflow-product-onboard");
  const [agentGraph, setAgentGraph] = useState<GraphData | null>(null);
  const [selectedAgent, setSelectedAgent] = useState<GraphNode | null>(null);
  const [workflowProgress, setWorkflowProgress] = useState(0);
  const [workflowStatus, setWorkflowStatus] = useState('pending');
  const [activeTab, setActiveTab] = useState('visualization');
  
  const activeWorkflow = standardWorkflows.productOnboarding;
  
  // Fetch graph data
  useEffect(() => {
    async function loadGraphData() {
      const graph = await fetchAgentNetwork();
      setAgentGraph(graph);
    }
    
    loadGraphData();
  }, []);
  
  // Fix typing in handleAgentClick
  const handleAgentClick = (agentId: string) => {
    const agent = agentGraph?.nodes.find(
      (node: GraphNode) => node.id === `agent:${agentId}`
    );
    
    if (agent) {
      setSelectedAgent(agent);
      setActiveTab('agent-details');
    }
  };
  
  // Handle workflow execution
  const executeWorkflow = () => {
    setWorkflowStatus('in_progress');
    
    // Simulate workflow execution
    let progress = 0;
    const interval = setInterval(() => {
      progress += 0.2;
      setWorkflowProgress(progress);
      
      if (progress >= 1) {
        clearInterval(interval);
        setWorkflowStatus('completed');
      }
    }, 1500);
  };
  
  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-semibold">Agent Network Orchestration</h1>
          <p className="text-muted-foreground">
            Visualize and manage agent collaborations and workflows
          </p>
        </div>
        <Select value={activeWorkflowId} onValueChange={setActiveWorkflowId}>
          <SelectTrigger className="w-[220px]">
            <SelectValue placeholder="Select workflow" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="workflow-product-onboard">Product Onboarding</SelectItem>
            <SelectItem value="workflow-order-fulfill">Order Fulfillment</SelectItem>
            <SelectItem value="workflow-platform-optimize">Platform Optimization</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="visualization">Network Visualization</TabsTrigger>
              <TabsTrigger value="workflow-details">Workflow Details</TabsTrigger>
              <TabsTrigger value="agent-details">Agent Details</TabsTrigger>
            </TabsList>
            
            <TabsContent value="visualization" className="mt-0">
              {agentGraph && (
                <AgentNetworkGraph 
                  data={agentGraph}
                  width={800}
                  height={600}
                  onAgentClick={handleAgentClick}
                  activeWorkflow={activeWorkflowId}
                />
              )}
            </TabsContent>
            
            <TabsContent value="workflow-details" className="mt-0">
              <Card>
                <CardHeader>
                  <CardTitle>Workflow: {activeWorkflow.name}</CardTitle>
                  <CardDescription>
                    {activeWorkflow.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="font-medium">Workflow Progress</span>
                        <span className="font-medium">{Math.round(workflowProgress * 100)}%</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${
                            workflowStatus === 'completed' ? 'bg-green-500' : 'bg-blue-500'
                          }`} 
                          style={{ width: `${workflowProgress * 100}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-end mt-1">
                        <Badge 
                          variant={workflowStatus === 'pending' ? 'outline' : 
                                  workflowStatus === 'completed' ? 'secondary' : 'default'}
                        >
                          {workflowStatus}
                        </Badge>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div>
                      <h3 className="font-medium mb-3">Workflow Steps</h3>
                      <div className="space-y-3">
                        {activeWorkflow.steps.map((step, index) => {
                          const stepProgress = workflowProgress * activeWorkflow.steps.length;
                          let status = 'pending';
                          if (stepProgress > index + 1) status = 'completed';
                          else if (stepProgress > index) status = 'in_progress';
                          
                          return (
                            <div key={step.id} className="flex items-center">
                              <div className="mr-3">
                                {status === 'completed' ? (
                                  <CheckCircleIcon className="h-5 w-5 text-green-500" />
                                ) : status === 'in_progress' ? (
                                  <ActivityIcon className="h-5 w-5 text-blue-500" />
                                ) : (
                                  <CircleIcon className="h-5 w-5 text-gray-300" />
                                )}
                              </div>
                              <div className="flex-grow">
                                <div className="font-medium">{step.id}</div>
                                <div className="text-sm text-muted-foreground">
                                  {step.taskType} ({step.priority} priority)
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                    
                    {workflowStatus === 'pending' && (
                      <Button onClick={executeWorkflow} className="w-full">
                        Execute Workflow
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="agent-details" className="mt-0">
              {selectedAgent ? (
                <Card>
                  <CardHeader>
                    <CardTitle>{selectedAgent.properties.name}</CardTitle>
                    <CardDescription>
                      {selectedAgent.properties.departmentId.replace('dept-', '')} Department
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h3 className="font-medium mb-2">Agent Capabilities</h3>
                        <div className="flex flex-wrap gap-2">
                          {selectedAgent.properties.capabilities.map(cap => (
                            <Badge key={cap}>{cap}</Badge>
                          ))}
                        </div>
                      </div>
                      
                      <Separator />
                      
                      <div>
                        <h3 className="font-medium mb-2">Performance Metrics</h3>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="border rounded-lg p-3">
                            <div className="text-sm text-muted-foreground">Success Rate</div>
                            <div className="text-2xl font-medium">
                              {Math.round((Math.random() * 15) + 80)}%
                            </div>
                          </div>
                          <div className="border rounded-lg p-3">
                            <div className="text-sm text-muted-foreground">Response Time</div>
                            <div className="text-2xl font-medium">
                              {Math.round((Math.random() * 300) + 200)}ms
                            </div>
                          </div>
                          <div className="border rounded-lg p-3">
                            <div className="text-sm text-muted-foreground">Tasks Completed</div>
                            <div className="text-2xl font-medium">
                              {Math.round((Math.random() * 400) + 300)}
                            </div>
                          </div>
                          <div className="border rounded-lg p-3">
                            <div className="text-sm text-muted-foreground">Collaborations</div>
                            <div className="text-2xl font-medium">
                              {Math.round((Math.random() * 50) + 20)}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardHeader>
                    <CardTitle>No Agent Selected</CardTitle>
                    <CardDescription>
                      Click on an agent in the visualization to see details
                    </CardDescription>
                  </CardHeader>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>
        
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Active Workflows</CardTitle>
              <CardDescription>
                Currently running agent workflows
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between border rounded-lg p-3">
                  <div className="flex items-center gap-3">
                    <LayersIcon className="h-5 w-5 text-blue-500" />
                    <div>
                      <div className="font-medium">Product Onboarding</div>
                      <div className="text-sm text-muted-foreground">
                        5 steps · 5 agents · 3 departments
                      </div>
                    </div>
                  </div>
                  <Badge 
                    variant={workflowStatus === 'pending' ? 'outline' : 
                            workflowStatus === 'completed' ? 'secondary' : 'default'}
                  >
                    {workflowStatus}
                  </Badge>
                </div>
              </div>
              
              <Separator className="my-4" />
              
              <h3 className="font-medium mb-3">Agent Network Overview</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <div className="text-sm">Departments</div>
                  <div className="font-medium">5</div>
                </div>
                <div className="flex justify-between items-center">
                  <div className="text-sm">Agents</div>
                  <div className="font-medium">8</div>
                </div>
                <div className="flex justify-between items-center">
                  <div className="text-sm">Active Collaborations</div>
                  <div className="font-medium">3</div>
                </div>
                <div className="flex justify-between items-center">
                  <div className="text-sm">Average Success Rate</div>
                  <div className="font-medium">85%</div>
                </div>
              </div>
              
              <Separator className="my-4" />
              
              <h3 className="font-medium mb-3">Recently Completed Tasks</h3>
              <div className="space-y-2">
                {workflowStatus === 'completed' ? (
                  activeWorkflow.steps.map((step) => (
                    <div key={step.id} className="text-sm flex items-center gap-2">
                      <CheckCircleIcon className="h-4 w-4 text-green-500" />
                      <span>{step.id}</span>
                    </div>
                  ))
                ) : (
                  <div className="text-sm text-muted-foreground">No recently completed tasks</div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}