import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

function ReviewForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = id && id !== 'new';

  const [formData, setFormData] = useState({
    id: '',
    type: 'Review',
    rating: 5,
    reviewText: '',
    reviewDate: new Date().toISOString().split('T')[0],
    reviewerName: '',
    sustainabilityRating: 5,
    mentionsSustainability: false,
    verified: false,
    writtenBy: '',
    reviewsActivity: '',
    reviewsAccommodation: '',
    reviewsService: ''
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isEdit) {
      const uri = decodeURIComponent(id);
      fetch(`http://localhost:5000/review-details?uri=${encodeURIComponent(uri)}`)
        .then(response => response.json())
        .then(data => {
          const extractedId = uri.split('#')[1];
          setFormData({
            id: extractedId,
            type: data['http://www.w3.org/1999/02/22-rdf-syntax-ns#type']?.split('#')[1] || 'Review',
            rating: parseInt(data['http://www.fairtravel.com/fairtravel#rating']) || 5,
            reviewText: data['http://www.fairtravel.com/fairtravel#reviewText'] || '',
            reviewDate: data['http://www.fairtravel.com/fairtravel#reviewDate'] || new Date().toISOString().split('T')[0],
            reviewerName: data['http://www.fairtravel.com/fairtravel#reviewerName'] || '',
            sustainabilityRating: parseInt(data['http://www.fairtravel.com/fairtravel#sustainabilityRating']) || 5,
            mentionsSustainability: data['http://www.fairtravel.com/fairtravel#mentionsSustainability'] === 'true',
            verified: data['http://www.fairtravel.com/fairtravel#verified'] === 'true',
            writtenBy: data['http://www.fairtravel.com/fairtravel#writtenBy']?.split('#')[1] || '',
            reviewsActivity: data['http://www.fairtravel.com/fairtravel#reviewsActivity']?.split('#')[1] || '',
            reviewsAccommodation: data['http://www.fairtravel.com/fairtravel#reviewsAccommodation']?.split('#')[1] || '',
            reviewsService: data['http://www.fairtravel.com/fairtravel#reviewsService']?.split('#')[1] || ''
          });
        })
        .catch(error => console.error('Error:', error));
    }
  }, [id, isEdit]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const properties = {
      rating: parseInt(formData.rating),
      reviewText: formData.reviewText,
      reviewDate: formData.reviewDate,
      reviewerName: formData.reviewerName,
      sustainabilityRating: parseInt(formData.sustainabilityRating),
      mentionsSustainability: formData.mentionsSustainability,
      verified: formData.verified
    };

    if (formData.writtenBy) properties.writtenBy = formData.writtenBy;
    if (formData.reviewsActivity) properties.reviewsActivity = formData.reviewsActivity;
    if (formData.reviewsAccommodation) properties.reviewsAccommodation = formData.reviewsAccommodation;
    if (formData.reviewsService) properties.reviewsService = formData.reviewsService;

    try {
      let response;
      if (isEdit) {
        response = await fetch(`http://localhost:5000/reviews/${formData.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ properties })
        });
      } else {
        response = await fetch('http://localhost:5000/reviews', {
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
        alert(isEdit ? 'Avis modifié avec succès' : 'Avis créé avec succès');
        navigate('/reviews');
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

  const renderStars = (count) => {
    // Ensure count is a valid number between 0 and 5
    const validCount = Math.max(0, Math.min(5, parseInt(count) || 0));
    return '★'.repeat(validCount) + '☆'.repeat(5 - validCount);
  };

  return (
    <div style={{maxWidth:600, margin:'2rem auto', padding:'1.5rem', background:'white', borderRadius:8, boxShadow:'0 2px 8px #ddd'}}>
      <h2>{isEdit ? 'Modifier l\'Avis' : 'Nouvel Avis'}</h2>
      
      <form onSubmit={handleSubmit}>
        <div style={{marginBottom:'1rem'}}>
          <label style={{display:'block', marginBottom:'0.25rem', fontWeight:'bold'}}>
            ID de l'Avis *
          </label>
          <input
            type="text"
            name="id"
            value={formData.id}
            onChange={handleChange}
            required
            disabled={isEdit}
            placeholder="ex: Review_MountainHiking_001"
            style={{width:'100%', padding:'0.5rem', borderRadius:4, border:'1px solid #ccc'}}
          />
        </div>

        <div style={{marginBottom:'1rem'}}>
          <label style={{display:'block', marginBottom:'0.25rem', fontWeight:'bold'}}>
            Type d'Avis *
          </label>
          <select
            name="type"
            value={formData.type}
            onChange={handleChange}
            required
            style={{width:'100%', padding:'0.5rem', borderRadius:4, border:'1px solid #ccc'}}
          >
            <option value="Review">Review</option>
            <option value="ActivityReview">Activity Review</option>
            <option value="AccommodationReview">Accommodation Review</option>
            <option value="ServiceReview">Service Review</option>
            <option value="TransportReview">Transport Review</option>
          </select>
        </div>

        <div style={{marginBottom:'1rem'}}>
          <label style={{display:'block', marginBottom:'0.25rem', fontWeight:'bold'}}>
            Note Globale * {renderStars(formData.rating)}
          </label>
          <input
            type="range"
            name="rating"
            value={formData.rating}
            onChange={handleChange}
            min="1"
            max="5"
            required
            style={{width:'100%'}}
          />
          <div style={{textAlign:'center', color:'#666'}}>{formData.rating}/5</div>
        </div>

        <div style={{marginBottom:'1rem'}}>
          <label style={{display:'block', marginBottom:'0.25rem', fontWeight:'bold'}}>
            Note de Durabilité * {renderStars(formData.sustainabilityRating)}
          </label>
          <input
            type="range"
            name="sustainabilityRating"
            value={formData.sustainabilityRating}
            onChange={handleChange}
            min="1"
            max="5"
            required
            style={{width:'100%'}}
          />
          <div style={{textAlign:'center', color:'#666'}}>{formData.sustainabilityRating}/5</div>
        </div>

        <div style={{marginBottom:'1rem'}}>
          <label style={{display:'block', marginBottom:'0.25rem', fontWeight:'bold'}}>
            Texte de l'Avis *
          </label>
          <textarea
            name="reviewText"
            value={formData.reviewText}
            onChange={handleChange}
            required
            rows={4}
            placeholder="Partagez votre expérience..."
            style={{width:'100%', padding:'0.5rem', borderRadius:4, border:'1px solid #ccc', fontFamily:'inherit'}}
          />
        </div>

        <div style={{marginBottom:'1rem'}}>
          <label style={{display:'block', marginBottom:'0.25rem', fontWeight:'bold'}}>
            Nom du Critique *
          </label>
          <input
            type="text"
            name="reviewerName"
            value={formData.reviewerName}
            onChange={handleChange}
            required
            placeholder="ex: Jean Dupont"
            style={{width:'100%', padding:'0.5rem', borderRadius:4, border:'1px solid #ccc'}}
          />
        </div>

        <div style={{marginBottom:'1rem'}}>
          <label style={{display:'block', marginBottom:'0.25rem', fontWeight:'bold'}}>
            Date de l'Avis *
          </label>
          <input
            type="date"
            name="reviewDate"
            value={formData.reviewDate}
            onChange={handleChange}
            required
            style={{width:'100%', padding:'0.5rem', borderRadius:4, border:'1px solid #ccc'}}
          />
        </div>

        <div style={{marginBottom:'1rem'}}>
          <label style={{display:'block', marginBottom:'0.25rem', fontWeight:'bold'}}>
            Écrit par (Tourist ID)
          </label>
          <input
            type="text"
            name="writtenBy"
            value={formData.writtenBy}
            onChange={handleChange}
            placeholder="ex: Tourist_001"
            style={{width:'100%', padding:'0.5rem', borderRadius:4, border:'1px solid #ccc'}}
          />
        </div>

        <div style={{marginBottom:'1rem'}}>
          <label style={{display:'block', marginBottom:'0.25rem', fontWeight:'bold'}}>
            Concerne l'Activité (Activity ID)
          </label>
          <input
            type="text"
            name="reviewsActivity"
            value={formData.reviewsActivity}
            onChange={handleChange}
            placeholder="ex: MountainHiking"
            style={{width:'100%', padding:'0.5rem', borderRadius:4, border:'1px solid #ccc'}}
          />
        </div>

        <div style={{marginBottom:'1rem'}}>
          <label style={{display:'block', marginBottom:'0.25rem', fontWeight:'bold'}}>
            Concerne l'Hébergement (Accommodation ID)
          </label>
          <input
            type="text"
            name="reviewsAccommodation"
            value={formData.reviewsAccommodation}
            onChange={handleChange}
            placeholder="ex: EcoHotel_Verde_001"
            style={{width:'100%', padding:'0.5rem', borderRadius:4, border:'1px solid #ccc'}}
          />
        </div>

        <div style={{marginBottom:'1rem'}}>
          <label style={{display:'block', marginBottom:'0.25rem', fontWeight:'bold'}}>
            Concerne le Service (Service ID)
          </label>
          <input
            type="text"
            name="reviewsService"
            value={formData.reviewsService}
            onChange={handleChange}
            placeholder="ex: EcoTourismCenter_Sousse"
            style={{width:'100%', padding:'0.5rem', borderRadius:4, border:'1px solid #ccc'}}
          />
        </div>

        <div style={{marginBottom:'1rem'}}>
          <label style={{display:'flex', alignItems:'center', gap:'0.5rem'}}>
            <input
              type="checkbox"
              name="mentionsSustainability"
              checked={formData.mentionsSustainability}
              onChange={handleChange}
            />
            <span>Mentionne la durabilité</span>
          </label>
        </div>

        <div style={{marginBottom:'1rem'}}>
          <label style={{display:'flex', alignItems:'center', gap:'0.5rem'}}>
            <input
              type="checkbox"
              name="verified"
              checked={formData.verified}
              onChange={handleChange}
            />
            <span>Avis vérifié</span>
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
            onClick={() => navigate('/reviews')}
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

export default ReviewForm;
