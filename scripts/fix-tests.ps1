# TutLabs Test Fixer (PowerShell)
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

    # Fix import issues
    if ($content -notmatch "import { useFormValidation, commonRules }") {
        $content = $content -replace "import { useFormValidation, commonRules } from '\.\.\/\.\.\/hooks\/useFormValidation';", "import { useFormValidation, commonRules } from '../../hooks/useFormValidation';"
        $modified = $true
    }

    # Add beforeEach cleanup
    if ($content -notmatch "beforeEach") {
        $describeMatch = $content | Select-String "describe\('useFormValidation', \(\) => \{"
        if ($describeMatch) {
            $content = $content -replace "describe\('useFormValidation', \(\) => \{", "describe('useFormValidation', () => {`n  beforeEach(() => {`n    vi.clearAllMocks();`n  });"
            $modified = $true
        }
    }

    if ($modified) {
        Set-Content -Path $filePath -Value $content -Encoding UTF8
        $fixesApplied += "useFormValidation.test.ts - Fixed imports and cleanup"
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

    # Add beforeEach cleanup
    if ($content -notmatch "beforeEach\(\(\) => \{") {
        $describeMatch = $content | Select-String "describe\('Sprite Testing Suite', \(\) => \{"
        if ($describeMatch) {
            $content = $content -replace "describe\('Sprite Testing Suite', \(\) => \{", "describe('Sprite Testing Suite', () => {`n  beforeEach(() => {`n    vi.clearAllMocks();`n  });"
            $modified = $true
        }
    }

    # Fix async operations
    if ($content -match "mockRAF\.triggerFrame\(1\);" -and $content -notmatch "await") {
        $content = $content -replace "mockRAF\.triggerFrame\(1\);", "await mockRAF.triggerFrame(1);"
        $modified = $true
    }

    if ($modified) {
        Set-Content -Path $filePath -Value $content -Encoding UTF8
        $fixesApplied += "spriteTests.test.ts - Fixed cleanup and async operations"
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

    # Add cleanup import
    if ($content -notmatch "cleanup") {
        $content = $content -replace "import { render, screen, fireEvent, waitFor } from '@testing-library\/react';", "import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';"
        $modified = $true
    }

    # Add cleanup in beforeEach
    if ($content -notmatch "cleanup\(\)") {
        $describeMatch = $content | Select-String "describe\('Sprite Component Tests', \(\) => \{"
        if ($describeMatch) {
            $content = $content -replace "describe\('Sprite Component Tests', \(\) => \{", "describe('Sprite Component Tests', () => {`n  beforeEach(() => {`n    cleanup();`n    vi.clearAllMocks();`n  });"
            $modified = $true
        }
    }

    if ($modified) {
        Set-Content -Path $filePath -Value $content -Encoding UTF8
        $fixesApplied += "spriteComponentTests.test.tsx - Fixed cleanup and imports"
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

    # Add beforeEach cleanup
    if ($content -notmatch "beforeEach") {
        $describeMatch = $content | Select-String "describe\('Sanitization Utilities', \(\) => \{"
        if ($describeMatch) {
            $content = $content -replace "describe\('Sanitization Utilities', \(\) => \{", "describe('Sanitization Utilities', () => {`n  beforeEach(() => {`n    vi.clearAllMocks();`n  });"
            $modified = $true
        }
    }

    if ($modified) {
        Set-Content -Path $filePath -Value $content -Encoding UTF8
        $fixesApplied += "sanitizationTests.test.ts - Fixed cleanup"
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

    # Ensure all required mocks are present
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
            # Add missing mock
            if ($mock -eq "IntersectionObserver") {
                $content += "`n// Mock IntersectionObserver`nglobal.IntersectionObserver = class IntersectionObserver {`n  constructor() {}`n  disconnect() {}`n  observe() {}`n  unobserve() {}`n};"
            }
            $modified = $true
        }
    }

    if ($modified) {
        Set-Content -Path $filePath -Value $content -Encoding UTF8
        $fixesApplied += "setup.ts - Added missing mocks"
        Write-Host "   ✅ Fixed test setup" -ForegroundColor Green
    } else {
        Write-Host "   ✅ No fixes needed" -ForegroundColor Green
    }
}

function Update-PackageJson {
    Write-Host "🔧 Updating package.json..." -ForegroundColor Yellow
    
    $filePath = "package.json"
    
    if (-not (Test-FileExists $filePath)) {
        Write-Host "   ⚠️ File not found, skipping..." -ForegroundColor Red
        return
    }

    $content = Get-Content $filePath -Raw
    $modified = $false

    # Ensure test scripts are present
    $requiredScripts = @(
        '"test:unit": "vitest"',
        '"test:unit:run": "vitest run"',
        '"test:sprite": "vitest run src/test/spriteTests.test.ts src/test/spriteComponentTests.test.tsx"',
        '"test:sanitization": "vitest run src/test/sanitizationTests.test.ts"'
    )

    foreach ($script in $requiredScripts) {
        if ($content -notmatch $script) {
            Write-Host "   ⚠️ Missing script: $script" -ForegroundColor Red
            # Add missing script
            $scriptsMatch = $content | Select-String '"scripts":\s*\{([\s\S]*?)\}'
            if ($scriptsMatch) {
                $content = $content -replace '"scripts":\s*\{([\s\S]*?)\}', '"scripts": {$1' + $script + ',}'
                $modified = $true
            }
        }
    }

    if ($modified) {
        Set-Content -Path $filePath -Value $content -Encoding UTF8
        $fixesApplied += "package.json - Added missing test scripts"
        Write-Host "   ✅ Updated package.json" -ForegroundColor Green
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
    
    if ($errors.Count -gt 0) {
        Write-Host "`n❌ Errors:" -ForegroundColor Red
        for ($i = 0; $i -lt $errors.Count; $i++) {
            Write-Host "   $($i + 1). $($errors[$i])" -ForegroundColor Red
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
Update-PackageJson
Generate-FixReport
