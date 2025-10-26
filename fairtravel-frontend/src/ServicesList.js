import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

function ServicesList() {
  const [services, setServices] = useState([]);
  const [search, setSearch] = useState("");
  const [detailsMap, setDetailsMap] = useState({});
  const [loading, setLoading] = useState(true);

  const fetchServices = () => {
    setLoading(true);
    fetch('http://localhost:5000/services')
      .then(response => response.json())
      .then(data => {
        setServices(data);
        // Fetch details for each service
        data.forEach(uri => {
          fetch(`http://localhost:5000/service-details?uri=${encodeURIComponent(uri)}`)
            .then(response => response.json())
            .then(details => {
              setDetailsMap(prev => ({ ...prev, [uri]: details }));
            });
        });
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching services:', error);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const filteredServices = services.filter(service => {
    return service.toLowerCase().includes(search.toLowerCase());
  });

  const handleDelete = async (serviceId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce service ?')) {
      return;
    }

    const id = serviceId.split('#')[1];
    try {
      const response = await fetch(`http://localhost:5000/services/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        alert('Service supprimé avec succès');
        fetchServices();
      } else {
        alert('Erreur lors de la suppression');
      }
    } catch (error) {
      console.error('Error deleting service:', error);
      alert('Erreur lors de la suppression');
    }
  };

  const extractId = (uri) => uri.split('#')[1] || uri;

  return (
    <div style={{maxWidth:800, margin:'2rem auto', padding:'1rem', background:'#f9f9f9', borderRadius:8, boxShadow:'0 2px 8px #ddd'}}>
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom:'1rem'}}>
        <h2>Services</h2>
        <Link 
          to="/services/new" 
          style={{
            padding: '0.5rem 1rem',
            background: '#1976d2',
            color: 'white',
            textDecoration: 'none',
            borderRadius: 4,
            fontWeight: 'bold'
          }}
        >
          + Ajouter Service
        </Link>
      </div>

      <input
        type="text"
        placeholder="Rechercher des services..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        style={{width:'100%', padding:'0.5rem', marginBottom:'1rem', borderRadius:4, border:'1px solid #ccc'}}
      />

      {loading ? (
        <p>Chargement...</p>
      ) : (
        <ul style={{listStyle:'none', padding:0}}>
          {filteredServices.map((service, idx) => {
            const details = detailsMap[service] || {};
            const serviceName = details['http://www.fairtravel.com/fairtravel#serviceName'] || extractId(service);
            const serviceType = details['http://www.fairtravel.com/fairtravel#serviceType'] || 'N/A';
            const sustainabilityScore = details['http://www.fairtravel.com/fairtravel#sustainabilityScore'] || 'N/A';

            return (
              <li 
                key={idx} 
                style={{
                  marginBottom:'0.75rem',
                  padding:'1rem',
                  background:'white',
                  borderRadius:6,
                  border:'1px solid #ddd',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <div style={{flex: 1}}>
                  <Link 
                    to={`/services/${encodeURIComponent(service)}`}
                    style={{color:'#1976d2', fontWeight:'bold', textDecoration:'none', fontSize:'1.1rem'}}
                  >
                    {serviceName}
                  </Link>
                  <div style={{fontSize:'0.9rem', color:'#666', marginTop: '0.25rem'}}>
                    Type: {serviceType} | Score durabilité: {sustainabilityScore}
                  </div>
                </div>
                <div style={{display: 'flex', gap: '0.5rem'}}>
                  <Link
                    to={`/services/${encodeURIComponent(service)}/edit`}
                    style={{
                      padding: '0.4rem 0.8rem',
                      background: '#ff9800',
                      color: 'white',
                      textDecoration: 'none',
                      borderRadius: 4,
                      fontSize: '0.9rem'
                    }}
                  >
                    Modifier
                  </Link>
                  <button
                    onClick={() => handleDelete(service)}
                    style={{
                      padding: '0.4rem 0.8rem',
                      background: '#f44336',
                      color: 'white',
                      border: 'none',
                      borderRadius: 4,
                      cursor: 'pointer',
                      fontSize: '0.9rem'
                    }}
                  >
                    Supprimer
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {!loading && filteredServices.length === 0 && (
        <p style={{textAlign: 'center', color: '#666'}}>Aucun service trouvé</p>
      )}
    </div>
  );
}

export default ServicesList;
