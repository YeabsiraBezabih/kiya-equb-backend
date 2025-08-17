# Ekub App Backend

A professional, production-ready backend API for the Ekub (Equb) savings application, built with Node.js, Express, and MongoDB.

## 🚀 Features

- **Complete Authentication System** - JWT-based authentication with refresh tokens
- **Equb Management** - Create, join, and manage savings groups
- **Payment Processing** - Track payments, manage rounds, and handle collections
- **User Profiles** - Comprehensive user management with profile pictures
- **Notification System** - Real-time notifications for users
- **Role-Based Access Control** - Admin, collector, judge, writer, and member roles
- **Security Features** - Rate limiting, input validation, CORS, and helmet security
- **Production Ready** - Comprehensive error handling, logging, and monitoring

## 📋 API Endpoints

### Authentication (`/api/mobile/auth`)
- `POST /signin` - User sign in
- `POST /signup` - User sign up
- `POST /refresh-token` - Refresh access token
- `POST /forgot-password` - Request password reset
- `POST /reset-password` - Reset password
- `POST /signout` - User sign out
- `PUT /change-password` - Change password


### Equbs (`/api/mobile/equbs`)
- `GET /discover-equbs` - Discover available equbs
- `POST /join-equb` - Join an equb
- `POST /my-equbs` - Get user's equbs
- `GET /:equbId` - Get equb details
- `POST /:equbId/members` - Add new member (admin only)
- `DELETE /:equbId/members/:userId` - Remove member (admin only)
- `PUT /:equbId/members/:userId/role` - Update member role (admin only)

### Payments (`/api/mobile/payments`)
- `GET /:equbId/payment-history` - Get payment history
- `POST /process-payment` - Process payment (collector/admin only)
- `GET /:equbId/unpaid-members` - Get unpaid members
- `GET /:equbId/payment-summary` - Get payment summary
- `PUT /:paymentId/mark-unpaid` - Mark payment as unpaid
- `PUT /:paymentId/cancel` - Cancel payment

### Profile (`/api/mobile/profile`)
- `GET /` - Get user profile
- `PUT /` - Update user profile
- `POST /profile-picture` - Upload profile picture
- `DELETE /profile-picture` - Delete profile picture
- `GET /statistics` - Get user statistics
- `POST /deactivate` - Deactivate account
- `POST /reactivate` - Reactivate account

### Notifications (`/api/mobile/notifications`)
- `GET /` - Get notifications
- `GET /unread-count` - Get unread count
- `PUT /:notificationId/read` - Mark notification as read
- `PUT /mark-all-read` - Mark all notifications as read
- `DELETE /:notificationId` - Delete notification
- `DELETE /` - Delete all notifications
- `GET /settings` - Get notification settings
- `PUT /settings` - Update notification settings
- `POST /test` - Send test notification
- `POST /bulk-actions` - Perform bulk actions

## 🛠️ Technology Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js 5.x
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT with bcrypt
- **Validation**: Joi schema validation
- **Security**: Helmet, CORS, rate limiting
- **Logging**: Winston with MongoDB transport
- **File Upload**: Multer
- **Testing**: Jest
- **Linting**: ESLint

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ekub-app-backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   # Copy environment configuration
   cp config/default.json config/local.json
   
   # Edit config/local.json with your settings
   ```

4. **Database Setup**
   ```bash
   # Start MongoDB (if using local instance)
   mongod
   
   # Or use MongoDB Atlas
   ```

5. **Start the application**
   ```bash
   # Development mode
   npm run dev
   
   # Production mode
   npm start
   ```

## ⚙️ Configuration

The application uses the `config` package for configuration management. Configuration files are located in the `config/` directory:

- `default.json` - Default configuration
- `development.json` - Development environment settings
- `production.json` - Production environment settings
- `local.json` - Local development overrides (not tracked in git)

### Key Configuration Options

```json
{
  "server": {
    "port": 3001,
    "host": "localhost"
  },
  "database": {
    "url": "mongodb://localhost:27017/ekub-app"
  },
  "jwt": {
    "secret": "your-jwt-secret",
    "accessExpiry": "10m",
    "refreshExpiry": "30d"
  },
  "cors": {
    "origins": ["http://localhost:3000"]
  }
}
```

## 🔐 Authentication

The API uses JWT (JSON Web Tokens) for authentication:

1. **Sign In/Sign Up** - Get access and refresh tokens
2. **Protected Routes** - Include `Authorization: Bearer <token>` header
3. **Token Refresh** - Use refresh token to get new access token
4. **Automatic Logout** - Refresh tokens are invalidated on logout

### Example Request
```bash
curl -H "Authorization: Bearer <your-jwt-token>" \
     -H "Content-Type: application/json" \
     http://localhost:3001/api/mobile/profile
```

## 🗄️ Database Models

### User
- Basic profile information
- Authentication details
- Bank account information
- Refresh token management

### Equb
- Group information and settings
- Member management
- Payment rounds and schedules
- Role assignments

### Payment
- Payment transactions
- Round tracking
- Status management
- Audit trail

### Notification
- User notifications
- Type categorization
- Read/unread status
- Action URLs

## 🔒 Security Features

- **JWT Authentication** - Secure token-based authentication
- **Password Hashing** - bcrypt with configurable rounds
- **Input Validation** - Joi schema validation for all inputs
- **Rate Limiting** - Configurable rate limits per endpoint type
- **CORS Protection** - Configurable cross-origin resource sharing
- **Helmet Security** - Security headers and protection
- **SQL Injection Protection** - MongoDB with parameterized queries
- **XSS Protection** - Input sanitization and output encoding

## 📊 Logging

The application uses Winston for comprehensive logging:

- **Console Logging** - Development and debugging
- **File Logging** - Production log files
- **MongoDB Logging** - Database-stored logs
- **Log Rotation** - Automatic log file rotation
- **Log Levels** - Configurable log levels per environment

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## 🚀 Deployment

### Production Checklist

1. **Environment Variables**
   - Set `NODE_ENV=production`
   - Configure production database URL
   - Set secure JWT secrets
   - Configure CORS origins

2. **Security**
   - Change default JWT secrets
   - Configure SSL/TLS certificates
   - Set up firewall rules
   - Enable rate limiting

3. **Monitoring**
   - Set up application monitoring
   - Configure log aggregation
   - Set up health checks
   - Monitor database performance

4. **Scaling**
   - Use PM2 or similar process manager
   - Set up load balancing
   - Configure database clustering
   - Implement caching strategies

### Docker Deployment

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3001
CMD ["npm", "start"]
```

## 📝 API Documentation

For detailed API documentation, visit `/api/docs` when the application is running.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:

- Create an issue in the repository
- Contact the development team
- Check the API documentation at `/api/docs`

## 🔄 Changelog

### Version 1.0.0
- Initial release
- Complete authentication system
- Equb management functionality
- Payment processing system
- User profile management
- Notification system
- Comprehensive security features

---

**Built with ❤️ for the Ekub community** 