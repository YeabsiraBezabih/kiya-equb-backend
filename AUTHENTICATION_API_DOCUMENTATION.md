# 🔐 Ekub Backend Authentication API Documentation

## 📋 Overview
This document provides comprehensive documentation for all authentication endpoints in the Ekub Backend application. All endpoints are prefixed with `/api/mobile/auth/`.

**Base URL**: `http://localhost:3001` (Development)  
**API Version**: v1  
**Content-Type**: `application/json`

---

## 🚀 User Registration (Sign Up)

### `POST /api/mobile/auth/signup`

Creates a new user account with the provided information.

#### Request Body
```json
{
  "fullName": "John Doe",
  "phoneNumber": "+251912345678",
  "password": "SecurePassword123!",
  "confirmPassword": "SecurePassword123!",
  "email": "john.doe@example.com"
}
```

#### Field Validation Rules

- **fullName**: Required, string, 2-50 characters
- **phoneNumber**: Required, international format (e.g., +251911234567)
- **password**: Required, 8-128 characters, must contain uppercase, lowercase, number, and special character
- **confirmPassword**: Required, must match password exactly
- **email**: Required, valid email format

#### Success Response (201)

```json
{
  "status": "success",
  "message": "User registered successfully",
  "data": {
    "userId": "64f8a1b2c3d4e5f6a7b8c9d0",
    "fullName": "John Doe",
    "phoneNumber": "+251912345678",
    "email": "john.doe@example.com",
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "createdAt": "2025-08-17T10:00:00.000Z"
  }
}
```

#### Error Responses

**400 - User Already Exists**

```json
{
  "status": "error",
  "error": {
    "code": "auth/user-already-exists",
    "message": "User with this phone number already exists"
  }
}
```

**400 - Password Mismatch**

```json
{
  "status": "error",
  "error": {
    "code": "auth/password-mismatch",
    "message": "Passwords do not match"
  }
}
```

**422 - Validation Error**
```json
{
  "status": "error",
  "error": {
    "code": "validation/error",
    "message": "Validation failed",
    "details": [
      {
        "field": "phoneNumber",
        "message": "Phone number must be in international format (e.g., +251911234567)"
      }
    ]
  }
}
```

---

## 🔐 User Sign In

### `POST /api/mobile/auth/signin`

Authenticates a user and returns access tokens.

#### Request Body
```json
{
  "phoneNumber": "+251912345678",
  "password": "SecurePassword123!"
}
```

#### Success Response (200)
```json
{
  "status": "success",
  "message": "User signed in successfully",
  "data": {
    "userId": "64f8a1b2c3d4e5f6a7b8c9d0",
    "fullName": "John Doe",
    "phoneNumber": "+251912345678",
    "email": "john.doe@example.com",
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "lastLogin": "2025-08-17T10:00:00.000Z"
  }
}
```

#### Error Responses

**401 - Invalid Credentials**

```json
{
  "status": "error",
  "error": {
    "code": "auth/invalid-credentials",
    "message": "Invalid phone number or password"
  }
}
```

---

## 🔄 Token Refresh

### `POST /api/mobile/auth/refresh-token`

Refreshes an expired access token using a valid refresh token.

#### Request Body

```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### Success Response (200)

```json
{
  "status": "success",
  "message": "Token refreshed successfully",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

#### Error Responses

**401 - Invalid Refresh Token**
```json
{
  "status": "error",
  "error": {
    "code": "auth/invalid-refresh-token",
    "message": "Invalid refresh token"
  }
}
```

**422 - Missing Refresh Token**
```json
{
  "status": "error",
  "error": {
    "code": "validation/error",
    "message": "Validation failed",
    "details": [
      {
        "field": "refreshToken",
        "message": "\"refreshToken\" is required"
      }
    ]
  }
}
```

---

## 🔑 Forgot Password

### `POST /api/mobile/auth/forgot-password`

Initiates the password reset process by sending a reset code to the user's phone number.

#### Request Body
```json
{
  "phoneNumber": "+251912345678"
}
```

#### Success Response (200)
```json
{
  "status": "success",
  "message": "Password reset code sent successfully",
  "data": {
    "phoneNumber": "+251912345678",
    "resetCode": "123456",
    "expiresAt": "2025-08-17T10:15:00.000Z"
  }
}
```

#### Error Responses

**422 - Invalid Phone Number Format**
```json
{
  "status": "error",
  "error": {
    "code": "validation/error",
    "message": "Validation failed",
    "details": [
      {
        "field": "phoneNumber",
        "message": "Phone number must be in international format (e.g., +251911234567)"
      }
    ]
  }
}
```

---

## 🔄 Password Reset

### `POST /api/mobile/auth/reset-password`

Resets the user's password using the reset code from forgot password.

#### Request Body
```json
{
  "phoneNumber": "+251912345678",
  "newPassword": "NewSecurePassword123!",
  "confirmPassword": "NewSecurePassword123!"
}
```

#### Success Response (200)
```json
{
  "status": "success",
  "message": "Password reset successfully",
  "data": {
    "phoneNumber": "+251912345678",
    "updatedAt": "2025-08-17T10:00:00.000Z"
  }
}
```

#### Error Responses

**404 - User Not Found**
```json
{
  "status": "error",
  "error": {
    "code": "auth/user-not-found",
    "message": "User not found"
  }
}
```

**422 - Password Mismatch**
```json
{
  "status": "error",
  "error": {
    "code": "validation/error",
    "message": "Validation failed",
    "details": [
      {
        "field": "confirmPassword",
        "message": "Passwords do not match"
      }
    ]
  }
}
```

---

## 🔐 Change Password

### `PUT /api/mobile/auth/change-password`

Changes the user's password (requires authentication).

#### Headers
```
Authorization: Bearer <access_token>
```

#### Request Body
```json
{
  "currentPassword": "CurrentPassword123!",
  "newPassword": "NewPassword123!",
  "confirmPassword": "NewPassword123!"
}
```

#### Success Response (200)
```json
{
  "status": "success",
  "message": "Password changed successfully",
  "data": {
    "updatedAt": "2025-08-17T10:00:00.000Z"
  }
}
```

#### Error Responses

**401 - No Token**
```json
{
  "status": "error",
  "error": {
    "code": "auth/no-token",
    "message": "Access token is required"
  }
}
```

**401 - Invalid Token**
```json
{
  "status": "error",
  "error": {
    "code": "auth/invalid-token",
    "message": "Invalid token"
  }
}
```

**400 - Wrong Current Password**
```json
{
  "status": "error",
  "error": {
    "code": "auth/invalid-current-password",
    "message": "Current password is incorrect"
  }
}
```

**422 - Password Mismatch**
```json
{
  "status": "error",
  "error": {
    "code": "validation/error",
    "message": "Validation failed",
    "details": [
      {
        "field": "confirmPassword",
        "message": "Passwords do not match"
      }
    ]
  }
}
```

---

## 🚪 Sign Out

### `POST /api/mobile/auth/signout`

Signs out the user and invalidates their tokens.

#### Headers
```
Authorization: Bearer <access_token>
```

#### Success Response (200)
```json
{
  "status": "success",
  "message": "User signed out successfully"
}
```

#### Error Responses

**401 - No Token**
```json
{
  "status": "error",
  "error": {
    "code": "auth/no-token",
    "message": "Access token is required"
  }
}
```

**401 - Invalid Token**
```json
{
  "status": "error",
  "error": {
    "code": "auth/invalid-token",
    "message": "Invalid token"
  }
}
```

---

## 🚦 Rate Limiting

The authentication endpoints implement rate limiting to prevent abuse:

- **Sign In**: 1000 requests per minute per IP (testing mode)
- **Sign Up**: 1000 requests per minute per IP (testing mode)
- **Password Reset**: 1000 requests per 15 minutes per IP (testing mode)
- **Other Endpoints**: 1000 requests per 15 minutes per IP (testing mode)

#### Rate Limit Exceeded Response (429)
```json
{
  "status": "error",
  "error": {
    "code": "rate-limit/auth-exceeded",
    "message": "Too many authentication attempts, please try again later"
  }
}
```

---

## 🔒 Authentication Requirements

### Protected Endpoints
The following endpoints require a valid `Authorization` header:
- `PUT /api/mobile/auth/change-password`
- `POST /api/mobile/auth/signout`

### Token Format
```
Authorization: Bearer <access_token>
```

### Token Expiration
- **Access Token**: 10 minutes
- **Refresh Token**: 7 days

---

## 📝 Error Codes Reference

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `auth/user-already-exists` | 400 | User with this phone number already exists |
| `auth/password-mismatch` | 400 | Passwords do not match |
| `auth/invalid-current-password` | 400 | Current password is incorrect |
| `auth/invalid-credentials` | 401 | Invalid phone number or password |
| `auth/no-token` | 401 | Access token is required |
| `auth/invalid-token` | 401 | Invalid or expired token |
| `auth/invalid-refresh-token` | 401 | Invalid refresh token |
| `auth/user-not-found` | 404 | User not found |
| `validation/error` | 422 | Request validation failed |
| `rate-limit/auth-exceeded` | 429 | Rate limit exceeded |

---

## 🧪 Testing

### Running Tests
```bash
# Run all authentication tests
node run-auth-tests.js all

# Run specific test
node run-auth-tests.js signin
node run-auth-tests.js signup
node run-auth-tests.js refresh-token
node run-auth-tests.js forgot-password
node run-auth-tests.js reset-password
node run-auth-tests.js change-password
node run-auth-tests.js signout
node run-auth-tests.js rate-limiting
node run-auth-tests.js protected-endpoints
```

### Test Coverage
- ✅ User registration with validation
- ✅ User sign in with error handling
- ✅ Token refresh functionality
- ✅ Password reset flow
- ✅ Password change with authentication
- ✅ User sign out
- ✅ Rate limiting behavior
- ✅ Protected endpoint access control
- ✅ Input validation and error responses

---

## 🔧 Development Notes

### Environment Variables
```bash
MONGODB_URI=mongodb://ekub_user:ekub_password@localhost:27021/ekub-app
JWT_SECRET=your_jwt_secret_here
JWT_REFRESH_SECRET=your_refresh_secret_here
```

### Database Collections
- **Users**: User accounts and authentication data
- **RefreshTokens**: Stored refresh tokens for validation

### Security Features
- Password hashing with bcrypt
- JWT token-based authentication
- Rate limiting protection
- Input validation and sanitization
- Secure password requirements
- Token expiration and refresh mechanism

---

## 📞 Support

For API support or questions:
- **Repository**: Ekub Backend
- **Environment**: Development
- **Last Updated**: August 17, 2025
- **Version**: 1.0.0

---

*This documentation is automatically generated and updated based on the current API implementation.*
