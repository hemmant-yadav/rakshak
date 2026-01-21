const mongoose = require('mongoose');

const ContactSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    default: 'default'
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  phone: {
    type: String,
    required: true,
    validate: {
      validator: function(v) {
        // Validate Indian phone number format (+91XXXXXXXXXX)
        return /^\+91\d{10}$/.test(v);
      },
      message: 'Phone number must be in format +91XXXXXXXXXX'
    }
  },
  isDefault: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Index for faster queries by userId
ContactSchema.index({ userId: 1 });

// Transform _id to id for frontend compatibility
ContactSchema.set('toJSON', {
  virtuals: true,
  transform: function(doc, ret) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    return ret;
  }
});

module.exports = mongoose.model('Contact', ContactSchema);
