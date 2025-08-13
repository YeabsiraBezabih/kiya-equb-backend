# Production Deployment Guide

## Prerequisites

1. **MongoDB Atlas Account**: Sign up at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. **Render Account**: Sign up at [Render](https://render.com)
3. **Git Repository**: Your code should be in a Git repository (GitHub, GitLab, etc.)

## Step 1: MongoDB Atlas Setup

### 1.1 Create a MongoDB Atlas Cluster

1. Log in to MongoDB Atlas
2. Create a new project (if needed)
3. Build a new cluster:
   - Choose **M0 Free** tier for development
   - Select your preferred cloud provider and region
   - Click "Create"

### 1.2 Configure Database Access

1. Go to **Database Access** in the left sidebar
2. Click **"Add New Database User"**
3. Create a username and password (save these securely)
4. Select **"Read and write to any database"**
5. Click **"Add User"**

### 1.3 Configure Network Access

1. Go to **Network Access** in the left sidebar
2. Click **"Add IP Address"**
3. For Render deployment, click **"Allow Access from Anywhere"** (0.0.0.0/0)
4. Click **"Confirm"**

### 1.4 Get Connection String

1. Go to **Database** in the left sidebar
2. Click **"Connect"** on your cluster
3. Choose **"Connect your application"**
4. Copy the connection string
5. Replace `<password>` with your database user password
6. Replace `<dbname>` with your database name (e.g., `ekub-app-prod`)

**Example connection string:**
```
mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/ekub-app-prod?retryWrites=true&w=majority
```

## Step 2: Render Deployment

### 2.1 Connect Your Repository

1. Log in to Render
2. Click **"New +"** and select **"Web Service"**
3. Connect your Git repository
4. Select the repository containing your code

### 2.2 Configure the Service
 
**Basic Settings:**
- **Name**: `ekub-app-backend`
- **Environment**: `Node`
- **Region**: Choose closest to your users
- **Branch**: `main` (or your default branch)
- **Build Command**: `npm install`
- **Start Command**: `npm start`

### 2.3 Set Environment Variables

Add the following environment variables in Render:

| Variable | Value | Description |
|----------|-------|-------------|
| `NODE_ENV` | `production` | Environment mode |
| `MONGODB_URI` | Your MongoDB Atlas connection string | Database connection |
| `JWT_SECRET` | A strong random string (32+ characters) | JWT signing secret |
| `JWT_REFRESH_SECRET` | A different strong random string | JWT refresh secret |
| `CORS_ORIGINS` | `https://your-frontend-domain.com` | Allowed CORS origins |
| `EMAIL_USER` | Your Gmail address | Email service user |
| `EMAIL_PASS` | Your Gmail app password | Email service password |
| `TWILIO_ACCOUNT_SID` | Your Twilio Account SID | SMS service |
| `TWILIO_AUTH_TOKEN` | Your Twilio Auth Token | SMS service |
| `TWILIO_FROM_NUMBER` | Your Twilio phone number | SMS service |

### 2.4 Deploy

1. Click **"Create Web Service"**
2. Render will automatically build and deploy your application
3. Wait for the deployment to complete
4. Your app will be available at: `https://your-app-name.onrender.com`

## Step 3: Post-Deployment Configuration

### 3.1 Update CORS Origins

After deployment, update the `CORS_ORIGINS` environment variable with your actual frontend domain:

```
https://your-actual-frontend-domain.com
```

### 3.2 Test Your API

1. Test the health endpoint: `https://your-app-name.onrender.com/health`
2. Test your API endpoints
3. Check logs in Render dashboard for any errors

### 3.3 Set Up Custom Domain (Optional)

1. In Render dashboard, go to your service
2. Click **"Settings"** tab
3. Scroll to **"Custom Domains"**
4. Add your custom domain
5. Update DNS records as instructed

## Step 4: Security Considerations

### 4.1 Environment Variables

- Never commit sensitive data to your repository
- Use strong, unique secrets for JWT keys
- Rotate secrets regularly

### 4.2 Database Security

- Use MongoDB Atlas built-in security features
- Enable MongoDB Atlas alerts
- Set up database backups

### 4.3 API Security

- Your app already includes:
  - Helmet for security headers
  - CORS protection
  - Rate limiting
  - Input validation
  - JWT authentication

## Step 5: Monitoring and Maintenance

### 5.1 Render Monitoring

- Monitor your service in Render dashboard
- Set up alerts for downtime
- Check logs regularly

### 5.2 MongoDB Atlas Monitoring

- Monitor database performance in Atlas
- Set up alerts for connection issues
- Monitor storage usage

### 5.3 Application Monitoring

- Use the health endpoint for uptime monitoring
- Monitor API response times
- Track error rates

## Troubleshooting

### Common Issues

1. **Database Connection Failed**
   - Check MongoDB Atlas network access
   - Verify connection string
   - Check database user credentials

2. **Build Failures**
   - Check package.json dependencies
   - Verify Node.js version compatibility
   - Check build logs in Render

3. **Runtime Errors**
   - Check application logs in Render
   - Verify environment variables
   - Test locally with production config

### Useful Commands

```bash
# Test MongoDB connection locally
node -e "require('mongoose').connect('your-mongodb-uri').then(() => console.log('Connected')).catch(console.error)"

# Generate JWT secrets
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Support

- **Render Documentation**: https://render.com/docs
- **MongoDB Atlas Documentation**: https://docs.atlas.mongodb.com
- **Node.js Documentation**: https://nodejs.org/docs
