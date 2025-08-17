// MongoDB initialization script for Ekub Backend
db = db.getSiblingDB('ekub-app');

// Create a user for the application
db.createUser({
  user: 'ekub_user',
  pwd: 'ekub_password',
  roles: [
    {
      role: 'readWrite',
      db: 'ekub-app'
    }
  ]
});

// Create collections with validation
db.createCollection('users');
db.createCollection('equbs');
db.createCollection('payments');
db.createCollection('notifications');

// Create indexes for better performance
db.users.createIndex({ "email": 1 }, { unique: true, sparse: true }); // Allow multiple null values
db.users.createIndex({ "phoneNumber": 1 }, { unique: true });
db.equbs.createIndex({ "equbId": 1 }, { unique: true });
db.payments.createIndex({ "paymentId": 1 }, { unique: true });
db.notifications.createIndex({ "notificationId": 1 }, { unique: true });

print('Ekub database initialized successfully!');

