const crypto = require("crypto");

/**
 * Handles the verification request: generates a token and stores the request.
 */
function handleVerificationRequest(req, res, verificationRequests) {
  const { userId, operations, flow } = req.body;

  // Validate required parameters
  if (!userId || !operations) {
    return res.status(400).json({ success: false, message: "userId and operations are required." });
  }

  // Generate a unique token
  const token = crypto.randomBytes(8).toString("hex");
  const atlasIdUrl = `/atlas-id/${token}`;

  // Store the request in memory
  verificationRequests[token] = {
    userId,
    operations,
    flow: flow || "casino", // Default to "casino" if not specified
    status: "pending",
    createdAt: new Date().toISOString(),
  };

  console.log("Generated token:", token);
  console.log("Atlas ID URL:", atlasIdUrl);

  res.json({ success: true, atlasIdUrl });
}

/**
 * Retrieves a verification request associated with a token.
 */
function getVerificationRequest(req, res, verificationRequests) {
  const token = req.query.token;

  // Check if the token is provided
  if (!token) {
    return res.status(400).json({ success: false, message: "Token required" });
  }

  const request = verificationRequests[token];

  // Check if the request exists
  if (!request) {
    return res.status(404).json({ success: false, message: "Verification request not found" });
  }

  console.log("Verification request retrieved for token:", token);

  res.json({ success: true, request });
}

module.exports = { handleVerificationRequest, getVerificationRequest };
