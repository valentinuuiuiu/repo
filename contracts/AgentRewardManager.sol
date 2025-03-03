// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract AgentRewardManager is Ownable, ReentrancyGuard {
    // Struct to store agent details
    struct Agent {
        address agentAddress;
        uint256 totalRewards;
        uint256 lastRewardTime;
        uint256 performanceScore;
        bool isRegistered;
    }

    // Mapping of agent addresses to their details
    mapping(address => Agent) public agents;
    
    // List of registered agent addresses
    address[] public registeredAgents;

    // Reward parameters
    uint256 public constant BASE_REWARD = 0.01 ether; // 0.01 ETH base reward
    uint256 public constant PERFORMANCE_MULTIPLIER = 0.001 ether; // 0.001 ETH per performance point
    uint256 public constant REWARD_INTERVAL = 1 days;
    uint256 public constant MAX_PERFORMANCE_SCORE = 100;

    // Events
    event AgentRegistered(address indexed agent);
    event AgentRewardClaimed(address indexed agent, uint256 amount);
    event PerformanceUpdated(address indexed agent, uint256 newScore);

    // Register a new agent
    function registerAgent() external {
        require(!agents[msg.sender].isRegistered, "Agent already registered");
        
        agents[msg.sender] = Agent({
            agentAddress: msg.sender,
            totalRewards: 0,
            lastRewardTime: block.timestamp,
            performanceScore: 50, // Start with a neutral performance score
            isRegistered: true
        });

        registeredAgents.push(msg.sender);
        emit AgentRegistered(msg.sender);
    }

    // Update agent performance
    function updatePerformance(address _agent, uint256 _score) external onlyOwner {
        require(agents[_agent].isRegistered, "Agent not registered");
        require(_score <= MAX_PERFORMANCE_SCORE, "Performance score out of range");

        agents[_agent].performanceScore = _score;
        emit PerformanceUpdated(_agent, _score);
    }

    // Calculate and claim rewards
    function claimRewards() external nonReentrant {
        Agent storage agent = agents[msg.sender];
        require(agent.isRegistered, "Agent not registered");
        require(block.timestamp >= agent.lastRewardTime + REWARD_INTERVAL, "Reward not due yet");

        // Calculate reward based on base reward and performance
        uint256 performanceBonus = (agent.performanceScore * PERFORMANCE_MULTIPLIER) / MAX_PERFORMANCE_SCORE;
        uint256 rewardAmount = BASE_REWARD + performanceBonus;

        // Ensure contract has enough ETH
        require(address(this).balance >= rewardAmount, "Insufficient reward funds");

        // Update agent reward details
        agent.totalRewards += rewardAmount;
        agent.lastRewardTime = block.timestamp;

        // Transfer rewards
        (bool success, ) = payable(msg.sender).call{value: rewardAmount}("");
        require(success, "Reward transfer failed");

        emit AgentRewardClaimed(msg.sender, rewardAmount);
    }

    // Get total registered agents
    function getTotalAgents() external view returns (uint256) {
        return registeredAgents.length;
    }

    // Get agent details
    function getAgentDetails(address _agent) external view returns (
        uint256 totalRewards,
        uint256 lastRewardTime,
        uint256 performanceScore
    ) {
        Agent memory agent = agents[_agent];
        return (
            agent.totalRewards,
            agent.lastRewardTime,
            agent.performanceScore
        );
    }

    // Allow funding the reward pool
    receive() external payable {}

    // Withdraw any remaining ETH (emergency or reallocation)
    function withdrawFunds(uint256 _amount) external onlyOwner {
        payable(owner()).transfer(_amount);
    }
}
```