import { HardhatEthersSigner } from '@nomicfoundation/hardhat-ethers/signers';
import { ethers } from 'ethers';

declare module '@nomicfoundation/hardhat-ethers/signers' {
  interface HardhatEthersSigner {
    getBalance(): Promise<bigint>;
    address: string;
  }
}

// Extend the global Ethers types if needed
declare module 'ethers' {
  interface Signer {
    getBalance(): Promise<bigint>;
  }
}