#!/usr/bin/env node

/**
 * TutLabs Test Result Analyzer
 * Analyzes failed tests and provides fixes
 */

const fs = require('fs');
const path = require('path');

class TestResultAnalyzer {
  constructor() {
    this.failedTests = [];
    this.analysis = {
      commonIssues: [],
      fixes: [],
      recommendations: []
    };
  }

  async analyzeResults() {
    console.log('🔍 Analyzing TutLabs Test Results...\n');
    
    try {
      await this.loadFailedTests();
      await this.analyzeCommonIssues();
      await this.generateFixes();
      await this.createTestReport();
    } catch (error) {
      console.error('❌ Analysis failed:', error.message);
      process.exit(1);
    }
  }

  async loadFailedTests() {
    const resultsPath = path.join(process.cwd(), 'test-results', '.last-run.json');
    
    if (!fs.existsSync(resultsPath)) {
      console.log('⚠️ No test results file found');
      return;
    }

    const results = JSON.parse(fs.readFileSync(resultsPath, 'utf8'));
    this.failedTests = results.failedTests || [];
    
    console.log(`📊 Found ${this.failedTests.length} failed tests`);
  }

  async analyzeCommonIssues() {
    console.log('🔍 Analyzing common test issues...\n');

    // Analyze test files for potential issues
    const testFiles = [
      'src/test/useFormValidation.test.ts',
      'src/test/spriteTests.test.ts',
      'src/test/spriteComponentTests.test.tsx',
      'src/test/sanitizationTests.test.ts'
    ];

    for (const testFile of testFiles) {
      const filePath = path.join(process.cwd(), testFile);
      if (fs.existsSync(filePath)) {
        await this.analyzeTestFile(filePath);
      }
    }

    // Check for common configuration issues
    await this.checkTestConfiguration();
  }

  async analyzeTestFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    const fileName = path.basename(filePath);
    
    console.log(`📄 Analyzing ${fileName}...`);

    // Check for common test issues
    const issues = [];

    // Check for missing imports
    if (content.includes('useFormValidation') && !content.includes("from '../../hooks/useFormValidation'")) {
      issues.push('Missing useFormValidation import');
    }

    if (content.includes('commonRules') && !content.includes("commonRules")) {
      issues.push('Missing commonRules import');
    }

    // Check for async/await issues
    if (content.includes('async') && !content.includes('await')) {
      issues.push('Async function without await');
    }

    // Check for missing error handling
    if (content.includes('expect(') && !content.includes('try') && !content.includes('catch')) {
      issues.push('Missing error handling in tests');
    }

    // Check for mock issues
    if (content.includes('vi.fn()') && !content.includes('vi.clearAllMocks')) {
      issues.push('Missing mock cleanup');
    }

    // Check for React testing issues
    if (filePath.includes('.tsx') && content.includes('render(') && !content.includes('cleanup')) {
      issues.push('Missing React component cleanup');
    }

    if (issues.length > 0) {
      console.log(`   Issues found: ${issues.length}`);
      issues.forEach(issue => console.log(`   - ${issue}`));
      this.analysis.commonIssues.push({ file: fileName, issues });
    } else {
      console.log(`   ✅ No issues found`);
    }
  }

  async checkTestConfiguration() {
    console.log('\n⚙️ Checking test configuration...');

    const configFiles = [
      'vitest.config.ts',
      'src/test/setup.ts',
      'package.json'
    ];

    for (const configFile of configFiles) {
      const filePath = path.join(process.cwd(), configFile);
      if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf8');
        const fileName = path.basename(filePath);
        
        console.log(`📄 Checking ${fileName}...`);

        const issues = [];

        if (fileName === 'vitest.config.ts') {
          if (!content.includes('jsdom')) {
            issues.push('Missing jsdom environment configuration');
          }
          if (!content.includes('setupFiles')) {
            issues.push('Missing setupFiles configuration');
          }
        }

        if (fileName === 'src/test/setup.ts') {
          if (!content.includes('@testing-library/jest-dom')) {
            issues.push('Missing @testing-library/jest-dom import');
          }
          if (!content.includes('IntersectionObserver')) {
            issues.push('Missing IntersectionObserver mock');
          }
        }

        if (fileName === 'package.json') {
          if (!content.includes('"test:unit"')) {
            issues.push('Missing test:unit script');
          }
          if (!content.includes('vitest')) {
            issues.push('Missing vitest dependency');
          }
        }

        if (issues.length > 0) {
          console.log(`   Issues found: ${issues.length}`);
          issues.forEach(issue => console.log(`   - ${issue}`));
          this.analysis.commonIssues.push({ file: fileName, issues });
        } else {
          console.log(`   ✅ No issues found`);
        }
      }
    }
  }

  async generateFixes() {
    console.log('\n🔧 Generating fixes...');

    // Generate fixes based on common issues
    this.analysis.fixes = [
      {
        type: 'import',
        description: 'Fix missing imports in test files',
        files: ['src/test/useFormValidation.test.ts'],
        fix: "import { useFormValidation, commonRules } from '../../hooks/useFormValidation';"
      },
      {
        type: 'mock',
        description: 'Add proper mock cleanup',
        files: ['src/test/spriteTests.test.ts', 'src/test/spriteComponentTests.test.tsx'],
        fix: 'Add vi.clearAllMocks() in beforeEach hooks'
      },
      {
        type: 'async',
        description: 'Fix async/await patterns',
        files: ['src/test/spriteTests.test.ts'],
        fix: 'Add proper await statements for async operations'
      },
      {
        type: 'error-handling',
        description: 'Add error handling to tests',
        files: ['src/test/spriteTests.test.ts', 'src/test/spriteComponentTests.test.tsx'],
        fix: 'Wrap test operations in try-catch blocks'
      },
      {
        type: 'react-cleanup',
        description: 'Add React component cleanup',
        files: ['src/test/spriteComponentTests.test.tsx'],
        fix: 'Import and use cleanup from @testing-library/react'
      }
    ];

    console.log(`Generated ${this.analysis.fixes.length} potential fixes`);
  }

  async createTestReport() {
    console.log('\n📊 Creating Test Analysis Report...\n');

    console.log('🎯 Test Analysis Summary');
    console.log('='.repeat(50));
    
    console.log(`Failed Tests: ${this.failedTests.length}`);
    console.log(`Files Analyzed: ${this.analysis.commonIssues.length}`);
    console.log(`Potential Fixes: ${this.analysis.fixes.length}`);

    if (this.analysis.commonIssues.length > 0) {
      console.log('\n📋 Issues Found:');
      this.analysis.commonIssues.forEach((fileIssue, index) => {
        console.log(`\n${index + 1}. ${fileIssue.file}:`);
        fileIssue.issues.forEach(issue => {
          console.log(`   - ${issue}`);
        });
      });
    }

    if (this.analysis.fixes.length > 0) {
      console.log('\n🔧 Recommended Fixes:');
      this.analysis.fixes.forEach((fix, index) => {
        console.log(`\n${index + 1}. ${fix.description}`);
        console.log(`   Type: ${fix.type}`);
        console.log(`   Files: ${fix.files.join(', ')}`);
        console.log(`   Fix: ${fix.fix}`);
      });
    }

    // Generate recommendations
    this.analysis.recommendations = [
      'Run tests individually to isolate specific failures',
      'Check test environment setup and dependencies',
      'Verify all imports are correct and files exist',
      'Add proper error handling and cleanup',
      'Use consistent async/await patterns',
      'Implement proper mock management',
      'Add React component cleanup where needed'
    ];

    console.log('\n💡 Recommendations:');
    this.analysis.recommendations.forEach((rec, index) => {
      console.log(`   ${index + 1}. ${rec}`);
    });

    console.log('\n✨ Analysis complete!');
  }
}

// Run analysis if this file is executed directly
if (require.main === module) {
  const analyzer = new TestResultAnalyzer();
  analyzer.analyzeResults().catch(console.error);
}

module.exports = TestResultAnalyzer;
