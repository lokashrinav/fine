import { AleoProvider } from '../types';

// Global wallet provider instance
let walletProvider: AleoProvider | null = null;

/**
 * Initialize wallet connection by checking for available providers
 */
const initializeProvider = (): AleoProvider | null => {
  // Check for Leo Wallet (most common Aleo wallet)
  if (typeof window !== 'undefined' && (window as any).leoWallet) {
    return (window as any).leoWallet;
  }

  // Check for other potential Aleo wallet providers
  if (typeof window !== 'undefined' && (window as any).aleo) {
    return (window as any).aleo;
  }

  // Fallback mock provider for development
  return {
    connect: async () => {
      const mockAddress = 'aleo1' + Math.random().toString(36).substring(2, 50);
      return mockAddress;
    },
    disconnect: async () => {
      console.log('Wallet disconnected');
    },
    getAddress: async () => {
      return 'aleo1' + Math.random().toString(36).substring(2, 50);
    },
    getBalance: async () => {
      return (Math.random() * 1000).toFixed(2);
    },
    signMessage: async (message: string) => {
      // Mock signature - in real implementation this would be cryptographically signed
      return 'sign_' + btoa(message) + '_mock';
    },
    requestTransaction: async (transaction: any) => {
      // Mock transaction ID
      return 'tx_' + Math.random().toString(36).substring(2, 20);
    }
  };
};

/**
 * Connect to Aleo wallet
 */
export const connectWallet = async (): Promise<string> => {
  try {
    walletProvider = initializeProvider();
    
    if (!walletProvider) {
      throw new Error('No Aleo wallet found. Please install Leo Wallet or compatible wallet.');
    }

    const address = await walletProvider.connect();
    
    if (!address) {
      throw new Error('Failed to connect to wallet');
    }

    return address;
  } catch (error) {
    console.error('Wallet connection error:', error);
    throw error;
  }
};

/**
 * Disconnect from wallet
 */
export const disconnectWallet = async (): Promise<void> => {
  if (walletProvider) {
    await walletProvider.disconnect();
    walletProvider = null;
  }
};

/**
 * Get current wallet information
 */
export const getWalletInfo = async () => {
  if (!walletProvider) {
    return null;
  }

  try {
    const address = await walletProvider.getAddress();
    const balance = await walletProvider.getBalance();
    
    return {
      address,
      balance,
      network: 'testnet3' // Default to testnet
    };
  } catch (error) {
    console.error('Failed to get wallet info:', error);
    throw error;
  }
};

/**
 * Sign a message with the connected wallet
 */
export const signMessage = async (message: string): Promise<string> => {
  if (!walletProvider) {
    throw new Error('Wallet not connected');
  }

  try {
    return await walletProvider.signMessage(message);
  } catch (error) {
    console.error('Message signing failed:', error);
    throw error;
  }
};

/**
 * Request a transaction from the wallet
 */
export const requestTransaction = async (transaction: any): Promise<string> => {
  if (!walletProvider) {
    throw new Error('Wallet not connected');
  }

  try {
    return await walletProvider.requestTransaction(transaction);
  } catch (error) {
    console.error('Transaction request failed:', error);
    throw error;
  }
};

/**
 * Check if wallet is available
 */
export const isWalletAvailable = (): boolean => {
  return typeof window !== 'undefined' && 
         ((window as any).leoWallet || (window as any).aleo);
};
