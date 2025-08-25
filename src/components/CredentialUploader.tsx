import React, { useState, useRef } from 'react';
import { Credential } from '../types';

interface CredentialUploaderProps {
  onCredentialUpload: (credential: Credential) => void;
}

const CredentialUploader: React.FC<CredentialUploaderProps> = ({
  onCredentialUpload
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setError(null);

    try {
      const fileContent = await readFileAsText(file);
      const credential = JSON.parse(fileContent) as Credential;
      
      // Validate credential structure
      validateCredential(credential);
      
      onCredentialUpload(credential);
    } catch (error) {
      console.error('Failed to upload credential:', error);
      setError(error instanceof Error ? error.message : 'Failed to upload credential');
    } finally {
      setIsUploading(false);
    }
  };

  const readFileAsText = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  };

  const validateCredential = (credential: any) => {
    if (!credential || typeof credential !== 'object') {
      throw new Error('Invalid credential format');
    }

    const requiredFields = ['hashedData', 'signature', 'issuerPublicKey', 'timestamp'];
    for (const field of requiredFields) {
      if (!(field in credential)) {
        throw new Error(`Missing required field: ${field}`);
      }
    }

    const requiredHashedFields = ['degreeHash', 'schoolHash', 'dateHash', 'studentIdHash'];
    for (const field of requiredHashedFields) {
      if (!(field in credential.hashedData)) {
        throw new Error(`Missing required hashed field: ${field}`);
      }
    }

    // Validate signature format
    if (typeof credential.signature !== 'string' || credential.signature.length === 0) {
      throw new Error('Invalid signature format');
    }

    // Validate public key format
    if (typeof credential.issuerPublicKey !== 'string' || credential.issuerPublicKey.length === 0) {
      throw new Error('Invalid issuer public key format');
    }

    // Validate timestamp
    if (typeof credential.timestamp !== 'number' || credential.timestamp <= 0) {
      throw new Error('Invalid timestamp');
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const files = event.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      if (fileInputRef.current) {
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(file);
        fileInputRef.current.files = dataTransfer.files;
        fileInputRef.current.dispatchEvent(new Event('change', { bubbles: true }));
      }
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  return (
    <div className="credential-uploader">
      <div
        className="upload-area border border-2 border-dashed rounded p-4 text-center"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        style={{ 
          borderColor: error ? '#ef4444' : '#d1d5db',
          backgroundColor: error ? 'rgba(239, 68, 68, 0.05)' : 'rgba(249, 250, 251, 1)'
        }}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".json,.cred"
          onChange={handleFileSelect}
          style={{ display: 'none' }}
        />
        
        {isUploading ? (
          <div className="uploading-state">
            <i className="fas fa-spinner spinner fa-2x text-primary mb-3"></i>
            <p className="mb-0">Processing credential file...</p>
          </div>
        ) : (
          <div className="upload-prompt">
            <i className="fas fa-cloud-upload-alt fa-2x text-secondary mb-3"></i>
            <p className="mb-2">
              <strong>Upload your credential file</strong>
            </p>
            <p className="text-muted small mb-3">
              Drag and drop your .json or .cred file here, or click to browse
            </p>
            <button
              type="button"
              className="btn btn-outline-primary"
              onClick={handleButtonClick}
              disabled={isUploading}
            >
              <i className="fas fa-folder-open me-2"></i>
              Choose File
            </button>
          </div>
        )}
      </div>

      {error && (
        <div className="alert alert-danger mt-3">
          <i className="fas fa-exclamation-triangle me-2"></i>
          <strong>Upload Error:</strong> {error}
          <br />
          <small className="text-muted">
            Please ensure your credential file is valid and properly formatted.
          </small>
        </div>
      )}

      <div className="mt-3">
        <small className="text-muted">
          <i className="fas fa-info-circle me-1"></i>
          <strong>Need a credential file?</strong> Contact your educational institution 
          to request a digitally signed degree credential, or use our credential issuer tool.
        </small>
      </div>
    </div>
  );
};

export default CredentialUploader;
