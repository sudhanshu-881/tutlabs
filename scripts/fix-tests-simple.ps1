# TutLabs Test Fixer (PowerShell) - Simplified Version
# Automatically fixes common test issues

Write-Host "🔧 Starting TutLabs Test Fixes..." -ForegroundColor Green
Write-Host ""

$fixesApplied = @()
$errors = @()

function Test-FileExists {
    param($filePath)
    return Test-Path $filePath
}

function Fix-UseFormValidationTest {
    Write-Host "🔧 Fixing useFormValidation test..." -ForegroundColor Yellow
    
    $filePath = "src\test\useFormValidation.test.ts"
    
    if (-not (Test-FileExists $filePath)) {
        Write-Host "   ⚠️ File not found, skipping..." -ForegroundColor Red
        return
    }

    $content = Get-Content $filePath -Raw
    $modified = $false

    # Add beforeEach cleanup if missing
    if ($content -notmatch "beforeEach") {
        $content = $content -replace "describe\('useFormValidation', \(\) => \{", "describe('useFormValidation', () => {`n  beforeEach(() => {`n    vi.clearAllMocks();`n  });"
        $modified = $true
    }

    if ($modified) {
        Set-Content -Path $filePath -Value $content -Encoding UTF8
        $fixesApplied += "useFormValidation.test.ts - Added cleanup"
        Write-Host "   ✅ Fixed useFormValidation test" -ForegroundColor Green
    } else {
        Write-Host "   ✅ No fixes needed" -ForegroundColor Green
    }
}

function Fix-SpriteTests {
    Write-Host "🔧 Fixing sprite tests..." -ForegroundColor Yellow
    
    $filePath = "src\test\spriteTests.test.ts"
    
    if (-not (Test-FileExists $filePath)) {
        Write-Host "   ⚠️ File not found, skipping..." -ForegroundColor Red
        return
    }

    $content = Get-Content $filePath -Raw
    $modified = $false

    # Add beforeEach cleanup if missing
    if ($content -notmatch "beforeEach") {
        $content = $content -replace "describe\('Sprite Testing Suite', \(\) => \{", "describe('Sprite Testing Suite', () => {`n  beforeEach(() => {`n    vi.clearAllMocks();`n  });"
        $modified = $true
    }

    if ($modified) {
        Set-Content -Path $filePath -Value $content -Encoding UTF8
        $fixesApplied += "spriteTests.test.ts - Added cleanup"
        Write-Host "   ✅ Fixed sprite tests" -ForegroundColor Green
    } else {
        Write-Host "   ✅ No fixes needed" -ForegroundColor Green
    }
}

function Fix-SpriteComponentTests {
    Write-Host "🔧 Fixing sprite component tests..." -ForegroundColor Yellow
    
    $filePath = "src\test\spriteComponentTests.test.tsx"
    
    if (-not (Test-FileExists $filePath)) {
        Write-Host "   ⚠️ File not found, skipping..." -ForegroundColor Red
        return
    }

    $content = Get-Content $filePath -Raw
    $modified = $false

    # Add cleanup import if missing
    if ($content -notmatch "cleanup") {
        $content = $content -replace "import { render, screen, fireEvent, waitFor } from '@testing-library/react';", "import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';"
        $modified = $true
    }

    # Add cleanup in beforeEach if missing
    if ($content -notmatch "cleanup\(\)") {
        $content = $content -replace "describe\('Sprite Component Tests', \(\) => \{", "describe('Sprite Component Tests', () => {`n  beforeEach(() => {`n    cleanup();`n    vi.clearAllMocks();`n  });"
        $modified = $true
    }

    if ($modified) {
        Set-Content -Path $filePath -Value $content -Encoding UTF8
        $fixesApplied += "spriteComponentTests.test.tsx - Added cleanup"
        Write-Host "   ✅ Fixed sprite component tests" -ForegroundColor Green
    } else {
        Write-Host "   ✅ No fixes needed" -ForegroundColor Green
    }
}

function Fix-SanitizationTests {
    Write-Host "🔧 Fixing sanitization tests..." -ForegroundColor Yellow
    
    $filePath = "src\test\sanitizationTests.test.ts"
    
    if (-not (Test-FileExists $filePath)) {
        Write-Host "   ⚠️ File not found, skipping..." -ForegroundColor Red
        return
    }

    $content = Get-Content $filePath -Raw
    $modified = $false

    # Add beforeEach cleanup if missing
    if ($content -notmatch "beforeEach") {
        $content = $content -replace "describe\('Sanitization Utilities', \(\) => \{", "describe('Sanitization Utilities', () => {`n  beforeEach(() => {`n    vi.clearAllMocks();`n  });"
        $modified = $true
    }

    if ($modified) {
        Set-Content -Path $filePath -Value $content -Encoding UTF8
        $fixesApplied += "sanitizationTests.test.ts - Added cleanup"
        Write-Host "   ✅ Fixed sanitization tests" -ForegroundColor Green
    } else {
        Write-Host "   ✅ No fixes needed" -ForegroundColor Green
    }
}

function Fix-TestSetup {
    Write-Host "🔧 Fixing test setup..." -ForegroundColor Yellow
    
    $filePath = "src\test\setup.ts"
    
    if (-not (Test-FileExists $filePath)) {
        Write-Host "   ⚠️ File not found, skipping..." -ForegroundColor Red
        return
    }

    $content = Get-Content $filePath -Raw
    $modified = $false

    # Check for required mocks
    $requiredMocks = @(
        "IntersectionObserver",
        "ResizeObserver", 
        "matchMedia",
        "crypto.getRandomValues",
        "requestAnimationFrame",
        "cancelAnimationFrame",
        "performance.now",
        "DOMMatrix"
    )

    foreach ($mock in $requiredMocks) {
        if ($content -notmatch $mock) {
            Write-Host "   ⚠️ Missing $mock mock" -ForegroundColor Red
            $modified = $true
        }
    }

    if ($modified) {
        $fixesApplied += "setup.ts - Missing mocks detected"
        Write-Host "   ⚠️ Setup needs manual review" -ForegroundColor Yellow
    } else {
        Write-Host "   ✅ No fixes needed" -ForegroundColor Green
    }
}

function Generate-FixReport {
    Write-Host "`n📊 Fix Report" -ForegroundColor Cyan
    Write-Host "=" * 50
    
    Write-Host "Fixes Applied: $($fixesApplied.Count)" -ForegroundColor Green
    Write-Host "Errors: $($errors.Count)" -ForegroundColor $(if ($errors.Count -eq 0) { "Green" } else { "Red" })
    
    if ($fixesApplied.Count -gt 0) {
        Write-Host "`n✅ Applied Fixes:" -ForegroundColor Green
        for ($i = 0; $i -lt $fixesApplied.Count; $i++) {
            Write-Host "   $($i + 1). $($fixesApplied[$i])" -ForegroundColor White
        }
    }
    
    Write-Host "`n🎯 Next Steps:" -ForegroundColor Cyan
    Write-Host "   1. Run tests again to verify fixes" -ForegroundColor White
    Write-Host "   2. Check for any remaining issues" -ForegroundColor White
    Write-Host "   3. Update test environment if needed" -ForegroundColor White
    Write-Host "   4. Consider adding more comprehensive error handling" -ForegroundColor White
    
    Write-Host "`n✨ Fix process complete!" -ForegroundColor Green
}

# Run all fixes
Fix-UseFormValidationTest
Fix-SpriteTests
Fix-SpriteComponentTests
Fix-SanitizationTests
Fix-TestSetup
Generate-FixReport
