import React, { useEffect, useState } from "react";
import { useUser } from "../context/UserContext";
import { useNavigate, useLocation } from "react-router-dom";

const ReferendumPage = () => {
  const { currentUser } = useUser();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Generate a specific key to store the status per user
  const userKey = currentUser ? `referendumVerificationStatus_${currentUser.accountId}` : null;

  // Load the status from localStorage
  const [verificationStatus, setVerificationStatus] = useState(() => {
    return userKey ? localStorage.getItem(userKey) || null : null;
  });

  useEffect(() => {
    if (!userKey) return;

    const params = new URLSearchParams(location.search);
    const status = params.get("status");

    if (status) {
      setVerificationStatus(status);
      localStorage.setItem(userKey, status);
    }
  }, [location, userKey]);

  const handleReferendumCheck = async () => {
    if (!currentUser) return;

    try {
      const response = await fetch("http://localhost:3001/request-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: currentUser.accountId,
          operations: {
            countryOfResidence: { op: "eq", value: "Suisse" }
          }
        })
      });

      const result = await response.json();

      if (result.success && result.atlasIdUrl) {
        console.log("Redirecting to Atlas ID:", result.atlasIdUrl);
        navigate(result.atlasIdUrl); // Redirect to Atlas ID for verification
      } else {
        console.error("API error:", result.message);
      }
    } catch (error) {
      console.error("Error connecting to the API:", error);
    }
  };

  if (!currentUser) {
    return (
      <div>
        <h1>Referendum</h1>
        <p>No user connected. Please log in.</p>
      </div>
    );
  }

  return (
    <div>
      <h1>Referendum</h1>
      <p>User: {currentUser.name} (ID: {currentUser.accountId})</p>

      {/* Display verification status */}
      {verificationStatus === "granted" && (
        <p style={{ color: "green", fontWeight: "bold" }}>You are eligible to vote in the referendum!</p>
      )}
      {verificationStatus === "denied" && (
        <p style={{ color: "red", fontWeight: "bold" }}>You are not eligible to vote.</p>
      )}

      {/* Hide button if the user is already verified */}
      {verificationStatus !== "granted" && (
        <button style={{ backgroundColor: 'red', color: 'white' }} onClick={handleReferendumCheck}>
          Verify Referendum Eligibility
        </button>
      )}
    </div>
  );
};

export default ReferendumPage;
