
import React, { useEffect, useState } from 'react';
import RecommendationDetails from './RecommendationDetails';

function RecommendationsList() {
  const [recommendations, setRecommendations] = useState([]);
  const [selectedUri, setSelectedUri] = useState(null);
  const [search, setSearch] = useState("");
  const [detailsMap, setDetailsMap] = useState({});
  const [ratingFilter, setRatingFilter] = useState("");
  const [sourceFilter, setSourceFilter] = useState("");

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

  return (
    <div style={{maxWidth:600, margin:'2rem auto', padding:'1rem', background:'#f9f9f9', borderRadius:8, boxShadow:'0 2px 8px #ddd'}}>
      <h2 style={{marginBottom:'1rem'}}>Recommendations</h2>
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
            <button style={{background: 'none', border: 'none', color: '#1976d2', textDecoration: 'underline', cursor: 'pointer', fontSize:'1rem'}} onClick={() => setSelectedUri(rec)}>
              {rec}
            </button>
          </li>
        ))}
      </ul>
      <div style={{marginTop:'1.5rem'}}>
        <RecommendationDetails uri={selectedUri} />
      </div>
    </div>
  );
}

export default RecommendationsList;
