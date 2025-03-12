import { useState, useEffect } from "react";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { WorkflowVisualizer } from "./WorkflowVisualizer";
import { aiService } from "@/lib/ai";

interface WorkflowExecutorProps {
  workflow: {
    id: string;
    name: string;
    description: string;
    departments: string[];
  };
  onComplete?: (result: any) => void;
  onCancel?: () => void;
}

interface WorkflowStep {
  id: string;
  name: string;
  department: string;
  status: "pending" | "in_progress" | "completed" | "failed";
  taskType: string;
  data: any;
  result?: any;
}

export function WorkflowExecutor({
  workflow,
  onComplete,
  onCancel,
}: WorkflowExecutorProps) {
  const [steps, setSteps] = useState<WorkflowStep[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [isComplete, setIsComplete] = useState<boolean>(false);
  const [result, setResult] = useState<any>(null);

  // Initialize workflow steps based on workflow type
  useEffect(() => {
    let workflowSteps: WorkflowStep[] = [];

    switch (workflow.id) {
      case "product-launch":
        workflowSteps = [
          {
            id: "step1",
            name: "Product Optimization",
            department: "product",
            status: "pending",
            taskType: "product_optimization",
            data: {},
          },
          {
            id: "step2",
            name: "Marketing Strategy",
            department: "marketing",
            status: "pending",
            taskType: "marketing_strategy",
            data: {},
          },
          {
            id: "step3",
            name: "Inventory Planning",
            department: "inventory",
            status: "pending",
            taskType: "inventory_forecast",
            data: {},
          },
          {
            id: "step4",
            name: "Launch Plan",
            department: "product",
            status: "pending",
            taskType: "product_launch",
            data: {},
          },
        ];
        break;

      case "order-fulfillment":
        workflowSteps = [
          {
            id: "step1",
            name: "Supplier Selection",
            department: "supplier",
            status: "pending",
            taskType: "supplier_evaluation",
            data: {},
          },
          {
            id: "step2",
            name: "Order Routing",
            department: "inventory",
            status: "pending",
            taskType: "inventory_forecast",
            data: {},
          },
          {
            id: "step3",
            name: "Customer Communication",
            department: "customerService",
            status: "pending",
            taskType: "customer_inquiry",
            data: {},
          },
        ];
        break;

      // Add more workflow types here

      default:
        workflowSteps = [
          {
            id: "step1",
            name: "Analysis",
            department: workflow.departments[0] || "product",
            status: "pending",
            taskType: "product_optimization",
            data: {},
          },
        ];
    }

    setSteps(workflowSteps);
  }, [workflow]);

  // Execute the current step
  const executeCurrentStep = async () => {
    if (currentStepIndex >= steps.length) {
      setIsComplete(true);
      setIsRunning(false);
      return;
    }

    const currentStep = steps[currentStepIndex];

    // Update step status to in_progress
    setSteps((prevSteps) => {
      const newSteps = [...prevSteps];
      newSteps[currentStepIndex] = {
        ...newSteps[currentStepIndex],
        status: "in_progress",
      };
      return newSteps;
    });

    try {
      // Prepare data for the current step
      let stepData = { ...currentStep.data };

      // If not the first step, include results from previous steps
      if (currentStepIndex > 0) {
        for (let i = 0; i < currentStepIndex; i++) {
          stepData[`${steps[i].name.toLowerCase().replace(" ", "_")}_result`] =
            steps[i].result;
        }
      }

      // Execute the AI task
      const taskResult = await aiService.executeTask({
        type: currentStep.taskType,
        departments: [currentStep.department],
        data: stepData,
      });

      // Update step with result
      setSteps((prevSteps) => {
        const newSteps = [...prevSteps];
        newSteps[currentStepIndex] = {
          ...newSteps[currentStepIndex],
          status: "completed",
          result: taskResult.result,
        };
        return newSteps;
      });

      // Move to next step
      setCurrentStepIndex((prevIndex) => prevIndex + 1);

      // If this was the last step, set workflow as complete
      if (currentStepIndex === steps.length - 1) {
        setIsComplete(true);
        setIsRunning(false);

        // Compile final result
        const finalResult = steps.reduce((result, step) => {
          result[step.name.toLowerCase().replace(" ", "_")] = step.result;
          return result;
        }, {});

        setResult(finalResult);
        onComplete?.(finalResult);
      }
    } catch (error) {
      console.error("Error executing step:", error);

      // Mark step as failed
      setSteps((prevSteps) => {
        const newSteps = [...prevSteps];
        newSteps[currentStepIndex] = {
          ...newSteps[currentStepIndex],
          status: "failed",
        };
        return newSteps;
      });

      setIsRunning(false);
    }
  };

  // Start or continue workflow execution
  const runWorkflow = () => {
    setIsRunning(true);
    executeCurrentStep();
  };

  // Effect to continue workflow when a step completes
  useEffect(() => {
    if (isRunning && !isComplete && currentStepIndex < steps.length) {
      executeCurrentStep();
    }
  }, [currentStepIndex, isRunning]);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Executing: {workflow.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4">{workflow.description}</p>

          <div className="flex space-x-2">
            {!isRunning && !isComplete && (
              <Button onClick={runWorkflow}>Start Workflow</Button>
            )}

            {isRunning && (
              <Button variant="outline" onClick={() => setIsRunning(false)}>
                Pause
              </Button>
            )}

            {!isRunning && currentStepIndex > 0 && !isComplete && (
              <Button onClick={runWorkflow}>Continue</Button>
            )}

            <Button variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>

      <WorkflowVisualizer
        workflowName={workflow.name}
        steps={steps}
        currentStepId={
          isRunning && !isComplete ? steps[currentStepIndex]?.id : undefined
        }
      />

      {isComplete && result && (
        <Card>
          <CardHeader>
            <CardTitle>Workflow Result</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-muted p-4 rounded-md overflow-auto max-h-60 text-xs">
              {JSON.stringify(result, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
