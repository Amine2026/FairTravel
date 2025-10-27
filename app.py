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


@app.route('/bookings')
def get_bookings():
    return jsonify(list_entities('Booking'))

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
    

@app.route('/sustainability-practices')
def get_sustainability_practices():
    return jsonify(list_entities('SustainabilityPractice'))

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
            elif prop in ['locatedIn', 'offeredBy']:
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
        
        # Add object properties
        if 'writtenBy' in properties:
            triples.append(f':{review_id} :writtenBy :{properties["writtenBy"]} .')
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
            elif prop in ['writtenBy', 'reviewsActivity', 'reviewsAccommodation', 'reviewsService', 'reviewsTransport']:
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
        
        # Add data properties
        if 'awardName' in properties:
            triples.append(f':{award_id} :awardName "{properties["awardName"]}" .')
        if 'awardType' in properties:
            triples.append(f':{award_id} :awardType "{properties["awardType"]}" .')
        if 'awardedBy' in properties:
            triples.append(f':{award_id} :awardedBy "{properties["awardedBy"]}" .')
        if 'dateAwarded' in properties:
            triples.append(f':{award_id} :dateAwarded "{properties["dateAwarded"]}" .')
        if 'description' in properties:
            triples.append(f':{award_id} :description "{properties["description"]}" .')
        if 'level' in properties:
            triples.append(f':{award_id} :level "{properties["level"]}" .')
        if 'validUntil' in properties:
            triples.append(f':{award_id} :validUntil "{properties["validUntil"]}" .')
        
        # Add object properties
        if 'receivedBy' in properties:
            triples.append(f':{award_id} :receivedBy :{properties["receivedBy"]} .')
        
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
            
            if prop in ['receivedBy']:
                insert_triples.append(f':{award_id} :{prop} :{value}')
            else:
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
