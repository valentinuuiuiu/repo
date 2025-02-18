import { AgentManager } from "../AgentManager";
import { Task } from "../types";

describe("Agent System Tests", () => {
  let agentManager: AgentManager;

  beforeEach(() => {
    agentManager = new AgentManager();
  });

  test("Agent initialization", () => {
    const statuses = agentManager.getAllAgentStatuses();
    expect(Object.keys(statuses).length).toBeGreaterThan(0);
  });

  test("Task delegation", async () => {
    const task: Task = {
      id: "test-task-1",
      type: "product_optimization",
      priority: 1,
      data: {
        productId: "test-product-1",
        source: "alibaba",
      },
      requiredCapabilities: ["product_optimization", "pricing"],
    };

    const result = await agentManager.executeTask(task);
    expect(result.success).toBe(true);
    expect(result.metadata.delegatedTo).toBeDefined();
  });

  test("Agent memory persistence", async () => {
    const task1: Task = {
      id: "memory-test-1",
      type: "supplier_analysis",
      priority: 1,
      data: { supplierId: "test-supplier-1" },
    };

    const task2: Task = {
      id: "memory-test-2",
      type: "supplier_analysis",
      priority: 1,
      data: { supplierId: "test-supplier-1" },
    };

    await agentManager.executeTask(task1);
    const result2 = await agentManager.executeTask(task2);

    expect(result2.metadata.processingTime).toBeLessThan(
      result1.metadata.processingTime,
    );
  });

  test("Error handling", async () => {
    const invalidTask: Task = {
      id: "invalid-task",
      type: "invalid_type",
      priority: 1,
      data: {},
    };

    const result = await agentManager.executeTask(invalidTask);
    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });

  test("Parallel task execution", async () => {
    const tasks: Task[] = [
      {
        id: "parallel-1",
        type: "product_optimization",
        priority: 1,
        data: { productId: "test-1" },
      },
      {
        id: "parallel-2",
        type: "product_optimization",
        priority: 1,
        data: { productId: "test-2" },
      },
    ];

    const results = await Promise.all(
      tasks.map((task) => agentManager.executeTask(task)),
    );
    expect(results.every((r) => r.success)).toBe(true);
  });
});
