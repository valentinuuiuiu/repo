import { ChatBox } from "@/components/ai/ChatBox";

export default function AIChat() {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">AI Chat Assistant</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ChatBox />
        </div>
        <div>
          <div className="bg-muted rounded-lg p-4 space-y-4">
            <h2 className="text-xl font-semibold">Chat with our AI</h2>
            <p>Our AI assistant can help you with:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Finding trending products</li>
              <li>Optimizing product pricing</li>
              <li>Evaluating suppliers</li>
              <li>Creating marketing strategies</li>
              <li>Managing inventory</li>
              <li>Handling customer inquiries</li>
            </ul>
            <p className="text-sm text-muted-foreground mt-4">
              Powered by OpenAI's GPT-4o-mini model, our assistant provides
              real-time insights and recommendations for your dropshipping
              business.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
