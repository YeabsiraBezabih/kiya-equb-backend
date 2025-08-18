# Database Seeding Guide for Kiya Equb Backend

This guide explains how to seed the database with test data for comprehensive backend testing.

## 🎯 Overview

The seeding system creates realistic test data including:
- **Admin User**: Yeabsira Bezabih (for testing all functionality)
- **Multiple Equbs**: Different durations, participation types, and levels
- **Realistic Ethiopian Names**: Authentic user data for testing
- **Payment History**: Complete payment tracking for testing
- **Round Winners**: Winners for completed equbs

## 🚀 Quick Start

### 1. Seed the Database
```bash
npm run seed
```

### 2. Verify the Seeding
```bash
npm run verify
```

### 3. Start the Backend
```bash
npm start
```

### 4. Test with Swagger UI
Open: http://localhost:3001/api/docs

## 📊 What Gets Created

### Users
- **1 Admin User**: Yeabsira Bezabih
- **150 Regular Users**: With realistic Ethiopian names
- **All users are verified and active**

### Equbs (5 Total)

#### 1. Monthly Family Savings Group
- **Duration**: Monthly
- **Members**: 15 people
- **Rounds**: 12 months
- **Admin Participation**: Full
- **Saving**: 5,000 ETB per month
- **Level**: New

#### 2. Weekly Community Savings Group
- **Duration**: Weekly
- **Members**: 50 people
- **Rounds**: 30 weeks
- **Admin Participation**: Half
- **Saving**: 2,000 ETB per week
- **Level**: New
- **Mixed Participation**: Full, Half, Quarter

#### 3. Daily Business Savings Group
- **Duration**: Daily
- **Members**: 35 people
- **Rounds**: 25 days
- **Admin Participation**: Quarter
- **Saving**: 500 ETB per day
- **Level**: New
- **Max Participation**: Various types

#### 4. Old Community Savings Group
- **Duration**: Monthly
- **Members**: 20 people
- **Rounds**: 15 (completed)
- **Admin Participation**: Full
- **Saving**: 3,000 ETB per round
- **Level**: Old (completed)
- **Payment History**: 75% rounds completed
- **Winners**: 25% rounds have winners

#### 5. New Family Savings Group
- **Duration**: Monthly
- **Members**: 25 people
- **Rounds**: 20 (just started)
- **Admin Participation**: Full
- **Saving**: 4,000 ETB per round
- **Level**: New
- **Payment History**: 1 round completed

## 🔑 Admin Credentials

```
Phone: +251911111111
Password: Yeab 123
```

## 🧪 Testing Scenarios

### Authentication Testing
- Sign in with admin credentials
- Test JWT token generation
- Verify protected route access

### Equb Management Testing
- Create new equbs
- Join existing equbs
- Manage equb members
- Update member roles

### Payment Testing
- Process payments for different rounds
- Track payment history
- Handle unpaid members
- Manage round winners

### User Management Testing
- Update user profiles
- Manage bank accounts
- Handle user verification

### API Endpoint Testing
- Test all CRUD operations
- Verify validation rules
- Check error handling
- Test rate limiting

## 📁 Script Files

### `seed-database.js`
- Main seeding script
- Creates all users, equbs, and relationships
- Handles data validation and error checking
- Provides detailed progress logging

### `verify-seeded-data.js`
- Verification script for seeded data
- Checks user counts and relationships
- Verifies equb configurations
- Tests API endpoint functionality
- Generates comprehensive reports

## 🛠️ Customization

### Modify User Counts
Edit `seed-database.js`:
```javascript
// Change the number of users created
const users = await createUsers(150); // Modify this number
```

### Modify Equb Configurations
Edit the equb creation functions:
```javascript
// Example: Change monthly equb saving amount
const saving = 5000; // Modify this value
```

### Add More Equbs
Create new functions following the existing pattern:
```javascript
async function createCustomEqub(adminUser, users) {
  // Your custom equb logic
}
```

## 🔍 Verification Process

The verification script checks:

1. **User Verification**
   - Total user count
   - Admin user existence
   - User verification status
   - Active user count

2. **Equb Verification**
   - Total equb count
   - Active vs inactive equbs
   - Old vs new equbs
   - Duration distribution

3. **Member Verification**
   - Member counts per equb
   - Participation type distribution
   - Admin role assignment
   - Payment history status

4. **Payment Verification**
   - Total payment counts
   - Paid vs unpaid status
   - Round winner assignment
   - Payment method distribution

5. **API Testing**
   - Health check endpoint
   - Public endpoints (discover equbs)
   - Authentication endpoints
   - Protected endpoints

## 🚨 Troubleshooting

### Common Issues

#### 1. MongoDB Connection Failed
```
❌ MongoDB connection failed: connection refused
```
**Solution**: Ensure MongoDB Atlas is accessible and credentials are correct

#### 2. Duplicate Key Error
```
❌ E11000 duplicate key error
```
**Solution**: The script handles duplicates automatically, but you can clear the database first

#### 3. Validation Errors
```
❌ Validation failed: phoneNumber
```
**Solution**: Check that phone numbers follow Ethiopian format (+251XXXXXXXXX)

### Reset Database
If you need to start fresh:
```bash
# Clear all data (be careful!)
# This will remove all users, equbs, and payments
```

## 📈 Performance Notes

- **Seeding Time**: ~30-60 seconds for full dataset
- **Database Size**: ~5-10 MB after seeding
- **User Count**: 151 total users
- **Equb Count**: 5 equbs
- **Total Members**: ~145 members across all equbs

## 🎯 Best Practices

1. **Run seeding in development only**
2. **Verify data after seeding**
3. **Test API endpoints systematically**
4. **Use admin credentials for full access**
5. **Check Swagger documentation for endpoint details**

## 🔄 Re-seeding

To re-seed the database:
```bash
npm run seed
```

The script automatically handles existing data and won't create duplicates.

## 📞 Support

If you encounter issues:
1. Check the console output for error messages
2. Verify MongoDB connection
3. Check that all models are properly imported
4. Ensure the backend server can start

---

**Happy Testing! 🚀**

Use the seeded data to thoroughly test all backend functionality through the Swagger UI interface.
