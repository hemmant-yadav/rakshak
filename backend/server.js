// Load environment variables from .env file
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'));
    }
  }
});

// Helper to ensure phone numbers are in Indian format (+91XXXXXXXXXX)
const formatIndianPhoneNumber = (phone) => {
  if (!phone) return null;
  const digits = phone.replace(/\D/g, '');

  let sanitized = digits;
  if (sanitized.startsWith('91') && sanitized.length === 12) {
    sanitized = sanitized.slice(2);
  }

  if (sanitized.length > 10) {
    sanitized = sanitized.slice(-10);
  }

  if (sanitized.length !== 10) {
    return null;
  }

  // Indian mobile numbers typically start with 6,7,8,9
  if (!['6', '7', '8', '9'].includes(sanitized.charAt(0))) {
    return null;
  }

  return `+91${sanitized}`;
};

// In-memory data storage
let incidents = [];
let users = [
  { id: 'admin', username: 'admin', password: 'admin123', role: 'admin' },
  { id: 'moderator1', username: 'moderator', password: 'mod123', role: 'moderator' }
];
// Favorite contacts/emergency numbers (user-based)
let favoriteContacts = {
  default: []
};

// Helper function to get incident by ID
const getIncidentById = (id) => incidents.find(inc => inc.id === id);

// API Routes

// Get all incidents
app.get('/api/incidents', (req, res) => {
  const { category, status, priority } = req.query;
  let filtered = [...incidents];

  if (category) {
    filtered = filtered.filter(inc => inc.category === category);
  }
  if (status) {
    filtered = filtered.filter(inc => inc.status === status);
  }
  if (priority) {
    filtered = filtered.filter(inc => inc.priority === priority);
  }

  res.json(filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
});

// Get single incident
app.get('/api/incidents/:id', (req, res) => {
  const incident = getIncidentById(req.params.id);
  if (!incident) {
    return res.status(404).json({ error: 'Incident not found' });
  }
  res.json(incident);
});

// Create new incident
app.post('/api/incidents', upload.single('image'), (req, res) => {
  try {
    const {
      title,
      description,
      category,
      latitude,
      longitude,
      address,
      isAnonymous,
      reporterName,
      reporterContact,
      priority
    } = req.body;

    const incident = {
      id: uuidv4(),
      title,
      description,
      category: category || 'other',
      location: {
        latitude: parseFloat(latitude) || 40.7128,
        longitude: parseFloat(longitude) || -74.0060,
        address: address || 'Address not provided'
      },
      isAnonymous: isAnonymous === 'true' || isAnonymous === true,
      reporter: {
        name: isAnonymous === 'true' || isAnonymous === true ? 'Anonymous' : (reporterName || 'Unknown'),
        contact: isAnonymous === 'true' || isAnonymous === true ? null : reporterContact
      },
      image: req.file ? `/uploads/${req.file.filename}` : null,
      priority: priority || 'normal',
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    incidents.push(incident);
    res.status(201).json(incident);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// SOS Alert (High Priority)
app.post('/api/incidents/sos', upload.single('image'), (req, res) => {
  try {
    const {
      description,
      latitude,
      longitude,
      address,
      isAnonymous,
      reporterName,
      reporterContact
    } = req.body;

    const incident = {
      id: uuidv4(),
      title: 'SOS EMERGENCY',
      description: description || 'Emergency situation reported',
      category: 'emergency',
      location: {
        latitude: parseFloat(latitude) || 40.7128,
        longitude: parseFloat(longitude) || -74.0060,
        address: address || 'Address not provided'
      },
      isAnonymous: isAnonymous === 'true' || isAnonymous === true,
      reporter: {
        name: isAnonymous === 'true' || isAnonymous === true ? 'Anonymous' : (reporterName || 'Unknown'),
        contact: isAnonymous === 'true' || isAnonymous === true ? null : reporterContact
      },
      image: req.file ? `/uploads/${req.file.filename}` : null,
      priority: 'critical',
      status: 'active',
      isSOS: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    incidents.push(incident);
    
    // Auto-send SMS and WhatsApp to favorite contacts if SOS
    if (incident.isSOS) {
      const recipients = favoriteContacts['default'] || [];
      if (recipients.length > 0) {
        const message = `🚨 SOS ALERT 🚨
Emergency at: ${incident.location.address}
Description: ${incident.description}
Time: ${new Date(incident.createdAt).toLocaleString()}
Location: ${incident.location.latitude}, ${incident.location.longitude}
Google Maps: https://www.google.com/maps?q=${incident.location.latitude},${incident.location.longitude}
Please respond immediately!`;
        
        // Send SMS and WhatsApp to all favorite contacts asynchronously
        recipients.forEach(contact => {
          // Send SMS
          sendSMS(contact.phone, message).catch(err => 
            console.error(`Failed to send SMS to ${contact.name}:`, err)
          );
          
          // Send WhatsApp
          sendWhatsApp(contact.phone, message).catch(err => 
            console.error(`Failed to send WhatsApp to ${contact.name}:`, err)
          );
        });
      }
    }
    
    res.status(201).json(incident);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update incident status (Admin/Moderator)
app.patch('/api/incidents/:id', (req, res) => {
  const incident = getIncidentById(req.params.id);
  if (!incident) {
    return res.status(404).json({ error: 'Incident not found' });
  }

  const { status, notes } = req.body;
  if (status) {
    incident.status = status;
  }
  if (notes) {
    incident.moderatorNotes = notes;
  }
  incident.updatedAt = new Date().toISOString();

  res.json(incident);
});

// Delete incident (Admin only)
app.delete('/api/incidents/:id', (req, res) => {
  const index = incidents.findIndex(inc => inc.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Incident not found' });
  }

  const incident = incidents[index];
  // Delete associated image file if exists
  if (incident.image) {
    const imagePath = path.join(__dirname, incident.image);
    if (fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
    }
  }

  incidents.splice(index, 1);
  res.json({ message: 'Incident deleted successfully' });
});

// Login endpoint
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  const user = users.find(u => u.username === username && u.password === password);
  
  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  res.json({
    id: user.id,
    username: user.username,
    role: user.role
  });
});

// Get stats for admin dashboard
app.get('/api/stats', (req, res) => {
  const stats = {
    total: incidents.length,
    pending: incidents.filter(inc => inc.status === 'pending').length,
    active: incidents.filter(inc => inc.status === 'active').length,
    resolved: incidents.filter(inc => inc.status === 'resolved').length,
    critical: incidents.filter(inc => inc.priority === 'critical').length,
    byCategory: {}
  };

  incidents.forEach(inc => {
    stats.byCategory[inc.category] = (stats.byCategory[inc.category] || 0) + 1;
  });

  res.json(stats);
});

// SMS Integration Helper (Mock - replace with Twilio or similar)
const sendSMS = async (phoneNumber, message) => {
  try {
    // Mock SMS service - replace with actual SMS API (Twilio, etc.)
    // Example with Twilio:
    // const twilio = require('twilio');
    // const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    // await client.messages.create({
    //   body: message,
    //   to: phoneNumber,
    //   from: process.env.TWILIO_PHONE_NUMBER
    // });
    
    // For now, just log the message (in production, use real SMS service)
    console.log(`[SMS] To: ${phoneNumber}`);
    console.log(`[SMS] Message: ${message}`);
    console.log(`[SMS] Status: Sent (Mock)`);
    
    return { success: true, messageId: uuidv4() };
  } catch (error) {
    console.error('SMS Error:', error);
    return { success: false, error: error.message };
  }
};

// WhatsApp Integration Helper (Mock - replace with Twilio WhatsApp or WhatsApp Business API)
const sendWhatsApp = async (phoneNumber, message) => {
  try {
    // Mock WhatsApp service - replace with actual WhatsApp API
    // Example with Twilio WhatsApp:
    // const twilio = require('twilio');
    // const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    // await client.messages.create({
    //   body: message,
    //   from: `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`, // Format: whatsapp:+14155238886
    //   to: `whatsapp:${phoneNumber}` // Format: whatsapp:+1234567890
    // });
    
    // Example with WhatsApp Business API (Meta):
    // const axios = require('axios');
    // const response = await axios.post(
    //   `https://graph.facebook.com/v18.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`,
    //   {
    //     messaging_product: 'whatsapp',
    //     to: phoneNumber,
    //     type: 'text',
    //     text: { body: message }
    //   },
    //   {
    //     headers: {
    //       'Authorization': `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
    //       'Content-Type': 'application/json'
    //     }
    //   }
    // );
    
    // For now, just log the message (in production, use real WhatsApp service)
    console.log(`[WhatsApp] To: ${phoneNumber}`);
    console.log(`[WhatsApp] Message: ${message}`);
    console.log(`[WhatsApp] Status: Sent (Mock)`);
    
    return { success: true, messageId: uuidv4() };
  } catch (error) {
    console.error('WhatsApp Error:', error);
    return { success: false, error: error.message };
  }
};

// Favorite Contacts API
app.get('/api/contacts', (req, res) => {
  const userId = req.query.userId || 'default';
  const contacts = favoriteContacts[userId] || [];
  res.json(contacts);
});

app.post('/api/contacts', (req, res) => {
  try {
    const { name, phone, userId = 'default' } = req.body;
    
    if (!name || !phone) {
      return res.status(400).json({ error: 'Name and phone are required' });
    }

    const formattedPhone = formatIndianPhoneNumber(phone);
    if (!formattedPhone) {
      return res.status(400).json({ error: 'Phone number must be a valid 10-digit Indian mobile number (e.g., 9876543210 or +919876543210)' });
    }

    const contact = {
      id: uuidv4(),
      name,
      phone: formattedPhone,
      isDefault: false,
      createdAt: new Date().toISOString()
    };

    if (!favoriteContacts[userId]) {
      favoriteContacts[userId] = [];
    }

    favoriteContacts[userId].push(contact);
    res.status(201).json(contact);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/contacts/:id', (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.query.userId || 'default';

    if (!favoriteContacts[userId]) {
      return res.status(404).json({ error: 'User contacts not found' });
    }

    const index = favoriteContacts[userId].findIndex(c => c.id === id);
    if (index === -1) {
      return res.status(404).json({ error: 'Contact not found' });
    }

    // Don't allow deletion of default contacts
    if (favoriteContacts[userId][index].isDefault) {
      return res.status(400).json({ error: 'Cannot delete default contact' });
    }

    favoriteContacts[userId].splice(index, 1);
    res.json({ message: 'Contact deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Send SOS SMS to favorite contacts
app.post('/api/incidents/sos/send-sms', async (req, res) => {
  try {
    const { incidentId, userId = 'default' } = req.body;
    
    const incident = getIncidentById(incidentId);
    if (!incident || !incident.isSOS) {
      return res.status(400).json({ error: 'Invalid SOS incident' });
    }

    const contacts = favoriteContacts[userId] || [];
    if (contacts.length === 0) {
      return res.status(400).json({ error: 'No favorite contacts found' });
    }

    const message = `🚨 SOS ALERT 🚨
Emergency at: ${incident.location.address}
Description: ${incident.description}
Time: ${new Date(incident.createdAt).toLocaleString()}
Location: ${incident.location.latitude}, ${incident.location.longitude}
Please respond immediately!`;

    const results = [];
    for (const contact of contacts) {
      const result = await sendSMS(contact.phone, message);
      results.push({
        contact: contact.name,
        phone: contact.phone,
        success: result.success,
        error: result.error
      });
    }

    res.json({
      success: true,
      sent: results.filter(r => r.success).length,
      total: results.length,
      results
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Initialize with mock data
const initializeMockData = () => {
  incidents = [];
};

// Start server
app.listen(PORT, () => {
  initializeMockData();
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Mock data initialized with ${incidents.length} incidents`);
});

