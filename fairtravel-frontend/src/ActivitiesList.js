
import React, { useEffect, useState } from 'react';
import ActivityDetails from './ActivityDetails';

function ActivitiesList() {
  const [activities, setActivities] = useState([]);
  const [selectedUri, setSelectedUri] = useState(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch('http://localhost:5000/activities')
      .then(response => response.json())
      .then(data => setActivities(data));
  }, []);

  const filteredActivities = activities.filter(activity =>
    activity.toLowerCase().includes(search.toLowerCase())
  );

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
