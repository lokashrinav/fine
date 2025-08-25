# Private Degree Verifier

## Overview

This is a privacy-preserving degree verification system that allows graduates to prove their educational credentials without revealing personal information. The application uses zero-knowledge proofs to verify degree authenticity while maintaining data privacy. Built as a React-based web application, it integrates with Aleo blockchain wallet functionality and provides both credential issuance and verification capabilities through a clean, user-friendly interface.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 19 with TypeScript for type safety and modern component patterns
- **Styling**: Bootstrap 5 for responsive UI components with custom CSS for enhanced visual appeal
- **Build Tool**: Vite for fast development and optimized production builds
- **State Management**: React hooks (useState, useEffect) for local component state management
- **Component Structure**: Modular components including WalletConnector, CredentialUploader, and ProofGenerator

### Backend Architecture
- **API Endpoints**: Serverless functions for credential issuance (`/api/issue-credential.ts`) and proof verification (`/api/verify.ts`)
- **Authentication**: Header-based authentication for credential issuance endpoint
- **CORS**: Configured for cross-origin requests with appropriate headers
- **Request Handling**: RESTful POST endpoints with proper error handling and validation

### Cryptographic System
- **Hashing**: SHA-256 for diploma data hashing using Web Crypto API
- **Digital Signatures**: ECDSA with P-256 curve for credential signing
- **Key Management**: Cryptographic key pair generation and management utilities
- **Zero-Knowledge Proofs**: Leo circuit integration for privacy-preserving verification (simulated in current implementation)

### Data Flow Architecture
1. **Credential Issuance**: Educational institutions hash diploma data and sign it to create verifiable credentials
2. **Proof Generation**: Users provide private inputs that are verified against hashed credential data
3. **Verification**: Zero-knowledge proofs are verified without revealing underlying diploma information
4. **Wallet Integration**: Aleo blockchain wallet connection for identity and transaction management

### Service Layer
- **Aleo Service**: Handles wallet connection, disconnection, and blockchain interactions
- **Credential Issuer**: Manages credential creation and signature verification
- **Proof Service**: Handles zero-knowledge proof generation and verification
- **Crypto Utils**: Provides cryptographic primitives for hashing, signing, and key generation

## External Dependencies

### Core Technologies
- **React 19**: Frontend framework for component-based UI development
- **TypeScript**: Static typing for enhanced code reliability and developer experience
- **Vite**: Modern build tool for fast development and optimized bundling

### UI Framework
- **Bootstrap 5**: CSS framework for responsive design and pre-built components
- **Font Awesome 6**: Icon library for enhanced visual interface elements

### Blockchain Integration
- **Aleo Wallet**: Browser-based wallet integration for blockchain connectivity
- **Leo Language**: Zero-knowledge proof circuit language (intended for future implementation)

### Development Environment
- **Node.js**: Runtime environment for development tooling
- **npm**: Package management for dependency installation and script execution

### Deployment Platform
- **Serverless Functions**: Vercel/Netlify-compatible API endpoints for credential operations
- **Static Hosting**: Frontend deployment through static site hosting services

### Browser APIs
- **Web Crypto API**: Native browser cryptographic operations for hashing and signing
- **File API**: Browser file reading capabilities for credential upload functionality
- **LocalStorage**: Browser storage for wallet connection persistence