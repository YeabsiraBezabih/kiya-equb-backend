# 💰 Ekub Payment API Test Suite

A comprehensive test suite for testing all payment endpoints of the Ekub Backend API. This test suite covers authentication, authorization, role-based access control, and all payment-related functionality.

## 📋 Table of Contents

- [Features](#-features)
- [Prerequisites](#-prerequisites)
- [Installation](#-installation)
- [Quick Start](#-quick-start)
- [Test Coverage](#-test-coverage)
- [Usage](#-usage)
- [Test Structure](#-test-structure)
- [Configuration](#-configuration)
- [Troubleshooting](#-troubleshooting)
- [API Reference](#-api-reference)
- [Contributing](#-contributing)

## ✨ Features

- **Complete Coverage**: Tests all 6 payment endpoints
- **Role-Based Testing**: Validates admin, collector, member, and non-member access
- **Security Testing**: JWT validation, authentication, and authorization
- **Error Handling**: Comprehensive negative test scenarios
- **Rate Limiting**: Tests API stability under load
- **Edge Cases**: Robust error handling validation
- **Easy Execution**: Individual or batch test execution
- **Detailed Logging**: Clear pass/fail indicators with debugging info

## 🔧 Prerequisites

Before running the tests, ensure you have:

- **Node.js** (version 14 or higher)
- **Ekub Backend Server** running on `http://localhost:3001`
- **MongoDB** accessible (via Docker or local installation)
- **Active Internet Connection** for downloading dependencies

## 📦 Installation

### 1. Install Dependencies

```bash
# Install axios for HTTP requests
npm install axios

# Or use the provided package.json
npm install
```

### 2. Verify Backend Server

```bash
# In your Ekub Backend directory
npm run dev

# Verify server is running on http://localhost:3001
curl http://localhost:3001/api/mobile/auth/health
```

### 3. Verify MongoDB

```bash
# Start Docker containers if using Docker
docker-compose up -d

# Verify MongoDB is accessible
docker ps | grep mongo
```

## 🚀 Quick Start

### Run All Tests

```bash
# Run complete test suite
node test-payment.js

# Or use npm script
npm test
```

### Run Specific Test Categories

```bash
# Run all payment tests
npm run test:all

# Run specific endpoint tests
npm run test:history
npm run test:process
npm run test:unpaid
npm run test:summary
npm run test:mark-unpaid
npm run test:cancel

# Run system tests
npm run test:rate-limit
npm run test:auth
npm run test:edge-cases
```

### Using Test Runner Directly

```bash
# Run all tests
node run-payment-tests.js all

# Run specific tests
node run-payment-tests.js history
node run-payment-tests.js process
node run-payment-tests.js help
```

## 🧪 Test Coverage

| Endpoint | Method | Tests | Description |
|----------|--------|-------|-------------|
| `/:equbId/payment-history` | GET | 4 | Payment history with pagination |
| `/process-payment` | POST | 5 | Payment processing and validation |
| `/:equbId/unpaid-members` | GET | 3 | Unpaid members list |
| `/:equbId/payment-summary` | GET | 3 | Payment summary and statistics |
| `/:paymentId/mark-unpaid` | PUT | 3 | Mark payment as unpaid |
| `/:paymentId/cancel` | PUT | 2 | Cancel payment |
| **System Tests** | - | 4 | Rate limiting, auth, edge cases |

**Total: 24 comprehensive test cases**

## 📖 Usage

### Basic Test Execution

```bash
# Run complete test suite
node test-payment.js

# Expected output:
# 🚀 Starting Ekub App Backend Payment API Tests...
# 📍 Testing against: http://localhost:3001
# ⏰ Started at: 2024-01-15T10:30:00.000Z
# 
# 🔧 Setting up test data...
# ✅ Admin user created
# ✅ Collector user created
# ✅ Member user created
# ✅ Non-member user created
# ✅ Test equb created
# ✅ Users added to equb
# 
# 💰 Testing Get Payment History...
# ✅ PASSED - Valid Payment History Request
# ✅ PASSED - Payment History with Pagination
# ✅ PASSED - Non-Member Access Prevention
# ✅ PASSED - No Token Access Prevention
# 
# 🎉 All payment tests completed!
```

### Individual Test Execution

```bash
# Test only payment history
node run-payment-tests.js history

# Test only payment processing
node run-payment-tests.js process

# Test only authentication
node run-payment-tests.js auth
```

### Test with Custom Configuration

```javascript
// Modify test-payment.js
const BASE_URL = 'http://your-server:3001'; // Change server URL
const API_BASE = '/api/v2'; // Change API version

// Modify test users
const testUsers = {
  admin: {
    fullName: 'Your Admin User',
    phoneNumber: '+251912345678',
    // ... customize as needed
  }
};
```

## 🏗️ Test Structure

### Test Categories

1. **Payment History Tests** (`testGetPaymentHistory`)
   - Valid requests by equb members
   - Pagination functionality
   - Access control validation

2. **Payment Processing Tests** (`testProcessPayment`)
   - Valid payment processing by different roles
   - Permission validation
   - Input validation

3. **Unpaid Members Tests** (`testGetUnpaidMembers`)
   - Member list retrieval
   - Round filtering
   - Access control

4. **Payment Summary Tests** (`testGetPaymentSummary`)
   - Summary data retrieval
   - Role-based access
   - Data validation

5. **Payment Management Tests** (`testMarkPaymentAsUnpaid`, `testCancelPayment`)
   - Status modification
   - Permission validation
   - Error handling

6. **System Tests** (`testRateLimiting`, `testAuthAndAuthorization`, `testEdgeCases`)
   - Rate limiting behavior
   - Authentication validation
   - Edge case handling

### Test Data Setup

The test suite automatically creates:

- **4 test users** with different roles (admin, collector, member, non-member)
- **1 test equb** for payment operations
- **User role assignments** within the equb
- **Test payments** for validation testing

## ⚙️ Configuration

### Environment Variables

```bash
# Set custom server URL (optional)
export EKUB_SERVER_URL=http://localhost:3001

# Set custom API base path (optional)
export EKUB_API_BASE=/api/mobile
```

### Test Configuration

```javascript
// In test-payment.js
const BASE_URL = process.env.EKUB_SERVER_URL || 'http://localhost:3001';
const API_BASE = process.env.EKUB_API_BASE || '/api/mobile';

// Customize test data
const testUsers = {
  admin: {
    fullName: 'Payment Admin User',
    phoneNumber: '+251912345678',
    password: 'SecurePassword123!',
    // ... customize as needed
  }
};
```

### Rate Limiting Configuration

```javascript
// Current testing mode (very permissive)
const paymentRateLimit = require("express-rate-limit")({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // 1000 requests per 15 minutes
  // ... other options
});
```

## 🚨 Troubleshooting

### Common Issues and Solutions

#### 1. Connection Refused

**Error**: `ECONNREFUSED` or `connect ECONNREFUSED 127.0.0.1:3001`

**Solution**:
```bash
# Check if server is running
ps aux | grep node

# Start the server
cd /path/to/ekub-backend
npm run dev

# Verify port availability
netstat -tulpn | grep :3001
```

#### 2. MongoDB Connection Issues

**Error**: `MongoNetworkError: connect ECONNREFUSED 127.0.0.1:27021`

**Solution**:
```bash
# Start Docker containers
docker-compose up -d

# Check MongoDB status
docker ps | grep mongo

# Verify MongoDB connection
docker exec -it ekub-mongodb mongosh
```

#### 3. Authentication Failures

**Error**: `401 Unauthorized` or JWT validation errors

**Solution**:
```bash
# Check JWT configuration
cat config/default.json | grep jwt

# Verify JWT secrets are set
echo $JWT_SECRET
echo $JWT_REFRESH_SECRET

# Restart server after config changes
npm run dev
```

#### 4. Equb Creation Failures

**Error**: `500 Internal Server Error` during equb creation

**Solution**:
```bash
# Check equb creation endpoint
curl -X POST http://localhost:3001/api/mobile/equb-creation/create

# Verify required fields in test data
# Check MongoDB collections
docker exec -it ekub-mongodb mongosh ekub-app --eval "db.equbs.find()"
```

#### 5. User Role Assignment Issues

**Error**: `403 Forbidden` for role-based operations

**Solution**:
```bash
# Check user roles in database
docker exec -it ekub-mongodb mongosh ekub-app --eval "db.users.find({}, {fullName: 1, role: 1})"

# Verify equb member assignments
docker exec -it ekub-mongodb mongosh ekub-app --eval "db.equbs.find({}, {name: 1, 'members.role': 1})"
```

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

// Use in tests
logDebug('Payment response:', response.data);
```

## 📚 API Reference

### Test Functions

| Function | Description | Parameters |
|----------|-------------|------------|
| `testGetPaymentHistory()` | Tests payment history endpoints | None |
| `testProcessPayment()` | Tests payment processing | None |
| `testGetUnpaidMembers()` | Tests unpaid members retrieval | None |
| `testGetPaymentSummary()` | Tests payment summary | None |
| `testMarkPaymentAsUnpaid()` | Tests mark as unpaid functionality | None |
| `testCancelPayment()` | Tests payment cancellation | None |
| `testRateLimiting()` | Tests rate limiting behavior | None |
| `testAuthAndAuthorization()` | Tests authentication/authorization | None |
| `testEdgeCases()` | Tests edge cases and error handling | None |

### Test Runner Commands

| Command | Description |
|---------|-------------|
| `all` | Run all payment tests |
| `history` | Test payment history endpoints |
| `process` | Test payment processing |
| `unpaid` | Test unpaid members |
| `summary` | Test payment summary |
| `mark-unpaid` | Test mark as unpaid |
| `cancel` | Test payment cancellation |
| `rate-limit` | Test rate limiting |
| `auth` | Test authentication/authorization |
| `edge-cases` | Test edge cases |
| `help` | Show help information |

## 🤝 Contributing

### Adding New Tests

1. **Follow Naming Convention**:
   ```javascript
   const testNewFeature = async () => {
     log('🔧 Testing New Feature...');
     // ... test implementation
   };
   ```

2. **Include Both Positive and Negative Cases**:
   ```javascript
   // Positive test
   try {
     const response = await axios.get(endpoint);
     if (response.status === 200) {
       logTest('Valid Request', 'PASSED');
     }
   } catch (error) {
     logTest('Valid Request', 'FAILED', error.message);
   }

   // Negative test
   try {
     await axios.get(invalidEndpoint);
     logTest('Invalid Request', 'FAILED', 'Should have failed');
   } catch (error) {
     if (error.response?.status === 400) {
       logTest('Invalid Request', 'PASSED', 'Correctly rejected');
     }
   }
   ```

3. **Update Exports**:
   ```javascript
   module.exports = {
     // ... existing exports
     testNewFeature,
     runAllTests: async () => {
       // ... existing tests
       await testNewFeature();
     }
   };
   ```

4. **Update Test Runner**:
   ```javascript
   // In run-payment-tests.js
   case 'new-feature':
     console.log('🔧 Testing new feature...\n');
     await testNewFeature();
     break;
   ```

### Code Style Guidelines

- Use **async/await** for asynchronous operations
- Include **comprehensive error handling**
- Use **descriptive test names** and logging
- Follow **existing code structure** and patterns
- Include **both success and failure scenarios**

## 📞 Support

### Getting Help

1. **Check this README** for common solutions
2. **Review console output** for detailed error messages
3. **Verify server status** and MongoDB connectivity
4. **Check API documentation** for endpoint specifications
5. **Review test logs** for specific failure points

### Useful Commands

```bash
# Check server status
curl http://localhost:3001/health

# Check MongoDB
docker exec -it ekub-mongodb mongosh ekub-app --eval "db.stats()"

# View server logs
tail -f logs/app.log

# Check test dependencies
npm list axios
```

### Common Debugging Steps

1. **Verify Backend Server**: Ensure it's running and accessible
2. **Check MongoDB**: Verify database connectivity and collections
3. **Review Authentication**: Check JWT configuration and secrets
4. **Validate Test Data**: Ensure test users and equbs are created properly
5. **Check Network**: Verify no firewall or proxy issues

## 🎉 Conclusion

This test suite provides comprehensive coverage of your Ekub Payment API with:

- ✅ **100% endpoint coverage**
- ✅ **Role-based access control validation**
- ✅ **Security testing**
- ✅ **Error handling validation**
- ✅ **Easy execution and maintenance**
- ✅ **Detailed logging and debugging**

**Happy Testing! 🚀💰**

---

*For more information, see the main [PAYMENT_TEST_SUMMARY.md](PAYMENT_TEST_SUMMARY.md) document.*
