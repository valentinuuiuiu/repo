import { useQuery } from '@tanstack/react-query';
import { AIService } from '@/lib/ai';
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { Badge } from "../ui/badge";
import { Progress } from "../ui/progress";
import { CircleSlash, AlertTriangle, CheckCircle2 } from "lucide-react";

interface HealthMetrics {
  uptime: number;
  activeAgents: number;
  totalAgents: number;
  recoverySuccessRate: number;
  errorRate: number;
  averageResponseTime: number;
  recentRecoveries: Array<{
    success: boolean;
    agentName: string;
    strategy: string;
    timestamp: string;
  }>;
  agentHealth: Array<{
    name: string;
    status: string;
    recoveryAttempts: number;
    healthScore: number;
    lastIncidentTime: string | null;
    recoverySuccessRate: number;
  }>;
}

const mapToHealthMetrics = (metrics: any): HealthMetrics => ({
  uptime: metrics.uptime || 0,
  activeAgents: metrics.activeAgents || 0,
  totalAgents: metrics.totalAgents || 0,
  recoverySuccessRate: metrics.recoveryRate || 0,
  errorRate: metrics.errorRate || 0,
  averageResponseTime: metrics.responseTime || 0,
  recentRecoveries: metrics.recentRecoveries || [],
  agentHealth: metrics.agentHealth || []
});

export function AgentHealthMonitor() {
  const { data: healthMetrics } = useQuery<HealthMetrics>({
    queryKey: ['agent-health'],
    queryFn: async () => {
      const aiService = new AIService();
      const rawMetrics = await aiService.getAgentMetrics();
      return mapToHealthMetrics(rawMetrics);
    },
    refetchInterval: 10000 // Refresh every 10 seconds
  });

  if (!healthMetrics) return null;

  const getHealthIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 'degraded':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'unhealthy':
        return <CircleSlash className="h-5 w-5 text-red-500" />;
      default:
        return null;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Agent Health Monitor</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* System Health Overview */}
          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 bg-muted rounded">
              <div className="text-sm font-medium mb-2">System Uptime</div>
              <div className="text-2xl font-bold">
                {Math.floor(healthMetrics.uptime / 3600)}h {Math.floor((healthMetrics.uptime % 3600) / 60)}m
              </div>
            </div>
            <div className="p-4 bg-muted rounded">
              <div className="text-sm font-medium mb-2">Active Agents</div>
              <div className="text-2xl font-bold">
                {healthMetrics.activeAgents}/{healthMetrics.totalAgents}
              </div>
            </div>
            <div className="p-4 bg-muted rounded">
              <div className="text-sm font-medium mb-2">Recovery Success</div>
              <div className="text-2xl font-bold">
                {(healthMetrics.recoverySuccessRate * 100).toFixed(1)}%
              </div>
            </div>
            <div className="p-4 bg-muted rounded">
              <div className="text-sm font-medium mb-2">Error Rate</div>
              <div className="text-2xl font-bold">
                {(healthMetrics.errorRate * 100).toFixed(1)}%
              </div>
            </div>
            <div className="p-4 bg-muted rounded">
              <div className="text-sm font-medium mb-2">Avg Response Time</div>
              <div className="text-2xl font-bold">
                {healthMetrics.averageResponseTime}ms
              </div>
            </div>
          </div>

          {/* Recent Recovery Actions */}
          <div className="space-y-4">
            <h3 className="font-medium">Recent Recovery Actions</h3>
            {healthMetrics.recentRecoveries.map((recovery, index) => (
              <Alert key={index} variant={recovery.success ? "default" : "destructive"}>
                <AlertTitle className="flex items-center gap-2">
                  {getHealthIcon(recovery.success ? 'healthy' : 'unhealthy')}
                  {recovery.agentName}
                </AlertTitle>
                <AlertDescription className="mt-2 space-y-2">
                  <div className="text-sm">
                    Strategy: {recovery.strategy}
                  </div>
                  <div className="text-sm">
                    {new Date(recovery.timestamp).toLocaleTimeString()}
                  </div>
                </AlertDescription>
              </Alert>
            ))}
          </div>

          {/* Agent Health Status */}
          <div className="space-y-4">
            <h3 className="font-medium">Agent Health Status</h3>
            <div className="grid gap-4">
              {healthMetrics.agentHealth.map((agent) => (
                <div key={agent.name} className="p-4 border rounded space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getHealthIcon(agent.status)}
                      <span className="font-medium">{agent.name}</span>
                    </div>
                    <Badge variant={agent.status === 'healthy' ? 'default' : 'secondary'}>
                      {agent.recoveryAttempts} recoveries
                    </Badge>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Health Score</span>
                      <span>{agent.healthScore}%</span>
                    </div>
                    <Progress value={agent.healthScore} className="h-2" />
                    
                    <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                      <div>Last Incident: {agent.lastIncidentTime ? new Date(agent.lastIncidentTime).toLocaleTimeString() : 'N/A'}</div>
                      <div>Recovery Success: {(agent.recoverySuccessRate * 100).toFixed(1)}%</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}