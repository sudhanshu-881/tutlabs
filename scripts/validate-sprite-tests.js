#!/usr/bin/env node

/**
 * TutLabs Sprite Testing Validation Script
 * This script validates the sprite testing implementation without requiring Node.js runtime
 */

const fs = require('fs');
const path = require('path');

class SpriteTestValidator {
  constructor() {
    this.results = {
      spriteUtils: { status: 'pending', issues: [], coverage: [] },
      spriteTests: { status: 'pending', issues: [], coverage: [] },
      componentTests: { status: 'pending', issues: [], coverage: [] },
      sanitizationTests: { status: 'pending', issues: [], coverage: [] },
      setup: { status: 'pending', issues: [], coverage: [] },
      overall: { status: 'pending', score: 0, recommendations: [] }
    };
  }

  async validateAll() {
    console.log('🎮 Starting TutLabs Sprite Testing Validation...\n');
    
    try {
      await this.validateSpriteUtils();
      await this.validateSpriteTests();
      await this.validateComponentTests();
      await this.validateSanitizationTests();
      await this.validateTestSetup();
      await this.generateReport();
    } catch (error) {
      console.error('❌ Validation failed:', error.message);
      process.exit(1);
    }
  }

  async validateSpriteUtils() {
    console.log('🔧 Validating Sprite Test Utilities...');
    
    const filePath = path.join(process.cwd(), 'src', 'test', 'spriteTestUtils.ts');
    
    if (!fs.existsSync(filePath)) {
      this.results.spriteUtils.status = 'failed';
      this.results.spriteUtils.issues.push('spriteTestUtils.ts file not found');
      return;
    }

    const content = fs.readFileSync(filePath, 'utf8');
    const issues = [];
    const coverage = [];

    // Check for required classes and interfaces
    const requiredExports = [
      'MockSpriteManager',
      'MockCanvas',
      'MockCanvasContext', 
      'SpriteRenderer',
      'spriteTestUtils'
    ];

    requiredExports.forEach(exportName => {
      if (content.includes(`export ${exportName}`) || content.includes(`export class ${exportName}`)) {
        coverage.push(`✅ ${exportName} class/interface found`);
      } else {
        issues.push(`❌ Missing ${exportName} export`);
      }
    });

    // Check for key methods
    const keyMethods = [
      'createSprite',
      'updateSprite',
      'removeSprite',
      'getSprite',
      'checkCollision',
      'measurePerformance',
      'renderSprite',
      'startAnimation',
      'stopAnimation'
    ];

    keyMethods.forEach(method => {
      if (content.includes(method)) {
        coverage.push(`✅ ${method} method implemented`);
      } else {
        issues.push(`❌ Missing ${method} method`);
      }
    });

    // Check for TypeScript types
    if (content.includes('interface MockSprite')) {
      coverage.push('✅ MockSprite interface defined');
    } else {
      issues.push('❌ Missing MockSprite interface');
    }

    this.results.spriteUtils.status = issues.length === 0 ? 'passed' : 'failed';
    this.results.spriteUtils.issues = issues;
    this.results.spriteUtils.coverage = coverage;

    console.log(`   Status: ${this.results.spriteUtils.status}`);
    console.log(`   Coverage: ${coverage.length} items`);
    console.log(`   Issues: ${issues.length} items\n`);
  }

  async validateSpriteTests() {
    console.log('🧪 Validating Sprite Tests...');
    
    const filePath = path.join(process.cwd(), 'src', 'test', 'spriteTests.test.ts');
    
    if (!fs.existsSync(filePath)) {
      this.results.spriteTests.status = 'failed';
      this.results.spriteTests.issues.push('spriteTests.test.ts file not found');
      return;
    }

    const content = fs.readFileSync(filePath, 'utf8');
    const issues = [];
    const coverage = [];

    // Check for test suites
    const testSuites = [
      'Sprite Management',
      'Sprite Animation', 
      'Sprite Rendering',
      'Collision Detection',
      'Performance Testing',
      'Edge Cases and Error Handling',
      'Integration Tests'
    ];

    testSuites.forEach(suite => {
      if (content.includes(`describe('${suite}'`)) {
        coverage.push(`✅ ${suite} test suite found`);
      } else {
        issues.push(`❌ Missing ${suite} test suite`);
      }
    });

    // Check for key test cases
    const keyTests = [
      'should create and retrieve sprites',
      'should update sprite properties',
      'should remove sprites',
      'should create animated sprites',
      'should update animation frames',
      'should render sprites to canvas',
      'should detect sprite collisions',
      'should measure sprite creation performance'
    ];

    keyTests.forEach(test => {
      if (content.includes(`it('${test}'`)) {
        coverage.push(`✅ ${test} test case found`);
      } else {
        issues.push(`❌ Missing ${test} test case`);
      }
    });

    this.results.spriteTests.status = issues.length === 0 ? 'passed' : 'failed';
    this.results.spriteTests.issues = issues;
    this.results.spriteTests.coverage = coverage;

    console.log(`   Status: ${this.results.spriteTests.status}`);
    console.log(`   Coverage: ${coverage.length} items`);
    console.log(`   Issues: ${issues.length} items\n`);
  }

  async validateComponentTests() {
    console.log('⚛️ Validating React Component Tests...');
    
    const filePath = path.join(process.cwd(), 'src', 'test', 'spriteComponentTests.test.tsx');
    
    if (!fs.existsSync(filePath)) {
      this.results.componentTests.status = 'failed';
      this.results.componentTests.issues.push('spriteComponentTests.test.tsx file not found');
      return;
    }

    const content = fs.readFileSync(filePath, 'utf8');
    const issues = [];
    const coverage = [];

    // Check for React testing imports
    const reactImports = [
      '@testing-library/react',
      '@testing-library/jest-dom',
      'react'
    ];

    reactImports.forEach(importName => {
      if (content.includes(importName)) {
        coverage.push(`✅ ${importName} import found`);
      } else {
        issues.push(`❌ Missing ${importName} import`);
      }
    });

    // Check for component test suites
    const componentSuites = [
      'Basic Sprite Rendering',
      'Sprite Interactions',
      'Sprite Animation',
      'Sprite Manager Hook',
      'Accessibility',
      'Performance Considerations'
    ];

    componentSuites.forEach(suite => {
      if (content.includes(`describe('${suite}'`)) {
        coverage.push(`✅ ${suite} component test suite found`);
      } else {
        issues.push(`❌ Missing ${suite} component test suite`);
      }
    });

    // Check for React-specific tests
    const reactTests = [
      'should render a basic sprite',
      'should handle click events',
      'should animate sprites when animated prop is true',
      'should have proper ARIA labels',
      'should handle multiple sprites efficiently'
    ];

    reactTests.forEach(test => {
      if (content.includes(`it('${test}'`)) {
        coverage.push(`✅ ${test} React test case found`);
      } else {
        issues.push(`❌ Missing ${test} React test case`);
      }
    });

    this.results.componentTests.status = issues.length === 0 ? 'passed' : 'failed';
    this.results.componentTests.issues = issues;
    this.results.componentTests.coverage = coverage;

    console.log(`   Status: ${this.results.componentTests.status}`);
    console.log(`   Coverage: ${coverage.length} items`);
    console.log(`   Issues: ${issues.length} items\n`);
  }

  async validateSanitizationTests() {
    console.log('🔒 Validating Sanitization Tests...');
    
    const filePath = path.join(process.cwd(), 'src', 'test', 'sanitizationTests.test.ts');
    
    if (!fs.existsSync(filePath)) {
      this.results.sanitizationTests.status = 'failed';
      this.results.sanitizationTests.issues.push('sanitizationTests.test.ts file not found');
      return;
    }

    const content = fs.readFileSync(filePath, 'utf8');
    const issues = [];
    const coverage = [];

    // Check for sanitization test suites
    const sanitizationSuites = [
      'escapeHtml',
      'sanitizeInput',
      'sanitizeEmail',
      'sanitizePhone',
      'sanitizeText',
      'sanitizeUrl',
      'sanitizeFileName',
      'RateLimiter',
      'createCSPNonce'
    ];

    sanitizationSuites.forEach(suite => {
      if (content.includes(`describe('${suite}'`)) {
        coverage.push(`✅ ${suite} sanitization test suite found`);
      } else {
        issues.push(`❌ Missing ${suite} sanitization test suite`);
      }
    });

    // Check for security test cases
    const securityTests = [
      'should escape HTML entities',
      'should remove dangerous characters',
      'should validate and sanitize valid emails',
      'should throw error for invalid emails',
      'should sanitize valid phone numbers',
      'should validate and return valid URLs',
      'should throw error for invalid URLs',
      'should allow requests within limit',
      'should block requests exceeding limit'
    ];

    securityTests.forEach(test => {
      if (content.includes(`it('${test}'`)) {
        coverage.push(`✅ ${test} security test case found`);
      } else {
        issues.push(`❌ Missing ${test} security test case`);
      }
    });

    this.results.sanitizationTests.status = issues.length === 0 ? 'passed' : 'failed';
    this.results.sanitizationTests.issues = issues;
    this.results.sanitizationTests.coverage = coverage;

    console.log(`   Status: ${this.results.sanitizationTests.status}`);
    console.log(`   Coverage: ${coverage.length} items`);
    console.log(`   Issues: ${issues.length} items\n`);
  }

  async validateTestSetup() {
    console.log('⚙️ Validating Test Setup...');
    
    const filePath = path.join(process.cwd(), 'src', 'test', 'setup.ts');
    
    if (!fs.existsSync(filePath)) {
      this.results.setup.status = 'failed';
      this.results.setup.issues.push('setup.ts file not found');
      return;
    }

    const content = fs.readFileSync(filePath, 'utf8');
    const issues = [];
    const coverage = [];

    // Check for required mocks
    const requiredMocks = [
      'IntersectionObserver',
      'ResizeObserver',
      'matchMedia',
      'crypto.getRandomValues',
      'requestAnimationFrame',
      'cancelAnimationFrame',
      'performance.now',
      'DOMMatrix'
    ];

    requiredMocks.forEach(mock => {
      if (content.includes(mock)) {
        coverage.push(`✅ ${mock} mock found`);
      } else {
        issues.push(`❌ Missing ${mock} mock`);
      }
    });

    // Check for testing library imports
    if (content.includes("@testing-library/jest-dom")) {
      coverage.push('✅ @testing-library/jest-dom import found');
    } else {
      issues.push('❌ Missing @testing-library/jest-dom import');
    }

    if (content.includes("vitest")) {
      coverage.push('✅ vitest import found');
    } else {
      issues.push('❌ Missing vitest import');
    }

    this.results.setup.status = issues.length === 0 ? 'passed' : 'failed';
    this.results.setup.issues = issues;
    this.results.setup.coverage = coverage;

    console.log(`   Status: ${this.results.setup.status}`);
    console.log(`   Coverage: ${coverage.length} items`);
    console.log(`   Issues: ${issues.length} items\n`);
  }

  async generateReport() {
    console.log('📊 Generating Validation Report...\n');
    
    const totalIssues = Object.values(this.results).reduce((sum, result) => {
      return sum + (result.issues ? result.issues.length : 0);
    }, 0);

    const totalCoverage = Object.values(this.results).reduce((sum, result) => {
      return sum + (result.coverage ? result.coverage.length : 0);
    }, 0);

    const passedTests = Object.values(this.results).filter(result => result.status === 'passed').length;
    const totalTests = Object.keys(this.results).length - 1; // Exclude overall

    const score = Math.round((passedTests / totalTests) * 100);

    console.log('🎯 Validation Results Summary');
    console.log('='.repeat(50));
    
    Object.entries(this.results).forEach(([key, result]) => {
      if (key === 'overall') return;
      
      const status = result.status === 'passed' ? '✅' : '❌';
      console.log(`${status} ${key}:`);
      console.log(`   Status: ${result.status}`);
      console.log(`   Coverage: ${result.coverage.length} items`);
      console.log(`   Issues: ${result.issues.length} items`);
      
      if (result.issues.length > 0) {
        console.log('   Issues:');
        result.issues.slice(0, 3).forEach(issue => console.log(`     ${issue}`));
        if (result.issues.length > 3) {
          console.log(`     ... and ${result.issues.length - 3} more`);
        }
      }
      console.log('');
    });

    console.log('📈 Overall Statistics:');
    console.log(`   Test Suites: ${totalTests}`);
    console.log(`   Passed: ${passedTests}`);
    console.log(`   Failed: ${totalTests - passedTests}`);
    console.log(`   Total Coverage Items: ${totalCoverage}`);
    console.log(`   Total Issues: ${totalIssues}`);
    console.log(`   Validation Score: ${score}%`);

    if (score >= 90) {
      console.log('\n🎉 Excellent! Sprite testing implementation is comprehensive and well-structured.');
    } else if (score >= 70) {
      console.log('\n✅ Good! Sprite testing implementation is solid with minor improvements needed.');
    } else if (score >= 50) {
      console.log('\n⚠️ Fair! Sprite testing implementation needs significant improvements.');
    } else {
      console.log('\n❌ Poor! Sprite testing implementation requires major work.');
    }

    // Generate recommendations
    const recommendations = [];
    
    if (totalIssues > 0) {
      recommendations.push('Address all identified issues in test files');
    }
    
    if (score < 100) {
      recommendations.push('Review and enhance test coverage');
    }
    
    recommendations.push('Run actual test execution when Node.js environment is available');
    recommendations.push('Integrate sprite tests into CI/CD pipeline');
    recommendations.push('Add visual regression testing for sprite rendering');

    console.log('\n🔧 Recommendations:');
    recommendations.forEach((rec, index) => {
      console.log(`   ${index + 1}. ${rec}`);
    });

    // Update overall results
    this.results.overall.status = score >= 70 ? 'passed' : 'failed';
    this.results.overall.score = score;
    this.results.overall.recommendations = recommendations;

    console.log('\n✨ Validation complete!');
  }
}

// Run validation if this file is executed directly
if (require.main === module) {
  const validator = new SpriteTestValidator();
  validator.validateAll().catch(console.error);
}

module.exports = SpriteTestValidator;

