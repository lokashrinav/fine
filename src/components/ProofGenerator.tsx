import React, { useState } from 'react';
import { Credential, WalletState, ProofStatus, DiplomaData, ProofResponse } from '../types';
import { generateProof, verifyProof } from '../services/proofService';

interface ProofGeneratorProps {
  credential: Credential;
  walletState: WalletState;
  onProofStatusChange: (status: ProofStatus) => void;
}

const ProofGenerator: React.FC<ProofGeneratorProps> = ({
  credential,
  walletState,
  onProofStatusChange
}) => {
  const [proofStatus, setProofStatus] = useState<ProofStatus>(ProofStatus.IDLE);
  const [proofResponse, setProofResponse] = useState<ProofResponse | null>(null);
  const [verificationResult, setVerificationResult] = useState<boolean | null>(null);
  const [privateInputs, setPrivateInputs] = useState<DiplomaData>({
    degree: '',
    school: '',
    graduationDate: '',
    studentId: '',
    gpa: undefined
  });
  const [showPrivateInputs, setShowPrivateInputs] = useState(false);

  const updateProofStatus = (status: ProofStatus) => {
    setProofStatus(status);
    onProofStatusChange(status);
  };

  const handleInputChange = (field: keyof DiplomaData, value: string | number) => {
    setPrivateInputs(prev => ({
      ...prev,
      [field]: field === 'gpa' ? (value === '' ? undefined : Number(value)) : value
    }));
  };

  const handleGenerateProof = async () => {
    updateProofStatus(ProofStatus.GENERATING);
    setProofResponse(null);
    setVerificationResult(null);

    try {
      const proof = await generateProof({
        credential,
        privateInputs
      });
      
      setProofResponse(proof);
      updateProofStatus(ProofStatus.SUCCESS);
    } catch (error) {
      console.error('Proof generation failed:', error);
      updateProofStatus(ProofStatus.ERROR);
    }
  };

  const handleVerifyProof = async () => {
    if (!proofResponse) return;

    try {
      const result = await verifyProof({
        proof: proofResponse.proof,
        publicInputs: proofResponse.publicInputs,
        verificationKey: proofResponse.verificationKey,
        issuerPublicKey: credential.issuerPublicKey
      });
      
      setVerificationResult(result.isValid);
    } catch (error) {
      console.error('Proof verification failed:', error);
      setVerificationResult(false);
    }
  };

  const isFormValid = () => {
    return privateInputs.degree.trim() !== '' &&
           privateInputs.school.trim() !== '' &&
           privateInputs.graduationDate.trim() !== '' &&
           privateInputs.studentId.trim() !== '';
  };

  return (
    <div className="proof-generator">
      {/* Private Inputs Form */}
      <div className="mb-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h6 className="mb-0">
            <i className="fas fa-eye-slash me-2"></i>
            Private Information
          </h6>
          <button
            type="button"
            className="btn btn-sm btn-outline-secondary"
            onClick={() => setShowPrivateInputs(!showPrivateInputs)}
          >
            {showPrivateInputs ? 'Hide' : 'Show'} Inputs
          </button>
        </div>

        {showPrivateInputs && (
          <div className="card">
            <div className="card-body">
              <div className="alert alert-warning">
                <i className="fas fa-shield-alt me-2"></i>
                <strong>Privacy Notice:</strong> This information stays on your device and is used only to generate the proof.
              </div>
              
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label">
                    <i className="fas fa-graduation-cap me-2"></i>
                    Degree
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g., Bachelor of Science"
                    value={privateInputs.degree}
                    onChange={(e) => handleInputChange('degree', e.target.value)}
                  />
                </div>
                
                <div className="col-md-6 mb-3">
                  <label className="form-label">
                    <i className="fas fa-university me-2"></i>
                    School
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g., MIT"
                    value={privateInputs.school}
                    onChange={(e) => handleInputChange('school', e.target.value)}
                  />
                </div>
                
                <div className="col-md-6 mb-3">
                  <label className="form-label">
                    <i className="fas fa-calendar me-2"></i>
                    Graduation Date
                  </label>
                  <input
                    type="date"
                    className="form-control"
                    value={privateInputs.graduationDate}
                    onChange={(e) => handleInputChange('graduationDate', e.target.value)}
                  />
                </div>
                
                <div className="col-md-6 mb-3">
                  <label className="form-label">
                    <i className="fas fa-id-card me-2"></i>
                    Student ID
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Your student ID"
                    value={privateInputs.studentId}
                    onChange={(e) => handleInputChange('studentId', e.target.value)}
                  />
                </div>
                
                <div className="col-md-6 mb-3">
                  <label className="form-label">
                    <i className="fas fa-chart-line me-2"></i>
                    GPA (Optional)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="4"
                    className="form-control"
                    placeholder="e.g., 3.75"
                    value={privateInputs.gpa || ''}
                    onChange={(e) => handleInputChange('gpa', e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Proof Generation Button */}
      <div className="mb-4">
        <button
          className="btn btn-primary btn-lg w-100"
          onClick={handleGenerateProof}
          disabled={proofStatus === ProofStatus.GENERATING || !isFormValid()}
        >
          {proofStatus === ProofStatus.GENERATING ? (
            <>
              <i className="fas fa-spinner spinner me-2"></i>
              Generating Zero-Knowledge Proof...
            </>
          ) : (
            <>
              <i className="fas fa-key me-2"></i>
              Generate Proof
            </>
          )}
        </button>

        {!isFormValid() && (
          <small className="text-muted d-block mt-2">
            Please fill in all required fields to generate proof.
          </small>
        )}
      </div>

      {/* Status Display */}
      {proofStatus !== ProofStatus.IDLE && (
        <div className={`proof-status ${proofStatus}`}>
          {proofStatus === ProofStatus.GENERATING && (
            <>
              <i className="fas fa-cog fa-spin me-2"></i>
              <strong>Generating Proof</strong>
              <p className="mb-0 mt-2">
                Creating zero-knowledge proof using Leo circuit. This may take a few moments...
              </p>
            </>
          )}
          
          {proofStatus === ProofStatus.SUCCESS && proofResponse && (
            <>
              <i className="fas fa-check-circle me-2"></i>
              <strong>Proof Generated Successfully!</strong>
              <div className="mt-3">
                <div className="row">
                  <div className="col-12 mb-2">
                    <small className="text-muted">Proof Hash:</small>
                    <div className="font-monospace small bg-light p-2 rounded">
                      {proofResponse.proof.substring(0, 64)}...
                    </div>
                  </div>
                </div>
                
                <div className="d-flex gap-2 mt-3">
                  <button
                    className="btn btn-success btn-sm"
                    onClick={handleVerifyProof}
                  >
                    <i className="fas fa-check me-2"></i>
                    Verify Proof
                  </button>
                  
                  <button
                    className="btn btn-outline-primary btn-sm"
                    onClick={() => navigator.clipboard.writeText(JSON.stringify(proofResponse, null, 2))}
                  >
                    <i className="fas fa-copy me-2"></i>
                    Copy Proof
                  </button>
                </div>
              </div>
            </>
          )}
          
          {proofStatus === ProofStatus.ERROR && (
            <>
              <i className="fas fa-exclamation-triangle me-2"></i>
              <strong>Proof Generation Failed</strong>
              <p className="mb-0 mt-2">
                Please check your inputs and try again. Ensure your private data matches the signed credential.
              </p>
            </>
          )}
        </div>
      )}

      {/* Verification Result */}
      {verificationResult !== null && (
        <div className={`alert ${verificationResult ? 'alert-success' : 'alert-danger'} mt-3`}>
          <i className={`fas ${verificationResult ? 'fa-check-circle' : 'fa-times-circle'} me-2`}></i>
          <strong>
            {verificationResult ? 'Proof Verified Successfully!' : 'Proof Verification Failed'}
          </strong>
          <p className="mb-0 mt-2">
            {verificationResult 
              ? 'Your degree has been cryptographically verified without revealing personal information.'
              : 'The proof could not be verified. Please check your inputs and try again.'
            }
          </p>
        </div>
      )}
    </div>
  );
};

export default ProofGenerator;
