const { ethers } = require('ethers');
const { agents } = require('../src/config/agents');

async function connectWithRetry(retries = 5, delay = 2000) {
  for (let i = 0; i < retries; i++) {
    try {
      const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");
      await provider.getNetwork(); // Test the connection
      return provider;
    } catch (error) {
      if (i === retries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}

async function testRewards(agentId, rewardAmount) {
  try {
    // Find agent
    const agent = agents.find(a => a.id === agentId);
    if (!agent) {
      throw new Error(`Agent with ID ${agentId} not found`);
    }

    // Connect to provider with retry mechanism
    const provider = await connectWithRetry();
    const signer = await provider.getSigner(0);
    const managerAddress = await signer.getAddress();

    // Check balances
    const managerBalanceBefore = await provider.getBalance(managerAddress);
    const agentBalanceBefore = await provider.getBalance(agent.walletAddress);
    console.log(`Testing reward distribution to ${agent.name} (${agent.walletAddress})`);
    console.log("Manager balance before transfer:", ethers.formatEther(managerBalanceBefore));
    console.log("Agent balance before transfer:", ethers.formatEther(agentBalanceBefore));

    // Convert reward amount to Wei
    const rewardAmountWei = ethers.parseEther(rewardAmount.toString());
    if (rewardAmountWei > managerBalanceBefore) {
      throw new Error("Insufficient funds for transfer");
    }

    // Perform transfer
    const tx = await signer.sendTransaction({
      to: agent.walletAddress,
      value: rewardAmountWei
    });

    // Wait for transaction confirmation
    const receipt = await tx.wait();

    // Verify transfer success
    const agentBalanceAfter = await provider.getBalance(agent.walletAddress);
    const managerBalanceAfter = await provider.getBalance(managerAddress);

    console.log("Transaction hash:", receipt.hash);
    console.log(`Reward of ${rewardAmount} ETH distributed to ${agent.name}`);
    console.log("Agent balance after transfer:", ethers.formatEther(agentBalanceAfter));
    console.log("Manager balance after transfer:", ethers.formatEther(managerBalanceAfter));

    return true;
  } catch (error) {
    console.error("Error in testRewards:", error);
    return false;
  }
}

// Example usage - test reward for Product Strategy Director
testRewards('product-leader', "1.0") // Test sending 1 ETH
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });