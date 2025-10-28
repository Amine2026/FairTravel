import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

function GuideDetails() {
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { uri } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const response = await fetch(`http://localhost:5000/guide-details?uri=${encodeURIComponent(uri)}`);
        if (!response.ok) throw new Error('Failed to fetch guide');
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

  // Fonction pour formater les noms des propriétés
  const formatPropertyName = (key) => {
    return key
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase())
      .trim();
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!details) return <div>No details found</div>;

  return (
    <div className="container">
      <h2>Guide Details</h2>
      <ul className="list-group mb-3">
        {Object.entries(details).map(([key, value]) => (
          <li key={key} className="list-group-item">
            <strong>{formatPropertyName(key)}:</strong> {value}
          </li>
        ))}
      </ul>
      <button className="btn btn-secondary" onClick={() => navigate('/guides')}>
        Back
      </button>
    </div>
  );
}

export default GuideDetails;