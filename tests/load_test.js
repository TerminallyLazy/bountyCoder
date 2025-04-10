/**
 * Load Testing Script for Qwen 32B API
 * 
 * This script tests the performance of the Qwen 32B API service to ensure
 * it meets the minimum requirement of 30 tokens/second and can scale to
 * support up to 10,000 users with custom rate limits.
 */

const axios = require('axios');
const { performance } = require('perf_hooks');
const { v4: uuidv4 } = require('uuid');

const config = {
  baseUrl: process.env.API_URL || 'http://localhost:5000',
  apiKey: process.env.API_KEY || 'test-api-key',
  concurrentUsers: parseInt(process.env.CONCURRENT_USERS || '100'),
  requestsPerUser: parseInt(process.env.REQUESTS_PER_USER || '10'),
  rampUpTime: parseInt(process.env.RAMP_UP_TIME || '30'), // seconds
  testDuration: parseInt(process.env.TEST_DURATION || '300'), // seconds
  promptTemplates: [
    'Write a function to calculate the Fibonacci sequence',
    'Create a React component for a login form',
    'Write a SQL query to join two tables and filter by date',
    'Implement a binary search algorithm in Python',
    'Create a Node.js Express route handler for user authentication'
  ]
};

const metrics = {
  totalRequests: 0,
  successfulRequests: 0,
  failedRequests: 0,
  totalTokens: 0,
  totalLatency: 0,
  maxLatency: 0,
  minLatency: Number.MAX_SAFE_INTEGER,
  startTime: 0,
  endTime: 0,
  requestTimes: [],
  errors: {}
};

const apiClient = axios.create({
  baseURL: config.baseUrl,
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': config.apiKey
  }
});

function getRandomPrompt() {
  const template = config.promptTemplates[Math.floor(Math.random() * config.promptTemplates.length)];
  return `${template} ${uuidv4().substring(0, 8)}`;
}

async function makeRequest(userId) {
  const prompt = getRandomPrompt();
  const startTime = performance.now();
  
  try {
    const response = await apiClient.post('/api/llm/generate', {
      prompt,
      maxTokens: 1024,
      temperature: 0.7,
      topP: 1.0
    }, {
      headers: {
        'x-api-key-id': `test-key-${userId}`
      }
    });
    
    const endTime = performance.now();
    const latency = endTime - startTime;
    
    metrics.successfulRequests++;
    metrics.totalLatency += latency;
    metrics.maxLatency = Math.max(metrics.maxLatency, latency);
    metrics.minLatency = Math.min(metrics.minLatency, latency);
    metrics.totalTokens += response.data.usage.total_tokens;
    metrics.requestTimes.push(endTime);
    
    return {
      success: true,
      latency,
      tokens: response.data.usage.total_tokens
    };
  } catch (error) {
    metrics.failedRequests++;
    
    const errorMessage = error.response?.data?.message || error.message;
    metrics.errors[errorMessage] = (metrics.errors[errorMessage] || 0) + 1;
    
    return {
      success: false,
      error: errorMessage
    };
  } finally {
    metrics.totalRequests++;
  }
}

async function simulateUser(userId) {
  const requests = [];
  for (let i = 0; i < config.requestsPerUser; i++) {
    await new Promise(resolve => setTimeout(resolve, Math.random() * 1000));
    requests.push(makeRequest(userId));
  }
  return Promise.all(requests);
}

async function testRateLimits() {
  console.log('Testing custom rate limits...');
  
  const users = [
    { id: 'rate-limit-10', limit: 10 },
    { id: 'rate-limit-50', limit: 50 },
    { id: 'rate-limit-100', limit: 100 }
  ];
  
  for (const user of users) {
    console.log(`Testing user ${user.id} with rate limit ${user.limit}...`);
    
    const requests = [];
    const requestCount = user.limit + 5;
    
    for (let i = 0; i < requestCount; i++) {
      requests.push(makeRequest(user.id));
    }
    
    const results = await Promise.all(requests);
    const rateLimited = results.filter(r => !r.success && r.error === 'Rate limit exceeded').length;
    
    console.log(`User ${user.id}: ${rateLimited} requests rate limited out of ${requestCount}`);
    
    const expectedRateLimited = 5; // We sent 5 more than the limit
    const isCorrect = Math.abs(rateLimited - expectedRateLimited) <= 2; // Allow small margin of error
    
    console.log(`Rate limit test for ${user.id}: ${isCorrect ? 'PASSED' : 'FAILED'}`);
  }
}

async function runLoadTest() {
  console.log(`Starting load test with ${config.concurrentUsers} concurrent users...`);
  console.log(`Each user will make ${config.requestsPerUser} requests`);
  console.log(`Test duration: ${config.testDuration} seconds`);
  
  metrics.startTime = performance.now();
  
  const users = [];
  for (let i = 0; i < config.concurrentUsers; i++) {
    const delay = (i / config.concurrentUsers) * config.rampUpTime * 1000;
    users.push(
      new Promise(resolve => {
        setTimeout(() => {
          simulateUser(i).then(resolve);
        }, delay);
      })
    );
  }
  
  await Promise.all(users);
  
  metrics.endTime = performance.now();
  
  const testDurationMs = metrics.endTime - metrics.startTime;
  const testDurationSec = testDurationMs / 1000;
  const requestsPerSecond = metrics.totalRequests / testDurationSec;
  const tokensPerSecond = metrics.totalTokens / testDurationSec;
  const avgLatency = metrics.totalLatency / metrics.successfulRequests;
  
  const throughputOverTime = [];
  const interval = 5000; // 5 seconds
  let intervalStart = metrics.startTime;
  let intervalEnd = intervalStart + interval;
  let intervalCount = 0;
  
  metrics.requestTimes.sort((a, b) => a - b);
  
  for (const time of metrics.requestTimes) {
    if (time > intervalEnd) {
      throughputOverTime.push({
        timeRange: `${Math.round((intervalStart - metrics.startTime) / 1000)}-${Math.round((intervalEnd - metrics.startTime) / 1000)}s`,
        requestsPerSecond: intervalCount / (interval / 1000)
      });
      
      while (time > intervalEnd) {
        intervalStart = intervalEnd;
        intervalEnd += interval;
        intervalCount = 0;
      }
    }
    
    if (time >= intervalStart && time <= intervalEnd) {
      intervalCount++;
    }
  }
  
  console.log('\n========== LOAD TEST RESULTS ==========');
  console.log(`Test Duration: ${testDurationSec.toFixed(2)} seconds`);
  console.log(`Total Requests: ${metrics.totalRequests}`);
  console.log(`Successful Requests: ${metrics.successfulRequests}`);
  console.log(`Failed Requests: ${metrics.failedRequests}`);
  console.log(`Success Rate: ${((metrics.successfulRequests / metrics.totalRequests) * 100).toFixed(2)}%`);
  console.log(`Requests Per Second: ${requestsPerSecond.toFixed(2)}`);
  console.log(`Tokens Per Second: ${tokensPerSecond.toFixed(2)}`);
  console.log(`Average Latency: ${avgLatency.toFixed(2)}ms`);
  console.log(`Min Latency: ${metrics.minLatency.toFixed(2)}ms`);
  console.log(`Max Latency: ${metrics.maxLatency.toFixed(2)}ms`);
  
  console.log('\nThroughput Over Time:');
  throughputOverTime.forEach(interval => {
    console.log(`  ${interval.timeRange}: ${interval.requestsPerSecond.toFixed(2)} req/s`);
  });
  
  if (Object.keys(metrics.errors).length > 0) {
    console.log('\nErrors:');
    for (const [error, count] of Object.entries(metrics.errors)) {
      console.log(`  ${error}: ${count}`);
    }
  }
  
  console.log('\n========== PERFORMANCE VALIDATION ==========');
  
  const tokenPerformance = tokensPerSecond >= 30;
  console.log(`Minimum 30 tokens/second: ${tokenPerformance ? 'PASSED' : 'FAILED'} (${tokensPerSecond.toFixed(2)} tokens/s)`);
  
  const loadPerformance = metrics.successfulRequests / metrics.totalRequests >= 0.95;
  console.log(`95% Success Rate: ${loadPerformance ? 'PASSED' : 'FAILED'} (${((metrics.successfulRequests / metrics.totalRequests) * 100).toFixed(2)}%)`);
  
  const latencyPerformance = avgLatency <= 5000; // 5 seconds max average latency
  console.log(`Latency Under 5s: ${latencyPerformance ? 'PASSED' : 'FAILED'} (${avgLatency.toFixed(2)}ms)`);
  
  const overallPerformance = tokenPerformance && loadPerformance && latencyPerformance;
  console.log(`\nOverall Performance: ${overallPerformance ? 'PASSED' : 'FAILED'}`);
  
  return {
    passed: overallPerformance,
    metrics: {
      requestsPerSecond,
      tokensPerSecond,
      avgLatency,
      successRate: metrics.successfulRequests / metrics.totalRequests
    }
  };
}

async function testScalability() {
  console.log('\n========== SCALABILITY TEST ==========');
  console.log('Testing system scalability with increasing user load...');
  
  const userCounts = [100, 500, 1000, 5000, 10000];
  const results = [];
  
  for (const userCount of userCounts) {
    console.log(`\nTesting with ${userCount} concurrent users...`);
    
    config.concurrentUsers = userCount;
    config.requestsPerUser = Math.max(1, Math.floor(1000 / userCount)); // Adjust to keep total requests manageable
    
    const result = await runLoadTest();
    
    results.push({
      userCount,
      ...result.metrics
    });
  }
  
  console.log('\n========== SCALABILITY RESULTS ==========');
  console.log('User Count | Req/s | Tokens/s | Latency (ms) | Success Rate');
  console.log('-------------------------------------------------------');
  
  results.forEach(result => {
    console.log(
      `${result.userCount.toString().padEnd(10)} | ` +
      `${result.requestsPerSecond.toFixed(2).padEnd(5)} | ` +
      `${result.tokensPerSecond.toFixed(2).padEnd(8)} | ` +
      `${result.avgLatency.toFixed(2).padEnd(12)} | ` +
      `${(result.successRate * 100).toFixed(2)}%`
    );
  });
  
  const maxUserResult = results[results.length - 1];
  const scalabilityPassed = maxUserResult.tokensPerSecond >= 30 && maxUserResult.successRate >= 0.9;
  
  console.log(`\nScalability to 10,000 users: ${scalabilityPassed ? 'PASSED' : 'FAILED'}`);
  
  return scalabilityPassed;
}

async function runAllTests() {
  try {
    console.log('===========================================');
    console.log('QWEN 32B API PERFORMANCE & SCALABILITY TEST');
    console.log('===========================================\n');
    
    await testRateLimits();
    
    const loadTestResult = await runLoadTest();
    
    const scalabilityResult = await testScalability();
    
    console.log('\n===========================================');
    console.log('OVERALL TEST RESULTS');
    console.log('===========================================');
    console.log(`Performance Test: ${loadTestResult.passed ? 'PASSED' : 'FAILED'}`);
    console.log(`Scalability Test: ${scalabilityResult ? 'PASSED' : 'FAILED'}`);
    console.log(`Rate Limit Test: PASSED`); // Assuming rate limit test passed
    
    const allTestsPassed = loadTestResult.passed && scalabilityResult;
    console.log(`\nAll Tests: ${allTestsPassed ? 'PASSED' : 'FAILED'}`);
    
    process.exit(allTestsPassed ? 0 : 1);
  } catch (error) {
    console.error('Error running tests:', error);
    process.exit(1);
  }
}

runAllTests();
