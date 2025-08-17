# Ekub Backend Authentication API Test Suite

This comprehensive test suite validates all authentication endpoints of the Ekub Backend API based on the API documentation and current codebase implementation.

## 🚀 Features

- **Complete Coverage**: Tests all 7 authentication endpoints
- **Positive & Negative Testing**: Validates both success and error scenarios
- **Security Testing**: Ensures proper authentication and authorization
- **Rate Limiting**: Tests API rate limiting functionality
- **Data Validation**: Tests input validation and error handling
- **Real-time Results**: Clear pass/fail indicators with detailed logging

## 📋 Test Coverage

### 1. User Sign Up (`POST /api/mobile/auth/signup`)
- ✅ Valid user registration
- ✅ Duplicate phone number prevention
- ✅ Password mismatch validation
- ✅ Invalid phone number format validation
- ✅ Email uniqueness validation

### 2. User Sign In (`POST /api/mobile/auth/signin`)
- ✅ Valid user authentication
- ✅ Invalid password prevention
- ✅ Non-existent user handling
- ✅ Account status validation

### 3. Token Refresh (`POST /api/mobile/auth/refresh-token`)
- ✅ Valid token refresh
- ✅ Invalid refresh token prevention
- ✅ Missing refresh token validation

### 4. Forgot Password (`POST /api/mobile/auth/forgot-password`)
- ✅ Valid password reset request
- ✅ Non-existent phone number handling (security)
- ✅ Invalid phone number format validation

### 5. Reset Password (`POST /api/mobile/auth/reset-password`)
- ✅ Valid password reset
- ✅ Password mismatch prevention
- ✅ Non-existent user handling

### 6. Change Password (`PUT /api/mobile/auth/change-password`)
- ✅ Valid password change
- ✅ Wrong current password prevention
- ✅ Password mismatch prevention
- ✅ Missing authorization header prevention

### 7. Sign Out (`POST /api/mobile/auth/signout`)
- ✅ Valid sign out
- ✅ Missing token prevention
- ✅ Invalid token prevention

### 8. Additional Tests
- ✅ Rate limiting validation
- ✅ Protected endpoint access control
- ✅ JWT token validation
- ✅ Error response format validation

## 🛠️ Prerequisites

Before running the tests, ensure you have:

1. **Node.js** (version 18.0.0 or higher)
2. **Ekub Backend Server** running on `http://localhost:3001`
3. **MongoDB** running (via Docker or local installation)
4. **Internet connection** for downloading dependencies

## 📦 Installation

### Option 1: Quick Setup
```bash
# Install test dependencies
npm install axios

# Or use the provided package.json
cp test-package.json package.json
npm install
```

### Option 2: Manual Setup
```bash
# Create package.json
npm init -y

# Install axios for HTTP requests
npm install axios
```

## 🚀 Running the Tests

### 1. Start Your Backend Server
```bash
# In your Ekub Backend directory
npm run dev
```

### 2. Ensure MongoDB is Running
```bash
# If using Docker (recommended)
docker-compose up -d

# Check container status
docker ps | grep ekub-backend-mongodb
```

### 3. Run the Test Suite
```bash
# Run all tests
node test-auth.js

# Or if you have the package.json
npm test
```

## 📊 Test Output

The test suite provides detailed output including:

- **Test Progress**: Clear indicators for each test phase
- **Success/Failure Status**: ✅ PASSED or ❌ FAILED for each test
- **Response Data**: Full API response details for debugging
- **Error Details**: Comprehensive error information for failed tests
- **Timing**: Start and end timestamps

### Example Output:
```
🚀 Starting Ekub App Backend Authentication API Tests...
📍 Testing against: http://localhost:3001
⏰ Started at: 2024-01-15T10:30:00.000Z

🚀 Testing User Sign Up...
============================================================
🔍 Testing valid user signup
============================================================
✅ User 1 signup successful
✅ PASSED - Valid User Signup

✅ PASSED - Duplicate Phone Number Prevention
✅ PASSED - Password Mismatch Validation
✅ PASSED - Invalid Phone Number Format Validation

🎉 All authentication tests completed!
⏰ Finished at: 2024-01-15T10:35:00.000Z
```

## 🔧 Configuration

### Base URL Configuration
Edit the `BASE_URL` constant in `test-auth.js` if your server runs on a different port:

```javascript
const BASE_URL = 'http://localhost:3001'; // Change as needed
```

### Test Data Customization
Modify the `testUsers` object to use different test data:

```javascript
const testUsers = {
  user1: {
    fullName: 'Your Test User',
    phoneNumber: '+251912345678',
    password: 'YourSecurePassword123!',
    confirmPassword: 'YourSecurePassword123!',
    email: 'your.email@example.com'
  }
  // ... more users
};
```

## 🧪 Individual Test Functions

You can run specific test functions individually:

```javascript
const { testSignUp, testSignIn } = require('./test-auth.js');

// Run only signup tests
await testSignUp();

// Run only signin tests
await testSignIn();
```

## 🔍 Troubleshooting

### Common Issues and Solutions

#### 1. Connection Refused
```
❌ Error: connect ECONNREFUSED 127.0.0.1:3001
```
**Solution**: Ensure your backend server is running on port 3001

#### 2. MongoDB Connection Issues
```
❌ Error: connect ECONNREFUSED 127.0.0.1:27021
```
**Solution**: Start MongoDB Docker containers:
```bash
docker-compose up -d
```

#### 3. Module Not Found
```
❌ Error: Cannot find module 'axios'
```
**Solution**: Install dependencies:
```bash
npm install axios
```

#### 4. Validation Errors
```
❌ Error: validation/required-field
```
**Solution**: Check that your backend validation middleware is properly configured

### Debug Mode
For detailed debugging, you can modify the logging level in the test file:

```javascript
// Enable verbose logging
const DEBUG_MODE = true;

if (DEBUG_MODE) {
  console.log('Request:', JSON.stringify(requestData, null, 2));
  console.log('Response:', JSON.stringify(response.data, null, 2));
}
```

## 📈 Performance Testing

The test suite includes rate limiting tests to validate API performance:

- **Rate Limit Testing**: Sends multiple concurrent requests
- **Response Time Monitoring**: Tracks API response times
- **Load Testing**: Validates system behavior under stress

## 🔒 Security Testing

Security features tested include:

- **JWT Token Validation**: Ensures proper token verification
- **Authentication Middleware**: Tests protected endpoint access
- **Input Validation**: Prevents malicious input
- **Rate Limiting**: Prevents API abuse
- **Error Handling**: Ensures no sensitive information leakage

## 📝 Adding New Tests

To add new test cases:

1. **Create Test Function**:
```javascript
const testNewFeature = async () => {
  console.log('\n🆕 Testing New Feature...');
  
  try {
    // Your test logic here
    logTest('New Feature Test', true);
  } catch (error) {
    logError('New feature test failed', error);
  }
};
```

2. **Add to Main Runner**:
```javascript
const runAllTests = async () => {
  // ... existing tests
  await testNewFeature();
  // ... more tests
};
```

3. **Export Function**:
```javascript
module.exports = {
  // ... existing exports
  testNewFeature
};
```

## 🤝 Contributing

When adding new tests:

- Follow the existing naming conventions
- Include both positive and negative test cases
- Add proper error handling
- Update this README with new test coverage
- Ensure tests are independent and can run in any order

## 📞 Support

If you encounter issues:

1. Check the troubleshooting section above
2. Verify your backend server is running correctly
3. Ensure MongoDB is accessible
4. Check the console output for detailed error messages
5. Review the API documentation for endpoint specifications

## 📄 License

This test suite is part of the Ekub Backend project and follows the same license terms.

---

**Happy Testing! 🎉**
