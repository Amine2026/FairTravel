import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

function AwardForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = id && id !== 'new';

  const [formData, setFormData] = useState({
    id: '',
    awardName: '',
    awardType: '',
    awardedBy: '',
    dateAwarded: new Date().toISOString().split('T')[0],
    description: '',
    level: '',
    validUntil: '',
    receivedBy: ''
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isEdit) {
      const uri = decodeURIComponent(id);
      fetch(`http://localhost:5000/award-details?uri=${encodeURIComponent(uri)}`)
        .then(response => response.json())
        .then(data => {
          const extractedId = uri.split('#')[1];
          setFormData({
            id: extractedId,
            awardName: data['http://www.fairtravel.com/fairtravel#awardName'] || '',
            awardType: data['http://www.fairtravel.com/fairtravel#awardType'] || '',
            awardedBy: data['http://www.fairtravel.com/fairtravel#awardedBy'] || '',
            dateAwarded: data['http://www.fairtravel.com/fairtravel#dateAwarded'] || new Date().toISOString().split('T')[0],
            description: data['http://www.fairtravel.com/fairtravel#description'] || '',
            level: data['http://www.fairtravel.com/fairtravel#level'] || '',
            validUntil: data['http://www.fairtravel.com/fairtravel#validUntil'] || '',
            receivedBy: data['http://www.fairtravel.com/fairtravel#receivedBy']?.split('#')[1] || ''
          });
        })
        .catch(error => console.error('Error:', error));
    }
  }, [id, isEdit]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const properties = {
      awardName: formData.awardName,
      awardType: formData.awardType,
      awardedBy: formData.awardedBy,
      dateAwarded: formData.dateAwarded,
      description: formData.description,
      level: formData.level
    };

    if (formData.validUntil) properties.validUntil = formData.validUntil;
    if (formData.receivedBy) properties.receivedBy = formData.receivedBy;

    try {
      let response;
      if (isEdit) {
        response = await fetch(`http://localhost:5000/awards/${formData.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ properties })
        });
      } else {
        response = await fetch('http://localhost:5000/awards', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: formData.id,
            properties
          })
        });
      }

      if (response.ok) {
        alert(isEdit ? 'Prix modifié avec succès' : 'Prix créé avec succès');
        navigate('/awards');
      } else {
        const error = await response.json();
        alert('Erreur: ' + (error.error || 'Une erreur est survenue'));
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Erreur lors de la sauvegarde');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div style={{maxWidth:600, margin:'2rem auto', padding:'1.5rem', background:'white', borderRadius:8, boxShadow:'0 2px 8px #ddd'}}>
      <h2>{isEdit ? 'Modifier le Prix' : 'Nouveau Prix'}</h2>
      
      <form onSubmit={handleSubmit}>
        <div style={{marginBottom:'1rem'}}>
          <label style={{display:'block', marginBottom:'0.25rem', fontWeight:'bold'}}>
            ID du Prix *
          </label>
          <input
            type="text"
            name="id"
            value={formData.id}
            onChange={handleChange}
            required
            disabled={isEdit}
            placeholder="ex: GreenCertification_2025"
            style={{width:'100%', padding:'0.5rem', borderRadius:4, border:'1px solid #ccc'}}
          />
        </div>

        <div style={{marginBottom:'1rem'}}>
          <label style={{display:'block', marginBottom:'0.25rem', fontWeight:'bold'}}>
            Nom du Prix *
          </label>
          <input
            type="text"
            name="awardName"
            value={formData.awardName}
            onChange={handleChange}
            required
            placeholder="ex: Certification Écologique Or"
            style={{width:'100%', padding:'0.5rem', borderRadius:4, border:'1px solid #ccc'}}
          />
        </div>

        <div style={{marginBottom:'1rem'}}>
          <label style={{display:'block', marginBottom:'0.25rem', fontWeight:'bold'}}>
            Type de Prix *
          </label>
          <select
            name="awardType"
            value={formData.awardType}
            onChange={handleChange}
            required
            style={{width:'100%', padding:'0.5rem', borderRadius:4, border:'1px solid #ccc'}}
          >
            <option value="">-- Sélectionner --</option>
            <option value="Certification">Certification</option>
            <option value="Prize">Prize</option>
            <option value="Recognition">Recognition</option>
            <option value="Eco-Label">Eco-Label</option>
            <option value="Quality Award">Quality Award</option>
          </select>
        </div>

        <div style={{marginBottom:'1rem'}}>
          <label style={{display:'block', marginBottom:'0.25rem', fontWeight:'bold'}}>
            Décerné par *
          </label>
          <input
            type="text"
            name="awardedBy"
            value={formData.awardedBy}
            onChange={handleChange}
            required
            placeholder="ex: Commission Européenne du Tourisme"
            style={{width:'100%', padding:'0.5rem', borderRadius:4, border:'1px solid #ccc'}}
          />
        </div>

        <div style={{marginBottom:'1rem'}}>
          <label style={{display:'block', marginBottom:'0.25rem', fontWeight:'bold'}}>
            Date d'Attribution *
          </label>
          <input
            type="date"
            name="dateAwarded"
            value={formData.dateAwarded}
            onChange={handleChange}
            required
            style={{width:'100%', padding:'0.5rem', borderRadius:4, border:'1px solid #ccc'}}
          />
        </div>

        <div style={{marginBottom:'1rem'}}>
          <label style={{display:'block', marginBottom:'0.25rem', fontWeight:'bold'}}>
            Niveau
          </label>
          <select
            name="level"
            value={formData.level}
            onChange={handleChange}
            style={{width:'100%', padding:'0.5rem', borderRadius:4, border:'1px solid #ccc'}}
          >
            <option value="">-- Aucun --</option>
            <option value="Gold">Or</option>
            <option value="Silver">Argent</option>
            <option value="Bronze">Bronze</option>
            <option value="Platinum">Platine</option>
          </select>
        </div>

        <div style={{marginBottom:'1rem'}}>
          <label style={{display:'block', marginBottom:'0.25rem', fontWeight:'bold'}}>
            Description *
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
            rows={3}
            placeholder="Description du prix et critères d'attribution..."
            style={{width:'100%', padding:'0.5rem', borderRadius:4, border:'1px solid #ccc', fontFamily:'inherit'}}
          />
        </div>

        <div style={{marginBottom:'1rem'}}>
          <label style={{display:'block', marginBottom:'0.25rem', fontWeight:'bold'}}>
            Valide jusqu'au
          </label>
          <input
            type="date"
            name="validUntil"
            value={formData.validUntil}
            onChange={handleChange}
            style={{width:'100%', padding:'0.5rem', borderRadius:4, border:'1px solid #ccc'}}
          />
        </div>

        <div style={{marginBottom:'1rem'}}>
          <label style={{display:'block', marginBottom:'0.25rem', fontWeight:'bold'}}>
            Reçu par (Entity ID)
          </label>
          <input
            type="text"
            name="receivedBy"
            value={formData.receivedBy}
            onChange={handleChange}
            placeholder="ex: EcoHotel_Verde_001 ou MountainHiking"
            style={{width:'100%', padding:'0.5rem', borderRadius:4, border:'1px solid #ccc'}}
          />
          <small style={{color:'#666'}}>ID de l'activité, hébergement ou service qui a reçu ce prix</small>
        </div>

        <div style={{display:'flex', gap:'1rem', marginTop:'1.5rem'}}>
          <button
            type="submit"
            disabled={loading}
            style={{
              flex:1,
              padding:'0.75rem',
              background:'#1976d2',
              color:'white',
              border:'none',
              borderRadius:4,
              cursor: loading ? 'not-allowed' : 'pointer',
              fontWeight:'bold'
            }}
          >
            {loading ? 'Sauvegarde...' : (isEdit ? 'Modifier' : 'Créer')}
          </button>
          <button
            type="button"
            onClick={() => navigate('/awards')}
            style={{
              flex:1,
              padding:'0.75rem',
              background:'#666',
              color:'white',
              border:'none',
              borderRadius:4,
              cursor:'pointer'
            }}
          >
            Annuler
          </button>
        </div>
      </form>
    </div>
  );
}

export default AwardForm;
