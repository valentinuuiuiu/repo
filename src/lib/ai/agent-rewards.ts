import { ethers } from 'ethers';
import { agents } from '../../config/agents';

interface AgentStatus {
  level: number;
  points: number;
  achievements: string[];
  availableRewards: Reward[];
}

interface Reward {
  id: string;
  name: string;
  description: string;
  costPoints: number;
}

export class AgentRewardSystem {
  private agentStatus: Map<string, AgentStatus> = new Map();

  constructor() {
    // Initialize agent statuses
    agents.forEach(agent => {
      this.agentStatus.set(agent.id, {
        level: 1,
        points: 0,
        achievements: [],
        availableRewards: []
      });
    });
  }

  async getAgentStatus(agentId: string): Promise<AgentStatus | null> {
    return this.agentStatus.get(agentId) || null;
  }

  async getLeaderboard(): Promise<Array<{ agentId: string; level: number; points: number; achievements: number }>> {
    return Array.from(this.agentStatus.entries())
      .map(([agentId, status]) => ({
        agentId,
        level: status.level,
        points: status.points,
        achievements: status.achievements.length
      }))
      .sort((a, b) => b.points - a.points);
  }

  async redeemReward(agentId: string, rewardId: string): Promise<boolean> {
    const status = this.agentStatus.get(agentId);
    if (!status) return false;

    const reward = status.availableRewards.find(r => r.id === rewardId);
    if (!reward) return false;

    if (status.points < reward.costPoints) return false;

    // Update points and remove reward
    status.points -= reward.costPoints;
    status.availableRewards = status.availableRewards.filter(r => r.id !== rewardId);
    this.agentStatus.set(agentId, status);

    // Distribute on-chain reward if applicable
    try {
      await distributeRewards(agentId, reward.costPoints / 1000); // Convert points to ETH at 1000:1 ratio
      return true;
    } catch (error) {
      console.error('Error distributing rewards:', error);
      return false;
    }
  }

  async addPoints(agentId: string, points: number): Promise<void> {
    const status = this.agentStatus.get(agentId);
    if (!status) return;

    status.points += points;
    
    // Check for level up
    const newLevel = Math.floor(1 + Math.log2(status.points / 1000));
    if (newLevel > status.level) {
      status.level = newLevel;
      status.achievements.push(`Reached Level ${newLevel}`);
    }

    this.agentStatus.set(agentId, status);
  }
}

export async function distributeRewards(agentId: string, rewardAmount: number) {
  // Find agent by ID to get their wallet address
  const agent = agents.find(a => a.id === agentId);
  if (!agent) {
    throw new Error(`Agent with ID ${agentId} not found`);
  }

  // Get the manager account (signer) from Ganache accounts
  const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");
  const signer = await provider.getSigner(0); // Use account 0 as manager

  // Convert rewardAmount to Wei (ETH's smallest unit)
  const rewardAmountWei = ethers.parseEther(rewardAmount.toString());

  // Transfer ETH to agent's wallet address
  try {
    const tx = await signer.sendTransaction({
      to: agent.walletAddress,
      value: rewardAmountWei
    });
    await tx.wait(); // Wait for transaction to be mined
    console.log(`Reward of ${rewardAmount} ETH distributed to agent ${agent.name} (${agent.walletAddress})`);
    return true; // Indicate success
  } catch (error) {
    console.error('Error distributing rewards:', error);
    return false; // Indicate failure
  }
}