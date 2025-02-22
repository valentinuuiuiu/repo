import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { CheckCircle2, XCircle, History } from "lucide-react"
import { aiService } from "@/lib/ai"
import { CodeBlock } from "../ui/code-block"

interface CodeIssue {
  type: 'error' | 'warning' | 'suggestion';
  file: string;
  line: number;
  message: string;
  suggestedFix?: string;
}

interface CodeAnalysis {
  issues: CodeIssue[];
  metrics: {
    complexity: number;
    maintainability: number;
    duplicateCode: number;
  };
  suggestions: string[];
}

export function CodeMaintenance() {
  const [analysis, setAnalysis] = useState<CodeAnalysis | null>(null);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [fixHistory, setFixHistory] = useState<{
    file: string;
    fix: string;
    success: boolean;
    timestamp: Date;
  }[]>([]);

  const analyzeCode = async () => {
    setLoading(true);
    try {
      const result = await aiService.executeTask({
        type: 'code_maintenance',
        data: { action: 'analyze' },
        departments: ['maintenance'],
        priority: 'low'
      });
      setAnalysis(result.data);
    } catch (error) {
      console.error('Error analyzing code:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFixIssue = async (issue: CodeIssue) => {
    try {
      const result = await aiService.executeTask({
        type: 'code_maintenance',
        data: {
          action: 'fix',
          file: issue.file,
          line: issue.line,
          suggestedFix: issue.suggestedFix
        },
        departments: ['maintenance'],
        priority: 'medium'
      });

      // Record fix success/failure for learning
      await aiService.executeTask({
        type: 'code_maintenance',
        data: {
          action: 'record_fix',
          file: issue.file,
          fix: issue.suggestedFix,
          success: true
        },
        departments: ['maintenance'],
        priority: 'low'
      });

      setFixHistory(prev => [{
        file: issue.file,
        fix: issue.suggestedFix || '',
        success: true,
        timestamp: new Date()
      }, ...prev]);

      // Refresh analysis after fix
      analyzeCode();
    } catch (error) {
      console.error('Error fixing issue:', error);
      
      // Record failed fix attempt
      await aiService.executeTask({
        type: 'code_maintenance',
        data: {
          action: 'record_fix',
          file: issue.file,
          fix: issue.suggestedFix,
          success: false
        },
        departments: ['maintenance'],
        priority: 'low'
      });

      setFixHistory(prev => [{
        file: issue.file,
        fix: issue.suggestedFix || '',
        success: false,
        timestamp: new Date()
      }, ...prev]);
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
                <Button variant="outline" size="icon">
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
                  <div>
                    <p className="text-sm text-muted-foreground">Complexity</p>
                    <p className="text-2xl font-bold">
                      {analysis.metrics.complexity.toFixed(1)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Maintainability</p>
                    <p className="text-2xl font-bold">
                      {analysis.metrics.maintainability.toFixed(1)}%
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Duplicate Code</p>
                    <p className="text-2xl font-bold">
                      {analysis.metrics.duplicateCode.toFixed(1)}%
                    </p>
                  </div>
                </div>
              </Card>

              <Tabs defaultValue="issues">
                <TabsList>
                  <TabsTrigger value="issues">Issues ({analysis.issues.length})</TabsTrigger>
                  <TabsTrigger value="suggestions">Suggestions ({analysis.suggestions.length})</TabsTrigger>
                </TabsList>

                <TabsContent value="issues">
                  <ScrollArea className="h-[500px]">
                    <div className="space-y-4">
                      {analysis.issues.map((issue, index) => (
                        <Alert key={index} variant={issue.type === 'error' ? 'destructive' : 'default'}>
                          <AlertTitle className="flex items-center gap-2">
                            <Badge variant={
                              issue.type === 'error' ? 'destructive' : 
                              issue.type === 'warning' ? 'warning' : 
                              'default'
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
                                  variant="outline" 
                                  size="sm" 
                                  className="mt-2"
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
                        {new Date(fix.timestamp).toLocaleString()}
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
  )
}