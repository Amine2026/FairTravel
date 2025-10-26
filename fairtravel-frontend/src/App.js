

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import ActivitiesList from './ActivitiesList';
import RecommendationsList from './RecommendationsList';
import EventsList from './EventsList';

function App() {
  return (
    <Router>
      <div style={{maxWidth:700, margin:'2rem auto', padding:'1rem'}}>
        <h1 style={{marginBottom:'2rem'}}>FairTravel</h1>
        <nav style={{marginBottom:'2rem', display:'flex', gap:'2rem'}}>
          <Link to="/activities" style={{fontWeight:'bold', color:'#1976d2', textDecoration:'none'}}>Activities</Link>
          <Link to="/recommendations" style={{fontWeight:'bold', color:'#1976d2', textDecoration:'none'}}>Recommendations</Link>
          <Link to="/events" style={{fontWeight:'bold', color:'#1976d2', textDecoration:'none'}}>Events</Link>
        </nav>
        <Routes>
          <Route path="/activities" element={<ActivitiesList />} />
          <Route path="/recommendations" element={<RecommendationsList />} />
          <Route path="/events" element={<EventsList />} />
          <Route path="/" element={<ActivitiesList />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
