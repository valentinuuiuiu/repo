import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { LineChart, Line, BarChart, Bar, PieChart, Pie, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from "recharts"

interface AnalyticsProps {
  departmentId: string
  timeRange: "24h" | "7d" | "30d" | "90d"
}

interface MetricData {
  timestamp: string
  value: number
}

interface PerformanceMetrics {
  revenue: MetricData[]
  orders: MetricData[]
  productViews: MetricData[]
  conversion: MetricData[]
}

interface AgentMetrics {
  taskSuccess: MetricData[]
  responseTime: MetricData[]
  costSavings: MetricData[]
}

interface SupplierMetrics {
  fulfillmentRate: MetricData[]
  qualityScore: MetricData[]
  leadTime: MetricData[]
}

export function DepartmentAnalytics({ departmentId, timeRange }: AnalyticsProps) {
  const [performanceData, setPerformanceData] = useState<PerformanceMetrics>()
  const [agentData, setAgentData] = useState<AgentMetrics>()
  const [supplierData, setSupplierData] = useState<SupplierMetrics>()

  useEffect(() => {
    // Fetch analytics data based on department and timeRange
    const fetchAnalytics = async () => {
      // TODO: Implement actual data fetching
      // For now using mock data
      const mockData = generateMockData(timeRange)
      setPerformanceData(mockData.performance)
      setAgentData(mockData.agents)
      setSupplierData(mockData.suppliers)
    }

    fetchAnalytics()
  }, [departmentId, timeRange])

  if (!performanceData || !agentData || !supplierData) {
    return <div>Loading analytics...</div>
  }

  return (
    <div className="space-y-8 p-6">
      <Tabs defaultValue="performance" className="space-y-4">
        <TabsList>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="agents">AI Agents</TabsTrigger>
          <TabsTrigger value="suppliers">Suppliers</TabsTrigger>
        </TabsList>

        <TabsContent value="performance">
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="p-4">
              <h3 className="text-lg font-medium mb-4">Revenue & Orders</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={performanceData.revenue}>
                  <XAxis dataKey="timestamp" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="value"
                    name="Revenue"
                    stroke="#2563eb"
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    data={performanceData.orders}
                    dataKey="value"
                    name="Orders"
                    stroke="#16a34a"
                  />
                </LineChart>
              </ResponsiveContainer>
            </Card>

            <Card className="p-4">
              <h3 className="text-lg font-medium mb-4">Conversion Rate</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={performanceData.conversion}>
                  <XAxis dataKey="timestamp" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" name="Conversion %" fill="#8b5cf6" />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="agents">
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="p-4">
              <h3 className="text-lg font-medium mb-4">Agent Performance</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={agentData.taskSuccess}>
                  <XAxis dataKey="timestamp" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="value"
                    name="Success Rate"
                    stroke="#2563eb"
                  />
                </LineChart>
              </ResponsiveContainer>
            </Card>

            <Card className="p-4">
              <h3 className="text-lg font-medium mb-4">Cost Savings</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={agentData.costSavings}>
                  <XAxis dataKey="timestamp" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" name="Savings ($)" fill="#16a34a" />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="suppliers">
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="p-4">
              <h3 className="text-lg font-medium mb-4">Supplier Performance</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={supplierData.fulfillmentRate}>
                  <XAxis dataKey="timestamp" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="value"
                    name="Fulfillment Rate"
                    stroke="#2563eb"
                  />
                </LineChart>
              </ResponsiveContainer>
            </Card>

            <Card className="p-4">
              <h3 className="text-lg font-medium mb-4">Quality Scores</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={supplierData.qualityScore}>
                  <XAxis dataKey="timestamp" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" name="Quality Score" fill="#8b5cf6" />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

// Helper function to generate mock data for development
function generateMockData(timeRange: string) {
  const dataPoints = timeRange === "24h" ? 24 : timeRange === "7d" ? 7 : timeRange === "30d" ? 30 : 90
  const now = new Date()
  
  const generateMetrics = () => {
    return Array.from({ length: dataPoints }, (_, i) => ({
      timestamp: new Date(now.getTime() - (i * (timeRange === "24h" ? 3600000 : 86400000)))
        .toLocaleString(),
      value: Math.random() * 100
    })).reverse()
  }

  return {
    performance: {
      revenue: generateMetrics(),
      orders: generateMetrics(),
      productViews: generateMetrics(),
      conversion: generateMetrics()
    },
    agents: {
      taskSuccess: generateMetrics(),
      responseTime: generateMetrics(),
      costSavings: generateMetrics()
    },
    suppliers: {
      fulfillmentRate: generateMetrics(),
      qualityScore: generateMetrics(),
      leadTime: generateMetrics()
    }
  }
}