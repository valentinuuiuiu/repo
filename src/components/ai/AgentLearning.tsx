import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { AIService } from "@/lib/ai";

interface Strategy {
  strategy: string;
  successRate: number;
}

interface DepartmentPerformance {
  successRate: number;
  averageCompletionTime: number;
  taskCount: number;
}

interface TaskInsights {
  successfulStrategies: string[];
  departmentPerformance: Record<string, DepartmentPerformance>;
  recentLearnings: string[];
}

interface TaskTypeInsights {
  type: string;
  insights: TaskInsights;
}

interface PerformanceChartData {
  department: string;
  successRate: number;
  completionTime: number;
}

export function AgentLearning() {
  const { data: taskInsights } = useQuery<TaskTypeInsights[]>({
    queryKey: ['task-insights'],
    queryFn: async () => {
      const aiService = new AIService();
      const insights = await aiService.getTaskTypeInsights();
      return insights.map(insight => ({
        type: insight.type,
        insights: {
          successfulStrategies: insight.data.strategies || [],
          departmentPerformance: insight.data.performance || {},
          recentLearnings: insight.data.learnings || []
        }
      }));
    }
  });

  if (!taskInsights?.length) return null;

  const performanceData = Object.entries(taskInsights[0].insights.departmentPerformance)
    .map(([dept, perf]) => ({
      department: dept,
      successRate: perf.successRate,
      completionTime: perf.averageCompletionTime
    }));

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
              {taskInsights?.map(({ type, insights }: TaskTypeInsights) => (
                <div key={type} className="space-y-2">
                  <h3 className="font-medium capitalize">{type.replace(/_/g, ' ')}</h3>
                  <div className="grid grid-cols-1 gap-2">
                    {insights.successfulStrategies.map((strategy: string, index: number) => (
                      <div key={index} className="flex justify-between p-2 bg-muted rounded">
                        <span className="text-sm">{strategy}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
          <TabsContent value="performance">
            {taskInsights?.[0] && (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={performanceData}>
                  <XAxis dataKey="department" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="successRate" name="Success Rate %" stroke="#10b981" />
                  <Line type="monotone" dataKey="completionTime" name="Completion Time" stroke="#6366f1" />
                </LineChart>
              </ResponsiveContainer>
            )}
          </TabsContent>
          <TabsContent value="learnings">
            <div className="space-y-4">
              {taskInsights?.map(({ type, insights }: TaskTypeInsights) => (
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

function PerformanceChart({ data }: { data: PerformanceChartData[] }) {
  // Implement your chart component here
  return (
    <div className="h-64 bg-card rounded-lg p-4">
      {/* Chart implementation */}
    </div>
  );
}