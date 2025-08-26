import { AleoProvider } from '../types';

// Global wallet provider instance
let walletProvider: AleoProvider | null = null;

/**
 * Initialize wallet connection by checking for available providers
 */
const initializeProvider = (): AleoProvider | null => {
  // Check for Leo Wallet (most common Aleo wallet)
  if (typeof window !== 'undefined' && (window as any).leoWallet) {
    const leoWallet = (window as any).leoWallet;
    
    return {
      connect: async () => {
        try {
          // Check if wallet already has publicKey (might be pre-connected)
          if (leoWallet.publicKey) {
            console.log('Wallet already has publicKey:', leoWallet.publicKey);
            return leoWallet.publicKey;
          }
          
          // Try connect with different parameter combinations
          if (typeof leoWallet.connect === 'function') {
            try {
              // Try with decryption permission and network
              console.log('Trying connect with parameters...');
              const result = await leoWallet.connect(
                'DECRYPT_UPON_REQUEST',
                'aleo:1',
                ['viewKey', 'records']
              );
              
              if (result) {
                return result;
              }
              
              // After connection, check if publicKey is now available
              if (leoWallet.publicKey) {
                return leoWallet.publicKey;
              }
            } catch (e1) {
              console.log('Connect with params failed:', e1);
              
              // Try with just decryption permission
              try {
                const result = await leoWallet.connect('DECRYPT_UPON_REQUEST');
                if (result || leoWallet.publicKey) {
                  return result || leoWallet.publicKey;
                }
              } catch (e2) {
                console.log('Connect with single param failed:', e2);
                
                // Try without any parameters
                try {
                  const result = await leoWallet.connect();
                  if (result || leoWallet.publicKey) {
                    return result || leoWallet.publicKey;
                  }
                } catch (e3) {
                  console.log('Connect without params failed:', e3);
                }
              }
            }
          }
          
          // Final check for publicKey after all attempts
          if (leoWallet.publicKey) {
            return leoWallet.publicKey;
          }
          
          throw new Error('Unable to connect to Leo Wallet');
        } catch (error) {
          console.error('Leo Wallet connection error:', error);
          throw new Error('Failed to connect to Leo Wallet. Please make sure it is unlocked and try again.');
        }
      },
      disconnect: async () => {
        try {
          await leoWallet.disconnect();
        } catch (error) {
          console.error('Leo Wallet disconnect error:', error);
        }
      },
      getAddress: async () => {
        try {
          // Try multiple ways to get the address
          if (leoWallet.account) {
            return leoWallet.account;
          }
          if (leoWallet.publicKey) {
            return leoWallet.publicKey;
          }
          // Try calling getAccount method if available
          if (typeof leoWallet.getAccount === 'function') {
            return await leoWallet.getAccount();
          }
          throw new Error('No account found');
        } catch (error) {
          console.error('Failed to get Leo Wallet address:', error);
          throw error;
        }
      },
      getBalance: async () => {
        // Leo Wallet doesn't directly provide balance, return placeholder
        return '0.0';
      },
      signMessage: async (message: string) => {
        try {
          const messageBytes = new TextEncoder().encode(message);
          const signature = await leoWallet.signMessage(messageBytes, 'utf8');
          
          // Convert signature to readable format
          const signString = Array.from(signature, (byte: number) => 
            String.fromCharCode(byte)
          ).join('');
          
          return signString;
        } catch (error) {
          console.error('Leo Wallet signing error:', error);
          throw new Error('Failed to sign message with Leo Wallet');
        }
      },
      requestTransaction: async (transaction: any) => {
        try {
          return await leoWallet.requestTransaction(transaction);
        } catch (error) {
          console.error('Leo Wallet transaction error:', error);
          throw error;
        }
      }
    };
  }

  // Check for other Aleo wallet providers
  if (typeof window !== 'undefined' && (window as any).aleo) {
    return (window as any).aleo;
  }

  // Wait for wallet to load if we're in browser
  if (typeof window !== 'undefined') {
    // Return null immediately, don't wait
    return null;
  }

  return null;
};

/**
 * Connect to Aleo wallet
 */
export const connectWallet = async (): Promise<string> => {
  try {
    // Check if wallet is available first
    if (!isWalletAvailable()) {
      throw new Error('No Aleo wallet found. Please install Leo Wallet from https://leo.app and refresh the page.');
    }

    walletProvider = initializeProvider();
    
    if (!walletProvider) {
      throw new Error('Failed to initialize wallet connection. Please make sure Leo Wallet is installed and unlocked.');
    }

    const address = await walletProvider.connect();
    
    if (!address) {
      throw new Error('Failed to connect to wallet. Please make sure Leo Wallet is unlocked and try again.');
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
  if (typeof window === 'undefined') {
    return false;
  }
  
  // Check for Leo Wallet
  if ((window as any).leoWallet) {
    return true;
  }
  
  // Check for other Aleo wallets
  if ((window as any).aleo) {
    return true;
  }
  
  return false;
};

/**
 * Get wallet installation URL
 */
export const getWalletInstallUrl = (): string => {
  return 'https://chromewebstore.google.com/detail/leo-wallet/nebnhfamliijlghikdgcigoebonmoibm';
};

/**
 * Detect wallet type
 */
export const getWalletType = (): string | null => {
  if (typeof window === 'undefined') {
    return null;
  }
  
  if ((window as any).leoWallet) {
    return 'Leo Wallet';
  }
  
  if ((window as any).aleo) {
    return 'Aleo Wallet';
  }
  
  return null;
};
