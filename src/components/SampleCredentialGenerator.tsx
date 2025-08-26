import React, { useState } from 'react';
import { issueCredential, generateIssuerKeys } from '../services/credentialIssuer';
import { DiplomaData } from '../types';

const SampleCredentialGenerator: React.FC = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedData, setGeneratedData] = useState<{
    credential: any;
    privateData: DiplomaData;
    issuerKeys: any;
  } | null>(null);

  const sampleData: DiplomaData = {
    degree: "Bachelor of Science in Computer Science",
    school: "Massachusetts Institute of Technology",
    graduationDate: "2023-05-15",
    studentId: "123456789",
    gpa: 3.85
  };

  const handleGenerateCredential = async () => {
    setIsGenerating(true);
    try {
      const issuerKeys = await generateIssuerKeys();
      const credential = await issueCredential(sampleData, issuerKeys.privateKey);
      
      // Add the actual issuer public key to the credential
      credential.issuerPublicKey = issuerKeys.publicKey;
      
      setGeneratedData({
        credential,
        privateData: sampleData,
        issuerKeys
      });
    } catch (error) {
      console.error('Failed to generate sample credential:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadCredential = () => {
    if (!generatedData) return;
    
    const dataStr = JSON.stringify(generatedData.credential, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = 'sample-credential.json';
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const downloadInstructions = () => {
    if (!generatedData) return;
    
    const instructions = `CREDENTIAL TEST INSTRUCTIONS
============================

This credential was generated for testing the Private Degree Verifier.

PRIVATE DATA (Enter these exactly when generating proof):
----------------------------------------------------------
Degree: ${generatedData.privateData.degree}
School: ${generatedData.privateData.school}
Graduation Date: ${generatedData.privateData.graduationDate}
Student ID: ${generatedData.privateData.studentId}
GPA: ${generatedData.privateData.gpa}

ISSUER INFORMATION:
-------------------
Public Key: ${generatedData.issuerKeys.publicKey.substring(0, 50)}...
(Full key is in the credential file)

HOW TO TEST:
------------
1. Upload the downloaded credential file (sample-credential.json)
2. Enter the EXACT private data shown above
3. Click "Generate Proof"
4. The system will verify that your private data matches the credential

IMPORTANT: Even changing one character will cause verification to fail!
This demonstrates the cryptographic security of the system.

SECURITY NOTE:
--------------
In a real system, only legitimate institutions would have the private keys
to sign credentials. The signature cannot be forged without the private key.
`;
    
    const dataUri = 'data:text/plain;charset=utf-8,'+ encodeURIComponent(instructions);
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', 'test-instructions.txt');
    linkElement.click();
  };

  return (
    <div className="sample-generator border rounded p-4 mb-4" style={{ backgroundColor: '#f0f9ff' }}>
      <h5 className="mb-3">
        <i className="fas fa-flask me-2 text-primary"></i>
        Generate Sample Credential for Testing
      </h5>
      
      {!generatedData ? (
        <>
          <p className="text-muted mb-3">
            Create a sample credential with known test data for demonstration purposes.
          </p>
          <button
            className="btn btn-primary"
            onClick={handleGenerateCredential}
            disabled={isGenerating}
          >
            {isGenerating ? (
              <>
                <i className="fas fa-spinner fa-spin me-2"></i>
                Generating...
              </>
            ) : (
              <>
                <i className="fas fa-certificate me-2"></i>
                Generate Sample Credential
              </>
            )}
          </button>
        </>
      ) : (
        <div>
          <div className="alert alert-success mb-3">
            <i className="fas fa-check-circle me-2"></i>
            <strong>Sample credential generated!</strong>
          </div>
          
          <div className="bg-white border rounded p-3 mb-3">
            <h6 className="text-primary mb-2">Test Data (Use these exact values):</h6>
            <ul className="mb-0 small">
              <li><strong>Degree:</strong> {generatedData.privateData.degree}</li>
              <li><strong>School:</strong> {generatedData.privateData.school}</li>
              <li><strong>Date:</strong> {generatedData.privateData.graduationDate}</li>
              <li><strong>Student ID:</strong> {generatedData.privateData.studentId}</li>
              <li><strong>GPA:</strong> {generatedData.privateData.gpa}</li>
            </ul>
          </div>
          
          <div className="d-flex gap-2">
            <button
              className="btn btn-success"
              onClick={downloadCredential}
            >
              <i className="fas fa-download me-2"></i>
              Download Credential
            </button>
            <button
              className="btn btn-outline-secondary"
              onClick={downloadInstructions}
            >
              <i className="fas fa-file-alt me-2"></i>
              Download Instructions
            </button>
            <button
              className="btn btn-outline-primary"
              onClick={handleGenerateCredential}
            >
              <i className="fas fa-redo me-2"></i>
              Generate New
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SampleCredentialGenerator;