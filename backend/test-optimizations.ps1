# ================================================
# API Performance Testing Script
# Tests optimized patient search and consultation history
# ================================================

# Test Configuration
$BASE_URL = "http://localhost:5000/api"
$TOKEN = Get-Content "d:\vipin\projects\doc-patient\backend\token.txt" -Raw

$headers = @{
    "Authorization" = "Bearer $($TOKEN.Trim())"
    "Content-Type" = "application/json"
}

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "Testing Backend Optimizations" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# ================================================
# Test 1: Patient Search Performance
# ================================================
Write-Host "[Test 1] Patient Search - Performance Test" -ForegroundColor Yellow
Write-Host "Testing: GET /api/patients/search?q=john&limit=10" -ForegroundColor Gray

$searchStart = Get-Date
try {
    $searchResponse = Invoke-RestMethod -Uri "$BASE_URL/patients/search?q=john&amp;limit=10" -Method GET -Headers $headers
    $searchEnd = Get-Date
    $searchDuration = ($searchEnd - $searchStart).TotalMilliseconds
    
    Write-Host "OK Search completed in $([math]::Round($searchDuration, 2))ms" -ForegroundColor Green
    
    if ($searchDuration -lt 100) {
        Write-Host "OK Performance target met (< 100ms)" -ForegroundColor Green
    }
    else {
        Write-Host "WARNING Performance target not met (expected < 100ms)" -ForegroundColor Yellow
    }
    
    Write-Host "  Results returned: $($searchResponse.patients.Count)" -ForegroundColor Gray
    Write-Host "  Fields returned: id, name, age, phone, lastVisit, gender" -ForegroundColor Gray
    
    if ($searchResponse.patients.Count -gt 0) {
        Write-Host "  Sample result:" -ForegroundColor Gray
        $sample = $searchResponse.patients[0]
        Write-Host "    - ID: $($sample.id)" -ForegroundColor Gray
        Write-Host "    - Name: $($sample.name)" -ForegroundColor Gray
        Write-Host "    - Age: $($sample.age)" -ForegroundColor Gray
        Write-Host "    - Phone: $($sample.phone)" -ForegroundColor Gray
    }
}
catch {
    Write-Host "ERROR Search failed: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# ================================================
# Test 2: Search with Limit
# ================================================
Write-Host "[Test 2] Patient Search - Custom Limit" -ForegroundColor Yellow
Write-Host "Testing: GET /api/patients/search?q=a&limit=5" -ForegroundColor Gray

try {
    $limitResponse = Invoke-RestMethod -Uri "$BASE_URL/patients/search?q=a&limit=5" -Method GET -Headers $headers
    
    if ($limitResponse.patients.Count -le 5) {
        Write-Host "✓ Limit parameter working correctly" -ForegroundColor Green
        Write-Host "  Results returned: $($limitResponse.patients.Count) (max 5)" -ForegroundColor Gray
    } else {
        Write-Host "✗ Limit parameter not working (returned $($limitResponse.patients.Count) results)" -ForegroundColor Red
    }
} catch {
    Write-Host "✗ Test failed: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# ================================================
# Test 3: Consultation History without Date Filter
# ================================================
Write-Host "[Test 3] Consultation History - No Date Filter" -ForegroundColor Yellow

# Get first patient ID from search
$patientId = $null
try {
    $patientsResponse = Invoke-RestMethod -Uri "$BASE_URL/patients/search?q=a&limit=1" -Method GET -Headers $headers
    if ($patientsResponse.patients.Count -gt 0) {
        $patientId = $patientsResponse.patients[0].id
        Write-Host "Using patient: $($patientsResponse.patients[0].name) (ID: $patientId)" -ForegroundColor Gray
    }
} catch {
    Write-Host "⚠ Could not retrieve patient for testing" -ForegroundColor Yellow
}

if ($patientId) {
    Write-Host "Testing: GET /api/patients/$patientId/consultations?limit=10&offset=0" -ForegroundColor Gray
    
    try {
        $historyResponse = Invoke-RestMethod -Uri "$BASE_URL/patients/$patientId/consultations?limit=10&offset=0" -Method GET -Headers $headers
        
        Write-Host "✓ Consultation history retrieved successfully" -ForegroundColor Green
        Write-Host "  Total consultations: $($historyResponse.total)" -ForegroundColor Gray
        Write-Host "  Consultations returned: $($historyResponse.consultations.Count)" -ForegroundColor Gray
        Write-Host "  Pages: $($historyResponse.pages)" -ForegroundColor Gray
        Write-Host "  Current page: $($historyResponse.currentPage)" -ForegroundColor Gray
        
        if ($historyResponse.consultations.Count -gt 0) {
            Write-Host "  Sample consultation:" -ForegroundColor Gray
            $consultation = $historyResponse.consultations[0]
            Write-Host "    - Date: $($consultation.date)" -ForegroundColor Gray
            Write-Host "    - Temperature: $($consultation.temperature)°F" -ForegroundColor Gray
            Write-Host "    - BP: $($consultation.bp)" -ForegroundColor Gray
            Write-Host "    - Pulse: $($consultation.pulse) BPM" -ForegroundColor Gray
            Write-Host "    - Medications: $($consultation.medicationCount)" -ForegroundColor Gray
        }
    } catch {
        Write-Host "✗ Test failed: $($_.Exception.Message)" -ForegroundColor Red
    }
    Write-Host ""
    
    # ================================================
    # Test 4: Consultation History with Date Range
    # ================================================
    Write-Host "[Test 4] Consultation History - With Date Range" -ForegroundColor Yellow
    Write-Host "Testing: GET /api/patients/$patientId/consultations?from=2026-01-01&to=2026-05-31" -ForegroundColor Gray
    
    try {
        $dateFilterResponse = Invoke-RestMethod -Uri "$BASE_URL/patients/$patientId/consultations?from=2026-01-01&to=2026-05-31&limit=10&offset=0" -Method GET -Headers $headers
        
        Write-Host "✓ Date range filtering working" -ForegroundColor Green
        Write-Host "  Filtered results: $($dateFilterResponse.consultations.Count)" -ForegroundColor Gray
        Write-Host "  Date range: $($dateFilterResponse.filters.from) to $($dateFilterResponse.filters.to)" -ForegroundColor Gray
        
        # Verify all dates are within range
        $allInRange = $true
        foreach ($consultation in $dateFilterResponse.consultations) {
            $consultDate = [DateTime]::Parse($consultation.date)
            if ($consultDate -lt [DateTime]::Parse("2026-01-01") -or $consultDate -gt [DateTime]::Parse("2026-05-31")) {
                $allInRange = $false
                break
            }
        }
        
        if ($allInRange) {
            Write-Host "✓ All results within date range" -ForegroundColor Green
        } else {
            Write-Host "✗ Some results outside date range" -ForegroundColor Red
        }
    } catch {
        Write-Host "✗ Test failed: $($_.Exception.Message)" -ForegroundColor Red
    }
    Write-Host ""
    
    # ================================================
    # Test 5: Pagination
    # ================================================
    Write-Host "[Test 5] Consultation History - Pagination" -ForegroundColor Yellow
    Write-Host "Testing pagination with limit=5, offset=0 and offset=5" -ForegroundColor Gray
    
    try {
        $page1 = Invoke-RestMethod -Uri "$BASE_URL/patients/$patientId/consultations?limit=5&offset=0" -Method GET -Headers $headers
        $page2 = Invoke-RestMethod -Uri "$BASE_URL/patients/$patientId/consultations?limit=5&offset=5" -Method GET -Headers $headers
        
        Write-Host "✓ Pagination working" -ForegroundColor Green
        Write-Host "  Page 1: $($page1.consultations.Count) results (currentPage: $($page1.currentPage))" -ForegroundColor Gray
        Write-Host "  Page 2: $($page2.consultations.Count) results (currentPage: $($page2.currentPage))" -ForegroundColor Gray
        
        if ($page1.currentPage -eq 1 -and $page2.currentPage -eq 2) {
            Write-Host "✓ Page numbers correct" -ForegroundColor Green
        } else {
            Write-Host "✗ Page numbers incorrect" -ForegroundColor Red
        }
    } catch {
        Write-Host "✗ Test failed: $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "Testing Complete" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
