import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { cn } from '@/lib/utils';
import { AIService } from '@/lib/ai';
import type { Task } from '@/lib/ai/types';

interface TaskReviewProps {
  className?: string;
  children?: React.ReactNode;
}

export function TaskReview({ className, children }: TaskReviewProps) {
  const queryClient = useQueryClient();
  const aiService = new AIService();

  const { data: tasks, isLoading } = useQuery<Task[]>({
    queryKey: ['tasks'],
    queryFn: () => aiService.listAllTasks()
  });

  const approveMutation = useMutation({
    mutationFn: (taskId: string) => aiService.updateTaskStatus(taskId, 'completed'),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tasks'] })
  });

  const rejectMutation = useMutation({
    mutationFn: (taskId: string) => aiService.updateTaskStatus(taskId, 'failed'),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tasks'] })
  });

  if (isLoading) {
    return <div>Loading tasks...</div>;
  }

  return (
    <div className={cn("space-y-6", className)}>
      <div className="grid gap-4">
        {tasks?.map(task => (
          <TaskCard
            key={task.id}
            task={task}
            onApprove={() => approveMutation.mutate(task.id)}
            onReject={() => rejectMutation.mutate(task.id)}
          />
        ))}
      </div>
      {children}
    </div>
  );
}

interface TaskCardProps {
  task: Task;
  onApprove: () => void;
  onReject: () => void;
}

function TaskCard({ task, onApprove, onReject }: TaskCardProps) {
  const statusColors = {
    pending: "bg-yellow-100 text-yellow-800",
    in_progress: "bg-blue-100 text-blue-800",
    completed: "bg-green-100 text-green-800",
    failed: "bg-red-100 text-red-800",
    needs_review: "bg-purple-100 text-purple-800"
  };

  return (
    <div className="p-4 bg-card rounded-lg space-y-3">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-medium">{task.type}</h3>
          <p className="text-sm text-muted-foreground">{JSON.stringify(task.data)}</p>
        </div>
        <span className={cn("px-2 py-1 text-xs rounded-full", statusColors[task.status])}>
          {task.status}
        </span>
      </div>
      
      <div className="text-sm text-muted-foreground">
        <p>Departments: {task.departments.join(", ")}</p>
        <p>Created: {new Date(task.created_at).toLocaleDateString()}</p>
      </div>

      {task.status === 'pending' && (
        <div className="flex gap-2">
          <button
            onClick={onApprove}
            className="px-3 py-1 bg-green-500 text-white rounded-md text-sm hover:bg-green-600"
          >
            Approve
          </button>
          <button
            onClick={onReject}
            className="px-3 py-1 bg-red-500 text-white rounded-md text-sm hover:bg-red-600"
          >
            Reject
          </button>
        </div>
      )}
    </div>
  );
}
