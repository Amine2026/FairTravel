# 🌿 Ontologie – Partie Hiba : Gestion des touristes, guides et restaurants

## 🎯 Objectif

Cette partie de l’ontologie complète le modèle global du projet **FairTravel**, en intégrant les concepts liés aux **touristes**, **guides**, **restaurants** et **localisations**.  
Elle permet de relier les voyageurs à leurs expériences locales et aux services proposés dans une approche durable.

## 🧩 Classes principales

- **Tourist** : représente les voyageurs.  
- **Guide** : personnes accompagnant les touristes.  
- **Restaurant** : établissements proposant des repas.  
- **Location** : zones géographiques (villes, régions).  

## 🔗 Object Properties

| Propriété       | Domaine    | Portée     | Description                                      |
|-----------------|------------|------------|-------------------------------------------------|
| guidedBy        | Tourist    | Guide      | Le touriste est accompagné par un guide        |
| visitsRestaurant| Tourist    | Restaurant | Le touriste visite ou mange dans un restaurant |
| worksAt         | Guide      | Restaurant | Le guide travaille dans un restaurant          |
| locatedIn       | Restaurant / Guide | Location | Indique la localisation d’un lieu ou d’un guide |

## 💾 Data Properties

| Propriété       | Domaine    | Type       | Exemple                 |
|-----------------|------------|------------|------------------------|
| touristName      | Tourist    | xsd:string | "Hiba"                 |
| touristAge       | Tourist    | xsd:integer| 24                     |
| guideName        | Guide      | xsd:string | "Ali"                  |
| languageSpoken   | Guide      | xsd:string | "Français"             |
| restaurantName   | Restaurant | xsd:string | "BioBistro"            |
| averagePrice     | Restaurant | xsd:decimal| 30.5                   |
| cuisineType      | Restaurant | xsd:string | "Méditerranéenne"      |

## 🧠 Exemple d’individus

- **HibaTourist** (Tourist) → `guidedBy` → **AliGuide**  
- **AliGuide** (Guide) → `worksAt` → **BioBistro**  
- **BioBistro** (Restaurant) → `locatedIn` → **TunisCity**  

## 🧰 Outils et stack utilisés

- **Protégé** (éditeur d’ontologies)  
- **OWL 2** (langage de modélisation)  
- **RDF/XML** (format d’export)  
- **xsd datatypes** (string, integer, decimal)  
