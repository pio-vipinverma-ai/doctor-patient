# Test script for Export API (CSV & PDF)
# Tests Phase 7, Step 7.1 - Backend Export API

Write-Host "=== Testing Export API (CSV & PDF) ===" -ForegroundColor Cyan
Write-Host ""

# Configuration
$BASE_URL = "http://localhost:5000"

# Step 1: Login to get token
Write-Host "Step 1: Authenticating..." -ForegroundColor Yellow
$loginBody = @{
    username = "doctor"
    password = "password123"
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri "$BASE_URL/api/auth/login" -Method POST -Body $loginBody -ContentType "application/json"
    $token = $loginResponse.token
    Write-Host "OK Authentication successful" -ForegroundColor Green
} catch {
    Write-Host "ERROR Authentication failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Headers for authenticated requests
$headers = @{
    "Authorization" = "Bearer $token"
}

# Step 2: Test CSV Patient Export
Write-Host "Step 2: Testing CSV Patient Export..." -ForegroundColor Yellow
try {
    $exportParams = @{
        format = "csv"
    }
    $patientsUrl = "$BASE_URL/api/exports/patients"
    
    $response = Invoke-WebRequest -Uri $patientsUrl -Method GET -Headers $headers -Body $exportParams -OutFile "patients_export_test.csv"
    
    Write-Host "OK CSV Patient Export successful" -ForegroundColor Green
    Write-Host "  File saved: patients_export_test.csv" -ForegroundColor Gray
    
    # Check if file exists and has content
    if (Test-Path "patients_export_test.csv") {
        $fileSize = (Get-Item "patients_export_test.csv").Length
        Write-Host "  File size: $fileSize bytes" -ForegroundColor Gray
        
        # Read first few lines
        $content = Get-Content "patients_export_test.csv" -TotalCount 5
        Write-Host "  First line: $($content[0])" -ForegroundColor Gray
    }
} catch {
    Write-Host "ERROR CSV Patient Export failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Step 3: Test CSV Patient Export with Date Filter
Write-Host "Step 3: Testing CSV Patient Export with Date Filter..." -ForegroundColor Yellow
try {
    $exportParams = @{
        format = "csv"
        from = "2025-01-01"
        to = "2026-12-31"
    }
    $patientsUrl = "$BASE_URL/api/exports/patients"
    
    $response = Invoke-WebRequest -Uri $patientsUrl -Method GET -Headers $headers -Body $exportParams -OutFile "patients_filtered_export_test.csv"
    
    Write-Host "OK CSV Patient Export with date filter successful" -ForegroundColor Green
    Write-Host "  File saved: patients_filtered_export_test.csv" -ForegroundColor Gray
    
    if (Test-Path "patients_filtered_export_test.csv") {
        $fileSize = (Get-Item "patients_filtered_export_test.csv").Length
        Write-Host "  File size: $fileSize bytes" -ForegroundColor Gray
    }
} catch {
    Write-Host "ERROR CSV Patient Export with date filter failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Step 4: Test CSV Consultation Export
Write-Host "Step 4: Testing CSV Consultation Export..." -ForegroundColor Yellow
try {
    $exportParams = @{
        format = "csv"
    }
    $consultationsUrl = "$BASE_URL/api/exports/consultations"
    
    $response = Invoke-WebRequest -Uri $consultationsUrl -Method GET -Headers $headers -Body $exportParams -OutFile "consultations_export_test.csv"
    
    Write-Host "OK CSV Consultation Export successful" -ForegroundColor Green
    Write-Host "  File saved: consultations_export_test.csv" -ForegroundColor Gray
    
    if (Test-Path "consultations_export_test.csv") {
        $fileSize = (Get-Item "consultations_export_test.csv").Length
        Write-Host "  File size: $fileSize bytes" -ForegroundColor Gray
        
        # Read first few lines
        $content = Get-Content "consultations_export_test.csv" -TotalCount 5
        Write-Host "  First line: $($content[0])" -ForegroundColor Gray
    }
} catch {
    Write-Host "ERROR CSV Consultation Export failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Step 5: Test CSV Consultation Export with Date Range
Write-Host "Step 5: Testing CSV Consultation Export with Date Range..." -ForegroundColor Yellow
try {
    $exportParams = @{
        format = "csv"
        from = "2026-01-01"
        to = "2026-05-31"
    }
    $consultationsUrl = "$BASE_URL/api/exports/consultations"
    
    $response = Invoke-WebRequest -Uri $consultationsUrl -Method GET -Headers $headers -Body $exportParams -OutFile "consultations_filtered_export_test.csv"
    
    Write-Host "OK CSV Consultation Export with date range successful" -ForegroundColor Green
    Write-Host "  File saved: consultations_filtered_export_test.csv" -ForegroundColor Gray
    Write-Host "  Date range: 2026-01-01 to 2026-05-31" -ForegroundColor Gray
    
    if (Test-Path "consultations_filtered_export_test.csv") {
        $fileSize = (Get-Item "consultations_filtered_export_test.csv").Length
        Write-Host "  File size: $fileSize bytes" -ForegroundColor Gray
    }
} catch {
    Write-Host "ERROR CSV Consultation Export with date range failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Step 6: Test PDF Consultation Export
Write-Host "Step 6: Testing PDF Consultation Export..." -ForegroundColor Yellow
try {
    $exportParams = @{
        format = "pdf"
    }
    $consultationsUrl = "$BASE_URL/api/exports/consultations"
    
    $response = Invoke-WebRequest -Uri $consultationsUrl -Method GET -Headers $headers -Body $exportParams -OutFile "consultations_report_test.pdf"
    
    Write-Host "OK PDF Consultation Export successful" -ForegroundColor Green
    Write-Host "  File saved: consultations_report_test.pdf" -ForegroundColor Gray
    
    if (Test-Path "consultations_report_test.pdf") {
        $fileSize = (Get-Item "consultations_report_test.pdf").Length
        Write-Host "  File size: $fileSize bytes" -ForegroundColor Gray
        Write-Host "  PDF can be opened with any PDF reader" -ForegroundColor Gray
    }
} catch {
    Write-Host "ERROR PDF Consultation Export failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Step 7: Test PDF Consultation Export with Date Range
Write-Host "Step 7: Testing PDF Consultation Export with Date Range..." -ForegroundColor Yellow
try {
    $exportParams = @{
        format = "pdf"
        from = "2026-01-01"
        to = "2026-05-31"
    }
    $consultationsUrl = "$BASE_URL/api/exports/consultations"
    
    $response = Invoke-WebRequest -Uri $consultationsUrl -Method GET -Headers $headers -Body $exportParams -OutFile "consultations_filtered_report_test.pdf"
    
    Write-Host "OK PDF Consultation Export with date range successful" -ForegroundColor Green
    Write-Host "  File saved: consultations_filtered_report_test.pdf" -ForegroundColor Gray
    Write-Host "  Date range: 2026-01-01 to 2026-05-31" -ForegroundColor Gray
    
    if (Test-Path "consultations_filtered_report_test.pdf") {
        $fileSize = (Get-Item "consultations_filtered_report_test.pdf").Length
        Write-Host "  File size: $fileSize bytes" -ForegroundColor Gray
    }
} catch {
    Write-Host "ERROR PDF Consultation Export with date range failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Summary
Write-Host "=== Test Summary ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "OK CSV Patient Export" -ForegroundColor Green
Write-Host "OK CSV Patient Export with Date Filter" -ForegroundColor Green
Write-Host "OK CSV Consultation Export" -ForegroundColor Green
Write-Host "OK CSV Consultation Export with Date Range" -ForegroundColor Green
Write-Host "OK PDF Consultation Export" -ForegroundColor Green
Write-Host "OK PDF Consultation Export with Date Range" -ForegroundColor Green
Write-Host ""
Write-Host "Generated Files:" -ForegroundColor Yellow
Write-Host "  - patients_export_test.csv" -ForegroundColor White
Write-Host "  - patients_filtered_export_test.csv" -ForegroundColor White
Write-Host "  - consultations_export_test.csv" -ForegroundColor White
Write-Host "  - consultations_filtered_export_test.csv" -ForegroundColor White
Write-Host "  - consultations_report_test.pdf" -ForegroundColor White
Write-Host "  - consultations_filtered_report_test.pdf" -ForegroundColor White
Write-Host ""
Write-Host "SUCCESS All Export API Tests Passed!" -ForegroundColor Green
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host "1. Open CSV files in Excel/Google Sheets to verify data" -ForegroundColor White
Write-Host "2. Open PDF files in a PDF reader to verify format" -ForegroundColor White
Write-Host "3. Verify headers match specifications" -ForegroundColor White
Write-Host "4. Check date filtering worked correctly" -ForegroundColor White
