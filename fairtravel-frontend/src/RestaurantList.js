import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

function RestaurantList() {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchRestaurants();
  }, []);

  const fetchRestaurants = async () => {
    try {
      const response = await fetch('http://localhost:5000/restaurants');
      if (!response.ok) throw new Error('Failed to fetch restaurants');
      
      const data = await response.json();
      setRestaurants(data);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const handleDelete = async (uri) => {
    if (window.confirm('Delete this restaurant?')) {
      try {
        const response = await fetch(`http://localhost:5000/delete-restaurant?uri=${encodeURIComponent(uri)}`, {
          method: 'DELETE',
        });
        if (!response.ok) throw new Error('Failed to delete restaurant');
        fetchRestaurants();
      } catch (err) {
        setError(err.message);
      }
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="container">
      <h2>Restaurants</h2>
      <Link to="/add-restaurant" className="btn btn-primary mb-3">Add Restaurant</Link>
      <div className="list-group">
        {restaurants.map((restaurant) => (
          <div key={restaurant.uri} className="list-group-item d-flex justify-content-between align-items-center">
            <Link to={`/restaurant/${encodeURIComponent(restaurant.uri)}`}>{restaurant.name}</Link>
            <div>
              <Link to={`/edit-restaurant/${encodeURIComponent(restaurant.uri)}`} className="btn btn-sm btn-primary me-2">
                Edit
              </Link>
              <button onClick={() => handleDelete(restaurant.uri)} className="btn btn-sm btn-danger">
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default RestaurantList;