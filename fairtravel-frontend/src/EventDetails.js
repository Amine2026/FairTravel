import React, { useEffect, useState } from 'react';

function EventDetails({ uri }) {
  const [details, setDetails] = useState(null);

  useEffect(() => {
    if (!uri) return;
    fetch(`http://localhost:5000/event-details?uri=${encodeURIComponent(uri)}`)
      .then(response => response.json())
      .then(data => setDetails(data));
  }, [uri]);

  if (!uri) return null;
  if (!details) return <div>Loading details...</div>;

  return (
    <div>
      <h3>Event Details</h3>
      <ul>
        {Object.entries(details).map(([property, value]) => (
          <li key={property}><strong>{property}:</strong> {value}</li>
        ))}
      </ul>
    </div>
  );
}

export default EventDetails;
