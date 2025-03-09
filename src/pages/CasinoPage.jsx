import React, { useEffect, useState } from 'react';
import { useUser } from '../context/UserContext';
import { useNavigate, useLocation } from 'react-router-dom';

const CasinoPage = () => {
  const { currentUser } = useUser();
  const navigate = useNavigate();
  const location = useLocation();
  const [verificationStatus, setVerificationStatus] = useState(() => {
    // Load saved status if it exists
    return localStorage.getItem("verificationStatus") || null;
  });

  // Check if returning from a redirection after verification
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const status = params.get('status');

    if (status) {
      setVerificationStatus(status);
      localStorage.setItem("verificationStatus", status); // Save verification status
    }
  }, [location]);

  const handleVerification = async () => {
    if (!currentUser) return;

    try {
      const response = await fetch("http://localhost:3001/request-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: currentUser.accountId,
          operations: {
            dateOfBirth: { op: "lt", value: "2007-01-01" },
            countryOfResidence: { op: "not_in", value: ["Portugal", "Suisse"] }
          }
        })
      });

      const result = await response.json();

      if (result.success && result.atlasIdUrl) {
        console.log("Redirecting to Atlas ID:", result.atlasIdUrl);
        navigate(result.atlasIdUrl); // Redirect to Atlas ID page for verification
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
        <h1>Casino</h1>
        <p>No user connected. Please log in.</p>
      </div>
    );
  }

  return (
    <div>
      <h1>Casino</h1>
      <p>User: {currentUser.name} (ID: {currentUser.accountId})</p>

      {/* Display verification result */}
      {verificationStatus === "granted" && (
        <p style={{ color: "green", fontWeight: "bold" }}>✅ Access granted!</p>
      )}
      {verificationStatus === "denied" && (
        <p style={{ color: "red", fontWeight: "bold" }}>❌ Access denied.</p>
      )}

      {/* Hide button if the user is already verified */}
      {verificationStatus !== "granted" && (
        <button style={{ backgroundColor: 'red', color: 'white' }} onClick={handleVerification}>
          Verification required
        </button>
      )}
    </div>
  );
};

export default CasinoPage;
