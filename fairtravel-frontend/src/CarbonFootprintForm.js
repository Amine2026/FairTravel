import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const CarbonFootprintForm = () => {
  const navigate = useNavigate();
  const { id } = useParams(); // Changed from item_id to id
  const isEditMode = !!id;

  const [formData, setFormData] = useState({
    carbonEmissions: '',
    calculationMethod: '',
    emissionSource: '',
    offsetAmount: '',
    measurementUnit: '',
    calculationDate: '',
    description: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isEditMode && id) {
      setLoading(true);
      const uri = `http://www.fairtravel.com/fairtravel#${id}`;
      
      console.log('Fetching carbon footprint for edit:', uri);
      
      fetch(`http://localhost:5000/carbonfootprint-details?uri=${encodeURIComponent(uri)}`)
        .then(response => {
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          return response.json();
        })
        .then(data => {
          console.log('Carbon footprint data received:', data);
          
          // Extract values from the data object
          const carbonEmissions = data['http://www.fairtravel.com/fairtravel#carbonEmissions'] || '';
          const calculationMethod = data['http://www.fairtravel.com/fairtravel#calculationMethod'] || '';
          const emissionSource = data['http://www.fairtravel.com/fairtravel#emissionSource'] || '';
          const offsetAmount = data['http://www.fairtravel.com/fairtravel#offsetAmount'] || '';
          const measurementUnit = data['http://www.fairtravel.com/fairtravel#measurementUnit'] || '';
          const calculationDate = data['http://www.fairtravel.com/fairtravel#calculationDate'] || '';
          const description = data['http://www.fairtravel.com/fairtravel#description'] || '';

          setFormData({
            carbonEmissions,
            calculationMethod,
            emissionSource,
            offsetAmount,
            measurementUnit,
            calculationDate,
            description
          });
          setLoading(false);
        })
        .catch(error => {
          console.error('Error fetching carbon footprint:', error);
          setError('Erreur lors du chargement des données: ' + error.message);
          setLoading(false);
        });
    }
  }, [isEditMode, id]); // Changed from item_id to id

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const generateCarbonFootprintId = () => {
    const timestamp = Date.now().toString().slice(-6);
    return `carbon_${timestamp}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validate required fields
    if (!formData.carbonEmissions) {
      setError('Les émissions CO2 sont obligatoires');
      setLoading(false);
      return;
    }

    try {
      const footprintId = isEditMode ? id : generateCarbonFootprintId();

      const payload = {
        id: footprintId,
        properties: {
          carbonEmissions: formData.carbonEmissions ? parseFloat(formData.carbonEmissions) : undefined,
          calculationMethod: formData.calculationMethod || undefined,
          emissionSource: formData.emissionSource || undefined,
          offsetAmount: formData.offsetAmount ? parseFloat(formData.offsetAmount) : undefined,
          measurementUnit: formData.measurementUnit || undefined,
          calculationDate: formData.calculationDate || undefined,
          description: formData.description || undefined
        }
      };

      // Remove undefined values
      Object.keys(payload.properties).forEach(key => {
        if (payload.properties[key] === undefined || payload.properties[key] === '') {
          delete payload.properties[key];
        }
      });

      console.log('Submitting payload:', payload);

      let response;
      if (isEditMode) {
        const footprintIdOnly = id.includes('#') ? id.split('#')[1] : id; // Changed from item_id to id
        console.log('Updating carbon footprint with ID:', footprintIdOnly);
        
        response = await fetch(`http://localhost:5000/carbonfootprints/${encodeURIComponent(footprintIdOnly)}`, {
          method: 'PUT',
          headers: { 
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload)
        });
      } else {
        console.log('Creating new carbon footprint');
        response = await fetch('http://localhost:5000/carbonfootprints', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload)
        });
      }

      console.log('Response status:', response.status);

      if (response.ok) {
        const result = await response.json();
        console.log('Success:', result);
        alert(isEditMode ? 'Empreinte carbone modifiée avec succès' : 'Empreinte carbone créée avec succès');
        navigate('/carbon-footprints'); // Updated route
      } else {
        const errorText = await response.text();
        console.error('Server error:', errorText);
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch (e) {
          errorData = { error: errorText || 'Une erreur est survenue' };
        }
        setError(errorData.error || `Erreur ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      setError('Erreur de connexion au serveur: ' + error.message);
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

  const disabledButtonStyle = {
    ...buttonStyle,
    background: '#ccc',
    cursor: 'not-allowed'
  };

  if (loading && isEditMode) {
    return <div style={formStyle}>Chargement des données...</div>;
  }

  return (
    <div style={formStyle}>
      <h2>{isEditMode ? 'Modifier' : 'Ajouter'} une Empreinte Carbone</h2>
      
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
          <div style={{ 
            marginBottom: '1rem', 
            padding: '0.75rem', 
            background: '#f8f9fa', 
            borderRadius: 4,
            border: '1px solid #dee2e6'
          }}>
            <strong>ID de l'empreinte carbone:</strong> {id} {/* Changed from item_id to id */}
          </div>
        )}

        {/* ... rest of the form JSX remains the same ... */}
        <div style={{display: 'flex', gap: '1rem'}}>
          <div style={{flex: 1}}>
            <label style={{display: 'block', marginBottom: '0.25rem', fontWeight: 'bold'}}>
              Émissions CO2 *
            </label>
            <input
              type="number"
              step="any"
              name="carbonEmissions"
              value={formData.carbonEmissions}
              onChange={handleChange}
              style={inputStyle}
              required
              disabled={loading}
              placeholder="ex: 150.5"
            />
          </div>

          <div style={{flex: 1}}>
            <label style={{display: 'block', marginBottom: '0.25rem', fontWeight: 'bold'}}>
              Unité de mesure
            </label>
            <input
              type="text"
              name="measurementUnit"
              value={formData.measurementUnit}
              onChange={handleChange}
              style={inputStyle}
              disabled={loading}
              placeholder="ex: kg CO2e"
            />
          </div>
        </div>

        <div>
          <label style={{display: 'block', marginBottom: '0.25rem', fontWeight: 'bold'}}>
            Méthode de calcul
          </label>
          <input
            type="text"
            name="calculationMethod"
            value={formData.calculationMethod}
            onChange={handleChange}
            style={inputStyle}
            disabled={loading}
            placeholder="ex: Méthode standardisée"
          />
        </div>

        <div>
          <label style={{display: 'block', marginBottom: '0.25rem', fontWeight: 'bold'}}>
            Source d'émission
          </label>
          <input
            type="text"
            name="emissionSource"
            value={formData.emissionSource}
            onChange={handleChange}
            style={inputStyle}
            disabled={loading}
            placeholder="ex: Transport, Énergie, etc."
          />
        </div>

        <div style={{display: 'flex', gap: '1rem'}}>
          <div style={{flex: 1}}>
            <label style={{display: 'block', marginBottom: '0.25rem', fontWeight: 'bold'}}>
              Montant de compensation
            </label>
            <input
              type="number"
              step="any"
              name="offsetAmount"
              value={formData.offsetAmount}
              onChange={handleChange}
              style={inputStyle}
              disabled={loading}
              placeholder="ex: 50.0"
            />
          </div>

          <div style={{flex: 1}}>
            <label style={{display: 'block', marginBottom: '0.25rem', fontWeight: 'bold'}}>
              Date de calcul
            </label>
            <input
              type="date"
              name="calculationDate"
              value={formData.calculationDate}
              onChange={handleChange}
              style={inputStyle}
              disabled={loading}
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
            placeholder="Description de l'empreinte carbone..."
          />
        </div>

        <div style={{display: 'flex', justifyContent: 'flex-end', marginTop: '1rem'}}>
          <button 
            type="submit" 
            style={loading ? disabledButtonStyle : buttonStyle} 
            disabled={loading}
          >
            {loading ? 'Traitement...' : (isEditMode ? 'Modifier' : 'Ajouter')}
          </button>
          <button 
            type="button" 
            style={{...buttonStyle, background: '#dc3545'}} 
            onClick={() => navigate('/carbon-footprints')} 
            disabled={loading}
          >
            Annuler
          </button>
        </div>
      </form>
    </div>
  );
};

export default CarbonFootprintForm;