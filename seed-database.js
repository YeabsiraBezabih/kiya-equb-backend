/**
 * Database Seeding Script for Kiya Equb Backend
 * 
 * This script creates test data for:
 * 1. 3 Equbs with different configurations (daily, weekly, monthly)
 * 2. Admin user: Yeabsira Bezabih
 * 3. Multiple members with realistic Ethiopian names
 * 4. Different participation types (full, half, quarter)
 * 5. Payment history and round winners for old equbs
 * 
 * Usage: node seed-database.js
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const config = require('config');

// Import models
const User = require('./models/User');
const Equb = require('./models/Equb');
const Payment = require('./models/Payment');

// Ethiopian names for realistic data
const ethiopianNames = [
  'Abebe Kebede', 'Tigist Haile', 'Dawit Mengistu', 'Rahel Tesfaye', 'Solomon Bekele',
  'Yohannes Tadesse', 'Martha Assefa', 'Daniel Worku', 'Hirut Alemu', 'Kebede Demeke',
  'Sara Mohammed', 'Tekle Hailu', 'Bethel Tadesse', 'Yared Mulat', 'Kidist Haile',
  'Mulugeta Desta', 'Alemayehu Taye', 'Meseret Bekele', 'Bekele Tadesse', 'Tigist Worku',
  'Dereje Kebede', 'Rahel Haile', 'Solomon Tadesse', 'Martha Bekele', 'Yohannes Worku',
  'Hirut Alemu', 'Kebede Demeke', 'Sara Mohammed', 'Tekle Hailu', 'Bethel Tadesse',
  'Yared Mulat', 'Kidist Haile', 'Mulugeta Desta', 'Alemayehu Taye', 'Meseret Bekele',
  'Bekele Tadesse', 'Tigist Worku', 'Dereje Kebede', 'Rahel Haile', 'Solomon Tadesse',
  'Martha Bekele', 'Yohannes Worku', 'Hirut Alemu', 'Kebede Demeke', 'Sara Mohammed',
  'Tekle Hailu', 'Bethel Tadesse', 'Yared Mulat', 'Kidist Haile', 'Mulugeta Desta',
  // Additional names to ensure we have enough
  'Addisu Alemayehu', 'Birtukan Tadesse', 'Chala Desta', 'Dawit Haile', 'Eyerusalem Bekele',
  'Fikru Tadesse', 'Genet Worku', 'Haile Gebreselassie', 'Ibsa Alemu', 'Jemberu Kebede',
  'Kalkidan Tesfaye', 'Lulit Mengistu', 'Mekonnen Haile', 'Nardos Tadesse', 'Omer Ahmed',
  'Petros Bekele', 'Qelemework Desta', 'Ruth Alemu', 'Samuel Worku', 'Tigist Kebede',
  'Urael Tadesse', 'Violet Haile', 'Wondimu Bekele', 'Xavier Desta', 'Yohana Alemu',
  'Zelalem Worku', 'Abel Kebede', 'Birtukan Tadesse', 'Chala Desta', 'Dawit Haile',
  'Eyerusalem Bekele', 'Fikru Tadesse', 'Genet Worku', 'Haile Gebreselassie', 'Ibsa Alemu',
  'Jemberu Kebede', 'Kalkidan Tesfaye', 'Lulit Mengistu', 'Mekonnen Haile', 'Nardos Tadesse',
  'Omer Ahmed', 'Petros Bekele', 'Qelemework Desta', 'Ruth Alemu', 'Samuel Worku',
  'Tigist Kebede', 'Urael Tadesse', 'Violet Haile', 'Wondimu Bekele', 'Xavier Desta',
  'Yohana Alemu', 'Zelalem Worku', 'Abel Kebede', 'Birtukan Tadesse', 'Chala Desta',
  'Dawit Haile', 'Eyerusalem Bekele', 'Fikru Tadesse', 'Genet Worku', 'Haile Gebreselassie',
  'Ibsa Alemu', 'Jemberu Kebede', 'Kalkidan Tesfaye', 'Lulit Mengistu', 'Mekonnen Haile',
  'Nardos Tadesse', 'Omer Ahmed', 'Petros Bekele', 'Qelemework Desta', 'Ruth Alemu',
  'Samuel Worku', 'Tigist Kebede', 'Urael Tadesse', 'Violet Haile', 'Wondimu Bekele',
  'Xavier Desta', 'Yohana Alemu', 'Zelalem Worku', 'Abel Kebede', 'Birtukan Tadesse',
  'Chala Desta', 'Dawit Haile', 'Eyerusalem Bekele', 'Fikru Tadesse', 'Genet Worku',
  'Haile Gebreselassie', 'Ibsa Alemu', 'Jemberu Kebede', 'Kalkidan Tesfaye', 'Lulit Mengistu',
  'Mekonnen Haile', 'Nardos Tadesse', 'Omer Ahmed', 'Petros Bekele', 'Qelemework Desta',
  'Ruth Alemu', 'Samuel Worku', 'Tigist Kebede', 'Urael Tadesse', 'Violet Haile',
  'Wondimu Bekele', 'Xavier Desta', 'Yohana Alemu', 'Zelalem Worku', 'Abel Kebede',
  'Birtukan Tadesse', 'Chala Desta', 'Dawit Haile', 'Eyerusalem Bekele', 'Fikru Tadesse',
  'Genet Worku', 'Haile Gebreselassie', 'Ibsa Alemu', 'Jemberu Kebede', 'Kalkidan Tesfaye',
  'Lulit Mengistu', 'Mekonnen Haile', 'Nardos Tadesse', 'Omer Ahmed', 'Petros Bekele',
  'Qelemework Desta', 'Ruth Alemu', 'Samuel Worku', 'Tigist Kebede', 'Urael Tadesse',
  'Violet Haile', 'Wondimu Bekele', 'Xavier Desta', 'Yohana Alemu', 'Zelalem Worku'
];

// Ethiopian cities
const ethiopianCities = [
  'Addis Ababa', 'Bahir Dar', 'Gondar', 'Mekelle', 'Hawassa',
  'Adama', 'Jimma', 'Dessie', 'Dire Dawa', 'Harar'
];

// Bank names
const bankNames = [
  'Commercial Bank of Ethiopia', 'Bank of Abyssinia', 'Dashen Bank',
  'United Bank', 'Cooperative Bank of Oromia', 'Lion International Bank'
];

// Connect to MongoDB
async function connectDB() {
  try {
    await mongoose.connect(config.get('database.url'));
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    process.exit(1);
  }
}

// Generate random phone number
function generatePhoneNumber() {
  const prefixes = ['+251911', '+251912', '+251913', '+251914', '+251915', '+251916', '+251917', '+251918', '+251919'];
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  const number = Math.floor(Math.random() * 10000000).toString().padStart(7, '0');
  return prefix + number;
}

// Generate random bank account
function generateBankAccount() {
  return {
    bankName: bankNames[Math.floor(Math.random() * bankNames.length)],
    accountNumber: Math.floor(Math.random() * 10000000000000).toString(),
    accountHolder: ethiopianNames[Math.floor(Math.random() * ethiopianNames.length)]
  };
}

// Create admin user
async function createAdminUser() {
  try {
    // Check if admin already exists
    let adminUser = await User.findOne({ phoneNumber: '+251911111111' });
    
    if (!adminUser) {
      const hashedPassword = await bcrypt.hash('Yeab1234', 12);
      
      adminUser = new User({
        userId: User.generateUserId(),
        fullName: 'Yeabsira Bezabih',
        phoneNumber: '+251911111111',
        password: hashedPassword,
        isVerified: true,
        isActive: true,
        address: {
          city: 'Addis Ababa',
          subCity: 'Bole',
          woreda: '01',
          houseNumber: '123'
        },
        bankDetails: [generateBankAccount()]
      });
      
      await adminUser.save();
      console.log('✅ Admin user created:', adminUser.fullName);
    } else {
      console.log('ℹ️ Admin user already exists:', adminUser.fullName);
    }
    
    return adminUser;
  } catch (error) {
    console.error('❌ Error creating admin user:', error.message);
    throw error;
  }
}

// Create regular users
async function createUsers(count) {
  try {
    const users = [];
    
    for (let i = 0; i < count; i++) {
      // Ensure we have enough names by cycling through the array
      const nameIndex = i % ethiopianNames.length;
      const name = ethiopianNames[nameIndex];
      
      if (!name) {
        console.error(`❌ No name available at index ${i}`);
        continue;
      }
      
      const phoneNumber = generatePhoneNumber();
      
      // Check if user already exists
      let user = await User.findOne({ phoneNumber });
      
      if (!user) {
        const hashedPassword = await bcrypt.hash('Password123!', 12);
        
        user = new User({
          userId: User.generateUserId(),
          fullName: name,
          phoneNumber: phoneNumber,
          password: hashedPassword,
          isVerified: true,
          isActive: true,
          address: {
            city: ethiopianCities[Math.floor(Math.random() * ethiopianCities.length)],
            subCity: '01',
            woreda: '01',
            houseNumber: Math.floor(Math.random() * 1000).toString()
          },
          bankDetails: [generateBankAccount()]
        });
        
        await user.save();
        console.log(`✅ User created: ${name}`);
      } else {
        console.log(`ℹ️ User already exists: ${name}`);
      }
      
      users.push(user);
    }
    
    console.log(`✅ Successfully created/verified ${users.length} users`);
    return users;
  } catch (error) {
    console.error('❌ Error creating users:', error.message);
    throw error;
  }
}

// Create monthly equb (15 people, 12 months, full participation)
async function createMonthlyEqub(adminUser, users) {
  try {
    const equbId = Equb.generateEqubId();
    const saving = 5000; // 5000 ETB per month
    const maxMembers = 15;
    const totalRounds = 12;
    
    const equb = new Equb({
      equbId,
      name: 'Monthly Family Savings Group',
      description: 'Monthly savings group for family expenses and investments',
      type: 'public',
      roundDuration: 'monthly',
      saving,
      maxMembers,
      startDate: new Date('2024-01-01'),
      location: 'Addis Ababa',
      createdBy: adminUser._id,
      secretNumber: '123456',
      isActive: true,
      currentRound: 1,
      totalRounds,
      nextRoundDate: new Date('2024-02-01'),
      level: 'new',
      bankAccountDetail: [generateBankAccount()],
      members: []
    });
    
    // Add admin as full participant
    equb.members.push({
      userId: adminUser._id,
      name: adminUser.fullName,
      participationType: 'full',
      slotNumber: 1,
      role: 'admin',
      joinedDate: new Date('2024-01-01'),
      isActive: true,
      paymentHistory: []
    });
    
    // Add other members as full participants
    for (let i = 0; i < maxMembers - 1; i++) {
      const user = users[i];
      equb.members.push({
        userId: user._id,
        name: user.fullName,
        participationType: 'full',
        slotNumber: i + 2,
        role: 'member',
        joinedDate: new Date('2024-01-01'),
        isActive: true,
        paymentHistory: []
      });
    }
    
    await equb.save();
    console.log(`✅ Monthly equb created: ${equb.name} (${equb.members.length} members)`);
    
    return equb;
  } catch (error) {
    console.error('❌ Error creating monthly equb:', error.message);
    throw error;
  }
}

// Create weekly equb (50 people, 30 weeks, half and quarter participation)
async function createWeeklyEqub(adminUser, users) {
  try {
    const equbId = Equb.generateEqubId();
    const saving = 2000; // 2000 ETB per week
    const maxMembers = 50;
    const totalRounds = 30;
    
    const equb = new Equb({
      equbId,
      name: 'Weekly Community Savings Group',
      description: 'Weekly savings group for community development projects',
      type: 'public',
      roundDuration: 'weekly',
      saving,
      maxMembers,
      startDate: new Date('2024-01-01'),
      location: 'Bahir Dar',
      createdBy: adminUser._id,
      secretNumber: '234567',
      isActive: true,
      currentRound: 1,
      totalRounds,
      nextRoundDate: new Date('2024-01-08'),
      level: 'new',
      bankAccountDetail: [generateBankAccount()],
      members: []
    });
    
    // Add admin as half participant
    equb.members.push({
      userId: adminUser._id,
      name: adminUser.fullName,
      participationType: 'half',
      slotNumber: 1,
      role: 'admin',
      joinedDate: new Date('2024-01-01'),
      isActive: true,
      paymentHistory: []
    });
    
    // Add other members with mixed participation types
    for (let i = 0; i < maxMembers - 1; i++) {
      const user = users[i + 15]; // Use different users
      const participationType = i % 3 === 0 ? 'full' : (i % 3 === 1 ? 'half' : 'quarter');
      
      equb.members.push({
        userId: user._id,
        name: user.fullName,
        participationType,
        slotNumber: i + 2,
        role: 'member',
        joinedDate: new Date('2024-01-01'),
        isActive: true,
        paymentHistory: []
      });
    }
    
    await equb.save();
    console.log(`✅ Weekly equb created: ${equb.name} (${equb.members.length} members)`);
    
    return equb;
  } catch (error) {
    console.error('❌ Error creating weekly equb:', error.message);
    throw error;
  }
}

// Create daily equb (35 people, 25 rounds, max participation)
async function createDailyEqub(adminUser, users) {
  try {
    const equbId = Equb.generateEqubId();
    const saving = 500; // 500 ETB per day
    const maxMembers = 35;
    const totalRounds = 25;
    
    const equb = new Equb({
      equbId,
      name: 'Daily Business Savings Group',
      description: 'Daily savings group for small business owners',
      type: 'public',
      roundDuration: 'daily',
      saving,
      maxMembers,
      startDate: new Date('2024-01-01'),
      location: 'Gondar',
      createdBy: adminUser._id,
      secretNumber: '345678',
      isActive: true,
      currentRound: 1,
      totalRounds,
      nextRoundDate: new Date('2024-01-02'),
      level: 'new',
      bankAccountDetail: [generateBankAccount()],
      members: []
    });
    
    // Add admin as quarter participant
    equb.members.push({
      userId: adminUser._id,
      name: adminUser.fullName,
      participationType: 'quarter',
      formNumber: 1,
      role: 'admin',
      joinedDate: new Date('2024-01-01'),
      isActive: true,
      paymentHistory: []
    });
    
    // Add other members with max participation
    for (let i = 0; i < maxMembers - 1; i++) {
      const user = users[i + 65]; // Use different users
      const participationType = i % 4 === 0 ? 'full' : (i % 4 === 1 ? 'half' : 'quarter');
      
      equb.members.push({
        userId: user._id,
        name: user.fullName,
        participationType,
        formNumber: i + 2,
        role: 'member',
        joinedDate: new Date('2024-01-01'),
        isActive: true,
        paymentHistory: []
      });
    }
    
    await equb.save();
    console.log(`✅ Daily equb created: ${equb.name} (${equb.members.length} members)`);
    
    return equb;
  } catch (error) {
    console.error('❌ Error creating daily equb:', error.message);
    throw error;
  }
}

// Create old equb with winners and payment history
async function createOldEqub(adminUser, users) {
  try {
    const equbId = Equb.generateEqubId();
    const saving = 3000; // 3000 ETB per round
    const maxMembers = 20;
    const totalRounds = 15;
    const currentRound = 15; // Completed
    
    const equb = new Equb({
      equbId,
      name: 'Old Community Savings Group',
      description: 'Completed savings group with full payment history',
      type: 'public',
      roundDuration: 'monthly',
      saving,
      maxMembers,
      startDate: new Date('2023-01-01'),
      location: 'Mekelle',
      createdBy: adminUser._id,
      secretNumber: '456789',
      isActive: false, // Completed
      currentRound,
      totalRounds,
      nextRoundDate: null,
      level: 'old',
      bankAccountDetail: [generateBankAccount()],
      members: [],
      roundWinners: []
    });
    
    // Add admin as full participant
    equb.members.push({
      userId: adminUser._id,
      name: adminUser.fullName,
      participationType: 'full',
      formNumber: 1,
      role: 'admin',
      joinedDate: new Date('2023-01-01'),
      isActive: true,
      paymentHistory: []
    });
    
    // Add other members
    for (let i = 0; i < maxMembers - 1; i++) {
      const user = users[i + 100]; // Use different users
      const participationType = i % 3 === 0 ? 'full' : (i % 3 === 1 ? 'half' : 'quarter');
      
      equb.members.push({
        userId: user._id,
        name: user.fullName,
        participationType,
        formNumber: i + 2,
        role: 'member',
        joinedDate: new Date('2023-01-01'),
        isActive: true,
        paymentHistory: []
      });
    }
    
    // Add round winners (25% and 75% of rounds completed)
    const completedRounds = Math.floor(totalRounds * 0.75); // 75% completed
    const winningRounds = Math.floor(totalRounds * 0.25); // 25% have winners
    
    for (let round = 1; round <= completedRounds; round++) {
      const member = equb.members[Math.floor(Math.random() * equb.members.length)];
      const participationType = member.participationType;
      
      // Add payment history for completed rounds
      member.paymentHistory.push({
        roundNumber: round,
        date: new Date(2023, 0, round * 30), // Approximate dates
        status: 'paid',
        amountPaid: saving,
        paymentMethod: 'cash',
        notes: 'Round payment completed'
      });
      
      // Add winners for some rounds
      if (round <= winningRounds) {
        equb.roundWinners.push({
          roundNumber: round,
          winnerSlotNumbers: [member.slotNumber],
          participationType: participationType,
          createdAt: new Date(2023, 0, round * 30)
        });
      }
    }
    
    await equb.save();
    console.log(`✅ Old equb created: ${equb.name} (${equb.members.length} members, ${completedRounds} rounds completed)`);
    
    return equb;
  } catch (error) {
    console.error('❌ Error creating old equb:', error.message);
    throw error;
  }
}

// Create new equb with one round passed
async function createNewEqub(adminUser, users) {
  try {
    const equbId = Equb.generateEqubId();
    const saving = 4000; // 4000 ETB per round
    const maxMembers = 25;
    const totalRounds = 20;
    const currentRound = 1; // Just started
    
    const equb = new Equb({
      equbId,
      name: 'New Family Savings Group',
      description: 'Newly started savings group for family projects',
      type: 'public',
      roundDuration: 'monthly',
      saving,
      maxMembers,
      startDate: new Date('2024-12-01'),
      location: 'Hawassa',
      createdBy: adminUser._id,
      secretNumber: '567890',
      isActive: true,
      currentRound,
      totalRounds,
      nextRoundDate: new Date('2025-01-01'),
      level: 'new',
      bankAccountDetail: [generateBankAccount()],
      members: []
    });
    
    // Add admin as full participant
    equb.members.push({
      userId: adminUser._id,
      name: adminUser.fullName,
      participationType: 'full',
      slotNumber: 1,
      role: 'admin',
      joinedDate: new Date('2024-12-01'),
      isActive: true,
      paymentHistory: []
    });
    
    // Add other members
    for (let i = 0; i < maxMembers - 1; i++) {
      const user = users[i + 120]; // Use different users
      const participationType = i % 3 === 0 ? 'full' : (i % 3 === 1 ? 'half' : 'quarter');
      
      equb.members.push({
        userId: user._id,
        name: user.fullName,
        participationType,
        slotNumber: i + 2,
        role: 'member',
        joinedDate: new Date('2024-12-01'),
        isActive: true,
        paymentHistory: []
      });
    }
    
    // Add payment history for first round (passed)
    for (const member of equb.members) {
      member.paymentHistory.push({
        roundNumber: 1,
        date: new Date('2024-12-01'),
        status: 'paid',
        amountPaid: saving,
        paymentMethod: 'cash',
        notes: 'First round payment completed'
      });
    }
    
    await equb.save();
    console.log(`✅ New equb created: ${equb.name} (${equb.members.length} members, 1 round passed)`);
    
    return equb;
  } catch (error) {
    console.error('❌ Error creating new equb:', error.message);
    throw error;
  }
}

// Main seeding function
async function seedDatabase() {
  try {
    console.log('🚀 Starting database seeding...');
    
    // Connect to database
    await connectDB();
    
    // Create admin user
    const adminUser = await createAdminUser();
    
    // Create regular users (need at least 145 users for all equbs)
    const users = await createUsers(150);
    
    console.log('\n📊 Creating Equbs...');
    
    // Create the 3 main equbs
    const monthlyEqub = await createMonthlyEqub(adminUser, users);
    const weeklyEqub = await createWeeklyEqub(adminUser, users);
    const dailyEqub = await createDailyEqub(adminUser, users);
    
    // Create additional equbs for testing
    const oldEqub = await createOldEqub(adminUser, users);
    const newEqub = await createNewEqub(adminUser, users);
    
    console.log('\n✅ Database seeding completed successfully!');
    console.log('\n📋 Summary of created data:');
    console.log(`👤 Admin User: ${adminUser.fullName} (${adminUser.userId})`);
    console.log(`👥 Total Users: ${users.length + 1}`);
    console.log(`🏦 Total Equbs: 5`);
    console.log(`   - Monthly: ${monthlyEqub.name} (${monthlyEqub.members.length} members)`);
    console.log(`   - Weekly: ${weeklyEqub.name} (${weeklyEqub.members.length} members)`);
    console.log(`   - Daily: ${dailyEqub.name} (${dailyEqub.members.length} members)`);
    console.log(`   - Old: ${oldEqub.name} (${oldEqub.members.length} members, completed)`);
    console.log(`   - New: ${newEqub.name} (${newEqub.members.length} members, started)`);
    
    console.log('\n🔑 Admin Login Credentials:');
    console.log(`   Phone: ${adminUser.phoneNumber}`);
    console.log(`   Password: Yeab 123`);
    
    console.log('\n🌐 Test the backend using Swagger UI at: http://localhost:3001/api/docs');
    
  } catch (error) {
    console.error('❌ Database seeding failed:', error.message);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
  }
}

// Run seeding if this file is executed directly
if (require.main === module) {
  seedDatabase();
}

module.exports = { seedDatabase };
