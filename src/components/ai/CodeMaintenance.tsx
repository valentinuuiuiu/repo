import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button, buttonVariants } from "@/components/ui/button"
import type { VariantProps } from "class-variance-authority"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { CheckCircle2, XCircle, History } from "lucide-react"
import { aiService } from "@/lib/ai"
import { CodeBlock } from "../ui/code-block"
import { Task, TaskType } from "@/lib/ai/types"

interface CodeIssue {
  type: 'error' | 'warning' | 'suggestion';
  file: string;
  line: number;
  message: string;
  suggestedFix?: string;
}

interface CodeMetrics {
  complexity: number;
  maintainability: number;
  duplicateCode: number;
}

interface CodeAnalysis {
  issues: CodeIssue[];
  metrics: CodeMetrics;
  suggestions: string[];
}

interface FixHistoryEntry {
  file: string;
  fix: string;
  success: boolean;
  timestamp: Date;
}

export function CodeMaintenance() {
  const [analysis, setAnalysis] = useState<CodeAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [fixHistory, setFixHistory] = useState<FixHistoryEntry[]>([]);

  const analyzeCode = async () => {
    setLoading(true);
    setError(null);
    try {
      const task: Task = {
        id: `analyze-${Date.now()}`,
        type: 'code_maintenance',
        data: { action: 'analyze' },
        departments: ['maintenance'],
        priority: 'low',
        status: 'pending',
        created_at: new Date(),
        updated_at: new Date()
      };

      const result = await aiService.executeTask(task);
      
      if (!result.success || !result.data) {
        throw new Error(result.error || 'Analysis failed');
      }
      
      setAnalysis(result.data as CodeAnalysis);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error occurred'));
      console.error('Error analyzing code:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFixIssue = async (issue: CodeIssue) => {
    try {
      const task: Task = {
        id: `fix-${Date.now()}`,
        type: 'code_maintenance',
        data: {
          action: 'fix',
          file: issue.file,
          line: issue.line,
          suggestedFix: issue.suggestedFix
        },
        departments: ['maintenance'],
        priority: 'medium',
        status: 'pending',
        created_at: new Date(),
        updated_at: new Date()
      };

      const result = await aiService.executeTask(task);
      const success = result.success && !result.error;

      const newFixEntry: FixHistoryEntry = {
        file: issue.file,
        fix: issue.suggestedFix || '',
        success,
        timestamp: new Date()
      };

      setFixHistory(prev => [newFixEntry, ...prev]);

      if (success) {
        const recordTask: Task = {
          id: `record-${Date.now()}`,
          type: 'code_maintenance',
          data: {
            action: 'record_fix',
            file: issue.file,
            fix: issue.suggestedFix,
            success: true
          },
          departments: ['maintenance'],
          priority: 'low',
          status: 'pending',
          created_at: new Date(),
          updated_at: new Date()
        };

        await aiService.executeTask(recordTask);
        analyzeCode(); // Refresh analysis after successful fix
      }
    } catch (err) {
      console.error('Error fixing issue:', err);
      setError(err instanceof Error ? err : new Error('Failed to apply fix'));
    }
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Code Maintenance</h1>
        <div className="flex gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline">
                  <History className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>View Fix History</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <Button 
            onClick={analyzeCode}
            disabled={loading}
          >
            {loading ? 'Analyzing...' : 'Analyze Code'}
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error.message}</AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="analysis">
        <TabsList>
          <TabsTrigger value="analysis">Analysis</TabsTrigger>
          <TabsTrigger value="history">Fix History</TabsTrigger>
        </TabsList>

        <TabsContent value="analysis">
          {analysis && (
            <div className="grid gap-6">
              <Card className="p-4">
                <h2 className="text-xl font-semibold mb-4">Code Health Metrics</h2>
                <div className="grid grid-cols-3 gap-4">
                  {Object.entries(analysis.metrics).map(([key, value]) => (
                    <div key={key}>
                      <p className="text-sm text-muted-foreground capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </p>
                      <p className="text-2xl font-bold">
                        {typeof value === 'number' ? value.toFixed(1) : value}
                        {key === 'duplicateCode' ? '%' : ''}
                      </p>
                    </div>
                  ))}
                </div>
              </Card>

              <Tabs defaultValue="issues">
                <TabsList>
                  <TabsTrigger value="issues">
                    Issues ({analysis.issues.length})
                  </TabsTrigger>
                  <TabsTrigger value="suggestions">
                    Suggestions ({analysis.suggestions.length})
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="issues">
                  <ScrollArea className="h-[500px]">
                    <div className="space-y-4">
                      {analysis.issues.map((issue, index) => (
                        <Alert 
                          key={index}
                          variant={issue.type === 'error' ? 'destructive' : 'default'}
                        >
                          <AlertTitle className="flex items-center gap-2">
                            <Badge variant={
                              issue.type === 'error' ? 'destructive' : 
                              'secondary'
                            }>
                              {issue.type}
                            </Badge>
                            {issue.file}:{issue.line}
                          </AlertTitle>
                          <AlertDescription className="mt-2">
                            <p>{issue.message}</p>
                            {issue.suggestedFix && (
                              <div className="mt-2">
                                <CodeBlock code={issue.suggestedFix} language="typescript" />
                                <Button 
                                  className="mt-2"
                                  variant="secondary"
                                  onClick={() => handleFixIssue(issue)}
                                >
                                  Apply Fix
                                </Button>
                              </div>
                            )}
                          </AlertDescription>
                        </Alert>
                      ))}
                    </div>
                  </ScrollArea>
                </TabsContent>

                <TabsContent value="suggestions">
                  <ScrollArea className="h-[500px]">
                    <div className="space-y-4">
                      {analysis.suggestions.map((suggestion, index) => (
                        <Alert key={index}>
                          <AlertDescription>{suggestion}</AlertDescription>
                        </Alert>
                      ))}
                    </div>
                  </ScrollArea>
                </TabsContent>
              </Tabs>
            </div>
          )}
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <ScrollArea className="h-[600px]">
              <div className="space-y-4 p-4">
                {fixHistory.map((fix, index) => (
                  <Alert key={index} variant={fix.success ? 'default' : 'destructive'}>
                    <AlertTitle className="flex items-center gap-2">
                      {fix.success ? (
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-500" />
                      )}
                      {fix.file}
                    </AlertTitle>
                    <AlertDescription className="mt-2">
                      <p className="text-sm text-muted-foreground">
                        {fix.timestamp.toLocaleString()}
                      </p>
                      <CodeBlock code={fix.fix} language="typescript" />
                    </AlertDescription>
                  </Alert>
                ))}
              </div>
            </ScrollArea>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}