import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

export default function SustainabilityPracticeDetails({ uri }) {
  const [details, setDetails] = useState(null);
  const [error, setError] = useState(null);
  const params = useParams();
  const practiceUri = uri || (params.id ? decodeURIComponent(params.id) : null);

  useEffect(() => {
    if (!practiceUri) return;

    fetch(`http://localhost:5000/sustainability-details?uri=${encodeURIComponent(practiceUri)}`)
      .then(res => {
        if (!res.ok) throw new Error(`HTTP error ${res.status}`);
        return res.json();
      })
      .then(setDetails)
      .catch(err => setError(err.message));
  }, [practiceUri]);

  if (!practiceUri) return null;
  if (error) return <div style={{ color: 'red' }}>Error: {error}</div>;
  if (!details) return <div>Loading sustainability practice details...</div>;

  const labels = {
    'http://www.fairtravel.com/fairtravel#practiceName': 'Practice Name',
    'http://www.fairtravel.com/fairtravel#practiceType': 'Type',
    'http://www.fairtravel.com/fairtravel#impactLevel': 'Impact Level',
    'http://www.fairtravel.com/fairtravel#description': 'Description',
    'http://www.w3.org/1999/02/22-rdf-syntax-ns#type': 'Element Type',
  };

  const valueToLabel = (v) => {
    if (!v) return 'Unknown';
    if (typeof v === 'string' && v.includes('http://www.fairtravel.com/fairtravel#')) {
      return v.split('#')[1]; // extract the local name
    }
    return v;
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
      <h3>Sustainability Practice Details</h3>
      <ul style={{ listStyle: 'none', paddingLeft: 0 }}>
        {Object.entries(details).map(([p, v]) => (
          <li key={p} style={{ marginBottom: '0.5rem' }}>
            <strong>{labels[p] || p}:</strong> {valueToLabel(v)}
          </li>
        ))}
      </ul>
    </div>
  );
}
