import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import { Checkbox } from "../ui/checkbox";
import { TaskType } from "@/lib/ai/types";

const DEPARTMENTS = [
  { id: "product", label: "Product" },
  { id: "supplier", label: "Supplier" },
  { id: "marketing", label: "Marketing" },
  { id: "inventory", label: "Inventory" },
  { id: "customerService", label: "Customer Service" },
  { id: "marketResearch", label: "Market Research" }
];

const TASK_TYPES: { value: TaskType; label: string }[] = [
  { value: "product_optimization", label: "Product Optimization" },
  { value: "market_analysis", label: "Market Analysis" },
  { value: "customer_inquiry", label: "Customer Inquiry" },
  { value: "inventory_forecast", label: "Inventory Forecast" },
  { value: "supplier_evaluation", label: "Supplier Evaluation" },
  { value: "code_maintenance", label: "Code Maintenance" }
];

export function TaskSubmission() {
  const [selectedDepartments, setSelectedDepartments] = useState<string[]>([]);
  const [taskType, setTaskType] = useState<TaskType>("product_optimization");
  const [taskData, setTaskData] = useState("");
  const [priority, setPriority] = useState<"low" | "medium" | "high">("medium");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      
      // Reset form on success
      setSelectedDepartments([]);
      setTaskData("");
      
      // Optionally trigger a notification or callback
    } catch (error) {
      console.error("Task submission failed:", error);
      // Handle error state
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Submit New Task</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <label className="block text-sm font-medium">Task Type</label>
            <select
              value={taskType}
              onChange={(e) => setTaskType(e.target.value as TaskType)}
              className="w-full p-2 border rounded"
            >
              {TASK_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-4">
            <label className="block text-sm font-medium">Priority</label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as "low" | "medium" | "high")}
              className="w-full p-2 border rounded"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>

          <div className="space-y-4">
            <label className="block text-sm font-medium">Departments</label>
            <div className="grid grid-cols-2 gap-4">
              {DEPARTMENTS.map((department) => (
                <div key={department.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={department.id}
                    checked={selectedDepartments.includes(department.id)}
                    onCheckedChange={(checked: any) => {
                      if (checked) {
                        setSelectedDepartments([...selectedDepartments, department.id]);
                      } else {
                        setSelectedDepartments(
                          selectedDepartments.filter((d) => d !== department.id)
                        );
                      }
                    }}
                  />
                  <label htmlFor={department.id}>{department.label}</label>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <label className="block text-sm font-medium">Task Data (JSON)</label>
            <Textarea
              value={taskData}
              onChange={(e) => setTaskData(e.target.value)}
              placeholder="Enter task data in JSON format"
              className="h-32"
            />
          </div>

          <Button type="submit" disabled={isSubmitting || !selectedDepartments.length}>
            {isSubmitting ? "Submitting..." : "Submit Task"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
