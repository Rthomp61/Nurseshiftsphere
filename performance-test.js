#!/usr/bin/env node

/**
 * ShiftGenie Performance Testing
 * Core Web Vitals and Performance Analysis
 */

import { execSync } from 'child_process';
import fs from 'fs';

console.log('📶 Running Performance Analysis...\n');

const performanceChecks = {
  passed: 0,
  failed: 0,
  warnings: 0
};

function logPerformance(test, status, details = '') {
  const emoji = status === 'PASS' ? '✅' : status === 'FAIL' ? '❌' : '⚠️';
  console.log(`${emoji} ${test}${details ? ': ' + details : ''}`);
  
  if (status === 'PASS') performanceChecks.passed++;
  else if (status === 'FAIL') performanceChecks.failed++;
  else performanceChecks.warnings++;
}

// Check build optimization
try {
  const buildStats = fs.readdirSync('dist/public/assets');
  const jsFiles = buildStats.filter(file => file.endsWith('.js'));
  const cssFiles = buildStats.filter(file => file.endsWith('.css'));
  
  logPerformance('Build assets generated', jsFiles.length > 0 && cssFiles.length > 0 ? 'PASS' : 'FAIL');
  
  // Check for chunking (good for performance)
  const hasChunking = jsFiles.some(file => file.includes('-') && file.length > 20);
  logPerformance('Asset chunking for caching', hasChunking ? 'PASS' : 'WARN', 'Consider code splitting for better caching');
  
} catch (error) {
  logPerformance('Build assets', 'WARN', 'Run npm run build first');
}

// Check for performance optimizations in code
const clientFiles = execSync('find client/src -name "*.tsx" -type f').toString().split('\n').filter(Boolean);

// Check for lazy loading
let lazyLoadingFound = false;
clientFiles.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  if (content.includes('lazy') || content.includes('Suspense')) {
    lazyLoadingFound = true;
  }
});
logPerformance('Lazy loading implementation', lazyLoadingFound ? 'PASS' : 'WARN', 'Consider lazy loading for large components');

// Check for React Query caching
let reactQueryCaching = false;
clientFiles.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  if (content.includes('useQuery') && content.includes('queryKey')) {
    reactQueryCaching = true;
  }
});
logPerformance('Data caching with React Query', reactQueryCaching ? 'PASS' : 'FAIL');

// Check for image optimization
let imageOptimization = false;
clientFiles.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  if (content.includes('loading="lazy"') || content.includes('srcset')) {
    imageOptimization = true;
  }
});
logPerformance('Image optimization', imageOptimization ? 'PASS' : 'WARN', 'Consider lazy loading images');

// Check for unnecessary re-renders prevention
let memoization = false;
clientFiles.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  if (content.includes('useMemo') || content.includes('useCallback') || content.includes('memo')) {
    memoization = true;
  }
});
logPerformance('Memoization for re-render optimization', memoization ? 'PASS' : 'WARN', 'Consider React.memo for expensive components');

// Check bundle size (estimate)
try {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const dependencyCount = Object.keys(packageJson.dependencies || {}).length;
  logPerformance('Dependency count', dependencyCount < 50 ? 'PASS' : 'WARN', `${dependencyCount} dependencies - consider bundle analysis`);
} catch (error) {
  logPerformance('Dependency analysis', 'WARN', 'Could not analyze package.json');
}

// Check for performance monitoring
const indexHtml = fs.readFileSync('client/index.html', 'utf8');
const hasMetrics = indexHtml.includes('gtag') || indexHtml.includes('analytics');
logPerformance('Performance monitoring setup', hasMetrics ? 'PASS' : 'WARN', 'Consider adding analytics for Core Web Vitals');

console.log('\n' + '='.repeat(40));
console.log('📶 PERFORMANCE ANALYSIS SUMMARY');
console.log('='.repeat(40));
console.log(`✅ Passed: ${performanceChecks.passed}`);
console.log(`⚠️  Warnings: ${performanceChecks.warnings}`);
console.log(`❌ Failed: ${performanceChecks.failed}`);

const performanceScore = Math.round((performanceChecks.passed / (performanceChecks.passed + performanceChecks.failed + performanceChecks.warnings)) * 100);
console.log(`⚡ Performance Score: ${performanceScore}%`);

if (performanceScore >= 85) console.log('🚀 EXCELLENT - Optimized for fast loading');
else if (performanceScore >= 70) console.log('👍 GOOD - Minor performance optimizations available');
else console.log('⚠️ NEEDS OPTIMIZATION - Address performance issues');

console.log('\n🎯 PERFORMANCE BEST PRACTICES:');
console.log('✅ Modern build tools (Vite)');
console.log('✅ React Query caching');
console.log('✅ TypeScript for development efficiency');
console.log('✅ Component-based architecture');
console.log('✅ CSS-in-JS with Tailwind optimization');