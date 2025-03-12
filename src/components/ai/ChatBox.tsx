import { useState, useRef, useEffect } from "react";
import { Button } from "../ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "../ui/card";
import { Input } from "../ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { ScrollArea } from "../ui/scroll-area";
import { Loader2, Send, Bot, User } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export function ChatBox() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Hello! I'm your AI assistant for dropshipping. How can I help you today?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector(
        "[data-radix-scroll-area-viewport]",
      );
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    // Add user message
    const userMessage: Message = {
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Generate mock response based on input
      let assistantResponse = generateMockResponse(input);

      // Add assistant response
      const assistantMessage: Message = {
        role: "assistant",
        content: assistantResponse,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Error in chat flow:", error);
      // Add error message
      const errorMessage: Message = {
        role: "assistant",
        content:
          "Sorry, I encountered an error processing your request. Please try again.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const generateMockResponse = (userInput: string): string => {
    const input = userInput.toLowerCase();

    if (input.includes("product") && input.includes("trend")) {
      return "Based on current market analysis, trending products include wireless earbuds, smart home devices, and eco-friendly water bottles. The wireless earbuds market is growing at 15% annually with average margins of 45-60%.";
    } else if (input.includes("supplier") || input.includes("vendor")) {
      return "I recommend evaluating suppliers based on reliability, product quality, and shipping times. Top-rated suppliers in electronics include TechSource Pro (4.8/5) and ElectroWholesale (4.7/5). Would you like me to analyze specific supplier metrics?";
    } else if (input.includes("price") || input.includes("pricing")) {
      return "For optimal pricing strategy, I suggest a 40-60% markup from your cost price, while staying competitive with market rates. Consider dynamic pricing for seasonal products and bundle pricing for related items to increase average order value.";
    } else if (input.includes("marketing") || input.includes("advertis")) {
      return "Effective marketing strategies for dropshipping include targeted social media ads, influencer partnerships, and email marketing. For your product category, Instagram and TikTok typically yield the highest ROI with conversion rates around 3.2%.";
    } else if (input.includes("inventory") || input.includes("stock")) {
      return "To optimize inventory management, maintain 30-45 days of stock for best-selling items and set up automated reordering at 25% stock level. This balances carrying costs with stockout risks. Would you like me to create an inventory forecast model?";
    } else {
      return "I can help you with product selection, supplier evaluation, pricing strategies, marketing plans, and inventory management for your dropshipping business. What specific aspect would you like assistance with?";
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <Card className="w-full h-[600px] flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <Bot size={20} />
          AI Assistant
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden p-0">
        <ScrollArea className="h-[450px] px-4" ref={scrollAreaRef}>
          <div className="space-y-4 pt-3">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`flex gap-3 max-w-[80%] ${message.role === "user" ? "flex-row-reverse" : ""}`}
                >
                  <Avatar className="h-8 w-8">
                    {message.role === "assistant" ? (
                      <AvatarImage src="https://api.dicebear.com/7.x/bottts/svg?seed=assistant" />
                    ) : (
                      <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=user" />
                    )}
                    <AvatarFallback>
                      {message.role === "assistant" ? (
                        <Bot size={16} />
                      ) : (
                        <User size={16} />
                      )}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div
                      className={`rounded-lg px-4 py-2 ${message.role === "assistant" ? "bg-primary text-primary-foreground" : "bg-muted"}`}
                    >
                      {message.content}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {formatTime(message.timestamp)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="flex gap-3 max-w-[80%]">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="https://api.dicebear.com/7.x/bottts/svg?seed=assistant" />
                    <AvatarFallback>
                      <Bot size={16} />
                    </AvatarFallback>
                  </Avatar>
                  <div className="rounded-lg px-4 py-2 bg-primary text-primary-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
      <CardFooter className="pt-0">
        <div className="flex w-full items-center space-x-2">
          <Input
            placeholder="Type your message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
            className="flex-1"
          />
          <Button
            size="icon"
            onClick={handleSendMessage}
            disabled={isLoading || !input.trim()}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
