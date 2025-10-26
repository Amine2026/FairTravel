# CRUD Operations - Service, Review et Award

## 📋 Vue d'ensemble

Ce document décrit les opérations CRUD (Create, Read, Update, Delete) implémentées pour les classes **Service**, **Review** et **Award** dans l'application FairTravel.

## 🚀 Démarrage Rapide

### 1. Démarrer le Backend

```bash
cd "c:\Users\oussama\Desktop\Nouveau dossier"
python app.py
```

Le serveur Flask démarre sur `http://localhost:5000`

### 2. Démarrer le Frontend

```bash
cd fairtravel-frontend
npm start
```

L'application React démarre sur `http://localhost:3000`

### 3. Assurez-vous que Fuseki est en cours d'exécution

Le serveur Fuseki doit être accessible sur `http://localhost:3030/FairTravel`

## 📡 API Endpoints

### Service Endpoints

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/services` | Liste tous les services |
| GET | `/service-details?uri=<uri>` | Détails d'un service |
| POST | `/services` | Créer un nouveau service |
| PUT | `/services/<id>` | Modifier un service |
| DELETE | `/services/<id>` | Supprimer un service |

### Review Endpoints

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/reviews` | Liste tous les avis |
| GET | `/review-details?uri=<uri>` | Détails d'un avis |
| POST | `/reviews` | Créer un nouvel avis |
| PUT | `/reviews/<id>` | Modifier un avis |
| DELETE | `/reviews/<id>` | Supprimer un avis |

### Award Endpoints

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/awards` | Liste tous les prix |
| GET | `/award-details?uri=<uri>` | Détails d'un prix |
| POST | `/awards` | Créer un nouveau prix |
| PUT | `/awards/<id>` | Modifier un prix |
| DELETE | `/awards/<id>` | Supprimer un prix |

## 💡 Exemples d'utilisation

### Créer un Service (POST)

```bash
curl -X POST http://localhost:5000/services \
  -H "Content-Type: application/json" \
  -d '{
    "id": "BikeRental_Tunis",
    "type": "LocalShop",
    "properties": {
      "serviceName": "Location de Vélos Écologiques",
      "serviceType": "Bike Rental",
      "operatingHours": "09:00-19:00",
      "contactInfo": "bike@example.com",
      "priceRange": "€€",
      "sustainabilityScore": 92,
      "locallyOwned": true,
      "useLocalProducts": true,
      "locatedIn": "Tunis_Center"
    }
  }'
```

### Créer un Review (POST)

```bash
curl -X POST http://localhost:5000/reviews \
  -H "Content-Type: application/json" \
  -d '{
    "id": "Review_BikeRental_001",
    "type": "ServiceReview",
    "properties": {
      "rating": 5,
      "reviewText": "Excellent service, vélos de qualité et personnel très sympathique!",
      "reviewDate": "2025-10-26",
      "reviewerName": "Marie Dubois",
      "sustainabilityRating": 5,
      "mentionsSustainability": true,
      "verified": true,
      "reviewsService": "BikeRental_Tunis"
    }
  }'
```

### Créer un Award (POST)

```bash
curl -X POST http://localhost:5000/awards \
  -H "Content-Type: application/json" \
  -d '{
    "id": "EcoLabel_Gold_2025",
    "properties": {
      "awardName": "Label Écologique Or",
      "awardType": "Eco-Label",
      "awardedBy": "Commission Tunisienne du Tourisme Durable",
      "dateAwarded": "2025-01-15",
      "description": "Prix décerné pour excellence en matière de durabilité",
      "level": "Gold",
      "validUntil": "2026-01-15",
      "receivedBy": "BikeRental_Tunis"
    }
  }'
```

### Modifier un Service (PUT)

```bash
curl -X PUT http://localhost:5000/services/BikeRental_Tunis \
  -H "Content-Type: application/json" \
  -d '{
    "properties": {
      "sustainabilityScore": 95,
      "operatingHours": "08:00-20:00"
    }
  }'
```

### Supprimer un Service (DELETE)

```bash
curl -X DELETE http://localhost:5000/services/BikeRental_Tunis
```

## 🎨 Interface Utilisateur

### Navigation

L'application comprend maintenant 9 sections principales :
- **Activities** - Gestion des activités
- **Recommendations** - Recommandations d'activités
- **Events** - Événements touristiques
- **Accommodations** - Hébergements
- **Bookings** - Réservations
- **Sustainability** - Pratiques durables
- **Services** ⭐ NOUVEAU - Gestion des services
- **Reviews** ⭐ NOUVEAU - Gestion des avis
- **Awards** ⭐ NOUVEAU - Gestion des prix

### Fonctionnalités par Page

#### Services (`/services`)
- ✅ Liste de tous les services avec filtrage
- ✅ Bouton "Ajouter Service"
- ✅ Actions : Voir détails, Modifier, Supprimer
- ✅ Affichage du type et score de durabilité

#### Reviews (`/reviews`)
- ✅ Liste de tous les avis avec filtrage
- ✅ Notation par étoiles (★★★★★)
- ✅ Bouton "Ajouter Avis"
- ✅ Actions : Voir détails, Modifier, Supprimer
- ✅ Aperçu du texte de l'avis

#### Awards (`/awards`)
- ✅ Liste de tous les prix avec filtrage
- ✅ Bouton "Ajouter Prix"
- ✅ Actions : Voir détails, Modifier, Supprimer
- ✅ Affichage du type, décerné par, niveau

### Formulaires

Chaque entité dispose de formulaires complets pour :
- **Création** : Tous les champs requis avec validation
- **Modification** : Pré-rempli avec les données existantes
- **Validation** : Champs obligatoires marqués avec *

## 📊 Structure des Données

### Service Properties

| Propriété | Type | Obligatoire | Description |
|-----------|------|-------------|-------------|
| `id` | string | ✅ | Identifiant unique |
| `type` | string | ✅ | Service, InformationCenter, LocalShop |
| `serviceName` | string | ✅ | Nom du service |
| `serviceType` | string | ❌ | Type de service |
| `operatingHours` | string | ❌ | Horaires d'ouverture |
| `contactInfo` | string | ❌ | Contact |
| `priceRange` | string | ❌ | Fourchette de prix |
| `sustainabilityScore` | integer | ❌ | Score 0-100 |
| `locallyOwned` | boolean | ❌ | Propriété locale |
| `useLocalProducts` | boolean | ❌ | Produits locaux |
| `locatedIn` | string | ❌ | ID de la localisation |

### Review Properties

| Propriété | Type | Obligatoire | Description |
|-----------|------|-------------|-------------|
| `id` | string | ✅ | Identifiant unique |
| `type` | string | ✅ | Review, ActivityReview, etc. |
| `rating` | integer | ✅ | Note globale 1-5 |
| `reviewText` | string | ✅ | Texte de l'avis |
| `reviewDate` | date | ✅ | Date de l'avis |
| `reviewerName` | string | ✅ | Nom du critique |
| `sustainabilityRating` | integer | ✅ | Note durabilité 1-5 |
| `mentionsSustainability` | boolean | ❌ | Mentionne durabilité |
| `verified` | boolean | ❌ | Avis vérifié |
| `writtenBy` | string | ❌ | ID du touriste |
| `reviewsActivity` | string | ❌ | ID de l'activité |
| `reviewsAccommodation` | string | ❌ | ID de l'hébergement |
| `reviewsService` | string | ❌ | ID du service |

### Award Properties

| Propriété | Type | Obligatoire | Description |
|-----------|------|-------------|-------------|
| `id` | string | ✅ | Identifiant unique |
| `awardName` | string | ✅ | Nom du prix |
| `awardType` | string | ✅ | Certification, Prize, etc. |
| `awardedBy` | string | ✅ | Organisme décernant |
| `dateAwarded` | date | ✅ | Date d'attribution |
| `description` | string | ✅ | Description |
| `level` | string | ❌ | Or, Argent, Bronze, etc. |
| `validUntil` | date | ❌ | Date d'expiration |
| `receivedBy` | string | ❌ | ID de l'entité récipiendaire |

## 🔧 Configuration Requise

### Backend (Python)
```bash
pip install flask flask-cors SPARQLWrapper groq
```

### Frontend (React)
```bash
npm install react-router-dom
```

### Base de données
- Apache Jena Fuseki en cours d'exécution
- Dataset : `FairTravel`
- Endpoint SPARQL : `http://localhost:3030/FairTravel/sparql`
- Endpoint UPDATE : `http://localhost:3030/FairTravel/update`

## ⚠️ Points Importants

1. **IDs Uniques** : Chaque entité doit avoir un ID unique (ex: `BikeRental_Tunis`)
2. **Format des URIs** : Les IDs sont convertis en URIs RDF (`http://www.fairtravel.com/fairtravel#<ID>`)
3. **Relations** : Les propriétés object (locatedIn, receivedBy, etc.) doivent référencer des IDs existants
4. **Validation** : Le frontend valide les champs requis avant l'envoi
5. **Fuseki Update** : Les opérations CREATE, UPDATE et DELETE nécessitent l'endpoint `/update`

## 🐛 Dépannage

### Erreur CORS
Si vous rencontrez des erreurs CORS, vérifiez que Flask-CORS est bien configuré dans `app.py`

### Erreur de connexion Fuseki
Vérifiez que Fuseki est bien démarré :
```bash
# Windows
fuseki-server.bat
```

### Données non affichées
1. Vérifiez que le dataset contient des données
2. Utilisez l'interface Fuseki pour tester les requêtes SPARQL
3. Vérifiez les logs du backend Flask

## 📝 Prochaines Améliorations

- [ ] Pagination pour les listes
- [ ] Filtres avancés (par type, date, note)
- [ ] Upload d'images pour les services
- [ ] Notifications toast pour les actions CRUD
- [ ] Validation côté serveur renforcée
- [ ] Tests unitaires et d'intégration
- [ ] Documentation Swagger/OpenAPI

## 👥 Auteurs

- **Oussema** - Service, Review, Award (Classes assignées)

## 📄 Licence

Ce projet fait partie du système FairTravel pour le tourisme durable.
