// API Configuration
const API = '/api';

// Toast Notification
function showToast(message, type = 'success') {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.className = `toast show ${type}`;
  
  setTimeout(() => {
    toast.classList.remove('show');
  }, 3000);
}

// Section Navigation
function showSection(sectionName) {
  // Hide all sections
  document.querySelectorAll('.section').forEach(section => {
    section.classList.add('hidden');
  });
  
  // Show selected section
  document.getElementById(sectionName).classList.remove('hidden');
  
  // Update nav links
  document.querySelectorAll('.nav-link').forEach(link => {
    link.classList.remove('active');
    if (link.getAttribute('data-section') === sectionName) {
      link.classList.add('active');
    }
  });
  
  // Load data for specific sections
  if (sectionName === 'home') {
    loadEvents();
  } else if (sectionName === 'admin') {
    loadAdmin();
  }
}

// Authentication
function isAdminToken() {
  return !!localStorage.getItem('adminToken');
}

function checkAuthAndShow(section) {
  if (isAdminToken()) {
    showSection(section);
  } else {
    localStorage.setItem('intendedSection', section);
    showSection('login');
  }
}

function logout() {
  localStorage.removeItem('adminToken');
  showToast('Logged out successfully', 'success');
  showSection('home');
}

// Login Form Handler
document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const password = document.getElementById('password').value;
  
  try {
    const response = await fetch(`${API}/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password })
    });
    
    const data = await response.json();
    
    if (response.ok && data.token) {
      localStorage.setItem('adminToken', data.token);
      showToast('Login successful!', 'success');
      
      const intendedSection = localStorage.getItem('intendedSection') || 'admin';
      localStorage.removeItem('intendedSection');
      showSection(intendedSection);
      
      document.getElementById('password').value = '';
    } else {
      showToast(data.error || 'Login failed', 'error');
    }
  } catch (error) {
    showToast('Login error: ' + error.message, 'error');
  }
});

// Load Events (Public View)
async function loadEvents() {
  const eventList = document.getElementById('eventList');
  eventList.innerHTML = '<div class="loading"><i class="fas fa-spinner fa-spin"></i> Loading events...</div>';
  
  try {
    const response = await fetch(`${API}/events`);
    const events = await response.json();
    
    if (!events || events.length === 0) {
      eventList.innerHTML = `
        <div class="loading">
          <i class="fas fa-calendar-times"></i>
          <p>No upcoming events at the moment.</p>
          <p style="margin-top: 1rem;">
            <a href="#" onclick="checkAuthAndShow('create')" class="btn btn-primary">
              <i class="fas fa-plus"></i> Create First Event
            </a>
          </p>
        </div>
      `;
      return;
    }
    
    eventList.innerHTML = events.map(event => {
      const totalSlots = event.roles.reduce((sum, role) => sum + role.totalSlots, 0);
      const filledSlots = event.roles.reduce((sum, role) => sum + role.volunteers.length, 0);
      const availableSlots = totalSlots - filledSlots;
      
      return `
        <div class="event-card" onclick="viewEvent('${event._id}')">
          <div class="event-card-header">
            <h3 class="event-card-title">${event.title}</h3>
            <div class="event-card-meta">
              <span><i class="fas fa-calendar"></i>${new Date(event.date).toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}</span>
              <span><i class="fas fa-clock"></i>${event.time}</span>
            </div>
          </div>
          <div class="event-card-body">
            <p class="event-card-description">${event.description}</p>
            <div class="event-card-roles">
              ${event.roles.map(role => {
                const roleFilled = role.volunteers.length;
                const isFull = roleFilled >= role.totalSlots;
                return `
                  <span class="role-badge ${isFull ? 'full' : ''}">
                    <i class="fas ${isFull ? 'fa-times-circle' : 'fa-check-circle'}"></i>
                    ${role.name}: ${roleFilled}/${role.totalSlots}
                  </span>
                `;
              }).join('')}
            </div>
            <div style="margin-top: 1rem; padding-top: 1rem; border-top: 1px solid var(--light-gray);">
              <strong style="color: ${availableSlots > 0 ? 'var(--secondary)' : 'var(--danger)'};">
                <i class="fas fa-users"></i> ${availableSlots} ${availableSlots === 1 ? 'spot' : 'spots'} available
              </strong>
            </div>
          </div>
        </div>
      `;
    }).join('');
  } catch (error) {
    eventList.innerHTML = `
      <div class="loading">
        <i class="fas fa-exclamation-triangle"></i>
        <p>Error loading events: ${error.message}</p>
      </div>
    `;
  }
}

// View Single Event
async function viewEvent(eventId) {
  try {
    const response = await fetch(`${API}/events/${eventId}`);
    
    if (!response.ok) {
      showToast('Could not load event', 'error');
      return;
    }
    
    const event = await response.json();
    
    const rolesHTML = event.roles.map((role, index) => {
      const filled = role.volunteers.length;
      const isFull = filled >= role.totalSlots;
      
      return `
        <div class="role-card ${isFull ? 'full' : ''}">
          <div class="role-card-header">
            <h3 class="role-card-title">
              <i class="fas fa-user-tag"></i> ${role.name}
            </h3>
            <span class="role-slots ${isFull ? 'full' : ''}">
              ${filled}/${role.totalSlots} filled
            </span>
          </div>
          
          ${isFull ? `
            <div style="background: var(--white); padding: 1rem; border-radius: 8px; margin-top: 1rem;">
              <p style="color: var(--danger); font-weight: 600;">
                <i class="fas fa-info-circle"></i> This role is currently full
              </p>
            </div>
          ` : `
            <form onsubmit="signup(event, '${event._id}', ${index})" style="margin-top: 1rem;">
              <div class="form-row">
                <div class="form-group" style="margin-bottom: 0.75rem;">
                  <input type="text" placeholder="Your full name" required style="padding: 0.75rem;">
                </div>
                <div class="form-group" style="margin-bottom: 0.75rem;">
                  <input type="email" placeholder="Your email address" required style="padding: 0.75rem;">
                </div>
              </div>
              <button type="submit" class="btn btn-primary">
                <i class="fas fa-hand-paper"></i> Sign Up for This Role
              </button>
            </form>
          `}
          
          ${role.volunteers.length > 0 ? `
            <div class="volunteers-list">
              <h4><i class="fas fa-users"></i> Registered Volunteers (${role.volunteers.length})</h4>
              ${role.volunteers.map(volunteer => `
                <div class="volunteer-item">
                  <i class="fas fa-user-check"></i>
                  <strong>${volunteer.name}</strong> - ${volunteer.email}
                </div>
              `).join('')}
            </div>
          ` : ''}
        </div>
      `;
    }).join('');
    
    document.getElementById('eventDetails').innerHTML = `
      <div class="event-detail">
        <div class="event-detail-header">
          <h2 class="event-detail-title">${event.title}</h2>
          <div class="event-detail-meta">
            <span><i class="fas fa-calendar-alt"></i> ${new Date(event.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
            <span><i class="fas fa-clock"></i> ${event.time}</span>
          </div>
        </div>
        <div class="event-detail-body">
          <p class="event-detail-description">${event.description}</p>
          <h3 style="margin-bottom: 1.5rem; display: flex; align-items: center; gap: 0.5rem;">
            <i class="fas fa-tasks"></i> Volunteer Roles
          </h3>
          <div class="roles-list">
            ${rolesHTML}
          </div>
        </div>
      </div>
    `;
    
    showSection('eventView');
  } catch (error) {
    showToast('Error loading event: ' + error.message, 'error');
  }
}

// Signup for Event
async function signup(e, eventId, roleIndex) {
  e.preventDefault();
  
  const form = e.target;
  const name = form[0].value.trim();
  const email = form[1].value.trim().toLowerCase();
  
  try {
    const response = await fetch(`${API}/events/${eventId}/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ roleIndex, name, email })
    });
    
    const data = await response.json();
    
    if (response.ok) {
      showToast('Successfully signed up! Check your email for confirmation.', 'success');
      viewEvent(eventId);
    } else {
      showToast(data.error || 'Signup failed', 'error');
    }
  } catch (error) {
    showToast('Signup error: ' + error.message, 'error');
  }
}

// Role Management
function addRole(name = '', slots = 1) {
  const container = document.getElementById('rolesContainer');
  const roleDiv = document.createElement('div');
  roleDiv.className = 'role-input';
  roleDiv.innerHTML = `
    <input type="text" placeholder="Role name (e.g., Food Sorter)" value="${name}" required>
    <input type="number" min="1" value="${slots}" placeholder="Slots" required>
    <button type="button" onclick="this.parentElement.remove()" class="btn btn-danger btn-sm">
      <i class="fas fa-trash"></i> Remove
    </button>
  `;
  container.appendChild(roleDiv);
}

// Create Event Form Handler
document.getElementById('createForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const roles = [];
  document.querySelectorAll('.role-input').forEach(roleInput => {
    const name = roleInput.children[0].value.trim();
    const totalSlots = Number(roleInput.children[1].value);
    if (name && totalSlots > 0) {
      roles.push({ name, totalSlots });
    }
  });
  
  if (roles.length === 0) {
    showToast('Please add at least one role', 'error');
    return;
  }
  
  const payload = {
    title: document.getElementById('title').value.trim(),
    date: document.getElementById('date').value,
    time: document.getElementById('time').value.trim(),
    description: document.getElementById('description').value.trim(),
    roles
  };
  
  const token = localStorage.getItem('adminToken');
  
  try {
    const response = await fetch(`${API}/admin/events`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });
    
    const data = await response.json();
    
    if (response.ok) {
      showToast('Event created successfully!', 'success');
      document.getElementById('createForm').reset();
      document.getElementById('rolesContainer').innerHTML = '';
      addRole(); // Add one empty role
      showSection('home');
    } else {
      showToast(data.error || 'Failed to create event', 'error');
    }
  } catch (error) {
    showToast('Error creating event: ' + error.message, 'error');
  }
});

// Load Admin Dashboard
async function loadAdmin() {
  const adminList = document.getElementById('adminList');
  adminList.innerHTML = '<div class="loading"><i class="fas fa-spinner fa-spin"></i> Loading...</div>';
  
  const token = localStorage.getItem('adminToken');
  
  if (!token) {
    showSection('login');
    return;
  }
  
  try {
    const response = await fetch(`${API}/admin/events`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (!response.ok) {
      showToast('Unauthorized or error loading admin data', 'error');
      showSection('login');
      return;
    }
    
    const events = await response.json();
    
    if (events.length === 0) {
      adminList.innerHTML = `
        <div class="loading">
          <i class="fas fa-inbox"></i>
          <p>No events created yet.</p>
        </div>
      `;
      return;
    }
    
    adminList.innerHTML = events.map(event => {
      const totalSlots = event.roles.reduce((sum, role) => sum + role.totalSlots, 0);
      const filledSlots = event.roles.reduce((sum, role) => sum + role.volunteers.length, 0);
      const isPast = new Date(event.date) < new Date();
      
      return `
        <div class="admin-card">
          <div class="admin-card-info">
            <h3>${event.title} ${isPast ? '<span style="color: var(--gray); font-size: 0.9rem;">(Past)</span>' : ''}</h3>
            <div class="admin-card-meta">
              <i class="fas fa-calendar"></i> ${new Date(event.date).toLocaleDateString()} at ${event.time}
              <br>
              <i class="fas fa-users"></i> ${filledSlots}/${totalSlots} volunteers signed up
            </div>
          </div>
          <div class="admin-card-actions">
            <button onclick="viewEvent('${event._id}')" class="btn btn-primary btn-sm">
              <i class="fas fa-eye"></i> View
            </button>
            <button onclick="adminDelete('${event._id}')" class="btn btn-danger btn-sm">
              <i class="fas fa-trash"></i> Delete
            </button>
          </div>
        </div>
      `;
    }).join('');
  } catch (error) {
    adminList.innerHTML = `
      <div class="loading">
        <i class="fas fa-exclamation-triangle"></i>
        <p>Error loading admin data: ${error.message}</p>
      </div>
    `;
  }
}

// Delete Event (Admin)
async function adminDelete(eventId) {
  if (!confirm('Are you sure you want to delete this event? This action cannot be undone.')) {
    return;
  }
  
  const token = localStorage.getItem('adminToken');
  
  try {
    const response = await fetch(`${API}/admin/events/${eventId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    const data = await response.json();
    
    if (response.ok) {
      showToast('Event deleted successfully', 'success');
      loadAdmin();
    } else {
      showToast(data.error || 'Failed to delete event', 'error');
    }
  } catch (error) {
    showToast('Error deleting event: ' + error.message, 'error');
  }
}

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
  // Add one empty role by default
  addRole();
  
  // Show home section and load events
  showSection('home');
});
