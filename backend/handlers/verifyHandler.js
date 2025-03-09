const fs = require("fs");
const path = require("path");
const { verifySdJwtVc } = require("../../scripts/verifySdJwtVc");

/**
 * Handles the verification of a Verifiable Credential (VC) and checks conditions.
 */
async function handleVerification(req, res, verificationRequests) {
  console.log("New request received on /verify-vc");

  // Check if the required files were uploaded
  if (!req.files || !req.files["vcFile"] || !req.files["disclosuresFile"]) {
    console.error("Missing JSON files in request.");
    return res.status(400).json({ success: false, message: "Missing JSON files" });
  }

  const token = req.body.token;
  if (!token || !verificationRequests[token]) {
    console.error("Invalid or missing token.");
    return res.status(400).json({ success: false, message: "Invalid or missing token" });
  }

  const { userId, operations, flow } = verificationRequests[token];
  const vcFilePath = path.resolve(req.files["vcFile"][0].path);
  const disclosuresFilePath = path.resolve(req.files["disclosuresFile"][0].path);

  try {
    console.log("Reading VC file:", vcFilePath);
    console.log("Reading Disclosures file:", disclosuresFilePath);

    // Check if files exist before reading them
    if (!fs.existsSync(vcFilePath) || !fs.existsSync(disclosuresFilePath)) {
      console.error("One or both uploaded files are missing.");
      return res.status(400).json({ success: false, message: "Uploaded files not found" });
    }

    const vcContent = JSON.parse(fs.readFileSync(vcFilePath, "utf8"));
    const disclosuresContent = JSON.parse(fs.readFileSync(disclosuresFilePath, "utf8"));

    console.log("VC file received:", vcContent);
    console.log("Disclosures file received:", disclosuresContent);

    // Verify the SD-JWT VC and disclosures
    const vcVerificationResult = await verifySdJwtVc(vcContent, userId, disclosuresContent);

    if (!vcVerificationResult.verified) {
      let errorMessage = "VC verification failed.";

      // Specific error: VC does not belong to the user
      if (vcVerificationResult.error && vcVerificationResult.error.includes("Subject_id does not match")) {
        errorMessage = "The Verifiable Credential does not belong to you (Wrong ID).";
      }

      // Specific error: VC not issued by an authorized government authority
      if (vcVerificationResult.error && vcVerificationResult.error.includes("Invalid issuer")) {
        errorMessage = "Your ID document was not issued by an authorized government issuer.";
      }

      console.error(errorMessage);
      return res.status(400).json({ success: false, message: errorMessage });
    }

    const clearClaims = vcVerificationResult.clear_claims;
    console.log("Verified VC and extracted claims:", clearClaims);

    const verificationPassed = evaluateOperations(clearClaims, operations);
    const verificationStatus = verificationPassed ? "granted" : "denied";

    verificationRequests[token].status = verificationStatus;

    // Delete files after processing
    deleteFile(vcFilePath);
    deleteFile(disclosuresFilePath);

    // If verification is denied, do not redirect
    if (verificationStatus === "denied") {
      console.warn("Verification denied. Not redirecting.");
      return res.json({
        success: false,
        message: "Verification conditions not met.",
        status: "denied",
      });
    }

    // Construct the correct redirect URL
    const redirectUrl = `/${flow}?status=${verificationStatus}&userId=${userId}`;
    console.log("Redirecting to:", redirectUrl);

    res.json({ success: true, redirectUrl });
  } catch (error) {
    console.error("Error processing JSON files:", error);

    // Delete files if an error occurs
    deleteFile(vcFilePath);
    deleteFile(disclosuresFilePath);

    res.status(500).json({ success: false, message: "Error processing JSON files" });
  }
}

/**
 * Safely deletes a file.
 */
function deleteFile(filePath) {
  if (fs.existsSync(filePath)) {
    fs.unlink(filePath, (err) => {
      if (err) {
        console.warn(`Failed to delete ${filePath}:`, err);
      } else {
        console.log(`Deleted file: ${filePath}`);
      }
    });
  }
}

/**
 * Evaluates the verification conditions against the extracted claims.
 */
function evaluateOperations(clearClaims, operations) {
  let verificationPassed = true;
  const failedReasons = [];

  console.log("Evaluating verification conditions...");
  console.log("Received claims:", clearClaims);
  console.log("Operations to check:", operations);

  try {
    // Check date of birth (age verification)
    if (operations.dateOfBirth) {
      if (!clearClaims.dateOfBirth) {
        verificationPassed = false;
        failedReasons.push("Date of birth is missing.");
      } else {
        const birthDate = new Date(clearClaims.dateOfBirth);
        const compareDate = new Date(operations.dateOfBirth.value);

        if (operations.dateOfBirth.op === "lt" && !(birthDate < compareDate)) {
          verificationPassed = false;
          failedReasons.push("User is too young.");
        }

        if (operations.dateOfBirth.op === "lte" && !(birthDate <= compareDate)) {
          verificationPassed = false;
          failedReasons.push("User does not meet the minimum age requirement.");
        }
      }
    }

    // Check country of residence
    if (operations.countryOfResidence) {
      if (!clearClaims.countryOfResidence) {
        verificationPassed = false;
        failedReasons.push("Country of residence is missing.");
      } else {
        const userCountry = clearClaims.countryOfResidence;
        const expectedValue = operations.countryOfResidence.value;

        if (operations.countryOfResidence.op === "eq" && userCountry !== expectedValue) {
          verificationPassed = false;
          failedReasons.push(`User's country (${userCountry}) does not match required country (${expectedValue}).`);
        } else if (operations.countryOfResidence.op === "notIn" && expectedValue.includes(userCountry)) {
          verificationPassed = false;
          failedReasons.push(`User's country (${userCountry}) is in the restricted list: ${expectedValue}.`);
        }
      }
    }

    // Check name (exact match)
    if (operations.name) {
      if (!clearClaims.name) {
        verificationPassed = false;
        failedReasons.push("Name is missing.");
      } else {
        const userName = clearClaims.name;
        const expectedName = operations.name.value;

        if (operations.name.op === "eq" && userName !== expectedName) {
          verificationPassed = false;
          failedReasons.push(`User's name (${userName}) does not match the required name (${expectedName}).`);
        }
      }
    }

    if (!verificationPassed) {
      console.warn("Verification failed:", failedReasons);
    }
  } catch (error) {
    console.error("Error during evaluation of operations:", error);
    verificationPassed = false;
    failedReasons.push("Error processing verification conditions.");
  }

  return verificationPassed;
}

module.exports = { handleVerification };
