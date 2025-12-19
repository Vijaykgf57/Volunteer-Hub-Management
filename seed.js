// Seed script to populate database with sample events
require('dotenv').config();
const { connectDB, createEvent, Event } = require('./models/Event');

const sampleEvents = [
  {
    title: 'Community Food Drive',
    category: 'Food & Hunger',
    date: new Date('2025-12-15'),
    time: '10:00 AM - 2:00 PM',
    description: 'Help us collect and distribute food to families in need this holiday season. We need volunteers to sort donations, pack boxes, and assist with distribution.',
    roles: [
      { name: 'Food Sorter', totalSlots: 5, volunteers: [] },
      { name: 'Distribution Helper', totalSlots: 3, volunteers: [] },
      { name: 'Registration Desk', totalSlots: 2, volunteers: [] }
    ]
  },
  {
    title: 'Beach Cleanup Day',
    category: 'Environment',
    date: new Date('2025-12-20'),
    time: '8:00 AM - 12:00 PM',
    description: 'Join us for a morning of environmental action! Help keep our beaches clean and protect marine life. All supplies provided.',
    roles: [
      { name: 'Cleanup Crew', totalSlots: 15, volunteers: [] },
      { name: 'Team Leader', totalSlots: 3, volunteers: [] },
      { name: 'Photographer', totalSlots: 1, volunteers: [] }
    ]
  },
  {
    title: 'Senior Center Holiday Party',
    category: 'Seniors',
    date: new Date('2025-12-22'),
    time: '2:00 PM - 5:00 PM',
    description: 'Spread holiday cheer by helping organize and run a festive party for seniors in our community. Activities include games, music, and refreshments.',
    roles: [
      { name: 'Activity Coordinator', totalSlots: 4, volunteers: [] },
      { name: 'Kitchen Helper', totalSlots: 3, volunteers: [] },
      { name: 'Entertainment', totalSlots: 2, volunteers: [] }
    ]
  },
  {
    title: 'Youth Mentorship Program',
    category: 'Education',
    date: new Date('2026-01-10'),
    time: '4:00 PM - 6:00 PM',
    description: 'Make a lasting impact by mentoring local youth. Help with homework, share career advice, and be a positive role model.',
    roles: [
      { name: 'Tutor', totalSlots: 8, volunteers: [] },
      { name: 'Career Mentor', totalSlots: 5, volunteers: [] },
      { name: 'Activity Leader', totalSlots: 3, volunteers: [] }
    ]
  },
  {
    title: 'Animal Shelter Support',
    category: 'Animals',
    date: new Date('2026-01-15'),
    time: '9:00 AM - 1:00 PM',
    description: 'Help care for animals at our local shelter. Tasks include walking dogs, socializing cats, cleaning facilities, and administrative support.',
    roles: [
      { name: 'Dog Walker', totalSlots: 6, volunteers: [] },
      { name: 'Cat Socializer', totalSlots: 4, volunteers: [] },
      { name: 'Facility Cleaner', totalSlots: 3, volunteers: [] },
      { name: 'Admin Support', totalSlots: 2, volunteers: [] }
    ]
  }
];

async function seedDatabase() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await connectDB();
    
    console.log('🗑️  Clearing existing events...');
    await Event.deleteMany({});
    
    console.log('🌱 Seeding database with sample events...');
    
    for (const eventData of sampleEvents) {
      const event = await createEvent(eventData);
      console.log(`✅ Created: ${event.title}`);
    }
    
    console.log('\n🎉 Database seeded successfully!');
    console.log(`📊 Total events created: ${sampleEvents.length}`);
    console.log('\n🚀 You can now:');
    console.log('   1. Start the server: npm start');
    console.log('   2. Visit: http://localhost:3000');
    console.log('   3. Admin password: admin123');
    console.log('   4. Check MongoDB Compass: mongodb://127.0.0.1:27017/volunteerHub');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase();
