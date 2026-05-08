# Simple Authentication Test
$BASE_URL = "http://localhost:5000/api"

Write-Host "`nAuthenticating..." -ForegroundColor Yellow

$body = @{
    username = "doctor@clinic.com"
    password = "password123"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "$BASE_URL/auth/login" -Method POST -Body $body -ContentType "application/json"
    
    if ($response.success) {
        Write-Host "SUCCESS - Authenticated" -ForegroundColor Green
        Write-Host "Token: $($response.token.Substring(0, 20))..." -ForegroundColor Gray
        
        # Save token
        $response.token | Out-File "d:\vipin\projects\doc-patient\backend\token.txt" -NoNewline
        Write-Host "Token saved to token.txt" -ForegroundColor Gray
    }
    else {
        Write-Host "ERROR - Authentication failed" -ForegroundColor Red
    }
}
catch {
    Write-Host "ERROR - $($_.Exception.Message)" -ForegroundColor Red
}
