import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';

const TransportDetail = () => {
  const { item_id } = useParams();
  const navigate = useNavigate();
  const [transport, setTransport] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTransport = async () => {
      try {
        const uri = `http://www.fairtravel.com/fairtravel#${item_id}`;
        const response = await fetch(`http://localhost:5000/transport-details?uri=${encodeURIComponent(uri)}`);
        const data = await response.json();
        setTransport(data);
      } catch (error) {
        console.error('Error fetching transport:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTransport();
  }, [item_id]);

  const getPropertyValue = (property) => {
    return transport[property] || 'Non spécifié';
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
    padding: '0.5rem 0'
  };

  const labelStyle = {
    fontWeight: 'bold',
    width: 150,
    color: '#555'
  };

  const valueStyle = {
    flex: 1
  };

  if (loading) {
    return <div style={containerStyle}>Chargement...</div>;
  }

  if (!transport) {
    return <div style={containerStyle}>Transport non trouvé</div>;
  }

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <h2>Détails du Transport</h2>
        <div>
          <Link 
            to={`/transports/${item_id}/edit`} 
            style={buttonStyle}
          >
            Modifier
          </Link>
          <button 
            onClick={() => navigate('/transports')} 
            style={{...buttonStyle, background: '#6c757d'}}
          >
            Retour
          </button>
        </div>
      </div>

      <div>
        <div style={detailRowStyle}>
          <div style={labelStyle}>ID:</div>
          <div style={valueStyle}>{item_id}</div>
        </div>

        <div style={detailRowStyle}>
          <div style={labelStyle}>Nom:</div>
          <div style={valueStyle}>{getPropertyValue('http://www.fairtravel.com/fairtravel#transportName')}</div>
        </div>

        <div style={detailRowStyle}>
          <div style={labelStyle}>Type:</div>
          <div style={valueStyle}>{getPropertyValue('http://www.fairtravel.com/fairtravel#transportType')}</div>
        </div>

        <div style={detailRowStyle}>
          <div style={labelStyle}>CO2 par km:</div>
          <div style={valueStyle}>{getPropertyValue('http://www.fairtravel.com/fairtravel#co2PerKm')}</div>
        </div>

        <div style={detailRowStyle}>
          <div style={labelStyle}>Capacité:</div>
          <div style={valueStyle}>{getPropertyValue('http://www.fairtravel.com/fairtravel#capacity')}</div>
        </div>

        <div style={detailRowStyle}>
          <div style={labelStyle}>Écologique:</div>
          <div style={valueStyle}>{getPropertyValue('http://www.fairtravel.com/fairtravel#isEcoFriendly')}</div>
        </div>

        <div style={detailRowStyle}>
          <div style={labelStyle}>Type de carburant:</div>
          <div style={valueStyle}>{getPropertyValue('http://www.fairtravel.com/fairtravel#fuelType')}</div>
        </div>

        <div style={detailRowStyle}>
          <div style={labelStyle}>Vitesse moyenne:</div>
          <div style={valueStyle}>{getPropertyValue('http://www.fairtravel.com/fairtravel#averageSpeed')}</div>
        </div>

        <div style={detailRowStyle}>
          <div style={labelStyle}>Description:</div>
          <div style={valueStyle}>{getPropertyValue('http://www.fairtravel.com/fairtravel#description')}</div>
        </div>
      </div>
    </div>
  );
};

export default TransportDetail;