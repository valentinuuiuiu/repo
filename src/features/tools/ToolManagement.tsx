import React, { useState } from 'react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useToolContext } from './ToolContext';
import { useAgentContext } from '../agents/AgentContext';
import { Tool, ToolCategory } from './ToolModel';

export const ToolManagement: React.FC = () => {
  const { toolRegistry, getAccessibleTools, getToolsByCategory, executeTool } = useToolContext();
  const { currentAgent } = useAgentContext();
  
  const [selectedTool, setSelectedTool] = useState<Tool | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<ToolCategory | 'all'>('all');
  const [executionResult, setExecutionResult] = useState<string | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);

  // Get tools based on selected category or all tools
  const displayedTools = selectedCategory === 'all' 
    ? toolRegistry.getAllTools()
    : getToolsByCategory(selectedCategory as ToolCategory);

  // Get tools accessible to the current agent
  const accessibleTools = currentAgent 
    ? getAccessibleTools(currentAgent) 
    : [];

  // Handle tool selection
  const handleToolSelect = (toolId: string) => {
    const tool = toolRegistry.getTool(toolId);
    if (tool) {
      setSelectedTool(tool);
      setExecutionResult(null);
    }
  };

  // Handle category selection
  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category as ToolCategory | 'all');
    setSelectedTool(null);
    setExecutionResult(null);
  };

  // Execute the selected tool
  const handleExecuteTool = async () => {
    if (!selectedTool || !currentAgent) return;
    
    setIsExecuting(true);
    setExecutionResult(null);
    
    try {
      const result = await executeTool(selectedTool.id, currentAgent, {
        agentId: currentAgent.id,
        timestamp: new Date().toISOString()
      });
      
      setExecutionResult(JSON.stringify(result, null, 2));
    } catch (error) {
      setExecutionResult(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsExecuting(false);
    }
  };

  // Get all tool categories
  const allCategories = Object.values(ToolCategory);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Tool Management</h1>

      <Tabs defaultValue="all" className="mb-6">
        <TabsList className="mb-4">
          <TabsTrigger value="all" onClick={() => handleCategorySelect('all')}>
            All Tools
          </TabsTrigger>
          {allCategories.map(category => (
            <TabsTrigger 
              key={category} 
              value={category}
              onClick={() => handleCategorySelect(category)}
            >
              {category.replace('_', ' ')}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="all" className="mt-0">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {displayedTools.map(tool => (
              <Card 
                key={tool.id} 
                className={`cursor-pointer hover:shadow-md transition-shadow ${
                  selectedTool?.id === tool.id ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() => handleToolSelect(tool.id)}
              >
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{tool.name}</CardTitle>
                    <Badge variant="outline">{tool.category}</Badge>
                  </div>
                  <CardDescription>{tool.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm mb-2">
                    <span className="font-semibold">Version:</span> {tool.version}
                  </p>
                  <p className="text-sm">
                    <span className="font-semibold">Required Capabilities:</span>{' '}
                    {tool.requiredCapabilities.join(', ')}
                  </p>
                  {currentAgent && (
                    <div className="mt-3">
                      {accessibleTools.some(t => t.id === tool.id) ? (
                        <Badge className="bg-green-100 text-green-800 hover:bg-green-200">
                          Accessible
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-red-100 text-red-800 hover:bg-red-200">
                          Not Accessible
                        </Badge>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {allCategories.map(category => (
          <TabsContent key={category} value={category} className="mt-0">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {getToolsByCategory(category).map(tool => (
                <Card 
                  key={tool.id} 
                  className={`cursor-pointer hover:shadow-md transition-shadow ${
                    selectedTool?.id === tool.id ? 'ring-2 ring-primary' : ''
                  }`}
                  onClick={() => handleToolSelect(tool.id)}
                >
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg">{tool.name}</CardTitle>
                      <Badge variant="outline">{tool.category}</Badge>
                    </div>
                    <CardDescription>{tool.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm mb-2">
                      <span className="font-semibold">Version:</span> {tool.version}
                    </p>
                    <p className="text-sm">
                      <span className="font-semibold">Required Capabilities:</span>{' '}
                      {tool.requiredCapabilities.join(', ')}
                    </p>
                    {currentAgent && (
                      <div className="mt-3">
                        {accessibleTools.some(t => t.id === tool.id) ? (
                          <Badge className="bg-green-100 text-green-800 hover:bg-green-200">
                            Accessible
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-red-100 text-red-800 hover:bg-red-200">
                            Not Accessible
                          </Badge>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>

      {selectedTool && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>{selectedTool.name}</CardTitle>
            <CardDescription>{selectedTool.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <h3 className="font-semibold mb-2">Documentation</h3>
              <p>{selectedTool.usage.documentation}</p>
            </div>
            
            <div className="mb-4">
              <h3 className="font-semibold mb-2">Examples</h3>
              <ul className="list-disc pl-5">
                {selectedTool.usage.examples.map((example, index) => (
                  <li key={index}>{example}</li>
                ))}
              </ul>
            </div>
            
            <div className="mt-4">
              <Button 
                onClick={handleExecuteTool}
                disabled={!currentAgent || isExecuting || !accessibleTools.some(t => t.id === selectedTool.id)}
              >
                {isExecuting ? 'Executing...' : 'Execute Tool'}
              </Button>
              
              {!currentAgent && (
                <p className="text-sm text-amber-600 mt-2">
                  Select an agent first to execute this tool
                </p>
              )}
              
              {currentAgent && !accessibleTools.some(t => t.id === selectedTool.id) && (
                <p className="text-sm text-red-600 mt-2">
                  Current agent does not have access to this tool
                </p>
              )}
            </div>
            
            {executionResult && (
              <div className="mt-4">
                <h3 className="font-semibold mb-2">Execution Result</h3>
                <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
                  {executionResult}
                </pre>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};