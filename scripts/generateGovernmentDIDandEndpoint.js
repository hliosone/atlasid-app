require('dotenv').config();
const { 
    Client, 
    PrivateKey, 
    TopicCreateTransaction, 
    TopicMessageSubmitTransaction, 
    FileId 
} = require("@hashgraph/sdk");
const { HcsDid } = require("@hashgraph/did-sdk-js");

(async () => {
    if (!process.env.GOVERNMENT_ID || !process.env.GOVERNMENT_PRIVATE_KEY) {
        console.error("GOVERNMENT_ID and GOVERNMENT_PRIVATE_KEY must be defined in `.env`");
        process.exit(1);
    }

    const client = Client.forTestnet();
    const testPrivateKey = PrivateKey.fromStringED25519(process.env.GOVERNMENT_PRIVATE_KEY);
    client.setOperator(process.env.GOVERNMENT_ID, testPrivateKey);

    // we check if the DID Topic already exists
    let didTopicId = process.env.DID_TOPIC_ID;

    if (!didTopicId) {
        console.log("Creating a DID Topic on Hedera...");

        const transaction = new TopicCreateTransaction().execute(client);
        const receipt = await (await transaction).getReceipt(client);
        didTopicId = receipt.topicId.toString();

        console.log(`DID Topic created: ${didTopicId}`);

        require('fs').appendFileSync(".env", `\nDID_TOPIC_ID=${didTopicId}`);
    } else {
        console.log(`DID Topic already exists: ${didTopicId}`);
    }

    const didPrivateKey = HcsDid.generateDidRootKey();
    const did = new HcsDid(
        "testnet",
        didPrivateKey.publicKey,
        FileId.fromString("0.0.102"), 
        didTopicId
    );

    const didIdentifier = `did:hedera:testnet:${process.env.GOVERNMENT_ID}`;  

    // Updating authorized issuers in the DID Document
    const authorizedIssuers = [
        {
            "name": "Mairie de Paris",
            "accountDID": `did:hedera:testnet:${process.env.MAIRIE_PARIS_ID || "UNKNOWN"}`,
            "publicKey": process.env.RSA_MAIRIE_PARIS_PUBLIC_KEY || "UNKNOWN"
        },
        {
            "name": "Mairie de Lyon",
            "accountDID": `did:hedera:testnet:${process.env.MAIRIE_LYON_ID || "UNKNOWN"}`,
            "publicKey": process.env.RSA_MAIRIE_LYON_PUBLIC_KEY || "UNKNOWN"
        }
    ];

    const didDocument = {
        "@context": "https://www.w3.org/ns/did/v1",
        "id": didIdentifier, 
        "verificationMethod": [
            {
                "id": `${didIdentifier}#did-root-key`,
                "type": "Ed25519VerificationKey2018",
                "controller": didIdentifier,
                "publicKeyBase58": didPrivateKey.publicKey.toString()
            }
        ],
        "authentication": [`${didIdentifier}#did-root-key`],
        "service": [
            {
                "id": `${didIdentifier}#authorized-issuers`,
                "type": "AuthorizedCredentialIssuers",
                "serviceEndpoint": "https://superGovernment.com/official-credential-issuers",
                "authorizedIssuers": authorizedIssuers
            }
        ]
    };

    console.log("Publishing the DID Document...");

    const messageTransaction = new TopicMessageSubmitTransaction()
        .setTopicId(didTopicId)
        .setMessage(JSON.stringify(didDocument))
        .execute(client);

    await (await messageTransaction).getReceipt(client);

    console.log("DID Document published!");
    console.log("Final DID Document:", JSON.stringify(didDocument, null, 2));

    process.exit(0);
})();
