import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

function BookingsList() {
  const [bookings, setBookings] = useState([]);
  const [detailsMap, setDetailsMap] = useState({});

  useEffect(() => {
    fetch('http://localhost:5000/bookings')
      .then(res => res.json())
      .then(data => {
        setBookings(data);

        data.forEach(uri => {
          fetch(`http://localhost:5000/booking-details?uri=${encodeURIComponent(uri)}`)
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
      <h2>Bookings</h2>

      <ul style={{ listStyle: 'none', paddingLeft: 0 }}>
        {bookings.map(uri => (
          <li key={uri} style={{ marginBottom: '0.5rem' }}>
            <Link
              to={`/bookings/${encodeURIComponent(uri)}`}
              style={{ color: '#1976d2', textDecoration: 'underline' }}
            >
              {detailsMap[uri]?.['http://www.fairtravel.com/fairtravel#bookingID'] || uri}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default BookingsList;
