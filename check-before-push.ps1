# Script untuk cek file sensitif sebelum push ke GitHub

Write-Host "🔍 Checking for sensitive files before push..." -ForegroundColor Cyan
Write-Host ""

$ERRORS = 0
$WARNINGS = 0

# Fungsi untuk cek file
function Check-File {
    param(
        [string]$file,
        [string]$description
    )
    
    $isTracked = git ls-files --error-unmatch $file 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "❌ DANGER: $file is tracked by git!" -ForegroundColor Red
        Write-Host "   $description" -ForegroundColor Red
        $script:ERRORS++
    } else {
        Write-Host "✓ $file is not tracked" -ForegroundColor Green
    }
}

# Fungsi untuk cek pattern di staged files
function Check-Pattern {
    param(
        [string]$pattern,
        [string]$description
    )
    
    $diff = git diff --cached
    if ($diff -match $pattern) {
        Write-Host "❌ DANGER: Found '$pattern' in staged files!" -ForegroundColor Red
        Write-Host "   $description" -ForegroundColor Red
        $script:ERRORS++
    }
}

Write-Host "1. Checking environment files..." -ForegroundColor Yellow
Write-Host "--------------------------------"
Check-File "backend/.env" "Contains database credentials and API tokens"
Check-File "backend/.env.local" "Contains local environment variables"
Check-File "backend/.env.production" "Contains production credentials"
Check-File ".env" "Contains environment variables"
Write-Host ""

Write-Host "2. Checking credential files..." -ForegroundColor Yellow
Write-Host "--------------------------------"
Check-File "accurate.md" "Contains Accurate API credentials"
Check-File "accurate-online-api-token-1.0.3.pdf" "Contains API documentation"
Check-File "KREDENSIAL.md" "Contains credentials"
Check-File "PASSWORD_INFO.md" "Contains password information"
Write-Host ""

Write-Host "3. Checking database files..." -ForegroundColor Yellow
Write-Host "--------------------------------"
$sqlFiles = git diff --cached --name-only | Select-String "\.sql$"
if ($sqlFiles) {
    Write-Host "⚠ Warning: SQL files found in staged changes" -ForegroundColor Yellow
    Write-Host "   Make sure they don't contain sensitive data" -ForegroundColor Yellow
    $WARNINGS++
} else {
    Write-Host "✓ No SQL files in staged changes" -ForegroundColor Green
}
Write-Host ""

Write-Host "4. Checking for hardcoded credentials..." -ForegroundColor Yellow
Write-Host "--------------------------------"
Check-Pattern "aat\.MTAw\." "Accurate API token found"
Check-Pattern "objApIB9p0AdOeq269MoIEtWlO9dX9DVZy3uzfB5jiReyeMfmYkwzTCRa87pMRPb" "Signature secret found"
Check-Pattern "9bef48b4-d69c-41b3-a98b-752f6ee78fd7" "App key found"
Check-Pattern "92539fe0-0f37-450c-810c-e4ca29e44b69" "Client ID found"
Check-Pattern "1884d3742a4c536d17ed6b922360cb60" "Client secret found"
Write-Host ""

Write-Host "5. Checking node_modules..." -ForegroundColor Yellow
Write-Host "--------------------------------"
$nodeModules = git ls-files | Select-String "node_modules/"
if ($nodeModules) {
    Write-Host "❌ DANGER: node_modules is tracked by git!" -ForegroundColor Red
    $ERRORS++
} else {
    Write-Host "✓ node_modules is not tracked" -ForegroundColor Green
}
Write-Host ""

Write-Host "6. Checking .env.example..." -ForegroundColor Yellow
Write-Host "--------------------------------"
$envExample = git diff --cached backend/.env.example
if ($envExample -match "your_.*_here") {
    Write-Host "✓ .env.example contains placeholders" -ForegroundColor Green
} elseif ($envExample -match "aat\.MTAw\.") {
    Write-Host "❌ DANGER: .env.example contains real credentials!" -ForegroundColor Red
    $ERRORS++
} else {
    Write-Host "✓ .env.example looks safe" -ForegroundColor Green
}
Write-Host ""

# Summary
Write-Host "================================" -ForegroundColor Cyan
Write-Host "Summary:" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
if ($ERRORS -gt 0) {
    Write-Host "❌ Found $ERRORS error(s)" -ForegroundColor Red
    Write-Host "DO NOT PUSH! Fix the issues above first." -ForegroundColor Red
    exit 1
} elseif ($WARNINGS -gt 0) {
    Write-Host "⚠ Found $WARNINGS warning(s)" -ForegroundColor Yellow
    Write-Host "Please review before pushing." -ForegroundColor Yellow
    exit 0
} else {
    Write-Host "✅ All checks passed!" -ForegroundColor Green
    Write-Host "Safe to push to GitHub." -ForegroundColor Green
    exit 0
}
