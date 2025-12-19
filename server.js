// server.js
// Express server for Volunteer Hub
require("dotenv").config();
const mongoose = require("mongoose");
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');


const {
  connectDB,
  Event,
  Admin,
  createEvent,
  getAllEvents,
  getAllEventsIncludingPast,
  getEventById,
  signUpVolunteer,
  deleteEvent,
  updateEvent,
  getEventStats
} = require('./models/Event');

const { sendVolunteerConfirmation, sendAdminNotification } = require('./services/emailService');

const app = express();
const PORT = process.env.PORT || 3000;

// ==========================================
// MIDDLEWARE
// ==========================================

app.use(cors());
app.use(express.json());
app.use(express.static('public')); // Serve HTML/CSS/JS files from 'public' folder

// ==========================================
// AUTHENTICATION MIDDLEWARE
// ==========================================

// Simple authentication check (in production, use JWT tokens)
const authenticateAdmin = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || authHeader !== `Bearer ${process.env.ADMIN_PASSWORD || 'admin123'}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  next();
};

// ==========================================
// PUBLIC ROUTES (No authentication required)
// ==========================================

// Get all upcoming events
app.get('/api/events', async (req, res) => {
  try {
    const filters = {
      category: req.query.category,
      search: req.query.search
    };
    const events = await getAllEvents(filters);
    res.json(events);
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ error: 'Failed to fetch events' });
  }
});

// Get single event by ID
app.get('/api/events/:id', async (req, res) => {
  try {
    const event = await getEventById(req.params.id);
    
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }
    
    res.json(event);
  } catch (error) {
    console.error('Error fetching event:', error);
    res.status(500).json({ error: 'Failed to fetch event' });
  }
});

// Sign up volunteer for a role
app.post('/api/events/:id/signup', async (req, res) => {
  try {
    const { roleIndex, name, email } = req.body;
    
    // Validate input
    if (roleIndex === undefined || !name || !email) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    const event = await signUpVolunteer(req.params.id, roleIndex, { name, email });
    
    // Send email notifications (don't wait for them to complete)
    const roleName = event.roles[roleIndex].name;
    
    // Send confirmation email to volunteer
    sendVolunteerConfirmation(email, name, event.title, roleName, event.date, event.time)
      .then(result => {
        if (result.success) {
          console.log(`✅ Confirmation email sent to ${email}`);
        } else {
          console.log(`⚠️ Failed to send confirmation email: ${result.error}`);
        }
      });
    
    // Send notification to admin
    sendAdminNotification(name, email, event.title, roleName)
      .then(result => {
        if (result.success) {
          console.log(`✅ Admin notification sent`);
        } else {
          console.log(`⚠️ Failed to send admin notification: ${result.error}`);
        }
      });
    
    res.json({ 
      success: true, 
      message: `Thank you, ${name}! You're signed up! Check your email for confirmation.`,
      event 
    });
  } catch (error) {
    console.error('Error signing up volunteer:', error);
    res.status(400).json({ error: error.message });
  }
});

// Get event statistics
app.get('/api/events/:id/stats', async (req, res) => {
  try {
    const stats = await getEventStats(req.params.id);
    
    if (!stats) {
      return res.status(404).json({ error: 'Event not found' });
    }
    
    res.json(stats);
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

// ==========================================
// ADMIN ROUTES (Authentication required)
// ==========================================

// Admin login
app.post('/api/admin/login', async (req, res) => {
  try {
    const { password } = req.body;
    
    // Simple password check (use proper auth in production)
    if (password === (process.env.ADMIN_PASSWORD || 'admin123')) {
      res.json({ 
        success: true, 
        token: process.env.ADMIN_PASSWORD || 'admin123',
        message: 'Login successful' 
      });
    } else {
      res.status(401).json({ error: 'Invalid password' });
    }
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Create new event (admin only)
app.post('/api/admin/events', authenticateAdmin, async (req, res) => {
  try {
    const { title, date, time, description, roles } = req.body;
    
    // Validate input
    if (!title || !date || !time || !description || !roles || roles.length === 0) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    const event = await createEvent({
      title,
      date: new Date(date),
      time,
      description,
      roles: roles.map(r => ({
        name: r.name,
        totalSlots: parseInt(r.totalSlots),
        volunteers: []
      }))
    });
    
    res.status(201).json({ 
      success: true, 
      message: 'Event created successfully',
      event 
    });
  } catch (error) {
    console.error('Error creating event:', error);
    res.status(500).json({ error: 'Failed to create event' });
  }
});

// Get all events including past (admin only)
app.get('/api/admin/events', authenticateAdmin, async (req, res) => {
  try {
    const events = await getAllEventsIncludingPast();
    res.json(events);
  } catch (error) {
    console.error('Error fetching admin events:', error);
    res.status(500).json({ error: 'Failed to fetch events' });
  }
});

// Update event (admin only)
app.put('/api/admin/events/:id', authenticateAdmin, async (req, res) => {
  try {
    const event = await updateEvent(req.params.id, req.body);
    
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }
    
    res.json({ 
      success: true, 
      message: 'Event updated successfully',
      event 
    });
  } catch (error) {
    console.error('Error updating event:', error);
    res.status(500).json({ error: 'Failed to update event' });
  }
});

// Delete event (admin only)
app.delete('/api/admin/events/:id', authenticateAdmin, async (req, res) => {
  try {
    const event = await deleteEvent(req.params.id);
    
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }
    
    res.json({ 
      success: true, 
      message: 'Event deleted successfully' 
    });
  } catch (error) {
    console.error('Error deleting event:', error);
    res.status(500).json({ error: 'Failed to delete event' });
  }
});

// ==========================================
// ERROR HANDLING
// ==========================================

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// ==========================================
// START SERVER
// ==========================================

const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDB();
    
    // Start Express server
    app.listen(PORT, () => {
      console.log(`✅ Server running on http://localhost:${PORT}`);
      console.log(`📁 Serving static files from 'public' directory`);
      console.log(`🔒 Admin password: ${process.env.ADMIN_PASSWORD || 'admin123'}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

// ==========================================
// GRACEFUL SHUTDOWN
// ==========================================

process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down gracefully...');
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🛑 Shutting down gracefully...');
  process.exit(0);
});