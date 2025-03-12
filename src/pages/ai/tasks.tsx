import { useState, useEffect } from "react";
import { TaskSubmission } from "@/components/ai/TaskSubmission";
import { TaskReview } from "@/components/ai/TaskReview";
import { AgentStatus } from "@/components/ai/AgentStatus";
import { WorkflowSelector } from "@/components/ai/WorkflowSelector";
import { WorkflowExecutor } from "@/components/ai/WorkflowExecutor";
import { Task } from "@/lib/ai/types";
import { aiService } from "@/lib/ai";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  MockDataProvider,
  useMockData,
} from "@/components/ai/MockDataProvider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function TasksContent() {
  const { tasks, updateTask, getTask } = useMockData();
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [selectedWorkflow, setSelectedWorkflow] = useState<any>(null);

  // Set the first task as selected for demo purposes
  useEffect(() => {
    if (tasks.length > 0 && !selectedTask) {
      setSelectedTask(tasks[0]);
    }
  }, [tasks]);

  const handleApprove = async (
    taskId: string,
    feedback: { comments: string; modifications?: any },
  ) => {
    updateTask(taskId, {
      status: "approved",
      humanFeedback: {
        approved: true,
        comments: feedback.comments,
        modifications: feedback.modifications || {},
      },
    });
    setSelectedTask(null);
  };

  const handleReject = async (
    taskId: string,
    feedback: { comments: string },
  ) => {
    updateTask(taskId, {
      status: "rejected",
      humanFeedback: {
        approved: false,
        comments: feedback.comments,
        modifications: {},
      },
    });
    setSelectedTask(null);
  };

  const handleWorkflowSelect = (workflow: any) => {
    setSelectedWorkflow(workflow);
  };

  const handleWorkflowComplete = (result: any) => {
    console.log("Workflow completed with result:", result);
    // You could store this in a history or display it
  };

  const handleWorkflowCancel = () => {
    setSelectedWorkflow(null);
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">AI Assistant</h1>

      <Tabs defaultValue="tasks">
        <TabsList className="mb-4">
          <TabsTrigger value="tasks">Custom Tasks</TabsTrigger>
          <TabsTrigger value="workflows">Workflows</TabsTrigger>
          <TabsTrigger value="status">System Status</TabsTrigger>
          <TabsTrigger value="history">Task History</TabsTrigger>
        </TabsList>

        <TabsContent
          value="tasks"
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          <TaskSubmission />

          {selectedTask && (
            <TaskReview
              task={selectedTask}
              onApprove={(feedback) => handleApprove(selectedTask.id, feedback)}
              onReject={(feedback) => handleReject(selectedTask.id, feedback)}
            />
          )}
        </TabsContent>

        <TabsContent value="workflows">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {!selectedWorkflow ? (
              <WorkflowSelector onSelect={handleWorkflowSelect} />
            ) : (
              <WorkflowExecutor
                workflow={selectedWorkflow}
                onComplete={handleWorkflowComplete}
                onCancel={handleWorkflowCancel}
              />
            )}

            {selectedTask && !selectedWorkflow && (
              <TaskReview
                task={selectedTask}
                onApprove={(feedback) =>
                  handleApprove(selectedTask.id, feedback)
                }
                onReject={(feedback) => handleReject(selectedTask.id, feedback)}
              />
            )}
          </div>
        </TabsContent>

        <TabsContent value="status">
          <AgentStatus />
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Task History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {tasks.map((task) => (
                  <div
                    key={task.id}
                    className={`p-4 border rounded-md cursor-pointer hover:bg-muted ${selectedTask?.id === task.id ? "bg-muted" : ""}`}
                    onClick={() => setSelectedTask(task)}
                  >
                    <div className="flex justify-between items-center">
                      <h3 className="font-medium">{task.type}</h3>
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${task.status === "completed" || task.status === "approved" ? "bg-green-100 text-green-800" : task.status === "rejected" ? "bg-red-100 text-red-800" : "bg-blue-100 text-blue-800"}`}
                      >
                        {task.status}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      Departments: {task.departments.join(", ")}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Created: {new Date(task.created_at).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default function AITasks() {
  return (
    <MockDataProvider>
      <TasksContent />
    </MockDataProvider>
  );
}
