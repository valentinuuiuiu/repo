import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { aiService } from "@/lib/ai";

interface Strategy {
  strategy: string;
  successRate: number;
}

interface DepartmentPerformance {
  successRate: number;
  averageValidationScore: number;
  taskCount: number;
}

interface TaskInsights {
  successfulStrategies: Strategy[];
  departmentPerformance: Record<string, DepartmentPerformance>;
  recentLearnings: string[];
}

interface TaskTypeInsights {
  type: string;
  insights: TaskInsights;
}

interface PerformanceChartData {
  name: string;
  successRate: string;
  validationScore: string;
  taskCount: number;
}

export function AgentLearning() {
  const { data: insights } = useQuery<TaskTypeInsights[]>({
    queryKey: ["agent-learning"],
    queryFn: async () => {
      const taskTypes = ["product_optimization", "marketing_strategy", "inventory_forecast"];
      return Promise.all(
        taskTypes.map(async (type: string) => ({
          type,
          insights: await aiService.manager.getTaskInsights(type)
        }))
      );
    },
    refetchInterval: 60000 // Refresh every minute
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Agent Learning Analytics</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="strategies">
          <TabsList>
            <TabsTrigger value="strategies">Success Strategies</TabsTrigger>
            <TabsTrigger value="performance">Department Performance</TabsTrigger>
            <TabsTrigger value="learnings">Recent Learnings</TabsTrigger>
          </TabsList>
          <TabsContent value="strategies">
            <div className="space-y-6">
              {insights?.map(({ type, insights }: TaskTypeInsights) => (
                <div key={type} className="space-y-2">
                  <h3 className="font-medium capitalize">{type.replace(/_/g, ' ')}</h3>
                  <div className="grid grid-cols-1 gap-2">
                    {insights.successfulStrategies.map((strategy: Strategy, index: number) => (
                      <div key={index} className="flex justify-between p-2 bg-muted rounded">
                        <span className="text-sm">{strategy.strategy}</span>
                        <span className="text-sm font-medium">
                          {(strategy.successRate * 100).toFixed(1)}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
          <TabsContent value="performance">
            {insights?.[0] && (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={Object.entries(insights[0].insights.departmentPerformance).map(([dept, perf]: [string, DepartmentPerformance]): PerformanceChartData => ({
                  name: dept,
                  successRate: (perf.successRate * 100).toFixed(1),
                  validationScore: (perf.averageValidationScore * 100).toFixed(1),
                  taskCount: perf.taskCount
                }))}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="successRate" name="Success Rate %" stroke="#10b981" />
                  <Line type="monotone" dataKey="validationScore" name="Validation Score %" stroke="#6366f1" />
                </LineChart>
              </ResponsiveContainer>
            )}
          </TabsContent>
          <TabsContent value="learnings">
            <div className="space-y-4">
              {insights?.map(({ type, insights }: TaskTypeInsights) => (
                <div key={type} className="space-y-2">
                  <h3 className="font-medium capitalize">{type.replace(/_/g, ' ')}</h3>
                  <ul className="space-y-2">
                    {insights.recentLearnings.map((learning: string, index: number) => (
                      <li key={index} className="text-sm p-2 bg-muted rounded">
                        {learning}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}