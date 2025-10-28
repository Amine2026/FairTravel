import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';

const CarbonFootprintDetails = () => { // Changed from CarbonFootprintDetail to CarbonFootprintDetails
  const { id } = useParams(); // Changed from item_id to id
  const navigate = useNavigate();
  const [carbonFootprint, setCarbonFootprint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCarbonFootprint = async () => {
      try {
        const uri = `http://www.fairtravel.com/fairtravel#${id}`;
        console.log('Fetching carbon footprint with URI:', uri);
        
        const response = await fetch(`http://localhost:5000/carbonfootprint-details?uri=${encodeURIComponent(uri)}`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Carbon footprint data received:', data);
        setCarbonFootprint(data);
      } catch (error) {
        console.error('Error fetching carbon footprint:', error);
        setError('Erreur lors du chargement des données');
      } finally {
        setLoading(false);
      }
    };

    fetchCarbonFootprint();
  }, [id]); // Changed from item_id to id

  const getPropertyValue = (property) => {
    if (!carbonFootprint) return 'Non spécifié';
    
    const value = carbonFootprint[property] || 'Non spécifié';
    
    console.log(`Property ${property}:`, value);
    return value;
  };

  const containerStyle = {
    maxWidth: 800,
    margin: '2rem auto',
    padding: '2rem',
    background: 'white',
    borderRadius: 8,
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
  };

  const headerStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '2rem',
    borderBottom: '1px solid #eee',
    paddingBottom: '1rem'
  };

  const buttonStyle = {
    padding: '0.5rem 1rem',
    background: '#1976d2',
    color: 'white',
    border: 'none',
    borderRadius: 4,
    cursor: 'pointer',
    textDecoration: 'none',
    display: 'inline-block',
    marginRight: '0.5rem'
  };

  const detailRowStyle = {
    display: 'flex',
    marginBottom: '1rem',
    padding: '0.5rem 0',
    borderBottom: '1px solid #f0f0f0'
  };

  const labelStyle = {
    fontWeight: 'bold',
    width: 200,
    color: '#555'
  };

  const valueStyle = {
    flex: 1
  };

  const errorStyle = {
    padding: '1rem',
    background: '#ffebee',
    color: '#c62828',
    borderRadius: 4,
    marginBottom: '1rem'
  };

  if (loading) {
    return <div style={containerStyle}>Chargement...</div>;
  }

  if (error) {
    return (
      <div style={containerStyle}>
        <div style={errorStyle}>{error}</div>
        <button 
          onClick={() => navigate('/carbon-footprints')} 
          style={buttonStyle}
        >
          Retour à la liste
        </button>
      </div>
    );
  }

  if (!carbonFootprint) {
    return (
      <div style={containerStyle}>
        <div style={errorStyle}>Empreinte carbone non trouvée</div>
        <button 
          onClick={() => navigate('/carbon-footprints')} 
          style={buttonStyle}
        >
          Retour à la liste
        </button>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <h2>Détails de l'Empreinte Carbone</h2>
        <div>
          <Link 
            to={`/carbon-footprints/${id}/edit`} 
            style={buttonStyle}
          >
            Modifier
          </Link>
          <button 
            onClick={() => navigate('/carbon-footprints')} 
            style={{...buttonStyle, background: '#6c757d'}}
          >
            Retour
          </button>
        </div>
      </div>

      <div>
        <div style={detailRowStyle}>
          <div style={labelStyle}>ID:</div>
          <div style={valueStyle}>{id}</div>
        </div>

        <div style={detailRowStyle}>
          <div style={labelStyle}>Émissions CO2:</div>
          <div style={valueStyle}>
            {getPropertyValue('http://www.fairtravel.com/fairtravel#carbonEmissions')}
          </div>
        </div>

        <div style={detailRowStyle}>
          <div style={labelStyle}>Méthode de calcul:</div>
          <div style={valueStyle}>
            {getPropertyValue('http://www.fairtravel.com/fairtravel#calculationMethod')}
          </div>
        </div>

        <div style={detailRowStyle}>
          <div style={labelStyle}>Source d'émission:</div>
          <div style={valueStyle}>
            {getPropertyValue('http://www.fairtravel.com/fairtravel#emissionSource')}
          </div>
        </div>

        <div style={detailRowStyle}>
          <div style={labelStyle}>Montant de compensation:</div>
          <div style={valueStyle}>
            {getPropertyValue('http://www.fairtravel.com/fairtravel#offsetAmount')}
          </div>
        </div>

        <div style={detailRowStyle}>
          <div style={labelStyle}>Unité de mesure:</div>
          <div style={valueStyle}>
            {getPropertyValue('http://www.fairtravel.com/fairtravel#measurementUnit')}
          </div>
        </div>

        <div style={detailRowStyle}>
          <div style={labelStyle}>Date de calcul:</div>
          <div style={valueStyle}>
            {getPropertyValue('http://www.fairtravel.com/fairtravel#calculationDate')}
          </div>
        </div>

        <div style={detailRowStyle}>
          <div style={labelStyle}>Description:</div>
          <div style={valueStyle}>
            {getPropertyValue('http://www.fairtravel.com/fairtravel#description')}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CarbonFootprintDetails;