import { DiplomaData, Credential } from '../src/types';
import { issueCredential, generateIssuerKeys } from '../src/services/credentialIssuer';

/**
 * Serverless function for issuing credentials
 * This endpoint would typically be restricted to authorized educational institutions
 */

export default async function handler(
  req: any,
  res: any
): Promise<void> {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    res.status(405).json({
      error: 'Method not allowed',
      message: 'Only POST requests are allowed'
    });
    return;
  }

  try {
    // Authenticate the request (in production, this would use proper authentication)
    const authHeader = req.headers.authorization;
    const issuerPrivateKey = process.env.ISSUER_PRIVATE_KEY;
    
    if (!authHeader || !issuerPrivateKey) {
      res.status(401).json({
        error: 'Unauthorized',
        message: 'Valid authorization required'
      });
      return;
    }

    // Parse request body
    const requestBody = req.body;
    
    if (requestBody.action === 'generate-keys') {
      // Generate new issuer keys
      const keys = await generateIssuerKeys();
      res.status(200).json({
        success: true,
        keys: {
          publicKey: keys.publicKey,
          // Never return private key in real implementation
          message: 'Private key generated (store securely - not returned)'
        }
      });
      return;
    }

    if (requestBody.action === 'issue-credential') {
      const diplomaData: DiplomaData = requestBody.diplomaData;
      
      // Validate diploma data
      if (!diplomaData || !diplomaData.degree || !diplomaData.school || 
          !diplomaData.graduationDate || !diplomaData.studentId) {
        res.status(400).json({
          error: 'Invalid request',
          message: 'Missing required diploma data fields'
        });
        return;
      }

      // Issue the credential
      const credential = await issueCredential(diplomaData, issuerPrivateKey);
      
      res.status(200).json({
        success: true,
        credential,
        message: 'Credential issued successfully'
      });
      return;
    }

    if (requestBody.action === 'batch-issue') {
      const diplomaDataList: DiplomaData[] = requestBody.diplomaDataList;
      
      if (!Array.isArray(diplomaDataList) || diplomaDataList.length === 0) {
        res.status(400).json({
          error: 'Invalid request',
          message: 'diplomaDataList must be a non-empty array'
        });
        return;
      }

      // Validate each diploma data entry
      for (const diplomaData of diplomaDataList) {
        if (!diplomaData.degree || !diplomaData.school || 
            !diplomaData.graduationDate || !diplomaData.studentId) {
          res.status(400).json({
            error: 'Invalid request',
            message: 'Each diploma data entry must have all required fields'
          });
          return;
        }
      }

      // Issue credentials for all entries
      const credentials: Credential[] = [];
      const errors: string[] = [];

      for (let i = 0; i < diplomaDataList.length; i++) {
        try {
          const credential = await issueCredential(diplomaDataList[i], issuerPrivateKey);
          credentials.push(credential);
        } catch (error) {
          errors.push(`Failed to issue credential for entry ${i}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }

      res.status(200).json({
        success: errors.length === 0,
        credentials,
        errors: errors.length > 0 ? errors : undefined,
        message: `Issued ${credentials.length} out of ${diplomaDataList.length} credentials`
      });
      return;
    }

    // Unknown action
    res.status(400).json({
      error: 'Invalid request',
      message: 'Unknown action. Supported actions: generate-keys, issue-credential, batch-issue'
    });

  } catch (error) {
    console.error('Credential issuance error:', error);
    
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to process credential request'
    });
  }
}

/**
 * Health check endpoint for credential issuer service
 */
export async function healthCheck(): Promise<{
  status: string;
  timestamp: number;
  version: string;
}> {
  return {
    status: 'healthy',
    timestamp: Date.now(),
    version: '1.0.0'
  };
}

/**
 * Get issuer public key for verification
 */
export async function getIssuerPublicKey(): Promise<{
  publicKey: string;
  keyId: string;
  issuedAt: number;
}> {
  // In production, this would return the actual issuer's public key
  const mockPublicKey = process.env.ISSUER_PUBLIC_KEY || 'mock_public_key_' + Date.now();
  
  return {
    publicKey: mockPublicKey,
    keyId: 'issuer_key_001',
    issuedAt: Date.now()
  };
}

/**
 * Revoke a credential (for emergency situations)
 */
export async function revokeCredential(
  credentialId: string,
  reason: string
): Promise<{
  success: boolean;
  message: string;
  revokedAt: number;
}> {
  // In production, this would:
  // 1. Add the credential to a revocation list
  // 2. Update the revocation registry on the blockchain
  // 3. Notify relevant parties
  
  console.log(`Revoking credential ${credentialId} for reason: ${reason}`);
  
  return {
    success: true,
    message: `Credential ${credentialId} has been revoked`,
    revokedAt: Date.now()
  };
}
