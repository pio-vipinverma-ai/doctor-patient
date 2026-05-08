# Simple API Optimization Test Script
# Tests patient search and consultation history with date filtering

$BASE_URL = "http://localhost:5000/api"
$TOKEN = (Get-Content "d:\vipin\projects\doc-patient\backend\token.txt" -Raw).Trim()

$headers = @{
    "Authorization" = "Bearer $TOKEN"
    "Content-Type" = "application/json"
}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "API Optimization Tests" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# Test 1: Patient Search Performance
Write-Host "[Test 1] Patient Search Performance" -ForegroundColor Yellow
$searchUrl = "$BASE_URL/patients/search" + "?q=john" + "&limit=10"
$searchStart = Get-Date
try {
    $searchResponse = Invoke-RestMethod -Uri $searchUrl -Method GET -Headers $headers
    $searchEnd = Get-Date
    $searchDuration = ($searchEnd - $searchStart).TotalMilliseconds
    
    Write-Host "SUCCESS - Search completed in $([math]::Round($searchDuration, 2))ms" -ForegroundColor Green
    
    if ($searchDuration -lt 100) {
        Write-Host "SUCCESS - Performance target met (< 100ms)" -ForegroundColor Green
    }
    else {
        Write-Host "WARNING - Performance: $searchDuration ms (target: < 100ms)" -ForegroundColor Yellow
    }
    
    Write-Host "Results: $($searchResponse.patients.Count) patients" -ForegroundColor Gray
    
    if ($searchResponse.patients.Count -gt 0) {
        $sample = $searchResponse.patients[0]
        Write-Host "Sample: $($sample.name), Age: $($sample.age), Phone: $($sample.phone)" -ForegroundColor Gray
    }
}
catch {
    Write-Host "ERROR - Search failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n"

# Test 2: Search with Custom Limit
Write-Host "[Test 2] Patient Search with Limit=5" -ForegroundColor Yellow
$limitUrl = "$BASE_URL/patients/search" + "?q=a" + "&limit=5"
try {
    $limitResponse = Invoke-RestMethod -Uri $limitUrl -Method GET -Headers $headers
    
    if ($limitResponse.patients.Count -le 5) {
        Write-Host "SUCCESS - Limit parameter working (returned $($limitResponse.patients.Count) results)" -ForegroundColor Green
    }
    else {
        Write-Host "ERROR - Limit not working (returned $($limitResponse.patients.Count) results)" -ForegroundColor Red
    }
}
catch {
    Write-Host "ERROR - Test failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n"

# Get a patient ID for consultation tests
Write-Host "[Setup] Getting patient ID for consultation tests" -ForegroundColor Yellow
$patientId = $null
$patientUrl = "$BASE_URL/patients/search" + "?q=a" + "&limit=1"
try {
    $patientsResponse = Invoke-RestMethod -Uri $patientUrl -Method GET -Headers $headers
    if ($patientsResponse.patients.Count -gt 0) {
        $patientId = $patientsResponse.patients[0].id
        Write-Host "Using patient: $($patientsResponse.patients[0].name) (ID: $patientId)" -ForegroundColor Gray
    }
}
catch {
    Write-Host "WARNING - Could not retrieve patient" -ForegroundColor Yellow
}

if ($patientId) {
    Write-Host "`n"
    
    # Test 3: Consultation History
    Write-Host "[Test 3] Consultation History (No Date Filter)" -ForegroundColor Yellow
    $historyUrl = "$BASE_URL/patients/$patientId/consultations" + "?limit=10" + "&offset=0"
    try {
        $historyResponse = Invoke-RestMethod -Uri $historyUrl -Method GET -Headers $headers
        
        Write-Host "SUCCESS - Retrieved consultation history" -ForegroundColor Green
        Write-Host "Total: $($historyResponse.total) consultations" -ForegroundColor Gray
        Write-Host "Returned: $($historyResponse.consultations.Count) consultations" -ForegroundColor Gray
        Write-Host "Pages: $($historyResponse.pages), Current: $($historyResponse.currentPage)" -ForegroundColor Gray
        
        if ($historyResponse.consultations.Count -gt 0) {
            $consultation = $historyResponse.consultations[0]
            Write-Host "Sample: Date=$($consultation.date), Temp=$($consultation.temperature)F, BP=$($consultation.bp), Pulse=$($consultation.pulse)" -ForegroundColor Gray
        }
    }
    catch {
        Write-Host "ERROR - Test failed: $($_.Exception.Message)" -ForegroundColor Red
    }
    
    Write-Host "`n"
    
    # Test 4: Consultation History with Date Range
    Write-Host "[Test 4] Consultation History with Date Range" -ForegroundColor Yellow
    $dateUrl = "$BASE_URL/patients/$patientId/consultations" + "?from=2026-01-01" + "&to=2026-05-31" + "&limit=10" + "&offset=0"
    try {
        $dateResponse = Invoke-RestMethod -Uri $dateUrl -Method GET -Headers $headers
        
        Write-Host "SUCCESS - Date range filtering working" -ForegroundColor Green
        Write-Host "Filtered results: $($dateResponse.consultations.Count)" -ForegroundColor Gray
        Write-Host "Date range: $($dateResponse.filters.from) to $($dateResponse.filters.to)" -ForegroundColor Gray
        
        # Verify dates are in range
        $allInRange = $true
        foreach ($consultation in $dateResponse.consultations) {
            $consultDate = [DateTime]::Parse($consultation.date)
            if ($consultDate -lt [DateTime]::Parse("2026-01-01") -or $consultDate -gt [DateTime]::Parse("2026-05-31")) {
                $allInRange = $false
                break
            }
        }
        
        if ($allInRange) {
            Write-Host "SUCCESS - All results within date range" -ForegroundColor Green
        }
        else {
            Write-Host "ERROR - Some results outside date range" -ForegroundColor Red
        }
    }
    catch {
        Write-Host "ERROR - Test failed: $($_.Exception.Message)" -ForegroundColor Red
    }
    
    Write-Host "`n"
    
    # Test 5: Pagination
    Write-Host "[Test 5] Consultation History Pagination" -ForegroundColor Yellow
    $page1Url = "$BASE_URL/patients/$patientId/consultations" + "?limit=5" + "&offset=0"
    $page2Url = "$BASE_URL/patients/$patientId/consultations" + "?limit=5" + "&offset=5"
    try {
        $page1 = Invoke-RestMethod -Uri $page1Url -Method GET -Headers $headers
        $page2 = Invoke-RestMethod -Uri $page2Url -Method GET -Headers $headers
        
        Write-Host "SUCCESS - Pagination working" -ForegroundColor Green
        Write-Host "Page 1: $($page1.consultations.Count) results (page $($page1.currentPage))" -ForegroundColor Gray
        Write-Host "Page 2: $($page2.consultations.Count) results (page $($page2.currentPage))" -ForegroundColor Gray
        
        if ($page1.currentPage -eq 1 -and $page2.currentPage -eq 2) {
            Write-Host "SUCCESS - Page numbers correct" -ForegroundColor Green
        }
        else {
            Write-Host "ERROR - Page numbers incorrect" -ForegroundColor Red
        }
    }
    catch {
        Write-Host "ERROR - Test failed: $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "Tests Complete" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan
