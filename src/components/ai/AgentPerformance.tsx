import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Progress } from "../ui/progress";
import { aiService } from "@/lib/ai";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

// Added interfaces to fix TS errors
interface OverallPerformance {
  successRate: number;
  averageConfidence: number;
  averageProcessingTime: number;
  tasksByType: Record<string, number>;
}

interface AgentSpecificPerformance {
  name: string;
  successRate: number;
  averageConfidence: number;
}

export function AgentPerformance() {
  const { data: overallPerformance } = useQuery<OverallPerformance>({
    queryKey: ["agent-performance"],
    queryFn: () => aiService.manager.getOverallPerformance(),
    refetchInterval: 30000 // Refresh every 30 seconds
  });

  const { data: agentSpecificData } = useQuery<AgentSpecificPerformance[]>({
    queryKey: ["agent-specific-performance"],
    queryFn: async () => {
      const agents = ["product", "supplier", "marketing", "inventory", "customerService", "marketResearch"];
      return Promise.all(
        agents.map(async (agent) => ({
          name: agent,
          ...await aiService.manager.getAgentPerformance(agent)
        }))
      );
    },
    refetchInterval: 30000
  });

  if (!overallPerformance || !agentSpecificData) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Overall System Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Success Rate</h3>
              <Progress value={overallPerformance.successRate * 100} />
              <p className="text-sm text-muted-foreground">
                {(overallPerformance.successRate * 100).toFixed(1)}%
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Average Confidence</h3>
              <Progress value={overallPerformance.averageConfidence * 100} />
              <p className="text-sm text-muted-foreground">
                {(overallPerformance.averageConfidence * 100).toFixed(1)}%
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Processing Time</h3>
              <p className="text-sm text-muted-foreground">
                {(overallPerformance.averageProcessingTime / 1000).toFixed(2)}s
              </p>
            </div>
          </div>

          <div className="mt-6">
            <h3 className="text-sm font-medium mb-4">Tasks by Type</h3>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(overallPerformance.tasksByType).map(([type, count]) => (
                <div key={type} className="flex justify-between items-center p-2 bg-muted rounded">
                  <span className="text-sm capitalize">{type.replace(/_/g, ' ')}</span>
                  <span className="text-sm font-medium">{count}</span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Agent Performance Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={agentSpecificData}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="successRate" name="Success Rate" stroke="#10b981" />
              <Line type="monotone" dataKey="averageConfidence" name="Confidence" stroke="#6366f1" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}