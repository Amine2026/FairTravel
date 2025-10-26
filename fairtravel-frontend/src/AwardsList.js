import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

function AwardsList() {
  const [awards, setAwards] = useState([]);
  const [search, setSearch] = useState("");
  const [detailsMap, setDetailsMap] = useState({});
  const [loading, setLoading] = useState(true);

  const fetchAwards = () => {
    setLoading(true);
    fetch('http://localhost:5000/awards')
      .then(response => response.json())
      .then(data => {
        setAwards(data);
        // Fetch details for each award
        data.forEach(uri => {
          fetch(`http://localhost:5000/award-details?uri=${encodeURIComponent(uri)}`)
            .then(response => response.json())
            .then(details => {
              setDetailsMap(prev => ({ ...prev, [uri]: details }));
            });
        });
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching awards:', error);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchAwards();
  }, []);

  const filteredAwards = awards.filter(award => {
    return award.toLowerCase().includes(search.toLowerCase());
  });

  const handleDelete = async (awardId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce prix ?')) {
      return;
    }

    const id = awardId.split('#')[1];
    try {
      const response = await fetch(`http://localhost:5000/awards/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        alert('Prix supprimé avec succès');
        fetchAwards();
      } else {
        alert('Erreur lors de la suppression');
      }
    } catch (error) {
      console.error('Error deleting award:', error);
      alert('Erreur lors de la suppression');
    }
  };

  const extractId = (uri) => uri.split('#')[1] || uri;

  return (
    <div style={{maxWidth:800, margin:'2rem auto', padding:'1rem', background:'#f9f9f9', borderRadius:8, boxShadow:'0 2px 8px #ddd'}}>
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom:'1rem'}}>
        <h2>Prix et Certifications (Awards)</h2>
        <Link 
          to="/awards/new" 
          style={{
            padding: '0.5rem 1rem',
            background: '#1976d2',
            color: 'white',
            textDecoration: 'none',
            borderRadius: 4,
            fontWeight: 'bold'
          }}
        >
          + Ajouter Prix
        </Link>
      </div>

      <input
        type="text"
        placeholder="Rechercher des prix..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        style={{width:'100%', padding:'0.5rem', marginBottom:'1rem', borderRadius:4, border:'1px solid #ccc'}}
      />

      {loading ? (
        <p>Chargement...</p>
      ) : (
        <ul style={{listStyle:'none', padding:0}}>
          {filteredAwards.map((award, idx) => {
            const details = detailsMap[award] || {};
            const awardName = details['http://www.fairtravel.com/fairtravel#awardName'] || extractId(award);
            const awardType = details['http://www.fairtravel.com/fairtravel#awardType'] || 'N/A';
            const awardedBy = details['http://www.fairtravel.com/fairtravel#awardedBy'] || 'N/A';
            const dateAwarded = details['http://www.fairtravel.com/fairtravel#dateAwarded'] || '';
            const level = details['http://www.fairtravel.com/fairtravel#level'] || '';

            return (
              <li 
                key={idx} 
                style={{
                  marginBottom:'1rem',
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
                    to={`/awards/${encodeURIComponent(award)}`}
                    style={{color:'#1976d2', fontWeight:'bold', textDecoration:'none', fontSize:'1.1rem'}}
                  >
                    {awardName}
                  </Link>
                  <div style={{fontSize:'0.9rem', color:'#666', marginTop: '0.25rem'}}>
                    Type: {awardType} | Décerné par: {awardedBy}
                  </div>
                  {(level || dateAwarded) && (
                    <div style={{fontSize:'0.85rem', color:'#888', marginTop: '0.25rem'}}>
                      {level && `Niveau: ${level}`}
                      {level && dateAwarded && ' | '}
                      {dateAwarded && `Date: ${dateAwarded}`}
                    </div>
                  )}
                </div>
                <div style={{display: 'flex', gap: '0.5rem'}}>
                  <Link
                    to={`/awards/${encodeURIComponent(award)}/edit`}
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
                    onClick={() => handleDelete(award)}
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

      {!loading && filteredAwards.length === 0 && (
        <p style={{textAlign: 'center', color: '#666'}}>Aucun prix trouvé</p>
      )}
    </div>
  );
}

export default AwardsList;
