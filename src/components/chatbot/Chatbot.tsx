import React, { useState, useRef, useEffect } from 'react';
import { 
  MessageCircle, 
  Send, 
  X, 
  Minimize2, 
  Maximize2,
  Radio,
  Search
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { cn } from '@/lib/utils';
import { chatbotTrainingData, fallbackResponses } from './chatbot-training-data';
import OpenAI from 'openai';
import { DDGSSearchTool, SearchResult, DDGSSearchOptions } from '@/lib/ai/tools';
import type { AgentMessage } from '@/lib/ai/types';
import { HandymanAgent } from '@/lib/ai/agents/HandymanAgent';
import { AgentType } from '@prisma/client';

// OpenAI Configuration
const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY || '',
  dangerouslyAllowBrowser: true
});

// Initialize search tool (without config since constructor doesn't accept it)
const searchTool = new DDGSSearchTool();

const chatbotAgent = new HandymanAgent({
  name: "chatbot-agent",
  type: AgentType.CUSTOMER_SERVICE,
  description: "Dropship platform assistance chatbot",
  capabilities: [
    "customer_support",
    "technical_assistance",
    "order_help",
    "platform_guidance"
  ],
  maxRetries: 3,
  baseDelay: 1000
});

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot' | 'system';
  timestamp: number;
  searchResults?: SearchResult[];
}

interface ChatbotProps {
  initialMessage?: string;
  contextData?: {
    supplierName?: string;
    supplierCategory?: string[];
    supplierCountry?: string;
    agentName?: string;
    departmentName?: string;
    agentExpertise?: string;
    departmentDescription?: string;
  };
}

export const SearchToolDebugger: React.FC = () => {
  const [debugInfo, setDebugInfo] = useState<{
    toolExists: boolean;
    searchMethodExists: boolean;
    testSearchResult?: SearchResult[];
  }>({
    toolExists: false,
    searchMethodExists: false
  });

  useEffect(() => {
    console.log('SearchToolDebugger mounted');
  }, []);

  const runSearchToolTest = async () => {
    try {
      console.log('🧪 Running Search Tool Debugger');
      
      // Check if search tool exists
      const toolExists = !!searchTool;
      console.log('Search Tool Exists:', toolExists);

      // Check if search method exists
      const searchMethodExists = typeof searchTool?.search === 'function';
      console.log('Search Method Exists:', searchMethodExists);

      // Perform a test search
      let testSearchResult: SearchResult[] = [];
      if (searchMethodExists) {
        const searchOptions: DDGSSearchOptions = { 
          maxResults: 2,
          timeRange: 'm'
        };
        testSearchResult = await searchTool.search('dropshipping platform', searchOptions);
        console.log('Test Search Results:', testSearchResult);
      }

      // Update state
      setDebugInfo({
        toolExists,
        searchMethodExists,
        testSearchResult
      });
    } catch (error) {
      console.error('Search Tool Debug Error:', error);
      setDebugInfo(prev => ({
        ...prev,
        testSearchResult: []
      }));
    }
  };

  return (
    <div className="fixed bottom-4 left-4 z-50 bg-white shadow-lg p-4 rounded-lg border">
      <h3 className="font-bold mb-2">Search Tool Debugger</h3>
      <div>
        <p>Tool Exists: {debugInfo.toolExists ? '✅' : '❌'}</p>
        <p>Search Method Exists: {debugInfo.searchMethodExists ? '✅' : '❌'}</p>
        <Button 
          onClick={runSearchToolTest}
          className="mt-2 bg-blue-500 text-white"
        >
          Run Search Test
        </Button>
        {debugInfo.testSearchResult && (
          <div className="mt-2">
            <h4 className="font-semibold">Test Search Results:</h4>
            {debugInfo.testSearchResult.map((result, index) => (
              <div key={index} className="text-xs mb-1">
                <strong>{result.title}</strong>
                <p>{result.description?.substring(0, 100)}...</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const Chatbot: React.FC<ChatbotProps> = ({ initialMessage, contextData }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Initialize agent on mount
  useEffect(() => {
    const initAgent = async () => {
      try {
        await chatbotAgent.initialize();
        if (initialMessage) {
          handleUserMessage(initialMessage);
        }
      } catch (error) {
        console.error('Failed to initialize chatbot agent:', error);
      }
    };
    initAgent();
  }, [initialMessage]);

  const generateMessageId = () => `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  const handleUserMessage = async (text: string) => {
    try {
      const userMessage: Message = {
        id: generateMessageId(),
        text,
        sender: 'user',
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, userMessage]);

      const response = await chatbotAgent.handleMessage({
        id: Date.now().toString(),
        type: 'user_message',
        from: 'user',
        content: text,
        timestamp: new Date(),
        context: contextData
      });

      // Add search results if available
      const searchResults = await searchTool.search(text);

      const botMessage: Message = {
        id: generateMessageId(),
        text: typeof response.data === 'string' ? response.data : 'I apologize, I was unable to process your request.',
        sender: 'bot',
        timestamp: Date.now(),
        searchResults
      };
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error handling message:', error);
      const errorMessage: Message = {
        id: generateMessageId(),
        text: 'I apologize, but I encountered an error. Please try again.',
        sender: 'system',
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, errorMessage]);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    console.log('scrollToBottom useEffect, messages:', messages);
    scrollToBottom();
  }, [messages]);

  const addMessage = (text: string, sender: 'user' | 'bot' | 'system', searchResults?: SearchResult[]) => {
    const newMessage: Message = {
      id: generateMessageId(),
      text,
      sender,
      timestamp: Date.now(),
      searchResults
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const generateFallbackResponse = (userInput: string): string => {
    const lowercaseInput = userInput.toLowerCase();

    // Check for specific intents in training data
    for (const intent of chatbotTrainingData) {
      if (intent.patterns.some(pattern => lowercaseInput.includes(pattern))) {
        return intent.responses[Math.floor(Math.random() * intent.responses.length)];
      }
    }

    // Return random fallback response
    return fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
  };

  const performWebSearch = async (query: string): Promise<SearchResult[]> => {
    try {
      console.group('🌐 DDGS Web Search');
      console.log('🔍 Search Query:', query);
      
      // More permissive and comprehensive search options
      const searchOptions: DDGSSearchOptions = { 
        maxResults: 5,
        timeRange: 'm', // month
      };

      // Perform the search
      const startTime = Date.now();
      const results = await searchTool.search(query, searchOptions);
      const endTime = Date.now();

      console.log('⏱️ Search Duration:', endTime - startTime, 'ms');
      console.log('📊 Results Count:', results.length);
      
      // Detailed results logging with more context
      if (results.length > 0) {
        console.log('🔎 Detailed Search Results:');
        results.forEach((result, index) => {
          console.log(`[${index + 1}]`, {
            title: result.title,
            url: result.url,
            description: result.description ? result.description : 'No description',
            fullDetails: result
          });
        });
      } else {
        console.warn('⚠️ No search results found');
      }

      console.groupEnd();
      
      return results;
    } catch (error) {
      console.error('❌ DDGS Web Search Error:', error);
      return [];
    }
  };

  const generateAIResponse = async (userInput: string): Promise<{text: string, searchResults?: SearchResult[]}> => {
    try {
      // More comprehensive search triggers
      const searchTriggers = [
        'search', 'find', 'look up', 'latest', 'information about', 
        'tell me about', 'what is', 'explain', 'describe', 'overview of',
        'details on', 'research', 'discover', 'learn about', 'help me understand',
        'give me info', 'background on', 'context of', 'insights into'
      ];

      // Check if this is an explicit web search request
      const isExplicitSearch = userInput.startsWith('[WEB_SEARCH]');
      
      // Clean the input if it's a search request
      const cleanedInput = isExplicitSearch 
        ? userInput.replace('[WEB_SEARCH]', '').trim() 
        : userInput;
      
      // Determine if we should perform a web search
      const shouldSearch = isExplicitSearch || 
        searchTriggers.some(trigger => 
          cleanedInput.toLowerCase().includes(trigger)
        ) ||
        cleanedInput.split(' ').length > 3; // More than 3 words
      
      // Perform web search if needed
      let searchResults: SearchResult[] = [];
      let searchContext = '';
      
      if (shouldSearch) {
        // Add a system message indicating search is happening
        addMessage(`🌐 Searching the web for: "${cleanedInput}"`, 'system');
        
        // Extract search query - use the cleaned input
        const searchQuery = cleanedInput.replace(
          new RegExp(searchTriggers.join('|'), 'gi'), 
          ''
        ).trim();
        
        searchResults = await performWebSearch(searchQuery);
        
        if (searchResults.length > 0) {
          // Format search results for the AI context with more details
          searchContext = `\n\nWeb search results for "${searchQuery}":\n` + 
            searchResults.map((result, index) => 
              `[${index + 1}] ${result.title}\n` +
              `Description: ${result.description || 'No description available'}\n` +
              `Source: ${result.url}`
            ).join('\n\n');
        } else {
          // No results found
          searchContext = `\n\nNo relevant web search results found for "${searchQuery}".`;
        }
      }

      // Create a context-aware system prompt
      let systemPrompt = `You are an AI assistant for DropConnect, a comprehensive dropshipping platform. 
        Your primary goal is to provide helpful, accurate, and insightful information.`;
      
      // Add context data if available
      if (contextData) {
        systemPrompt += `\n\nCurrent context:`;
        if (contextData.supplierName) {
          systemPrompt += `\n- User is viewing supplier: ${contextData.supplierName}`;
        }
        if (contextData.supplierCategory && contextData.supplierCategory.length > 0) {
          systemPrompt += `\n- Supplier categories: ${contextData.supplierCategory.join(', ')}`;
        }
        if (contextData.supplierCountry) {
          systemPrompt += `\n- Supplier country: ${contextData.supplierCountry}`;
        }
        if (contextData.departmentName) {
          systemPrompt += `\n- Current department: ${contextData.departmentName}`;
          if (contextData.departmentDescription) {
            systemPrompt += `\n- Department description: ${contextData.departmentDescription}`;
          }
        }
        if (contextData.agentName) {
          systemPrompt += `\n- Current agent: ${contextData.agentName}`;
          if (contextData.agentExpertise) {
            systemPrompt += `\n- Agent expertise: ${contextData.agentExpertise}`;
          }
        }
        systemPrompt += `\n\nUse this context to provide more relevant answers when appropriate.`;
      }
      
      // Add search results to the prompt if available
      if (searchContext && searchResults.length > 0) {
        systemPrompt += `\n\nWeb Search Context:\n${searchContext}`;
        
        // Specific instructions for using search results
        systemPrompt += `\n\nInstructions for response:
        1. If the search results are directly relevant to the user's query, 
           incorporate key insights from the web search into your response.
        2. Provide a comprehensive answer that:
           - Synthesizes information from the search results
           - Relates the information to dropshipping and DropConnect's platform
           - Offers practical insights and context
        3. Always cite the sources from the web search results.
        4. If the search results are not fully relevant, use them as inspiration 
           or additional context for your response.`;
        
        // For explicit searches, add special emphasis
        if (isExplicitSearch) {
          systemPrompt += `\n\nThis is an explicit web search request. 
          Provide a detailed, in-depth analysis of the search results, 
          highlighting the most important and interesting information.`;
        }
      }
      
      systemPrompt += `\n\nIf you cannot confidently answer based on the available information, 
        suggest the user contact DropConnect support for the most up-to-date details.`;

      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system", 
            content: systemPrompt
          },
          { role: "user", content: cleanedInput }
        ],
        max_tokens: 300, // Increased token limit for more detailed responses
        temperature: 0.7
      });

      // Generate the response
      const responseText = completion.choices[0]?.message?.content || 
        "I'm unable to provide a comprehensive answer at the moment.";

      return {
        text: responseText,
        searchResults: searchResults.length > 0 ? searchResults : undefined
      };
    } catch (error) {
      console.error('OpenAI API Error:', error);
      const fallbackText = generateFallbackResponse(userInput);
      return { text: fallbackText };
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    // Add user message
    addMessage(inputMessage, 'user');
    
    try {
      // Use OpenAI to generate response
      const response = await generateAIResponse(inputMessage);
      
      // Add AI response with any search results
      addMessage(response.text, 'bot', response.searchResults);
    } catch (error) {
      console.error('Error generating AI response:', error);
      addMessage("I'm sorry, I couldn't process your request. Please try again.", 'system');
    }

    // Clear input
    setInputMessage('');
  };

  const handleBroadcastMessage = async () => {
    if (!inputMessage.trim()) return;

    // Add user message
    addMessage(inputMessage, 'user');
    
    try {
      // Simulate broadcast by adding a system message
      addMessage("Message broadcast to support team.", 'system');
    } catch (error) {
      console.error('Error broadcasting message:', error);
      addMessage("Failed to broadcast message. Please try again.", 'system');
    }

    // Clear input - fixed to use empty array
    setMessages([]);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  const toggleChatbot = () => {
    console.log('toggleChatbot, isOpen:', !isOpen);
    setIsOpen(!isOpen);
    if (!isOpen) {
      setIsMinimized(false);
    }
  };

  const toggleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  return (
    <div className="fixed bottom-6 right-6 z-[9999]">
      {/* Chatbot Trigger Button */}
      <motion.div 
        className={cn(
          "w-20 h-20 rounded-full bg-blue-500 text-white flex items-center justify-center shadow-2xl cursor-pointer",
          isOpen ? "hidden" : "block"
        )}
        onClick={toggleChatbot}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <MessageCircle className="w-10 h-10" />
      </motion.div>

      {/* Chatbot Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className={cn(
              "w-96 bg-white rounded-2xl shadow-2xl border border-blue-200 flex flex-col",
              isMinimized ? "h-16 overflow-hidden" : "h-[600px]"
            )}
          >
            {/* Chatbot Header */}
            <div className="bg-blue-500/10 p-4 rounded-t-2xl flex justify-between items-center">
              <h3 className="text-lg font-semibold text-blue-600">
                DropConnect AI Assistant
              </h3>
              <div className="flex space-x-2">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={toggleMinimize}
                  className="hover:bg-blue-100"
                >
                  {isMinimized ? <Maximize2 className="h-5 w-5 text-blue-600" /> : <Minimize2 className="h-5 w-5 text-blue-600" />}
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={toggleChatbot}
                  className="hover:bg-blue-100"
                >
                  <X className="h-5 w-5 text-blue-600" />
                </Button>
              </div>
            </div>

            {/* Messages Container */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <div 
                  key={message.id} 
                  className={cn(
                    "flex",
                    message.sender === 'user' ? "justify-end" : "justify-start"
                  )}
                >
                  <div 
                    className={cn(
                      "max-w-[80%] p-3 rounded-2xl",
                      message.sender === 'user' 
                        ? "bg-blue-500 text-white" 
                        : message.sender === 'bot'
                          ? "bg-blue-100 text-blue-800" 
                          : "bg-yellow-100 text-yellow-900"
                    )}
                  >
                    {message.text}
                    
                    {/* Display search results if available */}
                    {message.searchResults && message.searchResults.length > 0 && (
                      <div className="mt-2 pt-2 border-t border-blue-200">
                        <div className="text-xs font-semibold mb-1 flex items-center">
                          <Search className="w-3 h-3 mr-1" />
                          Web Search Results:
                        </div>
                        <div className="space-y-1">
                          {message.searchResults.map((result, idx) => (
                            <div key={idx} className="text-xs p-1 bg-white/50 rounded">
                              <div className="font-medium">{result.title}</div>
                              <div className="opacity-75 text-[10px] truncate">{result.url}</div>
                              <div className="text-[10px] mt-1">{result.description?.substring(0, 150)}...</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    <div className="text-xs opacity-50 mt-1 text-right">
                      {new Date(message.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 border-t border-blue-200 flex items-center space-x-2">
              <Input 
                ref={inputRef}
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me anything about DropConnect..."
                className="flex-1 focus:border-blue-500 focus:ring-blue-500"
              />
              <Button 
                size="icon" 
                onClick={handleSendMessage}
                disabled={!inputMessage.trim()}
                className="bg-blue-500 hover:bg-blue-600"
              >
                <Send className="h-5 w-5" />
              </Button>
              <Button 
                size="icon" 
                variant="outline"
                onClick={() => {
                  if (!inputMessage.trim()) {
                    // If input is empty, add a system message explaining how to use search
                    addMessage("To search the web, type a question or topic and click the search button. I'll use the DuckDuckGo search tool to find relevant information.", 'system');
                    return;
                  }
                  
                  // Add a special prefix that will trigger web search
                  setInputMessage(prev => `[WEB_SEARCH] ${prev}`);
                  inputRef.current?.focus();
                  
                  // Add a system message explaining what's happening
                  addMessage(`I'll search the web for information about "${inputMessage.trim()}"`, 'system');
                }}
                title="Web search"
                className="border-blue-500 text-blue-500 hover:bg-blue-50"
              >
                <Search className="h-5 w-5" />
              </Button>
              <Button 
                size="icon" 
                variant="outline"
                onClick={handleBroadcastMessage}
                disabled={!inputMessage.trim()}
                title="Broadcast to support team"
                className="border-blue-500 text-blue-500 hover:bg-blue-50"
              >
                <Radio className="h-5 w-5" />
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search Tool Debugger */}
      <SearchToolDebugger />
    </div>
  );
};

export default Chatbot;