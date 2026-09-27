const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema(
  {
    careCircleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CareCircle',
      required: true,
      index: true,
    },
    triggeredFor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    severity: {
      type: String,
      enum: ['low', 'medium', 'high', 'emergency'],
      default: 'medium',
      index: true,
    },
    type: {
      type: String,
      enum: [
        'high_stress',
        'high_fatigue',
        'fall_risk',
        'missed_med',
        'photo_unverified',
        'caregiver_burnout',
        'low_energy',
        'emergency_signal',
        'gentle_nudge',
        'custom',
      ],
      default: 'custom',
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    dataSnapshot: {
      type: Object,
      default: {},
    },
    status: {
      type: String,
      enum: ['new', 'acknowledged', 'resolved', 'dismissed'],
      default: 'new',
      index: true,
    },
    suggestedActions: [
      {
        label: { type: String, required: true },
        actionType: { type: String, default: 'nav_chat' }, // 'nav_plan' | 'nav_meds' | 'nav_chat' | 'nudge'
        param: { type: String, default: '' },
      },
    ],
    acknowledgedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    acknowledgedAt: {
      type: Date,
    },
    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    resolvedAt: {
      type: Date,
    },
    notifiedUsers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Compound index for querying active alerts by circle
alertSchema.index({ careCircleId: 1, status: 1, createdAt: -1 });

module.exports = mongoose.model('Alert', alertSchema);
