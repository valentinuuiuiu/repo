import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Progress } from "../ui/progress";
import { CircuitState } from "@/lib/ai/core/CircuitBreaker";
import { aiService } from "@/lib/ai";

interface CircuitBreakerMetrics {
  state: CircuitState;
  failureCount: number;
  successCount: number;
}

interface AgentInfo {
  status: string;
  circuitBreakerMetrics?: CircuitBreakerMetrics;
}

interface AgentStatus {
  manager: AgentInfo;
  departments: Record<string, AgentInfo>;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'active':
      return 'default';
    case 'degraded':
      return 'secondary';
    case 'inactive':
      return 'destructive';
    default:
      return 'secondary';
  }
};

const getCircuitStateColor = (state: CircuitState) => {
  switch (state) {
    case CircuitState.CLOSED:
      return 'default';
    case CircuitState.HALF_OPEN:
      return 'secondary';
    case CircuitState.OPEN:
      return 'destructive';
    default:
      return 'secondary';
  }
};

export function AgentStatus() {
  const { data: status, isLoading } = useQuery<AgentStatus, Error>({
    queryKey: ["agent-status"],
    queryFn: () => aiService.getAgentStatuses(),
    refetchInterval: 5000
  });

  if (isLoading || !status) return <div>Loading...</div>;

  return (
    <Card>
      <CardHeader>
        <CardTitle>AI Agents Status</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="space-y-2">
            <h3 className="font-medium">Manager Status</h3>
            <div className="flex items-center space-x-4">
              <Badge variant={getStatusColor(status?.manager.status)}>
                {status?.manager.status}
              </Badge>
              {status?.manager.circuitBreakerMetrics && (
                <Badge variant={getCircuitStateColor(status.manager.circuitBreakerMetrics.state)}>
                  Circuit: {status.manager.circuitBreakerMetrics.state}
                </Badge>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-medium">Department Agents</h3>
            <div className="grid grid-cols-1 gap-4">
              {Object.entries(status?.departments || {}).map(([dept, info]: [string, any]) => (
                <div
                  key={dept}
                  className="p-4 border rounded space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="capitalize font-medium">{dept}</span>
                    <div className="flex space-x-2">
                      <Badge variant={getStatusColor(info.status)}>
                        {info.status}
                      </Badge>
                      {info.circuitBreakerMetrics && (
                        <Badge variant={getCircuitStateColor(info.circuitBreakerMetrics.state)}>
                          Circuit: {info.circuitBreakerMetrics.state}
                        </Badge>
                      )}
                    </div>
                  </div>

                  {info.circuitBreakerMetrics && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Health Score</span>
                        <span>
                          {Math.max(0, 100 - (info.circuitBreakerMetrics.failureCount * 20))}%
                        </span>
                      </div>
                      <Progress 
                        value={Math.max(0, 100 - (info.circuitBreakerMetrics.failureCount * 20))} 
                        className="h-2"
                      />
                      <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                        <div>Failures: {info.circuitBreakerMetrics.failureCount}</div>
                        <div>Successes: {info.circuitBreakerMetrics.successCount}</div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
