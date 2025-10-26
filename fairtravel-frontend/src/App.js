

import React from 'react';
import ActivitiesList from './ActivitiesList';
import RecommendationsList from './RecommendationsList';
import EventsList from './EventsList';

function App() {
  return (
    <div>
      <h1>FairTravel</h1>
      <ActivitiesList />
      <RecommendationsList />
      <EventsList />
    </div>
  );
}

export default App;
