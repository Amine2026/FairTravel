import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

function ServiceForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = id && id !== 'new';

  const [formData, setFormData] = useState({
    id: '',
    type: 'Service',
    serviceName: '',
    serviceType: '',
    operatingHours: '',
    contactInfo: '',
    priceRange: '',
    sustainabilityScore: '',
    locallyOwned: false,
    useLocalProducts: false,
    locatedIn: ''
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isEdit) {
      const uri = decodeURIComponent(id);
      fetch(`http://localhost:5000/service-details?uri=${encodeURIComponent(uri)}`)
        .then(response => response.json())
        .then(data => {
          const extractedId = uri.split('#')[1];
          setFormData({
            id: extractedId,
            type: data['http://www.w3.org/1999/02/22-rdf-syntax-ns#type']?.split('#')[1] || 'Service',
            serviceName: data['http://www.fairtravel.com/fairtravel#serviceName'] || '',
            serviceType: data['http://www.fairtravel.com/fairtravel#serviceType'] || '',
            operatingHours: data['http://www.fairtravel.com/fairtravel#operatingHours'] || '',
            contactInfo: data['http://www.fairtravel.com/fairtravel#contactInfo'] || '',
            priceRange: data['http://www.fairtravel.com/fairtravel#priceRange'] || '',
            sustainabilityScore: data['http://www.fairtravel.com/fairtravel#sustainabilityScore'] || '',
            locallyOwned: data['http://www.fairtravel.com/fairtravel#locallyOwned'] === 'true',
            useLocalProducts: data['http://www.fairtravel.com/fairtravel#useLocalProducts'] === 'true',
            locatedIn: data['http://www.fairtravel.com/fairtravel#locatedIn']?.split('#')[1] || ''
          });
        })
        .catch(error => console.error('Error:', error));
    }
  }, [id, isEdit]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const properties = {
      serviceName: formData.serviceName,
      serviceType: formData.serviceType,
      operatingHours: formData.operatingHours,
      contactInfo: formData.contactInfo,
      priceRange: formData.priceRange,
      sustainabilityScore: parseInt(formData.sustainabilityScore) || 0,
      locallyOwned: formData.locallyOwned,
      useLocalProducts: formData.useLocalProducts
    };

    if (formData.locatedIn) {
      properties.locatedIn = formData.locatedIn;
    }

    try {
      let response;
      if (isEdit) {
        response = await fetch(`http://localhost:5000/services/${formData.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ properties })
        });
      } else {
        response = await fetch('http://localhost:5000/services', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: formData.id,
            type: formData.type,
            properties
          })
        });
      }

      if (response.ok) {
        alert(isEdit ? 'Service modifié avec succès' : 'Service créé avec succès');
        navigate('/services');
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
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  return (
    <div style={{maxWidth:600, margin:'2rem auto', padding:'1.5rem', background:'white', borderRadius:8, boxShadow:'0 2px 8px #ddd'}}>
      <h2>{isEdit ? 'Modifier le Service' : 'Nouveau Service'}</h2>
      
      <form onSubmit={handleSubmit}>
        <div style={{marginBottom:'1rem'}}>
          <label style={{display:'block', marginBottom:'0.25rem', fontWeight:'bold'}}>
            ID du Service *
          </label>
          <input
            type="text"
            name="id"
            value={formData.id}
            onChange={handleChange}
            required
            disabled={isEdit}
            placeholder="ex: EcoTourismCenter_Sousse"
            style={{width:'100%', padding:'0.5rem', borderRadius:4, border:'1px solid #ccc'}}
          />
        </div>

        <div style={{marginBottom:'1rem'}}>
          <label style={{display:'block', marginBottom:'0.25rem', fontWeight:'bold'}}>
            Type de Service *
          </label>
          <select
            name="type"
            value={formData.type}
            onChange={handleChange}
            required
            style={{width:'100%', padding:'0.5rem', borderRadius:4, border:'1px solid #ccc'}}
          >
            <option value="Service">Service</option>
            <option value="InformationCenter">Information Center</option>
            <option value="LocalShop">Local Shop</option>
          </select>
        </div>

        <div style={{marginBottom:'1rem'}}>
          <label style={{display:'block', marginBottom:'0.25rem', fontWeight:'bold'}}>
            Nom du Service *
          </label>
          <input
            type="text"
            name="serviceName"
            value={formData.serviceName}
            onChange={handleChange}
            required
            placeholder="ex: Centre d'Information Écotourisme"
            style={{width:'100%', padding:'0.5rem', borderRadius:4, border:'1px solid #ccc'}}
          />
        </div>

        <div style={{marginBottom:'1rem'}}>
          <label style={{display:'block', marginBottom:'0.25rem', fontWeight:'bold'}}>
            Type de Service
          </label>
          <input
            type="text"
            name="serviceType"
            value={formData.serviceType}
            onChange={handleChange}
            placeholder="ex: Information, Shopping, etc."
            style={{width:'100%', padding:'0.5rem', borderRadius:4, border:'1px solid #ccc'}}
          />
        </div>

        <div style={{marginBottom:'1rem'}}>
          <label style={{display:'block', marginBottom:'0.25rem', fontWeight:'bold'}}>
            Horaires d'Ouverture
          </label>
          <input
            type="text"
            name="operatingHours"
            value={formData.operatingHours}
            onChange={handleChange}
            placeholder="ex: 08:00-18:00"
            style={{width:'100%', padding:'0.5rem', borderRadius:4, border:'1px solid #ccc'}}
          />
        </div>

        <div style={{marginBottom:'1rem'}}>
          <label style={{display:'block', marginBottom:'0.25rem', fontWeight:'bold'}}>
            Contact
          </label>
          <input
            type="text"
            name="contactInfo"
            value={formData.contactInfo}
            onChange={handleChange}
            placeholder="ex: contact@example.com"
            style={{width:'100%', padding:'0.5rem', borderRadius:4, border:'1px solid #ccc'}}
          />
        </div>

        <div style={{marginBottom:'1rem'}}>
          <label style={{display:'block', marginBottom:'0.25rem', fontWeight:'bold'}}>
            Fourchette de Prix
          </label>
          <input
            type="text"
            name="priceRange"
            value={formData.priceRange}
            onChange={handleChange}
            placeholder="ex: €-€€"
            style={{width:'100%', padding:'0.5rem', borderRadius:4, border:'1px solid #ccc'}}
          />
        </div>

        <div style={{marginBottom:'1rem'}}>
          <label style={{display:'block', marginBottom:'0.25rem', fontWeight:'bold'}}>
            Score de Durabilité (0-100)
          </label>
          <input
            type="number"
            name="sustainabilityScore"
            value={formData.sustainabilityScore}
            onChange={handleChange}
            min="0"
            max="100"
            placeholder="ex: 95"
            style={{width:'100%', padding:'0.5rem', borderRadius:4, border:'1px solid #ccc'}}
          />
        </div>

        <div style={{marginBottom:'1rem'}}>
          <label style={{display:'block', marginBottom:'0.25rem', fontWeight:'bold'}}>
            Localisation
          </label>
          <input
            type="text"
            name="locatedIn"
            value={formData.locatedIn}
            onChange={handleChange}
            placeholder="ex: AlpinePark"
            style={{width:'100%', padding:'0.5rem', borderRadius:4, border:'1px solid #ccc'}}
          />
        </div>

        <div style={{marginBottom:'1rem'}}>
          <label style={{display:'flex', alignItems:'center', gap:'0.5rem'}}>
            <input
              type="checkbox"
              name="locallyOwned"
              checked={formData.locallyOwned}
              onChange={handleChange}
            />
            <span>Propriété locale</span>
          </label>
        </div>

        <div style={{marginBottom:'1rem'}}>
          <label style={{display:'flex', alignItems:'center', gap:'0.5rem'}}>
            <input
              type="checkbox"
              name="useLocalProducts"
              checked={formData.useLocalProducts}
              onChange={handleChange}
            />
            <span>Utilise des produits locaux</span>
          </label>
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
            onClick={() => navigate('/services')}
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

export default ServiceForm;
