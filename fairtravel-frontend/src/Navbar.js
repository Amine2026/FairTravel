import React from 'react';
import { Link } from 'react-router-dom';

function Navbar({ role, onLogout }) {
  return (
    <nav style={{
      width: '100%',
      background: '#1976d2',
      padding: '0.75rem 0',
      boxShadow: '0 2px 8px #1976d222',
      marginBottom: '2rem',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      gap: '2rem',
    }}>
      <Link to="/" style={{ color: 'white', fontWeight: 700, fontSize: '1.2rem', textDecoration: 'none' }}>FairTravel</Link>
      {role === 'user' && <Link to="/ai-chat" style={{ color: 'white', textDecoration: 'none', fontWeight: 500 }}>AI Chat</Link>}
      {role === 'admin' && <Link to="/admin" style={{ color: 'white', textDecoration: 'none', fontWeight: 500 }}>Admin Dashboard</Link>}
      {!role && <Link to="/login" style={{ color: 'white', textDecoration: 'none', fontWeight: 500 }}>Login</Link>}
      {!role && <Link to="/register" style={{ color: 'white', textDecoration: 'none', fontWeight: 500 }}>Register</Link>}
      {role && <button onClick={onLogout} style={{ marginLeft: '2rem', background: '#d32f2f', color: 'white', border: 'none', borderRadius: 6, padding: '0.5rem 1rem', fontWeight: 600, cursor: 'pointer' }}>Logout</button>}
    </nav>
  );
}

export default Navbar;
