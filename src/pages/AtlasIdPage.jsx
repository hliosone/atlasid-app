import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext";

const AtlasIdPage = () => {
  const { tokenId } = useParams(); // Retrieve the token from the URL
  const navigate = useNavigate();
  const { currentUser } = useUser(); 

  const [verificationRequest, setVerificationRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [vcFile, setVcFile] = useState(null);
  const [disclosuresFile, setDisclosuresFile] = useState(null);

  // Fetch the verification request from the backend
  useEffect(() => {
    console.log("Loading details for token:", tokenId);

    const fetchVerificationRequest = async () => {
      try {
        const response = await fetch(`http://localhost:3001/verification-request?token=${tokenId}`);
        const result = await response.json();

        if (result.success) {
          console.log("Request found:", result.request);
          setVerificationRequest(result.request);
        } else {
          console.error("API Error:", result.message);
          setError(result.message || "Error retrieving the request");
        }
      } catch (err) {
        console.error("Backend connection error:", err);
        setError("Error retrieving the request");
      }
      setLoading(false);
    };

    fetchVerificationRequest();
  }, [tokenId]);

  // Ensure the logged-in user matches the verification request
  useEffect(() => {
    if (verificationRequest && currentUser) {
      if (verificationRequest.userId !== currentUser.accountId) {
        console.error("Error: logged-in user does not match request user");
        setError("The logged-in user does not match the verification request.");
      }
    }
  }, [verificationRequest, currentUser]);

  // Handle file selection
  const handleFileChange = (e, setter) => {
    const file = e.target.files[0];
    if (file && file.type === "application/json") {
      setter(file);
    } else {
      alert("Please select a valid JSON file.");
    }
  };

  // Submit files for verification
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!vcFile || !disclosuresFile) {
      alert("Please select both files.");
      return;
    }

    const formData = new FormData();
    formData.append("vcFile", vcFile);
    formData.append("disclosuresFile", disclosuresFile);
    formData.append("token", tokenId);

    try {
      const response = await fetch("http://localhost:3001/verify-vc", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (result.success && result.redirectUrl) {
        console.log("Redirecting to:", result.redirectUrl);
        navigate(result.redirectUrl);
      } else {
        alert(result.message || "Error during verification.");
      }
    } catch (error) {
      console.error("Error submitting files:", error);
      alert("An error occurred while submitting the files.");
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div style={{ color: "red" }}>{error}</div>;
  }

  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <h1>Atlas ID – Verification</h1>
      <p>
        <strong>Token:</strong> {tokenId}
      </p>
      <p>
        <strong>Expected user:</strong> {verificationRequest?.userId}
      </p>
      <hr />
      <h2>Upload your documents</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>JSON SD-JWT VC File:</label>
          <input type="file" accept=".json" onChange={(e) => handleFileChange(e, setVcFile)} />
        </div>
        <div>
          <label>JSON Disclosures File:</label>
          <input type="file" accept=".json" onChange={(e) => handleFileChange(e, setDisclosuresFile)} />
        </div>
        <button type="submit">Submit</button>
      </form>
    </div>
  );
};

export default AtlasIdPage;
