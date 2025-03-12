import { useState } from "react";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Label } from "../ui/label";

type Workflow = {
  id: string;
  name: string;
  description: string;
  departments: string[];
};

const WORKFLOWS: Workflow[] = [
  {
    id: "product-launch",
    name: "Product Launch",
    description:
      "Launch a new product with optimized listing, pricing, and marketing strategy",
    departments: ["product", "marketing", "inventory", "supplier"],
  },
  {
    id: "order-fulfillment",
    name: "Order Fulfillment",
    description: "Process and optimize fulfillment for a new customer order",
    departments: ["inventory", "supplier", "customerService"],
  },
  {
    id: "supplier-optimization",
    name: "Supplier Optimization",
    description:
      "Analyze and optimize your supplier network for better performance",
    departments: ["supplier", "inventory", "product"],
  },
  {
    id: "market-analysis",
    name: "Market Analysis",
    description: "Analyze market trends and identify new product opportunities",
    departments: ["marketing", "product"],
  },
  {
    id: "customer-feedback",
    name: "Customer Feedback Analysis",
    description:
      "Analyze customer reviews and feedback to improve products and service",
    departments: ["customerService", "product"],
  },
];

interface WorkflowSelectorProps {
  onSelect: (workflow: Workflow) => void;
}

export function WorkflowSelector({ onSelect }: WorkflowSelectorProps) {
  const [selectedWorkflow, setSelectedWorkflow] = useState<string>("");

  const handleSelect = () => {
    const workflow = WORKFLOWS.find((w) => w.id === selectedWorkflow);
    if (workflow) {
      onSelect(workflow);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>AI Workflows</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Select Workflow</Label>
          <Select value={selectedWorkflow} onValueChange={setSelectedWorkflow}>
            <SelectTrigger>
              <SelectValue placeholder="Choose a workflow" />
            </SelectTrigger>
            <SelectContent>
              {WORKFLOWS.map((workflow) => (
                <SelectItem key={workflow.id} value={workflow.id}>
                  {workflow.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {selectedWorkflow && (
          <div className="space-y-4">
            <div className="p-4 bg-muted rounded-md">
              <h3 className="font-medium mb-2">
                {WORKFLOWS.find((w) => w.id === selectedWorkflow)?.name}
              </h3>
              <p className="text-sm text-muted-foreground mb-2">
                {WORKFLOWS.find((w) => w.id === selectedWorkflow)?.description}
              </p>
              <div className="flex flex-wrap gap-1">
                {WORKFLOWS.find(
                  (w) => w.id === selectedWorkflow,
                )?.departments.map((dept) => (
                  <span
                    key={dept}
                    className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full"
                  >
                    {dept}
                  </span>
                ))}
              </div>
            </div>

            <Button onClick={handleSelect}>Start Workflow</Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
