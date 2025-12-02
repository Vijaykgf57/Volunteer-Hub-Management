# 🤝 Volunteer Hub - Volunteer Management System

A modern, full-stack volunteer management application built with Node.js, Express, MongoDB, and vanilla JavaScript. Features a beautiful, responsive UI for managing volunteer events and signups.

## ✨ Features

### For Volunteers (Public)
- 📅 Browse upcoming volunteer events
- 👥 View available roles and slots
- ✍️ Sign up for volunteer positions
- 📊 See real-time availability
- 📱 Fully responsive design

### For Administrators
- 🔐 Secure admin authentication
- ➕ Create and manage events
- 📋 View all events (past and upcoming)
- 👀 Monitor volunteer signups
- 🗑️ Delete events
- 📈 Track volunteer statistics

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (running locally or remote)

### Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment variables:**
   Edit `.env` file:
   ```
   PORT=3000
   MONGO_URI=mongodb://127.0.0.1:27017/volunteerHub
   ADMIN_PASSWORD=admin123
   ```

3. **Seed the database with sample data:**
   ```bash
   node seed.js
   ```

4. **Start the server:**
   ```bash
   npm start
   ```
   
   Or for development with auto-reload:
   ```bash
   npm run dev
   ```

5. **Open your browser:**
   ```
   http://localhost:3000
   ```

## 🔑 Admin Access

- **Password:** `admin123` (change in `.env` file)
- Click "Admin" in the navigation or "Create Event" to login

## 📁 Project Structure

```
volunteer-hub/
├── models/
│   └── Event.js          # MongoDB schemas and database operations
├── public/
│   ├── index.html        # Main HTML structure
│   ├── styles.css        # Modern, responsive CSS
│   └── app.js            # Frontend JavaScript logic
├── .env                  # Environment configuration
├── server.js             # Express server and API routes
├── seed.js               # Database seeding script
└── package.json          # Dependencies and scripts
```

## 🛠️ API Endpoints

### Public Routes
- `GET /api/events` - Get all upcoming events
- `GET /api/events/:id` - Get single event details
- `POST /api/events/:id/signup` - Sign up for a role

### Admin Routes (Requires Authentication)
- `POST /api/admin/login` - Admin login
- `POST /api/admin/events` - Create new event
- `GET /api/admin/events` - Get all events (including past)
- `PUT /api/admin/events/:id` - Update event
- `DELETE /api/admin/events/:id` - Delete event
- `GET /api/events/:id/stats` - Get event statistics

## 🎨 UI Features

- **Modern Design:** Clean, professional interface with gradient backgrounds
- **Responsive:** Works perfectly on desktop, tablet, and mobile
- **Interactive:** Smooth animations and transitions
- **User-Friendly:** Intuitive navigation and clear call-to-actions
- **Toast Notifications:** Real-time feedback for user actions
- **Icon Integration:** Font Awesome icons throughout

## 📊 MongoDB Collections

### Events Collection
```javascript
{
  title: String,
  date: Date,
  time: String,
  description: String,
  roles: [{
    name: String,
    totalSlots: Number,
    volunteers: [{
      name: String,
      email: String,
      signedUpAt: Date
    }]
  }],
  createdAt: Date,
  updatedAt: Date
}
```

## 🔍 View Data in MongoDB Compass

1. Open MongoDB Compass
2. Connect using: `mongodb://127.0.0.1:27017/volunteerHub`
3. Browse the `events` collection

## 🧪 Testing

Run the test script to verify database connection:
```bash
node test-db.js
```

## 📝 Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with auto-reload
- `node seed.js` - Seed database with sample events
- `node test-db.js` - Test database connection

## 🎯 Usage Examples

### Creating an Event
1. Click "Create Event" in navigation
2. Login with admin password
3. Fill in event details
4. Add volunteer roles with slot limits
5. Click "Create Event"

### Signing Up as Volunteer
1. Browse events on home page
2. Click on an event to view details
3. Choose a role
4. Enter your name and email
5. Click "Sign Up for This Role"

### Managing Events (Admin)
1. Click "Admin" in navigation
2. Login with admin password
3. View all events with statistics
4. Delete events as needed

## 🔒 Security Features

- Token-based admin authentication
- Password protection for admin routes
- Email validation for volunteer signups
- Duplicate signup prevention
- Input sanitization

## 🌟 Key Highlights

- **No Framework Overhead:** Pure vanilla JavaScript for fast performance
- **Modern CSS:** Flexbox and Grid layouts, CSS variables
- **RESTful API:** Clean, organized API structure
- **Error Handling:** Comprehensive error handling throughout
- **User Experience:** Toast notifications, loading states, smooth transitions

## 📱 Responsive Breakpoints

- Desktop: 1200px+
- Tablet: 768px - 1199px
- Mobile: < 768px

## 🤝 Contributing

Feel free to fork, modify, and use this project for your volunteer management needs!

## 📄 License

MIT License - feel free to use this project for any purpose.

## 🆘 Troubleshooting

**MongoDB Connection Issues:**
- Ensure MongoDB is running: `mongod`
- Check connection string in `.env`
- Verify port 27017 is not blocked

**Port Already in Use:**
- Change PORT in `.env` file
- Or stop the process using port 3000

**Admin Login Not Working:**
- Verify ADMIN_PASSWORD in `.env`
- Clear browser localStorage
- Check browser console for errors

---

Made with ❤️ for volunteer communities
