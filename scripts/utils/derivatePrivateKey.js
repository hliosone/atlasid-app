require('dotenv').config();
const { PrivateKey } = require("@hashgraph/sdk");
const fs = require("fs");
const path = require("path");

function derivePublicKey(privateKeyHex) {
    try {
        const privateKey = PrivateKey.fromStringED25519(privateKeyHex);
        return privateKey.publicKey.toString();
    } catch (error) {
        console.error(`Erreur lors de la dérivation de la clé publique : ${error}`);
        return null;
    }
}

// Fonction pour mettre à jour le fichier .env
function updateEnvFile(key, value) {
    const envFilePath = path.join(__dirname, ".env");
    let envContent = fs.existsSync(envFilePath) ? fs.readFileSync(envFilePath, "utf8") : "";
    const keyRegex = new RegExp(`^${key}=.*$`, "m");
    const newLine = `${key}=${value}`;
    if (envContent.match(keyRegex)) {
        envContent = envContent.replace(keyRegex, newLine);
    } else {
        envContent += `\n${newLine}`;
    }
    fs.writeFileSync(envFilePath, envContent.trim(), { encoding: "utf8" });
}

// Dérivation et mise à jour pour la Mairie de Paris
const parisPrivateKey = process.env.MAIRIE_PARIS_PRIVATE_KEY;
if (parisPrivateKey) {
    const parisPublicKey = derivePublicKey(parisPrivateKey);
    if (parisPublicKey) {
        updateEnvFile("MAIRIE_PARIS_PUBLIC_KEY", parisPublicKey);
        console.log("Clé publique de la Mairie de Paris dérivée et enregistrée avec succès.");
    }
} else {
    console.error("La clé privée de la Mairie de Paris n'est pas définie dans le fichier .env.");
}

// Dérivation et mise à jour pour la Mairie de Lyon
const lyonPrivateKey = process.env.MAIRIE_LYON_PRIVATE_KEY;
if (lyonPrivateKey) {
    const lyonPublicKey = derivePublicKey(lyonPrivateKey);
    if (lyonPublicKey) {
        updateEnvFile("MAIRIE_LYON_PUBLIC_KEY", lyonPublicKey);
        console.log("Clé publique de la Mairie de Lyon dérivée et enregistrée avec succès.");
    }
} else {
    console.error("La clé privée de la Mairie de Lyon n'est pas définie dans le fichier .env.");
}
