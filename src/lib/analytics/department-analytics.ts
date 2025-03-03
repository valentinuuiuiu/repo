import { PrismaClient } from '@prisma/client'
import { AgentType } from '@prisma/client'
import dayjs from 'dayjs'

const prisma = new PrismaClient()

interface AnalyticsEvent {
  timestamp: string
  value: number
  metadata?: Record<string, any>
}

interface DepartmentMetrics {
  hourlyData: AnalyticsEvent[]
  dailyData: AnalyticsEvent[]
  totalEvents: number
  avgValue: number
}

const METRICS_RETENTION_DAYS = 30

export class DepartmentAnalytics {
  static async recordEvent(
    departmentId: string,
    type: string,
    value: number,
    metadata?: Record<string, any>
  ) {
    await prisma.$transaction([
      prisma.analyticsEvent.create({
        data: {
          departmentId,
          type,
          value,
          metadata,
          timestamp: new Date()
        }
      }),
      // Clean up old events
      prisma.analyticsEvent.deleteMany({
        where: {
          departmentId,
          timestamp: {
            lt: dayjs().subtract(METRICS_RETENTION_DAYS, 'day').toDate()
          }
        }
      })
    ])
  }

  static async getHourlyMetrics(
    departmentId: string,
    type: string,
    timeframe: string
  ): Promise<AnalyticsEvent[]> {
    const startDate = dayjs().subtract(1, timeframe).toDate()

    const events = await prisma.analyticsEvent.groupBy({
      by: ['timestamp'],
      where: {
        departmentId,
        type,
        timestamp: { gte: startDate }
      },
      _avg: { value: true },
      orderBy: { timestamp: 'asc' }
    })

    return events.map(e => ({
      timestamp: e.timestamp.toISOString(),
      value: e._avg.value || 0
    }))
  }

  static async getDailyMetrics(
    departmentId: string,
    type: string,
    timeframe: string
  ): Promise<AnalyticsEvent[]> {
    const startDate = dayjs().subtract(1, timeframe).toDate()

    const events = await prisma.analyticsEvent.groupBy({
      by: ['timestamp'],
      where: {
        departmentId,
        type,
        timestamp: { gte: startDate }
      },
      _avg: { value: true },
      orderBy: { timestamp: 'asc' }
    })

    return events.map(e => ({
      timestamp: e.timestamp.toISOString(),
      value: e._avg.value || 0
    }))
  }

  static async getDepartmentMetrics(
    departmentId: string,
    timeframe: string
  ): Promise<DepartmentMetrics> {
    const startDate = dayjs().subtract(1, timeframe).toDate()

    const [hourlyData, dailyData, totals] = await Promise.all([
      this.getHourlyMetrics(departmentId, 'all', timeframe),
      this.getDailyMetrics(departmentId, 'all', timeframe),
      prisma.analyticsEvent.aggregate({
        where: {
          departmentId,
          timestamp: { gte: startDate }
        },
        _count: true,
        _avg: { value: true }
      })
    ])

    return {
      hourlyData,
      dailyData,
      totalEvents: totals._count,
      avgValue: totals._avg.value || 0
    }
  }

  static async getAgentPerformance(departmentId: string, agentId: string): Promise<number> {
    const thirtyDaysAgo = dayjs().subtract(30, 'days').toDate()
    
    const metrics = await prisma.analyticsEvent.aggregate({
      where: {
        departmentId,
        metadata: {
          path: ['agentId'],
          equals: agentId
        },
        timestamp: { gte: thirtyDaysAgo }
      },
      _avg: { value: true }
    })

    return metrics._avg.value || 0
  }
}