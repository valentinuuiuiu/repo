import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import { Badge } from "../ui/badge";
import { aiService } from "@/lib/ai";
import { TaskValidator, Task } from "@/lib/ai/core/TaskValidator";

const taskValidator = new TaskValidator();

export interface Task {
  id: string;
  type: string;
  departments: string[];
  created_at: string;
  status: string;
}

interface TaskReviewFeedback {
  comments: string;
  modifications?: unknown;
}

export function TaskReview() {
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string>("");

  const { data: tasks, refetch } = useQuery({
    queryKey: ["pending-tasks"],
    queryFn: async () => {
      const allTasks = await aiService.manager.listTasks();
      return (allTasks as Task[]).filter(task => task.status === "needs_review");
    }
  });

  const { data: validationReport, isLoading: validating } = useQuery({
    queryKey: ["task-validation", selectedTaskId],
    queryFn: async () => {
      if (!selectedTaskId) return null;
      const task = tasks?.find(t => t.id === selectedTaskId);
      if (!task) return null;
      return await taskValidator.generateValidationReport(task);
    },
    enabled: !!selectedTaskId
  });

  const handleApprove = async () => {
    if (!selectedTaskId) return;
    await aiService.manager.updateTaskStatus(selectedTaskId, "completed", feedback);
    setSelectedTaskId(null);
    setFeedback("");
    refetch();
  };

  const handleReject = async () => {
    if (!selectedTaskId) return;
    await aiService.manager.updateTaskStatus(selectedTaskId, "failed", feedback);
    setSelectedTaskId(null);
    setFeedback("");
    refetch();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Task Review Queue</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Task List */}
          <div className="space-y-2">
            {tasks?.map((task) => (
              <div
                key={task.id}
                className={`p-4 border rounded cursor-pointer ${
                  selectedTaskId === task.id ? "border-primary" : ""
                }`}
                onClick={() => setSelectedTaskId(task.id)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium capitalize">
                      {task.type.replace(/_/g, " ")}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Departments: {task.departments.join(", ")}
                    </p>
                  </div>
                  <Badge>{new Date(task.created_at).toLocaleDateString()}</Badge>
                </div>
              </div>
            ))}
          </div>

          {/* Validation Report */}
          {selectedTaskId && validationReport && (
            <div className="space-y-2">
              <h3 className="font-medium">Automated Validation</h3>
              <pre className="p-4 bg-muted rounded text-sm whitespace-pre-wrap">
                {validationReport}
              </pre>
            </div>
          )}

          {/* Review Form */}
          {selectedTaskId && (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Feedback</label>
                <Textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Enter your feedback..."
                  className="h-32"
                />
              </div>

              <div className="flex space-x-2">
                <Button onClick={handleApprove} className="flex-1">
                  Approve
                </Button>
                <Button onClick={handleReject} variant="destructive" className="flex-1">
                  Reject
                </Button>
              </div>
            </div>
          )}

          {tasks?.length === 0 && (
            <p className="text-center text-muted-foreground">
              No tasks waiting for review
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
