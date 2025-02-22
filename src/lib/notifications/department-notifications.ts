import { Redis } from '@upstash/redis'
import { EventEmitter } from 'events'
import { AgentCoordinator } from '../ai/agent-coordinator'
import { DepartmentAnalytics } from '../analytics/department-analytics'

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || '',
  token: process.env.UPSTASH_REDIS_REST_TOKEN || ''
})

interface DepartmentAlert {
  id: string
  departmentId: string
  type: 'inventory' | 'quality' | 'pricing' | 'supplier' | 'agent' | 'system'
  priority: 'low' | 'medium' | 'high' | 'critical'
  title: string
  message: string
  metadata?: Record<string, any>
  timestamp: Date
  read: boolean
  actionTaken: boolean
}

const departmentAlertThresholds = {
  FASHION: {
    inventory: { low: 20, critical: 5 },
    returnRate: { warning: 10, critical: 15 },
    margin: { warning: 15, critical: 10 }
  },
  ELECTRONICS: {
    defectRate: { warning: 2, critical: 5 },
    stockouts: { warning: 5, critical: 10 },
    qualityScore: { warning: 85, critical: 75 }
  },
  HOME: {
    shippingDelay: { warning: 2, critical: 4 },
    damage: { warning: 3, critical: 5 },
    fulfillment: { warning: 90, critical: 85 }
  },
  BEAUTY: {
    expiry: { warning: 60, critical: 30 }, // days
    complaints: { warning: 2, critical: 5 },
    compliance: { warning: 95, critical: 90 }
  }
}

export class DepartmentNotifications extends EventEmitter {
  private coordinator: AgentCoordinator
  private alertsKey: string
  private settingsKey: string

  constructor(private departmentId: string, private departmentType: keyof typeof departmentAlertThresholds) {
    super()
    this.coordinator = new AgentCoordinator(departmentId)
    this.alertsKey = `dept:${departmentId}:alerts`
    this.settingsKey = `dept:${departmentId}:notification_settings`
  }

  async initialize() {
    // Subscribe to department events
    this.coordinator.subscribe('notifications', async (message) => {
      if (message.type === 'metric_update') {
        await this.checkThresholds(message.payload)
      }
    })

    // Start monitoring loop
    this.startMonitoring()
  }

  private async startMonitoring() {
    setInterval(async () => {
      const metrics = await DepartmentAnalytics.getMetrics(this.departmentId, "24h")
      await this.checkDepartmentMetrics(metrics)
    }, 300000) // Check every 5 minutes
  }

  private async checkDepartmentMetrics(metrics: any) {
    const thresholds = departmentAlertThresholds[this.departmentType]

    // Check inventory levels
    if (metrics.inventory?.stock < thresholds.inventory.critical) {
      await this.createAlert({
        type: 'inventory',
        priority: 'critical',
        title: 'Critical Low Stock',
        message: `Multiple products are below critical stock threshold`,
        metadata: { stockLevel: metrics.inventory.stock }
      })
    }

    // Department-specific checks
    switch (this.departmentType) {
      case 'FASHION':
        if (metrics.quality?.returnRate > thresholds.returnRate.critical) {
          await this.createAlert({
            type: 'quality',
            priority: 'critical',
            title: 'High Return Rate Alert',
            message: `Return rate has exceeded critical threshold`,
            metadata: { returnRate: metrics.quality.returnRate }
          })
        }
        break

      case 'ELECTRONICS':
        if (metrics.quality?.defectRate > thresholds.defectRate.critical) {
          await this.createAlert({
            type: 'quality',
            priority: 'critical',
            title: 'High Defect Rate Alert',
            message: `Product defect rate has exceeded critical threshold`,
            metadata: { defectRate: metrics.quality.defectRate }
          })
        }
        break

      case 'HOME':
        if (metrics.shipping?.delayRate > thresholds.shippingDelay.critical) {
          await this.createAlert({
            type: 'supplier',
            priority: 'high',
            title: 'Shipping Delays Alert',
            message: `Multiple orders experiencing shipping delays`,
            metadata: { delayRate: metrics.shipping.delayRate }
          })
        }
        break

      case 'BEAUTY':
        const expiryProducts = metrics.inventory?.nearExpiry || []
        if (expiryProducts.length > 0) {
          await this.createAlert({
            type: 'inventory',
            priority: 'high',
            title: 'Product Expiry Alert',
            message: `${expiryProducts.length} products approaching expiry date`,
            metadata: { products: expiryProducts }
          })
        }
        break
    }
  }

  private async checkThresholds(metricUpdate: any) {
    const thresholds = departmentAlertThresholds[this.departmentType]
    
    // Generic checks
    if (metricUpdate.type === 'agent_error') {
      await this.createAlert({
        type: 'agent',
        priority: 'high',
        title: 'AI Agent Error',
        message: `Agent ${metricUpdate.agentId} encountered an error`,
        metadata: { error: metricUpdate.error }
      })
    }

    // Department-specific threshold checks
    if (metricUpdate.type === 'inventory_update') {
      const { productId, stock } = metricUpdate
      if (stock <= thresholds.inventory.critical) {
        await this.createAlert({
          type: 'inventory',
          priority: 'critical',
          title: 'Critical Stock Alert',
          message: `Product ${productId} has reached critical stock level`,
          metadata: { productId, stock }
        })
      }
    }
  }

  async createAlert(alert: Omit<DepartmentAlert, 'id' | 'departmentId' | 'timestamp' | 'read' | 'actionTaken'>) {
    const newAlert: DepartmentAlert = {
      id: crypto.randomUUID(),
      departmentId: this.departmentId,
      ...alert,
      timestamp: new Date(),
      read: false,
      actionTaken: false
    }

    // Store alert
    await redis.zadd(
      this.alertsKey,
      { score: new Date().getTime(), member: JSON.stringify(newAlert) }
    )

    // Emit event for real-time updates
    this.emit('new_alert', newAlert)

    // Notify relevant agents
    await this.coordinator.broadcast('notifications', {
      action: 'process_alert',
      data: newAlert,
      priority: alert.priority === 'critical' ? 1 : 
               alert.priority === 'high' ? 2 :
               alert.priority === 'medium' ? 3 : 4
    })

    return newAlert
  }

  async getAlerts(options: {
    unreadOnly?: boolean
    type?: DepartmentAlert['type']
    priority?: DepartmentAlert['priority']
    limit?: number
  } = {}) {
    const { unreadOnly, type, priority, limit = 50 } = options

    // Get recent alerts
    const alerts = await redis.zrevrange(this.alertsKey, 0, limit - 1)
    
    let filtered = alerts
      .map(alert => JSON.parse(alert))
      .filter(alert => {
        if (unreadOnly && alert.read) return false
        if (type && alert.type !== type) return false
        if (priority && alert.priority !== priority) return false
        return true
      })

    return filtered
  }

  async markAsRead(alertId: string) {
    const alerts = await this.getAlerts()
    const alert = alerts.find(a => a.id === alertId)
    if (!alert) return false

    alert.read = true
    await redis.zadd(
      this.alertsKey,
      { score: new Date(alert.timestamp).getTime(), member: JSON.stringify(alert) }
    )

    return true
  }

  async markActionTaken(alertId: string) {
    const alerts = await this.getAlerts()
    const alert = alerts.find(a => a.id === alertId)
    if (!alert) return false

    alert.actionTaken = true
    await redis.zadd(
      this.alertsKey,
      { score: new Date(alert.timestamp).getTime(), member: JSON.stringify(alert) }
    )

    return true
  }

  async updateSettings(settings: Record<string, any>) {
    await redis.set(this.settingsKey, JSON.stringify(settings))
  }

  async getSettings(): Promise<Record<string, any>> {
    const settings = await redis.get(this.settingsKey)
    return settings ? JSON.parse(settings) : {}
  }
}