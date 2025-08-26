import { AleoProvider } from '../types';
import { 
  DecryptPermission, 
  WalletAdapterNetwork 
} from '@demox-labs/aleo-wallet-adapter-base';

// Global wallet provider instance
let walletProvider: AleoProvider | null = null;

/**
 * Initialize wallet connection by checking for available providers
 */
const initializeProvider = (): AleoProvider | null => {
  // Check for Leo Wallet - try window.leoWallet first, then window.leo
  if (typeof window !== 'undefined' && (window as any).leoWallet) {
    const leoWallet = (window as any).leoWallet;
    console.log('Using window.leoWallet object');
    
    console.log('Leo Wallet detected');
    
    return {
      connect: async () => {
        try {
          console.log('Current wallet state before connect:');
          console.log('- publicKey:', leoWallet.publicKey);
          console.log('- permission:', leoWallet.permission);
          console.log('- network:', leoWallet.network);
          
          // Check if already connected
          if (leoWallet.publicKey) {
            console.log('Already connected, returning publicKey:', leoWallet.publicKey);
            return leoWallet.publicKey;
          }
          
          console.log('Calling connect with positional parameters...');
          console.log('Available methods on leoWallet:', Object.keys(leoWallet));
          console.log('typeof leoWallet.connect:', typeof leoWallet.connect);
          
          // Leo Wallet now expects "testnetbeta" instead of "testnet3"
          console.log('Connecting with correct parameters for Leo Wallet v0.13+');
          await leoWallet.connect(
            "DECRYPT_UPON_REQUEST",  // Decrypt permission
            "testnetbeta",          // NEW: Changed from "testnet3" to "testnetbeta"
            []                      // Optional program list
          );
          
          console.log('Connect call completed');
          console.log('Wallet state after connect:');
          console.log('- publicKey:', leoWallet.publicKey);
          console.log('- permission:', leoWallet.permission);
          console.log('- network:', leoWallet.network);
          
          if (leoWallet.publicKey) {
            console.log('Successfully connected! PublicKey:', leoWallet.publicKey);
            return leoWallet.publicKey;
          }
          
          throw new Error('No publicKey after connection');
        } catch (error: any) {
          console.error('Leo Wallet connection error:', error);
          console.error('Error details:', {
            name: error.name,
            message: error.message,
            stack: error.stack
          });
          
          // Check if publicKey was set despite error
          if (leoWallet.publicKey) {
            console.log('Have publicKey despite error:', leoWallet.publicKey);
            return leoWallet.publicKey;
          }
          
          throw new Error(`Failed to connect to Leo Wallet: ${error.message}`);
        }
      },
      disconnect: async () => {
        try {
          if (typeof leoWallet.disconnect === 'function') {
            await leoWallet.disconnect();
          }
        } catch (error) {
          console.error('Leo Wallet disconnect error:', error);
        }
      },
      getAddress: async () => {
        try {
          if (leoWallet.publicKey) {
            return leoWallet.publicKey;
          }
          if (leoWallet.account) {
            return leoWallet.account;
          }
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
        // Leo Wallet doesn't directly provide balance
        return '0.0';
      },
      signMessage: async (message: string) => {
        try {
          const messageBytes = new TextEncoder().encode(message);
          const signature = await leoWallet.signMessage(messageBytes);
          
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

  return null;
};

/**
 * Aleo Service - Main interface for wallet operations
 */
class AleoService {
  private provider: AleoProvider | null = null;
  private connected: boolean = false;
  private address: string | null = null;

  constructor() {
    this.initialize();
  }

  private initialize() {
    this.provider = initializeProvider();
  }

  /**
   * Check if a wallet is available
   */
  isWalletAvailable(): boolean {
    return this.provider !== null;
  }

  /**
   * Get the current wallet provider name
   */
  getWalletName(): string {
    if (typeof window !== 'undefined' && ((window as any).leo || (window as any).leoWallet)) {
      return 'Leo Wallet';
    }
    return 'Unknown Wallet';
  }

  /**
   * Connect to wallet
   */
  async connect(): Promise<string> {
    if (!this.provider) {
      throw new Error('No Aleo wallet found. Please install Leo Wallet extension.');
    }

    try {
      const address = await this.provider.connect();
      this.connected = true;
      this.address = address;
      
      // Store connection in localStorage
      localStorage.setItem('aleo_wallet_connected', 'true');
      localStorage.setItem('aleo_wallet_address', address);
      
      return address;
    } catch (error) {
      this.connected = false;
      this.address = null;
      throw error;
    }
  }

  /**
   * Disconnect from wallet
   */
  async disconnect(): Promise<void> {
    if (this.provider) {
      await this.provider.disconnect();
    }
    
    this.connected = false;
    this.address = null;
    
    // Clear localStorage
    localStorage.removeItem('aleo_wallet_connected');
    localStorage.removeItem('aleo_wallet_address');
  }

  /**
   * Get current connection status
   */
  isConnected(): boolean {
    return this.connected;
  }

  /**
   * Get connected address
   */
  getAddress(): string | null {
    return this.address;
  }

  /**
   * Get wallet balance
   */
  async getBalance(): Promise<string> {
    if (!this.provider || !this.connected) {
      throw new Error('Wallet not connected');
    }
    
    return await this.provider.getBalance();
  }

  /**
   * Sign a message
   */
  async signMessage(message: string): Promise<string> {
    if (!this.provider || !this.connected) {
      throw new Error('Wallet not connected');
    }
    
    return await this.provider.signMessage(message);
  }

  /**
   * Request a transaction
   */
  async requestTransaction(transaction: any): Promise<any> {
    if (!this.provider || !this.connected) {
      throw new Error('Wallet not connected');
    }
    
    return await this.provider.requestTransaction(transaction);
  }

  /**
   * Check and restore previous connection
   */
  async restoreConnection(): Promise<boolean> {
    const wasConnected = localStorage.getItem('aleo_wallet_connected') === 'true';
    const savedAddress = localStorage.getItem('aleo_wallet_address');
    
    if (wasConnected && savedAddress && this.provider) {
      try {
        // Try to restore the connection
        const address = await this.provider.getAddress();
        if (address === savedAddress) {
          this.connected = true;
          this.address = address;
          return true;
        }
      } catch (error) {
        console.error('Failed to restore wallet connection:', error);
      }
    }
    
    return false;
  }
}

// Create singleton instance
const aleoService = new AleoService();

// Export singleton instance
export default aleoService;

// Export convenience functions for backward compatibility
export const connectWallet = () => aleoService.connect();
export const disconnectWallet = () => aleoService.disconnect();
export const getWalletInfo = async () => {
  if (aleoService.isConnected()) {
    return {
      address: aleoService.getAddress(),
      balance: await aleoService.getBalance(),
      network: 'testnet3'
    };
  }
  return null;
};
export const isWalletAvailable = () => aleoService.isWalletAvailable();
export const getWalletInstallUrl = () => 'https://leo.app/';
export const getWalletType = () => aleoService.getWalletName();