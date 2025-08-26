import React, { useState } from 'react';

const ProofExplanation: React.FC = () => {
  const [showExplanation, setShowExplanation] = useState(false);

  return (
    <div className="proof-explanation mt-4">
      <button
        className="btn btn-link p-0 text-start"
        onClick={() => setShowExplanation(!showExplanation)}
      >
        <i className={`fas fa-chevron-${showExplanation ? 'down' : 'right'} me-2`}></i>
        <span className="text-primary">
          What does this proof mean and how would I use it?
        </span>
      </button>

      {showExplanation && (
        <div className="card mt-2 border-info">
          <div className="card-body">
            <h6 className="card-title text-info">
              <i className="fas fa-lightbulb me-2"></i>
              Understanding Your Zero-Knowledge Proof
            </h6>
            
            <div className="mb-3">
              <strong>What the Proof Contains:</strong>
              <ul className="mt-2">
                <li><strong>Proof Hash:</strong> A cryptographic proof that you have a valid degree WITHOUT revealing your personal details</li>
                <li><strong>Public Inputs:</strong> Only the issuer's identity and timestamp - NO personal data</li>
                <li><strong>Verification Key:</strong> Used to verify the proof is authentic</li>
              </ul>
            </div>

            <div className="mb-3">
              <strong>Real-World Use Cases:</strong>
              <ol className="mt-2">
                <li className="mb-2">
                  <strong>Job Applications:</strong>
                  <br />
                  <small className="text-muted">
                    Send the proof to employers to verify you have the required degree without revealing your GPA, student ID, or graduation year
                  </small>
                </li>
                
                <li className="mb-2">
                  <strong>Professional Licensing:</strong>
                  <br />
                  <small className="text-muted">
                    Prove you meet educational requirements for licenses without exposing unnecessary personal information
                  </small>
                </li>
                
                <li className="mb-2">
                  <strong>Online Verification:</strong>
                  <br />
                  <small className="text-muted">
                    Add proof to LinkedIn or professional profiles - anyone can verify it's real without seeing your private data
                  </small>
                </li>
                
                <li className="mb-2">
                  <strong>Academic Applications:</strong>
                  <br />
                  <small className="text-muted">
                    Apply to graduate programs proving you have prerequisites without revealing your entire transcript
                  </small>
                </li>
                
                <li className="mb-2">
                  <strong>International Recognition:</strong>
                  <br />
                  <small className="text-muted">
                    Share proof globally - cryptographic verification works anywhere without translation or authentication services
                  </small>
                </li>
              </ol>
            </div>

            <div className="alert alert-success">
              <i className="fas fa-shield-alt me-2"></i>
              <strong>Privacy Protection:</strong>
              <br />
              The verifier learns ONLY that you have a valid degree from the institution. They cannot see:
              <ul className="mb-0 mt-2">
                <li>Your name or student ID</li>
                <li>Your exact graduation date</li>
                <li>Your GPA or grades</li>
                <li>Any other personal information</li>
              </ul>
            </div>

            <div className="alert alert-warning">
              <i className="fas fa-info-circle me-2"></i>
              <strong>How Verification Works:</strong>
              <br />
              In a production system with Aleo blockchain:
              <ol className="mb-0 mt-2">
                <li>The proof would be posted to the blockchain</li>
                <li>Anyone could verify it using the public verification key</li>
                <li>The institution's public key would be checked against the blockchain registry</li>
                <li>Mathematical guarantees ensure the proof cannot be faked</li>
              </ol>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProofExplanation;