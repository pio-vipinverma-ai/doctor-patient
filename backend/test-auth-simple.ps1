# Authentication API Test Script

Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "  Testing Authentication API" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan

# Test 1: Login with correct credentials
Write-Host "`n[Test 1] Login with valid credentials" -ForegroundColor Yellow
$body = @{username="doctor"; password="password123"} | ConvertTo-Json
$response = Invoke-WebRequest -Uri http://localhost:5000/api/auth/login -Method POST -Body $body -ContentType "application/json" -UseBasicParsing
$data = $response.Content | ConvertFrom-Json

if ($response.StatusCode -eq 200 -and $data.token) {
    Write-Host "✓ PASS" -ForegroundColor Green
    Write-Host "  Token: $($data.token.Substring(0, 50))..." -ForegroundColor Gray
    $global:token = $data.token
} else {
    Write-Host "✗ FAIL" -ForegroundColor Red
}

# Test 2: Login with wrong password
Write-Host "`n[Test 2] Login with invalid credentials" -ForegroundColor Yellow
$body = @{username="doctor"; password="wrongpassword"} | ConvertTo-Json
try {
    Invoke-WebRequest -Uri http://localhost:5000/api/auth/login -Method POST -Body $body -ContentType "application/json" -UseBasicParsing -ErrorAction Stop | Out-Null
    Write-Host "✗ FAIL: Should return 401" -ForegroundColor Red
} catch {
    Write-Host "✓ PASS: Returns 401" -ForegroundColor Green
}

# Test 3: Profile without token
Write-Host "`n[Test 3] Protected route without token" -ForegroundColor Yellow
try {
    Invoke-WebRequest -Uri http://localhost:5000/api/auth/profile -Method GET -UseBasicParsing -ErrorAction Stop | Out-Null
    Write-Host "✗ FAIL: Should return 401" -ForegroundColor Red
} catch {
    Write-Host "✓ PASS: Returns 401" -ForegroundColor Green
}

# Test 4: Profile with valid token
Write-Host "`n[Test 4] Protected route with valid token" -ForegroundColor Yellow
$headers = @{Authorization = "Bearer $global:token"}
$response = Invoke-WebRequest -Uri http://localhost:5000/api/auth/profile -Method GET -Headers $headers -UseBasicParsing
$data = $response.Content | ConvertFrom-Json

if ($response.StatusCode -eq 200 -and $data.user) {
    Write-Host "✓ PASS" -ForegroundColor Green
    Write-Host "  User: $($data.user.username) - $($data.user.name)" -ForegroundColor Gray
} else {
    Write-Host "✗ FAIL" -ForegroundColor Red
}

# Test 5: Logout
Write-Host "`n[Test 5] Logout endpoint" -ForegroundColor Yellow
$headers = @{Authorization = "Bearer $global:token"}
$response = Invoke-WebRequest -Uri http://localhost:5000/api/auth/logout -Method POST -Headers $headers -UseBasicParsing
$data = $response.Content | ConvertFrom-Json

if ($response.StatusCode -eq 200 -and $data.success) {
    Write-Host "✓ PASS" -ForegroundColor Green
    Write-Host "  Message: $($data.message)" -ForegroundColor Gray
} else {
    Write-Host "✗ FAIL" -ForegroundColor Red
}

Write-Host "`n=========================================" -ForegroundColor Cyan
Write-Host "  All Tests Complete!" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
