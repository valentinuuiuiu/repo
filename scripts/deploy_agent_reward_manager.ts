import { ethers } from 'hardhat';

async function main() {
  // Get the first account (deployer)
  const [deployer, ...otherAccounts] = await ethers.getSigners();

  console.log('Deploying contracts with the account:', deployer.address);
  console.log('Account balance:', (await deployer.getBalance()).toString());

  // Deploy AgentRewardManager
  const AgentRewardManager = await ethers.getContractFactory('AgentRewardManager');
  const agentRewardManager = await AgentRewardManager.deploy();
  await agentRewardManager.waitForDeployment();
  const agentRewardManagerAddress = await agentRewardManager.getAddress();

  console.log('AgentRewardManager deployed to:', agentRewardManagerAddress);

  // Transfer ETH from other accounts to the reward manager
  const transferAmount = ethers.parseEther('10'); // 10 ETH from each account
  for (const account of otherAccounts) {
    try {
      const tx = await account.sendTransaction({
        to: agentRewardManagerAddress,
        value: transferAmount
      });
      await tx.wait();
      console.log(`Transferred ${ethers.formatEther(transferAmount)} ETH from ${account.address} to reward manager`);
    } catch (error) {
      console.error(`Failed to transfer from ${account.address}:`, error);
    }
  }

  // Verify total balance of reward manager
  const rewardManagerBalance = await ethers.provider.getBalance(agentRewardManagerAddress);
  console.log('Reward Manager Total Balance:', ethers.formatEther(rewardManagerBalance), 'ETH');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });