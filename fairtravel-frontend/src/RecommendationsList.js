import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

function RecommendationsList() {
  const [recommendations, setRecommendations] = useState([]);
  const [search, setSearch] = useState("");
  const [detailsMap, setDetailsMap] = useState({});
  const [ratingFilter, setRatingFilter] = useState("");
  const [sourceFilter, setSourceFilter] = useState("");

  // Recommendation creation form state
  const [form, setForm] = useState({
    name: '',
    text: '',
    rating: '',
    source: '',
    for_activity: ''
  });
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');

  // Recommendation editing state
  const [editingUri, setEditingUri] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', text: '', rating: '', source: '', for_activity: '' });
  const [updating, setUpdating] = useState(false);
  const [updateError, setUpdateError] = useState('');

  useEffect(() => {
    fetch('http://localhost:5000/recommendations')
      .then(response => response.json())
      .then(data => {
        setRecommendations(data);
        // Fetch details for each recommendation for filtering
        data.forEach(uri => {
          fetch(`http://localhost:5000/recommendation-details?uri=${encodeURIComponent(uri)}`)
            .then(response => response.json())
            .then(details => {
              setDetailsMap(prev => ({ ...prev, [uri]: details }));
            });
        });
      });
  }, []);

  // Get unique ratings and sources for dropdowns
  const ratings = Array.from(new Set(Object.values(detailsMap).map(d => d['http://www.fairtravel.com/fairtravel#rating']).filter(Boolean)));
  const sources = Array.from(new Set(Object.values(detailsMap).map(d => d['http://www.fairtravel.com/fairtravel#source']).filter(Boolean)));

  const filteredRecommendations = recommendations.filter(rec => {
    const details = detailsMap[rec] || {};
    const matchesSearch = rec.toLowerCase().includes(search.toLowerCase());
    const matchesRating = !ratingFilter || details['http://www.fairtravel.com/fairtravel#rating'] === ratingFilter;
    const matchesSource = !sourceFilter || details['http://www.fairtravel.com/fairtravel#source'] === sourceFilter;
    return matchesSearch && matchesRating && matchesSource;
  });

  const handleFormChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleCreate = async e => {
    e.preventDefault();
    setCreating(true);
    setError('');
    try {
      const res = await fetch('http://localhost:5000/recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      if (!res.ok) throw new Error('Failed to create');
      setForm({ name: '', text: '', rating: '', source: '', for_activity: '' });
      setCreating(false);
      window.location.reload(); // reload to fetch new list
    } catch (err) {
      setError('Error creating recommendation');
      setCreating(false);
    }
  };

  const handleDelete = async rec => {
    if (!window.confirm('Delete this recommendation?')) return;
    const encoded = encodeURIComponent(rec);
    await fetch(`http://localhost:5000/recommendations/${encoded}`, { method: 'DELETE' });
    window.location.reload();
  };

  const startEdit = (rec) => {
    const details = detailsMap[rec] || {};
    setEditingUri(rec);
    setEditForm({
      name: rec.split('#')[1] || '',
      text: details['http://www.fairtravel.com/fairtravel#recommendationText'] || '',
      rating: details['http://www.fairtravel.com/fairtravel#rating'] || '',
      source: details['http://www.fairtravel.com/fairtravel#source'] || '',
      for_activity: details['http://www.fairtravel.com/fairtravel#forActivity'] ? details['http://www.fairtravel.com/fairtravel#forActivity'].split('#')[1] : ''
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
      const res = await fetch(`http://localhost:5000/recommendations/${encoded}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm)
      });
      if (!res.ok) throw new Error('Failed to update');
      setEditingUri(null);
      setUpdating(false);
      window.location.reload();
    } catch (err) {
      setUpdateError('Error updating recommendation');
      setUpdating(false);
    }
  };

  return (
    <div style={{maxWidth:600, margin:'2rem auto', padding:'1rem', background:'#f9f9f9', borderRadius:8, boxShadow:'0 2px 8px #ddd'}}>
      <h2 style={{marginBottom:'1rem'}}>Recommendations</h2>
      <form onSubmit={handleCreate} style={{marginBottom:'2rem', background:'#eef', padding:'1rem', borderRadius:6}}>
        <h3>Add Recommendation</h3>
        <input name="name" value={form.name} onChange={handleFormChange} placeholder="Name" required style={{marginRight:8}} />
        <input name="text" value={form.text} onChange={handleFormChange} placeholder="Text" required style={{marginRight:8}} />
        <input name="rating" value={form.rating} onChange={handleFormChange} placeholder="Rating" required style={{marginRight:8}} />
        <input name="source" value={form.source} onChange={handleFormChange} placeholder="Source" required style={{marginRight:8}} />
        <input name="for_activity" value={form.for_activity} onChange={handleFormChange} placeholder="For Activity" required style={{marginRight:8}} />
        <button type="submit" disabled={creating}>Create</button>
        {error && <div style={{color:'red'}}>{error}</div>}
      </form>
      <input
        type="text"
        placeholder="Search recommendations..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        style={{width:'100%', padding:'0.5rem', marginBottom:'1rem', borderRadius:4, border:'1px solid #ccc'}}
      />
      <div style={{display:'flex', gap:'1rem', marginBottom:'1rem'}}>
        <select value={ratingFilter} onChange={e => setRatingFilter(e.target.value)} style={{padding:'0.5rem', borderRadius:4, border:'1px solid #ccc'}}>
          <option value="">All Ratings</option>
          {ratings.map(rating => (
            <option key={rating} value={rating}>{rating}</option>
          ))}
        </select>
        <select value={sourceFilter} onChange={e => setSourceFilter(e.target.value)} style={{padding:'0.5rem', borderRadius:4, border:'1px solid #ccc'}}>
          <option value="">All Sources</option>
          {sources.map(source => (
            <option key={source} value={source}>{source}</option>
          ))}
        </select>
      </div>
      <ul style={{paddingLeft:0, listStyle:'none'}}>
        {filteredRecommendations.map(rec => (
          <li key={rec} style={{marginBottom:'0.5rem'}}>
            <Link
              to={`/recommendations/${encodeURIComponent(rec)}`}
              style={{color: '#1976d2', textDecoration: 'underline', cursor: 'pointer', fontSize:'1rem'}}
            >
              {rec}
            </Link>
            <button onClick={() => handleDelete(rec)} style={{marginLeft:12, color:'red'}}>Delete</button>
            <button onClick={() => startEdit(rec)} style={{marginLeft:8}}>Edit</button>
            {editingUri === rec && (
              <form onSubmit={handleUpdate} style={{marginTop:'1rem', background:'#ffe', padding:'1rem', borderRadius:6}}>
                <input name="name" value={editForm.name} onChange={handleEditFormChange} placeholder="Name" required style={{marginRight:8}} />
                <input name="text" value={editForm.text} onChange={handleEditFormChange} placeholder="Text" required style={{marginRight:8}} />
                <input name="rating" value={editForm.rating} onChange={handleEditFormChange} placeholder="Rating" required style={{marginRight:8}} />
                <input name="source" value={editForm.source} onChange={handleEditFormChange} placeholder="Source" required style={{marginRight:8}} />
                <input name="for_activity" value={editForm.for_activity} onChange={handleEditFormChange} placeholder="For Activity" required style={{marginRight:8}} />
                <button type="submit" disabled={updating}>Update</button>
                <button type="button" onClick={() => setEditingUri(null)} style={{marginLeft:8}}>Cancel</button>
                {updateError && <div style={{color:'red'}}>{updateError}</div>}
              </form>
            )}
          </li>
        ))}
      </ul>
      <div style={{marginTop:'1.5rem'}}>
        {/* Details now shown in RecommendationDetails route */}
      </div>
    </div>
  );
}

export default RecommendationsList;
