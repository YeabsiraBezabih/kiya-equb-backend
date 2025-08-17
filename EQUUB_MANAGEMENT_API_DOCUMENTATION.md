# 🏢 Ekub Backend Equb Management API Documentation

## 📋 Overview
This document provides comprehensive documentation for all Equb management endpoints in the Ekub Backend application. All endpoints are prefixed with `/api/mobile/equbs/`.

**Base URL**: `http://localhost:3001` (Development)  
**API Version**: v1  
**Content-Type**: `application/json`

---

## 🔍 Discover Available Equbs

### `GET /api/mobile/equbs/discover-equbs`

Discovers and filters available Equbs that the authenticated user can join, with pagination support.

#### Headers
```
Authorization: Bearer <access_token>
```

#### Query Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `type` | string | ❌ | `all` | Filter by equb type: `public`, `private`, `all` |
| `roundDuration` | string | ❌ | `all` | Filter by saving frequency: `daily`, `weekly`, `monthly`, `all` |
| `savingAmount` | number | ❌ | - | Filter by maximum saving amount (≤ this value) |
| `page` | number | ❌ | 1 | Page number (1-based) |
| `limit` | number | ❌ | 10 | Number of items per page (max 100) |

#### Success Response (200)

```json
{
  "status": "success",
  "data": {
    "equbs": [
      {
        "equbId": "EEV32QLGR6",
        "name": "Test Family Savings Group",
        "description": "A family-oriented savings group",
        "type": "public",
        "roundDuration": "monthly",
        "saving": 5000,
        "membersNum": 8,
        "maxMembers": 10,
        "startDate": "2024-02-01T00:00:00.000Z",
        "location": "Addis Ababa",
        "createdBy": "Test Creator",
        "isJoined": false
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 25,
      "totalPages": 3,
      "hasNext": true,
      "hasPrev": false
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

**500 - Discovery Failed**
```json
{
  "status": "error",
  "error": {
    "code": "equb/discovery-failed",
    "message": "Failed to discover equbs"
  }
}
```

---

## 🤝 Join Equb

### `POST /api/mobile/equbs/join-equb`

Allows an authenticated user to join an existing Equb group.

#### Headers
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

#### Request Body

| Field | Type | Required | Description | Validation Rules |
|-------|------|----------|-------------|------------------|
| `equbId` | string | ✅ | Equb ID code | Format: E + 9 alphanumeric characters |
| `participationType` | string | ✅ | Participation level | `full` or `half` |
| `formNumber` | number | ✅ | Form number in the group | ≥ 1, must be unique |
| `secretNumber` | string | ❌ | Secret code for private equbs | 6 characters (required for private equbs) |

#### Success Response (200)

```json
{
  "status": "success",
  "message": "Successfully joined the equb",
  "data": {
    "equbId": "EEV32QLGR6",
    "participationType": "full",
    "formNumber": 6
  }
}
```

#### Error Responses

**400 - Already Member**
```json
{
  "status": "error",
  "error": {
    "code": "equb/already-member",
    "message": "You are already a member of this equb"
  }
}
```

**400 - Equb Full**
```json
{
  "status": "error",
  "error": {
    "code": "equb/full",
    "message": "Equb is full"
  }
}
```

**400 - Form Number Taken**
```json
{
  "status": "error",
  "error": {
    "code": "equb/form-number-taken",
    "message": "Form number is already taken"
  }
}
```

**400 - Secret Required**
```json
{
  "status": "error",
  "error": {
    "code": "equb/secret-required",
    "message": "Secret number is required for private equbs"
  }
}
```

**400 - Invalid Secret**
```json
{
  "status": "error",
  "error": {
    "code": "equb/invalid-secret",
    "message": "Invalid secret number"
  }
}
```

**404 - Equb Not Found**
```json
{
  "status": "error",
  "error": {
    "code": "equb/not-found",
    "message": "Equb not found"
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
        "field": "equbId",
        "message": "Equb ID must be in format E followed by 9 alphanumeric characters"
      },
      {
        "field": "participationType",
        "message": "\"participationType\" must be one of [full, half]"
      },
      {
        "field": "formNumber",
        "message": "\"formNumber\" must be greater than or equal to 1"
      }
    ]
  }
}
```

---

## 📋 Get My Equbs

### `POST /api/mobile/equbs/my-equbs`

Retrieves a list of Equbs where the authenticated user is an active member.

#### Headers
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

#### Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `userEkubId` | array | ❌ | Array of specific equb IDs to filter by |

#### Success Response (200)

```json
{
  "status": "success",
  "data": [
    {
      "equbId": "EEV32QLGR6",
      "name": "Test Family Savings Group",
      "participationType": "full",
      "formNumber": 1,
      "role": "admin",
      "saving": 5000,
      "roundDuration": "monthly",
      "nextPaymentDate": "2024-03-01T00:00:00.000Z",
      "paymentStatus": "pending",
      "totalMembers": 10,
      "activeMembers": 8
    }
  ]
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

**404 - User Not Found**
```json
{
  "status": "error",
  "error": {
    "code": "user/not-found",
    "message": "User not found"
  }
}
```

---

## 🔍 Get Equb Details

### `GET /api/mobile/equbs/:equbId`

Retrieves detailed information about a specific Equb, including member details and roles.

#### Headers
```
Authorization: Bearer <access_token>
```

#### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `equbId` | string | ✅ | Equb ID code (e.g., EEV32QLGR6) |

#### Success Response (200)

```json
{
  "status": "success",
  "data": {
    "equbId": "EEV32QLGR6",
    "name": "Test Family Savings Group",
    "description": "A family-oriented savings group",
    "membersNum": 8,
    "maxMembers": 10,
    "saving": 5000,
    "level": "new",
    "type": "public",
    "roundDuration": "monthly",
    "startDate": "2024-02-01T00:00:00.000Z",
    "nextRoundDate": "2024-03-01T00:00:00.000Z",
    "currentRound": 1,
    "totalRounds": 10,
    "bankAccountDetail": [
      {
        "bankName": "Commercial Bank of Ethiopia",
        "accountNumber": "1000123456789",
        "accountHolder": "Test Creator"
      }
    ],
    "collectorsInfo": [
      {
        "userId": "68a1bb602d6d2367512e57bf",
        "name": "Test Collector",
        "phone": "+251912345998"
      }
    ],
    "judgInfo": [
      {
        "userId": "68a1bb602d6d2367512e57bf",
        "name": "Test Judge",
        "phone": "+251912345997"
      }
    ],
    "writersInfo": [
      {
        "userId": "68a1bb602d6d2367512e57bf",
        "name": "Test Writer",
        "phone": "+251912345996"
      }
    ],
    "members": [
      {
        "userId": "68a1bb602d6d2367512e57bf",
        "name": "Test Creator",
        "participationType": "full",
        "formNumber": 1,
        "role": "admin",
        "paymentHistory": []
      }
    ]
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

**403 - Not Member**
```json
{
  "status": "error",
  "error": {
    "code": "equb/not-member",
    "message": "You are not a member of this equb"
  }
}
```

**404 - Equb Not Found**
```json
{
  "status": "error",
  "error": {
    "code": "equb/not-found",
    "message": "Equb not found"
  }
}
```

---

## ➕ Add New Member

### `POST /api/mobile/equbs/:equbId/members`

Allows an admin to add a new member to an existing Equb group.

#### Headers
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

#### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `equbId` | string | ✅ | Equb ID code (e.g., EEV32QLGR6) |

#### Request Body

| Field | Type | Required | Description | Validation Rules |
|-------|------|----------|-------------|------------------|
| `fullName` | string | ✅ | Full name of the new member | 2-100 characters, letters and spaces only |
| `phone` | string | ✅ | Phone number | International format (e.g., +251911234567) |
| `participationType` | string | ✅ | Participation level | `full` or `half` |
| `formNumber` | number | ✅ | Form number in the group | ≥ 1, must be unique |
| `role` | string | ✅ | Member role | `member`, `collector`, `judge`, `writer`, `admin` |
| `secretNumber` | string | ❌ | Secret code for private equbs | 6 characters |
| `paidRounds` | number | ❌ | Number of pre-paid rounds | ≥ 0, default 0 |

#### Success Response (200)

```json
{
  "status": "success",
  "message": "Member added successfully",
  "data": {
    "userId": "U123456789",
    "memberId": "68a1bb602d6d2367512e57bf"
  }
}
```

#### Error Responses

**400 - Equb Full**
```json
{
  "status": "error",
  "error": {
    "code": "equb/full",
    "message": "Equb is full"
  }
}
```

**400 - Form Number Taken**
```json
{
  "status": "error",
  "error": {
    "code": "equb/form-number-taken",
    "message": "Form number is already taken"
  }
}
```

**400 - Phone Already Member**
```json
{
  "status": "error",
  "error": {
    "code": "equb/phone-already-member",
    "message": "User with this phone number is already a member"
  }
}
```

**403 - Insufficient Permissions**
```json
{
  "status": "error",
  "error": {
    "code": "equb/insufficient-permissions",
    "message": "Only admins can add new members"
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
        "field": "fullName",
        "message": "\"fullName\" length must be at least 2 characters long"
      },
      {
        "field": "phone",
        "message": "Phone number must be in international format (e.g., +251911234567)"
      },
      {
        "field": "participationType",
        "message": "\"participationType\" must be one of [full, half]"
      },
      {
        "field": "formNumber",
        "message": "\"formNumber\" must be greater than or equal to 1"
      }
    ]
  }
}
```

---

## ➖ Remove Member

### `DELETE /api/mobile/equbs/:equbId/members/:userId`

Allows an admin to remove a member from an Equb group.

#### Headers
```
Authorization: Bearer <access_token>
```

#### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `equbId` | string | ✅ | Equb ID code (e.g., EEV32QLGR6) |
| `userId` | string | ✅ | MongoDB ObjectId of the user to remove |

#### Success Response (200)

```json
{
  "status": "success",
  "message": "Member removed successfully"
}
```

#### Error Responses

**400 - Cannot Remove Admin**
```json
{
  "status": "error",
  "error": {
    "code": "equb/cannot-remove-admin",
    "message": "Cannot remove admin member"
  }
}
```

**403 - Insufficient Permissions**
```json
{
  "status": "error",
  "error": {
    "code": "equb/insufficient-permissions",
    "message": "Only admins can remove members"
  }
}
```

**404 - Member Not Found**
```json
{
  "status": "error",
  "error": {
    "code": "equb/member-not-found",
    "message": "Member not found"
  }
}
```

---

## 🔄 Update Member Role

### `PUT /api/mobile/equbs/:equbId/members/:userId/role`

Allows an admin to update a member's role within an Equb group.

#### Headers
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

#### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `equbId` | string | ✅ | Equb ID code (e.g., EEV32QLGR6) |
| `userId` | string | ✅ | MongoDB ObjectId of the user to update |

#### Request Body

| Field | Type | Required | Description | Validation Rules |
|-------|------|----------|-------------|------------------|
| `role` | string | ✅ | New role for the member | `member`, `collector`, `judge`, `writer`, `admin` |

#### Success Response (200)

```json
{
  "status": "success",
  "message": "Member role updated successfully"
}
```

#### Error Responses

**400 - Cannot Update Admin**
```json
{
  "status": "error",
  "error": {
    "code": "equb/cannot-update-admin",
    "message": "Cannot update admin member role"
  }
}
```

**403 - Insufficient Permissions**
```json
{
  "status": "error",
  "error": {
    "code": "equb/insufficient-permissions",
    "message": "Only admins can update member roles"
  }
}
```

**404 - Member Not Found**
```json
{
  "status": "error",
  "error": {
    "code": "equb/member-not-found",
    "message": "Member not found"
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
        "field": "role",
        "message": "\"role\" must be one of [member, collector, judge, writer, admin]"
      }
    ]
  }
}
```

---

## 🔒 Authentication Requirements

### Protected Endpoints
All Equb management endpoints require a valid `Authorization` header:
- `GET /api/mobile/equbs/discover-equbs`
- `POST /api/mobile/equbs/join-equb`
- `POST /api/mobile/equbs/my-equbs`
- `GET /api/mobile/equbs/:equbId`
- `POST /api/mobile/equbs/:equbId/members`
- `DELETE /api/mobile/equbs/:equbId/members/:userId`
- `PUT /api/mobile/equbs/:equbId/members/:userId/role`

### Token Format
```
Authorization: Bearer <access_token>
```

### Token Expiration
- **Access Token**: 15 minutes
- **Refresh Token**: 7 days

---

## 📝 Data Validation Rules

### Equb ID Format
- **Pattern**: `E` followed by 9 alphanumeric characters
- **Example**: `EEV32QLGR6`
- **Validation**: Must match regex pattern `/^E[A-Z0-9]{9}$/`

### Phone Number Format
- **Pattern**: International format with country code
- **Example**: `+251911234567`
- **Validation**: Must match regex pattern `/^\+[1-9]\d{1,14}$/`

### Participation Type
- **Allowed Values**: `full`, `half`
- **Description**: 
  - `full`: Member contributes the full saving amount
  - `half`: Member contributes half the saving amount

### Form Number
- **Type**: Number
- **Range**: ≥ 1
- **Uniqueness**: Must be unique within the equb
- **Description**: Sequential number assigned to each member

### Member Roles
- **Allowed Values**: `member`, `collector`, `judge`, `writer`, `admin`
- **Description**:
  - `member`: Regular group member
  - `collector`: Collects payments from members
  - `judge`: Resolves disputes
  - `writer`: Records transactions
  - `admin`: Full administrative access

### Full Name
- **Type**: String
- **Length**: 2-100 characters
- **Pattern**: Letters and spaces only
- **Validation**: Must match regex pattern `/^[a-zA-Z\s]+$/`

---

## 📝 Error Codes Reference

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `auth/no-token` | 401 | Access token is required |
| `auth/invalid-token` | 401 | Invalid or expired token |
| `equb/not-found` | 404 | Equb not found |
| `equb/not-member` | 403 | User is not a member of this equb |
| `equb/already-member` | 400 | User is already a member |
| `equb/full` | 400 | Equb has reached maximum capacity |
| `equb/form-number-taken` | 400 | Form number is already assigned |
| `equb/secret-required` | 400 | Secret number required for private equbs |
| `equb/invalid-secret` | 400 | Invalid secret number provided |
| `equb/insufficient-permissions` | 403 | User lacks required permissions |
| `equb/cannot-remove-admin` | 400 | Cannot remove admin member |
| `equb/cannot-update-admin` | 400 | Cannot update admin member role |
| `equb/phone-already-member` | 400 | Phone number already registered |
| `equb/member-not-found` | 404 | Member not found in equb |
| `validation/error` | 422 | Request validation failed |
| `user/not-found` | 404 | User not found |
| `equb/discovery-failed` | 500 | Failed to discover equbs |
| `equb/join-failed` | 500 | Failed to join equb |
| `equb/get-my-equbs-failed` | 500 | Failed to get user's equbs |
| `equb/get-details-failed` | 500 | Failed to get equb details |
| `equb/add-member-failed` | 500 | Failed to add member |
| `equb/remove-member-failed` | 500 | Failed to remove member |
| `equb/update-role-failed` | 500 | Failed to update member role |

---

## 🧪 Testing

### Running Tests
```bash
# Run all Equb management tests
node test-equb-management.js

# Test specific functionality
# The test suite covers all endpoints comprehensively
```

### Test Coverage
- ✅ Discover available equbs with filters and pagination
- ✅ Join equb with validation and business logic checks
- ✅ Get user's equbs with proper authentication
- ✅ Get detailed equb information
- ✅ Add new members with role-based permissions
- ✅ Remove members with admin-only access
- ✅ Update member roles with proper validation
- ✅ Authentication and authorization checks
- ✅ Data validation and error handling
- ✅ Protected endpoint access control
- ✅ Business logic validation (equb full, form numbers, etc.)

---

## 🔧 Development Notes

### Environment Variables
```bash
MONGODB_URI=mongodb://ekub_user:ekub_password@localhost:27021/ekub-app
JWT_SECRET=your_jwt_secret_here
JWT_REFRESH_SECRET=your_refresh_secret_here
```

### Database Collections
- **Equbs**: Equb group information, members, and configuration
- **Users**: User accounts and authentication data
- **Payments**: Payment history and tracking

### Security Features
- JWT token-based authentication
- Role-based access control (RBAC)
- Input validation and sanitization
- Business logic validation
- Secure member management operations

### Business Logic Rules
- **Member Limits**: Cannot exceed maximum member capacity
- **Form Numbers**: Must be unique within each equb
- **Role Hierarchy**: Admin roles have elevated permissions
- **Private Equbs**: Require secret codes for joining
- **Member Removal**: Cannot remove admin members
- **Role Updates**: Cannot modify admin member roles

---

## 📞 Support

For API support or questions:
- **Repository**: Ekub Backend
- **Environment**: Development
- **Last Updated**: August 17, 2025
- **Version**: 1.0.0

---

*This documentation is automatically generated and updated based on the current API implementation.*
