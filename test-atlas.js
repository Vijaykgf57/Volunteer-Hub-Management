// Simple MongoDB Atlas connection test
const mongoose = require('mongoose');

async function testAtlasConnection() {
  // Test connection string - replace with your actual credentials
  const testUri = 'mongodb+srv://vijayganachari5_db_user:XaGPW24qt4gThEle@volunteer-cluster.9x9ufqb.mongodb.net/volunteerHub?retryWrites=true&w=majority';
  
  console.log('🧪 Testing MongoDB Atlas Connection...');
  console.log('📧 Username: vijayganachari5_db_user');
  console.log('📧 Password: XaGPW24qt4gThEle');
  console.log('📧 Cluster: volunteer-cluster.9x9ufqb.mongodb.net');
  
  try {
    console.log('\n🔌 Attempting connection...');
    await mongoose.connect(testUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    
    console.log('✅ SUCCESS! MongoDB Atlas connected!');
    console.log('🎉 Your connection string is working!');
    
    // Test a simple operation
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('📊 Collections found:', collections.length);
    
    await mongoose.disconnect();
    console.log('🔌 Disconnected successfully');
    
  } catch (error) {
    console.log('❌ Connection failed:', error.message);
    
    if (error.message.includes('authentication failed')) {
      console.log('\n🔧 Authentication Issue - Try this:');
      console.log('1. Go to MongoDB Atlas → Database Access');
      console.log('2. Check if user "vijayganachari5_db_user" exists and is Active');
      console.log('3. Click Edit → Edit Password → Generate new password');
      console.log('4. Update .env file with new password');
      console.log('5. Make sure Network Access allows 0.0.0.0/0');
    }
    
    if (error.message.includes('IP')) {
      console.log('\n🔧 IP Whitelist Issue:');
      console.log('1. Go to MongoDB Atlas → Network Access');
      console.log('2. Add IP Address → Allow Access from Anywhere (0.0.0.0/0)');
    }
  }
}

testAtlasConnection();