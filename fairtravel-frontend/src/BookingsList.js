import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';

function BookingsList() {
  const [bookings, setBookings] = useState([]);
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

  const fetchBookings = async () => {
    if (controllerRef.current) controllerRef.current.abort();
    const controller = new AbortController();
    controllerRef.current = controller;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('http://localhost:5000/bookings', { signal: controller.signal });
      if (!res.ok) throw new Error(`Failed to fetch bookings: ${res.statusText}`);
      const responseData = await res.json();
      const data = Array.isArray(responseData) ? responseData : [];

      setBookings(data);

      const detailPromises = data.map(async (uri) => {
        try {
          const r = await fetch(
            `http://localhost:5000/booking-details?uri=${encodeURIComponent(uri)}`,
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
    fetchBookings();
    return () => {
      if (controllerRef.current) controllerRef.current.abort();
    };
  }, []);

  const handleDelete = async (bookingUri) => {
    if (!window.confirm('Are you sure you want to delete this booking?')) return;

    const id = extractId(bookingUri);

    try {
      const response = await fetch(`http://localhost:5000/bookings/${encodeURIComponent(id)}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete booking');

      setBookings(prev => prev.filter(u => u !== bookingUri));
      setDetailsMap(prev => {
        const copy = { ...prev };
        delete copy[bookingUri];
        return copy;
      });

      alert('Booking successfully deleted');
    } catch (err) {
      console.error('Error deleting booking:', err);
      alert('Error deleting booking');
    }
  };

  const filteredBookings = bookings.filter(b => String(b).toLowerCase().includes(search.toLowerCase()));

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
        <h2>Bookings</h2>
        <Link
          to="/bookings/new"
          style={{
            padding: '0.5rem 1rem',
            background: '#1976d2',
            color: 'white',
            textDecoration: 'none',
            borderRadius: 4,
            fontWeight: 'bold',
          }}
        >
          + Add Booking
        </Link>
      </div>

      <input
        type="text"
        placeholder="Search bookings..."
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
          {filteredBookings.map((booking) => {
            const details = detailsMap[booking] || {};
            const bookingID = details['http://www.fairtravel.com/fairtravel#bookingID'] || extractId(booking);
            const accommodation = details['http://www.fairtravel.com/fairtravel#forAccommodation']?.split('#')[1] || 'Unknown';
            const totalPrice = details['http://www.fairtravel.com/fairtravel#totalPrice'] || 'N/A';
            return (
              <li
                key={booking}
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
                    to={`/bookings/${encodeURIComponent(booking)}`}
                    style={{ color: '#1976d2', fontWeight: 'bold', textDecoration: 'none', fontSize: '1.1rem' }}
                  >
                    {bookingID}
                  </Link>
                  <div style={{ fontSize: '0.9rem', color: '#666', marginTop: '0.25rem' }}>
                    Accommodation: {accommodation} | Total Price: {totalPrice}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <Link
                    to={`/bookings/${encodeURIComponent(booking)}/edit`}
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
                    onClick={() => handleDelete(booking)}
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

      {!loading && filteredBookings.length === 0 && (
        <p style={{ textAlign: 'center', color: '#666' }}>No bookings found</p>
      )}
    </div>
  );
}

export default BookingsList;
