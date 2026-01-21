const mongoose = require('mongoose');

const IncidentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    required: true,
    default: 'other',
    enum: ['emergency', 'suspicious', 'infrastructure', 'health', 'environment', 'community', 'destruction', 'noise', 'traffic', 'theft', 'fire', 'flooding', 'animal', 'lighting', 'parking', 'waste', 'accident', 'assault', 'drug', 'trespassing', 'water', 'electrical', 'other']
  },
  location: {
    latitude: {
      type: Number,
      required: true,
      default: 40.7128
    },
    longitude: {
      type: Number,
      required: true,
      default: -74.0060
    },
    address: {
      type: String,
      required: true,
      default: 'Address not provided'
    }
  },
  isAnonymous: {
    type: Boolean,
    default: false
  },
  reporter: {
    name: {
      type: String,
      default: 'Unknown'
    },
    contact: {
      type: String,
      default: null
    }
  },
  image: {
    type: String,
    default: null
  },
  priority: {
    type: String,
    required: true,
    default: 'normal',
    enum: ['critical', 'high', 'normal', 'low']
  },
  status: {
    type: String,
    required: true,
    default: 'pending',
    enum: ['pending', 'active', 'resolved']
  },
  isSOS: {
    type: Boolean,
    default: false
  },
  moderatorNotes: {
    type: String,
    default: null
  }
}, {
  timestamps: true // This adds createdAt and updatedAt automatically
});

// Create indexes for better query performance
IncidentSchema.index({ category: 1 });
IncidentSchema.index({ status: 1 });
IncidentSchema.index({ priority: 1 });
IncidentSchema.index({ createdAt: -1 });
IncidentSchema.index({ 'location.latitude': 1, 'location.longitude': 1 });

// Transform _id to id for frontend compatibility
IncidentSchema.set('toJSON', {
  virtuals: true,
  transform: function(doc, ret) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    return ret;
  }
});

module.exports = mongoose.model('Incident', IncidentSchema);
