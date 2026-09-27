const mongoose = require('mongoose');

const monitoringRecordSchema = new mongoose.Schema(
  {
    careCircleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CareCircle',
      required: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: [
        'patient_vitals',
        'patient_stress',
        'patient_fatigue',
        'patient_fall_risk',
        'caregiver_burnout',
        'medication_check',
      ],
      default: 'patient_stress',
    },
    source: {
      type: String,
      enum: ['camera', 'voice', 'manual', 'wearable_sim'],
      default: 'camera',
    },
    data: {
      heartRateEstimate: { type: Number },
      stressScore: { type: Number, required: true }, // 0-100
      fatigueScore: { type: Number, required: true }, // 0-100
      fallRiskScore: { type: Number },
      mood: { type: String, required: true },
      expressionSummary: { type: String },
      recommendation: { type: String },
      rawAnalysis: { type: Object },
      confidence: { type: Number, default: 0.85 },
    },
    mediaRef: {
      type: String,
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
    processedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for querying circle history ordered by latest first
monitoringRecordSchema.index({ careCircleId: 1, timestamp: -1 });

module.exports = mongoose.model('MonitoringRecord', monitoringRecordSchema);
