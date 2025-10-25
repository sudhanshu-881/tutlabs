#!/usr/bin/env node

/**
 * Comprehensive Test Runner for TutLabs Sprite Testing
 * This script runs all tests and provides detailed reporting
 */

import { execSync } from 'child_process';
import { existsSync } from 'fs';
import { join } from 'path';

interface TestResult {
  suite: string;
  passed: number;
  failed: number;
  skipped: number;
  duration: number;
  errors: string[];
}

class TestRunner {
  private results: TestResult[] = [];
  private startTime: number = 0;

  constructor() {
    this.startTime = Date.now();
  }

  async runAllTests(): Promise<void> {
    console.log('🎮 Starting TutLabs Sprite Testing Suite...\n');
    
    try {
      await this.runUnitTests();
      await this.runSpriteTests();
      await this.runE2ETests();
      await this.runBackendTests();
      
      this.generateReport();
    } catch (error) {
      console.error('❌ Test runner failed:', error);
      process.exit(1);
    }
  }

  private async runUnitTests(): Promise<void> {
    console.log('🧪 Running Unit Tests...');
    
    try {
      const output = execSync('npm run test:unit', { 
        encoding: 'utf8',
        cwd: process.cwd(),
        stdio: 'pipe'
      });
      
      this.parseTestOutput('Unit Tests', output);
      console.log('✅ Unit tests completed successfully\n');
    } catch (error: any) {
      this.handleTestError('Unit Tests', error);
    }
  }

  private async runSpriteTests(): Promise<void> {
    console.log('🎨 Running Sprite Tests...');
    
    try {
      // Run specific sprite test files
      const spriteTestFiles = [
        'src/test/spriteTests.test.ts',
        'src/test/spriteComponentTests.test.tsx'
      ];

      for (const testFile of spriteTestFiles) {
        if (existsSync(join(process.cwd(), testFile))) {
          const output = execSync(`npx vitest run ${testFile}`, { 
            encoding: 'utf8',
            cwd: process.cwd(),
            stdio: 'pipe'
          });
          
          this.parseTestOutput(`Sprite Tests (${testFile})`, output);
        }
      }
      
      console.log('✅ Sprite tests completed successfully\n');
    } catch (error: any) {
      this.handleTestError('Sprite Tests', error);
    }
  }

  private async runE2ETests(): Promise<void> {
    console.log('🌐 Running E2E Tests...');
    
    try {
      const output = execSync('npm run test:e2e', { 
        encoding: 'utf8',
        cwd: process.cwd(),
        stdio: 'pipe'
      });
      
      this.parseTestOutput('E2E Tests', output);
      console.log('✅ E2E tests completed successfully\n');
    } catch (error: any) {
      this.handleTestError('E2E Tests', error);
    }
  }

  private async runBackendTests(): Promise<void> {
    console.log('🔧 Running Backend Tests...');
    
    try {
      const output = execSync('npm run test:backend', { 
        encoding: 'utf8',
        cwd: process.cwd(),
        stdio: 'pipe'
      });
      
      this.parseTestOutput('Backend Tests', output);
      console.log('✅ Backend tests completed successfully\n');
    } catch (error: any) {
      this.handleTestError('Backend Tests', error);
    }
  }

  private parseTestOutput(suiteName: string, output: string): void {
    const lines = output.split('\n');
    let passed = 0;
    let failed = 0;
    let skipped = 0;
    const errors: string[] = [];

    for (const line of lines) {
      if (line.includes('✓') || line.includes('PASS')) {
        passed++;
      } else if (line.includes('✗') || line.includes('FAIL')) {
        failed++;
      } else if (line.includes('SKIP') || line.includes('○')) {
        skipped++;
      } else if (line.includes('Error:') || line.includes('FAILED')) {
        errors.push(line.trim());
      }
    }

    this.results.push({
      suite: suiteName,
      passed,
      failed,
      skipped,
      duration: 0, // Will be calculated later
      errors
    });
  }

  private handleTestError(suiteName: string, error: any): void {
    console.log(`❌ ${suiteName} failed`);
    
    this.results.push({
      suite: suiteName,
      passed: 0,
      failed: 1,
      skipped: 0,
      duration: 0,
      errors: [error.message || 'Unknown error']
    });
  }

  private generateReport(): void {
    const totalDuration = Date.now() - this.startTime;
    const totalPassed = this.results.reduce((sum, result) => sum + result.passed, 0);
    const totalFailed = this.results.reduce((sum, result) => sum + result.failed, 0);
    const totalSkipped = this.results.reduce((sum, result) => sum + result.skipped, 0);

    console.log('📊 Test Results Summary');
    console.log('='.repeat(50));
    
    for (const result of this.results) {
      const status = result.failed > 0 ? '❌' : '✅';
      console.log(`${status} ${result.suite}:`);
      console.log(`   Passed: ${result.passed}`);
      console.log(`   Failed: ${result.failed}`);
      console.log(`   Skipped: ${result.skipped}`);
      
      if (result.errors.length > 0) {
        console.log('   Errors:');
        result.errors.forEach(error => console.log(`     - ${error}`));
      }
      console.log('');
    }

    console.log('📈 Overall Statistics:');
    console.log(`   Total Tests: ${totalPassed + totalFailed + totalSkipped}`);
    console.log(`   Passed: ${totalPassed}`);
    console.log(`   Failed: ${totalFailed}`);
    console.log(`   Skipped: ${totalSkipped}`);
    console.log(`   Success Rate: ${((totalPassed / (totalPassed + totalFailed)) * 100).toFixed(2)}%`);
    console.log(`   Duration: ${(totalDuration / 1000).toFixed(2)}s`);

    if (totalFailed > 0) {
      console.log('\n🔧 Recommended Actions:');
      console.log('   1. Review failed tests and fix issues');
      console.log('   2. Check test environment setup');
      console.log('   3. Verify dependencies are installed');
      console.log('   4. Run individual test suites for debugging');
      
      process.exit(1);
    } else {
      console.log('\n🎉 All tests passed successfully!');
    }
  }
}

// Sprite-specific test utilities
export class SpriteTestValidator {
  static validateSpriteProperties(sprite: any): boolean {
    const requiredProps = ['id', 'x', 'y', 'width', 'height'];
    return requiredProps.every(prop => sprite.hasOwnProperty(prop));
  }

  static validateAnimationProperties(animation: any): boolean {
    if (!animation) return true; // Animation is optional
    
    const requiredProps = ['frames', 'currentFrame', 'duration'];
    return requiredProps.every(prop => animation.hasOwnProperty(prop));
  }

  static validateCollisionDetection(sprite1: any, sprite2: any): boolean {
    return (
      sprite1.x < sprite2.x + sprite2.width &&
      sprite1.x + sprite1.width > sprite2.x &&
      sprite1.y < sprite2.y + sprite2.height &&
      sprite1.y + sprite1.height > sprite2.y
    );
  }

  static validatePerformance(operation: () => void, maxTime: number = 16): boolean {
    const start = performance.now();
    operation();
    const end = performance.now();
    return (end - start) <= maxTime;
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  const runner = new TestRunner();
  runner.runAllTests().catch(console.error);
}

export { TestRunner, SpriteTestValidator };

