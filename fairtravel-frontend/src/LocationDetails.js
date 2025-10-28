import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';

const LocationDetail = () => {
  const { locationUri } = useParams();
  const navigate = useNavigate();
  const [details, setDetails] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const decodedUri = decodeURIComponent(locationUri);
    
    fetch(`http://localhost:5000/location-details?uri=${encodeURIComponent(decodedUri)}`)
      .then(response => response.json())
      .then(data => {
        setDetails(data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching location details:', error);
        setError('Erreur lors du chargement des détails');
        setLoading(false);
      });
  }, [locationUri]);

  const handleDelete = async () => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette location ?')) {
      return;
    }

    const locationId = decodeURIComponent(locationUri).split('#')[1];
    
    try {
      const response = await fetch(`http://localhost:5000/locations/${locationId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        alert('Location supprimée avec succès');
        navigate('/locations');
      } else {
        alert('Erreur lors de la suppression');
      }
    } catch (error) {
      console.error('Error deleting location:', error);
      alert('Erreur lors de la suppression');
    }
  };

  const containerStyle = {
    maxWidth: 800,
    margin: '2rem auto',
    padding: '2rem',
    background: 'white',
    borderRadius: 8,
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
  };

  const propertyStyle = {
    marginBottom: '1rem',
    paddingBottom: '1rem',
    borderBottom: '1px solid #eee'
  };

  const labelStyle = {
    fontWeight: 'bold',
    color: '#555',
    marginBottom: '0.25rem'
  };

  const valueStyle = {
    fontSize: '1.1rem',
    color: '#333'
  };

  const buttonStyle = {
    padding: '0.75rem 1.5rem',
    marginRight: '0.5rem',
    border: 'none',
    borderRadius: 4,
    fontSize: '1rem',
    cursor: 'pointer',
    textDecoration: 'none',
    display: 'inline-block'
  };

  if (loading) {
    return <div style={containerStyle}>Chargement...</div>;
  }

  if (error) {
    return (
      <div style={containerStyle}>
        <p style={{color: '#c62828'}}>{error}</p>
        <Link to="/locations" style={{...buttonStyle, background: '#757575', color: 'white'}}>
          Retour
        </Link>
      </div>
    );
  }

  const name = details['http://www.fairtravel.com/fairtravel#name'] || 'N/A';
  const address = details['http://www.fairtravel.com/fairtravel#address'] || 'N/A';
  const country = details['http://www.fairtravel.com/fairtravel#country'] || 'N/A';
  const latitude = details['http://www.fairtravel.com/fairtravel#latitude'] || 'N/A';
  const longitude = details['http://www.fairtravel.com/fairtravel#longitude'] || 'N/A';
  const description = details['http://www.fairtravel.com/fairtravel#description'] || 'N/A';

  return (
    <div style={containerStyle}>
      <h2>{name}</h2>

      <div style={propertyStyle}>
        <div style={labelStyle}>Adresse</div>
        <div style={valueStyle}>{address}</div>
      </div>

      <div style={propertyStyle}>
        <div style={labelStyle}>Pays</div>
        <div style={valueStyle}>{country}</div>
      </div>

      <div style={propertyStyle}>
        <div style={labelStyle}>Coordonnées</div>
        <div style={valueStyle}>
          Latitude: {latitude}, Longitude: {longitude}
        </div>
      </div>

      <div style={propertyStyle}>
        <div style={labelStyle}>Description</div>
        <div style={valueStyle}>{description}</div>
      </div>

      <div style={{marginTop: '2rem', display: 'flex', gap: '0.5rem'}}>
        <Link
          to="/locations"
          style={{...buttonStyle, background: '#757575', color: 'white'}}
        >
          Retour
        </Link>
        <Link
          to={`/locations/${encodeURIComponent(locationUri)}/edit`}
          style={{...buttonStyle, background: '#ff9800', color: 'white'}}
        >
          Modifier
        </Link>
        <button
          onClick={handleDelete}
          style={{...buttonStyle, background: '#f44336', color: 'white'}}
        >
          Supprimer
        </button>
      </div>
    </div>
  );
};

export default LocationDetail;