import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

function ActivitiesList() {
  const [activities, setActivities] = useState([]);
  const [search, setSearch] = useState("");
  const [detailsMap, setDetailsMap] = useState({});
  const [typeFilter, setTypeFilter] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState("");

  useEffect(() => {
    fetch('http://localhost:5000/activities')
      .then(response => response.json())
      .then(data => {
        setActivities(data);
        // Fetch details for each activity for filtering
        data.forEach(uri => {
          fetch(`http://localhost:5000/activity-details?uri=${encodeURIComponent(uri)}`)
            .then(response => response.json())
            .then(details => {
              setDetailsMap(prev => ({ ...prev, [uri]: details }));
            });
        });
      });
  }, []);

  // Get unique types and difficulties for dropdowns
  const types = Array.from(new Set(Object.values(detailsMap).map(d => d['http://www.fairtravel.com/fairtravel#activityType']).filter(Boolean)));
  const difficulties = Array.from(new Set(Object.values(detailsMap).map(d => d['http://www.fairtravel.com/fairtravel#difficultyLevel']).filter(Boolean)));

  const filteredActivities = activities.filter(activity => {
    const details = detailsMap[activity] || {};
    const matchesSearch = activity.toLowerCase().includes(search.toLowerCase());
    const matchesType = !typeFilter || details['http://www.fairtravel.com/fairtravel#activityType'] === typeFilter;
    const matchesDifficulty = !difficultyFilter || details['http://www.fairtravel.com/fairtravel#difficultyLevel'] === difficultyFilter;
    return matchesSearch && matchesType && matchesDifficulty;
  });

  // Activity creation form state
  const [form, setForm] = useState({
    name: '',
    type: '',
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
      const res = await fetch('http://localhost:5000/activities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      if (!res.ok) throw new Error('Failed to create');
      setForm({ name: '', type: '', location: '' });
      setCreating(false);
      window.location.reload();
    } catch (err) {
      setError('Error creating activity');
      setCreating(false);
    }
  };

  const handleDelete = async activity => {
    if (!window.confirm('Delete this activity?')) return;
    const encoded = encodeURIComponent(activity);
    await fetch(`http://localhost:5000/activities/${encoded}`, { method: 'DELETE' });
    window.location.reload();
  };

  const [editingUri, setEditingUri] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', type: '', location: '' });
  const [updating, setUpdating] = useState(false);
  const [updateError, setUpdateError] = useState('');

  const startEdit = (activity) => {
    const details = detailsMap[activity] || {};
    setEditingUri(activity);
    setEditForm({
      name: activity.split('#')[1] || '',
      type: details['http://www.fairtravel.com/fairtravel#activityType'] || '',
      location: details['http://www.fairtravel.com/fairtravel#locatedIn'] ? details['http://www.fairtravel.com/fairtravel#locatedIn'].split('#')[1] : ''
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
      const res = await fetch(`http://localhost:5000/activities/${encoded}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm)
      });
      if (!res.ok) throw new Error('Failed to update');
      setEditingUri(null);
      setUpdating(false);
      window.location.reload();
    } catch (err) {
      setUpdateError('Error updating activity');
      setUpdating(false);
    }
  };

  // Get JWT and role
  const token = localStorage.getItem('token');
  let role = null;
  if (token) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      role = payload.role || (payload.identity && payload.identity.role);
    } catch {}
  }

  // Hide everything if not logged in
  if (!token) {
    return (
      <div style={{maxWidth:500,margin:'2rem auto',padding:'2rem',textAlign:'center'}}>
        <h2>Please log in to view activities.</h2>
      </div>
    );
  }

  return (
    <div style={{maxWidth:600, margin:'2rem auto', padding:'1rem', background:'#f9f9f9', borderRadius:8, boxShadow:'0 2px 8px #ddd'}}>
      <h2 style={{marginBottom:'1rem'}}>Activities</h2>
      {/* Only admins see Add Activity form */}
      {role === 'admin' && (
        <form onSubmit={handleCreate} style={{marginBottom:'2rem', background:'#eef', padding:'1rem', borderRadius:6}}>
          <h3>Add Activity</h3>
          <input name="name" value={form.name} onChange={handleFormChange} placeholder="Name" required style={{marginRight:8}} />
          <input name="type" value={form.type} onChange={handleFormChange} placeholder="Type" required style={{marginRight:8}} />
          <input name="location" value={form.location} onChange={handleFormChange} placeholder="Location" required style={{marginRight:8}} />
          <button type="submit" disabled={creating}>Create</button>
          {error && <div style={{color:'red'}}>{error}</div>}
        </form>
      )}
      <input
        type="text"
        placeholder="Search activities..."
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
        <select value={difficultyFilter} onChange={e => setDifficultyFilter(e.target.value)} style={{padding:'0.5rem', borderRadius:4, border:'1px solid #ccc'}}>
          <option value="">All Difficulties</option>
          {difficulties.map(diff => (
            <option key={diff} value={diff}>{diff}</option>
          ))}
        </select>
      </div>
      <ul style={{paddingLeft:0, listStyle:'none'}}>
        {filteredActivities.map(activity => (
          <li key={activity} style={{marginBottom:'0.5rem'}}>
            <Link
              to={`/activities/${encodeURIComponent(activity)}`}
              style={{color: '#1976d2', textDecoration: 'underline', cursor: 'pointer', fontSize:'1rem'}}
            >
              {activity}
            </Link>
            {/* Only admins see Delete/Edit buttons */}
            {role === 'admin' && (
              <>
                <button onClick={() => handleDelete(activity)} style={{marginLeft:12, color:'red'}}>Delete</button>
                <button onClick={() => startEdit(activity)} style={{marginLeft:8}}>Edit</button>
              </>
            )}
            {editingUri === activity && role === 'admin' && (
              <form onSubmit={handleUpdate} style={{marginTop:'1rem', background:'#ffe', padding:'1rem', borderRadius:6}}>
                <input name="name" value={editForm.name} onChange={handleEditFormChange} placeholder="Name" required style={{marginRight:8}} />
                <input name="type" value={editForm.type} onChange={handleEditFormChange} placeholder="Type" required style={{marginRight:8}} />
                <input name="location" value={editForm.location} onChange={handleEditFormChange} placeholder="Location" required style={{marginRight:8}} />
                <button type="submit" disabled={updating}>Update</button>
                <button type="button" onClick={() => setEditingUri(null)} style={{marginLeft:8}}>Cancel</button>
                {updateError && <div style={{color:'red'}}>{updateError}</div>}
              </form>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ActivitiesList;
