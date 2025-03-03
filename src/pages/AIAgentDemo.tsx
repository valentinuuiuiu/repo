import React, { useState, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAI } from '@/providers/AIProvider';
import { AgentType, ThoughtChain } from '@/types/agent';
import type { AgentConfig } from '@/providers/AIProvider';
import { AlertCircle, Lightbulb, PenTool, Share2, Wrench } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import OpenAI from 'openai';
import { useAgentManager } from '@/hooks/useAgentManager';

// Helper function to format agent type for display
const formatAgentType = (agentType: string): string => {
  return agentType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
};

// Agent Selection Component
const AgentSelector: React.FC<{
  selectedAgent: AgentType;
  onAgentChange: (agent: AgentType) => void;
}> = ({ selectedAgent, onAgentChange }) => (
  <Card className="mb-6">
    <CardHeader>
      <CardTitle>Select Agent</CardTitle>
    </CardHeader>
    <CardContent>
      <Select 
        value={selectedAgent} 
        onValueChange={(value) => onAgentChange(value as AgentType)}
      >
        <SelectTrigger>
          <SelectValue placeholder="Select an agent" />
        </SelectTrigger>
        <SelectContent>
          {Object.values(AgentType).map((agentType) => (
            <SelectItem key={agentType} value={agentType}>
              {formatAgentType(agentType)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </CardContent>
  </Card>
);

// User Input Component
const UserInputSection: React.FC<{
  userInput: string;
  selectedAgent: AgentType;
  isLoading: boolean;
  showThoughtProcess: boolean;
  onShowThoughtProcessChange: (value: boolean) => void;
  onInputChange: (input: string) => void;
  onSubmit: () => void;
}> = ({ 
  userInput, 
  selectedAgent, 
  isLoading, 
  showThoughtProcess,
  onShowThoughtProcessChange,
  onInputChange, 
  onSubmit 
}) => (
  <Card className="mb-6">
    <CardHeader>
      <CardTitle>Interaction</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="mb-4">
        <Textarea
          placeholder={`Enter your message for the ${formatAgentType(selectedAgent)} agent`}
          value={userInput}
          onChange={(e) => onInputChange(e.target.value)}
          className="w-full"
          disabled={isLoading}
        />
      </div>
      <div className="flex items-center space-x-2 mb-4">
        <Switch 
          id="thought-process" 
          checked={showThoughtProcess} 
          onCheckedChange={onShowThoughtProcessChange}
        />
        <Label htmlFor="thought-process">Show agent thought process</Label>
      </div>
      <Button 
        onClick={onSubmit} 
        disabled={isLoading || !userInput.trim()}
        className="w-full sm:w-auto"
      >
        {isLoading ? 'Generating Response...' : 'Send Message'}
      </Button>
    </CardContent>
  </Card>
);

// Agent Thought Process Component
const ThoughtProcessViewer: React.FC<{
  thoughtChain: ThoughtChain | null;
}> = ({ thoughtChain }) => {
  if (!thoughtChain) return null;

  return (
    <div className="mt-4">
      <h3 className="text-lg font-semibold flex items-center mb-2">
        <Lightbulb className="h-5 w-5 mr-2" />
        Agent Thought Process
      </h3>
      <div className="bg-slate-50 p-4 rounded-md">
        <div className="mb-2">
          <Badge variant="outline" className="mr-2">Input</Badge>
          <span>{thoughtChain.input}</span>
        </div>
        
        {thoughtChain.steps.length > 0 && (
          <div className="mb-3">
            <Badge variant="outline" className="mb-1">Reasoning Steps</Badge>
            <ol className="list-decimal ml-5">
              {thoughtChain.steps.map((step, idx) => (
                <li key={idx} className="mb-2">
                  <div className="font-semibold">{step.thought}</div>
                  <div className="text-sm text-slate-600">{step.reasoning}</div>
                  {step.action && (
                    <div className="flex items-center mt-1">
                      <Tool className="h-3 w-3 mr-1 text-blue-600" />
                      <span className="text-xs text-blue-600">{step.action}</span>
                    </div>
                  )}
                  {step.actionResult && (
                    <div className="bg-slate-100 p-2 mt-1 rounded text-xs">
                      <pre className="whitespace-pre-wrap">
                        {JSON.stringify(step.actionResult, null, 2)}
                      </pre>
                    </div>
                  )}
                </li>
              ))}
            </ol>
          </div>
        )}
        
        <div className="mt-2">
          <Badge variant="outline" className="mr-2">Conclusion</Badge>
          <span>{thoughtChain.conclusion || "No conclusion reached yet"}</span>
        </div>
        
        <div className="mt-2">
          <Badge variant="outline" className="mr-2">Confidence</Badge>
          <span>{(thoughtChain.confidence * 100).toFixed(1)}%</span>
        </div>
      </div>
    </div>
  );
};

// Agent Response Component
const AgentResponseSection: React.FC<{
  response: string;
  thoughtChain: ThoughtChain | null;
  error: string | null;
  showThoughtProcess: boolean;
}> = ({ response, thoughtChain, error, showThoughtProcess }) => {
  if (!response && !error && !thoughtChain) return null;
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Agent Response</CardTitle>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        {response && <p className="whitespace-pre-wrap">{response}</p>}
        
        {/* Show thought process if enabled */}
        {showThoughtProcess && thoughtChain && (
          <Tabs defaultValue="visual" className="mt-6">
            <TabsList>
              <TabsTrigger value="visual">Visual</TabsTrigger>
              <TabsTrigger value="json">JSON</TabsTrigger>
            </TabsList>
            <TabsContent value="visual">
              <ThoughtProcessViewer thoughtChain={thoughtChain} />
            </TabsContent>
            <TabsContent value="json">
              <pre className="bg-slate-50 p-4 rounded-md text-xs overflow-auto max-h-96">
                {JSON.stringify(thoughtChain, null, 2)}
              </pre>
            </TabsContent>
          </Tabs>
        )}
      </CardContent>
    </Card>
  );
};

// Agent Tools Component
const AgentToolsSection: React.FC<{
  selectedAgent: AgentType;
}> = ({ selectedAgent }) => {
  const { getAgentTools } = useAgentManager();
  const toolkit = getAgentTools(selectedAgent);
  
  if (!toolkit || toolkit.tools.length === 0) return null;
  
  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Wrench className="h-5 w-5 mr-2" />
          Available Tools
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-3">
          {toolkit.tools.map((tool) => (
            <li key={tool.id} className="border rounded-md p-3">
              <h4 className="font-semibold">{tool.name}</h4>
              <p className="text-sm text-slate-600">{tool.description}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                <Badge variant="outline">{tool.functionType}</Badge>
                {tool.requiresAuth && (
                  <Badge variant="secondary">Requires Auth</Badge>
                )}
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
};

// Agent Configuration Component
const AgentConfigSection: React.FC<{
  selectedAgent: AgentType;
  agents: Record<AgentType, AgentConfig>;
}> = ({ selectedAgent, agents }) => (
  <Card className="mt-6">
    <CardHeader>
      <CardTitle>Agent Configuration</CardTitle>
    </CardHeader>
    <CardContent>
      <h3 className="font-semibold mb-2">Current Agent Details</h3>
      <pre className="bg-slate-50 p-3 rounded text-sm overflow-auto max-h-60">
        {JSON.stringify(agents[selectedAgent], null, 2)}
      </pre>
    </CardContent>
  </Card>
);

// Agent Collaboration Component
const AgentCollaborationSection: React.FC<{
  selectedAgent: AgentType;
  isDisabled: boolean;
  onCollaborate: (targetAgents: AgentType[]) => void;
}> = ({ selectedAgent, isDisabled, onCollaborate }) => {
  const [collaborators, setCollaborators] = useState<AgentType[]>([]);
  
  // Remove the selected agent from available collaborators
  const availableAgents = Object.values(AgentType).filter(
    agent => agent !== selectedAgent
  );
  
  const toggleCollaborator = (agentType: AgentType) => {
    if (collaborators.includes(agentType)) {
      setCollaborators(collaborators.filter(a => a !== agentType));
    } else {
      setCollaborators([...collaborators, agentType]);
    }
  };
  
  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Share2 className="h-5 w-5 mr-2" />
          Agent Collaboration
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-slate-600 mb-4">
          Select which agents should collaborate with the {formatAgentType(selectedAgent)}
        </p>
        
        <div className="space-y-2">
          {availableAgents.map((agent) => (
            <div key={agent} className="flex items-center space-x-2">
              <Switch 
                id={`collab-${agent}`}
                checked={collaborators.includes(agent)}
                onCheckedChange={() => toggleCollaborator(agent)}
                disabled={isDisabled}
              />
              <Label htmlFor={`collab-${agent}`}>{formatAgentType(agent)}</Label>
            </div>
          ))}
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          variant="secondary"
          onClick={() => onCollaborate(collaborators)}
          disabled={isDisabled || collaborators.length === 0}
        >
          Collaborate with Selected Agents
        </Button>
      </CardFooter>
    </Card>
  );
};

export const AIAgentDemo: React.FC = () => {
  const { generateResponse, agents } = useAI();
  const { 
    createThoughtChain,
    addThoughtStep,
    completeThoughtChain,
    getThoughtChain,
    collaborateWithAgents,
    executeTool
  } = useAgentManager();
  
  const [selectedAgent, setSelectedAgent] = useState<AgentType>(AgentType.CUSTOMER_SUPPORT_LEADER);
  const [userInput, setUserInput] = useState<string>('');
  const [agentResponse, setAgentResponse] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showThoughtProcess, setShowThoughtProcess] = useState<boolean>(true);
  const [currentThoughtChainId, setCurrentThoughtChainId] = useState<string | null>(null);
  const [currentThoughtChain, setCurrentThoughtChain] = useState<ThoughtChain | null>(null);

  // Reset error when changing input or agent
  const handleInputChange = useCallback((input: string) => {
    setUserInput(input);
    if (error) setError(null);
  }, [error]);

  const handleAgentChange = useCallback((agent: AgentType) => {
    setSelectedAgent(agent);
    if (error) setError(null);
    setCurrentThoughtChainId(null);
    setCurrentThoughtChain(null);
  }, [error]);

  // Handle agent interaction with thought process tracking
  const handleAgentInteraction = useCallback(async () => {
    if (!userInput.trim()) return;

    setIsLoading(true);
    setError(null);
    
    // Create a new thought chain for this interaction
    const thoughtChainId = showThoughtProcess 
      ? createThoughtChain(selectedAgent, userInput)
      : null;
    
    setCurrentThoughtChainId(thoughtChainId);
    
    try {
      // Add initial thought step if tracking thoughts
      if (thoughtChainId) {
        addThoughtStep(
          thoughtChainId,
          "Processing user input",
          `Analyzing the user's request: "${userInput}"`,
          "Initial analysis"
        );
      }
      
      // Simulate some reasoning about the input
      if (thoughtChainId) {
        addThoughtStep(
          thoughtChainId,
          "Identifying intent and context",
          `Determining the main topics and intent in the user message to formulate an appropriate response.`,
          "Context analysis"
        );
      }

      const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
        { role: 'user', content: userInput }
      ];
      
      // Add a thought step about generating the response
      if (thoughtChainId) {
        addThoughtStep(
          thoughtChainId,
          "Generating response",
          `Using the ${agents[selectedAgent].model} model with a temperature of ${agents[selectedAgent].temperature} to generate a helpful response.`,
          "Generate response"
        );
      }
      
      const response = await generateResponse(selectedAgent, messages);
      setAgentResponse(response);
      
      // Complete the thought chain with the generated response
      if (thoughtChainId) {
        const completedChain = completeThoughtChain(
          thoughtChainId,
          response,
          0.9 // High confidence for standard responses
        );
        
        setCurrentThoughtChain(completedChain);
      }
      
    } catch (err) {
      console.error('Agent interaction error:', err);
      setError('An error occurred while generating the response. Please try again.');
      
      // Record the error in thought chain
      if (thoughtChainId) {
        addThoughtStep(
          thoughtChainId,
          "Error encountered",
          `Failed to generate a response due to an error: ${err instanceof Error ? err.message : 'Unknown error'}`,
          "Handle error"
        );
        
        const errorChain = completeThoughtChain(
          thoughtChainId,
          "Failed to generate a complete response due to an error.",
          0.1 // Low confidence due to error
        );
        
        setCurrentThoughtChain(errorChain);
      }
    } finally {
      setIsLoading(false);
    }
  }, [generateResponse, selectedAgent, userInput, showThoughtProcess, createThoughtChain, addThoughtStep, completeThoughtChain, agents]);

  // Handle collaboration with other agents
  const handleCollaboration = useCallback(async (targetAgents: AgentType[]) => {
    if (!userInput.trim() || targetAgents.length === 0) return;

    setIsLoading(true);
    setError(null);
    
    // Create a new thought chain for this collaboration
    const thoughtChainId = showThoughtProcess 
      ? createThoughtChain(selectedAgent, `[COLLABORATION] ${userInput}`)
      : null;
    
    setCurrentThoughtChainId(thoughtChainId);
    
    try {
      // Add initial thought step for collaboration
      if (thoughtChainId) {
        addThoughtStep(
          thoughtChainId,
          "Initiating collaboration",
          `Collaborating with the following agents: ${targetAgents.map(formatAgentType).join(', ')}`,
          "Begin collaboration"
        );
      }
      
      const collaborationResults = await collaborateWithAgents(
        selectedAgent,
        targetAgents,
        userInput,
        { 
          sessionId: Date.now().toString(),
          metadata: {
            collaborationType: 'user-initiated',
            timestamp: new Date().toISOString(),
            requestingAgent: selectedAgent
          }
        },
        thoughtChainId || undefined
      );
      
      // Format the collaboration results
      const formattedResults = Object.entries(collaborationResults)
        .map(([agent, response]) => `\n\n## ${formatAgentType(agent as AgentType)}'s Response\n${response}`)
        .join('');
      
      const finalResponse = `# Collaboration Results\n\nI've consulted with other agents about: "${userInput}"\n${formattedResults}`;
      
      setAgentResponse(finalResponse);
      
      // Complete the thought chain with the collaborative response
      if (thoughtChainId) {
        const completedChain = completeThoughtChain(
          thoughtChainId,
          "Successfully coordinated responses from multiple specialized agents.",
          0.95 // High confidence for collaborative responses
        );
        
        setCurrentThoughtChain(completedChain);
      }
      
    } catch (err) {
      console.error('Collaboration error:', err);
      setError('An error occurred during the collaboration. Please try again.');
      
      // Record the error in thought chain
      if (thoughtChainId) {
        addThoughtStep(
          thoughtChainId,
          "Collaboration error",
          `Failed to complete the collaboration due to an error: ${err instanceof Error ? err.message : 'Unknown error'}`,
          "Handle collaboration error"
        );
        
        const errorChain = completeThoughtChain(
          thoughtChainId,
          "Failed to complete the collaboration process due to an error.",
          0.3 // Low confidence due to error
        );
        
        setCurrentThoughtChain(errorChain);
      }
    } finally {
      setIsLoading(false);
    }
  }, [collaborateWithAgents, selectedAgent, userInput, showThoughtProcess, createThoughtChain, addThoughtStep, completeThoughtChain]);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">AI Agent Interaction Demo</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <AgentSelector 
            selectedAgent={selectedAgent} 
            onAgentChange={handleAgentChange} 
          />
          
          <UserInputSection 
            userInput={userInput}
            selectedAgent={selectedAgent}
            isLoading={isLoading}
            showThoughtProcess={showThoughtProcess}
            onShowThoughtProcessChange={setShowThoughtProcess}
            onInputChange={handleInputChange}
            onSubmit={handleAgentInteraction}
          />
          
          <AgentResponseSection 
            response={agentResponse} 
            thoughtChain={currentThoughtChain}
            error={error} 
            showThoughtProcess={showThoughtProcess}
          />
        </div>
        
        <div>
          <AgentToolsSection 
            selectedAgent={selectedAgent}
          />
          
          <AgentCollaborationSection
            selectedAgent={selectedAgent}
            isDisabled={isLoading}
            onCollaborate={handleCollaboration}
          />
          
          <AgentConfigSection 
            selectedAgent={selectedAgent} 
            agents={agents} 
          />
        </div>
      </div>
    </div>
  );
};