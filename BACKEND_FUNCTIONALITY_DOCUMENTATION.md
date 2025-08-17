# Backend Functionality Documentation

## Table of Contents
1. [Overview](#overview)
2. [System Architecture](#system-architecture)
3. [API Endpoints](#api-endpoints)
4. [Data Models](#data-models)
5. [Authentication & Authorization](#authentication--authorization)
6. [Validation Schemas](#validation-schemas)
7. [Middleware](#middleware)
8. [Configuration](#configuration)
9. [Database Schema](#database-schema)
10. [Error Handling](#error-handling)
11. [Rate Limiting](#rate-limiting)
12. [File Uploads](#file-uploads)
13. [Testing](#testing)
14. [Deployment](#deployment)
15. [Security Features](#security-features)

## Overview

This is a comprehensive backend system for an Ekub (Equb) application - a traditional Ethiopian savings and credit association system. The backend provides RESTful APIs for user management, equb creation and management, payment processing, notifications, and profile management.

**Key Features:**
- User authentication and authorization
- Equb creation and management
- Payment processing and tracking
- Role-based access control
- Real-time notifications
- File uploads (profile pictures, documents)
- Comprehensive validation and error handling
- Rate limiting and security measures

## System Architecture

### Technology Stack
- **Runtime**: Node.js (v18+)
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Validation**: Joi
- **File Uploads**: Multer
- **Documentation**: Swagger/OpenAPI
- **Logging**: Winston
- **Rate Limiting**: express-rate-limit
- **Security**: Helmet, CORS, bcryptjs

### Project Structure
```
kiya-equb-backend/
├── app.js                          # Main application entry point
├── startup/                        # Application startup modules
│   ├── db.startup.js              # Database connection
│   ├── logger.startup.js           # Logger configuration
│   ├── prod.js                     # Production settings
│   └── routes.startup.js           # Route registration
├── routes/                         # API route definitions
│   ├── auth.route.js               # Authentication routes
│   ├── equb.route.js               # Equb management routes
│   ├── payment.route.js            # Payment processing routes
│   ├── profile.route.js            # User profile routes
│   ├── notification.route.js       # Notification routes
│   ├── user.route.js               # User management routes
│   └── landing.route.js            # Landing page routes
├── controllers/                    # Business logic controllers
├── models/                         # Database models
├── middleware/                     # Custom middleware
├── config/                         # Configuration files
└── uploads/                        # File upload directory
```

## API Endpoints

### Base URL
```
Base URL: http://localhost:3001
API Base: /api/mobile
Documentation: /api/docs
Health Check: /health
```

### 1. Authentication Routes (`/api/mobile/auth`)

#### POST `/signin`
**Purpose**: User sign in with phone number and password

**Request Body**:
```json
{
  "phoneNumber": "+251911234567",
  "password": "Password123"
}
```

**Validation**:
- Phone number must be in international format
- Password must be at least 6 characters with uppercase, lowercase, and number

**Response** (200):
```json
{
  "status": "success",
  "data": {
    "userId": "UABC123DEF",
    "name": "John",
    "phoneNumber": "+251911234567",
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "joinedEqubs": []
  }
}
```

#### POST `/signup`
**Purpose**: Create new user account

**Request Body**:
```json
{
  "fullName": "John Doe",
  "phoneNumber": "+251911234567",
  "password": "Password123",
  "confirmPassword": "Password123",
  "email": "john.doe@example.com",
  "referralId": "REF123"
}
```

**Validation**:
- Full name: letters and spaces only, 2-100 characters
- Phone number: international format
- Password: 6-128 characters with complexity requirements
- Email: valid email format (optional)

#### POST `/refresh-token`
**Purpose**: Refresh expired access token

**Request Body**:
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### POST `/forgot-password`
**Purpose**: Request password reset code

**Request Body**:
```json
{
  "phoneNumber": "+251911234567"
}
```

#### POST `/reset-password`
**Purpose**: Reset password using reset code

**Request Body**:
```json
{
  "phoneNumber": "+251911234567",
  "newPassword": "NewPassword123",
  "confirmPassword": "NewPassword123"
}
```

#### POST `/signout`
**Purpose**: Sign out user and invalidate tokens

**Headers**: `Authorization: Bearer <token>`

#### PUT `/change-password`
**Purpose**: Change password (requires current password)

**Headers**: `Authorization: Bearer <token>`

**Request Body**:
```json
{
  "currentPassword": "CurrentPassword123",
  "newPassword": "NewPassword123",
  "confirmPassword": "NewPassword123"
}
```

### 2. Equb Management Routes (`/api/mobile/equbs`)

#### POST `/create`
**Purpose**: Create new equb with team members

**Headers**: `Authorization: Bearer <token>`

**Request Body** (multipart/form-data):
```json
{
  "name": "Monthly Savings Group",
  "numberOfMembers": 20,
  "totalSaving": 20000,
  "duration": "monthly",
  "level": "new",
  "startDate": "2025-01-01",
  "bankAccountDetail": [
    {
      "bankName": "Commercial Bank of Ethiopia",
      "accountNumber": "1000123456789",
      "accountHolder": "John Doe"
    }
  ],
  "collectorsInfo": [
    {
      "fullName": "Jane Smith",
      "phoneNumber": "+251911234567",
      "formNumber": "2",
      "password": "Password123"
    }
  ],
  "judgesInfo": [...],
  "writersInfo": [...]
}
```

**Validation**:
- Name: 3-100 characters
- Number of members: 5-500
- Total saving: 1000-500000
- Duration: daily/weekly/monthly
- Level: new/old
- Bank accounts: max 5
- Collectors: max 10
- Judges: max 5
- Writers: max 5

#### GET `/discover-equbs`
**Purpose**: Discover available equbs to join

**Headers**: `Authorization: Bearer <token>`

**Query Parameters**:
- `type`: public/private
- `level`: new/old
- `roundDuration`: daily/weekly/monthly
- `page`: page number (default: 1)
- `limit`: items per page (default: 20, max: 100)

#### POST `/join-equb`
**Purpose**: Join an existing equb

**Headers**: `Authorization: Bearer <token>`

**Request Body**:
```json
{
  "equbId": "EABC123DEF",
  "participationType": "full",
  "formNumber": 5
}
```

**Validation**:
- Participation type: full/half/quarter
- Form number: must be unique within equb

#### GET `/my-equbs`
**Purpose**: Get user's joined equbs

**Headers**: `Authorization: Bearer <token>`

#### GET `/:equbId`
**Purpose**: Get detailed information about a specific equb

**Headers**: `Authorization: Bearer <token>`

**Path Parameters**:
- `equbId`: Equb ID (format: E + 9 alphanumeric chars)

#### POST `/:equbId/add-members`
**Purpose**: Add new members to equb (admin only)

**Headers**: `Authorization: Bearer <token>`

**Request Body**:
```json
{
  "members": [
    {
      "phoneNumber": "+251911234567",
      "participationType": "full",
      "formNumber": 6,
      "role": "member"
    }
  ]
}
```

#### DELETE `/:equbId/members/:userId`
**Purpose**: Remove member from equb (admin only)

**Headers**: `Authorization: Bearer <token>`

#### PUT `/:equbId/members/:userId/role`
**Purpose**: Update member role (admin only)

**Headers**: `Authorization: Bearer <token>`

**Request Body**:
```json
{
  "role": "collector"
}
```

**Available Roles**: admin, collector, judge, writer, member

#### GET `/:equbId/get-members`
**Purpose**: Get all members of an equb

**Headers**: `Authorization: Bearer <token>`

#### GET `/:equbId/:memberId`
**Purpose**: Get payment history for specific member

**Headers**: `Authorization: Bearer <token>`

#### GET `/unpaid-members`
**Purpose**: Get unpaid members across all user's equbs

**Headers**: `Authorization: Bearer <token>`

#### GET `/:equbId/get-winners`
**Purpose**: Get round winners for an equb

**Headers**: `Authorization: Bearer <token>`

#### PUT `/update/:equbId`
**Purpose**: Update equb information (admin only)

**Headers**: `Authorization: Bearer <token>`

**Request Body**:
```json
{
  "collectorsInfo": [
    {
      "userId": "UABC123DEF",
      "name": "Jane Smith",
      "phoneNumber": "+251911234567"
    }
  ],
  "judgInfo": [...],
  "writersInfo": [...]
}
```

#### POST `/:equbId/post-round-winner`
**Purpose**: Record round winners (admin only)

**Headers**: `Authorization: Bearer <token>`

**Request Body**:
```json
{
  "formNumbers": [5, 12, 18],
  "participationType": "full"
}
```

**Validation**:
- Form numbers must exist in equb
- Winner count must match participation type rules

#### GET `/:equbId/creation-details`
**Purpose**: Get equb creation details

**Headers**: `Authorization: Bearer <token>`

### 3. Payment Routes (`/api/mobile/payments`)

#### GET `/:equbId/payment-history`
**Purpose**: Get payment history for an equb

**Headers**: `Authorization: Bearer <token>`

**Query Parameters**:
- `userId`: Filter by user ID
- `status`: paid/unpaid/all
- `page`: page number
- `limit`: items per page

#### GET `/:equbId/:userId/payment-history`
**Purpose**: Get payment history for specific user in equb

**Headers**: `Authorization: Bearer <token>`

#### GET `/:equbId/unpaid-members`
**Purpose**: Get unpaid members for specific equb

**Headers**: `Authorization: Bearer <token>`

#### GET `/:equbId/payment-summary`
**Purpose**: Get payment summary for equb

**Headers**: `Authorization: Bearer <token>`

#### POST `/process-payment`
**Purpose**: Process payment (collector/admin only)

**Headers**: `Authorization: Bearer <token>`

**Request Body**:
```json
{
  "equbId": "EABC123DEF",
  "userId": "UABC123DEF",
  "roundNumber": 5,
  "amount": 20000,
  "paymentMethod": "cash",
  "notes": "Monthly payment"
}
```

#### PUT `/:paymentId/mark-unpaid`
**Purpose**: Mark payment as unpaid (collector/admin only)

**Headers**: `Authorization: Bearer <token>`

#### PUT `/:paymentId/cancel`
**Purpose**: Cancel payment (collector/admin only)

**Headers**: `Authorization: Bearer <token>`

### 4. Profile Routes (`/api/mobile/profile`)

#### GET `/`
**Purpose**: Get user profile

**Headers**: `Authorization: Bearer <token>`

#### PUT `/`
**Purpose**: Update user profile

**Headers**: `Authorization: Bearer <token>`

**Request Body**:
```json
{
  "fullName": "John Doe",
  "email": "john.doe@example.com",
  "dateOfBirth": "1990-01-01",
  "gender": "male",
  "address": {
    "city": "Addis Ababa",
    "subCity": "Bole",
    "woreda": "Bole",
    "houseNumber": "123"
  }
}
```

#### POST `/profile-picture`
**Purpose**: Upload profile picture

**Headers**: `Authorization: Bearer <token>`

**Request Body**: `multipart/form-data` with `profilePicture` file

**File Requirements**:
- Max size: 5MB
- Allowed types: JPEG, PNG, GIF

#### DELETE `/profile-picture`
**Purpose**: Delete profile picture

**Headers**: `Authorization: Bearer <token>`

#### GET `/statistics`
**Purpose**: Get user statistics

**Headers**: `Authorization: Bearer <token>`

#### POST `/deactivate`
**Purpose**: Deactivate account

**Headers**: `Authorization: Bearer <token>`

#### POST `/reactivate`
**Purpose**: Reactivate account

**Headers**: `Authorization: Bearer <token>`

### 5. Notification Routes (`/api/mobile/notifications`)

#### GET `/`
**Purpose**: Get user notifications

**Headers**: `Authorization: Bearer <token>`

**Query Parameters**:
- `type`: payment/equb/system/reminder/announcement
- `isRead`: true/false
- `page`: page number
- `limit`: items per page

#### GET `/unread-count`
**Purpose**: Get unread notification count

**Headers**: `Authorization: Bearer <token>`

#### PUT `/:notificationId/read`
**Purpose**: Mark notification as read

**Headers**: `Authorization: Bearer <token>`

#### PUT `/mark-all-read`
**Purpose**: Mark all notifications as read

**Headers**: `Authorization: Bearer <token>`

#### DELETE `/:notificationId`
**Purpose**: Delete specific notification

**Headers**: `Authorization: Bearer <token>`

#### DELETE `/`
**Purpose**: Delete all notifications

**Headers**: `Authorization: Bearer <token>`

#### GET `/settings`
**Purpose**: Get notification settings

**Headers**: `Authorization: Bearer <token>`

#### PUT `/settings`
**Purpose**: Update notification settings

**Headers**: `Authorization: Bearer <token>`

#### POST `/test`
**Purpose**: Send test notification

**Headers**: `Authorization: Bearer <token>`

#### POST `/bulk-actions`
**Purpose**: Perform bulk actions on notifications

**Headers**: `Authorization: Bearer <token>`

### 6. User Routes (`/api/mobile/users`)

#### GET `/:id`
**Purpose**: Get user by ID (public route)

**Path Parameters**:
- `id`: User's MongoDB ObjectId

### 7. Landing Routes

#### GET `/`
**Purpose**: Welcome endpoint

**Response**:
```json
{
  "status": "success",
  "message": "Welcome to Ekub App Backend API",
  "version": "1.0.0",
  "documentation": "/api/docs",
  "health": "/health"
}
```

#### GET `/health`
**Purpose**: Health check endpoint

**Response**:
```json
{
  "status": "success",
  "message": "Ekub App Backend is running",
  "timestamp": "2025-08-17T16:27:58.286Z",
  "environment": "development",
  "version": "1.0.0"
}
```

## Data Models

### 1. User Model

**Schema**:
```javascript
{
  userId: String,           // Format: U + 9 alphanumeric chars
  fullName: String,         // 2-100 chars, letters and spaces only
  phoneNumber: String,      // International format (+251...)
  email: String,            // Optional, valid email format
  password: String,         // Min 6 chars, hashed with bcrypt
  referralId: String,       // Optional referral code
  profilePicture: String,   // File path to profile picture
  dateOfBirth: Date,        // Optional
  gender: String,           // male/female/other
  address: {
    city: String,
    subCity: String,
    woreda: String,
    houseNumber: String
  },
  bankDetails: [{
    bankName: String,
    accountNumber: String,
    accountHolder: String
  }],
  isActive: Boolean,        // Default: true
  isVerified: Boolean,      // Default: false
  verificationCode: String, // For phone/email verification
  verificationCodeExpires: Date,
  lastLoginAt: Date,
  loginAttempts: Number,    // For security
  lockoutUntil: Date,       // Account lockout
  createdAt: Date,
  updatedAt: Date
}
```

**Methods**:
- `generateUserId()`: Generate unique user ID
- `comparePassword(password)`: Compare password with hash
- `hashPassword(password)`: Hash password with bcrypt

### 2. Equb Model

**Schema**:
```javascript
{
  equbId: String,           // Format: E + 9 alphanumeric chars
  name: String,             // 2-100 chars
  description: String,       // Optional, max 500 chars
  type: String,             // public/private
  roundDuration: String,    // daily/weekly/monthly
  saving: Number,           // Amount per member per round
  maxMembers: Number,       // 2-100 members
  startDate: Date,          // When equb starts
  location: String,         // Optional
  createdBy: ObjectId,      // Reference to User
  secretNumber: String,     // 6-digit code for private equbs
  isActive: Boolean,        // Default: true
  currentRound: Number,     // Default: 1
  totalRounds: Number,      // Default: 1
  nextRoundDate: Date,      // When next round starts
  level: String,            // new/old
  bankAccountDetail: [{
    bankName: String,
    accountNumber: String,
    accountHolder: String
  }],
  privacyPolicy: String,    // File path to privacy policy
  members: [{
    userId: ObjectId,       // Reference to User
    name: String,           // Member's name
    participationType: String, // full/half/quarter
    formNumber: Number,     // Unique form number
    role: String,           // admin/collector/judge/writer/member
    joinedDate: Date,
    isActive: Boolean,
    paymentHistory: [{
      roundNumber: Number,
      amount: Number,
      status: String,       // paid/unpaid/pending
      paidDate: Date,
      notes: String
    }]
  }],
  roundWinners: [{
    roundNumber: Number,
    winnerFormNumbers: [Number],
    participationType: String,
    createdAt: Date
  }],
  createdAt: Date,
  updatedAt: Date
}
```

**Methods**:
- `generateEqubId()`: Generate unique equb ID
- `addMember(memberData)`: Add new member
- `removeMember(userId)`: Remove member
- `updateMemberRole(userId, role)`: Update member role
- `getUnpaidMembers(roundNumber)`: Get unpaid members for round

### 3. Payment Model

**Schema**:
```javascript
{
  paymentId: String,        // Format: P + 9 alphanumeric chars
  equbId: ObjectId,        // Reference to Equb
  userId: ObjectId,         // Reference to User
  roundNumber: Number,      // Round number
  amount: Number,           // Payment amount
  status: String,           // paid/unpaid/pending/cancelled
  paymentMethod: String,    // cash/bank/mobile_money
  transactionId: String,    // Optional transaction reference
  notes: String,            // Optional notes
  processedBy: ObjectId,    // Reference to User (collector/admin)
  processedAt: Date,        // When payment was processed
  dueDate: Date,            // When payment is due
  paidDate: Date,           // When payment was made
  receiptNumber: String,    // Optional receipt number
  bankReference: String,    // Bank transaction reference
  mobileMoneyReference: String, // Mobile money reference
  isLate: Boolean,          // Default: false
  lateFee: Number,          // Default: 0
  totalAmount: Number,      // amount + lateFee
  createdAt: Date,
  updatedAt: Date
}
```

**Virtual Fields**:
- `totalAmountWithFees`: Calculated total including late fees
- `statusDisplay`: Human-readable status

**Methods**:
- `generatePaymentId()`: Generate unique payment ID
- `calculateLateFee()`: Calculate late payment fees
- `markAsPaid(processedBy, method, reference)`: Mark payment as paid

### 4. Notification Model

**Schema**:
```javascript
{
  notificationId: String,   // Format: N + 9 alphanumeric chars
  userId: ObjectId,         // Reference to User
  type: String,             // payment/equb/system/reminder/announcement
  title: String,            // Max 100 chars
  message: String,          // Max 500 chars
  equbId: ObjectId,        // Reference to Equb (optional)
  paymentId: ObjectId,      // Reference to Payment (optional)
  isRead: Boolean,          // Default: false
  isPushed: Boolean,        // Default: false
  isEmailed: Boolean,       // Default: false
  isSMS: Boolean,           // Default: false
  priority: String,         // low/medium/high/urgent
  actionUrl: String,        // Optional action URL
  actionData: Mixed,        // Optional action data
  scheduledFor: Date,       // Optional scheduled time
  expiresAt: Date,          // Optional expiration time
  metadata: Mixed,          // Optional additional data
  createdAt: Date,
  updatedAt: Date
}
```

**Virtual Fields**:
- `age`: Human-readable time since creation
- `status`: Read/unread status

**Methods**:
- `generateNotificationId()`: Generate unique notification ID
- `markAsRead()`: Mark notification as read
- `sendPushNotification()`: Send push notification
- `sendEmail()`: Send email notification
- `sendSMS()`: Send SMS notification

## Authentication & Authorization

### JWT Token Structure

**Access Token**:
- Algorithm: HS256
- Expiry: 15 minutes
- Payload: `{ userId, iat, exp }`

**Refresh Token**:
- Algorithm: HS256
- Expiry: 30 days
- Payload: `{ userId, tokenVersion, iat, exp }`

### Role-Based Access Control

**User Roles in Equbs**:
1. **admin**: Full control over equb
2. **collector**: Can process payments and manage members
3. **judge**: Can resolve disputes and make decisions
4. **writer**: Can record minutes and maintain records
5. **member**: Basic member with limited permissions

**Permission Matrix**:
| Action | admin | collector | judge | writer | member |
|--------|-------|-----------|-------|--------|--------|
| Create equb | ✅ | ❌ | ❌ | ❌ | ❌ |
| Add/remove members | ✅ | ✅ | ❌ | ❌ | ❌ |
| Process payments | ✅ | ✅ | ❌ | ❌ | ❌ |
| Update equb info | ✅ | ❌ | ❌ | ❌ | ❌ |
| Post round winners | ✅ | ❌ | ❌ | ❌ | ❌ |
| View all data | ✅ | ✅ | ✅ | ✅ | ✅ |

### Middleware Functions

**`authenticateToken`**:
- Verifies JWT token from Authorization header
- Checks if user exists and is active
- Adds user object to `req.user`

**`isEqubMember`**:
- Checks if user is member of specific equb
- Requires `authenticateToken` to run first

**`isEqubAdmin`**:
- Checks if user is admin of specific equb
- Requires `authenticateToken` to run first

**`isCollectorOrAdmin`**:
- Checks if user is collector or admin
- Used for payment processing routes

## Validation Schemas

### Common Validation Patterns

**Phone Number**: `^\+[1-9]\d{1,14}$`
- International format required
- Example: +251911234567

**Password**: `^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)`
- Minimum 6 characters
- Must contain uppercase, lowercase, and number

**User ID**: `^U[A-Z0-9]{9}$`
- Format: U + 9 alphanumeric characters

**Equb ID**: `^E[A-Z0-9]{9}$`
- Format: E + 9 alphanumeric characters

**Payment ID**: `^P[A-Z0-9]{9}$`
- Format: P + 9 alphanumeric characters

**Notification ID**: `^N[A-Z0-9]{9}$`
- Format: N + 9 alphanumeric characters

### Validation Middleware

**Authentication Validation**:
- `validateSignIn`: Phone + password
- `validateSignUp`: Full name, phone, password, confirm password
- `validateRefreshToken`: Refresh token
- `validateForgotPassword`: Phone number
- `validateResetPassword`: Phone, new password, confirm password
- `validateChangePassword`: Current password, new password, confirm password

**Equb Validation**:
- `validateDiscoverEqubs`: Type, level, duration, pagination
- `validateJoinEqub`: Equb ID, participation type, form number
- `validateAddMember`: Members array with phone, type, form number, role
- `validateUpdateMemberRole`: Role validation
- `validatePostRoundWinner`: Form numbers array, participation type
- `validateUpdateEqub`: Collectors, judges, writers info
- `validateEqubCreation`: All creation fields

**Payment Validation**:
- `validatePaymentHistory`: Equb ID, filters, pagination
- `validateProcessPayment`: Equb ID, user ID, round, amount, method
- `validateUnpaidMembers`: Equb ID, pagination

**Profile Validation**:
- `validateUpdateProfile`: Profile fields with constraints

**Notification Validation**:
- `validateGetNotifications`: Type, read status, pagination

## Middleware

### Authentication Middleware

**`authenticateToken`**:
```javascript
// Verifies JWT token and adds user to req.user
const authenticateToken = async (req, res, next) => {
  // Extract token from Authorization header
  // Verify token with JWT secret
  // Check if user exists and is active
  // Add user to req.user
}
```

**`isEqubMember`**:
```javascript
// Checks if user is member of specific equb
const isEqubMember = async (req, res, next) => {
  // Get equbId from params or body
  // Check if user is in equb.members array
  // Allow or deny access
}
```

**`isEqubAdmin`**:
```javascript
// Checks if user is admin of specific equb
const isEqubAdmin = async (req, res, next) => {
  // Get equbId from params or body
  // Check if user has admin role
  // Allow or deny access
}
```

### Rate Limiting Middleware

**`authRateLimit`**:
- Window: 15 minutes
- Max requests: 100 per IP
- Applied to all authentication routes

**`equbCreationRateLimit`**:
- Window: 1 hour
- Max requests: 5 per user
- Applied to equb creation

**`paymentRateLimit`**:
- Window: 1 minute
- Max requests: 10 per user
- Applied to payment processing

### Error Handling Middleware

**`asyncHandler`**:
```javascript
// Wraps async route handlers to catch errors
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};
```

**`errorHandler`**:
```javascript
// Global error handler
const errorHandler = (err, req, res, next) => {
  // Log error
  // Format error response
  // Send appropriate status code
};
```

### Request Logging Middleware

**`requestLogger`**:
- Logs all incoming requests
- Records method, URL, status, response time
- Stores logs in MongoDB

**`errorLogger`**:
- Logs all errors
- Records error details, stack trace, request info
- Stores logs in MongoDB

### File Upload Middleware

**`upload`** (Multer):
- Configurable storage destination
- File size limits (5MB default)
- File type filtering
- Unique filename generation

## Configuration

### Environment Configuration

**Development** (`config/development.json`):
```json
{
  "server": {
    "port": 3001,
    "host": "localhost"
  },
  "database": {
    "url": "mongodb://localhost:27017/ekub-app-dev"
  },
  "jwt": {
    "secret": "dev-secret-key",
    "refreshSecret": "dev-refresh-key"
  }
}
```

**Production** (`config/production.json`):
```json
{
  "server": {
    "port": 3001,
    "host": "0.0.0.0"
  },
  "database": {
    "url": "mongodb://production-db:27017/ekub-app-prod"
  },
  "jwt": {
    "secret": "process.env.JWT_SECRET",
    "refreshSecret": "process.env.JWT_REFRESH_SECRET"
  }
}
```

### Database Configuration

**Connection Options**:
```javascript
{
  useNewUrlParser: true,
  useUnifiedTopology: true,
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
  bufferMaxEntries: 0
}
```

### Security Configuration

**CORS Settings**:
```javascript
{
  origin: ["http://localhost:3000", "https://yourdomain.com"],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"]
}
```

**Helmet Security**:
- Content Security Policy
- XSS Protection
- No Sniff
- Frame Options
- HSTS

## Database Schema

### Collections

**Users Collection**:
- Indexes: `userId` (unique), `phoneNumber` (unique), `email` (sparse)
- TTL index on `verificationCodeExpires`

**Equbs Collection**:
- Indexes: `equbId` (unique), `createdBy`, `isActive`
- Compound index on `type` + `level` + `roundDuration`

**Payments Collection**:
- Indexes: `paymentId` (unique), `equbId`, `userId`, `status`
- Compound index on `equbId` + `roundNumber` + `status`

**Notifications Collection**:
- Indexes: `notificationId` (unique), `userId`, `type`, `isRead`
- TTL index on `expiresAt` (if set)

### Relationships

**One-to-Many**:
- User → Equbs (as creator)
- User → Payments
- User → Notifications
- Equb → Members (embedded)
- Equb → Payments

**Many-to-Many**:
- Users ↔ Equbs (through members array)

### Data Integrity

**Referential Integrity**:
- Foreign key references validated in middleware
- Cascade updates when users are deactivated
- Soft deletes for important data

**Business Rules**:
- Equb member limits enforced
- Payment amounts must match equb saving amount
- Round numbers must be sequential
- Form numbers must be unique within equb

## Error Handling

### Error Response Format

**Standard Error Response**:
```json
{
  "status": "error",
  "error": {
    "code": "domain/specific-error",
    "message": "Human-readable error message",
    "details": "Additional error details (optional)"
  }
}
```

**Error Codes**:
- `auth/`: Authentication related errors
- `equb/`: Equb management errors
- `payment/`: Payment processing errors
- `validation/`: Input validation errors
- `database/`: Database operation errors
- `file/`: File upload errors

### HTTP Status Codes

**Success Responses**:
- `200`: OK (GET, PUT, DELETE)
- `201`: Created (POST)

**Client Errors**:
- `400`: Bad Request (validation errors)
- `401`: Unauthorized (missing/invalid token)
- `403`: Forbidden (insufficient permissions)
- `404`: Not Found (resource doesn't exist)
- `409`: Conflict (duplicate data)
- `429`: Too Many Requests (rate limit exceeded)

**Server Errors**:
- `500`: Internal Server Error (unexpected errors)

### Error Logging

**Error Details Logged**:
- Error message and stack trace
- Request method, URL, and parameters
- User ID and IP address
- Timestamp and environment
- Request body and headers (sanitized)

## Rate Limiting

### Rate Limit Configuration

**Authentication Routes**:
- Window: 15 minutes
- Max requests: 100 per IP address
- Purpose: Prevent brute force attacks

**Equb Creation**:
- Window: 1 hour
- Max requests: 5 per user
- Purpose: Prevent spam equb creation

**Payment Processing**:
- Window: 1 minute
- Max requests: 10 per user
- Purpose: Prevent payment abuse

**General API**:
- Window: 15 minutes
- Max requests: 100 per IP address
- Purpose: Prevent API abuse

### Rate Limit Headers

**Response Headers**:
- `X-RateLimit-Limit`: Maximum requests per window
- `X-RateLimit-Remaining`: Remaining requests in current window
- `X-RateLimit-Reset`: Time when rate limit resets

**Rate Limit Exceeded Response**:
```json
{
  "status": "error",
  "error": {
    "code": "rate-limit/exceeded",
    "message": "Too many requests from this IP, please try again later.",
    "retryAfter": 900
  }
}
```

## File Uploads

### Supported File Types

**Profile Pictures**:
- Formats: JPEG, PNG, GIF
- Max size: 5MB
- Storage: `uploads/profile-pictures/`

**Privacy Policy Documents**:
- Formats: PDF, DOC, DOCX
- Max size: 10MB
- Storage: `uploads/privacy-policies/`

### File Upload Configuration

**Multer Configuration**:
```javascript
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Dynamic destination based on file type
  },
  filename: (req, file, cb) => {
    // Generate unique filename with timestamp
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  },
  fileFilter: (req, file, cb) => {
    // Validate file type
  }
});
```

**File Validation**:
- File size limits enforced
- File type validation
- Virus scanning (optional)
- Duplicate filename prevention

### File Storage

**Local Storage**:
- Files stored in `uploads/` directory
- Organized by file type and user
- Automatic cleanup of orphaned files

**Cloud Storage** (Future):
- AWS S3 integration
- CDN for public files
- Backup and redundancy

## Testing

### Test Structure

**Test Files**:
- `test-auth.js`: Authentication tests
- `test-equb-management.js`: Equb management tests
- `test-payment.js`: Payment processing tests
- `test-api-endpoints.js`: API endpoint availability tests

**Test Categories**:
- Unit tests for controllers
- Integration tests for routes
- Validation tests for middleware
- Database operation tests

### Test Data

**Test Users**:
- Admin user with full permissions
- Regular user with limited permissions
- Test equb with sample data

**Test Equbs**:
- Public equb for discovery tests
- Private equb for member tests
- Equb with various member roles

### Test Commands

**Run All Tests**:
```bash
npm test
```

**Run Specific Test**:
```bash
npm run test:auth
npm run test:equb
npm run test:payment
```

**Watch Mode**:
```bash
npm run test:watch
```

## Deployment

### Environment Setup

**Required Environment Variables**:
```bash
NODE_ENV=production
PORT=3001
MONGODB_URI=mongodb://production-db:27017/ekub-app
JWT_SECRET=your-super-secret-jwt-key
JWT_REFRESH_SECRET=your-super-secret-refresh-key
TWILIO_ACCOUNT_SID=your-twilio-account-sid
TWILIO_AUTH_TOKEN=your-twilio-auth-token
```

**Optional Environment Variables**:
```bash
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
LOG_LEVEL=info
CORS_ORIGINS=https://yourdomain.com
```

### Docker Deployment

**Dockerfile**:
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3001
CMD ["npm", "start"]
```

**Docker Compose**:
```yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=production
      - MONGODB_URI=mongodb://mongo:27017/ekub-app
    depends_on:
      - mongo
    volumes:
      - ./uploads:/app/uploads
      - ./logs:/app/logs
  
  mongo:
    image: mongo:6.0
    ports:
      - "27017:27017"
    volumes:
      - mongo_data:/data/db

volumes:
  mongo_data:
```

### Production Considerations

**Security**:
- HTTPS/SSL certificates
- Environment variable management
- Database access restrictions
- Firewall configuration

**Performance**:
- Load balancing
- Database indexing
- Caching strategies
- CDN for static files

**Monitoring**:
- Application metrics
- Database performance
- Error tracking
- Uptime monitoring

**Backup**:
- Database backups
- File storage backups
- Configuration backups
- Disaster recovery plan

## Security Features

### Authentication Security

**Password Security**:
- Bcrypt hashing (12 rounds)
- Minimum complexity requirements
- Account lockout after failed attempts
- Password expiration policies

**Token Security**:
- Short-lived access tokens (15 minutes)
- Long-lived refresh tokens (30 days)
- Token rotation on refresh
- Secure token storage

### Data Protection

**Input Validation**:
- Joi schema validation
- SQL injection prevention
- XSS protection
- File upload validation

**Access Control**:
- Role-based permissions
- Resource-level authorization
- API rate limiting
- IP whitelisting (optional)

### Infrastructure Security

**Network Security**:
- HTTPS enforcement
- CORS configuration
- Helmet security headers
- Request size limits

**Database Security**:
- Connection encryption
- User access controls
- Query parameterization
- Audit logging

---

## Implementation Notes

This documentation provides a comprehensive guide to understanding and implementing the Ekub App Backend. The system is designed with:

1. **Modular Architecture**: Clear separation of concerns between routes, controllers, models, and middleware
2. **Security First**: Comprehensive authentication, authorization, and input validation
3. **Scalability**: Database indexing, rate limiting, and efficient query patterns
4. **Maintainability**: Consistent error handling, logging, and code organization
5. **Extensibility**: Easy to add new features and modify existing functionality

To recreate this backend:
1. Set up the Node.js environment and install dependencies
2. Configure MongoDB database and environment variables
3. Implement the models with Mongoose schemas
4. Create the middleware for authentication and validation
5. Implement the controllers with business logic
6. Set up the routes with proper middleware
7. Configure the application startup and error handling
8. Add comprehensive testing and documentation

The system follows RESTful API principles and includes comprehensive Swagger documentation for easy integration with frontend applications.
