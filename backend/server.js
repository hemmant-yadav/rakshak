// Load environment variables from .env file
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

// Import models
const Incident = require('./models/Incident');
const User = require('./models/User');
const Contact = require('./models/Contact');

const app = express();
const PORT = process.env.PORT || 3001;

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

// MongoDB Connection
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);

    // Initialize default users if they don't exist
    await initializeDefaultUsers();
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    console.log('Server will continue without database connection. Retrying in 5 seconds...');

    // Retry connection after 5 seconds
    setTimeout(connectDB, 5000);
  }
};

// Initialize default users
const initializeDefaultUsers = async () => {
  try {
    const adminExists = await User.findOne({ username: 'admin' });
    if (!adminExists) {
      await User.create({
        username: 'admin',
        password: 'admin123',
        role: 'admin'
      });
      console.log('Default admin user created');
    }

    const moderatorExists = await User.findOne({ username: 'moderator' });
    if (!moderatorExists) {
      await User.create({
        username: 'moderator',
        password: 'mod123',
        role: 'moderator'
      });
      console.log('Default moderator user created');
    }
  } catch (error) {
    console.error('Error initializing default users:', error);
  }
};

// Helper function to check database connection
const isDBConnected = () => {
  return mongoose.connection.readyState === 1;
};

// Connect to MongoDB
connectDB();

// API Routes

// Get all incidents
app.get('/api/incidents', async (req, res) => {
  try {
    const { category, status, priority, latitude, longitude, radius } = req.query;
    let query = {};

    // Apply filters
    if (category) query.category = category;
    if (status) query.status = status;
    if (priority) query.priority = priority;

    let incidents = await Incident.find(query).sort({ createdAt: -1 });

    // Filter by radius if location provided
    if (latitude && longitude && radius) {
      const lat = parseFloat(latitude);
      const lon = parseFloat(longitude);
      const radiusKm = parseFloat(radius);

      incidents = incidents.filter(incident => {
        const distance = calculateDistance(
          lat,
          lon,
          incident.location.latitude,
          incident.location.longitude
        );
        return distance <= radiusKm;
      });
    }

    res.json(incidents);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Helper function to calculate distance between two coordinates (Haversine formula)
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Radius of the Earth in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in km
};

// Get single incident
app.get('/api/incidents/:id', async (req, res) => {
  try {
    const incident = await Incident.findById(req.params.id);
    if (!incident) {
      return res.status(404).json({ error: 'Incident not found' });
    }
    res.json(incident);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create new incident
app.post('/api/incidents', upload.single('image'), async (req, res) => {
  try {
    if (!isDBConnected()) {
      return res.status(503).json({ error: 'Database not available. Please try again later.' });
    }
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

    const incidentData = {
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
      status: 'pending'
    };

    const incident = await Incident.create(incidentData);
    res.status(201).json(incident);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// SOS Alert (High Priority)
app.post('/api/incidents/sos', upload.single('image'), async (req, res) => {
  try {
    if (!isDBConnected()) {
      return res.status(503).json({ error: 'Database not available. Please try again later.' });
    }
    const {
      description,
      latitude,
      longitude,
      address,
      isAnonymous,
      reporterName,
      reporterContact
    } = req.body;

    const incidentData = {
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
      isSOS: true
    };

    const incident = await Incident.create(incidentData);
    
    // Auto-send SMS and WhatsApp to favorite contacts if SOS
    if (incident.isSOS) {
      const recipients = await Contact.find({ userId: 'default' });
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
app.patch('/api/incidents/:id', async (req, res) => {
  try {
    const { status, notes } = req.body;
    const updateData = {};
    
    if (status) updateData.status = status;
    if (notes) updateData.moderatorNotes = notes;

    const incident = await Incident.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!incident) {
      return res.status(404).json({ error: 'Incident not found' });
    }

    res.json(incident);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete incident (Admin only)
app.delete('/api/incidents/:id', async (req, res) => {
  try {
    const incident = await Incident.findById(req.params.id);
    if (!incident) {
      return res.status(404).json({ error: 'Incident not found' });
    }

    // Delete associated image file if exists
    if (incident.image) {
      const imagePath = path.join(__dirname, incident.image);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    await Incident.findByIdAndDelete(req.params.id);
    res.json({ message: 'Incident deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Login endpoint
app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username: username.toLowerCase() });
    
    if (!user || user.password !== password) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    res.json({
      id: user._id.toString(),
      username: user.username,
      role: user.role
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get stats for admin dashboard
app.get('/api/stats', async (req, res) => {
  try {
    if (!isDBConnected()) {
      return res.status(503).json({
        total: 0,
        pending: 0,
        active: 0,
        resolved: 0,
        critical: 0,
        categoryBreakdown: []
      });
    }
    const total = await Incident.countDocuments();
    const pending = await Incident.countDocuments({ status: 'pending' });
    const active = await Incident.countDocuments({ status: 'active' });
    const resolved = await Incident.countDocuments({ status: 'resolved' });
    const critical = await Incident.countDocuments({ priority: 'critical' });

    // Get category breakdown
    const categoryStats = await Incident.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 }
        }
      }
    ]);

    const byCategory = {};
    categoryStats.forEach(stat => {
      byCategory[stat._id] = stat.count;
    });

    res.json({
      total,
      pending,
      active,
      resolved,
      critical,
      byCategory
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
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
app.get('/api/contacts', async (req, res) => {
  try {
    const userId = req.query.userId || 'default';
    const contacts = await Contact.find({ userId }).sort({ createdAt: -1 });
    res.json(contacts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/contacts', async (req, res) => {
  try {
    const { name, phone, userId = 'default' } = req.body;
    
    if (!name || !phone) {
      return res.status(400).json({ error: 'Name and phone are required' });
    }

    const formattedPhone = formatIndianPhoneNumber(phone);
    if (!formattedPhone) {
      return res.status(400).json({ error: 'Phone number must be a valid 10-digit Indian mobile number (e.g., 9876543210 or +919876543210)' });
    }

    const contact = await Contact.create({
      userId,
      name,
      phone: formattedPhone,
      isDefault: false
    });

    res.status(201).json(contact);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/contacts/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.query.userId || 'default';

    const contact = await Contact.findOne({ _id: id, userId });
    if (!contact) {
      return res.status(404).json({ error: 'Contact not found' });
    }

    // Don't allow deletion of default contacts
    if (contact.isDefault) {
      return res.status(400).json({ error: 'Cannot delete default contact' });
    }

    await Contact.findByIdAndDelete(id);
    res.json({ message: 'Contact deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Send SOS SMS to favorite contacts
app.post('/api/incidents/sos/send-sms', async (req, res) => {
  try {
    const { incidentId, userId = 'default' } = req.body;
    
    const incident = await Incident.findById(incidentId);
    if (!incident || !incident.isSOS) {
      return res.status(400).json({ error: 'Invalid SOS incident' });
    }

    const contacts = await Contact.find({ userId });
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

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log('Waiting for MongoDB connection...');
});

