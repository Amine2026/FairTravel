import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

function EventsList() {
  const [events, setEvents] = useState([]);
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

  // Event creation form state
  const [form, setForm] = useState({
    name: '',
    eventType: '',
    organizer: '',
    price: '',
    eventDate: '',
    location: ''
  });
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');

  const handleFormChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleCreate = async e => {
    e.preventDefault();
    setCreating(true);
    setError('');
    try {
      const res = await fetch('http://localhost:5000/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      if (!res.ok) throw new Error('Failed to create');
      setForm({ name: '', eventType: '', organizer: '', price: '', eventDate: '', location: '' });
      setCreating(false);
      window.location.reload();
    } catch (err) {
      setError('Error creating event');
      setCreating(false);
    }
  };

  const handleDelete = async event => {
    if (!window.confirm('Delete this event?')) return;
    const encoded = encodeURIComponent(event);
    await fetch(`http://localhost:5000/events/${encoded}`, { method: 'DELETE' });
    window.location.reload();
  };

  const [editingUri, setEditingUri] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', eventType: '', organizer: '', price: '', eventDate: '', location: '' });
  const [updating, setUpdating] = useState(false);
  const [updateError, setUpdateError] = useState('');

  const startEdit = (event) => {
    const details = detailsMap[event] || {};
    setEditingUri(event);
    setEditForm({
      name: event.split('#')[1] || '',
      eventType: details['http://www.fairtravel.com/fairtravel#eventType'] || '',
      organizer: details['http://www.fairtravel.com/fairtravel#organizer'] || '',
      price: details['http://www.fairtravel.com/fairtravel#price'] || '',
      eventDate: details['http://www.fairtravel.com/fairtravel#eventDate'] || '',
      location: details['http://www.fairtravel.com/fairtravel#hasLocation'] ? details['http://www.fairtravel.com/fairtravel#hasLocation'].split('#')[1] : ''
    });
  };

  const handleEditFormChange = e => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  const handleUpdate = async e => {
    e.preventDefault();
    setUpdating(true);
    setUpdateError('');
    try {
      const encoded = encodeURIComponent(editingUri);
      const res = await fetch(`http://localhost:5000/events/${encoded}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm)
      });
      if (!res.ok) throw new Error('Failed to update');
      setEditingUri(null);
      setUpdating(false);
      window.location.reload();
    } catch (err) {
      setUpdateError('Error updating event');
      setUpdating(false);
    }
  };

  return (
    <div style={{maxWidth:600, margin:'2rem auto', padding:'1rem', background:'#f9f9f9', borderRadius:8, boxShadow:'0 2px 8px #ddd'}}>
      <h2 style={{marginBottom:'1rem'}}>Events</h2>
      <form onSubmit={handleCreate} style={{marginBottom:'2rem', background:'#eef', padding:'1rem', borderRadius:6}}>
        <h3>Add Event</h3>
        <input name="name" value={form.name} onChange={handleFormChange} placeholder="Name" required style={{marginRight:8}} />
        <input name="eventType" value={form.eventType} onChange={handleFormChange} placeholder="Type" required style={{marginRight:8}} />
        <input name="organizer" value={form.organizer} onChange={handleFormChange} placeholder="Organizer" required style={{marginRight:8}} />
        <input name="price" value={form.price} onChange={handleFormChange} placeholder="Price" required style={{marginRight:8}} />
        <input name="eventDate" value={form.eventDate} onChange={handleFormChange} placeholder="Date (YYYY-MM-DDTHH:MM:SS)" required style={{marginRight:8}} />
        <input name="location" value={form.location} onChange={handleFormChange} placeholder="Location" required style={{marginRight:8}} />
        <button type="submit" disabled={creating}>Create</button>
        {error && <div style={{color:'red'}}>{error}</div>}
      </form>
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
              <Link
                to={`/events/${encodeURIComponent(event)}`}
                style={{color: '#1976d2', textDecoration: 'underline', cursor: 'pointer', fontSize:'1rem'}}
              >
                {event}
              </Link>
              <button onClick={() => handleDelete(event)} style={{marginLeft:12, color:'red'}}>Delete</button>
              <button onClick={() => startEdit(event)} style={{marginLeft:8}}>Edit</button>
              {editingUri === event && (
                <form onSubmit={handleUpdate} style={{marginTop:'1rem', background:'#ffe', padding:'1rem', borderRadius:6}}>
                  <input name="name" value={editForm.name} onChange={handleEditFormChange} placeholder="Name" required style={{marginRight:8}} />
                  <input name="eventType" value={editForm.eventType} onChange={handleEditFormChange} placeholder="Type" required style={{marginRight:8}} />
                  <input name="organizer" value={editForm.organizer} onChange={handleEditFormChange} placeholder="Organizer" required style={{marginRight:8}} />
                  <input name="price" value={editForm.price} onChange={handleEditFormChange} placeholder="Price" required style={{marginRight:8}} />
                  <input name="eventDate" value={editForm.eventDate} onChange={handleEditFormChange} placeholder="Date (YYYY-MM-DDTHH:MM:SS)" required style={{marginRight:8}} />
                  <input name="location" value={editForm.location} onChange={handleEditFormChange} placeholder="Location" required style={{marginRight:8}} />
                  <button type="submit" disabled={updating}>Update</button>
                  <button type="button" onClick={() => setEditingUri(null)} style={{marginLeft:8}}>Cancel</button>
                  {updateError && <div style={{color:'red'}}>{updateError}</div>}
                </form>
              )}
            </li>
          ))}
      </ul>
      <div style={{marginTop:'1.5rem'}}>
        {/* Details now shown in EventDetails route */}
      </div>
    </div>
  );
}

export default EventsList;
