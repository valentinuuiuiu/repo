import { useState, useEffect } from "react"
import { DepartmentRecommendationEngine } from "@/lib/analytics/department-recommendations"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { CheckCircle, AlertCircle, ArrowUpCircle, Clock, Activity } from "lucide-react"

interface Recommendation {
  id: string
  type: 'pricing' | 'inventory' | 'supplier' | 'workflow' | 'agent'
  priority: 1 | 2 | 3
  title: string
  description: string
  impact: {
    metric: string
    estimatedImprovement: number
  }
  suggestedActions: string[]
  metadata?: Record<string, any>
  status?: 'pending' | 'implementing' | 'completed' | 'failed'
}

export function DepartmentRecommendations({ departmentId }: { departmentId: string }) {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([])
  const [activeRec, setActiveRec] = useState<Recommendation | null>(null)
  const [implementationStatus, setImplementationStatus] = useState<Record<string, any>>({})
  const [engine] = useState(() => new DepartmentRecommendationEngine(departmentId))

  useEffect(() => {
    const loadRecommendations = async () => {
      const recs = await engine.generateRecommendations()
      setRecommendations(recs)
    }
    loadRecommendations()
  }, [departmentId])

  const implementRecommendation = async (rec: Recommendation) => {
    try {
      const status = await engine.implementRecommendation(rec.id)
      setImplementationStatus(prev => ({
        ...prev,
        [rec.id]: status
      }))
      // Refresh recommendations list
      const recs = await engine.generateRecommendations()
      setRecommendations(recs)
    } catch (error) {
      console.error('Implementation failed:', error)
    }
  }

  const getPriorityColor = (priority: number) => {
    switch (priority) {
      case 1: return 'text-red-500'
      case 2: return 'text-yellow-500'
      case 3: return 'text-blue-500'
      default: return 'text-gray-500'
    }
  }

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'implementing':
        return <Activity className="h-5 w-5 text-blue-500 animate-pulse" />
      case 'failed':
        return <AlertCircle className="h-5 w-5 text-red-500" />
      default:
        return <Clock className="h-5 w-5 text-gray-500" />
    }
  }

  return (
    <div className="grid grid-cols-3 gap-6 p-6">
      <Card className="col-span-1">
        <div className="p-4 border-b">
          <h3 className="text-lg font-medium">Recommendations</h3>
          <p className="text-sm text-muted-foreground">
            AI-powered suggestions to improve department performance
          </p>
        </div>
        <ScrollArea className="h-[600px]">
          <div className="p-4 space-y-4">
            {recommendations.map(rec => (
              <Card
                key={rec.id}
                className={`p-4 cursor-pointer transition-colors hover:bg-muted/50 ${
                  activeRec?.id === rec.id ? 'border-primary' : ''
                }`}
                onClick={() => setActiveRec(rec)}
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(rec.status)}
                      <span className="font-medium">{rec.title}</span>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {rec.description}
                    </p>
                  </div>
                  <Badge variant="outline" className={getPriorityColor(rec.priority)}>
                    P{rec.priority}
                  </Badge>
                </div>
                
                <div className="mt-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Expected Impact</span>
                    <span className="font-medium text-green-600">
                      +{rec.impact.estimatedImprovement}%
                    </span>
                  </div>
                  <Progress 
                    value={rec.impact.estimatedImprovement} 
                    className="mt-2"
                  />
                </div>
              </Card>
            ))}
          </div>
        </ScrollArea>
      </Card>

      <Card className="col-span-2">
        {activeRec ? (
          <div className="p-6 space-y-6">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-2xl font-bold">{activeRec.title}</h2>
                <p className="text-muted-foreground mt-1">
                  {activeRec.description}
                </p>
              </div>
              <Button
                onClick={() => implementRecommendation(activeRec)}
                disabled={activeRec.status === 'implementing'}
              >
                Implement Recommendation
              </Button>
            </div>

            <Tabs defaultValue="actions">
              <TabsList>
                <TabsTrigger value="actions">Suggested Actions</TabsTrigger>
                <TabsTrigger value="impact">Impact Analysis</TabsTrigger>
                <TabsTrigger value="progress">Implementation Progress</TabsTrigger>
              </TabsList>

              <TabsContent value="actions" className="space-y-4">
                {activeRec.suggestedActions.map((action, index) => (
                  <Card key={index} className="p-4">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                        {index + 1}
                      </div>
                      <span>{action}</span>
                    </div>
                  </Card>
                ))}
              </TabsContent>

              <TabsContent value="impact">
                <Card className="p-4">
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium">Target Metric</h4>
                      <p className="text-muted-foreground">{activeRec.impact.metric}</p>
                    </div>
                    <div>
                      <h4 className="font-medium">Estimated Improvement</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <ArrowUpCircle className="h-5 w-5 text-green-500" />
                        <span className="text-2xl font-bold text-green-600">
                          +{activeRec.impact.estimatedImprovement}%
                        </span>
                      </div>
                    </div>
                    {activeRec.metadata?.confidence && (
                      <div>
                        <h4 className="font-medium">Confidence Score</h4>
                        <Progress 
                          value={activeRec.metadata.confidence * 100} 
                          className="mt-2"
                        />
                      </div>
                    )}
                  </div>
                </Card>
              </TabsContent>

              <TabsContent value="progress">
                <Card className="p-4">
                  {implementationStatus[activeRec.id]?.workflowSteps ? (
                    <div className="space-y-4">
                      {implementationStatus[activeRec.id].workflowSteps.map((step: any, index: number) => (
                        <div key={index} className="flex items-center gap-4">
                          <div className={`h-2 w-2 rounded-full ${
                            step.status === 'completed' ? 'bg-green-500' :
                            step.status === 'in-progress' ? 'bg-blue-500' :
                            'bg-gray-300'
                          }`} />
                          <span>{step.action}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center text-muted-foreground py-8">
                      Implementation not started
                    </div>
                  )}
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            Select a recommendation to view details
          </div>
        )}
      </Card>
    </div>
  )
}