import React, { useEffect, useState } from 'react';

function ActivitiesList() {
  const [activities, setActivities] = useState([]);

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
          <li key={activity}>{activity}</li>
        ))}
      </ul>
    </div>
  );
}

export default ActivitiesList;
