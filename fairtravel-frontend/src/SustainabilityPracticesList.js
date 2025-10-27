import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';

function SustainabilityPracticesList() {
  const [practices, setPractices] = useState([]);
  const [detailsMap, setDetailsMap] = useState({});
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const controllerRef = useRef(null);

  const extractId = (uri) => {
    if (!uri) return uri;
    const parts = uri.split('#');
    return parts.length > 1 && parts[1] ? parts[1] : uri;
  };

  const fetchPractices = async () => {
    if (controllerRef.current) controllerRef.current.abort();
    const controller = new AbortController();
    controllerRef.current = controller;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('http://localhost:5000/sustainability-practices', { signal: controller.signal });
      if (!res.ok) throw new Error(`Failed to fetch practices: ${res.statusText}`);
      const responseData = await res.json();
      const data = Array.isArray(responseData) ? responseData : [];

      setPractices(data);

      const detailPromises = data.map(async (uri) => {
        try {
          const r = await fetch(
            `http://localhost:5000/sustainability-details?uri=${encodeURIComponent(uri)}`,
            { signal: controller.signal }
          );
          if (!r.ok) return { uri, details: null };
          const details = await r.json();
          return { uri, details };
        } catch {
          return { uri, details: null };
        }
      });

      const results = await Promise.all(detailPromises);
      const newDetailsMap = results.reduce((acc, { uri, details }) => {
        if (uri) acc[uri] = details || {};
        return acc;
      }, {});
      setDetailsMap(newDetailsMap);
    } catch (err) {
      if (err.name !== 'AbortError') {
        console.error(err);
        setError(err.message || 'Unknown error');
      }
    } finally {
      setLoading(false);
      controllerRef.current = null;
    }
  };

  useEffect(() => {
    fetchPractices();
    return () => {
      if (controllerRef.current) controllerRef.current.abort();
    };
  }, []);

  const handleDelete = async (practiceUri) => {
    if (!window.confirm('Are you sure you want to delete this sustainability practice?')) return;

    const id = extractId(practiceUri);

    try {
      const response = await fetch(
        `http://localhost:5000/sustainability-practices/${encodeURIComponent(id)}`,
        { method: 'DELETE' }
      );
      if (!response.ok) throw new Error('Failed to delete practice');

      setPractices(prev => prev.filter(u => u !== practiceUri));
      setDetailsMap(prev => {
        const copy = { ...prev };
        delete copy[practiceUri];
        return copy;
      });

      alert('Sustainability practice successfully deleted');
    } catch (err) {
      console.error('Error deleting practice:', err);
      alert('Error deleting sustainability practice');
    }
  };

  const filteredPractices = practices.filter(p =>
    String(p).toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div
      style={{
        maxWidth: 800,
        margin: '2rem auto',
        padding: '1rem',
        background: '#f9f9f9',
        borderRadius: 8,
        boxShadow: '0 2px 8px #ddd',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h2>Sustainability Practices</h2>
        <Link
          to="/sustainability-practices/new"
          style={{
            padding: '0.5rem 1rem',
            background: '#1976d2',
            color: 'white',
            textDecoration: 'none',
            borderRadius: 4,
            fontWeight: 'bold',
          }}
        >
          + Add Sustainability Practice
        </Link>
      </div>

      <input
        type="text"
        placeholder="Search sustainability practices..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        style={{ width: '100%', padding: '0.5rem', marginBottom: '1rem', borderRadius: 4, border: '1px solid #ccc' }}
      />

      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p style={{ color: 'red' }}>Error: {error}</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {filteredPractices.map((practice) => {
            const details = detailsMap[practice] || {};
            const name = details['http://www.fairtravel.com/fairtravel#practiceName'] || extractId(practice);
            const type = details['http://www.fairtravel.com/fairtravel#practiceType'] || 'N/A';
            const impactLevel = details['http://www.fairtravel.com/fairtravel#impactLevel'] || 'N/A';

            return (
              <li
                key={practice}
                style={{
                  marginBottom: '0.75rem',
                  padding: '1rem',
                  background: 'white',
                  borderRadius: 6,
                  border: '1px solid #ddd',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div style={{ flex: 1 }}>
                  <Link
                    to={`/sustainability-practices/${encodeURIComponent(practice)}`}
                    style={{ color: '#1976d2', fontWeight: 'bold', textDecoration: 'none', fontSize: '1.1rem' }}
                  >
                    {name}
                  </Link>
                  <div style={{ fontSize: '0.9rem', color: '#666', marginTop: '0.25rem' }}>
                    Type: {type} | Impact Level: {impactLevel}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <Link
                    to={`/sustainability-practices/${encodeURIComponent(practice)}/edit`}
                    style={{
                      padding: '0.4rem 0.8rem',
                      background: '#ff9800',
                      color: 'white',
                      textDecoration: 'none',
                      borderRadius: 4,
                      fontSize: '0.9rem',
                    }}
                  >
                    Edit
                  </Link>

                  <button
                    onClick={() => handleDelete(practice)}
                    style={{
                      padding: '0.4rem 0.8rem',
                      background: '#f44336',
                      color: 'white',
                      border: 'none',
                      borderRadius: 4,
                      cursor: 'pointer',
                      fontSize: '0.9rem',
                    }}
                  >
                    Delete
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {!loading && filteredPractices.length === 0 && (
        <p style={{ textAlign: 'center', color: '#666' }}>No sustainability practices found</p>
      )}
    </div>
  );
}

export default SustainabilityPracticesList;
