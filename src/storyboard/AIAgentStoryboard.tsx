import { AgentStatus } from "@/components/ai/AgentStatus";

export default function AIAgentStoryboard() {
  return (
    <div className="w-full h-full bg-background p-6">
      <h1 className="text-3xl font-bold mb-6">AI Agent Status</h1>
      <AgentStatus />
    </div>
  );
}
