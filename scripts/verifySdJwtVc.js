require('dotenv').config();
const crypto = require("crypto");
const { jwtVerify, importSPKI } = require("jose");
const { Client, TopicMessageQuery } = require("@hashgraph/sdk");
const { resolveDidDocument } = require("./resolveDidDocument"); // DID document resolution

/**
 * Verifies the received SD‑JWT VC.
 * @param {object|string} sdJwtVcInput
 * @param {string} accountId 
 * @param {object} [disclosures] 
 * @returns {Promise<object>}
 */
async function verifySdJwtVc(sdJwtVcInput, accountId, disclosures) {
    console.log("Starting verification of SD‑JWT VC...");

    const sdJwtVc = typeof sdJwtVcInput === "string" ? JSON.parse(sdJwtVcInput) : sdJwtVcInput;

    const expectedSubjectDID = `did:hedera:testnet:${accountId}`;
    console.log("Expected subject DID:", expectedSubjectDID);

    if (sdJwtVc.vc.subject_id !== expectedSubjectDID) {
        console.error("Subject_id does not match:", sdJwtVc.vc.subject_id);
        return { verified: false, message: `VC subject_id (${sdJwtVc.vc.subject_id}) does not match expected DID (${expectedSubjectDID}).` };
    }
    console.log("Subject_id verified:", sdJwtVc.vc.subject_id);

    // Retrieve the government DID document to verify the issuer
    const issuerDID = sdJwtVc.vc.issuer;
    console.log("Retrieving government DID document...");
    const governmentDID = `did:hedera:testnet:${process.env.GOVERNMENT_ID}`;
    console.log("Government DID:", governmentDID);

    const govDidResult = await resolveDidDocument(governmentDID);
    if (!govDidResult.success) {
        console.error("Failed to retrieve government DID document:", govDidResult.message);
        return { verified: false, message: "Failed to retrieve government DID document." };
    }

    console.log("Government DID document retrieved:", JSON.stringify(govDidResult.didDocument, null, 2));

    // Check if the issuer is authorized
    console.log(`Looking for issuer ${issuerDID} in authorized issuers...`);
    const authorizedIssuer = govDidResult.authorizedIssuers.find(issuer => issuer.accountDID === issuerDID);
    if (!authorizedIssuer) {
        console.error("Issuer is not authorized:", issuerDID);
        return { verified: false, message: "The VC issuer is not authorized by the government." };
    }

    console.log("Authorized issuer found:", authorizedIssuer);

    // Import the public key of the issuer to verify the VC
    const publicKeyPem = authorizedIssuer.publicKey.replace(/\\n/g, "\n");
    let publicKey;
    try {
        publicKey = await importSPKI(publicKeyPem, "RS256");
        console.log("Issuer public key imported.");
    } catch (error) {
        console.error("Error importing issuer public key:", error.message);
        return { verified: false, message: "Error importing issuer public key: " + error.message };
    }

    // Verify SD-JWT signature
    const sdJwt = sdJwtVc.proof?.sd_jwt;
    if (!sdJwt) {
        console.error("SD‑JWT VC does not contain proof.sd_jwt.");
        return { verified: false, message: "SD‑JWT VC does not contain proof.sd_jwt." };
    }

    let payload;
    try {
        const { payload: jwtPayload } = await jwtVerify(sdJwt, publicKey, { algorithms: ["RS256"] });
        payload = jwtPayload;
        console.log("JWT verified and decoded, payload:", payload);
    } catch (error) {
        console.error("Error verifying JWT signature:", error.message);
        return { verified: false, message: "Error verifying JWT signature: " + error.message };
    }

    // Verify on-chain hash
    const reconstructedObj = { vc: payload.vc, hashed_claims: payload.hashed_claims };
    const recalculatedHash = crypto.createHash("sha256")
        .update(JSON.stringify(reconstructedObj))
        .digest("hex");
    console.log("Recalculated hash:", recalculatedHash);

    const client = Client.forTestnet();
    let messages = [];
    console.log("Fetching on-chain messages for subject_id:", expectedSubjectDID);

    try {
        const query = new TopicMessageQuery()
            .setTopicId(process.env.SDJWT_VC_TOPIC_ID)
            .setStartTime(new Date(2025, 0, 1));

        await new Promise((resolve, reject) => {
            const subscription = query.subscribe(client, (message) => {
                const msgStr = Buffer.from(message.contents, "utf-8").toString();
                try {
                    const msgData = JSON.parse(msgStr);
                    messages.push({ timestamp: message.consensusTimestamp, ...msgData });
                    console.log("On-chain message received:", msgData);
                } catch (e) {
                    console.error("Error parsing on-chain message:", e.message);
                }
            });
            setTimeout(() => {
                subscription.unsubscribe();
                resolve();
            }, 5000);
        });
        console.log("On-chain retrieval completed. Messages received:", messages.length);
    } catch (error) {
        console.error("Error retrieving on-chain messages:", error.message);
        return { verified: false, message: "Error retrieving on-chain messages: " + error.message };
    }

    // Verify VC on-chain
    const latestMessage = messages
        .filter(msg => msg.subject_id === expectedSubjectDID)
        .sort((a, b) => b.timestamp - a.timestamp)[0];

    if (!latestMessage) {
        console.error("No on-chain record found for this subject_id.");
        return { verified: false, message: "No on-chain record found for this subject_id." };
    }

    console.log("Matching on-chain message found:", latestMessage);
    if (recalculatedHash !== latestMessage.vc_hash) {
        console.error("Recalculated hash does not match on-chain hash.");
        return { verified: false, message: "Recalculated hash does not match on-chain hash. VC has been modified." };
    }
    console.log("Recalculated hash matches on-chain hash.");

    return {
        verified: true,
        message: "SD‑JWT VC is authentic and valid on-chain.",
        issuer: payload.vc.issuer,
        subject: payload.vc.subject_id,
        issued_at: payload.vc.issuanceDate,
        clear_claims: disclosures ? Object.fromEntries(Object.entries(disclosures).map(([key, { value }]) => [key, value])) : {}
    };
}

module.exports = { verifySdJwtVc };