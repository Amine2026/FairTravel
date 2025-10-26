import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

function AwardDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [details, setDetails] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const uri = decodeURIComponent(id);
    fetch(`http://localhost:5000/award-details?uri=${encodeURIComponent(uri)}`)
      .then(response => response.json())
      .then(data => {
        setDetails(data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching award details:', error);
        setLoading(false);
      });
  }, [id]);

  const handleDelete = async () => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce prix ?')) {
      return;
    }

    const uri = decodeURIComponent(id);
    const awardId = uri.split('#')[1];

    try {
      const response = await fetch(`http://localhost:5000/awards/${awardId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        alert('Prix supprimé avec succès');
        navigate('/awards');
      } else {
        alert('Erreur lors de la suppression');
      }
    } catch (error) {
      console.error('Error deleting award:', error);
      alert('Erreur lors de la suppression');
    }
  };

  if (loading) return <p style={{textAlign:'center', padding:'2rem'}}>Chargement...</p>;

  const cleanKey = (key) => key.split('#')[1] || key;

  return (
    <div style={{maxWidth:700, margin:'2rem auto', padding:'1.5rem', background:'white', borderRadius:8, boxShadow:'0 2px 8px #ddd'}}>
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom:'1.5rem'}}>
        <h2>Détails du Prix</h2>
        <div style={{display: 'flex', gap: '0.5rem'}}>
          <button
            onClick={() => navigate(`/awards/${encodeURIComponent(id)}/edit`)}
            style={{
              padding: '0.5rem 1rem',
              background: '#ff9800',
              color: 'white',
              border: 'none',
              borderRadius: 4,
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            Modifier
          </button>
          <button
            onClick={handleDelete}
            style={{
              padding: '0.5rem 1rem',
              background: '#f44336',
              color: 'white',
              border: 'none',
              borderRadius: 4,
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            Supprimer
          </button>
          <button
            onClick={() => navigate('/awards')}
            style={{
              padding: '0.5rem 1rem',
              background: '#666',
              color: 'white',
              border: 'none',
              borderRadius: 4,
              cursor: 'pointer'
            }}
          >
            Retour
          </button>
        </div>
      </div>

      <div style={{lineHeight:1.8}}>
        {Object.entries(details).map(([key, value], idx) => (
          <div key={idx} style={{marginBottom:'1rem', borderBottom:'1px solid #eee', paddingBottom:'0.5rem'}}>
            <strong style={{color:'#555', display:'block', marginBottom:'0.25rem'}}>{cleanKey(key)}:</strong>
            <span style={{color:'#333'}}>{value}</span>
          </div>
        ))}
      </div>

      {Object.keys(details).length === 0 && (
        <p style={{textAlign:'center', color:'#666'}}>Aucune information disponible</p>
      )}
    </div>
  );
}

export default AwardDetails;
