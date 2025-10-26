
import React, { useEffect, useState } from 'react';
import ActivityDetails from './ActivityDetails';

function ActivitiesList() {
  const [activities, setActivities] = useState([]);
  const [selectedUri, setSelectedUri] = useState(null);

  useEffect(() => {
    fetch('http://localhost:5000/activities')
      .then(response => response.json())
      .then(data => setActivities(data));
  }, []);

  return (
    <div>
      <h2>Activities</h2>
      <ul>
        {activities.map(activity => (
          <li key={activity}>
            <button style={{background: 'none', border: 'none', color: 'blue', textDecoration: 'underline', cursor: 'pointer'}} onClick={() => setSelectedUri(activity)}>
              {activity}
            </button>
          </li>
        ))}
      </ul>
      <ActivityDetails uri={selectedUri} />
    </div>
  );
}

export default ActivitiesList;
