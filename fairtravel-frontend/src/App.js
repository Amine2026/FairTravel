import React, { useState } from 'react';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';
import AiQueryBox from './AiQueryBox';
import AccommodationsList from './AccommodationsList';
import AccommodationForm from './AccommodationForm';
import ActivitiesList from './ActivitiesList';
import ActivityDetails from './ActivityDetails';
import AwardsList from './AwardsList';
import AwardForm from './AwardForm';
import BookingsList from './BookingsList';
import BookingForm from './BookingForm';
import EventsList from './EventsList';
import EventDetails from './EventDetails';
import RecommendationsList from './RecommendationsList';
import RecommendationDetails from './RecommendationDetails';
import ReviewsList from './ReviewsList';
import ReviewForm from './ReviewForm';
import ServicesList from './ServicesList';
import ServiceForm from './ServiceForm';
import SustainabilityPracticesList from './SustainabilityPracticesList';
import SustainabilityPracticeForm from './SustainabilityPracticeForm';

function App() {
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);

  const handleLogin = (jwt) => {
    setToken(jwt);
    setShowLogin(false);
  };
  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
  };
  const handleRegister = () => {
    setShowRegister(false);
    setShowLogin(true);
  };

  // Decode JWT to get role (simple, not secure for production)
  let role = null;
  let jwtPayload = null;
  if (token) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      jwtPayload = payload;
      // JWT payload structure: { sub: { username, role } }
      if (payload.sub && payload.sub.role) {
        role = payload.sub.role;
      } else if (payload.role) {
        role = payload.role;
      }
    } catch {}
  }

  // Homepage: only login/register until logged in
  if (!token) {
    return (
      <div style={{minHeight:'100vh', display:'flex', flexDirection:'column', justifyContent:'center', alignItems:'center', background:'#f5f7fa'}}>
        <div style={{background:'white', padding:'2.5rem 2rem', borderRadius:12, boxShadow:'0 4px 24px #0001', minWidth:350, textAlign:'center'}}>
          <h1 style={{marginBottom:'2rem', fontSize:'2.5rem', fontWeight:700, color:'#1976d2'}}>FairTravel</h1>
          <p style={{marginBottom:'2rem', color:'#555'}}>Welcome! Please log in or register to continue.</p>
          <div style={{marginBottom:'2rem', display:'flex', justifyContent:'center', gap:'1rem'}}>
            <button onClick={() => setShowLogin(true)} style={{padding:'0.5rem 1.5rem', fontWeight:600, borderRadius:6, border:'none', background:'#1976d2', color:'white', cursor:'pointer'}}>Login</button>
            <button onClick={() => setShowRegister(true)} style={{padding:'0.5rem 1.5rem', fontWeight:600, borderRadius:6, border:'none', background:'#43a047', color:'white', cursor:'pointer'}}>Register</button>
          </div>
          {showLogin && <LoginForm onLogin={handleLogin} />}
          {showRegister && <RegisterForm onRegister={handleRegister} />}
        </div>
      </div>
    );
  }

  // After login, show welcome, logout, and AI chat for users
  return (
    <div style={{
      minHeight:'100vh',
      display:'flex',
      flexDirection:'column',
      justifyContent:'flex-start',
      alignItems:'center',
      background:'linear-gradient(135deg, #e3f0ff 0%, #f5f7fa 100%)'
    }}>
      <div style={{
        background:'white',
        padding:'2.5rem 2rem',
        borderRadius:18,
        boxShadow:'0 8px 32px #0002',
        minWidth:370,
        minHeight:500,
        textAlign:'center',
        marginTop:'5vh',
        transition:'box-shadow 0.2s',
        width:'100%',
        maxWidth:600
      }}>
        <h1 style={{marginBottom:'2rem', fontSize:'2.5rem', fontWeight:700, color:'#1976d2'}}>Welcome to FairTravel!</h1>
        <p style={{marginBottom:'2rem', color:'#555'}}>You are logged in.</p>
        <div style={{marginBottom:'1rem', color:'#888', fontSize:'0.95rem'}}>Detected role: <b>{role ? role : 'none'}</b></div>
        {role === 'user' && <AiQueryBox />}
        {role === 'admin' && (
          <div style={{margin:'2rem 0 1rem 0', textAlign:'left'}}>
            <h2 style={{fontSize:'1.4rem', fontWeight:700, color:'#1976d2', marginBottom:'1.2rem'}}>Admin Dashboard</h2>
            <div style={{display:'flex', flexWrap:'wrap', gap:'1.2rem'}}>
              <div style={{flex:'1 1 220px'}}><AccommodationsList /><AccommodationForm /></div>
              <div style={{flex:'1 1 220px'}}><ActivitiesList /><ActivityDetails /></div>
              <div style={{flex:'1 1 220px'}}><AwardsList /><AwardForm /></div>
              <div style={{flex:'1 1 220px'}}><BookingsList /><BookingForm /></div>
              <div style={{flex:'1 1 220px'}}><EventsList /><EventDetails /></div>
              <div style={{flex:'1 1 220px'}}><RecommendationsList /><RecommendationDetails /></div>
              <div style={{flex:'1 1 220px'}}><ReviewsList /><ReviewForm /></div>
              <div style={{flex:'1 1 220px'}}><ServicesList /><ServiceForm /></div>
              <div style={{flex:'1 1 220px'}}><SustainabilityPracticesList /><SustainabilityPracticeForm /></div>
            </div>
          </div>
        )}
        <button
          onClick={handleLogout}
          style={{
            padding:'0.5rem 1.5rem',
            fontWeight:600,
            borderRadius:8,
            border:'none',
            background:'#d32f2f',
            color:'white',
            cursor:'pointer',
            marginTop:'1.5rem',
            boxShadow:'0 2px 8px #d32f2f22',
            transition:'background 0.2s'
          }}
          onMouseOver={e => e.currentTarget.style.background = '#b71c1c'}
          onMouseOut={e => e.currentTarget.style.background = '#d32f2f'}
        >
          Logout
        </button>
      </div>
    </div>
  );
}

export default App;

