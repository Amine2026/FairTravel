import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

function RestaurantForm() {
  const [formData, setFormData] = useState({
    restaurantName: '',
    cuisineType: '',
    averagePrice: '',
    locatedIn: ''
  });
  const [locations, setLocations] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { uri } = useParams();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const locationsRes = await fetch('http://localhost:5000/locations');
        if (!locationsRes.ok) throw new Error('Failed to fetch locations');
        const locationsData = await locationsRes.json();
        setLocations(locationsData);

        if (uri) {
          const response = await fetch(`http://localhost:5000/restaurant-details?uri=${encodeURIComponent(uri)}`);
          if (!response.ok) throw new Error('Failed to fetch restaurant');
          const data = await response.json();
          setFormData({
            restaurantName: data['http://www.fairtravel.com/fairtravel#restaurantName'] || '',
            cuisineType: data['http://www.fairtravel.com/fairtravel#cuisineType'] || '',
            averagePrice: data['http://www.fairtravel.com/fairtravel#averagePrice'] || '',
            locatedIn: data['http://www.fairtravel.com/fairtravel#locatedIn'] || ''
          });
        }
      } catch (err) {
        setError(err.message);
      }
    };
    fetchData();
  }, [uri]);

  const validate = () => {
    if (!formData.restaurantName.trim()) return 'Name is required';
    if (!formData.cuisineType.trim()) return 'Cuisine type is required';
    if (formData.averagePrice === '' || isNaN(formData.averagePrice)) return 'Valid average price is required';
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationError = validate();
    if (validationError) { setError(validationError); return; }
    setLoading(true);
    setError(null);
    try {
      const endpoint = uri ? 'update-restaurant' : 'add-restaurant';
      const method = uri ? 'PUT' : 'POST';
      const submissionData = {
        ...formData,
        averagePrice: parseFloat(formData.averagePrice),
        ...(formData.locatedIn ? { locatedIn: formData.locatedIn } : {})
      };
      if (uri) submissionData.uri = uri;
      const response = await fetch(`http://localhost:5000/${endpoint}`, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submissionData)
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save restaurant');
      }
      navigate('/restaurants');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="container">
      <h2>{uri ? 'Edit Restaurant' : 'Add Restaurant'}</h2>
      {error && <div className="alert alert-danger">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="form-label">Name *</label>
          <input type="text" name="restaurantName" className="form-control" value={formData.restaurantName} onChange={handleChange} required />
        </div>
        <div className="mb-3">
          <label className="form-label">Cuisine Type *</label>
          <input type="text" name="cuisineType" className="form-control" value={formData.cuisineType} onChange={handleChange} required />
        </div>
        <div className="mb-3">
          <label className="form-label">Average Price *</label>
          <input type="number" step="0.01" name="averagePrice" className="form-control" value={formData.averagePrice} onChange={handleChange} required />
        </div>
        <div className="mb-3">
          <label className="form-label">Located In</label>
          <select className="form-control" name="locatedIn" value={formData.locatedIn} onChange={handleChange}>
            <option value="">Select a location...</option>
            {locations.map(loc => (
              <option key={loc} value={loc.split('#')[1]}>{loc.split('#')[1]}</option>
            ))}
          </select>
        </div>
        <div className="mb-3">
          <button type="submit" className="btn btn-primary me-2" disabled={loading}>{loading ? 'Saving...' : 'Save'}</button>
          <button type="button" className="btn btn-secondary" onClick={() => navigate('/restaurants')}>Cancel</button>
        </div>
      </form>
    </div>
  );
}
export default RestaurantForm;
