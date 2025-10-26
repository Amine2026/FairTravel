import React, { useEffect, useState } from 'react';

function RecommendationDetails({ uri }) {
  const [details, setDetails] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!uri) return;
    setLoading(true);
    setError(null);
    fetch(`http://localhost:5000/recommendation-details?uri=${encodeURIComponent(uri)}`)
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
    'http://www.fairtravel.com/fairtravel#dateRecommended': 'Date Recommended',
    'http://www.fairtravel.com/fairtravel#forActivity': 'For Activity',
    'http://www.fairtravel.com/fairtravel#rating': 'Rating',
    'http://www.fairtravel.com/fairtravel#recommendationText': 'Recommendation Text',
    'http://www.fairtravel.com/fairtravel#source': 'Source',
    'http://www.w3.org/1999/02/22-rdf-syntax-ns#type': 'Type',
    // Add more mappings as needed
  };

  return (
    <div>
      <h3>Recommendation Details</h3>
      <ul>
        {Object.entries(details).map(([property, value]) => (
          <li key={property}><strong>{propertyLabels[property] || property}:</strong> {value}</li>
        ))}
      </ul>
    </div>
  );
}

export default RecommendationDetails;
