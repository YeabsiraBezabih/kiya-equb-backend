# 🔐 Authentication API Quick Reference

## 🚀 Quick Start

**Base URL**: `http://localhost:3001`  
**Prefix**: `/api/mobile/auth/`

## 📋 Endpoints Summary

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `POST` | `/signup` | User registration | ❌ |
| `POST` | `/signin` | User authentication | ❌ |
| `POST` | `/refresh-token` | Refresh access token | ❌ |
| `POST` | `/forgot-password` | Initiate password reset | ❌ |
| `POST` | `/reset-password` | Reset password | ❌ |
| `PUT` | `/change-password` | Change password | ✅ |
| `POST` | `/signout` | User sign out | ✅ |

## 🔑 Authentication

### Token Format

```
Authorization: Bearer <access_token>
```

### Protected Endpoints

- `PUT /change-password`
- `POST /signout`

## 📝 Common Request Examples

### User Registration

```bash
curl -X POST http://localhost:3001/api/mobile/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "John Doe",
    "phoneNumber": "+251912345678",
    "password": "SecurePassword123!",
    "confirmPassword": "SecurePassword123!",
    "email": "john.doe@example.com"
  }'
```

### User Sign In

```bash
curl -X POST http://localhost:3001/api/mobile/auth/signin \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "+251912345678",
    "password": "SecurePassword123!"
  }'
```

### Change Password

```bash
curl -X PUT http://localhost:3001/api/mobile/auth/change-password \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "currentPassword": "CurrentPassword123!",
    "newPassword": "NewPassword123!",
    "confirmPassword": "NewPassword123!"
  }'
```

## 🚦 Rate Limits (Testing Mode)

- **Auth Endpoints**: 1000 requests/minute
- **Other Endpoints**: 1000 requests/15 minutes

## 📊 Response Format

### Success Response

```json
{
  "status": "success",
  "message": "Operation completed successfully",
  "data": { ... }
}
```

### Error Response

```json
{
  "status": "error",
  "error": {
    "code": "error_code",
    "message": "Error description"
  }
}
```

## 🧪 Testing

```bash
# Run all tests
node run-auth-tests.js all

# Run specific test
node run-auth-tests.js signin
```

## 🔧 Environment Setup

```bash
# MongoDB (Docker)
docker-compose up -d

# Install dependencies
npm install

# Start server
npm run dev
```

---

*For detailed documentation, see `AUTHENTICATION_API_DOCUMENTATION.md`*
