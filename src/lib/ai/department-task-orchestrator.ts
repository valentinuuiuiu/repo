import { AgentType } from '@prisma/client'
import { AgentCoordinator } from './agent-coordinator'
import { departmentAgentConfigs } from './department-agents'
import { useAgentStore } from './agent-monitoring'

interface TaskDefinition {
  id: string
  name: string
  department: string
  requiredAgents: AgentType[]
  steps: {
    id: string
    agentType: AgentType
    action: string
    requiredData: string[]
    dependsOn: string[]
    timeout: number
  }[]
}

interface TaskContext {
  taskId: string
  departmentId: string
  data: Record<string, any>
  status: 'pending' | 'in-progress' | 'completed' | 'failed'
  stepResults: Record<string, any>
}

export class DepartmentTaskOrchestrator {
  private coordinator: AgentCoordinator
  private tasks: Map<string, TaskContext> = new Map()

  constructor(departmentId: string) {
    this.coordinator = new AgentCoordinator(departmentId)
  }

  async executeTask(definition: TaskDefinition, initialData: Record<string, any>) {
    const context: TaskContext = {
      taskId: crypto.randomUUID(),
      departmentId: definition.department,
      data: initialData,
      status: 'pending',
      stepResults: {}
    }

    this.tasks.set(context.taskId, context)

    try {
      context.status = 'in-progress'
      
      // Create a graph of task dependencies
      const graph = new Map(
        definition.steps.map(step => [
          step.id,
          { step, dependencies: step.dependsOn, completed: false }
        ])
      )

      // Execute steps based on dependencies
      while ([...graph.values()].some(node => !node.completed)) {
        const readySteps = [...graph.entries()].filter(([_, node]) => {
          return !node.completed && 
                 node.dependencies.every(depId => 
                   graph.get(depId)?.completed
                 )
        })

        if (readySteps.length === 0) {
          throw new Error('Deadlock detected in task execution')
        }

        // Execute ready steps in parallel
        await Promise.all(
          readySteps.map(async ([stepId, { step }]) => {
            try {
              const result = await this.executeStep(step, context)
              context.stepResults[stepId] = result
              graph.get(stepId)!.completed = true

              // Log metrics
              useAgentStore.getState().addMetric(step.agentType, {
                timestamp: Date.now(),
                success: true,
                duration: result.duration,
                type: step.action,
                department: definition.department,
                details: { taskId: context.taskId, stepId }
              })
            } catch (error) {
              useAgentStore.getState().addMetric(step.agentType, {
                timestamp: Date.now(),
                success: false,
                duration: 0,
                type: step.action,
                department: definition.department,
                details: { taskId: context.taskId, stepId, error }
              })
              throw error
            }
          })
        )
      }

      context.status = 'completed'
      return context.stepResults

    } catch (error) {
      context.status = 'failed'
      throw error
    }
  }

  private async executeStep(
    step: TaskDefinition['steps'][0], 
    context: TaskContext
  ) {
    const startTime = Date.now()
    
    // Find available agent of required type
    const message = {
      action: step.action,
      data: {
        ...context.data,
        stepResults: context.stepResults
      },
      priority: 5
    }

    // Request execution from appropriate agent
    const responsePromise = new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error(`Step ${step.id} timed out after ${step.timeout}ms`))
      }, step.timeout)

      const cleanup = this.coordinator.subscribe('orchestrator', (msg) => {
        if (msg.type === 'response' && msg.payload.action === step.action) {
          clearTimeout(timeout)
          cleanup()
          resolve(msg.payload.data)
        }
      })
    })

    // Broadcast task to all agents of required type
    await this.coordinator.broadcast('orchestrator', message)

    const result = await responsePromise
    return {
      result,
      duration: Date.now() - startTime
    }
  }

  getTaskStatus(taskId: string) {
    return this.tasks.get(taskId)?.status || null
  }

  getTaskResults(taskId: string) {
    return this.tasks.get(taskId)?.stepResults || null
  }
}