
import React, { useEffect, useState } from 'react';
import EventDetails from './EventDetails';

function EventsList() {
  const [events, setEvents] = useState([]);
  const [selectedUri, setSelectedUri] = useState(null);
  const [search, setSearch] = useState("");
  const [detailsMap, setDetailsMap] = useState({});
  const [typeFilter, setTypeFilter] = useState("");
  const [monthFilter, setMonthFilter] = useState("");

  useEffect(() => {
    fetch('http://localhost:5000/events')
      .then(response => response.json())
      .then(data => {
        setEvents(data);
        // Fetch details for each event for filtering
        data.forEach(uri => {
          fetch(`http://localhost:5000/event-details?uri=${encodeURIComponent(uri)}`)
            .then(response => response.json())
            .then(details => {
              setDetailsMap(prev => ({ ...prev, [uri]: details }));
            });
        });
      });
  }, []);

  // Get unique types and months for dropdowns
  const types = Array.from(new Set(Object.values(detailsMap).map(d => d['http://www.fairtravel.com/fairtravel#eventType']).filter(Boolean)));
  const months = Array.from(new Set(Object.values(detailsMap)
    .map(d => {
      const date = d['http://www.fairtravel.com/fairtravel#eventDate'];
      if (date) {
        // Extract month from date string (e.g., 2025-11-15T10:00:00)
        return date.slice(0, 7); // YYYY-MM
      }
      return null;
    })
    .filter(Boolean)));

  const filteredEvents = events.filter(event => {
    const details = detailsMap[event] || {};
    const matchesSearch = event.toLowerCase().includes(search.toLowerCase());
    const matchesType = !typeFilter || details['http://www.fairtravel.com/fairtravel#eventType'] === typeFilter;
    const eventMonth = details['http://www.fairtravel.com/fairtravel#eventDate'] ? details['http://www.fairtravel.com/fairtravel#eventDate'].slice(0, 7) : null;
    const matchesMonth = !monthFilter || eventMonth === monthFilter;
    return matchesSearch && matchesType && matchesMonth;
  });

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
      <div style={{display:'flex', gap:'1rem', marginBottom:'1rem'}}>
        <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} style={{padding:'0.5rem', borderRadius:4, border:'1px solid #ccc'}}>
          <option value="">All Types</option>
          {types.map(type => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>
        <select value={monthFilter} onChange={e => setMonthFilter(e.target.value)} style={{padding:'0.5rem', borderRadius:4, border:'1px solid #ccc'}}>
          <option value="">All Months</option>
          {months.map(month => (
            <option key={month} value={month}>{month}</option>
          ))}
        </select>
      </div>
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
