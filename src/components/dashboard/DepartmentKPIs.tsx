import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { DepartmentAnalytics } from "@/lib/analytics/department-analytics"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  ArrowUp, ArrowDown, 
  TrendingUp, TrendingDown,
  DollarSign, Package, 
  ShoppingCart, UserCheck,
  Clock, AlertCircle
} from "lucide-react"

const departmentKPIs = {
  FASHION: [
    {
      id: 'sell_through_rate',
      name: 'Sell-Through Rate',
      target: 75,
      format: 'percentage',
      icon: TrendingUp,
      category: 'inventory'
    },
    {
      id: 'avg_order_value',
      name: 'Average Order Value',
      target: 150,
      format: 'currency',
      icon: DollarSign,
      category: 'sales'
    },
    {
      id: 'inventory_turnover',
      name: 'Inventory Turnover',
      target: 6,
      format: 'number',
      icon: Package,
      category: 'inventory'
    },
    {
      id: 'return_rate',
      name: 'Return Rate',
      target: 5,
      format: 'percentage',
      icon: ShoppingCart,
      category: 'quality'
    }
  ],
  ELECTRONICS: [
    {
      id: 'gross_margin',
      name: 'Gross Margin',
      target: 35,
      format: 'percentage',
      icon: DollarSign,
      category: 'financial'
    },
    {
      id: 'defect_rate',
      name: 'Defect Rate',
      target: 1,
      format: 'percentage',
      icon: AlertCircle,
      category: 'quality'
    },
    {
      id: 'customer_satisfaction',
      name: 'Customer Satisfaction',
      target: 90,
      format: 'percentage',
      icon: UserCheck,
      category: 'service'
    },
    {
      id: 'supplier_lead_time',
      name: 'Supplier Lead Time',
      target: 14,
      format: 'days',
      icon: Clock,
      category: 'operations'
    }
  ],
  HOME: [
    {
      id: 'shipping_time',
      name: 'Avg. Shipping Time',
      target: 5,
      format: 'days',
      icon: Clock,
      category: 'logistics'
    },
    {
      id: 'inventory_accuracy',
      name: 'Inventory Accuracy',
      target: 98,
      format: 'percentage',
      icon: Package,
      category: 'inventory'
    },
    {
      id: 'order_fill_rate',
      name: 'Order Fill Rate',
      target: 95,
      format: 'percentage',
      icon: ShoppingCart,
      category: 'operations'
    }
  ],
  BEAUTY: [
    {
      id: 'shelf_life_compliance',
      name: 'Shelf Life Compliance',
      target: 100,
      format: 'percentage',
      icon: Clock,
      category: 'quality'
    },
    {
      id: 'customer_complaints',
      name: 'Customer Complaints',
      target: 0.5,
      format: 'percentage',
      icon: AlertCircle,
      category: 'service'
    },
    {
      id: 'stock_availability',
      name: 'Stock Availability',
      target: 98,
      format: 'percentage',
      icon: Package,
      category: 'inventory'
    }
  ]
}

interface KPIData {
  value: number
  trend: number
  status: 'good' | 'warning' | 'critical'
  historicalData: { timestamp: string; value: number }[]
}

export function DepartmentKPIs({ 
  departmentId,
  departmentType 
}: { 
  departmentId: string
  departmentType: keyof typeof departmentKPIs
}) {
  const [timeRange, setTimeRange] = useState<"24h" | "7d" | "30d">("24h")
  const [kpiData, setKPIData] = useState<Record<string, KPIData>>({})

  useEffect(() => {
    const loadKPIData = async () => {
      // Get analytics data
      const metrics = await DepartmentAnalytics.getMetrics(departmentId, timeRange)
      
      // Transform metrics into KPI data
      const kpis = departmentKPIs[departmentType].reduce((acc, kpi) => {
        const data = metrics[kpi.category]?.[kpi.id]
        if (data) {
          const currentValue = data[data.length - 1]?.value || 0
          const previousValue = data[0]?.value || 0
          const trend = ((currentValue - previousValue) / previousValue) * 100

          acc[kpi.id] = {
            value: currentValue,
            trend,
            status: getKPIStatus(currentValue, kpi.target, kpi.id),
            historicalData: data
          }
        }
        return acc
      }, {} as Record<string, KPIData>)

      setKPIData(kpis)
    }

    loadKPIData()
    const interval = setInterval(loadKPIData, 300000) // Update every 5 minutes
    return () => clearInterval(interval)
  }, [departmentId, departmentType, timeRange])

  const getKPIStatus = (value: number, target: number, kpiId: string): KPIData['status'] => {
    // Different KPIs might have different thresholds
    const thresholds = {
      return_rate: { warning: 10, critical: 15 },
      defect_rate: { warning: 2, critical: 5 },
      default: { warning: target * 0.9, critical: target * 0.8 }
    }

    const { warning, critical } = thresholds[kpiId as keyof typeof thresholds] || thresholds.default
    
    if (value >= target) return 'good'
    if (value >= warning) return 'warning'
    return 'critical'
  }

  const formatValue = (value: number, format: string) => {
    switch (format) {
      case 'percentage':
        return `${value.toFixed(1)}%`
      case 'currency':
        return `$${value.toFixed(2)}`
      case 'days':
        return `${value.toFixed(1)}d`
      default:
        return value.toFixed(1)
    }
  }

  const renderTrendIndicator = (trend: number) => {
    const Icon = trend >= 0 ? ArrowUp : ArrowDown
    const color = trend >= 0 ? 'text-green-500' : 'text-red-500'
    return (
      <div className={`flex items-center ${color}`}>
        <Icon className="h-4 w-4 mr-1" />
        <span>{Math.abs(trend).toFixed(1)}%</span>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Department KPIs</h2>
        <Select value={timeRange} onValueChange={(value: "24h" | "7d" | "30d") => setTimeRange(value)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select time range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="24h">Last 24 Hours</SelectItem>
            <SelectItem value="7d">Last 7 Days</SelectItem>
            <SelectItem value="30d">Last 30 Days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {departmentKPIs[departmentType].map(kpi => {
          const data = kpiData[kpi.id]
          if (!data) return null

          return (
            <Card key={kpi.id} className="p-6">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <kpi.icon className="h-5 w-5 text-muted-foreground" />
                    <span className="font-medium">{kpi.name}</span>
                  </div>
                  <div className="text-2xl font-bold">
                    {formatValue(data.value, kpi.format)}
                  </div>
                </div>
                <Badge variant={
                  data.status === 'good' ? 'success' :
                  data.status === 'warning' ? 'warning' :
                  'destructive'
                }>
                  {data.status}
                </Badge>
              </div>

              <div className="mt-4">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-muted-foreground">Target: {formatValue(kpi.target, kpi.format)}</span>
                  {renderTrendIndicator(data.trend)}
                </div>
                <Progress 
                  value={(data.value / kpi.target) * 100} 
                  className={
                    data.status === 'good' ? 'bg-green-100' :
                    data.status === 'warning' ? 'bg-yellow-100' :
                    'bg-red-100'
                  }
                />
              </div>

              <div className="mt-4">
                <div className="h-[50px]">
                  {/* Add sparkline chart here */}
                </div>
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}