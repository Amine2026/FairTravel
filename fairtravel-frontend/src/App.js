import React, { useState } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
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
import SustainabilityPracticeDetails from './SustainabilityPracticeDetails';
import AccommodationDetails from './AccommodationDetails';
import BookingDetails from './BookingDetails';

function App() {
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const navigate = useNavigate();

  const handleLogin = (jwt) => {
    setToken(jwt);
    navigate('/');
  };
  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
    navigate('/');
  };
  const handleRegister = () => {
    navigate('/login');
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

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #e3f0ff 0%, #f5f7fa 100%)' }}>
      <Navbar role={role} onLogout={handleLogout} />
      <Routes>
        <Route path="/" element={
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '5vh' }}>
            <div style={{ background: 'white', padding: '2.5rem 2rem', borderRadius: 18, boxShadow: '0 8px 32px #0002', minWidth: 370, maxWidth: 600, textAlign: 'center' }}>
              <h1 style={{ marginBottom: '2rem', fontSize: '2.5rem', fontWeight: 700, color: '#1976d2' }}>Welcome to FairTravel!</h1>
              {role ? (
                <>
                  <p style={{ marginBottom: '2rem', color: '#555' }}>You are logged in.</p>
                  <div style={{ marginBottom: '1rem', color: '#888', fontSize: '0.95rem' }}>Detected role: <b>{role}</b></div>
                </>
              ) : (
                <>
                  <p style={{ marginBottom: '2rem', color: '#555' }}>Please <a href="/login" style={{color:'#1976d2',fontWeight:600}}>login</a> or <a href="/register" style={{color:'#1976d2',fontWeight:600}}>register</a> to continue.</p>
                </>
              )}
            </div>
          </div>
        } />
        <Route path="/login" element={<LoginForm onLogin={handleLogin} />} />
        <Route path="/register" element={<RegisterForm onRegister={handleRegister} />} />
  <Route path="/ai-chat" element={(role === 'user' || role === 'admin') ? <AiQueryBox /> : <div style={{textAlign:'center',marginTop:'3rem',color:'red'}}>Access Denied</div>} />
        <Route path="/admin" element={role === 'admin' ? (
          <div style={{margin:'2rem auto',maxWidth:900}}>
            <h2 style={{fontSize:'1.4rem', fontWeight:700, color:'#1976d2', marginBottom:'1.2rem'}}>Admin Dashboard</h2>
            <ul style={{listStyle:'none',padding:0}}>
              <li><a href="/accommodations" style={{color:'#1976d2',fontWeight:600}}>Manage Accommodations</a></li>
              <li><a href="/activities" style={{color:'#1976d2',fontWeight:600}}>Manage Activities</a></li>
              <li><a href="/awards" style={{color:'#1976d2',fontWeight:600}}>Manage Awards</a></li>
              <li><a href="/bookings" style={{color:'#1976d2',fontWeight:600}}>Manage Bookings</a></li>
              <li><a href="/events" style={{color:'#1976d2',fontWeight:600}}>Manage Events</a></li>
              <li><a href="/recommendations" style={{color:'#1976d2',fontWeight:600}}>Manage Recommendations</a></li>
              <li><a href="/reviews" style={{color:'#1976d2',fontWeight:600}}>Manage Reviews</a></li>
              <li><a href="/services" style={{color:'#1976d2',fontWeight:600}}>Manage Services</a></li>
              <li><a href="/sustainability-practices" style={{color:'#1976d2',fontWeight:600}}>Manage Sustainability Practices</a></li>
            </ul>
          </div>
        ) : <div style={{textAlign:'center',marginTop:'3rem',color:'red'}}>Access Denied</div>} />
        <Route path="/accommodations/*" element={role === 'admin' ? <AccommodationsList /> : <div style={{textAlign:'center',marginTop:'3rem',color:'red'}}>Access Denied</div>} />
  <Route path="/accommodations" element={role === 'admin' ? <AccommodationsList /> : <div style={{textAlign:'center',marginTop:'3rem',color:'red'}}>Access Denied</div>} />
  <Route path="/accommodations/new" element={role === 'admin' ? <AccommodationForm isNew /> : <div style={{textAlign:'center',marginTop:'3rem',color:'red'}}>Access Denied</div>} />
  <Route path="/accommodations/:id" element={role === 'admin' ? <AccommodationDetails /> : <div style={{textAlign:'center',marginTop:'3rem',color:'red'}}>Access Denied</div>} />
  <Route path="/accommodations/:id/edit" element={role === 'admin' ? <AccommodationForm isEdit /> : <div style={{textAlign:'center',marginTop:'3rem',color:'red'}}>Access Denied</div>} />

  <Route path="/activities" element={<ActivitiesList />} />
  <Route path="/activities/:id" element={<ActivityDetails />} />

    <Route path="/awards" element={role === 'admin' ? <AwardsList /> : <div style={{textAlign:'center',marginTop:'3rem',color:'red'}}>Access Denied</div>} />
    <Route path="/awards/new" element={role === 'admin' ? <AwardForm isNew /> : <div style={{textAlign:'center',marginTop:'3rem',color:'red'}}>Access Denied</div>} />
    <Route path="/awards/:id" element={role === 'admin' ? <AwardForm /> : <div style={{textAlign:'center',marginTop:'3rem',color:'red'}}>Access Denied</div>} />
    <Route path="/awards/:id/edit" element={role === 'admin' ? <AwardForm isEdit /> : <div style={{textAlign:'center',marginTop:'3rem',color:'red'}}>Access Denied</div>} />

  <Route path="/bookings" element={role === 'admin' ? <BookingsList /> : <div style={{textAlign:'center',marginTop:'3rem',color:'red'}}>Access Denied</div>} />
  <Route path="/bookings/new" element={role === 'admin' ? <BookingForm isNew /> : <div style={{textAlign:'center',marginTop:'3rem',color:'red'}}>Access Denied</div>} />
  <Route path="/bookings/:id" element={role === 'admin' ? <BookingDetails /> : <div style={{textAlign:'center',marginTop:'3rem',color:'red'}}>Access Denied</div>} />
  <Route path="/bookings/:id/edit" element={role === 'admin' ? <BookingForm isEdit /> : <div style={{textAlign:'center',marginTop:'3rem',color:'red'}}>Access Denied</div>} />

    <Route path="/events" element={role === 'admin' ? <EventsList /> : <div style={{textAlign:'center',marginTop:'3rem',color:'red'}}>Access Denied</div>} />
    <Route path="/events/new" element={role === 'admin' ? <EventDetails isNew /> : <div style={{textAlign:'center',marginTop:'3rem',color:'red'}}>Access Denied</div>} />
    <Route path="/events/:id" element={role === 'admin' ? <EventDetails /> : <div style={{textAlign:'center',marginTop:'3rem',color:'red'}}>Access Denied</div>} />
    <Route path="/events/:id/edit" element={role === 'admin' ? <EventDetails isEdit /> : <div style={{textAlign:'center',marginTop:'3rem',color:'red'}}>Access Denied</div>} />

    <Route path="/recommendations" element={role === 'admin' ? <RecommendationsList /> : <div style={{textAlign:'center',marginTop:'3rem',color:'red'}}>Access Denied</div>} />
    <Route path="/recommendations/new" element={role === 'admin' ? <RecommendationDetails isNew /> : <div style={{textAlign:'center',marginTop:'3rem',color:'red'}}>Access Denied</div>} />
    <Route path="/recommendations/:id" element={role === 'admin' ? <RecommendationDetails /> : <div style={{textAlign:'center',marginTop:'3rem',color:'red'}}>Access Denied</div>} />
    <Route path="/recommendations/:id/edit" element={role === 'admin' ? <RecommendationDetails isEdit /> : <div style={{textAlign:'center',marginTop:'3rem',color:'red'}}>Access Denied</div>} />

    <Route path="/reviews" element={role === 'admin' ? <ReviewsList /> : <div style={{textAlign:'center',marginTop:'3rem',color:'red'}}>Access Denied</div>} />
    <Route path="/reviews/new" element={role === 'admin' ? <ReviewForm isNew /> : <div style={{textAlign:'center',marginTop:'3rem',color:'red'}}>Access Denied</div>} />
    <Route path="/reviews/:id" element={role === 'admin' ? <ReviewForm /> : <div style={{textAlign:'center',marginTop:'3rem',color:'red'}}>Access Denied</div>} />
    <Route path="/reviews/:id/edit" element={role === 'admin' ? <ReviewForm isEdit /> : <div style={{textAlign:'center',marginTop:'3rem',color:'red'}}>Access Denied</div>} />

    <Route path="/services" element={role === 'admin' ? <ServicesList /> : <div style={{textAlign:'center',marginTop:'3rem',color:'red'}}>Access Denied</div>} />
    <Route path="/services/new" element={role === 'admin' ? <ServiceForm isNew /> : <div style={{textAlign:'center',marginTop:'3rem',color:'red'}}>Access Denied</div>} />
    <Route path="/services/:id" element={role === 'admin' ? <ServiceForm /> : <div style={{textAlign:'center',marginTop:'3rem',color:'red'}}>Access Denied</div>} />
    <Route path="/services/:id/edit" element={role === 'admin' ? <ServiceForm isEdit /> : <div style={{textAlign:'center',marginTop:'3rem',color:'red'}}>Access Denied</div>} />

  <Route path="/sustainability-practices" element={role === 'admin' ? <SustainabilityPracticesList /> : <div style={{textAlign:'center',marginTop:'3rem',color:'red'}}>Access Denied</div>} />
  <Route path="/sustainability-practices/new" element={role === 'admin' ? <SustainabilityPracticeForm isNew /> : <div style={{textAlign:'center',marginTop:'3rem',color:'red'}}>Access Denied</div>} />
  <Route path="/sustainability-practices/:id" element={role === 'admin' ? <SustainabilityPracticeDetails /> : <div style={{textAlign:'center',marginTop:'3rem',color:'red'}}>Access Denied</div>} />
  <Route path="/sustainability-practices/:id/edit" element={role === 'admin' ? <SustainabilityPracticeForm isEdit /> : <div style={{textAlign:'center',marginTop:'3rem',color:'red'}}>Access Denied</div>} />
      </Routes>
    </div>
  );
}

export default App;

