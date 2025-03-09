require('dotenv').config();
const { resolveDidDocument } = require('../resolveDidDocument');

(async () => {
  const accountTestId = process.env.TEST_ACCOUNT_ID;
  if (!accountTestId) {
    console.error("Error: TEST_ACCOUNT_ID is not defined in env file!");
    process.exit(1);
  }

  const did = `did:hedera:testnet:${accountTestId}`;
  console.log("Testing DID Document retrieval for:", did);

  const result = await resolveDidDocument(did);

  if (!result.success) {
    console.error("DID resolution failed:", result.message);
    process.exit(1);
  }

  console.log("DID Document successfully resolved!");
  console.log("DID Document:", JSON.stringify(result.didDocument, null, 2));
  console.log("Authorized Issuers:", result.authorizedIssuers);
})();
