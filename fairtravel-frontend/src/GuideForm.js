import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

function GuideForm() {
  const [formData, setFormData] = useState({
    guideName: '',
    languageSpoken: '',
    worksAt: ''
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [restaurants, setRestaurants] = useState([]);
  const navigate = useNavigate();
  const { uri } = useParams();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch restaurants for dropdown
        const restaurantsRes = await fetch('http://localhost:5000/restaurants');
        if (!restaurantsRes.ok) {
          throw new Error('Failed to fetch restaurants');
        }
        const restaurantsData = await restaurantsRes.json();
        setRestaurants(restaurantsData);

        // If editing, fetch guide details
        if (uri) {
          const guideRes = await fetch(`http://localhost:5000/guide-details?uri=${encodeURIComponent(uri)}`);
          if (!guideRes.ok) throw new Error('Failed to fetch guide');
          const data = await guideRes.json();
          setFormData({
            guideName: data['http://www.fairtravel.com/fairtravel#guideName'] || '',
            languageSpoken: data['http://www.fairtravel.com/fairtravel#languageSpoken'] || '',
            worksAt: data['http://www.fairtravel.com/fairtravel#worksAt'] || ''
          });
        }
      } catch (err) {
        setError(err.message);
      }
    };
    fetchData();
  }, [uri]);

  const validate = () => {
    if (!formData.guideName.trim()) return 'Name is required';
    if (!formData.languageSpoken.trim()) return 'Language is required';
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationError = validate();
    if (validationError) { setError(validationError); return; }
    setLoading(true);
    setError(null);
    try {
      const endpoint = uri ? 'update-guide' : 'add-guide';
      const method = uri ? 'PUT' : 'POST';
      
      // Prepare the data with proper types
      const submissionData = {
        ...formData,
        // Only include relationships if they are selected
        ...(formData.worksAt ? { worksAt: formData.worksAt } : {})
      };
      
      if (uri) {
        submissionData.uri = uri;
      }

      const response = await fetch(`http://localhost:5000/${endpoint}`, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submissionData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save guide');
      }
      
      navigate('/guides');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="container">
      <h2>{uri ? 'Edit Guide' : 'Add Guide'}</h2>
      {error && <div className="alert alert-danger">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label>Name</label>
          <input type="text" name="guideName" className="form-control" value={formData.guideName} onChange={handleChange} required />
        </div>
        <div className="mb-3">
          <label>Language Spoken</label>
          <input type="text" name="languageSpoken" className="form-control" value={formData.languageSpoken} onChange={handleChange} required />
        </div>
        <div className="mb-3">
          <label className="form-label">Works At</label>
          <select
            className="form-control"
            name="worksAt"
            value={formData.worksAt}
            onChange={handleChange}
          >
            <option value="">Select a restaurant...</option>
            {restaurants.map(restaurant => (
              <option key={restaurant} value={restaurant.split('#')[1]}>
                {restaurant.split('#')[1]}
              </option>
            ))}
          </select>
        </div>
        <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Saving...' : 'Save'}</button>
      </form>
    </div>
  );
}
export default GuideForm;
