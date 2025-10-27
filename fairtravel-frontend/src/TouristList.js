import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

function TouristList() {
  const [tourists, setTourists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchTourists();
  }, []);

  const fetchTourists = async () => {
    try {
      const response = await fetch('http://localhost:5000/tourists');
      if (!response.ok) throw new Error('Failed to fetch tourists');
      const data = await response.json();
      setTourists(data);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const handleDelete = async (uri) => {
    if (window.confirm('Delete this tourist?')) {
      try {
        const response = await fetch(`http://localhost:5000/delete-tourist?uri=${encodeURIComponent(uri)}`, { method: 'DELETE' });
        if (!response.ok) throw new Error('Failed to delete tourist');
        fetchTourists();
      } catch (err) {
        setError(err.message);
      }
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="container">
      <h2>Tourists</h2>
      <Link to="/add-tourist" className="btn btn-primary mb-3">Add Tourist</Link>
      <div className="list-group">
        {tourists.map((uri) => (
          <div key={uri} className="list-group-item d-flex justify-content-between align-items-center">
            <Link to={`/tourist/${encodeURIComponent(uri)}`}>{uri.split('#')[1]}</Link>
            <div>
              <Link to={`/edit-tourist/${encodeURIComponent(uri)}`} className="btn btn-sm btn-primary me-2">Edit</Link>
              <button onClick={() => handleDelete(uri)} className="btn btn-sm btn-danger">Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
export default TouristList;
