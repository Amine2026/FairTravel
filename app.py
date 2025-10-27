from flask import Flask, jsonify, request
import os
import uuid
from SPARQLWrapper import SPARQLWrapper, JSON
from flask_cors import CORS
from groq import Groq

app = Flask(__name__)
CORS(app)

# Change this to your Fuseki SPARQL endpoint
FUSEKI_URL = "http://localhost:3030/FairTravel/sparql"
# Fuseki uses a separate endpoint for SPARQL Update (INSERT/DELETE)
FUSEKI_UPDATE_URL = "http://localhost:3030/FairTravel/update"

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
@app.route('/recommendations')
def get_recommendations():
    sparql = SPARQLWrapper(FUSEKI_URL)
    sparql.setQuery("""
        PREFIX : <http://www.fairtravel.com/fairtravel#>
        SELECT ?rec WHERE { ?rec a :Recommendation . }
    """)
    sparql.setReturnFormat(JSON)
    results = sparql.query().convert()
    recommendations = [r['rec']['value'] for r in results['results']['bindings'] if r['rec']['type'] == 'uri']
    return jsonify(recommendations)

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



#================== GENERIC CRUD FOR NAMED CLASSES ======================
def add_individual(class_name, properties):
    # Generate a unique URI for the new individual
    individual_id = properties.get('id', str(uuid.uuid4()))
    individual_uri = f"http://www.fairtravel.com/fairtravel#{individual_id}"
    
    # Build triples list
    triples = []
    
    # Add type declaration
    triples.append(f'<{individual_uri}> rdf:type :{class_name}')
    
    # Define property types for each class (with proper data types)
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
            # Handle data properties - escape quotes properly
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
                # Debug: print received value
                print(f"Received value for {prop}:", repr(value))
                # Strip extra quotes if present
                clean_value = str(value).strip('"')
                escaped_value = clean_value.replace('\n', ' ').replace('"', "'")
                triples.append(f'<{individual_uri}> :{prop} "{escaped_value}"^^xsd:string')

    # Build the SPARQL query
    triples_str = ' .\n            '.join(triples)
    sparql_query = f"""
        PREFIX : <http://www.fairtravel.com/fairtravel#>
        PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
        PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
        INSERT DATA {{
            {triples_str} .
        }}
    """
    
    print("SPARQL Query:", sparql_query)  # Debug log
    
    try:
        sparql = SPARQLWrapper(FUSEKI_UPDATE_URL)
        sparql.setMethod('POST')
        sparql.setQuery(sparql_query)
        result = sparql.query()
        return individual_uri
    except Exception as e:
        print(f"SPARQL Error: {e}")
        raise e

def update_individual(uri, properties):
    try:
        # First delete existing properties (except rdf:type)
        delete_query = f"""
            PREFIX : <http://www.fairtravel.com/fairtravel#>
            DELETE WHERE {{
                <{uri}> ?p ?o .
            }}
        """
        
        sparql = SPARQLWrapper(FUSEKI_UPDATE_URL)
        sparql.setMethod('POST')
        sparql.setQuery(delete_query)
        sparql.query()
        
        # Then insert new properties
        triples = []
        # Always re-add type triple for Tourist
        triples.append(f'<{uri}> rdf:type :Tourist')
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
                    print(f"Received value for {prop}:", repr(value))
                    clean_value = str(value).strip('"')
                    escaped_value = clean_value.replace('\n', ' ').replace('"', "'")
                    triples.append(f'<{uri}> :{prop} "{escaped_value}"^^xsd:string')
        
        if triples:
            triples_str = ' .\n            '.join(triples)
            insert_query = f"""
                PREFIX : <http://www.fairtravel.com/fairtravel#>
                PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
                PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
                INSERT DATA {{
                    {triples_str} .
                }}
            """
            sparql.setQuery(insert_query)
            sparql.query()
            
    except Exception as e:
        print(f"Update error: {e}")
        raise e

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
        SELECT ?indiv WHERE {{ ?indiv rdf:type :{class_name} . }}
    """)
    sparql.setReturnFormat(JSON)
    results = sparql.query().convert()
    return [r['indiv']['value'] for r in results['results']['bindings'] if r['indiv']['type'] == 'uri']

#================== ENDPOINTS FOR TOURIST ======================
@app.route('/tourists', methods=['GET'])
def get_tourists():
    return jsonify(list_individuals('Tourist'))

@app.route('/tourist-details')
def tourist_details():
    uri = request.args.get('uri')
    if not uri:
        return jsonify({'error': 'Missing uri parameter'}), 400
    return jsonify(get_individual_details(uri))

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
    return jsonify(get_individual_details(uri))

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
    return jsonify(get_individual_details(uri))

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


def list_entities(class_name):
    sparql = SPARQLWrapper(FUSEKI_URL)
    sparql.setQuery(f"""
        PREFIX : <http://www.fairtravel.com/fairtravel#>
        SELECT ?entity WHERE {{ ?entity a :{class_name} . }}
    """)
    sparql.setReturnFormat(JSON)
    results = sparql.query().convert()
    return [r['entity']['value'] for r in results['results']['bindings'] if r['entity']['type'] == 'uri']

@app.route('/accommodations')
def get_accommodations():
    return jsonify(list_entities('Accommodation'))

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

@app.route('/accommodation-details')
def accommodation_details():
    return jsonify(get_details(request.args.get('uri')))

@app.route('/booking-details')
def booking_details():
    return jsonify(get_details(request.args.get('uri')))

@app.route('/sustainability-details')
def sustainability_practice_details():
    return jsonify(get_details(request.args.get('uri')))

# AI API endpoint for natural language queries
@app.route('/api/ai-query', methods=['POST'])
def ai_query():
    data = request.get_json()
    question = data.get('question', '')

    # Get Groq API key from environment variable for security
    GROQ_API_KEY = os.getenv('GROQ_API_KEY', 'YOUR_GROQ_API_KEY_HERE')
    
    # Initialize Groq client
    client = Groq(api_key=GROQ_API_KEY)

    # Prompt for Groq to generate a SPARQL query from the user's question
    prompt = f"""Generate a SPARQL query for the FairTravel ontology.

Prefixes:
PREFIX : <http://www.fairtravel.com/fairtravel#>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>

Key rules:
- Activity has subclasses. Use: ?type rdfs:subClassOf* :Activity . ?activity a ?type .
- Use :locatedIn to link Activity to Location
- Location names are URIs (e.g., "AlpinePark" becomes :AlpinePark)

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

if __name__ == '__main__':
    app.run(debug=True)
