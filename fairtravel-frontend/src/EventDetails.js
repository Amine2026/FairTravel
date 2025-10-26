import React, { useEffect, useState } from 'react';

function EventDetails({ uri }) {
  const [details, setDetails] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!uri) return;
    setLoading(true);
    setError(null);
    fetch(`http://localhost:5000/event-details?uri=${encodeURIComponent(uri)}`)
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
    'http://www.fairtravel.com/fairtravel#eventDate': 'Event Date',
    'http://www.fairtravel.com/fairtravel#eventType': 'Event Type',
    'http://www.fairtravel.com/fairtravel#hasLocation': 'Location',
    'http://www.fairtravel.com/fairtravel#organizer': 'Organizer',
    'http://www.fairtravel.com/fairtravel#price': 'Price',
    'http://www.w3.org/1999/02/22-rdf-syntax-ns#type': 'Type',
    // Add more mappings as needed
  };

  return (
    <div>
      <h3>Event Details</h3>
      <ul>
        {Object.entries(details).map(([property, value]) => (
          <li key={property}><strong>{propertyLabels[property] || property}:</strong> {value}</li>
        ))}
      </ul>
    </div>
  );
}

export default EventDetails;
