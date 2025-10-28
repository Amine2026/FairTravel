from flask import Flask, jsonify, request
import os
from urllib.parse import unquote
import uuid
from SPARQLWrapper import SPARQLWrapper, JSON
from flask_cors import CORS
from groq import Groq
from dotenv import load_dotenv
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity

# Load environment variables from .env file (includes GROQ_API_KEY)
load_dotenv()

# Debug: Check if GROQ_API_KEY is loaded
groq_key_loaded = os.getenv('GROQ_API_KEY')
if groq_key_loaded:
    print(f"✓ GROQ_API_KEY loaded from .env (length: {len(groq_key_loaded)})")
else:
    print("✗ GROQ_API_KEY not found in environment")

app = Flask(__name__)
CORS(app)

# Configure SQLAlchemy
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///users.db'
app.config['JWT_SECRET_KEY'] = 'your-secret-key'  # Change this to a strong secret key
db = SQLAlchemy(app)
jwt = JWTManager(app)

# User model
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password = db.Column(db.String(120), nullable=False)
    role = db.Column(db.String(10), nullable=False)  # 'user' or 'admin'

# User registration endpoint
@app.route('/register', methods=['POST'])
def register():
    data = request.json
    # Always set role to 'user' for public registration
    user = User(username=data['username'], password=data['password'], role='user')
    db.session.add(user)
    db.session.commit()
    return jsonify({"msg": "User registered"}), 201

# User login endpoint
@app.route('/login', methods=['POST'])
def login():
    data = request.json
    # Hardcoded admin account for local testing
    if data['username'] == 'admin' and data['password'] == 'admin123':
        access_token = create_access_token(identity={'username': 'admin', 'role': 'admin'})
        return jsonify(access_token=access_token)
    user = User.query.filter_by(username=data['username'], password=data['password']).first()
    if not user:
        return jsonify({"msg": "Bad credentials"}), 401
    access_token = create_access_token(identity={'username': user.username, 'role': user.role})
    return jsonify(access_token=access_token)

# Admin-only endpoint
@app.route('/admin-only', methods=['GET'])
@jwt_required()
def admin_only():
    identity = get_jwt_identity()
    if identity['role'] != 'admin':
        return jsonify({"msg": "Admins only!"}), 403
    return jsonify({"msg": "Welcome, admin!"})


# Change this to your Fuseki SPARQL endpoint
FUSEKI_URL = "http://localhost:3030/FairTravel/sparql"
FUSEKI_UPDATE_URL = "http://localhost:3030/FairTravel/update"

# Charge les variables d'environnement depuis le fichier .env
load_dotenv()

# Configuration Groq
GROQ_API_KEY = os.getenv('GROQ_API_KEY')

# Vérification que la clé API est bien configurée
if not GROQ_API_KEY or GROQ_API_KEY == 'votre_clé_api_groq_ici':
    print("⚠️  ATTENTION: La clé API Groq n'est pas configurée!")
    print("👉 Configurez la variable d'environnement GROQ_API_KEY")
else:
    print("✅ Clé API Groq détectée")

def test_groq_connection():
    """Test simple de connexion à l'API Groq"""
    try:
        client = Groq(api_key=GROQ_API_KEY)
        completion = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": "Dis bonjour en français"}],
            max_tokens=50,
            stream=False  # Plus simple pour commencer
        )
        print("✅ Connexion Groq réussie!")
        return completion.choices[0].message.content
    except Exception as e:
        print(f"❌ Erreur Groq: {e}")
        return None

    
# Endpoint to get details for a specific event
@app.route('/event-details')
def event_details():
    uri = request.args.get('uri')
    if not uri:
        return jsonify({'error': 'Missing uri parameter'}), 400
    sparql = SPARQLWrapper(FUSEKI_URL)
    sparql.setQuery(f"""
        SELECT ?property ?value WHERE {{ <{uri}> ?property ?value . }}
    """)
    sparql.setReturnFormat(JSON)
    results = sparql.query().convert()
    details = { r['property']['value']: r['value']['value'] for r in results['results']['bindings'] }
    return jsonify(details)

# Endpoint to get details for a specific recommendation
@app.route('/recommendation-details')
def recommendation_details():
    uri = request.args.get('uri')
    if not uri:
        return jsonify({'error': 'Missing uri parameter'}), 400
    sparql = SPARQLWrapper(FUSEKI_URL)
    sparql.setQuery(f"""
        SELECT ?property ?value WHERE {{ <{uri}> ?property ?value . }}
    """)
    sparql.setReturnFormat(JSON)
    results = sparql.query().convert()
    details = { r['property']['value']: r['value']['value'] for r in results['results']['bindings'] }
    return jsonify(details)

@app.route('/activity-details')
def activity_details():
    uri = request.args.get('uri')
    if not uri:
        return jsonify({'error': 'Missing uri parameter'}), 400
    sparql = SPARQLWrapper(FUSEKI_URL)
    sparql.setQuery(f"""
        SELECT ?property ?value WHERE {{ <{uri}> ?property ?value . }}
    """)
    sparql.setReturnFormat(JSON)
    results = sparql.query().convert()
    details = { r['property']['value']: r['value']['value'] for r in results['results']['bindings'] }
    return jsonify(details)

@app.route('/classes')
def get_classes():
    sparql = SPARQLWrapper(FUSEKI_URL)
    sparql.setQuery("""
        PREFIX owl: <http://www.w3.org/2002/07/owl#>
        SELECT ?class WHERE { ?class a owl:Class . }
    """)
    sparql.setReturnFormat(JSON)
    results = sparql.query().convert()
    # Only keep URIs (named classes), filter out blank nodes
    classes = [r['class']['value'] for r in results['results']['bindings'] if r['class']['type'] == 'uri']
    return jsonify(classes)


# Endpoint to list all activities
@app.route('/activities')
def get_activities():
    sparql = SPARQLWrapper(FUSEKI_URL)
    sparql.setQuery("""
        PREFIX : <http://www.fairtravel.com/fairtravel#>
        PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
        SELECT ?activity WHERE {
          ?type rdfs:subClassOf* :Activity .
          ?activity a ?type .
        }
    """)
    sparql.setReturnFormat(JSON)
    results = sparql.query().convert()
    activities = [r['activity']['value'] for r in results['results']['bindings'] if r['activity']['type'] == 'uri']
    return jsonify(activities)

# Endpoint to list all recommendations
@app.route('/recommendations', methods=['GET', 'POST'])
def recommendations():
    if request.method == 'GET':
        sparql = SPARQLWrapper(FUSEKI_URL)
        sparql.setQuery("""
            PREFIX : <http://www.fairtravel.com/fairtravel#>
            SELECT ?rec WHERE { ?rec a :Recommendation . }
        """)
        sparql.setReturnFormat(JSON)
        results = sparql.query().convert()
        recommendations = [r['rec']['value'] for r in results['results']['bindings'] if r['rec']['type'] == 'uri']
        return jsonify(recommendations)
    elif request.method == 'POST':
        data = request.get_json()
        name = data.get('name')
        text = data.get('text')
        rating = data.get('rating')
        source = data.get('source')
        for_activity = data.get('for_activity')
        rec_uri = f"http://www.fairtravel.com/fairtravel#{name}"
        sparql_insert = f'''
        PREFIX : <http://www.fairtravel.com/fairtravel#>
        INSERT DATA {{
          :{name} a :Recommendation ;
            :recommendationText "{text}" ;
            :rating {rating} ;
            :source "{source}" ;
            :forActivity :{for_activity} .
        }}
        '''
        sparql = SPARQLWrapper(FUSEKI_UPDATE_URL)
        sparql.setQuery(sparql_insert)
        sparql.method = 'POSTDIRECTLY'
        try:
            sparql.query()
            return jsonify({'message': 'Recommendation created', 'uri': rec_uri}), 201
        except Exception as e:
            return jsonify({'error': str(e)}), 500

# Endpoint to list all events
@app.route('/events')
def get_events():
    sparql = SPARQLWrapper(FUSEKI_URL)
    sparql.setQuery("""
        PREFIX : <http://www.fairtravel.com/fairtravel#>
        SELECT ?event WHERE { ?event a :Event . }
    """)
    sparql.setReturnFormat(JSON)
    results = sparql.query().convert()
    events = [r['event']['value'] for r in results['results']['bindings'] if r['event']['type'] == 'uri']
    return jsonify(events)



def delete_individual(uri):
    sparql = SPARQLWrapper(FUSEKI_UPDATE_URL)
    sparql.setMethod('POST')
    sparql.setQuery(f"""
        PREFIX : <http://www.fairtravel.com/fairtravel#>
        DELETE WHERE {{
            <{uri}> ?p ?o .
        }}
    """)
    sparql.query()

def get_individual_details(uri):
    sparql = SPARQLWrapper(FUSEKI_URL)
    sparql.setQuery(f"""
        PREFIX : <http://www.fairtravel.com/fairtravel#>
        SELECT ?property ?value WHERE {{ <{uri}> ?property ?value . }}
    """)
    sparql.setReturnFormat(JSON)
    results = sparql.query().convert()
    return { r['property']['value']: r['value']['value'] for r in results['results']['bindings'] }

def list_individuals(class_name):
    sparql = SPARQLWrapper(FUSEKI_URL)
    sparql.setQuery(f"""
        PREFIX : <http://www.fairtravel.com/fairtravel#>
        PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
        SELECT ?indiv ?name WHERE {{
            ?indiv rdf:type :{class_name} .
            OPTIONAL {{ ?indiv :{class_name.lower()}Name ?name . }}
        }}
    """)
    sparql.setReturnFormat(JSON)
    results = sparql.query().convert()

    individuals = []
    for r in results['results']['bindings']:
        uri = r['indiv']['value']
        name = r.get('name', {}).get('value', uri.split('#')[-1])
        individuals.append({'uri': uri, 'name': name})
    return individuals

#================== ENDPOINTS FOR TOURIST ======================
@app.route('/tourists', methods=['GET'])
def get_tourists():
    return jsonify(list_individuals('Tourist'))

@app.route('/tourist-details')
def tourist_details():
    uri = request.args.get('uri')
    if not uri:
        return jsonify({'error': 'Missing uri parameter'}), 400
    return jsonify(get_formatted_individual_details(uri))

@app.route('/add-tourist', methods=['POST'])
def add_tourist():
    data = request.get_json()
    try:
        uri = add_individual('Tourist', data)
        return jsonify({'success': True, 'uri': uri}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/update-tourist', methods=['PUT'])
def update_tourist():
    data = request.get_json()
    uri = data.get('uri')
    if not uri:
        return jsonify({'error': 'Missing uri parameter'}), 400
    try:
        update_individual(uri, data)
        return jsonify({'success': True})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/delete-tourist', methods=['DELETE'])
def delete_tourist():
    uri = request.args.get('uri')
    if not uri:
        return jsonify({'error': 'Missing uri parameter'}), 400
    try:
        delete_individual(uri)
        return jsonify({'success': True})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

#================== ENDPOINTS FOR GUIDE ======================
@app.route('/guides', methods=['GET'])
def get_guides():
    return jsonify(list_individuals('Guide'))

@app.route('/guide-details')
def guide_details():
    uri = request.args.get('uri')
    if not uri:
        return jsonify({'error': 'Missing uri parameter'}), 400
    return jsonify(get_formatted_individual_details(uri))

@app.route('/add-guide', methods=['POST'])
def add_guide():
    data = request.get_json()
    try:
        uri = add_individual('Guide', data)
        return jsonify({'success': True, 'uri': uri}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/update-guide', methods=['PUT'])
def update_guide():
    data = request.get_json()
    uri = data.get('uri')
    if not uri:
        return jsonify({'error': 'Missing uri parameter'}), 400
    try:
        update_individual(uri, data)
        return jsonify({'success': True})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/delete-guide', methods=['DELETE'])
def delete_guide():
    uri = request.args.get('uri')
    if not uri:
        return jsonify({'error': 'Missing uri parameter'}), 400
    try:
        delete_individual(uri)
        return jsonify({'success': True})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

#================== ENDPOINTS FOR RESTAURANT ======================
@app.route('/restaurants', methods=['GET'])
def get_restaurants():
    return jsonify(list_individuals('Restaurant'))

@app.route('/restaurant-details')
def restaurant_details():
    uri = request.args.get('uri')
    if not uri:
        return jsonify({'error': 'Missing uri parameter'}), 400
    return jsonify(get_formatted_individual_details(uri))

@app.route('/add-restaurant', methods=['POST'])
def add_restaurant():
    data = request.get_json()
    try:
        uri = add_individual('Restaurant', data)
        return jsonify({'success': True, 'uri': uri}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/update-restaurant', methods=['PUT'])
def update_restaurant():
    data = request.get_json()
    uri = data.get('uri')
    if not uri:
        return jsonify({'error': 'Missing uri parameter'}), 400
    try:
        update_individual(uri, data)
        return jsonify({'success': True})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/delete-restaurant', methods=['DELETE'])
def delete_restaurant():
    uri = request.args.get('uri')
    if not uri:
        return jsonify({'error': 'Missing uri parameter'}), 400
    try:
        delete_individual(uri)
        return jsonify({'success': True})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

#================== ADVANCED SEARCH ENDPOINTS ======================

@app.route('/search/multi-class', methods=['GET'])
def multi_class_search():
    """
    Recherche avancée exploitant les liens RDF entre Tourist, Guide et Restaurant
    """
    # Récupération des paramètres de recherche
    tourist_name = request.args.get('tourist_name', '')
    guide_language = request.args.get('guide_language', '')
    cuisine_type = request.args.get('cuisine_type', '')
    min_age = request.args.get('min_age')
    max_age = request.args.get('max_age')
    
    sparql = SPARQLWrapper(FUSEKI_URL)
    
    # Construction de la requête SPARQL avec filtres optionnels
    query = """
        PREFIX : <http://www.fairtravel.com/fairtravel#>
        PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
        PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
        
        SELECT ?tourist ?touristName ?touristAge ?guide ?guideName ?language ?restaurant ?restaurantName ?cuisine
        WHERE {
            ?tourist a :Tourist ;
                     :touristName ?touristName .
            
            OPTIONAL { ?tourist :touristAge ?touristAge . }
            OPTIONAL { 
                ?tourist :guidedBy ?guide .
                ?guide a :Guide ;
                       :guideName ?guideName .
                OPTIONAL { ?guide :languageSpoken ?language . }
            }
            OPTIONAL { 
                ?tourist :visitsRestaurant ?restaurant .
                ?restaurant a :Restaurant ;
                           :restaurantName ?restaurantName .
                OPTIONAL { ?restaurant :cuisineType ?cuisine . }
            }
    """
    
    # Ajout des filtres conditionnels
    filters = []
    
    if tourist_name:
        filters.append(f'REGEX(?touristName, "{tourist_name}", "i")')
    
    if guide_language:
        filters.append(f'REGEX(?language, "{guide_language}", "i")')
    
    if cuisine_type:
        filters.append(f'REGEX(?cuisine, "{cuisine_type}", "i")')
    
    if min_age:
        filters.append(f'?touristAge >= {min_age}')
    
    if max_age:
        filters.append(f'?touristAge <= {max_age}')
    
    if filters:
        query += f"    FILTER ({ ' && '.join(filters) })"
    
    query += "\n} ORDER BY ?touristName"
    
    sparql.setQuery(query)
    sparql.setReturnFormat(JSON)
    
    try:
        results = sparql.query().convert()
        formatted_results = []
        
        for result in results['results']['bindings']:
            formatted_result = {
                'tourist': {
                    'uri': result['tourist']['value'],
                    'name': result['touristName']['value'],
                    'age': result.get('touristAge', {}).get('value')
                },
                'guide': {
                    'uri': result.get('guide', {}).get('value'),
                    'name': result.get('guideName', {}).get('value'),
                    'language': result.get('language', {}).get('value')
                } if 'guide' in result else None,
                'restaurant': {
                    'uri': result.get('restaurant', {}).get('value'),
                    'name': result.get('restaurantName', {}).get('value'),
                    'cuisine': result.get('cuisine', {}).get('value')
                } if 'restaurant' in result else None
            }
            formatted_results.append(formatted_result)
        
        return jsonify({
            'results': formatted_results,
            'total': len(formatted_results)
        })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/search/relations', methods=['GET'])
def search_relations():
    """
    Trouve toutes les relations RDF entre les trois classes
    """
    sparql = SPARQLWrapper(FUSEKI_URL)
    
    query = """
        PREFIX : <http://www.fairtravel.com/fairtravel#>
        PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
        
        SELECT ?tourist ?touristName ?relation ?target ?targetType ?targetName
        WHERE {
            ?tourist a :Tourist ;
                     :touristName ?touristName .
            
            ?tourist ?relation ?target .
            
            FILTER (?relation IN (:guidedBy, :visitsRestaurant))
            
            OPTIONAL { 
                ?target a ?targetType .
                FILTER (?targetType IN (:Guide, :Restaurant))
                
                OPTIONAL {
                    {
                        ?target a :Guide ;
                                :guideName ?targetName .
                    } UNION {
                        ?target a :Restaurant ;
                                :restaurantName ?targetName .
                    }
                }
            }
        }
        ORDER BY ?touristName
    """
    
    sparql.setQuery(query)
    sparql.setReturnFormat(JSON)
    
    try:
        results = sparql.query().convert()
        return jsonify(results['results']['bindings'])
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/search/guides-by-restaurant', methods=['GET'])
def guides_by_restaurant():
    """
    Trouve les guides qui travaillent dans des restaurants spécifiques
    """
    restaurant_name = request.args.get('restaurant_name', '')
    cuisine_type = request.args.get('cuisine_type', '')
    
    sparql = SPARQLWrapper(FUSEKI_URL)
    
    query = """
        PREFIX : <http://www.fairtravel.com/fairtravel#>
        PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
        
        SELECT ?guide ?guideName ?language ?restaurant ?restaurantName ?cuisine
        WHERE {
            ?guide a :Guide ;
                   :guideName ?guideName ;
                   :worksAt ?restaurant .
                   
            ?restaurant a :Restaurant ;
                       :restaurantName ?restaurantName .
            
            OPTIONAL { ?guide :languageSpoken ?language . }
            OPTIONAL { ?restaurant :cuisineType ?cuisine . }
    """
    
    filters = []
    if restaurant_name:
        filters.append(f'REGEX(?restaurantName, "{restaurant_name}", "i")')
    if cuisine_type:
        filters.append(f'REGEX(?cuisine, "{cuisine_type}", "i")')
    
    if filters:
        query += f"    FILTER ({ ' && '.join(filters) })"
    
    query += "\n} ORDER BY ?guideName"
    
    sparql.setQuery(query)
    sparql.setReturnFormat(JSON)
    
    try:
        results = sparql.query().convert()
        return jsonify(results['results']['bindings'])
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/search/tourist-itinerary', methods=['GET'])
def tourist_itinerary():
    """
    Reconstruit l'itinéraire complet d'un touriste
    """
    tourist_name = request.args.get('tourist_name', '')
    
    sparql = SPARQLWrapper(FUSEKI_URL)
    
    query = """
        PREFIX : <http://www.fairtravel.com/fairtravel#>
        PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
        
        SELECT ?tourist ?touristName ?touristAge ?guide ?guideName ?language ?restaurant ?restaurantName ?cuisine
        WHERE {
            ?tourist a :Tourist ;
                     :touristName ?touristName .
            
            OPTIONAL { ?tourist :touristAge ?touristAge . }
            OPTIONAL { 
                ?tourist :guidedBy ?guide .
                ?guide a :Guide ;
                       :guideName ?guideName .
                OPTIONAL { ?guide :languageSpoken ?language . }
            }
            OPTIONAL { 
                ?tourist :visitsRestaurant ?restaurant .
                ?restaurant a :Restaurant ;
                           :restaurantName ?restaurantName .
                OPTIONAL { ?restaurant :cuisineType ?cuisine . }
            }
    """
    
    if tourist_name:
        query += f'    FILTER (REGEX(?touristName, "{tourist_name}", "i"))'
    
    query += "\n} ORDER BY ?touristName"
    
    sparql.setQuery(query)
    sparql.setReturnFormat(JSON)
    
    try:
        results = sparql.query().convert()
        
        # Structurer les résultats par touriste
        itineraries = {}
        for result in results['results']['bindings']:
            tourist_uri = result['tourist']['value']
            
            if tourist_uri not in itineraries:
                itineraries[tourist_uri] = {
                    'tourist': {
                        'uri': tourist_uri,
                        'name': result['touristName']['value'],
                        'age': result.get('touristAge', {}).get('value')
                    },
                    'guides': [],
                    'restaurants': []
                }
            
            # Ajouter le guide s'il existe
            if 'guide' in result and result['guide']['value']:
                guide_info = {
                    'uri': result['guide']['value'],
                    'name': result.get('guideName', {}).get('value'),
                    'language': result.get('language', {}).get('value')
                }
                # Éviter les doublons
                if not any(g['uri'] == guide_info['uri'] for g in itineraries[tourist_uri]['guides']):
                    itineraries[tourist_uri]['guides'].append(guide_info)
            
            # Ajouter le restaurant s'il existe
            if 'restaurant' in result and result['restaurant']['value']:
                restaurant_info = {
                    'uri': result['restaurant']['value'],
                    'name': result.get('restaurantName', {}).get('value'),
                    'cuisine': result.get('cuisine', {}).get('value')
                }
                # Éviter les doublons
                if not any(r['uri'] == restaurant_info['uri'] for r in itineraries[tourist_uri]['restaurants']):
                    itineraries[tourist_uri]['restaurants'].append(restaurant_info)
        
        return jsonify({
            'itineraries': list(itineraries.values()),
            'total': len(itineraries)
        })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

def get_formatted_individual_details(uri):
    """Récupère les détails d'un individu avec formatage amélioré"""
    try:
        raw_details = get_individual_details(uri)
        if not raw_details:
            return {'error': 'No details found'}
            
        formatted_details = {}
        
        for key, value in raw_details.items():
            # Extraire le nom simple de la propriété
            if '#' in key:
                prop_name = key.split('#')[-1]
            else:
                prop_name = key.split('/')[-1]
            
            # Formater la valeur
            formatted_value = format_individual_value(value)
            formatted_details[prop_name] = formatted_value
            
        return formatted_details
        
    except Exception as e:
        print(f"Error in get_formatted_individual_details: {str(e)}")
        return {'error': str(e)}

def format_individual_value(value):
    """Formate une valeur d'individu pour l'affichage"""
    if isinstance(value, str):
        # Si c'est une URI FairTravel, extraire seulement le nom
        if value.startswith('http://www.fairtravel.com/fairtravel#'):
            return value.split('#')[-1]
        # Garder la valeur telle quelle pour les autres strings
        return value
    # Pour les nombres, les retourner directement
    return value

def add_individual(class_name, properties):
    # Generate a unique URI for the new individual
    individual_id = properties.get('id', str(uuid.uuid4()))
    individual_uri = f"http://www.fairtravel.com/fairtravel#{individual_id}"
    
    # Build triples list
    triples = []
    
    # Add type declaration
    triples.append(f'<{individual_uri}> rdf:type :{class_name}')
    
    # Define property types for each class
    property_types = {
        'Tourist': {
            'touristName': ('string', 'xsd:string'),
            'touristAge': ('integer', 'xsd:integer'),
            'guidedBy': ('object', None),
            'visitsRestaurant': ('object', None)
        },
        'Guide': {
            'guideName': ('string', 'xsd:string'),
            'languageSpoken': ('string', 'xsd:string'),
            'worksAt': ('object', None)
        },
        'Restaurant': {
            'restaurantName': ('string', 'xsd:string'),
            'cuisineType': ('string', 'xsd:string'),
            'averagePrice': ('float', 'xsd:float'),
            'locatedIn': ('object', None)
        }
    }

    for prop, value in properties.items():
        if prop == 'id' or value is None or value == '':
            continue
            
        prop_info = property_types.get(class_name, {}).get(prop, ('string', 'xsd:string'))
        prop_type, xsd_type = prop_info
        
        if prop_type == 'object':
            # Handle object properties (relationships)
            if not value.startswith('http://'):
                value_uri = f"http://www.fairtravel.com/fairtravel#{value}"
            else:
                value_uri = value
            triples.append(f'<{individual_uri}> :{prop} <{value_uri}>')
        else:
            # Handle data properties
            if prop_type == 'float':
                try:
                    float_value = float(value)
                    triples.append(f'<{individual_uri}> :{prop} "{float_value}"^^xsd:float')
                except (ValueError, TypeError):
                    continue
            elif prop_type == 'integer':
                try:
                    int_value = int(value)
                    triples.append(f'<{individual_uri}> :{prop} "{int_value}"^^xsd:integer')
                except (ValueError, TypeError):
                    continue
            else:
                # String properties
                clean_value = str(value).strip().replace('"', '\\"')
                triples.append(f'<{individual_uri}> :{prop} "{clean_value}"^^xsd:string')

    # Build the SPARQL query
    if len(triples) > 0:
        triples_str = ' .\n            '.join(triples)
        sparql_query = f"""
            PREFIX : <http://www.fairtravel.com/fairtravel#>
            PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
            PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
            INSERT DATA {{
                {triples_str} .
            }}
        """
        
        print("SPARQL Query:", sparql_query)
        
        try:
            sparql = SPARQLWrapper(FUSEKI_UPDATE_URL)
            sparql.setMethod('POST')
            sparql.setQuery(sparql_query)
            result = sparql.query()
            return individual_uri
        except Exception as e:
            print(f"SPARQL Error: {e}")
            raise e
    else:
        raise Exception("No valid properties to insert")

def update_individual(uri, properties):
    try:
        # First delete existing properties (except rdf:type)
        # Correction de la requête DELETE - syntaxe SPARQL correcte
        delete_query = f"""
            PREFIX : <http://www.fairtravel.com/fairtravel#>
            PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
            DELETE {{
                <{uri}> ?p ?o .
            }}
            WHERE {{
                <{uri}> ?p ?o .
                FILTER (?p != rdf:type)
            }}
        """
        
        sparql = SPARQLWrapper(FUSEKI_UPDATE_URL)
        sparql.setMethod('POST')
        sparql.setQuery(delete_query)
        sparql.query()
        
        # Then insert new properties
        triples = []
        
        # Always re-add the type declaration
        # Determine the type from the URI or properties
        if 'Tourist' in uri or 'tourist' in uri.lower():
            triples.append(f'<{uri}> rdf:type :Tourist')
        elif 'Guide' in uri or 'guide' in uri.lower():
            triples.append(f'<{uri}> rdf:type :Guide')
        elif 'Restaurant' in uri or 'restaurant' in uri.lower():
            triples.append(f'<{uri}> rdf:type :Restaurant')
        
        property_types = {
            'touristName': 'string', 'guideName': 'string', 'restaurantName': 'string',
            'touristAge': 'integer', 'averagePrice': 'float',
            'cuisineType': 'string', 'languageSpoken': 'string'
        }
        
        for prop, value in properties.items():
            if prop == 'id' or prop == 'uri' or value is None or value == '':
                continue
                
            prop_type = property_types.get(prop, 'string')
            
            if prop in ['guidedBy', 'visitsRestaurant', 'worksAt', 'locatedIn']:
                # Object property
                if not value.startswith('http://'):
                    value_uri = f"http://www.fairtravel.com/fairtravel#{value}"
                else:
                    value_uri = value
                triples.append(f'<{uri}> :{prop} <{value_uri}>')
            else:
                # Data property
                if prop_type == 'float':
                    try:
                        float_value = float(value)
                        triples.append(f'<{uri}> :{prop} "{float_value}"^^xsd:float')
                    except (ValueError, TypeError):
                        continue
                elif prop_type == 'integer':
                    try:
                        int_value = int(value)
                        triples.append(f'<{uri}> :{prop} "{int_value}"^^xsd:integer')
                    except (ValueError, TypeError):
                        continue
                else:
                    clean_value = str(value).strip().replace('"', '\\"')
                    triples.append(f'<{uri}> :{prop} "{clean_value}"^^xsd:string')
        
        if triples:
            triples_str = ' .\n            '.join(triples)
            insert_query = f"""
                PREFIX : <http://www.fairtravel.com/fairtravel#>
                PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
                PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
                INSERT DATA {{
                    {triples_str} .
                }}
            """
            print("INSERT QUERY:", insert_query)  # Debug log
            sparql.setQuery(insert_query)
            sparql.query()
            
    except Exception as e:
        print(f"Update error: {e}")
        raise e

def format_value(value):
    """Formate une valeur pour l'affichage"""
    if isinstance(value, str):
        # Si c'est une URI FairTravel, extraire le nom simple
        if value.startswith('http://www.fairtravel.com/fairtravel#'):
            return value.split('#')[-1]
        # Si c'est une autre URI, extraire la partie significative
        elif value.startswith('http://'):
            parts = value.split('/')
            return parts[-1] if parts else value
    # Pour les nombres, les retourner directement
    return value


@app.route('/api/chat', methods=['POST'])
def chat_with_ai():
    """Endpoint simple pour tester l'IA"""
    data = request.get_json()
    user_message = data.get('message', '')
    
    if not user_message:
        return jsonify({'error': 'Message vide'}), 400
    
    try:
        client = Groq(api_key=GROQ_API_KEY)
        
        completion = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {
                    "role": "system",
                    "content": "Tu es un assistant spécialisé dans le tourisme durable. Réponds de manière concise et utile."
                },
                {
                    "role": "user", 
                    "content": user_message
                }
            ],
            temperature=0.7,
            max_tokens=1024,
            top_p=1,
            stream=False,  # Commencez avec stream=False, c'est plus simple
            stop=None
        )
        
        response = completion.choices[0].message.content
        
        return jsonify({
            'success': True,
            'question': user_message,
            'response': response,
            'model': 'llama-3.3-70b-versatile'
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

# ================== SEMANTIC AI CHATBOT (ENGLISH ONLY) ==================

@app.route('/api/semantic-query', methods=['POST'])
def semantic_query():
    """
    AI Semantic Chatbot - Translates natural language to SPARQL
    """
    data = request.get_json()
    question = data.get('question', '').strip()
    
    if not question:
        return jsonify({'error': 'Please provide a question'}), 400

    GROQ_API_KEY = os.getenv('GROQ_API_KEY')
    if not GROQ_API_KEY:
        return jsonify({'error': 'Groq API key not configured'}), 500

    try:
        # First try predefined queries (more reliable)
        predefined_result = try_predefined_queries(question)
        if predefined_result:
            return predefined_result
        
        # Fallback to AI generation
        return generate_ai_query(question)

    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

def try_predefined_queries(question):
    """Try to match question with predefined SPARQL queries"""
    question_lower = question.lower()
    
    # Enhanced query mapping with better pattern matching
    query_mapping = [
        {
            'patterns': ['vegetarian', 'vegetarian cuisine', 'vegetarian restaurant'],
            'query': """
                PREFIX : <http://www.fairtravel.com/fairtravel#>
                SELECT ?restaurant ?name ?cuisine WHERE {
                    ?restaurant a :Restaurant ;
                               :restaurantName ?name ;
                               :cuisineType ?cuisine .
                    FILTER(REGEX(?cuisine, "Vegetarian", "i"))
                }
            """,
            'description': 'Vegetarian restaurants'
        },
        {
            'patterns': ['guided by ali', 'tourists guided by ali', 'ali guide'],
            'query': """
                PREFIX : <http://www.fairtravel.com/fairtravel#>
                SELECT ?tourist ?name WHERE {
                    ?tourist a :Tourist ;
                             :touristName ?name ;
                             :guidedBy :AliGuide .
                }
            """,
            'description': 'Tourists guided by Ali'
        },
        {
            'patterns': ['count tourists', 'how many tourists', 'number of tourists'],
            'query': """
                PREFIX : <http://www.fairtravel.com/fairtravel#>
                SELECT (COUNT(?tourist) as ?count) WHERE {
                    ?tourist a :Tourist .
                }
            """,
            'description': 'Count all tourists'
        },
        {
            'patterns': ['french speaking', 'french guides', 'guides speak french'],
            'query': """
                PREFIX : <http://www.fairtravel.com/fairtravel#>
                SELECT ?guide ?name ?language WHERE {
                    ?guide a :Guide ;
                           :guideName ?name ;
                           :languageSpoken ?language .
                    FILTER(REGEX(?language, "French", "i"))
                }
            """,
            'description': 'French speaking guides'
        },
        {
            'patterns': ['young tourists', 'tourists under 30', 'age under 30'],
            'query': """
                PREFIX : <http://www.fairtravel.com/fairtravel#>
                SELECT ?tourist ?name ?age WHERE {
                    ?tourist a :Tourist ;
                             :touristName ?name ;
                             :touristAge ?age .
                    FILTER(?age < 30)
                }
            """,
            'description': 'Young tourists (under 30)'
        },
        {
            'patterns': ['hiba restaurant', 'restaurants visited by hiba', 'hiba visits'],
            'query': """
                PREFIX : <http://www.fairtravel.com/fairtravel#>
                SELECT ?restaurant ?name ?cuisine WHERE {
                    :HibaTourist :visitsRestaurant ?restaurant .
                    ?restaurant :restaurantName ?name ;
                               :cuisineType ?cuisine .
                }
            """,
            'description': 'Restaurants visited by Hiba'
        },
        {
            'patterns': ['all restaurants', 'list restaurants', 'show restaurants'],
            'query': """
                PREFIX : <http://www.fairtravel.com/fairtravel#>
                SELECT ?restaurant ?name ?cuisine WHERE {
                    ?restaurant a :Restaurant ;
                               :restaurantName ?name .
                    OPTIONAL { ?restaurant :cuisineType ?cuisine . }
                }
            """,
            'description': 'All restaurants'
        },
        {
            'patterns': ['tourists restaurants', 'visited restaurants', 'tourists and restaurants'],
            'query': """
                PREFIX : <http://www.fairtravel.com/fairtravel#>
                SELECT ?tourist ?touristName ?restaurant ?restaurantName WHERE {
                    ?tourist a :Tourist ;
                             :touristName ?touristName ;
                             :visitsRestaurant ?restaurant .
                    ?restaurant :restaurantName ?restaurantName .
                }
            """,
            'description': 'Tourists and their visited restaurants'
        },
        {
            'patterns': ['restaurants guides', 'guides associated', 'restaurants and guides'],
            'query': """
                PREFIX : <http://www.fairtravel.com/fairtravel#>
                SELECT ?restaurant ?restaurantName ?guide ?guideName ?language WHERE {
                    ?guide a :Guide ;
                           :guideName ?guideName ;
                           :languageSpoken ?language ;
                           :worksAt ?restaurant .
                    ?restaurant :restaurantName ?restaurantName .
                }
            """,
            'description': 'Restaurants and their associated guides'
        },
        {
            'patterns': ['all tourists', 'list tourists', 'show tourists'],
            'query': """
                PREFIX : <http://www.fairtravel.com/fairtravel#>
                SELECT ?tourist ?name ?age WHERE {
                    ?tourist a :Tourist ;
                             :touristName ?name .
                    OPTIONAL { ?tourist :touristAge ?age . }
                }
            """,
            'description': 'All tourists'
        }
    ]
    
    # Find the best matching query
    best_match = None
    best_score = 0
    
    for mapping in query_mapping:
        score = 0
        for pattern in mapping['patterns']:
            if pattern in question_lower:
                score += 1
                # Bonus for longer/more specific patterns
                if len(pattern) > 10:
                    score += 0.5
        
        if score > best_score:
            best_score = score
            best_match = mapping
    
    # Minimum threshold to avoid bad matches
    if best_score >= 1:
        sparql_query = best_match['query']
        
        # Execute the query
        sparql = SPARQLWrapper(FUSEKI_URL)
        sparql.setQuery(sparql_query)
        sparql.setReturnFormat(JSON)
        results = sparql.query().convert()
        
        return jsonify({
            'success': True,
            'question': question,
            'sparql_query': sparql_query,
            'results': results['results']['bindings'],
            'result_count': len(results['results']['bindings']),
            'method': f"predefined: {best_match['description']}",
            'match_score': best_score
        })
    
    return None

def generate_ai_query(question):
    """Generate SPARQL query using AI as fallback"""
    client = Groq(api_key=os.getenv('GROQ_API_KEY'))
    
    prompt = f"""
TU ES UN EXPERT SPARQL. GÉNÈRE UNIQUEMENT DU CODE SPARQL VALIDE.

QUESTION: "{question}"

ONTOLOGIE EXACTE DE FAIRTRAVEL (fichier.ttl) :

CLASSES:
- :Tourist (ex: :HibaTourist, :JohnDoe, :AliceTourist)
- :Guide (ex: :AliGuide) 
- :Restaurant (ex: :BioBistro)

PROPRIÉTÉS DE DONNÉES:
- :touristName, :touristAge (pour Tourist)
- :guideName, :languageSpoken (pour Guide)
- :restaurantName, :cuisineType, :averagePrice (pour Restaurant)

PROPRIÉTÉS D'OBJET:
- :guidedBy (Tourist → Guide)
- :visitsRestaurant (Tourist → Restaurant)
- :worksAt (Guide → Restaurant)

INDIVIDUS CONNUS:
- Tourists: :HibaTourist (nom: "Hiba", âge: 24), :JohnDoe, :AliceTourist
- Guides: :AliGuide (nom: "Ali Ben Salah", langue: "French")
- Restaurants: :BioBistro (nom: "Bio Bistro Tunis", cuisine: "Vegetarian")

EXEMPLES DE REQUÊTES VALIDES:

1. Restaurants et leurs guides:
PREFIX : <http://www.fairtravel.com/fairtravel#>
SELECT ?restaurantName ?guideName WHERE {{
  ?guide a :Guide ; :guideName ?guideName ; :worksAt ?restaurant .
  ?restaurant :restaurantName ?restaurantName .
}}

2. Touristes et restaurants visités:
PREFIX : <http://www.fairtravel.com/fairtravel#>
SELECT ?touristName ?restaurantName WHERE {{
  ?tourist a :Tourist ; :touristName ?touristName ; :visitsRestaurant ?restaurant .
  ?restaurant :restaurantName ?restaurantName .
}}

3. Guides parlant français:
PREFIX : <http://www.fairtravel.com/fairtravel#>
SELECT ?guideName ?language WHERE {{
  ?guide a :Guide ; :guideName ?guideName ; :languageSpoken ?language .
  FILTER(REGEX(?language, "French", "i"))
}}

RÈGLES CRITIQUES:
- UTILISE les individus exacts (:HibaTourist, :AliGuide, :BioBistro)
- PAS de BIND() - ça cause des erreurs
- TOUJOURS commencer par PREFIX
- Les noms de variables en anglais (?name, ?age, ?cuisine)
- Pour les filtres texte: FILTER(REGEX(?var, "term", "i"))

GÉNÈRE UNIQUEMENT LE CODE SPARQL POUR LA QUESTION CI-DESSUS:
"""
    
    try:
        chat_completion = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {
                    "role": "system", 
                    "content": "Tu es un expert SPARQL. Tu génères UNIQUEMENT du code SPARQL valide. Pas d'explications, pas de texte en langage naturel, juste du code SPARQL. N'utilise JAMAIS la clause BIND."
                },
                {
                    "role": "user", 
                    "content": prompt
                }
            ],
            temperature=0.1,
            max_tokens=512,
            stream=False
        )

        sparql_query = chat_completion.choices[0].message.content.strip()
        print(f"🔍 Requête générée par IA: {sparql_query}")
        
        # Nettoyage agressif
        sparql_query = clean_sparql_query(sparql_query)
        
        # Validation de la requête
        if not validate_sparql_syntax(sparql_query):
            raise Exception("Syntaxe SPARQL invalide générée par l'IA")
            
        # Exécution de la requête
        sparql = SPARQLWrapper(FUSEKI_URL)
        sparql.setQuery(sparql_query)
        sparql.setReturnFormat(JSON)
        results = sparql.query().convert()
        
        return jsonify({
            'success': True,
            'question': question,
            'sparql_query': sparql_query,
            'results': results['results']['bindings'],
            'result_count': len(results['results']['bindings']),
            'method': 'ai_generated'
        })
        
    except Exception as e:
        print(f"❌ Erreur avec requête IA: {str(e)}")
        # Fallback: essayer une requête générique simple
        return try_fallback_query(question, sparql_query if 'sparql_query' in locals() else None)

def validate_sparql_syntax(query):
    """Validation basique de la syntaxe SPARQL"""
    if not query:
        return False
    if not query.strip().startswith('PREFIX'):
        return False
    if 'BIND(' in query.upper():
        return False
    if 'SELECT' not in query.upper():
        return False
    if '{' not in query or '}' not in query:
        return False
    return True

def try_fallback_query(question, generated_query=None):
    """Fallback pour les requêtes IA qui échouent"""
    question_lower = question.lower()
    
    # Requêtes fallback basiques basées sur des mots-clés
    if any(word in question_lower for word in ['restaurant', 'guide', 'associated', 'work']):
        fallback_query = """
            PREFIX : <http://www.fairtravel.com/fairtravel#>
            SELECT ?restaurantName ?guideName WHERE {
                ?guide a :Guide ; :guideName ?guideName ; :worksAt ?restaurant .
                ?restaurant :restaurantName ?restaurantName .
            }
        """
    elif any(word in question_lower for word in ['tourist', 'visit']):
        fallback_query = """
            PREFIX : <http://www.fairtravel.com/fairtravel#>
            SELECT ?touristName ?restaurantName WHERE {
                ?tourist a :Tourist ; :touristName ?touristName ; :visitsRestaurant ?restaurant .
                ?restaurant :restaurantName ?restaurantName .
            }
        """
    else:
        # Requête très générique pour explorer
        fallback_query = """
            PREFIX : <http://www.fairtravel.com/fairtravel#>
            SELECT ?s ?p ?o WHERE {
                ?s ?p ?o .
            } LIMIT 10
        """
    
    try:
        sparql = SPARQLWrapper(FUSEKI_URL)
        sparql.setQuery(fallback_query)
        sparql.setReturnFormat(JSON)
        results = sparql.query().convert()
        
        return jsonify({
            'success': True,
            'question': question,
            'sparql_query': fallback_query,
            'results': results['results']['bindings'],
            'result_count': len(results['results']['bindings']),
            'method': 'fallback_generic',
            'note': 'AI query failed, using fallback'
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': f"Both AI and fallback failed: {str(e)}",
            'generated_query': generated_query
        }), 400

def clean_sparql_query(query):
    """Nettoyage agressif de la requête SPARQL"""
    # Supprimer les blocs de code
    if '```sparql' in query:
        query = query.replace('```sparql', '').replace('```', '')
    elif '```' in query:
        query = query.replace('```', '')
    
    # Garder seulement à partir du PREFIX
    prefix_pos = query.find('PREFIX')
    if prefix_pos > 0:
        query = query[prefix_pos:]
    
    # Supprimer les clauses BIND problématiques
    lines = query.split('\n')
    clean_lines = []
    for line in lines:
        if 'BIND(' not in line and 'BIND (' not in line:
            clean_lines.append(line)
    query = '\n'.join(clean_lines)
    
    # S'assurer que la requête se termine correctement
    if not query.strip().endswith('}'):
        # Trouver la dernière accolade fermante
        last_brace = query.rfind('}')
        if last_brace != -1:
            query = query[:last_brace + 1]
    
    return query.strip()

@app.route('/api/demo-queries', methods=['GET'])
def demo_queries():
    """
    Return example questions for testing
    """
    examples = [
        {
            "category": "🍽️ Restaurants",
            "questions": [
                "Which restaurants serve vegetarian cuisine?",
                "Show me all restaurants in Tunis",
                "Which restaurants were visited by Hiba?",
                "How many restaurants offer local cuisine?"
            ]
        },
        {
            "category": "👨‍🏫 Guides",
            "questions": [
                "Which guides speak French?",
                "How many tourists are guided by Ali?",
                "Which guides work at Bio Bistro?",
                "Show me all available guides"
            ]
        },
        {
            "category": "👥 Tourists",
            "questions": [
                "Which tourists have visited restaurants?",
                "How many tourists are in the database?",
                "Which tourists are over 30 years old?",
                "Show me tourists with their guides"
            ]
        },
        {
            "category": "🎯 Complex Queries",
            "questions": [
                "Which vegetarian restaurants are visited by young tourists?",
                "How many French-speaking guides work in vegetarian restaurants?",
                "Show me restaurants and their associated guides"
            ]
        }
    ]
    
    return jsonify({
        'examples': examples,
        'total_categories': len(examples),
        'total_questions': sum(len(cat['questions']) for cat in examples)
    })

@app.route('/api/data-stats', methods=['GET'])
def data_stats():
    """
    Return statistics about available data
    """
    sparql = SPARQLWrapper(FUSEKI_URL)
    
    stats_queries = {
        "total_tourists": "SELECT (COUNT(?t) as ?count) WHERE { ?t a :Tourist . }",
        "total_guides": "SELECT (COUNT(?g) as ?count) WHERE { ?g a :Guide . }",
        "total_restaurants": "SELECT (COUNT(?r) as ?count) WHERE { ?r a :Restaurant . }",
        "tourists_with_age": "SELECT (COUNT(?t) as ?count) WHERE { ?t a :Tourist ; :touristAge ?age . }",
        "vegetarian_restaurants": """
            SELECT (COUNT(?r) as ?count) WHERE { 
                ?r a :Restaurant ; :cuisineType ?cuisine . 
                FILTER(REGEX(?cuisine, "Vegetarian", "i"))
            }
        """,
        "french_speaking_guides": """
            SELECT (COUNT(?g) as ?count) WHERE { 
                ?g a :Guide ; :languageSpoken ?lang . 
                FILTER(REGEX(?lang, "French", "i"))
            }
        """
    }
    
    stats = {}
    for key, query in stats_queries.items():
        sparql.setQuery(f"PREFIX : <http://www.fairtravel.com/fairtravel#> {query}")
        sparql.setReturnFormat(JSON)
        try:
            results = sparql.query().convert()
            if results['results']['bindings']:
                stats[key] = results['results']['bindings'][0]['count']['value']
        except Exception as e:
            stats[key] = f"Error: {str(e)}"
    
    return jsonify(stats)
############################# Hiba #################################


def list_entities(class_name):
    sparql = SPARQLWrapper(FUSEKI_URL)
    sparql.setQuery(f"""
        PREFIX : <http://www.fairtravel.com/fairtravel#>
        SELECT ?entity WHERE {{ ?entity a :{class_name} . }}
    """)
    sparql.setReturnFormat(JSON)
    results = sparql.query().convert()
    return [r['entity']['value'] for r in results['results']['bindings'] if r['entity']['type'] == 'uri']


@app.route('/bookings')
def get_bookings():
    return jsonify(list_entities('Booking'))

@app.route('/sustainability-practices')
def get_sustainability_practices():
    return jsonify(list_entities('SustainabilityPractice'))


@app.route('/locations')
def get_locations():
    """List all Location individuals"""
    return jsonify(list_entities('Location'))

def get_details(uri):
    if not uri:
        return jsonify({'error': 'Missing uri parameter'}), 400
    sparql = SPARQLWrapper(FUSEKI_URL)
    sparql.setQuery(f"""
        SELECT ?property ?value WHERE {{ <{uri}> ?property ?value . }}
    """)
    sparql.setReturnFormat(JSON)
    results = sparql.query().convert()
    details = { r['property']['value']: r['value']['value'] for r in results['results']['bindings'] }
    return details


@app.route('/accommodations')
def get_accommodations():
    return jsonify(list_entities('Accommodation'))

@app.route('/accommodation-details')
def accommodation_details():
    return jsonify(get_details(request.args.get('uri')))

# ------------------------
# CREATE - Add new accommodation
# ------------------------
@app.route('/accommodations', methods=['POST'])
def create_accommodation():
    try:
        data = request.get_json()
        accommodation_id = data.get('id')
        accommodation_type = data.get('type', 'Accommodation')
        properties = data.get('properties', {})

        if not accommodation_id:
            return jsonify({'error': 'Accommodation ID is required'}), 400

        # Build triples
        triples = [f":{accommodation_id} a :{accommodation_type} ."]

        # Data properties
        if 'accommodationName' in properties:
            triples.append(f':{accommodation_id} :accommodationName "{properties["accommodationName"]}" .')
        if 'pricePerNight' in properties:
            triples.append(f':{accommodation_id} :pricePerNight {properties["pricePerNight"]} .')
        if 'capacity' in properties:
            triples.append(f':{accommodation_id} :capacity {properties["capacity"]} .')
        if 'starRating' in properties:
            triples.append(f':{accommodation_id} :starRating {properties["starRating"]} .')
        if 'description' in properties:
            triples.append(f':{accommodation_id} :description "{properties["description"]}" .')
        if 'availabilityStatus' in properties:
            triples.append(f':{accommodation_id} :availabilityStatus {str(properties["availabilityStatus"]).lower()} .')

        # Object properties
        if 'hasLocation' in properties:
            triples.append(f':{accommodation_id} :hasLocation :{properties["hasLocation"]} .')
        if 'hasSustainabilityPractice' in properties:
            triples.append(f':{accommodation_id} :hasSustainabilityPractice :{properties["hasSustainabilityPractice"]} .')

        insert_query = f"""
            PREFIX : <http://www.fairtravel.com/fairtravel#>
            INSERT DATA {{
                {' '.join(triples)}
            }}
        """

        sparql = SPARQLWrapper(FUSEKI_UPDATE_URL)
        sparql.setQuery(insert_query)
        sparql.setMethod('POST')
        sparql.query()

        return jsonify({'message': 'Accommodation created successfully', 'id': accommodation_id}), 201

    except Exception as e:
        return jsonify({'error': str(e)}), 500


# ------------------------
# UPDATE - Modify accommodation
# ------------------------
@app.route('/accommodations/<accommodation_id>', methods=['PUT'])
def update_accommodation(accommodation_id):
    try:
        data = request.get_json()
        properties = data.get('properties', {})

        if not properties:
            return jsonify({'error': 'No properties to update'}), 400

        delete_triples = []
        insert_triples = []
        where_clauses = []

        for prop, value in properties.items():
            delete_triples.append(f':{accommodation_id} :{prop} ?old_{prop}')
            where_clauses.append(f'OPTIONAL {{ :{accommodation_id} :{prop} ?old_{prop} }}')

            if isinstance(value, bool):
                insert_triples.append(f':{accommodation_id} :{prop} {str(value).lower()}')
            elif isinstance(value, int) or isinstance(value, float):
                insert_triples.append(f':{accommodation_id} :{prop} {value}')
            elif prop in ['hasLocation', 'hasSustainabilityPractice']:
                insert_triples.append(f':{accommodation_id} :{prop} :{value}')
            else:
                insert_triples.append(f':{accommodation_id} :{prop} "{value}"')

        update_query = f"""
            PREFIX : <http://www.fairtravel.com/fairtravel#>
            DELETE {{
                {' . '.join(delete_triples)} .
            }}
            INSERT {{
                {' . '.join(insert_triples)} .
            }}
            WHERE {{
                {' '.join(where_clauses)}
            }}
        """

        sparql = SPARQLWrapper(FUSEKI_UPDATE_URL)
        sparql.setQuery(update_query)
        sparql.setMethod('POST')
        sparql.query()

        return jsonify({'message': 'Accommodation updated successfully', 'id': accommodation_id}), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500


# ------------------------
# DELETE - Remove accommodation
# ------------------------
@app.route('/accommodations/<accommodation_id>', methods=['DELETE'])
def delete_accommodation(accommodation_id):
    try:
        delete_query = f"""
            PREFIX : <http://www.fairtravel.com/fairtravel#>
            DELETE WHERE {{
                :{accommodation_id} ?p ?o .
            }}
        """

        sparql = SPARQLWrapper(FUSEKI_UPDATE_URL)
        sparql.setQuery(delete_query)
        sparql.setMethod('POST')
        sparql.query()

        return jsonify({'message': 'Accommodation deleted successfully', 'id': accommodation_id}), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500




@app.route('/booking-details')
def booking_details():
    return jsonify(get_details(request.args.get('uri')))

# ------------------------
# CREATE - Add new booking
# ------------------------
@app.route('/bookings', methods=['POST'])
def create_booking():
    try:
        data = request.get_json()
        booking_id = data.get('id')
        booking_type = data.get('type', 'Booking')
        properties = data.get('properties', {})

        if not booking_id:
            return jsonify({'error': 'Booking ID is required'}), 400

        # Build triples
        triples = [f":{booking_id} a :{booking_type} ."]

        # Data properties
        if 'bookingID' in properties:
            triples.append(f':{booking_id} :bookingID "{properties["bookingID"]}" .')
        if 'bookingDate' in properties:
            triples.append(f':{booking_id} :bookingDate "{properties["bookingDate"]}" .')
        if 'checkInDate' in properties:
            triples.append(f':{booking_id} :checkInDate "{properties["checkInDate"]}" .')
        if 'checkOutDate' in properties:
            triples.append(f':{booking_id} :checkOutDate "{properties["checkOutDate"]}" .')
        if 'totalPrice' in properties:
            triples.append(f':{booking_id} :totalPrice {properties["totalPrice"]} .')
        if 'paymentStatus' in properties:
            triples.append(f':{booking_id} :paymentStatus "{properties["paymentStatus"]}" .')

        # Object property
        if 'forAccommodation' in properties:
            triples.append(f':{booking_id} :forAccommodation :{properties["forAccommodation"]} .')

        insert_query = f"""
            PREFIX : <http://www.fairtravel.com/fairtravel#>
            INSERT DATA {{
                {' '.join(triples)}
            }}
        """

        sparql = SPARQLWrapper(FUSEKI_UPDATE_URL)
        sparql.setQuery(insert_query)
        sparql.setMethod('POST')
        sparql.query()

        return jsonify({'message': 'Booking created successfully', 'id': booking_id}), 201

    except Exception as e:
        return jsonify({'error': str(e)}), 500


# ------------------------
# UPDATE - Modify booking
# ------------------------
@app.route('/bookings/<booking_id>', methods=['PUT'])
def update_booking(booking_id):
    try:
        data = request.get_json()
        properties = data.get('properties', {})

        if not properties:
            return jsonify({'error': 'No properties to update'}), 400

        delete_triples = []
        insert_triples = []
        where_clauses = []

        for prop, value in properties.items():
            delete_triples.append(f':{booking_id} :{prop} ?old_{prop}')
            where_clauses.append(f'OPTIONAL {{ :{booking_id} :{prop} ?old_{prop} }}')

            # Detect type for SPARQL formatting
            if isinstance(value, bool):
                insert_triples.append(f':{booking_id} :{prop} {str(value).lower()}')
            elif isinstance(value, int) or isinstance(value, float):
                insert_triples.append(f':{booking_id} :{prop} {value}')
            elif prop == 'forAccommodation':
                insert_triples.append(f':{booking_id} :{prop} :{value}')
            else:
                insert_triples.append(f':{booking_id} :{prop} "{value}"')

        update_query = f"""
            PREFIX : <http://www.fairtravel.com/fairtravel#>
            DELETE {{
                {' . '.join(delete_triples)} .
            }}
            INSERT {{
                {' . '.join(insert_triples)} .
            }}
            WHERE {{
                {' '.join(where_clauses)}
            }}
        """

        sparql = SPARQLWrapper(FUSEKI_UPDATE_URL)
        sparql.setQuery(update_query)
        sparql.setMethod('POST')
        sparql.query()

        return jsonify({'message': 'Booking updated successfully', 'id': booking_id}), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500


# ------------------------
# DELETE - Remove booking
# ------------------------
@app.route('/bookings/<booking_id>', methods=['DELETE'])
def delete_booking(booking_id):
    try:
        delete_query = f"""
            PREFIX : <http://www.fairtravel.com/fairtravel#>
            DELETE WHERE {{
                :{booking_id} ?p ?o .
            }}
        """

        sparql = SPARQLWrapper(FUSEKI_UPDATE_URL)
        sparql.setQuery(delete_query)
        sparql.setMethod('POST')
        sparql.query()

        return jsonify({'message': 'Booking deleted successfully', 'id': booking_id}), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500
    


@app.route('/sustainability-details')
def sustainability_practice_details():
    return jsonify(get_details(request.args.get('uri')))

# ------------------------
# CREATE - Add new sustainability practice
# ------------------------
@app.route('/sustainability-practices', methods=['POST'])
def create_sustainability_practice():
    try:
        data = request.get_json()
        practice_id = data.get('id')
        practice_type = data.get('type', 'SustainabilityPractice')
        properties = data.get('properties', {})

        if not practice_id:
            return jsonify({'error': 'Practice ID is required'}), 400

        triples = [f":{practice_id} a :{practice_type} ."]

        # Data properties
        if 'practiceName' in properties:
            triples.append(f':{practice_id} :practiceName "{properties["practiceName"]}" .')
        if 'practiceType' in properties:
            triples.append(f':{practice_id} :practiceType "{properties["practiceType"]}" .')
        if 'impactLevel' in properties:
            triples.append(f':{practice_id} :impactLevel "{properties["impactLevel"]}" .')
        if 'description' in properties:
            triples.append(f':{practice_id} :description "{properties["description"]}" .')

        insert_query = f"""
            PREFIX : <http://www.fairtravel.com/fairtravel#>
            INSERT DATA {{
                {' '.join(triples)}
            }}
        """

        sparql = SPARQLWrapper(FUSEKI_UPDATE_URL)
        sparql.setQuery(insert_query)
        sparql.setMethod('POST')
        sparql.query()

        return jsonify({'message': 'Sustainability Practice created successfully', 'id': practice_id}), 201

    except Exception as e:
        return jsonify({'error': str(e)}), 500


# ------------------------
# UPDATE - Modify sustainability practice
# ------------------------
@app.route('/sustainability-practices/<practice_id>', methods=['PUT'])
def update_sustainability_practice(practice_id):
    try:
        data = request.get_json()
        properties = data.get('properties', {})

        if not properties:
            return jsonify({'error': 'No properties to update'}), 400

        delete_triples = []
        insert_triples = []
        where_clauses = []

        for prop, value in properties.items():
            delete_triples.append(f':{practice_id} :{prop} ?old_{prop}')
            where_clauses.append(f'OPTIONAL {{ :{practice_id} :{prop} ?old_{prop} }}')
            insert_triples.append(f':{practice_id} :{prop} "{value}"')

        update_query = f"""
            PREFIX : <http://www.fairtravel.com/fairtravel#>
            DELETE {{
                {' . '.join(delete_triples)} .
            }}
            INSERT {{
                {' . '.join(insert_triples)} .
            }}
            WHERE {{
                {' '.join(where_clauses)}
            }}
        """

        sparql = SPARQLWrapper(FUSEKI_UPDATE_URL)
        sparql.setQuery(update_query)
        sparql.setMethod('POST')
        sparql.query()

        return jsonify({'message': 'Sustainability Practice updated successfully', 'id': practice_id}), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500


# ------------------------
# DELETE - Remove sustainability practice
# ------------------------
@app.route('/sustainability-practices/<practice_id>', methods=['DELETE'])
def delete_sustainability_practice(practice_id):
    try:
        delete_query = f"""
            PREFIX : <http://www.fairtravel.com/fairtravel#>
            DELETE WHERE {{
                :{practice_id} ?p ?o .
            }}
        """

        sparql = SPARQLWrapper(FUSEKI_UPDATE_URL)
        sparql.setQuery(delete_query)
        sparql.setMethod('POST')
        sparql.query()

        return jsonify({'message': 'Sustainability Practice deleted successfully', 'id': practice_id}), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500

#========================================================================
# CRUD Operations for Service, Review and Award
#========================================================================

# URL for SPARQL UPDATE operations
FUSEKI_UPDATE_URL = "http://localhost:3030/FairTravel/update"

# ==================== SERVICE CRUD ====================

# READ - List all services (including subclasses)
@app.route('/services', methods=['GET'])
def get_services():
    sparql = SPARQLWrapper(FUSEKI_URL)
    sparql.setQuery("""
        PREFIX : <http://www.fairtravel.com/fairtravel#>
        PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
        SELECT ?service WHERE {
          ?type rdfs:subClassOf* :Service .
          ?service a ?type .
        }
    """)
    sparql.setReturnFormat(JSON)
    results = sparql.query().convert()
    services = [r['service']['value'] for r in results['results']['bindings'] if r['service']['type'] == 'uri']
    return jsonify(services)

# READ - Get service details
@app.route('/service-details', methods=['GET'])
def service_details():
    uri = request.args.get('uri')
    if not uri:
        return jsonify({'error': 'Missing uri parameter'}), 400
    return jsonify(get_details(uri))

# CREATE - Add new service
@app.route('/services', methods=['POST'])
def create_service():
    try:
        data = request.get_json()
        service_id = data.get('id')
        service_type = data.get('type', 'Service')  # Service, InformationCenter, LocalShop
        properties = data.get('properties', {})
        
        if not service_id:
            return jsonify({'error': 'Service ID is required'}), 400
        
        # Validation du type de service
        valid_service_types = ['Service', 'InformationCenter', 'LocalShop']
        if service_type not in valid_service_types:
            return jsonify({
                'error': f'Invalid service type. Must be one of: {", ".join(valid_service_types)}'
            }), 400
        
        # Build the INSERT query
        triples = [f":{service_id} a :{service_type} ."]
        
        # Add data properties
        if 'serviceName' in properties:
            triples.append(f':{service_id} :serviceName "{properties["serviceName"]}" .')
        if 'serviceType' in properties:
            triples.append(f':{service_id} :serviceType "{properties["serviceType"]}" .')
        if 'operatingHours' in properties:
            triples.append(f':{service_id} :operatingHours "{properties["operatingHours"]}" .')
        if 'contactInfo' in properties:
            triples.append(f':{service_id} :contactInfo "{properties["contactInfo"]}" .')
        if 'priceRange' in properties:
            triples.append(f':{service_id} :priceRange "{properties["priceRange"]}" .')
        if 'sustainabilityScore' in properties:
            triples.append(f':{service_id} :sustainabilityScore {properties["sustainabilityScore"]} .')
        if 'locallyOwned' in properties:
            triples.append(f':{service_id} :locallyOwned {str(properties["locallyOwned"]).lower()} .')
        if 'useLocalProducts' in properties:
            triples.append(f':{service_id} :useLocalProducts {str(properties["useLocalProducts"]).lower()} .')
        
        # Add object properties
        if 'locatedIn' in properties:
            triples.append(f':{service_id} :locatedIn :{properties["locatedIn"]} .')
        if 'complementsActivity' in properties:
            triples.append(f':{service_id} :complementsActivity :{properties["complementsActivity"]} .')
        if 'offeredBy' in properties:
            triples.append(f':{service_id} :offeredBy :{properties["offeredBy"]} .')
        if 'usedByTourist' in properties:
            triples.append(f':{service_id} :usedByTourist :{properties["usedByTourist"]} .')
        if 'hasReview' in properties:
            triples.append(f':{service_id} :hasReview :{properties["hasReview"]} .')
        if 'hasAward' in properties:
            triples.append(f':{service_id} :hasAward :{properties["hasAward"]} .')
        
        insert_query = f"""
            PREFIX : <http://www.fairtravel.com/fairtravel#>
            INSERT DATA {{
                {' '.join(triples)}
            }}
        """
        
        sparql = SPARQLWrapper(FUSEKI_UPDATE_URL)
        sparql.setQuery(insert_query)
        sparql.setMethod('POST')
        sparql.query()
        
        return jsonify({'message': 'Service created successfully', 'id': service_id}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# UPDATE - Modify service
@app.route('/services/<service_id>', methods=['PUT'])
def update_service(service_id):
    try:
        data = request.get_json()
        properties = data.get('properties', {})
        
        if not properties:
            return jsonify({'error': 'No properties to update'}), 400
        
        # Build DELETE and INSERT queries
        delete_triples = []
        insert_triples = []
        where_clauses = []
        
        for prop, value in properties.items():
            delete_triples.append(f':{service_id} :{prop} ?old_{prop}')
            where_clauses.append(f'OPTIONAL {{ :{service_id} :{prop} ?old_{prop} }}')
            
            if isinstance(value, bool):
                insert_triples.append(f':{service_id} :{prop} {str(value).lower()}')
            elif isinstance(value, int):
                insert_triples.append(f':{service_id} :{prop} {value}')
            elif prop in ['locatedIn', 'offeredBy', 'complementsActivity', 'usedByTourist', 'hasReview', 'hasAward']:
                insert_triples.append(f':{service_id} :{prop} :{value}')
            else:
                insert_triples.append(f':{service_id} :{prop} "{value}"')
        
        update_query = f"""
            PREFIX : <http://www.fairtravel.com/fairtravel#>
            DELETE {{
                {' . '.join(delete_triples)} .
            }}
            INSERT {{
                {' . '.join(insert_triples)} .
            }}
            WHERE {{
                {' '.join(where_clauses)}
            }}
        """
        
        sparql = SPARQLWrapper(FUSEKI_UPDATE_URL)
        sparql.setQuery(update_query)
        sparql.setMethod('POST')
        sparql.query()
        
        return jsonify({'message': 'Service updated successfully', 'id': service_id}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# DELETE - Remove service
@app.route('/services/<service_id>', methods=['DELETE'])
def delete_service(service_id):
    try:
        delete_query = f"""
            PREFIX : <http://www.fairtravel.com/fairtravel#>
            DELETE WHERE {{
                :{service_id} ?p ?o .
            }}
        """
        
        sparql = SPARQLWrapper(FUSEKI_UPDATE_URL)
        sparql.setQuery(delete_query)
        sparql.setMethod('POST')
        sparql.query()
        
        return jsonify({'message': 'Service deleted successfully', 'id': service_id}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# ==================== REVIEW CRUD ====================

# READ - List all reviews (including subclasses)
@app.route('/reviews', methods=['GET'])
def get_reviews():
    sparql = SPARQLWrapper(FUSEKI_URL)
    sparql.setQuery("""
        PREFIX : <http://www.fairtravel.com/fairtravel#>
        PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
        SELECT ?review WHERE {
          ?type rdfs:subClassOf* :Review .
          ?review a ?type .
        }
    """)
    sparql.setReturnFormat(JSON)
    results = sparql.query().convert()
    reviews = [r['review']['value'] for r in results['results']['bindings'] if r['review']['type'] == 'uri']
    return jsonify(reviews)

# READ - Get review details
@app.route('/review-details', methods=['GET'])
def review_details():
    uri = request.args.get('uri')
    if not uri:
        return jsonify({'error': 'Missing uri parameter'}), 400
    return jsonify(get_details(uri))

# CREATE - Add new review
@app.route('/reviews', methods=['POST'])
def create_review():
    try:
        data = request.get_json()
        review_id = data.get('id')
        review_type = data.get('type', 'Review')  # Review, ActivityReview, AccommodationReview, ServiceReview, TransportReview
        properties = data.get('properties', {})
        
        if not review_id:
            return jsonify({'error': 'Review ID is required'}), 400
        
        # Build the INSERT query
        triples = [f":{review_id} a :{review_type} ."]
        
        # Add data properties
        if 'rating' in properties:
            triples.append(f':{review_id} :rating {properties["rating"]} .')
        if 'reviewText' in properties:
            triples.append(f':{review_id} :reviewText "{properties["reviewText"]}" .')
        if 'reviewDate' in properties:
            triples.append(f':{review_id} :reviewDate "{properties["reviewDate"]}" .')
        if 'reviewerName' in properties:
            triples.append(f':{review_id} :reviewerName "{properties["reviewerName"]}" .')
        if 'sustainabilityRating' in properties:
            triples.append(f':{review_id} :sustainabilityRating {properties["sustainabilityRating"]} .')
        if 'mentionsSustainability' in properties:
            triples.append(f':{review_id} :mentionsSustainability {str(properties["mentionsSustainability"]).lower()} .')
        if 'verified' in properties:
            triples.append(f':{review_id} :verified {str(properties["verified"]).lower()} .')
        # Propriétés manquantes ajoutées
        if 'reviewTitle' in properties:
            triples.append(f':{review_id} :reviewTitle "{properties["reviewTitle"]}" .')
        if 'reviewerType' in properties:
            triples.append(f':{review_id} :reviewerType "{properties["reviewerType"]}" .')
        if 'overallRating' in properties:
            triples.append(f':{review_id} :overallRating {properties["overallRating"]} .')
        if 'sentiment' in properties:
            triples.append(f':{review_id} :sentiment "{properties["sentiment"]}" .')
        if 'ecoFriendlyPractices' in properties:
            triples.append(f':{review_id} :ecoFriendlyPractices "{properties["ecoFriendlyPractices"]}" .')
        
        # Add object properties
        if 'reviewedBy' in properties:
            triples.append(f':{review_id} :reviewedBy :{properties["reviewedBy"]} .')
        if 'reviewsActivity' in properties:
            triples.append(f':{review_id} :reviewsActivity :{properties["reviewsActivity"]} .')
        if 'reviewsAccommodation' in properties:
            triples.append(f':{review_id} :reviewsAccommodation :{properties["reviewsAccommodation"]} .')
        if 'reviewsService' in properties:
            triples.append(f':{review_id} :reviewsService :{properties["reviewsService"]} .')
        
        insert_query = f"""
            PREFIX : <http://www.fairtravel.com/fairtravel#>
            INSERT DATA {{
                {' '.join(triples)}
            }}
        """
        
        sparql = SPARQLWrapper(FUSEKI_UPDATE_URL)
        sparql.setQuery(insert_query)
        sparql.setMethod('POST')
        sparql.query()
        
        return jsonify({'message': 'Review created successfully', 'id': review_id}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# UPDATE - Modify review
@app.route('/reviews/<review_id>', methods=['PUT'])
def update_review(review_id):
    try:
        data = request.get_json()
        properties = data.get('properties', {})
        
        if not properties:
            return jsonify({'error': 'No properties to update'}), 400
        
        # Build DELETE and INSERT queries
        delete_triples = []
        insert_triples = []
        where_clauses = []
        
        for prop, value in properties.items():
            delete_triples.append(f':{review_id} :{prop} ?old_{prop}')
            where_clauses.append(f'OPTIONAL {{ :{review_id} :{prop} ?old_{prop} }}')
            
            if isinstance(value, bool):
                insert_triples.append(f':{review_id} :{prop} {str(value).lower()}')
            elif isinstance(value, int):
                insert_triples.append(f':{review_id} :{prop} {value}')
            elif prop in ['reviewedBy', 'reviewsActivity', 'reviewsAccommodation', 'reviewsService', 'reviewsTransport']:
                insert_triples.append(f':{review_id} :{prop} :{value}')
            else:
                insert_triples.append(f':{review_id} :{prop} "{value}"')
        
        update_query = f"""
            PREFIX : <http://www.fairtravel.com/fairtravel#>
            DELETE {{
                {' . '.join(delete_triples)} .
            }}
            INSERT {{
                {' . '.join(insert_triples)} .
            }}
            WHERE {{
                {' '.join(where_clauses)}
            }}
        """
        
        sparql = SPARQLWrapper(FUSEKI_UPDATE_URL)
        sparql.setQuery(update_query)
        sparql.setMethod('POST')
        sparql.query()
        
        return jsonify({'message': 'Review updated successfully', 'id': review_id}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# DELETE - Remove review
@app.route('/reviews/<review_id>', methods=['DELETE'])
def delete_review(review_id):
    try:
        delete_query = f"""
            PREFIX : <http://www.fairtravel.com/fairtravel#>
            DELETE WHERE {{
                :{review_id} ?p ?o .
            }}
        """
        
        sparql = SPARQLWrapper(FUSEKI_UPDATE_URL)
        sparql.setQuery(delete_query)
        sparql.setMethod('POST')
        sparql.query()
        
        return jsonify({'message': 'Review deleted successfully', 'id': review_id}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# ==================== AWARD CRUD ====================

# READ - List all awards
@app.route('/awards', methods=['GET'])
def get_awards():
    return jsonify(list_entities('Award'))

# READ - Get award details
@app.route('/award-details', methods=['GET'])
def award_details():
    uri = request.args.get('uri')
    if not uri:
        return jsonify({'error': 'Missing uri parameter'}), 400
    return jsonify(get_details(uri))

# CREATE - Add new award
@app.route('/awards', methods=['POST'])
def create_award():
    try:
        data = request.get_json()
        award_id = data.get('id')
        properties = data.get('properties', {})
        
        if not award_id:
            return jsonify({'error': 'Award ID is required'}), 400
        
        # Build the INSERT query
        triples = [f":{award_id} a :Award ."]
        
        # Add data properties (alignées avec l'ontologie)
        if 'awardName' in properties:
            triples.append(f':{award_id} :awardName "{properties["awardName"]}" .')
        if 'awardCategory' in properties:
            triples.append(f':{award_id} :awardCategory "{properties["awardCategory"]}" .')
        if 'awardDate' in properties:
            triples.append(f':{award_id} :awardDate "{properties["awardDate"]}" .')
        if 'awardDescription' in properties:
            triples.append(f':{award_id} :awardDescription "{properties["awardDescription"]}" .')
        if 'awardLevel' in properties:
            triples.append(f':{award_id} :awardLevel "{properties["awardLevel"]}" .')
        if 'certificateNumber' in properties:
            triples.append(f':{award_id} :certificateNumber "{properties["certificateNumber"]}" .')
        if 'issuingOrganization' in properties:
            triples.append(f':{award_id} :issuingOrganization "{properties["issuingOrganization"]}" .')
        if 'validUntil' in properties:
            triples.append(f':{award_id} :validUntil "{properties["validUntil"]}" .')
        
        # Note: receivedBy retiré car hasAward est la relation inverse utilisée
        
        insert_query = f"""
            PREFIX : <http://www.fairtravel.com/fairtravel#>
            INSERT DATA {{
                {' '.join(triples)}
            }}
        """
        
        sparql = SPARQLWrapper(FUSEKI_UPDATE_URL)
        sparql.setQuery(insert_query)
        sparql.setMethod('POST')
        sparql.query()
        
        return jsonify({'message': 'Award created successfully', 'id': award_id}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# UPDATE - Modify award
@app.route('/awards/<award_id>', methods=['PUT'])
def update_award(award_id):
    try:
        data = request.get_json()
        properties = data.get('properties', {})
        
        if not properties:
            return jsonify({'error': 'No properties to update'}), 400
        
        # Build DELETE and INSERT queries
        delete_triples = []
        insert_triples = []
        where_clauses = []
        
        for prop, value in properties.items():
            delete_triples.append(f':{award_id} :{prop} ?old_{prop}')
            where_clauses.append(f'OPTIONAL {{ :{award_id} :{prop} ?old_{prop} }}')
            
            # Toutes les propriétés d'Award sont des data properties (pas d'object properties)
            insert_triples.append(f':{award_id} :{prop} "{value}"')
        
        update_query = f"""
            PREFIX : <http://www.fairtravel.com/fairtravel#>
            DELETE {{
                {' . '.join(delete_triples)} .
            }}
            INSERT {{
                {' . '.join(insert_triples)} .
            }}
            WHERE {{
                {' '.join(where_clauses)}
            }}
        """
        
        sparql = SPARQLWrapper(FUSEKI_UPDATE_URL)
        sparql.setQuery(update_query)
        sparql.setMethod('POST')
        sparql.query()
        
        return jsonify({'message': 'Award updated successfully', 'id': award_id}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# DELETE - Remove award
@app.route('/awards/<award_id>', methods=['DELETE'])
def delete_award(award_id):
    try:
        delete_query = f"""
            PREFIX : <http://www.fairtravel.com/fairtravel#>
            DELETE WHERE {{
                :{award_id} ?p ?o .
            }}
        """
        
        sparql = SPARQLWrapper(FUSEKI_UPDATE_URL)
        sparql.setQuery(delete_query)
        sparql.setMethod('POST')
        sparql.query()
        
        return jsonify({'message': 'Award deleted successfully', 'id': award_id}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# AI API endpoint for natural language queries
@app.route('/api/ai-query', methods=['POST'])
def ai_query():
    data = request.get_json()
    question = data.get('question', '')

    # Get Groq API key from environment variable for security
    GROQ_API_KEY = os.getenv('GROQ_API_KEY', 'YOUR_GROQ_API_KEY_HERE')
    
    # Initialize Groq client
    try:
        client = Groq(api_key=GROQ_API_KEY)
    except TypeError as e:
        # Handle incompatible Groq library version
        return jsonify({
            'error': 'Groq client initialization failed. Please update the groq library: pip install --upgrade groq',
            'details': str(e)
        }), 500

    # Prompt for Groq to generate a SPARQL query from the user's question
    prompt = f"""Generate a SPARQL query for the FairTravel ontology.

Prefixes:
PREFIX : <http://www.fairtravel.com/fairtravel#>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>

Key rules:
- Activity has subclasses. Use: ?type rdfs:subClassOf* :Activity . ?activity a ?type .
- Use :locatedIn to link Activity to Location
- Location names are URIs (e.g., "AlpinePark" becomes :AlpinePark)

Important properties (use EXACTLY these names):
- Review properties: :reviewedBy (not writtenBy), :reviewTitle, :reviewerType, :overallRating (not hasRating), :sentiment (not hasSentiment), :ecoFriendlyPractices, :reviewContent, :reviewRating, :reviewDate, :reviewsEntity
- Award properties: :awardCategory (not awardType), :awardDate (not dateAwarded), :awardDescription (not description), :awardLevel (not level), :issuingOrganization (not awardedBy), :certificateNumber
- Service properties: :serviceName, :serviceType, :complementsActivity, :offeredBy, :hasReview, :hasAward


Examples:
Q: "List reviews with authors"
A: SELECT ?review ?author WHERE {{ ?review a :Review . ?review :reviewedBy ?author . }}

Q: "Show reviews with sentiment"
A: SELECT ?review ?sentiment WHERE {{ ?review a :Review . ?review :sentiment ?sentiment . }}

Q: "Find awards by category"
A: SELECT ?award ?category WHERE {{ ?award a :Award . ?award :awardCategory ?category . }}

Q: "Show me all outdoor activities in AlpinePark"
A: SELECT ?activity WHERE {{ ?type rdfs:subClassOf* :OutdoorActivity . ?activity a ?type . ?activity :locatedIn :AlpinePark . }}

Output only the SPARQL query, no explanations or code blocks.

Question: {question}"""

    try:
        chat_completion = client.chat.completions.create(
            messages=[
                {
                    "role": "system",
                    "content": "You are a semantic web assistant specializing in SPARQL query generation."
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            model="llama-3.3-70b-versatile",
            max_tokens=512
        )
        sparql_query = chat_completion.choices[0].message.content.strip()
        
        # Remove markdown code block markers if present
        if '```' in sparql_query:
            # Extract content between code block markers
            lines = sparql_query.split('\n')
            cleaned_lines = []
            in_code_block = False
            for line in lines:
                if line.strip().startswith('```'):
                    in_code_block = not in_code_block
                    continue
                if in_code_block or not '```' in sparql_query:
                    cleaned_lines.append(line)
            sparql_query = '\n'.join(cleaned_lines).strip()
        
        # Ensure prefixes are included in the query
        required_prefixes = """PREFIX : <http://www.fairtravel.com/fairtravel#>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>"""
        
        if 'PREFIX' not in sparql_query.upper():
            # Add prefixes if not present
            sparql_query = required_prefixes + '\n' + sparql_query
        elif 'PREFIX :' not in sparql_query:
            # PREFIX keyword exists but our prefix is missing
            sparql_query = required_prefixes + '\n' + sparql_query
        
        # Query Fuseki with the generated SPARQL
        sparql = SPARQLWrapper(FUSEKI_URL)
        sparql.setQuery(sparql_query)
        sparql.setReturnFormat(JSON)
        fuseki_results = sparql.query().convert()
        results = fuseki_results['results']['bindings']
    except Exception as e:
        sparql_query = f"Error: {str(e)}"
        results = []

    return jsonify({
        'question': question,
        'sparql_query': sparql_query,
        'results': results
    })

# CRUD endpoints for Activity
@app.route('/activities', methods=['POST'])
def create_activity():
    data = request.get_json()
    name = data.get('name')
    activity_type = data.get('type', 'Activity')
    location = data.get('location')
    # Generate a URI for the new activity
    activity_uri = f"http://www.fairtravel.com/fairtravel#{name}"
    # Build SPARQL INSERT DATA query
    sparql_insert = f'''
    PREFIX : <http://www.fairtravel.com/fairtravel#>
    INSERT DATA {{
      :{name} a :{activity_type} ;
        :activityName "{name}" ;
        :activityType "{activity_type}" ;
        :locatedIn :{location} .
    }}
    '''
    sparql = SPARQLWrapper(FUSEKI_UPDATE_URL)
    sparql.setQuery(sparql_insert)
    sparql.method = 'POSTDIRECTLY'  # Use POSTDIRECTLY for SPARQL update/insert
    try:
        sparql.query()
        return jsonify({'message': 'Activity created', 'uri': activity_uri}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/activities/<path:activity_uri>', methods=['PUT'])
def update_activity(activity_uri):
    data = request.get_json()
    name = data.get('name')
    activity_type = data.get('type', 'Activity')
    location = data.get('location')
    # URL decode and extract local name from URI
    decoded_uri = unquote(activity_uri)
    local_name = decoded_uri.split('#')[-1]
    sparql_update = f'''
    PREFIX : <http://www.fairtravel.com/fairtravel#>
    DELETE {{
      :{local_name} :activityName ?oldName .
      :{local_name} :activityType ?oldTypeProp .
      :{local_name} :locatedIn ?oldLocation .
      :{local_name} a ?oldType .
    }}
    INSERT {{
      :{local_name} a :{activity_type} .
      :{local_name} :activityName "{name}" .
      :{local_name} :activityType "{activity_type}" .
      :{local_name} :locatedIn :{location} .
    }}
    WHERE {{
      OPTIONAL {{ :{local_name} :activityName ?oldName }}
      OPTIONAL {{ :{local_name} :activityType ?oldTypeProp }}
      OPTIONAL {{ :{local_name} :locatedIn ?oldLocation }}
      OPTIONAL {{ :{local_name} a ?oldType }}
    }}
    '''
    sparql = SPARQLWrapper(FUSEKI_UPDATE_URL)
    sparql.setQuery(sparql_update)
    sparql.setMethod('POST')
    try:
        sparql.query()
        return jsonify({'message': 'Activity updated', 'uri': activity_uri}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/activities/<path:activity_uri>', methods=['DELETE'])
def delete_activity(activity_uri):
    # URL decode and extract local name from URI
    from urllib.parse import unquote
    decoded_uri = unquote(activity_uri)
    local_name = decoded_uri.split('#')[-1]
    sparql_delete = f'''
    PREFIX : <http://www.fairtravel.com/fairtravel#>
    DELETE WHERE {{
      :{local_name} ?p ?o .
    }}
    '''
    sparql = SPARQLWrapper(FUSEKI_UPDATE_URL)
    sparql.setQuery(sparql_delete)
    sparql.setMethod('POST')
    try:
        sparql.query()
        return jsonify({'message': 'Activity deleted', 'uri': decoded_uri}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/recommendations/<path:rec_uri>', methods=['PUT'])
def update_recommendation(rec_uri):
    from urllib.parse import unquote
    data = request.get_json()
    name = data.get('name')
    text = data.get('text')
    rating = data.get('rating')
    source = data.get('source')
    for_activity = data.get('for_activity')
    decoded_uri = unquote(rec_uri)
    local_name = decoded_uri.split('#')[-1]
    sparql_update = f'''
    PREFIX : <http://www.fairtravel.com/fairtravel#>
    DELETE {{
      :{local_name} :recommendationText ?oldText .
      :{local_name} :rating ?oldRating .
      :{local_name} :source ?oldSource .
      :{local_name} :forActivity ?oldForActivity .
      :{local_name} a ?oldType .
    }}
    INSERT {{
      :{local_name} a :Recommendation .
      :{local_name} :recommendationText "{text}" .
      :{local_name} :rating {rating} .
      :{local_name} :source "{source}" .
      :{local_name} :forActivity :{for_activity} .
    }}
    WHERE {{
      OPTIONAL {{ :{local_name} :recommendationText ?oldText }}
      OPTIONAL {{ :{local_name} :rating ?oldRating }}
      OPTIONAL {{ :{local_name} :source ?oldSource }}
      OPTIONAL {{ :{local_name} :forActivity ?oldForActivity }}
      OPTIONAL {{ :{local_name} a ?oldType }}
    }}
    '''
    sparql = SPARQLWrapper(FUSEKI_UPDATE_URL)
    sparql.setQuery(sparql_update)
    sparql.setMethod('POST')
    try:
        sparql.query()
        return jsonify({'message': 'Recommendation updated', 'uri': rec_uri}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/recommendations/<path:rec_uri>', methods=['DELETE'])
def delete_recommendation(rec_uri):
    from urllib.parse import unquote
    decoded_uri = unquote(rec_uri)
    local_name = decoded_uri.split('#')[-1]
    sparql_delete = f'''
    PREFIX : <http://www.fairtravel.com/fairtravel#>
    DELETE WHERE {{
      :{local_name} ?p ?o .
    }}
    '''
    sparql = SPARQLWrapper(FUSEKI_UPDATE_URL)
    sparql.setQuery(sparql_delete)
    sparql.setMethod('POST')
    try:
        sparql.query()
        return jsonify({'message': 'Recommendation deleted', 'uri': decoded_uri}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/events', methods=['POST'])
def create_event():
    data = request.get_json()
    name = data.get('name')
    event_type = data.get('eventType')
    organizer = data.get('organizer')
    price = data.get('price')
    event_date = data.get('eventDate')
    location = data.get('location')
    event_uri = f"http://www.fairtravel.com/fairtravel#{name}"
    sparql_insert = f'''
    PREFIX : <http://www.fairtravel.com/fairtravel#>
    INSERT DATA {{
      :{name} a :Event ;
        :eventType "{event_type}" ;
        :organizer "{organizer}" ;
        :price {price} ;
        :eventDate "{event_date}" ;
        :hasLocation :{location} .
    }}
    '''
    sparql = SPARQLWrapper(FUSEKI_UPDATE_URL)
    sparql.setQuery(sparql_insert)
    sparql.method = 'POSTDIRECTLY'
    try:
        sparql.query()
        return jsonify({'message': 'Event created', 'uri': event_uri}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/events/<path:event_uri>', methods=['PUT'])
def update_event(event_uri):
    from urllib.parse import unquote
    data = request.get_json()
    name = data.get('name')
    event_type = data.get('eventType')
    organizer = data.get('organizer')
    price = data.get('price')
    event_date = data.get('eventDate')
    location = data.get('location')
    decoded_uri = unquote(event_uri)
    local_name = decoded_uri.split('#')[-1]
    sparql_update = f'''
    PREFIX : <http://www.fairtravel.com/fairtravel#>
    DELETE {{
      :{local_name} :eventType ?oldType .
      :{local_name} :organizer ?oldOrganizer .
      :{local_name} :price ?oldPrice .
      :{local_name} :eventDate ?oldDate .
      :{local_name} :hasLocation ?oldLocation .
      :{local_name} a ?oldClass .
    }}
    INSERT {{
      :{local_name} a :Event .
      :{local_name} :eventType "{event_type}" .
      :{local_name} :organizer "{organizer}" .
      :{local_name} :price {price} .
      :{local_name} :eventDate "{event_date}" .
      :{local_name} :hasLocation :{location} .
    }}
    WHERE {{
      OPTIONAL {{ :{local_name} :eventType ?oldType }}
      OPTIONAL {{ :{local_name} :organizer ?oldOrganizer }}
      OPTIONAL {{ :{local_name} :price ?oldPrice }}
      OPTIONAL {{ :{local_name} :eventDate ?oldDate }}
      OPTIONAL {{ :{local_name} :hasLocation ?oldLocation }}
      OPTIONAL {{ :{local_name} a ?oldClass }}
    }}
    '''
    sparql = SPARQLWrapper(FUSEKI_UPDATE_URL)
    sparql.setQuery(sparql_update)
    sparql.setMethod('POST')
    try:
        sparql.query()
        return jsonify({'message': 'Event updated', 'uri': event_uri}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/events/<path:event_uri>', methods=['DELETE'])
def delete_event(event_uri):
    from urllib.parse import unquote
    decoded_uri = unquote(event_uri)
    local_name = decoded_uri.split('#')[-1]
    sparql_delete = f'''
    PREFIX : <http://www.fairtravel.com/fairtravel#>
    DELETE WHERE {{
      :{local_name} ?p ?o .
    }}
    '''
    sparql = SPARQLWrapper(FUSEKI_UPDATE_URL)
    sparql.setQuery(sparql_delete)
    sparql.setMethod('POST')
    try:
        sparql.query()
        return jsonify({'message': 'Event deleted', 'uri': decoded_uri}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500



# ========================================================================
# LOCATION CRUD
# ========================================================================

@app.route('/locations', methods=['GET', 'POST'])
def locations():
    if request.method == 'GET':
        # List all locations
        return jsonify(list_entities('Location'))
    
    elif request.method == 'POST':
        # Create new location
        try:
            data = request.get_json()
            location_id = data.get('id')
            properties = data.get('properties', {})

            if not location_id:
                return jsonify({'error': 'Location ID is required'}), 400

            # Build triples
            triples = [f":{location_id} a :Location ."]

            # Data properties
            if 'locationName' in properties:
                triples.append(f':{location_id} :locationName "{properties["locationName"]}" .')
            if 'address' in properties:
                triples.append(f':{location_id} :address "{properties["address"]}" .')
            if 'city' in properties:
                triples.append(f':{location_id} :city "{properties["city"]}" .')
            if 'country' in properties:
                triples.append(f':{location_id} :country "{properties["country"]}" .')
            if 'region' in properties:
                triples.append(f':{location_id} :region "{properties["region"]}" .')
            if 'latitude' in properties:
                triples.append(f':{location_id} :latitude {properties["latitude"]} .')
            if 'longitude' in properties:
                triples.append(f':{location_id} :longitude {properties["longitude"]} .')
            if 'altitude' in properties:
                triples.append(f':{location_id} :altitude {properties["altitude"]} .')
            if 'zipCode' in properties:
                triples.append(f':{location_id} :zipCode "{properties["zipCode"]}" .')
            if 'description' in properties:
                triples.append(f':{location_id} :description "{properties["description"]}" .')

            insert_query = f"""
                PREFIX : <http://www.fairtravel.com/fairtravel#>
                INSERT DATA {{
                    {' '.join(triples)}
                }}
            """

            sparql = SPARQLWrapper(FUSEKI_UPDATE_URL)
            sparql.setQuery(insert_query)
            sparql.setMethod('POST')
            sparql.query()

            return jsonify({'message': 'Location created successfully', 'id': location_id}), 201

        except Exception as e:
            return jsonify({'error': str(e)}), 500

@app.route('/locations/<location_id>', methods=['GET', 'PUT', 'DELETE'])
def location_detail(location_id):
    location_uri = f"http://www.fairtravel.com/fairtravel#{location_id}"
    
    if request.method == 'GET':
        # Get location details
        details = get_details(location_uri)
        if details:
            return jsonify(details)
        return jsonify({'error': 'Location not found'}), 404
    
    elif request.method == 'PUT':
        # Update location
        try:
            data = request.get_json()
            properties = data.get('properties', {})

            # Delete existing triples
            delete_query = f"""
                PREFIX : <http://www.fairtravel.com/fairtravel#>
                DELETE WHERE {{ :{location_id} ?p ?o . }}
            """
            
            sparql = SPARQLWrapper(FUSEKI_UPDATE_URL)
            sparql.setQuery(delete_query)
            sparql.setMethod('POST')
            sparql.query()

            # Insert updated triples
            triples = [f":{location_id} a :Location ."]

            if 'locationName' in properties:
                triples.append(f':{location_id} :locationName "{properties["locationName"]}" .')
            if 'address' in properties:
                triples.append(f':{location_id} :address "{properties["address"]}" .')
            if 'city' in properties:
                triples.append(f':{location_id} :city "{properties["city"]}" .')
            if 'country' in properties:
                triples.append(f':{location_id} :country "{properties["country"]}" .')
            if 'region' in properties:
                triples.append(f':{location_id} :region "{properties["region"]}" .')
            if 'latitude' in properties:
                triples.append(f':{location_id} :latitude {properties["latitude"]} .')
            if 'longitude' in properties:
                triples.append(f':{location_id} :longitude {properties["longitude"]} .')
            if 'altitude' in properties:
                triples.append(f':{location_id} :altitude {properties["altitude"]} .')
            if 'zipCode' in properties:
                triples.append(f':{location_id} :zipCode "{properties["zipCode"]}" .')
            if 'description' in properties:
                triples.append(f':{location_id} :description "{properties["description"]}" .')

            insert_query = f"""
                PREFIX : <http://www.fairtravel.com/fairtravel#>
                INSERT DATA {{
                    {' '.join(triples)}
                }}
            """

            sparql.setQuery(insert_query)
            sparql.query()

            return jsonify({'message': 'Location updated successfully', 'id': location_id})

        except Exception as e:
            return jsonify({'error': str(e)}), 500
    
    elif request.method == 'DELETE':
        # Delete location
        try:
            delete_query = f"""
                PREFIX : <http://www.fairtravel.com/fairtravel#>
                DELETE WHERE {{ :{location_id} ?p ?o . }}
            """
            
            sparql = SPARQLWrapper(FUSEKI_UPDATE_URL)
            sparql.setQuery(delete_query)
            sparql.setMethod('POST')
            sparql.query()

            return jsonify({'message': 'Location deleted successfully'})

        except Exception as e:
            return jsonify({'error': str(e)}), 500

@app.route('/location-details')
def location_details():
    return jsonify(get_details(request.args.get('uri')))

# ========================================================================
# TRANSPORT CRUD
# ========================================================================

@app.route('/transports', methods=['GET', 'POST'])
def transports():
    if request.method == 'GET':
        # List all transports
        return jsonify(list_entities('Transport'))
    
    elif request.method == 'POST':
        # Create new transport
        try:
            data = request.get_json()
            transport_id = data.get('id')
            properties = data.get('properties', {})

            if not transport_id:
                return jsonify({'error': 'Transport ID is required'}), 400

            # Build triples
            triples = [f":{transport_id} a :Transport ."]

            # Data properties
            if 'transportType' in properties:
                triples.append(f':{transport_id} :transportType "{properties["transportType"]}" .')
            if 'transportName' in properties:
                triples.append(f':{transport_id} :transportName "{properties["transportName"]}" .')
            if 'co2PerKm' in properties:
                triples.append(f':{transport_id} :co2PerKm {properties["co2PerKm"]} .')
            if 'capacity' in properties:
                triples.append(f':{transport_id} :capacity {properties["capacity"]} .')
            if 'isEcoFriendly' in properties:
                triples.append(f':{transport_id} :isEcoFriendly {str(properties["isEcoFriendly"]).lower()} .')
            if 'fuelType' in properties:
                triples.append(f':{transport_id} :fuelType "{properties["fuelType"]}" .')
            if 'averageSpeed' in properties:
                triples.append(f':{transport_id} :averageSpeed {properties["averageSpeed"]} .')
            if 'description' in properties:
                triples.append(f':{transport_id} :description "{properties["description"]}" .')

            insert_query = f"""
                PREFIX : <http://www.fairtravel.com/fairtravel#>
                INSERT DATA {{
                    {' '.join(triples)}
                }}
            """

            sparql = SPARQLWrapper(FUSEKI_UPDATE_URL)
            sparql.setQuery(insert_query)
            sparql.setMethod('POST')
            sparql.query()

            return jsonify({'message': 'Transport created successfully', 'id': transport_id}), 201

        except Exception as e:
            return jsonify({'error': str(e)}), 500

@app.route('/transports/<transport_id>', methods=['GET', 'PUT', 'DELETE'])
def transport_detail(transport_id):
    transport_uri = f"http://www.fairtravel.com/fairtravel#{transport_id}"
    
    if request.method == 'GET':
        # Get transport details
        details = get_details(transport_uri)
        if details:
            return jsonify(details)
        return jsonify({'error': 'Transport not found'}), 404
    
    elif request.method == 'PUT':
        # Update transport
        try:
            data = request.get_json()
            properties = data.get('properties', {})

            # Delete existing triples
            delete_query = f"""
                PREFIX : <http://www.fairtravel.com/fairtravel#>
                DELETE WHERE {{ :{transport_id} ?p ?o . }}
            """
            
            sparql = SPARQLWrapper(FUSEKI_UPDATE_URL)
            sparql.setQuery(delete_query)
            sparql.setMethod('POST')
            sparql.query()

            # Insert updated triples
            triples = [f":{transport_id} a :Transport ."]

            if 'transportType' in properties:
                triples.append(f':{transport_id} :transportType "{properties["transportType"]}" .')
            if 'transportName' in properties:
                triples.append(f':{transport_id} :transportName "{properties["transportName"]}" .')
            if 'co2PerKm' in properties:
                triples.append(f':{transport_id} :co2PerKm {properties["co2PerKm"]} .')
            if 'capacity' in properties:
                triples.append(f':{transport_id} :capacity {properties["capacity"]} .')
            if 'isEcoFriendly' in properties:
                triples.append(f':{transport_id} :isEcoFriendly {str(properties["isEcoFriendly"]).lower()} .')
            if 'fuelType' in properties:
                triples.append(f':{transport_id} :fuelType "{properties["fuelType"]}" .')
            if 'averageSpeed' in properties:
                triples.append(f':{transport_id} :averageSpeed {properties["averageSpeed"]} .')
            if 'description' in properties:
                triples.append(f':{transport_id} :description "{properties["description"]}" .')

            insert_query = f"""
                PREFIX : <http://www.fairtravel.com/fairtravel#>
                INSERT DATA {{
                    {' '.join(triples)}
                }}
            """

            sparql.setQuery(insert_query)
            sparql.query()

            return jsonify({'message': 'Transport updated successfully', 'id': transport_id})

        except Exception as e:
            return jsonify({'error': str(e)}), 500
    
    elif request.method == 'DELETE':
        # Delete transport
        try:
            delete_query = f"""
                PREFIX : <http://www.fairtravel.com/fairtravel#>
                DELETE WHERE {{ :{transport_id} ?p ?o . }}
            """
            
            sparql = SPARQLWrapper(FUSEKI_UPDATE_URL)
            sparql.setQuery(delete_query)
            sparql.setMethod('POST')
            sparql.query()

            return jsonify({'message': 'Transport deleted successfully'})

        except Exception as e:
            return jsonify({'error': str(e)}), 500

@app.route('/transport-details')
def transport_details():
    return jsonify(get_details(request.args.get('uri')))

# ========================================================================
# CARBON FOOTPRINT CRUD
# ========================================================================

@app.route('/carbonfootprints', methods=['GET', 'POST'])
def carbonfootprints():
    if request.method == 'GET':
        # List all carbon footprints
        return jsonify(list_entities('CarbonFootprint'))
    
    elif request.method == 'POST':
        # Create new carbon footprint
        try:
            data = request.get_json()
            footprint_id = data.get('id')
            properties = data.get('properties', {})

            if not footprint_id:
                return jsonify({'error': 'CarbonFootprint ID is required'}), 400

            # Build triples
            triples = [f":{footprint_id} a :CarbonFootprint ."]

            # Data properties
            if 'carbonEmissions' in properties:
                triples.append(f':{footprint_id} :carbonEmissions {properties["carbonEmissions"]} .')
            if 'calculationMethod' in properties:
                triples.append(f':{footprint_id} :calculationMethod "{properties["calculationMethod"]}" .')
            if 'emissionSource' in properties:
                triples.append(f':{footprint_id} :emissionSource "{properties["emissionSource"]}" .')
            if 'offsetAmount' in properties:
                triples.append(f':{footprint_id} :offsetAmount {properties["offsetAmount"]} .')
            if 'measurementUnit' in properties:
                triples.append(f':{footprint_id} :measurementUnit "{properties["measurementUnit"]}" .')
            if 'calculationDate' in properties:
                triples.append(f':{footprint_id} :calculationDate "{properties["calculationDate"]}" .')
            if 'description' in properties:
                triples.append(f':{footprint_id} :description "{properties["description"]}" .')

            insert_query = f"""
                PREFIX : <http://www.fairtravel.com/fairtravel#>
                INSERT DATA {{
                    {' '.join(triples)}
                }}
            """

            sparql = SPARQLWrapper(FUSEKI_UPDATE_URL)
            sparql.setQuery(insert_query)
            sparql.setMethod('POST')
            sparql.query()

            return jsonify({'message': 'CarbonFootprint created successfully', 'id': footprint_id}), 201

        except Exception as e:
            return jsonify({'error': str(e)}), 500

@app.route('/carbonfootprints/<footprint_id>', methods=['GET', 'PUT', 'DELETE'])
def carbonfootprint_detail(footprint_id):
    footprint_uri = f"http://www.fairtravel.com/fairtravel#{footprint_id}"
    
    if request.method == 'GET':
        # Get carbon footprint details
        details = get_details(footprint_uri)
        if details:
            return jsonify(details)
        return jsonify({'error': 'CarbonFootprint not found'}), 404
    
    elif request.method == 'PUT':
        # Update carbon footprint
        try:
            data = request.get_json()
            properties = data.get('properties', {})

            # Delete existing triples
            delete_query = f"""
                PREFIX : <http://www.fairtravel.com/fairtravel#>
                DELETE WHERE {{ :{footprint_id} ?p ?o . }}
            """
            
            sparql = SPARQLWrapper(FUSEKI_UPDATE_URL)
            sparql.setQuery(delete_query)
            sparql.setMethod('POST')
            sparql.query()

            # Insert updated triples
            triples = [f":{footprint_id} a :CarbonFootprint ."]

            if 'carbonEmissions' in properties:
                triples.append(f':{footprint_id} :carbonEmissions {properties["carbonEmissions"]} .')
            if 'calculationMethod' in properties:
                triples.append(f':{footprint_id} :calculationMethod "{properties["calculationMethod"]}" .')
            if 'emissionSource' in properties:
                triples.append(f':{footprint_id} :emissionSource "{properties["emissionSource"]}" .')
            if 'offsetAmount' in properties:
                triples.append(f':{footprint_id} :offsetAmount {properties["offsetAmount"]} .')
            if 'measurementUnit' in properties:
                triples.append(f':{footprint_id} :measurementUnit "{properties["measurementUnit"]}" .')
            if 'calculationDate' in properties:
                triples.append(f':{footprint_id} :calculationDate "{properties["calculationDate"]}" .')
            if 'description' in properties:
                triples.append(f':{footprint_id} :description "{properties["description"]}" .')

            insert_query = f"""
                PREFIX : <http://www.fairtravel.com/fairtravel#>
                INSERT DATA {{
                    {' '.join(triples)}
                }}
            """

            sparql.setQuery(insert_query)
            sparql.query()

            return jsonify({'message': 'CarbonFootprint updated successfully', 'id': footprint_id})

        except Exception as e:
            return jsonify({'error': str(e)}), 500
    
    elif request.method == 'DELETE':
        # Delete carbon footprint
        try:
            delete_query = f"""
                PREFIX : <http://www.fairtravel.com/fairtravel#>
                DELETE WHERE {{ :{footprint_id} ?p ?o . }}
            """
            
            sparql = SPARQLWrapper(FUSEKI_UPDATE_URL)
            sparql.setQuery(delete_query)
            sparql.setMethod('POST')
            sparql.query()

            return jsonify({'message': 'CarbonFootprint deleted successfully'})

        except Exception as e:
            return jsonify({'error': str(e)}), 500

@app.route('/carbonfootprint-details')
def carbonfootprint_details():
    return jsonify(get_details(request.args.get('uri')))





if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True)