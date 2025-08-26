import { AleoProvider } from '../types';

// Global wallet provider instance
let walletProvider: AleoProvider | null = null;
let isUsingMockWallet = false;

/**
 * Mock Wallet for testing when real wallet has issues
 */
class MockWallet {
  private connected: boolean = false;
  private mockAddress: string = 'aleo1qnr4dkkvkgfqph0vzc3y6z2eu975wnpz2925ntjccd5cfqxtyu8s7pyjh9';

  async connect(): Promise<string> {
    // Simulate connection delay
    await new Promise(resolve => setTimeout(resolve, 500));
    this.connected = true;
    console.log('Mock wallet connected with address:', this.mockAddress);
    return this.mockAddress;
  }

  async disconnect(): Promise<void> {
    this.connected = false;
    console.log('Mock wallet disconnected');
  }

  getAddress(): string {
    if (!this.connected) throw new Error('Mock wallet not connected');
    return this.mockAddress;
  }

  async getBalance(): Promise<string> {
    return '100.0';
  }

  async signMessage(message: string): Promise<string> {
    // Return a mock signature
    return `mock_signature_${btoa(message).substring(0, 20)}`;
  }

  async requestTransaction(transaction: any): Promise<any> {
    console.log('Mock transaction requested:', transaction);
    return {
      txId: `mock_tx_${Date.now()}`,
      status: 'success'
    };
  }

  isConnected(): boolean {
    return this.connected;
  }
}

/**
 * Initialize wallet connection by checking for available providers
 */
const initializeProvider = (): AleoProvider | null => {
  // Check for Leo Wallet
  if (typeof window !== 'undefined' && (window as any).leoWallet) {
    const leoWallet = (window as any).leoWallet;
    
    console.log('Leo Wallet detected, but using mock wallet due to extension bug');
    console.log('To use real Leo Wallet once fixed, refresh the page after wallet update');
    
    // Use mock wallet due to Leo Wallet bug
    isUsingMockWallet = true;
    const mockWallet = new MockWallet();
    
    return {
      connect: () => mockWallet.connect(),
      disconnect: () => mockWallet.disconnect(),
      getAddress: async () => mockWallet.getAddress(),
      getBalance: () => mockWallet.getBalance(),
      signMessage: (message: string) => mockWallet.signMessage(message),
      requestTransaction: (transaction: any) => mockWallet.requestTransaction(transaction)
    };
  }

  // No wallet found, use mock wallet
  console.log('No Aleo wallet detected, using mock wallet for development');
  isUsingMockWallet = true;
  const mockWallet = new MockWallet();
  
  return {
    connect: () => mockWallet.connect(),
    disconnect: () => mockWallet.disconnect(),
    getAddress: async () => mockWallet.getAddress(),
    getBalance: () => mockWallet.getBalance(),
    signMessage: (message: string) => mockWallet.signMessage(message),
    requestTransaction: (transaction: any) => mockWallet.requestTransaction(transaction)
  };
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
    if (isUsingMockWallet) {
      return 'Mock Wallet (Development)';
    }
    if (typeof window !== 'undefined' && (window as any).leoWallet) {
      return 'Leo Wallet';
    }
    return 'Unknown Wallet';
  }

  /**
   * Connect to wallet
   */
  async connect(): Promise<string> {
    if (!this.provider) {
      throw new Error('No wallet provider available');
    }

    try {
      const address = await this.provider.connect();
      this.connected = true;
      this.address = address;
      
      // Store connection in localStorage
      localStorage.setItem('aleo_wallet_connected', 'true');
      localStorage.setItem('aleo_wallet_address', address);
      
      if (isUsingMockWallet) {
        console.log('Connected to mock wallet. This is for testing only.');
        console.log('Real transactions will not be processed.');
      }
      
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

  /**
   * Check if using mock wallet
   */
  isUsingMock(): boolean {
    return isUsingMockWallet;
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