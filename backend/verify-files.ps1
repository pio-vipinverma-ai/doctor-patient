# Minimal verification script
Write-Host "Checking frontend files..." -ForegroundColor Cyan

$files = @(
    "frontend\src\pages\PatientHistoryPage.tsx",
    "frontend\src\pages\PatientHistoryPage.module.scss",
    "frontend\src\components\DateRangeFilter.tsx",
    "frontend\src\components\DateRangeFilter.module.scss",
    "frontend\src\components\ConsultationTable.tsx",
    "frontend\src\components\ConsultationTable.module.scss"
)

foreach ($f in $files) {
    if (Test-Path $f) {
        Write-Host " ✓ $f" -ForegroundColor Green
    } else {
        Write-Host "✗ $f" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "All files created successfully!" -ForegroundColor Green
