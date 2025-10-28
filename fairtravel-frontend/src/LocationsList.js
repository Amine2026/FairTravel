import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

function LocationsList() {
  const [locations, setLocations] = useState([]);
  const [search, setSearch] = useState("");
  const [detailsMap, setDetailsMap] = useState({});
  const [loading, setLoading] = useState(true);

  const fetchLocations = () => {
    setLoading(true);
    fetch('http://localhost:5000/locations')
      .then(response => response.json())
      .then(data => {
        setLocations(data);
        // Fetch details for each location
        data.forEach(uri => {
          fetch(`http://localhost:5000/location-details?uri=${encodeURIComponent(uri)}`)
            .then(response => response.json())
            .then(details => {
              setDetailsMap(prev => ({ ...prev, [uri]: details }));
            });
        });
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching locations:', error);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchLocations();
  }, []);

  const filteredLocations = locations.filter(location => {
    return location.toLowerCase().includes(search.toLowerCase());
  });

  const handleDelete = async (locationId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette location ?')) {
      return;
    }

    const id = locationId.split('#')[1];
    try {
      const response = await fetch(`http://localhost:5000/locations/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        alert('Location supprimée avec succès');
        fetchLocations();
      } else {
        alert('Erreur lors de la suppression');
      }
    } catch (error) {
      console.error('Error deleting location:', error);
      alert('Erreur lors de la suppression');
    }
  };

  const extractId = (uri) => uri.split('#')[1] || uri;

  return (
    <div style={{maxWidth:800, margin:'2rem auto', padding:'1rem', background:'#f9f9f9', borderRadius:8, boxShadow:'0 2px 8px #ddd'}}>
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom:'1rem'}}>
        <h2>Locations</h2>
        <Link 
          to="/locations/new" 
          style={{
            padding: '0.5rem 1rem',
            background: '#1976d2',
            color: 'white',
            textDecoration: 'none',
            borderRadius: 4,
            fontWeight: 'bold'
          }}
        >
          + Ajouter Location
        </Link>
      </div>

      <input
        type="text"
        placeholder="Rechercher des locations..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        style={{width:'100%', padding:'0.5rem', marginBottom:'1rem', borderRadius:4, border:'1px solid #ccc'}}
      />

      {loading ? (
        <p>Chargement...</p>
      ) : (
        <ul style={{listStyle:'none', padding:0}}>
          {filteredLocations.map((location, idx) => {
            const details = detailsMap[location] || {};
            const locationName = details['http://www.fairtravel.com/fairtravel#name'] || extractId(location);
            const address = details['http://www.fairtravel.com/fairtravel#address'] || 'N/A';
            const country = details['http://www.fairtravel.com/fairtravel#country'] || 'N/A';

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
                    to={`/locations/${encodeURIComponent(location)}`}
                    style={{color:'#1976d2', fontWeight:'bold', textDecoration:'none', fontSize:'1.1rem'}}
                  >
                    {locationName}
                  </Link>
                  <div style={{fontSize:'0.9rem', color:'#666', marginTop: '0.25rem'}}>
                    Adresse: {address} | Pays: {country}
                  </div>
                </div>
                <div style={{display: 'flex', gap: '0.5rem'}}>
                  <Link
                    to={`/locations/${encodeURIComponent(location)}/edit`}
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
                    onClick={() => handleDelete(location)}
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

      {!loading && filteredLocations.length === 0 && (
        <p style={{textAlign: 'center', color: '#666'}}>Aucune location trouvée</p>
      )}
    </div>
  );
}

export default LocationsList;