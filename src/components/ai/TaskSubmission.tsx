import { useState } from "react";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
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
import { useMockData } from "./MockDataProvider";
import { toast } from "@/components/ui/use-toast";

const TASK_TYPES: { value: TaskType; label: string }[] = [
  { value: "product_optimization", label: "Product Optimization" },
  { value: "product_launch", label: "Product Launch" },
  { value: "marketing_strategy", label: "Marketing Strategy" },
  { value: "inventory_forecast", label: "Inventory Forecast" },
  { value: "supplier_evaluation", label: "Supplier Evaluation" },
  { value: "customer_inquiry", label: "Customer Inquiry" },
];

const DEPARTMENTS = [
  { value: "product", label: "Product" },
  { value: "marketing", label: "Marketing" },
  { value: "inventory", label: "Inventory" },
  { value: "supplier", label: "Supplier" },
  { value: "customerService", label: "Customer Service" },
];

// Sample data templates for different task types
const DATA_TEMPLATES: Record<TaskType, string> = {
  product_optimization: JSON.stringify(
    {
      productId: "prod-123",
      title: "Wireless Earbuds",
      currentPrice: 79.99,
      costPrice: 32.5,
      competitorPrices: [69.99, 89.99, 74.99],
    },
    null,
    2,
  ),
  product_launch: JSON.stringify(
    {
      title: "Smart Fitness Watch",
      description:
        "Track your fitness with heart rate monitoring and sleep tracking",
      category: "Wearables",
      targetPrice: 89.99,
      costPrice: 45.99,
    },
    null,
    2,
  ),
  marketing_strategy: JSON.stringify(
    {
      productId: "prod-123",
      targetAudience: "Fitness enthusiasts, 25-45 years old",
      budget: 5000,
      channels: ["social media", "email", "influencers"],
    },
    null,
    2,
  ),
  inventory_forecast: JSON.stringify(
    {
      productId: "prod-123",
      currentStock: 150,
      historicalSales: [120, 145, 135, 160],
      leadTime: 14,
    },
    null,
    2,
  ),
  supplier_evaluation: JSON.stringify(
    {
      supplierId: "sup-456",
      name: "ElectroTech Wholesale",
      products: ["Wireless Earbuds", "Smart Watches"],
      orderHistory: [{ date: "2023-10-15", status: "completed" }],
    },
    null,
    2,
  ),
  customer_inquiry: JSON.stringify(
    {
      customerId: "cust-789",
      inquiry: "When will my order arrive?",
      orderId: "ord-101",
      orderDate: "2023-11-10",
    },
    null,
    2,
  ),
};

export function TaskSubmission() {
  const { addTask } = useMockData();
  const [taskType, setTaskType] = useState<TaskType>("product_optimization");
  const [departments, setDepartments] = useState<string[]>(["product"]);
  const [data, setData] = useState(DATA_TEMPLATES.product_optimization);
  const [loading, setLoading] = useState(false);

  // Update data template when task type changes
  const handleTaskTypeChange = (value: string) => {
    const newType = value as TaskType;
    setTaskType(newType);
    setData(DATA_TEMPLATES[newType]);

    // Set default departments based on task type
    switch (newType) {
      case "product_optimization":
      case "product_launch":
        setDepartments(["product"]);
        break;
      case "marketing_strategy":
        setDepartments(["marketing"]);
        break;
      case "inventory_forecast":
        setDepartments(["inventory"]);
        break;
      case "supplier_evaluation":
        setDepartments(["supplier"]);
        break;
      case "customer_inquiry":
        setDepartments(["customerService"]);
        break;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (departments.length === 0) {
      toast({
        title: "Error",
        description: "Please select at least one department",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      let parsedData;
      try {
        parsedData = JSON.parse(data);
      } catch (error) {
        toast({
          title: "Invalid JSON",
          description: "Please enter valid JSON data",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      // Create a new task with the mock data
      const newTask = {
        id: crypto.randomUUID(),
        type: taskType,
        departments,
        data: parsedData,
        status: "needs_review" as const,
        result: {
          // Mock result based on task type
          ...(taskType === "product_optimization"
            ? {
                recommendedPrice: parsedData.currentPrice * 1.15,
                pricingStrategy:
                  "Premium positioning with occasional promotions",
                marketingRecommendations: [
                  "Highlight quality",
                  "Target premium segment",
                ],
              }
            : {}),
          ...(taskType === "supplier_evaluation"
            ? {
                reliabilityScore: 0.92,
                qualityScore: 4.7,
                recommendedActions: [
                  "Negotiate better rates",
                  "Increase order volume",
                ],
              }
            : {}),
          analysis: `AI analysis for ${taskType} completed successfully`,
          recommendation: `Based on the data provided, we recommend proceeding with the ${taskType} strategy`,
        },
        created_at: new Date(),
        updated_at: new Date(),
      };

      // Add the task to our mock data
      addTask(newTask);

      toast({
        title: "Task Submitted",
        description: "Your task has been submitted for AI processing",
      });

      // Reset form
      setData(DATA_TEMPLATES[taskType]);
    } catch (error) {
      console.error("Error submitting task:", error);
      toast({
        title: "Error",
        description: "There was an error submitting your task",
        variant: "destructive",
      });
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
            <Select value={taskType} onValueChange={handleTaskTypeChange}>
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
              rows={10}
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
