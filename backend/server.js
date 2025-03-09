const express = require("express");
const multer = require("multer");
const path = require("path");
const cors = require("cors");
const fs = require("fs");

// Check if the uploads/ directory exists, if not, create it
const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log("Created 'uploads/' directory");
}

// Configure Multer to store files in the uploads/ directory
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    // Add a unique suffix to avoid filename collisions
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + "-" + file.originalname);
  }
});

// Create the upload middleware
const upload = multer({ storage: storage });

const app = express();
app.use(express.json());
app.use(cors());

const verificationRequests = {};

const { handleVerificationRequest, getVerificationRequest } = require("./handlers/requestHandler");
const { handleVerification } = require("./handlers/verifyHandler");

// Route 1: request-verification
app.post("/request-verification", (req, res) => {
  handleVerificationRequest(req, res, verificationRequests);
});

// Route 2: verification-request
app.get("/verification-request", (req, res) => {
  getVerificationRequest(req, res, verificationRequests);
});

// Route 3: verify-vc (receives two files: "vcFile" and "disclosuresFile")
app.post(
  "/verify-vc",
  upload.fields([
    { name: "vcFile", maxCount: 1 },
    { name: "disclosuresFile", maxCount: 1 }
  ]),
  (req, res) => {
    handleVerification(req, res, verificationRequests);
  }
);

app.listen(3001, () => console.log("Server started on port 3001"));
