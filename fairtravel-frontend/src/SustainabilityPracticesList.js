import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

export default function SustainabilityPracticesList() {
  const [practices, setPractices] = useState([]);
  const [detailsMap, setDetailsMap] = useState({});

  useEffect(() => {
    fetch('http://localhost:5000/sustainability-practices')
      .then(res => res.json())
      .then(data => {
        setPractices(data);

        data.forEach(uri => {
          fetch(`http://localhost:5000/sustainability-details?uri=${encodeURIComponent(uri)}`)
            .then(res => res.json())
            .then(details =>
              setDetailsMap(prev => ({ ...prev, [uri]: details }))
            );
        });
      });
  }, []);

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
      <h2>Sustainability Practices</h2>

      <ul style={{ listStyle: 'none', paddingLeft: 0 }}>
        {practices.map(uri => (
          <li key={uri} style={{ marginBottom: '0.5rem' }}>
            <Link
              to={`/sustainability-practices/${encodeURIComponent(uri)}`}
              style={{ color: '#1976d2', textDecoration: 'underline' }}
            >
              {detailsMap[uri]?.['http://www.fairtravel.com/fairtravel#practiceName'] || uri}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
