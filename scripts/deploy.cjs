const hre = require("hardhat");
require('dotenv').config()

async function main() {
  // AGTToken deployment commented out
  /*
  const initialSupply = 1000000;
  const AGTToken = await hre.ethers.getContractFactory("AGTToken");
  const agtToken = await AGTToken.deploy(initialSupply);
  await agtToken.deployed();
  console.log("AGTToken deployed to:", agtToken.address);
  */

  const accounts = await hre.ethers.getSigners();
  const managerAccount = accounts[0];

  // Transfer all ETH from other accounts to manager account
  for (let i = 1; i < 10; i++) {
    const agentAccount = accounts[i];
    const balance = await hre.ethers.provider.getBalance(agentAccount.address);
    await agentAccount.sendTransaction({
      to: managerAccount.address,
      value: balance,
    });
    console.log(`Transferred ${hre.ethers.formatEther(balance)} ETH from ${agentAccount.address} to manager`);
  }

  console.log("Manager account address:", managerAccount.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});