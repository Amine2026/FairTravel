import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const TransportsList = () => {
  const [transports, setTransports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTransports = async () => {
      try {
        const response = await fetch('http://localhost:5000/transports');
        const data = await response.json();
        setTransports(data || []); // Ensure it's always an array
      } catch (error) {
        console.error('Error fetching transports:', error);
        setTransports([]); // Set empty array on error
      } finally {
        setLoading(false);
      }
    };

    fetchTransports();
  }, []);

  const extractTransportId = (uri) => {
    return uri.split('#')[1] || uri;
  };

  const containerStyle = {
    maxWidth: 1000,
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
    background: '#28a745',
    color: 'white',
    border: 'none',
    borderRadius: 4,
    cursor: 'pointer',
    textDecoration: 'none',
    display: 'inline-block'
  };

  const tableStyle = {
    width: '100%',
    borderCollapse: 'collapse'
  };

  const thStyle = {
    background: '#f8f9fa',
    padding: '1rem',
    textAlign: 'left',
    borderBottom: '1px solid #dee2e6',
    fontWeight: '600'
  };

  const tdStyle = {
    padding: '1rem',
    borderBottom: '1px solid #dee2e6'
  };

  const linkStyle = {
    color: '#1976d2',
    textDecoration: 'none',
    marginRight: '1rem'
  };

  if (loading) {
    return <div style={containerStyle}>Chargement des transports...</div>;
  }

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <h2>Liste des Transports</h2>
        <Link to="/transports/new" style={buttonStyle}>
          + Nouveau Transport
        </Link>
      </div>

      {!transports || transports.length === 0 ? (
        <p>Aucun transport trouvé.</p>
      ) : (
        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={thStyle}>ID</th>
              <th style={thStyle}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {transports.map((transportUri, index) => {
              const transportId = extractTransportId(transportUri);
              return (
                <tr key={index}>
                  <td style={tdStyle}>
                    <Link to={`/transports/${transportId}`} style={linkStyle}>
                      {transportId}
                    </Link>
                  </td>
                  <td style={tdStyle}>
                    <Link to={`/transports/${transportId}`} style={linkStyle}>
                      Voir
                    </Link>
                    <Link to={`/transports/${transportId}/edit`} style={linkStyle}>
                      Modifier
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default TransportsList;