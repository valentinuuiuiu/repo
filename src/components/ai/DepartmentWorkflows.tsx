import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { departmentWorkflows } from "@/lib/ai/department-workflows"
import { DepartmentTaskOrchestrator } from "@/lib/ai/department-task-orchestrator"
import ReactFlow, { 
  Position,
  MarkerType,
  useNodesState,
  useEdgesState
} from 'reactflow'

interface WorkflowProps {
  departmentId: string
  onWorkflowComplete?: (results: any) => void
}

function WorkflowNode({ data }: { data: any }) {
  return (
    <div className="px-4 py-2 rounded-lg border bg-white shadow-sm">
      <div className="font-medium">{data.label}</div>
      <div className="text-sm text-muted-foreground">{data.agent}</div>
      {data.status && (
        <Badge 
          variant={
            data.status === 'completed' ? 'success' : 
            data.status === 'in-progress' ? 'default' : 
            'secondary'
          }
          className="mt-2"
        >
          {data.status}
        </Badge>
      )}
      <Progress 
        value={
          data.status === 'completed' ? 100 :
          data.status === 'in-progress' ? 50 :
          0
        } 
        className="mt-2"
      />
    </div>
  )
}

export function DepartmentWorkflows({ departmentId, onWorkflowComplete }: WorkflowProps) {
  const [activeWorkflow, setActiveWorkflow] = useState<string | null>(null)
  const [workflowStatus, setWorkflowStatus] = useState<Record<string, any>>({})
  const [orchestrator] = useState(() => new DepartmentTaskOrchestrator(departmentId))
  const [nodes, setNodes, onNodesChange] = useNodesState([])
  const [edges, setEdges, onEdgesChange] = useEdgesState([])

  const workflows = departmentWorkflows[departmentId] || []

  const initializeWorkflow = async (workflowId: string) => {
    const workflow = workflows.find(w => w.id === workflowId)
    if (!workflow) return

    // Create workflow visualization
    const newNodes = workflow.steps.map((step, index) => ({
      id: step.id,
      type: 'default',
      position: { x: 100 + (index * 250), y: 100 },
      data: {
        label: step.action,
        agent: step.agentType,
        status: 'pending'
      }
    }))

    const newEdges = workflow.steps.flatMap(step =>
      step.dependsOn.map(depId => ({
        id: `${depId}-${step.id}`,
        source: depId,
        target: step.id,
        animated: true,
        markerEnd: { type: MarkerType.Arrow }
      }))
    )

    setNodes(newNodes)
    setEdges(newEdges)
    setActiveWorkflow(workflowId)

    try {
      // Execute workflow
      const results = await orchestrator.executeTask(workflow, {
        // Add initial workflow data here
      })

      setWorkflowStatus(prev => ({
        ...prev,
        [workflowId]: { status: 'completed', results }
      }))

      onWorkflowComplete?.(results)

    } catch (error) {
      setWorkflowStatus(prev => ({
        ...prev,
        [workflowId]: { status: 'failed', error }
      }))
    }
  }

  return (
    <div className="grid grid-cols-4 gap-4 h-[800px]">
      <Card className="p-4">
        <h3 className="text-lg font-medium mb-4">Available Workflows</h3>
        <ScrollArea className="h-[700px]">
          <div className="space-y-4">
            {workflows.map(workflow => (
              <Card key={workflow.id} className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">{workflow.name}</h4>
                  <Badge variant="outline">
                    {workflow.requiredAgents.length} Agents
                  </Badge>
                </div>
                
                <div className="space-y-2 mb-4">
                  {workflow.requiredAgents.map(agent => (
                    <Badge key={agent} variant="secondary" className="mr-2">
                      {agent}
                    </Badge>
                  ))}
                </div>

                {workflowStatus[workflow.id]?.status ? (
                  <Badge 
                    variant={
                      workflowStatus[workflow.id].status === 'completed' 
                        ? 'success' 
                        : 'destructive'
                    }
                  >
                    {workflowStatus[workflow.id].status}
                  </Badge>
                ) : (
                  <Button 
                    onClick={() => initializeWorkflow(workflow.id)}
                    disabled={activeWorkflow === workflow.id}
                  >
                    Start Workflow
                  </Button>
                )}
              </Card>
            ))}
          </div>
        </ScrollArea>
      </Card>

      <div className="col-span-3 relative">
        <Card className="p-4 h-full">
          {activeWorkflow ? (
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              nodeTypes={{ default: WorkflowNode }}
              fitView
            />
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              Select a workflow to begin
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}