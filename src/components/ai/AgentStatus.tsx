import { useQuery } from '@tanstack/react-query';
import { AIService } from '@/lib/ai';

interface AgentStatus {
  manager: {
    status: string;
    load: number;
    errorRate: number;
    uptime: number;
  };
  departments: Array<{
    id: string;
    name: string;
    agentCount: number;
    performance: number;
  }>;
}

export function AgentStatusComponent() {
  const { data: status } = useQuery<AgentStatus>({
    queryKey: ['agent-status'],
    queryFn: async () => {
      const aiService = new AIService();
      const insights = await aiService.getAgentInsights();
      
      return {
        manager: {
          status: insights.systemStatus,
          load: insights.currentLoad,
          errorRate: insights.errorRate,
          uptime: insights.uptime
        },
        departments: insights.departments.map(dept => ({
          id: dept.id,
          name: dept.name,
          agentCount: dept.activeAgents,
          performance: dept.performanceScore
        }))
      };
    }
  });

  if (!status) return null;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 grid-cols-4">
        <StatusCard 
          title="System Status" 
          value={status.manager.status} 
          type={status.manager.status.toLowerCase()}
        />
        <StatusCard 
          title="Current Load" 
          value={`${Math.round(status.manager.load)}%`}
        />
        <StatusCard 
          title="Error Rate" 
          value={`${Math.round(status.manager.errorRate)}%`}
        />
        <StatusCard 
          title="Uptime" 
          value={`${Math.round(status.manager.uptime)}%`}
        />
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-medium">Department Status</h3>
        <div className="grid gap-4 grid-cols-3">
          {status.departments.map(dept => (
            <DepartmentCard
              key={dept.id}
              name={dept.name}
              agentCount={dept.agentCount}
              performance={dept.performance}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

interface StatusCardProps {
  title: string;
  value: string;
  type?: string;
}

function StatusCard({ title, value, type }: StatusCardProps) {
  const getStatusColor = (type?: string) => {
    switch (type) {
      case 'healthy':
        return 'text-green-500';
      case 'warning':
        return 'text-yellow-500';
      case 'error':
        return 'text-red-500';
      default:
        return 'text-foreground';
    }
  };

  return (
    <div className="p-4 bg-card rounded-lg">
      <h4 className="text-sm font-medium text-muted-foreground">{title}</h4>
      <p className={`text-2xl font-bold ${type ? getStatusColor(type) : ''}`}>
        {value}
      </p>
    </div>
  );
}

interface DepartmentCardProps {
  name: string;
  agentCount: number;
  performance: number;
}

function DepartmentCard({ name, agentCount, performance }: DepartmentCardProps) {
  return (
    <div className="p-4 bg-card rounded-lg">
      <h4 className="text-sm font-medium text-muted-foreground">{name}</h4>
      <div className="mt-2 space-y-1">
        <p className="text-sm">Agents: {agentCount}</p>
        <p className="text-sm">Performance: {Math.round(performance)}%</p>
      </div>
    </div>
  );
}
