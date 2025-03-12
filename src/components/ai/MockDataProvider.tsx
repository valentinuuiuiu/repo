import React, { createContext, useContext, useState } from "react";
import { Task } from "@/lib/ai/types";

interface MockDataContextType {
  tasks: Task[];
  addTask: (task: Task) => void;
  updateTask: (taskId: string, updates: Partial<Task>) => void;
  getTask: (taskId: string) => Task | undefined;
}

const MockDataContext = createContext<MockDataContextType | undefined>(
  undefined,
);

// Sample mock tasks
const initialTasks: Task[] = [
  {
    id: "task-1",
    type: "product_optimization",
    departments: ["product", "marketing"],
    data: {
      productId: "prod-123",
      title: "Wireless Earbuds",
      currentPrice: 79.99,
    },
    status: "needs_review",
    result: {
      recommendedPrice: 89.99,
      pricingStrategy: "Premium positioning with occasional promotions",
      marketingRecommendations: [
        "Highlight noise cancellation",
        "Target fitness enthusiasts",
      ],
    },
    created_at: new Date(Date.now() - 3600000),
    updated_at: new Date(),
  },
  {
    id: "task-2",
    type: "supplier_evaluation",
    departments: ["supplier", "inventory"],
    data: {
      supplierId: "sup-456",
      name: "ElectroTech Wholesale",
    },
    status: "completed",
    result: {
      reliabilityScore: 0.92,
      qualityScore: 4.7,
      recommendedActions: [
        "Negotiate better shipping rates",
        "Increase order volume",
      ],
    },
    created_at: new Date(Date.now() - 86400000),
    updated_at: new Date(Date.now() - 43200000),
  },
];

export const MockDataProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);

  const addTask = (task: Task) => {
    setTasks((prevTasks) => [...prevTasks, task]);
  };

  const updateTask = (taskId: string, updates: Partial<Task>) => {
    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.id === taskId
          ? { ...task, ...updates, updated_at: new Date() }
          : task,
      ),
    );
  };

  const getTask = (taskId: string) => {
    return tasks.find((task) => task.id === taskId);
  };

  return (
    <MockDataContext.Provider value={{ tasks, addTask, updateTask, getTask }}>
      {children}
    </MockDataContext.Provider>
  );
};

export const useMockData = () => {
  const context = useContext(MockDataContext);
  if (context === undefined) {
    throw new Error("useMockData must be used within a MockDataProvider");
  }
  return context;
};
