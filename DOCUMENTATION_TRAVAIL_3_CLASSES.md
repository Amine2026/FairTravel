# Documentation du Travail Réalisé - Ontologie FairTravel

## Vue d'ensemble

Ce document détaille l'intégration et le développement de trois classes principales dans l'ontologie FairTravel : **Service**, **Review** et **Award**. Ces classes ont été extraites du fichier source `fairtravel_1.owx` et intégrées dans `fairtravel.owx` avec leurs propriétés, relations et instances.

---

## 1. Classe Service

### Description
La classe **Service** représente les services touristiques offerts dans le cadre du tourisme durable et équitable.

### Hiérarchie des Classes
```
Service (Classe indépendante)
├── InformationCenter
└── LocalShop

Note: Restaurant et Guide sont des classes indépendantes, PAS des sous-classes de Service
```

### Sous-classes

#### 1.1 InformationCenter
- **Description** : Centre d'information pour les touristes
- **Exemple d'instance** : `EcoTourismCenter_Sousse`
  - Horaires d'ouverture : 08:00-18:00
  - Score de durabilité : 95
  - Propriété locale : Oui

#### 1.2 LocalShop
- **Description** : Boutique locale proposant des produits durables
- **Exemple d'instance** : `ArtisanMarket_Medina`
  - Gamme de prix : €-€€
  - Utilise des produits locaux : Oui
  - Score de durabilité : 88

### Object Properties (6)

| Propriété | Domaine | Range | Description |
|-----------|---------|-------|-------------|
| `reviewsService` | Review | Service | Associe une critique à un service |
| `offeredBy` | Service | Provider | Service offert par un prestataire |
| `usedByTourist` | Service | Tourist | Service utilisé par un touriste |
| `complementsActivity` | Service | Activity | Service qui complète une activité |
| `locatedInLocation` | Service | Location | Localisation du service |
| `hasAward` | Service | Award | Prix/certification reçu par le service |

### Data Properties (9)

| Propriété | Type | Description |
|-----------|------|-------------|
| `serviceName` | xsd:string | Nom du service |
| `serviceType` | xsd:string | Type de service |
| `operatingHours` | xsd:string | Heures d'ouverture |
| `contactInfo` | xsd:string | Informations de contact |
| `priceRange` | xsd:string | Fourchette de prix |
| `useLocalProducts` | xsd:boolean | Utilise des produits locaux |
| `openingHours` | xsd:string | Horaires d'ouverture |
| `locallyOwned` | xsd:boolean | Propriété locale |
| `sustainabilityScore` | xsd:integer | Score de durabilité (0-100) |

---

## 2. Classe Review

### Description
La classe **Review** représente les critiques et évaluations laissées par les touristes sur différents aspects du voyage durable.

### Hiérarchie des Classes
```
Review
├── ActivityReview
├── AccommodationReview
├── ServiceReview
└── TransportReview
```

### Sous-classes

#### 2.1 ActivityReview
- **Description** : Critiques d'activités touristiques
- Évalue les activités proposées aux touristes

#### 2.2 AccommodationReview
- **Description** : Critiques d'hébergements
- **Exemple d'instance** : `Review_EcoHotel_Verde_001`
  - Note globale : 5
  - Note de durabilité : 5
  - Mentionne la durabilité : Oui
  - Pratiques éco-responsables : Oui

#### 2.3 ServiceReview
- **Description** : Critiques de services
- Évalue les services touristiques

#### 2.4 TransportReview
- **Description** : Critiques de moyens de transport
- Évalue les options de transport durable

### Object Properties (7)

| Propriété | Domaine | Range | Description |
|-----------|---------|-------|-------------|
| `hasReview` | Tourist | Review | Touriste a écrit une critique |
| `reviewedBy` | Review | Tourist | Critique écrite par un touriste |
| `reviewsService` | Review | Service | Critique d'un service |
| `reviewsActivity` | Review | Activity | Critique d'une activité |
| `reviewsAccommodation` | Review | Accommodation | Critique d'un hébergement |
| `reviewsTransport` | Review | Transport | Critique d'un transport |
| `writtenBy` | Review | Tourist | Auteur de la critique |

### Data Properties (10)

| Propriété | Type | Description |
|-----------|------|-------------|
| `reviewText` | xsd:string | Texte de la critique |
| `reviewDate` | xsd:date | Date de la critique |
| `reviewerName` | xsd:string | Nom du critique |
| `reviewTitle` | xsd:string | Titre de la critique |
| `overallRating` | xsd:integer | Note globale (1-5) |
| `sustainabilityRating` | xsd:integer | Note de durabilité (1-5) |
| `sentiment` | xsd:string | Sentiment (positif/négatif/neutre) |
| `mentionsSustainability` | xsd:boolean | Mentionne la durabilité |
| `reviewerType` | xsd:string | Type de voyageur |
| `ecoFriendlyPractices` | xsd:boolean | Pratiques éco-responsables observées |

### Instances Créées

#### Review_EcoHotel_Verde_001
- **Type** : AccommodationReview
- **Titre** : "Excellent séjour écologique"
- **Note globale** : 5/5
- **Note de durabilité** : 5/5
- **Date** : 2024-03-15
- **Sentiment** : Positif
- **Mentionne durabilité** : Oui

#### Review_Walking_Tour_001
- **Type** : ActivityReview
- **Titre** : "Visite guidée enrichissante"
- **Note globale** : 5/5
- **Note de durabilité** : 4/5
- **Date** : 2024-04-10
- **Sentiment** : Positif

---

## 3. Classe Award

### Description
La classe **Award** représente les prix, certifications et labels de durabilité attribués aux services, hébergements et autres entités du système de tourisme équitable.

### Object Properties (3)

| Propriété | Domaine | Range | Description |
|-----------|---------|-------|-------------|
| `receivedBy` | Award | Service/Accommodation | Entité qui reçoit le prix |
| `awardedTo` | Service/Accommodation | Award | Entité récompensée |
| `hasAward` | Service/Accommodation | Award | A reçu un prix/certification |

### Data Properties (8)

| Propriété | Type | Description |
|-----------|------|-------------|
| `awardName` | xsd:string | Nom du prix/certification |
| `awardCategory` | xsd:string | Catégorie du prix |
| `awardDate` | xsd:date | Date d'attribution |
| `issuingOrganization` | xsd:string | Organisation émettrice |
| `awardLevel` | xsd:string | Niveau (Gold, Silver, Bronze, etc.) |
| `certificateNumber` | xsd:string | Numéro de certificat |
| `validUntil` | xsd:date | Date d'expiration |
| `awardDescription` | xsd:string | Description du prix |

### Instances Créées

#### 1. GreenKey_Award_2024
- **Catégorie** : Environmental Sustainability
- **Organisation** : Foundation for Environmental Education
- **Niveau** : Gold
- **Date d'attribution** : 2024-01-15
- **Validité** : 2026-01-15
- **Certificat** : GK-2024-001-TN
- **Description** : Prix d'excellence environnementale pour hébergement éco-responsable
- **Attribué à** : EcoTourismCenter_Sousse

#### 2. EcoLabel_Restaurant_2025
- **Catégorie** : Sustainable Food Service
- **Organisation** : European Ecolabel
- **Niveau** : Premium
- **Date d'attribution** : 2025-02-20
- **Validité** : 2027-02-20
- **Certificat** : ECO-REST-2025-042
- **Description** : Label écologique pour pratiques alimentaires durables

#### 3. CarbonNeutral_Certification
- **Catégorie** : Carbon Neutrality
- **Organisation** : Climate Neutral Group
- **Niveau** : Certified
- **Date d'attribution** : 2024-06-10
- **Validité** : 2025-06-10
- **Certificat** : CN-2024-TUN-089
- **Description** : Certification pour émissions carbone nettes nulles

---

## Modifications et Corrections Apportées

### 1. Correction de la Hiérarchie des Classes

- ✅ **Conservé** : Restaurant et Guide comme classes indépendantes
- ✅ **Ajouté** : InformationCenter et LocalShop comme sous-classes de Service


### 3. Remplacement d'Instances
Les instances de Restaurant ont été remplacées par des instances appropriées de sous-classes de Service :

| Instance Supprimée | Instance de Remplacement | Type |
|-------------------|-------------------------|------|
| BioRestaurant_Carthage | EcoTourismCenter_Sousse | InformationCenter |
| FarmToTable_Tunis | ArtisanMarket_Medina | LocalShop |

### 4. Mise à Jour des Relations
- La relation `hasAward` a été mise à jour pour lier `EcoTourismCenter_Sousse` à `GreenKey_Award_2024`

---

## Statistiques du Travail Réalisé

### Propriétés Totales Ajoutées
- **Object Properties** : 16 propriétés
  - Service : 6
  - Review : 7
  - Award : 3

- **Data Properties** : 27 propriétés
  - Service : 9
  - Review : 10
  - Award : 8

### Instances Créées
- **Service** : 2 instances (EcoTourismCenter_Sousse, ArtisanMarket_Medina)
- **Review** : 2 instances (Review_EcoHotel_Verde_001, Review_Walking_Tour_001)
- **Award** : 3 instances (GreenKey_Award_2024, EcoLabel_Restaurant_2025, CarbonNeutral_Certification)

### Classes et Sous-classes
- **Service** : 1 classe principale + 2 sous-classes
- **Review** : 1 classe principale + 4 sous-classes
- **Award** : 1 classe principale

---

## Structure du Fichier OWL

Le fichier `fairtravel.owx` suit la structure standard OWL/XML :

```xml
<?xml version="1.0"?>
<Ontology xmlns="http://www.w3.org/2002/07/owl#"
     xml:base="http://www.fairtravel.com/fairtravel"
     xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
     xmlns:rdfs="http://www.w3.org/2000/01/rdf-schema#"
     xmlns:xsd="http://www.w3.org/2001/XMLSchema#"
     ontologyIRI="http://www.fairtravel.com/fairtravel">
```

### Sections Principales
1. **Déclarations de Classes** (Class)
2. **Déclarations de Propriétés d'Objet** (ObjectProperty)
3. **Déclarations de Propriétés de Données** (DataProperty)
4. **Déclarations d'Individus Nommés** (NamedIndividual)
5. **Assertions de Sous-Classes** (SubClassOf)
6. **Assertions de Domaine et Range** (Domain/Range)
7. **Assertions de Propriétés** (ObjectPropertyAssertion, DataPropertyAssertion)

---

## Validation

### Tests Effectués
✅ Aucune erreur syntaxique OWL/XML  
✅ Toutes les propriétés ont des domaines et ranges définis  
✅ Toutes les instances sont correctement typées  
✅ Les relations inter-classes sont cohérentes  
✅ Aucune référence aux instances supprimées (BioRestaurant_Carthage, FarmToTable_Tunis, TourGuide)  

### Conformité
- **OWL API Version** : 4.5.29.2024-05-13T12:11:03Z
- **Format** : OWL/XML
- **Namespace** : http://www.fairtravel.com/fairtravel
- **Validation** : Aucune erreur détectée

---

## Conclusion

L'intégration des trois classes **Service**, **Review** et **Award** dans l'ontologie FairTravel a été réalisée avec succès. Le travail comprend :

- ✅ Structure hiérarchique correcte et cohérente
- ✅ Propriétés complètes avec domaines et ranges appropriés
- ✅ Instances d'exemple représentatives et conformes
- ✅ Relations sémantiques bien définies
- ✅ Conformité aux standards OWL/XML
- ✅ Aucune erreur de validation

L'ontologie est maintenant prête à supporter un système complet de tourisme durable et équitable avec des fonctionnalités de critiques, services et certifications.

---
