import React, { useEffect, useState } from 'react';

function ActivityDetails({ uri }) {
  const [details, setDetails] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!uri) return;
    setLoading(true);
    setError(null);
    fetch(`http://localhost:5000/activity-details?uri=${encodeURIComponent(uri)}`)
      .then(response => {
        if (!response.ok) throw new Error('Failed to fetch details');
        return response.json();
      })
      .then(data => setDetails(data))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [uri]);

  if (!uri) return null;
  if (loading) return <div>Loading details...</div>;
  if (error) return <div style={{color:'red'}}>Error: {error}</div>;
  if (!details) return null;

  // Map property URIs to readable labels
  const propertyLabels = {
    'http://www.fairtravel.com/fairtravel#activityName': 'Activity Name',
    'http://www.fairtravel.com/fairtravel#activityType': 'Activity Type',
    'http://www.fairtravel.com/fairtravel#duration': 'Duration',
    'http://www.fairtravel.com/fairtravel#difficultyLevel': 'Difficulty Level',
    'http://www.fairtravel.com/fairtravel#hasLocation': 'Location',
    'http://www.w3.org/1999/02/22-rdf-syntax-ns#type': 'Type',
    // Add more mappings as needed
  };

  return (
    <div>
      <h3>Activity Details</h3>
      <ul>
        {Object.entries(details).map(([property, value]) => (
          <li key={property}><strong>{propertyLabels[property] || property}:</strong> {value}</li>
        ))}
      </ul>
    </div>
  );
}

export default ActivityDetails;
