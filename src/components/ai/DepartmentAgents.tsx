import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface AgentData {
  id: string
  name: string
  type: string
  status: string
  performance: {
    tasks_completed: number
    success_rate: number
    response_time: number
  }
  config: Record<string, any>
}

export function DepartmentAgents({
  departmentId,
  agents
}: {
  departmentId: string
  agents: AgentData[]
}) {
  const [activeAgents, setActiveAgents] = useState(agents)

  return (
    <div className="p-4 space-y-4">
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="space-y-1">
            <h2 className="text-2xl font-semibold">Department AI Agents</h2>
            <p className="text-sm text-muted-foreground">
              Monitor and configure AI agents assigned to this department
            </p>
          </div>
          <Button>Deploy New Agent</Button>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {activeAgents.map((agent) => (
            <Card key={agent.id} className="p-4">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-medium">{agent.name}</h3>
                  <p className="text-sm text-muted-foreground">{agent.type}</p>
                </div>
                <Badge
                  variant={agent.status === "active" ? "success" : "secondary"}
                >
                  {agent.status}
                </Badge>
              </div>

              <div className="space-y-3">
                <div>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span>Success Rate</span>
                    <span>{agent.performance.success_rate}%</span>
                  </div>
                  <Progress value={agent.performance.success_rate} />
                </div>

                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="text-muted-foreground">Tasks Completed</p>
                    <p className="font-medium">
                      {agent.performance.tasks_completed}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Avg Response</p>
                    <p className="font-medium">
                      {agent.performance.response_time}ms
                    </p>
                  </div>
                </div>

                <div className="flex gap-2 mt-4">
                  <Button variant="outline" size="sm" className="flex-1">
                    Configure
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    View Logs
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <Tabs defaultValue="metrics" className="mt-6">
          <TabsList>
            <TabsTrigger value="metrics">Performance Metrics</TabsTrigger>
            <TabsTrigger value="tasks">Active Tasks</TabsTrigger>
            <TabsTrigger value="logs">Agent Logs</TabsTrigger>
          </TabsList>
          
          <TabsContent value="metrics" className="space-y-4">
            <Card className="p-4">
              {/* Add performance metrics visualization */}
              <div className="h-[200px] flex items-center justify-center text-muted-foreground">
                Performance metrics visualization will be displayed here
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="tasks">
            <Card className="p-4">
              {/* Add active tasks list */}
              <div className="h-[200px] flex items-center justify-center text-muted-foreground">
                Active tasks will be displayed here
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="logs">
            <Card className="p-4">
              {/* Add agent logs */}
              <div className="h-[200px] flex items-center justify-center text-muted-foreground">
                Agent logs will be displayed here
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  )
}