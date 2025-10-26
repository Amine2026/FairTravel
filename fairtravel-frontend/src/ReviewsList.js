import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

function ReviewsList() {
  const [reviews, setReviews] = useState([]);
  const [search, setSearch] = useState("");
  const [detailsMap, setDetailsMap] = useState({});
  const [loading, setLoading] = useState(true);

  const fetchReviews = () => {
    setLoading(true);
    fetch('http://localhost:5000/reviews')
      .then(response => response.json())
      .then(data => {
        setReviews(data);
        // Fetch details for each review
        data.forEach(uri => {
          fetch(`http://localhost:5000/review-details?uri=${encodeURIComponent(uri)}`)
            .then(response => response.json())
            .then(details => {
              setDetailsMap(prev => ({ ...prev, [uri]: details }));
            });
        });
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching reviews:', error);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const filteredReviews = reviews.filter(review => {
    return review.toLowerCase().includes(search.toLowerCase());
  });

  const handleDelete = async (reviewId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cet avis ?')) {
      return;
    }

    const id = reviewId.split('#')[1];
    try {
      const response = await fetch(`http://localhost:5000/reviews/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        alert('Avis supprimé avec succès');
        fetchReviews();
      } else {
        alert('Erreur lors de la suppression');
      }
    } catch (error) {
      console.error('Error deleting review:', error);
      alert('Erreur lors de la suppression');
    }
  };

  const extractId = (uri) => uri.split('#')[1] || uri;

  const renderStars = (rating) => {
    // Ensure rating is a valid number between 0 and 5
    const validRating = Math.max(0, Math.min(5, parseInt(rating) || 0));
    const stars = '★'.repeat(validRating) + '☆'.repeat(5 - validRating);
    return <span style={{color: '#ffa500', fontSize: '1.2rem'}}>{stars}</span>;
  };

  return (
    <div style={{maxWidth:800, margin:'2rem auto', padding:'1rem', background:'#f9f9f9', borderRadius:8, boxShadow:'0 2px 8px #ddd'}}>
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom:'1rem'}}>
        <h2>Avis (Reviews)</h2>
        <Link 
          to="/reviews/new" 
          style={{
            padding: '0.5rem 1rem',
            background: '#1976d2',
            color: 'white',
            textDecoration: 'none',
            borderRadius: 4,
            fontWeight: 'bold'
          }}
        >
          + Ajouter Avis
        </Link>
      </div>

      <input
        type="text"
        placeholder="Rechercher des avis..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        style={{width:'100%', padding:'0.5rem', marginBottom:'1rem', borderRadius:4, border:'1px solid #ccc'}}
      />

      {loading ? (
        <p>Chargement...</p>
      ) : (
        <ul style={{listStyle:'none', padding:0}}>
          {filteredReviews.map((review, idx) => {
            const details = detailsMap[review] || {};
            const reviewerName = details['http://www.fairtravel.com/fairtravel#reviewerName'] || 'Anonyme';
            const rating = parseInt(details['http://www.fairtravel.com/fairtravel#rating']) || 0;
            const reviewText = details['http://www.fairtravel.com/fairtravel#reviewText'] || '';
            const reviewDate = details['http://www.fairtravel.com/fairtravel#reviewDate'] || '';

            return (
              <li 
                key={idx} 
                style={{
                  marginBottom:'1rem',
                  padding:'1rem',
                  background:'white',
                  borderRadius:6,
                  border:'1px solid #ddd'
                }}
              >
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start'}}>
                  <div style={{flex: 1}}>
                    <Link 
                      to={`/reviews/${encodeURIComponent(review)}`}
                      style={{color:'#1976d2', fontWeight:'bold', textDecoration:'none', fontSize:'1.1rem'}}
                    >
                      {extractId(review)}
                    </Link>
                    <div style={{marginTop: '0.5rem'}}>
                      {renderStars(rating)}
                    </div>
                    <div style={{fontSize:'0.9rem', color:'#666', marginTop: '0.25rem'}}>
                      Par: {reviewerName} | Date: {reviewDate || 'N/A'}
                    </div>
                    {reviewText && (
                      <div style={{marginTop: '0.5rem', fontStyle: 'italic', color: '#444'}}>
                        "{reviewText.substring(0, 100)}{reviewText.length > 100 ? '...' : ''}"
                      </div>
                    )}
                  </div>
                  <div style={{display: 'flex', gap: '0.5rem', marginLeft: '1rem'}}>
                    <Link
                      to={`/reviews/${encodeURIComponent(review)}/edit`}
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
                      onClick={() => handleDelete(review)}
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
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {!loading && filteredReviews.length === 0 && (
        <p style={{textAlign: 'center', color: '#666'}}>Aucun avis trouvé</p>
      )}
    </div>
  );
}

export default ReviewsList;
