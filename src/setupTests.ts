import "@testing-library/jest-dom";

// Mock OpenAI
jest.mock("openai", () => ({
  OpenAI: jest.fn().mockImplementation(() => ({
    chat: {
      completions: {
        create: jest.fn().mockResolvedValue({
          choices: [{ message: { content: "Mocked AI response" } }],
        }),
      },
    },
  })),
}));

// Mock environment variables
process.env.VITE_OPENAI_API_KEY = "test-api-key";
