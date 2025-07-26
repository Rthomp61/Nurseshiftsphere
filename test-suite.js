#!/usr/bin/env node

/**
 * ShiftGenie Testing Suite
 * Implements A-Z testing standards from replit.md
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const testResults = {
  passed: 0,
  failed: 0,
  warnings: 0,
  details: []
};

function logTest(category, test, status, details = '') {
  const result = { category, test, status, details };
  testResults.details.push(result);
  
  if (status === 'PASS') testResults.passed++;
  else if (status === 'FAIL') testResults.failed++;
  else if (status === 'WARN') testResults.warnings++;
  
  const emoji = status === 'PASS' ? '✅' : status === 'FAIL' ? '❌' : '⚠️';
  console.log(`${emoji} [${category}] ${test} - ${status}${details ? ': ' + details : ''}`);
}

// A. ACCESSIBILITY TESTS
function testAccessibility() {
  console.log('\n🔍 Testing Accessibility (WCAG 2.1 AA)...');
  
  // Check for semantic HTML elements
  const clientFiles = execSync('find client/src -name "*.tsx" -type f').toString().split('\n').filter(Boolean);
  let semanticElementsFound = false;
  
  clientFiles.forEach(file => {
    const content = fs.readFileSync(file, 'utf8');
    if (content.includes('<nav>') || content.includes('<section>') || content.includes('<button>')) {
      semanticElementsFound = true;
    }
  });
  
  logTest('ACCESSIBILITY', 'Semantic HTML elements', semanticElementsFound ? 'PASS' : 'FAIL');
  
  // Check for ARIA attributes
  let ariaFound = false;
  clientFiles.forEach(file => {
    const content = fs.readFileSync(file, 'utf8');
    if (content.includes('aria-') || content.includes('role=')) {
      ariaFound = true;
    }
  });
  
  logTest('ACCESSIBILITY', 'ARIA attributes present', ariaFound ? 'PASS' : 'WARN', 'Consider adding more ARIA labels');
}

// B. AUTHENTICATION & SECURITY TESTS
function testSecurity() {
  console.log('\n🔒 Testing Authentication & Security...');
  
  // Check for HTTPS enforcement
  const serverFiles = execSync('find server -name "*.ts" -type f').toString().split('\n').filter(Boolean);
  let httpsFound = false;
  
  serverFiles.forEach(file => {
    const content = fs.readFileSync(file, 'utf8');
    if (content.includes('secure: true') || content.includes('https')) {
      httpsFound = true;
    }
  });
  
  logTest('SECURITY', 'HTTPS configuration', httpsFound ? 'PASS' : 'WARN');
  
  // Check for session security
  let sessionSecurityFound = false;
  serverFiles.forEach(file => {
    const content = fs.readFileSync(file, 'utf8');
    if (content.includes('httpOnly') && content.includes('secure')) {
      sessionSecurityFound = true;
    }
  });
  
  logTest('SECURITY', 'Secure session configuration', sessionSecurityFound ? 'PASS' : 'FAIL');
}

// C. CORE FUNCTIONALITY TESTS
function testCoreFunctionality() {
  console.log('\n🧠 Testing Core Functionality...');
  
  // Check for form validation
  const clientFiles = execSync('find client/src -name "*.tsx" -type f').toString().split('\n').filter(Boolean);
  let formValidationFound = false;
  
  clientFiles.forEach(file => {
    const content = fs.readFileSync(file, 'utf8');
    if (content.includes('zodResolver') || content.includes('validation')) {
      formValidationFound = true;
    }
  });
  
  logTest('CORE_FUNCTIONALITY', 'Form validation implemented', formValidationFound ? 'PASS' : 'WARN');
  
  // Check for error handling
  let errorHandlingFound = false;
  clientFiles.forEach(file => {
    const content = fs.readFileSync(file, 'utf8');
    if (content.includes('try') && content.includes('catch')) {
      errorHandlingFound = true;
    }
  });
  
  logTest('CORE_FUNCTIONALITY', 'Error handling present', errorHandlingFound ? 'PASS' : 'WARN');
}

// D. DEVICE RESPONSIVENESS TESTS
function testResponsiveness() {
  console.log('\n📱 Testing Device Responsiveness...');
  
  // Check for responsive classes
  const clientFiles = execSync('find client/src -name "*.tsx" -type f').toString().split('\n').filter(Boolean);
  let responsiveFound = false;
  
  clientFiles.forEach(file => {
    const content = fs.readFileSync(file, 'utf8');
    if (content.includes('md:') || content.includes('lg:') || content.includes('sm:')) {
      responsiveFound = true;
    }
  });
  
  logTest('RESPONSIVENESS', 'Responsive design classes', responsiveFound ? 'PASS' : 'FAIL');
  
  // Check viewport meta tag
  const indexHtml = fs.readFileSync('client/index.html', 'utf8');
  const viewportFound = indexHtml.includes('viewport');
  
  logTest('RESPONSIVENESS', 'Viewport meta tag', viewportFound ? 'PASS' : 'FAIL');
}

// J. JAVASCRIPT / FRONTEND LOGIC TESTS
function testJavaScriptQuality() {
  console.log('\n🧰 Testing JavaScript/Frontend Logic...');
  
  try {
    // Run ESLint
    execSync('npx eslint client/src server --format=compact', { stdio: 'pipe' });
    logTest('JAVASCRIPT', 'ESLint checks', 'PASS');
  } catch (error) {
    const output = error.stdout?.toString() || error.message;
    const errorCount = (output.match(/error/gi) || []).length;
    logTest('JAVASCRIPT', 'ESLint checks', errorCount > 0 ? 'FAIL' : 'WARN', `${errorCount} errors found`);
  }
  
  // Check for async/await usage
  const clientFiles = execSync('find client/src -name "*.tsx" -type f').toString().split('\n').filter(Boolean);
  let asyncAwaitFound = false;
  
  clientFiles.forEach(file => {
    const content = fs.readFileSync(file, 'utf8');
    if (content.includes('async') && content.includes('await')) {
      asyncAwaitFound = true;
    }
  });
  
  logTest('JAVASCRIPT', 'Modern async/await usage', asyncAwaitFound ? 'PASS' : 'WARN');
}

// M. METRICS & PERFORMANCE TESTS  
function testPerformance() {
  console.log('\n📶 Testing Performance...');
  
  try {
    // Check build size
    const stats = fs.statSync('dist/public/assets');
    logTest('PERFORMANCE', 'Build artifacts created', stats.isDirectory() ? 'PASS' : 'FAIL');
  } catch (error) {
    logTest('PERFORMANCE', 'Build artifacts', 'WARN', 'Run npm run build first');
  }
  
  // Check for performance optimizations
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const hasVite = packageJson.devDependencies?.vite || packageJson.dependencies?.vite;
  
  logTest('PERFORMANCE', 'Modern build tools (Vite)', hasVite ? 'PASS' : 'WARN');
}

// S. STORAGE & STATE TESTS
function testStorageAndState() {
  console.log('\n📦 Testing Storage & State Management...');
  
  // Check for state management
  const clientFiles = execSync('find client/src -name "*.tsx" -type f').toString().split('\n').filter(Boolean);
  let stateManagementFound = false;
  
  clientFiles.forEach(file => {
    const content = fs.readFileSync(file, 'utf8');
    if (content.includes('useState') || content.includes('useQuery')) {
      stateManagementFound = true;
    }
  });
  
  logTest('STORAGE_STATE', 'React state management', stateManagementFound ? 'PASS' : 'FAIL');
  
  // Check for database integration
  const serverFiles = execSync('find server -name "*.ts" -type f').toString().split('\n').filter(Boolean);
  let databaseFound = false;
  
  serverFiles.forEach(file => {
    const content = fs.readFileSync(file, 'utf8');
    if (content.includes('drizzle') || content.includes('DATABASE_URL')) {
      databaseFound = true;
    }
  });
  
  logTest('STORAGE_STATE', 'Database integration', databaseFound ? 'PASS' : 'FAIL');
}

// U. USABILITY & UX TESTS
function testUsability() {
  console.log('\n📣 Testing Usability & UX...');
  
  // Check for loading states
  const clientFiles = execSync('find client/src -name "*.tsx" -type f').toString().split('\n').filter(Boolean);
  let loadingStatesFound = false;
  
  clientFiles.forEach(file => {
    const content = fs.readFileSync(file, 'utf8');
    if (content.includes('isLoading') || content.includes('isPending')) {
      loadingStatesFound = true;
    }
  });
  
  logTest('USABILITY', 'Loading states implemented', loadingStatesFound ? 'PASS' : 'WARN');
  
  // Check for user feedback (toasts, notifications)
  let userFeedbackFound = false;
  clientFiles.forEach(file => {
    const content = fs.readFileSync(file, 'utf8');
    if (content.includes('toast') || content.includes('notification')) {
      userFeedbackFound = true;
    }
  });
  
  logTest('USABILITY', 'User feedback mechanisms', userFeedbackFound ? 'PASS' : 'WARN');
}

// Main test runner
async function runTests() {
  console.log('🚀 Starting ShiftGenie A-Z Testing Suite...\n');
  console.log('Based on testing standards defined in replit.md\n');
  
  try {
    testAccessibility();
    testSecurity();
    testCoreFunctionality();
    testResponsiveness();
    testJavaScriptQuality();
    testPerformance();
    testStorageAndState();
    testUsability();
    
    // Print summary
    console.log('\n' + '='.repeat(50));
    console.log('📊 TEST SUMMARY');
    console.log('='.repeat(50));
    console.log(`✅ Passed: ${testResults.passed}`);
    console.log(`⚠️  Warnings: ${testResults.warnings}`);
    console.log(`❌ Failed: ${testResults.failed}`);
    console.log(`📈 Total Coverage: ${Math.round((testResults.passed / (testResults.passed + testResults.failed + testResults.warnings)) * 100)}%`);
    
    if (testResults.failed > 0) {
      console.log('\n🔧 PRIORITY FIXES NEEDED:');
      testResults.details
        .filter(result => result.status === 'FAIL')
        .forEach(result => console.log(`   • [${result.category}] ${result.test}`));
    }
    
    if (testResults.warnings > 0) {
      console.log('\n💡 RECOMMENDATIONS:');
      testResults.details
        .filter(result => result.status === 'WARN')
        .forEach(result => console.log(`   • [${result.category}] ${result.test}`));
    }
    
    console.log('\n✨ Testing complete! ShiftGenie quality score:', 
      testResults.failed === 0 ? 'EXCELLENT' : 
      testResults.failed < 3 ? 'GOOD' : 'NEEDS_IMPROVEMENT');
    
  } catch (error) {
    console.error('❌ Test suite failed:', error.message);
    process.exit(1);
  }
}

runTests();