import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

function TouristDetails() {
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { uri } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const response = await fetch(`http://localhost:5000/tourist-details?uri=${encodeURIComponent(uri)}`);
        if (!response.ok) throw new Error('Failed to fetch tourist');
        const data = await response.json();
        setDetails(data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };
    fetchDetails();
  }, [uri]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!details) return <div>No details found</div>;

  // Fonction pour formater les noms des propriétés
  const formatPropertyName = (key) => {
    return key
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase())
      .trim();
  };

  return (
    <div className="container">
      <h2>Tourist Details</h2>
      <ul className="list-group mb-3">
        {Object.entries(details).map(([key, value]) => (
          <li key={key} className="list-group-item">
            <strong>{formatPropertyName(key)}:</strong> {value}
          </li>
        ))}
      </ul>
      <button className="btn btn-secondary" onClick={() => navigate('/tourists')}>Back</button>
    </div>
  );
}
export default TouristDetails;