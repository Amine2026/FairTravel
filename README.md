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
- hasLocation (object, Activity → Location, non-functional)
- hasCarbonFootprint (object)
- locatedIn (object)
- hasName (data)
- hasDescription (data)
- cfValue (data)
- activityName (data, Activity, functional, string)
- hasLocation (object, Activity → Location, non-functional)
- recommendationText (data, Recommendation, functional, string)
- forActivity (object, Recommendation → Activity, non-functional)
- eventDate (data, Event, functional, dateTime)
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

This file is a quick reference. Update as your ontology grows!

## 9. Recommended Tech Stack

- Front-end: React
- Back-end: Python (Flask) + RDFLib
- SPARQL endpoint: Apache Jena Fuseki
- API communication: REST/JSON

The OWL file acts as the semantic database, queried and updated via SPARQL.