import React, { useState, useEffect, useCallback, useRef } from 'react';
import ForceGraph2D, { ForceGraphMethods } from 'react-force-graph-2d';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

interface AgentNetworkGraphProps {
  data?: any;
  width?: number;
  height?: number; 
  onAgentClick?: (agentId: string) => void;
  onDepartmentClick?: (departmentId: string) => void;
  activeWorkflow?: string;
}

interface GraphData {
  nodes: Array<{
    id: string;
    label: string;
    type: string;
    properties: any;
    color: string;
  }>;
  links: Array<{
    source: string;
    target: string;
    type: string;
    label: string;
    properties: any;
    color: string;
  }>;
}

export function AgentNetworkGraph({
  data,
  width = 800,
  height = 600,
  onAgentClick,
  onDepartmentClick,
  activeWorkflow
}: AgentNetworkGraphProps) {
  const [graphData, setGraphData] = useState<GraphData>({ nodes: [], links: [] });
  const [viewMode, setViewMode] = useState<'all' | 'agents' | 'departments' | 'workflow'>('all');
  const graphRef = useRef<ForceGraphMethods>();
  
  // Transform data for visualization
  useEffect(() => {
    if (!data) return;
    
    // Process the graph data based on view mode
    let filteredNodes = [...data.nodes];
    let filteredLinks = [...data.edges];
    
    if (viewMode === 'agents') {
      filteredNodes = data.nodes.filter((node: any) => node.type === 'agent');
      filteredLinks = data.edges.filter((edge: any) => 
        edge.source.startsWith('agent:') && edge.target.startsWith('agent:')
      );
    } else if (viewMode === 'departments') {
      filteredNodes = data.nodes.filter((node: any) => 
        node.type === 'department' || node.type === 'agent'
      );
      filteredLinks = data.edges.filter((edge: any) => edge.type === 'member_of');
    } else if (viewMode === 'workflow' && activeWorkflow) {
      // Get workflow node and all connected task nodes
      const workflowNode = data.nodes.find((n: any) => 
        n.type === 'workflow' && n.id === `workflow:${activeWorkflow}`
      );
      
      if (workflowNode) {
        // Get all tasks in this workflow
        const workflowTasks = data.nodes.filter((n: any) => 
          n.type === 'task' && n.id.startsWith(`task:${activeWorkflow}:`)
        );
        
        // Get all agents assigned to these tasks
        const taskAgentEdges = data.edges.filter((e: any) => 
          e.type === 'assigned_to' && 
          workflowTasks.some((t: any) => t.id === e.source)
        );
        
        const assignedAgentIds = taskAgentEdges.map((e: any) => e.target);
        const assignedAgents = data.nodes.filter((n: any) => 
          assignedAgentIds.includes(n.id)
        );
        
        filteredNodes = [workflowNode, ...workflowTasks, ...assignedAgents];
        filteredLinks = data.edges.filter((e: any) => 
          (e.source === workflowNode.id) || // Workflow to task links
          (workflowTasks.some((t: any) => t.id === e.source || t.id === e.target)) || // Task to task links
          taskAgentEdges.some((tae: any) => tae.id === e.id) // Task to agent links
        );
      }
    }
    
    // Format for react-force-graph
    const formattedData = {
      nodes: filteredNodes.map((node: any) => ({
        id: node.id,
        label: node.label || node.id.split(':')[1],
        type: node.type,
        properties: node.properties,
        color: getNodeColor(node.type)
      })),
      links: filteredLinks.map((edge: any) => ({
        source: edge.source,
        target: edge.target,
        type: edge.type,
        label: edge.label,
        properties: edge.properties,
        color: getLinkColor(edge.type)
      }))
    };
    
    setGraphData(formattedData);
  }, [data, viewMode, activeWorkflow]);
  
  const getNodeColor = useCallback((type: string) => {
    switch (type) {
      case 'agent':
        return '#3b82f6'; // blue
      case 'department':
        return '#10b981'; // green
      case 'task':
        return '#f59e0b'; // amber
      case 'workflow':
        return '#8b5cf6'; // purple
      default:
        return '#6b7280'; // gray
    }
  }, []);
  
  const getLinkColor = useCallback((type: string) => {
    switch (type) {
      case 'collaborates_with':
        return '#3b82f6'; // blue
      case 'member_of':
        return '#10b981'; // green
      case 'assigned_to':
        return '#f59e0b'; // amber
      case 'workflow_step':
        return '#8b5cf6'; // purple
      case 'depends_on':
        return '#ef4444'; // red
      default:
        return '#6b7280'; // gray
    }
  }, []);
  
  const handleNodeClick = useCallback((node: any) => {
    if (node.type === 'agent' && onAgentClick) {
      onAgentClick(node.id.split(':')[1]);
    } else if (node.type === 'department' && onDepartmentClick) {
      onDepartmentClick(node.id.split(':')[1]);
    }
    
    // Zoom in on the selected node
    if (graphRef.current) {
      graphRef.current.centerAt(node.x, node.y, 1000);
      graphRef.current.zoom(2, 1000);
    }
  }, [onAgentClick, onDepartmentClick]);
  
  const resetCamera = useCallback(() => {
    if (graphRef.current) {
      graphRef.current.zoomToFit(400);
    }
  }, []);
  
  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle>Agent Network</CardTitle>
          <Button variant="outline" size="sm" onClick={resetCamera}>
            Reset View
          </Button>
        </div>
        <Tabs value={viewMode} onValueChange={(val) => setViewMode(val as any)} className="mt-2">
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="agents">Agents</TabsTrigger>
            <TabsTrigger value="departments">Departments</TabsTrigger>
            {activeWorkflow && <TabsTrigger value="workflow">Current Workflow</TabsTrigger>}
          </TabsList>
        </Tabs>
      </CardHeader>
      <CardContent>
        <div className="border rounded-lg overflow-hidden">
          <ForceGraph2D
            ref={graphRef as any}
            graphData={graphData}
            width={width}
            height={height}
            nodeLabel={(node: any) => `${node.type}: ${node.label}`}
            linkLabel={(link: any) => `${link.type}: ${link.properties?.successRate || ''}`}
            nodeColor={(node: any) => node.color}
            linkColor={(link: any) => link.color}
            nodeRelSize={6}
            linkDirectionalArrowLength={4}
            linkDirectionalArrowRelPos={0.7}
            linkDirectionalParticles={2}
            linkDirectionalParticleSpeed={(link: any) => 
              link.type === 'collaborates_with' ? (link.properties?.successRate || 0) * 0.01 : 0.005
            }
            onNodeClick={handleNodeClick}
            warmupTicks={100}
            cooldownTicks={100}
          />
        </div>
        <div className="flex flex-wrap gap-2 mt-4">
          <Legend />
        </div>
      </CardContent>
    </Card>
  );
}

function Legend() {
  const items = [
    { label: 'Agent', color: '#3b82f6' },
    { label: 'Department', color: '#10b981' },
    { label: 'Task', color: '#f59e0b' },
    { label: 'Workflow', color: '#8b5cf6' },
    { label: 'Collaboration', color: '#3b82f6' },
    { label: 'Membership', color: '#10b981' },
    { label: 'Assignment', color: '#f59e0b' },
    { label: 'Workflow Step', color: '#8b5cf6' },
    { label: 'Dependency', color: '#ef4444' },
  ];
  
  return (
    <>
      {items.map((item) => (
        <Badge 
          key={item.label} 
          variant="outline"
          className="flex items-center gap-1"
        >
          <span 
            className="inline-block w-3 h-3 rounded-full" 
            style={{ backgroundColor: item.color }}
          />
          {item.label}
        </Badge>
      ))}
    </>
  );
}