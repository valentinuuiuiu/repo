import { EventEmitter } from 'events'
import { AgentCoordinator } from '../ai/agent-coordinator'
import { DepartmentAnalytics } from '../analytics/department-analytics'
import { prisma } from '../prisma'
import { Redis } from '@upstash/redis'

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || '',
  token: process.env.UPSTASH_REDIS_REST_TOKEN || ''
})

interface AutomationRule {
  id: string
  departmentId: string
  name: string
  trigger: {
    type: 'event' | 'schedule' | 'condition'
    config: Record<string, any>
  }
  actions: {
    type: string
    params: Record<string, any>
    retryConfig?: {
      maxAttempts: number
      backoffMs: number
    }
  }[]
  conditions?: {
    field: string
    operator: 'equals' | 'gt' | 'lt' | 'contains'
    value: any
  }[]
  priority: number
  enabled: boolean
}

export class DepartmentAutomation extends EventEmitter {
  private rules: Map<string, AutomationRule> = new Map()
  private coordinator: AgentCoordinator
  private processingJobs: Set<string> = new Set()

  constructor(private departmentId: string) {
    super()
    this.coordinator = new AgentCoordinator(departmentId)
  }

  async initialize() {
    // Load automation rules from database
    const rules = await prisma.automationRule.findMany({
      where: { departmentId: this.departmentId }
    })

    rules.forEach(rule => {
      this.rules.set(rule.id, rule as AutomationRule)
      if (rule.trigger.type === 'schedule') {
        this.scheduleRule(rule as AutomationRule)
      }
    })

    // Subscribe to department events
    this.coordinator.subscribe('automation', async (message) => {
      if (message.type === 'event') {
        await this.processEvent(message.payload)
      }
    })

    // Start monitoring conditions
    this.startConditionMonitoring()
  }

  private async processEvent(event: Record<string, any>) {
    const matchingRules = Array.from(this.rules.values())
      .filter(rule => 
        rule.enabled && 
        rule.trigger.type === 'event' &&
        this.matchesConditions(event, rule.conditions || [])
      )
      .sort((a, b) => a.priority - b.priority)

    for (const rule of matchingRules) {
      await this.executeRule(rule, event)
    }
  }

  private async executeRule(
    rule: AutomationRule, 
    context: Record<string, any>
  ) {
    const jobId = `${rule.id}:${Date.now()}`
    if (this.processsingJobs.has(jobId)) return

    this.processsingJobs.add(jobId)
    
    try {
      for (const action of rule.actions) {
        let attempts = 0
        const maxAttempts = action.retryConfig?.maxAttempts || 1
        
        while (attempts < maxAttempts) {
          try {
            await this.executeAction(action, context)
            break
          } catch (error) {
            attempts++
            if (attempts === maxAttempts) throw error
            
            // Exponential backoff
            const backoff = action.retryConfig?.backoffMs || 1000
            await new Promise(resolve => 
              setTimeout(resolve, backoff * Math.pow(2, attempts))
            )
          }
        }
      }

      // Track successful execution
      await DepartmentAnalytics.trackEvent({
        departmentId: this.departmentId,
        eventType: 'automation_success',
        value: 1,
        metadata: { ruleId: rule.id },
        timestamp: new Date()
      })

    } catch (error) {
      // Track failure
      await DepartmentAnalytics.trackEvent({
        departmentId: this.departmentId,
        eventType: 'automation_failure',
        value: 1,
        metadata: { ruleId: rule.id, error: error.message },
        timestamp: new Date()
      })

      throw error
    } finally {
      this.processsingJobs.delete(jobId)
    }
  }

  private async executeAction(
    action: AutomationRule['actions'][0],
    context: Record<string, any>
  ) {
    switch (action.type) {
      case 'update_inventory':
        await this.coordinator.sendDirectMessage(
          'automation',
          'inventory_manager',
          {
            action: 'update_inventory',
            data: {
              ...action.params,
              context
            },
            priority: 1
          }
        )
        break

      case 'notify_supplier':
        await this.coordinator.sendDirectMessage(
          'automation',
          'supplier_communication',
          {
            action: 'send_notification',
            data: {
              ...action.params,
              context
            },
            priority: 2
          }
        )
        break

      case 'adjust_pricing':
        await this.coordinator.sendDirectMessage(
          'automation',
          'pricing_optimizer',
          {
            action: 'adjust_price',
            data: {
              ...action.params,
              context
            },
            priority: 2
          }
        )
        break

      case 'quality_check':
        await this.coordinator.sendDirectMessage(
          'automation',
          'quality_control',
          {
            action: 'run_check',
            data: {
              ...action.params,
              context
            },
            priority: 1
          }
        )
        break

      default:
        throw new Error(`Unknown action type: ${action.type}`)
    }
  }

  private matchesConditions(
    event: Record<string, any>,
    conditions: AutomationRule['conditions']
  ): boolean {
    return conditions.every(condition => {
      const value = this.getNestedValue(event, condition.field)
      
      switch (condition.operator) {
        case 'equals':
          return value === condition.value
        case 'gt':
          return value > condition.value
        case 'lt':
          return value < condition.value
        case 'contains':
          return value?.includes?.(condition.value)
        default:
          return false
      }
    })
  }

  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((curr, key) => curr?.[key], obj)
  }

  private scheduleRule(rule: AutomationRule) {
    const { interval, startTime } = rule.trigger.config
    
    const schedule = async () => {
      if (!rule.enabled) return
      
      try {
        await this.executeRule(rule, {
          scheduledTime: new Date().toISOString()
        })
      } catch (error) {
        console.error(`Scheduled rule ${rule.id} failed:`, error)
      }

      // Schedule next run
      setTimeout(schedule, interval)
    }

    // Calculate initial delay
    const now = Date.now()
    const start = new Date(startTime).getTime()
    const delay = start > now ? start - now : interval - ((now - start) % interval)

    setTimeout(schedule, delay)
  }

  private async startConditionMonitoring() {
    const monitorInterval = 60000 // 1 minute

    setInterval(async () => {
      const conditionalRules = Array.from(this.rules.values())
        .filter(rule => rule.enabled && rule.trigger.type === 'condition')

      for (const rule of conditionalRules) {
        try {
          const conditions = await this.evaluateConditions(rule.trigger.config)
          if (conditions) {
            await this.executeRule(rule, { conditions })
          }
        } catch (error) {
          console.error(`Condition evaluation failed for rule ${rule.id}:`, error)
        }
      }
    }, monitorInterval)
  }

  private async evaluateConditions(config: Record<string, any>): Promise<boolean> {
    // Implement condition evaluation logic based on metrics, inventory, etc.
    return false
  }

  async createRule(rule: Omit<AutomationRule, 'id'>): Promise<AutomationRule> {
    const newRule = {
      ...rule,
      id: crypto.randomUUID()
    }

    await prisma.automationRule.create({
      data: newRule
    })

    this.rules.set(newRule.id, newRule)
    
    if (newRule.trigger.type === 'schedule') {
      this.scheduleRule(newRule)
    }

    return newRule
  }

  async updateRule(ruleId: string, updates: Partial<AutomationRule>): Promise<void> {
    const rule = this.rules.get(ruleId)
    if (!rule) throw new Error('Rule not found')

    const updatedRule = {
      ...rule,
      ...updates
    }

    await prisma.automationRule.update({
      where: { id: ruleId },
      data: updates
    })

    this.rules.set(ruleId, updatedRule)
  }

  async deleteRule(ruleId: string): Promise<void> {
    await prisma.automationRule.delete({
      where: { id: ruleId }
    })

    this.rules.delete(ruleId)
  }

  async getRules(): Promise<AutomationRule[]> {
    return Array.from(this.rules.values())
  }
}