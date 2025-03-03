import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DepartmentSupplierManager } from "@/lib/suppliers/department-supplier-manager"
import { LineChart, Line, BarChart, Bar, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts"
import { 
  TrendingUp,
  TrendingDown,
  AlertCircle,
  CheckCircle2,
  Timer,
  DollarSign,
  Truck,
  RotateCcw,
  MessageCircle
} from "lucide-react"

interface SupplierMetrics {
  fulfillmentRate: number
  qualityScore: number
  responseTime: number
  pricingCompetitiveness: number
  leadTime: number
  returnRate: number
  communicationScore: number
}

interface SupplierRanking {
  score: number
  rank: number
  strengths: string[]
  improvements: string[]
}

const DepartmentSupplierDashboard = ({
  departmentId,
  departmentType
}: {
  departmentId: string
  departmentType: string
}) => {
  const [supplierMetrics, setSupplierMetrics] = useState<Record<string, SupplierMetrics>>({})
  const [rankings, setRankings] = useState<Record<string, SupplierRanking>>({})
  const [selectedSupplier, setSelectedSupplier] = useState<string | null>(null)
  const [historicalData, setHistoricalData] = useState<any[]>([])
  const [optimizationRecommendations, setOptimizationRecommendations] = useState<any[]>([])
  const [manager] = useState(() => new DepartmentSupplierManager(departmentId, departmentType))

  useEffect(() => {
    const loadData = async () => {
      // Get rankings and metrics for all suppliers
      const newRankings = await manager.rankSuppliers()
      setRankings(newRankings)

      // Get optimization recommendations
      const recommendations = await manager.optimizeSupplierAllocation()
      setOptimizationRecommendations(recommendations)

      // Load metrics for each supplier
      const metrics: Record<string, SupplierMetrics> = {}
      for (const supplierId of Object.keys(newRankings)) {
        metrics[supplierId] = await manager.evaluateSupplier(supplierId)
      }
      setSupplierMetrics(metrics)
    }

    loadData()
    // Start supplier health monitoring
    manager.monitorSupplierHealth()
  }, [departmentId])

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-500'
    if (score >= 75) return 'text-yellow-500'
    return 'text-red-500'
  }

  const getMetricIcon = (metricName: string) => {
    switch (metricName) {
      case 'fulfillmentRate': return <CheckCircle2 className="h-5 w-5" />
      case 'qualityScore': return <AlertCircle className="h-5 w-5" />
      case 'responseTime': return <Timer className="h-5 w-5" />
      case 'pricingCompetitiveness': return <DollarSign className="h-5 w-5" />
      case 'leadTime': return <Truck className="h-5 w-5" />
      case 'returnRate': return <RotateCcw className="h-5 w-5" />
      case 'communicationScore': return <MessageCircle className="h-5 w-5" />
      default: return null
    }
  }

  const formatMetricValue = (name: string, value: number) => {
    switch (name) {
      case 'responseTime':
      case 'leadTime':
        return `${value.toFixed(1)} days`
      case 'returnRate':
      case 'fulfillmentRate':
        return `${value.toFixed(1)}%`
      default:
        return value.toFixed(1)
    }
  }

  return (
    <div className="grid grid-cols-3 gap-6 p-6">
      <div className="col-span-1">
        <Card>
          <div className="p-4 border-b">
            <h3 className="text-lg font-medium">Supplier Rankings</h3>
          </div>
          <ScrollArea className="h-[600px]">
            <div className="p-4 space-y-4">
              {Object.entries(rankings)
                .sort(([, a], [, b]) => a.rank - b.rank)
                .map(([supplierId, ranking]) => (
                  <Card
                    key={supplierId}
                    className={`p-4 cursor-pointer transition-colors hover:bg-muted/50 ${
                      selectedSupplier === supplierId ? 'border-primary' : ''
                    }`}
                    onClick={() => setSelectedSupplier(supplierId)}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="font-medium">Supplier {supplierId}</div>
                        <div className="text-sm text-muted-foreground">
                          Rank #{ranking.rank}
                        </div>
                      </div>
                      <Badge className={getScoreColor(ranking.score)}>
                        {ranking.score.toFixed(1)}
                      </Badge>
                    </div>

                    {supplierMetrics[supplierId] && (
                      <div className="mt-4">
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span className="text-muted-foreground">Performance</span>
                          <span>{ranking.score.toFixed(1)}%</span>
                        </div>
                        <Progress value={ranking.score} />
                      </div>
                    )}
                  </Card>
                ))}
            </div>
          </ScrollArea>
        </Card>
      </div>

      <div className="col-span-2">
        {selectedSupplier && supplierMetrics[selectedSupplier] ? (
          <div className="space-y-6">
            <Card className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-2xl font-bold">Supplier {selectedSupplier}</h2>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="outline">
                      Rank #{rankings[selectedSupplier].rank}
                    </Badge>
                    <Badge className={getScoreColor(rankings[selectedSupplier].score)}>
                      Score: {rankings[selectedSupplier].score.toFixed(1)}
                    </Badge>
                  </div>
                </div>
                <Button>Contact Supplier</Button>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-6">
                {Object.entries(supplierMetrics[selectedSupplier]).map(([name, value]) => (
                  <Card key={name} className="p-4">
                    <div className="flex items-center gap-2">
                      {getMetricIcon(name)}
                      <div>
                        <div className="text-sm text-muted-foreground">
                          {name.replace(/([A-Z])/g, ' $1').trim()}
                        </div>
                        <div className="text-2xl font-bold">
                          {formatMetricValue(name, value)}
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </Card>

            <div className="grid grid-cols-2 gap-6">
              <Card className="p-4">
                <h3 className="text-lg font-medium mb-4">Strengths</h3>
                <div className="space-y-2">
                  {rankings[selectedSupplier].strengths.map((strength, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-green-500" />
                      <span>{strength}</span>
                    </div>
                  ))}
                </div>
              </Card>

              <Card className="p-4">
                <h3 className="text-lg font-medium mb-4">Areas for Improvement</h3>
                <div className="space-y-2">
                  {rankings[selectedSupplier].improvements.map((improvement, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <TrendingDown className="h-4 w-4 text-red-500" />
                      <span>{improvement}</span>
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            <Card>
              <Tabs defaultValue="performance">
                <div className="p-4 border-b">
                  <TabsList>
                    <TabsTrigger value="performance">Performance Trends</TabsTrigger>
                    <TabsTrigger value="quality">Quality Metrics</TabsTrigger>
                    <TabsTrigger value="delivery">Delivery Analysis</TabsTrigger>
                  </TabsList>
                </div>

                <TabsContent value="performance" className="p-4">
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={historicalData}>
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Line 
                        type="monotone" 
                        dataKey="performance" 
                        stroke="#2563eb" 
                        name="Performance Score" 
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </TabsContent>

                <TabsContent value="quality" className="p-4">
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={historicalData}>
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Bar 
                        dataKey="qualityScore" 
                        fill="#8b5cf6" 
                        name="Quality Score" 
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </TabsContent>

                <TabsContent value="delivery" className="p-4">
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={historicalData}>
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Line 
                        type="monotone" 
                        dataKey="fulfillmentRate" 
                        stroke="#16a34a" 
                        name="Fulfillment Rate" 
                      />
                      <Line 
                        type="monotone" 
                        dataKey="leadTime" 
                        stroke="#dc2626" 
                        name="Lead Time" 
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </TabsContent>
              </Tabs>
            </Card>

            {optimizationRecommendations.length > 0 && (
              <Card className="p-4">
                <h3 className="text-lg font-medium mb-4">Optimization Recommendations</h3>
                <div className="space-y-4">
                  {optimizationRecommendations
                    .filter(rec => rec.currentSupplierId === selectedSupplier)
                    .map((rec, index) => (
                      <Card key={index} className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium">Product {rec.productId}</div>
                            <div className="text-sm text-muted-foreground">
                              Potential improvement: {rec.improvement.toFixed(1)}%
                            </div>
                          </div>
                          <Button variant="outline" size="sm">
                            Review Change
                          </Button>
                        </div>
                      </Card>
                    ))}
                </div>
              </Card>
            )}
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            Select a supplier to view details
          </div>
        )}
      </div>
    </div>
  )
}

export default DepartmentSupplierDashboard;