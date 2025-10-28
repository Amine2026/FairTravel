import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const CarbonFootprintsList = () => {
  const [carbonFootprints, setCarbonFootprints] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCarbonFootprints = async () => {
      try {
        const response = await fetch('http://localhost:5000/carbonfootprints');
        const data = await response.json();
        setCarbonFootprints(data || []);
      } catch (error) {
        console.error('Error fetching carbon footprints:', error);
        setCarbonFootprints([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCarbonFootprints();
  }, []);

  const extractCarbonFootprintId = (uri) => {
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
    return <div style={containerStyle}>Chargement des empreintes carbone...</div>;
  }

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <h2>Liste des Empreintes Carbone</h2>
        <Link to="/carbon-footprints/new" style={buttonStyle}>
          + Nouvelle Empreinte
        </Link>
      </div>

      {!carbonFootprints || carbonFootprints.length === 0 ? (
        <p>Aucune empreinte carbone trouvée.</p>
      ) : (
        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={thStyle}>ID</th>
              <th style={thStyle}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {carbonFootprints.map((footprintUri, index) => {
              const footprintId = extractCarbonFootprintId(footprintUri);
              return (
                <tr key={index}>
                  <td style={tdStyle}>
                    <Link to={`/carbon-footprints/${footprintId}`} style={linkStyle}>
                      {footprintId}
                    </Link>
                  </td>
                  <td style={tdStyle}>
                    <Link to={`/carbon-footprints/${footprintId}`} style={linkStyle}>
                      Voir
                    </Link>
                    <Link to={`/carbon-footprints/${footprintId}/edit`} style={linkStyle}>
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

export default CarbonFootprintsList;