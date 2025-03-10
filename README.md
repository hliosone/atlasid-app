# AtlasID App

AtlasID App is a demo project that showcases selective disclosure verification using SD-JWT Verifiable Credentials (VCs). The platform allows users to verify specific attributes (such as age or country of residence) without revealing their full identity. The goal is to use it in accordance with EUDIW and E-ID Standard wallets features.

## Project Purpose

This application demonstrates a privacy-preserving verification system where companies can request verification for specific attributes.

## Available Verifications (Examples)

### Casino Access
- Must be 18+ years old (`dateOfBirth < 2007-01-01`).
- Must not reside in Portugal or Switzerland.

### Referendum Eligibility
- Must be a resident of Switzerland (`countryOfResidence = Suisse`).

## How the Verification Works

1. A user requests verification.
2. The app generates a verification token and provides an upload link.
3. The user submits their SD-JWT Verifiable Credential (VC) and disclosures.
4. The system:
   - Decodes the VC.
   - Extracts the disclosed claims.
   - Checks them against the required conditions.
5. The system grants or denies access based on the verification rules:
   - If granted, the user is redirected to the requested service.
   - If denied, the user is notified of the rejection.

## 🛠️ Setup & Running the Project

### 1. Install dependencies
Make sure you have Node.js installed, then run:
```sh
npm install
```

### 2. Start the front-end and API
Make sure you have Node.js installed, then run:
```sh
node backend/server.js
```

### 3. Notes
This project is a proof-of-concept and is not meant for production.
The .env file is included only for testing.
The backend stores verification requests in memory (not persistent).
