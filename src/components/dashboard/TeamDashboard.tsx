import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { LineChart, Line, BarChart, Bar, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts"
import { UserCheck, Users, Target, TrendingUp } from "lucide-react"

interface TeamMember {
  id: string
  name: string
  role: string
  performance: number
  tasksCompleted: number
  availability: 'available' | 'busy' | 'offline'
}

interface TeamMetrics {
  collaborationScore: number
  taskCompletionRate: number
  teamVelocity: number
  memberEngagement: number
}

export function TeamDashboard({ 
  departmentId,
  teamId 
}: { 
  departmentId: string
  teamId: string
}) {
  const [metrics, setMetrics] = useState<TeamMetrics>({
    collaborationScore: 85,
    taskCompletionRate: 92,
    teamVelocity: 78,
    memberEngagement: 88
  })

  const [members] = useState<TeamMember[]>([
    {
      id: '1',
      name: 'Team Lead',
      role: 'Team Leader',
      performance: 95,
      tasksCompleted: 127,
      availability: 'available'
    },
    // Add more team members as needed
  ])

  const getAvailabilityColor = (status: TeamMember['availability']) => {
    switch (status) {
      case 'available': return 'bg-green-500'
      case 'busy': return 'bg-yellow-500'
      case 'offline': return 'bg-gray-500'
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold">Team Dashboard</h2>
        <Badge variant="outline" className="text-lg">
          {members.length} Team Members
        </Badge>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-muted-foreground" />
            <div className="text-sm font-medium">Collaboration Score</div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold">{metrics.collaborationScore}%</div>
            <Progress value={metrics.collaborationScore} className="mt-2" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-2">
            <UserCheck className="h-5 w-5 text-muted-foreground" />
            <div className="text-sm font-medium">Task Completion</div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold">{metrics.taskCompletionRate}%</div>
            <Progress value={metrics.taskCompletionRate} className="mt-2" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-muted-foreground" />
            <div className="text-sm font-medium">Team Velocity</div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold">{metrics.teamVelocity}</div>
            <Progress value={metrics.teamVelocity} className="mt-2" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-2">
            <Target className="h-5 w-5 text-muted-foreground" />
            <div className="text-sm font-medium">Member Engagement</div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold">{metrics.memberEngagement}%</div>
            <Progress value={metrics.memberEngagement} className="mt-2" />
          </div>
        </Card>
      </div>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="members">Team Members</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="p-4">
              <h3 className="text-lg font-medium mb-4">Task Distribution</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={members}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="tasksCompleted" fill="#2563eb" name="Tasks Completed" />
                </BarChart>
              </ResponsiveContainer>
            </Card>

            <Card className="p-4">
              <h3 className="text-lg font-medium mb-4">Performance Trends</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={members}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="performance" stroke="#2563eb" name="Performance" />
                </LineChart>
              </ResponsiveContainer>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="members">
          <Card>
            <ScrollArea className="h-[600px]">
              <div className="p-4 space-y-4">
                {members.map(member => (
                  <Card key={member.id} className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-4">
                        <Avatar className="h-12 w-12">
                          {member.name.charAt(0)}
                        </Avatar>
                        <div>
                          <div className="font-medium">{member.name}</div>
                          <div className="text-sm text-muted-foreground">{member.role}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className={`h-2 w-2 rounded-full ${getAvailabilityColor(member.availability)}`} />
                        <span className="text-sm capitalize">{member.availability}</span>
                      </div>
                    </div>
                    <div className="mt-4">
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span className="text-muted-foreground">Performance</span>
                        <span>{member.performance}%</span>
                      </div>
                      <Progress value={member.performance} />
                    </div>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </Card>
        </TabsContent>

        <TabsContent value="performance">
          <Card className="p-4">
            <h3 className="text-lg font-medium mb-4">Team Performance Matrix</h3>
            {/* Add detailed performance metrics and analytics here */}
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}