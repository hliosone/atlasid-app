require('dotenv').config();
const { PrivateKey, Client, TopicMessageSubmitTransaction } = require("@hashgraph/sdk");
const fs = require("fs");
const crypto = require("crypto");
const { SignJWT, importPKCS8 } = require("jose");

function generateSalt(length = 16) {
  return crypto.randomBytes(length).toString("hex");
}

function hashClaim(salt, value) {
  return crypto.createHash("sha256").update(salt + JSON.stringify(value)).digest("hex");
}

(async () => {
  console.log("Starting SD-JWT VC generation...");

  if (
    !process.env.SDJWT_VC_TOPIC_ID || 
    !process.env.RSA_MAIRIE_LAUSANNE_PRIVATE_KEY || 
    !process.env.RSA_MAIRIE_LAUSANNE_PUBLIC_KEY || 
    !process.env.MAIRIE_LAUSANNE_ID || // Change to the issuer's account ID
    !process.env.UTILISATEUR_ALICIA_ID // Change to the receiver's account ID
  ) {
    console.error("Error: One or more environment variables are missing.");
    process.exit(1);
  }

  const client = Client.forTestnet();
  client.setOperator(process.env.MAIRIE_LAUSANNE_ID, PrivateKey.fromStringED25519(process.env.MAIRIE_LAUSANNE_PRIVATE_KEY));
  const vcTopicId = process.env.SDJWT_VC_TOPIC_ID;
  console.log("Hedera client configured, topic ID =", vcTopicId);

  const issuerDID = `did:hedera:testnet:${process.env.MAIRIE_LAUSANNE_ID}`;
  const subjectDID = `did:hedera:testnet:${process.env.UTILISATEUR_ALICIA_ID}`;
  console.log("Issuer DID =", issuerDID, "| Subject DID =", subjectDID);

  const verifiableCredential = {
    "@context": ["https://www.w3.org/2018/credentials/v1"],
    "type": ["VerifiableCredential", "IdentityCredential"],
    "issuer": issuerDID,
    "subject_id": subjectDID,
    "issuanceDate": new Date().toISOString()
  };
  console.log("Verifiable Credential created:", verifiableCredential);

  const rawClaims = {
    "firstName": "Alicia",
    "lastName": "PrivateKeys",
    "dateOfBirth": "2000-01-01",
    "countryOfResidence": "Suisse"
  };
  // console.log("Raw claims:", rawClaims); For debug 

  const hashedClaims = {};
  const disclosures = {};
  for (const claim in rawClaims) {
    const salt = generateSalt();
    const value = rawClaims[claim];
    const digest = hashClaim(salt, value);
    hashedClaims[claim] = digest;
    disclosures[claim] = { salt, value };
    console.log(`Claim '${claim}' hashed:`, digest);
  }

  // Compute overall_hash on { vc, hashed_claims }
  const overallHash = crypto.createHash("sha256")
    .update(JSON.stringify({ vc: verifiableCredential, hashed_claims: hashedClaims }))
    .digest("hex");
  console.log("Overall hash computed:", overallHash);

  const payload = {
    vc: verifiableCredential,
    hashed_claims: hashedClaims
  };

  const privateKeyPem = process.env.RSA_MAIRIE_LAUSANNE_PRIVATE_KEY.replace(/\\n/g, "\n");
  const privateKey = await importPKCS8(privateKeyPem, "RS256");
  console.log("RSA private key imported.");

  const sdJwt = await new SignJWT(payload)
    .setProtectedHeader({ alg: "RS256" })
    .setIssuedAt()
    .setExpirationTime("5y")
    .sign(privateKey);
  console.log("SD-JWT signed:", sdJwt);

  const publicKeyPem = process.env.RSA_MAIRIE_LAUSANNE_PUBLIC_KEY.replace(/\\n/g, "\n");
  verifiableCredential.proof = {
    "type": "RsaSignature2018",
    "created": new Date().toISOString(),
    "proofPurpose": "assertionMethod",
    "verificationMethod": { "publicKeyPem": publicKeyPem },
    "sd_jwt": sdJwt
  };

  // Create an object containing the structure used for hashing and the proof
  const vcData = {
    vc: verifiableCredential,
    hashed_claims: hashedClaims,
    proof: verifiableCredential.proof
  };

  fs.writeFileSync("sd-jwt-vc.json", JSON.stringify(vcData, null, 2));
  console.log("SD-JWT VC saved in 'sd-jwt-vc.json'");

  fs.writeFileSync("disclosures.json", JSON.stringify(disclosures, null, 2));
  console.log("Disclosures saved in 'disclosures.json'");

  const onChainMessage = {
    vc_hash: overallHash,
    issuer: issuerDID,
    subject_id: subjectDID,
    issued_at: verifiableCredential.issuanceDate,
    status: "valid"
  };
  console.log("On-chain message prepared:", onChainMessage);

  try {
    const transaction = await new TopicMessageSubmitTransaction()
      .setTopicId(vcTopicId)
      .setMessage(JSON.stringify(onChainMessage))
      .execute(client);
    const receipt = await transaction.getReceipt(client);
    console.log(`SD-JWT VC published on Hedera (Status: ${receipt.status})`);
  } catch (error) {
    console.error("Error publishing on Hedera:", error);
  }

  process.exit(0);
})();
