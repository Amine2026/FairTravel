import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';

function AccommodationsList() {
  const [accommodations, setAccommodations] = useState([]);
  const [detailsMap, setDetailsMap] = useState({});
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Keep a ref to the current fetch controller so we can abort on unmount/re-fetch
  const controllerRef = useRef(null);

  const extractId = (uri) => {
    if (!uri) return uri;
    const parts = uri.split('#');
    return parts.length > 1 && parts[1] ? parts[1] : uri;
  };

  const fetchAccommodations = async () => {
    // Abort any previous requests
    if (controllerRef.current) {
      controllerRef.current.abort();
    }
    const controller = new AbortController();
    controllerRef.current = controller;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('http://localhost:5000/accommodations', { signal: controller.signal });
      if (!res.ok) throw new Error(`Failed to fetch accommodations: ${res.statusText}`);
      const data = await res.json();

      // Ensure data is an array
      const uris = Array.isArray(data) ? data : [];
      setAccommodations(uris);

      // Fetch details for all accommodations in parallel and build a map
      const detailPromises = uris.map(async (uri) => {
        try {
          const r = await fetch(
            `http://localhost:5000/accommodation-details?uri=${encodeURIComponent(uri)}`,
            { signal: controller.signal }
          );
          if (!r.ok) return { uri, details: null };
          const details = await r.json();
          return { uri, details };
        } catch (err) {
          // if aborted or failed, return null details for that uri
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
      if (err.name === 'AbortError') {
        // fetch was aborted — ignore
      } else {
        console.error(err);
        setError(err.message || 'Unknown error');
      }
    } finally {
      setLoading(false);
      controllerRef.current = null;
    }
  };

  useEffect(() => {
    fetchAccommodations();

    // cleanup on unmount
    return () => {
      if (controllerRef.current) controllerRef.current.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // run once on mount

  const handleDelete = async (accommodationUri) => {
    const confirmed = window.confirm('Are you sure you want to delete this accommodation?');
    if (!confirmed) return;

    // Try to extract an ID; if none, fallback to encoding the full uri in endpoint
    const id = extractId(accommodationUri);

    try {
      // If your backend expects id vs full uri change the url accordingly.
      // This sends DELETE to /accommodations/:id (id may be the encoded uri if your backend expects that).
      const endpoint = `http://localhost:5000/accommodations/${encodeURIComponent(id)}`;
      const response = await fetch(endpoint, { method: 'DELETE' });

      if (!response.ok) {
        const text = await response.text().catch(() => '');
        throw new Error(text || 'Failed to delete');
      }

      // Remove locally to avoid re-fetch delay (optimistic update)
      setAccommodations(prev => prev.filter(u => u !== accommodationUri));
      setDetailsMap(prev => {
        const copy = { ...prev };
        delete copy[accommodationUri];
        return copy;
      });
      // Optionally re-fetch full list:
      // await fetchAccommodations();
      alert('Accommodation successfully deleted');
    } catch (err) {
      console.error('Error deleting accommodation:', err);
      alert('Error deleting accommodation');
    }
  };

  const filteredAccommodations = accommodations.filter(a =>
    String(a).toLowerCase().includes(search.toLowerCase())
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
        <h2>Accommodations</h2>
        <Link
          to="/accommodations/new"
          style={{
            padding: '0.5rem 1rem',
            background: '#1976d2',
            color: 'white',
            textDecoration: 'none',
            borderRadius: 4,
            fontWeight: 'bold',
          }}
        >
          + Add Accommodation
        </Link>
      </div>

      <input
        type="text"
        placeholder="Search accommodations..."
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
          {filteredAccommodations.map((accommodation) => {
            const details = detailsMap[accommodation] || {};
            const name = details['http://www.fairtravel.com/fairtravel#accommodationName'] || extractId(accommodation);
            const location = details['http://www.fairtravel.com/fairtravel#hasLocation']?.split('#')[1] || 'Unknown';
            const type = details['http://www.w3.org/1999/02/22-rdf-syntax-ns#type']?.split('#')[1] || 'N/A';


            return (
              <li
                key={accommodation}
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
                    to={`/accommodations/${encodeURIComponent(accommodation)}`}
                    style={{ color: '#1976d2', fontWeight: 'bold', textDecoration: 'none', fontSize: '1.1rem' }}
                  >
                    {name}
                  </Link>
                  <div style={{ fontSize: '0.9rem', color: '#666', marginTop: '0.25rem' }}>
                    Type: {type} | Location: {location}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <Link
                    to={`/accommodations/${encodeURIComponent(accommodation)}/edit`}
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
                    onClick={() => handleDelete(accommodation)}
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

      {!loading && filteredAccommodations.length === 0 && (
        <p style={{ textAlign: 'center', color: '#666' }}>No accommodations found</p>
      )}
    </div>
  );
}

export default AccommodationsList;
