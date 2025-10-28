import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

function GuideList() {
  const [guides, setGuides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchGuides();
  }, []);

  const fetchGuides = async () => {
    try {
      const response = await fetch('http://localhost:5000/guides');
      if (!response.ok) throw new Error('Failed to fetch guides');
      
      const data = await response.json();
      setGuides(data);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const handleDelete = async (uri) => {
    if (window.confirm('Delete this guide?')) {
      try {
        const response = await fetch(`http://localhost:5000/delete-guide?uri=${encodeURIComponent(uri)}`, { method: 'DELETE' });
        if (!response.ok) throw new Error('Failed to delete guide');
        fetchGuides(); // Rafraîchir la liste
      } catch (err) {
        setError(err.message);
      }
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="container">
      <h2>Guides</h2>
      <Link to="/add-guide" className="btn btn-primary mb-3">Add Guide</Link>
      <div className="list-group">
        {guides.map((guide) => (
          <div key={guide.uri} className="list-group-item d-flex justify-content-between align-items-center">
            <Link to={`/guide/${encodeURIComponent(guide.uri)}`}>{guide.name}</Link>
            <div>
              <Link to={`/edit-guide/${encodeURIComponent(guide.uri)}`} className="btn btn-sm btn-primary me-2">Edit</Link>
              <button onClick={() => handleDelete(guide.uri)} className="btn btn-sm btn-danger">Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default GuideList;