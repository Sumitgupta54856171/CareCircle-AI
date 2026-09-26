const mongoose = require('mongoose');

const taskItemSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      default: '',
    },
    category: {
      type: String,
      enum: ['rehab', 'medication', 'exercise', 'rest', 'checkin', 'support', 'monitoring', 'self_care', 'coordination', 'general'],
      default: 'general',
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'skipped'],
      default: 'pending',
    },
    completedAt: {
      type: Date,
    },
    estimatedMinutes: {
      type: Number,
      default: 15,
    },
  },
  { _id: false }
);

const planAndTaskSchema = new mongoose.Schema(
  {
    careCircleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CareCircle',
      required: true,
      index: true,
    },
    date: {
      type: Date,
      default: () => {
        const d = new Date();
        d.setHours(0, 0, 0, 0);
        return d;
      },
      index: true,
    },
    type: {
      type: String,
      enum: ['daily', 'weekly'],
      default: 'daily',
    },
    patientTasks: [taskItemSchema],
    caregiverTasks: [taskItemSchema],
    generatedBy: {
      type: String,
      enum: ['ai', 'manual'],
      default: 'ai',
    },
    aiReasoning: {
      type: String,
      default: 'Personalized routine based on care goals and condition management.',
    },
    patientEnergyLevel: {
      type: String,
      default: 'Moderate',
    },
    caregiverCapacity: {
      type: String,
      default: 'Medium',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('PlanAndTask', planAndTaskSchema);
