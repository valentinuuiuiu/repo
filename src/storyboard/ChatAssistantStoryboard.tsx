import { ChatBox } from "@/components/ai/ChatBox";

export default function ChatAssistantStoryboard() {
  return (
    <div className="w-full h-full bg-background p-6">
      <h1 className="text-3xl font-bold mb-6">AI Chat Assistant</h1>
      <div className="max-w-4xl mx-auto">
        <ChatBox />
      </div>
    </div>
  );
}
