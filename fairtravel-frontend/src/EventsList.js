
import React, { useEffect, useState } from 'react';
import EventDetails from './EventDetails';

function EventsList() {
  const [events, setEvents] = useState([]);
  const [selectedUri, setSelectedUri] = useState(null);

  useEffect(() => {
    fetch('http://localhost:5000/events')
      .then(response => response.json())
      .then(data => setEvents(data));
  }, []);

  return (
    <div>
      <h2>Events</h2>
      <ul>
        {events.map(event => (
          <li key={event}>
            <button style={{background: 'none', border: 'none', color: 'blue', textDecoration: 'underline', cursor: 'pointer'}} onClick={() => setSelectedUri(event)}>
              {event}
            </button>
          </li>
        ))}
      </ul>
      <EventDetails uri={selectedUri} />
    </div>
  );
}

export default EventsList;
