# 🏗️ Ekub Backend Equb Creation API Documentation

## 📋 Overview
This document provides comprehensive documentation for all Equb creation endpoints in the Ekub Backend application. All endpoints are prefixed with `/api/mobile/equb-creation/`.

**Base URL**: `http://localhost:3001` (Development)  
**API Version**: v1  
**Content-Type**: `application/json` (for data) / `multipart/form-data` (for file uploads)

---

## 🚀 Create New Equb

### `POST /api/mobile/equb-creation/create`

Creates a new Equb (savings group) with the provided information and optional privacy policy document.

#### Headers

```

Authorization: Bearer <access_token>
Content-Type: multipart/form-data
```

#### Request Body (Form Data)

| Field | Type | Required | Description | Validation Rules |
|-------|------|----------|-------------|------------------|
| `name` | string | ✅ | Name of the Equb group | 3-100 characters |
| `numberOfMembers` | number | ✅ | Maximum number of members | 5-100 members |
| `totalSaving` | number | ✅ | Total saving amount per round | ≥ 1000 |
| `duration` | string | ✅ | Saving frequency | `daily`, `weekly`, `monthly` |
| `level` | string | ✅ | Experience level | `old`, `new` |
| `startDate` | string | ✅ | Start date of the Equb | ISO date format |
| `bankAccountDetail` | array | ✅ | Bank account information | Array of bank details |
| `collectorsInfo` | array | ✅ | Collector information | Array of collector details |
| `judgesInfo` | array | ✅ | Judge information | Array of judge details |
| `writersInfo` | array | ✅ | Writer information | Array of writer details |
| `privacyPolicy` | file | ❌ | Privacy policy document | PDF, DOC, DOCX only |

#### Bank Account Detail Structure
```json
{
  "bankName": "Commercial Bank of Ethiopia",
  "accountNumber": "1000123456789",
  "accountHolder": "John Doe"
}
```

#### Collector/Judge/Writer Info Structure
```json
{
  "fullName": "John Doe",
  "phoneNumber": "+251912345678",
  "formNumber": "1"
}
```

#### Success Response (201)

```json
{
  "status": "success",
  "message": "Equb created successfully",
  "data": {
    "equbId": "68a1bbc5bb8745e5e45906a4",
    "equbIdCode": "EEV32QLGR6",
    "name": "Test Family Savings Group",
    "startDate": "2024-02-01T00:00:00.000Z",
    "maxMembers": 10,
    "saving": 5000,
    "roundDuration": "monthly",
    "level": "new",
    "createdBy": "68a1bb602d6d2367512e57bf",
    "createdAt": "2025-08-17T11:23:48.763Z"
  }
}
```

#### Error Responses

**400 - Invalid File Type**
```json
{
  "status": "error",
  "error": {
    "code": "file/invalid-type",
    "message": "Only PDF, DOC, and DOCX files are allowed for privacy policy"
  }
}
```

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

**422 - Validation Error**
```json
{
  "status": "error",
  "error": {
    "code": "validation/error",
    "message": "Validation failed",
    "details": [
      {
        "field": "name",
        "message": "\"name\" length must be at least 3 characters long"
      },
      {
        "field": "numberOfMembers",
        "message": "\"numberOfMembers\" must be greater than or equal to 5"
      },
      {
        "field": "totalSaving",
        "message": "\"totalSaving\" must be greater than or equal to 1000"
      },
      {
        "field": "duration",
        "message": "\"duration\" must be one of [daily, weekly, monthly]"
      },
      {
        "field": "level",
        "message": "\"level\" must be one of [old, new]"
      },
      {
        "field": "startDate",
        "message": "\"startDate\" must be in iso format"
      }
    ]
  }
}
```

**429 - Rate Limit Exceeded**
```json
{
  "status": "error",
  "error": {
    "code": "rate-limit/equb-creation-exceeded",
    "message": "Too many Equb creation requests, please try again later"
  }
}
```

---

## 📋 Get User's Created Equbs

### `GET /api/mobile/equb-creation/my-created`

Retrieves a list of Equbs created by the authenticated user with pagination support.

#### Headers
```
Authorization: Bearer <access_token>
```

#### Query Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `page` | number | ❌ | 1 | Page number (1-based) |
| `limit` | number | ❌ | 10 | Number of items per page |

#### Success Response (200)

```json
{
  "status": "success",
  "message": "Equbs retrieved successfully",
  "data": {
    "equbs": [
      {
        "_id": "68a1bbc5bb8745e5e45906a4",
        "equbId": "EEV32QLGR6",
        "name": "Test Family Savings Group",
        "maxMembers": 10,
        "saving": 5000,
        "roundDuration": "monthly",
        "level": "new",
        "createdAt": "2025-08-17T11:23:48.763Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 15,
      "totalPages": 2
    }
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

---

## 🔍 Get Equb Creation Details

### `GET /api/mobile/equb-creation/:equbId`

Retrieves detailed information about a specific Equb, including member details and roles.

#### Headers
```
Authorization: Bearer <access_token>
```

#### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `equbId` | string | ✅ | MongoDB ObjectId of the Equb |

#### Success Response (200)

```json
{
  "status": "success",
  "message": "Equb details retrieved successfully",
  "data": {
    "equb": {
      "_id": "68a1bbc5bb8745e5e45906a4",
      "equbId": "EEV32QLGR6",
      "name": "Test Family Savings Group",
      "maxMembers": 10,
      "saving": 5000,
      "roundDuration": "monthly",
      "level": "new",
      "startDate": "2024-02-01T00:00:00.000Z",
      "isActive": true,
      "createdAt": "2025-08-17T11:23:48.763Z",
      "createdBy": {
        "_id": "68a1bb602d6d2367512e57bf",
        "fullName": "Test Creator",
        "phoneNumber": "+251912345999",
        "profilePicture": null
      },
      "members": [
        {
          "_id": "68a1bb602d6d2367512e57bf",
          "fullName": "Test Creator",
          "phoneNumber": "+251912345999",
          "role": "admin",
          "joinedDate": "2025-08-17T11:23:48.763Z"
        }
      ],
      "collectors": [
        {
          "_id": "68a1bb602d6d2367512e57bf",
          "fullName": "Test Collector",
          "phoneNumber": "+251912345998",
          "formNumber": "2"
        }
      ],
      "judges": [
        {
          "_id": "68a1bb602d6d2367512e57bf",
          "fullName": "Test Judge",
          "phoneNumber": "+251912345997",
          "formNumber": "3"
        }
      ],
      "writers": [
        {
          "_id": "68a1bb602d6d2367512e57bf",
          "fullName": "Test Writer",
          "phoneNumber": "+251912345996",
          "formNumber": "4"
        }
      ],
      "bankAccounts": [
        {
          "bankName": "Commercial Bank of Ethiopia",
          "accountNumber": "1000123456789",
          "accountHolder": "Test Creator"
        }
      ]
    }
  }
}
```

#### Error Responses

**400 - Invalid ID Format**
```json
{
  "status": "error",
  "error": {
    "code": "equb-creation/invalid-id",
    "message": "Invalid Equb ID format"
  }
}
```

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

**404 - Equb Not Found**
```json
{
  "status": "error",
  "error": {
    "code": "equb-creation/not-found",
    "message": "Ekub not found"
  }
}
```

---

## 🚦 Rate Limiting

The Equb creation endpoints implement rate limiting to prevent abuse:

- **Create Endpoint**: 10 requests per minute per IP
- **Get Endpoints**: No rate limiting (read operations)

#### Rate Limit Exceeded Response (429)
```json
{
  "status": "error",
  "error": {
    "code": "rate-limit/equb-creation-exceeded",
    "message": "Too many Equb creation requests, please try again later"
  }
}
```

---

## 🔒 Authentication Requirements

### Protected Endpoints
All Equb creation endpoints require a valid `Authorization` header:
- `POST /api/mobile/equb-creation/create`
- `GET /api/mobile/equb-creation/my-created`
- `GET /api/mobile/equb-creation/:equbId`

### Token Format
```
Authorization: Bearer <access_token>
```

### Token Expiration
- **Access Token**: 15 minutes
- **Refresh Token**: 7 days

---

## 📝 Data Validation Rules

### Equb Name
- **Required**: Yes
- **Type**: String
- **Length**: 3-100 characters
- **Pattern**: Alphanumeric with spaces

### Number of Members
- **Required**: Yes
- **Type**: Number
- **Range**: 5-100
- **Description**: Maximum number of members allowed in the Equb

### Total Saving
- **Required**: Yes
- **Type**: Number
- **Range**: ≥ 1000
- **Description**: Amount each member contributes per round

### Duration
- **Required**: Yes
- **Type**: String
- **Allowed Values**: `daily`, `weekly`, `monthly`
- **Description**: Frequency of saving rounds

### Level
- **Required**: Yes
- **Type**: String
- **Allowed Values**: `old`, `new`
- **Description**: Experience level of the group

### Start Date
- **Required**: Yes
- **Type**: String (ISO Date)
- **Format**: `YYYY-MM-DDTHH:mm:ss.sssZ`
- **Description**: When the Equb will start operating

### Bank Account Details
- **Required**: Yes
- **Type**: Array
- **Min Items**: 1
- **Structure**: Each item must have `bankName`, `accountNumber`, and `accountHolder`

### Collector/Judge/Writer Info
- **Required**: Yes
- **Type**: Array
- **Min Items**: 1
- **Structure**: Each item must have `fullName`, `phoneNumber`, and `formNumber`

### Privacy Policy File
- **Required**: No
- **Type**: File
- **Allowed Types**: PDF, DOC, DOCX
- **Max Size**: 10MB

---

## 📝 Error Codes Reference

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `auth/no-token` | 401 | Access token is required |
| `auth/invalid-token` | 401 | Invalid or expired token |
| `equb-creation/invalid-id` | 400 | Invalid Equb ID format |
| `equb-creation/not-found` | 404 | Equb not found |
| `validation/error` | 422 | Request validation failed |
| `file/invalid-type` | 400 | Invalid file type uploaded |
| `rate-limit/equb-creation-exceeded` | 429 | Rate limit exceeded |

---

## 🧪 Testing

### Running Tests
```bash
# Run all Equb creation tests
node test-equb-creation.js

# Run specific test categories
node run-equb-creation-tests.js all
node run-equb-creation-tests.js creation
node run-equb-creation-tests.js retrieval
node run-equb-creation-tests.js rate-limiting
```

### Test Coverage
- ✅ Valid Equb creation with all required fields
- ✅ Authentication and authorization checks
- ✅ Data validation and error handling
- ✅ File upload validation
- ✅ Rate limiting behavior
- ✅ Response structure validation
- ✅ Pagination support
- ✅ Error handling for invalid IDs
- ✅ Protected endpoint access control

---

## 🔧 Development Notes

### Environment Variables
```bash
MONGODB_URI=mongodb://ekub_user:ekub_password@localhost:27021/ekub-app
JWT_SECRET=your_jwt_secret_here
JWT_REFRESH_SECRET=your_refresh_secret_here
```

### Database Collections
- **Equbs**: Equb group information and configuration
- **Users**: User accounts and authentication data
- **Files**: Uploaded privacy policy documents

### Security Features
- JWT token-based authentication
- Rate limiting protection
- Input validation and sanitization
- File type validation
- Role-based access control
- Secure file upload handling

### File Upload Configuration
- **Supported Formats**: PDF, DOC, DOCX
- **Max File Size**: 10MB
- **Storage**: Local file system (configurable for cloud storage)
- **Validation**: File type and size validation

---

## 📞 Support

For API support or questions:
- **Repository**: Ekub Backend
- **Environment**: Development
- **Last Updated**: August 17, 2025
- **Version**: 1.0.0

---

*This documentation is automatically generated and updated based on the current API implementation.*
