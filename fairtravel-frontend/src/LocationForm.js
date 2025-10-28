import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const LocationForm = () => {
  const navigate = useNavigate();
  const { item_id } = useParams();
  const isEditMode = !!item_id;

  const [formData, setFormData] = useState({
    locationName: '',
    address: '',
    city: '',
    country: '',
    region: '',
    latitude: '',
    longitude: '',
    altitude: '',
    zipCode: '',
    description: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isEditMode && item_id) {
      setLoading(true);
      const uri = `http://www.fairtravel.com/fairtravel#${item_id}`;
      
      fetch(`http://localhost:5000/location-details?uri=${encodeURIComponent(uri)}`)
        .then(response => response.json())
        .then(data => {
          setFormData({
            locationName: data['http://www.fairtravel.com/fairtravel#locationName'] || '',
            address: data['http://www.fairtravel.com/fairtravel#address'] || '',
            city: data['http://www.fairtravel.com/fairtravel#city'] || '',
            country: data['http://www.fairtravel.com/fairtravel#country'] || '',
            region: data['http://www.fairtravel.com/fairtravel#region'] || '',
            latitude: data['http://www.fairtravel.com/fairtravel#latitude'] || '',
            longitude: data['http://www.fairtravel.com/fairtravel#longitude'] || '',
            altitude: data['http://www.fairtravel.com/fairtravel#altitude'] || '',
            zipCode: data['http://www.fairtravel.com/fairtravel#zipCode'] || '',
            description: data['http://www.fairtravel.com/fairtravel#description'] || ''
          });
          setLoading(false);
        })
        .catch(error => {
          console.error('Error fetching location:', error);
          setError('Erreur lors du chargement des données');
          setLoading(false);
        });
    }
  }, [isEditMode, item_id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const generateLocationId = () => {
    // Generate ID based on location name and timestamp for uniqueness
    const namePart = formData.locationName
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '_')
      .substring(0, 20);
    const timestamp = Date.now().toString().slice(-6);
    return `location_${namePart}_${timestamp}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validate required fields
    if (!formData.locationName.trim()) {
      setError('Le nom de la location est obligatoire');
      setLoading(false);
      return;
    }

    try {
      // Generate ID for new locations
      const locationId = isEditMode ? item_id : generateLocationId();

      const payload = {
        id: locationId,
        properties: {
          locationName: formData.locationName,
          address: formData.address,
          city: formData.city,
          country: formData.country,
          region: formData.region,
          latitude: formData.latitude ? parseFloat(formData.latitude) : undefined,
          longitude: formData.longitude ? parseFloat(formData.longitude) : undefined,
          altitude: formData.altitude ? parseFloat(formData.altitude) : undefined,
          zipCode: formData.zipCode,
          description: formData.description
        }
      };

      // Remove undefined values
      Object.keys(payload.properties).forEach(key => 
        payload.properties[key] === undefined && delete payload.properties[key]
      );

      let response;
      if (isEditMode) {
        // Use PUT for updates - only use the ID part after the #
        const locationIdOnly = item_id.includes('#') ? item_id.split('#')[1] : item_id;
        response = await fetch(`http://localhost:5000/locations/${encodeURIComponent(locationIdOnly)}`, {
          method: 'PUT',
          headers: { 
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload)
        });
      } else {
        // Use POST for new locations
        response = await fetch('http://localhost:5000/locations', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload)
        });
      }

      if (response.ok) {
        const result = await response.json();
        alert(isEditMode ? 'Location modifiée avec succès' : 'Location créée avec succès');
        navigate('/locations');
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Une erreur est survenue');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      setError('Erreur de connexion au serveur');
    } finally {
      setLoading(false);
    }
  };

  const formStyle = {
    maxWidth: 800,
    margin: '2rem auto',
    padding: '2rem',
    background: 'white',
    borderRadius: 8,
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
  };

  const inputStyle = {
    width: '100%',
    padding: '0.75rem',
    marginBottom: '1rem',
    border: '1px solid #ddd',
    borderRadius: 4,
    fontSize: '1rem'
  };

  const buttonStyle = {
    padding: '0.75rem 1.5rem',
    background: '#1976d2',
    color: 'white',
    border: 'none',
    borderRadius: 4,
    fontSize: '1rem',
    cursor: 'pointer',
    marginRight: '0.5rem'
  };

  if (loading && isEditMode) {
    return <div style={formStyle}>Chargement...</div>;
  }

  return (
    <div style={formStyle}>
      <h2>{isEditMode ? 'Modifier' : 'Ajouter'} une Location</h2>
      
      {error && (
        <div style={{
          padding: '1rem',
          marginBottom: '1rem',
          background: '#ffebee',
          color: '#c62828',
          borderRadius: 4
        }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {isEditMode && (
          <div style={{ marginBottom: '1rem', padding: '0.5rem', background: '#f8f9fa', borderRadius: 4 }}>
            <strong>ID de la location:</strong> {item_id}
          </div>
        )}

        <div>
          <label style={{display: 'block', marginBottom: '0.25rem', fontWeight: 'bold'}}>
            Nom de la location *
          </label>
          <input
            type="text"
            name="locationName"
            value={formData.locationName}
            onChange={handleChange}
            style={inputStyle}
            required
            disabled={loading}
            placeholder="ex: Hôtel de Paris"
          />
        </div>

        <div>
          <label style={{display: 'block', marginBottom: '0.25rem', fontWeight: 'bold'}}>
            Adresse
          </label>
          <input
            type="text"
            name="address"
            value={formData.address}
            onChange={handleChange}
            style={inputStyle}
            disabled={loading}
            placeholder="ex: 123 Rue Principale"
          />
        </div>

        <div style={{display: 'flex', gap: '1rem'}}>
          <div style={{flex: 1}}>
            <label style={{display: 'block', marginBottom: '0.25rem', fontWeight: 'bold'}}>
              Ville
            </label>
            <input
              type="text"
              name="city"
              value={formData.city}
              onChange={handleChange}
              style={inputStyle}
              disabled={loading}
              placeholder="ex: Paris"
            />
          </div>

          <div style={{flex: 1}}>
            <label style={{display: 'block', marginBottom: '0.25rem', fontWeight: 'bold'}}>
              Pays
            </label>
            <input
              type="text"
              name="country"
              value={formData.country}
              onChange={handleChange}
              style={inputStyle}
              disabled={loading}
              placeholder="ex: France"
            />
          </div>
        </div>

        <div>
          <label style={{display: 'block', marginBottom: '0.25rem', fontWeight: 'bold'}}>
            Région
          </label>
          <input
            type="text"
            name="region"
            value={formData.region}
            onChange={handleChange}
            style={inputStyle}
            disabled={loading}
            placeholder="ex: Île-de-France"
          />
        </div>

        <div style={{display: 'flex', gap: '1rem'}}>
          <div style={{flex: 1}}>
            <label style={{display: 'block', marginBottom: '0.25rem', fontWeight: 'bold'}}>
              Latitude
            </label>
            <input
              type="number"
              step="any"
              name="latitude"
              value={formData.latitude}
              onChange={handleChange}
              style={inputStyle}
              disabled={loading}
              placeholder="ex: 48.8566"
            />
          </div>

          <div style={{flex: 1}}>
            <label style={{display: 'block', marginBottom: '0.25rem', fontWeight: 'bold'}}>
              Longitude
            </label>
            <input
              type="number"
              step="any"
              name="longitude"
              value={formData.longitude}
              onChange={handleChange}
              style={inputStyle}
              disabled={loading}
              placeholder="ex: 2.3522"
            />
          </div>
        </div>

        <div style={{display: 'flex', gap: '1rem'}}>
          <div style={{flex: 1}}>
            <label style={{display: 'block', marginBottom: '0.25rem', fontWeight: 'bold'}}>
              Altitude
            </label>
            <input
              type="number"
              step="any"
              name="altitude"
              value={formData.altitude}
              onChange={handleChange}
              style={inputStyle}
              disabled={loading}
              placeholder="en mètres"
            />
          </div>

          <div style={{flex: 1}}>
            <label style={{display: 'block', marginBottom: '0.25rem', fontWeight: 'bold'}}>
              Code Postal
            </label>
            <input
              type="text"
              name="zipCode"
              value={formData.zipCode}
              onChange={handleChange}
              style={inputStyle}
              disabled={loading}
              placeholder="ex: 75001"
            />
          </div>
        </div>

        <div>
          <label style={{display: 'block', marginBottom: '0.25rem', fontWeight: 'bold'}}>
            Description
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            style={{...inputStyle, minHeight: '100px'}}
            disabled={loading}
            placeholder="Description de la location..."
          />
        </div>

        <div style={{display: 'flex', justifyContent: 'flex-end', marginTop: '1rem'}}>
          <button 
            type="submit" 
            style={buttonStyle} 
            disabled={loading}
          >
            {isEditMode ? 'Modifier' : 'Ajouter'}
          </button>
          <button 
            type="button" 
            style={{...buttonStyle, background: '#dc3545'}} 
            onClick={() => navigate('/locations')} 
            disabled={loading}
          >
            Annuler
          </button>
        </div>
      </form>
    </div>
  );
};

export default LocationForm;