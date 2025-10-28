import React, { useState } from 'react';

function AdvancedSearch() {
  const [searchType, setSearchType] = useState('multi-class');
  const [filters, setFilters] = useState({
    tourist_name: '',
    guide_language: '',
    cuisine_type: '',
    min_age: '',
    max_age: '',
    restaurant_name: ''
  });
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const executeSearch = async () => {
    setLoading(true);
    setError(null);
    setResults(null);
    
    try {
      let endpoint = '';
      const params = new URLSearchParams();
      
      // Construction des paramètres selon le type de recherche
      switch(searchType) {
        case 'multi-class':
          endpoint = '/search/multi-class';
          Object.entries(filters).forEach(([key, value]) => {
            if (value && !['restaurant_name'].includes(key)) {
              params.append(key, value);
            }
          });
          break;
          
        case 'relations':
          endpoint = '/search/relations';
          break;
          
        case 'guides-by-restaurant':
          endpoint = '/search/guides-by-restaurant';
          if (filters.restaurant_name) params.append('restaurant_name', filters.restaurant_name);
          if (filters.cuisine_type) params.append('cuisine_type', filters.cuisine_type);
          break;
          
        case 'tourist-itinerary':
          endpoint = '/search/tourist-itinerary';
          if (filters.tourist_name) params.append('tourist_name', filters.tourist_name);
          break;
          
        default:
          break;
      }
      
      const url = `http://localhost:5000${endpoint}?${params.toString()}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error('Erreur lors de la recherche');
      }
      
      const data = await response.json();
      setResults(data);
      
    } catch (err) {
      setError(err.message);
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  };

  const renderResults = () => {
    if (!results) return null;
    
    console.log('Results data:', results); // Debug log
    
    switch(searchType) {
      case 'multi-class':
        // Vérifier la structure des données
        const multiClassResults = results.results || results;
        return (
          <div>
            <h4>Résultats de recherche ({Array.isArray(multiClassResults) ? multiClassResults.length : results.total || 0} trouvés)</h4>
            {Array.isArray(multiClassResults) && multiClassResults.map((item, index) => (
              <div key={index} className="card mb-3">
                <div className="card-body">
                  <h5 className="card-title">Touriste: {item.tourist?.name || 'Non spécifié'}</h5>
                  <p>Âge: {item.tourist?.age || 'Non spécifié'}</p>
                  
                  {item.guide && (
                    <div className="mb-2">
                      <strong>Guide:</strong> {item.guide.name} 
                      {item.guide.language && ` (${item.guide.language})`}
                    </div>
                  )}
                  
                  {item.restaurant && (
                    <div>
                      <strong>Restaurant:</strong> {item.restaurant.name}
                      {item.restaurant.cuisine && ` - ${item.restaurant.cuisine}`}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        );

      case 'relations':
        // Pour les relations, results est directement un tableau
        const relationsData = Array.isArray(results) ? results : (results.results || results.bindings || []);
        return (
          <div>
            <h4>🔗 Relations RDF Complètes ({relationsData.length} relations trouvées)</h4>
            
            <div className="alert alert-success mb-4">
              <h5>🎯 Structure Sémantique Démontrée :</h5>
              <div className="ms-3">
                <p><strong>Tourist</strong> --<code>:guidedBy</code>--→ <strong>Guide</strong></p>
                <p><strong>Tourist</strong> --<code>:visitsRestaurant</code>--→ <strong>Restaurant</strong></p>
              </div>
            </div>

            {/* Regroupement par touriste */}
            {(() => {
              const groupedByTourist = {};
              relationsData.forEach(item => {
                const touristUri = item.tourist?.value || item.tourist;
                const touristName = item.touristName?.value || item.touristName;
                
                if (!groupedByTourist[touristUri]) {
                  groupedByTourist[touristUri] = {
                    touristName: touristName,
                    touristUri: touristUri,
                    relations: []
                  };
                }
                groupedByTourist[touristUri].relations.push(item);
              });

              return Object.values(groupedByTourist).map((tourist, index) => (
                <div key={index} className="card mb-4 border-primary">
                  <div className="card-header bg-primary text-white">
                    <h5 className="mb-0">👤 Touriste : {tourist.touristName}</h5>
                    <small className="opacity-75">URI: {tourist.touristUri}</small>
                  </div>
                  <div className="card-body">
                    <h6>Relations RDF :</h6>
                    {tourist.relations.map((relation, relIndex) => {
                      const relationName = relation.relation?.value ? relation.relation.value.split('#')[1] : 'relation';
                      const targetName = relation.targetName?.value || relation.targetName;
                      const targetType = relation.targetType?.value ? relation.targetType.value.split('#')[1] : 'Target';
                      const targetUri = relation.target?.value || relation.target;
                      
                      return (
                        <div key={relIndex} className="mb-3 p-3 border rounded">
                          <div className="row">
                            <div className="col-md-2">
                              <strong>Relation :</strong>
                              <br />
                              <code className="bg-light p-1 rounded">
                                {relationName}
                              </code>
                            </div>
                            <div className="col-md-1 text-center">
                              <span className="fs-4">→</span>
                            </div>
                            <div className="col-md-9">
                              <strong>Cible :</strong> {targetName}
                              <br />
                              <strong>Type :</strong> <code>{targetType}</code>
                              <br />
                              <strong>URI :</strong> <small><code>{targetUri}</code></small>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ));
            })()}
          </div>
        );

      case 'guides-by-restaurant':
        const guidesData = Array.isArray(results) ? results : (results.results || results.bindings || []);
        return (
          <div>
            <h4>🎯 Guides par restaurant ({guidesData.length} trouvés)</h4>
            <div className="alert alert-info">
              <strong>Relation RDF exploitée :</strong> <code>:worksAt</code> entre <code>Guide</code> et <code>Restaurant</code>
            </div>
            
            {guidesData.map((item, index) => {
              const guideName = item.guideName?.value || item.guideName;
              const language = item.language?.value || item.language;
              const guideUri = item.guide?.value || item.guide;
              const restaurantName = item.restaurantName?.value || item.restaurantName;
              const cuisine = item.cuisine?.value || item.cuisine;
              const restaurantUri = item.restaurant?.value || item.restaurant;
              
              return (
                <div key={index} className="card mb-3 border-success">
                  <div className="card-header bg-success text-white">
                    <strong>Relation #{index + 1}</strong>
                  </div>
                  <div className="card-body">
                    <div className="row">
                      <div className="col-md-6">
                        <h5>👨‍🏫 Guide</h5>
                        <p><strong>Nom :</strong> {guideName}</p>
                        <p><strong>Langue :</strong> {language || 'Non spécifié'}</p>
                        <p><strong>URI :</strong> <code>{guideUri}</code></p>
                      </div>
                      <div className="col-md-6">
                        <h5>🍽️ Restaurant</h5>
                        <p><strong>Nom :</strong> {restaurantName}</p>
                        <p><strong>Cuisine :</strong> {cuisine || 'Non spécifié'}</p>
                        <p><strong>URI :</strong> <code>{restaurantUri}</code></p>
                      </div>
                    </div>
                    <div className="mt-3 p-2 bg-light border rounded">
                      <small>
                        <strong>Lien RDF :</strong>{' '}
                        <code>{guideUri} :worksAt {restaurantUri}</code>
                      </small>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        );

      case 'tourist-itinerary':
        const itinerariesData = results.itineraries || results.results || (Array.isArray(results) ? results : []);
        return (
          <div>
            <h4>Itinéraires des touristes ({Array.isArray(itinerariesData) ? itinerariesData.length : results.total || 0} trouvés)</h4>
            {Array.isArray(itinerariesData) && itinerariesData.map((itinerary, index) => (
              <div key={index} className="card mb-3">
                <div className="card-body">
                  <h5 className="card-title">{itinerary.tourist?.name || 'Touriste sans nom'}</h5>
                  <p>Âge: {itinerary.tourist?.age || 'Non spécifié'}</p>
                  
                  <h6>Guides:</h6>
                  {itinerary.guides && itinerary.guides.length > 0 ? (
                    <ul>
                      {itinerary.guides.map((guide, idx) => (
                        <li key={idx}>
                          {guide.name} {guide.language && `(${guide.language})`}
                        </li>
                      ))}
                    </ul>
                  ) : <p>Aucun guide assigné</p>}
                  
                  <h6>Restaurants visités:</h6>
                  {itinerary.restaurants && itinerary.restaurants.length > 0 ? (
                    <ul>
                      {itinerary.restaurants.map((restaurant, idx) => (
                        <li key={idx}>
                          {restaurant.name} {restaurant.cuisine && `- ${restaurant.cuisine}`}
                        </li>
                      ))}
                    </ul>
                  ) : <p>Aucun restaurant visité</p>}
                </div>
              </div>
            ))}
          </div>
        );
        
      default:
        return (
          <div>
            <h4>Résultats (Format brut)</h4>
            <pre>{JSON.stringify(results, null, 2)}</pre>
          </div>
        );
    }
  };

  return (
    <div className="container mt-4">
      <h2>🔍 Recherche Avancée - Exploration Sémantique</h2>
      
      <div className="card">
        <div className="card-body">
          {/* Sélection du type de recherche */}
          <div className="mb-3">
            <label className="form-label">Type de recherche:</label>
            <select 
              className="form-select"
              value={searchType}
              onChange={(e) => {
                setSearchType(e.target.value);
                setResults(null); // Reset results when changing search type
              }}
            >
              <option value="multi-class">Recherche multi-classes (Touriste + Guide + Restaurant)</option>
              <option value="relations">Relations RDF complètes</option>
              <option value="guides-by-restaurant">Guides par restaurant</option>
              <option value="tourist-itinerary">Itinéraire des touristes</option>
            </select>
          </div>

          {/* Filtres conditionnels */}
          <div className="row mb-3">
            {(searchType === 'multi-class' || searchType === 'tourist-itinerary') && (
              <div className="col-md-6">
                <label className="form-label">Nom du touriste:</label>
                <input
                  type="text"
                  className="form-control"
                  name="tourist_name"
                  value={filters.tourist_name}
                  onChange={handleFilterChange}
                  placeholder="Rechercher un touriste..."
                />
              </div>
            )}
            
            {(searchType === 'multi-class' || searchType === 'guides-by-restaurant') && (
              <div className="col-md-6">
                <label className="form-label">Type de cuisine:</label>
                <input
                  type="text"
                  className="form-control"
                  name="cuisine_type"
                  value={filters.cuisine_type}
                  onChange={handleFilterChange}
                  placeholder="Ex: Vegetarian, Italian..."
                />
              </div>
            )}
            
            {searchType === 'multi-class' && (
              <>
                <div className="col-md-6">
                  <label className="form-label">Langue du guide:</label>
                  <input
                    type="text"
                    className="form-control"
                    name="guide_language"
                    value={filters.guide_language}
                    onChange={handleFilterChange}
                    placeholder="Ex: French, English..."
                  />
                </div>
                
                <div className="col-md-3">
                  <label className="form-label">Âge minimum:</label>
                  <input
                    type="number"
                    className="form-control"
                    name="min_age"
                    value={filters.min_age}
                    onChange={handleFilterChange}
                    placeholder="18"
                  />
                </div>
                
                <div className="col-md-3">
                  <label className="form-label">Âge maximum:</label>
                  <input
                    type="number"
                    className="form-control"
                    name="max_age"
                    value={filters.max_age}
                    onChange={handleFilterChange}
                    placeholder="65"
                  />
                </div>
              </>
            )}
            
            {searchType === 'guides-by-restaurant' && (
              <div className="col-md-6">
                <label className="form-label">Nom du restaurant:</label>
                <input
                  type="text"
                  className="form-control"
                  name="restaurant_name"
                  value={filters.restaurant_name}
                  onChange={handleFilterChange}
                  placeholder="Rechercher un restaurant..."
                />
              </div>
            )}
          </div>

          <button 
            className="btn btn-primary"
            onClick={executeSearch}
            disabled={loading}
          >
            {loading ? 'Recherche en cours...' : '🔍 Lancer la recherche'}
          </button>
        </div>
      </div>

      {/* Affichage des résultats */}
      {error && (
        <div className="alert alert-danger mt-3">
          Erreur: {error}
        </div>
      )}

      {results && (
        <div className="mt-4">
          {renderResults()}
        </div>
      )}
    </div>
  );
}

export default AdvancedSearch;