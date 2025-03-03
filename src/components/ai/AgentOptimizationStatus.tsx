import { useQuery } from '@tanstack/react-query';
import { AIService } from '@/lib/ai';
import { Progress } from '@/components/ui/progress';
import { Card } from '@/components/ui/card';

interface OptimizationStatus {
  optimizationScore: number;
  suggestions: string[];
  metrics: {
    efficiency: number;
    reliability: number;
    performance: number;
  };
}

export function AgentOptimizationStatus() {
  const { data: status } = useQuery<OptimizationStatus>({
    queryKey: ['optimization-status'],
    queryFn: async () => {
      const aiService = new AIService();
      const status = await aiService.getSystemOptimizationStatus();
      return {
        optimizationScore: status.score,
        suggestions: status.improvements,
        metrics: status.metrics
      };
    }
  });

  if (!status) return null;

  return (
    <div className="space-y-6">
      <Card className="p-4">
        <h3 className="text-lg font-medium mb-4">System Optimization</h3>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between mb-2">
              <span>Overall Score</span>
              <span>{Math.round(status.optimizationScore)}%</span>
            </div>
            <Progress value={status.optimizationScore} />
          </div>
          
          <div className="grid gap-4 grid-cols-3">
            <MetricCard
              title="Efficiency"
              value={status.metrics.efficiency}
            />
            <MetricCard
              title="Reliability"
              value={status.metrics.reliability}
            />
            <MetricCard
              title="Performance"
              value={status.metrics.performance}
            />
          </div>
        </div>
      </Card>

      <Card className="p-4">
        <h3 className="text-lg font-medium mb-4">Optimization Suggestions</h3>
        <ul className="space-y-2">
          {status.suggestions.map((suggestion, i) => (
            <li key={i} className="flex items-start gap-2">
              <span className="text-blue-500">•</span>
              <span>{suggestion}</span>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}

interface MetricCardProps {
  title: string;
  value: number;
}

function MetricCard({ title, value }: MetricCardProps) {
  return (
    <div className="p-3 bg-muted rounded-lg">
      <h4 className="text-sm font-medium text-muted-foreground">{title}</h4>
      <p className="text-2xl font-bold">{Math.round(value)}%</p>
    </div>
  );
}