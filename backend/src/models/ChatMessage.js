const mongoose = require('mongoose');

const chatMessageSchema = new mongoose.Schema(
  {
    careCircleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CareCircle',
      required: true,
      index: true,
    },
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    senderName: {
      type: String,
      default: 'CareCircle AI',
    },
    senderType: {
      type: String,
      enum: ['user', 'ai', 'system'],
      required: true,
    },
    roleContext: {
      type: String,
      enum: ['patient', 'caregiver', 'system'],
      default: 'patient',
    },
    message: {
      type: String,
      required: true,
    },
    messageType: {
      type: String,
      enum: ['text', 'voice', 'system'],
      default: 'text',
    },
    voiceUrl: {
      type: String,
      default: '',
    },
    metadata: {
      relatedAlertId: { type: mongoose.Schema.Types.ObjectId },
      relatedPlanId: { type: mongoose.Schema.Types.ObjectId },
      toolsUsed: [String],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('ChatMessage', chatMessageSchema);
