import { DiplomaData, HashedDiplomaData, Credential } from '../types';
import { hashData, generateKeyPair, signData, verifySignature } from '../utils/crypto';

/**
 * Issue a signed credential for degree data
 */
export const issueCredential = async (
  diplomaData: DiplomaData,
  issuerPrivateKey: string
): Promise<Credential> => {
  try {
    // Hash all the diploma data fields
    const hashedData: HashedDiplomaData = {
      degreeHash: await hashData(diplomaData.degree),
      schoolHash: await hashData(diplomaData.school),
      dateHash: await hashData(diplomaData.graduationDate),
      studentIdHash: await hashData(diplomaData.studentId),
      gpaHash: diplomaData.gpa ? await hashData(diplomaData.gpa.toString()) : undefined
    };

    // Create the data to be signed
    const dataToSign = JSON.stringify(hashedData);
    
    // Sign the hashed data
    const signature = await signData(dataToSign, issuerPrivateKey);
    
    // Extract public key from private key for verification
    const keyPair = await generateKeyPair();
    const issuerPublicKey = keyPair.publicKey; // In real implementation, derive from private key

    const credential: Credential = {
      hashedData,
      signature,
      issuerPublicKey,
      timestamp: Date.now()
    };

    return credential;
  } catch (error) {
    console.error('Credential issuance failed:', error);
    throw new Error('Failed to issue credential');
  }
};

/**
 * Verify a credential's signature
 */
export const verifyCredential = async (
  credential: Credential,
  issuerPublicKey: string
): Promise<boolean> => {
  try {
    const dataToVerify = JSON.stringify(credential.hashedData);
    return await verifySignature(dataToVerify, credential.signature, issuerPublicKey);
  } catch (error) {
    console.error('Credential verification failed:', error);
    return false;
  }
};

/**
 * Generate a new issuer key pair for institutions
 */
export const generateIssuerKeys = async (): Promise<{
  privateKey: string;
  publicKey: string;
}> => {
  return await generateKeyPair();
};

/**
 * Create a sample credential for testing
 */
export const createSampleCredential = async (): Promise<{
  diplomaData: DiplomaData;
  credential: Credential;
  issuerKeys: { privateKey: string; publicKey: string };
}> => {
  const issuerKeys = await generateIssuerKeys();
  
  const sampleDiplomaData: DiplomaData = {
    degree: "Bachelor of Science in Computer Science",
    school: "Massachusetts Institute of Technology",
    graduationDate: "2023-05-15",
    studentId: "123456789",
    gpa: 3.85
  };

  const credential = await issueCredential(sampleDiplomaData, issuerKeys.privateKey);

  return {
    diplomaData: sampleDiplomaData,
    credential,
    issuerKeys
  };
};

/**
 * Batch issue credentials for multiple students
 */
export const batchIssueCredentials = async (
  diplomaDataList: DiplomaData[],
  issuerPrivateKey: string
): Promise<Credential[]> => {
  const credentials: Credential[] = [];
  
  for (const diplomaData of diplomaDataList) {
    try {
      const credential = await issueCredential(diplomaData, issuerPrivateKey);
      credentials.push(credential);
    } catch (error) {
      console.error(`Failed to issue credential for student ${diplomaData.studentId}:`, error);
      throw error;
    }
  }

  return credentials;
};

/**
 * Export credential to file format
 */
export const exportCredential = (credential: Credential): string => {
  return JSON.stringify(credential, null, 2);
};

/**
 * Import credential from file content
 */
export const importCredential = (fileContent: string): Credential => {
  try {
    const credential = JSON.parse(fileContent) as Credential;
    
    // Validate credential structure
    if (!credential.hashedData || !credential.signature || !credential.issuerPublicKey) {
      throw new Error('Invalid credential format');
    }

    return credential;
  } catch (error) {
    console.error('Credential import failed:', error);
    throw new Error('Failed to import credential: Invalid format');
  }
};
