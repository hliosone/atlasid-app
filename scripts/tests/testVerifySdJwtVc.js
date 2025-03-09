require('dotenv').config();
const { verifySdJwtVc } = require("../verifySdJwtVc");

(async () => {
  try {
    if (!process.env.TEST_ACCOUNT_ID) {
      console.error("Error: TEST_ACCOUNT_ID is missing.");
      process.exit(1);
    }
    
    // Change the VC you want to verify here
    const sdJwtVcJSON = {
      "vc": {
        "@context": [
          "https://www.w3.org/2018/credentials/v1"
        ],
        "type": [
          "VerifiableCredential",
          "IdentityCredential"
        ],
        "issuer": "did:hedera:testnet:0.0.5664823",
        "subject_id": "did:hedera:testnet:0.0.5664891",
        "issuanceDate": "2025-03-08T20:32:34.446Z",
        "proof": {
          "type": "RsaSignature2018",
          "created": "2025-03-08T20:32:34.460Z",
          "proofPurpose": "assertionMethod",
          "verificationMethod": {
            "publicKeyPem": "-----BEGIN PUBLIC KEY-----\nMIIBIjANBgkqhkiG9w0BA..."
          },
          "sd_jwt": "eyJhbGciOiJSUzI1NiJ9.eyJ2YyI6eyJAY29udGV4dCI6WyJodHR..."
        }
      },
      "hashed_claims": {
        "firstName": "57990ddf23863ac56aa09a96ed07d50983b4476bcb30bf0fa774ce424dce560b",
        "lastName": "a5adbe7a32c843a8da94b89119e5bc94af74cb4e41783c24229e9e6d19c622cc",
        "dateOfBirth": "9c4d11305f93e74cf7c813417824afad93ca070214b96eb3d572b09f8ec860dc",
        "countryOfResidence": "85e07a229bf063e40447e19c25f38cc535d19ae2dd8b83a26f8b89cf4a793b55"
      },
      "proof": {
        "type": "RsaSignature2018",
        "created": "2025-03-08T20:32:34.460Z",
        "proofPurpose": "assertionMethod",
        "verificationMethod": {
          "publicKeyPem": "-----BEGIN PUBLIC KEY-----\nMIIBIjANBgkqhkiG9w0BA..."
        },
        "sd_jwt": "eyJhbGciOiJSUzI1NiJ9.eyJ2YyI6eyJAY29udGV4dCI6WyJodHR..."
      }
    };

    // Change the disclosures you want to use here
    const disclosuresJSON = {
      "firstName": {
        "salt": "e2e1fd298a6a165aade651f539494845",
        "value": "John"
      },
      "lastName": {
        "salt": "e7429e48a8fe056069a795a86f84d949",
        "value": "Doe"
      },
      "dateOfBirth": {
        "salt": "032142ace88f4edcc70513a52ff0c979",
        "value": "1995-06-12"
      },
      "countryOfResidence": {
        "salt": "741b22122dc626582e446a2d5882b91a",
        "value": "France"
      }
    };

    // Verification of the hardcoded SD-JWT VC
    const sdJwtVcString = JSON.stringify(sdJwtVcJSON);
    console.log("SD-JWT VC to be verified:");
    console.log(sdJwtVcString);

    const accountId = process.env.TEST_ACCOUNT_ID;
    console.log("Using test account:", accountId);

    console.log("Starting verification of the hardcoded SD-JWT VC with disclosures...");
    const result = await verifySdJwtVc(sdJwtVcString, accountId, disclosuresJSON);
    console.log("Verification result:", result);
  } catch (error) {
    console.error("Error during verification:", error);
  }
})();
