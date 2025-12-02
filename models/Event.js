// models/Event.js
// MongoDB Schema and Models for Volunteer Hub

const mongoose = require('mongoose');

// ==========================================
// SCHEMAS
// ==========================================

// Volunteer Schema (embedded in roles)
const volunteerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  signedUpAt: {
    type: Date,
    default: Date.now
  }
}, { _id: false });

// Role Schema (embedded in events)
const roleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  totalSlots: {
    type: Number,
    required: true,
    min: 1
  },
  volunteers: [volunteerSchema]
}, { _id: false });

// Event Schema (main collection)
const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  date: {
    type: Date,
    required: true
  },
  time: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  roles: [roleSchema],
  createdBy: {
    type: String,
    default: 'admin'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes for better query performance
eventSchema.index({ date: 1 });
eventSchema.index({ createdAt: -1 });

// Virtual for checking if event is upcoming
eventSchema.virtual('isUpcoming').get(function() {
  return this.date >= new Date();
});

// Admin/User Schema (for authentication)
const adminSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['admin', 'organizer'],
    default: 'admin'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// ==========================================
// MODELS
// ==========================================

const Event = mongoose.model('Event', eventSchema);
const Admin = mongoose.model('Admin', adminSchema);

// ==========================================
// DATABASE CONNECTION
// ==========================================

const connectDB = async () => {
  try {
    const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/volunteer_hub';

    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    console.log("✅ MongoDB Connected Successfully:", uri);
  } catch (error) {
    console.error("❌ MongoDB Connection Error:", error);
    process.exit(1);
  }
};


// ==========================================
// CRUD OPERATIONS
// ==========================================

// Create Event
async function createEvent(eventData) {
  const event = new Event(eventData);
  return await event.save();
}

// Get All Events (upcoming only)
async function getAllEvents() {
  return await Event.find({ date: { $gte: new Date() } })
    .sort({ date: 1 })
    .lean();
}

// Get All Events (including past)
async function getAllEventsIncludingPast() {
  return await Event.find({})
    .sort({ date: -1 })
    .lean();
}

// Get Event by ID
async function getEventById(eventId) {
  return await Event.findById(eventId).lean();
}

// Sign up volunteer for a role
async function signUpVolunteer(eventId, roleIndex, volunteerData) {
  const event = await Event.findById(eventId);
  
  if (!event) {
    throw new Error('Event not found');
  }
  
  const role = event.roles[roleIndex];
  
  // Check if role exists
  if (!role) {
    throw new Error('Role not found');
  }
  
  // Check if slots are available
  if (role.volunteers.length >= role.totalSlots) {
    throw new Error('This role is full');
  }
  
  // Check for duplicate email
  const isDuplicate = role.volunteers.some(
    v => v.email === volunteerData.email.toLowerCase()
  );
  
  if (isDuplicate) {
    throw new Error('Email already registered for this role');
  }
  
  // Add volunteer
  event.roles[roleIndex].volunteers.push(volunteerData);
  return await event.save();
}

// Delete Event
async function deleteEvent(eventId) {
  return await Event.findByIdAndDelete(eventId);
}

// Update Event
async function updateEvent(eventId, updateData) {
  return await Event.findByIdAndUpdate(
    eventId,
    { ...updateData, updatedAt: Date.now() },
    { new: true, runValidators: true }
  );
}

// Get volunteer statistics
async function getEventStats(eventId) {
  const event = await Event.findById(eventId);
  
  if (!event) {
    return null;
  }
  
  const stats = {
    totalRoles: event.roles.length,
    totalSlots: event.roles.reduce((sum, role) => sum + role.totalSlots, 0),
    filledSlots: event.roles.reduce((sum, role) => sum + role.volunteers.length, 0),
    roles: event.roles.map(role => ({
      name: role.name,
      totalSlots: role.totalSlots,
      filledSlots: role.volunteers.length,
      availableSlots: role.totalSlots - role.volunteers.length
    }))
  };
  
  stats.fillPercentage = (stats.filledSlots / stats.totalSlots * 100).toFixed(1);
  
  return stats;
}

// ==========================================
// EXPORTS
// ==========================================

module.exports = {
  connectDB,
  Event,
  Admin,
  // CRUD functions
  createEvent,
  getAllEvents,
  getAllEventsIncludingPast,
  getEventById,
  signUpVolunteer,
  deleteEvent,
  updateEvent,
  getEventStats
};