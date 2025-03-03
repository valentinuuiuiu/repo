import Web3 from 'web3';
import { AbiItem } from 'web3-utils';
import { AgentType } from '@/types/agent';

// ABI for the AgentRewardManager contract
const AgentRewardManagerABI: AbiItem[] = [
  {
    "inputs": [],
    "name": "registerAgent",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_agent",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "_score",
        "type": "uint256"
      }
    ],
    "name": "updatePerformance",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "claimRewards",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getTotalAgents",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_agent",
        "type": "address"
      }
    ],
    "name": "getAgentDetails",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "totalRewards",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "lastRewardTime",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "performanceScore",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
];

// Default Ethereum provider
const DEFAULT_PROVIDER = 'http://localhost:8545';

export class AgentRewardManagerService {
  private web3: Web3;
  private contract: any;
  private contractAddress: string;

  constructor(contractAddress: string, provider?: string) {
    this.web3 = new Web3(provider || DEFAULT_PROVIDER);
    this.contractAddress = contractAddress;
    this.contract = new this.web3.eth.Contract(
      AgentRewardManagerABI as AbiItem[],
      contractAddress
    );
  }

  /**
   * Register an agent with the contract
   * @param accountAddress The address of the agent's account
   */
  async registerAgent(accountAddress: string): Promise<{ success: boolean; error?: string }> {
    try {
      await this.contract.methods.registerAgent().send({
        from: accountAddress,
        gas: 200000
      });
      return { success: true };
    } catch (error) {
      console.error('Error registering agent:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Update an agent's performance score
   * @param agentAddress The address of the agent
   * @param performanceScore Performance score (0-100)
   * @param adminAddress Address of the admin account
   */
  async updatePerformance(
    agentAddress: string,
    performanceScore: number,
    adminAddress: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      if (performanceScore < 0 || performanceScore > 100) {
        throw new Error('Performance score must be between 0 and 100');
      }

      await this.contract.methods.updatePerformance(agentAddress, performanceScore).send({
        from: adminAddress,
        gas: 200000
      });
      return { success: true };
    } catch (error) {
      console.error('Error updating agent performance:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Claim rewards for an agent
   * @param agentAddress Address of the agent claiming rewards
   */
  async claimRewards(agentAddress: string): Promise<{ success: boolean; error?: string }> {
    try {
      await this.contract.methods.claimRewards().send({
        from: agentAddress,
        gas: 200000
      });
      return { success: true };
    } catch (error) {
      console.error('Error claiming rewards:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Get the total number of registered agents
   */
  async getTotalAgents(): Promise<{ success: boolean; total?: number; error?: string }> {
    try {
      const total = await this.contract.methods.getTotalAgents().call();
      return { success: true, total: Number(total) };
    } catch (error) {
      console.error('Error getting total agents:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Get agent details from the contract
   * @param agentAddress The address of the agent
   */
  async getAgentDetails(agentAddress: string): Promise<{
    success: boolean;
    details?: {
      totalRewards: string;
      lastRewardTime: number;
      performanceScore: number;
    };
    error?: string;
  }> {
    try {
      const details = await this.contract.methods.getAgentDetails(agentAddress).call();
      return {
        success: true,
        details: {
          totalRewards: this.web3.utils.fromWei(details.totalRewards, 'ether'),
          lastRewardTime: Number(details.lastRewardTime),
          performanceScore: Number(details.performanceScore)
        }
      };
    } catch (error) {
      console.error('Error getting agent details:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Map an agent type to an address (for demo purposes)
   * In a real application, you would store this mapping in a database
   * @param agentType The type of agent
   */
  getAgentAddress(agentType: AgentType): string {
    // Mock addresses for different agent types
    const addressMap: Record<AgentType, string> = {
      CUSTOMER_SERVICE: '0x123...', // Replace with actual addresses
      INVENTORY_MANAGEMENT: '0x456...',
      SUPPLIER_COMMUNICATION: '0x789...',
      PRICING_OPTIMIZATION: '0xabc...',
      MARKET_ANALYSIS: '0xdef...',
      ORDER_PROCESSING: '0x012...',
      QUALITY_CONTROL: '0x345...',
      CODE_MAINTENANCE: '0x678...'
    };

    return addressMap[agentType] || '0x000...';
  }
}

// Export a singleton instance with the deployed contract address
export const agentRewardManager = new AgentRewardManagerService(
  process.env.AGENT_REWARD_MANAGER_ADDRESS || '0x5FbDB2315678afecb367f032d93F642f64180aa3'
);