import { AgentStatus } from "@/components/ai/AgentStatus";
import { TaskSubmission } from "@/components/ai/TaskSubmission";
import { TaskReview } from "@/components/ai/TaskReview";
import { AgentPerformance } from "@/components/ai/AgentPerformance";
import { AgentLearning } from "@/components/ai/AgentLearning";
import { AgentOptimizationStatus } from "@/components/ai/AgentOptimizationStatus";

export default function AIPage() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold mb-8">AI System Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <AgentStatus />
        <AgentPerformance />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <AgentLearning />
        <AgentOptimizationStatus />
      </div>
      
      <div className="grid grid-cols-1 gap-6">
        <TaskSubmission />
        <TaskReview />
      </div>
    </div>
  );
}