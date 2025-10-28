// components/AdvancedStats.js
import React, { useState, useEffect } from 'react';

function AdvancedStats() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/data-stats');
      if (!response.ok) throw new Error('Failed to fetch stats');
      const data = await response.json();
      setStats(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching stats:', error);
      setLoading(false);
    }
  };

  if (loading) return <div className="container text-center py-4">Loading statistics...</div>;

  return (
    <div className="container mt-4">
      <h2>📊 FairTravel - Advanced Statistics</h2>
      
      {/* Cartes de statistiques */}
      <div className="row mb-4">
        <div className="col-md-4 mb-3">
          <div className="card text-white bg-primary">
            <div className="card-body">
              <h5 className="card-title">👥 Tourists</h5>
              <p className="card-text display-4">{stats.total_tourists || 0}</p>
              <small>With age data: {stats.tourists_with_age || 0}</small>
            </div>
          </div>
        </div>
        
        <div className="col-md-4 mb-3">
          <div className="card text-white bg-success">
            <div className="card-body">
              <h5 className="card-title">👨‍🏫 Guides</h5>
              <p className="card-text display-4">{stats.total_guides || 0}</p>
              <small>French speaking: {stats.french_speaking_guides || 0}</small>
            </div>
          </div>
        </div>
        
        <div className="col-md-4 mb-3">
          <div className="card text-white bg-warning">
            <div className="card-body">
              <h5 className="card-title">🍽️ Restaurants</h5>
              <p className="card-text display-4">{stats.total_restaurants || 0}</p>
              <small>Vegetarian: {stats.vegetarian_restaurants || 0}</small>
            </div>
          </div>
        </div>
      </div>


    </div>
  );
}

export default AdvancedStats;