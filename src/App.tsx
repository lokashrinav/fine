import React, { useState, useEffect } from 'react';
import CredentialUploader from './components/CredentialUploader';
import ProofGenerator from './components/ProofGenerator';
import WalletConnector from './components/WalletConnector';
import SampleCredentialGenerator from './components/SampleCredentialGenerator';
import WalletSetupGuide from './components/WalletSetupGuide';
import { WalletState, Credential, ProofStatus } from './types';

const App: React.FC = () => {
  const [walletState, setWalletState] = useState<WalletState>({
    isConnected: false,
    address: null
  });
  const [credential, setCredential] = useState<Credential | null>(null);
  const [proofStatus, setProofStatus] = useState<ProofStatus>(ProofStatus.IDLE);

  const handleWalletStateChange = (newState: WalletState) => {
    setWalletState(newState);
  };

  const handleCredentialUpload = (uploadedCredential: Credential) => {
    setCredential(uploadedCredential);
    setProofStatus(ProofStatus.IDLE);
  };

  const handleProofStatusChange = (status: ProofStatus) => {
    setProofStatus(status);
  };

  return (
    <div className="container-fluid min-vh-100 d-flex align-items-center justify-content-center py-5">
      <div className="row w-100 justify-content-center">
        <div className="col-12 col-lg-8 col-xl-6">
          <div className="card shadow-lg">
            <div className="card-header bg-primary text-white text-center py-4">
              <h1 className="card-title h2 mb-0">
                <i className="fas fa-shield-alt me-2"></i>
                Private Degree Verifier
              </h1>
              <p className="mb-0 mt-2 opacity-75">
                Prove your degree without revealing personal data using zero-knowledge proofs
              </p>
            </div>
            
            <div className="card-body p-4">
              {/* Wallet Connection Section */}
              <div className="mb-4">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h5 className="text-secondary mb-0">
                    <i className="fas fa-wallet me-2"></i>
                    Aleo Wallet
                  </h5>
                  <WalletConnector 
                    walletState={walletState}
                    onWalletStateChange={handleWalletStateChange}
                  />
                </div>
                
                {!walletState.isConnected && (
                  <WalletSetupGuide />
                )}
                
                {walletState.isConnected && (
                  <div className="alert alert-success d-flex align-items-center">
                    <i className="fas fa-check-circle me-2"></i>
                    <div>
                      <strong>Wallet Connected</strong>
                      <br />
                      <small className="text-muted">
                        Address: {walletState.address}
                        {walletState.balance && (
                          <>
                            <br />
                            Balance: {walletState.balance} ALEO
                          </>
                        )}
                      </small>
                    </div>
                  </div>
                )}
              </div>

              {/* Credential Upload Section */}
              <div className="mb-4">
                <h5 className="text-secondary mb-3">
                  <i className="fas fa-upload me-2"></i>
                  Upload Credential
                </h5>
                <SampleCredentialGenerator />
                <CredentialUploader onCredentialUpload={handleCredentialUpload} />
                
                {credential && (
                  <div className="alert alert-info mt-3">
                    <i className="fas fa-info-circle me-2"></i>
                    <strong>Credential loaded successfully!</strong>
                    <br />
                    <small className="text-muted">
                      Issuer: {credential.issuerPublicKey.substring(0, 20)}...
                      <br />
                      Issued: {new Date(credential.timestamp).toLocaleDateString()}
                    </small>
                  </div>
                )}
              </div>

              {/* Proof Generation Section */}
              {credential && walletState.isConnected && (
                <div className="mb-4">
                  <h5 className="text-secondary mb-3">
                    <i className="fas fa-key me-2"></i>
                    Generate Proof
                  </h5>
                  <ProofGenerator 
                    credential={credential}
                    walletState={walletState}
                    onProofStatusChange={handleProofStatusChange}
                  />
                </div>
              )}

              {/* Status Messages */}
              {!walletState.isConnected && (
                <div className="alert alert-warning">
                  <i className="fas fa-exclamation-triangle me-2"></i>
                  Please connect your Aleo wallet to continue.
                </div>
              )}

              {walletState.isConnected && !credential && (
                <div className="alert alert-info">
                  <i className="fas fa-info-circle me-2"></i>
                  Upload your credential file to begin the verification process.
                </div>
              )}
            </div>

            <div className="card-footer bg-light text-center text-muted">
              <small>
                <i className="fas fa-lock me-1"></i>
                Your personal data never leaves your device. 
                Only cryptographic proofs are shared.
              </small>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
