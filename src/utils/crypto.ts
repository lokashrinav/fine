/**
 * Cryptographic utilities for the degree verification system
 */

/**
 * Hash data using SHA-256
 */
export const hashData = async (data: string): Promise<string> => {
  try {
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(data);
    const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex;
  } catch (error) {
    console.error('Hashing failed:', error);
    throw new Error('Failed to hash data');
  }
};

/**
 * Generate a cryptographic key pair for signing
 */
export const generateKeyPair = async (): Promise<{
  privateKey: string;
  publicKey: string;
}> => {
  try {
    // Generate ECDSA key pair
    const keyPair = await crypto.subtle.generateKey(
      {
        name: 'ECDSA',
        namedCurve: 'P-256'
      },
      true, // extractable
      ['sign', 'verify']
    );

    // Export private key
    const privateKeyBuffer = await crypto.subtle.exportKey('pkcs8', keyPair.privateKey);
    const privateKeyArray = Array.from(new Uint8Array(privateKeyBuffer));
    const privateKeyHex = privateKeyArray.map(b => b.toString(16).padStart(2, '0')).join('');

    // Export public key
    const publicKeyBuffer = await crypto.subtle.exportKey('spki', keyPair.publicKey);
    const publicKeyArray = Array.from(new Uint8Array(publicKeyBuffer));
    const publicKeyHex = publicKeyArray.map(b => b.toString(16).padStart(2, '0')).join('');

    return {
      privateKey: privateKeyHex,
      publicKey: publicKeyHex
    };
  } catch (error) {
    console.error('Key generation failed:', error);
    throw new Error('Failed to generate key pair');
  }
};

/**
 * Sign data with a private key
 */
export const signData = async (data: string, privateKeyHex: string): Promise<string> => {
  try {
    // Convert hex private key back to buffer
    const privateKeyBuffer = new Uint8Array(
      privateKeyHex.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16))
    );

    // Import private key
    const privateKey = await crypto.subtle.importKey(
      'pkcs8',
      privateKeyBuffer,
      {
        name: 'ECDSA',
        namedCurve: 'P-256'
      },
      false,
      ['sign']
    );

    // Sign the data
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(data);
    const signatureBuffer = await crypto.subtle.sign(
      {
        name: 'ECDSA',
        hash: 'SHA-256'
      },
      privateKey,
      dataBuffer
    );

    // Convert signature to hex string
    const signatureArray = Array.from(new Uint8Array(signatureBuffer));
    const signatureHex = signatureArray.map(b => b.toString(16).padStart(2, '0')).join('');
    
    return signatureHex;
  } catch (error) {
    console.error('Signing failed:', error);
    throw new Error('Failed to sign data');
  }
};

/**
 * Verify a signature with a public key
 */
export const verifySignature = async (
  data: string,
  signatureHex: string,
  publicKeyHex: string
): Promise<boolean> => {
  try {
    // Convert hex public key back to buffer
    const publicKeyBuffer = new Uint8Array(
      publicKeyHex.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16))
    );

    // Import public key
    const publicKey = await crypto.subtle.importKey(
      'spki',
      publicKeyBuffer,
      {
        name: 'ECDSA',
        namedCurve: 'P-256'
      },
      false,
      ['verify']
    );

    // Convert hex signature back to buffer
    const signatureBuffer = new Uint8Array(
      signatureHex.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16))
    );

    // Verify the signature
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(data);
    const isValid = await crypto.subtle.verify(
      {
        name: 'ECDSA',
        hash: 'SHA-256'
      },
      publicKey,
      signatureBuffer,
      dataBuffer
    );

    return isValid;
  } catch (error) {
    console.error('Signature verification failed:', error);
    return false;
  }
};

/**
 * Generate a secure random string
 */
export const generateRandomString = (length: number): string => {
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  const randomBytes = new Uint8Array(length);
  crypto.getRandomValues(randomBytes);
  
  for (let i = 0; i < length; i++) {
    result += charset[randomBytes[i] % charset.length];
  }
  
  return result;
};

/**
 * Hash multiple data fields together
 */
export const hashMultipleFields = async (fields: string[]): Promise<string> => {
  const combinedData = fields.join('|');
  return await hashData(combinedData);
};

/**
 * Create a merkle tree root from multiple hashes
 */
export const createMerkleRoot = async (hashes: string[]): Promise<string> => {
  if (hashes.length === 0) {
    throw new Error('Cannot create merkle root from empty array');
  }
  
  if (hashes.length === 1) {
    return hashes[0];
  }
  
  const nextLevel: string[] = [];
  
  // Process pairs of hashes
  for (let i = 0; i < hashes.length; i += 2) {
    const left = hashes[i];
    const right = i + 1 < hashes.length ? hashes[i + 1] : left;
    const combined = await hashData(left + right);
    nextLevel.push(combined);
  }
  
  // Recursively build the tree
  return await createMerkleRoot(nextLevel);
};

/**
 * Validate hex string format
 */
export const isValidHex = (hex: string): boolean => {
  return /^[0-9a-fA-F]+$/.test(hex) && hex.length % 2 === 0;
};
