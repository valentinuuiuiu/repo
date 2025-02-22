import { Redis } from '@upstash/redis'
import type { AgentType } from '../types'
import { TaskType, Task } from '../types'

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || '',
  token: process.env.UPSTASH_REDIS_REST_TOKEN || ''
})

interface AgentMessage {
  id: string
  from: string
  to: string
  type: 'request' | 'response' | 'broadcast'
  department: string
  payload: {
    action: string
    data: Record<string, any>
    priority: number
  }
  timestamp: number
}

export class AgentCoordinator {
  private departmentChannel: string

  constructor(departmentId: string) {
    this.departmentChannel = `dept:${departmentId}:agents`
  }

  async broadcast(senderId: string, payload: AgentMessage['payload']) {
    const message: AgentMessage = {
      id: crypto.randomUUID(),
      from: senderId,
      to: 'all',
      type: 'broadcast',
      department: this.departmentChannel,
      payload,
      timestamp: Date.now()
    }
    
    await redis.publish(this.departmentChannel, JSON.stringify(message))
    await this.storeMessage(message)
  }

  async sendDirectMessage(
    from: string, 
    to: string, 
    payload: AgentMessage['payload']
  ) {
    const message: AgentMessage = {
      id: crypto.randomUUID(),
      from,
      to,
      type: 'request',
      department: this.departmentChannel,
      payload,
      timestamp: Date.now()
    }
    
    await redis.publish(`${this.departmentChannel}:${to}`, JSON.stringify(message))
    await this.storeMessage(message)
  }

  async subscribe(agentId: string, callback: (message: AgentMessage) => void) {
    // Subscribe to department-wide broadcasts
    const broadcastSub = redis.subscribe(this.departmentChannel, (message) => {
      const parsed = JSON.parse(message) as AgentMessage
      if (parsed.from !== agentId) {
        callback(parsed)
      }
    })

    // Subscribe to direct messages
    const directSub = redis.subscribe(`${this.departmentChannel}:${agentId}`, (message) => {
      callback(JSON.parse(message))
    })

    return () => {
      broadcastSub.then(sub => sub.unsubscribe())
      directSub.then(sub => sub.unsubscribe())
    }
  }

  private async storeMessage(message: AgentMessage) {
    // Store last 1000 messages per department for history
    await redis.lpush(`${this.departmentChannel}:history`, JSON.stringify(message))
    await redis.ltrim(`${this.departmentChannel}:history`, 0, 999)
  }

  async getMessageHistory(limit = 100): Promise<AgentMessage[]> {
    const messages = await redis.lrange(`${this.departmentChannel}:history`, 0, limit - 1)
    return messages.map(m => JSON.parse(m))
  }

  async getAgentState(agentId: string): Promise<Record<string, any> | null> {
    const state = await redis.get(`${this.departmentChannel}:state:${agentId}`)
    return state ? JSON.parse(state) : null
  }

  async updateAgentState(agentId: string, state: Record<string, any>) {
    await redis.set(`${this.departmentChannel}:state:${agentId}`, JSON.stringify(state))
  }
}