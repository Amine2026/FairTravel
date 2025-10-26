# 🚀 Guide de Démarrage Rapide - CRUD FairTravel

## ⚡ Démarrage en 3 Minutes

### Étape 1 : Démarrer Fuseki (si pas déjà fait)

```powershell
# Aller dans le dossier Fuseki
cd C:\path\to\apache-jena-fuseki

# Démarrer le serveur
.\fuseki-server.bat
```

✅ Fuseki devrait être accessible sur http://localhost:3030

### Étape 2 : Démarrer le Backend Flask

```powershell
# Ouvrir un nouveau terminal PowerShell
cd "c:\Users\oussama\Desktop\Nouveau dossier"

# Démarrer Flask
python app.py
```

✅ Le backend devrait afficher : "Running on http://127.0.0.1:5000"

### Étape 3 : Démarrer le Frontend React

```powershell
# Ouvrir un nouveau terminal PowerShell
cd "c:\Users\oussama\Desktop\Nouveau dossier\fairtravel-frontend"

# Démarrer React
npm start
```

✅ L'application s'ouvre automatiquement sur http://localhost:3000

## 🎯 Tester les Nouvelles Fonctionnalités

### Via l'Interface Web

1. **Ouvrir votre navigateur** sur http://localhost:3000

2. **Cliquer sur "Services"** dans la navigation

3. **Tester le CRUD :**
   - Cliquer sur "**+ Ajouter Service**"
   - Remplir le formulaire et créer
   - Voir la liste mise à jour
   - Cliquer "**Modifier**" sur un service
   - Modifier et sauvegarder
   - Cliquer "**Supprimer**" (avec confirmation)

4. **Répéter pour Reviews et Awards**

### Via le Script de Test

```powershell
# Dans le dossier principal
.\test_crud.ps1
```

Le script va :
- ✅ Créer un Service de test
- ✅ Créer un Review de test
- ✅ Créer un Award de test
- ✅ Tester toutes les opérations CRUD
- ✅ Proposer le nettoyage des données de test

## 📱 Navigation Rapide

Une fois l'application lancée :

| Lien | Fonctionnalité |
|------|----------------|
| http://localhost:3000/services | Liste des services |
| http://localhost:3000/services/new | Créer un service |
| http://localhost:3000/reviews | Liste des avis |
| http://localhost:3000/reviews/new | Créer un avis |
| http://localhost:3000/awards | Liste des prix |
| http://localhost:3000/awards/new | Créer un prix |

## 🐛 Dépannage Express

### Erreur : "Cannot connect to backend"
```powershell
# Vérifier que Flask tourne
curl http://localhost:5000/services
```

### Erreur : "SPARQL endpoint not found"
```powershell
# Vérifier Fuseki
curl http://localhost:3030/$/ping
```

### Erreur : "Module not found"
```powershell
# Backend
pip install flask flask-cors SPARQLWrapper groq

# Frontend
cd fairtravel-frontend
npm install
```

## 📚 Documentation Complète

Pour plus de détails, consultez :
- **CRUD_DOCUMENTATION.md** - Guide complet avec exemples d'API
- **IMPLEMENTATION_SUMMARY.md** - Résumé de l'implémentation
- **DOCUMENTATION_TRAVAIL_3_CLASSES.md** - Documentation ontologie

## 🎨 Aperçu des Pages

### Page Services
```
┌─────────────────────────────────────┐
│ Services            [+ Ajouter]     │
├─────────────────────────────────────┤
│ [Rechercher...]                     │
├─────────────────────────────────────┤
│ ○ Centre Écotourisme Sousse         │
│   Type: Information | Score: 95     │
│   [Modifier] [Supprimer]            │
├─────────────────────────────────────┤
│ ○ Marché Artisanal Medina          │
│   Type: Shopping | Score: 88        │
│   [Modifier] [Supprimer]            │
└─────────────────────────────────────┘
```

### Page Reviews
```
┌─────────────────────────────────────┐
│ Avis (Reviews)      [+ Ajouter]     │
├─────────────────────────────────────┤
│ [Rechercher...]                     │
├─────────────────────────────────────┤
│ Review_001                          │
│ ★★★★★                              │
│ Par: Marie D. | Date: 2025-10-26    │
│ "Excellent service, très..."        │
│   [Modifier] [Supprimer]            │
└─────────────────────────────────────┘
```

### Page Awards
```
┌─────────────────────────────────────┐
│ Prix et Certifications [+ Ajouter]  │
├─────────────────────────────────────┤
│ [Rechercher...]                     │
├─────────────────────────────────────┤
│ ○ Certification Écologique Or       │
│   Type: Eco-Label | Par: UE         │
│   Niveau: Or | Date: 2025-01-15     │
│   [Modifier] [Supprimer]            │
└─────────────────────────────────────┘
```

## 💡 Exemples Rapides

### Créer un Service via cURL

```bash
curl -X POST http://localhost:5000/services \
  -H "Content-Type: application/json" \
  -d '{
    "id": "BikeRental_Paris",
    "type": "LocalShop",
    "properties": {
      "serviceName": "Vélos Verts Paris",
      "serviceType": "Bike Rental",
      "operatingHours": "09:00-19:00",
      "sustainabilityScore": 90,
      "locallyOwned": true
    }
  }'
```

### Créer un Review via cURL

```bash
curl -X POST http://localhost:5000/reviews \
  -H "Content-Type: application/json" \
  -d '{
    "id": "Review_BikeRental_001",
    "type": "ServiceReview",
    "properties": {
      "rating": 5,
      "reviewText": "Super service!",
      "reviewDate": "2025-10-26",
      "reviewerName": "Jean Dupont",
      "sustainabilityRating": 5
    }
  }'
```

### Créer un Award via cURL

```bash
curl -X POST http://localhost:5000/awards \
  -H "Content-Type: application/json" \
  -d '{
    "id": "GreenLabel_2025",
    "properties": {
      "awardName": "Label Vert",
      "awardType": "Eco-Label",
      "awardedBy": "Ministère Environnement",
      "dateAwarded": "2025-10-26",
      "description": "Prix écologique",
      "level": "Gold"
    }
  }'
```

## ✅ Checklist de Vérification

Avant de commencer :

- [ ] Node.js installé (v16+)
- [ ] Python installé (v3.8+)
- [ ] Apache Jena Fuseki installé
- [ ] Dataset FairTravel créé dans Fuseki
- [ ] Ontologie FairTravel.ttl chargée dans Fuseki
- [ ] Packages Python installés (`pip install -r requirements.txt`)
- [ ] Packages npm installés (`npm install` dans fairtravel-frontend)

## 🎯 Premier Test Recommandé

1. Démarrer tous les services (Fuseki, Flask, React)
2. Ouvrir http://localhost:3000
3. Aller sur "Services"
4. Cliquer "**+ Ajouter Service**"
5. Remplir :
   - ID: `MonPremierService`
   - Type: `Service`
   - Nom: `Test Service`
   - Score: `80`
6. Cliquer "**Créer**"
7. Vérifier que le service apparaît dans la liste
8. Cliquer "**Modifier**", changer le score à `90`
9. Vérifier la modification
10. Cliquer "**Supprimer**" et confirmer

✨ **Si tout fonctionne, le CRUD est opérationnel !**

## 📞 Support

En cas de problème :
1. Vérifier les logs de Flask
2. Vérifier la console du navigateur (F12)
3. Consulter CRUD_DOCUMENTATION.md
4. Vérifier que Fuseki est accessible

---

**Bon développement ! 🚀**
