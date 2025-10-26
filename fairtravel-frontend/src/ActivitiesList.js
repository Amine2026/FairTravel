

import React, { useEffect, useState } from 'react';
import ActivityDetails from './ActivityDetails';

function ActivitiesList() {
  const [activities, setActivities] = useState([]);
  const [selectedUri, setSelectedUri] = useState(null);
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

  return (
    <div style={{maxWidth:600, margin:'2rem auto', padding:'1rem', background:'#f9f9f9', borderRadius:8, boxShadow:'0 2px 8px #ddd'}}>
      <h2 style={{marginBottom:'1rem'}}>Activities</h2>
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
            <button style={{background: 'none', border: 'none', color: '#1976d2', textDecoration: 'underline', cursor: 'pointer', fontSize:'1rem'}} onClick={() => setSelectedUri(activity)}>
              {activity}
            </button>
          </li>
        ))}
      </ul>
      <div style={{marginTop:'1.5rem'}}>
        <ActivityDetails uri={selectedUri} />
      </div>
    </div>
  );
}

export default ActivitiesList;
