import { useState } from "react";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Checkbox } from "../ui/checkbox";
import { TaskType } from "@/lib/ai/types";
import { aiService } from "@/lib/ai";

const TASK_TYPES: { value: TaskType; label: string }[] = [
  { value: "product_optimization", label: "Product Optimization" },
  { value: "product_launch", label: "Product Launch" },
  { value: "marketing_strategy", label: "Marketing Strategy" },
  { value: "inventory_forecast", label: "Inventory Forecast" },
  // Add more task types
];

const DEPARTMENTS = [
  { value: "product", label: "Product" },
  { value: "marketing", label: "Marketing" },
  { value: "inventory", label: "Inventory" },
  { value: "supplier", label: "Supplier" },
  { value: "customerService", label: "Customer Service" },
];

export function TaskSubmission() {
  const [taskType, setTaskType] = useState<TaskType>("product_optimization");
  const [departments, setDepartments] = useState<string[]>([]);
  const [data, setData] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await aiService.executeTask({
        type: taskType,
        departments,
        data: JSON.parse(data),
      });
      console.log("Task submitted:", result);
    } catch (error) {
      console.error("Error submitting task:", error);
    }
    setLoading(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Submit AI Task</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Task Type</Label>
            <Select
              value={taskType}
              onValueChange={(value) => setTaskType(value as TaskType)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select task type" />
              </SelectTrigger>
              <SelectContent>
                {TASK_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Departments</Label>
            <div className="grid grid-cols-2 gap-2">
              {DEPARTMENTS.map((dept) => (
                <div key={dept.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={dept.value}
                    checked={departments.includes(dept.value)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setDepartments([...departments, dept.value]);
                      } else {
                        setDepartments(
                          departments.filter((d) => d !== dept.value),
                        );
                      }
                    }}
                  />
                  <Label htmlFor={dept.value}>{dept.label}</Label>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Task Data (JSON)</Label>
            <Textarea
              value={data}
              onChange={(e) => setData(e.target.value)}
              placeholder='{"key": "value"}'
              className="font-mono"
              rows={5}
            />
          </div>

          <Button type="submit" disabled={loading}>
            {loading ? "Submitting..." : "Submit Task"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
