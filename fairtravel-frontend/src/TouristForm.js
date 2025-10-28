import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

function TouristForm() {
  const [formData, setFormData] = useState({
    touristName: '',
    touristAge: '',
    guidedBy: '',
    visitsRestaurant: ''
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [guides, setGuides] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const navigate = useNavigate();
  const { uri } = useParams();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch guides and restaurants for dropdowns
        const [guidesRes, restaurantsRes] = await Promise.all([
          fetch('http://localhost:5000/guides'),
          fetch('http://localhost:5000/restaurants')
        ]);
        
        if (!guidesRes.ok || !restaurantsRes.ok) {
          throw new Error('Failed to fetch reference data');
        }
        
        const guidesData = await guidesRes.json();
        const restaurantsData = await restaurantsRes.json();
        setGuides(guidesData);
        setRestaurants(restaurantsData);

        // If editing, fetch tourist details
        if (uri) {
          const touristRes = await fetch(`http://localhost:5000/tourist-details?uri=${encodeURIComponent(uri)}`);
          if (!touristRes.ok) throw new Error('Failed to fetch tourist');
          const data = await touristRes.json();
          
          // Extraire seulement le nom pour les relations (au lieu de l'URI complète)
          const guidedBy = data.guidedBy || '';
          const visitsRestaurant = data.visitsRestaurant || '';
          
          setFormData({
            touristName: data.touristName || '',
            touristAge: data.touristAge || '',
            guidedBy: guidedBy.split('#')[1] || guidedBy, // Extraire seulement l'ID
            visitsRestaurant: visitsRestaurant.split('#')[1] || visitsRestaurant // Extraire seulement l'ID
          });
        }
      } catch (err) {
        setError(err.message);
      }
    };
    fetchData();
  }, [uri]);

  const validate = () => {
    if (!formData.touristName.trim()) return 'Name is required';
    if (!formData.touristAge || isNaN(formData.touristAge)) return 'Valid age is required';
    if (formData.touristAge < 0) return 'Age must be a positive number';
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
      const endpoint = uri ? 'http://localhost:5000/update-tourist' : 'http://localhost:5000/add-tourist';
      const method = uri ? 'PUT' : 'POST';
      
      // Préparer les données avec formatage correct
      const submissionData = {
        touristName: formData.touristName.trim(),
        touristAge: parseInt(formData.touristAge)
      };
      
      // Ajouter les relations seulement si elles sont sélectionnées
      if (formData.guidedBy) {
        submissionData.guidedBy = formData.guidedBy;
      }
      if (formData.visitsRestaurant) {
        submissionData.visitsRestaurant = formData.visitsRestaurant;
      }
      
      // Ajouter URI pour les mises à jour
      if (uri) {
        submissionData.uri = uri;
      }

      console.log('Submitting data:', submissionData);
      
      const response = await fetch(endpoint, {
        method,
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(submissionData)
      });
      
      const responseData = await response.json();
      
      if (!response.ok) {
        throw new Error(responseData.error || `HTTP error! status: ${response.status}`);
      }
      
      navigate('/tourists');
    } catch (err) {
      console.error('Submission error:', err);
      setError(err.message || 'Failed to save tourist');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'touristAge' ? (value === '' ? '' : parseInt(value)) : value
    }));
  };

  return (
    <div className="container">
      <h2>{uri ? 'Edit Tourist' : 'Add Tourist'}</h2>
      {error && <div className="alert alert-danger">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="form-label">Name *</label>
          <input
            type="text"
            name="touristName"
            className="form-control"
            value={formData.touristName}
            onChange={handleChange}
            required
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Age *</label>
          <input
            type="number"
            name="touristAge"
            className="form-control"
            value={formData.touristAge}
            onChange={handleChange}
            required
            min="0"
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Guide</label>
          <select
            className="form-control"
            name="guidedBy"
            value={formData.guidedBy}
            onChange={handleChange}
          >
            <option value="">Select a guide...</option>
            {guides.map(guide => (
              <option key={guide.uri} value={guide.uri.split('#')[1]}>
                {guide.name}
              </option>
            ))}
          </select>
        </div>
        <div className="mb-3">
          <label className="form-label">Restaurant</label>
          <select
            className="form-control"
            name="visitsRestaurant"
            value={formData.visitsRestaurant}
            onChange={handleChange}
          >
            <option value="">Select a restaurant...</option>
            {restaurants.map(restaurant => (
              <option key={restaurant.uri} value={restaurant.uri.split('#')[1]}>
                {restaurant.name}
              </option>
            ))}
          </select>
        </div>
        <div className="mb-3">
          <button type="submit" className="btn btn-primary me-2" disabled={loading}>
            {loading ? 'Saving...' : 'Save'}
          </button>
          <button type="button" className="btn btn-secondary" onClick={() => navigate('/tourists')}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
export default TouristForm;