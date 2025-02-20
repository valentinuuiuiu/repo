import { useState } from "react";
import { TaskSubmission } from "@/components/ai/TaskSubmission";
import { TaskReview } from "@/components/ai/TaskReview";
import { AgentStatus } from "@/components/ai/AgentStatus";
import { Task } from "@/lib/ai/types";
import { aiService } from "@/lib/ai";

export default function AITasks() {
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const handleApprove = async (
    taskId: string,
    feedback: { comments: string; modifications?: any },
  ) => {
    await aiService.manager.updateTaskStatus(taskId, "approved", {
      approved: true,
      comments: feedback.comments,
      modifications: feedback.modifications,
    });
    setSelectedTask(null);
  };

  const handleReject = async (
    taskId: string,
    feedback: { comments: string },
  ) => {
    await aiService.manager.updateTaskStatus(taskId, "rejected", {
      approved: false,
      comments: feedback.comments,
      modifications: null,
    });
    setSelectedTask(null);
  };

  return (
    <div className="container mx-auto p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-6">
          <AgentStatus />
          <TaskSubmission />
        </div>

        {selectedTask && (
          <TaskReview
            task={selectedTask}
            onApprove={(feedback) => handleApprove(selectedTask.id, feedback)}
            onReject={(feedback) => handleReject(selectedTask.id, feedback)}
          />
        )}
      </div>
    </div>
  );
}
