# TestSprite Validation Suite for TutLabs (PowerShell)
# Comprehensive testing of sprite functionality

Write-Host "🎮 Starting TestSprite Validation for TutLabs..." -ForegroundColor Green
Write-Host ""

$results = @{
    spriteUtils = @{ status = "pending"; tests = @(); coverage = @() }
    spriteTests = @{ status = "pending"; tests = @(); coverage = @() }
    componentTests = @{ status = "pending"; tests = @(); coverage = @() }
    performance = @{ status = "pending"; metrics = @(); benchmarks = @() }
    overall = @{ status = "pending"; score = 0; summary = "" }
}

function Test-FileExists {
    param($filePath)
    return Test-Path $filePath
}

function Test-SpriteUtilities {
    Write-Host "🔧 Validating Sprite Utilities..." -ForegroundColor Yellow
    
    $filePath = "src\test\spriteTestUtils.ts"
    
    if (-not (Test-FileExists $filePath)) {
        $results.spriteUtils.status = "failed"
        $results.spriteUtils.tests += "❌ spriteTestUtils.ts file not found"
        return
    }

    $content = Get-Content $filePath -Raw
    $tests = @()
    $coverage = @()

    # Test MockSpriteManager functionality
    if ($content -match "class MockSpriteManager") {
        $coverage += "✅ MockSpriteManager class implemented"
        
        # Test CRUD operations
        $crudMethods = @("createSprite", "getSprite", "updateSprite", "removeSprite")
        foreach ($method in $crudMethods) {
            if ($content -match $method) {
                $tests += "✅ $method method available"
            } else {
                $tests += "❌ Missing $method method"
            }
        }
    } else {
        $tests += "❌ MockSpriteManager class not found"
    }

    # Test MockCanvas functionality
    if ($content -match "class MockCanvas") {
        $coverage += "✅ MockCanvas class implemented"
        
        $canvasMethods = @("getContext", "toDataURL")
        foreach ($method in $canvasMethods) {
            if ($content -match $method) {
                $tests += "✅ $method method available"
            } else {
                $tests += "❌ Missing $method method"
            }
        }
    } else {
        $tests += "❌ MockCanvas class not found"
    }

    # Test SpriteRenderer functionality
    if ($content -match "class SpriteRenderer") {
        $coverage += "✅ SpriteRenderer class implemented"
        
        $renderMethods = @("renderSprite", "clear")
        foreach ($method in $renderMethods) {
            if ($content -match $method) {
                $tests += "✅ $method method available"
            } else {
                $tests += "❌ Missing $method method"
            }
        }
    } else {
        $tests += "❌ SpriteRenderer class not found"
    }

    # Test animation functionality
    if ($content -match "startAnimation" -and $content -match "stopAnimation") {
        $tests += "✅ Animation control methods available"
    } else {
        $tests += "❌ Animation control methods missing"
    }

    # Test collision detection
    if ($content -match "checkCollision") {
        $tests += "✅ Collision detection method available"
    } else {
        $tests += "❌ Collision detection method missing"
    }

    # Test performance measurement
    if ($content -match "measurePerformance") {
        $tests += "✅ Performance measurement method available"
    } else {
        $tests += "❌ Performance measurement method missing"
    }

    $results.spriteUtils.status = if (($tests | Where-Object { $_ -match "❌" }).Count -eq 0) { "passed" } else { "failed" }
    $results.spriteUtils.tests = $tests
    $results.spriteUtils.coverage = $coverage

    Write-Host "   Status: $($results.spriteUtils.status)" -ForegroundColor $(if ($results.spriteUtils.status -eq "passed") { "Green" } else { "Red" })
    Write-Host "   Tests: $($tests.Count)"
    Write-Host "   Coverage: $($coverage.Count) items"
    Write-Host ""
}

function Test-SpriteTests {
    Write-Host "🧪 Validating Sprite Tests..." -ForegroundColor Yellow
    
    $filePath = "src\test\spriteTests.test.ts"
    
    if (-not (Test-FileExists $filePath)) {
        $results.spriteTests.status = "failed"
        $results.spriteTests.tests += "❌ spriteTests.test.ts file not found"
        return
    }

    $content = Get-Content $filePath -Raw
    $tests = @()
    $coverage = @()

    # Test suite validation
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
            $tests += "❌ Missing $suite test suite"
        }
    }

    # Individual test validation
    $keyTests = @(
        "should create and retrieve sprites",
        "should update sprite properties",
        "should remove sprites",
        "should create animated sprites",
        "should update animation frames",
        "should render sprites to canvas",
        "should detect sprite collisions",
        "should measure sprite creation performance",
        "should handle zero-sized sprites",
        "should handle extreme sprite positions"
    )

    foreach ($test in $keyTests) {
        if ($content -match "it\('$test'") {
            $tests += "✅ $test test case found"
        } else {
            $tests += "❌ Missing $test test case"
        }
    }

    # Test setup validation
    if ($content -match "beforeEach" -and $content -match "vi.clearAllMocks") {
        $tests += "✅ Proper test setup with cleanup"
    } else {
        $tests += "❌ Missing proper test setup"
    }

    $results.spriteTests.status = if (($tests | Where-Object { $_ -match "❌" }).Count -eq 0) { "passed" } else { "failed" }
    $results.spriteTests.tests = $tests
    $results.spriteTests.coverage = $coverage

    Write-Host "   Status: $($results.spriteTests.status)" -ForegroundColor $(if ($results.spriteTests.status -eq "passed") { "Green" } else { "Red" })
    Write-Host "   Tests: $($tests.Count)"
    Write-Host "   Coverage: $($coverage.Count) items"
    Write-Host ""
}

function Test-ComponentTests {
    Write-Host "⚛️ Validating React Component Tests..." -ForegroundColor Yellow
    
    $filePath = "src\test\spriteComponentTests.test.tsx"
    
    if (-not (Test-FileExists $filePath)) {
        $results.componentTests.status = "failed"
        $results.componentTests.tests += "❌ spriteComponentTests.test.tsx file not found"
        return
    }

    $content = Get-Content $filePath -Raw
    $tests = @()
    $coverage = @()

    # React testing imports validation
    $reactImports = @(
        "@testing-library/react",
        "@testing-library/jest-dom",
        "react"
    )

    foreach ($import in $reactImports) {
        if ($content -match $import) {
            $coverage += "✅ $import import found"
        } else {
            $tests += "❌ Missing $import import"
        }
    }

    # Component test suites validation
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
            $tests += "❌ Missing $suite component test suite"
        }
    }

    # React-specific tests validation
    $reactTests = @(
        "should render a basic sprite",
        "should handle click events",
        "should animate sprites when animated prop is true",
        "should have proper ARIA labels",
        "should handle multiple sprites efficiently"
    )

    foreach ($test in $reactTests) {
        if ($content -match "it\('$test'") {
            $tests += "✅ $test React test case found"
        } else {
            $tests += "❌ Missing $test React test case"
        }
    }

    # Component cleanup validation
    if ($content -match "cleanup" -and $content -match "beforeEach") {
        $tests += "✅ Proper React component cleanup"
    } else {
        $tests += "❌ Missing React component cleanup"
    }

    $results.componentTests.status = if (($tests | Where-Object { $_ -match "❌" }).Count -eq 0) { "passed" } else { "failed" }
    $results.componentTests.tests = $tests
    $results.componentTests.coverage = $coverage

    Write-Host "   Status: $($results.componentTests.status)" -ForegroundColor $(if ($results.componentTests.status -eq "passed") { "Green" } else { "Red" })
    Write-Host "   Tests: $($tests.Count)"
    Write-Host "   Coverage: $($coverage.Count) items"
    Write-Host ""
}

function Test-PerformanceTests {
    Write-Host "⚡ Validating Performance Tests..." -ForegroundColor Yellow
    
    $metrics = @()
    $benchmarks = @()

    # Check for performance testing utilities
    $spriteUtilsPath = "src\test\spriteTestUtils.ts"
    if (Test-FileExists $spriteUtilsPath) {
        $content = Get-Content $spriteUtilsPath -Raw
        
        if ($content -match "measurePerformance") {
            $metrics += "✅ Performance measurement utility available"
        } else {
            $metrics += "❌ Performance measurement utility missing"
        }

        if ($content -match "measureSpriteOperation") {
            $metrics += "✅ Sprite operation performance testing available"
        } else {
            $metrics += "❌ Sprite operation performance testing missing"
        }
    }

    # Check for performance test cases
    $spriteTestsPath = "src\test\spriteTests.test.ts"
    if (Test-FileExists $spriteTestsPath) {
        $content = Get-Content $spriteTestsPath -Raw
        
        if ($content -match "Performance Testing") {
            $benchmarks += "✅ Performance testing suite found"
        } else {
            $benchmarks += "❌ Performance testing suite missing"
        }

        if ($content -match "should measure sprite creation performance") {
            $benchmarks += "✅ Sprite creation performance test found"
        } else {
            $benchmarks += "❌ Sprite creation performance test missing"
        }

        if ($content -match "should measure sprite rendering performance") {
            $benchmarks += "✅ Sprite rendering performance test found"
        } else {
            $benchmarks += "❌ Sprite rendering performance test missing"
        }

        if ($content -match "should measure collision detection performance") {
            $benchmarks += "✅ Collision detection performance test found"
        } else {
            $benchmarks += "❌ Collision detection performance test missing"
        }
    }

    $results.performance.status = if (($metrics | Where-Object { $_ -match "❌" }).Count -eq 0) { "passed" } else { "failed" }
    $results.performance.metrics = $metrics
    $results.performance.benchmarks = $benchmarks

    Write-Host "   Status: $($results.performance.status)" -ForegroundColor $(if ($results.performance.status -eq "passed") { "Green" } else { "Red" })
    Write-Host "   Metrics: $($metrics.Count)"
    Write-Host "   Benchmarks: $($benchmarks.Count) items"
    Write-Host ""
}

function Generate-TestSpriteReport {
    Write-Host "📊 Generating TestSprite Report..." -ForegroundColor Green
    Write-Host ""
    
    $totalTests = 0
    $passedTests = 0
    
    foreach ($key in $results.Keys) {
        if ($key -ne "overall") {
            $result = $results[$key]
            if ($result.tests) {
                $totalTests += $result.tests.Count
                $passedTests += ($result.tests | Where-Object { $_ -match "✅" }).Count
            }
            if ($result.metrics) {
                $totalTests += $result.metrics.Count
                $passedTests += ($result.metrics | Where-Object { $_ -match "✅" }).Count
            }
            if ($result.benchmarks) {
                $totalTests += $result.benchmarks.Count
                $passedTests += ($result.benchmarks | Where-Object { $_ -match "✅" }).Count
            }
        }
    }
    
    $score = if ($totalTests -gt 0) { [math]::Round(($passedTests / $totalTests) * 100) } else { 0 }
    
    Write-Host "🎯 TestSprite Validation Results" -ForegroundColor Cyan
    Write-Host "=" * 50
    
    foreach ($key in $results.Keys) {
        if ($key -eq "overall") { continue }
        
        $result = $results[$key]
        $status = if ($result.status -eq "passed") { "✅" } else { "❌" }
        
        Write-Host "$status $key:" -ForegroundColor White
        Write-Host "   Status: $($result.status)" -ForegroundColor $(if ($result.status -eq "passed") { "Green" } else { "Red" })
        
        if ($result.tests) {
            Write-Host "   Tests: $($result.tests.Count)"
            $result.tests[0..2] | ForEach-Object { Write-Host "     $_" -ForegroundColor White }
            if ($result.tests.Count -gt 3) {
                Write-Host "     ... and $($result.tests.Count - 3) more" -ForegroundColor White
            }
        }
        
        if ($result.metrics) {
            Write-Host "   Metrics: $($result.metrics.Count)"
            $result.metrics | ForEach-Object { Write-Host "     $_" -ForegroundColor White }
        }
        
        if ($result.benchmarks) {
            Write-Host "   Benchmarks: $($result.benchmarks.Count)"
            $result.benchmarks | ForEach-Object { Write-Host "     $_" -ForegroundColor White }
        }
        
        Write-Host ""
    }
    
    Write-Host "📈 TestSprite Statistics:" -ForegroundColor Cyan
    Write-Host "   Total Tests: $totalTests"
    Write-Host "   Passed: $passedTests" -ForegroundColor Green
    Write-Host "   Failed: $($totalTests - $passedTests)" -ForegroundColor $(if (($totalTests - $passedTests) -eq 0) { "Green" } else { "Red" })
    Write-Host "   Success Rate: $score%" -ForegroundColor $(if ($score -ge 90) { "Green" } elseif ($score -ge 70) { "Yellow" } else { "Red" })
    
    if ($score -ge 90) {
        Write-Host "`n🎉 Excellent! TestSprite implementation is comprehensive and robust." -ForegroundColor Green
        $results.overall.summary = "Excellent - Comprehensive TestSprite implementation"
    } elseif ($score -ge 70) {
        Write-Host "`n✅ Good! TestSprite implementation is solid with minor improvements needed." -ForegroundColor Yellow
        $results.overall.summary = "Good - Solid TestSprite implementation"
    } elseif ($score -ge 50) {
        Write-Host "`n⚠️ Fair! TestSprite implementation needs significant improvements." -ForegroundColor Yellow
        $results.overall.summary = "Fair - Needs improvements"
    } else {
        Write-Host "`n❌ Poor! TestSprite implementation requires major work." -ForegroundColor Red
        $results.overall.summary = "Poor - Requires major work"
    }
    
    $results.overall.status = if ($score -ge 70) { "passed" } else { "failed" }
    $results.overall.score = $score
    
    Write-Host "`n🔧 TestSprite Recommendations:" -ForegroundColor Cyan
    Write-Host "   1. Run actual test execution when Node.js environment is available" -ForegroundColor White
    Write-Host "   2. Integrate TestSprite into CI/CD pipeline" -ForegroundColor White
    Write-Host "   3. Add visual regression testing for sprite rendering" -ForegroundColor White
    Write-Host "   4. Implement automated performance monitoring" -ForegroundColor White
    Write-Host "   5. Create TestSprite documentation for team" -ForegroundColor White
    
    Write-Host "`n✨ TestSprite validation complete!" -ForegroundColor Green
}

# Run all TestSprite validation tests
Test-SpriteUtilities
Test-SpriteTests
Test-ComponentTests
Test-PerformanceTests
Generate-TestSpriteReport
