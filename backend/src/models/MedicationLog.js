const mongoose = require('mongoose');

const medicationLogSchema = new mongoose.Schema(
  {
    medicationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Medication',
      required: true,
      index: true,
    },
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
    scheduledTime: {
      type: Date,
      default: Date.now,
    },
    scheduledTimeSlot: {
      type: String, // "08:00", "13:00", "20:00"
      default: '08:00',
    },
    status: {
      type: String,
      enum: ['pending', 'taken', 'missed', 'skipped'],
      default: 'pending',
    },
    confirmedAt: {
      type: Date,
    },
    confirmationMethod: {
      type: String,
      enum: ['photo', 'manual', 'voice'],
      default: 'manual',
    },
    notes: {
      type: String,
      default: '',
    },
    loggedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('MedicationLog', medicationLogSchema);
