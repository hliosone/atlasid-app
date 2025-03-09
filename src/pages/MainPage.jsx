import React from 'react';
import { useUser } from '../context/UserContext';

function MainPage() {
  const { currentUser, setCurrentUser } = useUser();

  // Retrieve values from the .env file to simulate user IDs
  const USER_BOB_ID = process.env.REACT_APP_UTILISATEUR_BOB_ID;
  const USER_ALICIA_ID = process.env.REACT_APP_UTILISATEUR_ALICIA_ID;
  console.log("USER_BOB_ID:", USER_BOB_ID);
  console.log("USER_ALICIA_ID:", USER_ALICIA_ID);

  const handleSelectUser1 = () => {
    setCurrentUser({
      name: 'User Bob',
      accountId: USER_BOB_ID
    });
  };

  const handleSelectUser2 = () => {
    setCurrentUser({
      name: 'User Alicia',
      accountId: USER_ALICIA_ID
    });
  };

  return (
    <div>
      <h1>Home Page</h1>
      {currentUser ? (
        <p>Selected user: {currentUser.name} ({currentUser.accountId})</p>
      ) : (
        <p>No user selected</p>
      )}

      <button onClick={handleSelectUser1} className="cta-button">
        Log in as User Bob
      </button>
      <button onClick={handleSelectUser2} className="cta-button">
        Log in as User Alicia
      </button>

      <p>
        Then, use the navigation bar above to access the
        <strong> Casino</strong> or <strong> Referendum</strong> pages.
      </p>
    </div>
  );
}

export default MainPage;
