const mongoose = require('mongoose');

const medicationSchema = new mongoose.Schema(
  {
    careCircleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CareCircle',
      required: true,
      index: true,
    },
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    dosage: {
      type: String,
      required: true,
      trim: true, // e.g. "50mg", "1 tablet"
    },
    frequency: {
      type: String,
      default: 'once_daily', // 'once_daily', 'twice_daily', 'three_times_daily', 'as_needed'
    },
    times: {
      type: [String],
      default: ['08:00'], // ["08:00", "20:00"]
    },
    startDate: {
      type: Date,
      default: Date.now,
    },
    endDate: {
      type: Date,
    },
    instructions: {
      type: String,
      default: 'Take with food and a full glass of water',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Medication', medicationSchema);
