// TryFi Internal Ethers Wrapper
// This creates a namespace separation to avoid conflicts with dApp's ethers version

import * as EthersLib from 'ethers';

// Create our own namespaced version of ethers with only available exports
export const TryFiEthers = {
  ...EthersLib,
  // Explicitly export the classes we use that are available in ethers v6
  JsonRpcProvider: EthersLib.JsonRpcProvider,
  Wallet: EthersLib.Wallet,
  formatEther: EthersLib.formatEther,
  parseEther: EthersLib.parseEther,
  Contract: EthersLib.Contract,
  Interface: EthersLib.Interface,
  getAddress: EthersLib.getAddress,
  isAddress: EthersLib.isAddress,
  keccak256: EthersLib.keccak256,
  toUtf8Bytes: EthersLib.toUtf8Bytes,
  hexlify: EthersLib.hexlify,
  arrayify: EthersLib.getBytes, // v6 renamed arrayify to getBytes
  
  // Add a marker to identify this as our internal version
  __TryFiInternal: true,
  __version: EthersLib.version || '6.14.3'
};

// For backwards compatibility, also export individual items
export const {
  JsonRpcProvider,
  Wallet,
  formatEther,
  parseEther,
  Contract,
  Interface,
  getAddress,
  isAddress,
  keccak256,
  toUtf8Bytes,
  hexlify
} = TryFiEthers;

// Export getBytes with both names for compatibility
export const arrayify = EthersLib.getBytes;
export const getBytes = EthersLib.getBytes;

// Default export for convenience
export default TryFiEthers; 