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
import { Loader2 } from "lucide-react";

const TASK_TYPES: { value: TaskType; label: string }[] = [
  { value: "product_optimization", label: "Product Optimization" },
  { value: "product_launch", label: "Product Launch" },
  { value: "marketing_strategy", label: "Marketing Strategy" },
  { value: "inventory_forecast", label: "Inventory Forecast" },
  { value: "supplier_evaluation", label: "Supplier Evaluation" },
  { value: "customer_inquiry", label: "Customer Inquiry" },
  { value: "product_pricing", label: "Product Pricing" },
  { value: "supplier_risk_assessment", label: "Supplier Risk Assessment" },
  { value: "satisfaction_analysis", label: "Customer Satisfaction Analysis" },
];

const DEPARTMENTS = [
  { value: "product", label: "Product" },
  { value: "marketing", label: "Marketing" },
  { value: "inventory", label: "Inventory" },
  { value: "supplier", label: "Supplier" },
  { value: "customerService", label: "Customer Service" },
];

// Sample data templates for different task types in dropshipping context
const DATA_TEMPLATES: Record<TaskType, string> = {
  product_optimization: JSON.stringify(
    {
      productId: "prod-123",
      title: "Wireless Earbuds",
      currentPrice: 79.99,
      costPrice: 32.5,
      supplierPrice: 45.99,
      shippingTime: "3-5 days",
      competitorPrices: [69.99, 89.99, 74.99],
      supplierRating: 4.5,
      platform: "Shopify",
      storeCategory: "Electronics",
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
      supplierPrice: 45.99,
      shippingCost: 5.99,
      supplier: "TechSupplies Inc",
      supplierRating: 4.8,
      estimatedDeliveryTime: "4-7 days",
      targetPlatforms: ["Shopify", "WooCommerce"],
    },
    null,
    2,
  ),
  marketing_strategy: JSON.stringify(
    {
      productId: "prod-123",
      title: "Wireless Earbuds",
      targetAudience: "Tech enthusiasts, 25-45 years old",
      budget: 5000,
      channels: ["Instagram", "Facebook", "TikTok", "Google Ads"],
      currentConversionRate: 2.8,
      averageOrderValue: 85.5,
      shippingPolicy: "Free shipping on orders over $50",
      competitorAnalysis: [
        {
          name: "TechGadgets",
          strengths: "Lower prices",
          weaknesses: "Slower shipping",
        },
        {
          name: "PremiumAudio",
          strengths: "Brand recognition",
          weaknesses: "Higher prices",
        },
      ],
    },
    null,
    2,
  ),
  inventory_forecast: JSON.stringify(
    {
      product: {
        productId: "prod-123",
        title: "Wireless Earbuds",
        currentStock: 150,
        supplier: "ElectroTech Wholesale",
        supplierLeadTime: 10,
      },
      historicalSales: [120, 145, 135, 160],
      seasonalTrends: {
        q4: "High demand (+30%)",
        q1: "Moderate demand",
        q2: "Lower demand (-15%)",
        q3: "Moderate demand",
      },
      platformSyncStatus: "Connected to Shopify",
      lowStockThreshold: 50,
    },
    null,
    2,
  ),
  supplier_evaluation: JSON.stringify(
    {
      supplier: {
        supplierId: "sup-456",
        name: "ElectroTech Wholesale",
        products: ["Wireless Earbuds", "Smart Watches", "Bluetooth Speakers"],
        location: "Shenzhen, China",
        shippingMethods: ["ePacket", "DHL", "FedEx"],
        minimumOrderQuantity: 1,
      },
      orders: [
        {
          id: "ord-101",
          date: "2023-10-15",
          status: "completed",
          shippingTime: "4 days",
        },
        {
          id: "ord-102",
          date: "2023-11-01",
          status: "completed",
          shippingTime: "5 days",
        },
        {
          id: "ord-103",
          date: "2023-11-15",
          status: "processing",
          shippingTime: null,
        },
      ],
      competitorSuppliers: [
        {
          name: "QuickShip Electronics",
          rating: 4.3,
          averageShippingTime: "3-4 days",
        },
        {
          name: "GlobalTech Wholesale",
          rating: 4.6,
          averageShippingTime: "5-7 days",
        },
      ],
    },
    null,
    2,
  ),
  customer_inquiry: JSON.stringify(
    {
      inquiry: "When will my order arrive? I placed it 3 days ago.",
      customer: {
        customerId: "cust-789",
        name: "John Smith",
        email: "john@example.com",
        orderCount: 3,
        lifetimeValue: 245.97,
      },
      order: {
        id: "ord-101",
        date: "2023-11-10",
        status: "processing",
        items: ["Wireless Earbuds", "Phone Case"],
        total: 99.98,
        supplier: "ElectroTech Wholesale",
        trackingNumber: null,
        estimatedDelivery: "Nov 18-22",
      },
      platform: "Shopify",
    },
    null,
    2,
  ),
  product_pricing: JSON.stringify(
    {
      productId: "prod-123",
      title: "Wireless Earbuds",
      currentPrice: 79.99,
      supplierPrice: 32.5,
      shippingCost: 4.99,
      platformFees: 3.5,
      advertisingCostPerSale: 8.25,
      competitorPrices: [69.99, 89.99, 74.99],
      targetMargin: 0.4,
      marketPosition: "mid-range",
      pricingRules: {
        minimumMargin: 0.3,
        roundingStrategy: "0.99",
      },
    },
    null,
    2,
  ),
  supplier_risk_assessment: JSON.stringify(
    {
      supplier: {
        supplierId: "sup-456",
        name: "ElectroTech Wholesale",
        rating: 4.2,
        status: "active",
        location: "Shenzhen, China",
        yearsInBusiness: 5,
        productCategories: ["Electronics", "Mobile Accessories"],
        exclusivityAgreement: false,
      },
      orders: [
        {
          date: "2023-10-15",
          status: "completed",
          fulfillmentStatus: "on_time",
          qualityIssues: 0,
        },
        {
          date: "2023-11-01",
          status: "completed",
          fulfillmentStatus: "delayed",
          qualityIssues: 1,
        },
        {
          date: "2023-11-15",
          status: "processing",
          fulfillmentStatus: "pending",
          qualityIssues: 0,
        },
      ],
      alternativeSuppliers: [
        { name: "QuickShip Electronics", rating: 4.3, productOverlap: "80%" },
        { name: "GlobalTech Wholesale", rating: 4.6, productOverlap: "65%" },
      ],
      seasonalFactors: "Chinese New Year (Jan-Feb) may cause shipping delays",
    },
    null,
    2,
  ),
  satisfaction_analysis: JSON.stringify(
    {
      customer: {
        customerId: "cust-789",
        name: "John Smith",
        email: "john@example.com",
        registrationDate: "2023-08-15",
        totalOrders: 5,
        totalSpent: 389.95,
        averageOrderValue: 77.99,
      },
      orders: [
        {
          id: "ord-101",
          date: "2023-08-20",
          status: "completed",
          deliveryTime: "6 days",
        },
        {
          id: "ord-102",
          date: "2023-09-15",
          status: "completed",
          deliveryTime: "5 days",
        },
        {
          id: "ord-103",
          date: "2023-10-10",
          status: "completed",
          deliveryTime: "7 days",
        },
        {
          id: "ord-104",
          date: "2023-11-01",
          status: "completed",
          deliveryTime: "4 days",
        },
        {
          id: "ord-105",
          date: "2023-11-20",
          status: "processing",
          deliveryTime: null,
        },
      ],
      reviews: [
        {
          orderId: "ord-101",
          text: "Great product but shipping was slower than expected",
          rating: 4,
        },
        {
          orderId: "ord-102",
          text: "Excellent quality, would buy again",
          rating: 5,
        },
        {
          orderId: "ord-103",
          text: "Product matches description perfectly",
          rating: 5,
        },
        {
          orderId: "ord-104",
          text: "Fast shipping this time, very satisfied",
          rating: 5,
        },
      ],
      customerServiceInteractions: [
        {
          date: "2023-08-25",
          topic: "Shipping delay",
          resolution: "Provided tracking update",
        },
        {
          date: "2023-10-15",
          topic: "Product question",
          resolution: "Answered within 2 hours",
        },
      ],
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
    setData(DATA_TEMPLATES[newType] || DATA_TEMPLATES.product_optimization);

    // Set default departments based on task type
    switch (newType) {
      case "product_optimization":
      case "product_launch":
      case "product_pricing":
        setDepartments(["product"]);
        break;
      case "marketing_strategy":
        setDepartments(["marketing"]);
        break;
      case "inventory_forecast":
        setDepartments(["inventory"]);
        break;
      case "supplier_evaluation":
      case "supplier_risk_assessment":
        setDepartments(["supplier"]);
        break;
      case "customer_inquiry":
      case "satisfaction_analysis":
        setDepartments(["customerService"]);
        break;
      default:
        setDepartments(["product"]);
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

      // Use the AI service to process the task
      const result = await aiService.executeTask({
        type: taskType,
        departments,
        data: parsedData,
      });

      // Add the task to our mock data
      addTask(result);

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
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              "Submit Task"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
