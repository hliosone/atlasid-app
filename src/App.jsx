import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { UserProvider } from './context/UserContext';
import MainPage from './pages/MainPage';
import CasinoPage from './pages/CasinoPage';
import ReferendumPage from './pages/ReferendumPage';
import AtlasIdPage from './pages/AtlasIdPage';
import './assets/App.css';

function App() {
  return (
    <UserProvider>
      <Router>
        <div className="App">

          <nav className="nav-bar">
            <Link to="/">Home</Link>
            <Link to="/casino">Casino</Link>
            <Link to="/referendum">Réferendum</Link>
          </nav>

          <Routes>
            <Route path="/" element={<MainPage />} />
            <Route path="/casino" element={<CasinoPage />} />
            <Route path="/referendum" element={<ReferendumPage />} />
            <Route path="/atlas-id/:tokenId" element={<AtlasIdPage />} />
          </Routes>
        </div>
      </Router>
    </UserProvider>
  );
}

export default App;
