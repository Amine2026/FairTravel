import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

function RestaurantForm() {
  const [formData, setFormData] = useState({
    restaurantName: '',
    cuisineType: '',
    averagePrice: ''
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { uri } = useParams();

  useEffect(() => {
    if (uri) {
      const fetchRestaurant = async () => {
        try {
          const response = await fetch(`http://localhost:5000/restaurant-details?uri=${encodeURIComponent(uri)}`);
          if (!response.ok) throw new Error('Failed to fetch restaurant');
          const data = await response.json();
          
          setFormData({
            restaurantName: data.restaurantName || '',
            cuisineType: data.cuisineType || '',
            averagePrice: data.averagePrice || ''
          });
        } catch (err) {
          setError(err.message);
        }
      };
      fetchRestaurant();
    }
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
    if (validationError) { 
      setError(validationError); 
      return; 
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const endpoint = uri ? 'http://localhost:5000/update-restaurant' : 'http://localhost:5000/add-restaurant';
      const method = uri ? 'PUT' : 'POST';
      
      const submissionData = {
        restaurantName: formData.restaurantName.trim(),
        cuisineType: formData.cuisineType.trim(),
        averagePrice: parseFloat(formData.averagePrice)
      };
      
      if (uri) submissionData.uri = uri;
      
      console.log('Submitting restaurant data:', submissionData);
      
      const response = await fetch(endpoint, {
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
    setFormData(prev => ({ 
      ...prev, 
      [name]: value 
    }));
  };

  return (
    <div className="container">
      <h2>{uri ? 'Edit Restaurant' : 'Add Restaurant'}</h2>
      {error && <div className="alert alert-danger">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="form-label">Name *</label>
          <input 
            type="text" 
            name="restaurantName" 
            className="form-control" 
            value={formData.restaurantName} 
            onChange={handleChange} 
            required 
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Cuisine Type *</label>
          <input 
            type="text" 
            name="cuisineType" 
            className="form-control" 
            value={formData.cuisineType} 
            onChange={handleChange} 
            required 
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Average Price *</label>
          <input 
            type="number" 
            step="0.01" 
            min="0"
            name="averagePrice" 
            className="form-control" 
            value={formData.averagePrice} 
            onChange={handleChange} 
            required 
          />
        </div>
        
        <div className="mb-3">
          <button type="submit" className="btn btn-primary me-2" disabled={loading}>
            {loading ? 'Saving...' : 'Save'}
          </button>
          <button type="button" className="btn btn-secondary" onClick={() => navigate('/restaurants')}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

export default RestaurantForm;