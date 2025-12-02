// server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const {
  connectDB,
  createEvent,
  getAllEvents,
  getAllEventsIncludingPast,
  getEventById,
  signUpVolunteer,
  deleteEvent,
  updateEvent,
  getEventStats
} = require('./models/Event');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Simple auth middleware using token in Authorization header
const authenticateAdmin = (req, res, next) => {
  const auth = req.headers.authorization || '';
  // token format: "Bearer <ADMIN_PASSWORD>"
  if (!auth.startsWith('Bearer ')) return res.status(401).json({ error: 'Unauthorized' });
  const token = auth.split(' ')[1];
  if (!token || token !== (process.env.ADMIN_PASSWORD || 'admin123')) return res.status(401).json({ error: 'Unauthorized' });
  next();
};

// Public routes
app.get('/api/events', async (req, res) => {
  try { const events = await getAllEvents(); res.json(events); }
  catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/events/:id', async (req, res) => {
  try {
    const ev = await getEventById(req.params.id);
    if (!ev) return res.status(404).json({ error: 'Event not found' });
    res.json(ev);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/events/:id/signup', async (req, res) => {
  try {
    const { roleIndex, name, email } = req.body;
    if (roleIndex === undefined || !name || !email) return res.status(400).json({ error: 'Missing fields' });
    const event = await signUpVolunteer(req.params.id, Number(roleIndex), { name, email });
    res.json({ message: 'Signed up', event });
  } catch (err) { res.status(400).json({ error: err.message }); }
});

// Admin login returns a simple token (the token is just the ADMIN_PASSWORD for dev)
app.post('/api/admin/login', (req, res) => {
  const { password } = req.body;
  if (password === (process.env.ADMIN_PASSWORD || 'admin123')) {
    return res.json({ success: true, token: process.env.ADMIN_PASSWORD || 'admin123' });
  }
  res.status(401).json({ success: false, error: 'Invalid password' });
});

// Admin routes (protected)
app.post('/api/admin/events', authenticateAdmin, async (req, res) => {
  try {
    const ev = await createEvent(req.body);
    res.status(201).json(ev);
  } catch (err) { res.status(400).json({ error: err.message }); }
});

app.get('/api/admin/events', authenticateAdmin, async (req, res) => {
  try { const events = await getAllEventsIncludingPast(); res.json(events); }
  catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/api/admin/events/:id', authenticateAdmin, async (req, res) => {
  try {
    const ev = await updateEvent(req.params.id, req.body);
    if (!ev) return res.status(404).json({ error: 'Event not found' });
    res.json(ev);
  } catch (err) { res.status(400).json({ error: err.message }); }
});

app.delete('/api/admin/events/:id', authenticateAdmin, async (req, res) => {
  try {
    await deleteEvent(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/events/:id/stats', async (req, res) => {
  try {
    const s = await getEventStats(req.params.id);
    if (!s) return res.status(404).json({ error: 'Event not found' });
    res.json(s);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Fallback to SPA index
app.get('*', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));

// Start
const start = async () => {
  await connectDB();
  app.listen(PORT, () => console.log(`✅ Server running http://localhost:${PORT}`));
};
start();
