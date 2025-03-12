import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";

interface WorkflowStep {
  id: string;
  name: string;
  department: string;
  status: "pending" | "in_progress" | "completed" | "failed";
  result?: any;
}

interface WorkflowVisualizerProps {
  workflowName: string;
  steps: WorkflowStep[];
  currentStepId?: string;
}

export function WorkflowVisualizer({
  workflowName,
  steps,
  currentStepId,
}: WorkflowVisualizerProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{workflowName} Workflow</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="relative">
            {/* Vertical line connecting steps */}
            <div className="absolute left-3 top-4 bottom-4 w-0.5 bg-muted-foreground/20" />

            {/* Steps */}
            <div className="space-y-6">
              {steps.map((step, index) => {
                const isCurrent = step.id === currentStepId;
                const isCompleted = step.status === "completed";
                const isFailed = step.status === "failed";

                return (
                  <div key={step.id} className="relative pl-8">
                    {/* Step indicator */}
                    <div
                      className={`absolute left-0 top-1 h-6 w-6 rounded-full flex items-center justify-center ${isCurrent ? "bg-primary" : isCompleted ? "bg-green-500" : isFailed ? "bg-red-500" : "bg-muted-foreground/20"}`}
                    >
                      {isCompleted ? (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="12"
                          height="12"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="text-white"
                        >
                          <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                      ) : isFailed ? (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="12"
                          height="12"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="text-white"
                        >
                          <line x1="18" y1="6" x2="6" y2="18"></line>
                          <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                      ) : (
                        <span className="text-xs text-white">{index + 1}</span>
                      )}
                    </div>

                    {/* Step content */}
                    <div
                      className={`${isCurrent ? "bg-muted p-3 rounded-md" : ""}`}
                    >
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium">{step.name}</h3>
                        <Badge
                          variant={
                            isCurrent
                              ? "default"
                              : isCompleted
                                ? "outline"
                                : isFailed
                                  ? "destructive"
                                  : "secondary"
                          }
                        >
                          {step.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        Department: {step.department}
                      </p>

                      {/* Step result (if completed) */}
                      {isCompleted && step.result && (
                        <div className="mt-2 text-sm bg-muted p-2 rounded-md">
                          <div className="font-medium">Result:</div>
                          <pre className="text-xs overflow-auto max-h-20">
                            {JSON.stringify(step.result, null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
