# ================================================
# Database Setup Script for Patient Management System
# Description: Creates database, runs migrations, and seeds data
# ================================================

Write-Host "╔════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║   Database Setup - Patient Management  ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# Configuration
$DB_NAME = "doc_patient_db"
$DB_USER = "postgres"
$DB_HOST = "localhost"
$DB_PORT = "5432"
$SCHEMA_FILE = "backend\database\migrations\001_init_schema.sql"
$SEED_FILE = "backend\database\seeds\seed.sql"

# Function to check if PostgreSQL is installed
function Test-PostgreSQL {
    try {
        $null = Get-Command psql -ErrorAction Stop
        return $true
    } catch {
        return $false
    }
}

# Check if PostgreSQL is installed
if (-not (Test-PostgreSQL)) {
    Write-Host "✗ PostgreSQL is not installed or not in PATH" -ForegroundColor Red
    Write-Host "  Please install PostgreSQL 14+ from: https://www.postgresql.org/download/" -ForegroundColor Yellow
    exit 1
}

Write-Host "✓ PostgreSQL found" -ForegroundColor Green

# Step 1: Create database
Write-Host ""
Write-Host "Step 1: Creating database '$DB_NAME'..." -ForegroundColor Cyan

# Check if database already exists
$dbExists = psql -U $DB_USER -h $DB_HOST -p $DB_PORT -tAc "SELECT 1 FROM pg_database WHERE datname='$DB_NAME'" 2>$null

if ($dbExists -eq "1") {
    Write-Host "⚠ Database '$DB_NAME' already exists" -ForegroundColor Yellow
    $response = Read-Host "Do you want to drop and recreate it? (y/N)"
    if ($response -eq "y" -or $response -eq "Y") {
        Write-Host "Dropping existing database..." -ForegroundColor Yellow
        psql -U $DB_USER -h $DB_HOST -p $DB_PORT -c "DROP DATABASE IF EXISTS $DB_NAME;" 2>$null
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✓ Existing database dropped" -ForegroundColor Green
        }
    } else {
        Write-Host "Keeping existing database" -ForegroundColor Yellow
    }
}

# Create database if it doesn't exist
$dbExists = psql -U $DB_USER -h $DB_HOST -p $DB_PORT -tAc "SELECT 1 FROM pg_database WHERE datname='$DB_NAME'" 2>$null
if ($dbExists -ne "1") {
    psql -U $DB_USER -h $DB_HOST -p $DB_PORT -c "CREATE DATABASE $DB_NAME;" 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ Database '$DB_NAME' created successfully" -ForegroundColor Green
    } else {
        Write-Host "✗ Failed to create database" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "✓ Using existing database '$DB_NAME'" -ForegroundColor Green
}

# Step 2: Run schema migration
Write-Host ""
Write-Host "Step 2: Running schema migration..." -ForegroundColor Cyan

if (Test-Path $SCHEMA_FILE) {
    psql -U $DB_USER -h $DB_HOST -p $DB_PORT -d $DB_NAME -f $SCHEMA_FILE 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ Schema migration completed successfully" -ForegroundColor Green
    } else {
        Write-Host "✗ Schema migration failed" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "✗ Schema file not found: $SCHEMA_FILE" -ForegroundColor Red
    exit 1
}

# Step 3: Seed sample data
Write-Host ""
Write-Host "Step 3: Seeding sample data..." -ForegroundColor Cyan

if (Test-Path $SEED_FILE) {
    psql -U $DB_USER -h $DB_HOST -p $DB_PORT -d $DB_NAME -f $SEED_FILE 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ Sample data seeded successfully" -ForegroundColor Green
    } else {
        Write-Host "⚠ Sample data seeding failed (might already exist)" -ForegroundColor Yellow
    }
} else {
    Write-Host "⚠ Seed file not found: $SEED_FILE" -ForegroundColor Yellow
}

# Step 4: Verify setup
Write-Host ""
Write-Host "Step 4: Verifying setup..." -ForegroundColor Cyan

# Count tables
$tableCount = psql -U $DB_USER -h $DB_HOST -p $DB_PORT -d $DB_NAME -tAc "SELECT count(*) FROM information_schema.tables WHERE table_schema = 'public';" 2>$null

if ($tableCount -eq "7") {
    Write-Host "✓ All 7 tables created successfully" -ForegroundColor Green
} else {
    Write-Host "⚠ Expected 7 tables, found $tableCount" -ForegroundColor Yellow
}

# Count indexes
$indexCount = psql -U $DB_USER -h $DB_HOST -p $DB_PORT -d $DB_NAME -tAc "SELECT count(*) FROM pg_indexes WHERE schemaname = 'public';" 2>$null
Write-Host "✓ $indexCount indexes created" -ForegroundColor Green

# Count users
$userCount = psql -U $DB_USER -h $DB_HOST -p $DB_PORT -d $DB_NAME -tAc "SELECT count(*) FROM users;" 2>$null
if ($userCount -gt "0") {
    Write-Host "✓ $userCount user(s) created" -ForegroundColor Green
} else {
    Write-Host "⚠ No users found" -ForegroundColor Yellow
}

# Display connection string
Write-Host ""
Write-Host "╔════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║          Setup Complete!               ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""
Write-Host "Database Connection String:" -ForegroundColor Yellow
Write-Host "  postgresql://$DB_USER@$DB_HOST:$DB_PORT/$DB_NAME" -ForegroundColor White
Write-Host ""
Write-Host "Test Credentials:" -ForegroundColor Yellow
Write-Host "  Username: doctor" -ForegroundColor White
Write-Host "  Password: password123" -ForegroundColor White
Write-Host ""
Write-Host "Update your backend/.env.local file with:" -ForegroundColor Yellow
Write-Host "  DB_HOST=$DB_HOST" -ForegroundColor White
Write-Host "  DB_PORT=$DB_PORT" -ForegroundColor White
Write-Host "  DB_NAME=$DB_NAME" -ForegroundColor White
Write-Host "  DB_USER=$DB_USER" -ForegroundColor White
Write-Host "  DB_PASSWORD=123.com" -ForegroundColor White
Write-Host ""
