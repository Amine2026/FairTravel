import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

function BookingDetails({ uri }) {
  const params = useParams();
  const bookingUri = uri || (params.id ? decodeURIComponent(params.id) : null);
  const [details, setDetails] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!bookingUri) return;

    fetch(`http://localhost:5000/booking-details?uri=${encodeURIComponent(bookingUri)}`)
      .then(res => {
        if (!res.ok) throw new Error(`HTTP error ${res.status}`);
        return res.json();
      })
      .then(setDetails)
      .catch(err => setError(err.message));
  }, [bookingUri]);

  if (!bookingUri) return null;
  if (error) return <div style={{ color: 'red' }}>Error: {error}</div>;
  if (!details) return <div>Loading booking details...</div>;

  const labels = {
    'http://www.fairtravel.com/fairtravel#bookingID': 'Booking ID',
    'http://www.fairtravel.com/fairtravel#bookingDate': 'Booking Date',
    'http://www.fairtravel.com/fairtravel#checkInDate': 'Check-In Date',
    'http://www.fairtravel.com/fairtravel#checkOutDate': 'Check-Out Date',
    'http://www.fairtravel.com/fairtravel#totalPrice': 'Total Price',
    'http://www.w3.org/1999/02/22-rdf-syntax-ns#type': 'Element Type',
    'http://www.fairtravel.com/fairtravel#paymentStatus': 'Payment Status',
    'http://www.fairtravel.com/fairtravel#forAccommodation': 'Accommodation',
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
      <h3>Booking Details</h3>
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

export default BookingDetails;
