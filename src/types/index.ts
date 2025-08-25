export interface DiplomaData {
  degree: string;
  school: string;
  graduationDate: string;
  studentId: string;
  gpa?: number;
}

export interface HashedDiplomaData {
  degreeHash: string;
  schoolHash: string;
  dateHash: string;
  studentIdHash: string;
  gpaHash?: string;
}

export interface Credential {
  hashedData: HashedDiplomaData;
  signature: string;
  issuerPublicKey: string;
  timestamp: number;
}

export interface ProofRequest {
  credential: Credential;
  privateInputs: DiplomaData;
}

export interface ProofResponse {
  proof: string;
  publicInputs: string[];
  verificationKey: string;
}

export interface VerificationRequest {
  proof: string;
  publicInputs: string[];
  verificationKey: string;
  issuerPublicKey: string;
}

export interface VerificationResponse {
  isValid: boolean;
  message: string;
  verifiedAt: number;
}

export interface WalletState {
  isConnected: boolean;
  address: string | null;
  balance?: string;
  network?: string;
}

export interface AleoProvider {
  connect(): Promise<string>;
  disconnect(): Promise<void>;
  getAddress(): Promise<string>;
  getBalance(): Promise<string>;
  signMessage(message: string): Promise<string>;
  requestTransaction(transaction: any): Promise<string>;
}

export enum ProofStatus {
  IDLE = 'idle',
  GENERATING = 'generating',
  SUCCESS = 'success',
  ERROR = 'error'
}
