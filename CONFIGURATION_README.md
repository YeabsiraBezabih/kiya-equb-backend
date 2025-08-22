# Configuration Setup Guide

This project now uses environment variables for configuration, making it easier to switch between local MongoDB and MongoDB Atlas, and eliminating secret leaks.

## Environment Files

### `.env.local` - Local Development
- Uses local MongoDB container
- Development-friendly settings
- Lower security requirements

### `.env.prod` - Production Deployment
- Uses MongoDB Atlas cluster
- Production-optimized settings
- Higher security requirements

### `.env.example` - Template
- Shows all required environment variables
- Never contains actual secrets
- Safe to commit to version control

## Quick Setup

### For Local Development:
1. Copy `.env.example` to `.env.local`
2. Update values for your local MongoDB setup
3. Run: `npm run dev`

### For Production:
1. Copy `.env.example` to `.env.prod`
2. Update values for your MongoDB Atlas cluster
3. Set `NODE_ENV=production`
4. Deploy with production environment

## Environment Variables

### Database Configuration
- `MONGODB_URI`: Connection string to MongoDB
- `MONGODB_NAME`: Database name

### Authentication
- `JWT_SECRET`: Secret key for JWT tokens
- `JWT_REFRESH_SECRET`: Secret key for refresh tokens

### External Services
- `EMAIL_USER`: Gmail username
- `EMAIL_PASS`: Gmail app password
- `TWILIO_ACCOUNT_SID`: Twilio account SID
- `TWILIO_AUTH_TOKEN`: Twilio auth token

### Security
- `BCRYPT_ROUNDS`: Password hashing rounds
- `SESSION_TIMEOUT`: Session timeout in milliseconds
- `MAX_LOGIN_ATTEMPTS`: Maximum login attempts
- `LOCKOUT_DURATION`: Account lockout duration

## Switching Between Databases

### Local MongoDB (Development)
```bash
# Use .env.local
export NODE_ENV=development
npm run dev
```

### MongoDB Atlas (Production)
```bash
# Use .env.prod
export NODE_ENV=production
npm start
```

## Configuration Priority

1. Environment variables (highest priority)
2. Configuration files (default.json, development.json, production.json)
3. Hardcoded defaults (lowest priority)

## Security Notes

- Never commit `.env.local` or `.env.prod` to version control
- Use strong, unique secrets for JWT keys
- Rotate secrets regularly in production
- Use environment-specific configurations

## Troubleshooting

### Common Issues:
1. **Database connection fails**: Check `MONGODB_URI` and `MONGODB_NAME`
2. **Authentication errors**: Verify JWT secrets are set
3. **CORS issues**: Check `CORS_ORIGINS` format
4. **File upload fails**: Verify `FILE_UPLOAD_PATH` exists and is writable

### Debug Mode:
Set `LOG_LEVEL=debug` in your environment file for detailed logging.
