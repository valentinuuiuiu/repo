const hre = require("hardhat");
const fs = require('fs');

async function main() {
  const contractAddress = "0x63344349fba18fc22fb84246da6302caff9ee337"; // Replace with your deployed contract address

  // Save contract address to a file (for verification script)
  fs.writeFileSync('scripts/deployed-contract-address.txt', contractAddress);

  const AGTToken = await hre.ethers.getContractFactory("AGTToken");
  const agtToken = await AGTToken.attach(contractAddress);

  console.log("AGTToken deployed to:", agtToken.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});