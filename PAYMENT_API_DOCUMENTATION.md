# 💰 Ekub Backend Payment API Documentation

## 📋 Overview
This document provides comprehensive documentation for all Payment management endpoints in the Ekub Backend application. All endpoints are prefixed with `/api/mobile/payments/`.

**Base URL**: `http://localhost:3001` (Development)  
**API Version**: v1  
**Content-Type**: `application/json`

---

## 📜 Get Payment History

### `GET /api/mobile/payments/:equbId/payment-history`

Retrieves the payment history for a specific Equb, with pagination support. Only equb members can access this endpoint.

#### Headers
```
Authorization: Bearer <access_token>
```

#### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `equbId` | string | ✅ | Equb ID code (e.g., EEV32QLGR6) |

#### Query Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `page` | number | ❌ | 1 | Page number (1-based) |
| `limit` | number | ❌ | 10 | Number of items per page (max 100) |

#### Success Response (200)

```json
{
  "status": "success",
  "data": {
    "payments": [
      {
        "paymentId": "P1U8UF6DIZ",
        "equbId": "EEV32QLGR6",
        "userId": "U8JXRM6FDR",
        "userName": "Payment Member User",
        "roundNumber": 1,
        "amount": 5000,
        "paymentMethod": "cash",
        "status": "paid",
        "notes": "Test payment processed by collector",
        "processedBy": "Payment Collector User",
        "processedAt": "2025-08-17T12:57:03.039Z"
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

## 👤 Get User Payment History

### `GET /api/mobile/payments/:equbId/:userId/payment-history`

Retrieves the payment history for a specific user within an equb, with pagination support. Only equb members can access this endpoint.

#### Headers
```
Authorization: Bearer <access_token>
```

#### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `equbId` | string | ✅ | Equb ID code (e.g., EEV32QLGR6) |
| `userId` | string | ✅ | User ID to get payment history for |

#### Query Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `page` | number | ❌ | 1 | Page number (1-based) |
| `limit` | number | ❌ | 20 | Number of items per page (max 100) |

#### Success Response (200)

```json
{
  "status": "success",
  "data": {
    "user": {
      "userId": "U8JXRM6FDR",
      "userName": "Payment Member User",
      "formNumber": 24,
      "participationType": "full",
      "role": "member",
      "totalPayments": 3,
      "totalPaid": 2,
      "totalUnpaid": 1,
      "totalCancelled": 0,
      "totalAmount": 15000
    },
    "payments": [
      {
        "paymentId": "P1U8UF6DIZ",
        "equbId": "EEV32QLGR6",
        "userId": "U8JXRM6FDR",
        "userName": "Payment Member User",
        "roundNumber": 1,
        "amount": 5000,
        "paymentMethod": "cash",
        "status": "paid",
        "notes": "Test payment processed by collector",
        "processedBy": "Payment Collector User",
        "processedAt": "2025-08-17T12:57:03.039Z",
        "updatedAt": "2025-08-17T12:57:03.039Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 3,
      "totalPages": 1,
      "hasNext": false,
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

**403 - Target User Not Member**
```json
{
  "status": "error",
  "error": {
    "code": "equb/user-not-member",
    "message": "Target user is not a member of this equb"
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

## 💳 Process Payment

### `POST /api/mobile/payments/process-payment`

Allows collectors and admins to process payments for equb members. Only users with collector or admin roles can process payments.

#### Headers
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

#### Request Body

| Field | Type | Required | Description | Validation Rules |
|-------|------|----------|-------------|------------------|
| `equbId` | string | ✅ | Equb ID code | Format: E + 9 alphanumeric characters |
| `userId` | string | ✅ | User ID to process payment for | Valid MongoDB ObjectId |
| `roundNumber` | number | ✅ | Round number for the payment | ≥ 1 |
| `amount` | number | ✅ | Payment amount | > 0 |
| `paymentMethod` | string | ✅ | Method of payment | `cash`, `bank`, `mobile_money` |
| `notes` | string | ❌ | Additional notes | Max 500 characters |
| `role` | string | ✅ | Role of the person processing payment | `collector`, `admin` |

#### Success Response (200)

```json
{
  "status": "success",
  "message": "Payment processed successfully",
  "data": {
    "paymentId": "P1U8UF6DIZ",
    "equbId": "EEV32QLGR6",
    "userId": "U8JXRM6FDR",
    "roundNumber": 1,
    "amount": 5000,
    "paymentMethod": "cash",
    "status": "paid",
    "processedAt": "2025-08-17T12:57:03.039Z"
  }
}
```

#### Error Responses

**400 - Validation Error**
```json
{
  "status": "error",
  "error": {
    "code": "validation/error",
    "message": "Validation failed",
    "details": [
      {
        "field": "role",
        "message": "\"role\" is required"
      },
      {
        "field": "userId",
        "message": "\"userId\" is required"
      },
      {
        "field": "roundNumber",
        "message": "\"roundNumber\" is required"
      },
      {
        "field": "amount",
        "message": "\"amount\" is required"
      }
    ]
  }
}
```

**403 - Insufficient Permissions**
```json
{
  "status": "error",
  "error": {
    "code": "equb/insufficient-permissions",
    "message": "You don't have permission to perform this action"
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

## 📋 Get Unpaid Members

### `GET /api/mobile/payments/:equbId/unpaid-members`

Retrieves a list of members who haven't paid for a specific round. Only equb members can access this endpoint.

#### Headers
```
Authorization: Bearer <access_token>
```

#### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `equbId` | string | ✅ | Equb ID code (e.g., EEV32QLGR6) |

#### Query Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `roundNumber` | number | ❌ | Current round | Specific round number to check |

#### Success Response (200)

```json
{
  "status": "success",
  "data": {
    "unpaidMembers": [
      {
        "userId": "U8JXRM6FDR",
        "userName": "Payment Member User",
        "formNumber": 24,
        "participationType": "full",
        "role": "member",
        "roundNumber": 1,
        "expectedAmount": 5000,
        "lastPaymentDate": null
      }
    ],
    "roundNumber": 1,
    "totalUnpaid": 1,
    "totalMembers": 5
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

## 📊 Get Payment Summary

### `GET /api/mobile/payments/:equbId/payment-summary`

Retrieves a comprehensive payment summary for a specific Equb, including collection rates and round progress. Only equb members can access this endpoint.

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
    "currentRound": 1,
    "nextPaymentDate": "2025-03-01T00:00:00.000Z",
    "totalMembers": 5,
    "activeMembers": 5,
    "inactiveMembers": 0,
    "totalCollected": 10000,
    "totalExpected": 25000,
    "collectionRate": 40,
    "roundProgress": {
      "completed": 2,
      "pending": 3,
      "percentage": 40
    },
    "paymentMethods": {
      "cash": 5000,
      "bank": 5000,
      "mobile_money": 0
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

## ❌ Mark Payment as Unpaid

### `PUT /api/mobile/payments/:paymentId/mark-unpaid`

Allows collectors and admins to mark a previously processed payment as unpaid. Only users with collector or admin roles can perform this action.

#### Headers
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

#### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `paymentId` | string | ✅ | Payment ID to mark as unpaid |

#### Request Body

| Field | Type | Required | Description | Validation Rules |
|-------|------|----------|-------------|------------------|
| `reason` | string | ✅ | Reason for marking as unpaid | 2-500 characters |
| `equbId` | string | ✅ | Equb ID for authorization | Format: E + 9 alphanumeric characters |

#### Success Response (200)

```json
{
  "status": "success",
  "message": "Payment marked as unpaid successfully",
  "data": {
    "paymentId": "P1U8UF6DIZ",
    "status": "unpaid",
    "updatedAt": "2025-08-17T12:57:03.310Z",
    "reason": "Payment verification failed during testing"
  }
}
```

#### Error Responses

**400 - Validation Error**
```json
{
  "status": "error",
  "error": {
    "code": "validation/missing-field",
    "message": "Equb ID is required"
  }
}
```

**403 - Insufficient Permissions**
```json
{
  "status": "error",
  "error": {
    "code": "equb/insufficient-permissions",
    "message": "You don't have permission to perform this action"
  }
}
```

**404 - Payment Not Found**
```json
{
  "status": "error",
  "error": {
    "code": "payment/not-found",
    "message": "Payment not found"
  }
}
```

---

## 🚫 Cancel Payment

### `PUT /api/mobile/payments/:paymentId/cancel`

Allows admins to cancel a previously processed payment. Only users with admin roles can perform this action.

#### Headers
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

#### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `paymentId` | string | ✅ | Payment ID to cancel |

#### Request Body

| Field | Type | Required | Description | Validation Rules |
|-------|------|----------|-------------|------------------|
| `reason` | string | ✅ | Reason for cancellation | 2-500 characters |
| `equbId` | string | ✅ | Equb ID for authorization | Format: E + 9 alphanumeric characters |

#### Success Response (200)

```json
{
  "status": "success",
  "message": "Payment cancelled successfully",
  "data": {
    "paymentId": "P1U8UF6DIZ",
    "status": "cancelled",
    "updatedAt": "2025-08-17T12:57:03.366Z",
    "reason": "Payment cancelled during testing"
  }
}
```

#### Error Responses

**400 - Validation Error**
```json
{
  "status": "error",
  "error": {
    "code": "validation/missing-field",
    "message": "Equb ID is required"
  }
}
```

**403 - Insufficient Permissions**
```json
{
  "status": "error",
  "error": {
    "code": "equb/insufficient-permissions",
    "message": "You don't have permission to perform this action"
  }
}
```

**404 - Payment Not Found**
```json
{
  "status": "error",
  "error": {
    "code": "payment/not-found",
    "message": "Payment not found"
  }
}
```

---

## 🔒 Authentication Requirements

### Protected Endpoints
All Payment management endpoints require a valid `Authorization` header:
- `GET /api/mobile/payments/:equbId/payment-history`
- `GET /api/mobile/payments/:equbId/:userId/payment-history`
- `POST /api/mobile/payments/process-payment`
- `GET /api/mobile/payments/:equbId/unpaid-members`
- `GET /api/mobile/payments/:equbId/payment-summary`
- `PUT /api/mobile/payments/:paymentId/mark-unpaid`
- `PUT /api/mobile/payments/:paymentId/cancel`

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

### Payment ID Format
- **Pattern**: `P` followed by 9 alphanumeric characters
- **Example**: `P1U8UF6DIZ`
- **Validation**: Must match regex pattern `/^P[A-Z0-9]{9}$/`

### User ID Format
- **Pattern**: MongoDB ObjectId
- **Example**: `U8JXRM6FDR`
- **Validation**: Must be a valid MongoDB ObjectId

### Payment Amount
- **Type**: Number
- **Range**: > 0
- **Description**: Payment amount in the equb's currency

### Round Number
- **Type**: Number
- **Range**: ≥ 1
- **Description**: Sequential round number for the equb

### Payment Method
- **Allowed Values**: `cash`, `bank`, `mobile_money`
- **Description**: Method used for the payment transaction

### Payment Status
- **Allowed Values**: `paid`, `unpaid`, `pending`, `cancelled`
- **Description**: Current status of the payment

### Role Requirements
- **Process Payment**: `collector`, `admin`
- **Mark as Unpaid**: `collector`, `admin`
- **Cancel Payment**: `admin` only
- **View Endpoints**: Any equb member

### Notes Field
- **Type**: String
- **Length**: 2-500 characters
- **Required**: No (optional field)
- **Description**: Additional information about the payment

---

## 📝 Error Codes Reference

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `auth/no-token` | 401 | Access token is required |
| `auth/invalid-token` | 401 | Invalid or expired token |
| `equb/not-found` | 404 | Equb not found |
| `equb/not-member` | 403 | User is not a member of this equb |
| `equb/user-not-member` | 403 | Target user is not a member of this equb |
| `equb/insufficient-permissions` | 403 | User lacks required permissions |
| `payment/not-found` | 404 | Payment not found |
| `user/not-found` | 404 | User not found |
| `validation/error` | 422 | Request validation failed |
| `validation/missing-field` | 400 | Required field is missing |
| `payment/processing-failed` | 500 | Failed to process payment |
| `payment/update-failed` | 500 | Failed to update payment status |
| `payment/cancellation-failed` | 500 | Failed to cancel payment |
| `payment/user-history-failed` | 500 | Failed to get user payment history |

---

## 🧪 Testing

### Running Tests
```bash
# Run all Payment API tests
node test-payment.js

# Test specific functionality
# The test suite covers all endpoints comprehensively
```

### Test Coverage
- ✅ Get payment history with pagination
- ✅ Process payments with role-based permissions
- ✅ Get unpaid members list with round filtering
- ✅ Get payment summary and statistics
- ✅ Mark payments as unpaid (collector/admin only)
- ✅ Cancel payments (admin only)
- ✅ Authentication and authorization checks
- ✅ Data validation and error handling
- ✅ Protected endpoint access control
- ✅ Business logic validation (roles, permissions, etc.)
- ✅ Rate limiting behavior
- ✅ Edge cases and error handling

---

## 🔧 Development Notes

### Environment Variables
```bash
MONGODB_URI=mongodb://ekub_user:ekub_password@localhost:27021/ekub-app
JWT_SECRET=your_jwt_secret_here
JWT_REFRESH_SECRET=your_refresh_secret_here
```

### Database Collections
- **Equbs**: Equb group information, members, and payment history
- **Users**: User accounts and authentication data
- **Payments**: Payment records and transaction details

### Security Features
- JWT token-based authentication
- Role-based access control (RBAC)
- Input validation and sanitization
- Business logic validation
- Secure payment processing operations

### Business Logic Rules
- **Payment Processing**: Only collectors and admins can process payments
- **Payment Modification**: Only collectors and admins can mark payments as unpaid
- **Payment Cancellation**: Only admins can cancel payments
- **Access Control**: Only equb members can view payment information
- **Status Management**: Payments can be marked as paid, unpaid, pending, or cancelled
- **Round Tracking**: Payments are tracked by round numbers
- **Amount Validation**: Payment amounts must be positive numbers

### Payment Flow
1. **Payment Processing**: Collector/admin processes payment for a member
2. **Status Update**: Payment status is set to 'paid'
3. **History Tracking**: Payment is recorded in equb's payment history
4. **Summary Update**: Payment summary statistics are updated
5. **Modification**: Payments can be marked as unpaid or cancelled if needed

---

## 📞 Support

For API support or questions:
- **Repository**: Ekub Backend
- **Environment**: Development
- **Last Updated**: August 17, 2025
- **Version**: 1.0.0

---

*This documentation is automatically generated and updated based on the current API implementation.*
