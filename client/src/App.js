/* src/App.js */
import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import BorrowerDashboard from './pages/BorrowerDashboard';
import LenderDashboard from './pages/LenderDashboard';
import TitleCoDashboard from './pages/TitleCoDashboard';
import './App.css';

function App() {
  const [role, setRole] = useState('Borrower'); // Default role
  const [userDid, setUserDid] = useState('did:example:borrower1'); // Mock DID

  const handleRoleChange = (newRole) => {
    setRole(newRole);
    if (newRole === 'Borrower') setUserDid('did:example:borrower1');
    if (newRole === 'Lender') setUserDid('did:example:lender1');
    if (newRole === 'TitleCo') setUserDid('did:example:titleco1');
  };

  return (
    <Router>
      <div className="App">
        <header className="App-header">
          <h1>Mortgage Ledger Chain</h1>
          <div className="role-selector">
            <span>Current Role: </span>
            <select value={role} onChange={(e) => handleRoleChange(e.target.value)}>
              <option value="Borrower">Borrower</option>
              <option value="Lender">Lender</option>
              <option value="TitleCo">Title Co</option>
            </select>
            <small> ({userDid})</small>
          </div>
        </header>

        <main>
          <Routes>
            <Route path="/" element={<Navigate to={`/${role.toLowerCase()}`} />} />
            <Route path="/borrower" element={<BorrowerDashboard userDid={userDid} />} />
            <Route path="/lender" element={<LenderDashboard userDid={userDid} />} />
            <Route path="/titleco" element={<TitleCoDashboard userDid={userDid} />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
