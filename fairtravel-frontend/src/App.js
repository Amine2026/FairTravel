

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';

import ActivitiesList from './ActivitiesList';
import RecommendationsList from './RecommendationsList';
import EventsList from './EventsList';
import ActivityDetails from './ActivityDetails';
import RecommendationDetails from './RecommendationDetails';
import EventDetails from './EventDetails';

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
          <Route path="/activities/:id" element={<ActivityDetails />} />
            <Route path="/recommendations" element={<RecommendationsList />} />
              <Route path="/recommendations/:id/*" element={<RecommendationDetails />} />
            <Route path="/events" element={<EventsList />} />
              <Route path="/events/:id/*" element={<EventDetails />} />
            <Route path="/" element={<ActivitiesList />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;

