import { AgentType } from '@prisma/client'
import { create } from 'zustand'

interface AgentMetric {
  timestamp: number
  success: boolean
  duration: number
  type: string
  department: string
  details: Record<string, any>
}

interface AgentAnalytics {
  metrics: AgentMetric[]
  performance: {
    successRate: number
    avgResponseTime: number
    tasksCompleted: number
  }
}

interface AgentStore {
  agentMetrics: Record<string, AgentAnalytics>
  addMetric: (agentId: string, metric: AgentMetric) => void
  getPerformance: (agentId: string) => AgentAnalytics['performance'] | null
}

export const useAgentStore = create<AgentStore>((set, get) => ({
  agentMetrics: {},
  
  addMetric: (agentId: string, metric: AgentMetric) => {
    set((state) => {
      const current = state.agentMetrics[agentId] || { metrics: [], performance: {
        successRate: 0,
        avgResponseTime: 0,
        tasksCompleted: 0
      }}
      
      const metrics = [...current.metrics, metric].slice(-1000) // Keep last 1000 metrics
      
      // Recalculate performance
      const performance = {
        successRate: metrics.filter(m => m.success).length / metrics.length * 100,
        avgResponseTime: metrics.reduce((acc, m) => acc + m.duration, 0) / metrics.length,
        tasksCompleted: metrics.length
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
  }
}))