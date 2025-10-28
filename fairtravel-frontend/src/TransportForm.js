import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const TransportForm = () => {
  const navigate = useNavigate();
  const { item_id } = useParams();
  const isEditMode = !!item_id;

  const [formData, setFormData] = useState({
    transportType: '',
    transportName: '',
    co2PerKm: '',
    capacity: '',
    isEcoFriendly: false,
    fuelType: '',
    averageSpeed: '',
    description: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isEditMode && item_id) {
      setLoading(true);
      const uri = `http://www.fairtravel.com/fairtravel#${item_id}`;
      
      fetch(`http://localhost:5000/transport-details?uri=${encodeURIComponent(uri)}`)
        .then(response => response.json())
        .then(data => {
          setFormData({
            transportType: data['http://www.fairtravel.com/fairtravel#transportType'] || '',
            transportName: data['http://www.fairtravel.com/fairtravel#transportName'] || '',
            co2PerKm: data['http://www.fairtravel.com/fairtravel#co2PerKm'] || '',
            capacity: data['http://www.fairtravel.com/fairtravel#capacity'] || '',
            isEcoFriendly: data['http://www.fairtravel.com/fairtravel#isEcoFriendly'] === 'true' || false,
            fuelType: data['http://www.fairtravel.com/fairtravel#fuelType'] || '',
            averageSpeed: data['http://www.fairtravel.com/fairtravel#averageSpeed'] || '',
            description: data['http://www.fairtravel.com/fairtravel#description'] || ''
          });
          setLoading(false);
        })
        .catch(error => {
          console.error('Error fetching transport:', error);
          setError('Erreur lors du chargement des données');
          setLoading(false);
        });
    }
  }, [isEditMode, item_id]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const generateTransportId = () => {
    const namePart = formData.transportName
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '_')
      .substring(0, 20);
    const timestamp = Date.now().toString().slice(-6);
    return `transport_${namePart}_${timestamp}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validate required fields
    if (!formData.transportName.trim()) {
      setError('Le nom du transport est obligatoire');
      setLoading(false);
      return;
    }

    try {
      const transportId = isEditMode ? item_id : generateTransportId();

      const payload = {
        id: transportId,
        properties: {
          transportType: formData.transportType,
          transportName: formData.transportName,
          co2PerKm: formData.co2PerKm ? parseFloat(formData.co2PerKm) : undefined,
          capacity: formData.capacity ? parseInt(formData.capacity) : undefined,
          isEcoFriendly: formData.isEcoFriendly,
          fuelType: formData.fuelType,
          averageSpeed: formData.averageSpeed ? parseFloat(formData.averageSpeed) : undefined,
          description: formData.description
        }
      };

      // Remove undefined values
      Object.keys(payload.properties).forEach(key => 
        payload.properties[key] === undefined && delete payload.properties[key]
      );

      let response;
      if (isEditMode) {
        const transportIdOnly = item_id.includes('#') ? item_id.split('#')[1] : item_id;
        response = await fetch(`http://localhost:5000/transports/${encodeURIComponent(transportIdOnly)}`, {
          method: 'PUT',
          headers: { 
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload)
        });
      } else {
        response = await fetch('http://localhost:5000/transports', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload)
        });
      }

      if (response.ok) {
        alert(isEditMode ? 'Transport modifié avec succès' : 'Transport créé avec succès');
        navigate('/transports');
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

  const checkboxStyle = {
    marginRight: '0.5rem',
    transform: 'scale(1.2)'
  };

  if (loading && isEditMode) {
    return <div style={formStyle}>Chargement...</div>;
  }

  return (
    <div style={formStyle}>
      <h2>{isEditMode ? 'Modifier' : 'Ajouter'} un Transport</h2>
      
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
            <strong>ID du transport:</strong> {item_id}
          </div>
        )}

        <div>
          <label style={{display: 'block', marginBottom: '0.25rem', fontWeight: 'bold'}}>
            Nom du transport *
          </label>
          <input
            type="text"
            name="transportName"
            value={formData.transportName}
            onChange={handleChange}
            style={inputStyle}
            required
            disabled={loading}
            placeholder="ex: Bus électrique"
          />
        </div>

        <div>
          <label style={{display: 'block', marginBottom: '0.25rem', fontWeight: 'bold'}}>
            Type de transport
          </label>
          <input
            type="text"
            name="transportType"
            value={formData.transportType}
            onChange={handleChange}
            style={inputStyle}
            disabled={loading}
            placeholder="ex: Bus, Train, Avion, etc."
          />
        </div>

        <div style={{display: 'flex', gap: '1rem'}}>
          <div style={{flex: 1}}>
            <label style={{display: 'block', marginBottom: '0.25rem', fontWeight: 'bold'}}>
              CO2 par km (g)
            </label>
            <input
              type="number"
              step="any"
              name="co2PerKm"
              value={formData.co2PerKm}
              onChange={handleChange}
              style={inputStyle}
              disabled={loading}
              placeholder="ex: 120.5"
            />
          </div>

          <div style={{flex: 1}}>
            <label style={{display: 'block', marginBottom: '0.25rem', fontWeight: 'bold'}}>
              Capacité
            </label>
            <input
              type="number"
              name="capacity"
              value={formData.capacity}
              onChange={handleChange}
              style={inputStyle}
              disabled={loading}
              placeholder="ex: 50"
            />
          </div>
        </div>

        <div style={{display: 'flex', gap: '1rem'}}>
          <div style={{flex: 1}}>
            <label style={{display: 'block', marginBottom: '0.25rem', fontWeight: 'bold'}}>
              Type de carburant
            </label>
            <input
              type="text"
              name="fuelType"
              value={formData.fuelType}
              onChange={handleChange}
              style={inputStyle}
              disabled={loading}
              placeholder="ex: Électrique, Diesel, Essence"
            />
          </div>

          <div style={{flex: 1}}>
            <label style={{display: 'block', marginBottom: '0.25rem', fontWeight: 'bold'}}>
              Vitesse moyenne (km/h)
            </label>
            <input
              type="number"
              step="any"
              name="averageSpeed"
              value={formData.averageSpeed}
              onChange={handleChange}
              style={inputStyle}
              disabled={loading}
              placeholder="ex: 80"
            />
          </div>
        </div>

        <div style={{display: 'flex', alignItems: 'center', marginBottom: '1rem'}}>
          <input
            type="checkbox"
            name="isEcoFriendly"
            checked={formData.isEcoFriendly}
            onChange={handleChange}
            style={checkboxStyle}
            disabled={loading}
          />
          <label style={{fontWeight: 'bold'}}>
            Écologique
          </label>
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
            placeholder="Description du transport..."
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
            onClick={() => navigate('/transports')} 
            disabled={loading}
          >
            Annuler
          </button>
        </div>
      </form>
    </div>
  );
};

export default TransportForm;