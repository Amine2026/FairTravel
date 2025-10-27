import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import './FormStyles.css';

function ReviewForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = id && id !== 'new';

  const [formData, setFormData] = useState({
    id: '',
    reviewTitle: '',
    reviewedBy: '',
    reviewText: '',
    reviewRating: 5,
    reviewDate: new Date().toISOString().split('T')[0],
    reviewsEntity: '',
    // Champs avancés
    reviewerType: '',
    overallRating: 5,
    sentiment: 'neutral',
    ecoFriendlyPractices: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [advancedMode, setAdvancedMode] = useState(false);
  useEffect(() => {
    if (isEdit) {
      const uri = decodeURIComponent(id);
      fetch(`http://localhost:5000/review-details?uri=${encodeURIComponent(uri)}`)
        .then(response => response.json())
        .then(data => {
          const extractedId = uri.split('#')[1];
          setFormData({
            id: extractedId,
            reviewTitle: data['http://www.fairtravel.com/fairtravel#reviewTitle'] || '',
            reviewedBy: data['http://www.fairtravel.com/fairtravel#reviewedBy']?.split('#')[1] || '',
            reviewText: data['http://www.fairtravel.com/fairtravel#reviewText'] || '',
            reviewRating: parseInt(data['http://www.fairtravel.com/fairtravel#reviewRating']) || 5,
            reviewDate: data['http://www.fairtravel.com/fairtravel#reviewDate'] || new Date().toISOString().split('T')[0],
            reviewsEntity: data['http://www.fairtravel.com/fairtravel#reviewsEntity']?.split('#')[1] || '',
            // Champs avancés
            reviewerType: data['http://www.fairtravel.com/fairtravel#reviewerType'] || '',
            overallRating: parseInt(data['http://www.fairtravel.com/fairtravel#overallRating']) || 5,
            sentiment: data['http://www.fairtravel.com/fairtravel#sentiment'] || 'neutral',
            ecoFriendlyPractices: data['http://www.fairtravel.com/fairtravel#ecoFriendlyPractices'] || ''
          });
        })
        .catch(error => {
          console.error('Error:', error);
          setError('Erreur lors du chargement de l\'avis');
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
      reviewTitle: formData.reviewTitle,
      reviewedBy: formData.reviewedBy,
      reviewText: formData.reviewText,
      reviewRating: parseInt(formData.reviewRating),
      reviewDate: formData.reviewDate,
      reviewsEntity: formData.reviewsEntity
    };

    // Ajouter les champs avancés s'ils sont remplis
    if (formData.reviewerType) properties.reviewerType = formData.reviewerType;
    if (formData.overallRating) properties.overallRating = parseInt(formData.overallRating);
    if (formData.sentiment) properties.sentiment = formData.sentiment;
    if (formData.ecoFriendlyPractices) properties.ecoFriendlyPractices = formData.ecoFriendlyPractices;

    try {
      let response;
      if (isEdit) {
        response = await fetch(`http://localhost:5000/reviews/${formData.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ properties })
        });
      } else {
        const reviewId = `Review_${formData.reviewTitle.replace(/\s+/g, '_')}_${Date.now()}`;
        response = await fetch('http://localhost:5000/reviews', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: reviewId,
            type: 'Review',
            properties
          })
        });
      }

      if (response.ok) {
        navigate('/reviews');
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
        <h2>{isEdit ? 'Modifier l\'Avis' : 'Nouvel Avis'}</h2>
        <p className="form-subtitle">Partagez votre expérience</p>
      </div>

      {error && (
        <div className="alert alert-error">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="modern-form">
        <div className="advanced-mode-toggle">
          <button
            type="button"
            onClick={() => setAdvancedMode(!advancedMode)}
            className="btn-toggle"
          >
            {advancedMode ? '📝 Mode Simple' : '⚙️ Mode Avancé'}
          </button>
        </div>

        <div className="form-grid">
          <div className="form-group full-width">
            <label>
              Titre de l'avis <span className="required">*</span>
            </label>
            <input
              type="text"
              name="reviewTitle"
              value={formData.reviewTitle}
              onChange={handleChange}
              placeholder="Un titre accrocheur pour votre avis"
              required
            />
          </div>

          <div className="form-group">
            <label>
              Auteur <span className="required">*</span>
            </label>
            <input
              type="text"
              name="reviewedBy"
              value={formData.reviewedBy}
              onChange={handleChange}
              placeholder="Votre nom ou ID"
              required
            />
          </div>

          <div className="form-group">
            <label>
              Entité évaluée <span className="required">*</span>
            </label>
            <input
              type="text"
              name="reviewsEntity"
              value={formData.reviewsEntity}
              onChange={handleChange}
              placeholder="Ex: EcoHotel_Verde_001"
              required
            />
            <small>L'hôtel, activité ou service que vous évaluez</small>
          </div>

          <div className="form-group">
            <label>
              Note <span className="required">*</span>
            </label>
            <div className="rating-input">
              <input
                type="range"
                name="reviewRating"
                value={formData.reviewRating}
                onChange={handleChange}
                min="1"
                max="5"
                step="1"
                required
              />
              <div className="rating-display">
                <span className="rating-value">{formData.reviewRating}</span>
                <span className="rating-stars">
                  {'★'.repeat(formData.reviewRating)}{'☆'.repeat(5 - formData.reviewRating)}
                </span>
              </div>
            </div>
          </div>

          <div className="form-group">
            <label>
              Date <span className="required">*</span>
            </label>
            <input
              type="date"
              name="reviewDate"
              value={formData.reviewDate}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group full-width">
            <label>
              Votre avis <span className="required">*</span>
            </label>
            <textarea
              name="reviewText"
              value={formData.reviewText}
              onChange={handleChange}
              rows={5}
              placeholder="Décrivez votre expérience en détail..."
              required
            />
          </div>

          {/* Champs avancés - Affichés seulement en mode avancé */}
          {advancedMode && (
            <>
              <div className="form-group">
                <label>Type d'auteur</label>
                <select
                  name="reviewerType"
                  value={formData.reviewerType}
                  onChange={handleChange}
                >
                  <option value="">Sélectionnez</option>
                  <option value="Tourist">Touriste</option>
                  <option value="LocalGuide">Guide Local</option>
                  <option value="TravelExpert">Expert Voyage</option>
                  <option value="LocalResident">Résident Local</option>
                </select>
              </div>

              <div className="form-group">
                <label>Note globale (1-10)</label>
                <input
                  type="number"
                  name="overallRating"
                  value={formData.overallRating}
                  onChange={handleChange}
                  min="1"
                  max="10"
                />
              </div>

              <div className="form-group">
                <label>Sentiment</label>
                <select
                  name="sentiment"
                  value={formData.sentiment}
                  onChange={handleChange}
                >
                  <option value="positive">Positif</option>
                  <option value="neutral">Neutre</option>
                  <option value="negative">Négatif</option>
                </select>
              </div>

              <div className="form-group full-width">
                <label>Pratiques écologiques observées</label>
                <textarea
                  name="ecoFriendlyPractices"
                  value={formData.ecoFriendlyPractices}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Ex: Panneaux solaires, produits locaux, recyclage..."
                />
              </div>
            </>
          )}
        </div>

        <div className="form-actions">
          <button
            type="button"
            onClick={() => navigate('/reviews')}
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
              isEdit ? 'Modifier' : 'Créer l\'avis'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

export default ReviewForm;
