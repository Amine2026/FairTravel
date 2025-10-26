
import React, { useEffect, useState } from 'react';
import RecommendationDetails from './RecommendationDetails';

function RecommendationsList() {
  const [recommendations, setRecommendations] = useState([]);
  const [selectedUri, setSelectedUri] = useState(null);

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
          <li key={rec}>
            <button style={{background: 'none', border: 'none', color: 'blue', textDecoration: 'underline', cursor: 'pointer'}} onClick={() => setSelectedUri(rec)}>
              {rec}
            </button>
          </li>
        ))}
      </ul>
      <RecommendationDetails uri={selectedUri} />
    </div>
  );
}

export default RecommendationsList;
