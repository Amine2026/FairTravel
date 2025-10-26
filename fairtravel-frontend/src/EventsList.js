
import React, { useEffect, useState } from 'react';
import EventDetails from './EventDetails';

function EventsList() {
  const [events, setEvents] = useState([]);
  const [selectedUri, setSelectedUri] = useState(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch('http://localhost:5000/events')
      .then(response => response.json())
      .then(data => setEvents(data));
  }, []);

  const filteredEvents = events.filter(event =>
    event.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{maxWidth:600, margin:'2rem auto', padding:'1rem', background:'#f9f9f9', borderRadius:8, boxShadow:'0 2px 8px #ddd'}}>
      <h2 style={{marginBottom:'1rem'}}>Events</h2>
      <input
        type="text"
        placeholder="Search events..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        style={{width:'100%', padding:'0.5rem', marginBottom:'1rem', borderRadius:4, border:'1px solid #ccc'}}
      />
      <ul style={{paddingLeft:0, listStyle:'none'}}>
        {filteredEvents.map(event => (
          <li key={event} style={{marginBottom:'0.5rem'}}>
            <button style={{background: 'none', border: 'none', color: '#1976d2', textDecoration: 'underline', cursor: 'pointer', fontSize:'1rem'}} onClick={() => setSelectedUri(event)}>
              {event}
            </button>
          </li>
        ))}
      </ul>
      <div style={{marginTop:'1.5rem'}}>
        <EventDetails uri={selectedUri} />
      </div>
    </div>
  );
}

export default EventsList;
