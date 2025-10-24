/**
 * Test Script for Product Search API
 * Run this to verify the search functionality
 * 
 * Usage:
 *   node scripts/testSearchAPI.js
 */

const axios = require('axios');

const BASE_URL = process.env.BASE_URL || 'http://localhost:5000/api';

// Color codes for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(color, message) {
  console.log(`${color}${message}${colors.reset}`);
}

async function testSearch() {
  log(colors.cyan, '\n🧪 Testing Product Search API\n');
  log(colors.cyan, '================================\n');

  const tests = [
    {
      name: 'Test 1: Basic Search',
      endpoint: '/products/search?q=laptop',
      validate: (data) => {
        return Array.isArray(data.data) && 
               typeof data.total === 'number' &&
               data.query === 'laptop';
      }
    },
    {
      name: 'Test 2: Pagination',
      endpoint: '/products/search?q=phone&page=1&limit=5',
      validate: (data) => {
        return data.limit === 5 && 
               data.page === 1;
      }
    },
    {
      name: 'Test 3: Empty Query',
      endpoint: '/products/search?q=',
      validate: (data) => {
        return data.data.length === 0 && 
               data.total === 0;
      }
    },
    {
      name: 'Test 4: Search Suggestions',
      endpoint: '/products/search/suggestions?q=mac&limit=5',
      validate: (data) => {
        return Array.isArray(data.suggestions);
      }
    },
    {
      name: 'Test 5: Case Insensitive Search',
      endpoint: '/products/search?q=LAPTOP',
      validate: (data) => {
        return data.query === 'LAPTOP';
      }
    }
  ];

  let passed = 0;
  let failed = 0;

  for (const test of tests) {
    try {
      log(colors.blue, `\n📋 ${test.name}`);
      log(colors.yellow, `   Endpoint: ${test.endpoint}`);

      const response = await axios.get(`${BASE_URL}${test.endpoint}`);
      
      if (response.status === 200) {
        if (test.validate(response.data)) {
          log(colors.green, '   ✅ PASSED');
          passed++;
          
          // Log some sample data
          if (response.data.data) {
            log(colors.cyan, `   📊 Results: ${response.data.total || 0} total`);
            if (response.data.data.length > 0) {
              log(colors.cyan, `   📦 First result: ${response.data.data[0].name || 'N/A'}`);
            }
          } else if (response.data.suggestions) {
            log(colors.cyan, `   💡 Suggestions: ${response.data.suggestions.length}`);
          }
        } else {
          log(colors.red, '   ❌ FAILED - Validation error');
          log(colors.red, `   Response: ${JSON.stringify(response.data, null, 2)}`);
          failed++;
        }
      } else {
        log(colors.red, `   ❌ FAILED - Status: ${response.status}`);
        failed++;
      }
    } catch (error) {
      log(colors.red, '   ❌ FAILED - Error');
      log(colors.red, `   ${error.message}`);
      if (error.response) {
        log(colors.red, `   Status: ${error.response.status}`);
        log(colors.red, `   Data: ${JSON.stringify(error.response.data)}`);
      }
      failed++;
    }
  }

  // Summary
  log(colors.cyan, '\n\n================================');
  log(colors.cyan, '📊 Test Summary');
  log(colors.cyan, '================================\n');
  log(colors.green, `✅ Passed: ${passed}/${tests.length}`);
  if (failed > 0) {
    log(colors.red, `❌ Failed: ${failed}/${tests.length}`);
  }
  log(colors.cyan, '\n================================\n');

  if (failed === 0) {
    log(colors.green, '🎉 All tests passed!\n');
    process.exit(0);
  } else {
    log(colors.red, '⚠️  Some tests failed. Check the output above.\n');
    process.exit(1);
  }
}

// Check if server is running
async function checkServer() {
  try {
    await axios.get(BASE_URL.replace('/api', ''));
    log(colors.green, '✅ Server is running\n');
    return true;
  } catch (error) {
    log(colors.red, '❌ Server is not running!');
    log(colors.yellow, '\nPlease start the server first:');
    log(colors.cyan, '   cd TechLight_server');
    log(colors.cyan, '   npm start\n');
    return false;
  }
}

// Main execution
(async () => {
  const serverRunning = await checkServer();
  if (serverRunning) {
    await testSearch();
  } else {
    process.exit(1);
  }
})();
