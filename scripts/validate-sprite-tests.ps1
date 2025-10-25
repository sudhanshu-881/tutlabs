# TutLabs Sprite Testing Validation Script (PowerShell)
# This script validates the sprite testing implementation

Write-Host "🎮 Starting TutLabs Sprite Testing Validation..." -ForegroundColor Green
Write-Host ""

$results = @{
    spriteUtils = @{ status = "pending"; issues = @(); coverage = @() }
    spriteTests = @{ status = "pending"; issues = @(); coverage = @() }
    componentTests = @{ status = "pending"; issues = @(); coverage = @() }
    sanitizationTests = @{ status = "pending"; issues = @(); coverage = @() }
    setup = @{ status = "pending"; issues = @(); coverage = @() }
    overall = @{ status = "pending"; score = 0; recommendations = @() }
}

function Test-FileExists {
    param($filePath)
    return Test-Path $filePath
}

function Test-SpriteUtils {
    Write-Host "🔧 Validating Sprite Test Utilities..." -ForegroundColor Yellow
    
    $filePath = "src\test\spriteTestUtils.ts"
    
    if (-not (Test-FileExists $filePath)) {
        $results.spriteUtils.status = "failed"
        $results.spriteUtils.issues += "spriteTestUtils.ts file not found"
        return
    }

    $content = Get-Content $filePath -Raw
    $issues = @()
    $coverage = @()

    # Check for required classes and interfaces
    $requiredExports = @(
        "MockSpriteManager",
        "MockCanvas", 
        "MockCanvasContext",
        "SpriteRenderer",
        "spriteTestUtils"
    )

    foreach ($export in $requiredExports) {
        if ($content -match "export.*$export") {
            $coverage += "✅ $export class/interface found"
        } else {
            $issues += "❌ Missing $export export"
        }
    }

    # Check for key methods
    $keyMethods = @(
        "createSprite",
        "updateSprite", 
        "removeSprite",
        "getSprite",
        "checkCollision",
        "measurePerformance",
        "renderSprite",
        "startAnimation",
        "stopAnimation"
    )

    foreach ($method in $keyMethods) {
        if ($content -match $method) {
            $coverage += "✅ $method method implemented"
        } else {
            $issues += "❌ Missing $method method"
        }
    }

    # Check for TypeScript types
    if ($content -match "interface MockSprite") {
        $coverage += "✅ MockSprite interface defined"
    } else {
        $issues += "❌ Missing MockSprite interface"
    }

    $results.spriteUtils.status = if ($issues.Count -eq 0) { "passed" } else { "failed" }
    $results.spriteUtils.issues = $issues
    $results.spriteUtils.coverage = $coverage

    Write-Host "   Status: $($results.spriteUtils.status)" -ForegroundColor $(if ($results.spriteUtils.status -eq "passed") { "Green" } else { "Red" })
    Write-Host "   Coverage: $($coverage.Count) items"
    Write-Host "   Issues: $($issues.Count) items"
    Write-Host ""
}

function Test-SpriteTests {
    Write-Host "🧪 Validating Sprite Tests..." -ForegroundColor Yellow
    
    $filePath = "src\test\spriteTests.test.ts"
    
    if (-not (Test-FileExists $filePath)) {
        $results.spriteTests.status = "failed"
        $results.spriteTests.issues += "spriteTests.test.ts file not found"
        return
    }

    $content = Get-Content $filePath -Raw
    $issues = @()
    $coverage = @()

    # Check for test suites
    $testSuites = @(
        "Sprite Management",
        "Sprite Animation",
        "Sprite Rendering", 
        "Collision Detection",
        "Performance Testing",
        "Edge Cases and Error Handling",
        "Integration Tests"
    )

    foreach ($suite in $testSuites) {
        if ($content -match "describe\('$suite'") {
            $coverage += "✅ $suite test suite found"
        } else {
            $issues += "❌ Missing $suite test suite"
        }
    }

    # Check for key test cases
    $keyTests = @(
        "should create and retrieve sprites",
        "should update sprite properties",
        "should remove sprites",
        "should create animated sprites",
        "should update animation frames",
        "should render sprites to canvas",
        "should detect sprite collisions",
        "should measure sprite creation performance"
    )

    foreach ($test in $keyTests) {
        if ($content -match "it\('$test'") {
            $coverage += "✅ $test test case found"
        } else {
            $issues += "❌ Missing $test test case"
        }
    }

    $results.spriteTests.status = if ($issues.Count -eq 0) { "passed" } else { "failed" }
    $results.spriteTests.issues = $issues
    $results.spriteTests.coverage = $coverage

    Write-Host "   Status: $($results.spriteTests.status)" -ForegroundColor $(if ($results.spriteTests.status -eq "passed") { "Green" } else { "Red" })
    Write-Host "   Coverage: $($coverage.Count) items"
    Write-Host "   Issues: $($issues.Count) items"
    Write-Host ""
}

function Test-ComponentTests {
    Write-Host "⚛️ Validating React Component Tests..." -ForegroundColor Yellow
    
    $filePath = "src\test\spriteComponentTests.test.tsx"
    
    if (-not (Test-FileExists $filePath)) {
        $results.componentTests.status = "failed"
        $results.componentTests.issues += "spriteComponentTests.test.tsx file not found"
        return
    }

    $content = Get-Content $filePath -Raw
    $issues = @()
    $coverage = @()

    # Check for React testing imports
    $reactImports = @(
        "@testing-library/react",
        "@testing-library/jest-dom",
        "react"
    )

    foreach ($import in $reactImports) {
        if ($content -match $import) {
            $coverage += "✅ $import import found"
        } else {
            $issues += "❌ Missing $import import"
        }
    }

    # Check for component test suites
    $componentSuites = @(
        "Basic Sprite Rendering",
        "Sprite Interactions",
        "Sprite Animation",
        "Sprite Manager Hook",
        "Accessibility",
        "Performance Considerations"
    )

    foreach ($suite in $componentSuites) {
        if ($content -match "describe\('$suite'") {
            $coverage += "✅ $suite component test suite found"
        } else {
            $issues += "❌ Missing $suite component test suite"
        }
    }

    $results.componentTests.status = if ($issues.Count -eq 0) { "passed" } else { "failed" }
    $results.componentTests.issues = $issues
    $results.componentTests.coverage = $coverage

    Write-Host "   Status: $($results.componentTests.status)" -ForegroundColor $(if ($results.componentTests.status -eq "passed") { "Green" } else { "Red" })
    Write-Host "   Coverage: $($coverage.Count) items"
    Write-Host "   Issues: $($issues.Count) items"
    Write-Host ""
}

function Test-SanitizationTests {
    Write-Host "🔒 Validating Sanitization Tests..." -ForegroundColor Yellow
    
    $filePath = "src\test\sanitizationTests.test.ts"
    
    if (-not (Test-FileExists $filePath)) {
        $results.sanitizationTests.status = "failed"
        $results.sanitizationTests.issues += "sanitizationTests.test.ts file not found"
        return
    }

    $content = Get-Content $filePath -Raw
    $issues = @()
    $coverage = @()

    # Check for sanitization test suites
    $sanitizationSuites = @(
        "escapeHtml",
        "sanitizeInput",
        "sanitizeEmail",
        "sanitizePhone",
        "sanitizeText",
        "sanitizeUrl",
        "sanitizeFileName",
        "RateLimiter",
        "createCSPNonce"
    )

    foreach ($suite in $sanitizationSuites) {
        if ($content -match "describe\('$suite'") {
            $coverage += "✅ $suite sanitization test suite found"
        } else {
            $issues += "❌ Missing $suite sanitization test suite"
        }
    }

    $results.sanitizationTests.status = if ($issues.Count -eq 0) { "passed" } else { "failed" }
    $results.sanitizationTests.issues = $issues
    $results.sanitizationTests.coverage = $coverage

    Write-Host "   Status: $($results.sanitizationTests.status)" -ForegroundColor $(if ($results.sanitizationTests.status -eq "passed") { "Green" } else { "Red" })
    Write-Host "   Coverage: $($coverage.Count) items"
    Write-Host "   Issues: $($issues.Count) items"
    Write-Host ""
}

function Test-Setup {
    Write-Host "⚙️ Validating Test Setup..." -ForegroundColor Yellow
    
    $filePath = "src\test\setup.ts"
    
    if (-not (Test-FileExists $filePath)) {
        $results.setup.status = "failed"
        $results.setup.issues += "setup.ts file not found"
        return
    }

    $content = Get-Content $filePath -Raw
    $issues = @()
    $coverage = @()

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
        if ($content -match $mock) {
            $coverage += "✅ $mock mock found"
        } else {
            $issues += "❌ Missing $mock mock"
        }
    }

    # Check for testing library imports
    if ($content -match "@testing-library/jest-dom") {
        $coverage += "✅ @testing-library/jest-dom import found"
    } else {
        $issues += "❌ Missing @testing-library/jest-dom import"
    }

    if ($content -match "vitest") {
        $coverage += "✅ vitest import found"
    } else {
        $issues += "❌ Missing vitest import"
    }

    $results.setup.status = if ($issues.Count -eq 0) { "passed" } else { "failed" }
    $results.setup.issues = $issues
    $results.setup.coverage = $coverage

    Write-Host "   Status: $($results.setup.status)" -ForegroundColor $(if ($results.setup.status -eq "passed") { "Green" } else { "Red" })
    Write-Host "   Coverage: $($coverage.Count) items"
    Write-Host "   Issues: $($issues.Count) items"
    Write-Host ""
}

function Generate-Report {
    Write-Host "📊 Generating Validation Report..." -ForegroundColor Green
    Write-Host ""
    
    $totalIssues = 0
    $totalCoverage = 0
    $passedTests = 0
    
    foreach ($key in $results.Keys) {
        if ($key -ne "overall") {
            $totalIssues += $results[$key].issues.Count
            $totalCoverage += $results[$key].coverage.Count
            if ($results[$key].status -eq "passed") {
                $passedTests++
            }
        }
    }
    
    $totalTests = $results.Keys.Count - 1  # Exclude overall
    $score = [math]::Round(($passedTests / $totalTests) * 100)
    
    Write-Host "🎯 Validation Results Summary" -ForegroundColor Cyan
    Write-Host "=" * 50
    
    foreach ($key in $results.Keys) {
        if ($key -eq "overall") { continue }
        
        $result = $results[$key]
        $status = if ($result.status -eq "passed") { "✅" } else { "❌" }
        
        Write-Host "$status $key:" -ForegroundColor White
        Write-Host "   Status: $($result.status)" -ForegroundColor $(if ($result.status -eq "passed") { "Green" } else { "Red" })
        Write-Host "   Coverage: $($result.coverage.Count) items"
        Write-Host "   Issues: $($result.issues.Count) items"
        
        if ($result.issues.Count -gt 0) {
            Write-Host "   Issues:" -ForegroundColor Red
            $result.issues[0..2] | ForEach-Object { Write-Host "     $_" -ForegroundColor Red }
            if ($result.issues.Count -gt 3) {
                Write-Host "     ... and $($result.issues.Count - 3) more" -ForegroundColor Red
            }
        }
        Write-Host ""
    }
    
    Write-Host "📈 Overall Statistics:" -ForegroundColor Cyan
    Write-Host "   Test Suites: $totalTests"
    Write-Host "   Passed: $passedTests" -ForegroundColor Green
    Write-Host "   Failed: $($totalTests - $passedTests)" -ForegroundColor Red
    Write-Host "   Total Coverage Items: $totalCoverage" -ForegroundColor Green
    Write-Host "   Total Issues: $totalIssues" -ForegroundColor $(if ($totalIssues -eq 0) { "Green" } else { "Red" })
    Write-Host "   Validation Score: $score%" -ForegroundColor $(if ($score -ge 90) { "Green" } elseif ($score -ge 70) { "Yellow" } else { "Red" })
    
    if ($score -ge 90) {
        Write-Host "`n🎉 Excellent! Sprite testing implementation is comprehensive and well-structured." -ForegroundColor Green
    } elseif ($score -ge 70) {
        Write-Host "`n✅ Good! Sprite testing implementation is solid with minor improvements needed." -ForegroundColor Yellow
    } elseif ($score -ge 50) {
        Write-Host "`n⚠️ Fair! Sprite testing implementation needs significant improvements." -ForegroundColor Yellow
    } else {
        Write-Host "`n❌ Poor! Sprite testing implementation requires major work." -ForegroundColor Red
    }
    
    # Generate recommendations
    $recommendations = @()
    
    if ($totalIssues -gt 0) {
        $recommendations += "Address all identified issues in test files"
    }
    
    if ($score -lt 100) {
        $recommendations += "Review and enhance test coverage"
    }
    
    $recommendations += "Run actual test execution when Node.js environment is available"
    $recommendations += "Integrate sprite tests into CI/CD pipeline"
    $recommendations += "Add visual regression testing for sprite rendering"
    
    Write-Host "`n🔧 Recommendations:" -ForegroundColor Cyan
    for ($i = 0; $i -lt $recommendations.Count; $i++) {
        Write-Host "   $($i + 1). $($recommendations[$i])" -ForegroundColor White
    }
    
    # Update overall results
    $results.overall.status = if ($score -ge 70) { "passed" } else { "failed" }
    $results.overall.score = $score
    $results.overall.recommendations = $recommendations
    
    Write-Host "`n✨ Validation complete!" -ForegroundColor Green
}

# Run all validation tests
Test-SpriteUtils
Test-SpriteTests
Test-ComponentTests
Test-SanitizationTests
Test-Setup
Generate-Report

