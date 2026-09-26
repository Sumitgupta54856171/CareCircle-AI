const mongoose = require('mongoose');

const careCircleSchema = new mongoose.Schema(
  {
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
    inviteCode: {
      type: String,
      unique: true,
      uppercase: true,
      trim: true,
    },
    members: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
          required: true,
        },
        roleInCircle: {
          type: String,
          enum: ['primary_caregiver', 'secondary', 'family', 'patient'],
          default: 'primary_caregiver',
        },
        permissions: {
          type: [String],
          default: ['view_monitoring', 'receive_alerts', 'edit_plans'],
        },
        joinedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    status: {
      type: String,
      enum: ['active', 'archived'],
      default: 'active',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('CareCircle', careCircleSchema);
