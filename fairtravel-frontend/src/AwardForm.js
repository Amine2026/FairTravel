import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import './FormStyles.css';

function AwardForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = id && id !== 'new';

  const [formData, setFormData] = useState({
    id: '',
    awardName: '',
    awardCategory: '',
    awardDate: new Date().toISOString().split('T')[0],
    awardDescription: '',
    awardLevel: '',
    issuingOrganization: '',
    awardedTo: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const awardCategories = [
    'Eco-Certification',
    'Sustainability Excellence',
    'Green Tourism',
    'Environmental Leadership',
    'Carbon Neutral'
  ];

  const awardLevels = [
    'Bronze',
    'Silver',
    'Gold',
    'Platinum',
    'Diamond'
  ];

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
            awardCategory: data['http://www.fairtravel.com/fairtravel#awardCategory'] || '',
            awardDate: data['http://www.fairtravel.com/fairtravel#awardDate'] || new Date().toISOString().split('T')[0],
            awardDescription: data['http://www.fairtravel.com/fairtravel#awardDescription'] || '',
            awardLevel: data['http://www.fairtravel.com/fairtravel#awardLevel'] || '',
            issuingOrganization: data['http://www.fairtravel.com/fairtravel#issuingOrganization'] || '',
            awardedTo: data['http://www.fairtravel.com/fairtravel#awardedTo']?.split('#')[1] || ''
          });
        })
        .catch(error => {
          console.error('Error:', error);
          setError('Erreur lors du chargement du prix');
        });
    }
  }, [id, isEdit]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const properties = {
      awardName: formData.awardName,
      awardCategory: formData.awardCategory,
      awardDate: formData.awardDate,
      awardDescription: formData.awardDescription,
      awardLevel: formData.awardLevel,
      issuingOrganization: formData.issuingOrganization,
      awardedTo: formData.awardedTo
    };

    try {
      let response;
      if (isEdit) {
        response = await fetch(`http://localhost:5000/awards/${formData.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ properties })
        });
      } else {
        const awardId = `Award_${formData.awardCategory.replace(/\s+/g, '_')}_${Date.now()}`;
        response = await fetch('http://localhost:5000/awards', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: awardId,
            type: 'Award',
            properties
          })
        });
      }

      if (response.ok) {
        navigate('/awards');
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Erreur lors de la sauvegarde');
      }
    } catch (error) {
      console.error('Error:', error);
      setError('Erreur de connexion au serveur');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-container">
      <div className="form-header">
        <h2>{isEdit ? 'Modifier le Prix' : 'Nouveau Prix'}</h2>
        <p className="form-subtitle">Certification de durabilité</p>
      </div>

      {error && (
        <div className="alert alert-error">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="modern-form">
        <div className="form-grid">
          <div className="form-group full-width">
            <label>
              Nom du prix <span className="required">*</span>
            </label>
            <input
              type="text"
              name="awardName"
              value={formData.awardName}
              onChange={handleChange}
              placeholder="Ex: Carbon Neutral Certification"
              required
            />
          </div>

          <div className="form-group">
            <label>
              Catégorie <span className="required">*</span>
            </label>
            <select
              name="awardCategory"
              value={formData.awardCategory}
              onChange={handleChange}
              required
            >
              <option value="">Sélectionnez une catégorie</option>
              {awardCategories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>
              Niveau <span className="required">*</span>
            </label>
            <select
              name="awardLevel"
              value={formData.awardLevel}
              onChange={handleChange}
              required
            >
              <option value="">Sélectionnez un niveau</option>
              {awardLevels.map(level => (
                <option key={level} value={level}>{level}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>
              Organisation émettrice <span className="required">*</span>
            </label>
            <input
              type="text"
              name="issuingOrganization"
              value={formData.issuingOrganization}
              onChange={handleChange}
              placeholder="Ex: Green Globe Certification"
              required
            />
          </div>

          <div className="form-group">
            <label>
              Date d'attribution <span className="required">*</span>
            </label>
            <input
              type="date"
              name="awardDate"
              value={formData.awardDate}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group full-width">
            <label>
              Entité récompensée <span className="required">*</span>
            </label>
            <input
              type="text"
              name="awardedTo"
              value={formData.awardedTo}
              onChange={handleChange}
              placeholder="Ex: EcoHotel_Verde_001"
              required
            />
            <small>L'hôtel, activité ou service qui reçoit ce prix</small>
          </div>

          <div className="form-group full-width">
            <label>
              Description <span className="required">*</span>
            </label>
            <textarea
              name="awardDescription"
              value={formData.awardDescription}
              onChange={handleChange}
              rows={4}
              placeholder="Décrivez les critères et réalisations..."
              required
            />
          </div>
        </div>

        <div className="form-actions">
          <button
            type="button"
            onClick={() => navigate('/awards')}
            className="btn btn-secondary"
            disabled={loading}
          >
            Annuler
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner"></span>
                Sauvegarde...
              </>
            ) : (
              isEdit ? 'Modifier' : 'Créer le prix'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

export default AwardForm;
