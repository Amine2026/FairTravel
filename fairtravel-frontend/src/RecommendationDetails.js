import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

function RecommendationDetails() {
  const { id } = useParams();
  const uri = id ? decodeURIComponent(id) : null;
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
    if (loading) return <div>Loading details...<br/>URI: {uri}</div>;
    if (error) return <div style={{color:'red'}}>Error: {error}<br/>URI: {uri}</div>;
    if (!details) return <div>No details found.<br/>URI: {uri}</div>;

  // Map property URIs to readable labels
  const propertyLabels = {
    'http://www.fairtravel.com/fairtravel#dateRecommended': 'Date Recommended',
    'http://www.fairtravel.com/fairtravel#forActivity': 'For Activity',
    'http://www.fairtravel.com/fairtravel#rating': 'Rating',
    'http://www.fairtravel.com/fairtravel#recommendationText': 'Recommendation Text',
    'http://www.fairtravel.com/fairtravel#source': 'Source',
    'http://www.w3.org/1999/02/22-rdf-syntax-ns#type': 'Type',
      'http://www.fairtravel.com/fairtravel#title': 'Title',
    // Add more mappings as needed
  };

  return (
      <div>
        <h3>Recommendation Details</h3>
        <ul style={{fontSize:'1.1rem'}}>
          {details['http://www.fairtravel.com/fairtravel#recommendationText'] && (
            <li><strong>Recommendation Text:</strong> {details['http://www.fairtravel.com/fairtravel#recommendationText']}</li>
          )}
          {Object.entries(details).filter(([property]) => property !== 'http://www.fairtravel.com/fairtravel#recommendationText').map(([property, value]) => (
            <li key={property}><strong>{propertyLabels[property] || property}:</strong> {value}</li>
          ))}
        </ul>
      </div>
  );
}

export default RecommendationDetails;
