
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

function ActivityDetails({ uri }) {
  const { id } = useParams();
  const activityUri = uri || (id ? decodeURIComponent(id) : null);
  const [details, setDetails] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!activityUri) return;
    setLoading(true);
    setError(null);
    // Fetch activity details
    fetch(`http://localhost:5000/activity-details?uri=${encodeURIComponent(activityUri)}`)
      .then(response => response.json())
      .then(data => setDetails(data));
    // Fetch recommendations for this activity
    fetch(`http://localhost:5000/recommendations`)
      .then(res => res.json())
      .then(async recs => {
        const filtered = [];
        for (const recUri of recs) {
          const recDetails = await fetch(`http://localhost:5000/recommendation-details?uri=${encodeURIComponent(recUri)}`).then(r => r.json());
          if (recDetails['http://www.fairtravel.com/fairtravel#forActivity'] === activityUri) {
            filtered.push({ uri: recUri, ...recDetails });
          }
        }
        setRecommendations(filtered);
      });
    // Fetch reviews for this activity
    fetch(`http://localhost:5000/reviews`)
      .then(res => res.json())
      .then(async revs => {
        const filtered = [];
        for (const revUri of revs) {
          const revDetails = await fetch(`http://localhost:5000/review-details?uri=${encodeURIComponent(revUri)}`).then(r => r.json());
          if (revDetails['http://www.fairtravel.com/fairtravel#reviewsActivity'] === activityUri) {
            filtered.push({ uri: revUri, ...revDetails });
          }
        }
        setReviews(filtered);
        setLoading(false);
      });
  }, [activityUri]);

  if (!activityUri) return null;
  if (loading) return <div style={{padding:'2rem'}}>Loading...</div>;
  if (error) return <div style={{color:'red'}}>Error: {error}</div>;
  if (!details) return <div style={{padding:'2rem'}}>No details found.</div>;

  return (
    <div style={{maxWidth:600,margin:'2rem auto',padding:'2rem',background:'#fff',borderRadius:8,boxShadow:'0 2px 8px #ddd'}}>
      <h2>Activity Details</h2>
      <div><strong>Name:</strong> {details['http://www.fairtravel.com/fairtravel#activityName']}</div>
      <div><strong>Type:</strong> {details['http://www.fairtravel.com/fairtravel#activityType']}</div>
      <div><strong>Location:</strong> {details['http://www.fairtravel.com/fairtravel#locatedIn'] ? details['http://www.fairtravel.com/fairtravel#locatedIn'].split('#')[1] : ''}</div>
      <div><strong>Difficulty:</strong> {details['http://www.fairtravel.com/fairtravel#difficultyLevel']}</div>
      <div><strong>Duration:</strong> {details['http://www.fairtravel.com/fairtravel#duration']}</div>
      <hr />
      <h3>Recommendations</h3>
      {recommendations.length === 0 ? <div>No recommendations.</div> : (
        <ul>
          {recommendations.map(rec => (
            <li key={rec.uri}>
              <strong>Text:</strong> {rec['http://www.fairtravel.com/fairtravel#recommendationText']}<br />
              <strong>Rating:</strong> {rec['http://www.fairtravel.com/fairtravel#rating']}<br />
              <strong>Source:</strong> {rec['http://www.fairtravel.com/fairtravel#source']}<br />
              <strong>Date:</strong> {rec['http://www.fairtravel.com/fairtravel#dateRecommended']}
            </li>
          ))}
        </ul>
      )}
      <hr />
      <h3>Reviews</h3>
      {reviews.length === 0 ? <div>No reviews.</div> : (
        <ul>
          {reviews.map(rev => (
            <li key={rev.uri}>
              <strong>Title:</strong> {rev['http://www.fairtravel.com/fairtravel#reviewTitle']}<br />
              <strong>Reviewer:</strong> {rev['http://www.fairtravel.com/fairtravel#reviewerName']}<br />
              <strong>Rating:</strong> {rev['http://www.fairtravel.com/fairtravel#rating']}<br />
              <strong>Date:</strong> {rev['http://www.fairtravel.com/fairtravel#reviewDate']}<br />
              <strong>Content:</strong> {rev['http://www.fairtravel.com/fairtravel#reviewText']}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default ActivityDetails;
