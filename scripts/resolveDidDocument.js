require('dotenv').config();
const { Client, TopicMessageQuery } = require('@hashgraph/sdk');

/**
 * Assembles a complete JSON message from its chunks.
 * @param {Array} chunkMessages - Array of objects { chunkIndex, data }
 * @returns {string} - The fully assembled JSON.
 */
function assembleChunks(chunkMessages) {
  chunkMessages.sort((a, b) => a.chunkIndex - b.chunkIndex);
  let fullData = "";
  chunkMessages.forEach(msg => {
    fullData += msg.data;
  });
  return fullData;
}

/**
 * Retrieves and reconstructs a DID Document from a Hedera topic.
 * @param {string} did - Example: "did:hedera:testnet:0.0.12345"
 * @returns {Promise<object>} - { success: boolean, didDocument, authorizedIssuers, message: string }
 */
async function resolveDidDocument(did) {
  console.log("Resolving DID Document for:", did);

  const didParts = did.split(":");
  if (didParts.length < 4) {
    return { success: false, message: "Invalid DID format, expected: did:hedera:testnet:0.0.xxxx" };
  }
  const accountId = didParts[3];
  console.log("Extracted accountId:", accountId);

  const client = Client.forTestnet();
  const didTopicId = process.env.DID_TOPIC_ID;

  if (!didTopicId) {
    return { success: false, message: "DID_TOPIC_ID not set in .env" };
  }

  let messages = [];
  console.log(`Fetching messages from DID topic: ${didTopicId}`);
  try {
    const query = new TopicMessageQuery()
      .setTopicId(didTopicId)
      .setStartTime(new Date(2025, 0, 1)); // Adjust if needed

    await new Promise((resolve) => {
      const subscription = query.subscribe(client, (message) => {
        const msgStr = Buffer.from(message.contents, "utf-8").toString();
        try {
          const msgData = JSON.parse(msgStr);
          messages.push({ timestamp: message.consensusTimestamp, ...msgData });
          console.log("DID message received:", msgData);
        } catch (e) {
          console.error("Error parsing DID message:", e.message);
        }
      });

      setTimeout(() => {
        subscription.unsubscribe();
        resolve();
      }, 5000);
    });
  } catch (error) {
    console.error("Error retrieving DID messages:", error.message);
    return { success: false, message: "Error retrieving DID: " + error.message };
  }
  console.log("Message retrieval complete. Messages received:", messages.length);

  const didMessages = messages.filter(msg => msg.id === did);
  if (didMessages.length === 0) {
    console.error("No matching message found for this DID:", did);
    return { success: false, message: "No DID Document found for " + did };
  }

  didMessages.sort((a, b) => b.timestamp - a.timestamp);
  const latestDidMsg = didMessages[0];

  if (latestDidMsg.chunkTotal && latestDidMsg.chunkTotal > 1) {
    const versionId = latestDidMsg.versionId || latestDidMsg.timestamp;
    const chunkGroup = didMessages.filter(m => (m.versionId || m.timestamp) === versionId);

    const chunkData = chunkGroup.map(c => ({ chunkIndex: c.chunkIndex, data: c.data }));
    const assembledJson = assembleChunks(chunkData);

    console.log("Assembled JSON from chunks:", assembledJson);

    try {
      const didDocument = JSON.parse(assembledJson);
      console.log("DID Document successfully reconstructed:", JSON.stringify(didDocument, null, 2));

      if (didDocument.id !== did) {
        console.error(`DID mismatch! Received: ${didDocument.id}, Expected: ${did}`);
        return { success: false, message: "Resolved DID does not match the request." };
      }

      const authorizedIssuers = didDocument.service?.find(s => s.type === "AuthorizedCredentialIssuers")?.authorizedIssuers || [];
      console.log("Authorized Issuers found:", authorizedIssuers);

      return { success: true, didDocument, authorizedIssuers };

    } catch (e) {
      console.error("Error parsing assembled DID Document:", e.message);
      return { success: false, message: "Error parsing assembled DID Document: " + e.message };
    }
  } else {
    console.log("No chunking detected. Using raw message.");

    try {
      const didDocument = latestDidMsg;
      console.log("DID Document:", JSON.stringify(didDocument, null, 2));

      if (didDocument.id !== did) {
        console.error(`DID mismatch! Received: ${didDocument.id}, Expected: ${did}`);
        return { success: false, message: "Resolved DID does not match the request." };
      }

      const authorizedIssuers = didDocument.service?.find(s => s.type === "AuthorizedCredentialIssuers")?.authorizedIssuers || [];
      console.log("Authorized Issuers found:", authorizedIssuers);

      return { success: true, didDocument, authorizedIssuers };

    } catch (e) {
      console.error("Error parsing DID Document:", e.message);
      return { success: false, message: "Error parsing DID Document: " + e.message };
    }
  }
}

module.exports = { resolveDidDocument };
