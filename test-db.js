// Test script to add sample data to MongoDB
require('dotenv').config();
const { connectDB, createEvent, getAllEvents } = require('./models/Event');

async function testDatabase() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await connectDB();
    
    console.log('📊 Checking existing events...');
    const existing = await getAllEvents();
    console.log(`Found ${existing.length} existing events`);
    
    if (existing.length === 0) {
      console.log('➕ Creating sample event...');
      const sampleEvent = {
        title: 'Community Food Drive',
        date: new Date('2025-12-15'),
        time: '10:00 AM - 2:00 PM',
        description: 'Help us collect and distribute food to families in need',
        roles: [
          {
            name: 'Food Sorter',
            totalSlots: 5,
            volunteers: []
          },
          {
            name: 'Distribution Helper',
            totalSlots: 3,
            volunteers: []
          }
        ]
      };
      
      const created = await createEvent(sampleEvent);
      console.log('✅ Sample event created:', created._id);
    }
    
    console.log('\n📋 All events in database:');
    const allEvents = await getAllEvents();
    allEvents.forEach(event => {
      console.log(`  - ${event.title} (${new Date(event.date).toLocaleDateString()})`);
    });
    
    console.log('\n✅ Database test complete!');
    console.log('🔍 Check MongoDB Compass with connection string:');
    console.log('   mongodb://127.0.0.1:27017/volunteerHub');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

testDatabase();
