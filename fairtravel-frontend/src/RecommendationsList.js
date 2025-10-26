import React, { useEffect, useState } from 'react';

function RecommendationsList() {
  const [recommendations, setRecommendations] = useState([]);

  useEffect(() => {
    fetch('http://localhost:5000/recommendations')
      .then(response => response.json())
      .then(data => setRecommendations(data));
  }, []);

  return (
    <div>
      <h2>Recommendations</h2>
      <ul>
        {recommendations.map(rec => (
          <li key={rec}>{rec}</li>
        ))}
      </ul>
    </div>
  );
}

export default RecommendationsList;
