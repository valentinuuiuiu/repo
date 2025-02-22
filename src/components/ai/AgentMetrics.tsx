import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { useAgentStore } from "@/lib/ai/agent-monitoring"
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface AgentMetricsProps {
  agentId: string
  departmentId: string
}

const timeRanges = {
  "1h": 60 * 60 * 1000,
  "24h": 24 * 60 * 60 * 1000,
  "7d": 7 * 24 * 60 * 60 * 1000,
  "30d": 30 * 24 * 60 * 60 * 1000
}

export function AgentMetrics({ agentId, departmentId }: AgentMetricsProps) {
  const [timeRange, setTimeRange] = useState<keyof typeof timeRanges>("24h")
  const { getPerformance } = useAgentStore()
  const performance = getPerformance(agentId)

  // Format metrics for charts
  const getMetricsInRange = () => {
    const now = Date.now()
    const rangeStart = now - timeRanges[timeRange]
    return useAgentStore.getState().agentMetrics[agentId]?.metrics
      .filter((m: { timestamp: number }) => m.timestamp > rangeStart)
      .map((m: { timestamp: string | number | Date; duration: any; success: any }) => ({
        time: new Date(m.timestamp).toLocaleTimeString(),
        responseTime: m.duration,
        success: m.success ? 100 : 0
      })) || []
  }

  const [metrics, setMetrics] = useState(getMetricsInRange())

  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(getMetricsInRange())
    }, 5000)
    return () => clearInterval(interval)
  }, [timeRange, agentId])

  if (!performance) {
    return <div>No metrics available</div>
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Agent Performance Metrics</h3>
        <Select value={timeRange} onValueChange={(value: keyof typeof timeRanges) => setTimeRange(value)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select time range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1h">Last Hour</SelectItem>
            <SelectItem value="24h">Last 24 Hours</SelectItem>
            <SelectItem value="7d">Last 7 Days</SelectItem>
            <SelectItem value="30d">Last 30 Days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="p-4">
          <div className="text-sm font-medium text-muted-foreground">Success Rate</div>
          <div className="text-2xl font-bold">{performance.successRate.toFixed(1)}%</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm font-medium text-muted-foreground">Avg Response Time</div>
          <div className="text-2xl font-bold">{performance.avgResponseTime.toFixed(0)}ms</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm font-medium text-muted-foreground">Tasks Completed</div>
          <div className="text-2xl font-bold">{performance.tasksCompleted}</div>
        </Card>
      </div>

      <Card className="p-4">
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={metrics}>
              <XAxis dataKey="time" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Line 
                yAxisId="left"
                type="monotone" 
                dataKey="responseTime" 
                stroke="#2563eb" 
                name="Response Time (ms)" 
              />
              <Line 
                yAxisId="right"
                type="monotone" 
                dataKey="success" 
                stroke="#16a34a" 
                name="Success Rate (%)" 
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  )
}