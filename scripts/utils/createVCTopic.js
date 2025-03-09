require('dotenv').config();
const { Client, PrivateKey, TopicCreateTransaction } = require("@hashgraph/sdk");
const fs = require("fs");
const path = require("path");

(async () => {
    if (!process.env.GOUVERNEMENT_ID || !process.env.GOUVERNEMENT_PRIVATE_KEY) {
        console.error("GOUVERNEMENT_ID and GOUVERNEMENT_PRIVATE_KEY must be defined in `.env`");
        process.exit(1);
    }

    const client = Client.forTestnet();
    client.setOperator(process.env.GOUVERNEMENT_ID, PrivateKey.fromStringED25519(process.env.GOUVERNEMENT_PRIVATE_KEY));

    console.log("Creating an HCS Topic to store SD-JWT VC hashes...");

    const transaction = await new TopicCreateTransaction().execute(client);
    const receipt = await transaction.getReceipt(client);
    const vcTopicId = receipt.topicId.toString();

    console.log(`VC Topic successfully created: ${vcTopicId}`);

    // Save the Topic ID to .env
    const envFilePath = path.join(__dirname, "../.env");
    let envContent = fs.existsSync(envFilePath) ? fs.readFileSync(envFilePath, "utf8") : "";
    envContent = envContent.replace(/VC_TOPIC_ID=.*/g, "");
    envContent += `\nVC_TOPIC_ID=${vcTopicId}`;
    fs.writeFileSync(envFilePath, envContent, { encoding: "utf8", flag: "w" });

    console.log("VC Topic ID saved in .env");

    process.exit(0);
})();
