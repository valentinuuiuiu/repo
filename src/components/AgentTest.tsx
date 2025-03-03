import { useState } from 'react';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Box } from '@/components/ui/box';
import { AgentType } from '../types/agent';
import { useAI } from '@/providers/AIProvider';
import { useAgentManager } from '@/hooks/useAgentManager';
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';
import { ThoughtChain } from '@/types/agent';

const formatAgentType = (agentType: string): string => {
  return agentType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
};

const AgentTest = () => {
  const { generateResponse } = useAI();
  const { 
    createThoughtChain,
    addThoughtStep,
    completeThoughtChain,
    executeTool,
    collaborateWithAgents
  } = useAgentManager();

  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedAgent, setSelectedAgent] = useState<AgentType>(AgentType.MARKET_ANALYSIS);
  const [currentThoughtChain, setCurrentThoughtChain] = useState<ThoughtChain | null>(null);

  // Expert prompts for different agent types
  const expertPrompts: Record<AgentType, string[]> = {
    [AgentType.CUSTOMER_SERVICE]: [
      'How can we improve customer satisfaction?',
      'Analyze common customer complaints and suggest solutions',
      'Draft a response to this customer issue...',
      'Suggest ways to reduce support ticket response time',
      'Create a customer support training plan',
    ],
    [AgentType.INVENTORY_MANAGEMENT]: [
      'Identify inefficiencies in our inventory system',
      'How can we optimize inventory levels?',
      'Suggest improvements for inventory management',
      'Create a plan to reduce stockouts',
      'Analyze and improve our inventory turnover'
    ],
    [AgentType.PRICING_OPTIMIZATION]: [
      'Generate strategies to optimize product pricing',
      'Create a pricing model for our premium product',
      'How to improve our profit margins?',
      'Suggest price adjustments based on market conditions',
      'Create a dynamic pricing strategy'
    ],
    [AgentType.SUPPLIER_COMMUNICATION]: [
      'Draft a message to supplier about delayed shipment',
      'Suggest improvements for supplier onboarding process',
      'Create a supplier evaluation framework',
      'How to negotiate better terms with suppliers?',
      'Draft a supplier quality agreement'
    ],
    [AgentType.MARKET_ANALYSIS]: [
      'Analyze our competitors in the ecommerce space',
      'What market segments should we focus on next?',
      'Generate a market research plan for new product line',
      'Identify growth opportunities in current markets',
      'How are customer preferences changing in our industry?'
    ],
    [AgentType.ORDER_PROCESSING]: [
      'Suggest improvements for order fulfillment process',
      'How can we reduce shipping times?',
      'Create a strategy for handling order backlogs',
      'Optimize our order confirmation process',
      'Analyze and improve our return process'
    ],
    [AgentType.QUALITY_CONTROL]: [
      'Create a quality control checklist for our products',
      'Suggest improvements to our quality assurance process',
      'How to identify and address common quality issues?',
      'Design a quality testing protocol for new products',
      'Develop a strategy for continuous quality improvement'
    ],
    [AgentType.CODE_MAINTENANCE]: [
      'Suggest best practices for code documentation',
      'How to improve our code review process?',
      'Create a code refactoring strategy',
      'Identify potential technical debt in our codebase',
      'Develop a plan for continuous code improvement'
    ]
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;
    
    try {
      setLoading(true);
      setError(null);
      setResponse('');
      
      // Create a thought chain to track agent's reasoning
      const thoughtChainId = createThoughtChain(
        selectedAgent,
        prompt
      );

      // Initial analysis step
      addThoughtStep(
        thoughtChainId,
        "Analyzing request",
        `Understanding user query: ${prompt}`,
        "Initial analysis"
      );

      // Determine if we need to collaborate with other agents
      let needsCollaboration = false;
      const collaborators: AgentType[] = [];

      // Add collaboration logic based on agent type and prompt content
      if (prompt.toLowerCase().includes('market') && selectedAgent !== AgentType.MARKET_ANALYSIS) {
        collaborators.push(AgentType.MARKET_ANALYSIS);
        needsCollaboration = true;
      }
      if (prompt.toLowerCase().includes('customer') && selectedAgent !== AgentType.CUSTOMER_SERVICE) {
        collaborators.push(AgentType.CUSTOMER_SERVICE);
        needsCollaboration = true;
      }
      if (prompt.toLowerCase().includes('price') && selectedAgent !== AgentType.PRICING_OPTIMIZATION) {
        collaborators.push(AgentType.PRICING_OPTIMIZATION);
        needsCollaboration = true;
      }

      // If collaboration is needed, get input from other agents
      let collaborationResults = {};
      if (needsCollaboration) {
        addThoughtStep(
          thoughtChainId,
          "Initiating collaboration",
          `Consulting with ${collaborators.join(', ')} for additional insights`,
          "Collaboration"
        );

        collaborationResults = await collaborateWithAgents(
          selectedAgent,
          collaborators,
          prompt
        );

        addThoughtStep(
          thoughtChainId,
          "Processing collaboration results",
          `Received insights from ${Object.keys(collaborationResults).length} collaborating agents`,
          "Process collaboration",
          collaborationResults
        );
      }

      // Generate the main response
      const messages = [{
        role: 'user' as const,
        content: needsCollaboration 
          ? `${prompt}\n\nCollaborator Insights:\n${JSON.stringify(collaborationResults, null, 2)}`
          : prompt
      }];

      const response = await generateResponse(selectedAgent, messages);

      // Complete the thought chain
      const completedChain = completeThoughtChain(
        thoughtChainId,
        response,
        needsCollaboration ? 0.95 : 0.85
      );

      setCurrentThoughtChain(completedChain);
      setResponse(response);

    } catch (err) {
      setError(`Error: ${err instanceof Error ? err.message : 'Unknown error occurred'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <Card>
        <CardContent className="p-6">
          <h1 className="text-2xl font-bold mb-4">AI Agent Testing Console</h1>
          <p className="text-muted-foreground mb-6">
            Test and interact with our AI agents to get insights and recommendations.
          </p>
          
          {/* Agent Selection */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-2">Select Agent Type:</h2>
            <div className="flex flex-wrap gap-2">
              {Object.values(AgentType).map((agentType) => (
                <Button
                  key={agentType}
                  variant={selectedAgent === agentType ? "secondary" : "default"}
                  onClick={() => setSelectedAgent(agentType)}
                  className="capitalize"
                >
                  {formatAgentType(agentType)}
                </Button>
              ))}
            </div>
          </div>

          {/* Expert Prompts */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-2">Expert Prompts:</h2>
            <div className="flex flex-wrap gap-2">
              {expertPrompts[selectedAgent].map((quickPrompt, index) => (
                <Button
                  key={index}
                  onClick={() => setPrompt(quickPrompt)}
                  variant="outline"
                  size="default"
                >
                  {quickPrompt}
                </Button>
              ))}
            </div>
          </div>

          {/* Input Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <Textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Ask a question or provide instructions..."
              className="min-h-[100px]"
            />
            <Button
              type="submit"
              disabled={loading || !prompt.trim()}
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                'Send to Agent'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Error Message */}
      {error && (
        <Alert variant="destructive" className="mt-4">
          <p>{error}</p>
        </Alert>
      )}

      {/* Response Display */}
      {(response || currentThoughtChain) && (
        <Card className="mt-4">
          <CardContent className="p-6">
            {/* Thought Process Display */}
            {currentThoughtChain && (
              <div className="mb-4 border-b pb-4">
                <h2 className="text-lg font-semibold mb-2">Agent Thought Process:</h2>
                <div className="space-y-2">
                  {currentThoughtChain.steps.map((step, index) => (
                    <div key={index} className="border rounded p-2">
                      <div className="font-medium">{step.thought}</div>
                      <div className="text-sm text-muted-foreground">{step.reasoning}</div>
                      {step.actionResult && (
                        <pre className="mt-2 bg-muted p-2 rounded text-xs overflow-x-auto">
                          {JSON.stringify(step.actionResult, null, 2)}
                        </pre>
                      )}
                    </div>
                  ))}
                </div>
                <div className="mt-4 flex items-center gap-4">
                  <div className="text-sm">
                    <span className="font-medium">Confidence:</span>{' '}
                    {(currentThoughtChain.confidence * 100).toFixed(1)}%
                  </div>
                  <div className="text-sm">
                    <span className="font-medium">Conclusion:</span>{' '}
                    {currentThoughtChain.conclusion}
                  </div>
                </div>
              </div>
            )}

            {/* Final Response */}
            <div>
              <h2 className="text-lg font-semibold mb-2">Agent Response:</h2>
              <div className="whitespace-pre-wrap font-mono text-sm bg-muted p-4 rounded">
                {response}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AgentTest;