import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { AgentCoordinator } from "@/lib/ai/agent-coordinator"
import ReactFlow, { 
  Handle,
  Position,
  MarkerType,
  Edge,
  useNodesState,
  useEdgesState
} from 'reactflow'
import 'reactflow/dist/style.css'

interface AgentNode {
  id: string
  type: string
  data: {
    label: string
    status: string
    messageCount: number
    state: Record<string, any>
  }
  position: { x: number; y: number }
}

interface Message {
  id: string
  from: string
  to: string
  type: string
  payload: {
    action: string
    data: Record<string, any>
    priority: number
  }
  timestamp: number
}

function AgentNodeComponent({ data }: { data: AgentNode['data'] }) {
  return (
    <div className="px-4 py-2 shadow-md rounded-md bg-white border">
      <Handle type="target" position={Position.Top} />
      <div className="flex items-center">
        <div className="ml-2">
          <div className="text-lg font-bold">{data.label}</div>
          <div className="text-gray-500">agent</div>
        </div>
      </div>
      <Badge 
        variant={data.status === 'active' ? 'default' : 'secondary'}
        className="mt-2"
      >
        {data.status}
      </Badge>
      <Handle type="source" position={Position.Bottom} />
    </div>
  )
}

const nodeTypes = {
  agent: AgentNodeComponent
}

export function AgentCommunicationView({ departmentId }: { departmentId: string }) {
  const [nodes, setNodes, onNodesChange] = useNodesState([])
  const [edges, setEdges, onEdgesChange] = useEdgesState([])
  const [messages, setMessages] = useState<Message[]>([])
  const [coordinator] = useState(() => new AgentCoordinator(departmentId))

  useEffect(() => {
    // Load initial agent states and message history
    const loadData = async () => {
      const history = await coordinator.getMessageHistory()
      setMessages(history)

      // Get all agent states first
      const agentStates = await Promise.all(
        history.reduce((acc, msg) => {
          if (!acc.includes(msg.from)) acc.push(msg.from)
          if (msg.to !== 'all' && !acc.includes(msg.to)) acc.push(msg.to)
          return acc
        }, [] as string[])
        .map(async agentId => ({
          id: agentId,
          state: await coordinator.getAgentState(agentId) || {}
        }))
      )

      // Create initial nodes in a circular layout
      const radius = 200
      const angleStep = (2 * Math.PI) / agentStates.length

      const newNodes = agentStates.map((agent, index) => ({
        id: agent.id,
        type: 'agent',
        data: {
          label: `Agent ${agent.id.slice(0, 6)}`,
          status: 'active',
          messageCount: history.filter(m => m.from === agent.id).length,
          state: agent.state
        },
        position: {
          x: 300 + radius * Math.cos(index * angleStep),
          y: 300 + radius * Math.sin(index * angleStep)
        }
      }))

      setNodes(newNodes)

      // Create edges from message history
      const newEdges = history
        .filter(msg => msg.to !== 'all')
        .map(msg => ({
          id: msg.id,
          source: msg.from,
          target: msg.to,
          animated: true,
          markerEnd: {
            type: MarkerType.Arrow,
          },
          style: {
            strokeWidth: 2,
            stroke: msg.payload.priority > 5 ? '#ef4444' : '#3b82f6'
          }
        }))

      setEdges(newEdges)
    }

    loadData()
  
    let unsubscribeFn: (() => void) | undefined;
    coordinator.subscribe('viz', (message: Message) => {
      setMessages(prev => [message, ...prev].slice(0, 100))
      
      if (message.to !== 'all') {
        setEdges((prev: Edge[]) => [
          ...prev,
          {
            id: message.id,
            source: message.from,
            target: message.to,
            animated: true,
            markerEnd: {
              type: MarkerType.Arrow,
            },
            style: {
              strokeWidth: 2,
              stroke: message.payload.priority > 5 ? '#ef4444' : '#3b82f6'
            }
          }
        ])
      }
    }).then((fn) => {
      unsubscribeFn = fn;
    });
  
    return () => {
      if (unsubscribeFn) unsubscribeFn();
    };
  }, [coordinator]);
  
  return (
    <div className="flex">
      <div className="col-span-3 relative">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={nodeTypes}
          fitView
        />
      </div>
      <Card className="p-4">
        <h3 className="text-lg font-medium mb-4">Communication Log</h3>
        <ScrollArea className="h-[700px]">
          <div className="space-y-4">
            {messages.map(message => (
              <Card key={message.id} className="p-3">
                <div className="flex items-center justify-between">
                  <Badge variant="outline">
                    {new Date(message.timestamp).toLocaleTimeString()}
                  </Badge>
                  <Badge
                    variant={message.payload.priority > 5 ? 'destructive' : 'default'}
                  >
                    Priority {message.payload.priority}
                  </Badge>
                </div>
                <div className="mt-2">
                  <div className="text-sm text-muted-foreground">
                    {message.from} → {message.to}
                  </div>
                  <div className="font-medium">{message.payload.action}</div>
                  <div className="text-sm mt-1">
                    {JSON.stringify(message.payload.data).slice(0, 100)}
                    {JSON.stringify(message.payload.data).length > 100 ? '...' : ''}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </ScrollArea>
      </Card>
    </div>
  );
}