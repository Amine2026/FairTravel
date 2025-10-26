from flask import Flask, jsonify, request
import os
from SPARQLWrapper import SPARQLWrapper, JSON
from flask_cors import CORS
from groq import Groq

app = Flask(__name__)
CORS(app)

# Change this to your Fuseki SPARQL endpoint
FUSEKI_URL = "http://localhost:3030/FairTravel/sparql"

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

if __name__ == '__main__':
    app.run(debug=True)
