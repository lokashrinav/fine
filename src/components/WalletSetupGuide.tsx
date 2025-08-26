import React, { useState } from 'react';

const WalletSetupGuide: React.FC = () => {
  const [showGuide, setShowGuide] = useState(false);

  return (
    <div className="wallet-setup-guide mb-3">
      <button
        className="btn btn-link p-0 text-start"
        onClick={() => setShowGuide(!showGuide)}
      >
        <i className={`fas fa-chevron-${showGuide ? 'down' : 'right'} me-2`}></i>
        <span className="text-primary">
          How to Connect Leo Wallet
        </span>
      </button>

      {showGuide && (
        <div className="card mt-2 border-primary">
          <div className="card-body">
            <h6 className="card-title text-primary">
              <i className="fas fa-info-circle me-2"></i>
              Setup Instructions
            </h6>
            
            <ol className="mb-0">
              <li className="mb-2">
                <strong>Install Leo Wallet</strong>
                <br />
                <small className="text-muted">
                  Get the Leo Wallet browser extension from the official website
                </small>
              </li>
              
              <li className="mb-2">
                <strong className="text-danger">Select Testnet Beta Network</strong>
                <br />
                <small className="text-muted">
                  Click the Leo Wallet icon → Select <strong>"Aleo Testnet Beta"</strong> (with checkmark ✓)
                  <br />
                  <span className="text-warning">⚠️ Do NOT use Mainnet or Devnet</span>
                </small>
              </li>
              
              <li className="mb-2">
                <strong>Unlock Your Wallet</strong>
                <br />
                <small className="text-muted">
                  Enter your password if the wallet is locked
                </small>
              </li>
              
              <li className="mb-2">
                <strong>Click Connect Wallet</strong>
                <br />
                <small className="text-muted">
                  Click the "Connect Wallet" button above
                </small>
              </li>
              
              <li className="mb-0">
                <strong>Approve Connection</strong>
                <br />
                <small className="text-muted">
                  If you see a popup, approve the connection request
                  <br />
                  If no popup appears, click the Leo Wallet icon to see pending requests
                </small>
              </li>
            </ol>

            <div className="alert alert-warning mt-3 mb-0">
              <i className="fas fa-exclamation-triangle me-2"></i>
              <strong>Important:</strong> This app only works with <strong>Testnet Beta</strong>. 
              Make sure you see the checkmark (✓) next to "Aleo Testnet Beta" in your wallet.
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WalletSetupGuide;