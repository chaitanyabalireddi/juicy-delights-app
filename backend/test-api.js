#!/usr/bin/env node

/**
 * Simple API Test Script for Juicy Delights Backend
 * Run with: node test-api.js
 */

const http = require('http');
const https = require('https');

const API_BASE = process.env.API_BASE || 'http://localhost:5000/api';

// Test configuration
const tests = [
  {
    name: 'Health Check',
    method: 'GET',
    path: '/health',
    expectedStatus: 200
  },
  {
    name: 'Get Products',
    method: 'GET',
    path: '/products',
    expectedStatus: 200
  },
  {
    name: 'Get Featured Products',
    method: 'GET',
    path: '/products/featured',
    expectedStatus: 200
  },
  {
    name: 'Get Categories',
    method: 'GET',
    path: '/products/categories',
    expectedStatus: 200
  },
  {
    name: 'Get Payment Methods',
    method: 'GET',
    path: '/payments/methods',
    expectedStatus: 200
  }
];

// Helper function to make HTTP requests
function makeRequest(method, path, data = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(API_BASE + path);
    const options = {
      hostname: url.hostname,
      port: url.port || (url.protocol === 'https:' ? 443 : 80),
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Juicy-Delights-Test-Script'
      }
    };

    const client = url.protocol === 'https:' ? https : http;
    const req = client.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: jsonData
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: data
          });
        }
      });
    });

    req.on('error', reject);
    
    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

// Run tests
async function runTests() {
  console.log('🧪 Starting API Tests...\n');
  console.log(`📍 Testing API at: ${API_BASE}\n`);

  let passed = 0;
  let failed = 0;

  for (const test of tests) {
    try {
      console.log(`🔍 Testing: ${test.name}`);
      console.log(`   ${test.method} ${test.path}`);
      
      const response = await makeRequest(test.method, test.path);
      
      if (response.status === test.expectedStatus) {
        console.log(`   ✅ PASSED (${response.status})\n`);
        passed++;
      } else {
        console.log(`   ❌ FAILED (Expected: ${test.expectedStatus}, Got: ${response.status})\n`);
        failed++;
      }
    } catch (error) {
      console.log(`   ❌ ERROR: ${error.message}\n`);
      failed++;
    }
  }

  // Summary
  console.log('📊 Test Summary:');
  console.log(`   ✅ Passed: ${passed}`);
  console.log(`   ❌ Failed: ${failed}`);
  console.log(`   📈 Success Rate: ${Math.round((passed / (passed + failed)) * 100)}%`);

  if (failed === 0) {
    console.log('\n🎉 All tests passed! API is working correctly.');
  } else {
    console.log('\n⚠️  Some tests failed. Please check the API configuration.');
  }
}

// Test user registration and login
async function testAuth() {
  console.log('\n🔐 Testing Authentication...\n');

  try {
    // Test registration
    console.log('📝 Testing user registration...');
    const registerData = {
      name: 'Test User',
      email: 'test@example.com',
      phone: '+919876543210',
      password: 'test123456'
    };

    const registerResponse = await makeRequest('POST', '/auth/register', registerData);
    
    if (registerResponse.status === 201) {
      console.log('   ✅ Registration successful');
    } else {
      console.log('   ⚠️  Registration failed (user might already exist)');
    }

    // Test login
    console.log('🔑 Testing user login...');
    const loginData = {
      email: 'test@example.com',
      password: 'test123456'
    };

    const loginResponse = await makeRequest('POST', '/auth/login', loginData);
    
    if (loginResponse.status === 200) {
      console.log('   ✅ Login successful');
      console.log('   🎫 Token received');
    } else {
      console.log('   ❌ Login failed');
    }

  } catch (error) {
    console.log(`   ❌ Auth test error: ${error.message}`);
  }
}

// Main execution
async function main() {
  try {
    await runTests();
    await testAuth();
  } catch (error) {
    console.error('❌ Test execution failed:', error.message);
    process.exit(1);
  }
}

// Run if this file is executed directly
if (require.main === module) {
  main();
}

module.exports = { runTests, testAuth, makeRequest };
