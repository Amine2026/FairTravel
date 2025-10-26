import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

function AccommodationDetails({ uri }) {
  const params = useParams();
  const accommodationUri = uri || (params.id ? decodeURIComponent(params.id) : null);
  const [details, setDetails] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!accommodationUri) return;

    fetch(`http://localhost:5000/accommodation-details?uri=${encodeURIComponent(accommodationUri)}`)
      .then(res => {
        if (!res.ok) throw new Error(`HTTP error ${res.status}`);
        return res.json();
      })
      .then(setDetails)
      .catch(err => setError(err.message));
  }, [accommodationUri]);

  if (!accommodationUri) return null;
  if (error) return <div style={{ color: 'red' }}>Error: {error}</div>;
  if (!details) return <div>Loading details...</div>;

  const labels = {
    'http://www.fairtravel.com/fairtravel#accommodationName': 'Accommodation Name',
    'http://www.fairtravel.com/fairtravel#pricePerNight': 'Price per Night',
    'http://www.fairtravel.com/fairtravel#capacity': 'Capacity',
    'http://www.fairtravel.com/fairtravel#starRating': 'Star Rating',
    'http://www.fairtravel.com/fairtravel#hasSustainabilityPractice': 'Sustainability Practice',
    'http://www.fairtravel.com/fairtravel#hasLocation': 'Location',
  };

  return (
    <div
      style={{
        maxWidth: 600,
        margin: '2rem auto',
        padding: '1rem',
        background: '#f9f9f9',
        borderRadius: 8,
        boxShadow: '0 2px 8px #ddd',
      }}
    >
      <h3>Accommodation Details</h3>
      <ul style={{ listStyle: 'none', paddingLeft: 0 }}>
        {Object.entries(details).map(([p, v]) => (
          <li key={p} style={{ marginBottom: '0.5rem' }}>
            <strong>{labels[p] || p}:</strong> {v}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default AccommodationDetails;
