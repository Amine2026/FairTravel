from flask import Flask, jsonify, request
import os
from urllib.parse import unquote
from SPARQLWrapper import SPARQLWrapper, JSON
from flask_cors import CORS
from groq import Groq

app = Flask(__name__)
CORS(app)

# Change this to your Fuseki SPARQL endpoint
FUSEKI_URL = "http://localhost:3030/FairTravel/sparql"
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


#========================================================================
# Accommodation, Booking and Sustainability practice
#========================================================================

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

if __name__ == '__main__':
    app.run(debug=True)
