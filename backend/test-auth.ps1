# Authentication API Test Script

Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "  Authentication API Test Suite" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan

# Test 1: Login with correct credentials
Write-Host "`n[Test 1] Login with correct credentials..." -ForegroundColor Yellow
$body = @{username="doctor"; password="password123"} | ConvertTo-Json
try {
    $response = Invoke-WebRequest -Uri http://localhost:5000/api/auth/login -Method POST -Body $body -ContentType "application/json" -UseBasicParsing
    $data = $response.Content | ConvertFrom-Json
    
    if ($data.success -and $data.token -and $data.refreshToken -and $data.user) {
        Write-Host "✓ PASS: Login successful" -ForegroundColor Green
        Write-Host "  - Token: $($data.token.Substring(0, 50))..." -ForegroundColor Gray
        Write-Host "  - User: $($data.user.username) ($($data.user.email))" -ForegroundColor Gray
        $token = $data.token
    } else {
        Write-Host "✗ FAIL: Response missing required fields" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "✗ FAIL: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Test 2: Login with wrong password
Write-Host "`n[Test 2] Login with wrong password..." -ForegroundColor Yellow
$body = @{username="doctor"; password="wrongpassword"} | ConvertTo-Json
try {
    $response = Invoke-WebRequest -Uri http://localhost:5000/api/auth/login -Method POST -Body $body -ContentType "application/json" -UseBasicParsing -ErrorAction Stop
    Write-Host "✗ FAIL: Should have returned 401" -ForegroundColor Red
} catch {
    if ($_.Exception.Response.StatusCode -eq 401) {
        Write-Host "✓ PASS: Returns 401 for invalid credentials" -ForegroundColor Green
    } else {
        Write-Host "✗ FAIL: Wrong status code: $($_.Exception.Response.StatusCode)" -ForegroundColor Red
    }
}

# Test 3: Protected route without token
Write-Host "`n[Test 3] Access protected route without token..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri http://localhost:5000/api/auth/profile -Method GET -UseBasicParsing -ErrorAction Stop
    Write-Host "✗ FAIL: Should have returned 401" -ForegroundColor Red
} catch {
    if ($_.Exception.Response.StatusCode -eq 401) {
        Write-Host "✓ PASS: Returns 401 without token" -ForegroundColor Green
    } else {
        Write-Host "✗ FAIL: Wrong status code: $($_.Exception.Response.StatusCode)" -ForegroundColor Red
    }
}

# Test 4: Protected route with valid token
Write-Host "`n[Test 4] Access protected route with valid token..." -ForegroundColor Yellow
$headers = @{Authorization = "Bearer $token"}
try {
    $response = Invoke-WebRequest -Uri http://localhost:5000/api/auth/profile -Method GET -Headers $headers -UseBasicParsing
    $data = $response.Content | ConvertFrom-Json
    
    if ($data.success -and $data.user) {
        Write-Host "✓ PASS: Returns user profile" -ForegroundColor Green
        Write-Host "  - User: $($data.user.username) ($($data.user.name))" -ForegroundColor Gray
    } else {
        Write-Host "✗ FAIL: Response missing user data" -ForegroundColor Red
    }
} catch {
    Write-Host "✗ FAIL: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 5: Protected route with invalid token
Write-Host "`n[Test 5] Access protected route with invalid token..." -ForegroundColor Yellow
$headers = @{Authorization = "Bearer invalid.token.here"}
try {
    $response = Invoke-WebRequest -Uri http://localhost:5000/api/auth/profile -Method GET -Headers $headers -UseBasicParsing -ErrorAction Stop
    Write-Host "✗ FAIL: Should have returned 401" -ForegroundColor Red
} catch {
    if ($_.Exception.Response.StatusCode -eq 401) {
        Write-Host "✓ PASS: Returns 401 for invalid token" -ForegroundColor Green
    } else {
        Write-Host "✗ FAIL: Wrong status code: $($_.Exception.Response.StatusCode)" -ForegroundColor Red
    }
}

# Test 6: Logout endpoint
Write-Host "`n[Test 6] Logout endpoint..." -ForegroundColor Yellow
$headers = @{Authorization = "Bearer $token"}
try {
    $response = Invoke-WebRequest -Uri http://localhost:5000/api/auth/logout -Method POST -Headers $headers -UseBasicParsing
    $data = $response.Content | ConvertFrom-Json
    
    if ($data.success -and $data.message) {
        Write-Host "✓ PASS: Logout successful" -ForegroundColor Green
        Write-Host "  - Message: $($data.message)" -ForegroundColor Gray
    } else {
        Write-Host "✗ FAIL: Response missing required fields" -ForegroundColor Red
    }
} catch {
    Write-Host "✗ FAIL: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n=====================================" -ForegroundColor Cyan
Write-Host "  Test Suite Complete" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
