import React, { useEffect, useState } from 'react';
import { WalletState } from '../types';
import { connectWallet, disconnectWallet, getWalletInfo } from '../services/aleoService';

interface WalletConnectorProps {
  walletState: WalletState;
  onWalletStateChange: (state: WalletState) => void;
}

const WalletConnector: React.FC<WalletConnectorProps> = ({
  walletState,
  onWalletStateChange
}) => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check if wallet is already connected on component mount
    checkWalletConnection();
  }, []);

  const checkWalletConnection = async () => {
    try {
      const walletInfo = await getWalletInfo();
      if (walletInfo) {
        onWalletStateChange({
          isConnected: true,
          address: walletInfo.address,
          balance: walletInfo.balance,
          network: walletInfo.network
        });
      }
    } catch (error) {
      console.log('No wallet connection found');
    }
  };

  const handleConnect = async () => {
    setIsConnecting(true);
    setError(null);
    
    try {
      const address = await connectWallet();
      const walletInfo = await getWalletInfo();
      
      onWalletStateChange({
        isConnected: true,
        address,
        balance: walletInfo?.balance,
        network: walletInfo?.network
      });
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      setError(error instanceof Error ? error.message : 'Failed to connect wallet');
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      await disconnectWallet();
      onWalletStateChange({
        isConnected: false,
        address: null
      });
      setError(null);
    } catch (error) {
      console.error('Failed to disconnect wallet:', error);
      setError('Failed to disconnect wallet');
    }
  };

  if (walletState.isConnected) {
    return (
      <div className="wallet-status connected">
        <i className="fas fa-check-circle"></i>
        <span className="me-2">Connected</span>
        <button
          className="btn btn-sm btn-outline-success"
          onClick={handleDisconnect}
          title="Disconnect Wallet"
        >
          <i className="fas fa-sign-out-alt"></i>
        </button>
      </div>
    );
  }

  return (
    <div className="d-flex flex-column align-items-end">
      <button
        className="btn btn-primary"
        onClick={handleConnect}
        disabled={isConnecting}
      >
        {isConnecting ? (
          <>
            <i className="fas fa-spinner spinner me-2"></i>
            Connecting...
          </>
        ) : (
          <>
            <i className="fas fa-wallet me-2"></i>
            Connect Wallet
          </>
        )}
      </button>
      
      {error && (
        <small className="text-danger mt-1">
          <i className="fas fa-exclamation-triangle me-1"></i>
          {error}
        </small>
      )}
    </div>
  );
};

export default WalletConnector;
