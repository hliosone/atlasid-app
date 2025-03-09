require('dotenv').config();
const { verifySdJwtVc } = require("../verifySdJwtVc");

(async () => {
  try {
    if (!process.env.UTILISATEUR_BOB_ID) {
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
        "subject_id": "did:hedera:testnet:0.0.5664826",
        "issuanceDate": "2025-03-09T06:42:33.236Z",
        "proof": {
          "type": "RsaSignature2018",
          "created": "2025-03-09T06:42:33.248Z",
          "proofPurpose": "assertionMethod",
          "verificationMethod": {
            "publicKeyPem": "-----BEGIN PUBLIC KEY-----\nMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAxcA13jsfLCCx/p/5Crru\nkrofWI3zFhmuMCFg0ipTHo6g3O7Vr2zNJLOVNmqAKoTmBN53m3uSPfpF1desw5/s\n4ubRa8MLrV2qcCXAb46H6j1yNyY1Twz0JoyBoVlW+wKRQ+lAkMDtiL5JKW286Raz\nfVU1eoMEeJLO9MZmYIfwwlqkCLC32LQHp1xCPhotHyQNgypwvbv5DP7w8x3gADX7\npBkb8denOMdywgw/OYxJnb36YogcxYfiWheuXfN/1s42OyT4iKVvMZK9509maU32\nZcVbRTgjAg+UDaLd/ydWcg5Eu30Os88bnhq3TGplSrSeLuKAZbyyVHDwzBpQq3Zs\nLQIDAQAB\n-----END PUBLIC KEY-----\n"
          },
          "sd_jwt": "eyJhbGciOiJSUzI1NiJ9.eyJ2YyI6eyJAY29udGV4dCI6WyJodHRwczovL3d3dy53My5vcmcvMjAxOC9jcmVkZW50aWFscy92MSJdLCJ0eXBlIjpbIlZlcmlmaWFibGVDcmVkZW50aWFsIiwiSWRlbnRpdHlDcmVkZW50aWFsIl0sImlzc3VlciI6ImRpZDpoZWRlcmE6dGVzdG5ldDowLjAuNTY2NDgyMyIsInN1YmplY3RfaWQiOiJkaWQ6aGVkZXJhOnRlc3RuZXQ6MC4wLjU2NjQ4MjYiLCJpc3N1YW5jZURhdGUiOiIyMDI1LTAzLTA5VDA2OjQyOjMzLjIzNloifSwiaGFzaGVkX2NsYWltcyI6eyJmaXJzdE5hbWUiOiIxNzQ1NjZhNDE2ZmNiNDhiNzFiYjI0YjYyN2MwMDYwMjExM2E2YzE0YmFhNGM2YjNiMjIwY2ExMjcxZTA5MWM2IiwibGFzdE5hbWUiOiJlNDU4YTE2N2U4NjJhM2Q4ODBiNTk5OGY4ZWNiY2U3OGI1NDkwM2U4ZTFiYTRiNzhkNTQ0ZDQ3ZTc0NjZhZDFlIiwiZGF0ZU9mQmlydGgiOiIxOWNmNWVkMDIwNGUyNTNlMzA0YmMxMzRlNGU5MWI3MDNjNDNlZjk5MTM1N2JjMzAxNmI5ZGE1NWEyN2I2MDc5IiwiY291bnRyeU9mUmVzaWRlbmNlIjoiMTJlNzJmZGE1NDk3MGM3OWZhMmU2NmNhMjI2ZmNmYzI3ZWUyNjA5YzNjZWIxMzljMTg1YTkzY2E5MjI2NDM1NiJ9LCJpYXQiOjE3NDE1MDI1NTMsImV4cCI6MTg5OTI5MDU1M30.FCr3GPU_RVA2SeGi7D04AZK-QjHQ16HKZRwaM9sPJ-tFedSL3dvDLCLs35plaWWJNYKYRMoNmOoAoIDzyZ13emRU7ACv1n029xsPKIRXmJE998qRV_mF9glX_FtBjJs_0FvF2r7pY1KrUnt4jidQzlsxCwp1cLXp_7aZgnTfrxWi0Bgzz63puqhzktle-uiFH_2reF6SF936ehFqvqXR1hrn__Oc64SDsqittqeTDpdvebJ0glLGEUf0J6suabZhoAwzSIv0MFr-7WMCQUwQw3hLLWNuLm4FPg5jTEeYdzHzrdj5dfNdbYGfO1boHcx0v8OyIOvs1YsWxYceFN1xng"
        }
      },
      "hashed_claims": {
        "firstName": "174566a416fcb48b71bb24b627c00602113a6c14baa4c6b3b220ca1271e091c6",
        "lastName": "e458a167e862a3d880b5998f8ecbce78b54903e8e1ba4b78d544d47e7466ad1e",
        "dateOfBirth": "19cf5ed0204e253e304bc134e4e91b703c43ef991357bc3016b9da55a27b6079",
        "countryOfResidence": "12e72fda54970c79fa2e66ca226fcfc27ee2609c3ceb139c185a93ca92264356"
      },
      "proof": {
        "type": "RsaSignature2018",
        "created": "2025-03-09T06:42:33.248Z",
        "proofPurpose": "assertionMethod",
        "verificationMethod": {
          "publicKeyPem": "-----BEGIN PUBLIC KEY-----\nMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAxcA13jsfLCCx/p/5Crru\nkrofWI3zFhmuMCFg0ipTHo6g3O7Vr2zNJLOVNmqAKoTmBN53m3uSPfpF1desw5/s\n4ubRa8MLrV2qcCXAb46H6j1yNyY1Twz0JoyBoVlW+wKRQ+lAkMDtiL5JKW286Raz\nfVU1eoMEeJLO9MZmYIfwwlqkCLC32LQHp1xCPhotHyQNgypwvbv5DP7w8x3gADX7\npBkb8denOMdywgw/OYxJnb36YogcxYfiWheuXfN/1s42OyT4iKVvMZK9509maU32\nZcVbRTgjAg+UDaLd/ydWcg5Eu30Os88bnhq3TGplSrSeLuKAZbyyVHDwzBpQq3Zs\nLQIDAQAB\n-----END PUBLIC KEY-----\n"
        },
        "sd_jwt": "eyJhbGciOiJSUzI1NiJ9.eyJ2YyI6eyJAY29udGV4dCI6WyJodHRwczovL3d3dy53My5vcmcvMjAxOC9jcmVkZW50aWFscy92MSJdLCJ0eXBlIjpbIlZlcmlmaWFibGVDcmVkZW50aWFsIiwiSWRlbnRpdHlDcmVkZW50aWFsIl0sImlzc3VlciI6ImRpZDpoZWRlcmE6dGVzdG5ldDowLjAuNTY2NDgyMyIsInN1YmplY3RfaWQiOiJkaWQ6aGVkZXJhOnRlc3RuZXQ6MC4wLjU2NjQ4MjYiLCJpc3N1YW5jZURhdGUiOiIyMDI1LTAzLTA5VDA2OjQyOjMzLjIzNloifSwiaGFzaGVkX2NsYWltcyI6eyJmaXJzdE5hbWUiOiIxNzQ1NjZhNDE2ZmNiNDhiNzFiYjI0YjYyN2MwMDYwMjExM2E2YzE0YmFhNGM2YjNiMjIwY2ExMjcxZTA5MWM2IiwibGFzdE5hbWUiOiJlNDU4YTE2N2U4NjJhM2Q4ODBiNTk5OGY4ZWNiY2U3OGI1NDkwM2U4ZTFiYTRiNzhkNTQ0ZDQ3ZTc0NjZhZDFlIiwiZGF0ZU9mQmlydGgiOiIxOWNmNWVkMDIwNGUyNTNlMzA0YmMxMzRlNGU5MWI3MDNjNDNlZjk5MTM1N2JjMzAxNmI5ZGE1NWEyN2I2MDc5IiwiY291bnRyeU9mUmVzaWRlbmNlIjoiMTJlNzJmZGE1NDk3MGM3OWZhMmU2NmNhMjI2ZmNmYzI3ZWUyNjA5YzNjZWIxMzljMTg1YTkzY2E5MjI2NDM1NiJ9LCJpYXQiOjE3NDE1MDI1NTMsImV4cCI6MTg5OTI5MDU1M30.FCr3GPU_RVA2SeGi7D04AZK-QjHQ16HKZRwaM9sPJ-tFedSL3dvDLCLs35plaWWJNYKYRMoNmOoAoIDzyZ13emRU7ACv1n029xsPKIRXmJE998qRV_mF9glX_FtBjJs_0FvF2r7pY1KrUnt4jidQzlsxCwp1cLXp_7aZgnTfrxWi0Bgzz63puqhzktle-uiFH_2reF6SF936ehFqvqXR1hrn__Oc64SDsqittqeTDpdvebJ0glLGEUf0J6suabZhoAwzSIv0MFr-7WMCQUwQw3hLLWNuLm4FPg5jTEeYdzHzrdj5dfNdbYGfO1boHcx0v8OyIOvs1YsWxYceFN1xng"
      }
    };

    // Change the disclosures you want to use here
    const disclosuresJSON = {
      "firstName": {
        "salt": "f18958618deadb41fb692db288a53a8e",
        "value": "Bob"
      },
      "lastName": {
        "salt": "09b7efa1b2cc62e4801dc78b29580c7d",
        "value": "Lepongette"
      },
      "dateOfBirth": {
        "salt": "d65c9d64a1f145fd607706c167334351",
        "value": "1995-01-01"
      },
      "countryOfResidence": {
        "salt": "b774cc4ccb3b81acb1fb506c135417e8",
        "value": "Spain"
      }
    };

    // Verification of the hardcoded SD-JWT VC
    const sdJwtVcString = JSON.stringify(sdJwtVcJSON);
    console.log("SD-JWT VC to be verified:");
    console.log(sdJwtVcString);

    const accountId = process.env.UTILISATEUR_BOB_ID;
    console.log("Using test account:", accountId);

    console.log("Starting verification of the hardcoded SD-JWT VC with disclosures...");
    const result = await verifySdJwtVc(sdJwtVcString, accountId, disclosuresJSON);
    console.log("Verification result:", result);
  } catch (error) {
    console.error("Error during verification:", error);
  }
})();
