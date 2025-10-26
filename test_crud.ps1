# Test Script pour CRUD - Service, Review, Award
# Utiliser PowerShell pour exécuter ce script

# Configuration
$baseUrl = "http://localhost:5000"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "TESTS CRUD - FairTravel" -ForegroundColor Cyan
Write-Host "Service, Review, Award" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

# ==================== TEST SERVICE ====================
Write-Host "`n[SERVICE] Tests CRUD" -ForegroundColor Yellow

# 1. CREATE Service
Write-Host "`n1. Création d'un service..." -ForegroundColor Green
$serviceData = @{
    id = "TestService_001"
    type = "LocalShop"
    properties = @{
        serviceName = "Boutique Test Écologique"
        serviceType = "Eco Shop"
        operatingHours = "10:00-18:00"
        contactInfo = "test@example.com"
        priceRange = "€€"
        sustainabilityScore = 88
        locallyOwned = $true
        useLocalProducts = $true
    }
} | ConvertTo-Json -Depth 3

try {
    $response = Invoke-RestMethod -Uri "$baseUrl/services" -Method Post -Body $serviceData -ContentType "application/json"
    Write-Host "✓ Service créé : $($response.id)" -ForegroundColor Green
} catch {
    Write-Host "✗ Erreur création service : $($_.Exception.Message)" -ForegroundColor Red
}

# 2. READ Service List
Write-Host "`n2. Lecture de la liste des services..." -ForegroundColor Green
try {
    $services = Invoke-RestMethod -Uri "$baseUrl/services" -Method Get
    Write-Host "✓ Nombre de services : $($services.Count)" -ForegroundColor Green
} catch {
    Write-Host "✗ Erreur lecture services : $($_.Exception.Message)" -ForegroundColor Red
}

# 3. READ Service Details
Write-Host "`n3. Lecture des détails du service..." -ForegroundColor Green
try {
    $uri = "http://www.fairtravel.com/fairtravel#TestService_001"
    $details = Invoke-RestMethod -Uri "$baseUrl/service-details?uri=$([System.Uri]::EscapeDataString($uri))" -Method Get
    Write-Host "✓ Détails récupérés : $($details.Keys.Count) propriétés" -ForegroundColor Green
} catch {
    Write-Host "✗ Erreur lecture détails : $($_.Exception.Message)" -ForegroundColor Red
}

# 4. UPDATE Service
Write-Host "`n4. Mise à jour du service..." -ForegroundColor Green
$updateData = @{
    properties = @{
        sustainabilityScore = 95
        operatingHours = "09:00-19:00"
    }
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "$baseUrl/services/TestService_001" -Method Put -Body $updateData -ContentType "application/json"
    Write-Host "✓ Service mis à jour" -ForegroundColor Green
} catch {
    Write-Host "✗ Erreur mise à jour : $($_.Exception.Message)" -ForegroundColor Red
}

# 5. DELETE Service (sera fait à la fin)

# ==================== TEST REVIEW ====================
Write-Host "`n`n[REVIEW] Tests CRUD" -ForegroundColor Yellow

# 1. CREATE Review
Write-Host "`n1. Création d'un avis..." -ForegroundColor Green
$reviewData = @{
    id = "TestReview_001"
    type = "ServiceReview"
    properties = @{
        rating = 5
        reviewText = "Excellent service, très professionnel et écologique!"
        reviewDate = (Get-Date -Format "yyyy-MM-dd")
        reviewerName = "Test User"
        sustainabilityRating = 5
        mentionsSustainability = $true
        verified = $true
        reviewsService = "TestService_001"
    }
} | ConvertTo-Json -Depth 3

try {
    $response = Invoke-RestMethod -Uri "$baseUrl/reviews" -Method Post -Body $reviewData -ContentType "application/json"
    Write-Host "✓ Avis créé : $($response.id)" -ForegroundColor Green
} catch {
    Write-Host "✗ Erreur création avis : $($_.Exception.Message)" -ForegroundColor Red
}

# 2. READ Review List
Write-Host "`n2. Lecture de la liste des avis..." -ForegroundColor Green
try {
    $reviews = Invoke-RestMethod -Uri "$baseUrl/reviews" -Method Get
    Write-Host "✓ Nombre d'avis : $($reviews.Count)" -ForegroundColor Green
} catch {
    Write-Host "✗ Erreur lecture avis : $($_.Exception.Message)" -ForegroundColor Red
}

# 3. READ Review Details
Write-Host "`n3. Lecture des détails de l'avis..." -ForegroundColor Green
try {
    $uri = "http://www.fairtravel.com/fairtravel#TestReview_001"
    $details = Invoke-RestMethod -Uri "$baseUrl/review-details?uri=$([System.Uri]::EscapeDataString($uri))" -Method Get
    Write-Host "✓ Détails récupérés : $($details.Keys.Count) propriétés" -ForegroundColor Green
} catch {
    Write-Host "✗ Erreur lecture détails : $($_.Exception.Message)" -ForegroundColor Red
}

# 4. UPDATE Review
Write-Host "`n4. Mise à jour de l'avis..." -ForegroundColor Green
$updateData = @{
    properties = @{
        reviewText = "Service exceptionnel! Vraiment recommandé pour son engagement écologique."
        rating = 5
    }
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "$baseUrl/reviews/TestReview_001" -Method Put -Body $updateData -ContentType "application/json"
    Write-Host "✓ Avis mis à jour" -ForegroundColor Green
} catch {
    Write-Host "✗ Erreur mise à jour : $($_.Exception.Message)" -ForegroundColor Red
}

# ==================== TEST AWARD ====================
Write-Host "`n`n[AWARD] Tests CRUD" -ForegroundColor Yellow

# 1. CREATE Award
Write-Host "`n1. Création d'un prix..." -ForegroundColor Green
$awardData = @{
    id = "TestAward_001"
    properties = @{
        awardName = "Certification Test Or"
        awardType = "Certification"
        awardedBy = "Organisation Test"
        dateAwarded = (Get-Date -Format "yyyy-MM-dd")
        description = "Prix test pour validation du système CRUD"
        level = "Gold"
        validUntil = (Get-Date).AddYears(1).ToString("yyyy-MM-dd")
        receivedBy = "TestService_001"
    }
} | ConvertTo-Json -Depth 3

try {
    $response = Invoke-RestMethod -Uri "$baseUrl/awards" -Method Post -Body $awardData -ContentType "application/json"
    Write-Host "✓ Prix créé : $($response.id)" -ForegroundColor Green
} catch {
    Write-Host "✗ Erreur création prix : $($_.Exception.Message)" -ForegroundColor Red
}

# 2. READ Award List
Write-Host "`n2. Lecture de la liste des prix..." -ForegroundColor Green
try {
    $awards = Invoke-RestMethod -Uri "$baseUrl/awards" -Method Get
    Write-Host "✓ Nombre de prix : $($awards.Count)" -ForegroundColor Green
} catch {
    Write-Host "✗ Erreur lecture prix : $($_.Exception.Message)" -ForegroundColor Red
}

# 3. READ Award Details
Write-Host "`n3. Lecture des détails du prix..." -ForegroundColor Green
try {
    $uri = "http://www.fairtravel.com/fairtravel#TestAward_001"
    $details = Invoke-RestMethod -Uri "$baseUrl/award-details?uri=$([System.Uri]::EscapeDataString($uri))" -Method Get
    Write-Host "✓ Détails récupérés : $($details.Keys.Count) propriétés" -ForegroundColor Green
} catch {
    Write-Host "✗ Erreur lecture détails : $($_.Exception.Message)" -ForegroundColor Red
}

# 4. UPDATE Award
Write-Host "`n4. Mise à jour du prix..." -ForegroundColor Green
$updateData = @{
    properties = @{
        level = "Platinum"
        description = "Prix test MODIFIÉ pour validation du système CRUD"
    }
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "$baseUrl/awards/TestAward_001" -Method Put -Body $updateData -ContentType "application/json"
    Write-Host "✓ Prix mis à jour" -ForegroundColor Green
} catch {
    Write-Host "✗ Erreur mise à jour : $($_.Exception.Message)" -ForegroundColor Red
}

# ==================== CLEANUP ====================
Write-Host "`n`n[CLEANUP] Suppression des données de test" -ForegroundColor Yellow

Write-Host "`nVoulez-vous supprimer les données de test créées ? (O/N)" -ForegroundColor Cyan
$response = Read-Host

if ($response -eq "O" -or $response -eq "o") {
    # Delete Award
    Write-Host "`nSuppression du prix de test..." -ForegroundColor Green
    try {
        Invoke-RestMethod -Uri "$baseUrl/awards/TestAward_001" -Method Delete
        Write-Host "✓ Prix supprimé" -ForegroundColor Green
    } catch {
        Write-Host "✗ Erreur suppression prix : $($_.Exception.Message)" -ForegroundColor Red
    }

    # Delete Review
    Write-Host "`nSuppression de l'avis de test..." -ForegroundColor Green
    try {
        Invoke-RestMethod -Uri "$baseUrl/reviews/TestReview_001" -Method Delete
        Write-Host "✓ Avis supprimé" -ForegroundColor Green
    } catch {
        Write-Host "✗ Erreur suppression avis : $($_.Exception.Message)" -ForegroundColor Red
    }

    # Delete Service
    Write-Host "`nSuppression du service de test..." -ForegroundColor Green
    try {
        Invoke-RestMethod -Uri "$baseUrl/services/TestService_001" -Method Delete
        Write-Host "✓ Service supprimé" -ForegroundColor Green
    } catch {
        Write-Host "✗ Erreur suppression service : $($_.Exception.Message)" -ForegroundColor Red
    }
    
    Write-Host "`n✓ Nettoyage terminé" -ForegroundColor Green
} else {
    Write-Host "`n⚠ Données de test conservées" -ForegroundColor Yellow
    Write-Host "Vous pouvez les supprimer manuellement via l'interface web ou l'API" -ForegroundColor Yellow
}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "TESTS TERMINÉS" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
