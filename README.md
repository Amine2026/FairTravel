# FairTravel Ontology - Quick Start

## 1. Domain Scope
- Eco-responsible tourism: activities, accommodations, carbon footprint, recommendations, locations, tourists


## 2. Main Classes (Concepts)
- Accommodation
- Activity
	- OutdoorActivity (subclass)
	- CulturalActivity (subclass)
	- SportActivity (subclass)
- Booking
- CarbonFootprint
- Event
- Guide
- Location
- Recommendation
- Restaurant
- Review
- Service
- SustainabilityPractice
- Tourist
- Transport
- Award

## 3. Key Properties
- activityName (data, Activity, functional, string)
- activityType (data, Activity, string)
- duration (data, Activity, string)
- difficultyLevel (data, Activity, string)
- hasLocation (object, Activity → Location, non-functional)
- recommendationText (data, Recommendation, functional, string)
- rating (data, Recommendation, integer)
- source (data, Recommendation, string)
- dateRecommended (data, Recommendation, date)
- forActivity (object, Recommendation → Activity, non-functional)
- eventDate (data, Event, functional, dateTime)
- eventType (data, Event, string)
- organizer (data, Event, string)
- price (data, Event, float)
- hasLocation (object, Event → Location, non-functional)

## 4. Modeling Rules
- Use CamelCase for classes, lowerCamelCase for properties
- Use individuals for real-world examples (e.g., GreenValleyEcoLodge)
- Use data properties for values (e.g., rating, price)

## 5. Workflow
1. Add classes and properties in Protégé or your editor
2. Add example individuals
3. Save and validate in Protégé
4. Commit changes with clear messages

## 6. Tips
- Build step by step: add a few classes, test, then continue
- Document new concepts as you add them
- Use version control for every major change

## 7. Team Class Assignments
- **Amine:** Activity, Recommendation, Event
- **Ali:** SustainabilityPractice, Accommodation, Booking
- **Oussema:** Service, Review, Award
- **Hamza:** Location, Transport, CarbonFootprint
- **Hiba:** Tourist, Guide, Restaurant

## 8. Ontology File Format (2025)
- Ontology now uses OWL/XML style (not RDF/XML)
- Root element: `<Ontology>`
- Uses `<Prefix>` for namespaces and `<Declaration>` for classes
- Example:
	```xml
	<Ontology ...>
		<Prefix name="" IRI="http://www.fairtravel.com/fairtravel#"/>
		<Declaration>
			<Class IRI="#Accommodation"/>
		</Declaration>
	</Ontology>
	```

## 9. Example Individuals Added
- **Activity:** MountainHiking (OutdoorActivity) with properties: activityName, activityType, duration, difficultyLevel, hasLocation (AlpinePark)
- **Recommendation:** HikingRec linked to MountainHiking, with recommendationText, rating, source, dateRecommended
- **Event:** EcoFestival2025 with eventType, organizer, price, eventDate, hasLocation (AlpinePark)

## 10. Recommended Tech Stack
- Front-end: React
- Back-end: Python (Flask) + RDFLib
- SPARQL endpoint: Apache Jena Fuseki
- API communication: REST/JSON

The OWL file acts as the semantic database, queried and updated via SPARQL.

## 11. Fuseki Setup & SPARQL Querying
- Installed Apache Jena Fuseki and created an in-memory dataset.
- Exported ontology from Protégé as Turtle (.ttl) and uploaded to Fuseki.
- Ran SPARQL queries to list classes, retrieve individuals, and filter properties:
		- List all classes:
			```sparql
			PREFIX owl: <http://www.w3.org/2002/07/owl#>
			SELECT ?class WHERE { ?class a owl:Class . }
			```
		- Get all properties of MountainHiking:
			```sparql
			SELECT ?property ?value WHERE { :MountainHiking ?property ?value . }
			```
		- Find all Recommendations and their texts:
			```sparql
			SELECT ?rec ?text WHERE { ?rec a :Recommendation . ?rec :recommendationText ?text . }
			```
- Verified results in Fuseki web UI.

## Flask API Setup (Brief)
- Install Flask and SPARQLWrapper:
	`pip install flask SPARQLWrapper`
- Flask API endpoints:
	- `/classes`: returns ontology classes
	- `/activities`: returns all activities (including subclasses)
	- `/recommendations`: returns all recommendations
	- `/events`: returns all events
	- All endpoints query Fuseki and return results as JSON.


## React Frontend Setup (Brief)
- You can use either `pnpm` or `npm` for React setup:
	- To use pnpm (recommended for speed):
		- Install pnpm globally: `npm install -g pnpm`
		- Create React app: `pnpx create-react-app fairtravel-frontend`
		- Start frontend: `cd fairtravel-frontend && pnpm start`
	- Or use npm:
		- Create React app: `npx create-react-app fairtravel-frontend`
		- Start frontend: `cd fairtravel-frontend && npm start`
	- The frontend will run at http://localhost:3000 and can fetch data from the Flask API.


## Recent Changes
- Added Flask API endpoints for activities, recommendations, and events, including subclass support for activities.
- Enabled CORS in Flask backend for frontend-backend communication.
- Created React frontend with an ActivitiesList component that fetches activities from the Flask API.
- Added RecommendationsList and EventsList React components to display recommendations and events from the backend.
- Added detail endpoints in Flask for activities, events, and recommendations.
- Integrated detail views in React: click an activity, event, or recommendation to see its properties.
- Added search bars to Activities, Events, and Recommendations pages for easy filtering in the frontend.
-- Deep linking for activities, events, and recommendations is now supported (share/bookmark detail URLs).
-- UI/UX improvements: readable labels, card layouts, dropdown filters, loading/error states.

This file is a quick reference. Update as your ontology grows!

## API Features
- Added an AI API endpoint (`/api/ai-query`) in the Flask backend to accept user questions for future natural language query processing.
- The backend integrates with Groq's AI API to translate user questions into SPARQL queries. Set your Groq API key as an environment variable before running the app:
  `$env:GROQ_API_KEY = "your_actual_groq_api_key"`

## 12. AI-powered Semantic Search
- Users can ask natural language questions (e.g., "Show me all activities in AlpinePark") via the `/api/ai-query` endpoint.
- The backend uses Groq AI to translate questions into SPARQL queries, automatically handling ontology structure (subclasses, URIs, etc.).
- Results are fetched from Fuseki and returned as JSON.

## 13. Activity CRUD API
- The backend now supports full CRUD (Create, Read, Update, Delete) operations for activities via REST endpoints.
- Endpoints:
  - POST /activities (create)
  - GET /activities (list/read)
  - PUT /activities/<activity_uri> (update)
  - DELETE /activities/<activity_uri> (delete)
- Data is stored and managed in the Fuseki triple store using SPARQL.