# 🧪 Ekub Backend Equb Creation API Test Suite

A comprehensive test suite for testing all Equb creation endpoints of the Ekub Backend API. This test suite follows the established pattern from the authentication tests and provides thorough coverage of functionality, security, and error handling.

## 📋 Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Installation](#installation)
4. [Quick Start](#quick-start)
5. [Test Coverage](#test-coverage)
6. [Usage](#usage)
7. [Configuration](#configuration)
8. [Troubleshooting](#troubleshooting)
9. [Extending Tests](#extending-tests)
10. [API Reference](#api-reference)

## 🎯 Overview

The Equb Creation Test Suite covers all three endpoints of your Equb creation API:

- **POST** `/api/mobile/equb-creation/create` - Create new Equb
- **GET** `/api/mobile/equb-creation/my-created` - Get user's created Equbs
- **GET** `/api/mobile/equb-creation/:equbId` - Get Equb creation details

### Key Features

- ✅ **100% endpoint coverage**
- ✅ **File upload testing** (privacy policy)
- ✅ **Authentication & authorization** testing
- ✅ **Input validation** testing
- ✅ **Rate limiting** validation
- ✅ **Error handling** verification
- ✅ **Security testing** (JWT, protected endpoints)
- ✅ **Comprehensive logging** and debugging

## 🔧 Prerequisites

Before running the tests, ensure you have:

- **Node.js** (version 14 or higher)
- **MongoDB** running (via Docker or local installation)
- **Ekub Backend** server running on port 3001
- **Internet connection** for downloading dependencies

### System Requirements

- **OS**: Windows, macOS, or Linux
- **Memory**: At least 512MB available RAM
- **Disk**: At least 100MB free space
- **Network**: Access to localhost:3001

## 📦 Installation

### 1. Install Dependencies

```bash
# Install required packages
npm install axios form-data

# Or use the provided package.json
npm install
```

### 2. Verify Installation

```bash
# Check if dependencies are installed
npm list axios form-data
```

### 3. Verify Backend Server

```bash
# Ensure your backend is running
curl http://localhost:3001/api/mobile/auth/signin
```

## 🚀 Quick Start

### 1. Start Your Backend Server

```bash
# In your Ekub Backend directory
npm run dev
```

### 2. Start MongoDB

```bash
# Using Docker Compose
docker-compose up -d

# Or start MongoDB service directly
mongod --port 27021
```

### 3. Run All Tests

```bash
# Run complete test suite
node test-equb-creation.js

# Or use the test runner
node run-equb-creation-tests.js all
```

### 4. Check Results

The tests will output detailed results showing:

- ✅ **PASSED** tests
- ❌ **FAILED** tests with error details
- 📊 **Progress tracking**
- 🔍 **Debug information**

## 🧪 Test Coverage

### Endpoint Coverage

| Endpoint | Method | Test Cases | Status |
|----------|--------|------------|---------|
| `/create` | POST | 5 tests | ✅ Complete |
| `/my-created` | GET | 3 tests | ✅ Complete |
| `/:equbId` | GET | 4 tests | ✅ Complete |
| **Security Tests** | - | 2 tests | ✅ Complete |

**Total: 14 comprehensive test cases**

### Test Categories

#### 1. **Create Equb Tests**

- Valid equb creation with all fields
- File upload validation (privacy policy)
- Unauthenticated access prevention
- Invalid data validation
- Missing required fields validation
- Invalid file type handling

#### 2. **Get Created Equbs Tests**

- Authenticated access to created equbs list
- Response structure validation
- Created equb retrieval verification
- Unauthenticated access prevention
- Pagination support and structure

#### 3. **Get Equb Details Tests**

- Authenticated access to equb details
- Response structure validation
- Unauthenticated access prevention
- Non-existent equb handling
- Invalid ID format handling

#### 4. **Security Tests**

- Protected endpoint access control
- JWT token validation
- Rate limiting functionality
- Input validation and sanitization

## 📖 Usage

### Running All Tests

```bash
# Method 1: Direct execution
node test-equb-creation.js

# Method 2: Using test runner
node run-equb-creation-tests.js all
```

### Running Specific Test Categories

```bash
# Test only equb creation
node run-equb-creation-tests.js create

# Test only listing created equbs
node run-equb-creation-tests.js list

# Test only getting equb details
node run-equb-creation-tests.js details

# Test rate limiting
node run-equb-creation-tests.js rate-limit

# Test protected endpoints
node run-equb-creation-tests.js protected
```

### Getting Help

```bash
# Show available commands
node run-equb-creation-tests.js help
```

### Using npm Scripts (if package.json is installed)

```bash
# Run all tests
npm run test:all

# Run specific test categories
npm run test:create
npm run test:list
npm run test:details
npm run test:rate-limit
npm run test:protected
```

## ⚙️ Configuration

### Environment Variables

The test suite uses the following default configuration:

```javascript
const BASE_URL = 'http://localhost:3001';
const API_BASE = '/api/mobile/equb-creation';
```

### Customizing Test Data

#### Modify Test Users

```javascript
// In test-equb-creation.js
const testUsers = {
  creator: {
    fullName: 'Your Test Creator',
    phoneNumber: '+251912345678',
    password: 'YourSecurePassword123!',
    confirmPassword: 'YourSecurePassword123!'
  }
  // ... more users
};
```

#### Modify Test Equb Data

```javascript
// In test-equb-creation.js
const testEqubData = {
  valid: {
    name: 'Your Test Equb Name',
    numberOfMembers: 15,
    totalSaving: 75000,
    duration: 'weekly',
    level: 'old',
    startDate: '2024-02-01',
    // ... more fields
  }
};
```

#### Change Server URL

```javascript
// In test-equb-creation.js
const BASE_URL = 'http://your-server:3001'; // Your server URL
```

### Test Configuration

#### Timeout Settings

```javascript
// Add timeout configuration if needed
const axiosConfig = {
  timeout: 10000, // 10 seconds
  headers: {
    'Authorization': `Bearer ${authToken}`
  }
};
```

#### Retry Logic

```javascript
// Add retry logic for flaky tests if needed
const retryRequest = async (requestFn, maxRetries = 3) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await requestFn();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
};
```

## 🚨 Troubleshooting

### Common Issues and Solutions

#### 1. **Connection Refused Error**

```
❌ Error: connect ECONNREFUSED 127.0.0.1:3001
```

**Solution:**
- Ensure your backend server is running: `npm run dev`
- Check if port 3001 is available: `netstat -an | grep 3001`
- Verify firewall settings

#### 2. **MongoDB Connection Issues**

```
❌ Error: MongoDB connection failed
```

**Solution:**
- Start Docker containers: `docker-compose up -d`
- Check MongoDB status: `docker ps | grep mongo`
- Verify connection string in your backend config

#### 3. **Authentication Errors**

```
❌ Error: 401 Unauthorized
```

**Solution:**
- Check if test users exist in database
- Verify JWT secrets are properly set
- Ensure authentication middleware is working

#### 4. **File Upload Issues**

```
❌ Error: File upload failed
```

**Solution:**
- Check if uploads directory exists and is writable
- Verify file size limits in upload middleware
- Ensure proper multipart/form-data handling

#### 5. **Validation Errors**

```
❌ Error: 422 Validation Error
```

**Solution:**
- Check validation middleware configuration
- Verify Joi schema definitions
- Ensure proper error response formats

### Debug Mode

Enable detailed logging by modifying the test files:

```javascript
// Add debug logging
const DEBUG = true;

const logDebug = (message, data) => {
  if (DEBUG) {
    console.log(`🔍 DEBUG: ${message}`, data);
  }
};
```

### Verbose Output

For more detailed test output, modify the logging functions:

```javascript
const logTest = (testName, status, details = '') => {
  const statusIcon = status === 'PASSED' ? '✅' : '❌';
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${statusIcon} ${status} - ${testName}${details ? `: ${details}` : ''}`);
  
  // Add more verbose logging
  if (status === 'FAILED') {
    console.log(`   🔍 Test: ${testName}`);
    console.log(`   📍 Endpoint: ${API_BASE}`);
    console.log(`   ⏰ Time: ${timestamp}`);
  }
};
```

## 🔧 Extending Tests

### Adding New Test Cases

#### 1. **Create New Test Function**

```javascript
const testNewFeature = async () => {
  console.log('\n🚀 Testing New Feature...');
  console.log('============================================================');
  
  try {
    // Your test logic here
    const response = await axios.get(`${BASE_URL}${API_BASE}/new-endpoint`);
    
    if (response.status === 200) {
      logTest('New Feature Test', 'PASSED');
    } else {
      logTest('New Feature Test', 'FAILED', 'Unexpected response');
    }
  } catch (error) {
    logTest('New Feature Test', 'FAILED', error.message);
  }
};
```

#### 2. **Add to Main Test Runner**

```javascript
// In test-equb-creation.js
const runAllTests = async () => {
  // ... existing code ...
  
  await testNewFeature(); // Add your new test
  
  // ... existing code ...
};

// Export the new test
module.exports = {
  // ... existing exports ...
  testNewFeature
};
```

#### 3. **Add to Test Runner Script**

```javascript
// In run-equb-creation-tests.js
case 'new-feature':
  console.log('🎯 Running New Feature tests...');
  await testNewFeature();
  break;
```

### Adding New Test Categories

#### 1. **Performance Testing**

```javascript
const testPerformance = async () => {
  console.log('\n⚡ Testing Performance...');
  
  const startTime = Date.now();
  const response = await axios.get(`${BASE_URL}${API_BASE}/my-created`);
  const endTime = Date.now();
  
  const responseTime = endTime - startTime;
  
  if (responseTime < 1000) { // Less than 1 second
    logTest('Performance Test', 'PASSED', `Response time: ${responseTime}ms`);
  } else {
    logTest('Performance Test', 'FAILED', `Response time: ${responseTime}ms (too slow)`);
  }
};
```

#### 2. **Load Testing**

```javascript
const testLoad = async () => {
  console.log('\n🔥 Testing Load...');
  
  const concurrentRequests = 10;
  const promises = [];
  
  for (let i = 0; i < concurrentRequests; i++) {
    promises.push(
      axios.get(`${BASE_URL}${API_BASE}/my-created`, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      })
    );
  }
  
  try {
    const responses = await Promise.all(promises);
    const successCount = responses.filter(r => r.status === 200).length;
    
    if (successCount === concurrentRequests) {
      logTest('Load Test', 'PASSED', `${successCount}/${concurrentRequests} requests successful`);
    } else {
      logTest('Load Test', 'FAILED', `${successCount}/${concurrentRequests} requests successful`);
    }
  } catch (error) {
    logTest('Load Test', 'FAILED', error.message);
  }
};
```

## 📚 API Reference

### Test Functions

#### `testCreateEqub()`
Tests the equb creation endpoint with various scenarios.

#### `testGetMyCreatedEqubs()`
Tests retrieving the list of user's created equbs.

#### `testGetEqubCreationDetails()`
Tests getting detailed information about a specific equb.

#### `testRateLimiting()`
Tests rate limiting functionality on all endpoints.

#### `testProtectedEndpoints()`
Tests that all endpoints properly require authentication.

### Utility Functions

#### `logTest(testName, status, details)`
Logs test results with consistent formatting.

#### `authenticateUser(userData)`
Authenticates a test user and returns an access token.

#### `createTestFile()`
Creates a temporary test file for file upload testing.

#### `cleanupTestFile(filePath)`
Removes temporary test files.

### Configuration Constants

#### `BASE_URL`
The base URL of your backend server (default: `http://localhost:3001`).

#### `API_BASE`
The base path for equb creation endpoints (default: `/api/mobile/equb-creation`).

#### `testUsers`
Test user data for authentication testing.

#### `testEqubData`
Test equb data for creation testing.

## 🤝 Contributing

### Code Style

- Follow existing naming conventions
- Use descriptive test names
- Include both positive and negative test cases
- Add proper error handling
- Update documentation

### Testing Best Practices

- Keep tests independent and order-agnostic
- Use meaningful test data
- Validate response structures
- Test error conditions
- Clean up test resources

### Pull Request Process

1. Fork the repository
2. Create a feature branch
3. Add your tests
4. Update documentation
5. Submit a pull request

## 📞 Support

### Getting Help

- **Check this README** for common solutions
- **Review the test output** for detailed error messages
- **Check your backend logs** for server-side issues
- **Verify API documentation** for endpoint specifications

### Reporting Issues

When reporting issues, please include:

- **Test command** used
- **Error messages** received
- **Backend server status**
- **MongoDB connection status**
- **Node.js version**: `node --version`
- **Operating system** and version

### Community

- **GitHub Issues**: Report bugs and request features
- **Discussions**: Ask questions and share solutions
- **Documentation**: Contribute to test documentation

## 📄 License

This test suite is licensed under the MIT License. See the LICENSE file for details.

## 🎉 Acknowledgments

- Built following the pattern established in the Ekub Backend authentication tests
- Uses industry-standard testing practices
- Designed for maintainability and extensibility

---

**Happy Testing! 🚀**

For more information about the Ekub Backend API, see the main [API Documentation](API_DOCUMENTATION.md).
