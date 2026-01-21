# 🛡️ Rakshak - Community Safety Platform

A full-stack community safety platform built with React, Tailwind CSS, and Node.js/Express. Rakshak allows residents to report safety incidents, send SOS alerts to emergency contacts via SMS, view incidents on an interactive map, and includes comprehensive admin/moderator panels for incident management.

## Features

- ✅ **Dashboard Homepage**: Beautiful dashboard with quick stats, recent incidents, and quick access to all features
- ✅ **Incident Reporting**: Report incidents with images, categories, location, and optional anonymous reporting
- ✅ **Live Map View**: Interactive map showing all reported incidents with color-coded markers by priority
- ✅ **SOS Button**: High-priority emergency alert system with automatic SMS notifications to favorite contacts
- ✅ **Emergency Contacts**: Manage favorite emergency contacts that receive SMS alerts during SOS situations
- ✅ **SMS Integration**: SOS alerts automatically send SMS messages to all favorite contacts (configurable with Twilio)
- ✅ **Category Filtering**: Filter incidents by category, status, and priority
- ✅ **Admin Dashboard**: Comprehensive dashboard with statistics and incident management
- ✅ **Moderator Panel**: Review and manage pending incidents, update statuses, and add notes
- ✅ **Image Upload**: Support for uploading incident photos
- ✅ **Anonymous Reporting**: Option to report incidents anonymously
- ✅ **Modern Theme**: Beautiful indigo/blue color scheme with professional UI
- ✅ **In-Memory Storage**: No database required - uses temporary in-memory storage

## New Features in This Version

- 🎨 **New Theme**: Modern indigo/blue color scheme
- 🏠 **Dashboard**: Centralized dashboard for easy access to all features
- 📞 **Emergency Contacts**: Add and manage favorite emergency contacts
- 📱 **SMS Integration**: SOS alerts automatically send SMS to emergency contacts
- 🔄 **Renamed Categories**: "Vandalism" renamed to "Destruction"
- 🛡️ **App Name**: "Rakshak" - Your protector, your safety guardian
- 🎨 **Modern UI**: Beautiful gradients, animations, and glass-morphism effects
- 🔤 **Custom Fonts**: Poppins and Inter for a modern, catchy typography

## Project Structure

```
snpsu/
├── backend/
│   ├── server.js              # Express server with API endpoints
│   ├── package.json           # Backend dependencies
│   └── uploads/               # Uploaded images directory (created automatically)
│
├── frontend/
│   ├── public/
│   │   └── index.html         # HTML template
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.js      # Navigation component
│   │   │   ├── IncidentCard.js # Incident display card
│   │   │   └── SOSButton.js   # SOS emergency button
│   │   ├── pages/
│   │   │   ├── Home.js        # Home page with incident list
│   │   │   ├── ReportIncident.js # Incident reporting form
│   │   │   ├── MapView.js     # Interactive map view
│   │   │   ├── AdminDashboard.js # Admin panel
│   │   │   ├── ModeratorPanel.js # Moderator panel
│   │   │   └── Login.js       # Login page
│   │   ├── context/
│   │   │   └── AuthContext.js # Authentication context
│   │   ├── App.js             # Main app component with routing
│   │   ├── index.js           # React entry point
│   │   └── index.css          # Tailwind CSS imports
│   ├── package.json           # Frontend dependencies
│   ├── tailwind.config.js     # Tailwind configuration
│   └── postcss.config.js      # PostCSS configuration
│
└── README.md                  # This file
```

## Prerequisites

Before running the application, make sure you have the following installed:

- **Node.js** (v14 or higher)
- **npm** (comes with Node.js)

## Installation & Setup

### 1. Install Backend Dependencies

```bash
cd backend
npm install
```

### 2. Install Frontend Dependencies

```bash
cd ../frontend
npm install
```

## Running the Application

### Option 1: Run Separately (Recommended for Development)

#### Terminal 1 - Start Backend Server

```bash
cd backend
npm start
```

The backend server will start on `http://localhost:3001`

#### Terminal 2 - Start Frontend Development Server

```bash
cd frontend
npm start
```

The frontend will automatically open in your browser at `http://localhost:3000`

### Option 2: Development Mode with Auto-reload

For backend development with auto-reload (requires nodemon):

```bash
cd backend
npm run dev
```

## API Endpoints

### Incidents
- `GET /api/incidents` - Get all incidents (supports query params: category, status, priority)
- `GET /api/incidents/:id` - Get single incident
- `POST /api/incidents` - Create new incident (multipart/form-data)
- `POST /api/incidents/sos` - Create SOS emergency alert (multipart/form-data, automatically sends SMS to favorite contacts)
- `PATCH /api/incidents/:id` - Update incident status/notes (moderator/admin)
- `DELETE /api/incidents/:id` - Delete incident (admin only)

### Emergency Contacts
- `GET /api/contacts` - Get all favorite contacts for user
- `POST /api/contacts` - Add new favorite contact (name, phone, userId)
- `DELETE /api/contacts/:id` - Delete favorite contact

### SMS
- `POST /api/incidents/sos/send-sms` - Manually send SOS SMS to favorite contacts

### Authentication
- `POST /api/auth/login` - Login (username, password)

### Statistics
- `GET /api/stats` - Get dashboard statistics

## SMS Configuration (Optional)

The app includes SMS integration for SOS alerts. By default, it uses a mock SMS service that logs messages to the console. To enable real SMS:

1. **For Twilio** (recommended):
   - Sign up for a Twilio account
   - Get your Account SID, Auth Token, and Phone Number
   - Uncomment the Twilio code in `backend/server.js` (in the `sendSMS` function)
   - Set environment variables:
     ```bash
     TWILIO_ACCOUNT_SID=your_account_sid
     TWILIO_AUTH_TOKEN=your_auth_token
     TWILIO_PHONE_NUMBER=+1234567890
     ```
   - Install Twilio SDK: `npm install twilio` in the backend directory

2. **For other SMS services**: Modify the `sendSMS` function in `backend/server.js`

**Note**: SMS alerts are automatically sent to all favorite emergency contacts when a SOS alert is triggered.

## Demo Credentials

### Admin Account
- **Username:** `admin`
- **Password:** `admin123`

### Moderator Account
- **Username:** `moderator`
- **Password:** `mod123`

## Features Walkthrough

### 1. Reporting an Incident
- Click "Report Incident" in the navigation
- Fill out the form with incident details
- Optionally upload an image
- Choose to report anonymously
- Use "Use My Location" button to capture GPS coordinates

### 2. Viewing on Map
- Navigate to "Map View" to see all incidents on an interactive map
- Click on markers to see incident details
- Color coding:
  - 🔴 Red: Critical/SOS incidents
  - 🟠 Orange: High priority
  - 🔵 Blue: Normal priority
  - ⚫ Gray: Low priority

### 3. SOS Emergency Alert
- Click the floating red "🚨 SOS" button (bottom-right corner)
- Fill out emergency details
- Alert is automatically marked as critical priority
- Creates an immediate high-priority incident
- **Automatically sends SMS to all favorite emergency contacts** (if configured)

### 4. Admin Dashboard
- Login with admin credentials
- View comprehensive statistics
- See incidents by category breakdown
- Delete incidents if needed

### 5. Moderator Panel
- Login with moderator credentials
- Review pending incidents
- Approve, resolve, or edit incidents
- Add moderator notes to incidents
- Update incident statuses

### 6. Emergency Contacts Management
- Navigate to "Contacts" in the navigation bar
- Add favorite emergency contacts with names and phone numbers
- These contacts will automatically receive SMS alerts during SOS situations
- Manage and delete contacts as needed

## Incident Categories

- Emergency
- Suspicious Activity
- Destruction (formerly Vandalism)
- Infrastructure Issue
- Noise Complaint
- Other

## Incident Statuses

- **Pending**: Newly reported, awaiting review
- **Active**: Approved and being monitored
- **Resolved**: Incident has been resolved

## Incident Priorities

- **Critical**: Emergency/SOS alerts
- **High**: Urgent matters
- **Normal**: Standard priority
- **Low**: Minor issues

## Technology Stack

### Frontend
- React 18
- React Router DOM
- Tailwind CSS
- Leaflet & React-Leaflet (for maps)
- Axios (HTTP client)

### Backend
- Node.js
- Express.js
- Multer (file uploads)
- CORS
- UUID

## Notes

- **In-Memory Storage**: All data is stored in memory and will be lost when the server restarts
- **Image Storage**: Uploaded images are stored in `backend/uploads/` directory
- **Mock Data**: The backend initializes with 3 sample incidents on startup
- **Geolocation**: The app attempts to use browser geolocation API, falls back to default coordinates if unavailable

## Troubleshooting

### Port Already in Use
If port 3000 or 3001 is already in use:
- Backend: Change `PORT` in `backend/server.js`
- Frontend: React will prompt to use a different port

### Images Not Loading
- Ensure the backend server is running
- Check that `backend/uploads/` directory exists
- Verify image paths in the API responses

### Map Not Displaying
- Check that Leaflet CSS is loaded (see `public/index.html`)
- Verify internet connection (map tiles are loaded from OpenStreetMap)

## Future Enhancements

- Database integration (MongoDB, PostgreSQL, etc.)
- Real-time notifications
- User registration system
- Email/SMS alerts
- Mobile app
- Advanced search and filtering
- Incident comments/discussions
- Analytics and reporting

## License

This is a prototype project for demonstration purposes.

