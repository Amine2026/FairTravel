import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import './FormStyles.css';

function ServiceForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = id && id !== 'new';

  const [formData, setFormData] = useState({
    id: '',
    serviceName: '',
    serviceType: '',
    priceRange: '',
    providedBy: '',
    // Champs avancés
    operatingHours: '',
    contactInfo: '',
    sustainabilityScore: '',
    locallyOwned: false,
    useLocalProducts: false,
    locatedIn: '',
    complementsActivity: '',
    offeredBy: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [advancedMode, setAdvancedMode] = useState(false);

  useEffect(() => {
    if (isEdit) {
      const uri = decodeURIComponent(id);
      fetch(`http://localhost:5000/service-details?uri=${encodeURIComponent(uri)}`)
        .then(response => response.json())
        .then(data => {
          const extractedId = uri.split('#')[1];
          setFormData({
            id: extractedId,
            serviceName: data['http://www.fairtravel.com/fairtravel#serviceName'] || '',
            serviceType: data['http://www.fairtravel.com/fairtravel#serviceType'] || '',
            priceRange: data['http://www.fairtravel.com/fairtravel#priceRange'] || '',
            providedBy: data['http://www.fairtravel.com/fairtravel#providedBy']?.split('#')[1] || '',
            // Champs avancés
            operatingHours: data['http://www.fairtravel.com/fairtravel#operatingHours'] || '',
            contactInfo: data['http://www.fairtravel.com/fairtravel#contactInfo'] || '',
            sustainabilityScore: data['http://www.fairtravel.com/fairtravel#sustainabilityScore'] || '',
            locallyOwned: data['http://www.fairtravel.com/fairtravel#locallyOwned'] === 'true',
            useLocalProducts: data['http://www.fairtravel.com/fairtravel#useLocalProducts'] === 'true',
            locatedIn: data['http://www.fairtravel.com/fairtravel#locatedIn']?.split('#')[1] || '',
            complementsActivity: data['http://www.fairtravel.com/fairtravel#complementsActivity']?.split('#')[1] || '',
            offeredBy: data['http://www.fairtravel.com/fairtravel#offeredBy']?.split('#')[1] || ''
          });
        })
        .catch(error => {
          console.error('Error:', error);
          setError('Erreur lors du chargement du service');
        });
    }
  }, [id, isEdit]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const properties = {
      serviceName: formData.serviceName,
      serviceType: formData.serviceType,
      priceRange: formData.priceRange,
      providedBy: formData.providedBy
    };

    // Ajouter les champs avancés s'ils sont remplis
    if (formData.operatingHours) properties.operatingHours = formData.operatingHours;
    if (formData.contactInfo) properties.contactInfo = formData.contactInfo;
    if (formData.sustainabilityScore) properties.sustainabilityScore = parseInt(formData.sustainabilityScore);
    if (formData.locallyOwned) properties.locallyOwned = formData.locallyOwned;
    if (formData.useLocalProducts) properties.useLocalProducts = formData.useLocalProducts;
    if (formData.locatedIn) properties.locatedIn = formData.locatedIn;
    if (formData.complementsActivity) properties.complementsActivity = formData.complementsActivity;
    if (formData.offeredBy) properties.offeredBy = formData.offeredBy;

    try {
      let response;
      if (isEdit) {
        response = await fetch(`http://localhost:5000/services/${formData.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ properties })
        });
      } else {
        const serviceId = `Service_${formData.serviceName.replace(/\s+/g, '_')}_${Date.now()}`;
        response = await fetch('http://localhost:5000/services', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: serviceId,
            type: 'Service',
            properties
          })
        });
      }

      if (response.ok) {
        navigate('/services');
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
        <h2>{isEdit ? 'Modifier le Service' : 'Nouveau Service'}</h2>
        <p className="form-subtitle">Services écologiques</p>
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
              Nom du service <span className="required">*</span>
            </label>
            <input
              type="text"
              name="serviceName"
              value={formData.serviceName}
              onChange={handleChange}
              placeholder="Ex: Randonnée écologique guidée"
              required
            />
          </div>

          <div className="form-group">
            <label>
              Type de service <span className="required">*</span>
            </label>
            <select
              name="serviceType"
              value={formData.serviceType}
              onChange={handleChange}
              required
            >
              <option value="">Sélectionnez un type</option>
              <option value="Transportation">🚗 Transportation - Transport</option>
              <option value="Guided Tour">🗺️ Guided Tour - Visite guidée</option>
              <option value="Equipment Rental">🎒 Equipment Rental - Location d'équipement</option>
              <option value="Catering">🍽️ Catering - Restauration</option>
              <option value="Wellness">💆 Wellness - Bien-être</option>
              <option value="Educational">📚 Educational - Éducatif</option>
              <option value="Adventure">⛰️ Adventure - Aventure</option>
              <option value="Cultural">🎭 Cultural - Culturel</option>
            </select>
            <small>💡 Catégorie principale du service proposé</small>
          </div>

          <div className="form-group">
            <label>
              Gamme de prix <span className="required">*</span>
            </label>
            <select
              name="priceRange"
              value={formData.priceRange}
              onChange={handleChange}
              required
            >
              <option value="">Sélectionnez la gamme de prix</option>
              <option value="$">$ - Budget (moins de 50 TND)</option>
              <option value="$$">$$ - Modéré (50-150 TND)</option>
              <option value="$$$">$$$ - Élevé (150-300 TND)</option>
              <option value="$$$$">$$$$ - Luxe (plus de 300 TND)</option>
            </select>
            <small>💡 Indique le niveau de prix moyen du service</small>
          </div>

          <div className="form-group full-width">
            <label>
              Fournisseur <span className="required">*</span>
            </label>
            <input
              type="text"
              name="providedBy"
              value={formData.providedBy}
              onChange={handleChange}
              placeholder="Ex: EcoTourOperator_001"
              required
            />
            <small>L'organisation ou personne qui fournit ce service</small>
          </div>

          {/* Champs avancés - Affichés seulement en mode avancé */}
          {advancedMode && (
            <>
              <div className="form-group">
                <label>⏰ Heures d'ouverture</label>
                <input
                  type="text"
                  name="operatingHours"
                  value={formData.operatingHours}
                  onChange={handleChange}
                  placeholder="Ex: 09:00-18:00 ou Lun-Ven: 08:00-20:00"
                />
                <small>💡 Horaires d'ouverture du service</small>
              </div>

              <div className="form-group">
                <label>📞 Informations de contact</label>
                <input
                  type="text"
                  name="contactInfo"
                  value={formData.contactInfo}
                  onChange={handleChange}
                  placeholder="Ex: info@service.tn, +216 71 123 456"
                />
                <small>💡 Email et/ou numéro de téléphone</small>
              </div>

              <div className="form-group">
                <label>🌿 Score de durabilité (0-100)</label>
                <input
                  type="number"
                  name="sustainabilityScore"
                  value={formData.sustainabilityScore}
                  onChange={handleChange}
                  min="0"
                  max="100"
                  placeholder="Ex: 85"
                />
                <small>💡 Évaluation des pratiques écologiques (0=faible, 100=excellent)</small>
              </div>

              <div className="form-group">
                <label>📍 Localisation</label>
                <input
                  type="text"
                  name="locatedIn"
                  value={formData.locatedIn}
                  onChange={handleChange}
                  placeholder="Ex: Destination_Sousse_001"
                />
                <small>💡 ID de la destination où se trouve le service</small>
              </div>

              <div className="form-group">
                <label>🎯 Complète l'activité</label>
                <input
                  type="text"
                  name="complementsActivity"
                  value={formData.complementsActivity}
                  onChange={handleChange}
                  placeholder="Ex: Activity_Hiking_001"
                />
                <small>💡 ID de l'activité associée à ce service</small>
              </div>

              <div className="form-group">
                <label>🏢 Offert par (organisation)</label>
                <input
                  type="text"
                  name="offeredBy"
                  value={formData.offeredBy}
                  onChange={handleChange}
                  placeholder="Ex: Organisation_EcoTourism_001"
                />
                <small>💡 ID de l'organisation qui offre ce service</small>
              </div>

              <div className="form-group full-width">
                <label style={{ marginBottom: '12px', display: 'block', fontWeight: '600' }}>
                  🌱 Caractéristiques de durabilité
                </label>
                <div style={{ display: 'flex', gap: '24px', marginTop: '12px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      name="locallyOwned"
                      checked={formData.locallyOwned}
                      onChange={handleChange}
                      style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                    />
                    <span>✅ Propriété locale</span>
                  </label>

                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      name="useLocalProducts"
                      checked={formData.useLocalProducts}
                      onChange={handleChange}
                      style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                    />
                    <span>✅ Utilise produits locaux</span>
                  </label>
                </div>
                <small style={{ display: 'block', marginTop: '8px' }}>
                  💡 Cochez si le service est détenu localement et/ou utilise des produits locaux
                </small>
              </div>
            </>
          )}
        </div>

        <div className="form-actions">
          <button
            type="button"
            onClick={() => navigate('/services')}
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
              isEdit ? 'Modifier' : 'Créer le service'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

export default ServiceForm;
