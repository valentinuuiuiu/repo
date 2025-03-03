import React, { useState, useCallback } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import ReactFlow, { Background, Controls } from 'reactflow';
import { useNodesState, useEdgesState } from 'reactflow';
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { departmentWorkflows } from '@/lib/ai/department-workflows';
import { DepartmentTaskOrchestrator } from '@/lib/ai/department-task-orchestrator';

interface WorkflowProps {
  departmentId: string;
  onWorkflowComplete?: (results: any) => void;
}

function WorkflowNode({ data }: { data: any }) {
  return (
    <Card className="min-w-[200px]">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="font-medium">{data.label}</span>
          <Badge variant={
            data.status === 'completed' ? 'success' :
            data.status === 'in-progress' ? 'warning' :
            'secondary'
          }>
            {data.status}
          </Badge>
        </div>
        <div className="text-sm text-muted-foreground mb-2">
          Agent: {data.agent}
        </div>
        <Progress 
          value={
            data.status === 'completed' ? 100 :
            data.status === 'in-progress' ? 50 :
            0
          } 
          className="h-2"
        />
      </CardContent>
    </Card>
  );
}

const nodeTypes = {
  workflow: WorkflowNode
};

export function DepartmentWorkflows({ departmentId, onWorkflowComplete }: WorkflowProps) {
  const [activeWorkflow, setActiveWorkflow] = useState<string | null>(null);
  const [workflowStatus, setWorkflowStatus] = useState<Record<string, any>>({});
  const [orchestrator] = useState(() => new DepartmentTaskOrchestrator(departmentId));
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  const workflows = departmentWorkflows[departmentId] || [];

  const initializeWorkflow = useCallback(async (workflowId: string) => {
    const workflow = workflows.find(w => w.id === workflowId);
    if (!workflow) return;

    // Create workflow visualization
    const newNodes = workflow.steps.map((step, index) => ({
      id: step.id,
      type: 'workflow',
      position: { x: 100 + (index * 300), y: 100 },
      data: {
        label: step.action,
        agent: step.agentType,
        status: 'pending'
      }
    }));

    // Create edges between dependent steps
    const newEdges = workflow.steps.flatMap(step =>
      step.dependsOn.map(depId => ({
        id: `${depId}-${step.id}`,
        source: depId,
        target: step.id,
        animated: true,
        style: { stroke: '#64748b' }
      }))
    );

    setNodes(newNodes);
    setEdges(newEdges);
    setActiveWorkflow(workflowId);

    // Start workflow execution
    const result = await orchestrator.executeTask(workflow, {
      departmentId,
      timestamp: new Date()
    });

    // Update visualization with results
    if (result.success) {
      setNodes(nodes => 
        nodes.map(node => ({
          ...node,
          data: {
            ...node.data,
            status: 'completed',
            result: result.results[node.id]
          }
        }))
      );

      setWorkflowStatus(prev => ({
        ...prev,
        [workflowId]: {
          status: 'completed',
          analytics: result.analytics
        }
      }));

      onWorkflowComplete?.(result);
    }
  }, [workflows, orchestrator, departmentId, onWorkflowComplete, setNodes, setEdges]);

  return (
    <div className="h-[600px] bg-background rounded-lg border">
      <div className="p-4 border-b">
        <div className="flex gap-2">
          {workflows.map(workflow => (
            <button
              key={workflow.id}
              onClick={() => initializeWorkflow(workflow.id)}
              className={`px-4 py-2 rounded-lg transition-colors ${
                activeWorkflow === workflow.id
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary hover:bg-secondary/80'
              }`}
            >
              {workflow.name}
            </button>
          ))}
        </div>
      </div>

      <div className="h-[500px]">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={nodeTypes}
          fitView
        >
          <Background />
          <Controls />
        </ReactFlow>
      </div>

      {activeWorkflow && workflowStatus[activeWorkflow] && (
        <div className="p-4 border-t">
          <div className="flex gap-4">
            <div>
              Progress: {workflowStatus[activeWorkflow].analytics.progress.toFixed(0)}%
            </div>
            <div>
              Success Rate: {workflowStatus[activeWorkflow].analytics.successRate.toFixed(0)}%
            </div>
            <div>
              Steps: {workflowStatus[activeWorkflow].analytics.completedSteps} / {workflowStatus[activeWorkflow].analytics.totalSteps}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}