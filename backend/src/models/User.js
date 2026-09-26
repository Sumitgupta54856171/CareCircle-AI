const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ['patient', 'caregiver', 'secondary', 'admin'],
      default: 'patient',
    },
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
      default: '',
    },
    preferredLanguage: {
      type: String,
      default: 'en',
    },
    voiceEnabled: {
      type: Boolean,
      default: false,
    },
    // Patient specific
    conditions: {
      type: [String],
      default: [], // e.g. ["stroke", "diabetes", "elderly", "postnatal", "autism_family"]
    },
    emergencyContacts: [
      {
        name: String,
        phone: String,
        relation: String,
      },
    ],
    // Caregiver specific
    burnoutScore: {
      type: Number,
      default: 20, // 0-100
    },
    capacityLevel: {
      type: String,
      enum: ['high', 'medium', 'low'],
      default: 'medium',
    },
    lastActiveAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Method to verify password
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.passwordHash);
};

// Static helper to hash password
userSchema.statics.hashPassword = async function (password) {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
};

module.exports = mongoose.model('User', userSchema);
