import { prisma } from '@/lib/prisma'
import { Redis } from '@upstash/redis'
import { AgentType } from '@prisma/client'

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || '',
  token: process.env.UPSTASH_REDIS_REST_TOKEN || ''
})

interface AnalyticsEvent {
  departmentId: string
  eventType: 'revenue' | 'order' | 'product_view' | 'agent_task' | 'supplier_fulfillment'
  value: number
  metadata?: Record<string, any>
  timestamp: Date
}

export class DepartmentAnalytics {
  private static RETENTION_DAYS = 90
  private static readonly METRICS_KEY = (deptId: string) => `dept:${deptId}:metrics`
  private static readonly HOURLY_KEY = (deptId: string) => `dept:${deptId}:hourly`
  private static readonly DAILY_KEY = (deptId: string) => `dept:${deptId}:daily`

  static async trackEvent(event: AnalyticsEvent) {
    const { departmentId, eventType, value, metadata, timestamp } = event
    
    // Store raw event
    await prisma.analyticsEvent.create({
      data: {
        departmentId,
        type: eventType,
        value,
        metadata,
        timestamp
      }
    })

    // Update real-time metrics
    await this.updateMetrics(departmentId, eventType, value, timestamp)
  }

  private static async updateMetrics(
    departmentId: string,
    eventType: string,
    value: number,
    timestamp: Date
  ) {
    const hour = timestamp.getHours()
    const day = timestamp.getDate()
    
    // Update hourly aggregates
    await redis.hincrby(
      `${this.HOURLY_KEY(departmentId)}:${day}`,
      `${eventType}:${hour}`,
      value
    )
    
    // Update daily aggregates
    await redis.hincrby(
      this.DAILY_KEY(departmentId),
      `${eventType}:${day}`,
      value
    )

    // Cleanup old data
    this.cleanupOldData(departmentId)
  }

  static async getMetrics(
    departmentId: string,
    timeRange: "24h" | "7d" | "30d" | "90d"
  ) {
    const now = new Date()
    const metrics = {
      performance: {
        revenue: [],
        orders: [],
        productViews: [],
        conversion: []
      },
      agents: {
        taskSuccess: [],
        responseTime: [],
        costSavings: []
      },
      suppliers: {
        fulfillmentRate: [],
        qualityScore: [],
        leadTime: []
      }
    }

    if (timeRange === "24h") {
      // Get hourly data for last 24 hours
      const day = now.getDate()
      const hourlyData = await redis.hgetall(
        `${this.HOURLY_KEY(departmentId)}:${day}`
      )

      // Process hourly data
      for (let i = 0; i < 24; i++) {
        const hour = (now.getHours() - i + 24) % 24
        metrics.performance.revenue.push({
          timestamp: new Date(now.getTime() - i * 3600000).toLocaleString(),
          value: parseInt(hourlyData[`revenue:${hour}`] || '0')
        })
        // Add other metrics...
      }
    } else {
      // Get daily data
      const days = timeRange === "7d" ? 7 : timeRange === "30d" ? 30 : 90
      const dailyData = await redis.hgetall(this.DAILY_KEY(departmentId))

      // Process daily data
      for (let i = 0; i < days; i++) {
        const day = (now.getDate() - i + 31) % 31
        metrics.performance.revenue.push({
          timestamp: new Date(now.getTime() - i * 86400000).toLocaleString(),
          value: parseInt(dailyData[`revenue:${day}`] || '0')
        })
        // Add other metrics...
      }
    }

    return metrics
  }

  static async getAgentPerformance(departmentId: string, timeRange: string) {
    const agentMetrics = await prisma.analyticsEvent.groupBy({
      by: ['metadata'],
      where: {
        departmentId,
        type: 'agent_task',
        timestamp: {
          gte: new Date(Date.now() - this.getTimeRangeMs(timeRange))
        }
      },
      _avg: {
        value: true
      },
      _count: true
    })

    return agentMetrics
  }

  static async getSupplierMetrics(departmentId: string, timeRange: string) {
    const supplierMetrics = await prisma.analyticsEvent.groupBy({
      by: ['metadata'],
      where: {
        departmentId,
        type: 'supplier_fulfillment',
        timestamp: {
          gte: new Date(Date.now() - this.getTimeRangeMs(timeRange))
        }
      },
      _avg: {
        value: true
      }
    })

    return supplierMetrics
  }

  private static getTimeRangeMs(timeRange: string) {
    switch (timeRange) {
      case "24h": return 24 * 60 * 60 * 1000
      case "7d": return 7 * 24 * 60 * 60 * 1000
      case "30d": return 30 * 24 * 60 * 60 * 1000
      case "90d": return 90 * 24 * 60 * 60 * 1000
      default: return 24 * 60 * 60 * 1000
    }
  }

  private static async cleanupOldData(departmentId: string) {
    const cutoff = new Date(Date.now() - this.RETENTION_DAYS * 24 * 60 * 60 * 1000)
    
    // Cleanup database
    await prisma.analyticsEvent.deleteMany({
      where: {
        departmentId,
        timestamp: {
          lt: cutoff
        }
      }
    })

    // Cleanup Redis
    const oldKeys = await redis.keys(`${this.HOURLY_KEY(departmentId)}:*`)
    for (const key of oldKeys) {
      const day = parseInt(key.split(':').pop() || '0')
      if (day < cutoff.getDate()) {
        await redis.del(key)
      }
    }
  }
}