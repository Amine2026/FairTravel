import React, { useEffect, useState } from 'react';

function EventsList() {
  const [events, setEvents] = useState([]);

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
          <li key={event}>{event}</li>
        ))}
      </ul>
    </div>
  );
}

export default EventsList;
