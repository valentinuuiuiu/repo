import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Progress } from "../ui/progress";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { aiService } from "@/lib/ai";

interface Performance {
  taskCount: number;
  successRate: number;
  averageValidationScore: number;
}

interface DepartmentStatus {
  currentParameters: Record<string, number | string>;
  performance: Performance;
}

interface OptimizationStatus {
  [department: string]: DepartmentStatus;
}

export function AgentOptimizationStatus() {
  const { data: optimizationStatus } = useQuery<OptimizationStatus, Error, OptimizationStatus>(
    ["agent-optimization"],
    () => aiService.manager.getAgentOptimizationStatus(),
    { refetchInterval: 15000 } // Refresh every 15 seconds
  );

  if (!optimizationStatus) return null;

  const departments = Object.keys(optimizationStatus);
  const parameterData = departments.map(dept => ({
    name: dept,
    ...optimizationStatus[dept].currentParameters
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Agent Optimization Status</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="parameters">
          <TabsList>
            <TabsTrigger value="parameters">Current Parameters</TabsTrigger>
            <TabsTrigger value="performance">Learning Progress</TabsTrigger>
          </TabsList>

          <TabsContent value="parameters">
            <div className="space-y-6">
              {departments.map(dept => (
                <div key={dept} className="space-y-4">
                  <h3 className="font-medium capitalize">{dept.replace(/_/g, ' ')}</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {Object.entries(optimizationStatus[dept].currentParameters).map(([param, value]) => (
                      <div key={param} className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">{param.replace(/_/g, ' ')}</span>
                          <span>{typeof value === 'number' ? value.toFixed(2) : value.toString()}</span>
                        </div>
                        {typeof value === 'number' && (
                          <Progress 
                            value={((value as number) * 100)} 
                            className="h-2"
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="performance">
            <div className="space-y-6">
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={departments.map(dept => ({
                  name: dept,
                  successRate: optimizationStatus[dept].performance.successRate * 100,
                  validationScore: optimizationStatus[dept].performance.averageValidationScore * 100
                }))}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="successRate" 
                    name="Success Rate %" 
                    stroke="#10b981" 
                  />
                  <Line 
                    type="monotone" 
                    dataKey="validationScore" 
                    name="Validation Score %" 
                    stroke="#6366f1" 
                  />
                </LineChart>
              </ResponsiveContainer>

              <div className="grid grid-cols-2 gap-4">
                {departments.map(dept => (
                  <div key={dept} className="p-4 bg-muted rounded">
                    <h4 className="font-medium capitalize mb-2">
                      {dept.replace(/_/g, ' ')}
                    </h4>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span>Tasks Processed:</span>
                        <span>{optimizationStatus[dept].performance.taskCount}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Success Rate:</span>
                        <span>
                          {(optimizationStatus[dept].performance.successRate * 100).toFixed(1)}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Validation Score:</span>
                        <span>
                          {(optimizationStatus[dept].performance.averageValidationScore * 100).toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}