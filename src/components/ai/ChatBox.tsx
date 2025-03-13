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
      return "Based on current market analysis, trending dropshipping products include wireless earbuds (15% growth), smart home devices (22% growth), eco-friendly water bottles (18% growth), and LED strip lights (25% growth). The wireless earbuds market offers average margins of 45-60% with supplier costs around $20-35 per unit and recommended retail prices of $59-99.";
    } else if (input.includes("supplier") || input.includes("vendor")) {
      return "For your dropshipping business, I recommend evaluating suppliers based on reliability, product quality, shipping times, and minimum order requirements. Top-rated suppliers in electronics include TechSource Pro (4.8/5, 2-day shipping) and ElectroWholesale (4.7/5, 3-5 day shipping). Both offer no minimum order quantities and direct fulfillment to customers. Would you like me to analyze specific supplier metrics or help you connect with these suppliers through our platform?";
    } else if (input.includes("price") || input.includes("pricing")) {
      return "For optimal dropshipping pricing strategy, I suggest a 40-60% markup from your supplier cost, while staying competitive with market rates. Our platform can automatically apply your pricing rules when importing products. Consider dynamic pricing for seasonal products (increase 10-15% during peak seasons) and bundle pricing for related items to increase average order value. Based on your current product mix, implementing these strategies could increase your profit margin by approximately 12%.";
    } else if (input.includes("marketing") || input.includes("advertis")) {
      return "Effective marketing strategies for your dropshipping store include targeted social media ads, influencer partnerships, and email marketing. For your electronics category, Instagram and TikTok typically yield the highest ROI with conversion rates around 3.2%. I recommend starting with a $500 ad budget split 60/40 between Meta and TikTok platforms, focusing on lookalike audiences based on your existing customers. Would you like me to help create specific ad campaigns for your top products?";
    } else if (input.includes("inventory") || input.includes("stock")) {
      return "For your dropshipping business, our platform can automatically sync inventory levels between suppliers and your store. I recommend setting up low stock alerts at 25% of optimal level to prevent stockouts. For your current product catalog, the system will monitor stock levels across all 5 connected suppliers and automatically update availability on your Shopify store. Would you like me to set up automated inventory alerts or create a forecast model for your top-selling products?";
    } else if (input.includes("shipping") || input.includes("delivery")) {
      return "For your dropshipping store, I recommend highlighting shipping times prominently on product pages. Based on your current supplier network, you can offer 3-7 day delivery on most products. Consider offering free shipping on orders over $50 to increase conversion rates (typically by 20%). Our platform can automatically calculate shipping times based on supplier location and customer address, and update tracking information directly to your store when available.";
    } else if (input.includes("integration") || input.includes("connect")) {
      return "Our dropshipping platform currently supports direct integration with Shopify, WooCommerce, and Wix stores. To connect your store, go to Settings > Integrations and follow the authentication steps. Once connected, you can import products with one click, sync inventory automatically, and push order details to suppliers for fulfillment. Would you like me to walk you through connecting your specific e-commerce platform?";
    } else {
      return "I can help you manage all aspects of your dropshipping business through our platform, including product selection, supplier evaluation, pricing strategies, marketing plans, inventory management, and store integrations. Our dashboard provides real-time analytics on your best-performing products and suppliers. What specific aspect of your dropshipping business would you like assistance with today?";
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
