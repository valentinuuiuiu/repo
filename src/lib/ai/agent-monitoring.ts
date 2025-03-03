import { AgentType } from '@prisma/client'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

/**
 * Represents a single metric data point for an agent
 */
export interface AgentMetric {
  timestamp: number
  success: boolean
  duration: number
  type: string
  department: string
  details: Record<string, any>
}

/**
 * Represents analytics data for an agent
 */
export interface AgentAnalytics {
  metrics: AgentMetric[]
  performance: {
    successRate: number
    avgResponseTime: number
    tasksCompleted: number
    lastUpdated: number
  }
}

/**
 * Store for agent metrics and performance data
 */
interface AgentStore {
  agentMetrics: Record<string, AgentAnalytics>
  addMetric: (agentId: string, metric: AgentMetric) => void
  getPerformance: (agentId: string) => AgentAnalytics['performance'] | null
  getMetrics: (agentId: string, limit?: number) => AgentMetric[]
  clearMetrics: (agentId: string) => void
}

/**
 * Zustand store for agent monitoring
 * Uses persist middleware to save metrics between sessions
 */
export const useAgentStore = create<AgentStore>()(
  persist(
    (set, get) => ({
      agentMetrics: {},
      
      addMetric: (agentId: string, metric: AgentMetric) => {
        set((state) => {
          const current = state.agentMetrics[agentId] || { 
            metrics: [], 
            performance: {
              successRate: 0,
              avgResponseTime: 0,
              tasksCompleted: 0,
              lastUpdated: Date.now()
            }
          }
          
          // Add new metric and keep last 1000
          const metrics = [metric, ...current.metrics].slice(0, 1000)
          
          // Recalculate performance
          const successCount = metrics.filter(m => m.success).length
          const performance = {
            successRate: metrics.length > 0 ? (successCount / metrics.length) * 100 : 0,
            avgResponseTime: metrics.length > 0 
              ? metrics.reduce((acc, m) => acc + m.duration, 0) / metrics.length 
              : 0,
            tasksCompleted: metrics.length,
            lastUpdated: Date.now()
          }
          
          return {
            agentMetrics: {
              ...state.agentMetrics,
              [agentId]: { metrics, performance }
            }
          }
        })
      },
      
      getPerformance: (agentId: string) => {
        return get().agentMetrics[agentId]?.performance || null
      },
      
      getMetrics: (agentId: string, limit: number = 100) => {
        const metrics = get().agentMetrics[agentId]?.metrics || []
        return metrics.slice(0, limit)
      },
      
      clearMetrics: (agentId: string) => {
        set((state) => {
          const { [agentId]: _, ...rest } = state.agentMetrics
          return { agentMetrics: rest }
        })
      }
    }),
    {
      name: 'agent-metrics-storage',
      partialize: (state) => ({ 
        // Only persist the performance data, not all metrics
        agentMetrics: Object.fromEntries(
          Object.entries(state.agentMetrics).map(([id, data]) => [
            id, 
            { 
              performance: data.performance,
              // Only keep the last 10 metrics in storage
              metrics: data.metrics.slice(0, 10)
            }
          ])
        )
      })
    }
  )
)