#!/usr/bin/env node

const { MongoClient } = require('mongodb');

const MONGODB_URI = 'mongodb://ekub_user:ekub_password@localhost:27021/ekub-app';

async function reinitializeDatabase() {
  console.log('🔄 Reinitializing MongoDB database...');
  
  try {
    // Connect to MongoDB
    const client = new MongoClient(MONGODB_URI);
    await client.connect();
    console.log('✅ Connected to MongoDB');
    
    const db = client.db('ekub-app');
    
    // Drop existing indexes
    console.log('🗑️  Dropping existing indexes...');
    await db.collection('users').dropIndexes();
    console.log('✅ Dropped existing indexes');
    
    // Create new indexes with sparse email
    console.log('🔧 Creating new indexes...');
    await db.collection('users').createIndex({ "email": 1 }, { unique: true, sparse: true });
    await db.collection('users').createIndex({ "phoneNumber": 1 }, { unique: true });
    await db.collection('equbs').createIndex({ "equbId": 1 }, { unique: true });
    await db.collection('payments').createIndex({ "paymentId": 1 }, { unique: true });
    await db.collection('notifications').createIndex({ "notificationId": 1 }, { unique: true });
    
    console.log('✅ New indexes created successfully');
    
    // Verify indexes
    const indexes = await db.collection('users').indexes();
    console.log('📋 Current indexes:');
    indexes.forEach(index => {
      console.log(`  - ${index.name}: ${JSON.stringify(index.key)}`);
    });
    
    await client.close();
    console.log('🎉 Database reinitialization completed successfully!');
    
  } catch (error) {
    console.error('❌ Error reinitializing database:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  reinitializeDatabase();
}

module.exports = { reinitializeDatabase };
