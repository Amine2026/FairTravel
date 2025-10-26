import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';

import ActivitiesList from './ActivitiesList';
import RecommendationsList from './RecommendationsList';
import EventsList from './EventsList';
import ActivityDetails from './ActivityDetails';
import RecommendationDetails from './RecommendationDetails';
import EventDetails from './EventDetails';
import AccommodationsList from './AccommodationsList';
import AccommodationDetails from './AccommodationDetails';
import BookingsList from './BookingsList';
import BookingDetails from './BookingDetails';
import SustainabilityPracticesList from './SustainabilityPracticesList';
import SustainabilityPracticeDetails from './SustainabilityPracticeDetails';
import AiQueryBox from './AiQueryBox';

function App() {
  return (
    <Router>
      <div style={{maxWidth:700, margin:'2rem auto', padding:'1rem'}}>
        <h1 style={{marginBottom:'2rem'}}>FairTravel</h1>
        <nav
          style={{
            marginBottom: '2rem',
            display: 'flex',
            gap: '2rem',
            flexWrap: 'wrap',
          }}
        >
          <Link
            to="/activities"
            style={{ fontWeight: 'bold', color: '#1976d2', textDecoration: 'none' }}
          >
            Activities
          </Link>

          <Link
            to="/recommendations"
            style={{ fontWeight: 'bold', color: '#1976d2', textDecoration: 'none' }}
          >
            Recommendations
          </Link>

          <Link
            to="/events"
            style={{ fontWeight: 'bold', color: '#1976d2', textDecoration: 'none' }}
          >
            Events
          </Link>

          <Link
            to="/accommodations"
            style={{ fontWeight: 'bold', color: '#1976d2', textDecoration: 'none' }}
          >
            Accommodations
          </Link>

          <Link
            to="/bookings"
            style={{ fontWeight: 'bold', color: '#1976d2', textDecoration: 'none' }}
          >
            Bookings
          </Link>

          <Link
            to="/sustainability-practices"
            style={{ fontWeight: 'bold', color: '#1976d2', textDecoration: 'none' }}
          >
            Sustainability
          </Link>
        </nav>

        <Routes>
          <Route path="/activities" element={<ActivitiesList />} />
          <Route path="/activities/:id" element={<ActivityDetails />} />
            <Route path="/recommendations" element={<RecommendationsList />} />
              <Route path="/recommendations/:id/*" element={<RecommendationDetails />} />
            <Route path="/events" element={<EventsList />} />
              <Route path="/events/:id/*" element={<EventDetails />} />
            <Route path="/" element={<ActivitiesList />} />
            <Route path="/accommodations" element={<AccommodationsList />} />
            <Route path="/accommodations/:id" element={<AccommodationDetails />} />
            <Route path="/bookings" element={<BookingsList />} />
            <Route path="/bookings/:id" element={<BookingDetails />} />
            <Route path="/sustainability-practices" element={<SustainabilityPracticesList />} />
            <Route path="/sustainability-practices/:id" element={<SustainabilityPracticeDetails />} />
        </Routes>
        <AiQueryBox />
      </div>
    </Router>
  );
}

export default App;

