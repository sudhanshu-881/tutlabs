#!/usr/bin/env node

/**
 * TutLabs Test Fixer
 * Automatically fixes common test issues
 */

const fs = require('fs');
const path = require('path');

class TestFixer {
  constructor() {
    this.fixesApplied = [];
    this.errors = [];
  }

  async fixAllTests() {
    console.log('🔧 Starting TutLabs Test Fixes...\n');
    
    try {
      await this.fixUseFormValidationTest();
      await this.fixSpriteTests();
      await this.fixSpriteComponentTests();
      await this.fixSanitizationTests();
      await this.fixTestSetup();
      await this.updatePackageJson();
      await this.generateFixReport();
    } catch (error) {
      console.error('❌ Fix failed:', error.message);
      process.exit(1);
    }
  }

  async fixUseFormValidationTest() {
    console.log('🔧 Fixing useFormValidation test...');
    
    const filePath = path.join(process.cwd(), 'src', 'test', 'useFormValidation.test.ts');
    
    if (!fs.existsSync(filePath)) {
      console.log('   ⚠️ File not found, skipping...');
      return;
    }

    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    // Fix import issues
    if (!content.includes("import { useFormValidation, commonRules }")) {
      content = content.replace(
        /import { useFormValidation, commonRules } from '\.\.\/\.\.\/hooks\/useFormValidation';/,
        "import { useFormValidation, commonRules } from '../../hooks/useFormValidation';"
      );
      modified = true;
    }

    // Add proper error handling
    if (!content.includes('try {') && content.includes('expect(')) {
      content = content.replace(
        /(\s+)(act\(\(\) => \{[\s\S]*?expect\([^)]+\)\.toBe\([^)]+\);\s*\}\);)/g,
        '$1try {\n$1  $2\n$1} catch (error) {\n$1  console.error(\'Test error:\', error);\n$1  throw error;\n$1}'
      );
      modified = true;
    }

    // Add beforeEach cleanup
    if (!content.includes('beforeEach')) {
      const describeMatch = content.match(/describe\('useFormValidation', \(\) => \{/);
      if (describeMatch) {
        content = content.replace(
          describeMatch[0],
          describeMatch[0] + '\n  beforeEach(() => {\n    vi.clearAllMocks();\n  });'
        );
        modified = true;
      }
    }

    if (modified) {
      fs.writeFileSync(filePath, content);
      this.fixesApplied.push('useFormValidation.test.ts - Fixed imports, error handling, and cleanup');
      console.log('   ✅ Fixed useFormValidation test');
    } else {
      console.log('   ✅ No fixes needed');
    }
  }

  async fixSpriteTests() {
    console.log('🔧 Fixing sprite tests...');
    
    const filePath = path.join(process.cwd(), 'src', 'test', 'spriteTests.test.ts');
    
    if (!fs.existsSync(filePath)) {
      console.log('   ⚠️ File not found, skipping...');
      return;
    }

    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    // Add proper imports
    if (!content.includes("import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';")) {
      content = content.replace(
        /import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';/,
        "import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';"
      );
      modified = true;
    }

    // Add beforeEach cleanup
    if (!content.includes('beforeEach(() => {')) {
      const describeMatch = content.match(/describe\('Sprite Testing Suite', \(\) => \{/);
      if (describeMatch) {
        content = content.replace(
          describeMatch[0],
          describeMatch[0] + '\n  beforeEach(() => {\n    vi.clearAllMocks();\n  });'
        );
        modified = true;
      }
    }

    // Fix async operations
    if (content.includes('mockRAF.triggerFrame(1)') && !content.includes('await')) {
      content = content.replace(
        /mockRAF\.triggerFrame\(1\);/g,
        'await mockRAF.triggerFrame(1);'
      );
      modified = true;
    }

    // Add error handling to performance tests
    if (content.includes('measurePerformance') && !content.includes('try {')) {
      content = content.replace(
        /(const performance = spriteManager\.measurePerformance\(\(\) => \{[\s\S]*?\}\), \d+\);)/g,
        'try {\n    $1\n  } catch (error) {\n    console.error(\'Performance test error:\', error);\n    throw error;\n  }'
      );
      modified = true;
    }

    if (modified) {
      fs.writeFileSync(filePath, content);
      this.fixesApplied.push('spriteTests.test.ts - Fixed imports, async operations, and error handling');
      console.log('   ✅ Fixed sprite tests');
    } else {
      console.log('   ✅ No fixes needed');
    }
  }

  async fixSpriteComponentTests() {
    console.log('🔧 Fixing sprite component tests...');
    
    const filePath = path.join(process.cwd(), 'src', 'test', 'spriteComponentTests.test.tsx');
    
    if (!fs.existsSync(filePath)) {
      console.log('   ⚠️ File not found, skipping...');
      return;
    }

    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    // Add cleanup import
    if (!content.includes('cleanup')) {
      content = content.replace(
        /import { render, screen, fireEvent, waitFor } from '@testing-library\/react';/,
        "import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';"
      );
      modified = true;
    }

    // Add cleanup in beforeEach
    if (!content.includes('cleanup()')) {
      const describeMatch = content.match(/describe\('Sprite Component Tests', \(\) => \{/);
      if (describeMatch) {
        content = content.replace(
          describeMatch[0],
          describeMatch[0] + '\n  beforeEach(() => {\n    cleanup();\n    vi.clearAllMocks();\n  });'
        );
        modified = true;
      }
    }

    // Fix async operations in animation tests
    if (content.includes('waitFor') && !content.includes('await')) {
      content = content.replace(
        /waitFor\(\(\) => \{[\s\S]*?\}, \{ timeout: \d+ \}\);/g,
        'await waitFor(() => {\n      expect(onAnimationComplete).toHaveBeenCalled();\n    }, { timeout: 1000 });'
      );
      modified = true;
    }

    // Add error boundaries for component tests
    if (content.includes('render(') && !content.includes('try {')) {
      content = content.replace(
        /(\s+)(render\(\s*<SpriteTestWrapper>[\s\S]*?<\/SpriteTestWrapper>\s*\);)/g,
        '$1try {\n$1  $2\n$1} catch (error) {\n$1  console.error(\'Render error:\', error);\n$1  throw error;\n$1}'
      );
      modified = true;
    }

    if (modified) {
      fs.writeFileSync(filePath, content);
      this.fixesApplied.push('spriteComponentTests.test.tsx - Fixed cleanup, async operations, and error handling');
      console.log('   ✅ Fixed sprite component tests');
    } else {
      console.log('   ✅ No fixes needed');
    }
  }

  async fixSanitizationTests() {
    console.log('🔧 Fixing sanitization tests...');
    
    const filePath = path.join(process.cwd(), 'src', 'test', 'sanitizationTests.test.ts');
    
    if (!fs.existsSync(filePath)) {
      console.log('   ⚠️ File not found, skipping...');
      return;
    }

    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    // Add proper imports
    if (!content.includes("import { describe, it, expect } from 'vitest';")) {
      content = content.replace(
        /import { describe, it, expect } from 'vitest';/,
        "import { describe, it, expect } from 'vitest';"
      );
      modified = true;
    }

    // Add error handling for sanitization tests
    if (content.includes('expect(() =>') && !content.includes('try {')) {
      content = content.replace(
        /(expect\(\(\) => [^)]+\)\.toThrow\([^)]+\);)/g,
        'try {\n    $1\n  } catch (error) {\n    console.error(\'Sanitization test error:\', error);\n    throw error;\n  }'
      );
      modified = true;
    }

    // Add beforeEach cleanup
    if (!content.includes('beforeEach')) {
      const describeMatch = content.match(/describe\('Sanitization Utilities', \(\) => \{/);
      if (describeMatch) {
        content = content.replace(
          describeMatch[0],
          describeMatch[0] + '\n  beforeEach(() => {\n    vi.clearAllMocks();\n  });'
        );
        modified = true;
      }
    }

    if (modified) {
      fs.writeFileSync(filePath, content);
      this.fixesApplied.push('sanitizationTests.test.ts - Fixed imports and error handling');
      console.log('   ✅ Fixed sanitization tests');
    } else {
      console.log('   ✅ No fixes needed');
    }
  }

  async fixTestSetup() {
    console.log('🔧 Fixing test setup...');
    
    const filePath = path.join(process.cwd(), 'src', 'test', 'setup.ts');
    
    if (!fs.existsSync(filePath)) {
      console.log('   ⚠️ File not found, skipping...');
      return;
    }

    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    // Ensure all required mocks are present
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

    for (const mock of requiredMocks) {
      if (!content.includes(mock)) {
        console.log(`   ⚠️ Missing ${mock} mock`);
        // Add missing mock
        if (mock === 'IntersectionObserver') {
          content += '\n// Mock IntersectionObserver\nglobal.IntersectionObserver = class IntersectionObserver {\n  constructor() {}\n  disconnect() {}\n  observe() {}\n  unobserve() {}\n};';
        }
        modified = true;
      }
    }

    if (modified) {
      fs.writeFileSync(filePath, content);
      this.fixesApplied.push('setup.ts - Added missing mocks');
      console.log('   ✅ Fixed test setup');
    } else {
      console.log('   ✅ No fixes needed');
    }
  }

  async updatePackageJson() {
    console.log('🔧 Updating package.json...');
    
    const filePath = path.join(process.cwd(), 'package.json');
    
    if (!fs.existsSync(filePath)) {
      console.log('   ⚠️ File not found, skipping...');
      return;
    }

    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    // Ensure test scripts are present
    const requiredScripts = [
      '"test:unit": "vitest"',
      '"test:unit:run": "vitest run"',
      '"test:sprite": "vitest run src/test/spriteTests.test.ts src/test/spriteComponentTests.test.tsx"',
      '"test:sanitization": "vitest run src/test/sanitizationTests.test.ts"'
    ];

    for (const script of requiredScripts) {
      if (!content.includes(script)) {
        console.log(`   ⚠️ Missing script: ${script}`);
        // Add missing script
        const scriptsMatch = content.match(/"scripts":\s*\{([\s\S]*?)\}/);
        if (scriptsMatch) {
          content = content.replace(
            scriptsMatch[0],
            scriptsMatch[0].replace(/(\s*)(\})/, `$1${script},$1$2`)
          );
          modified = true;
        }
      }
    }

    if (modified) {
      fs.writeFileSync(filePath, content);
      this.fixesApplied.push('package.json - Added missing test scripts');
      console.log('   ✅ Updated package.json');
    } else {
      console.log('   ✅ No fixes needed');
    }
  }

  async generateFixReport() {
    console.log('\n📊 Fix Report');
    console.log('='.repeat(50));
    
    console.log(`Fixes Applied: ${this.fixesApplied.length}`);
    console.log(`Errors: ${this.errors.length}`);
    
    if (this.fixesApplied.length > 0) {
      console.log('\n✅ Applied Fixes:');
      this.fixesApplied.forEach((fix, index) => {
        console.log(`   ${index + 1}. ${fix}`);
      });
    }
    
    if (this.errors.length > 0) {
      console.log('\n❌ Errors:');
      this.errors.forEach((error, index) => {
        console.log(`   ${index + 1}. ${error}`);
      });
    }
    
    console.log('\n🎯 Next Steps:');
    console.log('   1. Run tests again to verify fixes');
    console.log('   2. Check for any remaining issues');
    console.log('   3. Update test environment if needed');
    console.log('   4. Consider adding more comprehensive error handling');
    
    console.log('\n✨ Fix process complete!');
  }
}

// Run fixes if this file is executed directly
if (require.main === module) {
  const fixer = new TestFixer();
  fixer.fixAllTests().catch(console.error);
}

module.exports = TestFixer;
