const { generateKeyPairSync } = require("crypto");
const fs = require("fs");

function generateAndSaveKeys(city) {
    const { publicKey, privateKey } = generateKeyPairSync("rsa", {
        modulusLength: 2048,
        publicKeyEncoding: { type: "spki", format: "pem" },
        privateKeyEncoding: { type: "pkcs8", format: "pem" }
    });

    const cityLower = city.toLowerCase();
    fs.writeFileSync(`${cityLower}_rsa_private.pem`, privateKey);
    fs.writeFileSync(`${cityLower}_rsa_public.pem`, publicKey);

    console.log(`RSA keypairs generated for : ${city}`);

    return { privateKey, publicKey };
}

const pairKeys = generateAndSaveKeys("Lausanne");

const envContent = `
RSA_MAIRIE_LAUSANNE_PRIVATE_KEY="${pairKeys.privateKey.replace(/\n/g, "\\n")}"
RSA_MAIRIE_LAUSANNE_PUBLIC_KEY="${pairKeys.publicKey.replace(/\n/g, "\\n")}"
`;

fs.appendFileSync(".env", envContent);
console.log("\n RSA keys added to `.env` !");
