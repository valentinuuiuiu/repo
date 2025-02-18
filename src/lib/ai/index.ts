import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
});

export class AIAgent {
  static async generateProductDescription(product: any) {
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content:
              "You are a professional e-commerce product description writer.",
          },
          {
            role: "user",
            content: `Create a compelling product description for: ${product.title}\n\nProduct details:\n${JSON.stringify(product, null, 2)}`,
          },
        ],
        temperature: 0.7,
      });

      return response.choices[0]?.message?.content;
    } catch (error) {
      console.error("Failed to generate product description:", error);
      throw error;
    }
  }

  static async optimizePricing(product: any, marketData: any) {
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "You are a pricing optimization expert for e-commerce.",
          },
          {
            role: "user",
            content: `Suggest optimal pricing for:\n${JSON.stringify(product, null, 2)}\n\nMarket data:\n${JSON.stringify(marketData, null, 2)}`,
          },
        ],
        temperature: 0.3,
      });

      return JSON.parse(response.choices[0]?.message?.content || "{}");
    } catch (error) {
      console.error("Failed to optimize pricing:", error);
      throw error;
    }
  }

  static async analyzeSupplier(supplierData: any) {
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "You are a supplier analysis expert.",
          },
          {
            role: "user",
            content: `Analyze this supplier's performance and reliability:\n${JSON.stringify(supplierData, null, 2)}`,
          },
        ],
        temperature: 0.4,
      });

      return JSON.parse(response.choices[0]?.message?.content || "{}");
    } catch (error) {
      console.error("Failed to analyze supplier:", error);
      throw error;
    }
  }

  static async suggestTags(product: any) {
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "You are an SEO and product tagging expert.",
          },
          {
            role: "user",
            content: `Suggest relevant tags and keywords for:\n${JSON.stringify(product, null, 2)}`,
          },
        ],
        temperature: 0.5,
      });

      return JSON.parse(response.choices[0]?.message?.content || "[]");
    } catch (error) {
      console.error("Failed to suggest tags:", error);
      throw error;
    }
  }

  static async handleCustomerSupport(query: string, context: any) {
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content:
              "You are a helpful customer support agent for a dropshipping platform.",
          },
          {
            role: "user",
            content: `Query: ${query}\n\nContext:\n${JSON.stringify(context, null, 2)}`,
          },
        ],
        temperature: 0.7,
      });

      return response.choices[0]?.message?.content;
    } catch (error) {
      console.error("Failed to handle customer support query:", error);
      throw error;
    }
  }
}
