import { TeamCoordinator } from './TeamCoordinator';
import { SwarmCoordinator } from './SwarmCoordinator';
import type { Task } from '../types';

export class UnifiedCoordinator {
  private swarmCoordinator: SwarmCoordinator;
  private teamCoordinator: TeamCoordinator;

  constructor(departmentId: string) {
    this.swarmCoordinator = new SwarmCoordinator();
    this.teamCoordinator = new TeamCoordinator(departmentId, 'unified');
  }

  async processTask(task: Task) {
    // Get swarm consensus
    const swarmDecision = await this.swarmCoordinator.calculateSwarmConsensus(task);

    // Process through swarm
    await this.swarmCoordinator.processTask(task, swarmDecision);

    // Calculate optimal execution path
    return this.calculateOptimalPath(task, swarmDecision);
  }

  private async calculateOptimalPath(task: Task, swarmDecision: any) {
    const { confidenceScore, taskDistribution } = swarmDecision;

    // If high confidence, use swarm distribution
    if (confidenceScore > 0.8) {
      return taskDistribution;
    }

    // Otherwise, fallback to team coordination
    return this.teamCoordinator.distributeTask(task);
  }
}