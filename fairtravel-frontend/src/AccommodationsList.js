import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

function AccommodationsList() {
  const [accommodations, setAccommodations] = useState([]);
  const [detailsMap, setDetailsMap] = useState({});
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch('http://localhost:5000/accommodations')
      .then(res => res.json())
      .then(data => {
        setAccommodations(data);

        data.forEach(uri => {
          fetch(`http://localhost:5000/accommodation-details?uri=${encodeURIComponent(uri)}`)
            .then(res => res.json())
            .then(details =>
              setDetailsMap(prev => ({ ...prev, [uri]: details }))
            );
        });
      });
  }, []);

  const filtered = accommodations.filter(uri =>
    uri.toLowerCase().includes(search.toLowerCase())
  );

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
      <h2>Accommodations</h2>

      <input
        type="text"
        placeholder="Search accommodations..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        style={{
          width: '100%',
          padding: '0.5rem',
          marginBottom: '1rem',
          borderRadius: 4,
          border: '1px solid #ccc',
        }}
      />

      <ul style={{ listStyle: 'none', paddingLeft: 0 }}>
        {filtered.map(uri => (
          <li key={uri} style={{ marginBottom: '0.5rem' }}>
            <Link
              to={`/accommodations/${encodeURIComponent(uri)}`}
              style={{ color: '#1976d2', textDecoration: 'underline' }}
            >
              {detailsMap[uri]?.['http://www.fairtravel.com/fairtravel#accommodationName'] ||
                uri}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default AccommodationsList;
