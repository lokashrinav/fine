import { AleoProvider } from '../types';
import { LeoWalletAdapter } from '@demox-labs/aleo-wallet-adapter-leo';
import { 
  DecryptPermission, 
  WalletAdapterNetwork 
} from '@demox-labs/aleo-wallet-adapter-base';

// Global wallet provider instance
let walletProvider: AleoProvider | null = null;
let leoAdapter: LeoWalletAdapter | null = null;

/**
 * Initialize wallet connection by checking for available providers
 */
const initializeProvider = (): AleoProvider | null => {
  // Use Leo Wallet Adapter (recommended approach)
  if (typeof window !== 'undefined') {
    try {
      // Initialize Leo Wallet Adapter
      const adapter = new LeoWalletAdapter({
        appName: 'Private Degree Verifier'
      });
      
      leoAdapter = adapter;
      
      return {
        connect: async () => {
          try {
            // Connect to Leo Wallet using the adapter with proper permissions
            await adapter.connect(
              DecryptPermission.UponRequest,    // Use proper enum value
              WalletAdapterNetwork.Testnet      // Use proper enum value
            );
            
            // Get the public key/address
            const publicKey = adapter.publicKey;
            if (publicKey) {
              return publicKey.toString();
            }
            
            throw new Error('No public key returned from wallet');
          } catch (error) {
            console.error('Leo Wallet connection error:', error);
            throw new Error('Failed to connect to Leo Wallet. Please make sure it is installed and unlocked.');
          }
        },
        disconnect: async () => {
          try {
            await adapter.disconnect();
          } catch (error) {
            console.error('Leo Wallet disconnect error:', error);
          }
        },
        getAddress: async () => {
          try {
            const publicKey = adapter.publicKey;
            if (publicKey) {
              return publicKey.toString();
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
            const signature = await adapter.signMessage(messageBytes);
            
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
            // The adapter handles transaction requests
            return await adapter.requestTransaction(transaction);
          } catch (error) {
            console.error('Leo Wallet transaction error:', error);
            throw error;
          }
        }
      };
    } catch (error) {
      console.error('Failed to initialize Leo Wallet Adapter:', error);
    }
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
    if (leoAdapter) {
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